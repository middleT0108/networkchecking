import { PingStats } from '../types/metrics';

/**
 * Calculates the median of an array of numbers.
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 10) / 10;
  }
  return Math.round(sorted[mid] * 10) / 10;
}

/**
 * Calculates a specific percentile (0-100) of an array of numbers.
 */
export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (lower === upper) return sorted[lower];
  const interpolated = sorted[lower] * (1 - weight) + sorted[upper] * weight;
  return Math.round(interpolated * 10) / 10;
}

/**
 * Computes min, max, median, average, and p95 from an array of valid RTT samples.
 */
export function calculatePingStats(rttSamples: number[], currentSample?: number): PingStats {
  if (rttSamples.length === 0) {
    const cur = currentSample ?? 0;
    return {
      current: cur,
      min: cur,
      max: cur,
      median: cur,
      average: cur,
      p95: cur
    };
  }

  const current = currentSample !== undefined ? currentSample : rttSamples[rttSamples.length - 1];
  const min = Math.min(...rttSamples);
  const max = Math.max(...rttSamples);
  const sum = rttSamples.reduce((acc, val) => acc + val, 0);
  const average = Math.round((sum / rttSamples.length) * 10) / 10;
  const median = calculateMedian(rttSamples);
  const p95 = calculatePercentile(rttSamples, 95);

  return {
    current: Math.round(current * 10) / 10,
    min: Math.round(min * 10) / 10,
    max: Math.round(max * 10) / 10,
    median,
    average,
    p95
  };
}
