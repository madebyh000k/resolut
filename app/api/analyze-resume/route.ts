import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createSimplifiedResumeAnalysisPrompt } from '@/lib/claude/prompts-simplified';
import { ResumeAnalysis } from '@/types/resume-analysis';
import { makeOptimizedApiCall, getMaxTokens } from '@/lib/api-optimization/optimized-api-call';
import { parseClaudeJsonResponse, validateRequiredFields } from '@/lib/api-optimization/json-parser';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription, companyName } = await request.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: 'Resume text and job description are required' },
        { status: 400 }
      );
    }

    // Generate simplified analysis prompt (flat JSON structure for reliable parsing)
    const prompt = createSimplifiedResumeAnalysisPrompt(
      resumeText,
      jobDescription,
      companyName
    );

    // Make optimized API call with rate limiting, caching, and cost tracking
    const result = await makeOptimizedApiCall({
      feature: 'optimize',
      inputs: { resumeText, jobDescription, companyName },
      anthropicCall: () =>
        anthropic.messages.create({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: getMaxTokens('optimize'), // Beta limit: 2500
          temperature: 0.3,
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

    console.log('=== CLAUDE API RESPONSE (Optimize) ===');
    console.log('Message ID:', message.id);
    console.log('Model:', message.model);
    console.log('Stop reason:', message.stop_reason);
    console.log('Content blocks:', message.content.length);
    console.log('Usage:', message.usage);
    console.log('=== END RESPONSE METADATA ===');

    // Extract text content
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    console.log('=== CLAUDE RAW TEXT (First 1000 chars) ===');
    console.log(content.text.substring(0, 1000));
    console.log('=== END RAW TEXT ===');
    console.log('Full text length:', content.text.length, 'characters');

    // Parse JSON response with robust parser
    console.log('Attempting to parse JSON with parseClaudeJsonResponse...');
    const analysis = parseClaudeJsonResponse<ResumeAnalysis>(content.text);
    console.log('✅ Successfully parsed resume analysis');

    // Validate required fields (simplified flat structure)
    validateRequiredFields(
      analysis,
      [
        'overallScore',
        'customizedResume',
        'atsScore',
        'impactScore',
        'keywordScore',
        'narrativeScore',
        'levelScore',
      ],
      'resume analysis'
    );

    return NextResponse.json({
      success: true,
      analysis,
      usage: result.usage,
      cost: result.cost,
    });
  } catch (error) {
    console.error('Error analyzing resume:', error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Claude API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to analyze resume',
      },
      { status: 500 }
    );
  }
}
