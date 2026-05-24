/**
 * TDEE, calorie caps, and floor logic. Spec: /docs/METHODOLOGY.md § 3, § 4.
 */
import type { ActivityLevel, Goal, Sex } from './types';
import {
  ACTIVITY_FACTORS,
  conventionalCalorieMinimum,
  DEFICIT_CAP_DEFAULT_PCT,
  DEFICIT_CAP_SUPERVISED_PCT,
  SURPLUS_CAP_PCT,
} from './constants';

export function activityFactorOf(level: ActivityLevel): number {
  return ACTIVITY_FACTORS[level];
}

export function tdee(bmr: number, activityFactor: number): number {
  return bmr * activityFactor;
}

/** Safety floor: never recommend below the user's true RMR or the conventional sex minimum. */
export function calorieFloor(bmr: number, sex: Sex): number {
  return Math.max(bmr, conventionalCalorieMinimum(sex));
}

export interface DeficitInput {
  pct: number;
  supervised: boolean;
}

export interface AdjustOk {
  ok: true;
  pctApplied: number;
  finalCalories: number;
}

export interface AdjustErr {
  ok: false;
  message: string;
}

export function applyGoalAdjustment(
  tdeeKcal: number,
  goal: Goal,
  opts: { deficit?: DeficitInput; surplusPct?: number },
): AdjustOk | AdjustErr {
  if (goal === 'maintain') {
    return { ok: true, pctApplied: 0, finalCalories: tdeeKcal };
  }
  if (goal === 'gain') {
    const p = opts.surplusPct ?? 0;
    if (p < 1 || p > SURPLUS_CAP_PCT) {
      return { ok: false, message: `Surplus must be 1–${SURPLUS_CAP_PCT}%.` };
    }
    return { ok: true, pctApplied: p, finalCalories: tdeeKcal * (1 + p / 100) };
  }
  // lose
  const d = opts.deficit;
  if (!d) return { ok: false, message: 'Deficit percent is required when goal is "lose".' };
  const cap = d.supervised ? DEFICIT_CAP_SUPERVISED_PCT : DEFICIT_CAP_DEFAULT_PCT;
  if (d.pct < 1 || d.pct > cap) {
    return {
      ok: false,
      message: d.supervised
        ? `Deficit must be 1–${DEFICIT_CAP_SUPERVISED_PCT}%.`
        : `Deficit must be 1–${DEFICIT_CAP_DEFAULT_PCT}% (set "clinically supervised" for up to ${DEFICIT_CAP_SUPERVISED_PCT}%).`,
    };
  }
  return { ok: true, pctApplied: -d.pct, finalCalories: tdeeKcal * (1 - d.pct / 100) };
}

export interface FloorApplied {
  finalCalories: number;
  flooredTo: number | null;
}

export function clampToFloor(
  candidateCalories: number,
  bmr: number,
  sex: Sex,
): FloorApplied {
  const floor = calorieFloor(bmr, sex);
  if (candidateCalories < floor) {
    return { finalCalories: floor, flooredTo: floor };
  }
  return { finalCalories: candidateCalories, flooredTo: null };
}
