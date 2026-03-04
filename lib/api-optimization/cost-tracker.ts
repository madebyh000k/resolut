/**
 * Cost Tracking System
 * Monitors API usage and calculates actual costs
 */

interface CostRecord {
  timestamp: Date;
  userId: string;
  feature: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  cacheHit: boolean;
}

interface DailyCostSummary {
  date: string;
  totalCalls: number;
  totalCost: number;
  cacheHitRate: number;
  costByFeature: {
    optimize: number;
    prepare: number;
    negotiate: number;
  };
  callsByFeature: {
    optimize: number;
    prepare: number;
    negotiate: number;
  };
}

// Claude Sonnet 4.5 pricing (as of Feb 2026)
// Input: $3 per million tokens = $0.000003 per token
// Output: $15 per million tokens = $0.000015 per token
const PRICING = {
  inputTokenPrice: 0.000003,
  outputTokenPrice: 0.000015,
};

// In-memory storage
const costRecords: CostRecord[] = [];

// Daily cost threshold for warnings
const DAILY_COST_WARNING = 25; // $25
const DAILY_COST_ALERT = 50; // $50

/**
 * Calculate cost for a single API call
 */
export function calculateCost(inputTokens: number, outputTokens: number): number {
  const cost =
    inputTokens * PRICING.inputTokenPrice + outputTokens * PRICING.outputTokenPrice;
  return Math.round(cost * 10000) / 10000; // Round to 4 decimal places
}

/**
 * Log an API call with token usage
 */
export function logApiCall(
  userId: string,
  feature: string,
  inputTokens: number,
  outputTokens: number,
  cacheHit: boolean = false
): void {
  const cost = cacheHit ? 0 : calculateCost(inputTokens, outputTokens);

  const record: CostRecord = {
    timestamp: new Date(),
    userId,
    feature,
    inputTokens,
    outputTokens,
    cost,
    cacheHit,
  };

  costRecords.push(record);

  // Log to console
  const cacheStatus = cacheHit ? '[CACHED]' : '[API CALL]';
  console.log(
    `${cacheStatus} ${feature.toUpperCase()} | User: ${userId.substring(0, 10)}... | ` +
      `Tokens: ${inputTokens}in/${outputTokens}out | Cost: $${cost.toFixed(4)}`
  );

  // Check daily cost and warn if needed
  const dailyCost = getDailyCost();
  if (dailyCost >= DAILY_COST_ALERT && !cacheHit) {
    console.warn(`🚨 ALERT: Daily cost has reached $${dailyCost.toFixed(2)}!`);
  } else if (dailyCost >= DAILY_COST_WARNING && !cacheHit) {
    console.warn(`⚠️  WARNING: Daily cost has reached $${dailyCost.toFixed(2)}`);
  }
}

/**
 * Get total cost for today
 */
export function getDailyCost(date: Date = new Date()): number {
  const today = date.toISOString().split('T')[0];

  const todayRecords = costRecords.filter((record) => {
    const recordDate = record.timestamp.toISOString().split('T')[0];
    return recordDate === today;
  });

  return todayRecords.reduce((sum, record) => sum + record.cost, 0);
}

/**
 * Get cost for a date range
 */
export function getCostForDateRange(startDate: Date, endDate: Date): number {
  const rangeRecords = costRecords.filter((record) => {
    return record.timestamp >= startDate && record.timestamp <= endDate;
  });

  return rangeRecords.reduce((sum, record) => sum + record.cost, 0);
}

/**
 * Get detailed daily summary
 */
export function getDailySummary(date: Date = new Date()): DailyCostSummary {
  const dateString = date.toISOString().split('T')[0];

  const todayRecords = costRecords.filter((record) => {
    const recordDate = record.timestamp.toISOString().split('T')[0];
    return recordDate === dateString;
  });

  const totalCalls = todayRecords.length;
  const totalCost = todayRecords.reduce((sum, record) => sum + record.cost, 0);
  const cacheHits = todayRecords.filter((r) => r.cacheHit).length;
  const cacheHitRate = totalCalls > 0 ? cacheHits / totalCalls : 0;

  const costByFeature = {
    optimize: 0,
    prepare: 0,
    negotiate: 0,
  };

  const callsByFeature = {
    optimize: 0,
    prepare: 0,
    negotiate: 0,
  };

  todayRecords.forEach((record) => {
    // Agent sub-steps aggregate under 'optimize'; only track pipeline features in summary
    const summaryFeature = record.feature.startsWith('agent-') ? 'optimize' : record.feature;
    if (summaryFeature in costByFeature) {
      costByFeature[summaryFeature as keyof typeof costByFeature] += record.cost;
      callsByFeature[summaryFeature as keyof typeof callsByFeature]++;
    }
  });

  return {
    date: dateString,
    totalCalls,
    totalCost: Math.round(totalCost * 100) / 100,
    cacheHitRate: Math.round(cacheHitRate * 100) / 100,
    costByFeature: {
      optimize: Math.round(costByFeature.optimize * 100) / 100,
      prepare: Math.round(costByFeature.prepare * 100) / 100,
      negotiate: Math.round(costByFeature.negotiate * 100) / 100,
    },
    callsByFeature,
  };
}

/**
 * Get cost for a specific user
 */
export function getUserCost(userId: string): number {
  const userRecords = costRecords.filter((record) => record.userId === userId);
  return userRecords.reduce((sum, record) => sum + record.cost, 0);
}

/**
 * Get total tokens saved from caching
 */
export function getCacheSavings(): { tokensSaved: number; costSaved: number } {
  const cacheHitRecords = costRecords.filter((record) => record.cacheHit);

  const tokensSaved = cacheHitRecords.reduce(
    (sum, record) => sum + record.inputTokens + record.outputTokens,
    0
  );

  // Calculate what the cost would have been without caching
  const costSaved = cacheHitRecords.reduce(
    (sum, record) => sum + calculateCost(record.inputTokens, record.outputTokens),
    0
  );

  return {
    tokensSaved,
    costSaved: Math.round(costSaved * 100) / 100,
  };
}

/**
 * Get top users by cost (for admin monitoring)
 */
export function getTopUsersByCost(limit: number = 10): Array<{ userId: string; cost: number; calls: number }> {
  const userCosts = new Map<string, { cost: number; calls: number }>();

  costRecords.forEach((record) => {
    const existing = userCosts.get(record.userId) || { cost: 0, calls: 0 };
    userCosts.set(record.userId, {
      cost: existing.cost + record.cost,
      calls: existing.calls + 1,
    });
  });

  return Array.from(userCosts.entries())
    .map(([userId, data]) => ({
      userId: userId.substring(0, 15) + '...',
      cost: Math.round(data.cost * 100) / 100,
      calls: data.calls,
    }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, limit);
}

/**
 * Estimate monthly cost based on current usage
 */
export function estimateMonthlyCost(): number {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysSoFar = today.getDate();

  const monthToDateCost = getCostForDateRange(startOfMonth, today);
  const avgDailyCost = monthToDateCost / daysSoFar;
  const projectedMonthlyCost = avgDailyCost * daysInMonth;

  return Math.round(projectedMonthlyCost * 100) / 100;
}
