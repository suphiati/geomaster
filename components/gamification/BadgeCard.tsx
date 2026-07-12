/**
 * Tekil rozet kartı. Kazanılmış/kilitli durumuna göre renkli/gri görünür.
 */

import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { BORDER_RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { localized } from '@/utils/localizedName';
import type { Badge } from '@/types';

interface BadgeCardProps {
  badge: Badge;
  earned: boolean;
}

export const BadgeCard = ({ badge, earned }: BadgeCardProps) => {
  const { palette } = useTheme();
  const { t, i18n } = useTranslation();
  const rarityColor = palette.rarity[badge.rarity];

  return (
    <Card
      variant="filled"
      style={{
        ...styles.card,
        borderColor: earned ? rarityColor : palette.border,
        opacity: earned ? 1 : 0.55,
      }}
      accessibilityLabel={`${localized(badge.name, i18n.language)}, ${earned ? t('profile.earned') : t('profile.locked')}`}
    >
      <View style={[styles.iconWrap, { backgroundColor: rarityColor + (earned ? '33' : '11') }]}>
        <Text style={styles.icon}>{earned ? badge.icon : '🔒'}</Text>
      </View>
      <Text
        style={[TYPOGRAPHY.captionBold, { color: palette.text.primary, marginTop: SPACING.xs, textAlign: 'center' }]}
        numberOfLines={2}
      >
        {localized(badge.name, i18n.language)}
      </Text>
      <Text
        style={[TYPOGRAPHY.caption, { color: palette.text.muted, textAlign: 'center', marginTop: 2 }]}
        numberOfLines={3}
      >
        {localized(badge.description, i18n.language)}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '31%',
    minHeight: 140,
    alignItems: 'center',
    padding: SPACING.sm,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 28,
  },
});
