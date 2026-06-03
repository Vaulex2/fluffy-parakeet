/**
 * Durable sliding-window rate limiter backed by Upstash Redis (H-03).
 *
 * Why: an in-memory Map is reset on every serverless cold start and is
 * bypassed entirely when requests hit different Lambda instances in parallel.
 * Upstash Redis is atomic and shared across all instances.
 *
 * Setup: add to your environment variables (.env.local + Vercel dashboard):
 *   UPSTASH_REDIS_REST_URL=<from Upstash console>
 *   UPSTASH_REDIS_REST_TOKEN=<from Upstash console>
 *
 * Fallback: if the env vars are missing (e.g. CI / fresh dev clone),
 * rate limiting is skipped and a warning is logged. Configure Upstash before
 * deploying to production.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Lazy Redis singleton — only instantiated when env vars are present
function makeRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn(
      '[ratelimit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set. ' +
        'Rate limiting is DISABLED. Add these env vars before deploying to production.'
    );
    return null;
  }
  return Redis.fromEnv();
}

function makeLimiter(
  redis: Redis | null,
  prefix: string,
  max: number,
  window: `${number} ${'s' | 'm' | 'h' | 'd'}`
): Ratelimit | null {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, window),
    analytics: true,
    prefix: `sgo:rl:${prefix}`,
  });
}

const redis = makeRedis();

// Per-action limiters with appropriate windows
const limiters = {
  signin: makeLimiter(redis, 'signin', 5, '30 m'),  // 5 / 30 min per email
  signup: makeLimiter(redis, 'signup', 3, '60 m'),  // 3 / hour per email
  forgot: makeLimiter(redis, 'forgot', 3, '60 m'),  // 3 / hour per email
  reservation: makeLimiter(redis, 'reservation', 5, '10 m'),  // 5 / 10 min per phone — booking emails arbitrary addresses
} as const;

export type RateLimitType = keyof typeof limiters;

/**
 * Returns true if the request is allowed, false if rate-limited.
 * @param type  The action type (signin | signup | forgot)
 * @param key   The rate-limit key — use the email address
 */
export async function checkRateLimit(
  type: RateLimitType,
  key: string
): Promise<boolean> {
  const limiter = limiters[type];

  if (!limiter) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[ratelimit] Upstash env vars not set — cannot enforce rate limits in production.');
    }
    console.warn('[ratelimit] Rate limiting disabled — configure Upstash before deploying.');
    return true;
  }

  const normalizedKey = key.toLowerCase().replace(/\+[^@]+@/, '@');
  const { success } = await limiter.limit(normalizedKey);
  return success;
}
