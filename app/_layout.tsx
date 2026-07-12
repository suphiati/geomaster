/**
 * Root layout: tema sağlayıcı, font yükleme, splash screen kontrolü, status bar.
 * Tüm ekranların kök konteynerı.
 */

import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import { Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useI18nSync } from '@/hooks/useI18n';
import { useTheme } from '@/hooks/useTheme';

import '@/i18n';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* Hata önemli değil — duplicate çağrı koruması */
});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const { isDark, palette } = useTheme();
  useI18nSync();

  // theme.ts'teki fontFamily adlarıyla birebir eşleşen anahtarlar altında yüklenir.
  const [fontsLoaded] = useFonts({
    'Outfit-Bold': Outfit_700Bold,
    'Outfit-SemiBold': Outfit_600SemiBold,
    'Nunito-Regular': Nunito_400Regular,
    'Nunito-Bold': Nunito_700Bold,
    'JetBrainsMono-Regular': JetBrainsMono_400Regular,
  });

  useEffect(() => {
    // Fontlar yüklendiğinde splash'i kapat; öncesinde açık kalır.
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const navTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: palette.background,
          card: palette.surface,
          border: palette.border,
          primary: palette.primary,
          text: palette.text.primary,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: palette.background,
          card: palette.surface,
          border: palette.border,
          primary: palette.primary,
          text: palette.text.primary,
        },
      };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={navTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="country/[id]"
            options={{ headerShown: true, headerBackTitle: 'Geri' }}
          />
          <Stack.Screen name="quiz" />
          <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="leaderboard" />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
