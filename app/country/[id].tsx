/**
 * Ülke detay sayfası.
 * Bayrak + isim + tüm coğrafi/siyasi/kültürel bilgiler.
 */

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatRow } from '@/components/country/StatRow';
import { BORDER_RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { getCountryById, getCountryByAnyCode } from '@/data/countries';
import { useTheme } from '@/hooks/useTheme';
import { formatArea, formatNumber, formatPopulation, formatRecurringDate } from '@/utils/formatters';
import { localizedName } from '@/utils/localizedName';

export default function CountryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { palette } = useTheme();
  const { t, i18n } = useTranslation();

  const country = id ? getCountryById(id) : undefined;

  if (!country) {
    return (
      <ScreenContainer>
        <Stack.Screen options={{ title: t('country.notFound') }} />
        <EmptyState
          icon="map-marker-question"
          title={t('country.notFound')}
          description={t('country.notFoundDesc', { id: id ?? '?' })}
        />
      </ScreenContainer>
    );
  }

  const continentColor = palette.continents[country.continent];
  const difficultyColor = palette.difficulty[country.difficulty];

  return (
    <ScreenContainer edgeToEdge>
      <Stack.Screen
        options={{
          title: localizedName(country, i18n.language),
          headerStyle: { backgroundColor: palette.background },
          headerTintColor: palette.text.primary,
        }}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View
          style={[
            styles.hero,
            { backgroundColor: continentColor + '22', borderColor: continentColor + '44' },
          ]}
        >
          <Text style={styles.flag} accessibilityElementsHidden>
            {country.flag.emoji}
          </Text>
          <Text style={[TYPOGRAPHY.h1, { color: palette.text.primary, marginTop: SPACING.sm }]}>
            {localizedName(country, i18n.language)}
          </Text>
          <Text style={[TYPOGRAPHY.bodySm, { color: palette.text.secondary }]}>
            {i18n.language.startsWith('en') ? country.name.official.en : country.name.official.tr}
          </Text>
          <View style={styles.heroRow}>
            <Badge label={t(`continents.${country.continent}`)} color={continentColor} />
            <View style={{ width: SPACING.sm }} />
            <Badge label={t(`difficulty.${country.difficulty}`)} color={difficultyColor} subtle />
          </View>
        </View>

        {/* Genel */}
        <Card variant="filled" style={styles.section}>
          <Text style={[TYPOGRAPHY.h3, styles.sectionTitle, { color: palette.text.primary }]}>
            {t('country.general')}
          </Text>
          <StatRow icon="map-marker" label={t('country.capital')} value={country.capital.name} />
          <StatRow icon="account-group" label={t('country.population')} value={`${formatNumber(country.population)} (${formatPopulation(country.population)})`} />
          <StatRow icon="vector-square" label={t('country.area')} value={formatArea(country.area)} />
          {country.coastlineKm > 0 ? (
            <StatRow icon="waves" label={t('country.coastline')} value={`${formatNumber(country.coastlineKm)} km`} />
          ) : null}
          <StatRow icon="translate" label={t('country.languages')} value={country.languages.official.join(', ')} />
          <StatRow
            icon="cash-multiple"
            label={t('country.currency')}
            value={`${country.currency.name.tr} (${country.currency.symbol})`}
          />
        </Card>

        {/* Siyasi */}
        <Card variant="filled" style={styles.section}>
          <Text style={[TYPOGRAPHY.h3, styles.sectionTitle, { color: palette.text.primary }]}>
            {t('country.political')}
          </Text>
          <StatRow icon="bank" label={t('country.government')} value={country.governmentType || '—'} />
          {country.independenceDate ? (
            <StatRow icon="flag-variant" label={t('country.independence')} value={country.independenceDate} />
          ) : null}
          {country.unMemberSince ? (
            <StatRow icon="earth" label={t('country.unMembership')} value={String(country.unMemberSince)} />
          ) : null}
          {country.memberships.length > 0 ? (
            <StatRow icon="handshake" label={t('country.memberships')} value={country.memberships.join(', ')} />
          ) : null}
        </Card>

        {/* Pratik */}
        <Card variant="filled" style={styles.section}>
          <Text style={[TYPOGRAPHY.h3, styles.sectionTitle, { color: palette.text.primary }]}>
            {t('country.practical')}
          </Text>
          <StatRow icon="phone" label={t('country.callingCode')} value={country.callingCode} />
          <StatRow icon="web" label={t('country.tld')} value={country.tld} />
          <StatRow
            icon={country.drivingSide === 'left' ? 'steering' : 'steering'}
            label={t('country.drivingSide')}
            value={country.drivingSide === 'left' ? t('country.drivingLeft') : t('country.drivingRight')}
          />
          {country.timezones.length > 0 ? (
            <StatRow icon="clock-outline" label={t('country.timezone')} value={country.timezones.join(', ')} />
          ) : null}
          {country.nationalDay ? (
            <StatRow
              icon="calendar-star"
              label={t('country.nationalDay')}
              value={`${formatRecurringDate(country.nationalDay.date)} — ${country.nationalDay.name}`}
            />
          ) : null}
        </Card>

        {/* Komşular */}
        {country.neighbors.length > 0 ? (
          <Card variant="filled" style={styles.section}>
            <Text style={[TYPOGRAPHY.h3, styles.sectionTitle, { color: palette.text.primary }]}>
              {t('country.neighbors')} ({country.neighbors.length})
            </Text>
            <View style={styles.chipsWrap}>
              {country.neighbors.map((nId) => {
                const n = getCountryByAnyCode(nId);
                if (!n) return null;
                return (
                  <Chip
                    key={nId}
                    label={`${n.flag.emoji} ${localizedName(n, i18n.language)} (${n.id})`}
                    onPress={() => router.push({ pathname: '/country/[id]', params: { id: n.id } })}
                    style={{ marginRight: SPACING.xs, marginBottom: SPACING.xs }}
                  />
                );
              })}
            </View>
          </Card>
        ) : null}

        {/* Coğrafya */}
        {country.highestPoint.name || country.longestRiver || country.largestLake ? (
          <Card variant="filled" style={styles.section}>
            <Text style={[TYPOGRAPHY.h3, styles.sectionTitle, { color: palette.text.primary }]}>
              {t('country.geography')}
            </Text>
            {country.highestPoint.name ? (
              <StatRow
                icon="image-filter-hdr"
                label={t('country.highestPoint')}
                value={`${country.highestPoint.name} (${formatNumber(country.highestPoint.elevation)} m)`}
              />
            ) : null}
            {country.longestRiver ? (
              <StatRow
                icon="waves"
                label={t('country.longestRiver')}
                value={`${country.longestRiver.name} — ${formatNumber(country.longestRiver.lengthKm)} km`}
              />
            ) : null}
            {country.largestLake ? (
              <StatRow
                icon="waves"
                label={t('country.largestLake')}
                value={`${country.largestLake.name} — ${formatNumber(country.largestLake.areaKm2)} km²`}
              />
            ) : null}
          </Card>
        ) : null}

        {/* Şehirler */}
        {country.majorCities.length > 0 ? (
          <Card variant="filled" style={styles.section}>
            <Text style={[TYPOGRAPHY.h3, styles.sectionTitle, { color: palette.text.primary }]}>
              {t('country.majorCities')}
            </Text>
            {country.majorCities.map((city) => (
              <StatRow
                key={city.name}
                icon={city.isCapital ? 'star' : 'city'}
                iconColor={city.isCapital ? palette.accent : palette.primary}
                label={city.region ?? '—'}
                value={`${city.name} — ${formatPopulation(city.population)}`}
              />
            ))}
          </Card>
        ) : null}

        {/* Eğlenceli Bilgiler */}
        {country.funFacts.length > 0 ? (
          <Card variant="filled" style={styles.section}>
            <Text style={[TYPOGRAPHY.h3, styles.sectionTitle, { color: palette.text.primary }]}>
              {t('country.funFacts')}
            </Text>
            {country.funFacts.map((fact, i) => (
              <View
                key={i}
                style={[
                  styles.factRow,
                  i === country.funFacts.length - 1 ? null : styles.factDivider,
                  { borderBottomColor: palette.borderLight },
                ]}
              >
                <Text style={[TYPOGRAPHY.body, { color: palette.text.primary }]}>
                  {`• ${fact}`}
                </Text>
              </View>
            ))}
          </Card>
        ) : null}

        {/* Bayrak detayı */}
        <Card variant="filled" style={styles.section}>
          <Text style={[TYPOGRAPHY.h3, styles.sectionTitle, { color: palette.text.primary }]}>
            {t('country.flag')}
          </Text>
          <Text style={[TYPOGRAPHY.body, { color: palette.text.primary }]}>
            {country.flag.description}
          </Text>
          <Text style={[TYPOGRAPHY.bodySm, { color: palette.text.muted, marginTop: SPACING.xs }]}>
            {t('country.colors')}: {country.flag.colors.join(', ')}
          </Text>
        </Card>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  hero: {
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    marginTop: SPACING.md,
  },
  heroRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },
  flag: {
    fontSize: 80,
  },
  section: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    marginBottom: SPACING.xs,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  factRow: {
    paddingVertical: SPACING.xs + 2,
  },
  factDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
