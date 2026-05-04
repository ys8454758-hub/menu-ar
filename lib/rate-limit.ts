// Rate limiting utility using in-memory store
// For production, use Redis/Upstash

interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

function cleanup() {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}

setInterval(cleanup, CLEANUP_INTERVAL);

export function rateLimit({ limit = 10, windowMs = 60000 }: RateLimitConfig = {}) {
  return function (identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const key = identifier;

    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return { allowed: true, remaining: limit - 1, resetTime: store[key].resetTime };
    }

    store[key].count++;

    if (store[key].count > limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: store[key].resetTime,
      };
    }

    return {
      allowed: true,
      remaining: limit - store[key].count,
      resetTime: store[key].resetTime,
    };
  };
}

// Pre-configured rate limiters
export const scanLimiter = rateLimit({ limit: 100, windowMs: 60000 }); // 100 per minute
export const apiLimiter = rateLimit({ limit: 30, windowMs: 60000 }); // 30 per minute
export const authLimiter = rateLimit({ limit: 5, windowMs: 60000 }); // 5 per minute
