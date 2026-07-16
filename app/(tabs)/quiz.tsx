/**
 * Quiz tab — oyun modu seçim ekranı.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { AdBanner } from '@/components/ads/AdBanner';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { BORDER_RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { QUIZ_MODES, type QuizModeMeta } from '@/data/quizModes';
import { useTheme } from '@/hooks/useTheme';

export default function QuizTab() {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const handleSelect = (meta: QuizModeMeta) => {
    if (!meta.available) return;
    router.push(`/quiz/${meta.route}` as never);
  };

  return (
    <ScreenContainer hasTabBar>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[TYPOGRAPHY.h1, { color: palette.text.primary }]}>{t('quiz.title')}</Text>
          <Text style={[TYPOGRAPHY.bodySm, { color: palette.text.secondary, marginTop: 2 }]}>
            {t('quiz.subtitle')}
          </Text>
        </View>

        <View style={styles.grid}>
          {QUIZ_MODES.map((meta) => {
            const accent = palette[meta.accentKey];
            const title = t(`quiz.modes.${meta.mode}`);
            return (
              <Card
                key={meta.mode}
                variant="filled"
                onPress={() => handleSelect(meta)}
                accessibilityLabel={`${title}${meta.available ? '' : ' — kilitli'}`}
                style={{
                  ...styles.modeCard,
                  borderColor: accent + '44',
                  borderWidth: 1,
                  opacity: meta.available ? 1 : 0.55,
                }}
              >
                <View
                  style={[
                    styles.iconBg,
                    { backgroundColor: accent + '22' },
                  ]}
                >
                  <MaterialCommunityIcons name={meta.icon} size={28} color={accent} />
                </View>
                <Text
                  style={[TYPOGRAPHY.h3, { color: palette.text.primary, marginTop: SPACING.sm }]}
                  numberOfLines={1}
                >
                  {title}
                </Text>
                <Text
                  style={[
                    TYPOGRAPHY.bodySm,
                    { color: palette.text.secondary, marginTop: 4 },
                  ]}
                  numberOfLines={2}
                >
                  {t(`quiz.modeDesc.${meta.mode}`)}
                </Text>
                {!meta.available ? (
                  <View
                    style={[
                      styles.lockBadge,
                      { backgroundColor: palette.surfacePressed, borderColor: palette.border },
                    ]}
                  >
                    <MaterialCommunityIcons name="lock" size={12} color={palette.text.muted} />
                    <Text
                      style={[
                        TYPOGRAPHY.caption,
                        { color: palette.text.muted, marginLeft: 4 },
                      ]}
                    >
                      {t('quiz.lockedSoon')}
                    </Text>
                  </View>
                ) : null}
              </Card>
            );
          })}
        </View>
      </ScrollView>
      <AdBanner />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // Banner alta yaslansın diye ScrollView kalan alanı kaplamalı.
  scrollView: {
    flex: 1,
  },
  scroll: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  header: {
    paddingBottom: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modeCard: {
    width: '48%',
    minHeight: 150,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
});
