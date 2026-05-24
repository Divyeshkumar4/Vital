import type { MealSlot } from '@/features/log/types';
import { TEMPLATES, type MealTemplate, type TemplateItem } from './templates';

export interface MealSplit {
  slot: MealSlot;
  share: number; // fraction of daily kcal
  targetKcal: number;
  targetProteinG: number;
  targetFatG: number;
  targetCarbsG: number;
}

export interface ScaledItem {
  name: string;
  qtyG: number;
  display: string;
}

export interface ScaledTemplate {
  id: string;
  name: string;
  scaleFactor: number;
  items: ScaledItem[];
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface PlannedMeal {
  split: MealSplit;
  suggestions: ScaledTemplate[];
}

/**
 * Default 4-meal split.
 * Anchored to common practice: a slightly bigger lunch + dinner, modest
 * breakfast, light snack.
 */
const FOUR_MEAL_SHARE: Record<MealSlot, number> = {
  breakfast: 0.25,
  lunch: 0.3,
  dinner: 0.3,
  snack: 0.15,
};

export function splitDailyTargets(
  totalKcal: number,
  totalProteinG: number,
  totalFatG: number,
  totalCarbsG: number,
): MealSplit[] {
  return (Object.keys(FOUR_MEAL_SHARE) as MealSlot[]).map((slot) => {
    const share = FOUR_MEAL_SHARE[slot];
    return {
      slot,
      share,
      targetKcal: Math.round(totalKcal * share),
      targetProteinG: Math.round(totalProteinG * share),
      targetFatG: Math.round(totalFatG * share),
      targetCarbsG: Math.round(totalCarbsG * share),
    };
  });
}

function scaleTemplate(tmpl: MealTemplate, targetKcal: number): ScaledTemplate {
  // Scale so the template's calories match the target. Clamp to a sane range
  // so we never multiply by 4x or shrink to nothing.
  const raw = targetKcal / tmpl.kcal;
  const factor = Math.max(0.5, Math.min(2.0, raw));
  const items: ScaledItem[] = tmpl.items.map<ScaledItem>((it: TemplateItem) => {
    const scaledG = Math.max(1, Math.round(it.qtyG * factor));
    const display =
      it.display && Math.abs(factor - 1) < 0.15
        ? it.display
        : `${scaledG} g`;
    return { name: it.name, qtyG: scaledG, display };
  });
  return {
    id: tmpl.id,
    name: tmpl.name,
    scaleFactor: factor,
    items,
    kcal: Math.round(tmpl.kcal * factor),
    proteinG: Math.round(tmpl.proteinG * factor),
    carbsG: Math.round(tmpl.carbsG * factor),
    fatG: Math.round(tmpl.fatG * factor),
  };
}

/**
 * Pick up to `maxPerSlot` templates per meal whose macros are closest to the
 * per-meal target after scaling. Distance is a weighted sum of protein / carb /
 * fat error in grams - heaviest weight on protein because protein adherence
 * matters most for body composition.
 */
export function generatePlan(
  splits: MealSplit[],
  maxPerSlot = 3,
): PlannedMeal[] {
  return splits.map((split) => {
    const candidates = TEMPLATES.filter((t) => t.slot === split.slot).map((t) => {
      const scaled = scaleTemplate(t, split.targetKcal);
      const distance =
        2.5 * Math.abs(scaled.proteinG - split.targetProteinG) +
        1.0 * Math.abs(scaled.carbsG - split.targetCarbsG) +
        1.5 * Math.abs(scaled.fatG - split.targetFatG);
      return { scaled, distance };
    });
    candidates.sort((a, b) => a.distance - b.distance);
    return {
      split,
      suggestions: candidates.slice(0, maxPerSlot).map((c) => c.scaled),
    };
  });
}
