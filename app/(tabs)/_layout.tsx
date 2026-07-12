/**
 * Alt tab navigasyon yapılandırması.
 * 4 tab: Anasayfa, Keşfet, Quiz, Profil.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TYPOGRAPHY } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface TabConfig {
  name: string;
  icon: IconName;
  iconActive: IconName;
}

const TABS: readonly TabConfig[] = [
  { name: 'home', icon: 'home-outline', iconActive: 'home' },
  { name: 'explore', icon: 'earth', iconActive: 'earth' },
  { name: 'quiz', icon: 'help-circle-outline', iconActive: 'help-circle' },
  { name: 'profile', icon: 'account-outline', iconActive: 'account' },
];

export default function TabLayout() {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.text.muted,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
          height: 64 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          ...TYPOGRAPHY.captionBold,
          fontSize: 11,
        },
      }}
    >
      {TABS.map(({ name, icon, iconActive }) => {
        const title = t(`tabs.${name}`);
        return (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarAccessibilityLabel: title,
            tabBarIcon: ({ color, focused, size }) => (
              <MaterialCommunityIcons
                name={focused ? iconActive : icon}
                size={size ?? 26}
                color={color}
              />
            ),
          }}
        />
        );
      })}
    </Tabs>
  );
}
