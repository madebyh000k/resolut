import { calculatePercentile, getRecommendation } from './lib/negotiation/percentile';

// Test scenarios
const scenarios = [
  {
    name: 'TEST 1: Low offer',
    role: 'Senior PM',
    base: 120000,
    equity: 20000,
    expected: { percentile: '~25th', type: 'LOW', recommendation: 'NEGOTIATE significantly' }
  },
  {
    name: 'TEST 2: Fair offer',
    role: 'Senior PM',
    base: 170000,
    equity: 50000,
    expected: { percentile: '~75th', type: 'FAIR', recommendation: 'NEGOTIATE modestly' }
  },
  {
    name: 'TEST 3: Strong offer',
    role: 'Senior PM',
    base: 200000,
    equity: 100000,
    expected: { percentile: '~90th', type: 'STRONG', recommendation: 'ACCEPT with possible additions' }
  },
  {
    name: 'TEST 4: Exceptional offer',
    role: 'Senior PM',
    base: 220000,
    equity: 100000,
    expected: { percentile: '~95th', type: 'EXCEPTIONAL', recommendation: 'ACCEPT' }
  },
  {
    name: 'TEST 5: Absurd offer',
    role: 'Senior PM',
    base: 400000,
    equity: 600000,
    expected: { percentile: '99th+', type: 'EXCEPTIONAL_ABSURD', recommendation: 'ACCEPT IMMEDIATELY' }
  }
];

console.log('🧪 TESTING PERCENTILE LOGIC\n');
console.log('='.repeat(80));

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
  console.log(`  Percentile: ${percentile}th (expected: ${scenario.expected.percentile})`);
  console.log(`  Type: ${recommendation.type} (expected: ${scenario.expected.type})`);
  console.log(`  Recommendation: ${recommendation.recommendation}`);
  console.log(`  Should Negotiate: ${recommendation.shouldNegotiate ? 'YES' : 'NO'}`);
  console.log(`\nBOTTOM LINE:`);
  console.log(`  TLDR: ${recommendation.bottomLine.tldr}`);
  console.log(`  Reasoning: ${recommendation.bottomLine.reasoning}`);
  console.log(`  Action: ${recommendation.bottomLine.action}`);

  // Verify expectations
  const percentileMatch = percentile.toString() === scenario.expected.percentile.replace(/[~th+]/g, '') ||
                          (scenario.expected.percentile.includes('+') && percentile >= 99) ||
                          (scenario.expected.percentile.includes('~') && Math.abs(percentile - parseInt(scenario.expected.percentile)) <= 10);
  const typeMatch = recommendation.type === scenario.expected.type;

  console.log(`\n✅ VALIDATION:`);
  console.log(`  Percentile: ${percentileMatch ? '✓' : '✗'}`);
  console.log(`  Type: ${typeMatch ? '✓' : '✗'}`);
  console.log(`  No negotiation for 95%+: ${percentile >= 95 ? (!recommendation.shouldNegotiate ? '✓' : '✗') : 'N/A'}`);
  console.log(`  Humor for absurd: ${percentile >= 99 ? (recommendation.bottomLine.humor ? '✓' : '✗') : 'N/A'}`);
});

console.log('\n' + '='.repeat(80));
console.log('✅ All tests completed!\n');
