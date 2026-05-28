import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { NumberField } from '@/components/NumberField';
import { Card } from '@/components/Card';
import { cacheFood } from '@/features/food/queries';
import { t } from '@/i18n/strings';

export default function ManualFood() {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseNonNeg = (s: string): number | null => {
    const v = parseFloat(s);
    return Number.isFinite(v) && v >= 0 ? v : null;
  };

  const onSave = async () => {
    setError(null);
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Give the food a name.');
      return;
    }
    const k = parseNonNeg(kcal);
    if (k === null) {
      setError('Enter calories per 100 g.');
      return;
    }
    setSaving(true);
    try {
      // Stable id from name + a short timestamp suffix so each manual entry
      // is unique even if two users have a food called "Chicken curry".
      const sourceId = `${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
      const saved = await cacheFood({
        source: 'manual',
        sourceId,
        name: cleanName,
        brand: brand.trim() || null,
        barcode: null,
        kcalPer100g: k,
        proteinPer100g: parseNonNeg(protein),
        carbsPer100g: parseNonNeg(carbs),
        fatPer100g: parseNonNeg(fat),
        fiberPer100g: parseNonNeg(fiber),
        servingSizeG: null,
        servingLabel: null,
        imageUrl: null,
      });
      router.replace({ pathname: '/(app)/foods/[id]', params: { id: saved.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll className="gap-4">
      <View className="mt-4 gap-1">
        <Text variant="h1">Add food manually</Text>
        <Text variant="caption" className="text-fg-muted">
          Values are per 100 g. You can leave any macro blank if you don’t know it.
        </Text>
      </View>

      <Input
        label="Name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Mum’s chicken curry"
        autoCapitalize="sentences"
      />
      <Input
        label={`Brand (${t('common.optional')})`}
        value={brand}
        onChangeText={setBrand}
        placeholder="—"
      />

      <Card title="Per 100 g">
        <NumberField label="Calories" value={kcal} onChangeText={setKcal} mode="decimal" suffix="kcal" />
        <NumberField label="Protein" value={protein} onChangeText={setProtein} mode="decimal" suffix="g" />
        <NumberField label="Carbs" value={carbs} onChangeText={setCarbs} mode="decimal" suffix="g" />
        <NumberField label="Fat" value={fat} onChangeText={setFat} mode="decimal" suffix="g" />
        <NumberField label="Fiber" value={fiber} onChangeText={setFiber} mode="decimal" suffix="g" />
      </Card>

      {error ? (
        <Text variant="caption" className="text-danger">
          {error}
        </Text>
      ) : null}

      <Button title="Save and view" onPress={onSave} loading={saving} />
      <Button title={t('common.cancel')} variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}
