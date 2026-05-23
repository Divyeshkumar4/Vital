-- Phase 1.1 — user profiles. One row per auth user. RLS on; users only ever see their own row.
-- Methodology fields mirror /src/lib/science/types.ts (ScienceInput).

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  age int,
  sex text check (sex in ('male','female','nb')),
  unit_preference text not null default 'metric' check (unit_preference in ('metric','imperial')),
  height_cm numeric,
  weight_kg numeric,
  body_fat_pct numeric,
  activity_level text check (activity_level in ('sedentary','light','moderate','very','extra')),
  goal text check (goal in ('lose','maintain','gain')),
  persona text not null default 'general' check (persona in ('training','general')),
  endurance boolean not null default false,
  diet_pattern text not null default 'omnivore' check (diet_pattern in ('omnivore','vegetarian','vegan')),
  bmr_method text not null default 'msj' check (bmr_method in ('msj','hb','km')),
  deficit_pct numeric,
  surplus_pct numeric,
  clinically_supervised boolean not null default false,
  asian_bmi boolean not null default false,
  -- snapshot of last computed targets (re-saved each time onboarding/profile changes)
  target_calories int,
  target_protein_g int,
  target_fat_g int,
  target_carbs_g int,
  target_fiber_g int,
  methodology_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_delete_own" on public.profiles;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

-- Maintain updated_at automatically.
create or replace function public.tg_set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.tg_set_updated_at();

-- Auto-create an empty profile row whenever a new auth user signs up.
create or replace function public.tg_handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.tg_handle_new_user();

-- Backfill: create empty profile rows for any existing users who don't have one yet
-- (covers users created before this migration ran).
insert into public.profiles (id)
select u.id from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
