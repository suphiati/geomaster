/**
 * Oyunlaştırma tip tanımları: seviye, rozet, başarım koşulları.
 */

import type { Continent } from './country';
import type { QuizMode } from './quiz';

export type Locale = 'tr' | 'en';

export type LocalizedText = Record<Locale, string>;

export interface Level {
  level: number;
  title: LocalizedText;
  /** Bu seviyeye ulaşmak için gereken kümülatif XP. */
  requiredXP: number;
  icon: string;
  frameColor: string;
}

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type BadgeCategory =
  | 'continent'
  | 'streak'
  | 'mastery'
  | 'speed'
  | 'collection'
  | 'special';

export type BadgeCondition =
  | { type: 'continent_mastery'; continent: Continent; minCorrect: number }
  | { type: 'streak_days'; days: number }
  | { type: 'quiz_streak'; count: number }
  | { type: 'total_correct'; count: number }
  | { type: 'perfect_quiz'; count: number }
  | { type: 'speed_round_score'; minScore: number }
  | { type: 'map_pin_perfect'; count: number }
  | { type: 'all_countries_correct'; continent?: Continent }
  | { type: 'daily_challenge_streak'; days: number }
  | { type: 'level_reached'; level: number }
  | { type: 'mode_played'; mode: QuizMode; count: number }
  | { type: 'flags_correct'; count: number }
  | { type: 'neighbor_chain_complete'; count: number };

export interface Badge {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  condition: BadgeCondition;
  xpReward: number;
}

export interface EarnedBadge {
  badgeId: string;
  /** ISO tarih. */
  earnedAt: string;
}
