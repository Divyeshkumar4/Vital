import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { getLogsForDateRange } from '@/features/log/queries';
import { isoDaysAgo, sumLogs, type FoodLog } from '@/features/log/types';
import { useAuth } from '@/store/auth';
import { useProfile } from '@/store/profile';
import { t } from '@/i18n/strings';

interface DaySummary {
  date: string;
  count: number;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

function summariseByDay(logs: FoodLog[]): Map<string, DaySummary> {
  const map = new Map<string, DaySummary>();
  for (const l of logs) {
    const cur = map.get(l.date) ?? {
      date: l.date,
      count: 0,
      kcal: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
    };
    cur.count += 1;
    cur.kcal += l.kcal;
    cur.proteinG += l.proteinG;
    cur.carbsG += l.carbsG;
    cur.fatG += l.fatG;
    map.set(l.date, cur);
  }
  return map;
}

function statusFor(kcal: number, target: number | null): {
  label: string;
  color: 'on' | 'over' | 'under' | 'none';
} {
  if (!target) return { label: '', color: 'none' };
  const ratio = kcal / target;
  if (ratio >= 0.9 && ratio <= 1.1) return { label: t('log.onTarget'), color: 'on' };
  if (ratio > 1.1) return { label: t('log.overTarget'), color: 'over' };
  return { label: t('log.underTarget'), color: 'under' };
}

function pillClasses(color: 'on' | 'over' | 'under' | 'none'): string {
  if (color === 'on') return 'bg-accent/20 border-accent';
  if (color === 'over') return 'bg-warn/20 border-warn';
  if (color === 'under') return 'bg-border bg-bg-surface border-border';
  return 'bg-bg-surface border-border';
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y!, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function History() {
  const user = useAuth((s) => s.user);
  const targetCalories = useProfile((s) => s.profile?.targetCalories ?? null);

  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await getLogsForDateRange(user.id, isoDaysAgo(6), isoDaysAgo(0));
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

  const days = useMemo(() => {
    const summaries = summariseByDay(logs);
    const out: DaySummary[] = [];
    for (let i = 0; i < 7; i++) {
      const iso = isoDaysAgo(i);
      out.push(
        summaries.get(iso) ?? {
          date: iso,
          count: 0,
          kcal: 0,
          proteinG: 0,
          carbsG: 0,
          fatG: 0,
        },
      );
    }
    return out;
  }, [logs]);

  return (
    <Screen scroll className="gap-5">
      <View className="flex-row items-start justify-between mt-2">
        <View className="flex-1">
          <Text variant="caption">{t('log.historyTitle')}</Text>
        </View>
        <Pressable
          onPress={() => router.back()}
          className="px-3 py-2 rounded-md bg-bg-surface border border-border"
        >
          <Text variant="caption">{t('foods.backToSearch')}</Text>
        </Pressable>
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
          <Text variant="body">{t('log.historyEmpty')}</Text>
        </Card>
      ) : (
        days.map((d) => {
          const s = statusFor(d.kcal, targetCalories);
          return (
            <View
              key={d.date}
              className={`rounded-xl p-4 border ${pillClasses(s.color)}`}
            >
              <View className="flex-row items-baseline justify-between">
                <Text variant="h2">{formatDate(d.date)}</Text>
                <Text variant="caption">{s.label}</Text>
              </View>
              {d.count === 0 ? (
                <Text variant="caption" className="text-fg-subtle">
                  No entries
                </Text>
              ) : (
                <>
                  <Text variant="body">
                    {Math.round(d.kcal)} kcal
                    {targetCalories ? `  ${t('dashboard.title').toLowerCase()} ${targetCalories}` : ''}
                  </Text>
                  <Text variant="caption">
                    P {d.proteinG.toFixed(0)} · C {d.carbsG.toFixed(0)} · F {d.fatG.toFixed(0)} ·{' '}
                    {d.count} entr{d.count === 1 ? 'y' : 'ies'}
                  </Text>
                </>
              )}
            </View>
          );
        })
      )}
    </Screen>
  );
}
