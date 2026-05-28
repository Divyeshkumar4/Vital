-- Phase 3.1 — cost of eating.
--
-- Community-priced food model: each user can submit the price they paid for a
-- food in their region/currency; any authenticated user can read all rows so
-- the app can show the median community price as a suggestion when logging.
-- Auto-pull sources (regional grocery APIs) can be added later as
-- source = 'auto'; v1 supports 'manual' (one user typed it) and 'community'
-- (median or other aggregate displayed back to the user — same data shape).
--
-- The food log itself snapshots the price chosen at log time (master prompt
-- § 5 "log entries snapshot the values") so historical spend stays correct
-- even if community prices later change.

-- --- profiles: region + currency ---------------------------------------------

alter table public.profiles
  add column if not exists region text;

alter table public.profiles
  add column if not exists currency text;

-- --- food_logs: price snapshot -----------------------------------------------

alter table public.food_logs
  add column if not exists price_at_log numeric;

alter table public.food_logs
  add column if not exists currency_at_log text;

-- --- food_prices --------------------------------------------------------------

create table if not exists public.food_prices (
  id uuid primary key default gen_random_uuid(),
  food_id uuid not null references public.foods(id) on delete cascade,
  region text not null,
  currency text not null,
  -- Always normalised to "price per 100 g" so prices are comparable across
  -- packaging sizes. UI converts user input (₹/kg, $/oz, per-pack) into this.
  price_per_100g numeric not null check (price_per_100g >= 0),
  source text not null default 'manual' check (source in ('auto','manual','community')),
  submitted_by uuid references auth.users(id) on delete set null,
  verified_count int not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists food_prices_food_region_idx
  on public.food_prices (food_id, region);

alter table public.food_prices enable row level security;

drop policy if exists "food_prices_select_all_auth" on public.food_prices;
drop policy if exists "food_prices_insert_own" on public.food_prices;
drop policy if exists "food_prices_update_own" on public.food_prices;
drop policy if exists "food_prices_delete_own" on public.food_prices;

-- Anyone signed in can read all rows. Community model relies on visibility.
create policy "food_prices_select_all_auth" on public.food_prices
  for select to authenticated using (true);

-- A user can only insert rows tagged with their own submitted_by.
create policy "food_prices_insert_own" on public.food_prices
  for insert to authenticated
  with check (submitted_by = auth.uid());

-- A user can edit / delete only their own submissions (e.g. typo correction).
create policy "food_prices_update_own" on public.food_prices
  for update to authenticated
  using (submitted_by = auth.uid())
  with check (submitted_by = auth.uid());

create policy "food_prices_delete_own" on public.food_prices
  for delete to authenticated
  using (submitted_by = auth.uid());
