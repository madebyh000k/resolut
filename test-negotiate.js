// Quick test script for negotiate analyzer
import('dotenv/config');

const testOffer = {
  baseSalary: 150000,
  equity: "$300k RSUs over 4 years (back-loaded: 5%, 15%, 40%, 40%)",
  bonus: "15%",
  company: "Amazon",
  role: "Senior Software Engineer (L5)",
  location: "Seattle",
  yearsOfExperience: 6
};

// Dynamic import since this is ESM
const { analyzeAndAdvise } = await import('./lib/negotiation/negotiateAnalyzer.ts');

console.log('Testing Amazon L5 offer...\n');
console.log('Input:', JSON.stringify(testOffer, null, 2));
console.log('\n' + '='.repeat(80) + '\n');

try {
  const advice = await analyzeAndAdvise(testOffer);

  console.log('MARKET POSITION:');
  console.log(`  Percentile: ${advice.marketPosition.percentile}th`);
  console.log(`  4-Year Total: ${advice.marketPosition.totalComp4Year}`);
  console.log(`  Gap: ${advice.marketPosition.gap}`);

  console.log('\nRECOMMENDED ASK:');
  console.log(`  Base: ${advice.recommendedAsk.base}`);
  if (advice.recommendedAsk.equity) {
    console.log(`  Equity: ${advice.recommendedAsk.equity}`);
  }
  console.log(`  Rationale: ${advice.recommendedAsk.rationale}`);

  console.log('\nEMAIL TEMPLATE:');
  console.log('---');
  console.log(advice.emailTemplate);
  console.log('---');

  console.log('\nPUSHBACK RESPONSES:');
  advice.pushbackResponses.forEach((response, i) => {
    console.log(`\n${i + 1}. ${response.theySay}`);
    console.log(`   → ${response.youSay}`);
  });

  if (advice.redFlags && advice.redFlags.length > 0) {
    console.log('\nRED FLAGS:');
    advice.redFlags.forEach(flag => console.log(`  ⚠️  ${flag}`));
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Test completed successfully!');

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error);
  process.exit(1);
}
