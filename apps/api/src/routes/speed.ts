import { Hono } from 'hono';
import { Env } from '../types';

export const speedRouter = new Hono<{ Bindings: Env }>();

/**
 * GET /api/speed/download
 * Generates an uncompressible binary payload of specified bytes (max 10MB)
 * to measure download throughput.
 */
speedRouter.get('/download', (c) => {
  const bytesParam = parseInt(c.req.query('bytes') || '1048576', 10);
  // Cap at 10MB to avoid excessive egress on free-tier
  const bytes = Math.min(10 * 1024 * 1024, Math.max(1024, isNaN(bytesParam) ? 1048576 : bytesParam));

  // Generate payload efficiently using repeating buffer
  const chunkSize = Math.min(65536, bytes);
  const chunk = new Uint8Array(chunkSize);
  for (let i = 0; i < chunkSize; i++) {
    chunk[i] = (i * 31 + 17) & 0xff;
  }

  const fullData = new Uint8Array(bytes);
  for (let offset = 0; offset < bytes; offset += chunkSize) {
    const end = Math.min(offset + chunkSize, bytes);
    fullData.set(chunk.subarray(0, end - offset), offset);
  }

  c.header('Content-Type', 'application/octet-stream');
  c.header('Content-Disposition', 'attachment; filename="speedtest.bin"');
  c.header('Content-Length', bytes.toString());
  c.header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  c.header('Pragma', 'no-cache');

  return c.body(fullData.buffer);
});

/**
 * POST /api/speed/upload
 * Receives uploaded payload, drains body, and returns total bytes received.
 */
speedRouter.post('/upload', async (c) => {
  const startTime = Date.now();
  const body = await c.req.arrayBuffer();
  const endTime = Date.now();

  const bytes = body.byteLength;
  const durationMs = Math.max(1, endTime - startTime);

  return c.json({
    status: 'ok',
    bytesReceived: bytes,
    durationMs,
    mbps: Math.round(((bytes * 8) / (durationMs / 1000) / (1024 * 1024)) * 100) / 100
  });
});
