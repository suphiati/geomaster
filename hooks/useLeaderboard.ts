/**
 * SQLite quiz_history tablosundan en yüksek skorları okur.
 * Lokal cihaz liderlik tablosu (online liderlik backend gerektirir, henüz yok).
 */

import { useEffect, useState } from 'react';

import { getDatabase } from '@/db';

export interface LeaderboardEntry {
  id: number;
  mode: string;
  difficulty: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  xpEarned: number;
  bestStreak: number;
  playedAt: string;
}

interface Row {
  id: number;
  mode: string;
  difficulty: string;
  total_questions: number;
  correct_answers: number;
  accuracy: number;
  xp_earned: number;
  best_streak: number;
  played_at: string;
}

const map = (r: Row): LeaderboardEntry => ({
  id: r.id,
  mode: r.mode,
  difficulty: r.difficulty,
  totalQuestions: r.total_questions,
  correctAnswers: r.correct_answers,
  accuracy: r.accuracy,
  xpEarned: r.xp_earned,
  bestStreak: r.best_streak,
  playedAt: r.played_at,
});

/**
 * En yüksek XP'ye göre sıralı son 50 quiz sonucunu döner.
 */
export const useLeaderboard = (limit: number = 50): {
  entries: LeaderboardEntry[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
} => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = async (): Promise<void> => {
    try {
      setLoading(true);
      const db = await getDatabase();
      const rows = await db.getAllAsync<Row>(
        `SELECT * FROM quiz_history ORDER BY xp_earned DESC, played_at DESC LIMIT ?`,
        [limit],
      );
      setEntries(rows.map(map));
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [limit]);

  return { entries, loading, error, refresh: load };
};
