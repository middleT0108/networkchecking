export type GameCategory = 'fps' | 'moba' | 'battle-royale' | 'other';

export type MeasurementType = 'http-head' | 'http-get' | 'websocket' | 'icmp-agent';

export interface GameThresholds {
  greatPing: number;  // ms (e.g. <= 30ms for FPS)
  okPing: number;     // ms (e.g. <= 60ms for FPS)
  greatJitter: number;// ms (e.g. <= 3ms)
  okJitter: number;   // ms (e.g. <= 7ms)
  maxLoss: number;    // % (e.g. 0% for FPS)
}

export interface RegionEndpoint {
  id: string;
  name: string;
  host: string;
  testUrl: string;
  type: MeasurementType;
  verified: boolean;
  port?: number;
  note?: string;
}

export interface GameProfile {
  id: string;
  name: string;
  publisher: string;
  category: GameCategory;
  icon: string;
  color: string;
  statusUrl?: string;
  thresholds: GameThresholds;
  regions: RegionEndpoint[];
}

export interface GamesConfigFile {
  version: string;
  disclaimer: string;
  games: GameProfile[];
}

export type ServerHealthStatus = 'operational' | 'degraded' | 'maintenance' | 'offline' | 'unknown';

export interface GameServerStatus {
  gameId: string;
  status: ServerHealthStatus;
  message?: string;
  lastChecked: string;
  source: 'official-api' | 'synthetic-probe';
}
