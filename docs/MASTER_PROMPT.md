# PROJECT MASTER PROMPT — "VITAL" (working name)
### The All-in-One, Science-Backed Health & Fitness App
**Audience for this document:** AI coding assistants (Claude Code, Cursor, Antigravity) **and** the non-technical founder.
**Status:** Source of truth. If anything in a chat conflicts with this file, this file wins.

---

## 0. HOW TO USE THIS DOCUMENT (read this first — founder)

You are non-technical, so here is the simple workflow. You do not need to understand the code; you need to understand the *process*.

1. Create an empty project folder and open it in your AI tool (Cursor / Claude Code / Antigravity).
2. Save this file in the project as `/docs/MASTER_PROMPT.md`.
3. Also create a file called `AI_RULES.md` in the root (Section 6 below tells the AI to do this) — Cursor reads `.cursorrules`, Claude Code reads `CLAUDE.md`, so we keep one master and copy it.
4. Give the AI **one Phase and one Task at a time** (Section 8). Never say "build the whole app." Say: *"Read /docs/MASTER_PROMPT.md. We are on Phase 1, Task 1.2. Do only that task. Explain in plain English what you did."*
5. After each task, tell the AI: *"Run the app and show me it works before moving on."*

That's it. The rest of this document is the AI's instruction manual, written so it does not over-engineer or guess.

---

## 1. VISION & MISSION

**Mission:** Build the single, science-backed app where a person of any age manages their entire health routine — nutrition and training — and tracks it, replacing the need for 4–5 separate apps. Long-term goal: become the category-defining "all-in-one health" platform, eventually extending into connected hardware/gadgets.

**One-line positioning:** *"MyFitnessPal's tracking + a real coach's programming + your gym headphones, in one app — and every number is backed by published science."*

**Non-negotiable product principles:**
1. **Evidence first.** Every calculation cites a known, validated method (Section 3). No made-up math.
2. **Zero manual math for the user.** The app does the calories, macros, rest timers, progression — the user just acts.
3. **Global from day one.** Supports metric AND imperial; food data is worldwide.
4. **Lean to launch, architected to scale.** Ship a small, excellent core first; the foundation must hold 1M+ users without a rewrite.
5. **Safety over engagement.** Never push unhealthy deficits or behaviors (Section 11).

---

## 2. TARGET USERS

- **Beginners** who want to be told exactly what to eat and how to train.
- **Intermediate/advanced gym-goers** who want fast logging and smart programming.
- **All ages and both unit systems**, worldwide.

Design implication: progressive disclosure. A beginner sees a simple plan; an advanced user can open the details (macros breakdown, RIR, volume). Default to simple.

---

## 3. THE SCIENCE LAYER (the differentiator)

This is the moat. The detailed, citation-backed implementation spec lives in **`/docs/METHODOLOGY.md`** — that is the operational source of truth for every number in `/src/lib/science/`. The summary below names the methodology; the methodology document names the formulas, the published sources, and the version.

> **Process discipline:** any change to a formula, threshold, or default flows in this order — `METHODOLOGY.md` → version bump → code → tests. Code never disagrees with the methodology document, and the methodology document never invents numbers without a citation.

### 3.1 Resting metabolism (BMR)
- **Default:** Mifflin-St Jeor 1990 (`bmrMSJ`).
- **Alternatives offered:** Harris-Benedict revised (`bmrHB`) and Katch-McArdle when body-fat % is known (`bmrKM`).

### 3.2 Daily energy (TDEE)
`TDEE = BMR × activityFactor`. Activity factors: 1.2 / 1.375 / 1.55 / 1.725 / 1.9 (sedentary → extra active). See METHODOLOGY.

### 3.3 Goal calories
Deficit and surplus percentages are persona-aware (training / general / older / endurance) and capped:
- Self-directed deficit ≤ **25%**, supervised override up to **40%** (Iraki 2019, Slater 2019).
- Surplus ≤ **20%**.
- Defaults vary by persona; see methodology MATRIX.

