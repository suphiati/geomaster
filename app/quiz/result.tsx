/**
 * Quiz sonuç ekranı.
 * Skor, doğruluk, XP ve kullanıcı eylemleri (tekrar dene / çık) gösterir.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AdBanner } from '@/components/ads/AdBanner';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatRow } from '@/components/country/StatRow';
import { BORDER_RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { getDatabase } from '@/db';
import { insertQuizHistory } from '@/db/queries';
import { useReviewStore } from '@/stores/useReviewStore';
import { useTheme } from '@/hooks/useTheme';
import { formatNumber } from '@/utils/formatters';

type ResultParams = {
  mode?: string;
  total?: string;
  correct?: string;
  wrong?: string;
  accuracy?: string;
  totalTime?: string;
  xp?: string;
  streakBonus?: string;
  bestStreak?: string;
  newBadges?: string;
};

/** Soru-cevap dökümü tutan modlar (sonuçta yanlış cevaplar listelenir). */
const REVIEW_MODES = new Set(['classic', 'true_false', 'speed_round', 'flag_match']);

/** "Tekrar Dene" için mod → rota eşlemesi. */
const RETRY_ROUTE: Record<string, string> = {
  classic: '/quiz/classic',
  true_false: '/quiz/true-false',
  speed_round: '/quiz/speed-round',
  flag_match: '/quiz/flag-match',
  neighbor_chain: '/quiz/neighbor-chain',
};

