import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text as RNText, View } from 'react-native';
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
import { getLogsForDate, getLogsForDateRange } from '@/features/log/queries';
import { isoDaysAgo, sumLogs, todayISO, type FoodLog } from '@/features/log/types';
import { sumSpendByDate } from '@/features/cost/types';
import { formatMoney } from '@/lib/locale/region';
import { getActiveRoutine } from '@/features/workout/queries';
import type { RoutineFull } from '@/features/workout/types';
import { tokens } from '@/lib/design/tokens';
import { t } from '@/i18n/strings';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return t('home.greetingNight');
  if (h < 12) return t('home.greetingMorning');
  if (h < 17) return t('home.greetingAfternoon');
  if (h < 22) return t('home.greetingEvening');
  return t('home.greetingLate');
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
  const [weekLogs, setWeekLogs] = useState<FoodLog[]>([]);
  const [routine, setRoutine] = useState<RoutineFull | null>(null);

  const loadToday = useCallback(async () => {
    if (!user) return;
    try {
      const [logs, week, r] = await Promise.all([
        getLogsForDate(user.id, todayISO()),
        getLogsForDateRange(user.id, isoDaysAgo(6), isoDaysAgo(0)),
        getActiveRoutine(user.id),
      ]);
      setTodayLogs(logs);
      setWeekLogs(week);
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
      excludesEggs: profile.excludesEggs,
      deficitPct: profile.goal === 'lose' ? profile.deficitPct ?? 20 : undefined,
      surplusPct: profile.goal === 'gain' ? profile.surplusPct ?? 10 : undefined,
      clinicallySupervised: profile.clinicallySupervised,
      asianBmi: profile.asianBmi,
    };
    const r = compute(input);
    return r.ok ? r.value : null;
  }, [profile]);

  const todayTotals = sumLogs(todayLogs);

  if (!result) {
    return (
      <Screen scroll className="gap-5">
        <View className="mt-4 gap-1">
          <Text variant="caption">{greeting()}</Text>
          <Text variant="h1">{profile?.name || user?.email || ''}</Text>
        </View>
        <Card>
          <Text variant="body">{t('home.profileMissing')}</Text>
        </Card>
      </Screen>
    );
  }

  const kcalConsumed = Math.round(todayTotals.kcal);
  const kcalTarget = Math.round(result.finalCalories);
  const kcalLeft = Math.max(0, kcalTarget - kcalConsumed);
  const progress = kcalTarget > 0 ? kcalConsumed / kcalTarget : 0;
  const overshoot = kcalConsumed > kcalTarget;

  const proteinLeft = Math.max(0, Math.round(result.protein.g - todayTotals.proteinG));
  const fatLeft = Math.max(0, Math.round(result.fat.g - todayTotals.fatG));
  const carbsLeft = Math.max(0, Math.round(result.carb.g - todayTotals.carbsG));

  const actionable = result.warnings.filter(
    (w) => w.severity === 'warn' || w.severity === 'danger',
  );

  return (
    <Screen scroll className="gap-6">
      <View className="mt-4 gap-1">
        <Text variant="caption" className="text-fg-muted">
          {greeting()}
        </Text>
        <Text variant="h1">{profile?.name || user?.email || ''}</Text>
      </View>

      {/* Hero ring */}
      <View className="items-center gap-4">
        <CircularProgress progress={progress} size={220} strokeWidth={14}>
          <RNText
            style={{
              fontSize: 44,
              lineHeight: 52,
              fontWeight: '700',
              fontVariant: ['tabular-nums'],
              color: overshoot ? tokens.colors.warn.DEFAULT : tokens.colors.fg.DEFAULT,
              textAlign: 'center',
            }}
          >
            {overshoot ? `+${kcalConsumed - kcalTarget}` : kcalLeft}
          </RNText>
          <RNText
            style={{
              fontSize: 13,
              lineHeight: 18,
              color: tokens.colors.fg.muted,
              marginTop: 2,
            }}
          >
            {overshoot ? t('home.overTarget') : t('home.kcalLeft')}
          </RNText>
          <RNText
            style={{
              fontSize: 12,
              lineHeight: 16,
              color: tokens.colors.fg.subtle,
              fontVariant: ['tabular-nums'],
              marginTop: 2,
            }}
          >
            {kcalConsumed} / {kcalTarget}
          </RNText>
        </CircularProgress>

        <View className="flex-row flex-wrap justify-center gap-2">
          <Pill label={t('dashboard.protein')} value={`${proteinLeft} g`} tone="accent" />
          <Pill label={t('dashboard.fat')} value={`${fatLeft} g`} tone="warn" />
          <Pill label={t('dashboard.carbs')} value={`${carbsLeft} g`} tone="info" />
        </View>
      </View>

      <Button
        title={t('dashboard.startLogging')}
        onPress={() => router.push('/(app)/foods/search')}
      />

      {profile?.currency ? (() => {
        const spend = sumSpendByDate(weekLogs, profile.currency);
        const today = spend.find((d) => d.date === todayISO());
        const todayAmount = today?.amount ?? 0;
        const totalWeek = spend.reduce((s, d) => s + d.amount, 0);
        const avgWeek = spend.length > 0 ? totalWeek / 7 : 0;
        const hasAny = spend.some((d) => d.pricedEntries > 0);
        return (
          <Pressable
            onPress={() => router.push('/(app)/cost/month')}
            accessibilityRole="button"
            className="bg-bg-surface border border-border rounded-xl p-5 gap-2"
          >
            <View className="flex-row items-baseline justify-between">
              <Text variant="caption" className="text-fg-muted">
                {t('cost.todaySpend')}
              </Text>
              <Text variant="caption" className="text-fg-subtle">
                {t('cost.seeMonth')} ›
              </Text>
            </View>
            <Text variant="h1">{formatMoney(todayAmount, profile.currency)}</Text>
            <Text variant="caption" className="text-fg-muted">
              {hasAny
                ? `${t('cost.weekAvg')}: ${formatMoney(avgWeek, profile.currency)} ${t('cost.perDay')}`
                : t('cost.addPriceCta')}
            </Text>
          </Pressable>
        );
      })() : null}

      {todayDay ? (
        <Card>
          <View className="flex-row items-baseline justify-between">
            <Text variant="caption">{t('workout.todayTitle')}</Text>
            <Pill label="" value={`${todayDay.exercises.length} ${t('workout.exercises')}`} tone="info" />
          </View>
          <Text variant="h2">{todayDay.name}</Text>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(app)/workout/player',
                params: { dayId: todayDay.id },
              })
            }
            className="mt-2 flex-row items-center justify-center min-h-12 rounded-lg bg-accent"
          >
            <RNText
              style={{ color: tokens.colors.accent.contrast, fontSize: 16, fontWeight: '600' }}
            >
              {t('workout.startWorkout')}
            </RNText>
          </Pressable>
        </Card>
      ) : routine ? (
        <Card>
          <Text variant="caption">{t('workout.todayTitle')}</Text>
          <Text variant="body">{t('home.restDay')}</Text>
        </Card>
      ) : null}

      {actionable.length > 0 ? (
        <Card title={t('dashboard.safetyHeading')}>
          {actionable.map((w, i) => (
            <View key={i} className={`p-3 rounded-md border ${severityClasses(w.severity)}`}>
              <Text variant="caption">{w.text}</Text>
            </View>
          ))}
        </Card>
      ) : null}

      <View className="mb-6 gap-1">
        <Text variant="caption" className="text-fg-subtle text-center">
          {t('dashboard.disclaimer')}
        </Text>
        <Text variant="caption" className="text-fg-subtle text-center">
          {t('dashboard.methodologyTag')} v{result.methodologyVersion}
        </Text>
      </View>
    </Screen>
  );
}
