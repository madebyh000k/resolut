/**
 * Rate Limiting System
 * Tracks API usage per user/IP and enforces daily limits
 */

interface RateLimitConfig {
  optimize: number;
  prepare: number;
  negotiate: number;
}

interface RateLimitRecord {
  count: number;
  resetAt: Date;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetsAt: Date;
}

// Beta limits - conservative to control costs
const BETA_LIMITS: RateLimitConfig = {
  optimize: 3,
  prepare: 3,
  negotiate: 2,
};

// In-memory storage (will reset on server restart, which is fine for beta)
// For production: migrate to Redis or Supabase
const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Generate a unique key for rate limiting
 * Uses IP address or session ID
 */
function getRateLimitKey(identifier: string, feature: keyof RateLimitConfig): string {
  return `${identifier}:${feature}`;
}

/**
 * Get midnight UTC for today (reset time)
 */
function getNextMidnightUTC(): Date {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow;
}

/**
 * Check if user/IP has exceeded rate limit for a feature
 */
export function checkRateLimit(
  identifier: string,
  feature: keyof RateLimitConfig
): RateLimitResult {
  const key = getRateLimitKey(identifier, feature);
  const limit = BETA_LIMITS[feature];
  const now = new Date();

  // Get existing record or create new one
  let record = rateLimitStore.get(key);

  // If no record or reset time has passed, create fresh record
  if (!record || now >= record.resetAt) {
    record = {
      count: 0,
      resetAt: getNextMidnightUTC(),
    };
    rateLimitStore.set(key, record);
  }

  const remaining = Math.max(0, limit - record.count);
  const allowed = record.count < limit;

  return {
    allowed,
    remaining,
    limit,
    resetsAt: record.resetAt,
  };
}

/**
 * Increment usage counter for a feature
 */
export function incrementUsage(identifier: string, feature: keyof RateLimitConfig): void {
  const key = getRateLimitKey(identifier, feature);
  const record = rateLimitStore.get(key);

  if (record) {
    record.count++;
    rateLimitStore.set(key, record);
  }
}

/**
 * Get user identifier from request
 * Uses IP address for now, can be upgraded to user ID with auth
 */
export function getUserIdentifier(request: Request): string {
  // Get IP from request headers
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}

/**
 * Format time until reset
 */
export function formatResetTime(resetsAt: Date): string {
  const now = new Date();
  const diff = resetsAt.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `in ${hours}h ${minutes}m`;
  }
  return `in ${minutes}m`;
}

/**
 * Get rate limit stats (for admin monitoring)
 */
export function getRateLimitStats() {
  const stats = {
    totalUsers: 0,
    byFeature: {
      optimize: { users: 0, totalCalls: 0 },
      prepare: { users: 0, totalCalls: 0 },
      negotiate: { users: 0, totalCalls: 0 },
    },
  };

  const userIds = new Set<string>();

  rateLimitStore.forEach((record, key) => {
    const [userId, feature] = key.split(':') as [string, keyof RateLimitConfig];
    userIds.add(userId);

    if (stats.byFeature[feature]) {
      stats.byFeature[feature].users++;
      stats.byFeature[feature].totalCalls += record.count;
    }
  });

  stats.totalUsers = userIds.size;
  return stats;
}
