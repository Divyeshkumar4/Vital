import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { getFoodById } from '@/features/food/queries';
import type { Food } from '@/features/food/types';
import { t } from '@/i18n/strings';

function NutritionRow({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  return (
    <View className="flex-row justify-between py-1">
      <Text variant="body">{label}</Text>
      <Text variant="body">
        {value === null ? '—' : `${value.toFixed(unit === 'kcal' ? 0 : 1)} ${unit}`}
      </Text>
    </View>
  );
}

export default function FoodDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Missing food id.');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getFoodById(id)
      .then((f) => {
        if (cancelled) return;
        if (!f) setError('Food not found.');
        setFood(f);
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
  }, [id]);

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  if (error || !food) {
    return (
      <Screen>
        <View className="gap-4 mt-8">
          <Text variant="h1">{t('foods.nutritionMissing')}</Text>
          {error ? (
            <Text variant="caption" className="text-danger">
              {error}
            </Text>
          ) : null}
          <Button title={t('foods.backToSearch')} variant="secondary" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll className="gap-5">
      <View className="flex-row items-start gap-4 mt-2">
        {food.imageUrl ? (
          <Image
            source={{ uri: food.imageUrl }}
            style={{ width: 84, height: 84, borderRadius: 12, backgroundColor: '#222B38' }}
          />
        ) : null}
        <View className="flex-1 gap-1">
          <Text variant="h1">{food.name}</Text>
          {food.brand ? <Text variant="caption">{food.brand}</Text> : null}
          {food.barcode ? (
            <Text variant="caption" className="text-fg-subtle">
              {food.barcode}
            </Text>
          ) : null}
        </View>
      </View>

      <Card title={t('foods.per100g')}>
        <NutritionRow label={t('foods.kcal')} value={food.kcalPer100g} unit="kcal" />
        <NutritionRow label={t('foods.protein')} value={food.proteinPer100g} unit="g" />
        <NutritionRow label={t('foods.carbs')} value={food.carbsPer100g} unit="g" />
        <NutritionRow label={t('foods.fat')} value={food.fatPer100g} unit="g" />
        <NutritionRow label={t('foods.fiber')} value={food.fiberPer100g} unit="g" />
      </Card>

      {food.servingSizeG !== null ? (
        <Card title={`${t('foods.perServing')} ${food.servingLabel ?? `${food.servingSizeG} g`}`}>
          <NutritionRow
            label={t('foods.kcal')}
            value={food.kcalPer100g !== null ? (food.kcalPer100g * food.servingSizeG) / 100 : null}
            unit="kcal"
          />
          <NutritionRow
            label={t('foods.protein')}
            value={food.proteinPer100g !== null ? (food.proteinPer100g * food.servingSizeG) / 100 : null}
            unit="g"
          />
          <NutritionRow
            label={t('foods.carbs')}
            value={food.carbsPer100g !== null ? (food.carbsPer100g * food.servingSizeG) / 100 : null}
            unit="g"
          />
          <NutritionRow
            label={t('foods.fat')}
            value={food.fatPer100g !== null ? (food.fatPer100g * food.servingSizeG) / 100 : null}
            unit="g"
          />
        </Card>
      ) : null}

      <View className="mt-2">
        <Text variant="caption" className="text-fg-subtle">
          {t('foods.sourceLabel')}: {t('foods.sourceOff')}
        </Text>
      </View>

      <Button title={t('foods.backToSearch')} variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}
