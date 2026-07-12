/**
 * Skor ve XP hesaplama motoru.
 *
 * - Doğru cevap base XP: 10
 * - Streak çarpanları: 3+ → x1.5, 5+ → x2.0, 10+ → x3.0
 * - Hatasız quiz bonusu: +100 XP
 * - Quiz tamamlama bonusu: +50 XP (3+ doğru)
 *
 * Süreden bağımsız puanlama (hız modu hariç scoringEngine kullanılmaz).
 */

import type { QuizResult } from '@/types';

export const XP_REWARDS = {
  correctAnswer: 10,
  quizComplete: 50,
  perfectScore: 100,
  dailyChallenge: 30,
  dailyStreak: 20,
  badgeEarned: 50,
  mapPinPerfect: 15,
  speedRoundPerPoint: 5,
} as const;

export const STREAK_MULTIPLIERS: ReadonlyArray<{ threshold: number; multiplier: number }> = [
  { threshold: 10, multiplier: 3 },
  { threshold: 5, multiplier: 2 },
  { threshold: 3, multiplier: 1.5 },
];

/**
 * Verilen streak değerine uyan en yüksek çarpanı döner.
 */
export const getStreakMultiplier = (streak: number): number => {
  for (const { threshold, multiplier } of STREAK_MULTIPLIERS) {
    if (streak >= threshold) return multiplier;
  }
  return 1;
};

/**
 * Tek bir doğru cevap için kazanılacak XP'yi hesaplar.
 * @param streak Bu cevaptan SONRAKİ streak değeri.
 */
export const xpForCorrectAnswer = (streak: number): number =>
  Math.round(XP_REWARDS.correctAnswer * getStreakMultiplier(streak));

interface QuizSummaryInput {
  totalQuestions: number;
  correctAnswers: number;
  bestStreak: number;
}

/**
 * Quiz oturumunun toplam XP çıktısını verir.
 * Bireysel cevap XP'leri çağıran tarafından zaten verildiği varsayılır;
 * bu fonksiyon bonus XP'leri hesaplar.
 */
export const computeQuizBonusXP = ({
  totalQuestions,
  correctAnswers,
}: QuizSummaryInput): { completionBonus: number; perfectBonus: number; total: number } => {
  const completionBonus = correctAnswers >= 3 ? XP_REWARDS.quizComplete : 0;
  const perfectBonus =
    totalQuestions > 0 && correctAnswers === totalQuestions ? XP_REWARDS.perfectScore : 0;
  return {
    completionBonus,
    perfectBonus,
    total: completionBonus + perfectBonus,
  };
};

/**
 * QuizResult nesnesi için doğruluk yüzdesini (0-1) hesaplar.
 */
export const computeAccuracy = (correct: number, total: number): number =>
  total === 0 ? 0 : correct / total;

/**
 * QuizResult formatına dönüştürülmüş bir özet üretir.
 */
export const buildQuizResult = (input: {
  mode: QuizResult['mode'];
  totalQuestions: number;
  correctAnswers: number;
  totalTimeMs: number;
  bestStreak: number;
  perAnswerXP: number;
  newBadges: string[];
}): QuizResult => {
  const { totalQuestions, correctAnswers, totalTimeMs, bestStreak } = input;
  const wrong = totalQuestions - correctAnswers;
  const accuracy = computeAccuracy(correctAnswers, totalQuestions);
  const bonus = computeQuizBonusXP({ totalQuestions, correctAnswers, bestStreak });
  const xpEarned = input.perAnswerXP + bonus.total;

  return {
    mode: input.mode,
    totalQuestions,
    correctAnswers,
    wrongAnswers: wrong,
    accuracy,
    totalTime: totalTimeMs,
    avgTimePerQuestion: totalQuestions === 0 ? 0 : totalTimeMs / totalQuestions,
    xpEarned,
    streakBonus: bonus.completionBonus + bonus.perfectBonus,
    bestStreak,
    newBadges: input.newBadges,
    date: new Date().toISOString(),
  };
};
