import { useMemo } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useAuth } from '@/store/auth';
import { useProfile } from '@/store/profile';
import { compute } from '@/lib/science';
import type { ScienceInput, ScienceResult } from '@/lib/science';
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

export default function ProfileTab() {
  const { user, signOut, loading } = useAuth();
  const profile = useProfile((s) => s.profile);

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

  const goalLabel =
    profile?.goal === 'lose'
      ? t('dashboard.deficit')
      : profile?.goal === 'gain'
        ? t('dashboard.surplus')
        : t('dashboard.maintenance');

  return (
    <Screen scroll className="gap-5">
      <View className="mt-4 gap-1">
        <Text variant="caption">{t('auth.signedInAs')}</Text>
        <Text variant="h1">{profile?.name || ''}</Text>
        <Text variant="caption">{user?.email ?? ''}</Text>
      </View>

      {result ? (
        <>
          <Card>
            <View className="flex-row items-baseline gap-2">
              <Text className="text-4xl font-bold text-accent">
                {fmtKcal(result.finalCalories)}
              </Text>
              <Text variant="caption">{t('dashboard.kcal')}</Text>
            </View>
            <Text variant="caption">
              {result.pctAdj === 0
                ? goalLabel
                : `${result.pctAdj > 0 ? '+' : ''}${result.pctAdj}% ${goalLabel}`}
            </Text>
            <View className="border-t border-border pt-3 flex-row justify-between">
              <Text variant="caption">{t('dashboard.bmr')}</Text>
              <Text variant="caption">{fmtKcal(result.bmr)} kcal</Text>
            </View>
            <View className="flex-row justify-between">
              <Text variant="caption">{t('dashboard.tdee')}</Text>
              <Text variant="caption">{fmtKcal(result.tdee)} kcal</Text>
            </View>
          </Card>

          <Card title={`${t('dashboard.protein')} · ${t('dashboard.fat')} · ${t('dashboard.carbs')}`}>
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
        </>
      ) : null}

      <View className="gap-3 mt-2">
        <Button
          title={t('dashboard.editProfile')}
          variant="secondary"
          onPress={() => router.push('/(app)/onboarding')}
        />
        <Button title={t('auth.signOut')} variant="ghost" onPress={signOut} loading={loading} />
      </View>

      <View className="mt-2 mb-6 gap-1">
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
