/**
 * Yükleme placeholder'ı — pulse animasyonu ile.
 */

import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { BORDER_RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface SkeletonProps {
  width?: ViewStyle['width'];
  height?: ViewStyle['height'];
  radius?: number;
  style?: ViewStyle;
}

export const Skeleton = ({
  width = '100%',
  height = 16,
  radius = BORDER_RADIUS.sm,
  style,
}: SkeletonProps) => {
  const { palette } = useTheme();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.base,
        { backgroundColor: palette.surfaceElevated, width, height, borderRadius: radius },
        animatedStyle,
        style,
      ]}
    />
  );
};

interface SkeletonGroupProps {
  count: number;
  height?: number;
  spacing?: number;
}

/** Aynı yükseklikte birden fazla skeleton satırı oluşturur. */
export const SkeletonGroup = ({ count, height = 16, spacing = 8 }: SkeletonGroupProps) => (
  <View>
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} height={height} style={i === 0 ? undefined : { marginTop: spacing }} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
