# Cost Optimization Setup Guide

Complete setup instructions for the API cost optimization system.

## What You're Getting

🎯 **Cost Savings: 50-70%**
- Rate limiting prevents runaway costs
- Intelligent caching eliminates duplicate API calls
- Token limits reduce per-call costs
- Real-time cost tracking and monitoring

## Installation Steps

### 1. Install Dependencies

The system uses Node.js built-in `crypto` module, which should already be available. No additional packages needed!

### 2. Files Created

The following files have been created:

**Core System:**
- `/lib/api-optimization/rate-limiter.ts` - Rate limiting (3/3/2 daily limits)
- `/lib/api-optimization/cache-manager.ts` - Intelligent caching (24h/7d/0)
- `/lib/api-optimization/cost-tracker.ts` - Cost tracking and monitoring
- `/lib/api-optimization/optimized-api-call.ts` - Unified API wrapper

**API Routes:**
- ✅ `/app/api/analyze-resume/route.ts` - UPDATED with optimization
- ⏳ `/app/api/generate-brief/route.ts` - TODO
- ⏳ `/app/api/analyze-offer/route.ts` - TODO
- `/app/api/admin/usage-stats/route.ts` - NEW admin monitoring endpoint

**UI Components:**
- `/components/ui/usage-banner.tsx` - Shows remaining usage to users

**Documentation:**
- `/lib/api-optimization/README.md` - Full documentation
- `/SETUP-COST-OPTIMIZATION.md` - This file

### 3. Update Remaining API Routes

You need to update two more API routes to use the optimization system:

#### A. Update `/app/api/generate-brief/route.ts`

Find the Anthropic API call and replace it with:

```typescript
import { makeOptimizedApiCall, getMaxTokens } from '@/lib/api-optimization/optimized-api-call';

// Replace the anthropic.messages.create() call with:
const result = await makeOptimizedApiCall({
  feature: 'prepare',
  inputs: { resumeText, jobDescription, companyName, companyNews, format },
  anthropicCall: () =>
    anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: getMaxTokens('prepare'),
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    }),
  request,
});

if (!result.success) {
  return NextResponse.json(
    { error: result.error, usage: result.usage },
    { status: 429 }
  );
}

const message = result.data as Anthropic.Message;
// ... continue with your existing parsing logic

// Add to final response:
return NextResponse.json({
  success: true,
  brief: brief,
  usage: result.usage,
  cost: result.cost,
});
```

#### B. Update `/app/api/analyze-offer/route.ts`

Follow the same pattern:

```typescript
import { makeOptimizedApiCall, getMaxTokens } from '@/lib/api-optimization/optimized-api-call';

const result = await makeOptimizedApiCall({
  feature: 'negotiate',
  inputs: { baseSalary, equity, bonus, company, role, location },
  anthropicCall: () =>
    anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: getMaxTokens('negotiate'),
      temperature: 0.4,
      messages: [{ role: 'user', content: prompt }],
    }),
  request,
});

if (!result.success) {
  return NextResponse.json(
    { error: result.error, usage: result.usage },
    { status: 429 }
  );
}

const message = result.data as Anthropic.Message;
// ... continue with existing logic

// Add to response:
return NextResponse.json({
  success: true,
  advice: advice,
  usage: result.usage,
  cost: result.cost,
});
```

### 4. Update UI to Show Usage Limits

#### A. Update Customize Page

In `/app/customize/page.tsx`, show the usage banner after optimization completes:

```typescript
import { UsageBanner } from '@/components/ui/usage-banner';

// In your component, store usage info from API response:
const [usageInfo, setUsageInfo] = useState(null);

// When you receive the API response:
const response = await fetch('/api/analyze-resume', {
  method: 'POST',
  body: JSON.stringify({ resumeText, jobDescription, companyName }),
});

const data = await response.json();

if (data.usage) {
  setUsageInfo(data.usage);
}

// In your JSX, show the banner after successful optimization:
{usageInfo && (
  <UsageBanner
    remaining={usageInfo.remaining}
    limit={usageInfo.limit}
    resetsAt={usageInfo.resetsAt}
    feature="optimize"
  />
)}
```

#### B. Update Prepare Page

Same pattern for `/app/prepare/page.tsx`:

```typescript
<UsageBanner
  remaining={usageInfo.remaining}
  limit={usageInfo.limit}
  resetsAt={usageInfo.resetsAt}
  feature="prepare"
/>
```

#### C. Update Negotiate Page

And for `/app/negotiate/page.tsx`:

```typescript
<UsageBanner
  remaining={usageInfo.remaining}
  limit={usageInfo.limit}
  resetsAt={usageInfo.resetsAt}
  feature="negotiate"
/>
```

### 5. Test the System

