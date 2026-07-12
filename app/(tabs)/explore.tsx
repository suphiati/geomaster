/**
 * Keşfet sekmesi: ülke ansiklopedisi.
 * Arama, kıta filtresi ve sıralama ile filtrelenmiş ülke listesi.
 */

import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SearchBar } from '@/components/ui/SearchBar';
import { CountryCard } from '@/components/country/CountryCard';
import { SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useCountries, type CountrySortBy } from '@/hooks/useCountries';
import { useTheme } from '@/hooks/useTheme';
import type { Continent, Country } from '@/types';

const CONTINENT_FILTERS: readonly { labelKey: string; value: Continent | 'all' }[] = [
  { labelKey: 'explore.filterAll', value: 'all' },
  { labelKey: 'continents.Avrupa', value: 'Avrupa' },
  { labelKey: 'continents.Asya', value: 'Asya' },
  { labelKey: 'continents.Afrika', value: 'Afrika' },
  { labelKey: 'continents.Kuzey Amerika', value: 'Kuzey Amerika' },
  { labelKey: 'continents.Güney Amerika', value: 'Güney Amerika' },
  { labelKey: 'continents.Okyanusya', value: 'Okyanusya' },
];

const SORT_FILTERS: readonly { labelKey: string; value: CountrySortBy }[] = [
  { labelKey: 'explore.sortAZ', value: 'name' },
  { labelKey: 'explore.sortPopulation', value: 'population' },
  { labelKey: 'explore.sortArea', value: 'area' },
];

export default function ExploreTab() {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [continent, setContinent] = useState<Continent | 'all'>('all');
  const [sortBy, setSortBy] = useState<CountrySortBy>('name');
  const [desc, setDesc] = useState(false);

  const countries = useCountries({ search, continent, sortBy, desc });

  const handleCountryPress = useCallback(
    (country: Country) => {
      router.push({ pathname: '/country/[id]', params: { id: country.id } });
    },
    [router],
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[TYPOGRAPHY.h1, { color: palette.text.primary }]}>{t('explore.title')}</Text>
        <Text style={[TYPOGRAPHY.bodySm, { color: palette.text.secondary, marginTop: 2 }]}>
          {t('explore.countCount', { count: countries.length })}
        </Text>
      </View>

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder={t('explore.searchPlaceholder')}
        style={{ marginTop: SPACING.sm }}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={[styles.filterRow, { marginTop: SPACING.md }]}
      >
        {CONTINENT_FILTERS.map((c) => (
          <Chip
            key={c.value}
            label={t(c.labelKey)}
            selected={continent === c.value}
            onPress={() => setContinent(c.value)}
            style={{ marginRight: SPACING.sm }}
            accentColor={c.value !== 'all' ? palette.continents[c.value as Continent] : undefined}
          />
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={[styles.filterRow, { marginTop: SPACING.xs }]}
      >
        {SORT_FILTERS.map((s) => (
          <Chip
            key={s.value}
            label={t(s.labelKey)}
            icon={
              sortBy === s.value
                ? desc
                  ? 'arrow-down'
                  : 'arrow-up'
                : undefined
            }
            selected={sortBy === s.value}
            onPress={() => {
              if (sortBy === s.value) {
                setDesc((d) => !d);
              } else {
                setSortBy(s.value);
                setDesc(s.value !== 'name');
              }
            }}
            style={{ marginRight: SPACING.sm }}
          />
        ))}
      </ScrollView>

      <FlatList
        data={countries}
        keyExtractor={(c) => c.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
        renderItem={({ item }) => <CountryCard country={item} onPress={handleCountryPress} />}
        ListEmptyComponent={
          <EmptyState
            icon="map-search"
            title={t('explore.emptyTitle')}
            description={t('explore.emptyDesc')}
          />
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={10}
        removeClippedSubviews
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  filterRow: {
    flexGrow: 0,
    flexShrink: 0,
  },
  chipRow: {
    paddingVertical: SPACING.xs,
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
});
