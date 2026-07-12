/**
 * Seviye bilgisi + XP ilerleme çubuğu.
 */

import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { SPACING, TYPOGRAPHY } from '@/constants/theme';
import { getLevelProgress } from '@/data/levels';
import { useTheme } from '@/hooks/useTheme';
import { formatNumber } from '@/utils/formatters';
import { localized } from '@/utils/localizedName';

interface XPBarProps {
  totalXP: number;
}

export const XPBar = ({ totalXP }: XPBarProps) => {
  const { palette } = useTheme();
  const { t, i18n } = useTranslation();
  const { current, next, progress } = getLevelProgress(totalXP);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: palette.surface, borderColor: current.frameColor + '88' },
      ]}
      accessibilityLabel={`${t('level.levelLabel')} ${current.level} — ${formatNumber(totalXP)} XP`}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.icon} accessibilityElementsHidden>
            {current.icon}
          </Text>
          <View>
            <Text style={[TYPOGRAPHY.captionBold, { color: palette.text.muted }]}>
              {t('level.levelLabel')} {current.level}
            </Text>
            <Text style={[TYPOGRAPHY.h3, { color: palette.text.primary }]}>
              {localized(current.title, i18n.language)}
            </Text>
          </View>
        </View>
        <Text style={[TYPOGRAPHY.monoLarge, { color: current.frameColor }]}>
          {formatNumber(totalXP)}
        </Text>
      </View>
      <ProgressBar
        progress={progress}
        fillColor={current.frameColor}
        style={{ marginTop: SPACING.sm }}
      />
      {next ? (
        <View style={styles.nextRow}>
          <Text style={[TYPOGRAPHY.caption, { color: palette.text.muted }]}>
            {formatNumber(totalXP - current.requiredXP)} / {formatNumber(next.requiredXP - current.requiredXP)}
          </Text>
          <Text style={[TYPOGRAPHY.caption, { color: palette.text.muted }]}>
            {t('level.next', { level: next.level })}
          </Text>
        </View>
      ) : (
        <Text style={[TYPOGRAPHY.caption, { color: palette.text.muted, marginTop: SPACING.xs }]}>
          {t('level.maxReached')}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 36,
    marginRight: SPACING.md,
  },
  nextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
});
