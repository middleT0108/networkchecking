/**
 * Calculates network jitter as the mean absolute deviation of consecutive RTT samples.
 * Formula: Jitter = (1 / (N - 1)) * SUM(|RTT[i] - RTT[i-1]|)
 *
 * @param rttSamples Array of sequential RTT samples (at least 2 samples needed)
 * @returns Jitter in milliseconds, rounded to 1 decimal place
 */
export function calculateJitter(rttSamples: number[]): number {
  if (rttSamples.length < 2) {
    return 0;
  }

  let totalDiff = 0;
  for (let i = 1; i < rttSamples.length; i++) {
    totalDiff += Math.abs(rttSamples[i] - rttSamples[i - 1]);
  }

  const jitter = totalDiff / (rttSamples.length - 1);
  return Math.round(jitter * 10) / 10;
}

/**
 * Calculates RFC 3550 exponential moving average jitter.
 * Formula: J(i) = J(i-1) + (|D(i-1, i)| - J(i-1)) / 16
 *
 * @param previousJitter Previous smoothed jitter value
 * @param rttDiff Absolute difference between current RTT and previous RTT
 * @returns Updated smoothed jitter
 */
export function calculateRfc3550Jitter(previousJitter: number, rttDiff: number): number {
  const updated = previousJitter + (rttDiff - previousJitter) / 16;
  return Math.round(updated * 10) / 10;
}
