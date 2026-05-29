import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Pill } from '@/components/Pill';
import { NumberField } from '@/components/NumberField';
import { SegmentedChoice } from '@/components/SegmentedChoice';
import { getFoodById } from '@/features/food/queries';
import { addLog } from '@/features/log/queries';
import { todayISO, type MealSlot } from '@/features/log/types';
import type { Food } from '@/features/food/types';
import { communityPriceFor, submitPrice } from '@/features/cost/queries';
import type { CommunityPriceSummary } from '@/features/cost/types';
import { formatMoney } from '@/lib/locale/region';
import { useAuth } from '@/store/auth';
import { useProfile } from '@/store/profile';
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
  const profile = useProfile((s) => s.profile);
  const region = profile?.region ?? 'GLOBAL';
  const currency = profile?.currency ?? 'USD';

  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [qtyStr, setQtyStr] = useState('100');
  const [meal, setMeal] = useState<MealSlot>(suggestedMeal());
  const [saving, setSaving] = useState(false);

  // Cost feature.
  const [community, setCommunity] = useState<CommunityPriceSummary | null>(null);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [priceStr, setPriceStr] = useState('');
  const [showPriceInput, setShowPriceInput] = useState(false);

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

  // Look up community price once we have the food.
  useEffect(() => {
    if (!food) return;
    let cancelled = false;
    setCommunityLoading(true);
    communityPriceFor(food.id, region)
      .then((c) => {
        if (cancelled) return;
        setCommunity(c);
        // Seed the price input with the community median × quantity if we have one.
        if (c && c.currency === currency) {
          const qty = parseFloat(qtyStr);
          const suggested = Number.isFinite(qty)
            ? (c.medianPer100g * qty) / 100
            : c.medianPer100g;
          setPriceStr(suggested.toFixed(2));
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setCommunityLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [food, region, currency, qtyStr]);

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

  const priceNumber = (() => {
    const v = parseFloat(priceStr);
    return Number.isFinite(v) && v >= 0 ? v : null;
  })();

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
        priceAtLog: priceNumber,
        currencyAtLog: priceNumber !== null ? currency : null,
      });
      // If the user typed a price, share it back to the community when it's
      // either the first submission or notably different from the existing
      // median (within 30% we treat as "same number, don't add noise").
      if (priceNumber !== null) {
        const per100g = (priceNumber / qty) * 100;
        const shouldShare =
          community === null ||
          community.currency !== currency ||
          Math.abs(per100g - community.medianPer100g) / community.medianPer100g > 0.3;
        if (shouldShare) {
          submitPrice({
            foodId: food.id,
            region,
            currency,
            pricePer100g: per100g,
            source: 'manual',
            submittedBy: user.id,
          }).catch(() => undefined); // non-fatal
        }
      }
      router.replace('/(app)/(tabs)/log');
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
          <Text variant="h1">{error ?? t('log.foodNotFound')}</Text>
          <Button title={t('foods.backToSearch')} variant="secondary" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const suggestedTotal =
    community && community.currency === currency
      ? (community.medianPer100g * (parseFloat(qtyStr) || 0)) / 100
      : null;

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

      {/* Phase 3.1 — cost. Optional. Suggested if community price exists. */}
      <Card title={t('cost.pricePerEntryLabel')}>
        {communityLoading ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator />
            <Text variant="caption" className="text-fg-muted">
              Checking community prices…
            </Text>
          </View>
        ) : community && community.currency === currency && suggestedTotal !== null ? (
          <View className="flex-row flex-wrap gap-2 items-center">
            <Pill
              label={t('cost.suggestedPriceLabel')}
              value={formatMoney(suggestedTotal, currency)}
              tone="info"
            />
            <Text variant="caption" className="text-fg-muted">
              · {community.count} {t('cost.submittedBy')}
            </Text>
          </View>
        ) : (
          <Text variant="caption" className="text-fg-muted">
            {t('cost.addPriceCta')}
          </Text>
        )}

        {showPriceInput || priceStr ? (
          <NumberField
            label=""
            value={priceStr}
            onChangeText={setPriceStr}
            mode="decimal"
            suffix={currency}
            placeholder="0.00"
          />
        ) : (
          <Button
            title={t('cost.addPriceCta')}
            variant="secondary"
            onPress={() => setShowPriceInput(true)}
          />
        )}
      </Card>

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
