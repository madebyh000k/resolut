import Anthropic from '@anthropic-ai/sdk';
import { OfferInput, NegotiationAdvice } from '@/types/offer-advice';
import { makeOptimizedApiCall, getMaxTokens } from '@/lib/api-optimization/optimized-api-call';
import { parseClaudeJsonResponse, validateRequiredFields } from '@/lib/api-optimization/json-parser';

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

function createNegotiationPrompt(input: OfferInput): string {
  const { baseSalary, equity, bonus, company, role, location, yearsOfExperience } = input;

  // Format bonus display
  let bonusDisplay = 'Not specified';
  if (bonus) {
    bonusDisplay = typeof bonus === 'string' ? bonus : `$${bonus.toLocaleString()}`;
  }

  return `You are an expert compensation negotiator. Analyze this job offer and provide ONE focused recommendation with specific numbers and actionable scripts.

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
}

export async function analyzeAndAdvise(input: OfferInput): Promise<NegotiationAdvice> {
  try {
    const prompt = createNegotiationPrompt(input);

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

    return advice;
  } catch (error) {
    console.error('Error analyzing offer:', error);

    if (error instanceof Anthropic.APIError) {
      throw new Error(`Claude API error: ${error.message}`);
    }

    throw error;
  }
}
