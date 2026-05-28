import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { NumberField } from '@/components/NumberField';
import { useAuth } from '@/store/auth';
import {
  finishWorkout,
  getActiveRoutine,
  getLastSetsForExercise,
  logSet,
  startWorkout,
} from '@/features/workout/queries';
import type { RoutineExercise, RoutineFull, SetLog } from '@/features/workout/types';
import { exerciseById } from '@/lib/api/exercises';
import { suggestProgression, type PreviousSet } from '@/lib/science/workout';
import { t } from '@/i18n/strings';

interface CurrentExerciseState {
  routineExercise: RoutineExercise;
  isCompound: boolean;
  history: SetLog[];
  suggestedWeight: number;
  suggestedReps: number;
  suggestionReason: 'first_session' | 'hold' | 'add_reps' | 'add_weight';
}

function suggestionLine(state: CurrentExerciseState): string {
  if (state.suggestionReason === 'first_session') return t('workout.playerReasonFirst');
  if (state.suggestionReason === 'add_weight') return t('workout.playerReasonAddWeight');
  if (state.suggestionReason === 'add_reps') return t('workout.playerReasonAddReps');
  return t('workout.playerReasonHold');
}

export default function WorkoutPlayer() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const user = useAuth((s) => s.user);

  const [routineFull, setRoutineFull] = useState<RoutineFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null);

  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0); // 0-based; "Set 1 of 3" displays as setIdx+1
  const [weightStr, setWeightStr] = useState('');
  const [repsStr, setRepsStr] = useState('');
  const [rirStr, setRirStr] = useState('');

  const [restRemaining, setRestRemaining] = useState(0);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [currentState, setCurrentState] = useState<CurrentExerciseState | null>(null);

  // 1. Load routine + day + start workout log.
  useEffect(() => {
    if (!user || !dayId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const full = await getActiveRoutine(user.id);
        if (cancelled) return;
        if (!full) {
          setError('No active routine.');
          setLoading(false);
          return;
        }
        setRoutineFull(full);
        const day = full.days.find((d) => d.id === dayId);
        if (!day) {
          setError('Workout day not found.');
          setLoading(false);
          return;
        }
        const log = await startWorkout({
          userId: user.id,
          routineDayId: day.id,
          routineName: full.routine.name,
          dayName: day.name,
        });
        if (cancelled) return;
        setWorkoutLogId(log.id);
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, dayId]);

  const day = useMemo(
    () => routineFull?.days.find((d) => d.id === dayId),
    [routineFull, dayId],
  );

  const exercise = day?.exercises[exerciseIdx];

  // 2. When the current exercise changes, fetch its last session and seed the inputs.
  useEffect(() => {
    if (!user || !exercise) return;
    let cancelled = false;
    (async () => {
      try {
        const history = await getLastSetsForExercise(user.id, exercise.exerciseId);
        if (cancelled) return;
        const meta = exerciseById(exercise.exerciseId);
        const isCompound = meta?.isCompound ?? false;
        const targetReps = exercise.targetRepsMin;
        const prev: PreviousSet[] = history.map((s) => ({
          weightKg: s.weightKg ?? 0,
          reps: s.reps ?? 0,
          rir: s.rir,
        }));
        const sug = suggestProgression(prev, targetReps, isCompound);
        const state: CurrentExerciseState = {
          routineExercise: exercise,
          isCompound,
          history,
          suggestedWeight: sug.weightKg,
          suggestedReps: sug.reps,
          suggestionReason: sug.reason,
        };
        setCurrentState(state);
        setWeightStr(sug.weightKg > 0 ? String(sug.weightKg) : '');
        setRepsStr(String(sug.reps));
        setRirStr(exercise.targetRir !== null ? String(exercise.targetRir) : '');
        setSetIdx(0);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, exercise]);

  // Rest timer countdown.
  useEffect(() => {
    if (restRemaining <= 0) {
      if (restRef.current) {
        clearInterval(restRef.current);
        restRef.current = null;
      }
      return;
    }
    if (!restRef.current) {
      restRef.current = setInterval(() => {
        setRestRemaining((v) => (v <= 1 ? 0 : v - 1));
      }, 1000);
    }
    return () => {
      if (restRef.current) {
        clearInterval(restRef.current);
        restRef.current = null;
      }
    };
  }, [restRemaining]);

  // Clean up timer on unmount.
  useEffect(
    () => () => {
      if (restRef.current) clearInterval(restRef.current);
    },
    [],
  );

  const onCompleteSet = async () => {
    if (!user || !workoutLogId || !exercise || !currentState) return;
    const weight = parseFloat(weightStr);
    const reps = parseInt(repsStr, 10);
    if (!Number.isFinite(reps) || reps < 0) {
      setError('Enter the reps you did.');
      return;
    }
    const rir = rirStr.trim() === '' ? null : parseInt(rirStr, 10);
    try {
      await logSet({
        workoutLogId,
        userId: user.id,
        routineExerciseId: exercise.id,
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        setIndex: setIdx + 1,
        weightKg: Number.isFinite(weight) ? weight : null,
        reps,
        rir,
      });
      // Advance.
      const nextSetIdx = setIdx + 1;
      if (nextSetIdx < exercise.targetSets) {
        setSetIdx(nextSetIdx);
        setRestRemaining(exercise.restSec);
      } else {
        // All sets done for this exercise. Move on or wait for "Next exercise" tap.
        setRestRemaining(0);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const onNextExercise = () => {
    if (!day) return;
    const nextIdx = exerciseIdx + 1;
    if (nextIdx >= day.exercises.length) {
      onFinish();
      return;
    }
    setExerciseIdx(nextIdx);
    setRestRemaining(0);
  };

  const onFinish = useCallback(async () => {
    if (!workoutLogId) {
      router.replace('/(app)/(tabs)/workout');
      return;
    }
    try {
      await finishWorkout(workoutLogId);
    } catch (e) {
      // Non-fatal — log was created; just navigate away.
      setError(e instanceof Error ? e.message : String(e));
    }
    router.replace('/(app)/(tabs)/workout');
  }, [workoutLogId]);

  const onExitConfirm = () => {
    Alert.alert(t('workout.playerExitConfirm'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('workout.playerFinish'), style: 'destructive', onPress: onFinish },
    ]);
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

  if (error || !day || !exercise || !currentState) {
    return (
      <Screen>
        <View className="gap-4 mt-8">
          <Text variant="h1">{error ?? 'Could not start workout.'}</Text>
          <Button
            title={t('foods.backToSearch')}
            variant="secondary"
            onPress={() => router.back()}
          />
        </View>
      </Screen>
    );
  }

  const allSetsDone = setIdx >= exercise.targetSets;
  const isLastExercise = exerciseIdx === day.exercises.length - 1;

  return (
    <Screen scroll className="gap-5">
      <View className="flex-row justify-between items-start mt-2">
        <View className="flex-1">
          <Text variant="caption">{day.name}</Text>
          <Text variant="h2">
            {exerciseIdx + 1} / {day.exercises.length}
          </Text>
        </View>
        <Pressable
          onPress={onExitConfirm}
          className="px-3 py-2 rounded-md bg-bg-surface border border-border"
        >
          <Text variant="caption">{t('workout.playerFinish')}</Text>
        </Pressable>
      </View>

      <Card>
        <Text variant="h1">{exercise.exerciseName}</Text>
        <Text variant="caption">
          {exercise.targetSets} × {exercise.targetRepsMin}–{exercise.targetRepsMax} {t('workout.playerRepsUnit')}
          {exercise.targetRir !== null ? ` · RIR ${exercise.targetRir}` : ''}
          {' · '}
          {t('workout.playerRestRemaining')} {exercise.restSec}{t('workout.playerSec')}
        </Text>
      </Card>

      {restRemaining > 0 ? (
        <Card>
          <Text variant="h2" className="text-accent">
            {t('workout.playerRestRemaining')}: {restRemaining}{t('workout.playerSec')}
          </Text>
          <Button
            title={t('workout.playerSkipRest')}
            variant="secondary"
            onPress={() => setRestRemaining(0)}
          />
        </Card>
      ) : null}

      <Card
        title={`${t('workout.playerSet')} ${Math.min(setIdx + 1, exercise.targetSets)} ${t('workout.playerOf')} ${exercise.targetSets}`}
      >
        <Text variant="caption">
          {t('workout.playerSuggested')}: {currentState.suggestedWeight > 0 ? `${currentState.suggestedWeight} ${t('workout.playerKg')} × ` : ''}
          {currentState.suggestedReps} {t('workout.playerRepsUnit')}
          {' — '}
          {suggestionLine(currentState)}
        </Text>

        <NumberField
          label={`${t('workout.playerWeight')} (${t('workout.playerKg')})`}
          value={weightStr}
          onChangeText={setWeightStr}
          mode="decimal"
          suffix={t('workout.playerKg')}
        />
        <NumberField
          label={t('workout.playerReps')}
          value={repsStr}
          onChangeText={setRepsStr}
          mode="integer"
          suffix={t('workout.playerRepsUnit')}
        />
        <NumberField
          label={t('workout.playerRir')}
          value={rirStr}
          onChangeText={setRirStr}
          mode="integer"
        />

        {!allSetsDone ? (
          <Button title={t('workout.playerCompleteSet')} onPress={onCompleteSet} />
        ) : null}
      </Card>

      {allSetsDone ? (
        <Button
          title={isLastExercise ? t('workout.playerFinish') : t('workout.playerNextExercise')}
          onPress={onNextExercise}
        />
      ) : null}

      {currentState.history.length > 0 ? (
        <Card title={t('workout.playerLastSession')}>
          {currentState.history.map((s, i) => (
            <View key={s.id} className="flex-row justify-between">
              <Text variant="caption">
                {t('workout.playerSet')} {i + 1}
              </Text>
              <Text variant="caption">
                {s.weightKg !== null ? `${s.weightKg} ${t('workout.playerKg')} × ` : ''}
                {s.reps ?? '—'} {t('workout.playerRepsUnit')}
                {s.rir !== null ? ` · RIR ${s.rir}` : ''}
              </Text>
            </View>
          ))}
        </Card>
      ) : null}
    </Screen>
  );
}
