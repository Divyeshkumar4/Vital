/**
 * Macro assembly + advisory. Spec: /docs/METHODOLOGY.md § 5–§ 7.
 */
import type {
  DietPattern,
  MatrixGoalCell,
  Persona,
  Warning,
} from './types';
import {
  CARB_RDA_FLOOR_G,
  CARB_UPPER_WARNING_GKG,
  FAT_FLOOR_GKG,
  VEGAN_PROTEIN_ADD_GKG,
  VEGETARIAN_PROTEIN_ADD_GKG,
} from './constants';

export function dietPatternProteinAddGkg(pattern: DietPattern): number {
  if (pattern === 'vegan') return VEGAN_PROTEIN_ADD_GKG;
  if (pattern === 'vegetarian') return VEGETARIAN_PROTEIN_ADD_GKG;
  return 0;
}

/**
 * Activity-graded carb floor in g/kg of body weight.
 * Training persona uses ACSM/AND/DC 2016 sport-nutrition floors;
 * general persona uses a graduated extrapolation.
 */
export function carbFloorGkg(activityFactor: number, persona: Persona): number {
  if (persona === 'training') {
    if (activityFactor >= 1.9) return 8;
    if (activityFactor >= 1.725) return 6;
    if (activityFactor >= 1.55) return 5;
    return 3;
  }
  if (activityFactor >= 1.725) return 2.0;
  if (activityFactor >= 1.55) return 1.0;
  return 0;
}

export function carbAdvisory(
  carbG: number,
  weightKg: number,
  activityFactor: number,
  persona: Persona,
): string | null {
  if (carbG <= 0) return null;
  const perKg = carbG / weightKg;
  const floor = carbFloorGkg(activityFactor, persona);
  if (floor > 0 && perKg < floor) {
    return `Carbs at ${perKg.toFixed(2)} g/kg are below the recommended ${floor} g/kg for your activity level. Performance and recovery may suffer over time — try lowering fat or protein to leave room for carbs.`;
  }
  if (perKg > CARB_UPPER_WARNING_GKG) {
    return `Carbs at ${perKg.toFixed(2)} g/kg are unusually high. This level is typically only needed for ultra-endurance athletes — double-check your inputs.`;
  }
  return null;
}

export interface MacroAssembly {
  effectiveRatioGkg: number;
  basisKg: number;
  basisLabel: 'BW' | 'LBM';
  proteinG: number;
  proteinKcal: number;
  fatG: number;
  fatKcal: number;
  fatPctOfCalories: number;
  carbG: number;
  carbKcal: number;
  warnings: Warning[];
}

export interface MacroAssemblyInput {
  proteinPerKgRequested: number;
  fatPctRequested: number;
  finalCalories: number;
  weightKg: number;
  lbmKg: number | null;
  preferLBM: boolean;
  cell: MatrixGoalCell;
  persona: Persona;
  activityFactor: number;
  dietPattern: DietPattern;
}

/**
 * Pure macro assembly. Returns grams and kcal for each macro plus a list of warnings.
 * Caller is responsible for orchestrating BMR/TDEE/floor; this function just turns a
 * (protein ratio, fat %, kcal) tuple into a macro split for the selected matrix cell.
 */
export function assembleMacros(input: MacroAssemblyInput): MacroAssembly {
  const warnings: Warning[] = [];

  const dietAdd = dietPatternProteinAddGkg(input.dietPattern);
  const effectiveRatio = input.proteinPerKgRequested + dietAdd;

  let basisKg = input.weightKg;
  let basisLabel: 'BW' | 'LBM' = 'BW';
  if (input.preferLBM && input.lbmKg !== null) {
    basisKg = input.lbmKg;
    basisLabel = 'LBM';
  }

  const proteinG = effectiveRatio * basisKg;
  const proteinKcal = proteinG * 4;
  const fatKcal = input.finalCalories * (input.fatPctRequested / 100);
  const fatG = fatKcal / 9;

  let carbKcal: number;
  if (proteinKcal + fatKcal > input.finalCalories) {
    carbKcal = 0;
    warnings.push({
      severity: 'danger',
      text: 'Protein + fat exceed your calorie target. Carbs set to 0 — reduce protein or fat.',
    });
  } else {
    carbKcal = input.finalCalories - (proteinKcal + fatKcal);
  }
  const carbG = carbKcal / 4;
  const fatPctOfCalories = (fatKcal / input.finalCalories) * 100;

  // Persona-band advisories.
  const proteinBand =
    input.preferLBM && input.cell.proteinLBM ? input.cell.proteinLBM : input.cell.protein;
  if (input.proteinPerKgRequested < proteinBand.min) {
    warnings.push({
      severity: 'warn',
      text: `Protein at ${input.proteinPerKgRequested.toFixed(1)} g/kg is below the recommended ${proteinBand.min}–${proteinBand.max} range for your goal — consider raising it to protect muscle.`,
    });
  } else if (input.proteinPerKgRequested > proteinBand.max) {
    warnings.push({
      severity: 'info',
      text: `Protein at ${input.proteinPerKgRequested.toFixed(1)} g/kg is above the recommended ${proteinBand.min}–${proteinBand.max} range. Not harmful, but more isn't necessarily better.`,
    });
  }
  if (input.fatPctRequested < input.cell.fat.min) {
    warnings.push({
      severity: 'warn',
      text: `Fat at ${input.fatPctRequested}% of calories is below the recommended ${input.cell.fat.min}–${input.cell.fat.max}% — going too low for long stretches can affect hormones.`,
    });
  } else if (input.fatPctRequested > input.cell.fat.max) {
    warnings.push({
      severity: 'warn',
      text: `Fat at ${input.fatPctRequested}% of calories is above the recommended ${input.cell.fat.min}–${input.cell.fat.max}% range.`,
    });
  }

  // Absolute fat floor.
  const fatFloorG = FAT_FLOOR_GKG * input.weightKg;
  if (fatG < fatFloorG) {
    warnings.push({
      severity: 'warn',
      text: `Fat at ${fatG.toFixed(0)} g/day is very low (below ~${fatFloorG.toFixed(0)} g/day). Sustained intake this low can affect hormones over time.`,
    });
  }

  // Carb advisory + RDA floor.
  if (carbG > 0) {
    const advice = carbAdvisory(carbG, input.weightKg, input.activityFactor, input.persona);
    if (advice) warnings.push({ severity: 'warn', text: advice });
    if (carbG < CARB_RDA_FLOOR_G) {
      warnings.push({
        severity: 'warn',
        text: `Carbs at ${carbG.toFixed(0)} g/day are below the daily minimum your brain needs (~${CARB_RDA_FLOOR_G} g). OK short-term; not great as a long-term default.`,
      });
    }
  }

  // Diet pattern bump is intentionally not surfaced as a warning — it's a default
  // computation detail, not a heads-up. The methodology doc explains it.

  return {
    effectiveRatioGkg: effectiveRatio,
    basisKg,
    basisLabel,
    proteinG,
    proteinKcal,
    fatG,
    fatKcal,
    fatPctOfCalories,
    carbG,
    carbKcal,
    warnings,
  };
}
