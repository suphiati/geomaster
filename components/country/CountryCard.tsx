/**
 * Liste içinde tek bir ülkeyi temsil eden kompakt kart.
 * Bayrak emoji + isim + başkent + kıta etiketi.
 */

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { localizedName } from '@/utils/localizedName';
import type { Country } from '@/types';

interface CountryCardProps {
  country: Country;
  onPress?: (country: Country) => void;
}

const CountryCardImpl = ({ country, onPress }: CountryCardProps) => {
  const { palette } = useTheme();
  const { t, i18n } = useTranslation();
  const continentColor = palette.continents[country.continent];

  return (
    <Card
      variant="outlined"
      onPress={onPress ? () => onPress(country) : undefined}
      accessibilityLabel={`${localizedName(country, i18n.language)}, başkenti ${country.capital.name}, ${t(`continents.${country.continent}`)}`}
      style={styles.card}
    >
      <View style={styles.row}>
        <Text style={styles.flag} accessibilityElementsHidden>
          {country.flag.emoji}
        </Text>
        <View style={styles.info}>
          <Text
            style={[TYPOGRAPHY.bodyBold, { color: palette.text.primary }]}
            numberOfLines={2}
          >
            {localizedName(country, i18n.language)}
          </Text>
          <Text
            style={[TYPOGRAPHY.bodySm, { color: palette.text.secondary, marginTop: 2 }]}
            numberOfLines={1}
          >
            {country.capital.name}
          </Text>
        </View>
        <Badge label={t(`continents.${country.continent}`)} color={continentColor} subtle />
      </View>
    </Card>
  );
};

export const CountryCard = memo(CountryCardImpl);

const styles = StyleSheet.create({
  card: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  info: {
    flex: 1,
  },
});
