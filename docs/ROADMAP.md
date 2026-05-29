# Roadmap

Mirror of `MASTER_PROMPT.md` § 8 with status. Update as tasks complete.

Legend: ✅ done · 🟡 in progress · ⬜ not started · 🔒 blocked on founder · ⏸ deferred by design

---

## 👉 Pickup point for the next AI agent (2026-05-29, updated — pre-Phase-4 essentials pass)

**2026-05-29 essentials pass** (branch `claude/confident-brahmagupta-0ewOC`): before starting credential-gated Phase 4, hardened the existing app — (1) added the mandatory medical disclaimer to Home/Plan/onboarding, (2) moved ~20 hardcoded strings into the i18n catalog, (3) added a forgot-password flow (email-OTP recovery; **founder must add `{{ .Token }}` to the Supabase Reset-Password email template**), (4) wired the 1%/week max loss-rate safety guardrail into the science engine. Equipment customization (2.3) deferred again. tsc clean; 126 tests pass. See DECISIONS 2026-05-29.

**Where we are:** Phase 0, 1, 2 (minus 2.6), and **Phase 3** are complete on branch `claude/affectionate-lamport-d5JCe` (draft PR #4). Phase 3.1 cost-of-eating is live with community pricing. Phase 3.2 freemium gating scaffold is live with a stub purchase flow — RevenueCat live billing moved to the new Phase 4.

**Phase 2.6 (hype-song audio) was re-enabled this session, tested by the founder on a real iPhone, FAILED AGAIN (silent), and re-deferred.** `HYPE_SONG_ENABLED` is back to `false` in `src/app/(app)/workout/player.tsx`. The expo-audio + expo-file-system code in `src/lib/audio/playback.ts` is intentionally kept — it's the second attempt's groundwork for the next AI. Task is now **Phase 4.0**. Read DECISIONS 2026-05-28 second entry before touching audio.

**Migrations that need to be applied to production Supabase (`eeltroiupbgfgldburra`):**
- `supabase/migrations/0007_food_prices.sql`
- `supabase/migrations/0008_subscriptions.sql`

**What to do next, in order:**
1. **Get founder confirmation that the rest of PR #4 (cost + freemium) is working on their iPhone**, then mark PR #4 ready for review and squash-merge to `main`. The hype-song UI is hidden via the flag, so the rest of the app is fully usable as-is.
2. **Phase 4.0 (audio).** Cut a new branch. Do NOT just retry the same approach — that's now failed twice. Start by building a **custom dev client** with `npx expo prebuild` + `eas build --profile development --platform ios` and testing the existing playback code there before changing any code. If still silent in a custom dev client, swap to `react-native-track-player`. Cross-test on Android in parallel to isolate whether this is iOS-specific.
3. **Phase 4.1–4.4** (OAuth, Spotify, MusicKit, RevenueCat live billing) — each blocked on founder-supplied credentials. Document what's needed per task before starting.
4. Phase 5 (Scale & moat) — future.

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
- ✅ 0.3 Auth — email sign-up / sign-in / sign-out + **forgot-password (email-OTP recovery)** working end-to-end (2026-05-29; needs Supabase Reset-Password template to include `{{ .Token }}`)
- ⏸ 0.3 Auth — Google / Apple OAuth (deferred — needs provider credentials from founder, then wire `expo-auth-session`)
- ✅ 0.4 Docs scaffolding + GitHub repo
- ✅ 0.5 Design system (tokens in `src/lib/design/tokens.ts` + base components)

## Phase 1 — Lean MVP: Nutrition core
- ✅ 1.1 Onboarding — single scrollable form (age/sex/units/height/weight/body-fat/activity/persona/endurance/diet/goal) → Supabase `profiles` table with full RLS
- ✅ 1.2 Science engine — Layer 1 of `docs/METHODOLOGY.md` (FuelWise v8.20 derived): persona × goal matrix, MSJ/HB/KM BMR, calorie caps 25%/40%/20%, **1%/week max loss-rate clamp (§4.5, wired 2026-05-29)**, per-meal protein age-graded, fiber 14 g/1000 kcal, activity-graded carb floors, BMI / BF% bands (incl. Asian). 126 unit tests with worked examples.
- ✅ 1.3 Results dashboard — calorie target, macro bars, per-meal protein, fiber, BMI / BF% bands, safety warnings filtered to actionable only
- ✅ 1.4 Open Food Facts integration — search + barcode scan via `expo-camera`; `foods` cache table with RLS; bundled common-foods staples library (62 generic foods) merged into search; clean scanner error UX
- ✅ 1.5 Food logging — `food_logs` table with full RLS; logging form with auto-suggested meal slot from time-of-day; today's totals on dashboard with progress bars; today's log screen grouped by meal with delete
- ✅ 1.6 Diet-plan generator — 16 hand-curated meal templates (Indian + Western), scaled per-meal to the user's macros via weighted-distance ranking; one tab in the app
- ✅ 1.7 History view — last 7 days with daily totals + on-target / over / under colour pills

**Phase 1 extras (delivered on top of the master prompt spec):**
- Bottom tab bar navigation (Home / Log / Plan / Profile)
- Common-foods staples library (Indian + Western, 62 items)

## Phase 2 — Workout + in-gym player + local audio  🟡 (2.6 re-deferred — moved to Phase 4.0)
- ✅ 2.1 Exercise library — 60-exercise curated bundle in `src/lib/api/exercises.ts` with muscle groups / equipment / difficulty / instructions
- ✅ 2.2 Routine generator — 3 templates (beginner full-body / intermediate U-L / advanced PPL), goal-aware (strength / hypertrophy / endurance) rep schemes via science layer
- 🟡 2.3 Equipment customization — basic ("training type" + goal) in setup screen; full equipment-availability filtering with substitutions deferred
- ✅ 2.4 Weekly split assignment — day-based (weekday 0–6) on `routine_days`; tab + dashboard auto-detect today
- ✅ 2.5 In-gym Workout Player — guided set-by-set with rest timer countdown; RIR-aware progression suggestion prefilled; auto-log weight / reps / RIR; auto-advance to next set; finish-and-end flow
- 🟡 2.6 Local audio trigger — **deferred again 2026-05-28** after second attempt (expo-av → expo-audio + pre-download to file://) also failed to produce audio on real iPhone in Expo Go. Moved to **Phase 4.0**. All supporting infra (table, bucket, RLS, FREE_LIMITS gate, player UI behind `HYPE_SONG_ENABLED`) remains in place. The next AI must NOT retry without first reading DECISIONS 2026-05-28 second entry — likely needs a custom dev client (out of Expo Go) or a swap to react-native-track-player.

## Phase 3 — Cost tracking + freemium gating  ✅
- ✅ 3.1 Cost of eating — `food_prices` table (community model: read-all-authenticated, insert/update-own); region + currency on `profiles`; price/currency snapshot on `food_logs`; optional price input on the log screen with median community suggestion; Home card showing today's spend + 7-day average; 30-day Cost month screen
- ✅ 3.2 Freemium gating scaffold — `subscriptions` table with read-own / insert+update-own restricted to source='stub' RLS; `useBilling` Zustand store; reusable `Paywall` modal; gates wired on cost month view, workout setup advanced tier, plan-tab extra meal options, hype-song count cap. **Live billing deferred to Phase 4 (RevenueCat needs founder credentials).**

## Phase 4 — Credentialed launch + deferred audio  ⬜ (founder-action / native-build gated)
- ⬜ 4.0 Hype-song audio playback (second deferral). Two playback paths have failed in Expo Go on real iPhone: original `expo-av` + Supabase signed URL, then `expo-audio` + `expo-file-system` pre-download to `file://`. Next AI: do NOT just retry — read DECISIONS 2026-05-28 second entry first. Likely needs (a) custom dev client (`npx expo prebuild` + `eas build --profile development`) to escape Expo Go's audio quirks, (b) swap to `react-native-track-player` which has more proven iOS audio routing, or (c) test on Android first to isolate iOS-specific failure.
- ⬜ 4.1 Google / Apple OAuth completion — needs provider credentials in Supabase, then wire `expo-auth-session`
- ⬜ 4.2 Spotify SDK streaming music — needs Spotify developer app + paid user account; iOS background-audio caveat in master prompt § 9
- ⬜ 4.3 Apple MusicKit streaming music — needs Apple Developer Program + MusicKit identifier
- ⬜ 4.4 RevenueCat live billing — replace Phase 3.2 stub with the RevenueCat SDK + webhook flow; revoke the v1 stub RLS policies in `0008_subscriptions.sql` and re-route subscription writes through a SECURITY DEFINER function

## Phase 5 — Scale & moat  ⬜
Community / social, AI coach (LLM-assisted plans), wearable / IoT integrations, advanced analytics. Architected for in the data model now (clean tables, edge functions later) so they slot in cleanly.

---

## Database migrations applied (production)

In numeric order, all live on `eeltroiupbgfgldburra.supabase.co`:

| File | Purpose | Phase |
|---|---|---|
| `0001_profiles.sql` | User profile + RLS + auto-create trigger on signup | 1.1 |
| `0002_foods.sql` | Global foods catalog cache + RLS | 1.4 |
| `0003_food_logs.sql` | Per-user food logs + RLS (full CRUD on own rows) | 1.5 |
| `0004_workouts.sql` | routines + routine_days + routine_exercises + workout_logs + set_logs + RLS | 2.1–2.5 |
| `0005_exercise_audio.sql` | exercise_audio table + RLS + private `exercise-audio` Storage bucket + own-files-only storage policies | 2.6 |
| `0006_excludes_eggs.sql` | profiles.excludes_eggs boolean (pure-vegetarian flag) | 2 bug-fix |
| `0007_food_prices.sql` ⚠️ **not yet applied** | food_prices table + RLS; profiles.region/currency; food_logs.price_at_log/currency_at_log snapshot | 3.1 |
| `0008_subscriptions.sql` ⚠️ **not yet applied** | subscriptions table + RLS (read-own; insert/update-own restricted to source='stub') | 3.2 |

Phase 2 stores exercises in code (`src/lib/api/exercises.ts`) rather than a Supabase table — referenced from `routine_exercises.exercise_id` by stable text id. User-defined exercises (if ever needed) will go in a separate `user_exercises` table later.
