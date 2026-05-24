# Data Model

Source: `MASTER_PROMPT.md` § 5. This file expands on the high-level model into table-level shapes. Phase 0 only sets up the foundation; tables ship with their owning phase.

**Universal rules**
- Every user-owned table has `user_id uuid references auth.users(id) on delete cascade` and Row-Level Security (RLS) enabled with a policy of `auth.uid() = user_id`.
- Log tables snapshot values (calories, macros, prices) at log time so historical data survives catalog changes.
- All timestamps are `timestamptz default now()`.
- Soft delete via `deleted_at` for user-facing log rows; hard delete for transient cache.

## Phase 1 — Nutrition

### `profiles`
| col | type | notes |
|---|---|---|
| id | uuid pk | = auth.users.id |
| age | int | years |
| sex | text | 'male' \| 'female' |
| height_cm | numeric | metric internally |
| weight_kg | numeric | metric internally |
| unit_preference | text | 'metric' \| 'imperial' |
| activity_level | text | sedentary \| light \| moderate \| very \| extra |
| goal | text | loss \| maintain \| gain |
| dietary_prefs | text[] | e.g. {'vegetarian'} |
| target_calories | int | kcal/day, snapshot |
| target_protein_g | int | snapshot |
| target_fat_g | int | snapshot |
| target_carbs_g | int | snapshot |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `foods` (global catalog)
| col | type | notes |
|---|---|---|
| id | uuid pk | |
| source | text | 'openfoodfacts' \| 'usda' \| 'manual' |
| source_id | text | e.g. barcode |
| name | text | |
| brand | text \| null | |
| barcode | text \| null | indexed |
| serving_size_g | numeric | |
| serving_label | text | e.g. '1 cup' |
| kcal_per_100g | numeric | |
| protein_per_100g | numeric | |
| carbs_per_100g | numeric | |
| fat_per_100g | numeric | |

### `food_logs`
| col | type | notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid | RLS |
| date | date | |
| meal | text | breakfast \| lunch \| dinner \| snack |
| food_id | uuid | reference, not a hard FK so deletes work |
| quantity_g | numeric | |
| kcal_snapshot | numeric | snapshot |
| protein_snapshot | numeric | |
| carbs_snapshot | numeric | |
| fat_snapshot | numeric | |
| created_at | timestamptz | |

### `food_prices` (Phase 3)
Per master prompt § 9; tracked here for awareness.

### `diet_plans` / `plan_meals`
Generated against current profile targets; stored as denormalized snapshots.

## Phase 2 — Training

### `exercises` (global catalog)
- id, name, muscle_groups text[], equipment text[], difficulty, instructions, media_url

### `routines` / `routine_days` / `routine_exercises`
- routine: user_id, name, split_type
- routine_day: routine_id, weekday (0–6)
- routine_exercise: routine_day_id, exercise_id, target_sets, target_reps, target_rir, rest_sec

### `workout_logs` / `set_logs`
- workout_log: user_id, routine_day_id, started_at, ended_at
- set_log: workout_log_id, routine_exercise_id, set_index, weight_kg, reps, rir, completed_at

### `exercise_audio` (Phase 2.6 / 3.2)
- user_id, exercise_id OR routine_exercise_id, source ('local' \| 'spotify' \| 'apple'), uri/track_id, trigger='rest_end'

## Phase 3 — Monetization

### `subscriptions`
RevenueCat customer/entitlement mirror.

---

Migrations live in `/supabase/migrations/NNNN_description.sql`. Phase 0 ships zero migrations on purpose — we set up the project shell first.
