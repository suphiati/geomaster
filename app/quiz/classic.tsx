/**
 * Klasik Quiz oyun ekranı.
 *
 * Akış:
 *   1) Mount'ta soru üret (sabit konfigürasyon: karışık kategori, easy, 10 soru, 3 can).
 *   2) Soru göster → kullanıcı şık seçer → Cevapla butonuna basar.
 *   3) Doğru/yanlış geri bildirimi (haptics + visual) ve açıklama kartı göster.
 *   4) "Devam" → bir sonraki soru veya can biterse / soru biterse sonuç ekranı.
 *   5) Sonuç ekranı: skor + XP + istatistik + "Tekrar Dene" / "Çık".
 */

import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { ExplanationCard } from '@/components/quiz/ExplanationCard';
import { OptionButton, type OptionState } from '@/components/quiz/OptionButton';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { ScoreHeader } from '@/components/quiz/ScoreHeader';
import { SPACING } from '@/constants/theme';
import { evaluateAchievements } from '@/engine/achievementEngine';
import { generateQuestions } from '@/engine/questionGenerator';
import { buildQuizResult, xpForCorrectAnswer } from '@/engine/scoringEngine';
import { getLevelForXP } from '@/data/levels';
import { useGameStore } from '@/stores/useGameStore';
import { useProgressStore } from '@/stores/useProgressStore';
import { useReviewStore, type ReviewItem } from '@/stores/useReviewStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { QuizResult } from '@/types';

const QUIZ_CONFIG = {
  questionCount: 10 as const,
  startingLives: 3,
  difficulty: 'easy' as const,
};

interface ClassicQuizState {
  index: number;
  selectedId: string | null;
  revealed: boolean;
  livesRemaining: number;
  streak: number;
  bestStreak: number;
  correctCount: number;
  perAnswerXP: number;
  questionStartedAt: number;
  totalElapsed: number;
  finished: boolean;
  review: ReviewItem[];
}

const INITIAL_STATE: ClassicQuizState = {
  index: 0,
  selectedId: null,
  revealed: false,
  livesRemaining: QUIZ_CONFIG.startingLives,
  streak: 0,
  bestStreak: 0,
  correctCount: 0,
  perAnswerXP: 0,
  questionStartedAt: 0,
  totalElapsed: 0,
  finished: false,
  review: [],
};

