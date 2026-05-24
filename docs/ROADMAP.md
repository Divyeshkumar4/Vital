# Roadmap

Mirror of `MASTER_PROMPT.md` § 8 with status. Update as tasks complete.

Legend: ✅ done · 🟡 in progress · ⬜ not started · 🔒 blocked on founder

## Phase 0 — Foundation
- ✅ 0.1 Init Expo + TS + Expo Router + NativeWind
- 🔒 0.2 Create Supabase project (founder action) — client + env wired
- 🟡 0.3 Auth (email scaffolded; Google/Apple need OAuth credentials)
- ✅ 0.4 Docs + GitHub repo
- ✅ 0.5 Design system (tokens + base components)

## Phase 1 — Lean MVP: Nutrition core
- ✅ 1.1 Onboarding (single scrollable form: age/sex/units/height/weight/body-fat/activity/persona/endurance/diet/goal) + Supabase `profiles` table with RLS
- ✅ 1.2 Science engine (FuelWise v8.20 Layer 1 methodology adopted — persona × goal matrix, BMR variants, calorie caps, per-meal protein, fiber, BF/BMI bands; 100/100 unit tests pass)
- ✅ 1.3 Results dashboard (calorie target, macro bars, per-meal protein, fiber, BMI/BF% bands, safety warnings)
- ✅ 1.4 Open Food Facts integration (search + barcode scan) — `foods` cache table with RLS, debounced live search, camera-based barcode scanner, food detail screen with per-100g + per-serving nutrition
- ✅ 1.5 Food logging with live totals — `food_logs` table with full RLS, quantity+meal logging form (suggested-slot-from-time), today's log screen, "Today so far" progress bars on dashboard
- ✅ 1.6 Diet-plan generator — 16 hand-curated meal templates (Indian + Western), scaled per-meal to fit user's target macros via weighted-distance ranking
- ✅ 1.7 History view — last 7 days with daily totals and on-target / over / under coloring

## Phase 2 — Workout + in-gym player + local audio
- ⬜ 2.1 Exercise library
- ⬜ 2.2 Routine generator
- ⬜ 2.3 Equipment customization
- ⬜ 2.4 Weekly split
- ⬜ 2.5 In-gym Workout Player
- ⬜ 2.6 Local audio trigger

## Phase 3 — Cost + streaming + freemium
- ⬜ 3.1 Cost of eating (community prices)
- ⬜ 3.2 Spotify + Apple MusicKit
- ⬜ 3.3 RevenueCat
