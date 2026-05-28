/**
 * Phase 3.1 — Cost of eating.
 *
 * Prices are always normalised to "per 100 g" in the database so different
 * package sizes compare cleanly. Each food log snapshots the total price paid
 * (= price_per_100g × quantity_g / 100) and the currency at log time so
 * spend history stays accurate even if community prices later change.
 */

export type PriceSource = 'auto' | 'manual' | 'community';

export interface FoodPrice {
  id: string;
  foodId: string;
  region: string;
  currency: string;
  pricePer100g: number;
  source: PriceSource;
  submittedBy: string | null;
  verifiedCount: number;
  createdAt: string;
}

export interface FoodPriceInsert {
  foodId: string;
  region: string;
  currency: string;
  pricePer100g: number;
  source: PriceSource;
  submittedBy: string;
}

export interface CommunityPriceSummary {
  /** Median of all submissions for (food, region). */
  medianPer100g: number;
  /** How many community members have submitted a price. */
  count: number;
  currency: string;
}

/** Median of a numeric array. Returns 0 for empty input. */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1]! + sorted[mid]!) / 2;
  }
  return sorted[mid]!;
}

export interface DailySpend {
  date: string; // YYYY-MM-DD
  amount: number;
  currency: string;
  loggedEntries: number;
  pricedEntries: number;
}

// Pure aggregator — kept here (not in queries.ts) so unit tests don't pull in
// the Supabase client (which imports AsyncStorage and only loads under RN).
import type { FoodLog } from '@/features/log/types';

export function sumSpendByDate(logs: FoodLog[], currency: string | null): DailySpend[] {
  const byDate = new Map<string, DailySpend>();
  for (const l of logs) {
    const cur = byDate.get(l.date) ?? {
      date: l.date,
      amount: 0,
      currency: currency ?? '',
      loggedEntries: 0,
      pricedEntries: 0,
    };
    cur.loggedEntries += 1;
    if (l.priceAtLog !== null) {
      cur.amount += l.priceAtLog;
      cur.pricedEntries += 1;
    }
    byDate.set(l.date, cur);
  }
  return [...byDate.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
}
