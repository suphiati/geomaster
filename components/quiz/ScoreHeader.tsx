/**
 * Quiz başlığı: ilerleme (X / N), can sayısı, mevcut streak.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface ScoreHeaderProps {
  questionIndex: number;
  totalQuestions: number;
  livesRemaining: number;
  maxLives: number;
  streak: number;
}

export const ScoreHeader = ({
  questionIndex,
  totalQuestions,
  livesRemaining,
  maxLives,
  streak,
}: ScoreHeaderProps) => {
  const { palette } = useTheme();
  const progress = totalQuestions === 0 ? 0 : (questionIndex + 1) / totalQuestions;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[TYPOGRAPHY.bodyBold, { color: palette.text.secondary }]}>
          {questionIndex + 1} / {totalQuestions}
        </Text>
        <View style={styles.row}>
          {/* Can göstergesi */}
          <View style={styles.lifeRow}>
            {Array.from({ length: maxLives }).map((_, i) => (
              <MaterialCommunityIcons
                key={i}
                name={i < livesRemaining ? 'heart' : 'heart-outline'}
                size={18}
                color={i < livesRemaining ? palette.secondary : palette.text.muted}
                style={{ marginLeft: 2 }}
              />
            ))}
          </View>
          {streak >= 2 ? (
            <View style={[styles.streakChip, { backgroundColor: palette.accent + '22' }]}>
              <MaterialCommunityIcons name="fire" size={14} color={palette.accent} />
              <Text style={[TYPOGRAPHY.captionBold, { color: palette.accent, marginLeft: 4 }]}>
                {streak}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      <ProgressBar
        progress={progress}
        accessibilityLabel={`${questionIndex + 1}. soru, toplam ${totalQuestions}`}
        style={{ marginTop: SPACING.sm }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lifeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 2,
    borderRadius: 999,
  },
});
