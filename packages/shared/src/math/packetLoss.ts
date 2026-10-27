export interface SampleStatusOnly {
  status: 'success' | 'timeout' | 'error';
}

/**
 * Calculates packet loss percentage over a given sample count.
 * Ghi chú: Đây là ước lượng dựa trên tỉ lệ request thất bại hoặc timeout trong cửa sổ đo.
 *
 * @param totalCount Tổng số mẫu
 * @param lostCount Số mẫu bị timeout hoặc lỗi mạng
 * @returns Tỉ lệ mất gói từ 0 đến 100 (%)
 */
export function calculatePacketLoss(totalCount: number, lostCount: number): number {
  if (totalCount <= 0) return 0;
  const ratio = (lostCount / totalCount) * 100;
  return Math.min(100, Math.max(0, Math.round(ratio * 10) / 10));
}

/**
 * Calculates packet loss on a sliding window of sample statuses.
 *
 * @param samples Danh sách các mẫu gần nhất
 * @returns Tỉ lệ mất gói %
 */
export function calculateSlidingWindowLoss(samples: SampleStatusOnly[]): number {
  if (samples.length === 0) return 0;
  const lost = samples.filter(s => s.status === 'timeout' || s.status === 'error').length;
  return calculatePacketLoss(samples.length, lost);
}
