/**
 * Google Mobile Ads SDK'sını başlatır ve gerekiyorsa AB/UK kullanıcılarına
 * UMP (GDPR) onay formunu gösterir.
 *
 * Sıra önemlidir: önce onay toplanır, sonra SDK başlatılır. Böylece SDK
 * kullanıcının seçimine göre kişiselleştirilmiş/kişiselleştirilmemiş reklam sunar.
 * gatherConsent(), onay gerekmeyen bölgelerde (ör. TR) sessizce no-op çalışır.
 *
 * Reklamla ilgili hiçbir hata uygulamayı düşürmemeli; bu yüzden tüm hatalar yutulur
 * (SDK başlatılamazsa yalnızca banner'lar yüklenmez, uygulama normal çalışır).
 */

import { useEffect } from 'react';
import mobileAds, { AdsConsent } from 'react-native-google-mobile-ads';

export const useMobileAds = () => {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await AdsConsent.gatherConsent();
      } catch {
        // Onay akışı başarısız olsa bile devam: SDK kişiselleştirilmemiş reklam sunar.
      }
      if (cancelled) return;
      try {
        await mobileAds().initialize();
      } catch {
        // Başlatma başarısız: banner'lar yüklenmez, uygulama etkilenmez.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);
};
