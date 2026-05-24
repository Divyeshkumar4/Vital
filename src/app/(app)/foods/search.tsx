import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { searchFoods, type OffFood } from '@/lib/api/openFoodFacts';
import { cacheFood, offFoodToInsert } from '@/features/food/queries';
import { t } from '@/i18n/strings';

const MIN_QUERY = 3;
const DEBOUNCE_MS = 350;

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
  const [results, setResults] = useState<OffFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState<string | null>(null);
  const reqIdRef = useRef(0);

  useEffect(() => {
    setError(null);
    if (query.trim().length < MIN_QUERY) {
      setResults([]);
      setLoading(false);
      return;
    }
    const id = ++reqIdRef.current;
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const r = await searchFoods(query, 20);
        if (reqIdRef.current === id) {
          setResults(r);
          setLoading(false);
        }
      } catch (e) {
        if (reqIdRef.current === id) {
          setError(e instanceof Error ? e.message : String(e));
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [query]);

  const onPick = async (food: OffFood) => {
    setPicking(food.sourceId);
    setError(null);
    try {
      const saved = await cacheFood(offFoodToInsert(food));
      router.push({ pathname: '/(app)/foods/[id]', params: { id: saved.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : t('foods.saveError'));
    } finally {
      setPicking(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="px-6 pt-4 pb-2 gap-3">
        <View className="flex-row items-center justify-between">
          <Text variant="h1">{t('foods.findTitle')}</Text>
          <Pressable onPress={() => router.back()} className="px-3 py-2 rounded-md bg-bg-surface border border-border">
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
        <Button
          title={t('foods.scanBarcode')}
          variant="secondary"
          onPress={() => router.push('/(app)/foods/scan')}
        />
      </View>

      {loading ? (
        <View className="px-6 py-4 flex-row gap-2 items-center">
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

      {!loading && query.trim().length < MIN_QUERY ? (
        <View className="px-6 py-6">
          <Text variant="caption">{t('foods.enterSearch')}</Text>
        </View>
      ) : null}

      {!loading && query.trim().length >= MIN_QUERY && results.length === 0 && !error ? (
        <View className="px-6 py-6">
          <Text variant="caption">{t('foods.noResults')}</Text>
        </View>
      ) : null}

      <FlatList
        data={results}
        keyExtractor={(it) => `${it.sourceId}`}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32, gap: 12 }}
        renderItem={({ item }) => {
          const isPicking = picking === item.sourceId;
          return (
            <Pressable
              onPress={() => onPick(item)}
              disabled={isPicking}
              accessibilityRole="button"
              className={`flex-row gap-3 p-3 rounded-lg bg-bg-surface border border-border ${
                isPicking ? 'opacity-60' : ''
              }`}
            >
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={{ width: 56, height: 56, borderRadius: 8, backgroundColor: '#222B38' }}
                />
              ) : (
                <View className="w-14 h-14 rounded-md bg-bg-elevated items-center justify-center">
                  <Text variant="caption">—</Text>
                </View>
              )}
              <View className="flex-1 gap-1">
                <Text variant="body" numberOfLines={2}>
                  {item.name}
                </Text>
                {item.brand ? (
                  <Text variant="caption" numberOfLines={1}>
                    {item.brand}
                  </Text>
                ) : null}
                <Text variant="caption">{macroLine(item)}</Text>
              </View>
              {isPicking ? <ActivityIndicator /> : null}
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}
