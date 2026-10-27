import { GameCategory, GameThresholds } from '../types/game';
import { QualityAssessment, QualityRating } from '../types/metrics';

export const DEFAULT_THRESHOLDS: Record<GameCategory, GameThresholds> = {
  fps: {
    greatPing: 30,
    okPing: 60,
    greatJitter: 3,
    okJitter: 7,
    maxLoss: 0
  },
  moba: {
    greatPing: 45,
    okPing: 80,
    greatJitter: 5,
    okJitter: 12,
    maxLoss: 1
  },
  'battle-royale': {
    greatPing: 40,
    okPing: 75,
    greatJitter: 4,
    okJitter: 10,
    maxLoss: 1
  },
  other: {
    greatPing: 50,
    okPing: 90,
    greatJitter: 6,
    okJitter: 15,
    maxLoss: 2
  }
};

/**
 * Calculates a 0-100 gaming connection quality score based on ping, jitter, and packet loss.
 *
 * @param ping Median RTT in ms
 * @param jitter Jitter in ms
 * @param packetLoss Packet loss percentage (0 - 100)
 * @param category Game category ('fps' | 'moba' | 'battle-royale' | 'other')
 * @param customThresholds Optional custom thresholds for this game
 * @returns QualityAssessment with score, rating, localized labels and summary
 */
export function calculateQualityScore(
  ping: number,
  jitter: number,
  packetLoss: number,
  category: GameCategory = 'fps',
  customThresholds?: GameThresholds
): QualityAssessment {
  const thresholds = customThresholds ?? DEFAULT_THRESHOLDS[category] ?? DEFAULT_THRESHOLDS.fps;

  // 1. Ping Score (0 - 50 points)
  let pingScore = 50;
  if (ping <= thresholds.greatPing) {
    pingScore = 50;
  } else if (ping <= thresholds.okPing) {
    const ratio = (ping - thresholds.greatPing) / (thresholds.okPing - thresholds.greatPing);
    pingScore = 50 - ratio * 15; // 50 down to 35
  } else {
    const penalty = Math.min(35, ((ping - thresholds.okPing) / 60) * 35);
    pingScore = Math.max(0, 35 - penalty);
  }

  // 2. Jitter Score (0 - 30 points)
  let jitterScore = 30;
  if (jitter <= thresholds.greatJitter) {
    jitterScore = 30;
  } else if (jitter <= thresholds.okJitter) {
    const ratio = (jitter - thresholds.greatJitter) / (thresholds.okJitter - thresholds.greatJitter);
    jitterScore = 30 - ratio * 12; // 30 down to 18
  } else {
    const penalty = Math.min(18, ((jitter - thresholds.okJitter) / 10) * 18);
    jitterScore = Math.max(0, 18 - penalty);
  }

  // 3. Packet Loss Penalty (0 - 20 points, with severe degradation)
  let lossScore = 20;
  if (packetLoss <= thresholds.maxLoss) {
    lossScore = 20;
  } else {
    // Loss is extremely disruptive in gaming: 1% loss drops 8 points, 3%+ drops to 0
    const excessLoss = packetLoss - thresholds.maxLoss;
    lossScore = Math.max(0, 20 - excessLoss * 8);
  }

  // Raw total score
  let totalScore = Math.round(pingScore + jitterScore + lossScore);

  // Severe packet loss clamp: if loss >= 5%, score cannot exceed 45
  if (packetLoss >= 5) {
    totalScore = Math.min(totalScore, 45);
  } else if (packetLoss >= 2) {
    totalScore = Math.min(totalScore, 65);
  }

  totalScore = Math.max(0, Math.min(100, totalScore));

  // Determine Rating & Labels
  let rating: QualityRating;
  let labelVi: string;
  let labelEn: string;
  let color: string;
  let summary: string;

  if (totalScore >= 85) {
    rating = 'great';
    labelVi = 'Tuyệt vời';
    labelEn = 'Excellent';
    color = '#22C55E'; // green
    summary = 'Đường truyền hoàn hảo cho thi đấu và leo rank, ping thấp, không giật lag.';
  } else if (totalScore >= 70) {
    rating = 'good';
    labelVi = 'Tốt';
    labelEn = 'Good';
    color = '#3B82F6'; // blue
    summary = 'Đường truyền ổn định, chơi mượt mà với hầu hết các trận đấu.';
  } else if (totalScore >= 50) {
    rating = 'fair';
    labelVi = 'Ổn / Chấp nhận được';
    labelEn = 'Fair';
    color = '#F59E0B'; // amber
    summary = 'Có thể xuất hiện delay nhẹ hoặc biến thiên ping trong các pha giao tranh nhanh.';
  } else {
    rating = 'poor';
    labelVi = 'Kém / Lag';
    labelEn = 'Poor';
    color = '#EF4444'; // red
    summary = 'Đường truyền không ổn định, ping cao hoặc mất gói, dễ bị teleport và trễ đạn.';
  }

  return {
    score: totalScore,
    rating,
    labelVi,
    labelEn,
    color,
    summary
  };
}
