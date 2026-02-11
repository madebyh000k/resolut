// Simple test for percentile logic
// Market data copied from percentile.ts
const MARKET_DATA = {
  'Senior PM': { p50: 180000, p75: 220000, p90: 265000, p95: 300000, p99: 400000 },
  'Staff PM': { p50: 250000, p75: 300000, p90: 350000, p95: 400000, p99: 550000 },
  'Principal PM': { p50: 350000, p75: 400000, p90: 475000, p95: 550000, p99: 750000 },
  'default': { p50: 150000, p75: 190000, p90: 240000, p95: 290000, p99: 400000 }
};

function calculatePercentile(totalComp, role) {
  const range = MARKET_DATA[role] || MARKET_DATA['default'];

  if (totalComp >= range.p99) return 99;
  if (totalComp >= range.p95) return 95;
  if (totalComp >= range.p90) return 90;
  if (totalComp >= range.p75) return 75;
  if (totalComp >= range.p50) return 50;
  return 25;
}

function getRecommendation(percentile, totalComp, role) {
  if (totalComp > 500000 || percentile >= 99) {
    return {
      type: 'EXCEPTIONAL_ABSURD',
      recommendation: 'ACCEPT',
      shouldNegotiate: false,
      bottomLine: {
        tldr: 'ACCEPT IMMEDIATELY',
        reasoning: `Wait, is this real?? $${totalComp.toLocaleString()} for a ${role}?`,
        action: 'Say "yes", ask "when do I start?", sign the paperwork.',
        humor: true
      }
    };
  }

  if (percentile >= 95) {
    return {
      type: 'EXCEPTIONAL',
      recommendation: 'ACCEPT',
      shouldNegotiate: false,
      bottomLine: {
        tldr: 'ACCEPT',
        reasoning: `This is ${percentile}th percentile - exceptional compensation.`,
        action: 'Focus on team composition, role scope, and growth opportunities.',
        humor: false
      }
    };
  }

  if (percentile >= 85) {
    return {
      type: 'STRONG',
      recommendation: 'ACCEPT with possible minor additions',
      shouldNegotiate: false,
      bottomLine: {
        tldr: 'ACCEPT (maybe ask for signing bonus)',
        reasoning: `Strong offer at ${percentile}th percentile.`,
        action: 'Consider one-time additions, not ongoing comp increases.',
        humor: false
      }
    };
  }

  if (percentile >= 70) {
    return {
      type: 'FAIR',
      recommendation: 'NEGOTIATE modestly',
      shouldNegotiate: true,
      bottomLine: {
        tldr: 'NEGOTIATE modestly (8-12% increase)',
        reasoning: `Fair market offer at ${percentile}th percentile.`,
        action: 'Prepare to accept if they meet you halfway.',
        humor: false
      }
    };
  }

  return {
    type: 'LOW',
    recommendation: 'NEGOTIATE significantly OR decline',
    shouldNegotiate: true,
    bottomLine: {
      tldr: 'NEGOTIATE significantly (20-30% increase)',
      reasoning: `This is ${percentile}th percentile - below market for ${role}.`,
      action: 'Be prepared to walk away.',
      humor: false
    }
  };
}

// Test scenarios
const scenarios = [
  {
    name: 'TEST 1: Low offer',
    role: 'Senior PM',
    base: 120000,
    equity: 20000,
    expected: { percentile: 25, type: 'LOW' }
  },
  {
    name: 'TEST 2: Fair offer',
    role: 'Senior PM',
    base: 170000,
    equity: 50000,
    expected: { percentile: 75, type: 'FAIR' }
  },
  {
    name: 'TEST 3: Strong offer',
    role: 'Senior PM',
    base: 200000,
    equity: 100000,
    expected: { percentile: 90, type: 'STRONG' }
  },
  {
    name: 'TEST 4: Exceptional offer',
    role: 'Senior PM',
    base: 220000,
    equity: 100000,
    expected: { percentile: 95, type: 'EXCEPTIONAL' }
  },
  {
    name: 'TEST 5: Absurd offer',
    role: 'Senior PM',
    base: 400000,
    equity: 600000,
    expected: { percentile: 99, type: 'EXCEPTIONAL_ABSURD' }
  }
];

console.log('🧪 TESTING PERCENTILE LOGIC\n');
console.log('='.repeat(80));

let allPassed = true;

scenarios.forEach(scenario => {
  const totalComp = scenario.base + scenario.equity;
  const percentile = calculatePercentile(totalComp, scenario.role);
  const recommendation = getRecommendation(percentile, totalComp, scenario.role);

  console.log(`\n${scenario.name}`);
  console.log('-'.repeat(80));
  console.log(`Role: ${scenario.role}`);
  console.log(`Base: $${scenario.base.toLocaleString()}, Equity: $${scenario.equity.toLocaleString()}`);
  console.log(`Total Comp: $${totalComp.toLocaleString()}`);
  console.log(`\nRESULTS:`);
  console.log(`  Percentile: ${percentile}th (expected: ${scenario.expected.percentile}th)`);
  console.log(`  Type: ${recommendation.type} (expected: ${scenario.expected.type})`);
  console.log(`  Recommendation: ${recommendation.recommendation}`);
  console.log(`  Should Negotiate: ${recommendation.shouldNegotiate ? 'YES' : 'NO'}`);
  console.log(`\nBOTTOM LINE:`);
  console.log(`  TLDR: ${recommendation.bottomLine.tldr}`);
  console.log(`  Reasoning: ${recommendation.bottomLine.reasoning}`);
  console.log(`  Action: ${recommendation.bottomLine.action}`);

  // Verify expectations
  const percentileMatch = percentile === scenario.expected.percentile;
  const typeMatch = recommendation.type === scenario.expected.type;
  const negotiationLogic = percentile >= 95 ? !recommendation.shouldNegotiate : true;
  const humorLogic = percentile >= 99 ? recommendation.bottomLine.humor : true;

  console.log(`\n✅ VALIDATION:`);
  console.log(`  Percentile: ${percentileMatch ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`  Type: ${typeMatch ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`  No negotiation for 95%+: ${percentile >= 95 ? (negotiationLogic ? '✓ PASS' : '✗ FAIL') : 'N/A'}`);
  console.log(`  Humor for absurd: ${percentile >= 99 ? (humorLogic ? '✓ PASS' : '✗ FAIL') : 'N/A'}`);

  if (!percentileMatch || !typeMatch || !negotiationLogic || !humorLogic) {
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(80));
if (allPassed) {
  console.log('✅ ALL TESTS PASSED!\n');
} else {
  console.log('❌ SOME TESTS FAILED\n');
}
