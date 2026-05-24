export type FoodSource = 'openfoodfacts' | 'usda' | 'manual';

/** App-facing food row. Matches public.foods (camelCased). */
export interface Food {
  id: string;
  source: FoodSource;
  sourceId: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  kcalPer100g: number | null;
  proteinPer100g: number | null;
  carbsPer100g: number | null;
  fatPer100g: number | null;
  fiberPer100g: number | null;
  servingSizeG: number | null;
  servingLabel: string | null;
  imageUrl: string | null;
}

/** Subset used when inserting / caching. Server fills `id` and `created_at`. */
export type FoodInsert = Omit<Food, 'id'>;
