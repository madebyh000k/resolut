/**
 * Unified API Optimization Wrapper
 * Integrates rate limiting, caching, and cost tracking
 */

import { checkRateLimit, incrementUsage, getUserIdentifier, formatResetTime } from './rate-limiter';
import { generateCacheKey, getCachedResult, setCachedResult } from './cache-manager';
import { logApiCall } from './cost-tracker';
import Anthropic from '@anthropic-ai/sdk';

interface OptimizedApiCallOptions {
  feature: 'optimize' | 'prepare' | 'negotiate';
  inputs: Record<string, any>;
  anthropicCall: () => Promise<Anthropic.Message>;
  request: Request;
  estimatedTokens?: number;
}

interface OptimizedApiResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
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

// Beta token limits (reduced to save costs)
export const BETA_TOKEN_LIMITS = {
  optimize: 2500,
  prepare: 2000,
  negotiate: 2000,
};

/**
 * Make an optimized API call with rate limiting, caching, and cost tracking
 *
 * Usage:
 * ```
 * const result = await makeOptimizedApiCall({
 *   feature: 'optimize',
 *   inputs: { resumeText, jobDescription, companyName },
 *   anthropicCall: () => anthropic.messages.create({...}),
 *   request,
 * });
 * ```
 */
export async function makeOptimizedApiCall<T = any>(
  options: OptimizedApiCallOptions
): Promise<OptimizedApiResult<T>> {
  const { feature, inputs, anthropicCall, request, estimatedTokens = 2000 } = options;

  // 1. Get user identifier
  const userId = getUserIdentifier(request);

  // 2. Check rate limit
  const rateLimit = checkRateLimit(userId, feature);

  if (!rateLimit.allowed) {
    const resetTime = formatResetTime(rateLimit.resetsAt);
    return {
      success: false,
      error: `Daily limit reached for ${feature}. You have ${rateLimit.remaining} uses remaining. Resets ${resetTime}.`,
      usage: {
        remaining: rateLimit.remaining,
        limit: rateLimit.limit,
        resetsAt: rateLimit.resetsAt,
        cacheHit: false,
      },
    };
  }

  // 3. Check cache (except for negotiate)
  const cacheKey = generateCacheKey(feature, inputs);
  const cachedResult = getCachedResult(cacheKey);

  if (cachedResult) {
    // Cache hit! Return cached result without incrementing rate limit or making API call
    console.log(`[${feature.toUpperCase()}] Cache hit, returning cached result`);

    // Still log it for tracking (with 0 cost)
    logApiCall(userId, feature, estimatedTokens, estimatedTokens, true);

    return {
      success: true,
      data: cachedResult as T,
      usage: {
        remaining: rateLimit.remaining, // Don't decrement for cache hits
        limit: rateLimit.limit,
        resetsAt: rateLimit.resetsAt,
        cacheHit: true,
      },
      cost: {
        inputTokens: 0,
        outputTokens: 0,
        estimatedCost: 0,
      },
    };
  }

  // 4. Make API call
  try {
    console.log(`[${feature.toUpperCase()}] Making API call for user ${userId.substring(0, 10)}...`);

    const message = await anthropicCall();

    // Extract token usage from response
    const inputTokens = message.usage?.input_tokens || 0;
    const outputTokens = message.usage?.output_tokens || 0;

    // Calculate cost
    const inputCost = inputTokens * 0.000003;
    const outputCost = outputTokens * 0.000015;
    const totalCost = inputCost + outputCost;

    // 5. Log cost
    logApiCall(userId, feature, inputTokens, outputTokens, false);

    // 6. Increment rate limit
    incrementUsage(userId, feature);

    // 7. Cache the result (if applicable)
    const content = message.content[0];
    if (content.type === 'text') {
      setCachedResult(cacheKey, content.text, feature, inputTokens + outputTokens);
    }

    // 8. Return result with updated usage info
    const updatedRateLimit = checkRateLimit(userId, feature);

    return {
      success: true,
      data: message as T,
      usage: {
        remaining: updatedRateLimit.remaining,
        limit: updatedRateLimit.limit,
        resetsAt: updatedRateLimit.resetsAt,
        cacheHit: false,
      },
      cost: {
        inputTokens,
        outputTokens,
        estimatedCost: Math.round(totalCost * 10000) / 10000,
      },
    };
  } catch (error) {
    console.error(`[${feature.toUpperCase()}] API call failed:`, error);

    // Don't increment rate limit on failure
    const updatedRateLimit = checkRateLimit(userId, feature);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'API call failed',
      usage: {
        remaining: updatedRateLimit.remaining,
        limit: updatedRateLimit.limit,
        resetsAt: updatedRateLimit.resetsAt,
        cacheHit: false,
      },
    };
  }
}

/**
 * Get max tokens for a feature based on beta limits
 */
export function getMaxTokens(feature: 'optimize' | 'prepare' | 'negotiate'): number {
  return BETA_TOKEN_LIMITS[feature];
}
