/**
 * Top-level orchestrator for the science engine. Spec: /docs/METHODOLOGY.md.
 * Takes a ScienceInput, returns a ScienceComputeResult.
 */
import type { ScienceComputeResult, ScienceInput, ScienceResult, Warning } from './types';
import { METHODOLOGY_VERSION, INPUT_RANGES, MAX_LOSS_RATE_PCT_BW_PER_WEEK } from './constants';
import { resolveMatrix } from './matrix';
import { bmrHB, bmrKM, bmrMSJ, leanBodyMass } from './bmr';
import { activityFactorOf, applyGoalAdjustment, clampToFloor, clampToLossRate, tdee } from './energy';
import { assembleMacros } from './macros';
import { fiberTargetG, mealDistribution } from './distribution';
import { bmi, bmiBand, bodyFatCategory } from './bands';

function validate(input: ScienceInput): ScienceComputeResult | null {
  const checks: { ok: boolean; message: string; field?: keyof ScienceInput }[] = [
    {
      ok: Number.isFinite(input.weightKg) && input.weightKg >= INPUT_RANGES.weightKg.min && input.weightKg <= INPUT_RANGES.weightKg.max,
      message: `Weight must be ${INPUT_RANGES.weightKg.min}–${INPUT_RANGES.weightKg.max} kg.`,
      field: 'weightKg',
    },
    {
      ok: Number.isFinite(input.heightCm) && input.heightCm >= INPUT_RANGES.heightCm.min && input.heightCm <= INPUT_RANGES.heightCm.max,
      message: `Height must be ${INPUT_RANGES.heightCm.min}–${INPUT_RANGES.heightCm.max} cm.`,
      field: 'heightCm',
    },
    {
      ok: Number.isFinite(input.age) && input.age >= INPUT_RANGES.age.min && input.age <= INPUT_RANGES.age.max,
      message: `This calculator supports ages ${INPUT_RANGES.age.min}–${INPUT_RANGES.age.max}. Under-18 users need pediatric guidance.`,
      field: 'age',
    },
  ];
  for (const c of checks) {
    if (!c.ok) return { ok: false, message: c.message, field: c.field };
  }
  if (input.bodyFatPct != null) {
    const { min, max } = INPUT_RANGES.bodyFatPct;
    if (input.bodyFatPct < min || input.bodyFatPct > max) {
      return { ok: false, message: `Body fat % must be ${min}–${max}.`, field: 'bodyFatPct' };
    }
  }
  if ((input.bmrMethod ?? 'msj') === 'km' && input.bodyFatPct == null) {
    return {
      ok: false,
      message: 'Katch-McArdle requires body fat %. Enter one or pick Mifflin-St Jeor.',
      field: 'bodyFatPct',
    };
  }
  return null;
}

export function compute(input: ScienceInput): ScienceComputeResult {
  const validationError = validate(input);
  if (validationError) return validationError;

  const method = input.bmrMethod ?? 'msj';
  let dietPattern = input.dietPattern ?? 'omnivore';
  // Pure vegetarian (vegetarian + no eggs) — treat the protein math like vegan
  // since the user excludes the highest-leucine vegetarian source (eggs).
  if (dietPattern === 'vegetarian' && input.excludesEggs) {
    dietPattern = 'vegan';
  }
  const endurance = input.endurance ?? false;
  const supervised = input.clinicallySupervised ?? false;

  const bodyFatPct = input.bodyFatPct ?? null;
  const lbm = bodyFatPct !== null ? leanBodyMass(input.weightKg, bodyFatPct) : null;

  // BMR
  let bmrValue: number;
  if (method === 'km' && lbm !== null) bmrValue = bmrKM(lbm);
  else if (method === 'hb') bmrValue = bmrHB(input.weightKg, input.heightCm, input.age, input.sex);
  else bmrValue = bmrMSJ(input.weightKg, input.heightCm, input.age, input.sex);

  // TDEE
  const af = activityFactorOf(input.activity);
  const tdeeValue = tdee(bmrValue, af);

  // Goal adjustment
  const adj = applyGoalAdjustment(tdeeValue, input.goal, {
    deficit:
      input.goal === 'lose'
        ? { pct: input.deficitPct ?? 0, supervised }
        : undefined,
    surplusPct: input.goal === 'gain' ? input.surplusPct : undefined,
  });
  if (!adj.ok) return { ok: false, message: adj.message };

  // Loss-rate clamp (≤ 1% BW/week, METHODOLOGY § 4.5), then BMR/min floor on top.
  const rateClamped = clampToLossRate(adj.finalCalories, tdeeValue, input.weightKg, input.goal);
  const floored = clampToFloor(rateClamped.finalCalories, bmrValue, input.sex);

  // Matrix cell for macro defaults
  const cell = resolveMatrix(input.persona, input.goal, input.age, endurance);

  // For training-lose with a known BF%, prefer LBM basis for protein.
  const preferLBM =
    input.persona === 'training' && input.goal === 'lose' && lbm !== null && !!cell.proteinLBM;
  const proteinPerKgRequested = preferLBM && cell.proteinLBM ? cell.proteinLBM.def : cell.protein.def;
  const fatPctRequested = cell.fat.def;

  const macros = assembleMacros({
    proteinPerKgRequested,
    fatPctRequested,
    finalCalories: floored.finalCalories,
    weightKg: input.weightKg,
    lbmKg: lbm,
    preferLBM,
    cell,
    persona: input.persona,
    activityFactor: af,
    dietPattern,
  });

  const fiberG = fiberTargetG(floored.finalCalories);
  const perMeal = mealDistribution(input.weightKg, input.age, macros.proteinG);

  const bmiValue = bmi(input.weightKg, input.heightCm);
  const bmiBandLabel = bmiBand(bmiValue, input.asianBmi ? 'asian' : 'standard');

  const warnings: Warning[] = [...macros.warnings];
  if (floored.flooredTo !== null) {
    warnings.unshift({
      severity: 'warn',
      text: `Your calorie target was raised to ${Math.round(floored.flooredTo)} kcal/day to keep you above a safe minimum. Eating less than this for long stretches can harm your metabolism and lose muscle.`,
    });
  }
  if (rateClamped.easedFromRatePct !== null) {
    warnings.unshift({
      severity: 'warn',
      text: `We eased your daily target to keep weight loss at a safe ${MAX_LOSS_RATE_PCT_BW_PER_WEEK}% of body weight per week. Faster loss tends to cost muscle and is hard to keep off.`,
    });
  }

  const result: ScienceResult = {
    bmr: bmrValue,
    tdee: tdeeValue,
    finalCalories: floored.finalCalories,
    flooredTo: floored.flooredTo,
    pctAdj: adj.pctApplied,
    protein: {
      g: macros.proteinG,
      kcal: macros.proteinKcal,
      perKg: macros.effectiveRatioGkg,
      basis: macros.basisLabel,
    },
    fat: {
      g: macros.fatG,
      kcal: macros.fatKcal,
      pct: macros.fatPctOfCalories,
    },
    carb: { g: macros.carbG, kcal: macros.carbKcal },
    fiberG,
    perMeal,
    bmi: { value: bmiValue, band: bmiBandLabel },
    bodyFat:
      bodyFatPct !== null
        ? { pct: bodyFatPct, category: bodyFatCategory(bodyFatPct, input.sex) }
        : null,
    warnings,
    methodologyVersion: METHODOLOGY_VERSION,
  };

  return { ok: true, value: result };
}
