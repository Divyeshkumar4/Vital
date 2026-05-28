-- Phase 3.2 — freemium subscription state. One row per user. RLS: read-own-only,
-- and writes go through a SECURITY DEFINER function (or, for the v1 stub, direct
-- upsert) — Phase 4 will replace the stub with a RevenueCat webhook sync.
--
-- The `source` column tracks where the row came from so a future RevenueCat
-- worker doesn't accidentally overwrite a 'stub' row in production after the
-- real billing is wired up.

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tier text not null default 'free' check (tier in ('free','premium')),
  status text not null default 'active' check (status in ('active','expired','cancelled')),
  source text not null default 'stub' check (source in ('stub','revenuecat','manual')),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_select_own" on public.subscriptions;
drop policy if exists "subscriptions_upsert_own_stub" on public.subscriptions;
drop policy if exists "subscriptions_update_own_stub" on public.subscriptions;

create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);

-- V1 stub: users can upsert their own row. Phase 4 will revoke this and route
-- writes through a SECURITY DEFINER function called by the RevenueCat webhook.
create policy "subscriptions_upsert_own_stub" on public.subscriptions
  for insert to authenticated
  with check (auth.uid() = user_id and source = 'stub');

create policy "subscriptions_update_own_stub" on public.subscriptions
  for update to authenticated
  using (auth.uid() = user_id and source = 'stub')
  with check (auth.uid() = user_id and source = 'stub');

-- updated_at maintenance — reuses the trigger function added in 0001.
drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute procedure public.tg_set_updated_at();
