import { supabase } from '@/lib/supabase/client';
import type { FoodLog, FoodLogInsert, MealSlot } from './types';

interface LogRow {
  id: string;
  user_id: string;
  date: string;
  meal: MealSlot;
  food_id: string | null;
  food_name: string;
  brand: string | null;
  quantity_g: number;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number | null;
  price_at_log: number | null;
  currency_at_log: string | null;
  created_at: string;
}

function rowToLog(r: LogRow): FoodLog {
  return {
    id: r.id,
    userId: r.user_id,
    date: r.date,
    meal: r.meal,
    foodId: r.food_id,
    foodName: r.food_name,
    brand: r.brand,
    quantityG: Number(r.quantity_g),
    kcal: Number(r.kcal),
    proteinG: Number(r.protein_g),
    carbsG: Number(r.carbs_g),
    fatG: Number(r.fat_g),
    fiberG: r.fiber_g === null ? null : Number(r.fiber_g),
    priceAtLog: r.price_at_log === null ? null : Number(r.price_at_log),
    currencyAtLog: r.currency_at_log,
    createdAt: r.created_at,
  };
}

export async function getLogsForDate(userId: string, date: string): Promise<FoodLog[]> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data as LogRow[]).map(rowToLog);
}

export async function getLogsForDateRange(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<FoodLog[]> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data as LogRow[]).map(rowToLog);
}

export async function addLog(input: FoodLogInsert): Promise<FoodLog> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const row = {
    user_id: input.userId,
    date: input.date,
    meal: input.meal,
    food_id: input.foodId,
    food_name: input.foodName,
    brand: input.brand,
    quantity_g: input.quantityG,
    kcal: input.kcal,
    protein_g: input.proteinG,
    carbs_g: input.carbsG,
    fat_g: input.fatG,
    fiber_g: input.fiberG,
    price_at_log: input.priceAtLog ?? null,
    currency_at_log: input.currencyAtLog ?? null,
  };
  const { data, error } = await supabase
    .from('food_logs')
    .insert(row)
    .select('*')
    .single();
  if (error) throw error;
  return rowToLog(data as LogRow);
}

export async function deleteLog(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.from('food_logs').delete().eq('id', id);
  if (error) throw error;
}