export default function ClassicQuizScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);

  const { addXP, recordQuizResult, registerPlayDay, earnBadge } = useGameStore.getState();
  const recordCountryAnswer = useProgressStore((s) => s.recordAnswer);

  const questions = useMemo(
    () =>
      generateQuestions({
        category: 'mixed',
        difficulty: QUIZ_CONFIG.difficulty,
        count: QUIZ_CONFIG.questionCount,
      }),
    [],
  );

  const [state, setState] = useState<ClassicQuizState>(() => ({
    ...INITIAL_STATE,
    questionStartedAt: Date.now(),
  }));

  const currentQuestion = questions[state.index];

  // finished bayrağı yükselince yan etkisi olarak sonuç ekranına yönlendir.
  useEffect(() => {
    if (!state.finished) return;
    const correctCount = state.correctCount;
    const wrongCount = questions.length - correctCount;

    // 1) XP & istatistik kaydı.
    const totalXPDelta = state.perAnswerXP;
    addXP(totalXPDelta);
    recordQuizResult(correctCount, wrongCount);
    const todayIso = new Date().toISOString().slice(0, 10);
    registerPlayDay(todayIso);

    // 2) Quiz sonrası store'un güncel durumunu oku ve rozetleri değerlendir.
    const snapshot = useGameStore.getState();
    const isPerfect = correctCount === questions.length && questions.length > 0;
    const newBadges = evaluateAchievements({
      totalCorrect: snapshot.totalCorrect,
      perfectQuizCount: isPerfect ? 1 : 0,
      currentLevel: getLevelForXP(snapshot.totalXP).level,
      streakDays: snapshot.streakDays,
      correctByContinent: {},
      playedByMode: { classic: snapshot.totalQuizzes },
      bestSpeedRoundScore: 0,
      mapPinPerfectCount: 0,
      neighborChainCompleted: 0,
      flagsCorrect: 0,
      dailyChallengeStreak: 0,
      earnedBadgeIds: new Set(snapshot.earnedBadgeIds),
    });
    for (const badge of newBadges) {
      earnBadge(badge.id);
      addXP(badge.xpReward);
    }
    const bonusFromBadges = newBadges.reduce((sum, b) => sum + b.xpReward, 0);

    // 3) Result params üret ve sonuç sayfasına yönlendir.
    const result = buildQuizResult({
      mode: 'classic',
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      totalTimeMs: state.totalElapsed,
      bestStreak: state.bestStreak,
      perAnswerXP: state.perAnswerXP + bonusFromBadges,
      newBadges: newBadges.map((b) => b.id),
    });
    useReviewStore.getState().setReview(state.review);
    router.replace({ pathname: '/quiz/result', params: encodeResult(result) });
  }, [
    state.finished,
    state.correctCount,
    state.totalElapsed,
    state.bestStreak,
    state.perAnswerXP,
    state.review,
    questions.length,
    addXP,
    recordQuizResult,
    registerPlayDay,
    earnBadge,
    router,
  ]);

  // İlk render'da soru başlangıç zamanını işaretle.
  useEffect(() => {
    if (questions.length > 0) {
      setState((s) => (s.questionStartedAt === 0 ? { ...s, questionStartedAt: Date.now() } : s));
    }
  }, [questions.length]);

  if (questions.length === 0) {
    return (
      <ScreenContainer>
        <Stack.Screen options={{ title: t('quiz.modes.classic') }} />
        <EmptyState
          icon="alert-circle-outline"
          title={t('quiz.noQuestions')}
          description={t('quiz.noQuestionsDesc')}
        />
        <Button
          label={t('common.back')}
          variant="secondary"
          onPress={() => router.back()}
          style={{ marginHorizontal: SPACING.lg }}
        />
      </ScreenContainer>
    );
  }

  if (!currentQuestion) {
    // Sorular bittiyse finished bayrağını yükselt; useEffect yönlendirmeyi yapacak.
    if (!state.finished) setState((s) => ({ ...s, finished: true }));
    return null;
  }

  const handleSelect = (optionId: string) => {
    if (state.revealed) return;
    setState((s) => ({ ...s, selectedId: optionId }));
  };

  const handleSubmit = () => {
    if (!state.selectedId || state.revealed) return;
    const isCorrect = state.selectedId === currentQuestion.correctOptionId;
    const elapsed = Date.now() - state.questionStartedAt;

    if (hapticsEnabled) {
      Haptics.notificationAsync(
        isCorrect ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
      ).catch(() => undefined);
    }

    const todayIso = new Date().toISOString().slice(0, 10);
    recordCountryAnswer(currentQuestion.relatedCountryId, isCorrect, todayIso);

    const correctOpt = currentQuestion.options.find((o) => o.id === currentQuestion.correctOptionId);
    const selectedOpt = currentQuestion.options.find((o) => o.id === state.selectedId);
    const reviewItem: ReviewItem = {
      questionText: currentQuestion.questionText,
      correctText: correctOpt?.text ?? '',
      selectedText: selectedOpt?.text ?? null,
      isCorrect,
    };

    setState((s) => {
      const newStreak = isCorrect ? s.streak + 1 : 0;
      const xp = isCorrect ? xpForCorrectAnswer(newStreak) : 0;
      return {
        ...s,
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
    const livesLeft = state.livesRemaining;
    const isLastQuestion = state.index >= questions.length - 1;

    if (livesLeft <= 0 || isLastQuestion) {
      setState((s) => ({ ...s, finished: true }));
      return;
    }

    setState((s) => ({
      ...s,
      index: s.index + 1,
      selectedId: null,
      revealed: false,
      questionStartedAt: Date.now(),
    }));
  };

  const optionStateFor = (optionId: string): OptionState => {
    if (!state.revealed) {
      return state.selectedId === optionId ? 'selected' : 'default';
    }
    if (optionId === currentQuestion.correctOptionId) return 'correct';
    if (state.selectedId === optionId) return 'wrong';
    return 'disabled';
  };

  const isCorrect = state.revealed && state.selectedId === currentQuestion.correctOptionId;

  return (
    <ScreenContainer edgeToEdge>
      <Stack.Screen options={{ title: t('quiz.modes.classic') }} />
      <ScoreHeader
        questionIndex={state.index}
        totalQuestions={questions.length}
        livesRemaining={state.livesRemaining}
        maxLives={QUIZ_CONFIG.startingLives}
        streak={state.streak}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <QuestionCard question={currentQuestion} />

        <View style={styles.options}>
          {currentQuestion.options.map((opt, i) => (
            <OptionButton
              key={opt.id}
              label={opt.text}
              index={i}
              state={optionStateFor(opt.id)}
              onPress={() => handleSelect(opt.id)}
              style={i === 0 ? undefined : { marginTop: SPACING.sm }}
            />
          ))}
        </View>

        {state.revealed ? (
          <ExplanationCard
            isCorrect={isCorrect}
            explanation={currentQuestion.explanation}
            onContinue={handleContinue}
            ctaLabel={
              state.livesRemaining <= 0 || state.index >= questions.length - 1
                ? t('quiz.showResult')
                : t('common.continue')
            }
          />
        ) : (
          <Button
            label={t('quiz.answer')}
            variant="primary"
            onPress={handleSubmit}
            disabled={!state.selectedId}
            fullWidth
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

/**
 * QuizResult'ı navigation paramları olarak güvenle aktarmak için string'leştir.
 * params yalnızca primitif değerleri kabul ettiğinden newBadges JSON'a çevrilir.
 */
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
  options: {
    marginTop: SPACING.sm,
  },
});
