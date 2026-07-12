/**
 * Genel oyun durumu: toplam XP, mevcut seviye, streak günleri, kazanılan rozetler.
 * Persist edilir, ancak SQLite ile de senkron tutulur — store kullanıcı arayüzüne
 * hızlı reactive erişim sağlar; SQLite uzun vadeli kayıt için.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface GameState {
  totalXP: number;
  currentLevel: number;
  streakDays: number;
  /** ISO tarih (YYYY-MM-DD); null ise hiç oynanmamış. */
  lastPlayDate: string | null;
  earnedBadgeIds: string[];
  totalQuizzes: number;
  totalCorrect: number;
  totalWrong: number;
}

interface GameActions {
  addXP: (amount: number) => void;
  setLevel: (level: number) => void;
  registerPlayDay: (todayIso: string) => void;
  earnBadge: (badgeId: string) => void;
  recordQuizResult: (correct: number, wrong: number) => void;
  reset: () => void;
}

const INITIAL_STATE: GameState = {
  totalXP: 0,
  currentLevel: 1,
  streakDays: 0,
  lastPlayDate: null,
  earnedBadgeIds: [],
  totalQuizzes: 0,
  totalCorrect: 0,
  totalWrong: 0,
};

/** İki ISO tarih (YYYY-MM-DD) arasındaki gün farkını döner. */
const daysBetween = (a: string, b: string): number => {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / 86_400_000);
};

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,
      addXP: (amount) => set({ totalXP: get().totalXP + amount }),
      setLevel: (currentLevel) => set({ currentLevel }),
      registerPlayDay: (todayIso) => {
        const last = get().lastPlayDate;
        if (last === todayIso) return;
        const delta = last ? daysBetween(last, todayIso) : null;
        const nextStreak = delta === 1 ? get().streakDays + 1 : 1;
        set({ lastPlayDate: todayIso, streakDays: nextStreak });
      },
      earnBadge: (badgeId) => {
        const set_ = new Set(get().earnedBadgeIds);
        if (set_.has(badgeId)) return;
        set_.add(badgeId);
        set({ earnedBadgeIds: Array.from(set_) });
      },
      recordQuizResult: (correct, wrong) =>
        set({
          totalQuizzes: get().totalQuizzes + 1,
          totalCorrect: get().totalCorrect + correct,
          totalWrong: get().totalWrong + wrong,
        }),
      reset: () => set(INITIAL_STATE),
    }),
    {
      name: 'geomaster-game',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);
