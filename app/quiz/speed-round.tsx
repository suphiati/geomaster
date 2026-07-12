/**
 * Hız Turu: 60 saniye, kolay sorular, doğru +1 / yanlış -2 saniye.
 * Soru havuzu klasik üreticiden gelir; mod farkı: süre baskın.
 */

import * as Haptics from 'expo-haptics';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { OptionButton, type OptionState } from '@/components/quiz/OptionButton';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { Timer } from '@/components/quiz/Timer';
import { SPACING } from '@/constants/theme';
import { generateQuestions } from '@/engine/questionGenerator';
import { buildQuizResult } from '@/engine/scoringEngine';
import { useGameStore } from '@/stores/useGameStore';
import { useProgressStore } from '@/stores/useProgressStore';
import { useReviewStore, type ReviewItem } from '@/stores/useReviewStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { QuizResult } from '@/types';

const TOTAL_SECONDS = 60;
const WRONG_PENALTY_SEC = 2;
const XP_PER_CORRECT = 5;

interface State {
  index: number;
  remaining: number;
  correctCount: number;
  streak: number;
  bestStreak: number;
  finished: boolean;
  review: ReviewItem[];
}

export default function SpeedRoundScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);

  const questions = useMemo(
    () => generateQuestions({ category: 'mixed', difficulty: 'easy', count: 200 }),
    [],
  );

  const [state, setState] = useState<State>({
    index: 0,
    remaining: TOTAL_SECONDS,
    correctCount: 0,
    streak: 0,
    bestStreak: 0,
    finished: false,
    review: [],
  });

  const startedAtRef = useRef<number>(Date.now());

  const { addXP, recordQuizResult, registerPlayDay } = useGameStore.getState();
  const recordCountryAnswer = useProgressStore((s) => s.recordAnswer);

  // Saniyede bir geri sayım.
  useEffect(() => {
    if (state.finished) return;
    const id = setInterval(() => {
      setState((s) => {
        if (s.finished) return s;
        if (s.remaining <= 1) return { ...s, remaining: 0, finished: true };
        return { ...s, remaining: s.remaining - 1 };
      });
    }, 1_000);
    return () => clearInterval(id);
  }, [state.finished]);

  // Bittiğinde sonuç ekranına yönlendir.
  useEffect(() => {
    if (!state.finished) return;
    const xp = state.correctCount * XP_PER_CORRECT;
    addXP(xp);
    recordQuizResult(state.correctCount, 0);
    registerPlayDay(new Date().toISOString().slice(0, 10));
    useReviewStore.getState().setReview(state.review);
    const result: QuizResult = buildQuizResult({
      mode: 'speed_round',
      totalQuestions: state.correctCount,
      correctAnswers: state.correctCount,
      totalTimeMs: (Date.now() - startedAtRef.current),
      bestStreak: state.bestStreak,
      perAnswerXP: xp,
      newBadges: [],
    });
    router.replace({ pathname: '/quiz/result', params: encodeResult(result) });
  }, [state.finished, state.correctCount, state.bestStreak, state.review, addXP, recordQuizResult, registerPlayDay, router]);

  const current = questions[state.index];
  if (!current) return null;

  const handleSelect = (optionId: string) => {
    const isCorrect = optionId === current.correctOptionId;

    if (hapticsEnabled) {
      Haptics.impactAsync(
        isCorrect ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Heavy,
      ).catch(() => undefined);
    }

    recordCountryAnswer(
      current.relatedCountryId,
      isCorrect,
      new Date().toISOString().slice(0, 10),
    );

    const correctOpt = current.options.find((o) => o.id === current.correctOptionId);
    const selectedOpt = current.options.find((o) => o.id === optionId);
    const reviewItem: ReviewItem = {
      questionText: current.questionText,
      correctText: correctOpt?.text ?? '',
      selectedText: selectedOpt?.text ?? null,
      isCorrect,
    };

    setState((s) => {
      const newRemaining = isCorrect ? s.remaining : Math.max(0, s.remaining - WRONG_PENALTY_SEC);
      const finished = newRemaining <= 0;
      const newStreak = isCorrect ? s.streak + 1 : 0;
      return {
        ...s,
        index: s.index + 1,
        correctCount: s.correctCount + (isCorrect ? 1 : 0),
        streak: newStreak,
        bestStreak: Math.max(s.bestStreak, newStreak),
        remaining: newRemaining,
        finished,
        review: [...s.review, reviewItem],
      };
    });
  };

  return (
    <ScreenContainer edgeToEdge>
      <Stack.Screen options={{ title: t('quiz.modes.speed_round') }} />
      <Timer remaining={state.remaining} total={TOTAL_SECONDS} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <QuestionCard question={current} />
        <View style={styles.options}>
          {current.options.map((opt, i) => (
            <OptionButton
              key={opt.id}
              label={opt.text}
              index={i}
              state={'default' as OptionState}
              onPress={() => handleSelect(opt.id)}
              style={i === 0 ? undefined : { marginTop: SPACING.sm }}
            />
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const encodeResult = (r: QuizResult): Record<string, string> => ({
  mode: r.mode,
  total: String(r.totalQuestions),
  correct: String(r.correctAnswers),
  wrong: String(r.wrongAnswers),
  accuracy: r.accuracy.toFixed(4),
  totalTime: String(r.totalTime),
  xp: String(r.xpEarned),
  streakBonus: String(r.streakBonus),
  bestStreak: String(r.bestStreak),
  newBadges: JSON.stringify(r.newBadges),
});

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  options: { marginTop: SPACING.sm },
});
