/**
 * Lokal liderlik tablosu — en yüksek skorlu son 50 oturum.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Skeleton } from '@/components/ui/Skeleton';
import { SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useLeaderboard, type LeaderboardEntry } from '@/hooks/useLeaderboard';
import { useTheme } from '@/hooks/useTheme';
import { formatNumber } from '@/utils/formatters';

const Row = ({ entry, rank }: { entry: LeaderboardEntry; rank: number }) => {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const accuracy = Math.round(entry.accuracy * 100);
  const medalColor =
    rank === 0 ? palette.accent : rank === 1 ? '#C0C0C0' : rank === 2 ? '#CD7F32' : palette.text.muted;

  return (
    <Card variant="outlined" style={styles.row}>
      <View style={[styles.rankBox, { backgroundColor: medalColor + '22', borderColor: medalColor }]}>
        {rank < 3 ? (
          <MaterialCommunityIcons name="medal" size={18} color={medalColor} />
        ) : (
          <Text style={[TYPOGRAPHY.bodyBold, { color: medalColor }]}>#{rank + 1}</Text>
        )}
      </View>
      <View style={styles.info}>
        <Text style={[TYPOGRAPHY.bodyBold, { color: palette.text.primary }]}>
          {t(`quiz.modes.${entry.mode}`)}
        </Text>
        <Text style={[TYPOGRAPHY.caption, { color: palette.text.muted }]}>
          {entry.correctAnswers}/{entry.totalQuestions} • %{accuracy} • streak {entry.bestStreak}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[TYPOGRAPHY.bodyBold, { color: palette.primary }]}>
          {formatNumber(entry.xpEarned)} XP
        </Text>
        <Text style={[TYPOGRAPHY.caption, { color: palette.text.muted }]}>
          {entry.playedAt.slice(0, 10)}
        </Text>
      </View>
    </Card>
  );
};

export default function LeaderboardScreen() {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const { entries, loading } = useLeaderboard();

  return (
    <ScreenContainer>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('leaderboard.title'),
          headerStyle: { backgroundColor: palette.background },
          headerTintColor: palette.text.primary,
        }}
      />

      {loading ? (
        <View style={{ paddingVertical: SPACING.lg, gap: SPACING.sm }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={64} radius={12} />
          ))}
        </View>
      ) : entries.length === 0 ? (
        <EmptyState
          icon="trophy-outline"
          title={t('leaderboard.empty')}
          description={t('leaderboard.emptyDesc')}
        />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(e) => String(e.id)}
          renderItem={({ item, index }) => <Row entry={item} rank={index} />}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
          contentContainerStyle={{ paddingVertical: SPACING.md }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  rankBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: SPACING.md,
  },
  info: {
    flex: 1,
  },
});
