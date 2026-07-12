/**
 * Ayarlar ekranı: dil, tema, ses, haptics + verileri sıfırla.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SPACING, TYPOGRAPHY, type ThemeMode } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useI18n';
import { useGameStore } from '@/stores/useGameStore';
import { useProgressStore } from '@/stores/useProgressStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { Locale } from '@/types';

interface RowProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  children: React.ReactNode;
}

const Row = ({ icon, label, children }: RowProps) => {
  const { palette } = useTheme();
  return (
    <View style={[styles.row, { borderBottomColor: palette.borderLight }]}>
      <View style={[styles.rowIcon, { backgroundColor: palette.primary + '22' }]}>
        <MaterialCommunityIcons name={icon} size={18} color={palette.primary} />
      </View>
      <Text style={[TYPOGRAPHY.body, { color: palette.text.primary, flex: 1 }]}>{label}</Text>
      <View>{children}</View>
    </View>
  );
};

export default function SettingsScreen() {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const { language, themeMode, soundEnabled, hapticsEnabled, setLanguage, setThemeMode, setSoundEnabled, setHapticsEnabled } =
    useSettingsStore();

  const handleReset = () => {
    Alert.alert(t('settings.title'), t('settings.resetConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.confirm'),
        style: 'destructive',
        onPress: () => {
          useGameStore.getState().reset();
          useProgressStore.getState().reset();
        },
      },
    ]);
  };

  const langs: readonly { code: Locale; label: string }[] = [
    { code: 'tr', label: 'Türkçe' },
    { code: 'en', label: 'English' },
  ];

  const themes: readonly { key: ThemeMode | 'system'; label: string }[] = [
    { key: 'system', label: t('settings.themeSystem') },
    { key: 'dark', label: t('settings.themeDark') },
    { key: 'light', label: t('settings.themeLight') },
  ];

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <ScreenContainer>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('settings.title'),
          headerStyle: { backgroundColor: palette.background },
          headerTintColor: palette.text.primary,
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: SPACING.md }}>
        {/* Dil */}
        <Card variant="filled" style={{ marginBottom: SPACING.md }}>
          <Text style={[TYPOGRAPHY.h3, { color: palette.text.primary }]}>{t('settings.language')}</Text>
          <View style={styles.chipsRow}>
            {langs.map((l) => (
              <Chip
                key={l.code}
                label={l.label}
                selected={language === l.code}
                onPress={() => setLanguage(l.code)}
                style={{ marginRight: SPACING.sm, marginTop: SPACING.xs }}
              />
            ))}
          </View>
        </Card>

        {/* Tema */}
        <Card variant="filled" style={{ marginBottom: SPACING.md }}>
          <Text style={[TYPOGRAPHY.h3, { color: palette.text.primary }]}>{t('settings.theme')}</Text>
          <View style={styles.chipsRow}>
            {themes.map((th) => (
              <Chip
                key={th.key}
                label={th.label}
                selected={themeMode === th.key}
                onPress={() => setThemeMode(th.key)}
                style={{ marginRight: SPACING.sm, marginTop: SPACING.xs }}
              />
            ))}
          </View>
        </Card>

        {/* Switch'ler */}
        <Card variant="filled" style={{ marginBottom: SPACING.md }}>
          <Row icon="volume-high" label={t('settings.sound')}>
            <Switch value={soundEnabled} onValueChange={setSoundEnabled} />
          </Row>
          <Row icon="vibrate" label={t('settings.haptics')}>
            <Switch value={hapticsEnabled} onValueChange={setHapticsEnabled} />
          </Row>
        </Card>

        {/* Hakkında */}
        <Card variant="filled" style={{ marginBottom: SPACING.md }}>
          <Row icon="information-outline" label={t('settings.version')}>
            <Text style={[TYPOGRAPHY.bodyBold, { color: palette.text.muted }]}>{version}</Text>
          </Row>
        </Card>

        {/* Sıfırla */}
        <Card
          variant="outlined"
          onPress={handleReset}
          style={{ borderColor: palette.error + '55' }}
          accessibilityLabel={t('settings.resetData')}
        >
          <View style={styles.resetRow}>
            <MaterialCommunityIcons name="delete-outline" size={20} color={palette.error} />
            <Text style={[TYPOGRAPHY.bodyBold, { color: palette.error, marginLeft: SPACING.sm }]}>
              {t('settings.resetData')}
            </Text>
          </View>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  resetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
