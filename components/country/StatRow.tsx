/**
 * "İkon + etiket + değer" satır bileşeni — ülke detay ekranlarında kullanılır.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface StatRowProps {
  icon: IconName;
  label: string;
  value: string;
  /** Vurgu rengi — varsayılan tema secondary'sini kullanır. */
  iconColor?: string;
  style?: ViewStyle;
}

export const StatRow = ({ icon, label, value, iconColor, style }: StatRowProps) => {
  const { palette } = useTheme();

  return (
    <View
      style={[styles.row, { borderBottomColor: palette.borderLight }, style]}
      accessibilityLabel={`${label}: ${value}`}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: (iconColor ?? palette.primary) + '22' },
        ]}
      >
        <MaterialCommunityIcons name={icon} size={18} color={iconColor ?? palette.primary} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[TYPOGRAPHY.bodySm, { color: palette.text.muted }]}>{label}</Text>
        <Text
          style={[TYPOGRAPHY.bodyBold, { color: palette.text.primary }]}
          numberOfLines={2}
        >
          {value}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  textWrap: {
    flex: 1,
  },
});
