import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createNegotiationStrategyPrompt } from '@/lib/claude/prompts';
import { NegotiationStrategy } from '@/types/negotiate';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Market data for percentile calculation
// These are approximate ranges - expand with real data
const MARKET_RANGES: Record<string, { p25: number; p50: number; p75: number; p90: number; p95: number; p99: number }> = {
  'entry': { p25: 80000, p50: 95000, p75: 115000, p90: 135000, p95: 155000, p99: 180000 },
  'mid': { p25: 110000, p50: 135000, p75: 165000, p90: 195000, p95: 225000, p99: 265000 },
  'senior': { p25: 150000, p50: 180000, p75: 220000, p90: 265000, p95: 300000, p99: 380000 },
  'staff': { p25: 200000, p50: 250000, p75: 300000, p90: 350000, p95: 400000, p99: 500000 },
  'principal': { p25: 250000, p50: 325000, p75: 400000, p90: 475000, p95: 550000, p99: 700000 },
  'executive': { p25: 350000, p50: 475000, p75: 625000, p90: 800000, p95: 1000000, p99: 1500000 },
};

/**
 * Calculate offer percentile based on market data
 */
function calculatePercentile(totalComp: number, level: string): number {
  const range = MARKET_RANGES[level.toLowerCase()] || MARKET_RANGES['senior'];

  if (totalComp >= range.p99) return 99;
  if (totalComp >= range.p95) return 95;
  if (totalComp >= range.p90) return 90;
  if (totalComp >= range.p75) return 75;
  if (totalComp >= range.p50) return 50;
  if (totalComp >= range.p25) return 25;
  return 10;
}

/**
 * Generate hardcoded response for exceptional offers (95th+ percentile)
 * This bypasses Claude entirely for top-tier offers
 */
