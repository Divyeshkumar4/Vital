# Decisions log

One sentence per decision (per AI rule 13). Newest first.

- 2026-05-23 — Phase 0.1/0.4/0.5: scaffolded Expo SDK 51 + Expo Router v3 + NativeWind v4 + TypeScript strict; established a dark-default design system in `src/lib/design/tokens.ts` consumed by Tailwind and base components (`Text`, `Button`, `Input`, `Screen`).
- 2026-05-23 — Phase 0.2: wired `@supabase/supabase-js` with AsyncStorage session persistence; client returns `null` until `EXPO_PUBLIC_SUPABASE_URL`/`ANON_KEY` are set so the app boots before the founder creates the Supabase project.
- 2026-05-23 — Phase 0.3: scaffolded email sign-up / sign-in / sign-out screens; Google/Apple sign-in stubbed with an Alert because OAuth requires Supabase provider credentials (founder action).
- 2026-05-23 — i18n: chose a tiny hand-rolled `t()` helper over a full library for Phase 0; will swap for `i18next` when a second locale is added.
- 2026-05-23 — Established AI operating rules in `AI_RULES.md`, `CLAUDE.md`, `.cursorrules` mirrored from MASTER_PROMPT § 6.
