/**
 * Intelligent Caching System
 * Caches API responses to avoid duplicate calls for identical inputs
 */

import crypto from 'crypto';

interface CacheEntry {
  result: any;
  createdAt: Date;
  expiresAt: Date;
  tokensSaved: number;
}

interface CacheStats {
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  tokensSaved: number;
  costSaved: number; // in dollars
}

// Cache TTL by feature (in milliseconds)
const CACHE_TTL = {
  optimize: 24 * 60 * 60 * 1000, // 24 hours
  prepare: 7 * 24 * 60 * 60 * 1000, // 7 days
  negotiate: 0, // No caching for negotiate (time-sensitive)
};

// In-memory cache store
// For production: migrate to Redis or Supabase
const cacheStore = new Map<string, CacheEntry>();

// Cache statistics
let cacheHits = 0;
let cacheMisses = 0;
let totalTokensSaved = 0;

/**
 * Generate cache key from inputs
 */
export function generateCacheKey(
  feature: string,
  inputs: Record<string, any>
): string {
  // Create deterministic hash of inputs
  const inputString = JSON.stringify(inputs, Object.keys(inputs).sort());
  const hash = crypto.createHash('sha256').update(inputString).digest('hex');
  return `${feature}:${hash}`;
}

/**
 * Get cached result if available and not expired
 */
export function getCachedResult(cacheKey: string): any | null {
  const entry = cacheStore.get(cacheKey);

  if (!entry) {
    cacheMisses++;
    return null;
  }

  const now = new Date();
  if (now >= entry.expiresAt) {
    // Cache expired, remove it
    cacheStore.delete(cacheKey);
    cacheMisses++;
    return null;
  }

  // Cache hit!
  cacheHits++;
  totalTokensSaved += entry.tokensSaved;

  console.log(`[CACHE HIT] Key: ${cacheKey.substring(0, 20)}... Tokens saved: ${entry.tokensSaved}`);

  return entry.result;
}

/**
 * Store result in cache
 */
export function setCachedResult(
  cacheKey: string,
  result: any,
  feature: string,
  estimatedTokens: number = 2000
): void {
  const ttl = CACHE_TTL[feature as keyof typeof CACHE_TTL] ?? CACHE_TTL.optimize;

  // Don't cache if TTL is 0
  if (ttl === 0) {
    return;
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttl);

  const entry: CacheEntry = {
    result,
    createdAt: now,
    expiresAt,
    tokensSaved: estimatedTokens,
  };

  cacheStore.set(cacheKey, entry);

  console.log(`[CACHE SET] Key: ${cacheKey.substring(0, 20)}... Expires: ${expiresAt.toISOString()}`);
}

/**
 * Clean up expired cache entries
 * Should be called periodically
 */
export function cleanExpiredCache(): number {
  const now = new Date();
  let removed = 0;

  cacheStore.forEach((entry, key) => {
    if (now >= entry.expiresAt) {
      cacheStore.delete(key);
      removed++;
    }
  });

  if (removed > 0) {
    console.log(`[CACHE CLEANUP] Removed ${removed} expired entries`);
  }

  return removed;
}

/**
 * Get cache statistics
 */
export function getCacheStats(): CacheStats {
  const total = cacheHits + cacheMisses;
  const hitRate = total > 0 ? cacheHits / total : 0;

  // Calculate cost saved (rough estimate)
  // Assuming average API call costs $0.15
  const avgCostPerCall = 0.15;
  const costSaved = cacheHits * avgCostPerCall;

  return {
    totalHits: cacheHits,
    totalMisses: cacheMisses,
    hitRate: Math.round(hitRate * 100) / 100,
    tokensSaved: totalTokensSaved,
    costSaved: Math.round(costSaved * 100) / 100,
  };
}

/**
 * Clear all cache (for testing or admin purposes)
 */
export function clearCache(): void {
  cacheStore.clear();
  console.log('[CACHE] All cache cleared');
}

/**
 * Get cache size
 */
export function getCacheSize(): number {
  return cacheStore.size;
}

// Run cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cleanExpiredCache();
  }, 60 * 60 * 1000); // 1 hour
}
