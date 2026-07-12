/**
 * Cevap sonrası açıklama kartı + sonraki soruya geçiş butonu.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface ExplanationCardProps {
  isCorrect: boolean;
  explanation: string;
  onContinue: () => void;
  ctaLabel?: string;
}

export const ExplanationCard = ({
  isCorrect,
  explanation,
  onContinue,
  ctaLabel = 'Devam',
}: ExplanationCardProps) => {
  const { palette } = useTheme();
  const tone = isCorrect ? palette.success : palette.error;

  return (
    <Card variant="filled" style={{ ...styles.card, borderColor: tone + '55' }}>
      <View style={styles.row}>
        <MaterialCommunityIcons
          name={isCorrect ? 'check-decagram' : 'alert-decagram'}
          size={22}
          color={tone}
        />
        <Text style={[TYPOGRAPHY.h3, { color: tone, marginLeft: SPACING.sm }]}>
          {isCorrect ? 'Doğru!' : 'Yanlış'}
        </Text>
      </View>
      <Text
        style={[TYPOGRAPHY.body, { color: palette.text.primary, marginTop: SPACING.sm }]}
      >
        {explanation}
      </Text>
      <Button
        label={ctaLabel}
        variant="primary"
        onPress={onContinue}
        fullWidth
        style={{ marginTop: SPACING.md }}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