### 3.4 SAFETY GUARDRAILS (mandatory — never bypass)
- Hard calorie floor: `max(BMR, conventional minimum)` where conventional minimum is **1,200 kcal/day (women)** and **1,500 kcal/day (men)**. If a goal falls below, clamp and surface a gentle explanation.
- Max recommended loss rate: **1% of body weight per week.** Block faster.
- Medical disclaimer (Section 11) on every results screen.

### 3.5 Macronutrients — persona × goal matrix
Protein, fat, and adjustment defaults are pulled from a **persona × goal matrix** (training / general / older / endurance × lose / maintain / gain), each cell sourced to primary literature (Morton 2018 BJSM; Helms 2014 JISSN; Wycherley 2012 AJCN; PROT-AGE Bauer 2013; ACSM/AND/DC 2016; etc.). Carbs fill the remainder subject to RDA floor (130 g) and activity-graded sport-nutrition floors. Diet-pattern adjustments: vegan +0.2 g/kg protein, vegetarian +0.1 g/kg (Pinckaers 2021). Fiber target: 14 g per 1,000 kcal (IOM DRI). Per-meal protein: age-graded 0.24 → 0.4 g/kg/meal across 18 → 65+. See METHODOLOGY for every cell.

> **Layer 2 (deferred):** pregnancy / lactation, GLP-1, CKD / dialysis, post-bariatric. Architected for in the engine but not wired into v1 onboarding.

### 3.6 Diet-plan generation (Phase 1)
Given goal calories + macro targets, generate a daily meal template (e.g., 3 meals + 1 snack split, configurable). Pull foods from the food database (Section 10) and assemble combinations that hit macro targets within a tolerance (±5–8%). Keep v1 rules-based and simple; AI-assisted meal suggestions can come later.

### 3.7 Workout programming
- **Beginner:** Full-body, 3×/week. Compound focus. Linear progression.
- **Intermediate:** Upper/Lower (4×) or Push/Pull/Legs.
- **Advanced:** PPL (6×) or body-part split.
- **Rep/rest by goal:** Strength 1–6 reps, 3–5 sets, rest 2–5 min · Hypertrophy 6–12 reps, 3–4 sets, rest 60–120 s · Endurance 12–20+ reps, rest 30–60 s.
- **Progressive overload:** track per-exercise history; suggest small increases (weight or reps) when last session's targets were met. Use RIR (Reps In Reserve) as the effort cue.
- Equipment-aware: every routine adapts to the equipment the user marks available (Section 9).
- Reference standards: ACSM guidelines and ISSN position stands. Cite the method in code comments.

---

## 4. TECH STACK (final — do NOT substitute without approval)

Chosen for four constraints at once: **one codebase for iOS + Android, buildable from a Windows laptop, free to start, scales to millions, and maximally AI-friendly** (TypeScript + React + SQL are the best-supported by AI codegen).

