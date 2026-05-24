import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useAuth } from '@/store/auth';
import { useProfile } from '@/store/profile';
import { compute, bmi as computeBmi, bmiBand } from '@/lib/science';
import type { ScienceInput, ScienceResult } from '@/lib/science';
import { getLogsForDate } from '@/features/log/queries';
import { sumLogs, todayISO, type FoodLog } from '@/features/log/types';
import { t } from '@/i18n/strings';

function fmtKcal(n: number): string {
  return Math.round(n).toLocaleString();
}

function fmtG(n: number): string {
  return `${Math.round(n)} g`;
}

function MacroRow({
  label,
  grams,
  kcal,
  totalKcal,
  color,
}: {
  label: string;
  grams: number;
  kcal: number;
  totalKcal: number;
  color: string;
}) {
  const pct = totalKcal > 0 ? Math.round((kcal / totalKcal) * 100) : 0;
  return (
    <View className="gap-2">
      <View className="flex-row justify-between">
        <Text variant="body">{label}</Text>
        <Text variant="body">
          {fmtG(grams)} · {pct}%
        </Text>
      </View>
      <View className="h-2 bg-bg-elevated rounded-full overflow-hidden">
        <View className={`h-full ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </View>
    </View>
  );
}

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
    </View>
  );
}

function severityClasses(s: 'danger' | 'warn' | 'info'): string {
  if (s === 'danger') return 'border-danger bg-danger/10';
  if (s === 'warn') return 'border-warn bg-warn/10';
  return 'border-border bg-bg-surface';
}

export default function Home() {
  const { user, signOut } = useAuth();
  const profile = useProfile((s) => s.profile);

  const [todayLogs, setTodayLogs] = useState<FoodLog[]>([]);

  const loadToday = useCallback(async () => {
    if (!user) return;
    try {
      const rows = await getLogsForDate(user.id, todayISO());
      setTodayLogs(rows);
    } catch {
      // Silent — dashboard still works without today's logs.
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

  const showCompute = result !== null;
  const bmiValue =
    profile?.weightKg != null && profile?.heightCm != null
      ? computeBmi(profile.weightKg, profile.heightCm)
      : null;

  const goalLabel =
    profile?.goal === 'lose'
      ? t('dashboard.deficit')
      : profile?.goal === 'gain'
        ? t('dashboard.surplus')
        : t('dashboard.maintenance');

  const todayTotals = sumLogs(todayLogs);

  return (
    <Screen scroll className="gap-5">
      <View className="flex-row items-center justify-between mt-4">
        <View className="flex-1">
          <Text variant="caption">{t('dashboard.title')}</Text>
          <Text variant="h1">{profile?.name || user?.email || ''}</Text>
        </View>
        <Pressable
          onPress={signOut}
          accessibilityRole="button"
          className="px-3 py-2 rounded-md bg-bg-surface border border-border"
        >
          <Text variant="caption">{t('auth.signOut')}</Text>
        </Pressable>
      </View>

      {showCompute && result ? (
        <>
          <Card>
            <View className="flex-row items-baseline gap-2">
              <Text className="text-5xl font-bold text-accent">
                {fmtKcal(result.finalCalories)}
              </Text>
              <Text variant="caption">{t('dashboard.kcal')}</Text>
            </View>
            <Text variant="caption">
              {result.pctAdj === 0
                ? goalLabel
                : `${result.pctAdj > 0 ? '+' : ''}${result.pctAdj}% ${goalLabel}`}
              {' · '}
              {t('dashboard.bmr')} {fmtKcal(result.bmr)} · {t('dashboard.tdee')}{' '}
              {fmtKcal(result.tdee)}
            </Text>
          </Card>

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
            <View className="flex-row gap-2 pt-2">
              <View className="flex-1">
                <Button
                  title={t('dashboard.viewLog')}
                  variant="secondary"
                  onPress={() => router.push('/(app)/log/today')}
                />
              </View>
              <View className="flex-1">
                <Button
                  title={t('dashboard.viewHistory')}
                  variant="secondary"
                  onPress={() => router.push('/(app)/log/history')}
                />
              </View>
            </View>
          </Card>

          <Card
            title={`${t('dashboard.protein')} · ${t('dashboard.fat')} · ${t('dashboard.carbs')}`}
          >
            <MacroRow
              label={t('dashboard.protein')}
              grams={result.protein.g}
              kcal={result.protein.kcal}
              totalKcal={result.finalCalories}
              color="bg-accent"
            />
            <MacroRow
              label={t('dashboard.fat')}
              grams={result.fat.g}
              kcal={result.fat.kcal}
              totalKcal={result.finalCalories}
              color="bg-warn"
            />
            <MacroRow
              label={t('dashboard.carbs')}
              grams={result.carb.g}
              kcal={result.carb.kcal}
              totalKcal={result.finalCalories}
              color="bg-fg-muted"
            />
            <View className="border-t border-border pt-3 gap-1">
              <Text variant="caption">
                {t('dashboard.perMeal')}: {result.perMeal.lowG}–{result.perMeal.highG} g protein ×{' '}
                {result.perMeal.mealsPerDay} {t('dashboard.mealsPerDay')}
              </Text>
              <Text variant="caption">
                {t('dashboard.fiber')}: {fmtG(result.fiberG)}
              </Text>
            </View>
          </Card>

          <Card title={t('dashboard.yourStats')}>
            <View className="flex-row justify-between">
              <Text variant="body">{t('dashboard.bmi')}</Text>
              <Text variant="body">
                {result.bmi.value.toFixed(1)} · {result.bmi.band}
              </Text>
            </View>
            {result.bodyFat ? (
              <View className="flex-row justify-between">
                <Text variant="body">{t('dashboard.bodyFat')}</Text>
                <Text variant="body">
                  {result.bodyFat.pct}% · {result.bodyFat.category}
                </Text>
              </View>
            ) : null}
          </Card>

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
      ) : (
        <Card>
          <Text variant="body">
            Your profile is missing a value the science engine needs. Tap below to update.
          </Text>
          {bmiValue !== null ? (
            <Text variant="caption">
              {t('dashboard.bmi')}: {bmiValue.toFixed(1)} · {bmiBand(bmiValue)}
            </Text>
          ) : null}
        </Card>
      )}

      <View className="gap-3 mt-2">
        <Button
          title={t('dashboard.startLogging')}
          onPress={() => router.push('/(app)/foods/search')}
        />
        <Button
          title={t('dashboard.viewPlan')}
          variant="secondary"
          onPress={() => router.push('/(app)/plan')}
        />
        <Button
          title={t('dashboard.editProfile')}
          variant="ghost"
          onPress={() => router.push('/(app)/onboarding')}
        />
      </View>

      <View className="mt-4 mb-6 gap-1">
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
