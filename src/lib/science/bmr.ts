/**
 * BMR formulas. Spec: /docs/METHODOLOGY.md § 2.
 * Pure functions; metric units only (kg, cm, years).
 */
import type { Sex } from './types';

/**
 * Mifflin-St Jeor (1990). Default for healthy adults.
 * Non-binary uses the midpoint of male/female sex constants ((+5 + −161)/2 = −78).
 */
export function bmrMSJ(weightKg: number, heightCm: number, age: number, sex: Sex): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === 'male') return base + 5;
  if (sex === 'female') return base - 161;
  return base - 78;
}

/**
 * Harris-Benedict revised (Roza & Shizgal 1984). Non-binary averages the two sex equations.
 */
export function bmrHB(weightKg: number, heightCm: number, age: number, sex: Sex): number {
  const male = 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
  const female = 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
  if (sex === 'male') return male;
  if (sex === 'female') return female;
  return (male + female) / 2;
}

/**
 * Katch-McArdle. Requires lean body mass (kg). Most accurate for lean/athletic users.
 */
export function bmrKM(lbmKg: number): number {
  return 370 + 21.6 * lbmKg;
}

export function leanBodyMass(weightKg: number, bodyFatPct: number): number {
  return weightKg * (1 - bodyFatPct / 100);
}
