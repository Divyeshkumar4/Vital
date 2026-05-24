-- Phase 1.5 — food logs. One row per (food eaten at a meal on a date).
-- Snapshots calories/macros at log time so historical accuracy survives
-- catalog edits (master prompt §5 "log entries snapshot the values").

create table if not exists public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  meal text not null check (meal in ('breakfast','lunch','dinner','snack')),
  food_id uuid references public.foods(id) on delete set null,
  food_name text not null,
  brand text,
  quantity_g numeric not null check (quantity_g > 0),
  -- snapshots
  kcal numeric not null,
  protein_g numeric not null,
  carbs_g numeric not null,
  fat_g numeric not null,
  fiber_g numeric,
  created_at timestamptz not null default now()
);

create index if not exists food_logs_user_date_idx
  on public.food_logs (user_id, date desc);

alter table public.food_logs enable row level security;

drop policy if exists "food_logs_select_own" on public.food_logs;
drop policy if exists "food_logs_insert_own" on public.food_logs;
drop policy if exists "food_logs_update_own" on public.food_logs;
drop policy if exists "food_logs_delete_own" on public.food_logs;

create policy "food_logs_select_own" on public.food_logs
  for select using (auth.uid() = user_id);

create policy "food_logs_insert_own" on public.food_logs
  for insert with check (auth.uid() = user_id);

create policy "food_logs_update_own" on public.food_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "food_logs_delete_own" on public.food_logs
  for delete using (auth.uid() = user_id);
