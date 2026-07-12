/**
 * Rozet kazanım kontrol motoru.
 * Quiz sonrasında veya state değişiminde çağrılır;
 * koşulları sağlanan ama henüz kazanılmamış rozetlerin id listesini döner.
 */

import { ALL_BADGES } from '@/data/badges';
import type { Badge, BadgeCondition } from '@/types';

export interface AchievementContext {
  /** Toplam doğru cevap sayısı (tüm zamanlar). */
  totalCorrect: number;
  /** Hatasız tamamlanmış quiz sayısı. */
  perfectQuizCount: number;
  /** Mevcut seviye numarası. */
  currentLevel: number;
  /** Üst üste oynanan gün sayısı. */
  streakDays: number;
  /** Kıta bazlı doğru sayıları. */
  correctByContinent: Record<string, number>;
  /** Mod bazlı oynanmış quiz sayısı. */
  playedByMode: Record<string, number>;
  /** Hız turu en yüksek skor. */
  bestSpeedRoundScore: number;
  /** Mükemmel harita pin sayısı. */
  mapPinPerfectCount: number;
  /** Komşu zinciri tamamlama sayısı. */
  neighborChainCompleted: number;
  /** Toplam doğru bayrak sayısı. */
  flagsCorrect: number;
  /** Günlük challenge streak'i. */
  dailyChallengeStreak: number;
  /** Halihazırda kazanılmış rozet ID'leri. */
  earnedBadgeIds: ReadonlySet<string>;
}

const meets = (cond: BadgeCondition, ctx: AchievementContext): boolean => {
  switch (cond.type) {
    case 'total_correct':
      return ctx.totalCorrect >= cond.count;
    case 'perfect_quiz':
      return ctx.perfectQuizCount >= cond.count;
    case 'level_reached':
      return ctx.currentLevel >= cond.level;
    case 'streak_days':
      return ctx.streakDays >= cond.days;
    case 'continent_mastery':
      return (ctx.correctByContinent[cond.continent] ?? 0) >= cond.minCorrect;
    case 'mode_played':
      return (ctx.playedByMode[cond.mode] ?? 0) >= cond.count;
    case 'speed_round_score':
      return ctx.bestSpeedRoundScore >= cond.minScore;
    case 'map_pin_perfect':
      return ctx.mapPinPerfectCount >= cond.count;
    case 'neighbor_chain_complete':
      return ctx.neighborChainCompleted >= cond.count;
    case 'flags_correct':
      return ctx.flagsCorrect >= cond.count;
    case 'daily_challenge_streak':
      return ctx.dailyChallengeStreak >= cond.days;
    case 'all_countries_correct':
      // Faz 8'de basit kapsama: tüm ülkelerde en az 1 doğru — context'te yok, false döner.
      return false;
    default:
      return false;
  }
};

/**
 * Yeni kazanılan rozetlerin (henüz earnedBadgeIds'te olmayanların) listesini döner.
 */
export const evaluateAchievements = (ctx: AchievementContext): Badge[] =>
  ALL_BADGES.filter((b) => !ctx.earnedBadgeIds.has(b.id) && meets(b.condition, ctx));
