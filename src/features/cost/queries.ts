import { supabase } from '@/lib/supabase/client';
import {
  median,
  type CommunityPriceSummary,
  type FoodPrice,
  type FoodPriceInsert,
} from './types';

interface PriceRow {
  id: string;
  food_id: string;
  region: string;
  currency: string;
  price_per_100g: number;
  source: 'auto' | 'manual' | 'community';
  submitted_by: string | null;
  verified_count: number;
  created_at: string;
}

function rowToPrice(r: PriceRow): FoodPrice {
  return {
    id: r.id,
    foodId: r.food_id,
    region: r.region,
    currency: r.currency,
    pricePer100g: Number(r.price_per_100g),
    source: r.source,
    submittedBy: r.submitted_by,
    verifiedCount: r.verified_count,
    createdAt: r.created_at,
  };
}

/**
 * All known prices for (food, region). Caller computes the summary it needs
 * (median, latest, etc). Returns at most 50 rows — plenty for a community
 * suggestion; we don't render this list to the user.
 */
export async function pricesFor(foodId: string, region: string): Promise<FoodPrice[]> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('food_prices')
    .select('*')
    .eq('food_id', foodId)
    .eq('region', region)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data as PriceRow[]).map(rowToPrice);
}

/** Convenience: median + count for the food, in the user's currency if matching. */
export async function communityPriceFor(
  foodId: string,
  region: string,
): Promise<CommunityPriceSummary | null> {
  const rows = await pricesFor(foodId, region);
  if (rows.length === 0) return null;
  // Group by currency — typically a region uses one currency, but if multiple
  // exist we return the most common.
  const byCurrency = new Map<string, number[]>();
  for (const r of rows) {
    const arr = byCurrency.get(r.currency) ?? [];
    arr.push(r.pricePer100g);
    byCurrency.set(r.currency, arr);
  }
  let best: { currency: string; values: number[] } | null = null;
  for (const [currency, values] of byCurrency.entries()) {
    if (!best || values.length > best.values.length) best = { currency, values };
  }
  if (!best) return null;
  return {
    medianPer100g: median(best.values),
    count: best.values.length,
    currency: best.currency,
  };
}

export async function submitPrice(input: FoodPriceInsert): Promise<FoodPrice> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const row = {
    food_id: input.foodId,
    region: input.region,
    currency: input.currency,
    price_per_100g: input.pricePer100g,
    source: input.source,
    submitted_by: input.submittedBy,
  };
  const { data, error } = await supabase
    .from('food_prices')
    .insert(row)
    .select('*')
    .single();
  if (error) throw error;
  return rowToPrice(data as PriceRow);
}

export { sumSpendByDate } from './types';
