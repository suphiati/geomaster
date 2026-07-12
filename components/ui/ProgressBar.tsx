/**
 * Animasyonlu yatay ilerleme çubuğu.
 */

import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ANIMATION_DURATION, BORDER_RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface ProgressBarProps {
  /** 0-1 arası değer. */
  progress: number;
  height?: number;
  trackColor?: string;
  fillColor?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const ProgressBar = ({
  progress,
  height = 8,
  trackColor,
  fillColor,
  style,
  accessibilityLabel,
}: ProgressBarProps) => {
  const { palette } = useTheme();
  const value = useSharedValue(progress);

  useEffect(() => {
    value.value = withTiming(Math.max(0, Math.min(1, progress)), {
      duration: ANIMATION_DURATION.normal,
    });
  }, [progress, value]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${value.value * 100}%`,
  }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 1, now: progress }}
      style={[
        styles.track,
        { backgroundColor: trackColor ?? palette.surfaceElevated, height },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: fillColor ?? palette.primary, height },
          animatedStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: BORDER_RADIUS.full,
  },
});
