/**
 * Arama input'u — sol arama ikonu, sağ temizleme butonu.
 * Controlled bileşen (değer dışarıdan yönetilir).
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View, type ViewStyle } from 'react-native';

import { BORDER_RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  autoFocus?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Ara...',
  onClear,
  autoFocus = false,
  style,
  accessibilityLabel,
}: SearchBarProps) => {
  const { palette } = useTheme();
  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: palette.surfaceElevated, borderColor: palette.border },
        style,
      ]}
    >
      <MaterialCommunityIcons
        name="magnify"
        size={20}
        color={palette.text.muted}
        style={{ marginRight: SPACING.sm }}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.text.muted}
        autoFocus={autoFocus}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        style={[
          styles.input,
          TYPOGRAPHY.body,
          { color: palette.text.primary },
        ]}
        underlineColorAndroid="transparent"
      />
      {value.length > 0 ? (
        <Pressable
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel="Aramayı temizle"
          hitSlop={8}
        >
          <MaterialCommunityIcons name="close-circle" size={18} color={palette.text.muted} />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    padding: 0,
  },
});
