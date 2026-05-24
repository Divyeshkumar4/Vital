/**
 * Layer 1 constants. Every value is cited in /docs/METHODOLOGY.md.
 * Bump METHODOLOGY_VERSION whenever a number here changes.
 */

export const METHODOLOGY_VERSION = '1.0.0';
export const METHODOLOGY_REVIEWED = '2026-05-23';

export const KCAL_PER_KG_BODYWEIGHT = 7700;

export const CARB_RDA_FLOOR_G = 130;
export const CARB_UPPER_WARNING_GKG = 12;
export const FIBER_PER_1000_KCAL_G = 14;

export const MPS_PER_MEAL_MIN_G = 20;
export const MPS_PER_MEAL_MAX_G = 40;

export const FAT_FLOOR_GKG = 0.5;

export const DEFICIT_CAP_DEFAULT_PCT = 25;
export const DEFICIT_CAP_SUPERVISED_PCT = 40;
export const SURPLUS_CAP_PCT = 20;

export const VEGAN_PROTEIN_ADD_GKG = 0.2;
export const VEGETARIAN_PROTEIN_ADD_GKG = 0.1;

export const MAX_LOSS_RATE_PCT_BW_PER_WEEK = 1;

export const BMI_THRESHOLDS = {
  standard: { underweight: 18.5, normal: 25, overweight: 30, obese1: 35, obese2: 40 },
  asian: { underweight: 18.5, normal: 23, overweight: 27.5, obese1: 32.5, obese2: 37.5 },
} as const;

export const INPUT_RANGES = {
  weightKg: { min: 35, max: 300 },
  heightCm: { min: 130, max: 230 },
  age: { min: 18, max: 120 },
  bodyFatPct: { min: 3, max: 60 },
} as const;

export const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extra: 1.9,
} as const;

export function conventionalCalorieMinimum(sex: 'male' | 'female' | 'nb'): number {
  return sex === 'male' ? 1500 : 1200;
}
