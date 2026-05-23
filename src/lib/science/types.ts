/**
 * Public types for the science engine.
 * Spec: /docs/METHODOLOGY.md.
 */

export type Sex = 'male' | 'female' | 'nb';
export type Goal = 'lose' | 'maintain' | 'gain';
export type Persona = 'training' | 'general';
export type BmrMethod = 'msj' | 'hb' | 'km';
export type DietPattern = 'omnivore' | 'vegetarian' | 'vegan';
export type BmiPopulation = 'standard' | 'asian';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'extra';

export interface ProteinBand {
  min: number;
  max: number;
  def: number;
  basis: 'BW' | 'LBM';
  note: string;
}

export interface FatBand {
  min: number;
  max: number;
  def: number;
  note: string;
}

export interface AdjustBand {
  min: number;
  max: number;
  def: number;
  kind: 'deficit' | 'surplus' | 'none';
}

export interface MatrixGoalCell {
  protein: ProteinBand;
  proteinLBM?: ProteinBand;
  fat: FatBand;
  adjust: AdjustBand;
  rateRange: [number, number] | null;
  rateRef: string | null;
}

export interface ScienceInput {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
  activity: ActivityLevel;
  goal: Goal;
  persona: Persona;
  endurance?: boolean;
  bodyFatPct?: number | null;
  bmrMethod?: BmrMethod;
  dietPattern?: DietPattern;
  /** 1–25 self-directed, 1–40 if clinicallySupervised; ignored unless goal==='lose'. */
  deficitPct?: number;
  /** 1–20; ignored unless goal==='gain'. */
  surplusPct?: number;
  clinicallySupervised?: boolean;
  /** When true, use WHO 2004 Asian BMI thresholds for band labels. */
  asianBmi?: boolean;
}

export type Severity = 'danger' | 'warn' | 'info';

export interface Warning {
  severity: Severity;
  text: string;
}

export interface ScienceResult {
  bmr: number;
  tdee: number;
  finalCalories: number;
  flooredTo: number | null;
  pctAdj: number;
  protein: { g: number; kcal: number; perKg: number; basis: 'BW' | 'LBM' };
  fat: { g: number; kcal: number; pct: number };
  carb: { g: number; kcal: number };
  fiberG: number;
  perMeal: { lowG: number; highG: number; mealsPerDay: number };
  bmi: { value: number; band: string };
  bodyFat: { pct: number; category: string } | null;
  warnings: Warning[];
  methodologyVersion: string;
}

export type ScienceComputeResult =
  | { ok: true; value: ScienceResult }
  | { ok: false; message: string; field?: keyof ScienceInput };