| Layer | Choice | Why |
|---|---|---|
| App framework | **React Native + Expo (managed)**, **TypeScript (strict)** | One codebase → iOS + Android. Huge AI training coverage. |
| iOS builds without a Mac | **EAS Build** (Expo's cloud) | Founder is on Windows; EAS compiles iOS in the cloud. |
| Navigation | **Expo Router** | File-based, simple, AI-friendly. |
| Styling | **NativeWind** (Tailwind for RN) | AI tools write Tailwind extremely well; consistent design. |
| Server state | **TanStack Query** | Caching, sync, offline-friendly. |
| Local/UI state | **Zustand** | Minimal boilerplate. |
| Backend (DB+Auth+Storage+Functions) | **Supabase** (PostgreSQL) | Free tier, relational DB (right fit for nutrition/training data), built-in auth, Row Level Security, file Storage (for audio), serverless Edge Functions. Open-source, scales, no NoSQL modeling pain. |
| Auth | **Supabase Auth** (email + Google/Apple sign-in) | Built in. |
| Barcode scan + camera | **expo-camera** | Scan food barcodes → Open Food Facts. |
| Local audio (Phase 2) | **expo-av / expo-audio** | Plays user-uploaded songs per exercise. |
| Streaming music (Phase 3) | **Spotify SDK + Apple MusicKit** | See Section 9 caveats. |
| Push notifications | **Expo Notifications** | Reminders, rest-day nudges. |
| Payments / freemium (Phase 3) | **RevenueCat** | Handles App Store + Play Store subscriptions; free under ~$2.5k/mo revenue. |
| Errors + analytics | **Sentry** + **PostHog** | Free tiers; product insight. |
| Version control / CI | **Git + GitHub** + **EAS Update** (OTA) | Backups, history, push fixes without app-store waits. |

**Explicitly NOT chosen (and why), so the AI doesn't drift:** Flutter (smaller AI codegen ecosystem, Dart), native Swift/Kotlin separate apps (two codebases, needs a Mac), Firebase (NoSQL gets messy for relational nutrition/training data; we want Postgres). If the AI wants to deviate, it must stop and ask the founder.

---

## 5. DATA MODEL (high-level — implement in Supabase/Postgres)

Core tables (the AI should generate proper SQL migrations + Row Level Security so each user only sees their own data):

- `profiles` — user id, age, sex, height, weight, unit_preference, activity_level, goal, dietary_prefs, target_calories, target_macros.
- `foods` — global catalog (synced from Open Food Facts / USDA): name, brand, barcode, serving sizes, calories, macros, source.
- `food_prices` — food_id, region/country, currency, price, source (`auto` | `manual`), submitted_by, verified_count. (Powers the cost feature + community prices.)
- `food_logs` — user_id, date, meal, food_id, quantity (snapshots calories/macros/price at log time).
- `diet_plans` / `plan_meals` — generated plans tied to a user's targets.
- `exercises` — global catalog (from open exercise DB): name, muscle groups, equipment, difficulty, instructions, media.
- `routines` / `routine_days` / `routine_exercises` — user's weekly split (Mon/Tue/… ), sets, reps, rest seconds, target RIR.
- `workout_logs` / `set_logs` — per-session, per-set actuals → drives progressive overload.
- `exercise_audio` — exercise_id (or routine_exercise_id), user_id, audio source (uploaded file in Supabase Storage OR streaming track URI), trigger = "on rest-timer end".
- `subscriptions` — RevenueCat sync (Phase 3).

Design rule: **log entries snapshot the values** (don't just reference the catalog), so historical logs stay correct if catalog data changes.

---

## 6. AI OPERATING RULES (paste these into `AI_RULES.md`, `CLAUDE.md`, and `.cursorrules`)

> **The AI must follow these on every task. Their purpose is to keep the project simple, safe, and finishable by a non-technical founder.**

1. **Do the minimum that satisfies the current task.** No speculative features, no premature abstraction, no "while I'm here" refactors.
2. **One task at a time.** Match the Phase/Task the founder names in Section 8. Do not jump ahead.
3. **Stay on the approved stack (Section 4).** Never introduce a new library, service, or pattern without stopping to ask the founder first, in plain English, with the trade-off.
4. **TypeScript strict mode, always.** No `any` unless justified in a comment.
5. **Explain every change in plain English** at the end of each task: what you did, what file, and how to test it. Assume the reader cannot read code.
6. **Test the science.** Every function in `/src/lib/science/` must have unit tests with worked examples. These tests are sacred.
7. **Secrets via environment variables only.** Never hardcode API keys; use `.env` and Supabase secrets. Add a `.env.example`.
8. **Security by default.** Enable Supabase Row Level Security on every user table. A user can only read/write their own rows.
9. **Mobile-first & accessible.** Large tap targets, readable contrast, supports both unit systems and is i18n-ready (no hardcoded English strings — use a strings file).
10. **Small, reviewable changes.** Prefer many small commits with clear messages over one giant change.
11. **If a request is ambiguous, ask one clear question** instead of guessing.
12. **Never weaken a safety guardrail** (Section 3.4 / Section 11) to satisfy a feature request.
13. **Keep `/docs` updated.** When you make a meaningful decision, append it to `/docs/DECISIONS.md` in one sentence.

---

## 7. REPO STRUCTURE & DOCS TO CREATE

```
/  (root)
├─ AI_RULES.md            (copy of Section 6)
├─ CLAUDE.md              (points to AI_RULES.md + MASTER_PROMPT.md)
├─ .cursorrules           (copy of Section 6)
├─ .env.example
├─ /docs
│   ├─ MASTER_PROMPT.md   (this file)
│   ├─ DATA_MODEL.md
│   ├─ ROADMAP.md
│   └─ DECISIONS.md       (running log of choices)
├─ /src
│   ├─ /app               (Expo Router screens)
│   ├─ /components        (reusable UI)
│   ├─ /lib
│   │   ├─ /science       (BMR, TDEE, macros, programming — PURE + TESTED)
│   │   ├─ /supabase      (client, queries)
│   │   └─ /api           (Open Food Facts, etc.)
│   ├─ /features          (nutrition, workout, audio, …)
│   ├─ /store             (Zustand)
│   └─ /i18n              (strings, units)
└─ /supabase
    └─ /migrations        (SQL schema + RLS)
```

---

## 8. PHASED ROADMAP (build in this order)

### PHASE 0 — Foundation (setup only)
- 0.1 Init Expo + TypeScript + Expo Router + NativeWind. Confirm it runs on a phone via Expo Go.
- 0.2 Create Supabase project; wire client; set up `.env`.
- 0.3 Auth: email + Google + Apple sign-in. Sign up / log in / log out.
- 0.4 Create the docs/rules files (Section 6 & 7). Set up GitHub repo.
- 0.5 Establish design system (colors, typography, spacing, components) — keep it clean and modern.

### PHASE 1 — LEAN MVP: Nutrition core (this is your first launchable app)
- 1.1 Onboarding: collect age, sex, height, weight, units, activity, goal.
- 1.2 Science engine: BMR → TDEE → goal calories → macros (Section 3), fully unit-tested. **Build this first; everything depends on it.**
- 1.3 Results dashboard: show daily calorie + macro targets with the safety guardrails.
- 1.4 Food database integration: search + barcode scan via **Open Food Facts** (global, free); cache to `foods`.
- 1.5 Food logging: log foods to meals; live daily totals vs targets.
- 1.6 Basic diet-plan generator (Section 3.6): a sample day hitting the targets.
- 1.7 History view: daily/weekly trends.
> **Ship Phase 1 to TestFlight / Play internal testing before starting Phase 2.**

### PHASE 2 — Workout module + in-gym player + local audio
- 2.1 Exercise library from an open exercise dataset (Section 10).
- 2.2 Routine generator by experience level (Section 3.7).
- 2.3 Equipment customization: user marks available gym equipment → routine adapts.
- 2.4 Weekly split assignment (Monday/Tuesday/… day-based routines).
- 2.5 **In-gym Workout Player:** open today's routine → guided, set-by-set; auto rest timer between sets; auto-log weights/reps; suggest next-session progression. Zero manual calculation.
- 2.6 **Local audio trigger:** user uploads a song (e.g., phonk) and assigns it to an exercise; it auto-plays when the rest timer ends and the next set begins. Files in Supabase Storage; played via expo-av.

### PHASE 3 — Cost tracking + streaming music + freemium
- 3.1 **Cost of eating:** show monthly and daily food spend.
    - Auto-pull prices where a free/regional source is available; **fallback and primary = community model**: users enter a food's price once (stored per region/currency, remembered), and other users see crowd-sourced prices to pick from. Show a "verified by N users" count.
- 3.2 **Streaming music (with caveats — implement carefully):** integrate Spotify SDK and Apple MusicKit so users can assign streamed tracks to exercises. **Caveat to surface to the founder:** requires the user to have a paid streaming account, is subject to each platform's API limits, and **reliable auto-play is restricted on iOS** by Apple's background-audio rules — so local audio (2.6) remains the dependable default and streaming is a "best effort" enhancement.
- 3.3 **Freemium:** integrate RevenueCat; define free vs premium (suggested: free = core tracking; premium = auto diet plans, advanced programming, cost analytics, unlimited custom audio).

### PHASE 4+ — Scale & moat (future)
Community/social, AI coach (LLM-assisted plans), wearable/IoT and connected-gadget integrations, advanced analytics. Architect now (clean data model, Edge Functions) so these slot in later.

---

## 9. KEY FEATURE NOTES

- **Day-based gym routine ("Monday routine"):** the player must require *no* user math — it shows the exact exercise, target sets/reps/weight, runs the rest timer automatically, and logs as you go.
- **Equipment adaptation:** store an equipment list per user; the routine generator filters/substitutes exercises to only what's available.
- **Audio trigger logic:** the assigned track fires on the **rest-timer-end → next-set-start** transition. Local files = reliable everywhere. Streaming = enhancement with the iOS caveat above.
- **Cost feature data flow:** prefer auto price → else community price suggestions → else manual entry (remembered). Always tie price to region + currency.

---

## 10. DATA SOURCES (free / open, fits global ambition)

- **Nutrition (primary):** **Open Food Facts** — open, global, free, barcode-friendly. **Supplement (US whole foods):** USDA FoodData Central. (Paid options like Nutritionix/Edamam can be added later if needed.)
- **Exercises:** an open exercise dataset (e.g., the public-domain open exercise DB on GitHub, or the wger open API) with muscle groups, equipment, and instructions.
- **Prices:** no reliable free global price API exists → use the **community + manual model** in 3.1, with optional regional auto-sources where available.

---

## 11. SAFETY, COMPLIANCE & PRIVACY (mandatory)

- **Medical disclaimer** on calculation/plan screens: this app provides general fitness and nutrition information, **not medical advice**; users should consult a qualified professional, especially if pregnant, under 18, elderly, or managing a medical condition.
- **Disordered-eating safeguards:** enforce calorie floors and max loss rate (3.4); never enable "extreme" modes; if a user sets alarming targets repeatedly, surface a supportive resources message rather than complying.
- **Privacy:** health data is sensitive. RLS on all user data, encryption in transit, clear privacy policy, and store-required data-handling disclosures (Apple App Privacy + Google Data Safety).
- **Licensing/IP:** for music, only let users play audio they own/uploaded (local) or stream via official SDKs; never bundle copyrighted tracks.

---

## 12. BUDGET REALITY (honest expectations)

- **Free to build & test:** Expo, Supabase free tier, GitHub, Open Food Facts, EAS Build free tier (limited monthly builds), Sentry/PostHog free tiers.
- **To publish:** Apple Developer Program **$99/year**, Google Play **$25 one-time**.
- **As you scale:** Supabase Pro (~$25/mo) when you outgrow free; EAS paid plan for more builds; API/storage costs grow with users. None needed for v1 testing.

---

## 13. DEFINITION OF DONE (quality bar per task)

A task is done only when: it runs on a real phone via Expo, the science (if any) has passing unit tests, user data is protected by RLS, secrets are in env vars, strings are i18n-ready, and the AI has written a plain-English summary of what changed and how to test it.

---

## 14. MINI-GLOSSARY (founder)

- **Expo / React Native:** the tool that lets one codebase become both an iPhone and Android app.
- **EAS Build:** Expo's cloud that compiles your iPhone app so you don't need a Mac.
- **Supabase:** your cloud database + login system + file storage, free to start.
- **RLS (Row Level Security):** the rule that stops user A from ever seeing user B's data.
- **Migration:** a versioned change to the database structure.
- **OTA update:** push a fix to users instantly without waiting for app-store review.
- **Freemium / RevenueCat:** free app with a paid upgrade; RevenueCat handles the billing.

---

### THE STARTING INSTRUCTION TO GIVE YOUR AI
> "Read `/docs/MASTER_PROMPT.md` and create `AI_RULES.md`, `CLAUDE.md`, and `.cursorrules` from Section 6. Then begin **Phase 0, Task 0.1 only**. Follow the AI Operating Rules. When done, explain in plain English what you did and how I test it. Do not start the next task until I say so."
