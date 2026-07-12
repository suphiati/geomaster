/**
 * Profil sekmesi.
 * Seviye + XP + temel istatistikler + rozet koleksiyonu.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { BadgeCard } from '@/components/gamification/BadgeCard';
import { ContinentProgress } from '@/components/gamification/ContinentProgress';
import { XPBar } from '@/components/gamification/XPBar';
import { SPACING, TYPOGRAPHY } from '@/constants/theme';
import { ALL_BADGES } from '@/data/badges';
import { useGameStore } from '@/stores/useGameStore';
import { useTheme } from '@/hooks/useTheme';
import { formatNumber } from '@/utils/formatters';

interface StatTileProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  accent: string;
}

const StatTile = ({ icon, label, value, accent }: StatTileProps) => {
  const { palette } = useTheme();
  return (
    <View
      style={[
        styles.statTile,
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}
      accessibilityLabel={`${label}: ${value}`}
    >
      <View style={[styles.statIcon, { backgroundColor: accent + '22' }]}>
        <MaterialCommunityIcons name={icon} size={20} color={accent} />
      </View>
      <Text style={[TYPOGRAPHY.h2, { color: palette.text.primary, marginTop: SPACING.xs }]}>
        {value}
      </Text>
      <Text style={[TYPOGRAPHY.caption, { color: palette.text.muted }]}>{label}</Text>
    </View>
  );
};

export default function ProfileTab() {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const totalXP = useGameStore((s) => s.totalXP);
  const streakDays = useGameStore((s) => s.streakDays);
  const totalQuizzes = useGameStore((s) => s.totalQuizzes);
  const totalCorrect = useGameStore((s) => s.totalCorrect);
  const totalWrong = useGameStore((s) => s.totalWrong);
  const earnedBadgeIds = useGameStore((s) => s.earnedBadgeIds);

  const accuracy =
    totalCorrect + totalWrong === 0
      ? 0
      : Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100);

  const earnedSet = new Set(earnedBadgeIds);

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[TYPOGRAPHY.h1, { color: palette.text.primary }]}>{t('profile.title')}</Text>
          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel={t('settings.title')}
            hitSlop={12}
            style={[styles.settingsBtn, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}
          >
            <MaterialCommunityIcons name="cog-outline" size={22} color={palette.text.primary} />
          </Pressable>
        </View>

        <XPBar totalXP={totalXP} />

        <View style={styles.statsRow}>
          <StatTile
            icon="fire"
            label={t('profile.stats.streak')}
            value={String(streakDays)}
            accent={palette.accent}
          />
          <StatTile
            icon="check"
            label={t('profile.stats.correct')}
            value={formatNumber(totalCorrect)}
            accent={palette.success}
          />
          <StatTile
            icon="percent"
            label={t('profile.stats.accuracy')}
            value={`${accuracy}%`}
            accent={palette.primary}
          />
        </View>

        <Card variant="filled" style={styles.section}>
          <Text style={[TYPOGRAPHY.h3, { color: palette.text.primary }]}>{t('profile.totalsTitle')}</Text>
          <View style={styles.kvRow}>
            <Text style={[TYPOGRAPHY.body, { color: palette.text.secondary }]}>{t('profile.quizCount')}</Text>
            <Text style={[TYPOGRAPHY.bodyBold, { color: palette.text.primary }]}>
              {formatNumber(totalQuizzes)}
            </Text>
          </View>
          <View style={styles.kvRow}>
            <Text style={[TYPOGRAPHY.body, { color: palette.text.secondary }]}>{t('profile.wrongCount')}</Text>
            <Text style={[TYPOGRAPHY.bodyBold, { color: palette.text.primary }]}>
              {formatNumber(totalWrong)}
            </Text>
          </View>
          <View style={styles.kvRow}>
            <Text style={[TYPOGRAPHY.body, { color: palette.text.secondary }]}>{t('profile.totalXP')}</Text>
            <Text style={[TYPOGRAPHY.bodyBold, { color: palette.primary }]}>
              {formatNumber(totalXP)}
            </Text>
          </View>
        </Card>

        <View style={{ marginTop: SPACING.md }}>
          <ContinentProgress />
        </View>

        <View style={styles.badgeHeader}>
          <Text style={[TYPOGRAPHY.h3, { color: palette.text.primary }]}>{t('profile.badges')}</Text>
          <Text style={[TYPOGRAPHY.bodySm, { color: palette.text.muted }]}>
            {earnedSet.size} / {ALL_BADGES.length}
          </Text>
        </View>

        <View style={styles.badgeGrid}>
          {ALL_BADGES.map((b) => (
            <BadgeCard key={b.id} badge={b} earned={earnedSet.has(b.id)} />
          ))}
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  statTile: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
    marginRight: SPACING.sm,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginTop: SPACING.md,
  },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs + 2,
  },
  badgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
