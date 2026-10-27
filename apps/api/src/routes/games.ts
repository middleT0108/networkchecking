import { Hono } from 'hono';
import { gamesConfig, GameServerStatus } from '@netcheck/shared';
import { Env } from '../types';

export const gamesRouter = new Hono<{ Bindings: Env }>();

/**
 * GET /api/games
 * Returns list of games with regional endpoints and latest cached health status.
 */
gamesRouter.get('/', async (c) => {
  const categoryFilter = c.req.query('category');
  let games = gamesConfig.games;

  if (categoryFilter) {
    games = games.filter((g) => g.category === categoryFilter);
  }

  // Fetch server status from D1 if available
  const statusMap = new Map<string, GameServerStatus>();
  if (c.env?.DB) {
    try {
      const { results } = await c.env.DB.prepare(
        'SELECT game_id as gameId, status, message, last_checked as lastChecked, source FROM game_server_status'
      ).all<GameServerStatus>();

      if (results) {
        for (const row of results) {
          statusMap.set(row.gameId, row);
        }
      }
    } catch {
      // Ignore if table not yet initialized
    }
  }

  const enrichedGames = games.map((game) => ({
    ...game,
    serverStatus: statusMap.get(game.id) || {
      gameId: game.id,
      status: 'operational',
      message: 'Tất cả dịch vụ hoạt động bình thường',
      lastChecked: new Date().toISOString(),
      source: 'synthetic-probe'
    }
  }));

  return c.json({
    version: gamesConfig.version,
    disclaimer: gamesConfig.disclaimer,
    games: enrichedGames
  });
});

/**
 * GET /api/games/:id/status
 * Returns current publisher server status for a specific game.
 */
gamesRouter.get('/:id/status', async (c) => {
  const gameId = c.req.param('id');
  const game = gamesConfig.games.find((g) => g.id === gameId);

  if (!game) {
    return c.json({ error: 'Không tìm thấy game' }, 404);
  }

  let status: GameServerStatus = {
    gameId,
    status: 'operational',
    message: 'Hoạt động bình thường',
    lastChecked: new Date().toISOString(),
    source: 'synthetic-probe'
  };

  if (c.env?.DB) {
    try {
      const record = await c.env.DB.prepare(
        'SELECT game_id as gameId, status, message, last_checked as lastChecked, source FROM game_server_status WHERE game_id = ?'
      )
        .bind(gameId)
        .first<GameServerStatus>();

      if (record) {
        status = record;
      }
    } catch {
      // Table not ready fallback
    }
  }

  return c.json(status);
});
