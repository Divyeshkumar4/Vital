import { supabase } from '@/lib/supabase/client';
import type { Profile } from './types';

interface ProfileRow {
  id: string;
  name: string | null;
  age: number | null;
  sex: 'male' | 'female' | 'nb' | null;
  unit_preference: 'metric' | 'imperial';
  height_cm: number | null;
  weight_kg: number | null;
  body_fat_pct: number | null;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'very' | 'extra' | null;
  goal: 'lose' | 'maintain' | 'gain' | null;
  persona: 'training' | 'general';
  endurance: boolean;
  diet_pattern: 'omnivore' | 'vegetarian' | 'vegan';
  bmr_method: 'msj' | 'hb' | 'km';
  deficit_pct: number | null;
  surplus_pct: number | null;
  clinically_supervised: boolean;
  asian_bmi: boolean;
  target_calories: number | null;
  target_protein_g: number | null;
  target_fat_g: number | null;
  target_carbs_g: number | null;
  target_fiber_g: number | null;
  methodology_version: string | null;
}

function rowToProfile(r: ProfileRow): Profile {
  return {
    id: r.id,
    name: r.name,
    age: r.age,
    sex: r.sex,
    unitPreference: r.unit_preference,
    heightCm: r.height_cm,
    weightKg: r.weight_kg,
    bodyFatPct: r.body_fat_pct,
    activityLevel: r.activity_level,
    goal: r.goal,
    persona: r.persona,
    endurance: r.endurance,
    dietPattern: r.diet_pattern,
    bmrMethod: r.bmr_method,
    deficitPct: r.deficit_pct,
    surplusPct: r.surplus_pct,
    clinicallySupervised: r.clinically_supervised,
    asianBmi: r.asian_bmi,
    targetCalories: r.target_calories,
    targetProteinG: r.target_protein_g,
    targetFatG: r.target_fat_g,
    targetCarbsG: r.target_carbs_g,
    targetFiberG: r.target_fiber_g,
    methodologyVersion: r.methodology_version,
  };
}

function profileToRow(p: Partial<Profile>): Partial<ProfileRow> {
  const out: Partial<ProfileRow> = {};
  if (p.name !== undefined) out.name = p.name;
  if (p.age !== undefined) out.age = p.age;
  if (p.sex !== undefined) out.sex = p.sex;
  if (p.unitPreference !== undefined) out.unit_preference = p.unitPreference;
  if (p.heightCm !== undefined) out.height_cm = p.heightCm;
  if (p.weightKg !== undefined) out.weight_kg = p.weightKg;
  if (p.bodyFatPct !== undefined) out.body_fat_pct = p.bodyFatPct;
  if (p.activityLevel !== undefined) out.activity_level = p.activityLevel;
  if (p.goal !== undefined) out.goal = p.goal;
  if (p.persona !== undefined) out.persona = p.persona;
  if (p.endurance !== undefined) out.endurance = p.endurance;
  if (p.dietPattern !== undefined) out.diet_pattern = p.dietPattern;
  if (p.bmrMethod !== undefined) out.bmr_method = p.bmrMethod;
  if (p.deficitPct !== undefined) out.deficit_pct = p.deficitPct;
  if (p.surplusPct !== undefined) out.surplus_pct = p.surplusPct;
  if (p.clinicallySupervised !== undefined) out.clinically_supervised = p.clinicallySupervised;
  if (p.asianBmi !== undefined) out.asian_bmi = p.asianBmi;
  if (p.targetCalories !== undefined) out.target_calories = p.targetCalories;
  if (p.targetProteinG !== undefined) out.target_protein_g = p.targetProteinG;
  if (p.targetFatG !== undefined) out.target_fat_g = p.targetFatG;
  if (p.targetCarbsG !== undefined) out.target_carbs_g = p.targetCarbsG;
  if (p.targetFiberG !== undefined) out.target_fiber_g = p.targetFiberG;
  if (p.methodologyVersion !== undefined) out.methodology_version = p.methodologyVersion;
  return out;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return rowToProfile(data as ProfileRow);
}

export async function upsertProfile(userId: string, patch: Partial<Profile>): Promise<Profile> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const row = { id: userId, ...profileToRow(patch) };
  const { data, error } = await supabase
    .from('profiles')
    .upsert(row, { onConflict: 'id' })
    .select('*')
    .single();
  if (error) throw error;
  return rowToProfile(data as ProfileRow);
}