Run these tests to verify everything works:

#### Test 1: Rate Limiting

```bash
# Make 4 optimize requests quickly (should block the 4th)
curl -X POST http://localhost:3000/api/analyze-resume \
  -H "Content-Type: application/json" \
  -d '{"resumeText": "test", "jobDescription": "test"}'
```

Expected: 4th request returns 429 error with "Daily limit reached" message.

#### Test 2: Caching

```bash
# Make the same request twice
curl -X POST http://localhost:3000/api/analyze-resume \
  -H "Content-Type: application/json" \
  -d '{"resumeText": "test resume", "jobDescription": "test job"}'

# Wait 1 second, then repeat
sleep 1

curl -X POST http://localhost:3000/api/analyze-resume \
  -H "Content-Type: application/json" \
  -d '{"resumeText": "test resume", "jobDescription": "test job"}'
```

Expected:
- First request: Takes normal time, logs "[API CALL]"
- Second request: Returns instantly, logs "[CACHE HIT]", cost is $0

#### Test 3: Cost Tracking

```bash
# Check admin stats
curl http://localhost:3000/api/admin/usage-stats
```

Expected: JSON with today's costs, cache hit rate, etc.

#### Test 4: Usage Banner

1. Go to http://localhost:3000/customize
2. Upload resume and optimize
3. Should see "You have X optimize uses remaining today"

### 6. Monitor Costs

Check your dev server console logs to see:

```
[CACHE HIT] optimize:a1b2c3... Tokens saved: 2400
[API CALL] OPTIMIZE | User: 192.168.1.1 | Tokens: 1200in/1800out | Cost: $0.0306
Cache hit rate: 0.32 | Total cost today: $12.40
```

Access admin dashboard:
```bash
open http://localhost:3000/api/admin/usage-stats
```

## Configuration

### Adjust Limits

Edit `/lib/api-optimization/rate-limiter.ts`:

```typescript
const BETA_LIMITS = {
  optimize: 5, // Increase if needed
  prepare: 5,
  negotiate: 3,
};
```

### Adjust Cache TTL

Edit `/lib/api-optimization/cache-manager.ts`:

```typescript
const CACHE_TTL = {
  optimize: 48 * 60 * 60 * 1000, // 48 hours instead of 24
  prepare: 14 * 24 * 60 * 60 * 1000, // 14 days instead of 7
  negotiate: 0,
};
```

### Adjust Token Limits

Edit `/lib/api-optimization/optimized-api-call.ts`:

```typescript
export const BETA_TOKEN_LIMITS = {
  optimize: 3000, // Increase if quality suffers
  prepare: 2500,
  negotiate: 2500,
};
```

## Expected Results

### Before Optimization
- 100 API calls/day
- 0% cache hits
- $4-5/day cost
- ~$150/month
- No usage limits

### After Optimization
- 70 actual API calls/day (30 cached)
- 30% cache hit rate
- $1.50-2/day cost
- ~$50/month
- Protected by rate limits

### Cost Savings: ~60-70%

## Troubleshooting

### "Daily limit reached" error

**Problem:** Users can't use the feature.

**Solution:**
1. Check current time vs reset time (resets at midnight UTC)
2. Increase limits in `rate-limiter.ts` if too restrictive
3. Consider per-user authentication for higher limits

### Cache not working

**Problem:** Cache hit rate is 0%.

**Solution:**
1. Check console logs for "[CACHE HIT]" messages
2. Verify requests have identical inputs
3. Check that cache isn't expiring too quickly
4. Verify `negotiate` isn't being cached (it shouldn't be)

### Costs still high

**Problem:** Still spending > $3/day.

**Solution:**
1. Check admin dashboard for top users
2. Verify token limits are being applied
3. Look for unusually high traffic
4. Consider reducing max_tokens further
5. Check if caching is working properly

### Rate limits resetting incorrectly

**Problem:** Limits don't reset at midnight.

**Solution:**
- Server restart clears in-memory rate limits (expected in beta)
- For production: Migrate to Supabase for persistence
- Check server timezone vs UTC

## Next Steps

After beta testing:

1. **Add Authentication**
   - Replace IP-based limits with user IDs
   - Per-user usage tracking
   - User dashboards

2. **Migrate to Supabase**
   - Persist rate limits across restarts
   - Long-term cost analytics
   - Historical usage data

3. **Increase Limits**
   - Move from beta limits to production limits
   - Increase token limits if quality is good
   - Add premium tiers

4. **Add Monitoring**
   - Email alerts for high costs
   - Daily cost reports
   - Usage trends and analytics

## Support

Questions or issues? Check:
- `/lib/api-optimization/README.md` - Full documentation
- Console logs - Detailed debugging info
- Admin dashboard - Real-time stats
