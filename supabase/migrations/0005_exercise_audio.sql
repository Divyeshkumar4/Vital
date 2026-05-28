-- Phase 2.6 - per-user assignment of a song to an exercise.
-- The song itself lives in the `exercise-audio` Storage bucket; this table
-- stores the (user, exercise) -> file path mapping plus future-friendly
-- source columns for Spotify / Apple in Phase 3.

create table if not exists public.exercise_audio (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Stable exercise id from src/lib/api/exercises.ts. Text not uuid because
  -- the catalog lives in code, not Supabase.
  exercise_id text not null,
  source text not null default 'local' check (source in ('local','spotify','apple')),
  storage_path text,        -- bucket-relative path when source = 'local'
  display_name text,        -- user-friendly label
  created_at timestamptz not null default now(),
  -- One assigned song per (user, exercise). Re-assigning replaces.
  unique (user_id, exercise_id)
);

create index if not exists exercise_audio_user_idx
  on public.exercise_audio (user_id);

alter table public.exercise_audio enable row level security;

drop policy if exists "exercise_audio_select_own" on public.exercise_audio;
drop policy if exists "exercise_audio_insert_own" on public.exercise_audio;
drop policy if exists "exercise_audio_update_own" on public.exercise_audio;
drop policy if exists "exercise_audio_delete_own" on public.exercise_audio;

create policy "exercise_audio_select_own" on public.exercise_audio
  for select using (auth.uid() = user_id);
create policy "exercise_audio_insert_own" on public.exercise_audio
  for insert with check (auth.uid() = user_id);
create policy "exercise_audio_update_own" on public.exercise_audio
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "exercise_audio_delete_own" on public.exercise_audio
  for delete using (auth.uid() = user_id);

-- ---- Storage bucket + policies ----
--
-- Files are stored under `{user_id}/{filename}` so the (storage.foldername(name))[1]
-- check below means each user can only access their own files. Bucket is
-- private; the client fetches signed URLs on demand for playback.

insert into storage.buckets (id, name, public)
values ('exercise-audio', 'exercise-audio', false)
on conflict (id) do nothing;

drop policy if exists "audio_select_own" on storage.objects;
drop policy if exists "audio_insert_own" on storage.objects;
drop policy if exists "audio_update_own" on storage.objects;
drop policy if exists "audio_delete_own" on storage.objects;

create policy "audio_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'exercise-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "audio_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'exercise-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "audio_update_own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'exercise-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'exercise-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "audio_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'exercise-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
