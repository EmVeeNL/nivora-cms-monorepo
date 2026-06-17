# Monorepo Setup

> **Status: ✅ COMPLETE** — committed `bacc709` on `main` (2026-06-17)

Converts the current single-app repo into a pnpm workspace monorepo and establishes all root-level tooling, gitflow branches, and conventional commit hooks.

## Depends on
Nothing — this is the first step before any package work.

## Tech
- pnpm workspaces
- TypeScript (root tsconfig + per-package extension)
- Biome (root config shared by all packages)
- Vitest (root config with per-package projects)
- Husky + commitlint (gitflow + conventional commits enforcement)
- Wrangler (Cloudflare Workers CLI, root-level)

## Phases

### 01-workspace-setup ✅
1. ✅ `pnpm-workspace.yaml` — declare `apps/*` and `packages/*`
2. ✅ Root `package.json` — workspace root, shared devDependencies, scripts
3. ✅ Root `tsconfig.json` — base config (`strict`, `moduleResolution: bundler`); each package extends it
4. ✅ Root `biome.json` — shared lint/format rules for all packages
5. ✅ Root `vitest.config.ts` — workspace mode, per-package project references
6. ✅ `.gitignore` — node_modules, dist, .wrangler, generated files
7. ✅ `apps/admin/` skeleton — moved `src/` → `apps/admin/src/`; `apps/admin/package.json` + `tsconfig.json`
8. ✅ `packages/` skeleton — 11 stub `package.json` files (core, ui, admin, auth, content, editor, api, i18n, adapter-cloudflare, sdk, create-starter)

### 02-gitflow-and-commits ✅
1. ✅ Gitflow branch setup — `develop` created from `main`
2. ✅ Husky install — `commit-msg` hook wired
3. ✅ commitlint config — `commitlint.config.ts` enforcing Conventional Commits (100-char body lines)
4. ⬜ PR template — standard PR checklist (tests pass, lint clean, version bump)

## Notes
- Pre-monorepo state tagged `v0.1.0-pre-monorepo` for rollback
- `apps/admin` package name is `@nivora-cms/app-admin` (avoids clash with `packages/admin` → `@nivora-cms/admin`)
- Root `pnpm dev` proxies to `pnpm --filter @nivora-cms/app-admin dev`
- Wrangler Worker name changed from `tanstack-start-app` → `nivora-cms`
- `plans/01-ui-kit-layout/` and `plans/02-module-system/` retained (content will migrate to `packages/admin` Phase 01)
