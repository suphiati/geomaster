/**
 * Sayı ve tarih formatlama yardımcıları.
 * Türkçe locale öncelikli; ileride i18n ile dinamikleşecek.
 */

const NUMBER_FORMATTER = new Intl.NumberFormat('tr-TR');

/**
 * Sayıyı binlik ayırıcılı formatta döner.
 * @example formatNumber(1234567) → "1.234.567"
 */
export const formatNumber = (n: number): string => NUMBER_FORMATTER.format(n);

/**
 * Yüzölçümü/alan formatı (km²).
 */
export const formatArea = (km2: number): string => `${formatNumber(km2)} km²`;

/**
 * Nüfusu insan dostu kısaltmayla döner.
 * @example formatPopulation(1_400_000_000) → "1,4 Mr"
 *          formatPopulation(85_000_000) → "85 Mn"
 *          formatPopulation(500_000) → "500 B"
 */
export const formatPopulation = (n: number): string => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace('.', ',')} Mr`;
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)} Mn`;
  if (n >= 1_000) return `${Math.round(n / 1_000)} B`;
  return formatNumber(n);
};

/**
 * Yıllık tekrar eden tarihi okunur metne çevirir (örn. "--10-29" → "29 Ekim").
 */
const TR_MONTHS: readonly string[] = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

export const formatRecurringDate = (iso: string): string => {
  // Beklenen formatlar: '--MM-DD' veya 'YYYY-MM-DD'
  const m = iso.match(/(\d{2})-(\d{2})$/);
  if (!m) return iso;
  const month = parseInt(m[1] ?? '0', 10);
  const day = parseInt(m[2] ?? '0', 10);
  if (!month || !day) return iso;
  return `${day} ${TR_MONTHS[month - 1] ?? ''}`.trim();
};
