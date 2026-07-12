/**
 * Ülke bazlı ilerleme — her ülke için kaç kez sorulduğu, kaç doğru cevap verildiği.
 * "Mastery" hesaplaması bu store üzerinden yapılır: 5+ sorulup %80+ doğru → mastered.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface CountryStat {
  timesAsked: number;
  timesCorrect: number;
  /** ISO tarih. */
  lastAsked: string | null;
  mastered: boolean;
}

interface ProgressState {
  /** countryId → istatistikler. */
  byCountry: Record<string, CountryStat>;
}

interface ProgressActions {
  recordAnswer: (countryId: string, correct: boolean, todayIso: string) => void;
  reset: () => void;
}

const MASTERY_MIN_ASKED = 5;
const MASTERY_MIN_RATIO = 0.8;

const INITIAL_STATE: ProgressState = {
  byCountry: {},
};

const computeMastery = (asked: number, correct: number): boolean =>
  asked >= MASTERY_MIN_ASKED && correct / asked >= MASTERY_MIN_RATIO;

export const useProgressStore = create<ProgressState & ProgressActions>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,
      recordAnswer: (countryId, correct, todayIso) => {
        const prev = get().byCountry[countryId] ?? {
          timesAsked: 0,
          timesCorrect: 0,
          lastAsked: null,
          mastered: false,
        };
        const timesAsked = prev.timesAsked + 1;
        const timesCorrect = prev.timesCorrect + (correct ? 1 : 0);
        const next: CountryStat = {
          timesAsked,
          timesCorrect,
          lastAsked: todayIso,
          mastered: computeMastery(timesAsked, timesCorrect),
        };
        set({ byCountry: { ...get().byCountry, [countryId]: next } });
      },
      reset: () => set(INITIAL_STATE),
    }),
    {
      name: 'geomaster-progress',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);
