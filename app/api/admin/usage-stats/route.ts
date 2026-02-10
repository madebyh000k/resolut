import { NextRequest, NextResponse } from 'next/server';
import { getDailySummary, getCacheSavings, getTopUsersByCost, estimateMonthlyCost } from '@/lib/api-optimization/cost-tracker';
import { getCacheStats, getCacheSize } from '@/lib/api-optimization/cache-manager';
import { getRateLimitStats } from '@/lib/api-optimization/rate-limiter';

/**
 * Admin Usage Stats Endpoint
 *
 * GET /api/admin/usage-stats
 *
 * Returns real-time stats about API usage, costs, and caching
 *
 * TODO: Add authentication in production!
 */
export async function GET(request: NextRequest) {
  try {
    // Get today's summary
    const today = getDailySummary();

    // Get cache stats
    const cacheStats = getCacheStats();
    const cacheSavings = getCacheSavings();

    // Get rate limit stats
    const rateLimitStats = getRateLimitStats();

    // Get top users
    const topUsers = getTopUsersByCost(5);

    // Estimate monthly cost
    const projectedMonthly = estimateMonthlyCost();

    // Calculate this week (last 7 days)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const thisWeek = {
      totalCost: 0, // TODO: Implement getWeeklyCost function if needed
      projectedMonthly,
    };

    const stats = {
      today: {
        date: today.date,
        totalCalls: today.totalCalls,
        totalCost: today.totalCost,
        cacheHitRate: today.cacheHitRate,
        costByFeature: today.costByFeature,
        callsByFeature: today.callsByFeature,
      },
      thisWeek,
      cache: {
        totalHits: cacheStats.totalHits,
        totalMisses: cacheStats.totalMisses,
        hitRate: cacheStats.hitRate,
        size: getCacheSize(),
        tokensSaved: cacheSavings.tokensSaved,
        costSaved: cacheSavings.costSaved,
      },
      rateLimits: rateLimitStats,
      topUsers,
      projectedMonthly,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return NextResponse.json(
      { error: 'Failed to get usage stats' },
      { status: 500 }
    );
  }
}
