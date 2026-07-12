/**
 * Komşu Zinciri: başlangıç → hedef. Her adımda mevcut ülkenin komşularını seç.
 * Optimal yol BFS ile hesaplanır; oyuncunun yolu karşılaştırılır.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Timer } from '@/components/quiz/Timer';
import { BORDER_RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { getCountryById } from '@/data/countries';
import { findShortestPath, getNeighbors, pickConnectedPair } from '@/engine/neighborPathfinder';
import { buildQuizResult } from '@/engine/scoringEngine';
import { useGameStore } from '@/stores/useGameStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTheme } from '@/hooks/useTheme';
import { localizedName } from '@/utils/localizedName';
import type { QuizResult } from '@/types';

const TIME_LIMIT_SEC = 120;

export default function NeighborChainScreen() {
  const router = useRouter();
  const { palette } = useTheme();
  const { t, i18n } = useTranslation();
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);

  const pair = useMemo(() => pickConnectedPair(3), []);
  const [path, setPath] = useState<string[]>(() => (pair ? [pair.from] : []));
  const [remaining, setRemaining] = useState(TIME_LIMIT_SEC);
  const [finished, setFinished] = useState(false);

  const startedAt = useMemo(() => Date.now(), []);
  const { addXP, recordQuizResult, registerPlayDay } = useGameStore.getState();

  // Geri sayım.
  useEffect(() => {
    if (finished || !pair) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setFinished(true);
          return 0;
        }
        return r - 1;
      });
    }, 1_000);
    return () => clearInterval(id);
  }, [finished, pair]);

  // Bittiğinde sonuç ekranına yönlendir.
  useEffect(() => {
    if (!finished || !pair) return;
    const reached = path[path.length - 1] === pair.to;
    const playerSteps = path.length - 1;
    const score = reached ? Math.round((pair.optimalSteps / Math.max(playerSteps, 1)) * 100) : 0;
    const xp = Math.round(score * 1.5);

    addXP(xp);
    recordQuizResult(reached ? 1 : 0, reached ? 0 : 1);
    registerPlayDay(new Date().toISOString().slice(0, 10));

    const r: QuizResult = buildQuizResult({
      mode: 'neighbor_chain',
      totalQuestions: 1,
      correctAnswers: reached ? 1 : 0,
      totalTimeMs: Date.now() - startedAt,
      bestStreak: 0,
      perAnswerXP: xp,
      newBadges: [],
    });
    router.replace({ pathname: '/quiz/result', params: encodeResult(r) });
  }, [finished, pair, path, startedAt, addXP, recordQuizResult, registerPlayDay, router]);

  if (!pair) {
    return (
      <ScreenContainer>
        <Stack.Screen options={{ title: t('quiz.modes.neighbor_chain') }} />
        <EmptyState
          icon="graph-outline"
          title={t('neighborChain.noPath')}
          description={t('neighborChain.noPathDesc')}
        />
        <Button label={t('common.back')} variant="secondary" onPress={() => router.back()} style={{ marginHorizontal: SPACING.lg }} />
      </ScreenContainer>
    );
  }

  const currentId = path[path.length - 1] as string;
  const currentCountry = getCountryById(currentId);
  const target = getCountryById(pair.to);
  const startCountry = getCountryById(pair.from);
  const neighbors = getNeighbors(currentId);

  const handlePick = (id: string) => {
    if (hapticsEnabled) Haptics.selectionAsync().catch(() => undefined);
    if (id === pair.to) {
      setPath((p) => [...p, id]);
      setFinished(true);
      return;
    }
    setPath((p) => [...p, id]);
  };

  const handleUndo = () => {
    if (path.length <= 1) return;
    setPath((p) => p.slice(0, -1));
  };

  const handleGiveUp = () => setFinished(true);

  return (
    <ScreenContainer edgeToEdge>
      <Stack.Screen options={{ title: t('quiz.modes.neighbor_chain') }} />
      <Timer remaining={remaining} total={TIME_LIMIT_SEC} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hedef göstergesi */}
        <Card variant="filled" style={{ borderColor: palette.primary + '55', borderWidth: 1 }}>
          <View style={styles.row}>
            <View style={styles.endpoint}>
              <Text style={styles.flag}>{startCountry?.flag.emoji}</Text>
              <Text style={[TYPOGRAPHY.captionBold, { color: palette.text.muted, marginTop: 2 }]}>{t('neighborChain.start')}</Text>
              <Text style={[TYPOGRAPHY.bodyBold, { color: palette.text.primary }]} numberOfLines={1}>
                {startCountry ? localizedName(startCountry, i18n.language) : ''}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-double-right" size={28} color={palette.primary} />
            <View style={styles.endpoint}>
              <Text style={styles.flag}>{target?.flag.emoji}</Text>
              <Text style={[TYPOGRAPHY.captionBold, { color: palette.text.muted, marginTop: 2 }]}>{t('neighborChain.target')}</Text>
              <Text style={[TYPOGRAPHY.bodyBold, { color: palette.text.primary }]} numberOfLines={1}>
                {target ? localizedName(target, i18n.language) : ''}
              </Text>
            </View>
          </View>
          <Text style={[TYPOGRAPHY.caption, { color: palette.text.muted, marginTop: SPACING.xs, textAlign: 'center' }]}>
            {t('neighborChain.optimalPath', { optimal: pair.optimalSteps, player: Math.max(0, path.length - 1) })}
          </Text>
        </Card>

        {/* Geçilen yol */}
        <View style={styles.pathRow}>
          {path.map((id, i) => {
            const c = getCountryById(id);
            return (
              <View
                key={`${id}-${i}`}
                style={[
                  styles.pathChip,
                  { backgroundColor: palette.surfaceElevated, borderColor: i === path.length - 1 ? palette.primary : palette.border },
                ]}
              >
                <Text style={{ fontSize: 16 }}>{c?.flag.emoji}</Text>
                <Text style={[TYPOGRAPHY.captionBold, { color: palette.text.primary, marginLeft: 4 }]} numberOfLines={1}>
                  {c ? localizedName(c, i18n.language) : ''}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Mevcut ülkenin komşuları */}
        <Text style={[TYPOGRAPHY.h3, { color: palette.text.primary, marginTop: SPACING.md }]}>
          {t('neighborChain.neighborsOf', { country: currentCountry ? localizedName(currentCountry, i18n.language) : '' })}
        </Text>
        <View style={styles.neighborWrap}>
          {neighbors.length === 0 ? (
            <Text style={[TYPOGRAPHY.body, { color: palette.text.muted }]}>
              {t('neighborChain.noNeighbors')}
            </Text>
          ) : (
            neighbors.map((nId) => {
              const n = getCountryById(nId);
              const label = n ? `${n.flag.emoji} ${localizedName(n, i18n.language)}` : nId;
              return (
                <Pressable
                  key={nId}
                  onPress={() => handlePick(nId)}
                  style={({ pressed }) => [
                    styles.neighborBtn,
                    { backgroundColor: palette.surface, borderColor: palette.border, opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Text style={[TYPOGRAPHY.body, { color: palette.text.primary }]} numberOfLines={1}>
                    {label}
                  </Text>
                </Pressable>
              );
            })
          )}
        </View>

        <View style={styles.actions}>
          <Button label={t('neighborChain.undo')} variant="secondary" icon="undo" onPress={handleUndo} disabled={path.length <= 1} />
          <Button label={t('neighborChain.giveUp')} variant="ghost" onPress={handleGiveUp} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const encodeResult = (r: QuizResult): Record<string, string> => ({
  mode: r.mode,
  total: String(r.totalQuestions),
  correct: String(r.correctAnswers),
  wrong: String(r.wrongAnswers),
  accuracy: r.accuracy.toFixed(4),
  totalTime: String(r.totalTime),
  xp: String(r.xpEarned),
  streakBonus: String(r.streakBonus),
  bestStreak: String(r.bestStreak),
  newBadges: JSON.stringify(r.newBadges),
});

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.xl, gap: SPACING.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  endpoint: { alignItems: 'center', flex: 1 },
  flag: { fontSize: 36 },
  pathRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginTop: SPACING.sm },
  pathChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  neighborWrap: { marginTop: SPACING.xs, gap: SPACING.xs },
  neighborBtn: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.lg, gap: SPACING.md },
});

export { findShortestPath };
