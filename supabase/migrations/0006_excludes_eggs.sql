-- Phase 2 follow-up: per-region "pure vegetarian" support.
-- In India, "vegetarian" frequently excludes eggs as well; in the West it
-- usually includes them. Rather than reshape the diet_pattern enum, we add a
-- boolean — when diet_pattern='vegetarian' AND excludes_eggs=true, the
-- science engine treats the protein math closer to vegan.

alter table public.profiles
  add column if not exists excludes_eggs boolean not null default false;
