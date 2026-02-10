import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createNegotiationStrategyPrompt } from '@/lib/claude/prompts';
import { NegotiationStrategy } from '@/types/negotiate';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { jobOffer, resumeText, jobDescription } = await request.json();

    if (!jobOffer) {
      return NextResponse.json(
        { error: 'Job offer details are required' },
        { status: 400 }
      );
    }

    // Validate required offer fields
    const requiredFields = ['company', 'jobTitle', 'baseSalary', 'location', 'yearsOfExperience', 'roleLevel'];
    for (const field of requiredFields) {
      if (!jobOffer[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Generate the negotiation strategy prompt
    const prompt = createNegotiationStrategyPrompt(
      jobOffer,
      resumeText,
      jobDescription
    );

    // Call Claude API with Sonnet 4.5 for high-quality strategic advice
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract the text content
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content.text);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content.text);
      throw new Error('Failed to parse negotiation strategy from Claude');
    }

    // Validate the response structure
    if (!parsedResponse.sections || !Array.isArray(parsedResponse.sections)) {
      throw new Error('Invalid strategy structure: missing sections array');
    }

    if (!parsedResponse.marketInsights || !Array.isArray(parsedResponse.marketInsights)) {
      throw new Error('Invalid strategy structure: missing marketInsights array');
    }

    if (!parsedResponse.bottomLine || typeof parsedResponse.bottomLine !== 'object') {
      throw new Error('Invalid strategy structure: missing bottomLine object');
    }

    if (!parsedResponse.bottomLine.recommendation || !parsedResponse.bottomLine.reasoning || !parsedResponse.bottomLine.oneLineAdvice) {
      throw new Error('Invalid strategy structure: bottomLine missing required fields');
    }

    if (typeof parsedResponse.offerPercentile !== 'number') {
      throw new Error('Invalid strategy structure: offerPercentile must be a number');
    }

    if (!parsedResponse.response_mode) {
      throw new Error('Invalid strategy structure: missing response_mode');
    }

    // Create the negotiation strategy object
    const negotiationStrategy: NegotiationStrategy = {
      id: `strategy-${Date.now()}`,
      offerId: jobOffer.id,
      offerPercentile: parsedResponse.offerPercentile,
      responseMode: parsedResponse.response_mode,
      sections: parsedResponse.sections,
      marketInsights: parsedResponse.marketInsights,
      bottomLine: parsedResponse.bottomLine,
      generatedAt: new Date(),
    };

    return NextResponse.json({ negotiationStrategy });
  } catch (error) {
    console.error('Error generating negotiation strategy:', error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Claude API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate negotiation strategy',
      },
      { status: 500 }
    );
  }
}
