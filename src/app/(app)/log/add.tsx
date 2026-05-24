import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { NumberField } from '@/components/NumberField';
import { SegmentedChoice } from '@/components/SegmentedChoice';
import { getFoodById } from '@/features/food/queries';
import { addLog } from '@/features/log/queries';
import { todayISO, type MealSlot } from '@/features/log/types';
import type { Food } from '@/features/food/types';
import { useAuth } from '@/store/auth';
import { t } from '@/i18n/strings';

function suggestedMeal(): MealSlot {
  const h = new Date().getHours();
  if (h < 11) return 'breakfast';
  if (h < 15) return 'lunch';
  if (h < 20) return 'dinner';
  return 'snack';
}

export default function AddLog() {
  const { foodId } = useLocalSearchParams<{ foodId: string }>();
  const user = useAuth((s) => s.user);
  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [qtyStr, setQtyStr] = useState('100');
  const [meal, setMeal] = useState<MealSlot>(suggestedMeal());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!foodId) {
      setError('Missing food id.');
      setLoading(false);
      return;
    }
    let cancelled = false;
    getFoodById(foodId)
      .then((f) => {
        if (cancelled) return;
        if (!f) setError('Food not found.');
        setFood(f);
        // Prefill quantity to serving size if known.
        if (f?.servingSizeG && f.servingSizeG > 0) {
          setQtyStr(String(Math.round(f.servingSizeG)));
        }
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [foodId]);

  const preview = useMemo(() => {
    const qty = parseFloat(qtyStr);
    if (!food || !Number.isFinite(qty) || qty <= 0) return null;
    const factor = qty / 100;
    return {
      kcal: (food.kcalPer100g ?? 0) * factor,
      proteinG: (food.proteinPer100g ?? 0) * factor,
      carbsG: (food.carbsPer100g ?? 0) * factor,
      fatG: (food.fatPer100g ?? 0) * factor,
      fiberG: food.fiberPer100g === null ? null : food.fiberPer100g * factor,
    };
  }, [food, qtyStr]);

  const onSave = async () => {
    if (!user || !food || !preview) return;
    const qty = parseFloat(qtyStr);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError('Enter a valid quantity.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await addLog({
        userId: user.id,
        date: todayISO(),
        meal,
        foodId: food.id,
        foodName: food.name,
        brand: food.brand,
        quantityG: qty,
        kcal: Math.round(preview.kcal),
        proteinG: Math.round(preview.proteinG * 10) / 10,
        carbsG: Math.round(preview.carbsG * 10) / 10,
        fatG: Math.round(preview.fatG * 10) / 10,
        fiberG: preview.fiberG === null ? null : Math.round(preview.fiberG * 10) / 10,
      });
      router.replace('/(app)/log/today');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  if (!food) {
    return (
      <Screen>
        <View className="gap-4 mt-8">
          <Text variant="h1">{error ?? 'Food not found.'}</Text>
          <Button title={t('foods.backToSearch')} variant="secondary" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll className="gap-5">
      <View className="gap-1 mt-4">
        <Text variant="h1">{t('log.addTitle')}</Text>
        <Text variant="body">{food.name}</Text>
        {food.brand ? <Text variant="caption">{food.brand}</Text> : null}
      </View>

      <NumberField
        label={t('log.quantity')}
        value={qtyStr}
        onChangeText={setQtyStr}
        mode="decimal"
        suffix="g"
        placeholder="100"
      />
      <Text variant="caption" className="text-fg-subtle">
        {t('log.quantityHint')}
      </Text>

      <SegmentedChoice
        label={t('log.meal')}
        value={meal}
        onChange={(v) => setMeal(v)}
        options={[
          { value: 'breakfast', label: t('log.breakfast') },
          { value: 'lunch', label: t('log.lunch') },
          { value: 'dinner', label: t('log.dinner') },
          { value: 'snack', label: t('log.snack') },
        ]}
      />

      {preview ? (
        <Card title={t('log.preview')}>
          <View className="flex-row justify-between">
            <Text variant="body">{t('foods.kcal')}</Text>
            <Text variant="body">{Math.round(preview.kcal)} kcal</Text>
          </View>
          <View className="flex-row justify-between">
            <Text variant="body">{t('foods.protein')}</Text>
            <Text variant="body">{preview.proteinG.toFixed(1)} g</Text>
          </View>
          <View className="flex-row justify-between">
            <Text variant="body">{t('foods.carbs')}</Text>
            <Text variant="body">{preview.carbsG.toFixed(1)} g</Text>
          </View>
          <View className="flex-row justify-between">
            <Text variant="body">{t('foods.fat')}</Text>
            <Text variant="body">{preview.fatG.toFixed(1)} g</Text>
          </View>
        </Card>
      ) : null}

      {error ? (
        <Text variant="caption" className="text-danger">
          {error}
        </Text>
      ) : null}

      <Button title={t('log.save')} onPress={onSave} loading={saving} />
      <Button title={t('common.cancel')} variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}