export default function ResultScreen() {
  const params = useLocalSearchParams() as ResultParams;
  const router = useRouter();
  const { palette } = useTheme();
  const { t } = useTranslation();
  const reviewItems = useReviewStore((s) => s.items);
  // Yalnızca soru-cevap modları döküm tutar; başka modda eski veriyi gösterme.
  const wrongItems = REVIEW_MODES.has(params.mode ?? '') ? reviewItems.filter((r) => !r.isCorrect) : [];

  const total = parseInt(params.total ?? '0', 10);
  const correct = parseInt(params.correct ?? '0', 10);
  const wrong = parseInt(params.wrong ?? '0', 10);
  const accuracy = parseFloat(params.accuracy ?? '0');
  const totalTimeMs = parseInt(params.totalTime ?? '0', 10);
  const xp = parseInt(params.xp ?? '0', 10);
  const streakBonus = parseInt(params.streakBonus ?? '0', 10);
  const bestStreak = parseInt(params.bestStreak ?? '0', 10);

  const accuracyPct = Math.round(accuracy * 100);
  const isPerfect = total > 0 && correct === total;
  const isGood = accuracyPct >= 70;

  const persistedRef = useRef(false);
  useEffect(() => {
    if (persistedRef.current) return;
    persistedRef.current = true;
    void (async () => {
      try {
        const db = await getDatabase();
        await insertQuizHistory(db, {
          mode: params.mode ?? 'classic',
          category: null,
          continent: null,
          difficulty: 'easy',
          total_questions: total,
          correct_answers: correct,
          wrong_answers: wrong,
          accuracy,
          total_time_ms: totalTimeMs,
          xp_earned: xp,
          best_streak: bestStreak,
        });
      } catch (e) {
        if (__DEV__) console.warn('Quiz history kaydedilemedi:', e);
      }
    })();
  }, [params.mode, total, correct, wrong, accuracy, totalTimeMs, xp, bestStreak]);

  const heroTone = isPerfect ? palette.accent : isGood ? palette.success : palette.warning;
  const heroIcon: keyof typeof MaterialCommunityIcons.glyphMap = isPerfect
    ? 'crown'
    : isGood
    ? 'check-decagram'
    : 'reload';
  const heroTitle = isPerfect
    ? t('quiz.result.perfect')
    : isGood
    ? t('quiz.result.great')
    : t('quiz.result.tryAgain');

  return (
    <ScreenContainer edgeToEdge>
      <Stack.Screen options={{ title: t('quiz.result.title'), headerBackVisible: false }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.hero,
            { backgroundColor: heroTone + '22', borderColor: heroTone + '55' },
          ]}
        >
          <View style={[styles.heroIcon, { backgroundColor: heroTone + '33' }]}>
            <MaterialCommunityIcons name={heroIcon} size={42} color={heroTone} />
          </View>
          <Text
            style={[TYPOGRAPHY.displayMedium, { color: palette.text.primary, marginTop: SPACING.sm }]}
          >
            {heroTitle}
          </Text>
          <Text
            style={[TYPOGRAPHY.bodyLarge, { color: heroTone, marginTop: SPACING.xs }]}
          >
            +{formatNumber(xp)} XP
          </Text>
          <Text
            style={[TYPOGRAPHY.body, { color: palette.text.secondary, marginTop: SPACING.xs }]}
          >
            {t('quiz.result.correctSummary', { correct, total, pct: accuracyPct })}
          </Text>
        </View>

        <Card variant="filled" style={styles.section}>
          <Text style={[TYPOGRAPHY.h3, { color: palette.text.primary, marginBottom: SPACING.xs }]}>
            {t('quiz.result.details')}
          </Text>
          <StatRow icon="check" label={t('quiz.result.correct')} value={String(correct)} iconColor={palette.success} />
          <StatRow icon="close" label={t('quiz.result.wrong')} value={String(wrong)} iconColor={palette.error} />
          <StatRow
            icon="fire"
            label={t('quiz.result.longestStreak')}
            value={String(bestStreak)}
            iconColor={palette.accent}
          />
          <StatRow
            icon="clock-outline"
            label={t('quiz.result.totalTime')}
            value={`${(totalTimeMs / 1000).toFixed(1)} sn`}
          />
          {streakBonus > 0 ? (
            <StatRow
              icon="gift-outline"
              label={t('quiz.result.bonusXP')}
              value={`+${formatNumber(streakBonus)}`}
              iconColor={palette.accent}
            />
          ) : null}
        </Card>

        {wrongItems.length > 0 ? (
          <Card variant="filled" style={styles.section}>
            <Text style={[TYPOGRAPHY.h3, { color: palette.text.primary, marginBottom: SPACING.sm }]}>
              {t('quizExtra.wrongAnswers')} ({wrongItems.length})
            </Text>
            {wrongItems.map((item, i) => (
              <View
                key={i}
                style={[
                  styles.reviewItem,
                  { borderBottomColor: palette.border },
                  i === wrongItems.length - 1 ? { borderBottomWidth: 0 } : null,
                ]}
              >
                <Text style={[TYPOGRAPHY.bodySm, { color: palette.text.primary, marginBottom: SPACING.xs }]}>
                  {item.questionText}
                </Text>
                <View style={styles.reviewRow}>
                  <MaterialCommunityIcons name="close-circle" size={16} color={palette.error} />
                  <Text style={[TYPOGRAPHY.caption, { color: palette.text.secondary, marginLeft: 6, flex: 1 }]}>
                    {t('quizExtra.yourAnswer')}: {item.selectedText ?? t('quizExtra.notAnswered')}
                  </Text>
                </View>
                <View style={styles.reviewRow}>
                  <MaterialCommunityIcons name="check-circle" size={16} color={palette.success} />
                  <Text style={[TYPOGRAPHY.caption, { color: palette.text.secondary, marginLeft: 6, flex: 1 }]}>
                    {t('quizExtra.correctAnswer')}: {item.correctText}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        ) : null}

        <View style={styles.actions}>
          <Button
            label={t('quiz.result.tryAgainCta')}
            variant="primary"
            icon="restart"
            onPress={() => router.replace((RETRY_ROUTE[params.mode ?? 'classic'] ?? '/quiz/classic') as never)}
            fullWidth
          />
          <Button
            label={t('quiz.result.back')}
            variant="secondary"
            onPress={() => router.replace('/(tabs)/quiz')}
            fullWidth
            style={{ marginTop: SPACING.sm }}
          />
        </View>
      </ScrollView>
      <AdBanner />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // Banner alta yaslansın diye ScrollView kalan alanı kaplamalı.
  scrollView: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  hero: {
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginTop: SPACING.md,
  },
  reviewItem: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  actions: {
    marginTop: SPACING.lg,
  },
});
