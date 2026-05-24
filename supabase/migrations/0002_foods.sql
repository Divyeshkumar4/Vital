-- Phase 1.4 — foods catalog cache. Populated lazily from Open Food Facts and
-- (eventually) USDA / manual entries. Global catalog, readable to all
-- authenticated users; inserts allowed (client caches the foods it sees).
-- Updates / deletes are admin-only.

create table if not exists public.foods (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('openfoodfacts','usda','manual')),
  source_id text not null,
  name text not null,
  brand text,
  barcode text,
  -- canonical nutrition: all values per 100 g of food
  kcal_per_100g numeric,
  protein_per_100g numeric,
  carbs_per_100g numeric,
  fat_per_100g numeric,
  fiber_per_100g numeric,
  -- optional serving info if the source provides it
  serving_size_g numeric,
  serving_label text,
  image_url text,
  created_at timestamptz not null default now(),
  unique (source, source_id)
);

create index if not exists foods_barcode_idx
  on public.foods (barcode) where barcode is not null;

alter table public.foods enable row level security;

drop policy if exists "foods_select_authenticated" on public.foods;
drop policy if exists "foods_insert_authenticated" on public.foods;

-- Global catalog: any signed-in user can read.
create policy "foods_select_authenticated" on public.foods
  for select to authenticated using (true);

-- Cache fills: any signed-in user may insert a food row they've fetched from
-- a public source (Open Food Facts, USDA). Future hardening: move catalog
-- writes to an edge function and revoke client insert.
create policy "foods_insert_authenticated" on public.foods
  for insert to authenticated with check (true);

-- No client update / delete in v1.
