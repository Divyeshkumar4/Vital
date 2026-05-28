import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text as RNText, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Pill } from '@/components/Pill';
import { useAuth } from '@/store/auth';
import { getActiveRoutine } from '@/features/workout/queries';
import type { RoutineFull } from '@/features/workout/types';
import { tokens } from '@/lib/design/tokens';
import { t } from '@/i18n/strings';

const WEEKDAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEKDAY_FULL = [
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
    <Screen scroll className="gap-6">
      <View className="mt-4 gap-1">
        <Text variant="caption">{t('workout.tab')}</Text>
        <Text variant="h1">{routineFull?.routine.name ?? 'Your training'}</Text>
        {routineFull ? (
          <Text variant="caption" className="text-fg-muted">
            {routineFull.days.length} training days / week ·{' '}
            {routineFull.routine.experience.charAt(0).toUpperCase() +
              routineFull.routine.experience.slice(1)}
          </Text>
        ) : null}
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
          <Button title={t('workout.setupCta')} onPress={() => router.push('/(app)/workout/setup')} />
        </Card>
      ) : (
        <>
          {/* Visual week strip */}
          <Card>
            <Text variant="caption" className="text-fg-muted">
              {t('workout.weekTitle')}
            </Text>
            <View className="flex-row justify-between mt-1">
              {Array.from({ length: 7 }, (_, wd) => wd).map((wd) => {
                const day = routineFull.days.find((d) => d.weekday === wd);
                const isToday = wd === today;
                const filled = !!day;
                let bg: string = tokens.colors.bg.surface;
                let border: string = tokens.colors.border.DEFAULT;
                let labelColor: string = tokens.colors.fg.muted;
                if (filled) {
                  bg = tokens.colors.accent.subtle;
                  border = tokens.colors.accent.DEFAULT;
                  labelColor = tokens.colors.accent.DEFAULT;
                }
                if (isToday) {
                  border = tokens.colors.info.DEFAULT;
                  labelColor = filled ? tokens.colors.accent.DEFAULT : tokens.colors.info.DEFAULT;
                }
                return (
                  <View key={wd} className="items-center gap-1">
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        borderWidth: isToday ? 2 : 1,
                        backgroundColor: bg,
                        borderColor: border,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <RNText
                        style={{ color: labelColor, fontSize: 13, fontWeight: '600' }}
                      >
                        {WEEKDAY_SHORT[wd]}
                      </RNText>
                    </View>
                    <RNText
                      style={{
                        fontSize: 10,
                        color: isToday ? tokens.colors.info.DEFAULT : tokens.colors.fg.subtle,
                        fontWeight: isToday ? '600' : '400',
                      }}
                    >
                      {day ? '●' : '○'}
                    </RNText>
                  </View>
                );
              })}
            </View>
          </Card>

          {/* Today */}
          <Card>
            <View className="flex-row items-baseline justify-between">
              <Text variant="caption">{t('workout.todayTitle')}</Text>
              {todayDay ? (
                <Pill label="" value={`${todayDay.exercises.length} exercises`} tone="info" />
              ) : null}
            </View>

            {todayDay ? (
              <>
                <Text variant="h2">{todayDay.name}</Text>
                <View className="border-t border-border pt-3 gap-1">
                  {todayDay.exercises.map((ex) => (
                    <Text key={ex.id} variant="caption">
                      {ex.exerciseName} · {ex.targetSets} × {ex.targetRepsMin}–{ex.targetRepsMax}
                    </Text>
                  ))}
                </View>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/(app)/workout/player',
                      params: { dayId: todayDay.id },
                    })
                  }
                  className="mt-2 flex-row items-center justify-center min-h-12 rounded-lg bg-accent"
                >
                  <RNText
                    style={{ color: tokens.colors.accent.contrast, fontSize: 16, fontWeight: '600' }}
                  >
                    {t('workout.startWorkout')}
                  </RNText>
                </Pressable>
              </>
            ) : (
              <>
                <Text variant="body">Rest day. Recovery is when growth happens.</Text>
                <Text variant="caption" className="text-fg-muted">
                  Next session: {nextSessionLabel(routineFull, today)}
                </Text>
              </>
            )}
          </Card>

          <Button
            title="Change routine"
            variant="secondary"
            onPress={() => router.push('/(app)/workout/setup')}
          />
        </>
      )}
    </Screen>
  );
}

function nextSessionLabel(full: RoutineFull, today: number): string {
  for (let i = 1; i <= 7; i++) {
    const wd = (today + i) % 7;
    const day = full.days.find((d) => d.weekday === wd);
    if (day) {
      const dayLabel = i === 1 ? 'tomorrow' : WEEKDAY_FULL[wd];
      return `${day.name} · ${dayLabel}`;
    }
  }
  return '—';
}
