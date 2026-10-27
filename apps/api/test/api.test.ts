import { describe, it, expect } from 'vitest';
import { app } from '../src/index';

describe('NetCheck API Routes', () => {
  it('GET /api/health should return ok status', async () => {
    const res = await app.request('/api/health');
    expect(res.status).toBe(200);
    const data = await res.json() as { status: string; service: string };
    expect(data.status).toBe('ok');
    expect(data.service).toContain('NetCheck Gaming');
  });

  it('HEAD /api/echo should return 200 with X-Server-Time', async () => {
    const res = await app.request('/api/echo', { method: 'HEAD' });
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Server-Time')).toBeDefined();
  });

  it('GET /api/echo should return json with serverTime', async () => {
    const res = await app.request('/api/echo');
    expect(res.status).toBe(200);
    const data = await res.json() as { status: string; serverTime: number };
    expect(data.status).toBe('ok');
    expect(typeof data.serverTime).toBe('number');
  });

  it('GET /api/games should return games list with disclaimer', async () => {
    const res = await app.request('/api/games');
    expect(res.status).toBe(200);
    const data = await res.json() as { games: Array<{ id: string; name: string }>; disclaimer: string };
    expect(data.games.length).toBeGreaterThan(0);
    expect(data.games.some((g) => g.id === 'valorant')).toBe(true);
    expect(data.games.some((g) => g.id === 'cs2')).toBe(true);
    expect(data.games.some((g) => g.id === 'delta-force')).toBe(true);
    expect(data.disclaimer).toBeDefined();
  });

  it('GET /api/speed/download with size limit', async () => {
    const res = await app.request('/api/speed/download?bytes=1024');
    expect(res.status).toBe(200);
    const buf = await res.arrayBuffer();
    expect(buf.byteLength).toBe(1024);
  });

  it('POST /api/speed/upload should calculate throughput', async () => {
    const dummyPayload = new Uint8Array(1024 * 50); // 50KB
    const res = await app.request('/api/speed/upload', {
      method: 'POST',
      body: dummyPayload
    });
    expect(res.status).toBe(200);
    const data = await res.json() as { bytesReceived: number; mbps: number };
    expect(data.bytesReceived).toBe(1024 * 50);
    expect(data.mbps).toBeGreaterThan(0);
  });
});
