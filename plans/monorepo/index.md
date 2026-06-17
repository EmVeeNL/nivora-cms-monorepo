# Monorepo Setup

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

### 01-workspace-setup
1. `pnpm-workspace.yaml` — declare `apps/*` and `packages/*`
2. Root `package.json` — workspace root, shared devDependencies, scripts
3. Root `tsconfig.json` — base config (`strict`, `moduleResolution: bundler`); each package extends it
4. Root `biome.json` — shared lint/format rules for all packages
5. Root `vitest.config.ts` — workspace mode, per-package project references
6. `.gitignore` — node_modules, dist, .wrangler, generated files
7. `apps/admin/` skeleton — move current `src/` content into `apps/admin/src/`
8. `packages/` skeleton — empty dirs with stub `package.json` per package

### 02-gitflow-and-commits
1. Gitflow branch setup — create `develop` from `main`; document branch naming rules
2. Husky install — pre-commit and commit-msg hooks
3. commitlint config — enforce Conventional Commits format
4. PR template — standard PR checklist (tests pass, lint clean, version bump)

## Notes
- Current code in `src/` becomes `apps/admin/src/` — all existing `#/*` path aliases stay valid
- Current `plans/01-ui-kit-layout/` and `plans/02-module-system/` stay as-is (will be archived later)
- Wrangler config (`wrangler.jsonc`) moves to `apps/admin/`
- After setup, `pnpm --filter @nivora-cms/ui build` should work from repo root
