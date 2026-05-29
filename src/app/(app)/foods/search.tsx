import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { searchFoods, type OffFood } from '@/lib/api/openFoodFacts';
import { searchStaples } from '@/lib/api/staples';
import { cacheFood, offFoodToInsert, stapleToInsert } from '@/features/food/queries';
import { t } from '@/i18n/strings';

const MIN_OFF_QUERY = 3;
const DEBOUNCE_MS = 350;

type ResultItem = {
  kind: 'staple' | 'off';
  data: OffFood;
};

function macroLine(f: OffFood): string {
  const parts: string[] = [];
  if (f.kcalPer100g !== null) parts.push(`${Math.round(f.kcalPer100g)} ${t('foods.kcal')}`);
  if (f.proteinPer100g !== null) parts.push(`P ${f.proteinPer100g.toFixed(1)}`);
  if (f.carbsPer100g !== null) parts.push(`C ${f.carbsPer100g.toFixed(1)}`);
  if (f.fatPer100g !== null) parts.push(`F ${f.fatPer100g.toFixed(1)}`);
  return parts.join(' · ');
}

export default function FoodSearch() {
  const [query, setQuery] = useState('');
  const [staples, setStaples] = useState<OffFood[]>([]);
  const [offResults, setOffResults] = useState<OffFood[]>([]);
  const [offLoading, setOffLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState<string | null>(null);
  const reqIdRef = useRef(0);

  // Local staples — instant, no debounce needed.
  useEffect(() => {
    setStaples(searchStaples(query, 12));
  }, [query]);

  // Open Food Facts — debounced, only above the min query length.
  useEffect(() => {
    setError(null);
    if (query.trim().length < MIN_OFF_QUERY) {
      setOffResults([]);
      setOffLoading(false);
      return;
    }
    const id = ++reqIdRef.current;
    setOffLoading(true);
    const handle = setTimeout(async () => {
      try {
        const r = await searchFoods(query, 20);
        if (reqIdRef.current === id) {
          setOffResults(r);
          setOffLoading(false);
        }
      } catch (e) {
        if (reqIdRef.current === id) {
          setError(e instanceof Error ? e.message : String(e));
          setOffLoading(false);
        }
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [query]);

  const items: ResultItem[] = useMemo(() => {
    // Score every candidate so an exact name match (regardless of source) wins,
    // then name-starts-with, then anything else. Staples break ties over OFF.
    const q = query.trim().toLowerCase();
    const all: { item: ResultItem; score: number }[] = [];
    for (const s of staples) {
      const name = s.name.toLowerCase();
      let score = 30;
      if (name === q) score = 100;
      else if (name.startsWith(q)) score = 90;
      else if (name.includes(q)) score = 60;
      all.push({ item: { kind: 'staple', data: s }, score });
    }
    for (const o of offResults) {
      const name = o.name.toLowerCase();
      let score = 20;
      if (name === q) score = 95; // exact match against branded item — still strong
      else if (name.startsWith(q)) score = 70;
      else if (name.includes(q)) score = 40;
      all.push({ item: { kind: 'off', data: o }, score });
    }
    all.sort((a, b) => b.score - a.score);
    return all.map((r) => r.item);
  }, [staples, offResults, query]);

  const onPick = async (item: ResultItem) => {
    setPicking(`${item.kind}:${item.data.sourceId}`);
    setError(null);
    try {
      const insert =
        item.kind === 'staple' ? stapleToInsert(item.data) : offFoodToInsert(item.data);
      const saved = await cacheFood(insert);
      router.push({ pathname: '/(app)/foods/[id]', params: { id: saved.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : t('foods.saveError'));
    } finally {
      setPicking(null);
    }
  };

  const showHint = query.trim().length === 0;
  const showEmpty =
    !offLoading &&
    !showHint &&
    items.length === 0 &&
    !error;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="px-6 pt-4 pb-2 gap-3">
        <View className="flex-row items-center justify-between">
          <Text variant="h1">{t('foods.findTitle')}</Text>
          <Pressable
            onPress={() => router.back()}
            className="px-3 py-2 rounded-md bg-bg-surface border border-border"
          >
            <Text variant="caption">{t('common.cancel')}</Text>
          </Pressable>
        </View>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder={t('foods.searchPlaceholder')}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <View className="flex-row gap-2">
          <View className="flex-1">
            <Button
              title={t('foods.scanBarcode')}
              variant="secondary"
              onPress={() => router.push('/(app)/foods/scan')}
            />
          </View>
          <View className="flex-1">
            <Button
              title="Add manually"
              variant="secondary"
              onPress={() => router.push('/(app)/foods/manual')}
            />
          </View>
        </View>
      </View>

      {offLoading ? (
        <View className="px-6 py-3 flex-row gap-2 items-center">
          <ActivityIndicator />
          <Text variant="caption">{t('foods.searching')}</Text>
        </View>
      ) : null}

      {error ? (
        <View className="px-6 py-3">
          <Text variant="caption" className="text-danger">
            {error}
          </Text>
        </View>
      ) : null}

      {showHint ? (
        <View className="px-6 py-4">
          <Text variant="caption">{t('foods.enterSearch')}</Text>
        </View>
      ) : null}

      {showEmpty ? (
        <View className="px-6 py-4">
          <Text variant="caption">{t('foods.noResults')}</Text>
        </View>
      ) : null}

      <FlatList
        data={items}
        keyExtractor={(it) => `${it.kind}:${it.data.sourceId}`}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32, gap: 12 }}
        renderItem={({ item }) => {
          const key = `${item.kind}:${item.data.sourceId}`;
          const isPicking = picking === key;
          return (
            <Pressable
              onPress={() => onPick(item)}
              disabled={isPicking}
              accessibilityRole="button"
              className={`flex-row gap-3 p-3 rounded-lg bg-bg-surface border border-border ${
                isPicking ? 'opacity-60' : ''
              }`}
            >
              {item.data.imageUrl ? (
                <Image
                  source={{ uri: item.data.imageUrl }}
                  style={{ width: 56, height: 56, borderRadius: 8, backgroundColor: '#222B38' }}
                />
              ) : (
                <View className="w-14 h-14 rounded-md bg-bg-elevated items-center justify-center">
                  <Text variant="caption">{item.kind === 'staple' ? t('foods.commonBadge') : '—'}</Text>
                </View>
              )}
              <View className="flex-1 gap-1">
                <Text variant="body" numberOfLines={2}>
                  {item.data.name}
                </Text>
                {item.data.brand ? (
                  <Text variant="caption" numberOfLines={1}>
                    {item.data.brand}
                  </Text>
                ) : null}
                <Text variant="caption">{macroLine(item.data)}</Text>
              </View>
              {isPicking ? <ActivityIndicator /> : null}
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}
