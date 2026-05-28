import { supabase } from '@/lib/supabase/client';
import type {
  Routine,
  RoutineDay,
  RoutineDraft,
  RoutineExercise,
  RoutineFull,
  SetLog,
  WorkoutLog,
} from './types';

interface RoutineRow {
  id: string;
  user_id: string;
  name: string;
  split_type: Routine['splitType'];
  experience: Routine['experience'];
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface DayRow {
  id: string;
  routine_id: string;
  weekday: number | null;
  name: string;
  order_idx: number;
}

interface ExerciseRow {
  id: string;
  routine_day_id: string;
  exercise_id: string;
  exercise_name: string;
  order_idx: number;
  target_sets: number;
  target_reps_min: number;
  target_reps_max: number;
  target_rir: number | null;
  rest_sec: number;
  notes: string | null;
}

interface WorkoutLogRow {
  id: string;
  user_id: string;
  routine_day_id: string | null;
  routine_name: string | null;
  day_name: string | null;
  started_at: string;
  ended_at: string | null;
  notes: string | null;
}

interface SetLogRow {
  id: string;
  workout_log_id: string;
  user_id: string;
  routine_exercise_id: string | null;
  exercise_id: string;
  exercise_name: string;
  set_index: number;
  weight_kg: number | null;
  reps: number | null;
  rir: number | null;
  completed_at: string;
}

function routineFromRow(r: RoutineRow): Routine {
  return {
    id: r.id,
    userId: r.user_id,
    name: r.name,
    splitType: r.split_type,
    experience: r.experience,
    active: r.active,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function dayFromRow(d: DayRow): RoutineDay {
  return {
    id: d.id,
    routineId: d.routine_id,
    weekday: d.weekday,
    name: d.name,
    orderIdx: d.order_idx,
  };
}

function exerciseFromRow(e: ExerciseRow): RoutineExercise {
  return {
    id: e.id,
    routineDayId: e.routine_day_id,
    exerciseId: e.exercise_id,
    exerciseName: e.exercise_name,
    orderIdx: e.order_idx,
    targetSets: e.target_sets,
    targetRepsMin: e.target_reps_min,
    targetRepsMax: e.target_reps_max,
    targetRir: e.target_rir,
    restSec: e.rest_sec,
    notes: e.notes,
  };
}

function workoutLogFromRow(r: WorkoutLogRow): WorkoutLog {
  return {
    id: r.id,
    userId: r.user_id,
    routineDayId: r.routine_day_id,
    routineName: r.routine_name,
    dayName: r.day_name,
    startedAt: r.started_at,
    endedAt: r.ended_at,
    notes: r.notes,
  };
}

function setLogFromRow(r: SetLogRow): SetLog {
  return {
    id: r.id,
    workoutLogId: r.workout_log_id,
    userId: r.user_id,
    routineExerciseId: r.routine_exercise_id,
    exerciseId: r.exercise_id,
    exerciseName: r.exercise_name,
    setIndex: r.set_index,
    weightKg: r.weight_kg === null ? null : Number(r.weight_kg),
    reps: r.reps,
    rir: r.rir,
    completedAt: r.completed_at,
  };
}

export async function getActiveRoutine(userId: string): Promise<RoutineFull | null> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data: routine, error: routineError } = await supabase
    .from('routines')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (routineError) throw routineError;
  if (!routine) return null;

  const { data: days, error: daysError } = await supabase
    .from('routine_days')
    .select('*')
    .eq('routine_id', routine.id)
    .order('order_idx', { ascending: true });
  if (daysError) throw daysError;

  const dayIds = (days ?? []).map((d) => d.id);
  let exercises: ExerciseRow[] = [];
  if (dayIds.length > 0) {
    const { data: ex, error: exError } = await supabase
      .from('routine_exercises')
      .select('*')
      .in('routine_day_id', dayIds)
      .order('order_idx', { ascending: true });
    if (exError) throw exError;
    exercises = (ex ?? []) as ExerciseRow[];
  }

  const dayMap = new Map<string, RoutineExercise[]>();
  for (const e of exercises) {
    const list = dayMap.get(e.routine_day_id) ?? [];
    list.push(exerciseFromRow(e));
    dayMap.set(e.routine_day_id, list);
  }

  return {
    routine: routineFromRow(routine as RoutineRow),
    days: (days as DayRow[]).map((d) => ({
      ...dayFromRow(d),
      exercises: dayMap.get(d.id) ?? [],
    })),
  };
}

/**
 * Persist a fresh routine. Deactivates any existing active routine for the user
 * so getActiveRoutine returns the new one.
 */
export async function createRoutineFromDraft(
  userId: string,
  draft: RoutineDraft,
): Promise<RoutineFull> {
  if (!supabase) throw new Error('Supabase is not configured.');

  // Deactivate previous active routines.
  await supabase.from('routines').update({ active: false }).eq('user_id', userId).eq('active', true);

  // Insert routine.
  const { data: routineRow, error: routineError } = await supabase
    .from('routines')
    .insert({
      user_id: userId,
      name: draft.name,
      split_type: draft.splitType,
      experience: draft.experience,
      active: true,
    })
    .select('*')
    .single();
  if (routineError) throw routineError;

  const routineId = (routineRow as RoutineRow).id;

  // Insert days.
  const dayInserts = draft.days.map((d, idx) => ({
    routine_id: routineId,
    weekday: d.weekday,
    name: d.name,
    order_idx: idx,
  }));
  const { data: dayRows, error: dayError } = await supabase
    .from('routine_days')
    .insert(dayInserts)
    .select('*');
  if (dayError) throw dayError;

  // Insert exercises for each day.
  const exerciseInserts: Omit<ExerciseRow, 'id'>[] = [];
  for (const day of draft.days) {
    const matchedRow = (dayRows as DayRow[]).find(
      (r) => r.name === day.name && r.weekday === day.weekday,
    );
    if (!matchedRow) continue;
    day.exercises.forEach((e, idx) => {
      exerciseInserts.push({
        routine_day_id: matchedRow.id,
        exercise_id: e.exerciseId,
        exercise_name: e.exerciseName,
        order_idx: idx,
        target_sets: e.targetSets,
        target_reps_min: e.targetRepsMin,
        target_reps_max: e.targetRepsMax,
        target_rir: e.targetRir,
        rest_sec: e.restSec,
        notes: null,
      });
    });
  }

  if (exerciseInserts.length > 0) {
    const { error: exError } = await supabase.from('routine_exercises').insert(exerciseInserts);
    if (exError) throw exError;
  }

  const full = await getActiveRoutine(userId);
  if (!full) throw new Error('Created routine but could not fetch it back.');
  return full;
}

export async function startWorkout(input: {
  userId: string;
  routineDayId: string;
  routineName: string;
  dayName: string;
}): Promise<WorkoutLog> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('workout_logs')
    .insert({
      user_id: input.userId,
      routine_day_id: input.routineDayId,
      routine_name: input.routineName,
      day_name: input.dayName,
    })
    .select('*')
    .single();
  if (error) throw error;
  return workoutLogFromRow(data as WorkoutLogRow);
}

