import { QualityRating } from './metrics';

export interface HistoryRecord {
  id?: string;
  gameId: string;
  regionId: string;
  timestamp: number;
  avgPing: number;
  medianPing: number;
  minPing: number;
  maxPing: number;
  jitter: number;
  packetLoss: number;
  score: number;
  rating: QualityRating;
  connectionType?: string;
  ispCountry?: string;
  ispOrg?: string;
  clientType: 'web' | 'agent';
}

export interface HistoryQueryFilter {
  gameId?: string;
  regionId?: string;
  range?: '1h' | '24h' | '7d';
  limit?: number;
}

export interface HistoryAggregation {
  count: number;
  avgPing: number;
  avgJitter: number;
  avgLoss: number;
  avgScore: number;
  p50Ping: number;
  p95Ping: number;
  bestRegion?: string;
}

export interface HistoryResponse {
  records: HistoryRecord[];
  aggregation: HistoryAggregation;
}
