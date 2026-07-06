# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

華圓覺苑 (HUA YUAN MONASTERY) temple website — a pnpm workspace monorepo on a Nuxt/Vite + Supabase stack. The migration from the legacy single-file HTML site is **complete** (cutover done, legacy files deleted); development is spec-driven via OpenSpec. Active change proposals live in `openspec/changes/<name>/` (`proposal.md`, `design.md`, `tasks.md` track progress); completed changes are archived under `openspec/changes/archive/`. No changes are currently active — main specs in `openspec/specs/` reflect the shipped state.

Note: the dharma-cms feature (法要管理 + `/dharma` page) was built and then **intentionally removed** (front, admin, and DB) — do not resurrect it; the archived change is history, not a roadmap.

**UI principle**: the old pixel-perfect 1:1 rule is retired, but new UI must strictly follow the existing visual style (colors, fonts, layout) — users should not perceive any difference when frameworks or new pages are introduced.

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
pnpm test           # unit tests (currently only packages/shared, Vitest)
pnpm test:e2e       # Playwright suites (see below)
```

Run a single unit test file:

```bash
pnpm --filter @huayuan/shared exec vitest run test/api.test.ts
```

E2E (Playwright, `playwright.config.ts`): projects `web`, `admin`, `rls`, `rwd`, `visual` under `e2e/`. By default they target the **production deployments** (`huayuan-web.vercel.app` / `huayuan-admin-delta.vercel.app`); override with `WEB_URL` / `ADMIN_URL` / `OLD_SITE_URL` env vars to test locally. Run one project: `pnpm test:e2e --project rls`.

Verification scripts (`scripts/`): `security-verify.sh` (anon-key RLS probe against every table), `edge-fn-verify.sh` (deployed Edge Function rejects unauthorized calls), `run-migration.sh`.

## Architecture

Three workspace packages plus Supabase backend assets:

- **`packages/shared` (@huayuan/shared)** — single source of truth consumed by both apps, shipped as raw TS (`main` points at `src/index.ts`; apps/web transpiles it via `build.transpile`). Contains:
  - `api/http.ts` — axios client for Supabase PostgREST, `ApiError` normalization, and a `LoadingTracker` (request-count subscription both UIs bind to).
  - `api/repositories.ts` — `createApi()` builds per-table repositories (generic `tableRepo` CRUD using PostgREST query syntax, `singletonRepo` for the fixed-id=1 `about`/`contact` tables).
  - `sanitize.ts` — `escapeHtml` and `resolveMapEmbedSrc` (Google Maps URL whitelist). See security invariants below.
  - `siteCopy.ts` — `SITE_COPY` typed key list for site copy (key/group/label/defaultValue) + `getCopy(rows, key)` (DB value || default). Adding editable copy = add a key here (defaults are the current hardcoded strings); keys are a literal union, so typos are compile errors. Functional text (loading states, validation, buttons) stays in code by spec.
  - `types.ts` — row types for all tables; `supabase.ts`; `storage.ts` (public URL helpers for the `pdfs` and `images` buckets, incl. `versionedStoragePublicUrl` for cache-busting).
- **`apps/web`** — Nuxt 3 public site. Pages use ISR 60s except `/signup` (no cache; live course state). The api client is created in a Nuxt plugin (`plugins/api.ts`) per-app instance — deliberately **not** a module-level singleton, which would leak/share LoadingTracker state across Nitro server requests. Config via `NUXT_PUBLIC_SUPABASE_URL` / `NUXT_PUBLIC_SUPABASE_ANON_KEY` (runtimeConfig). DB-driven content falls back to hardcoded copy when the DB value is empty (no blank sections); editable site copy goes through `useSiteCopy()` (composable over shared `SITE_COPY`/`getCopy`, backed by the `site_content` KV table).
  - `app/router.options.ts` exists because legacy pages were hash-anchored; check it before changing routes.
  - `/signup` accepts `?course=<id>` (course page's 報名 buttons) to skip course selection and open the form directly; without it (or if the course isn't 招生中) the selection step shows as before.
- **`apps/admin`** — Vite + Vue 3 SPA with Pinia and Vue Router. Auth via Supabase Auth email/password; `src/lib/api.ts` wires `createApi` with `getAccessToken` so requests carry the logged-in JWT and RLS authorizes by role. `src/lib/imageUpload.ts` does client-side canvas compression before upload (photos long edge 1600px, icons 256px; fixed storage key overwrite + `?v=<timestamp>` cache-bust) — all image uploads must go through it. Config via `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (see `.env.example` in each app; `.env` files are untracked).
- **`supabase/`** — `migrations/` (RLS policies, `profiles` role table, storage buckets) and `functions/admin-accounts/` (Deno Edge Function holding `service_role` to create/delete admin accounts; verifies caller is `super_admin` first).

Deployed as two separate Vercel projects: web (`huayuan-web.vercel.app`) and admin (`huayuan-admin-delta.vercel.app`), both from this repo (Root Directory `apps/web` / `apps/admin`). The repo is Git-connected, but Git-triggered deploys are blocked by Vercel's commit-author check (the repo's `git config user.email` doesn't match a team Git account) — deploy by manually triggering in the Vercel dashboard or `vercel deploy --prod --cwd apps/<app>`. DB migrations are applied by the user via the Supabase Dashboard SQL Editor (or `scripts/run-migration.sh`), recording each version in `supabase_migrations.schema_migrations`; agent SQL access is read-only.

## Security invariants (do not regress)

- **Role model**: `profiles.role` is `super_admin` | `admin`; RLS checks role, not mere login. Anonymous users can only `SELECT` published content, and on `registrations` only `INSERT` — never `SELECT` (personal data protection).
- **Storage buckets** (`pdfs`, `images`): public read, admin-role write only.
- **`service_role` never leaves the Edge Function.** Frontends only ever hold the publishable/anon key.
- **XSS**: any DB-sourced text inserted into the DOM goes through `escapeHtml`. `contact.map_embed` stores a URL (not HTML); iframes are only built from `resolveMapEmbedSrc`-validated whitelist URLs — never render stored HTML.
- The signup form includes anti-abuse (honeypot + rate limit) and a privacy-consent checkbox; keep both when touching it.
