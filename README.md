# Vital

A science-backed health and fitness app — one place for nutrition tracking, training (later), and the published-evidence math behind both. Built on React Native + Expo + Supabase.

---

## Status

| Phase | What | State |
|---|---|---|
| **0** | Foundation (Expo + Supabase + Auth + Design system) | ✅ done |
| **1** | Nutrition core (onboarding, science, dashboard, foods, logging, plan, history) | ✅ done |
| 2 | Workout module + in-gym player + local audio | not started |
| 3 | Cost tracking + streaming music + freemium | not started |
| 4+ | Community, AI coach, wearables | future |

See `docs/ROADMAP.md` for the per-task breakdown.

---

## For AI agents reading this

**Before you touch anything, read these in order:**

1. **`docs/MASTER_PROMPT.md`** — the single source of truth for vision, science layer, tech stack, data model, and the phased roadmap. If anything in chat conflicts with this file, this file wins.
2. **`AI_RULES.md`** — the 13 operating rules every change must follow. Mirrored into `CLAUDE.md` (for Claude Code) and `.cursorrules` (for Cursor).
3. **`docs/METHODOLOGY.md`** — the citation-backed rulebook for every number in `/src/lib/science/`. Bump `METHODOLOGY_VERSION` whenever a constant changes.
4. **`docs/DECISIONS.md`** — running log of meaningful decisions (newest first).
5. **`docs/DATA_MODEL.md`** — high-level schema for Supabase tables.

**Then check `docs/ROADMAP.md`** to see what's done and what's next.

### Core principles (mirrored from AI_RULES.md)

- Do the minimum that satisfies the current task. No speculative features.
- One task at a time, matching the Phase / Task the founder names.
- TypeScript strict everywhere — no `any` without a justifying comment.
- Every function in `/src/lib/science/` must have a unit test with worked examples. Tests there are sacred.
- Supabase RLS enabled on every user-owned table. Users only ever see their own rows.
- Mobile-first, i18n-ready (string catalog in `src/i18n/strings.ts`).
- Small commits with clear messages.
- Never weaken a safety guardrail (calorie floor, max loss rate, medical disclaimer) to make a feature work.

---

## File map

```
/
├─ AI_RULES.md, CLAUDE.md, .cursorrules    AI operating rules (same content, three homes)
├─ docs/
│  ├─ MASTER_PROMPT.md       Source of truth — vision, stack, roadmap, science spec
│  ├─ METHODOLOGY.md         Layer-1 science rulebook with citations
│  ├─ DATA_MODEL.md          Table-by-table schema reference
│  ├─ ROADMAP.md             Phase / task status
│  └─ DECISIONS.md           Running log of meaningful decisions
├─ supabase/
│  └─ migrations/            *.sql migrations applied in numeric order
│     ├─ 0001_profiles.sql   user profile + RLS + auto-create trigger
│     ├─ 0002_foods.sql      global foods catalog cache + RLS
│     └─ 0003_food_logs.sql  per-user food logs + RLS
├─ src/
│  ├─ app/                   Expo Router file-based routes
│  │  ├─ index.tsx           Root redirect (signed-in → tabs, else → sign-in)
│  │  ├─ _layout.tsx         Root providers (Query, SafeArea, Gesture, Auth init)
│  │  ├─ (auth)/             Email sign-in / sign-up screens (group route)
│  │  └─ (app)/              Authenticated app surface
│  │     ├─ _layout.tsx      Auth gate + profile loader + onboarding gate
│  │     ├─ onboarding.tsx   Single-screen onboarding form
│  │     ├─ (tabs)/          Bottom tab bar (Home / Log / Plan / Profile)
│  │     ├─ foods/           Food search, barcode scan, food detail (modal-style)
│  │     └─ log/             Log add form + 7-day history (modal-style)
│  ├─ components/            Reusable UI primitives (Text, Button, Input, Card, etc.)
│  ├─ features/              Feature-scoped types + queries + stores
│  │  ├─ profile/            profile types + Supabase queries (camelCase ↔ snake_case)
│  │  ├─ food/               food cache types + queries
│  │  ├─ log/                food log types + queries + date helpers
│  │  └─ plan/               curated meal templates + plan generator
│  ├─ lib/
│  │  ├─ design/tokens.ts    Single source of truth for color / type / spacing
│  │  ├─ supabase/client.ts  Supabase client (returns null until .env is set)
│  │  ├─ api/                External APIs (Open Food Facts, bundled staples)
│  │  └─ science/            Pure math engine — bmr, energy, macros, matrix, bands
│  │     └─ __tests__/       100 unit tests with worked examples (Jest)
│  ├─ store/                 Zustand stores (auth, profile)
│  └─ i18n/
│     ├─ strings.ts          App-wide string catalog (single source for copy)
│     └─ units.ts            Metric ↔ imperial conversion helpers
└─ package.json, app.json, babel.config.js, metro.config.js, tailwind.config.js
```

---

## Tech stack (do NOT substitute without founder approval)

| Layer | Choice |
|---|---|
| App framework | React Native + Expo SDK 54, TypeScript strict |
| Navigation | Expo Router v6 (file-based + typed routes) |
| Styling | NativeWind v4 (Tailwind-for-RN) — tokens in `src/lib/design/tokens.ts` |
| Server state | TanStack Query |
| Local state | Zustand |
| Backend | Supabase (Postgres + Auth + Storage + Edge Functions later) — RLS on every user table |
| Camera / barcodes | expo-camera |
| Tests | Jest via jest-expo |

Full rationale lives in MASTER_PROMPT.md § 4.

---

## Quickstart (developer)

1. **Install Node 20+** and clone the repo.
2. `npm install`
3. Copy `.env.example` → `.env` and set:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` (the **publishable** key from Supabase API settings)
4. Apply the SQL migrations in `supabase/migrations/` in numeric order — paste each into the Supabase SQL Editor and run.
5. `npm start` — scan the QR with Expo Go on your phone.
6. `npm run typecheck` — strict TS check.
7. `npm test` — Jest suite (currently 100 tests).

---

## How features get added (the workflow)

For every new feature touching the science layer:

1. **Update `docs/METHODOLOGY.md`** first. Add the formula or change the threshold with a citation.
2. **Bump `METHODOLOGY_VERSION`** in `src/lib/science/constants.ts`.
3. **Update the code** in `/src/lib/science/`.
4. **Update the unit tests** with worked examples.
5. **Append one sentence to `docs/DECISIONS.md`** describing what changed and why.

For non-science features: just step 5 (decision log), code, tests where applicable, mobile-test on a real device.

---

## Disclaimers

This app provides general fitness and nutrition information — **not medical advice**. Always consult a qualified professional, especially during pregnancy, under 18, elderly, or while managing a medical condition. See MASTER_PROMPT.md § 11 for the safety, compliance, and privacy commitments.

---

## License

Private / unpublished. All rights reserved by the founder.
