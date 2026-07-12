/**
 * SQL sorguları.
 * Hazır SQL string'leri ve sonuç tipleri ile typed wrapper'lar.
 */

import type { SQLiteDatabase } from 'expo-sqlite';

import type { ThemeMode } from '@/constants/theme';
import type { Locale } from '@/types';

export interface UserProfileRow {
  id: number;
  display_name: string;
  total_xp: number;
  current_level: number;
  streak_days: number;
  last_play_date: string | null;
  total_quizzes: number;
  total_correct: number;
  total_wrong: number;
  preferred_language: Locale;
  theme: ThemeMode;
  sound_enabled: 0 | 1;
  haptics_enabled: 0 | 1;
  is_premium: 0 | 1;
  created_at: string;
  updated_at: string;
}

export const fetchUserProfile = async (db: SQLiteDatabase): Promise<UserProfileRow | null> => {
  const row = await db.getFirstAsync<UserProfileRow>(
    'SELECT * FROM user_profile WHERE id = 1',
  );
  return row ?? null;
};

export const updateUserProfile = async (
  db: SQLiteDatabase,
  patch: Partial<Omit<UserProfileRow, 'id' | 'created_at' | 'updated_at'>>,
): Promise<void> => {
  const keys = Object.keys(patch);
  if (keys.length === 0) return;
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => patch[k as keyof typeof patch] as string | number | null);
  await db.runAsync(
    `UPDATE user_profile SET ${setClause}, updated_at = datetime('now') WHERE id = 1`,
    values,
  );
};

export interface QuizHistoryInsert {
  mode: string;
  category: string | null;
  continent: string | null;
  difficulty: string;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  accuracy: number;
  total_time_ms: number;
  xp_earned: number;
  best_streak: number;
}

export const insertQuizHistory = async (
  db: SQLiteDatabase,
  row: QuizHistoryInsert,
): Promise<void> => {
  await db.runAsync(
    `INSERT INTO quiz_history (
      mode, category, continent, difficulty, total_questions, correct_answers,
      wrong_answers, accuracy, total_time_ms, xp_earned, best_streak
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.mode,
      row.category,
      row.continent,
      row.difficulty,
      row.total_questions,
      row.correct_answers,
      row.wrong_answers,
      row.accuracy,
      row.total_time_ms,
      row.xp_earned,
      row.best_streak,
    ],
  );
};

export interface CountryProgressRow {
  country_id: string;
  times_asked: number;
  times_correct: number;
  last_asked: string | null;
  mastered: 0 | 1;
}

export const upsertCountryProgress = async (
  db: SQLiteDatabase,
  countryId: string,
  correct: boolean,
): Promise<void> => {
  await db.runAsync(
    `INSERT INTO country_progress (country_id, times_asked, times_correct, last_asked)
     VALUES (?, 1, ?, datetime('now'))
     ON CONFLICT(country_id) DO UPDATE SET
       times_asked = times_asked + 1,
       times_correct = times_correct + ?,
       last_asked = datetime('now')`,
    [countryId, correct ? 1 : 0, correct ? 1 : 0],
  );
};

export const fetchEarnedBadgeIds = async (db: SQLiteDatabase): Promise<string[]> => {
  const rows = await db.getAllAsync<{ badge_id: string }>(
    'SELECT badge_id FROM earned_badges',
  );
  return rows.map((r) => r.badge_id);
};

export const grantBadge = async (db: SQLiteDatabase, badgeId: string): Promise<void> => {
  await db.runAsync(
    `INSERT INTO earned_badges (badge_id) VALUES (?) ON CONFLICT(badge_id) DO NOTHING`,
    [badgeId],
  );
};
