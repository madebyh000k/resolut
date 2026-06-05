import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createSimplifiedInterviewBriefPrompt } from '@/lib/claude/prompts-simplified';
import { InterviewBrief, BriefSection } from '@/types/prepare';
import { makeOptimizedApiCall, getMaxTokens } from '@/lib/api-optimization/optimized-api-call';
import { parseClaudeJsonResponse } from '@/lib/api-optimization/json-parser';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Parse the numbered field structure into BriefSection array
 * Format: section1Title, section1Content, section1Tips, section2Title, ...
 */
function parseSectionsFromFields(response: Record<string, string>): BriefSection[] {
  const sections: BriefSection[] = [];

  // Determine how many sections we have by looking for sectionXTitle fields
  let sectionNum = 1;
  while (response[`section${sectionNum}Title`]) {
    const title = response[`section${sectionNum}Title`];
    const content = response[`section${sectionNum}Content`] || 'No content provided';
    const tipsStr = response[`section${sectionNum}Tips`];

    // Parse tips from newline-separated string
    const tips = tipsStr
      ? tipsStr.split('\n').map((t: string) => t.trim()).filter(Boolean)
      : undefined;

    sections.push({
      title,
      content,
      tips: tips && tips.length > 0 ? tips : undefined,
    });

    sectionNum++;
  }

  return sections;
}

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

    const prompt = createSimplifiedInterviewBriefPrompt(
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
          model: 'claude-sonnet-4-6',
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

    // Parse flat structure with robust parser
    const response = parseClaudeJsonResponse<Record<string, string>>(content.text);

    // Parse the numbered fields into BriefSection array
    const sections = parseSectionsFromFields(response);

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
