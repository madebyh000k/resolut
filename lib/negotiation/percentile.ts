// Market compensation data by role (add more as needed)
const MARKET_DATA: Record<string, { p50: number; p75: number; p90: number; p95: number; p99: number }> = {
  // Product Management
  'Senior PM': { p50: 180000, p75: 220000, p90: 265000, p95: 300000, p99: 400000 },
  'Staff PM': { p50: 250000, p75: 300000, p90: 350000, p95: 400000, p99: 550000 },
  'Principal PM': { p50: 350000, p75: 400000, p90: 475000, p95: 550000, p99: 750000 },

  // Design
  'Senior Designer': { p50: 150000, p75: 185000, p90: 230000, p95: 280000, p99: 380000 },
  'Staff Designer': { p50: 200000, p75: 250000, p90: 300000, p95: 350000, p99: 480000 },
  'Principal Designer': { p50: 280000, p75: 330000, p90: 400000, p95: 470000, p99: 650000 },

  // Creative/Brand
  'Creative Director': { p50: 180000, p75: 220000, p90: 270000, p95: 320000, p99: 440000 },
  'Senior Creative': { p50: 140000, p75: 170000, p90: 210000, p95: 250000, p99: 340000 },

  // Marketing
  'Senior Marketing Manager': { p50: 150000, p75: 185000, p90: 230000, p95: 280000, p99: 380000 },
  'Director of Marketing': { p50: 200000, p75: 250000, p90: 310000, p95: 370000, p99: 510000 },

  // Engineering (for reference)
  'Senior Engineer': { p50: 200000, p75: 250000, p90: 320000, p95: 400000, p99: 550000 },
  'Staff Engineer': { p50: 280000, p75: 350000, p90: 450000, p95: 550000, p99: 750000 },

  // Generic levels (fallback)
  'entry': { p50: 80000, p75: 95000, p90: 115000, p95: 135000, p99: 160000 },
  'mid': { p50: 110000, p75: 135000, p90: 165000, p95: 195000, p99: 240000 },
  'senior': { p50: 150000, p75: 185000, p90: 230000, p95: 280000, p99: 380000 },
  'staff': { p50: 200000, p75: 250000, p90: 300000, p95: 350000, p99: 480000 },
  'principal': { p50: 280000, p75: 330000, p90: 400000, p95: 470000, p99: 650000 },

  // Default fallback
  'default': { p50: 150000, p75: 190000, p90: 240000, p95: 290000, p99: 400000 }
};

/**
 * Calculate percentile for a given total compensation and role
 */
export function calculatePercentile(totalComp: number, role: string): number {
  // Try to find exact role match first
  let range = MARKET_DATA[role];

  // If no match, try to extract level from role string
  if (!range) {
    const lowerRole = role.toLowerCase();
    if (lowerRole.includes('principal')) {
      range = MARKET_DATA['principal'];
    } else if (lowerRole.includes('staff')) {
      range = MARKET_DATA['staff'];
    } else if (lowerRole.includes('senior')) {
      range = MARKET_DATA['senior'];
    } else if (lowerRole.includes('mid') || lowerRole.includes('ii')) {
      range = MARKET_DATA['mid'];
    } else if (lowerRole.includes('junior') || lowerRole.includes('entry') || lowerRole.includes('i')) {
      range = MARKET_DATA['entry'];
    } else {
      range = MARKET_DATA['default'];
    }
  }

  if (totalComp >= range.p99) return 99;
  if (totalComp >= range.p95) return 95;
  if (totalComp >= range.p90) return 90;
  if (totalComp >= range.p75) return 75;
  if (totalComp >= range.p50) return 50;
  return 25;
}

export interface Recommendation {
  type: 'EXCEPTIONAL_ABSURD' | 'EXCEPTIONAL' | 'STRONG' | 'FAIR' | 'LOW';
  recommendation: string;
  shouldNegotiate: boolean;
  bottomLine: {
    tldr: string;
    reasoning: string;
    action: string;
    humor: boolean;
  };
}

/**
 * Get recommendation based on percentile and total comp
 * This is HARDCODED logic that Claude cannot override
 */
export function getRecommendation(percentile: number, totalComp: number, role: string): Recommendation {
  // ABSURDLY HIGH (99th+ or >$500k) - Add humor
  if (totalComp > 500000 || percentile >= 99) {
    return {
      type: 'EXCEPTIONAL_ABSURD',
      recommendation: 'ACCEPT',
      shouldNegotiate: false,
      bottomLine: {
        tldr: 'ACCEPT IMMEDIATELY',
        reasoning: `Wait, is this real?? $${totalComp.toLocaleString()} for a ${role}? If these numbers are correct, this is once-in-a-career compensation. DO NOT negotiate. DO NOT overthink. Sign the offer today.`,
        action: "Your only job: Say \"yes\", ask \"when do I start?\", sign the paperwork.",
        humor: true
      }
    };
  }

  // EXCEPTIONAL (95-98th percentile)
  if (percentile >= 95) {
    return {
      type: 'EXCEPTIONAL',
      recommendation: 'ACCEPT',
      shouldNegotiate: false,
      bottomLine: {
        tldr: 'ACCEPT',
        reasoning: `This is ${percentile}th percentile - exceptional compensation. Negotiating for more money risks the offer for minimal upside.`,
        action: 'Focus on team composition, role scope, and growth opportunities - not compensation.',
        humor: false
      }
    };
  }

  // STRONG (85-94th percentile)
  if (percentile >= 85) {
    return {
      type: 'STRONG',
      recommendation: 'ACCEPT with possible minor additions',
      shouldNegotiate: false,
      bottomLine: {
        tldr: 'ACCEPT (maybe ask for signing bonus)',
        reasoning: `Strong offer at ${percentile}th percentile. You could try for a signing bonus or earlier equity review, but don't push on base/equity amounts.`,
        action: 'Consider asking for one-time additions (signing bonus, relocation), not ongoing comp increases.',
        humor: false
      }
    };
  }

  // FAIR (70-84th percentile)
  if (percentile >= 70) {
    return {
      type: 'FAIR',
      recommendation: 'NEGOTIATE modestly',
      shouldNegotiate: true,
      bottomLine: {
        tldr: 'NEGOTIATE modestly (8-12% increase)',
        reasoning: `Fair market offer at ${percentile}th percentile. You have room to ask for 8-12% more based on experience, but this is reasonable if they hold firm.`,
        action: 'Prepare to accept if they meet you halfway or hold firm.',
        humor: false
      }
    };
  }

  // BELOW MARKET (<70th percentile)
  return {
    type: 'LOW',
    recommendation: 'NEGOTIATE significantly OR decline',
    shouldNegotiate: true,
    bottomLine: {
      tldr: 'NEGOTIATE significantly (20-30% increase)',
      reasoning: `This is ${percentile}th percentile - below market for ${role}. Push for 20-30% increase with data, or consider declining.`,
      action: "Be prepared to walk away if they won't move substantially.",
      humor: false
    }
  };
}
