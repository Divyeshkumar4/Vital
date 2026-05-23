/**
 * Per-meal protein and fiber. Spec: /docs/METHODOLOGY.md § 8, § 9.
 */
import {
  FIBER_PER_1000_KCAL_G,
  MPS_PER_MEAL_MAX_G,
  MPS_PER_MEAL_MIN_G,
} from './constants';

/**
 * Age-graded per-meal protein dose (g/kg of BW per meal).
 * < 18 is not supported (v1 is adult-only); the engine validates age separately.
 * Schoenfeld & Aragon 2018 (MPS dose-response); Moore 2015 (older-adult upper anchor).
 */
export function perMealProteinGkg(age: number): number {
  if (age <= 50) return 0.24;
  if (age >= 65) return 0.4;
  // Linear interpolation 50 → 65 across 0.24 → 0.4.
  return 0.24 + ((age - 50) * (0.4 - 0.24)) / 15;
}

export interface MealDistribution {
  lowG: number;
  highG: number;
  mealsPerDay: number;
}

export function mealDistribution(
  weightKg: number,
  age: number,
  proteinG: number,
): MealDistribution {
  const perMealG = Math.max(MPS_PER_MEAL_MIN_G, Math.round(perMealProteinGkg(age) * weightKg));
  const lowG = perMealG;
  const highG = Math.min(MPS_PER_MEAL_MAX_G, perMealG + 8);
  const mealsPerDay = Math.max(3, Math.min(5, Math.round(proteinG / perMealG)));
  return { lowG, highG, mealsPerDay };
}

export function fiberTargetG(finalCalories: number): number {
  return (finalCalories / 1000) * FIBER_PER_1000_KCAL_G;
}
