import { Hono } from 'hono';
import { Env } from './types';
import { corsMiddleware } from './middlewares/cors';
import { rateLimit } from './middlewares/rateLimit';
import { echoRouter } from './routes/echo';
import { speedRouter } from './routes/speed';
import { gamesRouter } from './routes/games';
import { historyRouter } from './routes/history';
import { runStatusCheck } from './cron/statusCheck';

const app = new Hono<{ Bindings: Env }>();

// Global Middlewares
app.use('*', corsMiddleware);
app.use('/api/*', rateLimit(180, 60000)); // 180 req / min

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'NetCheck Gaming API',
    version: '1.0.0',
    timestamp: Date.now()
  });
});

// Mount Routes
app.route('/api/echo', echoRouter);
app.route('/api/speed', speedRouter);
app.route('/api/games', gamesRouter);
app.route('/api/history', historyRouter);

// Manual or GitHub Action trigger for server status check
app.post('/api/cron/check-status', async (c) => {
  const auth = c.req.header('Authorization');
  // Optional cron token protection if configured
  const results = await runStatusCheck(c.env);
  return c.json({ status: 'ok', results });
});

// Fallback 404
app.notFound((c) => {
  return c.json({ error: 'Endpoint không tồn tại' }, 404);
});

// Error handling
app.onError((err, c) => {
  console.error('Unhandled API Error:', err);
  return c.json({ error: 'Lỗi máy chủ nội bộ (Internal Server Error)' }, 500);
});

// Export hono app instance for testing and modularity
export { app };

// Cloudflare Workers entrypoint
export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runStatusCheck(env));
  }
};
