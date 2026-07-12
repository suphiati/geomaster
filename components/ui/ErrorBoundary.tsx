/**
 * Beklenmeyen render hatalarını yakalayan boundary.
 * Geliştirme sırasında error stack gösterir; production'da kullanıcı dostu mesaj.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  /** Hata oluştuğunda üst seviyeye haber vermek için (Sentry vb.). */
  onError?: (error: Error, info: ErrorInfo) => void;
  /** Custom fallback render. Verilmezse default ekran kullanılır. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (__DEV__) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
    this.props.onError?.(error, info);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback(error, this.reset);
    }

    // Default fallback — tema renklerini hard-code eden basit bir ekran.
    // (ErrorBoundary class component olduğu için hook kullanamıyor.)
    const palette = COLORS.dark;
    return (
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <Text style={[TYPOGRAPHY.h2, { color: palette.text.primary, textAlign: 'center' }]}>
          Bir şeyler ters gitti
        </Text>
        <Text
          style={[
            TYPOGRAPHY.body,
            { color: palette.text.secondary, marginTop: SPACING.sm, textAlign: 'center' },
          ]}
        >
          {__DEV__ ? error.message : 'Üzgünüz, bir hata oluştu. Tekrar dener misin?'}
        </Text>
        <Button label="Tekrar Dene" onPress={this.reset} style={{ marginTop: SPACING.lg }} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
});
