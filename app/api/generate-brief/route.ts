import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createInterviewBriefPrompt } from '@/lib/claude/prompts';
import { InterviewBrief, BriefSection } from '@/types/prepare';
import { makeOptimizedApiCall, getMaxTokens } from '@/lib/api-optimization/optimized-api-call';
import { parseClaudeJsonResponse } from '@/lib/api-optimization/json-parser';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText, jobDescription, companyName, companyNews, format } = body;

    if (!resumeText || !jobDescription || !companyName) {
      return NextResponse.json(
        { error: 'Resume, job description, and company name are required' },
        { status: 400 }
      );
    }

    if (format !== '30min' && format !== '60min') {
      return NextResponse.json(
        { error: 'Format must be "30min" or "60min"' },
        { status: 400 }
      );
    }

    console.log(`Generating ${format} interview brief...`);

    const prompt = createInterviewBriefPrompt(
      resumeText,
      jobDescription,
      companyName,
      companyNews || [],
      format
    );

    // Make optimized API call with rate limiting, caching, and cost tracking
    const result = await makeOptimizedApiCall({
      feature: 'prepare',
      inputs: { resumeText, jobDescription, companyName, companyNews, format },
      anthropicCall: () =>
        anthropic.messages.create({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: getMaxTokens('prepare'), // Beta limit: 2000
          temperature: 0.7,
          messages: [{ role: 'user', content: prompt }],
        }),
      request,
    });

    // Check if rate limited or errored
    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          usage: result.usage,
        },
        { status: 429 }
      );
    }

    // Get message from result
    const message = result.data as Anthropic.Message;
    const content = message.content[0];

    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    // Parse sections with robust parser
    const sections = parseClaudeJsonResponse<BriefSection[]>(content.text);

    const interviewBrief: InterviewBrief = {
      id: crypto.randomUUID(),
      format,
      sections,
      generatedAt: new Date(),
    };

    return NextResponse.json(
      {
        success: true,
        interviewBrief,
        usage: result.usage,
        cost: result.cost,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Brief generation error:', error);
    return NextResponse.json(
      {
        error: `Failed to generate interview brief: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      },
      { status: 500 }
    );
  }
}
