import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Stepper } from '@/components/Stepper';
import { Pill } from '@/components/Pill';
import { CircularProgress } from '@/components/CircularProgress';
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
import { tokens } from '@/lib/design/tokens';
import { t } from '@/i18n/strings';

interface CurrentExerciseState {
  routineExercise: RoutineExercise;
  isCompound: boolean;
  history: SetLog[];
  suggestedWeight: number;
  suggestedReps: number;
  suggestionReason: 'first_session' | 'hold' | 'add_reps' | 'add_weight';
}

function suggestionLine(reason: CurrentExerciseState['suggestionReason']): string {
  if (reason === 'first_session') return t('workout.playerReasonFirst');
  if (reason === 'add_weight') return t('workout.playerReasonAddWeight');
  if (reason === 'add_reps') return t('workout.playerReasonAddReps');
  return t('workout.playerReasonHold');
}

interface CompletedSet {
  setIndex: number;
  weightKg: number | null;
  reps: number | null;
}

export default function WorkoutPlayer() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const user = useAuth((s) => s.user);

  const [routineFull, setRoutineFull] = useState<RoutineFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null);

  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [weightStr, setWeightStr] = useState('');
  const [repsStr, setRepsStr] = useState('');
  const [rirStr, setRirStr] = useState('');
  const [completedSets, setCompletedSets] = useState<CompletedSet[]>([]);

  const [restRemaining, setRestRemaining] = useState(0);
  const [restTotal, setRestTotal] = useState(0);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [currentState, setCurrentState] = useState<CurrentExerciseState | null>(null);

  // Load routine + start workout log.
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

  // When exercise changes, fetch its last session + seed inputs.
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
        setCurrentState({
          routineExercise: exercise,
          isCompound,
          history,
          suggestedWeight: sug.weightKg,
          suggestedReps: sug.reps,
          suggestionReason: sug.reason,
        });
        setWeightStr(sug.weightKg > 0 ? String(sug.weightKg) : '');
        setRepsStr(String(sug.reps));
        setRirStr(exercise.targetRir !== null ? String(exercise.targetRir) : '');
        setSetIdx(0);
        setCompletedSets([]);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, exercise]);

  // Rest timer.
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
      setCompletedSets((prev) => [
        ...prev,
        { setIndex: setIdx + 1, weightKg: Number.isFinite(weight) ? weight : null, reps },
      ]);
      const nextSetIdx = setIdx + 1;
      if (nextSetIdx < exercise.targetSets) {
        setSetIdx(nextSetIdx);
        setRestTotal(exercise.restSec);
        setRestRemaining(exercise.restSec);
      } else {
        setRestRemaining(0);
        setRestTotal(0);
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
    setRestTotal(0);
  };

  const onFinish = useCallback(async () => {
    if (!workoutLogId) {
      router.replace('/(app)/(tabs)/workout');
      return;
    }
    try {
      await finishWorkout(workoutLogId);
    } catch (e) {
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
      {/* Header */}
      <View className="flex-row items-start justify-between mt-2">
        <View className="flex-1">
          <Text variant="caption" className="text-fg-muted">
            {day.name}  ·  Exercise {exerciseIdx + 1} / {day.exercises.length}
          </Text>
          <Text variant="h1">{exercise.exerciseName}</Text>
          <Text variant="caption" className="text-fg-muted">
            {exercise.targetSets} × {exercise.targetRepsMin}–{exercise.targetRepsMax} reps
            {exercise.targetRir !== null ? ` · RIR ${exercise.targetRir}` : ''}
          </Text>
        </View>
        <Pressable
          onPress={onExitConfirm}
          accessibilityRole="button"
          className="px-3 py-2 rounded-md bg-bg-surface border border-border"
        >
          <Text variant="caption">End</Text>
        </Pressable>
      </View>

      {/* Set tracker dots */}
      <View className="flex-row gap-2 justify-center">
        {Array.from({ length: exercise.targetSets }, (_, i) => {
          const done = completedSets.find((c) => c.setIndex === i + 1);
          const active = i === setIdx && !allSetsDone;
          let bg: string = tokens.colors.bg.surface;
          let border: string = tokens.colors.border.DEFAULT;
          if (done) {
            bg = tokens.colors.accent.DEFAULT;
            border = tokens.colors.accent.DEFAULT;
          } else if (active) {
            border = tokens.colors.accent.DEFAULT;
          }
          return (
            <View
              key={i}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                borderWidth: 2,
                backgroundColor: bg,
                borderColor: border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: done ? tokens.colors.accent.contrast : tokens.colors.fg.DEFAULT,
                  fontSize: 14,
                  fontWeight: '600',
                }}
              >
                {done ? '✓' : i + 1}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Rest timer ring (shown only during rest) */}
      {restRemaining > 0 ? (
        <View className="items-center gap-2">
          <CircularProgress
            progress={restTotal > 0 ? (restTotal - restRemaining) / restTotal : 0}
            size={160}
            strokeWidth={10}
            color={tokens.colors.info.DEFAULT}
          >
            <Text
              style={{
                color: tokens.colors.info.DEFAULT,
                fontSize: 36,
                fontWeight: '700',
                fontVariant: ['tabular-nums'],
              }}
            >
              {restRemaining}
            </Text>
            <Text variant="caption" className="text-fg-muted">
              rest · sec
            </Text>
          </CircularProgress>
          <Pressable
            onPress={() => setRestRemaining(0)}
            className="px-4 py-2 rounded-md bg-bg-surface border border-border"
          >
            <Text variant="caption">{t('workout.playerSkipRest')}</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Suggestion */}
      {!allSetsDone ? (
        <Card>
          <View className="flex-row gap-2 items-center flex-wrap">
            <Pill label={t('workout.playerSuggested')} tone="info" />
            <Text variant="caption" className="flex-1">
              {currentState.suggestedWeight > 0
                ? `${currentState.suggestedWeight} kg × ${currentState.suggestedReps} reps`
                : `Pick a starting weight you can do ${currentState.suggestedReps} reps with`}
            </Text>
          </View>
          <Text variant="caption" className="text-fg-subtle">
            {suggestionLine(currentState.suggestionReason)}
          </Text>
        </Card>
      ) : null}

      {/* Inputs */}
      {!allSetsDone ? (
        <>
          <Stepper
            label={t('workout.playerWeight')}
            value={weightStr}
            onChangeText={setWeightStr}
            step={2.5}
            mode="decimal"
            suffix="kg"
          />
          <Stepper
            label={t('workout.playerReps')}
            value={repsStr}
            onChangeText={setRepsStr}
            step={1}
            mode="integer"
            suffix="reps"
          />
          <Stepper
            label={t('workout.playerRir')}
            value={rirStr}
            onChangeText={setRirStr}
            step={1}
            mode="integer"
            hint="how many reps you had left in the tank"
          />
          <Button title={t('workout.playerCompleteSet')} onPress={onCompleteSet} />
        </>
      ) : (
        <Button
          title={isLastExercise ? t('workout.playerFinish') : t('workout.playerNextExercise')}
          onPress={onNextExercise}
        />
      )}

      {/* Last session reference */}
      {currentState.history.length > 0 ? (
        <Card title={t('workout.playerLastSession')}>
          <View className="flex-row flex-wrap gap-2">
            {currentState.history.map((s) => (
              <Pill
                key={s.id}
                label={`Set ${s.setIndex}`}
                value={
                  s.weightKg !== null
                    ? `${s.weightKg} × ${s.reps ?? '—'}`
                    : `${s.reps ?? '—'}`
                }
                tone="neutral"
              />
            ))}
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}
