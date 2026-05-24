import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { deleteLog, getLogsForDate } from '@/features/log/queries';
import { MEAL_SLOTS, sumLogs, todayISO, type FoodLog, type MealSlot } from '@/features/log/types';
import { useAuth } from '@/store/auth';
import { t } from '@/i18n/strings';

function MealSection({
  slot,
  logs,
  onDelete,
}: {
  slot: MealSlot;
  logs: FoodLog[];
  onDelete: (id: string) => void;
}) {
  if (logs.length === 0) return null;
  const total = sumLogs(logs);
  return (
    <Card title={t(`log.${slot}` as const)}>
      {logs.map((l) => (
        <View key={l.id} className="flex-row items-start gap-3">
          <View className="flex-1 gap-1">
            <Text variant="body" numberOfLines={2}>
              {l.foodName}
            </Text>
            <Text variant="caption">
              {l.quantityG.toFixed(0)} g · {Math.round(l.kcal)} kcal · P {l.proteinG.toFixed(0)} ·
              C {l.carbsG.toFixed(0)} · F {l.fatG.toFixed(0)}
            </Text>
          </View>
          <Pressable
            onPress={() =>
              Alert.alert(t('log.deleteConfirm'), '', [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('log.delete'), style: 'destructive', onPress: () => onDelete(l.id) },
              ])
            }
            className="px-3 py-2 rounded-md bg-bg-elevated border border-border"
          >
            <Text variant="caption">{t('log.delete')}</Text>
          </Pressable>
        </View>
      ))}
      <View className="flex-row justify-between border-t border-border pt-2">
        <Text variant="caption">{Math.round(total.kcal)} kcal</Text>
        <Text variant="caption">
          P {total.proteinG.toFixed(0)} · C {total.carbsG.toFixed(0)} · F {total.fatG.toFixed(0)}
        </Text>
      </View>
    </Card>
  );
}

export default function LogTab() {
  const user = useAuth((s) => s.user);
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await getLogsForDate(user.id, todayISO());
      setLogs(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onDelete = async (id: string) => {
    try {
      await deleteLog(id);
      setLogs((prev) => prev.filter((l) => l.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const totals = sumLogs(logs);

  return (
    <Screen scroll className="gap-5">
      <View className="mt-4 gap-1">
        <Text variant="caption">{t('log.todayTitle')}</Text>
        <Text variant="h1">{Math.round(totals.kcal)} kcal</Text>
        <Text variant="caption">
          P {totals.proteinG.toFixed(0)} · C {totals.carbsG.toFixed(0)} · F {totals.fatG.toFixed(0)}
        </Text>
      </View>

      {error ? (
        <Text variant="caption" className="text-danger">
          {error}
        </Text>
      ) : null}

      {loading ? (
        <View className="py-6 items-center">
          <ActivityIndicator />
        </View>
      ) : logs.length === 0 ? (
        <Card>
          <Text variant="body">{t('log.empty')}</Text>
          <Button title={t('dashboard.startLogging')} onPress={() => router.push('/(app)/foods/search')} />
        </Card>
      ) : (
        <>
          {MEAL_SLOTS.map((slot) => (
            <MealSection
              key={slot}
              slot={slot}
              logs={logs.filter((l) => l.meal === slot)}
              onDelete={onDelete}
            />
          ))}
          <Button title={t('dashboard.startLogging')} onPress={() => router.push('/(app)/foods/search')} />
        </>
      )}

      <Button
        title={t('dashboard.viewHistory')}
        variant="secondary"
        onPress={() => router.push('/(app)/log/history')}
      />
    </Screen>
  );
}
