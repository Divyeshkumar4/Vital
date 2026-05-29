# Roadmap

The build plan for Vital, with status. Update as tasks complete.

> **2026-05-29 — restructured (aggressive).** This roadmap was rebuilt to fold in the full 16-feature
> product spec (~70 sub-points) and to move faster than the original one-task-per-line plan. Phases now
> **bundle many features** and **code-only phases run in parallel**. This roadmap **supersedes the
> original phasing in `MASTER_PROMPT.md` §8** (the master prompt remains the source of truth for vision,
> science, stack, and data model). See `docs/DECISIONS.md` 2026-05-29 (roadmap rebuild) for the rationale.

Legend: ✅ done · 🟡 in progress · ⬜ not started · 🔒 blocked on founder credential · ⏸ deferred by design · 🗺️ scheduled (spec gap)

---

## 👉 Pickup point for the next AI agent (2026-05-29 — aggressive roadmap)

**Phases 0–3 are complete and on device.** Foundation, nutrition core, workout module (minus hype-song
audio), and the cost + freemium scaffold all ship and were verified on a real iPhone.

**The roadmap below was rebuilt to cover the entire product spec.** Everything not yet built is now
**scheduled into Phases 4–12** and cross-referenced in the **Feature-spec coverage map** at the bottom.

**How to pick the next task (aggressive = parallel):**
- **Phases 4–9 are code-only with no external blockers.** Any of them can start now, and independent
  workstreams within them can run in parallel. Start with **Phase 4 (Logging Power)** — it has the
  highest retention impact (logging friction is the #1 churn driver per the spec).
- **Phases 10–12 are gated** on a new dependency the founder must approve, a paid API key, or a native
  build / store credential. Do not start them until the founder green-lights the specific blocker.

**Before starting any phase, in order:**
1. Read `docs/MASTER_PROMPT.md` (vision, stack §4, science §3, data model §5, safety §3.4/§11).
2. Read `AI_RULES.md` — the 13 operating rules (esp. #3: never add a library without asking first).
3. Read `docs/METHODOLOGY.md` if the task touches `src/lib/science/`.
4. Skim recent `docs/DECISIONS.md`.
5. Run `npm install` (first time on a box), then `npx tsc --noEmit` and `npx jest` — both must pass
   before you change anything (baseline: 126 tests).
6. Each new user table needs a Supabase migration **with RLS** (AI Rule 8); list it in the migrations
   table below and flag it for the founder to apply to production.

---

## ✅ Completed — Phases 0–3

- **Phase 0 — Foundation:** Expo SDK 54 + TS strict + Expo Router v6 + NativeWind v4; Supabase client;
  email auth (sign-up/in/out) + forgot-password via email-OTP recovery; design system. *(OAuth deferred → Phase 12.)*
- **Phase 1 — Nutrition core:** onboarding form → `profiles` (RLS); science engine (BMR MSJ/HB/KM, TDEE,
  calorie caps 25/40/20%, 1%/wk loss-rate clamp, per-meal protein, fiber, BMI/BF bands), 126 unit tests;
  results dashboard; Open Food Facts search + barcode + 62-item staples library; food logging + history.
- **Phase 2 — Workout module:** 60-exercise library; routine generator (3 templates); weekly split;
  in-gym player with rest timer + RIR progression. *(2.3 equipment customization 🟡 → Phase 6; 2.6 hype-song audio → Phase 12.)*
- **Phase 3 — Cost + freemium scaffold:** `food_prices` community model; region/currency; cost dashboard
  + 30-day view; `subscriptions` table + `FREE_LIMITS` + `Paywall` + stub purchase. *(Live billing → Phase 12.)*

---

## 🚀 Phase 4 — Logging Power & Food-Data Depth  ⬜ (code-only · start here)
Highest retention impact — minimize taps-to-log.
- 🗺️ 4.1 Edit & copy log entries — edit screen + `updateLog()`; "log again" duplicate. (spec 2.4)
- 🗺️ 4.2 Copy a previous day's meal or an entire day. (spec 2.5)
- 🗺️ 4.3 Log to any past/future date — custom date stepper/picker (no new dep). (spec 2.6)
- 🗺️ 4.4 Recently- & frequently-logged shortcuts on the search screen. (spec 2.7)
- 🗺️ 4.5 History-aware search ranking — surface the user's own foods first. (spec 3.4)
- 🗺️ 4.6 Multiple serving units (g / oz / cups / "1 medium") with conversion. (spec 2.2)
- 🗺️ 4.7 Custom meal slots (beyond breakfast/lunch/dinner/snack). (spec 2.1)
- 🗺️ 4.8 Favorites / starred foods. (spec 7.4)
- 🗺️ 4.9 Extended-nutrient columns + parse sugar / sodium / saturated fat from OFF into `foods` + `food_logs`. (spec 5.1, 3.3)
- 🗺️ 4.10 Data-provenance / verified-or-hybrid markers in search results. (spec 3.5)

## 📊 Phase 5 — Dashboard, Macros & Goal Control  ⬜ (code-only)
- 🗺️ 5.1 Macros as grams **and** % of daily target, per-entry and per-day. (spec 4.1)
- 🗺️ 5.2 Macro rings/bars on the dashboard (reuse `CircularProgress`). (spec 4.2, 13.2)
- 🗺️ 5.3 User-adjustable macro goals + presets: balanced / high-protein / low-carb / keto. (spec 1.3, 4.3)
- 🗺️ 5.4 Optional target weight + weekly rate of change (0.25–1 kg/wk) → maps to deficit/surplus %. (spec 1.1)
- 🗺️ 5.5 kcal ↔ kJ toggle in units layer. (spec 1.4)
- 🗺️ 5.6 Auto-recalc prompt when weight or goal changes. (spec 1.5)
- 🗺️ 5.7 Per-nutrient daily goals + over/under indicators (sugar/sodium/sat-fat/fiber). (spec 5.3)
- 🗺️ 5.8 Home: today's meals grouped by slot; quick links to scan / water / exercise. (spec 13.3, 13.4)
- 🗺️ 5.9 Customizable dashboard widgets. (spec 13.5)
- 🗺️ 5.10 Macro-cycling / per-day overrides — **premium**. (spec 4.4)
- 🗺️ 5.11 Gate deep nutrient reports behind premium. (spec 5.4)

## 📈 Phase 6 — Progress, Activity & Hydration  ⬜ (code-only · uses existing Supabase Storage)
- 🗺️ 6.1 `weight_logs` table + trend chart vs goal weight (custom SVG, no chart dep). (spec 9.1)
- 🗺️ 6.2 Optional measurements (body-fat %, waist, chest, …). (spec 9.2)
- 🗺️ 6.3 Milestone celebrations + projected goal-completion date from trend. (spec 9.4)
- 🗺️ 6.4 **Adaptive TDEE engine** — compare logged intake vs actual weight change; recalibrate budget.
  *(Acceptance criterion. Depends on 6.1 weight history; needs `METHODOLOGY.md` update + version bump + new science tests.)* (spec 1.6)
- 🗺️ 6.5 Exercise calorie burn (MET tables) + show burned cals on dashboard. (spec 10.1, 13.1)
- 🗺️ 6.6 "Eat-back" burned-calories setting (add to budget or not). (spec 10.2)
- 🗺️ 6.7 Water/hydration: quick-add (+250 ml / +1 cup) + daily goal + dashboard progress. (spec 12.1, 12.2)
- 🗺️ 6.8 Progress photos — private gallery + before/after (Supabase Storage + RLS). (spec 9.3)
- 🗺️ 6.9 Equipment customization for routines (carried over from Phase 2.3). (spec/roadmap 2.3)

## 🍳 Phase 7 — Recipes, Meal Planning & Insights  ⬜ (code-only)
- 🗺️ 7.1 Recipe builder from multiple ingredients → auto per-serving nutrition (`recipes` table). (spec 7.2)
- 🗺️ 7.2 Saved meals (groups of foods) for one-tap re-logging. (spec 7.3)
- 🗺️ 7.3 User recipe library + diet-type filter (keto / vegan / Mediterranean / high-protein). (spec 8.1, 8.2)
- 🗺️ 7.4 Assign recipes/foods to upcoming days — multi-day meal plan (`meal_plans` table). (spec 8.3)
- 🗺️ 7.5 Grocery list generated from planned meals. (spec 8.4)
- 🗺️ 7.6 Weekly/monthly reports — avg calories, macro adherence, weight trend, logging streak. (spec 14.1)
- 🗺️ 7.7 Rule-based daily tips + pattern highlights (e.g. "sodium high on weekends"). (spec 14.2, 14.4)
- 🗺️ 7.8 Logging streaks + visual reward + gentle streak protection. (spec 15.1)
- 🗺️ 7.9 Gamification: badges / achievements / health score. (spec 15.4)

## 🔔 Phase 8 — Notifications & Reminders  ⬜ (new dep: `expo-notifications` — approve in-phase)
- 🗺️ 8.1 Meal-time + water reminders, user-configurable times. (spec 15.2, 12.3)
- 🗺️ 8.2 Goal-progress + milestone notifications. (spec 15.3)
- 🗺️ 8.3 Milestone-celebration push (pairs with 6.3). (spec 9.4)

## 🔐 Phase 9 — Privacy, Offline & Localization  ⬜ (cross-cutting, mostly code-only)
- 🗺️ 9.1 Data export (CSV/JSON of logs, weights, workouts). (cross-cutting: privacy)
- 🗺️ 9.2 Account-deletion flow + consent screen at signup. (cross-cutting: privacy)
- 🗺️ 9.3 Encryption-at-rest review + data-handling disclosures (Apple/Google). (cross-cutting: privacy)
- 🗺️ 9.4 Offline logging + sync-on-reconnect queue (AsyncStorage already installed). (cross-cutting: sync)
- 🗺️ 9.5 Multi-language i18n + RTL (catalog already exists; add locales). (cross-cutting: localization)
- 🗺️ 9.6 Accessibility labels + contrast/tap-target audit. (cross-cutting: accessibility)

## 🤖 Phase 10 — AI Differentiators  🔒 (new dep: Claude API + founder key)
- 🗺️ 10.1 AI photo meal logging — capture/select photo → identify items → estimate portion/cal/macros;
  editable line items; confidence indicator; multi-item plates + packaged-food handling; DB/barcode
  fallback on low confidence; **never silently trust — always allow edit**. (spec 6.1–6.4 + acceptance)
- 🗺️ 10.2 AI nutrition assistant/coach for questions. (spec 14.3)

## ⌚ Phase 11 — Health Platform & Wearables  🔒 (native modules + founder credentials / native build)
- 🗺️ 11.1 Apple Health + Google Health Connect (read activity/steps/weight; write nutrition/weight). (spec 11.1)
- 🗺️ 11.2 Wearables: Apple Watch / Fitbit / Garmin where feasible. (spec 11.2)
- 🗺️ 11.3 Companion Apple Watch / Wear OS app for quick logging + glance summaries. (spec 11.3)
- 🗺️ 11.4 Two-way sync where supported. (spec 11.4)
- 🗺️ 11.5 Auto-pull steps/activity into the day's budget. (spec 10.3)

## 💳 Phase 12 — Monetization & Launch Credentials  🔒 (founder credentials / native build)
- 🗺️ 12.1 RevenueCat live billing replacing the stub; webhook → SECURITY DEFINER; revoke stub RLS. (spec 16.2; old 4.4)
- 🗺️ 12.2 Premium monthly + annual + trial; honest, fixed pricing display in the paywall. (spec 16.2, 16.3)
- 🗺️ 12.3 Hype-song audio via custom dev client (failed twice in Expo Go — old 4.0). (roadmap 2.6/4.0)
- 🗺️ 12.4 Google / Apple OAuth completion (old 4.1).
- 🗺️ 12.5 Spotify SDK + Apple MusicKit streaming (old 4.2/4.3).

## Phase 13 — Scale & moat  ⬜ (future)
Community/social, advanced analytics, wearable/IoT expansion. Architected for in the data model.

---

## 🗂️ Feature-spec coverage map

Every sub-point of the 16-feature spec, with status and where it lives. **✅** = already built (QA in its
phase, not re-coded in the roadmap-rebuild pass). **🗺️** = scheduled gap (target phase shown).

### Feature 1 — Onboarding & Goal Setup
| Sub-point | Status | Where |
|---|---|---|
| Capture age/sex/height/weight/activity/goal | ✅ | `onboarding.tsx`, `0001_profiles.sql` |
| Optional target weight + weekly rate (0.25–1 kg/wk) | 🗺️ | Phase 5.4 |
| BMR + TDEE (Mifflin–St Jeor) → calorie budget | ✅ | `src/lib/science/{bmr,energy,engine}.ts` |
| Macro split presets (balanced/high-protein/low-carb/keto) | 🗺️ | Phase 5.3 |
| Units metric (kg/cm) ↔ imperial (lb/ft-in) | ✅ | `src/i18n/units.ts` |
| Units kcal ↔ kJ | 🗺️ | Phase 5.5 |
| Auto-recalc on weight/goal change | 🗺️ | Phase 5.6 (partial today; needs prompt) |
| **Adaptive TDEE** (intake vs actual weight change) | 🗺️ | Phase 6.4 |

### Feature 2 — Food Logging
| Sub-point | Status | Where |
|---|---|---|
| Meal slots breakfast/lunch/dinner/snack | ✅ | `0003_food_logs.sql`, `(tabs)/log.tsx` |
| Custom meal slots | 🗺️ | Phase 4.7 |
| Calories+macros per entry | ✅ | `log/add.tsx` |
| Adjustable serving/qty, multiple units (g/oz/cups/medium) | 🗺️ | Phase 4.6 (grams-only today) |
| Running total: consumed/remaining/per-meal | ✅ | `(tabs)/log.tsx` |
| Delete entries | ✅ | `features/log/queries.ts` |
| Edit + copy entries | 🗺️ | Phase 4.1 |
| Copy a previous day's meal / whole day | 🗺️ | Phase 4.2 |
| Log to any past/future date | 🗺️ | Phase 4.3 |
| Recently- & frequently-logged shortcuts | 🗺️ | Phase 4.4 |

### Feature 3 — Food Database + Barcode
| Sub-point | Status | Where |
|---|---|---|
| Searchable DB: common / branded / restaurant | ✅ | `staples.ts` + `openFoodFacts.ts` (restaurant partial → polish in 4.10) |
| Barcode scanner (UPC/EAN) | ✅ | `foods/scan.tsx` |
| Record name/brand/serving/cal/macros | ✅ | `0002_foods.sql` |
| Record micronutrient values | 🗺️ | Phase 4.9 (sugar/sodium/sat-fat); deeper micros Phase 5.11 |
| Search ranking: user history + verified first | 🗺️ | Phase 4.5 |
| Provenance / verified-or-hybrid model | 🗺️ | Phase 4.10 (source field exists ✅) |

### Feature 4 — Macronutrient Tracking
| Sub-point | Status | Where |
|---|---|---|
| Per-entry & per-day totals in grams | ✅ | `features/log/types.ts` |
| …and as % of daily target | 🗺️ | Phase 5.1 |
| Visual ring/bar charts on dashboard | 🗺️ | Phase 5.2 (calorie ring exists ✅) |
| User-adjustable macro goals | 🗺️ | Phase 5.3 |
| Macro-cycling / per-day overrides | 🗺️ | Phase 5.10 |

### Feature 5 — Extended Nutrient Tracking
| Sub-point | Status | Where |
|---|---|---|
| Fiber / sugar / sodium / saturated fat | 🗺️ | Phase 4.9 (fiber done ✅) |
| Micronutrients (vitamins/minerals/cholesterol/K) | 🗺️ | Phase 5.11 |
| Per-nutrient goals + over/under indicators | 🗺️ | Phase 5.7 (fiber goal done ✅) |
| Gate deep micronutrient reports behind premium | 🗺️ | Phase 5.11 |

### Feature 6 — AI Photo Meal Logging
| Sub-point | Status | Where |
|---|---|---|
| Photo → identify items → estimate portion/cal/macros | 🗺️ | Phase 10.1 |
| Editable line items before save | 🗺️ | Phase 10.1 |
| Multi-item plates + packaged + DB/barcode fallback | 🗺️ | Phase 10.1 |
| Confidence indicator + frictionless correction | 🗺️ | Phase 10.1 |

### Feature 7 — Custom Foods, Recipes & Saved Meals
| Sub-point | Status | Where |
|---|---|---|
| Create custom food items | ✅ | `foods/manual.tsx` |
| Build recipes from ingredients (auto per-serving) | 🗺️ | Phase 7.1 |
| Save meals (groups) for one-tap re-log | 🗺️ | Phase 7.2 |
| Favorites + recent/frequent surfacing | 🗺️ | Phase 4.8 / 4.4 |

### Feature 8 — Recipe Library & Meal Planning
| Sub-point | Status | Where |
|---|---|---|
| Recipe library + nutrition + one-tap log | 🗺️ | Phase 7.3 (16 fixed templates exist ✅) |
| Filter by diet type | 🗺️ | Phase 7.3 |
| Assign recipes/foods to upcoming days | 🗺️ | Phase 7.4 |
| Grocery list from planned meals | 🗺️ | Phase 7.5 |

### Feature 9 — Weight & Body Progress
| Sub-point | Status | Where |
|---|---|---|
| Log body weight + trend chart vs goal | 🗺️ | Phase 6.1 |
| Optional measurements (bf%/waist/chest) | 🗺️ | Phase 6.2 (bf% stored ✅, static) |
| Progress photos / private gallery / before-after | 🗺️ | Phase 6.8 |
| Milestone celebrations + projected completion date | 🗺️ | Phase 6.3 |

### Feature 10 — Activity / Exercise
| Sub-point | Status | Where |
|---|---|---|
| Log exercise → estimated calories burned | 🗺️ | Phase 6.5 (workout sets/reps exist ✅, no burn) |
| "Eat-back" burned-calories setting | 🗺️ | Phase 6.6 |
| Auto-pull steps/activity from health platforms | 🗺️ | Phase 11.5 |

### Feature 11 — Health Platform & Wearables
| Sub-point | Status | Where |
|---|---|---|
| Apple Health + Google Health Connect | 🗺️ | Phase 11.1 |
| Wearables (Apple Watch/Fitbit/Garmin) | 🗺️ | Phase 11.2 |
| Companion watch app | 🗺️ | Phase 11.3 |
| Two-way sync | 🗺️ | Phase 11.4 |

### Feature 12 — Water / Hydration
| Sub-point | Status | Where |
|---|---|---|
| Quick-add buttons + daily goal | 🗺️ | Phase 6.7 |
| Dashboard progress indicator | 🗺️ | Phase 6.7 |
| Reminder notifications | 🗺️ | Phase 8.1 |

### Feature 13 — Daily Dashboard
| Sub-point | Status | Where |
|---|---|---|
| Calories consumed / remaining / burned | 🗺️ | Phase 6.5 (consumed+remaining ✅; burned pending) |
| Macro rings/bars toward targets | 🗺️ | Phase 5.2 |
| Quick links: log / scan / photo / water / exercise | 🗺️ | Phase 5.8 (log ✅; photo Phase 10) |
| Today's meals grouped by slot on home | 🗺️ | Phase 5.8 (on Log tab today ✅) |
| Customizable widgets | 🗺️ | Phase 5.9 |

### Feature 14 — Insights, Trends & Coaching
| Sub-point | Status | Where |
|---|---|---|
| Weekly/monthly reports | 🗺️ | Phase 7.6 |
| Daily tips / coaching messages | 🗺️ | Phase 7.7 |
| AI assistant/coach | 🗺️ | Phase 10.2 |
| Pattern highlights | 🗺️ | Phase 7.7 |

### Feature 15 — Engagement Mechanics
| Sub-point | Status | Where |
|---|---|---|
| Logging streaks + reward + protection | 🗺️ | Phase 7.8 |
| Meal-time + water reminders | 🗺️ | Phase 8.1 |
| Goal-progress + milestone notifications | 🗺️ | Phase 8.2 |
| Gamification: badges / achievements / health score | 🗺️ | Phase 7.9 |

### Feature 16 — Freemium / Premium
| Sub-point | Status | Where |
|---|---|---|
| Free tier (core logging, tracking, DB/barcode) | ✅ | `features/billing/*`, `0008_subscriptions.sql` |
| Premium tier (monthly+annual+trial, reports, AI scans, exports) | 🗺️ | Phase 12.1/12.2 (stub today ✅) |
| Clear, honest, fixed pricing | 🗺️ | Phase 12.2 |

### Cross-cutting
| Sub-point | Status | Where |
|---|---|---|
| Accounts & cloud sync | ✅ | Supabase auth + RLS |
| Offline logging + sync-on-reconnect | 🗺️ | Phase 9.4 |
| Privacy: encryption in transit | ✅ | Supabase TLS |
| Privacy: encryption at rest / consent / disclosures | 🗺️ | Phase 9.3 |
| Privacy: data export | 🗺️ | Phase 9.1 |
| Privacy: account deletion | 🗺️ | Phase 9.2 |
| Onboarding speed to first log | ✅ | <2 min flow |
| Accessibility & localization (multi-language, a11y) | 🗺️ | Phase 9.5 / 9.6 (unit toggle + English catalog ✅) |

---

## Database migrations applied (production)

All **0001–0008** are live on `eeltroiupbgfgldburra.supabase.co`.

| File | Purpose | Phase |
|---|---|---|
| `0001_profiles.sql` | Profiles + RLS + signup trigger | 1 |
| `0002_foods.sql` | Foods catalog cache + RLS | 1 |
| `0003_food_logs.sql` | Food logs + RLS | 1 |
| `0004_workouts.sql` | Routines/days/exercises/workout_logs/set_logs + RLS | 2 |
| `0005_exercise_audio.sql` | exercise_audio + Storage bucket + RLS | 2 (audio → 12.3) |
| `0006_excludes_eggs.sql` | profiles.excludes_eggs | 2 |
| `0007_food_prices.sql` | food_prices community model + price snapshot | 3 |
| `0008_subscriptions.sql` | subscriptions + RLS (stub-only writes) | 3 |

**Planned new tables (each needs a migration with RLS, then founder applies to production):**
`food_logs` extended-nutrient columns (4.9), `weight_logs` (6.1), `body_measurements` (6.2),
`water_logs` (6.7), `recipes`/`recipe_ingredients` (7.1), `saved_meals` (7.2), `meal_plans` (7.4),
`favorites` (4.8), `streaks`/`achievements` (7.8/7.9).
