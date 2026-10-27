import { MiddlewareHandler } from 'hono';

// Simple in-memory rate limiting map per worker instance
const requestBuckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(limit: number = 120, windowMs: number = 60000): MiddlewareHandler {
  return async (c, next) => {
    const ip = c.req.header('CF-Connecting-IP') || '127.0.0.1';
    const now = Date.now();

    const bucket = requestBuckets.get(ip);
    if (!bucket || now > bucket.resetAt) {
      requestBuckets.set(ip, { count: 1, resetAt: now + windowMs });
    } else {
      bucket.count++;
      if (bucket.count > limit) {
        c.header('Retry-After', Math.ceil((bucket.resetAt - now) / 1000).toString());
        return c.json({ error: 'Quá nhiều yêu cầu (Rate limit exceeded). Vui lòng thử lại sau.' }, 429);
      }
    }

    // Clean up memory periodically
    if (requestBuckets.size > 2000) {
      for (const [key, b] of requestBuckets.entries()) {
        if (now > b.resetAt) requestBuckets.delete(key);
      }
    }

    await next();
  };
}
