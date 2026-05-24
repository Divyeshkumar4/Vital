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

/**
 * Staples library entries use the OffFood shape for display but are sourced
 * from USDA / standard nutrition references — tagged `source = 'usda'`.
 */
export function stapleToInsert(o: OffFood): FoodInsert {
  return {
    source: 'usda',
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

/**
 * Cache a food row keyed by (source, source_id). If the row already exists
 * returns the existing row unchanged - we never UPDATE because foods is a
 * global catalog and the RLS policy only grants INSERT to authenticated
 * users (deliberate; first writer wins for cached external data).
 */
export async function cacheFood(food: FoodInsert): Promise<Food> {
  if (!supabase) throw new Error('Supabase is not configured.');

  // 1. Fast path: row already cached for this (source, source_id).
  const { data: existing, error: selectError } = await supabase
    .from('foods')
    .select('*')
    .eq('source', food.source)
    .eq('source_id', food.sourceId)
    .maybeSingle();
  if (selectError) throw selectError;
  if (existing) return rowToFood(existing as FoodRow);

  // 2. Not cached - insert it.
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
  const { data: inserted, error: insertError } = await supabase
    .from('foods')
    .insert(row)
    .select('*')
    .single();
  if (!insertError && inserted) return rowToFood(inserted as FoodRow);

  // 3. Race: another client inserted the same (source, source_id) between
  //    our SELECT and INSERT. Re-fetch and return that row.
  if (insertError && insertError.code === '23505') {
    const { data: raced, error: racedError } = await supabase
      .from('foods')
      .select('*')
      .eq('source', food.source)
      .eq('source_id', food.sourceId)
      .single();
    if (racedError) throw racedError;
    return rowToFood(raced as FoodRow);
  }

  throw insertError ?? new Error('Failed to cache food.');
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
