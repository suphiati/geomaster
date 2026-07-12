/**
 * Quiz alt-stack layout. Quiz akışında geri butonu özel davranışla yönetilir.
 */

import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/hooks/useTheme';

export default function QuizLayout() {
  const { palette } = useTheme();
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerTintColor: palette.text.primary,
        headerTitleStyle: { color: palette.text.primary },
      }}
    >
      <Stack.Screen name="classic" options={{ title: t('quiz.modes.classic') }} />
      <Stack.Screen name="true-false" options={{ title: t('quiz.modes.true_false') }} />
      <Stack.Screen name="speed-round" options={{ title: t('quiz.modes.speed_round') }} />
      <Stack.Screen name="flag-match" options={{ title: t('quiz.modes.flag_match') }} />
      <Stack.Screen name="neighbor-chain" options={{ title: t('quiz.modes.neighbor_chain') }} />
      <Stack.Screen name="daily" options={{ title: t('quiz.modes.daily_challenge') }} />
      <Stack.Screen name="result" options={{ title: t('quiz.result.title'), headerBackVisible: false }} />
    </Stack>
  );
}
