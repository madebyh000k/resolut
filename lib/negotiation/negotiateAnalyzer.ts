import Anthropic from '@anthropic-ai/sdk';
import { OfferInput, NegotiationAdvice } from '@/types/offer-advice';
import { makeOptimizedApiCall, getMaxTokens } from '@/lib/api-optimization/optimized-api-call';
import { parseClaudeJsonResponse, validateRequiredFields } from '@/lib/api-optimization/json-parser';
import { calculatePercentile, getRecommendation } from './percentile';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface AnalyzeResult {
  advice: NegotiationAdvice;
  usage: {
    remaining: number;
    limit: number;
    resetsAt: Date;
    cacheHit: boolean;
  };
  cost?: {
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
  };
}

function createNegotiationPrompt(input: OfferInput, percentile?: number, recommendation?: any): string {
  const { baseSalary, equity, bonus, company, role, location, yearsOfExperience } = input;

  // Format bonus display
  let bonusDisplay = 'Not specified';
  if (bonus) {
    bonusDisplay = typeof bonus === 'string' ? bonus : `$${bonus.toLocaleString()}`;
  }

  let basePrompt = `You are an expert compensation negotiator. Analyze this job offer and provide ONE focused recommendation with specific numbers and actionable scripts.

OFFER DETAILS:
Company: ${company}
Role: ${role}
Location: ${location}
Base Salary: $${baseSalary.toLocaleString()}
Bonus: ${bonusDisplay}
Equity: ${equity || 'Not included'}
${yearsOfExperience ? `Years of Experience: ${yearsOfExperience}` : ''}

COMPANY-SPECIFIC CONTEXT:

**Amazon:** Known for back-loaded RSUs, lower base, higher equity. Loves data-driven candidates. Negotiation flexibility: medium. Push on sign-on bonus and year 1-2 comp.

**Google:** Strong base+equity balance, levels L3-L7+. Equity refreshers are standard. Negotiation flexibility: high. Push on level (affects long-term trajectory) and equity.

**Meta:** Generous packages, levels E3-E7+. Strong equity component, good refreshers. Negotiation flexibility: high. Push on both base and equity aggressively.

**Apple:** More conservative, strong benefits. Levels ICT2-ICT6. Negotiation flexibility: medium. Focus on base salary and signing bonus.

**Microsoft:** Balanced packages, levels 59-67+. Good benefits. Negotiation flexibility: medium-high. Push on level and equity.

**Startups (Series A-C):** High variance, equity-heavy. Negotiation flexibility: varies. Ask about: runway, valuation, liquidation preferences, early exercise.

**Unicorns (Stripe, Databricks, etc):** Competitive with big tech, equity less liquid. Negotiation flexibility: medium-high. Focus on cash compensation.

TASK:
Provide ONE opinionated recommendation. Be specific with exact numbers. Make this copy-paste ready.

Return JSON with this EXACT structure:

{
  "marketPosition": {
    "percentile": <number 0-100>,
    "totalComp4Year": "<formatted string like '$850k over 4 years'>",
    "gap": "<e.g., '15% below market' or 'at market' or '10% above market'>"
  },
  "recommendedAsk": {
    "base": "<formatted like '$215,000'>",
    "equity": "<formatted like '$450,000 over 4 years' or omit if not applicable>",
    "rationale": "<2-3 sentences with data justification>"
  },
  "emailTemplate": "<Complete natural email, 3-4 paragraphs, professional but warm, specific numbers, express enthusiasm, end with gracious closing>",
  "pushbackResponses": [
    {
      "theySay": "That's above our budget for this level",
      "youSay": "<exact response script>"
    },
    {
      "theySay": "This is our final offer",
      "youSay": "<exact response script>"
    },
    {
      "theySay": "We need an answer by [date]",
      "youSay": "<exact response script>"
    }
  ],
  "redFlags": ["<flag 1 if any>", "<flag 2 if any>"]
}

GUIDELINES:

1. **Market Position**: Use your knowledge of typical comp for this role/company/location
2. **Percentile**: Estimate where this offer falls (p50 = median, p75 = strong, p90 = excellent)
3. **Recommended Ask**: Target ~p70-75 (balanced approach). Be specific with dollar amounts.
4. **Rationale**: Reference market data, peer companies, or role level
5. **Email Template**:
   - Natural, conversational tone adapted to company culture
   - Include specific company name and role
   - Use exact numbers from recommendedAsk
   - 3-4 paragraphs max
   - Show enthusiasm while negotiating
6. **Pushback Responses**:
   - Professional, not adversarial
   - Show flexibility while holding ground
   - Offer alternatives
   - Copy-paste ready
7. **Red Flags**: Only include if you detect pressure tactics, unclear equity terms, or significantly below-market offers

TONE ADAPTATION:
- FAANG: Data-driven, formal, reference levels and peer companies
- Startups: Casual, mission-focused, partnership language
- Mid-stage: Professional but warm, balance growth story with market data

Keep your email under 250 words. Be direct, specific, and actionable.

Return ONLY the JSON object, no markdown or additional text.`;

  if (percentile !== undefined && recommendation) {
    basePrompt += `

PERCENTILE CONTEXT:
This offer is at the ${percentile}th percentile for ${role}.
Recommendation: ${recommendation.bottomLine.tldr}
Reasoning: ${recommendation.bottomLine.reasoning}

Your job is to provide specific, actionable negotiation tactics within this framework. ${recommendation.type === 'FAIR' ? 'Suggest a modest 8-12% increase.' : 'Suggest a significant 20-30% increase with strong data justification.'}`;
  }

  return basePrompt;
}

