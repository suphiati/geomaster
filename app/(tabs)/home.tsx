/**
 * Anasayfa: streak, seviye özeti ve hızlı başlat kartı.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { XPBar } from '@/components/gamification/XPBar';
import { BORDER_RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useGameStore } from '@/stores/useGameStore';
import { useTheme } from '@/hooks/useTheme';
import { formatNumber } from '@/utils/formatters';

export default function HomeTab() {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const totalXP = useGameStore((s) => s.totalXP);
  const streakDays = useGameStore((s) => s.streakDays);
  const totalQuizzes = useGameStore((s) => s.totalQuizzes);
  const totalCorrect = useGameStore((s) => s.totalCorrect);

  return (
    <ScreenContainer hasTabBar>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[TYPOGRAPHY.bodySm, { color: palette.text.muted }]}>{t('home.welcome')}</Text>
          <Text style={[TYPOGRAPHY.h1, { color: palette.text.primary }]}>{t('home.title')}</Text>
        </View>

        <XPBar totalXP={totalXP} />

        <Card
          variant="filled"
          onPress={() => router.push('/(tabs)/quiz')}
          style={{
            ...styles.cta,
            backgroundColor: palette.primary + '18',
            borderColor: palette.primary + '55',
          }}
          accessibilityLabel={t('home.quickStartA11y')}
        >
          <View
            style={[
              styles.ctaIcon,
              { backgroundColor: palette.primary + '33' },
            ]}
          >
            <MaterialCommunityIcons name="rocket-launch" size={32} color={palette.primary} />
          </View>
          <View style={styles.ctaText}>
            <Text style={[TYPOGRAPHY.h2, { color: palette.text.primary }]}>{t('home.quickStart')}</Text>
            <Text style={[TYPOGRAPHY.bodySm, { color: palette.text.secondary, marginTop: 2 }]}>
              {t('home.quickStartDesc')}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={28} color={palette.primary} />
        </Card>

        <View style={styles.metricsRow}>
          <Card variant="filled" style={styles.metricCard}>
            <Text style={[TYPOGRAPHY.bodySm, { color: palette.text.muted }]}>{t('home.streakLabel')}</Text>
            <View style={styles.metricRow}>
              <MaterialCommunityIcons name="fire" size={28} color={palette.accent} />
              <Text style={[TYPOGRAPHY.displayMedium, { color: palette.text.primary, marginLeft: SPACING.xs }]}>
                {streakDays}
              </Text>
            </View>
            <Text style={[TYPOGRAPHY.caption, { color: palette.text.muted }]}>{t('home.streakUnit')}</Text>
          </Card>

          <Card variant="filled" style={styles.metricCard}>
            <Text style={[TYPOGRAPHY.bodySm, { color: palette.text.muted }]}>{t('home.quizLabel')}</Text>
            <View style={styles.metricRow}>
              <MaterialCommunityIcons name="medal-outline" size={28} color={palette.primary} />
              <Text style={[TYPOGRAPHY.displayMedium, { color: palette.text.primary, marginLeft: SPACING.xs }]}>
                {formatNumber(totalQuizzes)}
              </Text>
            </View>
            <Text style={[TYPOGRAPHY.caption, { color: palette.text.muted }]}>{t('home.quizUnit')}</Text>
          </Card>
        </View>

        <Card variant="outlined" onPress={() => router.push('/(tabs)/explore')} style={styles.linkCard}>
          <View style={styles.row}>
            <MaterialCommunityIcons name="earth" size={28} color={palette.info} />
            <View style={{ marginLeft: SPACING.md, flex: 1 }}>
              <Text style={[TYPOGRAPHY.bodyBold, { color: palette.text.primary }]}>
                {t('home.encyclopediaTitle')}
              </Text>
              <Text style={[TYPOGRAPHY.bodySm, { color: palette.text.secondary }]}>
                {t('home.encyclopediaDesc')}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={palette.text.muted} />
          </View>
        </Card>

        <Card variant="outlined" onPress={() => router.push('/leaderboard')} style={styles.linkCard}>
          <View style={styles.row}>
            <MaterialCommunityIcons name="trophy-outline" size={28} color={palette.accent} />
            <View style={{ marginLeft: SPACING.md, flex: 1 }}>
              <Text style={[TYPOGRAPHY.bodyBold, { color: palette.text.primary }]}>{t('leaderboard.title')}</Text>
              <Text style={[TYPOGRAPHY.bodySm, { color: palette.text.secondary }]}>
                {t('home.leaderboardSubtitle')}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={palette.text.muted} />
          </View>
        </Card>

        {totalCorrect > 0 ? (
          <Card variant="filled" style={styles.summary}>
            <Text style={[TYPOGRAPHY.bodySm, { color: palette.text.muted }]}>{t('home.summaryLabel')}</Text>
            <Text
              style={[TYPOGRAPHY.body, { color: palette.text.primary, marginTop: SPACING.xs }]}
            >
              <Text style={{ color: palette.success, ...TYPOGRAPHY.bodyBold }}>
                {formatNumber(totalCorrect)}
              </Text>
              {t('home.summaryCorrect')}
              <Text style={{ color: palette.primary, ...TYPOGRAPHY.bodyBold }}>
                {formatNumber(totalXP)} XP
              </Text>
              {t('home.summaryXpEarned')}
            </Text>
          </Card>
        ) : (
          <Card variant="filled" style={styles.summary}>
            <Text style={[TYPOGRAPHY.body, { color: palette.text.secondary }]}>
              {t('home.noQuizYet')}
            </Text>
            <Button
              label={t('home.startQuiz')}
              variant="primary"
              icon="play"
              onPress={() => router.push('/quiz/classic')}
              style={{ marginTop: SPACING.md }}
            />
          </Card>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  header: {
    marginBottom: SPACING.md,
  },
  cta: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  ctaIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  metricCard: {
    flex: 1,
    padding: SPACING.md,
    marginRight: SPACING.sm,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  linkCard: {
    marginTop: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summary: {
    marginTop: SPACING.md,
  },
});
