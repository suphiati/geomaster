/**
 * Tüm ekranlar için ortak güvenli alan + arka plan + yatay padding'li konteyner.
 */

import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SPACING } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface ScreenContainerProps extends PropsWithChildren {
  /** Yatay padding uygulanmasın mı? Tam kenara dayalı içerik için kullanılır (örn. harita, liste). */
  edgeToEdge?: boolean;
  style?: ViewStyle;
}

export const ScreenContainer = ({
  children,
  edgeToEdge = false,
  style,
}: ScreenContainerProps) => {
  const { palette } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: palette.background }]}
      edges={['top', 'left', 'right']}
    >
      <View
        style={[
          styles.content,
          edgeToEdge ? null : styles.padded,
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1 },
  padded: { paddingHorizontal: SPACING.md },
});
