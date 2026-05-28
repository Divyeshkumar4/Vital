# Roadmap

Mirror of `MASTER_PROMPT.md` § 8 with status. Update as tasks complete.

Legend: ✅ done · 🟡 in progress · ⬜ not started · 🔒 blocked on founder · ⏸ deferred by design

---

## 👉 Pickup point for the next AI agent (2026-05-24)

**Where we are:** Phase 0 + Phase 1 are merged to `main` (PR #1, squash commit `527dd70`). The app is end-to-end working on a real iPhone via Expo Go — founder has tested auth, onboarding, search/scan, logging, dashboard, plan, history.

**What to do next:** **Phase 2 (workout module + in-gym player + local audio)** — see § 8.2 of `docs/MASTER_PROMPT.md` for the per-task spec. Cut a fresh branch from `main` only after the founder gives the green light. Do NOT pre-emptively start coding.

**Before you start any new work, in this order:**
1. Read `docs/MASTER_PROMPT.md` end-to-end.
2. Read `AI_RULES.md` — the 13 operating rules.
3. Read `docs/METHODOLOGY.md` if your change touches the science engine.
4. Skim recent entries in `docs/DECISIONS.md` for context.
5. Check this ROADMAP for the current task.
6. Run `npm install` (if first time on the box), then `npx tsc --noEmit` and `npx jest` — both must pass before you change anything.

---

## Phase 0 — Foundation
- ✅ 0.1 Init Expo SDK 54 + TypeScript strict + Expo Router v6 + NativeWind v4
- ✅ 0.2 Supabase project + client wired (graceful no-op until `.env` is set)
- 🟡 0.3 Auth — email sign-up / sign-in / sign-out working end-to-end
- ⏸ 0.3 Auth — Google / Apple OAuth (deferred — needs provider credentials from founder, then wire `expo-auth-session`)
- ✅ 0.4 Docs scaffolding + GitHub repo
- ✅ 0.5 Design system (tokens in `src/lib/design/tokens.ts` + base components)

## Phase 1 — Lean MVP: Nutrition core
- ✅ 1.1 Onboarding — single scrollable form (age/sex/units/height/weight/body-fat/activity/persona/endurance/diet/goal) → Supabase `profiles` table with full RLS
- ✅ 1.2 Science engine — Layer 1 of `docs/METHODOLOGY.md` (FuelWise v8.20 derived): persona × goal matrix, MSJ/HB/KM BMR, calorie caps 25%/40%/20%, per-meal protein age-graded, fiber 14 g/1000 kcal, activity-graded carb floors, BMI / BF% bands (incl. Asian). 100 / 100 unit tests with worked examples.
- ✅ 1.3 Results dashboard — calorie target, macro bars, per-meal protein, fiber, BMI / BF% bands, safety warnings filtered to actionable only
- ✅ 1.4 Open Food Facts integration — search + barcode scan via `expo-camera`; `foods` cache table with RLS; bundled common-foods staples library (62 generic foods) merged into search; clean scanner error UX
- ✅ 1.5 Food logging — `food_logs` table with full RLS; logging form with auto-suggested meal slot from time-of-day; today's totals on dashboard with progress bars; today's log screen grouped by meal with delete
- ✅ 1.6 Diet-plan generator — 16 hand-curated meal templates (Indian + Western), scaled per-meal to the user's macros via weighted-distance ranking; one tab in the app
- ✅ 1.7 History view — last 7 days with daily totals + on-target / over / under colour pills

**Phase 1 extras (delivered on top of the master prompt spec):**
- Bottom tab bar navigation (Home / Log / Plan / Profile)
- Common-foods staples library (Indian + Western, 62 items)

## Phase 2 — Workout + in-gym player + local audio  ✅ (on `claude/phase-2-workouts`)
- ✅ 2.1 Exercise library — 60-exercise curated bundle in `src/lib/api/exercises.ts` with muscle groups / equipment / difficulty / instructions
- ✅ 2.2 Routine generator — 3 templates (beginner full-body / intermediate U-L / advanced PPL), goal-aware (strength / hypertrophy / endurance) rep schemes via science layer
- 🟡 2.3 Equipment customization — basic ("training type" + goal) in setup screen; full equipment-availability filtering with substitutions deferred
- ✅ 2.4 Weekly split assignment — day-based (weekday 0–6) on `routine_days`; tab + dashboard auto-detect today
- ✅ 2.5 In-gym Workout Player — guided set-by-set with rest timer countdown; RIR-aware progression suggestion prefilled; auto-log weight / reps / RIR; auto-advance to next set; finish-and-end flow
- ✅ 2.6 Local audio trigger — `exercise_audio` table + `exercise-audio` private Storage bucket with own-files-only RLS; assign a song to an exercise from the workout player (expo-document-picker → expo-av playback); auto-plays from a signed URL when rest timer hits 0 and stops when the next set is logged. Foreground-only by design — iOS background-audio is master prompt § 9 / Phase 3 territory.

Master prompt direction: **ship Phase 2 to TestFlight / Play internal testing before starting Phase 3.**

## Phase 3 — Cost tracking + streaming music + freemium  ⬜
- ⬜ 3.1 Cost of eating — daily / monthly food spend with community-priced fallback model per master prompt § 9
- ⬜ 3.2 Streaming music — Spotify SDK + Apple MusicKit (caveat: iOS background-audio limits make local audio the dependable default)
- ⬜ 3.3 Freemium via RevenueCat

## Phase 4+ — Scale & moat  ⬜
Community / social, AI coach (LLM-assisted plans), wearable / IoT integrations, advanced analytics. Architected for in the data model now (clean tables, edge functions later) so they slot in cleanly.

---

## Database migrations applied (production)

In numeric order, all live on `eeltroiupbgfgldburra.supabase.co`:

| File | Purpose | Phase |
|---|---|---|
| `0001_profiles.sql` | User profile + RLS + auto-create trigger on signup | 1.1 |
| `0002_foods.sql` | Global foods catalog cache + RLS | 1.4 |
| `0003_food_logs.sql` | Per-user food logs + RLS (full CRUD on own rows) | 1.5 |
| `0004_workouts.sql` ⚠️ **not yet applied** | routines + routine_days + routine_exercises + workout_logs + set_logs + RLS | 2.1–2.5 |
| `0005_exercise_audio.sql` ⚠️ **not yet applied** | exercise_audio table + RLS + private `exercise-audio` Storage bucket + own-files-only storage policies | 2.6 |

Phase 2 stores exercises in code (`src/lib/api/exercises.ts`) rather than a Supabase table — referenced from `routine_exercises.exercise_id` by stable text id. User-defined exercises (if ever needed) will go in a separate `user_exercises` table later.
