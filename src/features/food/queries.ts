import { supabase } from '@/lib/supabase/client';
import type { OffFood } from '@/lib/api/openFoodFacts';
import type { Food, FoodInsert } from './types';

interface FoodRow {
  id: string;
  source: 'openfoodfacts' | 'usda' | 'manual';
  source_id: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  kcal_per_100g: number | null;
  protein_per_100g: number | null;
  carbs_per_100g: number | null;
  fat_per_100g: number | null;
  fiber_per_100g: number | null;
  serving_size_g: number | null;
  serving_label: string | null;
  image_url: string | null;
}

function rowToFood(r: FoodRow): Food {
  return {
    id: r.id,
    source: r.source,
    sourceId: r.source_id,
    name: r.name,
    brand: r.brand,
    barcode: r.barcode,
    kcalPer100g: r.kcal_per_100g,
    proteinPer100g: r.protein_per_100g,
    carbsPer100g: r.carbs_per_100g,
    fatPer100g: r.fat_per_100g,
    fiberPer100g: r.fiber_per_100g,
    servingSizeG: r.serving_size_g,
    servingLabel: r.serving_label,
    imageUrl: r.image_url,
  };
}

export function offFoodToInsert(o: OffFood): FoodInsert {
  return {
    source: 'openfoodfacts',
    sourceId: o.sourceId,
    name: o.name,
    brand: o.brand,
    barcode: o.barcode,
    kcalPer100g: o.kcalPer100g,
    proteinPer100g: o.proteinPer100g,
    carbsPer100g: o.carbsPer100g,
    fatPer100g: o.fatPer100g,
    fiberPer100g: o.fiberPer100g,
    servingSizeG: o.servingSizeG,
    servingLabel: o.servingLabel,
    imageUrl: o.imageUrl,
  };
}

/** Upsert a food row keyed by (source, source_id). Returns the canonical cached row. */
export async function cacheFood(food: FoodInsert): Promise<Food> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const row = {
    source: food.source,
    source_id: food.sourceId,
    name: food.name,
    brand: food.brand,
    barcode: food.barcode,
    kcal_per_100g: food.kcalPer100g,
    protein_per_100g: food.proteinPer100g,
    carbs_per_100g: food.carbsPer100g,
    fat_per_100g: food.fatPer100g,
    fiber_per_100g: food.fiberPer100g,
    serving_size_g: food.servingSizeG,
    serving_label: food.servingLabel,
    image_url: food.imageUrl,
  };
  const { data, error } = await supabase
    .from('foods')
    .upsert(row, { onConflict: 'source,source_id' })
    .select('*')
    .single();
  if (error) throw error;
  return rowToFood(data as FoodRow);
}

export async function getFoodById(id: string): Promise<Food | null> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToFood(data as FoodRow) : null;
}

export async function getFoodByBarcode(barcode: string): Promise<Food | null> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .eq('barcode', barcode)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToFood(data as FoodRow) : null;
}
