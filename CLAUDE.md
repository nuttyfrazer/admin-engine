# CLAUDE.md — @retail/admin-engine

Guidance for Claude Code in this repo. Read `README.md` for the full API/design; this file
is the working brief + standing rules.

## Purpose
Shared, **brand-agnostic** retail admin engine (blog + product logic) reused by **The Nutty
Squirrel** and **The Witty Badger** so the admin isn't built twice. Ships **TypeScript source**;
consumers add it to `transpilePackages` and link via `"@retail/admin-engine": "file:../admin-engine"`.
See memory `shared_backend_initiative`.

## Hard design rules (don't break)
- **No secrets, no env in this package.** Every function receives a Supabase client from the host;
  the host owns `brand → { url, service-role key, bucket }`. Never read `process.env` here.
- **Stateless.** Admin fns take a service-role client; public-read fns take an anon client and
  **never throw** — return `[]`/`null` on failure (uptime rule).
- RLS/`requireAdmin()` live in the **host** app, not here — but assume this code runs behind them;
  never add a path that would let an anon client write.

## Current state
- `blog` shipped (list/get/create/update/delete + published reads/slugs).
- Roadmap: `products/` (per-brand schema adapter — Nutty physical, Witty digital), `media/` upload helpers.
- Graduate from `file:` link → tagged installs (`github:nuttyfrazer/admin-engine#vX`) once stable.

## Build / verify
```bash
npm run build   # tsc -p tsconfig.build.json — type-checks; must pass before "done"
```

## Ways of working — standing rules (every session)
- **Secret safety is absolute** — never print/`cat`/`echo` an `.env`/key/token; test presence only.
  See global `~/.claude/CLAUDE.md`.
- **Git:** branch → PR → squash-merge → delete; never commit direct to `main`; pull latest first.
  See memory `git_workflow_preference`.
- **Dependencies:** keep fresh (esp. anything shared with the two Next.js hosts); check `npm outdated`
  at session start/end; majors behind a build check. See `dependency_freshness_preference`.
- **End-of-session CTO/pen-test sweep** across the repos — secure, safe, up-to-date, lint clean.
  See `end_of_session_security_sweep`.

## Learnings
- Because two live storefronts consume this by `file:` link, a breaking change here breaks **both**
  builds — bump carefully and build both hosts after a change to shared exports.
