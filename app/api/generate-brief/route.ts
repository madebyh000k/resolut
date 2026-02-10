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
 * Parse the flat string structure into BriefSection array
 * Format: ## Section Title\nContent...\n\nTIPS:\n- Tip 1\n- Tip 2\n\n##
 */
function parseSectionsFromString(sectionsText: string): BriefSection[] {
  if (!sectionsText) return [];

  // Split by ## markers
  const sectionBlocks = sectionsText.split('##').filter(block => block.trim());

  return sectionBlocks.map(block => {
    const lines = block.split('\n').map(line => line.trim()).filter(Boolean);

    // First line is the title
    const title = lines[0] || 'Section';

    // Find where TIPS: starts
    const tipsIndex = lines.findIndex(line => line.toUpperCase() === 'TIPS:');

    let content = '';
    let tips: string[] = [];

    if (tipsIndex === -1) {
      // No tips section, all content
      content = lines.slice(1).join('\n');
    } else {
      // Content before TIPS:
      content = lines.slice(1, tipsIndex).join('\n');
      // Tips after TIPS:
      tips = lines.slice(tipsIndex + 1)
        .filter(line => line.startsWith('-'))
        .map(line => line.replace(/^-\s*/, '').trim());
    }

    return {
      title,
      content: content || 'No content provided',
      tips: tips.length > 0 ? tips : undefined,
    };
  });
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

    // Parse flat structure with robust parser
    const response = parseClaudeJsonResponse<{ sections: string }>(content.text);

    // Parse the newline-separated sections string into BriefSection array
    const sections = parseSectionsFromString(response.sections);

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
