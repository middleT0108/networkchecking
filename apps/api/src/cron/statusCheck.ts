import { Env } from '../types';
import { gamesConfig } from '@netcheck/shared';

interface StatusResult {
  gameId: string;
  status: 'operational' | 'degraded' | 'offline';
  message: string;
}

/**
 * Probes the health of a public game status or CDN endpoint with a strict timeout.
 */
async function probeEndpoint(url: string, timeoutMs = 5000): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'NetCheck-Gaming-Monitor/1.0'
      }
    });
    return res.status >= 200 && res.status < 400;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Checks all game publisher statuses and updates D1 table.
 */
export async function runStatusCheck(env: Env): Promise<StatusResult[]> {
  const results: StatusResult[] = [];
  const now = new Date().toISOString();

  for (const game of gamesConfig.games) {
    let status: 'operational' | 'degraded' | 'offline' = 'operational';
    let message = 'Tất cả dịch vụ hoạt động bình thường';

    if (game.statusUrl) {
      const isUp = await probeEndpoint(game.statusUrl, 4000);
      if (!isUp) {
        status = 'degraded';
        message = 'Phát hiện phản hồi chậm hoặc gián đoạn từ cổng thông tin hãng';
      }
    }

    results.push({ gameId: game.id, status, message });

    // Update D1 if available
    if (env.DB) {
      try {
        await env.DB.prepare(
          `INSERT INTO game_server_status (game_id, status, message, last_checked, source)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(game_id) DO UPDATE SET
             status = excluded.status,
             message = excluded.message,
             last_checked = excluded.last_checked,
             source = excluded.source`
        )
          .bind(game.id, status, message, now, 'synthetic-probe')
          .run();
      } catch (err) {
        console.error(`Failed to update status in DB for ${game.id}:`, err);
      }
    }
  }

  return results;
}
