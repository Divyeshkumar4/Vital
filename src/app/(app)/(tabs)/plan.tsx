import { useMemo } from 'react';
import { View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Pill } from '@/components/Pill';
import { useProfile } from '@/store/profile';
import { generatePlan, splitDailyTargets } from '@/features/plan/generator';
import type { MealSlot } from '@/features/log/types';
import { t } from '@/i18n/strings';

const MEAL_LABELS: Record<MealSlot, string> = {
  breakfast: t('log.breakfast'),
  lunch: t('log.lunch'),
  dinner: t('log.dinner'),
  snack: t('log.snack'),
};

export default function PlanTab() {
  const profile = useProfile((s) => s.profile);

  const plan = useMemo(() => {
    if (
      !profile?.targetCalories ||
      !profile.targetProteinG ||
      !profile.targetFatG ||
      !profile.targetCarbsG
    ) {
      return null;
    }
    const splits = splitDailyTargets(
      profile.targetCalories,
      profile.targetProteinG,
      profile.targetFatG,
      profile.targetCarbsG,
    );
    return generatePlan(splits, 3);
  }, [profile]);

  if (!plan) {
    return (
      <Screen scroll className="gap-5">
        <View className="mt-4 gap-1">
          <Text variant="caption">{t('plan.title')}</Text>
          <Text variant="h1">Meal ideas</Text>
        </View>
        <Card>
          <Text variant="body">Finish onboarding so we can size meal ideas to your daily target.</Text>
        </Card>
      </Screen>
    );
  }

  const totalKcal = plan.reduce((sum, m) => sum + m.split.targetKcal, 0);
  const totalP = plan.reduce((sum, m) => sum + m.split.targetProteinG, 0);
  const totalF = plan.reduce((sum, m) => sum + m.split.targetFatG, 0);
  const totalC = plan.reduce((sum, m) => sum + m.split.targetCarbsG, 0);

  return (
    <Screen scroll className="gap-6">
      <View className="mt-4 gap-1">
        <Text variant="caption">{t('plan.title')}</Text>
        <Text variant="h1">Meal ideas</Text>
        <Text variant="caption" className="text-fg-muted">
          {t('plan.subtitle')}
        </Text>
      </View>

      {/* Daily summary row */}
      <Card>
        <View className="flex-row items-baseline justify-between">
          <Text variant="caption">Daily target</Text>
          <Text variant="h2">{totalKcal} kcal</Text>
        </View>
        <View className="flex-row gap-2 flex-wrap">
          <Pill label="P" value={`${totalP} g`} tone="accent" />
          <Pill label="F" value={`${totalF} g`} tone="warn" />
          <Pill label="C" value={`${totalC} g`} tone="info" />
        </View>
      </Card>

      {plan.map((meal) => (
        <Card key={meal.split.slot}>
          <View className="flex-row items-baseline justify-between">
            <Text variant="h2">{MEAL_LABELS[meal.split.slot]}</Text>
            <Text variant="caption" className="text-fg-muted">
              {meal.split.targetKcal} kcal
            </Text>
          </View>
          <View className="flex-row gap-2 flex-wrap">
            <Pill label="P" value={`${meal.split.targetProteinG} g`} tone="accent" />
            <Pill label="F" value={`${meal.split.targetFatG} g`} tone="warn" />
            <Pill label="C" value={`${meal.split.targetCarbsG} g`} tone="info" />
          </View>
          <View className="border-t border-border pt-3 gap-4">
            {meal.suggestions.map((s) => (
              <View key={s.id} className="gap-1">
                <View className="flex-row items-baseline justify-between">
                  <Text variant="body" className="font-semibold flex-1 pr-2">
                    {s.name}
                  </Text>
                  <Text variant="caption" className="text-fg-muted">
                    {s.kcal} kcal
                  </Text>
                </View>
                <Text variant="caption" className="text-fg-muted">
                  P {s.proteinG} · F {s.fatG} · C {s.carbsG} g
                </Text>
                <Text variant="caption" className="text-fg-subtle">
                  {s.items.map((it) => `${it.name} ${it.display}`).join(' · ')}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      ))}
    </Screen>
  );
}
