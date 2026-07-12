/**
 * Kıta bazlı ilerleme — kullanıcı her kıtada kaç ülkede mastery'ye ulaşmış.
 * Profile ekranında özet olarak gösterilir.
 */

import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SPACING, TYPOGRAPHY } from '@/constants/theme';
import { ALL_COUNTRIES } from '@/data/countries';
import { useProgressStore } from '@/stores/useProgressStore';
import { useTheme } from '@/hooks/useTheme';
import type { Continent } from '@/types';

const CONTINENTS: readonly Continent[] = [
  'Avrupa',
  'Asya',
  'Afrika',
  'Kuzey Amerika',
  'Güney Amerika',
  'Okyanusya',
];

export const ContinentProgress = () => {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const byCountry = useProgressStore((s) => s.byCountry);

  const stats = CONTINENTS.map((cont) => {
    const total = ALL_COUNTRIES.filter((c) => c.continent === cont).length;
    const mastered = ALL_COUNTRIES.filter(
      (c) => c.continent === cont && byCountry[c.id]?.mastered,
    ).length;
    return { continent: cont, total, mastered, ratio: total === 0 ? 0 : mastered / total };
  });

  return (
    <Card variant="filled">
      <Text style={[TYPOGRAPHY.h3, { color: palette.text.primary }]}>{t('profile.continentProgress')}</Text>
      <View style={{ marginTop: SPACING.sm, gap: SPACING.sm }}>
        {stats.map((s) => (
          <View key={s.continent}>
            <View style={styles.row}>
              <Text style={[TYPOGRAPHY.bodySm, { color: palette.text.primary }]}>{t(`continents.${s.continent}`)}</Text>
              <Text style={[TYPOGRAPHY.captionBold, { color: palette.text.muted }]}>
                {s.mastered} / {s.total}
              </Text>
            </View>
            <ProgressBar
              progress={s.ratio}
              fillColor={palette.continents[s.continent]}
              style={{ marginTop: 4 }}
            />
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
});
