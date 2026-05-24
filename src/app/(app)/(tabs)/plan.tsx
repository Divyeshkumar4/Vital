import { useMemo } from 'react';
import { View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { useProfile } from '@/store/profile';
import { generatePlan, splitDailyTargets } from '@/features/plan/generator';
import { t } from '@/i18n/strings';

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
      <Screen>
        <View className="gap-4 mt-8">
          <Text variant="h1">{t('plan.title')}</Text>
          <Card>
            <Text variant="body">
              Finish onboarding so we can size meal ideas to your daily target.
            </Text>
          </Card>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll className="gap-5">
      <View className="mt-4 gap-1">
        <Text variant="h1">{t('plan.title')}</Text>
        <Text variant="caption">{t('plan.subtitle')}</Text>
      </View>

      {plan.map((meal) => (
        <Card key={meal.split.slot} title={t(`log.${meal.split.slot}` as const)}>
          <Text variant="caption">
            {t('plan.targetLine')}: {meal.split.targetKcal} kcal · P{' '}
            {meal.split.targetProteinG} · C {meal.split.targetCarbsG} · F{' '}
            {meal.split.targetFatG}
          </Text>
          <View className="border-t border-border pt-3 gap-3">
            {meal.suggestions.map((s) => (
              <View key={s.id} className="gap-1">
                <Text variant="body" className="font-semibold">
                  {s.name}
                </Text>
                <Text variant="caption">
                  {s.kcal} kcal · P {s.proteinG} · C {s.carbsG} · F {s.fatG}
                </Text>
                <Text variant="caption" className="text-fg-muted">
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