export async function finishWorkout(workoutLogId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase
    .from('workout_logs')
    .update({ ended_at: new Date().toISOString() })
    .eq('id', workoutLogId);
  if (error) throw error;
}

export async function logSet(input: {
  workoutLogId: string;
  userId: string;
  routineExerciseId: string | null;
  exerciseId: string;
  exerciseName: string;
  setIndex: number;
  weightKg: number | null;
  reps: number | null;
  rir: number | null;
}): Promise<SetLog> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('set_logs')
    .insert({
      workout_log_id: input.workoutLogId,
      user_id: input.userId,
      routine_exercise_id: input.routineExerciseId,
      exercise_id: input.exerciseId,
      exercise_name: input.exerciseName,
      set_index: input.setIndex,
      weight_kg: input.weightKg,
      reps: input.reps,
      rir: input.rir,
    })
    .select('*')
    .single();
  if (error) throw error;
  return setLogFromRow(data as SetLogRow);
}

/**
 * Return the most recent COMPLETED session for this exercise (workout that has
 * an ended_at). Useful for progression suggestions on the next session.
 */
export async function getLastSetsForExercise(
  userId: string,
  exerciseId: string,
): Promise<SetLog[]> {
  if (!supabase) throw new Error('Supabase is not configured.');

  // Find the most recent finished workout that has at least one set for this exercise.
  const { data: lastSet, error: lastErr } = await supabase
    .from('set_logs')
    .select('workout_log_id, completed_at')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lastErr) throw lastErr;
  if (!lastSet) return [];

  const { data: rows, error } = await supabase
    .from('set_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .eq('workout_log_id', lastSet.workout_log_id)
    .order('set_index', { ascending: true });
  if (error) throw error;
  return (rows as SetLogRow[]).map(setLogFromRow);
}
