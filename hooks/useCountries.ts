/**
 * Ülke listesi üzerinde arama, filtreleme, sıralama yapan saf hook.
 * Bellek-içi veri üzerinde çalışır; SQLite gerekmez.
 */

import { useMemo } from 'react';

import { ALL_COUNTRIES } from '@/data/countries';
import type { Continent, Country } from '@/types';

export type CountrySortBy = 'name' | 'population' | 'area';

interface UseCountriesOptions {
  search?: string;
  continent?: Continent | 'all';
  sortBy?: CountrySortBy;
  /** Azalan sıralama. */
  desc?: boolean;
}

const normalize = (s: string): string =>
  s.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[̀-ͯ]/g, '');

const matchesSearch = (country: Country, q: string): boolean => {
  if (!q) return true;
  const needle = normalize(q);
  return (
    normalize(country.name.tr).includes(needle) ||
    normalize(country.name.en).includes(needle) ||
    normalize(country.capital.name).includes(needle) ||
    country.id.toLowerCase().includes(needle)
  );
};

const compare = (a: Country, b: Country, by: CountrySortBy): number => {
  switch (by) {
    case 'name':
      return a.name.tr.localeCompare(b.name.tr, 'tr-TR');
    case 'population':
      return a.population - b.population;
    case 'area':
      return a.area - b.area;
  }
};

/**
 * Filtrelenmiş ve sıralanmış ülke listesini döner.
 * Sonuç memoized — opts değişmedikçe yeniden hesaplanmaz.
 */
export const useCountries = ({
  search = '',
  continent = 'all',
  sortBy = 'name',
  desc = false,
}: UseCountriesOptions = {}): Country[] =>
  useMemo(() => {
    const filtered = ALL_COUNTRIES.filter((c) => {
      if (continent !== 'all' && c.continent !== continent) return false;
      if (!matchesSearch(c, search)) return false;
      return true;
    });

    const sorted = [...filtered].sort((a, b) => compare(a, b, sortBy));
    return desc ? sorted.reverse() : sorted;
  }, [search, continent, sortBy, desc]);
