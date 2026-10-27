// Configs
import gamesConfigRaw from './config/games.config.json';
import { GamesConfigFile } from './types/game';

export const gamesConfig: GamesConfigFile = gamesConfigRaw as unknown as GamesConfigFile;

// Types
export * from './types/game';
export * from './types/metrics';
export * from './types/history';

// Math & Algorithms
export * from './math/ping';
export * from './math/jitter';
export * from './math/packetLoss';
export * from './math/score';

// Diagnostics
export * from './diagnostics/analyzer';
