/**
 * Analytics + crash reporting soyutlaması.
 *
 * Şu an: console-based stub.
 * Production'da Sentry ve Firebase Analytics ile değiştirilecek:
 *   1) `npx expo install @sentry/react-native expo-firebase-analytics`
 *   2) Sentry.init(...) → app/_layout.tsx içinde root mount.
 *   3) trackEvent fonksiyonunu Analytics.logEvent ile bağla.
 */

export type AnalyticsEvent =
  | { name: 'quiz_start'; mode: string; difficulty?: string }
  | { name: 'quiz_complete'; mode: string; correct: number; total: number; xp: number }
  | { name: 'badge_earned'; badgeId: string }
  | { name: 'level_up'; level: number }
  | { name: 'country_view'; countryId: string }
  | { name: 'settings_change'; key: string; value: string };

/**
 * İz olay gönderir. Üretimde Firebase'e iletilir.
 * @param event
 */
export const trackEvent = (event: AnalyticsEvent): void => {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[analytics]', event);
  }
  // TODO: Firebase Analytics.logEvent(event.name, event)
};

/**
 * Hata raporu yollar. Üretimde Sentry'e iletilir.
 */
export const reportError = (error: unknown, context?: Record<string, string>): void => {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.error('[error]', error, context);
  }
  // TODO: Sentry.captureException(error, { extra: context });
};

/**
 * Kullanıcıyı kimliklendirir (anonim ID önerilir).
 */
export const identifyUser = (userId: string | null): void => {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[analytics] identify', userId);
  }
  // TODO: Sentry.setUser({ id: userId }); Analytics.setUserId(userId);
};
