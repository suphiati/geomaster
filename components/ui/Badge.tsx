/**
 * Küçük renkli etiket — kıta, zorluk, durum göstergesi.
 */

import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { BORDER_RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface BadgeProps {
  label: string;
  /** Arka plan rengi. Belirtilmezse tema primary'si. */
  color?: string;
  /** Düz arka plan yerine yarı saydam ton tercih edilirse. */
  subtle?: boolean;
  style?: ViewStyle;
}

export const Badge = ({ label, color, subtle = false, style }: BadgeProps) => {
  const { palette } = useTheme();
  const accent = color ?? palette.primary;

  return (
    <View
      style={[
        styles.base,
        subtle
          ? { backgroundColor: accent + '22', borderColor: accent + '55', borderWidth: 1 }
          : { backgroundColor: accent },
        style,
      ]}
      accessibilityLabel={label}
    >
      <Text
        style={[
          TYPOGRAPHY.captionBold,
          { color: subtle ? accent : palette.text.inverse },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
});
