/**
 * Workout programming science. Spec: /docs/METHODOLOGY.md § "Workout
 * programming". Sources: ACSM Guidelines for Exercise Testing & Prescription
 * 11th ed.; ISSN position stand on resistance training (Helms et al. 2014
 * JISSN); Schoenfeld et al. 2017 (rep ranges for hypertrophy).
 */

export type TrainingGoal = 'strength' | 'hypertrophy' | 'endurance';

export interface RepScheme {
  /** Inclusive lower bound of the rep range. */
  repsMin: number;
  /** Inclusive upper bound of the rep range. */
  repsMax: number;
  /** Recommended sets per exercise. */
  sets: number;
  /** Recommended rest between sets in seconds. */
  restSec: number;
  /** Target reps in reserve (RIR). null = work to failure (endurance). */
  targetRir: number | null;
}

/**
 * Master prompt § 3.7:
 * - Strength: 1-6 reps, 3-5 sets, rest 2-5 min
 * - Hypertrophy: 6-12 reps, 3-4 sets, rest 60-120 s
 * - Endurance: 12-20+ reps, rest 30-60 s
 */
export function repSchemeForGoal(goal: TrainingGoal): RepScheme {
  if (goal === 'strength') {
    return { repsMin: 3, repsMax: 6, sets: 4, restSec: 180, targetRir: 2 };
  }
  if (goal === 'endurance') {
    return { repsMin: 12, repsMax: 20, sets: 3, restSec: 45, targetRir: null };
  }
  // hypertrophy (default for body recomposition / aesthetics)
  return { repsMin: 8, repsMax: 12, sets: 3, restSec: 90, targetRir: 2 };
}

export interface PreviousSet {
  weightKg: number;
  reps: number;
  /** Reps in reserve as the user logged it. null when not captured. */
  rir: number | null;
}

export interface ProgressionSuggestion {
  weightKg: number;
  reps: number;
  reason: 'first_session' | 'hold' | 'add_reps' | 'add_weight';
}

/**
 * Progressive-overload suggestion. Takes the user's most recent session of
 * THIS exercise (all sets, in order) and returns the suggested working
 * weight + rep target for the next session.
 *
 * Rules (Helms 2014 + ACSM):
 * - First time: return target reps at 0 kg (user enters their starting weight).
 * - Hit target reps on every set AND average RIR >= 2 -> add weight.
 *   Compound lifts: +2.5 kg. Isolation lifts: +1.25 kg.
 * - Hit target reps but RIR < 2 -> hold weight, push 1 more rep next session.
 * - Missed target reps on any set -> hold weight, repeat same target.
 */
export function suggestProgression(
  previousSets: PreviousSet[],
  targetReps: number,
  isCompound: boolean,
): ProgressionSuggestion {
  if (previousSets.length === 0) {
    return { weightKg: 0, reps: targetReps, reason: 'first_session' };
  }
  const lastWeight = previousSets[0]?.weightKg ?? 0;
  const hitAllSets = previousSets.every((s) => s.reps >= targetReps);
  const ratedSets = previousSets.filter((s) => s.rir !== null);
  const avgRir =
    ratedSets.length > 0
      ? ratedSets.reduce((sum, s) => sum + (s.rir ?? 0), 0) / ratedSets.length
      : 0;

  if (hitAllSets && avgRir >= 2) {
    const increment = isCompound ? 2.5 : 1.25;
    return { weightKg: lastWeight + increment, reps: targetReps, reason: 'add_weight' };
  }
  if (hitAllSets) {
    return { weightKg: lastWeight, reps: targetReps + 1, reason: 'add_reps' };
  }
  return { weightKg: lastWeight, reps: targetReps, reason: 'hold' };
}

/**
 * Convert a kg increment to lb for imperial display.
 * Used by the workout player when the user has imperial preference.
 */
export function kgToLb(kg: number): number {
  return kg * 2.2046226218;
}

export function lbToKg(lb: number): number {
  return lb / 2.2046226218;
}
