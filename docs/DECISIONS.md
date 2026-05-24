# Decisions log

One sentence per decision (per AI rule 13). Newest first.

---

## ⏳ Handoff state (2026-05-24)

**PR #1** ("Phase 0 + Phase 1: foundation and nutrition core complete") was **squash-merged to `main` as commit [`527dd70`](https://github.com/Divyeshkumar4/Vital/commit/527dd70316db0826492e35ecfd729175f6ea9001)** on 2026-05-24. The feature branch `claude/wizardly-knuth-UeWJ3` is preserved on GitHub with the full 14-commit granular history if any future agent needs to read the work step-by-step.

**Where to pick up next:** Phase 2 (workout module + in-gym player + local audio). Master prompt § 8.2 has the per-task list. No Phase 2 code exists yet — a new branch should be cut from `main` when the founder gives the green light.

**Outstanding from earlier phases (deferred, not blockers):**
- Phase 0.3 — Google / Apple OAuth (needs provider credentials from the founder).
- Layer 2 of the science engine — pregnancy / lactation, GLP-1, CKD / dialysis, post-bariatric, adaptive TDEE. Documented in `docs/METHODOLOGY.md` § "Layer 2 roadmap". Architecturally hooked but not wired into onboarding.

**Database state of record:** Migrations `0001_profiles.sql`, `0002_foods.sql`, `0003_food_logs.sql` have all been applied to the production Supabase project (`eeltroiupbgfgldburra`). Phase 2 will introduce new tables (exercises, routines, workout_logs, set_logs, exercise_audio per `docs/DATA_MODEL.md` § "Phase 2 — Training").

**Tested on a real iPhone via Expo Go.** End-to-end auth, onboarding, food search (staples + Open Food Facts), barcode scan, logging, dashboard progress bars, meal plan, history, edit profile, sign-out all confirmed working by the founder before merge.

---

## Decisions in chronological order (newest first)

- 2026-05-24 — Final pre-merge cleanup: rewrote `README.md` to be the AI-orientation entry point (phase status, "for AI agents reading this" reading order, full file map, science workflow); fixed stale `/(app)/home` redirect inside `onboarding.tsx` that survived the tabs refactor.
- 2026-05-23 — Added bundled common-foods staples library (`src/lib/api/staples.ts`) with 62 generic foods spanning Indian + Western staples (rice/roti/dal/paneer/dosa/poha and chicken/eggs/oats/bread/fruit/veg/dairy/fats/nuts) sourced from USDA FoodData Central + standard Indian references; search now merges local staples (instant, 2-char min) with Open Food Facts (debounced, 3-char min); staples cached under `source = 'usda'`.
- 2026-05-23 — UX refactor to bottom-tab navigation: added `(app)/(tabs)/` group with Home / Log / Plan / Profile (Ionicons in the bar); slimmed Home to "today only" (progress bars + Find a food); moved BMR/TDEE/macro split/BMI/BF/edit/sign-out to a dedicated Profile tab; modal-style screens (foods/, log/add, log/history, onboarding) live outside `(tabs)/` so the tab bar hides on them.
- 2026-05-23 — Phase 1.5/1.6/1.7: added `food_logs` table with full RLS (select/insert/update/delete own); built logging form (quantity + meal slot, with suggested slot from time-of-day and prefilled serving size); rewrote dashboard with "Today so far" card (kcal + P/F/C progress bars vs target) and quick-nav buttons; today-log + 7-day history screens with refetch-on-focus; hand-curated meal templates (16 items: Indian + Western mix) scaled to per-meal targets via weighted-distance picker on the macros side.
- 2026-05-23 — Phase 1.4 follow-ups: replaced supabase upsert (which silently tried UPDATE and hit RLS) with select-then-insert in `cacheFood`; relaxed scanner gating so a different barcode auto-clears the previous error.
- 2026-05-23 — Phase 1.4: integrated Open Food Facts (free public API, no key) for food search + barcode lookup; installed `expo-camera` for barcode scanning with iOS / Android permission strings via `expo-camera` plugin; added Supabase `foods` cache table (RLS: authenticated read + insert); built search screen with debounced live results, barcode scanner with framed overlay, and food detail screen showing per-100g and per-serving nutrition.
- 2026-05-23 — UX polish: button text contrast fixed via inline style (NativeWind class precedence was unreliable for nested color tokens); citations removed from user-facing warning strings (they live in METHODOLOGY only); dashboard notices card hides when only info-level items exist.
- 2026-05-23 — Phase 1.1 + 1.3: built single-screen onboarding (age/sex/units/height/weight/body-fat/activity/persona/endurance/diet/goal) + results dashboard (calorie target, macro bars, per-meal protein, fiber, BMI/BF% bands, safety warnings); added Supabase `profiles` table migration with full RLS; (app) layout auto-redirects incomplete profiles to onboarding.
- 2026-05-23 — Phase 1.2: ported FuelWise v8.20 Layer 1 methodology into `/src/lib/science/` (persona × goal matrix; MSJ/HB/KM BMR; 25%/40%/20% calorie caps; per-meal protein with age-graded MPS; fiber 14 g/1000 kcal; activity-graded carb floors; BMI/BF% bands incl. Asian thresholds; diet-pattern protein add); MASTER_PROMPT § 3 rewritten to point at new `/docs/METHODOLOGY.md`; 100/100 unit tests pass.
- 2026-05-23 — SDK upgrade: bumped Expo 51 → 54 to match Expo Go's current SDK; replaced Reanimated `react-native-reanimated/plugin` with `react-native-worklets/plugin` per SDK 54; dropped NativeWind v2-style `cssInterop` calls (babel preset wires built-ins automatically in v4).
- 2026-05-23 — Phase 0.1/0.4/0.5: scaffolded Expo SDK 51 + Expo Router v3 + NativeWind v4 + TypeScript strict; established a dark-default design system in `src/lib/design/tokens.ts` consumed by Tailwind and base components (`Text`, `Button`, `Input`, `Screen`).
- 2026-05-23 — Phase 0.2: wired `@supabase/supabase-js` with AsyncStorage session persistence; client returns `null` until `EXPO_PUBLIC_SUPABASE_URL`/`ANON_KEY` are set so the app boots before the founder creates the Supabase project.
- 2026-05-23 — Phase 0.3: scaffolded email sign-up / sign-in / sign-out screens; Google/Apple sign-in stubbed with an Alert because OAuth requires Supabase provider credentials (founder action).
- 2026-05-23 — i18n: chose a tiny hand-rolled `t()` helper over a full library for Phase 0; will swap for `i18next` when a second locale is added.
- 2026-05-23 — Established AI operating rules in `AI_RULES.md`, `CLAUDE.md`, `.cursorrules` mirrored from MASTER_PROMPT § 6.
