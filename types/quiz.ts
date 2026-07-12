/**
 * Quiz motoru tip tanımları.
 * Soru kategorileri, modlar, oturum yapılandırması ve sonuç şemaları.
 */

import type { Continent, Difficulty } from './country';

export type QuestionCategory =
  | 'capital'
  | 'flag'
  | 'flag_reverse'
  | 'continent'
  | 'neighbor'
  | 'currency'
  | 'population_compare'
  | 'area_compare'
  | 'language'
  | 'landmark'
  | 'calling_code'
  | 'tld'
  | 'silhouette'
  | 'map_location'
  | 'driving_side'
  | 'independence'
  | 'government'
  | 'membership'
  | 'coastline'
  | 'highest_point'
  | 'fun_fact'
  | 'city'
  | 'comparison';

export type QuizMode =
  | 'classic'
  | 'flag_match'
  | 'map_pin'
  | 'silhouette'
  | 'neighbor_chain'
  | 'speed_round'
  | 'true_false'
  | 'daily_challenge';

export interface QuestionMedia {
  type: 'flag_emoji' | 'flag_svg' | 'silhouette' | 'map_coordinates';
  value: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  emoji?: string;
}

export interface Question {
  id: string;
  category: QuestionCategory;
  difficulty: Difficulty;
  questionText: string;
  media?: QuestionMedia;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  relatedCountryId: string;
}

export interface QuizConfig {
  mode: QuizMode;
  category: QuestionCategory | 'mixed';
  continent?: Continent;
  difficulty: Difficulty;
  questionCount: 10 | 20 | 50;
  timePerQuestion?: number;
  lives?: number;
}

export interface QuizResult {
  mode: QuizMode;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  /** 0-1 arası oran. */
  accuracy: number;
  /** Toplam oynama süresi (ms). */
  totalTime: number;
  /** Ortalama soru başına süre (ms). */
  avgTimePerQuestion: number;
  xpEarned: number;
  streakBonus: number;
  bestStreak: number;
  newBadges: string[];
  /** ISO tarih. */
  date: string;
}
