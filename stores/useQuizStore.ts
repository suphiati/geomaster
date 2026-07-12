/**
 * Aktif quiz oturumunun durumu.
 * Persist edilmez — oturum bitince çöpe atılır.
 */

import { create } from 'zustand';

import type { Question, QuizConfig, QuizMode } from '@/types';

interface AnswerRecord {
  questionId: string;
  selectedOptionId: string | null;
  correct: boolean;
  /** Soru üzerinde geçirilen süre (ms). */
  elapsedMs: number;
}

interface QuizState {
  config: QuizConfig | null;
  questions: Question[];
  currentIndex: number;
  answers: AnswerRecord[];
  livesRemaining: number;
  currentStreak: number;
  bestStreak: number;
  startTimestamp: number | null;
  finished: boolean;
}

interface QuizActions {
  startQuiz: (config: QuizConfig, questions: Question[]) => void;
  answer: (selectedOptionId: string | null, elapsedMs: number) => void;
  next: () => void;
  finish: () => void;
  reset: () => void;
}

const INITIAL_STATE: QuizState = {
  config: null,
  questions: [],
  currentIndex: 0,
  answers: [],
  livesRemaining: 3,
  currentStreak: 0,
  bestStreak: 0,
  startTimestamp: null,
  finished: false,
};

export const useQuizStore = create<QuizState & QuizActions>()((set, get) => ({
  ...INITIAL_STATE,
  startQuiz: (config, questions) =>
    set({
      ...INITIAL_STATE,
      config,
      questions,
      livesRemaining: config.lives ?? 3,
      startTimestamp: Date.now(),
    }),
  answer: (selectedOptionId, elapsedMs) => {
    const state = get();
    const question = state.questions[state.currentIndex];
    if (!question) return;
    const correct = selectedOptionId === question.correctOptionId;
    const newStreak = correct ? state.currentStreak + 1 : 0;
    set({
      answers: [...state.answers, { questionId: question.id, selectedOptionId, correct, elapsedMs }],
      currentStreak: newStreak,
      bestStreak: Math.max(state.bestStreak, newStreak),
      livesRemaining: correct ? state.livesRemaining : state.livesRemaining - 1,
    });
  },
  next: () => set({ currentIndex: get().currentIndex + 1 }),
  finish: () => set({ finished: true }),
  reset: () => set(INITIAL_STATE),
}));

/** Türetilmiş selector'lar — hesaplama maliyetini bileşenden çıkarır. */
export const selectActiveQuestion = (s: QuizState): Question | null =>
  s.questions[s.currentIndex] ?? null;

export const selectIsLastQuestion = (s: QuizState): boolean =>
  s.questions.length > 0 && s.currentIndex >= s.questions.length - 1;

export const selectMode = (s: QuizState): QuizMode | null => s.config?.mode ?? null;
