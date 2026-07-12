/**
 * Bayrak Eşleştirme: hızlı tempo. Bir bayrak gösterilir, kullanıcı 2 isimden doğruyu seçer.
 * Combo sistemi: arka arkaya doğruda x2/x3/x5 çarpan.
 */

import * as Haptics from 'expo-haptics';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { ScoreHeader } from '@/components/quiz/ScoreHeader';
import { BORDER_RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { ALL_COUNTRIES } from '@/data/countries';
import { buildQuizResult } from '@/engine/scoringEngine';
import { useGameStore } from '@/stores/useGameStore';
import { useProgressStore } from '@/stores/useProgressStore';
import { useReviewStore, type ReviewItem } from '@/stores/useReviewStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTheme } from '@/hooks/useTheme';
import { localizedName } from '@/utils/localizedName';
import { sample, shuffle } from '@/utils/shuffleUtils';
import type { Country, QuizResult } from '@/types';

const TOTAL_QUESTIONS = 20;
const STARTING_LIVES = 3;

interface FlagRound {
  correct: Country;
  options: Country[];
}

const buildRounds = (count: number): FlagRound[] => {
  const pool = shuffle(ALL_COUNTRIES);
  const rounds: FlagRound[] = [];
  for (let i = 0; i < count && i < pool.length; i++) {
    const correct = pool[i] as Country;
    const distractor = sample(
      ALL_COUNTRIES.filter((c) => c.id !== correct.id),
      1,
    )[0];
    if (!distractor) continue;
    rounds.push({ correct, options: shuffle([correct, distractor]) });
  }
  return rounds;
};

export default function FlagMatchScreen() {
  const router = useRouter();
  const { palette } = useTheme();
  const { t, i18n } = useTranslation();
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);

  const rounds = useMemo(() => buildRounds(TOTAL_QUESTIONS), []);
  const [index, setIndex] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [livesRemaining, setLivesRemaining] = useState(STARTING_LIVES);
  const [perAnswerXP, setPerAnswerXP] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answerLog, setAnswerLog] = useState<ReviewItem[]>([]);
  const startedAt = useMemo(() => Date.now(), []);

  const { addXP, recordQuizResult, registerPlayDay } = useGameStore.getState();
  const recordCountryAnswer = useProgressStore((s) => s.recordAnswer);

  useEffect(() => {
    if (!finished) return;
    addXP(perAnswerXP);
    recordQuizResult(correctCount, rounds.length - correctCount);
    registerPlayDay(new Date().toISOString().slice(0, 10));
    useReviewStore.getState().setReview(answerLog);
    const r: QuizResult = buildQuizResult({
      mode: 'flag_match',
      totalQuestions: rounds.length,
      correctAnswers: correctCount,
      totalTimeMs: Date.now() - startedAt,
      bestStreak: bestCombo,
      perAnswerXP,
      newBadges: [],
    });
    router.replace({ pathname: '/quiz/result', params: encodeResult(r) });
  }, [finished, perAnswerXP, correctCount, bestCombo, rounds.length, startedAt, answerLog, addXP, recordQuizResult, registerPlayDay, router]);

  const current = rounds[index];
  if (!current) return null;

  const comboMultiplier = combo >= 10 ? 5 : combo >= 5 ? 3 : combo >= 3 ? 2 : 1;

  const handleAnswer = (chosen: Country) => {
    const isCorrect = chosen.id === current.correct.id;
    if (hapticsEnabled) {
      Haptics.impactAsync(
        isCorrect ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Heavy,
      ).catch(() => undefined);
    }
    recordCountryAnswer(current.correct.id, isCorrect, new Date().toISOString().slice(0, 10));

    setAnswerLog((log) => [
      ...log,
      {
        questionText: `${current.correct.flag.emoji} ${t('flagMatch.whichFlag')}`,
        correctText: localizedName(current.correct, i18n.language),
        selectedText: localizedName(chosen, i18n.language),
        isCorrect,
      },
    ]);

    if (isCorrect) {
      const newCombo = combo + 1;
      const xpAward = 5 * comboMultiplier;
      setCombo(newCombo);
      setBestCombo((b) => Math.max(b, newCombo));
      setCorrectCount((c) => c + 1);
      setPerAnswerXP((x) => x + xpAward);
    } else {
      setCombo(0);
      setLivesRemaining((l) => l - 1);
    }

    const isLast = index >= rounds.length - 1;
    if (!isCorrect && livesRemaining - 1 <= 0) {
      setFinished(true);
      return;
    }
    if (isLast) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
  };

  return (
    <ScreenContainer edgeToEdge>
      <Stack.Screen options={{ title: t('quiz.modes.flag_match') }} />
      <ScoreHeader
        questionIndex={index}
        totalQuestions={rounds.length}
        livesRemaining={livesRemaining}
        maxLives={STARTING_LIVES}
        streak={combo}
      />
      <View style={styles.body}>
        <Card variant="filled" style={styles.flagCard}>
          <Text style={styles.flag}>{current.correct.flag.emoji}</Text>
          {comboMultiplier > 1 ? (
            <View style={[styles.multiplier, { backgroundColor: palette.accent + '33', borderColor: palette.accent }]}>
              <Text style={[TYPOGRAPHY.captionBold, { color: palette.accent }]}>x{comboMultiplier}</Text>
            </View>
          ) : null}
        </Card>

        <View style={styles.btnRow}>
          {current.options.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => handleAnswer(opt)}
              accessibilityRole="button"
              accessibilityLabel={localizedName(opt, i18n.language)}
              style={({ pressed }) => [
                styles.choiceBtn,
                {
                  backgroundColor: palette.surfaceElevated,
                  borderColor: palette.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                style={[TYPOGRAPHY.h3, { color: palette.text.primary, textAlign: 'center' }]}
                numberOfLines={2}
              >
                {localizedName(opt, i18n.language)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
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
  body: { flex: 1, paddingHorizontal: SPACING.md, justifyContent: 'space-between', paddingBottom: SPACING.lg },
  flagCard: { marginTop: SPACING.md, alignItems: 'center', justifyContent: 'center', minHeight: 220, position: 'relative' },
  flag: { fontSize: 140 },
  multiplier: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', gap: SPACING.md },
  choiceBtn: {
    flex: 1,
    minHeight: 96,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
});
