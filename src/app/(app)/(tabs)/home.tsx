import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useAuth } from '@/store/auth';
import { useProfile } from '@/store/profile';
import { compute } from '@/lib/science';
import type { ScienceInput, ScienceResult } from '@/lib/science';
import { getLogsForDate } from '@/features/log/queries';
import { sumLogs, todayISO, type FoodLog } from '@/features/log/types';
import { getActiveRoutine } from '@/features/workout/queries';
import type { RoutineFull } from '@/features/workout/types';
import { t } from '@/i18n/strings';

function ProgressRow({
  label,
  consumed,
  target,
  unit,
  color,
}: {
  label: string;
  consumed: number;
  target: number;
  unit: string;
  color: string;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0;
  const remaining = Math.max(0, target - consumed);
  return (
    <View className="gap-2">
      <View className="flex-row justify-between">
        <Text variant="body">{label}</Text>
        <Text variant="body">
          {Math.round(consumed)} {t('dashboard.of')} {Math.round(target)} {unit}
        </Text>
      </View>
      <View className="h-2 bg-bg-elevated rounded-full overflow-hidden">
        <View className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </View>
      <Text variant="caption" className="text-fg-subtle">
        {Math.round(remaining)} {unit} {t('dashboard.remaining')}
      </Text>
    </View>
  );
}

function severityClasses(s: 'danger' | 'warn' | 'info'): string {
  if (s === 'danger') return 'border-danger bg-danger/10';
  if (s === 'warn') return 'border-warn bg-warn/10';
  return 'border-border bg-bg-surface';
}

export default function Home() {
  const user = useAuth((s) => s.user);
  const profile = useProfile((s) => s.profile);

  const [todayLogs, setTodayLogs] = useState<FoodLog[]>([]);
  const [routine, setRoutine] = useState<RoutineFull | null>(null);

  const loadToday = useCallback(async () => {
    if (!user) return;
    try {
      const [logs, r] = await Promise.all([
        getLogsForDate(user.id, todayISO()),
        getActiveRoutine(user.id),
      ]);
      setTodayLogs(logs);
      setRoutine(r);
    } catch {
      // Silent — dashboard still works without today's data.
    }
  }, [user]);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  useFocusEffect(
    useCallback(() => {
      loadToday();
    }, [loadToday]),
  );

  const todayDay = useMemo(
    () => routine?.days.find((d) => d.weekday === new Date().getDay()) ?? null,
    [routine],
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
      deficitPct: profile.goal === 'lose' ? profile.deficitPct ?? 20 : undefined,
      surplusPct: profile.goal === 'gain' ? profile.surplusPct ?? 10 : undefined,
      clinicallySupervised: profile.clinicallySupervised,
      asianBmi: profile.asianBmi,
    };
    const r = compute(input);
    return r.ok ? r.value : null;
  }, [profile]);

  const todayTotals = sumLogs(todayLogs);

  return (
    <Screen scroll className="gap-5">
      <View className="mt-4 gap-1">
        <Text variant="caption">{t('dashboard.title')}</Text>
        <Text variant="h1">{profile?.name || user?.email || ''}</Text>
      </View>

      {!result ? (
        <Card>
          <Text variant="body">
            Your profile is missing a value the science engine needs. Tap the Profile tab to update.
          </Text>
        </Card>
      ) : (
        <>
          <Card title={t('dashboard.todaySoFar')}>
            <ProgressRow
              label={t('dashboard.kcal')}
              consumed={todayTotals.kcal}
              target={result.finalCalories}
              unit="kcal"
              color="bg-accent"
            />
            <ProgressRow
              label={t('dashboard.protein')}
              consumed={todayTotals.proteinG}
              target={result.protein.g}
              unit="g"
              color="bg-accent"
            />
            <ProgressRow
              label={t('dashboard.fat')}
              consumed={todayTotals.fatG}
              target={result.fat.g}
              unit="g"
              color="bg-warn"
            />
            <ProgressRow
              label={t('dashboard.carbs')}
              consumed={todayTotals.carbsG}
              target={result.carb.g}
              unit="g"
              color="bg-fg-muted"
            />
          </Card>

          <Button
            title={t('dashboard.startLogging')}
            onPress={() => router.push('/(app)/foods/search')}
          />

          {todayDay ? (
            <Card title={t('workout.todayTitle')}>
              <Text variant="h2">{todayDay.name}</Text>
              <Text variant="caption">
                {todayDay.exercises.length} {t('workout.exercises')}
              </Text>
              <Button
                title={t('workout.startWorkout')}
                variant="secondary"
                onPress={() =>
                  router.push({
                    pathname: '/(app)/workout/player',
                    params: { dayId: todayDay.id },
                  })
                }
              />
            </Card>
          ) : null}

          {(() => {
            const actionable = result.warnings.filter(
              (w) => w.severity === 'warn' || w.severity === 'danger',
            );
            if (actionable.length === 0) return null;
            return (
              <Card title={t('dashboard.safetyHeading')}>
                {actionable.map((w, i) => (
                  <View
                    key={i}
                    className={`p-3 rounded-md border ${severityClasses(w.severity)}`}
                  >
                    <Text variant="caption">{w.text}</Text>
                  </View>
                ))}
              </Card>
            );
          })()}
        </>
      )}
    </Screen>
  );
}
