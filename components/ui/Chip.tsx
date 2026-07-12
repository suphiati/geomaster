/**
 * Filtreleme/seçim chip'i. Aktif/pasif durum, opsiyonel ikon.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { BORDER_RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  /** Renk vurgusu — varsayılan tema primary'sini kullanır. */
  accentColor?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const Chip = ({
  label,
  selected = false,
  onPress,
  icon,
  accentColor,
  style,
  accessibilityLabel,
}: ChipProps) => {
  const { palette } = useTheme();
  const accent = accentColor ?? palette.primary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: selected ? accent : palette.surfaceElevated,
          borderColor: selected ? accent : palette.border,
        },
        pressed ? { opacity: 0.85 } : null,
        style,
      ]}
    >
      <View style={styles.row}>
        {icon ? (
          <MaterialCommunityIcons
            name={icon}
            size={16}
            color={selected ? palette.text.inverse : palette.text.primary}
            style={{ marginRight: SPACING.xs }}
          />
        ) : null}
        <Text
          style={[
            TYPOGRAPHY.captionBold,
            { fontSize: 14, color: selected ? palette.text.inverse : palette.text.primary },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
