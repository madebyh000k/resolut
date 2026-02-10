# API Cost Optimization System

Comprehensive cost control system for Claude API usage during beta testing.

## Features

✅ **Rate Limiting** - Prevents excessive API usage (3 optimize/prepare, 2 negotiate per day)
✅ **Intelligent Caching** - Caches identical requests (24h for optimize, 7d for prepare)
✅ **Cost Tracking** - Monitors actual spending in real-time
✅ **Token Optimization** - Reduced max_tokens limits for beta (2500/2000/2000)
✅ **User-Facing UI** - Shows remaining usage and reset times
✅ **Admin Dashboard** - Monitor costs, cache hit rates, and top users

## Cost Savings

Expected savings: **50-70%** of API costs

- Cache hits: ~30-40% (free API calls)
- Rate limiting: Prevents runaway costs
- Token limits: 40% reduction in max tokens
- Combined effect: Significant cost reduction

## Quick Start

### 1. Install Dependencies

First, install the required package:

```bash
npm install crypto
```

Note: `crypto` is a built-in Node.js module, so this should already be available.

### 2. Update Your API Routes

Replace manual Anthropic API calls with the optimized wrapper:

**Before:**
```typescript
const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 8000,
  temperature: 0.3,
  messages: [{ role: 'user', content: prompt }],
});
```

**After:**
```typescript
import { makeOptimizedApiCall, getMaxTokens } from '@/lib/api-optimization/optimized-api-call';

const result = await makeOptimizedApiCall({
  feature: 'optimize', // or 'prepare' or 'negotiate'
  inputs: { resumeText, jobDescription, companyName },
  anthropicCall: () =>
    anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: getMaxTokens('optimize'),
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    }),
  request,
});

if (!result.success) {
  return NextResponse.json({ error: result.error }, { status: 429 });
}
```

### 3. Update Your UI

Show users their remaining usage:

```typescript
import { UsageBanner } from '@/components/ui/usage-banner';

// After successful API call:
<UsageBanner
  remaining={usage.remaining}
  limit={usage.limit}
  resetsAt={usage.resetsAt}
  feature="optimize"
/>
```

### 4. Monitor Costs

Access the admin dashboard:

```bash
curl http://localhost:3000/api/admin/usage-stats
```

Or create an admin UI page that displays these stats.

## API Response Format

All optimized API calls return:

```typescript
{
  success: boolean;
  data?: any; // Your API response
  error?: string;
  usage: {
    remaining: number; // Uses left today
    limit: number; // Daily limit
    resetsAt: Date; // When limit resets
    cacheHit: boolean; // Was this cached?
  };
  cost?: {
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number; // In dollars
  };
}
```

## Configuration

### Beta Limits (Current)

```typescript
const BETA_LIMITS = {
  optimize: 3, // per day
  prepare: 3, // per day
  negotiate: 2, // per day
};

const BETA_TOKEN_LIMITS = {
  optimize: 2500, // down from 8000
  prepare: 2000, // down from 3000
  negotiate: 2000, // down from 3000
};
```

### Cache TTL

```typescript
const CACHE_TTL = {
  optimize: 24 * 60 * 60 * 1000, // 24 hours
  prepare: 7 * 24 * 60 * 60 * 1000, // 7 days
  negotiate: 0, // No caching
};
```

### Cost Thresholds

```typescript
const DAILY_COST_WARNING = 25; // $25
const DAILY_COST_ALERT = 50; // $50
```

## API Routes to Update

You need to update these three API routes:

1. ✅ `/app/api/analyze-resume/route.ts` (DONE)
2. ⏳ `/app/api/generate-brief/route.ts` (TODO)
3. ⏳ `/app/api/analyze-offer/route.ts` (TODO)

## Migration to Production

When ready for production (after beta):

1. **Increase Limits:**
   ```typescript
   const PRODUCTION_LIMITS = {
     optimize: 10, // or unlimited with auth
     prepare: 10,
     negotiate: 5,
   };
   ```

2. **Increase Token Limits:**
   ```typescript
   const PRODUCTION_TOKEN_LIMITS = {
     optimize: 4000,
     prepare: 3000,
     negotiate: 3000,
   };
   ```

3. **Add Database (Supabase):**
   - Migrate from in-memory to Supabase tables
   - Persist rate limits across server restarts
   - Enable per-user tracking with auth
   - Long-term cost analytics

4. **Add Authentication:**
   - Replace IP-based tracking with user IDs
   - Per-user rate limits
   - User-specific usage dashboards

## Monitoring

### Console Logs

The system logs important events:

```
[CACHE HIT] optimize:a1b2c3... Tokens saved: 2400
[API CALL] OPTIMIZE | User: 192.168... | Tokens: 1200in/1800out | Cost: $0.0306
⚠️  WARNING: Daily cost has reached $25.50
🚨 ALERT: Daily cost has reached $50.00!
```

### Admin Dashboard

```bash
GET /api/admin/usage-stats
```

Returns:
```json
{
  "today": {
    "totalCalls": 145,
    "totalCost": 18.50,
    "cacheHitRate": 0.32,
    "costByFeature": {
      "optimize": 12.30,
      "prepare": 4.20,
      "negotiate": 2.00
    }
  },
  "cache": {
    "hitRate": 0.32,
    "tokensSaved": 156000,
    "costSaved": 12.40
  },
  "projectedMonthly": 385.00
}
```

## Cost Breakdown

### Claude Sonnet 4.5 Pricing

- Input: $3 per million tokens ($0.000003/token)
- Output: $15 per million tokens ($0.000015/token)

### Typical Call Costs

- **Optimize**: ~1200in + 1800out = ~$0.03 per call
- **Prepare**: ~800in + 1200out = ~$0.02 per call
- **Negotiate**: ~600in + 1400out = ~$0.02 per call

### Daily Cost Estimates

Without optimization:
- 100 optimize calls = $3.00
- 50 prepare calls = $1.00
- 30 negotiate calls = $0.60
- **Total: ~$4.60/day = ~$140/month**

With optimization (50-70% savings):
- Cache hit rate: 30%
- Rate limiting: Prevents spikes
- Token limits: 40% reduction
- **Total: ~$1.40-2.30/day = ~$42-70/month**

## Troubleshooting

### Rate Limit Errors

If users see "Daily limit reached":
- Limits reset at midnight UTC
- Increase limits in `rate-limiter.ts`
- Add per-user limits with auth

### Cache Not Working

- Check cache TTL settings
- Verify inputs are deterministic (no timestamps in cache key)
- Monitor cache hit rate in admin dashboard

### Costs Still High

- Check if caching is working (cache hit rate > 20%)
- Verify token limits are applied
- Look for specific users with high usage
- Consider reducing max_tokens further

## Future Enhancements

- [ ] Migrate to Supabase for persistence
- [ ] Add user authentication
- [ ] Per-user usage dashboards
- [ ] Email notifications for limit warnings
- [ ] Dynamic pricing tiers
- [ ] A/B testing different token limits
- [ ] Webhook for cost alerts

## Support

For issues or questions, check:
- Console logs for detailed errors
- Admin dashboard for cost stats
- Rate limit response messages for user guidance
