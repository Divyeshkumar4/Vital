import type {
  ActivityLevel,
  BmrMethod,
  DietPattern,
  Goal,
  Persona,
  Sex,
} from '@/lib/science';

export type UnitPreference = 'metric' | 'imperial';

/** Shape of a row in public.profiles (camelCased; DB uses snake_case). */
export interface Profile {
  id: string;
  name: string | null;
  age: number | null;
  sex: Sex | null;
  unitPreference: UnitPreference;
  heightCm: number | null;
  weightKg: number | null;
  bodyFatPct: number | null;
  activityLevel: ActivityLevel | null;
  goal: Goal | null;
  persona: Persona;
  endurance: boolean;
  dietPattern: DietPattern;
  bmrMethod: BmrMethod;
  deficitPct: number | null;
  surplusPct: number | null;
  clinicallySupervised: boolean;
  asianBmi: boolean;
  /** True only when dietPattern==='vegetarian' and the user excludes eggs (common in India). */
  excludesEggs: boolean;
  targetCalories: number | null;
  targetProteinG: number | null;
  targetFatG: number | null;
  targetCarbsG: number | null;
  targetFiberG: number | null;
  methodologyVersion: string | null;
}

export function isProfileComplete(p: Profile | null): boolean {
  if (!p) return false;
  return (
    p.age !== null &&
    p.sex !== null &&
    p.heightCm !== null &&
    p.weightKg !== null &&
    p.activityLevel !== null &&
    p.goal !== null
  );
}
