import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useAuth } from '@/store/auth';
import { getActiveRoutine } from '@/features/workout/queries';
import type { RoutineFull } from '@/features/workout/types';
import { t } from '@/i18n/strings';

const WEEKDAY_LABELS = [
  t('workout.sunday'),
  t('workout.monday'),
  t('workout.tuesday'),
  t('workout.wednesday'),
  t('workout.thursday'),
  t('workout.friday'),
  t('workout.saturday'),
];

export default function WorkoutTab() {
  const user = useAuth((s) => s.user);
  const [routineFull, setRoutineFull] = useState<RoutineFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const r = await getActiveRoutine(user.id);
      setRoutineFull(r);
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

  const today = new Date().getDay();
  const todayDay = useMemo(
    () => routineFull?.days.find((d) => d.weekday === today),
    [routineFull, today],
  );

  return (
    <Screen scroll className="gap-5">
      <View className="mt-4 gap-1">
        <Text variant="caption">{t('workout.tab')}</Text>
        <Text variant="h1">{routineFull?.routine.name ?? 'Workout'}</Text>
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
      ) : !routineFull ? (
        <Card>
          <Text variant="body">{t('workout.noActiveRoutine')}</Text>
          <Button
            title={t('workout.setupCta')}
            onPress={() => router.push('/(app)/workout/setup')}
          />
        </Card>
      ) : (
        <>
          <Card title={t('workout.todayTitle')}>
            {todayDay ? (
              <>
                <Text variant="h2">{todayDay.name}</Text>
                <Text variant="caption">
                  {todayDay.exercises.length} {t('workout.exercises')}
                </Text>
                <View className="border-t border-border pt-3 gap-1">
                  {todayDay.exercises.map((ex) => (
                    <Text key={ex.id} variant="caption">
                      {ex.exerciseName} · {ex.targetSets} × {ex.targetRepsMin}–{ex.targetRepsMax}
                    </Text>
                  ))}
                </View>
                <Button
                  title={t('workout.startWorkout')}
                  onPress={() =>
                    router.push({
                      pathname: '/(app)/workout/player',
                      params: { dayId: todayDay.id },
                    })
                  }
                  className="mt-2"
                />
              </>
            ) : (
              <Text variant="body">{t('workout.noTodayWorkout')}</Text>
            )}
          </Card>

          <Card title={t('workout.weekTitle')}>
            {Array.from({ length: 7 }, (_, i) => i).map((wd) => {
              const day = routineFull.days.find((d) => d.weekday === wd);
              return (
                <View key={wd} className="flex-row justify-between py-1">
                  <Text variant="body" className={wd === today ? 'font-semibold text-accent' : ''}>
                    {WEEKDAY_LABELS[wd]}
                  </Text>
                  <Text variant="caption" className={wd === today ? 'text-accent' : ''}>
                    {day ? day.name : t('workout.rest')}
                  </Text>
                </View>
              );
            })}
          </Card>

          <Button
            title={t('workout.setupCta')}
            variant="ghost"
            onPress={() => router.push('/(app)/workout/setup')}
          />
        </>
      )}
    </Screen>
  );
}
