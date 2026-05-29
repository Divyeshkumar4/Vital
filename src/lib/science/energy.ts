/**
 * TDEE, calorie caps, and floor logic. Spec: /docs/METHODOLOGY.md § 3, § 4.
 */
import type { ActivityLevel, Goal, Sex } from './types';
import {
  ACTIVITY_FACTORS,
  conventionalCalorieMinimum,
  DEFICIT_CAP_DEFAULT_PCT,
  DEFICIT_CAP_SUPERVISED_PCT,
  KCAL_PER_KG_BODYWEIGHT,
  MAX_LOSS_RATE_PCT_BW_PER_WEEK,
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

export interface LossRateApplied {
  finalCalories: number;
  /**
   * Projected loss as %BW/week BEFORE easing — only present when the cap
   * raised calories. Null means the deficit was already within the safe rate.
   */
  easedFromRatePct: number | null;
}

/**
 * Safety guardrail (METHODOLOGY § 4.5 / master prompt § 3.4): cap the deficit
 * so projected weight loss stays at or below MAX_LOSS_RATE_PCT_BW_PER_WEEK
 * (1%) of body weight per week. Uses 7,700 kcal per kg of body weight
 * (Wishnofsky). Only applies to weight-loss goals; surplus/maintain pass through.
 */
export function clampToLossRate(
  candidateCalories: number,
  tdeeKcal: number,
  weightKg: number,
  goal: Goal,
): LossRateApplied {
  if (goal !== 'lose') {
    return { finalCalories: candidateCalories, easedFromRatePct: null };
  }
  const dailyDeficit = tdeeKcal - candidateCalories;
  if (dailyDeficit <= 0) {
    return { finalCalories: candidateCalories, easedFromRatePct: null };
  }
  const weeklyLossKg = (dailyDeficit * 7) / KCAL_PER_KG_BODYWEIGHT;
  const ratePct = (weeklyLossKg / weightKg) * 100;
  if (ratePct <= MAX_LOSS_RATE_PCT_BW_PER_WEEK) {
    return { finalCalories: candidateCalories, easedFromRatePct: null };
  }
  const maxWeeklyLossKg = (MAX_LOSS_RATE_PCT_BW_PER_WEEK / 100) * weightKg;
  const maxDailyDeficit = (maxWeeklyLossKg * KCAL_PER_KG_BODYWEIGHT) / 7;
  return { finalCalories: tdeeKcal - maxDailyDeficit, easedFromRatePct: ratePct };
}
