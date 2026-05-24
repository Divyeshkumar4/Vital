/**
 * Open Food Facts — free, open, global food database.
 * https://world.openfoodfacts.org
 *
 * No API key needed. They do ask for a custom User-Agent so they can track
 * which apps hit the API.
 */

const USER_AGENT = 'Vital/0.1 (https://github.com/Divyeshkumar4/Vital)';
const BASE = 'https://world.openfoodfacts.org';

export interface OffNutriments {
  'energy-kcal_100g'?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  fiber_100g?: number;
}

export interface OffProduct {
  code: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  image_front_small_url?: string;
  image_url?: string;
  serving_size?: string;
  serving_quantity?: number;
  nutriments?: OffNutriments;
}

interface OffSearchResponse {
  count?: number;
  products?: OffProduct[];
}

interface OffProductResponse {
  status: 0 | 1;
  status_verbose?: string;
  product?: OffProduct;
}

/** Normalised, app-facing shape. All nutrition is per 100 g. */
export interface OffFood {
  sourceId: string; // OFF "code" (barcode)
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

function toOffFood(p: OffProduct): OffFood {
  const n = p.nutriments ?? {};
  return {
    sourceId: p.code,
    name: (p.product_name_en || p.product_name || 'Unnamed food').trim(),
    brand: p.brands ? p.brands.split(',')[0]?.trim() ?? null : null,
    barcode: p.code || null,
    kcalPer100g: typeof n['energy-kcal_100g'] === 'number' ? n['energy-kcal_100g'] : null,
    proteinPer100g: typeof n.proteins_100g === 'number' ? n.proteins_100g : null,
    carbsPer100g: typeof n.carbohydrates_100g === 'number' ? n.carbohydrates_100g : null,
    fatPer100g: typeof n.fat_100g === 'number' ? n.fat_100g : null,
    fiberPer100g: typeof n.fiber_100g === 'number' ? n.fiber_100g : null,
    servingSizeG: typeof p.serving_quantity === 'number' ? p.serving_quantity : null,
    servingLabel: p.serving_size ?? null,
    imageUrl: p.image_front_small_url ?? p.image_url ?? null,
  };
}

function hasMacros(f: OffFood): boolean {
  return (
    f.kcalPer100g !== null ||
    f.proteinPer100g !== null ||
    f.carbsPer100g !== null ||
    f.fatPer100g !== null
  );
}

/** Search by free-text query. Returns at most `pageSize` matches with usable macros. */
export async function searchFoods(query: string, pageSize = 20): Promise<OffFood[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const url = new URL(`${BASE}/cgi/search.pl`);
  url.searchParams.set('search_terms', trimmed);
  url.searchParams.set('search_simple', '1');
  url.searchParams.set('action', 'process');
  url.searchParams.set('json', '1');
  url.searchParams.set('page_size', String(pageSize));
  url.searchParams.set(
    'fields',
    'code,product_name,product_name_en,brands,image_front_small_url,image_url,serving_size,serving_quantity,nutriments',
  );

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Open Food Facts search failed (${res.status}).`);
  const json = (await res.json()) as OffSearchResponse;
  const products = json.products ?? [];
  return products.map(toOffFood).filter(hasMacros);
}

/** Look a barcode up. Returns null when the product is not in the database. */
export async function lookupBarcode(barcode: string): Promise<OffFood | null> {
  const trimmed = barcode.trim();
  if (!trimmed) return null;
  const res = await fetch(`${BASE}/api/v2/product/${encodeURIComponent(trimmed)}.json`, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Open Food Facts lookup failed (${res.status}).`);
  }
  const json = (await res.json()) as OffProductResponse;
  if (json.status !== 1 || !json.product) return null;
  const food = toOffFood(json.product);
  return hasMacros(food) ? food : null;
}
