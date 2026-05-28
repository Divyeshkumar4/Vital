import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Pill } from '@/components/Pill';
import { useAuth } from '@/store/auth';
import { useProfile } from '@/store/profile';
import { compute } from '@/lib/science';
import type { ScienceInput, ScienceResult } from '@/lib/science';
import { getActiveRoutine } from '@/features/workout/queries';
import type { RoutineFull } from '@/features/workout/types';
import { t } from '@/i18n/strings';

function fmtKcal(n: number): string {
  return Math.round(n).toLocaleString();
}

function fmtG(n: number): string {
  return `${Math.round(n)} g`;
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-baseline justify-between py-1">
      <Text variant="body" className="text-fg-muted">
        {label}
      </Text>
      <Text variant="body">{value}</Text>
    </View>
  );
}

export default function ProfileTab() {
  const { user, signOut, loading } = useAuth();
  const profile = useProfile((s) => s.profile);
  const [routine, setRoutine] = useState<RoutineFull | null>(null);

  const loadRoutine = useCallback(async () => {
    if (!user) return;
    try {
      const r = await getActiveRoutine(user.id);
      setRoutine(r);
    } catch {
      // silent
    }
  }, [user]);

  useEffect(() => {
    loadRoutine();
  }, [loadRoutine]);

  useFocusEffect(
    useCallback(() => {
      loadRoutine();
    }, [loadRoutine]),
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

  const goalLabel =
    profile?.goal === 'lose'
      ? t('dashboard.deficit')
      : profile?.goal === 'gain'
        ? t('dashboard.surplus')
        : t('dashboard.maintenance');

  return (
    <Screen scroll className="gap-6">
      {/* Identity */}
      <View className="mt-4 gap-1">
        <Text variant="caption" className="text-fg-muted">
          {t('auth.signedInAs')}
        </Text>
        <Text variant="h1">{profile?.name || '—'}</Text>
        <Text variant="caption" className="text-fg-subtle">
          {user?.email ?? ''}
        </Text>
        {result ? (
          <View className="flex-row flex-wrap gap-2 mt-2">
            <Pill label="BMI" value={`${result.bmi.value.toFixed(1)} · ${result.bmi.band}`} tone="info" />
            {result.bodyFat ? (
              <Pill
                label="Body fat"
                value={`${result.bodyFat.pct}% · ${result.bodyFat.category}`}
                tone="info"
              />
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Targets */}
      {result ? (
        <Card>
          <View className="flex-row items-baseline justify-between">
            <Text variant="caption">Target</Text>
            <Text variant="caption" className="text-fg-muted">
              {result.pctAdj === 0 ? goalLabel : `${result.pctAdj > 0 ? '+' : ''}${result.pctAdj}% ${goalLabel}`}
            </Text>
          </View>
          <Text variant="h1" className="text-accent">
            {fmtKcal(result.finalCalories)} kcal
          </Text>
          <View className="flex-row gap-2 flex-wrap">
            <Pill label="Protein" value={fmtG(result.protein.g)} tone="accent" />
            <Pill label="Fat" value={fmtG(result.fat.g)} tone="warn" />
            <Pill label="Carbs" value={fmtG(result.carb.g)} tone="info" />
          </View>
          <View className="border-t border-border pt-3">
            <Text variant="caption" className="text-fg-muted">
              {result.perMeal.lowG}–{result.perMeal.highG} g protein × {result.perMeal.mealsPerDay} meals · {fmtG(result.fiberG)} fiber
            </Text>
          </View>
        </Card>
      ) : null}

      {/* Metabolism */}
      {result ? (
        <Card title="Metabolism">
          <StatRow label={t('dashboard.bmr')} value={`${fmtKcal(result.bmr)} kcal`} />
          <StatRow label={t('dashboard.tdee')} value={`${fmtKcal(result.tdee)} kcal`} />
        </Card>
      ) : null}

      {/* Current routine */}
      <Card title="Current routine">
        {routine ? (
          <>
            <Text variant="body">{routine.routine.name}</Text>
            <Text variant="caption" className="text-fg-muted">
              {routine.days.length} training days / week ·{' '}
              {routine.routine.experience.charAt(0).toUpperCase() +
                routine.routine.experience.slice(1)}
            </Text>
            <Button
              title="Change routine"
              variant="secondary"
              onPress={() => router.push('/(app)/workout/setup')}
            />
          </>
        ) : (
          <>
            <Text variant="caption" className="text-fg-muted">
              {t('workout.noActiveRoutine')}
            </Text>
            <Button title={t('workout.setupCta')} onPress={() => router.push('/(app)/workout/setup')} />
          </>
        )}
      </Card>

      {/* Settings actions */}
      <Card title="Settings">
        <Button
          title={t('dashboard.editProfile')}
          variant="secondary"
          onPress={() => router.push('/(app)/onboarding')}
        />
        <Button title={t('auth.signOut')} variant="ghost" onPress={signOut} loading={loading} />
      </Card>

      <View className="mb-6 gap-1">
        <Text variant="caption" className="text-fg-subtle">
          {t('dashboard.disclaimer')}
        </Text>
        {result ? (
          <Text variant="caption" className="text-fg-subtle">
            {t('dashboard.methodologyTag')} v{result.methodologyVersion}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}