function generateExceptionalResponse(
  percentile: number,
  totalComp: number,
  jobOffer: any
): NegotiationStrategy {
  const baseSalary = jobOffer.baseSalary;
  const equity = jobOffer.equity?.amount || 0;
  const level = jobOffer.jobTitle;
  const isAbsurd = totalComp >= 500000 || percentile >= 99;

  // Determine response template based on percentile
  let bottomLineReasoning: string;
  let oneLineAdvice: string;
  let sections: any[];

  if (isAbsurd) {
    // 99th+ percentile or $500k+ offers
    bottomLineReasoning = `Wait, is this real?? $${totalComp.toLocaleString()} total compensation for a ${level} role?? Quick reality check: Did you enter these numbers correctly? Because this is ${percentile}th+ percentile - that's "I need to call my accountant" territory. If these numbers are RIGHT, this is once-in-a-career compensation. DO NOT negotiate. DO NOT overthink. Sign the offer today.`;

    oneLineAdvice = "Say 'yes', ask 'when do I start?', and sign before they realize the mistake.";

    sections = [
      {
        title: "🏆 EXCEPTIONAL OFFER - Wait, is this real??",
        content: `Let me get this straight:\n- $${baseSalary.toLocaleString()} base salary\n- $${equity.toLocaleString()} in equity\n- = $${totalComp.toLocaleString()} total compensation\n\nFor a ${level} role??\n\nThis is ${percentile}th+ percentile. If these numbers are correct, you just won the compensation lottery.`,
        tips: [
          "Triple-check the numbers are correct",
          "If correct: Sign immediately",
          "If wrong: Go back and fix them"
        ],
        priority: 'high' as const
      },
      {
        title: "Your Entire Negotiation Playbook",
        content: "Here's your strategy:\n\n1. Say 'yes'\n2. Say 'thank you'\n3. Ask 'when do I start?'\n4. Sign the paperwork\n\nThat's it. DO NOT negotiate for more. DO NOT overthink this. DO NOT risk it.\n\nIf you try to squeeze another $20k out of this offer, I cannot help you.",
        tips: [],
        priority: 'high' as const
      },
      {
        title: "The ONLY Questions to Ask",
        content: "These are the only acceptable questions:\n\n- 'Who's my manager?'\n- 'What's the team structure?'\n- 'Where's parking?'\n- 'When do I start?'\n\nAny other question is you overthinking a perfect situation.\n\nThis is a once-in-a-career offer. Take it. 🚀",
        tips: [
          "Focus on team fit and role scope",
          "Ask about first 90 days priorities",
          "Understand growth opportunities"
        ],
        priority: 'high' as const
      }
    ];
  } else {
    // 95-98th percentile (strong but not absurd)
    bottomLineReasoning = `This is a really strong offer at ${percentile}th percentile for your level. This is top-tier compensation. Don't negotiate for more money - you risk the offer for minimal upside. Focus on what matters: team fit, role scope, and growth path.`;

    oneLineAdvice = "Accept this offer and get to work.";

    sections = [
      {
        title: "🏆 EXCEPTIONAL OFFER",
        content: `This is a really strong offer at ${percentile}th percentile for ${level}.\n\nBOTTOM LINE: ACCEPT\n\nDon't negotiate for more money. You already won.\n\nTotal compensation: $${totalComp.toLocaleString()}\n- Base: $${baseSalary.toLocaleString()}\n- Equity: $${equity.toLocaleString()}`,
        tips: [
          "This is top-tier compensation",
          "Negotiating higher risks the offer",
          "Focus on non-compensation factors"
        ],
        priority: 'high' as const
      },
      {
        title: "What to Focus On Instead",
        content: "Since compensation is already exceptional, focus your energy on:\n\n1. Team composition and manager fit - who will you be working with?\n2. Role scope and responsibilities - what exactly will you be doing?\n3. Growth opportunities - what's the path to the next level?\n4. First 90 days priorities - how is success measured?\n\nThese factors will determine your happiness and long-term success far more than trying to squeeze out another 3% in compensation.",
        tips: [
          "Ask to meet your potential team",
          "Understand the role's key challenges",
          "Clarify promotion criteria and timeline"
        ],
        priority: 'high' as const
      },
      {
        title: "Why You Shouldn't Negotiate Higher",
        content: `At ${percentile}th percentile, you're already in the top ${100 - percentile}% of compensation for this level. Trying to negotiate higher:\n\n- Risks the offer (companies can and do rescind)\n- Signals you don't understand market rates\n- Wastes political capital you'll need later\n- Gains you maybe 2-3% more at best\n\nThe math doesn't work. Take the win.`,
        tips: [],
        priority: 'medium' as const
      }
    ];
  }

  return {
    id: `strategy-${Date.now()}`,
    offerId: jobOffer.id || `offer-${Date.now()}`,
    offerPercentile: percentile,
    responseMode: 'EXCEPTIONAL_DO_NOT_ESCALATE',
    sections,
    marketInsights: [
      {
        category: 'total-comp',
        insight: `Your total compensation of $${totalComp.toLocaleString()} is at the ${percentile}th percentile for ${level} roles. This is exceptional - most people never see offers this strong.`,
        recommendation: 'Accept this offer. Do not negotiate for higher compensation.',
        confidence: 'high'
      }
    ],
    bottomLine: {
      recommendation: 'ACCEPT',
      reasoning: bottomLineReasoning,
      oneLineAdvice
    },
    generatedAt: new Date()
  };
}

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

    // Calculate total compensation and percentile
    const totalComp = jobOffer.baseSalary + (jobOffer.bonus || 0) + (jobOffer.equity?.amount || 0);
    const percentile = calculatePercentile(totalComp, jobOffer.roleLevel);

    console.log(`Offer analysis: $${totalComp.toLocaleString()} total comp at ${percentile}th percentile for ${jobOffer.roleLevel}`);

    // For exceptional offers (95th+ percentile), return hardcoded response
    // DO NOT call Claude - we control the message
    if (percentile >= 95) {
      console.log('Exceptional offer detected - using hardcoded response (bypassing Claude)');
      const strategy = generateExceptionalResponse(percentile, totalComp, jobOffer);
      return NextResponse.json({ negotiationStrategy: strategy });
    }

    // For offers below 95th percentile, call Claude with constrained prompt
    console.log('Standard offer - calling Claude for nuanced analysis');

    const prompt = createNegotiationStrategyPrompt(
      jobOffer,
      resumeText,
      jobDescription
    );

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

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

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

    // Create the negotiation strategy object
    const negotiationStrategy: NegotiationStrategy = {
      id: `strategy-${Date.now()}`,
      offerId: jobOffer.id,
      offerPercentile: parsedResponse.offerPercentile || percentile,
      responseMode: parsedResponse.response_mode || 'FAIR_MODEST_NEGOTIATION',
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
