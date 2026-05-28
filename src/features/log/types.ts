export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export interface FoodLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  meal: MealSlot;
  foodId: string | null;
  foodName: string;
  brand: string | null;
  quantityG: number;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number | null;
  /** Snapshot of the total price the user paid for this entry (currency = currencyAtLog). Null if unknown. */
  priceAtLog: number | null;
  currencyAtLog: string | null;
  createdAt: string;
}

export interface FoodLogInsert {
  userId: string;
  date: string;
  meal: MealSlot;
  foodId: string | null;
  foodName: string;
  brand: string | null;
  quantityG: number;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number | null;
  priceAtLog?: number | null;
  currencyAtLog?: string | null;
}

export interface DailyTotals {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export function emptyTotals(): DailyTotals {
  return { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 };
}

export function sumLogs(logs: FoodLog[]): DailyTotals {
  return logs.reduce<DailyTotals>(
    (acc, l) => ({
      kcal: acc.kcal + l.kcal,
      proteinG: acc.proteinG + l.proteinG,
      carbsG: acc.carbsG + l.carbsG,
      fatG: acc.fatG + l.fatG,
      fiberG: acc.fiberG + (l.fiberG ?? 0),
    }),
    emptyTotals(),
  );
}

/** Returns today's date as YYYY-MM-DD in the device's local timezone. */
export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Returns the ISO date `n` days before today (n=0 → today). */
export function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
