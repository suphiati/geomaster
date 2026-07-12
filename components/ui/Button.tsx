/**
 * Çok varyantlı temel buton.
 * Variants: primary, secondary, ghost, icon.
 * Sizes: sm, md, lg.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type ViewStyle,
} from 'react-native';

import { BORDER_RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const PADDING_BY_SIZE: Record<ButtonSize, { v: number; h: number; iconSize: number }> = {
  sm: { v: SPACING.xs + 2, h: SPACING.md, iconSize: 16 },
  md: { v: SPACING.sm + 2, h: SPACING.lg, iconSize: 20 },
  lg: { v: SPACING.md, h: SPACING.xl, iconSize: 24 },
};

export const Button = ({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  fullWidth = false,
  disabled,
  style,
  accessibilityLabel,
  ...rest
}: ButtonProps) => {
  const { palette } = useTheme();
  const sizing = PADDING_BY_SIZE[size];

  const { containerStyle, contentColor, pressedStyle } = useMemo(() => {
    switch (variant) {
      case 'primary':
        return {
          containerStyle: { backgroundColor: palette.primary },
          contentColor: palette.text.inverse,
          pressedStyle: { backgroundColor: palette.primaryDark },
        };
      case 'secondary':
        return {
          containerStyle: {
            backgroundColor: palette.surfaceElevated,
            borderWidth: 1,
            borderColor: palette.border,
          },
          contentColor: palette.text.primary,
          pressedStyle: { backgroundColor: palette.surfacePressed },
        };
      case 'ghost':
        return {
          containerStyle: { backgroundColor: 'transparent' },
          contentColor: palette.primary,
          pressedStyle: { backgroundColor: palette.surfacePressed },
        };
      case 'icon':
        return {
          containerStyle: {
            backgroundColor: palette.surface,
            borderRadius: BORDER_RADIUS.full,
            paddingHorizontal: 0,
          },
          contentColor: palette.text.primary,
          pressedStyle: { backgroundColor: palette.surfacePressed },
        };
    }
  }, [variant, palette]);

  const isIconOnly = variant === 'icon';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          paddingVertical: sizing.v,
          paddingHorizontal: isIconOnly ? sizing.v + 2 : sizing.h,
          opacity: isDisabled ? 0.5 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        containerStyle,
        pressed ? pressedStyle : null,
        isIconOnly ? { aspectRatio: 1 } : null,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={contentColor} size="small" />
      ) : (
        <View style={styles.content}>
          {icon ? (
            <MaterialCommunityIcons
              name={icon}
              size={sizing.iconSize}
              color={contentColor}
              style={label && !isIconOnly ? { marginRight: SPACING.xs } : undefined}
            />
          ) : null}
          {!isIconOnly && label ? (
            <Text style={[TYPOGRAPHY.bodyBold, { color: contentColor }]} numberOfLines={1}>
              {label}
            </Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
