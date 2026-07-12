/**
 * Doğru/Yanlış modu — bilgi cümlesi gösterilir, kullanıcı doğru/yanlış seçer.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { ExplanationCard } from '@/components/quiz/ExplanationCard';
import { ScoreHeader } from '@/components/quiz/ScoreHeader';
import { BORDER_RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { generateTrueFalseStatements } from '@/engine/trueFalseGenerator';
import { buildQuizResult, xpForCorrectAnswer } from '@/engine/scoringEngine';
import { useGameStore } from '@/stores/useGameStore';
import { useProgressStore } from '@/stores/useProgressStore';
import { useReviewStore, type ReviewItem } from '@/stores/useReviewStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTheme } from '@/hooks/useTheme';
import type { QuizResult } from '@/types';

const TOTAL_QUESTIONS = 20;
const STARTING_LIVES = 5;

interface State {
  index: number;
  selected: boolean | null;
  revealed: boolean;
  livesRemaining: number;
  streak: number;
  bestStreak: number;
  correctCount: number;
  perAnswerXP: number;
  startedAt: number;
  totalElapsed: number;
  finished: boolean;
  review: ReviewItem[];
}

const INITIAL: State = {
  index: 0,
  selected: null,
  revealed: false,
  livesRemaining: STARTING_LIVES,
  streak: 0,
  bestStreak: 0,
  correctCount: 0,
  perAnswerXP: 0,
  startedAt: 0,
  totalElapsed: 0,
  finished: false,
  review: [],
};

export default function TrueFalseScreen() {
  const router = useRouter();
  const { palette } = useTheme();
  const { t } = useTranslation();
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);

  const statements = useMemo(() => generateTrueFalseStatements(TOTAL_QUESTIONS, 'easy'), []);
  const [state, setState] = useState<State>(() => ({ ...INITIAL, startedAt: Date.now() }));

  const current = statements[state.index];

  const { addXP, recordQuizResult, registerPlayDay } = useGameStore.getState();
  const recordCountryAnswer = useProgressStore((s) => s.recordAnswer);

  useEffect(() => {
    if (!state.finished) return;
    addXP(state.perAnswerXP);
    recordQuizResult(state.correctCount, statements.length - state.correctCount);
    const today = new Date().toISOString().slice(0, 10);
    registerPlayDay(today);

    const result: QuizResult = buildQuizResult({
      mode: 'true_false',
      totalQuestions: statements.length,
      correctAnswers: state.correctCount,
      totalTimeMs: state.totalElapsed,
      bestStreak: state.bestStreak,
      perAnswerXP: state.perAnswerXP,
      newBadges: [],
    });
    useReviewStore.getState().setReview(state.review);
    router.replace({ pathname: '/quiz/result', params: encodeResult(result) });
  }, [state.finished, state.correctCount, state.perAnswerXP, state.totalElapsed, state.bestStreak, state.review, statements.length, addXP, recordQuizResult, registerPlayDay, router]);

  if (!current) {
    if (!state.finished) setState((s) => ({ ...s, finished: true }));
    return null;
  }

  const handleAnswer = (choice: boolean) => {
    if (state.revealed) return;
    const isCorrect = choice === current.isTrue;
    const elapsed = Date.now() - state.startedAt;

    if (hapticsEnabled) {
      Haptics.notificationAsync(
        isCorrect ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
      ).catch(() => undefined);
    }

    const today = new Date().toISOString().slice(0, 10);
    recordCountryAnswer(current.relatedCountryId, isCorrect, today);

    const reviewItem: ReviewItem = {
      questionText: current.text,
      correctText: current.isTrue ? t('quiz.true') : t('quiz.false'),
      selectedText: choice ? t('quiz.true') : t('quiz.false'),
      isCorrect,
    };

    setState((s) => {
      const newStreak = isCorrect ? s.streak + 1 : 0;
      const xp = isCorrect ? xpForCorrectAnswer(newStreak) : 0;
      return {
        ...s,
        selected: choice,
        revealed: true,
        streak: newStreak,
        bestStreak: Math.max(s.bestStreak, newStreak),
        correctCount: s.correctCount + (isCorrect ? 1 : 0),
        livesRemaining: isCorrect ? s.livesRemaining : s.livesRemaining - 1,
        perAnswerXP: s.perAnswerXP + xp,
        totalElapsed: s.totalElapsed + elapsed,
        review: [...s.review, reviewItem],
      };
    });
  };

  const handleContinue = () => {
    if (state.livesRemaining <= 0 || state.index >= statements.length - 1) {
      setState((s) => ({ ...s, finished: true }));
      return;
    }
    setState((s) => ({ ...s, index: s.index + 1, selected: null, revealed: false, startedAt: Date.now() }));
  };

  const isCorrect = state.revealed && state.selected === current.isTrue;

  return (
    <ScreenContainer edgeToEdge>
      <Stack.Screen options={{ title: t('quiz.modes.true_false') }} />
      <ScoreHeader
        questionIndex={state.index}
        totalQuestions={statements.length}
        livesRemaining={state.livesRemaining}
        maxLives={STARTING_LIVES}
        streak={state.streak}
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card variant="filled" style={styles.card}>
          <Text style={[TYPOGRAPHY.h3, { color: palette.text.primary, lineHeight: 28 }]}>
            {current.text}
          </Text>
        </Card>

        <View style={styles.btnRow}>
          <ChoiceButton
            label={t('quiz.true')}
            icon="check-bold"
            tone={palette.success}
            disabled={state.revealed}
            highlight={state.revealed && current.isTrue ? 'correct' : state.revealed && state.selected === true ? 'wrong' : 'none'}
            onPress={() => handleAnswer(true)}
          />
          <ChoiceButton
            label={t('quiz.false')}
            icon="close-thick"
            tone={palette.error}
            disabled={state.revealed}
            highlight={state.revealed && !current.isTrue ? 'correct' : state.revealed && state.selected === false ? 'wrong' : 'none'}
            onPress={() => handleAnswer(false)}
          />
        </View>

        {state.revealed ? (
          <ExplanationCard
            isCorrect={isCorrect}
            explanation={current.explanation}
            onContinue={handleContinue}
            ctaLabel={state.livesRemaining <= 0 || state.index >= statements.length - 1 ? t('quiz.showResult') : t('common.continue')}
          />
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

interface ChoiceButtonProps {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  tone: string;
  disabled: boolean;
  highlight: 'none' | 'correct' | 'wrong';
  onPress: () => void;
}

const ChoiceButton = ({ label, icon, tone, disabled, highlight, onPress }: ChoiceButtonProps) => {
  const { palette } = useTheme();
  const bg =
    highlight === 'correct' ? palette.success + '33' :
    highlight === 'wrong' ? palette.error + '33' :
    palette.surfaceElevated;
  const border =
    highlight === 'correct' ? palette.success :
    highlight === 'wrong' ? palette.error :
    tone;
  const textColor = highlight === 'none' ? palette.text.primary : border;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.choiceBtn,
        { backgroundColor: bg, borderColor: border, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <MaterialCommunityIcons name={icon} size={32} color={border} />
      <Text style={[TYPOGRAPHY.h3, { color: textColor, marginTop: SPACING.xs }]}>{label}</Text>
    </Pressable>
  );
};

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
  scroll: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.xl, gap: SPACING.md },
  card: { minHeight: 180, justifyContent: 'center' },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', gap: SPACING.md },
  choiceBtn: {
    flex: 1,
    aspectRatio: 1.4,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
