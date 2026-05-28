import { useMemo, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Pill } from '@/components/Pill';
import { useAuth } from '@/store/auth';
import { useProfile } from '@/store/profile';
import { generatePlan, splitDailyTargets } from '@/features/plan/generator';
import type { ScaledTemplate } from '@/features/plan/generator';
import { addLog } from '@/features/log/queries';
import { todayISO, type MealSlot } from '@/features/log/types';
import { t } from '@/i18n/strings';

const MEAL_LABELS: Record<MealSlot, string> = {
  breakfast: t('log.breakfast'),
  lunch: t('log.lunch'),
  dinner: t('log.dinner'),
  snack: t('log.snack'),
};

export default function PlanTab() {
  const user = useAuth((s) => s.user);
  const profile = useProfile((s) => s.profile);
  const [logging, setLogging] = useState<string | null>(null);

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
    return generatePlan(splits, 5);
  }, [profile]);

  const onLogTemplate = async (slot: MealSlot, tmpl: ScaledTemplate) => {
    if (!user) return;
    setLogging(tmpl.id);
    try {
      // Splits the template's calories across its items proportional to qty.
      const totalG = tmpl.items.reduce((sum, it) => sum + it.qtyG, 0) || 1;
      for (const it of tmpl.items) {
        const share = it.qtyG / totalG;
        await addLog({
          userId: user.id,
          date: todayISO(),
          meal: slot,
          foodId: null,
          foodName: it.name,
          brand: null,
          quantityG: it.qtyG,
          kcal: Math.round(tmpl.kcal * share),
          proteinG: Math.round(tmpl.proteinG * share * 10) / 10,
          carbsG: Math.round(tmpl.carbsG * share * 10) / 10,
          fatG: Math.round(tmpl.fatG * share * 10) / 10,
          fiberG: null,
        });
      }
      Alert.alert('Added', `${tmpl.name} logged to ${MEAL_LABELS[slot].toLowerCase()}.`);
    } catch (e) {
      Alert.alert('Could not log', e instanceof Error ? e.message : String(e));
    } finally {
      setLogging(null);
    }
  };

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
          Pick what fits your day — tap "Log this meal" to add it to today’s log.
        </Text>
      </View>

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
              <View key={s.id} className="gap-2">
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
                <Pressable
                  onPress={() => onLogTemplate(meal.split.slot, s)}
                  disabled={logging !== null}
                  className="self-start px-3 py-2 rounded-md bg-bg-elevated border border-border"
                >
                  <Text variant="caption">
                    {logging === s.id ? 'Logging…' : 'Log this meal'}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        </Card>
      ))}
    </Screen>
  );
}
