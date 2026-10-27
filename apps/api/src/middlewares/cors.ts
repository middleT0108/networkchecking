import { MiddlewareHandler } from 'hono';

export const corsMiddleware: MiddlewareHandler = async (c, next) => {
  const origin = c.req.header('Origin') || '*';
  const allowedOrigin = c.env?.ALLOWED_ORIGIN || '*';

  // Set CORS headers
  c.header('Access-Control-Allow-Origin', allowedOrigin === '*' ? origin : allowedOrigin);
  c.header('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Version');
  c.header('Access-Control-Expose-Headers', 'X-Server-Time, X-Response-Time');
  c.header('Access-Control-Max-Age', '86400');

  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204);
  }

  await next();
};
