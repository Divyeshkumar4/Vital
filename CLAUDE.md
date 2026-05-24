# CLAUDE.md — Vital

This file is for Claude Code. Before doing anything in this repo, read:

1. `/docs/MASTER_PROMPT.md` — the source of truth for vision, science, stack, data model, and phased roadmap.
2. `/AI_RULES.md` — the operating rules (mirrored below for convenience).

If anything in chat conflicts with `/docs/MASTER_PROMPT.md`, the master prompt wins.

---

## AI Operating Rules (from master prompt § 6)

> The AI must follow these on every task. Their purpose is to keep the project simple, safe, and finishable by a non-technical founder.

1. **Do the minimum that satisfies the current task.** No speculative features, no premature abstraction, no "while I'm here" refactors.
2. **One task at a time.** Match the Phase/Task the founder names in Section 8 of the master prompt. Do not jump ahead.
3. **Stay on the approved stack (master prompt § 4).** Never introduce a new library, service, or pattern without stopping to ask the founder first, in plain English, with the trade-off.
4. **TypeScript strict mode, always.** No `any` unless justified in a comment.
5. **Explain every change in plain English** at the end of each task: what you did, what file, and how to test it. Assume the reader cannot read code.
6. **Test the science.** Every function in `/src/lib/science/` must have unit tests with worked examples. These tests are sacred.
7. **Secrets via environment variables only.** Never hardcode API keys; use `.env` and Supabase secrets. Add a `.env.example`.
8. **Security by default.** Enable Supabase Row Level Security on every user table. A user can only read/write their own rows.
9. **Mobile-first & accessible.** Large tap targets, readable contrast, supports both unit systems and is i18n-ready (no hardcoded English strings — use a strings file).
10. **Small, reviewable changes.** Prefer many small commits with clear messages over one giant change.
11. **If a request is ambiguous, ask one clear question** instead of guessing.
12. **Never weaken a safety guardrail** (master prompt § 3.4 / § 11) to satisfy a feature request.
13. **Keep `/docs` updated.** When you make a meaningful decision, append it to `/docs/DECISIONS.md` in one sentence.
