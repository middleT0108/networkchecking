import { Hono } from 'hono';
import { Env } from '../types';

export const echoRouter = new Hono<{ Bindings: Env }>();

/**
 * HEAD /api/echo
 * Ultra-lightweight endpoint: 0 body, fastest round-trip for RTT measurement.
 */
echoRouter.on(['HEAD', 'GET'], '/', (c) => {
  const now = Date.now();
  c.header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  c.header('Pragma', 'no-cache');
  c.header('X-Server-Time', now.toString());

  if (c.req.method === 'HEAD') {
    return c.body(null, 200);
  }

  return c.json({
    status: 'ok',
    serverTime: now,
    colo: (c.req.raw as unknown as { cf?: { colo?: string } })?.cf?.colo || 'unknown'
  });
});

/**
 * GET /api/echo/ws
 * WebSocket echo endpoint for real-time ping/pong RTT measurement.
 */
echoRouter.get('/ws', async (c) => {
  const upgradeHeader = c.req.header('Upgrade');
  if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
    return c.text('Kỳ vọng nâng cấp giao thức WebSocket', 426);
  }

  // Cloudflare Workers WebSocketPair
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const webSocketPair = new (globalThis as any).WebSocketPair();
  const client = webSocketPair[0];
  const server = webSocketPair[1];

  server.accept();

  server.addEventListener('message', (event: MessageEvent) => {
    const receiveTime = Date.now();
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : {};
      // Echo back immediately with original client timestamp + server timestamps
      server.send(
        JSON.stringify({
          type: 'pong',
          clientSendTime: data.clientSendTime,
          serverReceiveTime: receiveTime,
          serverSendTime: Date.now(),
          sequence: data.sequence
        })
      );
    } catch {
      // If plain text ping
      server.send(
        JSON.stringify({
          type: 'pong',
          raw: event.data,
          serverTime: receiveTime
        })
      );
    }
  });

  server.addEventListener('close', () => {
    try {
      server.close();
    } catch {
      // already closed
    }
  });

  return new Response(null, {
    status: 101,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webSocket: client as any
  });
});
