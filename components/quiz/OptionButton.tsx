/**
 * Quiz şık butonu.
 *  - default: nötr stil
 *  - selected: vurgulanır (cevap verilmeden önce)
 *  - correct: cevap sonrası yeşil
 *  - wrong: cevap sonrası kırmızı (kullanıcının seçtiği yanlış şık)
 *  - disabled: cevap sonrası diğer şıklar (etkileşime kapalı)
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { BORDER_RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export type OptionState = 'default' | 'selected' | 'correct' | 'wrong' | 'disabled';

interface OptionButtonProps {
  label: string;
  state?: OptionState;
  onPress?: () => void;
  /** Soru bayrak sorusu ise emoji şık olarak gösterilebilir. */
  emojiPrefix?: string;
  index?: number;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

const LETTER = ['A', 'B', 'C', 'D'];

export const OptionButton = ({
  label,
  state = 'default',
  onPress,
  emojiPrefix,
  index = 0,
  style,
  accessibilityLabel,
}: OptionButtonProps) => {
  const { palette } = useTheme();

  const colors = (() => {
    switch (state) {
      case 'correct':
        return {
          bg: palette.success + '22',
          border: palette.success,
          text: palette.success,
          icon: 'check-circle' as const,
        };
      case 'wrong':
        return {
          bg: palette.error + '22',
          border: palette.error,
          text: palette.error,
          icon: 'close-circle' as const,
        };
      case 'selected':
        return {
          bg: palette.primary + '22',
          border: palette.primary,
          text: palette.text.primary,
          icon: null,
        };
      case 'disabled':
        return {
          bg: palette.surfaceElevated,
          border: palette.border,
          text: palette.text.muted,
          icon: null,
        };
      case 'default':
      default:
        return {
          bg: palette.surface,
          border: palette.border,
          text: palette.text.primary,
          icon: null,
        };
    }
  })();

  const isInteractive = state === 'default' || state === 'selected';

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{
        selected: state === 'selected' || state === 'correct',
        disabled: !isInteractive,
      }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          opacity: state === 'disabled' ? 0.6 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.letterCircle, { backgroundColor: colors.border + '33' }]}>
          <Text style={[TYPOGRAPHY.captionBold, { color: colors.text }]}>
            {LETTER[index] ?? '•'}
          </Text>
        </View>
        <View style={styles.textWrap}>
          {emojiPrefix ? (
            <Text style={styles.emoji} accessibilityElementsHidden>
              {emojiPrefix}
            </Text>
          ) : null}
          <Text
            style={[TYPOGRAPHY.bodyBold, { color: colors.text, flexShrink: 1 }]}
            numberOfLines={3}
          >
            {label}
          </Text>
        </View>
        {colors.icon ? (
          <MaterialCommunityIcons name={colors.icon} size={22} color={colors.border} />
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  letterCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  textWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
});
