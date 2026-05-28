/**
 * Routine generator. Three templates spanning master prompt § 3.7's experience
 * tiers:
 * - Beginner: 3-day full-body A/B/A (Starting Strength / Stronglifts shape).
 * - Intermediate: 4-day upper / lower split.
 * - Advanced: 6-day push / pull / legs A/B.
 *
 * Each template lists exercise IDs from src/lib/api/exercises.ts. The selected
 * goal (strength / hypertrophy / endurance) drives the rep range and rest
 * seconds applied to every set.
 */
import { repSchemeForGoal, type TrainingGoal } from '@/lib/science/workout';
import { exerciseById } from '@/lib/api/exercises';
import type { Experience, RoutineDraft, RoutineDayDraft, RoutineExerciseDraft } from './types';

interface ExerciseSlot {
  exerciseId: string;
  /** Override sets count when the template wants something different from the goal default. */
  setsOverride?: number;
}

interface DayTemplate {
  name: string;
  weekday: number | null;
  exercises: ExerciseSlot[];
}

interface RoutineTemplate {
  name: string;
  splitType: RoutineDraft['splitType'];
  experience: Experience;
  days: DayTemplate[];
}

// 0=Sun, 1=Mon, ... 6=Sat (matches Date.getDay()).
const TEMPLATES: RoutineTemplate[] = [
  // ----- Beginner: 3-day Full-Body (Mon / Wed / Fri) -----
  {
    name: 'Beginner Full-Body',
    splitType: 'full_body',
    experience: 'beginner',
    days: [
      {
        name: 'Full-Body A',
        weekday: 1,
        exercises: [
          { exerciseId: 'back-squat' },
          { exerciseId: 'bench-press' },
          { exerciseId: 'barbell-row' },
          { exerciseId: 'plank' },
        ],
      },
      {
        name: 'Full-Body B',
        weekday: 3,
        exercises: [
          { exerciseId: 'deadlift', setsOverride: 1 },
          { exerciseId: 'overhead-press' },
          { exerciseId: 'chin-up' },
          { exerciseId: 'plank' },
        ],
      },
      {
        name: 'Full-Body A',
        weekday: 5,
        exercises: [
          { exerciseId: 'back-squat' },
          { exerciseId: 'bench-press' },
          { exerciseId: 'barbell-row' },
          { exerciseId: 'plank' },
        ],
      },
    ],
  },

  // ----- Intermediate: 4-day Upper / Lower (Mon / Tue / Thu / Fri) -----
  {
    name: 'Intermediate Upper / Lower',
    splitType: 'upper_lower',
    experience: 'intermediate',
    days: [
      {
        name: 'Upper Power',
        weekday: 1,
        exercises: [
          { exerciseId: 'bench-press' },
          { exerciseId: 'barbell-row' },
          { exerciseId: 'overhead-press' },
          { exerciseId: 'pull-up' },
          { exerciseId: 'tricep-pushdown' },
          { exerciseId: 'barbell-curl' },
        ],
      },
      {
        name: 'Lower Power',
        weekday: 2,
        exercises: [
          { exerciseId: 'back-squat' },
          { exerciseId: 'romanian-dl' },
          { exerciseId: 'leg-press' },
          { exerciseId: 'leg-curl' },
          { exerciseId: 'standing-calf' },
          { exerciseId: 'plank' },
        ],
      },
      {
        name: 'Upper Hypertrophy',
        weekday: 4,
        exercises: [
          { exerciseId: 'incline-db-bench' },
          { exerciseId: 'lat-pulldown' },
          { exerciseId: 'db-shoulder-press' },
          { exerciseId: 'cable-row' },
          { exerciseId: 'lateral-raise' },
          { exerciseId: 'db-curl' },
          { exerciseId: 'overhead-tri' },
        ],
      },
      {
        name: 'Lower Hypertrophy',
        weekday: 5,
        exercises: [
          { exerciseId: 'front-squat' },
          { exerciseId: 'hip-thrust' },
          { exerciseId: 'walking-lunge' },
          { exerciseId: 'leg-extension' },
          { exerciseId: 'seated-calf' },
          { exerciseId: 'hanging-leg-raise' },
        ],
      },
    ],
  },

  // ----- Advanced: 6-day Push / Pull / Legs A & B -----
  {
    name: 'Advanced PPL',
    splitType: 'ppl',
    experience: 'advanced',
    days: [
      {
        name: 'Push A',
        weekday: 1,
        exercises: [
          { exerciseId: 'bench-press' },
          { exerciseId: 'overhead-press' },
          { exerciseId: 'incline-db-bench' },
          { exerciseId: 'lateral-raise' },
          { exerciseId: 'tricep-pushdown' },
          { exerciseId: 'overhead-tri' },
        ],
      },
      {
        name: 'Pull A',
        weekday: 2,
        exercises: [
          { exerciseId: 'deadlift', setsOverride: 2 },
          { exerciseId: 'pull-up' },
          { exerciseId: 'barbell-row' },
          { exerciseId: 'face-pull' },
          { exerciseId: 'barbell-curl' },
          { exerciseId: 'hammer-curl' },
        ],
      },
      {
        name: 'Legs A',
        weekday: 3,
        exercises: [
          { exerciseId: 'back-squat' },
          { exerciseId: 'romanian-dl' },
          { exerciseId: 'leg-press' },
          { exerciseId: 'leg-curl' },
          { exerciseId: 'standing-calf' },
          { exerciseId: 'hanging-leg-raise' },
        ],
      },
      {
        name: 'Push B',
        weekday: 4,
        exercises: [
          { exerciseId: 'incline-bench' },
          { exerciseId: 'db-shoulder-press' },
          { exerciseId: 'cable-fly' },
          { exerciseId: 'lateral-raise' },
          { exerciseId: 'close-grip-bench' },
          { exerciseId: 'skull-crusher' },
        ],
      },
      {
        name: 'Pull B',
        weekday: 5,
        exercises: [
          { exerciseId: 'romanian-dl' },
          { exerciseId: 'lat-pulldown' },
          { exerciseId: 'cable-row' },
          { exerciseId: 't-bar-row' },
          { exerciseId: 'rear-delt-fly' },
          { exerciseId: 'preacher-curl' },
        ],
      },
      {
        name: 'Legs B',
        weekday: 6,
        exercises: [
          { exerciseId: 'front-squat' },
          { exerciseId: 'hip-thrust' },
          { exerciseId: 'bulgarian-split' },
          { exerciseId: 'leg-extension' },
          { exerciseId: 'seated-calf' },
          { exerciseId: 'cable-crunch' },
        ],
      },
    ],
  },
];

export function generateRoutine(experience: Experience, goal: TrainingGoal): RoutineDraft {
  const tmpl = TEMPLATES.find((t) => t.experience === experience);
  if (!tmpl) throw new Error(`No template for experience: ${experience}`);
  const scheme = repSchemeForGoal(goal);

  const days: RoutineDayDraft[] = tmpl.days.map((day) => {
    const exercises: RoutineExerciseDraft[] = day.exercises
      .map((slot): RoutineExerciseDraft | null => {
        const ex = exerciseById(slot.exerciseId);
        if (!ex) return null;
        const sets = slot.setsOverride ?? scheme.sets;
        return {
          exerciseId: ex.id,
          exerciseName: ex.name,
          targetSets: sets,
          targetRepsMin: scheme.repsMin,
          targetRepsMax: scheme.repsMax,
          targetRir: scheme.targetRir,
          restSec: scheme.restSec,
        };
      })
      .filter((e): e is RoutineExerciseDraft => e !== null);

    return { name: day.name, weekday: day.weekday, exercises };
  });

  return {
    name: tmpl.name,
    splitType: tmpl.splitType,
    experience,
    goal,
    days,
  };
}
