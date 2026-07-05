# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

華圓覺苑 (HUA YUAN MONASTERY) temple website — a pnpm workspace monorepo mid-migration from three legacy single-file HTML pages (`index.html`, `admin.html`, `signup-form.html` at repo root) to a Nuxt/Vite + Supabase stack. The migration is spec-driven via OpenSpec: the active change lives in `openspec/changes/refactor-to-nuxt-vite-with-security/` (`proposal.md`, `tasks.md` track progress). Two governing principles for the migration: **functionality 1:1** and **UI 1:1** with the legacy HTML — the legacy files are the source of truth until cutover; any visible difference is a bug. Do not delete the legacy HTML files until task 8.6 (DNS cutover) completes.

All commits, code comments, and docs are written in Traditional Chinese (zh-TW).

## Commands

Requires Node >= 22 and pnpm (see `packageManager` in package.json). Run `pnpm install` at the repo root.

```bash
pnpm dev:web        # Nuxt dev server (apps/web, public site)
pnpm dev:admin      # Vite dev server (apps/admin, admin console)
pnpm build:web / pnpm build:admin
pnpm lint           # ESLint (flat config at eslint.config.mjs)
pnpm format         # Prettier check; format:fix to write
pnpm typecheck      # all packages (nuxt typecheck / vue-tsc / tsc)
pnpm test           # all packages with a test script (currently only shared)
```

Run a single test file (tests are Vitest, in `packages/shared/test/`):

```bash
pnpm --filter @huayuan/shared exec vitest run test/api.test.ts
```

Verify the deployed Edge Function rejects unauthorized calls:

```bash
SUPABASE_URL=... SUPABASE_ANON_KEY=... ./scripts/edge-fn-verify.sh
```

## Architecture

Three workspace packages plus Supabase backend assets:

- **`packages/shared` (@huayuan/shared)** — single source of truth consumed by both apps, shipped as raw TS (`main` points at `src/index.ts`; apps/web transpiles it via `build.transpile`). Contains:
  - `api/http.ts` — axios client for Supabase PostgREST, `ApiError` normalization, and a `LoadingTracker` (request-count subscription both UIs bind to).
  - `api/repositories.ts` — `createApi()` builds per-table repositories (generic `tableRepo` CRUD using PostgREST query syntax, `singletonRepo` for the fixed-id=1 `about`/`contact` tables).
  - `sanitize.ts` — `escapeHtml` and `resolveMapEmbedSrc` (Google Maps URL whitelist). See security invariants below.
  - `types.ts` — row types for all tables; `supabase.ts`, `storage.ts` (`pdfs` bucket URLs).
- **`apps/web`** — Nuxt 3 public site. Pages use ISR 60s except `/signup` (no cache; live course state). The api client is created in a Nuxt plugin (`plugins/api.ts`) per-app instance — deliberately **not** a module-level singleton, which would leak/share LoadingTracker state across Nitro server requests. Config via `NUXT_PUBLIC_SUPABASE_URL` / `NUXT_PUBLIC_SUPABASE_ANON_KEY` (runtimeConfig).
  - `app/router.options.ts` exists because legacy pages were hash-anchored; check it before changing routes.
- **`apps/admin`** — Vite + Vue 3 SPA with Pinia and Vue Router. Auth via Supabase Auth email/password; `src/lib/api.ts` wires `createApi` with `getAccessToken` so requests carry the logged-in JWT and RLS authorizes by role. Config via `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (see `.env.example` in each app; `.env` files are untracked).
- **`supabase/`** — `migrations/` (RLS policies, `profiles` role table, storage bucket) and `functions/admin-accounts/` (Deno Edge Function holding `service_role` to create/delete admin accounts; verifies caller is `super_admin` first).

Deployment target is two separate Vercel projects (web + admin on an `admin.*` subdomain) — not yet set up (tasks 7.2–7.4 open).

## Security invariants (from the active OpenSpec change — do not regress)

- **Role model**: `profiles.role` is `super_admin` | `admin`; RLS checks role, not mere login. Anonymous users can only `SELECT` published content, and on `registrations` only `INSERT` — never `SELECT` (personal data protection).
- **`service_role` never leaves the Edge Function.** Frontends only ever hold the publishable/anon key.
- **XSS**: any DB-sourced text inserted into the DOM goes through `escapeHtml`. `contact.map_embed` stores a URL (not HTML); iframes are only built from `resolveMapEmbedSrc`-validated whitelist URLs — never render stored HTML.
- The signup form includes anti-abuse (honeypot + rate limit) and a privacy-consent checkbox; keep both when touching it.
