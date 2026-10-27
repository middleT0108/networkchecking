import { create } from 'zustand';
import {
  NetworkMetrics,
  BrowserConnectionInfo,
  SpeedTestResult,
  calculatePingStats,
  calculateJitter,
  calculateQualityScore,
  calculatePacketLoss
} from '@netcheck/shared';

export interface ChartPoint {
  time: string;
  timestamp: number;
  ping: number;
  jitter: number;
}

interface NetworkState {
  isTesting: boolean;
  activeEndpointName: string;
  activeEndpointUrl: string;
  isOnline: boolean;
  isTabHidden: boolean;
  metrics: NetworkMetrics;
  chartData: ChartPoint[];
  speed: SpeedTestResult;
  connectionInfo: BrowserConnectionInfo;
  recentRtts: number[];
  slidingSamples: Array<{ status: 'success' | 'timeout' | 'error' }>;

  // Actions
  setTesting: (testing: boolean) => void;
  setActiveEndpoint: (name: string, url: string) => void;
  setOnline: (online: boolean) => void;
  setTabHidden: (hidden: boolean) => void;
  setConnectionInfo: (info: BrowserConnectionInfo) => void;
  setSpeed: (speed: Partial<SpeedTestResult>) => void;
  addSample: (rtt: number, status: 'success' | 'timeout' | 'error', windowSeconds: number) => void;
  resetMetrics: () => void;
}

const initialMetrics: NetworkMetrics = {
  ping: { current: 0, min: 0, max: 0, median: 0, average: 0, p95: 0 },
  jitter: 0,
  packetLoss: 0,
  quality: calculateQualityScore(0, 0, 0, 'fps'),
  sampleCount: 0,
  lossCount: 0,
  windowSize: 60,
  lastUpdated: Date.now()
};

export const useNetworkStore = create<NetworkState>((set, get) => ({
  isTesting: true,
  activeEndpointName: 'NetCheck Edge Baseline',
  activeEndpointUrl: '/api/echo',
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isTabHidden: false,
  metrics: initialMetrics,
  chartData: [],
  speed: {
    downloadMbps: null,
    uploadMbps: null,
    isRunning: false,
    phase: 'idle',
    progress: 0
  },
  connectionInfo: {
    online: true
  },
  recentRtts: [],
  slidingSamples: [],

  setTesting: (testing) => set({ isTesting: testing }),
  setActiveEndpoint: (name, url) => set({ activeEndpointName: name, activeEndpointUrl: url }),
  setOnline: (online) => set({ isOnline: online }),
  setTabHidden: (hidden) => set({ isTabHidden: hidden }),
  setConnectionInfo: (connectionInfo) => set({ connectionInfo }),
  setSpeed: (speedUpdate) => set((state) => ({ speed: { ...state.speed, ...speedUpdate } })),

  addSample: (rtt, status, windowSeconds = 60) => {
    const state = get();
    const now = Date.now();
    const timeStr = new Date(now).toLocaleTimeString('vi-VN', { hour12: false });

    // Keep sliding window of sample statuses (up to 120 samples)
    const newSliding = [...state.slidingSamples, { status }].slice(-100);
    const lostCount = newSliding.filter((s) => s.status !== 'success').length;
    const packetLoss = calculatePacketLoss(newSliding.length, lostCount);

    let newRecentRtts = [...state.recentRtts];
    if (status === 'success') {
      newRecentRtts.push(rtt);
      if (newRecentRtts.length > 100) newRecentRtts.shift();
    }

    const pingStats = calculatePingStats(newRecentRtts, status === 'success' ? rtt : state.metrics.ping.current);
    const jitter = calculateJitter(newRecentRtts);
    const quality = calculateQualityScore(pingStats.median, jitter, packetLoss, 'fps');

    const newMetrics: NetworkMetrics = {
      ping: pingStats,
      jitter,
      packetLoss,
      quality,
      sampleCount: state.metrics.sampleCount + 1,
      lossCount: state.metrics.lossCount + (status !== 'success' ? 1 : 0),
      windowSize: newSliding.length,
      lastUpdated: now
    };

    // Keep chart points strictly within windowSeconds
    const cutoff = now - windowSeconds * 1000;
    const newPoint: ChartPoint = {
      time: timeStr,
      timestamp: now,
      ping: status === 'success' ? rtt : pingStats.median,
      jitter
    };

    const newChartData = [...state.chartData, newPoint].filter((p) => p.timestamp >= cutoff);

    set({
      metrics: newMetrics,
      chartData: newChartData,
      recentRtts: newRecentRtts,
      slidingSamples: newSliding
    });
  },

  resetMetrics: () => {
    set({
      metrics: initialMetrics,
      chartData: [],
      recentRtts: [],
      slidingSamples: []
    });
  }
}));
