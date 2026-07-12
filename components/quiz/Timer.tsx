/**
 * Dairesel/yatay süre göstergesi.
 * Faz 9: yatay progress bar + dijital sayıcı.
 */

import { StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface TimerProps {
  /** Kalan saniye. */
  remaining: number;
  /** Başlangıç süresi (toplam). Bar oranını hesaplamak için. */
  total: number;
}

export const Timer = ({ remaining, total }: TimerProps) => {
  const { palette } = useTheme();
  const ratio = total === 0 ? 0 : Math.max(0, Math.min(1, remaining / total));
  const tone = remaining <= 5 ? palette.error : remaining <= 15 ? palette.warning : palette.primary;

  return (
    <View style={styles.container} accessibilityLabel={`${remaining} saniye kaldı`}>
      <View style={styles.row}>
        <Text style={[TYPOGRAPHY.captionBold, { color: palette.text.muted }]}>SÜRE</Text>
        <Text style={[TYPOGRAPHY.monoLarge, { color: tone }]}>{remaining}s</Text>
      </View>
      <ProgressBar progress={ratio} fillColor={tone} style={{ marginTop: SPACING.xs }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
});
