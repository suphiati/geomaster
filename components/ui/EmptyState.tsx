/**
 * Boş durum görseli — liste boş olduğunda veya arama sonuç vermediğinde gösterilir.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface EmptyStateProps {
  icon: IconName;
  title: string;
  description?: string;
}

export const EmptyState = ({ icon, title, description }: EmptyStateProps) => {
  const { palette } = useTheme();
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={56} color={palette.text.muted} />
      <Text style={[TYPOGRAPHY.h3, { color: palette.text.primary, marginTop: SPACING.md }]}>
        {title}
      </Text>
      {description ? (
        <Text
          style={[
            TYPOGRAPHY.body,
            { color: palette.text.secondary, marginTop: SPACING.xs, textAlign: 'center' },
          ]}
        >
          {description}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
  },
});
