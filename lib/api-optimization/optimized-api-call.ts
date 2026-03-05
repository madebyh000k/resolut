/**
 * Unified API Optimization Wrapper
 * Integrates rate limiting, caching, and cost tracking
 */

import { checkRateLimit, incrementUsage, getUserIdentifier, formatResetTime } from './rate-limiter';
import { generateCacheKey, getCachedResult, setCachedResult } from './cache-manager';
import { logApiCall } from './cost-tracker';
import Anthropic from '@anthropic-ai/sdk';

// Pipeline features (user-facing, rate-limited)
type PipelineFeature = 'optimize' | 'prepare' | 'negotiate';

// Agent features (internal steps within a pipeline, not individually rate-limited)
type AgentFeature = 'agent-jd-analyst' | 'agent-strategist' | 'agent-recruiter' | 'agent-scorer';

type Feature = PipelineFeature | AgentFeature;

interface OptimizedApiCallOptions {
  feature: Feature;
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

// Token limits per feature
// Agents: Haiku tasks (JD Analyst, Scorer) are tight; Sonnet tasks (Strategist, Writer, Recruiter) need room
export const BETA_TOKEN_LIMITS: Record<Feature, number> = {
  // Pipeline features (existing)
  optimize: 2500,
  prepare: 2000,
  negotiate: 2000,
  // Agent features (new)
  'agent-jd-analyst': 800,    // Haiku — structured JSON extraction
  'agent-strategist': 3500,   // Sonnet — strategy chain-of-thought + full rewrite (merged)
  'agent-recruiter': 1200,    // Sonnet — adversarial review
  'agent-scorer': 1500,       // Haiku — structured JSON scoring
};

// Agent features bypass per-call rate limiting — they're sub-steps of a single pipeline call
const AGENT_FEATURES: Set<Feature> = new Set([
  'agent-jd-analyst',
  'agent-strategist',
  'agent-recruiter',
  'agent-scorer',
]);

/**
 * Make an optimized API call with rate limiting, caching, and cost tracking
 */
export async function makeOptimizedApiCall<T = any>(
  options: OptimizedApiCallOptions
): Promise<OptimizedApiResult<T>> {
  const { feature, inputs, anthropicCall, request, estimatedTokens = 2000 } = options;

  const isAgentFeature = AGENT_FEATURES.has(feature);
  const userId = getUserIdentifier(request);

  // Rate limiting only applies to pipeline features, not individual agents
  if (!isAgentFeature) {
    const rateLimit = checkRateLimit(userId, feature as PipelineFeature);

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
  }

  // Cache check — agents can cache too (same inputs = same output)
  const cacheKey = generateCacheKey(feature, inputs);
  const cachedResult = getCachedResult(cacheKey);

  if (cachedResult) {
    console.log(`[${feature.toUpperCase()}] Cache hit, returning cached result`);
    logApiCall(userId, feature, estimatedTokens, estimatedTokens, true);

    // Only check rate limit for pipeline features
    const usageInfo = !isAgentFeature
      ? checkRateLimit(userId, feature as PipelineFeature)
      : { remaining: 999, limit: 999, resetsAt: new Date() };

    return {
      success: true,
      data: cachedResult as T,
      usage: {
        remaining: usageInfo.remaining,
        limit: usageInfo.limit,
        resetsAt: usageInfo.resetsAt,
        cacheHit: true,
      },
      cost: { inputTokens: 0, outputTokens: 0, estimatedCost: 0 },
    };
  }

  // Make the API call
  try {
    console.log(`[${feature.toUpperCase()}] Making API call for user ${userId.substring(0, 10)}...`);

    const message = await anthropicCall();

    const inputTokens = message.usage?.input_tokens || 0;
    const outputTokens = message.usage?.output_tokens || 0;
    const totalCost = (inputTokens * 0.000003) + (outputTokens * 0.000015);

    logApiCall(userId, feature, inputTokens, outputTokens, false);

    // Only increment rate limit for pipeline features
    if (!isAgentFeature) {
      incrementUsage(userId, feature as PipelineFeature);
    }

    // Cache the result
    const content = message.content[0];
    if (content.type === 'text') {
      setCachedResult(cacheKey, content.text, feature, inputTokens + outputTokens);
    }

    const usageInfo = !isAgentFeature
      ? checkRateLimit(userId, feature as PipelineFeature)
      : { remaining: 999, limit: 999, resetsAt: new Date() };

    return {
      success: true,
      data: message as T,
      usage: {
        remaining: usageInfo.remaining,
        limit: usageInfo.limit,
        resetsAt: usageInfo.resetsAt,
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

    const usageInfo = !isAgentFeature
      ? checkRateLimit(userId, feature as PipelineFeature)
      : { remaining: 999, limit: 999, resetsAt: new Date() };

    return {
      success: false,
      error: error instanceof Error ? error.message : 'API call failed',
      usage: {
        remaining: usageInfo.remaining,
        limit: usageInfo.limit,
        resetsAt: usageInfo.resetsAt,
        cacheHit: false,
      },
    };
  }
}

/**
 * Get max tokens for a feature
 */
export function getMaxTokens(feature: Feature): number {
  return BETA_TOKEN_LIMITS[feature] ?? 2000;
}