export async function analyzeAndAdvise(input: OfferInput): Promise<NegotiationAdvice> {
  try {
    // Calculate total compensation
    const baseSalary = input.baseSalary;
    const equity = input.equity ? parseFloat(input.equity.replace(/[^0-9.]/g, '')) || 0 : 0;
    const bonus = input.bonus ? parseFloat(input.bonus.replace(/[^0-9.]/g, '')) || 0 : 0;
    const totalComp = baseSalary + equity + bonus;

    // Calculate percentile and get recommendation
    const percentile = calculatePercentile(totalComp, input.role);
    const recommendation = getRecommendation(percentile, totalComp, input.role);

    console.log(`Offer analysis: $${totalComp.toLocaleString()} total comp at ${percentile}th percentile for ${input.role}`);
    console.log(`Recommendation type: ${recommendation.type}, shouldNegotiate: ${recommendation.shouldNegotiate}`);

    // For exceptional offers (95th+ percentile), return hardcoded response
    // DO NOT call Claude - we control the message
    if (!recommendation.shouldNegotiate) {
      console.log('Exceptional offer detected - using hardcoded response (bypassing Claude)');

      // Return hardcoded exceptional offer advice
      return {
        marketPosition: {
          percentile,
          totalComp4Year: `$${(totalComp * 4).toLocaleString()} over 4 years`,
          gap: percentile >= 99 ? 'WAY ABOVE market (99th+ percentile)' : `${percentile - 50}% above market`
        },
        recommendedAsk: {
          base: recommendation.bottomLine.tldr,
          rationale: recommendation.bottomLine.reasoning
        },
        emailTemplate: generateExceptionalEmailTemplate(input, recommendation),
        pushbackResponses: [
          {
            theySay: "We need an answer soon",
            youSay: "I'm excited about this opportunity and ready to move forward. I just need a few days to review the details with my family. Can we connect on [specific date]?"
          },
          {
            theySay: "Can you give us a verbal yes now?",
            youSay: "I'm very enthusiastic about joining the team. I'd like to review the written offer carefully to ensure I understand all the details, but I'm planning to accept."
          }
        ],
        redFlags: recommendation.bottomLine.humor
          ? ["Seriously - if these numbers are wrong, go back and fix them. If they're right, stop reading this and accept the offer."]
          : []
      };
    }

    // For offers that need negotiation (<95th percentile), call Claude for nuanced advice
    console.log('Standard offer - calling Claude for nuanced analysis');

    const prompt = createNegotiationPrompt(input, percentile, recommendation);

    // Use Sonnet 4.5 for sophisticated analysis
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 3000,
      temperature: 0.4, // Balanced between consistency and natural language
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text content
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    // Parse JSON response with robust parser
    const advice = parseClaudeJsonResponse<NegotiationAdvice>(content.text);

    // Validate required fields
    validateRequiredFields(
      advice,
      ['marketPosition', 'recommendedAsk', 'emailTemplate', 'pushbackResponses'],
      'negotiation advice'
    );

    // Override percentile with our calculated value
    advice.marketPosition.percentile = percentile;

    return advice;
  } catch (error) {
    console.error('Error analyzing offer:', error);

    if (error instanceof Anthropic.APIError) {
      throw new Error(`Claude API error: ${error.message}`);
    }

    throw error;
  }
}

/**
 * Generate email template for exceptional offers (no negotiation)
 */
function generateExceptionalEmailTemplate(input: OfferInput, recommendation: any): string {
  const { company, role } = input;

  if (recommendation.bottomLine.humor) {
    return `Hi [Hiring Manager],

Thank you so much for the incredible offer to join ${company} as a ${role}. I'm genuinely excited about this opportunity and the compensation package you've offered.

I've reviewed the details carefully and I'm ready to accept. When can we move forward with next steps?

Looking forward to joining the team!

Best,
[Your Name]`;
  }

  return `Hi [Hiring Manager],

Thank you for the generous offer to join ${company} as a ${role}. I'm very excited about the opportunity and impressed by the compensation package.

I've reviewed the offer and am ready to move forward. Before I formally accept, I'd love to discuss:
- Team composition and who I'll be working with closely
- Key priorities for the first 90 days
- Growth opportunities and path to the next level

The compensation is excellent and I'm not looking to negotiate on that front. I'm focused on ensuring this is the right fit for both of us.

Could we schedule a brief call this week?

Best,
[Your Name]`;
}

