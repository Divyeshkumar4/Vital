import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text as RNText, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Pill } from '@/components/Pill';
import { CircularProgress } from '@/components/CircularProgress';
import { useAuth } from '@/store/auth';
import { useProfile } from '@/store/profile';
import { compute } from '@/lib/science';
import type { ScienceInput, ScienceResult } from '@/lib/science';
import { deleteLog, getLogsForDate } from '@/features/log/queries';
import { MEAL_SLOTS, sumLogs, todayISO, type FoodLog, type MealSlot } from '@/features/log/types';
import { tokens } from '@/lib/design/tokens';
import { t } from '@/i18n/strings';

const MEAL_LABELS: Record<MealSlot, string> = {
  breakfast: t('log.breakfast'),
  lunch: t('log.lunch'),
  dinner: t('log.dinner'),
  snack: t('log.snack'),
};

function MealSection({
  slot,
  logs,
  onDelete,
}: {
  slot: MealSlot;
  logs: FoodLog[];
  onDelete: (id: string) => void;
}) {
  const total = sumLogs(logs);
  const empty = logs.length === 0;
  return (
    <Card>
      <View className="flex-row items-baseline justify-between">
        <Text variant="h2">{MEAL_LABELS[slot]}</Text>
        <Text variant="caption" className="text-fg-muted">
          {empty ? t('log.nothingYet') : `${Math.round(total.kcal)} kcal`}
        </Text>
      </View>

      {empty ? (
        <Pressable
          onPress={() => router.push('/(app)/foods/search')}
          className="border border-dashed border-border rounded-md py-3 items-center"
        >
          <Text variant="caption" className="text-fg-muted">
            + {t('log.addTo')} {MEAL_LABELS[slot].toLowerCase()}
          </Text>
        </Pressable>
      ) : (
        <>
          <View className="flex-row gap-2 flex-wrap">
            <Pill label="P" value={`${total.proteinG.toFixed(0)} g`} tone="accent" />
            <Pill label="F" value={`${total.fatG.toFixed(0)} g`} tone="warn" />
            <Pill label="C" value={`${total.carbsG.toFixed(0)} g`} tone="info" />
          </View>
          <View className="border-t border-border pt-2 gap-2">
            {logs.map((l) => (
              <View key={l.id} className="flex-row items-start gap-3">
                <View className="flex-1 gap-0.5">
                  <Text variant="body" numberOfLines={2}>
                    {l.foodName}
                  </Text>
                  <Text variant="caption" className="text-fg-muted">
                    {l.quantityG.toFixed(0)} g · {Math.round(l.kcal)} kcal · P {l.proteinG.toFixed(0)} · C {l.carbsG.toFixed(0)} · F {l.fatG.toFixed(0)}
                  </Text>
                </View>
                <Pressable
                  onPress={() =>
                    Alert.alert(t('log.deleteConfirm'), '', [
                      { text: t('common.cancel'), style: 'cancel' },
                      { text: t('log.delete'), style: 'destructive', onPress: () => onDelete(l.id) },
                    ])
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Remove entry"
                  className="px-2 py-1 rounded-md bg-bg-elevated border border-border"
                >
                  <RNText style={{ color: tokens.colors.fg.muted, fontSize: 14, fontWeight: '600' }}>×</RNText>
                </Pressable>
              </View>
            ))}
          </View>
        </>
      )}
    </Card>
  );
}

export default function LogTab() {
  const user = useAuth((s) => s.user);
  const profile = useProfile((s) => s.profile);
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await getLogsForDate(user.id, todayISO());
      setLogs(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const result: ScienceResult | null = useMemo(() => {
    if (!profile) return null;
    if (
      profile.age === null ||
      profile.sex === null ||
      profile.heightCm === null ||
      profile.weightKg === null ||
      profile.activityLevel === null ||
      profile.goal === null
    ) {
      return null;
    }
    const input: ScienceInput = {
      weightKg: profile.weightKg,
      heightCm: profile.heightCm,
      age: profile.age,
      sex: profile.sex,
      activity: profile.activityLevel,
      goal: profile.goal,
      persona: profile.persona,
      endurance: profile.endurance,
      bodyFatPct: profile.bodyFatPct,
      bmrMethod: profile.bmrMethod,
      dietPattern: profile.dietPattern,
      excludesEggs: profile.excludesEggs,
      deficitPct: profile.goal === 'lose' ? profile.deficitPct ?? 20 : undefined,
      surplusPct: profile.goal === 'gain' ? profile.surplusPct ?? 10 : undefined,
      clinicallySupervised: profile.clinicallySupervised,
      asianBmi: profile.asianBmi,
    };
    const r = compute(input);
    return r.ok ? r.value : null;
  }, [profile]);

  const onDelete = async (id: string) => {
    try {
      await deleteLog(id);
      setLogs((prev) => prev.filter((l) => l.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const totals = sumLogs(logs);
  const kcalConsumed = Math.round(totals.kcal);
  const kcalTarget = result ? Math.round(result.finalCalories) : 0;
  const progress = kcalTarget > 0 ? kcalConsumed / kcalTarget : 0;
  const overshoot = kcalTarget > 0 && kcalConsumed > kcalTarget;

  return (
    <Screen scroll className="gap-6">
      <View className="mt-4 gap-1">
        <Text variant="caption">{t('log.todayTitle')}</Text>
        <Text variant="h1">Your food log</Text>
      </View>

      {/* Hero progress strip */}
      {result ? (
        <View className="flex-row items-center gap-4">
          <CircularProgress progress={progress} size={120} strokeWidth={10}>
            <RNText
              style={{
                fontSize: 22,
                lineHeight: 28,
                fontWeight: '700',
                color: overshoot ? tokens.colors.warn.DEFAULT : tokens.colors.fg.DEFAULT,
                fontVariant: ['tabular-nums'],
              }}
            >
              {kcalConsumed}
            </RNText>
            <RNText style={{ fontSize: 11, color: tokens.colors.fg.muted, marginTop: 2 }}>
              of {kcalTarget}
            </RNText>
          </CircularProgress>
          <View className="flex-1 gap-2">
            <Pill label="P" value={`${totals.proteinG.toFixed(0)} / ${Math.round(result.protein.g)} g`} tone="accent" />
            <Pill label="F" value={`${totals.fatG.toFixed(0)} / ${Math.round(result.fat.g)} g`} tone="warn" />
            <Pill label="C" value={`${totals.carbsG.toFixed(0)} / ${Math.round(result.carb.g)} g`} tone="info" />
          </View>
        </View>
      ) : null}

      {error ? (
        <Text variant="caption" className="text-danger">
          {error}
        </Text>
      ) : null}

      {loading ? (
        <View className="py-6 items-center">
          <ActivityIndicator />
        </View>
      ) : (
        MEAL_SLOTS.map((slot) => (
          <MealSection
            key={slot}
            slot={slot}
            logs={logs.filter((l) => l.meal === slot)}
            onDelete={onDelete}
          />
        ))
      )}

      <Button title={t('dashboard.startLogging')} onPress={() => router.push('/(app)/foods/search')} />
      <Button
        title={t('dashboard.viewHistory')}
        variant="secondary"
        onPress={() => router.push('/(app)/log/history')}
      />
    </Screen>
  );
}
