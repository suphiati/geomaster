/**
 * 3 sayfalık ilk açılış onboarding akışı.
 * Kullanıcı bittiğinde settings.hasCompletedOnboarding = true.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { BORDER_RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore } from '@/stores/useSettingsStore';

interface Slide {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  titleKey: string;
  descriptionKey: string;
}

const SLIDES: readonly Slide[] = [
  {
    icon: 'earth',
    titleKey: 'onboarding.slide1Title',
    descriptionKey: 'onboarding.slide1Desc',
  },
  {
    icon: 'gamepad-variant',
    titleKey: 'onboarding.slide2Title',
    descriptionKey: 'onboarding.slide2Desc',
  },
  {
    icon: 'trophy',
    titleKey: 'onboarding.slide3Title',
    descriptionKey: 'onboarding.slide3Desc',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { palette } = useTheme();
  const { t } = useTranslation();
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const [page, setPage] = useState(0);
  const { width } = useWindowDimensions();

  const slide = SLIDES[page] as Slide;
  const isLast = page === SLIDES.length - 1;

  const finish = () => {
    completeOnboarding();
    router.replace('/(tabs)/home');
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.skipRow}>
          <Button label={t('onboarding.skip')} variant="ghost" size="sm" onPress={finish} />
        </View>

        <View style={styles.center}>
          <View
            style={[
              styles.iconWrap,
              { width: width * 0.5, height: width * 0.5, backgroundColor: palette.primary + '22' },
            ]}
          >
            <MaterialCommunityIcons
              name={slide.icon}
              size={width * 0.25}
              color={palette.primary}
            />
          </View>
          <Text style={[TYPOGRAPHY.displayMedium, { color: palette.text.primary, marginTop: SPACING.lg, textAlign: 'center' }]}>
            {t(slide.titleKey)}
          </Text>
          <Text
            style={[
              TYPOGRAPHY.bodyLarge,
              { color: palette.text.secondary, marginTop: SPACING.sm, textAlign: 'center', paddingHorizontal: SPACING.md },
            ]}
          >
            {t(slide.descriptionKey)}
          </Text>
        </View>

        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === page ? palette.primary : palette.border,
                  width: i === page ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>

        <Button
          label={isLast ? t('onboarding.start') : t('onboarding.next')}
          variant="primary"
          icon={isLast ? 'rocket-launch' : 'arrow-right'}
          onPress={() => (isLast ? finish() : setPage((p) => p + 1))}
          fullWidth
          style={{ marginBottom: SPACING.lg }}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.md },
  iconWrap: {
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
    marginVertical: SPACING.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
