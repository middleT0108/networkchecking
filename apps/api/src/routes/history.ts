import { Hono } from 'hono';
import { HistoryRecord, HistoryAggregation, calculateMedian, calculatePercentile } from '@netcheck/shared';
import { Env } from '../types';

export const historyRouter = new Hono<{ Bindings: Env }>();

/**
 * Hash IP with daily salt to protect user privacy while allowing deduplication.
 */
async function hashIp(ip: string): Promise<string> {
  const dailySalt = new Date().toISOString().slice(0, 10);
  const data = new TextEncoder().encode(ip + dailySalt);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hex.slice(0, 16);
}

/**
 * POST /api/history
 * Save anonymous measurement session.
 */
historyRouter.post('/', async (c) => {
  if (!c.env.DB) {
    return c.json({ error: 'Cơ sở dữ liệu D1 chưa được kích hoạt' }, 503);
  }

  try {
    const body = await c.req.json<Partial<HistoryRecord>>();

    if (!body.gameId || !body.regionId || typeof body.avgPing !== 'number') {
      return c.json({ error: 'Dữ liệu không hợp lệ: thiếu gameId, regionId hoặc avgPing' }, 400);
    }

    const ip = c.req.header('CF-Connecting-IP') || '127.0.0.1';
    const ipHash = await hashIp(ip);

    // Extract geo metadata from Cloudflare CF properties
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cf = (c.req.raw as unknown as { cf?: any })?.cf;
    const ispCountry = body.ispCountry || cf?.country || 'VN';
    const ispOrg = body.ispOrg || cf?.asOrganization || 'Internet Service Provider';

    const id = crypto.randomUUID();
    const timestamp = body.timestamp || Date.now();
    const avgPing = Math.round(body.avgPing * 10) / 10;
    const medianPing = Math.round((body.medianPing ?? body.avgPing) * 10) / 10;
    const minPing = Math.round((body.minPing ?? body.avgPing) * 10) / 10;
    const maxPing = Math.round((body.maxPing ?? body.avgPing) * 10) / 10;
    const jitter = Math.round((body.jitter ?? 0) * 10) / 10;
    const packetLoss = Math.round((body.packetLoss ?? 0) * 10) / 10;
    const score = Math.round(body.score ?? 50);
    const rating = body.rating || 'good';
    const connectionType = body.connectionType || 'unknown';
    const clientType = body.clientType || 'web';

    await c.env.DB.prepare(
      `INSERT INTO test_history (
        id, game_id, region_id, timestamp, avg_ping, median_ping, min_ping, max_ping,
        jitter, packet_loss, score, rating, connection_type, isp_country, isp_org, client_type, ip_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        body.gameId,
        body.regionId,
        timestamp,
        avgPing,
        medianPing,
        minPing,
        maxPing,
        jitter,
        packetLoss,
        score,
        rating,
        connectionType,
        ispCountry,
        ispOrg,
        clientType,
        ipHash
      )
      .run();

    return c.json({ status: 'ok', id, message: 'Đã lưu lịch sử đo thành công' }, 201);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return c.json({ error: 'Lỗi ghi dữ liệu: ' + errorMsg }, 500);
  }
});

/**
 * GET /api/history
 * Query history records and statistics.
 */
historyRouter.get('/', async (c) => {
  if (!c.env.DB) {
    // Return sample empty structure when D1 not mounted
    return c.json({
      records: [],
      aggregation: {
        count: 0,
        avgPing: 0,
        avgJitter: 0,
        avgLoss: 0,
        avgScore: 0,
        p50Ping: 0,
        p95Ping: 0
      }
    });
  }

  const gameId = c.req.query('gameId');
  const regionId = c.req.query('regionId');
  const range = c.req.query('range') || '24h';
  const limitParam = parseInt(c.req.query('limit') || '100', 10);
  const limit = Math.min(500, Math.max(10, isNaN(limitParam) ? 100 : limitParam));

  let rangeMs = 24 * 60 * 60 * 1000;
  if (range === '1h') rangeMs = 60 * 60 * 1000;
  if (range === '7d') rangeMs = 7 * 24 * 60 * 60 * 1000;

  const sinceTimestamp = Date.now() - rangeMs;

  const conditions: string[] = ['timestamp >= ?'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any[] = [sinceTimestamp];

  if (gameId) {
    conditions.push('game_id = ?');
    params.push(gameId);
  }

  if (regionId) {
    conditions.push('region_id = ?');
    params.push(regionId);
  }

  const whereClause = conditions.join(' AND ');
  const query = `
    SELECT 
      id, game_id as gameId, region_id as regionId, timestamp,
      avg_ping as avgPing, median_ping as medianPing, min_ping as minPing, max_ping as maxPing,
      jitter, packet_loss as packetLoss, score, rating,
      connection_type as connectionType, isp_country as ispCountry, isp_org as ispOrg, client_type as clientType
    FROM test_history
    WHERE ${whereClause}
    ORDER BY timestamp DESC
    LIMIT ?
  `;
  params.push(limit);

  try {
    const { results } = await c.env.DB.prepare(query).bind(...params).all<HistoryRecord>();
    const records = results || [];

    // Calculate aggregated statistics
    let aggregation: HistoryAggregation = {
      count: records.length,
      avgPing: 0,
      avgJitter: 0,
      avgLoss: 0,
      avgScore: 0,
      p50Ping: 0,
      p95Ping: 0
    };

    if (records.length > 0) {
      const pings = records.map((r) => r.avgPing);
      const jitters = records.map((r) => r.jitter);
      const losses = records.map((r) => r.packetLoss);
      const scores = records.map((r) => r.score);

      const sum = (arr: number[]) => arr.reduce((acc, v) => acc + v, 0);

      aggregation = {
        count: records.length,
        avgPing: Math.round((sum(pings) / records.length) * 10) / 10,
        avgJitter: Math.round((sum(jitters) / records.length) * 10) / 10,
        avgLoss: Math.round((sum(losses) / records.length) * 10) / 10,
        avgScore: Math.round(sum(scores) / records.length),
        p50Ping: calculateMedian(pings),
        p95Ping: calculatePercentile(pings, 95)
      };
    }

    return c.json({ records, aggregation });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return c.json({ error: 'Lỗi truy vấn lịch sử: ' + errorMsg }, 500);
  }
});
