/**
 * Günlük Challenge.
 * Her gün deterministik bir ülke seçilir; 6 ipucu, max 6 tahmin hakkı.
 * Skor: (6 - kullanılan_ipucu) × 50 XP + (5 - tahmin_sayısı) × 10.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SearchBar } from '@/components/ui/SearchBar';
import { BORDER_RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { ALL_COUNTRIES, getCountryById } from '@/data/countries';
import { getDailyChallenge } from '@/engine/dailyChallengeEngine';
import { useGameStore } from '@/stores/useGameStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTheme } from '@/hooks/useTheme';

const MAX_GUESSES = 6;

export default function DailyChallengeScreen() {
  const router = useRouter();
  const { palette } = useTheme();
  const { t } = useTranslation();
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);

  const challenge = useMemo(() => getDailyChallenge(), []);
  const [hintsRevealed, setHintsRevealed] = useState(1); // İlk ipucu hep açık.
  const [guesses, setGuesses] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [solved, setSolved] = useState(false);
  const [done, setDone] = useState(false);

  const { addXP, registerPlayDay } = useGameStore.getState();

  const filtered = useMemo(() => {
    if (!search) return [];
    const q = search.toLocaleLowerCase('tr-TR');
    return ALL_COUNTRIES
      .filter((c) => c.name.tr.toLocaleLowerCase('tr-TR').includes(q) || c.name.en.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 6);
  }, [search]);

  const guessesLeft = MAX_GUESSES - guesses.length;

  const reward = (): number => {
    const ipucuPuan = Math.max(0, (6 - hintsRevealed)) * 50;
    const tahminPuan = Math.max(0, (MAX_GUESSES - guesses.length)) * 10;
    return ipucuPuan + tahminPuan;
  };

  const finishWith = (won: boolean) => {
    setSolved(won);
    setDone(true);
    const xp = won ? reward() : 10;
    addXP(xp);
    registerPlayDay(new Date().toISOString().slice(0, 10));
  };

  const submit = (countryId: string) => {
    if (done) return;
    if (hapticsEnabled) Haptics.selectionAsync().catch(() => undefined);
    const isCorrect = countryId === challenge.country.id;
    setGuesses((g) => [...g, countryId]);
    setSearch('');

    if (isCorrect) {
      if (hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      }
      finishWith(true);
      return;
    }

    if (guesses.length + 1 >= MAX_GUESSES) {
      finishWith(false);
      return;
    }
    // Yanlış tahminde bir sonraki ipucunu aç.
    if (hintsRevealed < challenge.hints.length) {
      setHintsRevealed((h) => h + 1);
    }
  };

  const handleHintReveal = () => {
    if (hintsRevealed >= challenge.hints.length || done) return;
    setHintsRevealed((h) => h + 1);
  };

  return (
    <ScreenContainer edgeToEdge>
      <Stack.Screen options={{ title: t('quiz.modes.daily_challenge') }} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card variant="filled" style={{ borderColor: palette.accent + '55', borderWidth: 1 }}>
          <View style={styles.headerRow}>
            <MaterialCommunityIcons name="calendar-star" size={24} color={palette.accent} />
            <Text style={[TYPOGRAPHY.h3, { color: palette.text.primary, marginLeft: SPACING.sm }]}>
              {challenge.date}
            </Text>
          </View>
          <Text style={[TYPOGRAPHY.body, { color: palette.text.secondary, marginTop: SPACING.xs }]}>
            {t('daily.instruction')}
          </Text>
          <View style={[styles.guessRow, { marginTop: SPACING.sm }]}>
            {Array.from({ length: MAX_GUESSES }).map((_, i) => {
              const guessed = guesses[i];
              const tone =
                guessed === challenge.country.id
                  ? palette.success
                  : guessed
                  ? palette.error
                  : palette.surfaceElevated;
              return (
                <View
                  key={i}
                  style={[
                    styles.guessDot,
                    { backgroundColor: tone, borderColor: palette.border },
                  ]}
                >
                  {guessed ? (
                    <MaterialCommunityIcons
                      name={guessed === challenge.country.id ? 'check' : 'close'}
                      size={14}
                      color={palette.text.inverse}
                    />
                  ) : null}
                </View>
              );
            })}
          </View>
        </Card>

        {/* İpuçları */}
        <View style={styles.hintWrap}>
          {challenge.hints.slice(0, hintsRevealed).map((h) => (
            <View
              key={h.index}
              style={[
                styles.hint,
                { backgroundColor: palette.info + '22', borderColor: palette.info + '55' },
              ]}
            >
              <Text style={[TYPOGRAPHY.captionBold, { color: palette.info, marginRight: SPACING.xs }]}>
                #{h.index}
              </Text>
              <Text style={[TYPOGRAPHY.body, { color: palette.text.primary, flex: 1 }]}>
                {h.text}
              </Text>
            </View>
          ))}
          {!done && hintsRevealed < challenge.hints.length ? (
            <Button label={t('daily.revealHint')} variant="ghost" icon="lightbulb-outline" onPress={handleHintReveal} />
          ) : null}
        </View>

        {/* Tahmin alanı / Sonuç */}
        {done ? (
          <Card variant="filled" style={{ borderColor: solved ? palette.success : palette.error, borderWidth: 1 }}>
            <Text style={[TYPOGRAPHY.h2, { color: solved ? palette.success : palette.error }]}>
              {solved ? t('daily.congrats') : t('daily.failed')}
            </Text>
            <Text style={[TYPOGRAPHY.body, { color: palette.text.primary, marginTop: SPACING.xs }]}>
              {t('daily.answerLabel')} {challenge.country.flag.emoji} {challenge.country.name.tr}
            </Text>
            <Text style={[TYPOGRAPHY.bodySm, { color: palette.text.secondary, marginTop: SPACING.xs }]}>
              {solved ? t('daily.xpWon', { xp: reward() }) : t('daily.xpConsolation')}
            </Text>
            <Text style={[TYPOGRAPHY.caption, { color: palette.text.muted, marginTop: SPACING.sm }]}>
              {challenge.country.funFacts[0] ?? challenge.country.flag.description}
            </Text>
            <Button label={t('daily.finish')} variant="primary" onPress={() => router.replace('/(tabs)/quiz')} fullWidth style={{ marginTop: SPACING.md }} />
          </Card>
        ) : (
          <>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder={t('daily.guessPlaceholder', { left: guessesLeft })}
            />
            {filtered.length > 0 ? (
              <Card variant="filled" bare>
                {filtered.map((c) => (
                  <Button
                    key={c.id}
                    label={`${c.flag.emoji}  ${c.name.tr}`}
                    variant="ghost"
                    onPress={() => submit(c.id)}
                    style={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
                  />
                ))}
              </Card>
            ) : null}
            {guesses.length > 0 ? (
              <View style={styles.previousGuesses}>
                <Text style={[TYPOGRAPHY.captionBold, { color: palette.text.muted }]}>{t('daily.previousGuesses')}</Text>
                {guesses.map((id, i) => {
                  const c = getCountryById(id);
                  return (
                    <Text key={`${id}-${i}`} style={[TYPOGRAPHY.body, { color: palette.error }]}>
                      ✗ {c?.flag.emoji} {c?.name.tr}
                    </Text>
                  );
                })}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: SPACING.xl, gap: SPACING.md },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  guessRow: { flexDirection: 'row', gap: SPACING.xs },
  guessDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  hintWrap: { gap: SPACING.xs },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  previousGuesses: { gap: SPACING.xs, marginTop: SPACING.sm },
});
