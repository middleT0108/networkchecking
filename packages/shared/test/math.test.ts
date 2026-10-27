import { describe, it, expect } from 'vitest';
import {
  calculateMedian,
  calculatePercentile,
  calculatePingStats,
  calculateJitter,
  calculatePacketLoss,
  calculateQualityScore,
  analyzeNetworkDiagnostics
} from '../src/index';

describe('Math utilities for Gaming Metrics', () => {
  describe('calculateMedian', () => {
    it('should compute median of odd-length list', () => {
      expect(calculateMedian([10, 20, 30])).toBe(20);
      expect(calculateMedian([50, 10, 30])).toBe(30);
    });

    it('should compute median of even-length list', () => {
      expect(calculateMedian([10, 20, 30, 40])).toBe(25);
    });

    it('should handle empty array', () => {
      expect(calculateMedian([])).toBe(0);
    });
  });

  describe('calculatePercentile', () => {
    it('should compute p95 accurately', () => {
      const data = [10, 12, 13, 14, 15, 16, 17, 18, 19, 100];
      const p95 = calculatePercentile(data, 95);
      expect(p95).toBeGreaterThanOrEqual(19);
      expect(p95).toBeLessThanOrEqual(100);
    });
  });

  describe('calculatePingStats', () => {
    it('should compute complete stats object', () => {
      const samples = [20, 25, 22, 28, 24];
      const stats = calculatePingStats(samples);
      expect(stats.min).toBe(20);
      expect(stats.max).toBe(28);
      expect(stats.median).toBe(24);
      expect(stats.average).toBe(23.8);
      expect(stats.current).toBe(24);
    });
  });

  describe('calculateJitter', () => {
    it('should compute consecutive sample absolute differences average', () => {
      // Diffs: |25 - 20| = 5, |22 - 25| = 3, |30 - 22| = 8 -> sum = 16, count = 3 -> jitter = 5.3
      const samples = [20, 25, 22, 30];
      const jitter = calculateJitter(samples);
      expect(jitter).toBe(5.3);
    });

    it('should return 0 when fewer than 2 samples', () => {
      expect(calculateJitter([20])).toBe(0);
      expect(calculateJitter([])).toBe(0);
    });
  });

  describe('calculatePacketLoss', () => {
    it('should compute percentage accurately', () => {
      expect(calculatePacketLoss(100, 2)).toBe(2);
      expect(calculatePacketLoss(50, 5)).toBe(10);
      expect(calculatePacketLoss(0, 0)).toBe(0);
    });
  });

  describe('calculateQualityScore', () => {
    it('should give high score for great gaming ping/jitter/loss', () => {
      const res = calculateQualityScore(18, 1.5, 0, 'fps');
      expect(res.score).toBeGreaterThanOrEqual(95);
      expect(res.rating).toBe('great');
      expect(res.labelVi).toBe('Tuyệt vời');
    });

    it('should heavily penalize packet loss', () => {
      const clean = calculateQualityScore(20, 2, 0, 'fps');
      const withLoss = calculateQualityScore(20, 2, 5, 'fps');
      expect(withLoss.score).toBeLessThanOrEqual(45);
      expect(withLoss.rating).toBe('poor');
      expect(clean.score).toBeGreaterThan(withLoss.score + 40);
    });
  });

  describe('analyzeNetworkDiagnostics', () => {
    it('should detect packet loss and provide solutions', () => {
      const metrics = {
        ping: { current: 30, min: 25, max: 40, median: 28, average: 29, p95: 38 },
        jitter: 2.1,
        packetLoss: 3.5,
        quality: calculateQualityScore(28, 2.1, 3.5, 'fps'),
        sampleCount: 50,
        lossCount: 2,
        windowSize: 50,
        lastUpdated: Date.now()
      };
      const diag = analyzeNetworkDiagnostics(metrics, 'fps');
      const lossItem = diag.find(d => d.id === 'packet-loss');
      expect(lossItem).toBeDefined();
      expect(lossItem?.severity).toBe('critical');
      expect(lossItem?.solutionsVi.length).toBeGreaterThan(0);
    });
  });
});
