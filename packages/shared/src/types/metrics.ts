export type QualityRating = 'great' | 'good' | 'fair' | 'poor';

export interface QualityAssessment {
  score: number; // 0 to 100
  rating: QualityRating;
  labelVi: string;
  labelEn: string;
  color: string;
  summary: string;
}

export interface PingSample {
  timestamp: number;
  rtt: number; // Round-trip time in milliseconds
  status: 'success' | 'timeout' | 'error';
  targetUrl: string;
}

export interface PingStats {
  current: number;
  min: number;
  max: number;
  median: number;
  average: number;
  p95: number;
}

export interface NetworkMetrics {
  ping: PingStats;
  jitter: number;            // ms
  packetLoss: number;        // percentage 0 - 100 (estimated)
  quality: QualityAssessment;
  sampleCount: number;
  lossCount: number;
  windowSize: number;
  lastUpdated: number;
}

export interface SpeedTestResult {
  downloadMbps: number | null;
  uploadMbps: number | null;
  isRunning: boolean;
  phase: 'idle' | 'download' | 'upload' | 'complete' | 'error';
  progress: number; // 0 to 100
  error?: string;
}

export interface BrowserConnectionInfo {
  online: boolean;
  effectiveType?: string; // '4g', '3g', '2g', 'slow-2g'
  downlink?: number;      // Mb/s
  rtt?: number;           // ms reported by navigator.connection
  saveData?: boolean;
}
