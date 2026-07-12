/**
 * Genel amaçlı kart konteyner.
 * Variants: elevated (gölgeli), outlined (kenarlıklı), filled (yüzey rengi).
 */

import type { PropsWithChildren } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type ViewStyle,
} from 'react-native';

import { BORDER_RADIUS, SHADOWS, SPACING } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export type CardVariant = 'elevated' | 'outlined' | 'filled';

interface CardProps extends PropsWithChildren {
  variant?: CardVariant;
  onPress?: PressableProps['onPress'];
  style?: ViewStyle;
  /** İç padding'i kapatır (resim, harita vb. tam-kenar içerikler için). */
  bare?: boolean;
  accessibilityLabel?: string;
}

export const Card = ({
  children,
  variant = 'filled',
  onPress,
  style,
  bare = false,
  accessibilityLabel,
}: CardProps) => {
  const { palette } = useTheme();

  const variantStyle: ViewStyle = (() => {
    switch (variant) {
      case 'elevated':
        return { backgroundColor: palette.surface, ...SHADOWS.md };
      case 'outlined':
        return {
          backgroundColor: palette.surface,
          borderWidth: 1,
          borderColor: palette.border,
        };
      case 'filled':
      default:
        return { backgroundColor: palette.surfaceElevated };
    }
  })();

  const composed: ViewStyle = {
    ...styles.base,
    ...(bare ? null : { padding: SPACING.md }),
    ...variantStyle,
    ...(style ?? null),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [composed, pressed ? { opacity: 0.85 } : null]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={composed} accessibilityLabel={accessibilityLabel}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
});
