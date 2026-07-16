/**
 * Alta yaslanan banner reklam.
 *
 * Yerleşim kuralı: yalnızca ana sekmelerde ve quiz SONUÇ ekranında kullanılır.
 * Quiz oynanışında (şıkların yanında) ASLA gösterilmez — yanlışlıkla tıklama
 * hem kötü UX hem de AdMob politika ihlali riskidir.
 *
 * Reklam yüklenemezse (ağ yok, envanter yok, kullanıcı onay vermedi) bileşen
 * hiç yer kaplamaz; böylece boş gri bir şerit kalmaz.
 */

import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { BANNER_AD_UNIT_ID } from '@/constants/ads';
import { useTheme } from '@/hooks/useTheme';

export const AdBanner = () => {
  const { palette } = useTheme();
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <View style={[styles.wrap, { backgroundColor: palette.background }]}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
