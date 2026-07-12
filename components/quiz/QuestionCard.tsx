/**
 * Soru kartı — soru metni ve (varsa) bayrak emoji medyası.
 */

import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { BORDER_RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import type { Question } from '@/types';

interface QuestionCardProps {
  question: Question;
}

export const QuestionCard = ({ question }: QuestionCardProps) => {
  const { palette } = useTheme();
  const showFlagMedia = question.media?.type === 'flag_emoji';

  return (
    <Card variant="filled" style={styles.card}>
      {showFlagMedia ? (
        <View
          style={[
            styles.flagBox,
            { backgroundColor: palette.surfacePressed, borderColor: palette.border },
          ]}
        >
          <Text style={styles.flag} accessibilityLabel="Bayrak görseli">
            {question.media?.value ?? ''}
          </Text>
        </View>
      ) : null}
      <Text
        style={[TYPOGRAPHY.h3, { color: palette.text.primary, lineHeight: 28 }]}
        accessibilityRole="header"
      >
        {question.questionText}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: 140,
    justifyContent: 'center',
  },
  flagBox: {
    alignSelf: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  flag: {
    fontSize: 80,
    textAlign: 'center',
  },
});
