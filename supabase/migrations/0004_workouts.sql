-- Phase 2 - workout module. Five tables that map a user's program to
-- weekday-based routines and capture every set they actually perform.
--
-- Exercises themselves are NOT in Supabase - the curated library is bundled
-- with the app in src/lib/api/exercises.ts and referenced by stable text id
-- (e.g. 'back-squat'). When user-defined exercises are added later they
-- live in a separate user_exercises table.

-- ---- routines (user's program) ----
create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  split_type text not null check (split_type in ('full_body','upper_lower','ppl','body_part','custom')),
  experience text not null check (experience in ('beginner','intermediate','advanced')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists routines_user_idx on public.routines (user_id, active);

alter table public.routines enable row level security;

drop policy if exists "routines_select_own" on public.routines;
drop policy if exists "routines_insert_own" on public.routines;
drop policy if exists "routines_update_own" on public.routines;
drop policy if exists "routines_delete_own" on public.routines;

create policy "routines_select_own" on public.routines
  for select using (auth.uid() = user_id);
create policy "routines_insert_own" on public.routines
  for insert with check (auth.uid() = user_id);
create policy "routines_update_own" on public.routines
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "routines_delete_own" on public.routines
  for delete using (auth.uid() = user_id);

drop trigger if exists routines_set_updated_at on public.routines;
create trigger routines_set_updated_at
  before update on public.routines
  for each row execute procedure public.tg_set_updated_at();

-- ---- routine_days (a training day inside a routine) ----
create table if not exists public.routine_days (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines(id) on delete cascade,
  -- weekday 0..6 = Sun..Sat. NULL means flexible / unscheduled.
  weekday int check (weekday is null or (weekday >= 0 and weekday <= 6)),
  name text not null,
  order_idx int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists routine_days_routine_idx
  on public.routine_days (routine_id, order_idx);

alter table public.routine_days enable row level security;

drop policy if exists "routine_days_select_own" on public.routine_days;
drop policy if exists "routine_days_insert_own" on public.routine_days;
drop policy if exists "routine_days_update_own" on public.routine_days;
drop policy if exists "routine_days_delete_own" on public.routine_days;

create policy "routine_days_select_own" on public.routine_days
  for select using (
    exists (select 1 from public.routines r where r.id = routine_id and r.user_id = auth.uid())
  );
create policy "routine_days_insert_own" on public.routine_days
  for insert with check (
    exists (select 1 from public.routines r where r.id = routine_id and r.user_id = auth.uid())
  );
create policy "routine_days_update_own" on public.routine_days
  for update using (
    exists (select 1 from public.routines r where r.id = routine_id and r.user_id = auth.uid())
  );
create policy "routine_days_delete_own" on public.routine_days
  for delete using (
    exists (select 1 from public.routines r where r.id = routine_id and r.user_id = auth.uid())
  );

-- ---- routine_exercises (template for a day) ----
create table if not exists public.routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_day_id uuid not null references public.routine_days(id) on delete cascade,
  exercise_id text not null,        -- stable id from the bundled library
  exercise_name text not null,      -- snapshot for display + history if library renames
  order_idx int not null default 0,
  target_sets int not null check (target_sets > 0 and target_sets <= 10),
  target_reps_min int not null check (target_reps_min > 0),
  target_reps_max int not null check (target_reps_max >= target_reps_min),
  target_rir int check (target_rir is null or (target_rir >= 0 and target_rir <= 10)),
  rest_sec int not null default 90 check (rest_sec >= 0 and rest_sec <= 600),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists routine_exercises_day_idx
  on public.routine_exercises (routine_day_id, order_idx);

alter table public.routine_exercises enable row level security;

drop policy if exists "routine_exercises_select_own" on public.routine_exercises;
drop policy if exists "routine_exercises_insert_own" on public.routine_exercises;
drop policy if exists "routine_exercises_update_own" on public.routine_exercises;
drop policy if exists "routine_exercises_delete_own" on public.routine_exercises;

create policy "routine_exercises_select_own" on public.routine_exercises
  for select using (
    exists (
      select 1 from public.routine_days rd
      join public.routines r on r.id = rd.routine_id
      where rd.id = routine_day_id and r.user_id = auth.uid()
    )
  );
create policy "routine_exercises_insert_own" on public.routine_exercises
  for insert with check (
    exists (
      select 1 from public.routine_days rd
      join public.routines r on r.id = rd.routine_id
      where rd.id = routine_day_id and r.user_id = auth.uid()
    )
  );
create policy "routine_exercises_update_own" on public.routine_exercises
  for update using (
    exists (
      select 1 from public.routine_days rd
      join public.routines r on r.id = rd.routine_id
      where rd.id = routine_day_id and r.user_id = auth.uid()
    )
  );
create policy "routine_exercises_delete_own" on public.routine_exercises
  for delete using (
    exists (
      select 1 from public.routine_days rd
      join public.routines r on r.id = rd.routine_id
      where rd.id = routine_day_id and r.user_id = auth.uid()
    )
  );

-- ---- workout_logs (one row per session) ----
create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  routine_day_id uuid references public.routine_days(id) on delete set null,
  routine_name text,
  day_name text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  notes text
);

create index if not exists workout_logs_user_started_idx
  on public.workout_logs (user_id, started_at desc);

alter table public.workout_logs enable row level security;

drop policy if exists "workout_logs_select_own" on public.workout_logs;
drop policy if exists "workout_logs_insert_own" on public.workout_logs;
drop policy if exists "workout_logs_update_own" on public.workout_logs;
drop policy if exists "workout_logs_delete_own" on public.workout_logs;

create policy "workout_logs_select_own" on public.workout_logs
  for select using (auth.uid() = user_id);
create policy "workout_logs_insert_own" on public.workout_logs
  for insert with check (auth.uid() = user_id);
create policy "workout_logs_update_own" on public.workout_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workout_logs_delete_own" on public.workout_logs
  for delete using (auth.uid() = user_id);

-- ---- set_logs (one row per set actually performed) ----
create table if not exists public.set_logs (
  id uuid primary key default gen_random_uuid(),
  workout_log_id uuid not null references public.workout_logs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  routine_exercise_id uuid references public.routine_exercises(id) on delete set null,
  exercise_id text not null,
  exercise_name text not null,
  set_index int not null check (set_index > 0),
  weight_kg numeric,
  reps int check (reps is null or reps >= 0),
  rir int check (rir is null or (rir >= 0 and rir <= 10)),
  completed_at timestamptz not null default now()
);

create index if not exists set_logs_user_exercise_idx
  on public.set_logs (user_id, exercise_id, completed_at desc);

create index if not exists set_logs_workout_idx
  on public.set_logs (workout_log_id, set_index);

alter table public.set_logs enable row level security;

drop policy if exists "set_logs_select_own" on public.set_logs;
drop policy if exists "set_logs_insert_own" on public.set_logs;
drop policy if exists "set_logs_update_own" on public.set_logs;
drop policy if exists "set_logs_delete_own" on public.set_logs;

create policy "set_logs_select_own" on public.set_logs
  for select using (auth.uid() = user_id);
create policy "set_logs_insert_own" on public.set_logs
  for insert with check (auth.uid() = user_id);
create policy "set_logs_update_own" on public.set_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "set_logs_delete_own" on public.set_logs
  for delete using (auth.uid() = user_id);
