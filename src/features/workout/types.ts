import type { TrainingGoal } from '@/lib/science/workout';

export type SplitType = 'full_body' | 'upper_lower' | 'ppl' | 'body_part' | 'custom';
export type Experience = 'beginner' | 'intermediate' | 'advanced';

export interface Routine {
  id: string;
  userId: string;
  name: string;
  splitType: SplitType;
  experience: Experience;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineDay {
  id: string;
  routineId: string;
  weekday: number | null; // 0..6 Sun..Sat
  name: string;
  orderIdx: number;
}

export interface RoutineExercise {
  id: string;
  routineDayId: string;
  exerciseId: string;
  exerciseName: string;
  orderIdx: number;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetRir: number | null;
  restSec: number;
  notes: string | null;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  routineDayId: string | null;
  routineName: string | null;
  dayName: string | null;
  startedAt: string;
  endedAt: string | null;
  notes: string | null;
}

export interface SetLog {
  id: string;
  workoutLogId: string;
  userId: string;
  routineExerciseId: string | null;
  exerciseId: string;
  exerciseName: string;
  setIndex: number;
  weightKg: number | null;
  reps: number | null;
  rir: number | null;
  completedAt: string;
}

/** Builder shape used when generating + persisting a fresh routine. */
export interface RoutineDraft {
  name: string;
  splitType: SplitType;
  experience: Experience;
  goal: TrainingGoal;
  days: RoutineDayDraft[];
}

export interface RoutineDayDraft {
  name: string;
  weekday: number | null;
  exercises: RoutineExerciseDraft[];
}

export interface RoutineExerciseDraft {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetRir: number | null;
  restSec: number;
}

/** Composite returned from getActiveRoutineFull(): one routine + its days + their exercises. */
export interface RoutineFull {
  routine: Routine;
  days: (RoutineDay & { exercises: RoutineExercise[] })[];
}
