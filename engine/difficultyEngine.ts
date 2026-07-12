/**
 * Adaptif zorluk motoru.
 * Son N sorunun doğruluk oranına göre zorluğu otomatik ayarlar.
 *
 * - %90+ → bir kademe artır
 * - %50- → bir kademe düşür
 * - Aksi → koru
 */

import type { Difficulty } from '@/types';

const DIFFICULTY_LADDER: readonly Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

const indexOf = (d: Difficulty): number => DIFFICULTY_LADDER.indexOf(d);

/**
 * Son cevaplara göre yeni zorluk önerisi döner.
 * @param current Mevcut zorluk.
 * @param recentAnswers Son N cevap; true=doğru, false=yanlış.
 * @param window Karara dahil edilecek minimum cevap sayısı (default 10).
 */
export const adjustDifficulty = (
  current: Difficulty,
  recentAnswers: readonly boolean[],
  window = 10,
): Difficulty => {
  if (recentAnswers.length < window) return current;
  const slice = recentAnswers.slice(-window);
  const correct = slice.filter(Boolean).length;
  const ratio = correct / slice.length;

  const idx = indexOf(current);
  if (ratio >= 0.9 && idx < DIFFICULTY_LADDER.length - 1) {
    return DIFFICULTY_LADDER[idx + 1] as Difficulty;
  }
  if (ratio <= 0.5 && idx > 0) {
    return DIFFICULTY_LADDER[idx - 1] as Difficulty;
  }
  return current;
};

export { DIFFICULTY_LADDER };
