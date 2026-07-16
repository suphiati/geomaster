/**
 * AdMob kimlikleri.
 *
 * ŞU AN GOOGLE'IN RESMİ TEST KİMLİKLERİ KULLANILIYOR — test reklamları görünür ama gelir getirmez.
 *
 * GERÇEK KİMLİKLERE GEÇERKEN (AdMob'da uygulama + banner ad unit oluşturulduktan sonra):
 *   1) Aşağıdaki PRODUCTION_BANNER_AD_UNIT_ID'yi doldur (ca-app-pub-XXXX/YYYY).
 *   2) app.json → plugins → react-native-google-mobile-ads → androidAppId / iosAppId
 *      değerlerini gerçek App ID ile (ca-app-pub-XXXX~YYYY) değiştir.
 *   3) Yeni build al (App ID native manifest'e gömülür; OTA ile değişmez).
 *
 * Kendi reklamlarına ASLA tıklama — AdMob hesabı kapatılır.
 */

import { TestIds } from 'react-native-google-mobile-ads';

/** Gerçek banner ad unit ID. Boş bırakılırsa güvenli şekilde test reklamına düşülür. */
const PRODUCTION_BANNER_AD_UNIT_ID = '';

/**
 * Geliştirmede her zaman test reklamı; üretimde gerçek ID varsa o, yoksa yine test.
 * (Geçersiz/boş ID ile canlıya çıkmak reklamların hiç yüklenmemesine yol açardı.)
 */
export const BANNER_AD_UNIT_ID: string =
  __DEV__ || !PRODUCTION_BANNER_AD_UNIT_ID ? TestIds.BANNER : PRODUCTION_BANNER_AD_UNIT_ID;

/** Gerçek kimlikler girildi mi? (Yayın öncesi kontrol / uyarı için.) */
export const IS_USING_TEST_ADS = BANNER_AD_UNIT_ID === TestIds.BANNER;
