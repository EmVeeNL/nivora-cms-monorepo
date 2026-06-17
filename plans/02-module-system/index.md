# Project: Module System

## Overview
Establishes the pluggable module architecture for NIVORA CMS. Every feature area (blog, users, settings, etc.) will live in a self-contained module — either an npm package under `@nivora-cms/` or a local override in `src/modules/*`. This plan defines the type system, the auto-discovery + registry generator, admin route injection into TanStack Router, i18n file collection, and the first concrete module (`core`).

## Goals
- Define a fully-typed `ModuleConfig` interface and `defineModuleConfig` helper that every module uses
- Build a generator script that auto-discovers npm `@nivora-cms/*` packages and `src/modules/*` locals, handles `extends` deep-merges, and emits `src/core/module-registry.gen.ts`
- Inject module admin routes into TanStack Router programmatically (no file copying)
- Collect per-module i18n messages into a merged output ready for a future Paraglide integration
- Scaffold the `@nivora-cms/core` module as the reference implementation

## Success Criteria
- [ ] `defineModuleConfig({...})` enforces the full `ModuleConfig` type at compile time
- [ ] Running `pnpm generate-modules` produces a valid `src/core/module-registry.gen.ts`
- [ ] A local module with `extends: '@nivora-cms/core'` deep-merges with the base config correctly
- [ ] The core module's admin route renders at `/` via programmatic `createRoute()` injection
- [ ] `pnpm collect-i18n` merges all module `i18n/en.json` files into `src/i18n/merged/en.json`
- [ ] `src/modules/core/` follows the full module directory structure
- [ ] Unit tests for merge logic pass: `pnpm test`
- [ ] `pnpm lint` and `pnpm build` pass with zero errors

## Scope

### In Scope
- TypeScript type system (`ModuleConfig`, `SettingsField`, `SidebarGroup`, `DashboardWidget`, etc.)
- `defineModuleConfig` typed helper and `deepMergeModuleConfig` utility
- Generator script (`scripts/generate-modules.ts`) and Vite plugin watcher
- Generated `src/core/module-registry.gen.ts` (parallel to `routeTree.gen.ts`)
- Programmatic admin route injection into `src/router.tsx`
- i18n message collection script (`scripts/collect-i18n.ts`)
- `src/modules/core/` — full directory structure, `nivora.config.ts`, `i18n/en.json`, admin route, permissions skeleton
- New commit scopes added to AGENTS.md
- New dev dependencies: `tsx`, `fast-glob`

### Out of Scope
- Paraglide installation and message compilation (next plan)
- API route wiring to the server/Worker entry (content API plan)
- RBAC enforcement — `permissions.ts` is defined per-module but not enforced yet
- Publishing `@nivora-cms/*` packages to npm
- Any content models or actual CMS data
- Settings UI (settings page is a later plan)
- Dashboard widget rendering (widgets config defined; rendering is a later plan)

## Status
Status: Planned
Progress: 0%

## Milestones
| Milestone | Status | Due |
|-----------|--------|-----|
| Type system + defineModuleConfig + merge utility | Planned | — |
| Registry generator + Vite plugin watcher | Planned | — |
| Admin route injection | Planned | — |
| i18n collection | Planned | — |
| Core module scaffold | Planned | — |
| Tests | Planned | — |

## Architecture

### Module sources
Two sources are scanned at generation time:
1. `node_modules/@nivora-cms/*/nivora.config.{ts,js,mjs}` — installed npm packages
2. `src/modules/*/nivora.config.ts` — local source modules

### Overwrite / extend semantics
- If a local module's `name` matches an installed npm package name → it replaces that package in the registry and deep-merges config from it
- If a local module has an explicit `extends` field → same replacement + merge, regardless of `name`
- Merge strategy per field:
  - `sidebar` — groups merged by `group` label; items within a group are concatenated
  - `settings.fields` — merged by `key`; local overrides base field with same key or adds new
  - `dashboard.widgets` — merged by `id`
  - `dashboard.components` — merged by `id`
  - `emails` — merged by `id`
  - `middleware` — arrays concatenated (local runs after base)
  - `overwrites` — shallow object merge
  - `routes` — local replaces base entirely (you own the full route tree)
  - `search` — local replaces base
  - `database` — path strings replaced; migration/seed ordering is controlled by filename prefix

### Registry generator
`scripts/generate-modules.ts` runs via `tsx`. It:
1. Uses `fast-glob` to find all module config files
2. Dynamically imports each `nivora.config.ts` using `import()` (tsx handles TS)
3. Applies `deepMergeModuleConfig` for extended modules
4. Emits `src/core/module-registry.gen.ts` — a static TypeScript file with explicit imports (never JSON, always typed)

`vite/plugins/modules.ts` wraps the generator:
- `buildStart` hook: spawns generator
- `configureServer` hook: watches `src/modules/*/nivora.config.ts` and re-runs generator on change, triggering HMR full-reload

### Admin route injection
Module admin routes use `createRoute()` (not `createFileRoute`). Each module's `routes/admin/index.ts` exports a factory:
```ts
export const adminRouteFactory = (parentRoute: AnyRoute) =>
  createRoute({ getParentRoute: () => parentRoute, path: '/[module-path]', ... })
```

The generated registry exports `adminRouteFactories`. `src/router.tsx` is updated to import these and assemble the route tree by calling each factory with the `_app` layout route as the parent, then passing all children to `AppRoute.addChildren([AppIndexRoute, ...moduleRoutes])`.

### i18n collection
`scripts/collect-i18n.ts` scans all module `i18n/*.json` files, namespaces keys by module name (`core.dashboard.title`), merges, and writes to `src/i18n/merged/<locale>.json`. Paraglide will read from this directory in a future plan.

## Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| TanStack Router type system breaks when mixing file-based + programmatic routes | High | Keep `routeTree.gen.ts` for type augmentations; build tree manually in `router.tsx` from raw route imports |
| `tsx` dynamic import of `nivora.config.ts` fails for npm packages (compiled JS) | Medium | Generator tries `.ts` first, falls back to `.js`/`.mjs` |
| `fast-glob` does not scan inside `node_modules` by default | Low | Pass `{ dot: true, ignore: [] }` options; filter to `@nivora-cms/` prefix explicitly |
| Deep-merge produces unexpected results for complex configs | Medium | Thorough unit tests in TASK-006; merge logic is explicit, not recursive black-box |

## Dependencies
- Plan 01 (UI kit) — `Done`; `src/routes/_app.tsx` and `src/routes/_app/index.tsx` exist and are the migration target for the core module

## Decisions

### 2026-06-17
- **Generated file over virtual Vite module** — mirrors how `routeTree.gen.ts` works; transparent, debuggable, no complex Vite internals
- **Factory pattern for admin routes** — `(parentRoute: AnyRoute) => RouteDefinition` avoids the factory needing the parent at definition time; enables lazy loading via `lazyRouteComponent`
- **Auto-overwrite by name match** — if local `name === npm package name`, replace is implicit; `extends` is for custom-named overwrites only
- **`routes` config = full replacement on extend** — modules own their full route tree; partial route merging would require knowing route IDs upfront
- **Paraglide wiring deferred** — i18n collection runs now; Paraglide compilation comes in the i18n plan
- **RBAC deferred** — `permissions.ts` file is scaffolded per module; enforcement comes in the permissions plan
- **tsx over ts-node** — faster, ESM-native, no config needed; already compatible with Vite 8 ecosystem
- **`@nivora-cms/` namespace** — all module npm packages use this prefix; local modules use the same namespace for their `name` field

## Task Summary

| ID | Title | Status | Priority | Owner |
|----|-------|--------|----------|-------|
| TASK-001 | Module type system + defineModuleConfig + merge utility | Planned | Critical | Team |
| TASK-002 | Registry generator script + Vite plugin watcher | Planned | Critical | Team |
| TASK-003 | Admin route injection into TanStack Router | Planned | High | Team |
| TASK-004 | i18n message collection pre-build step | Planned | Medium | Team |
| TASK-005 | Core module scaffold (`@nivora-cms/core`) | Planned | High | Team |
| TASK-006 | Tests — merge logic + generator output | Planned | Medium | Team |

## Task Links
- [TASK-001](tasks/TASK-001.md)
- [TASK-002](tasks/TASK-002.md)
- [TASK-003](tasks/TASK-003.md)
- [TASK-004](tasks/TASK-004.md)
- [TASK-005](tasks/TASK-005.md)
- [TASK-006](tasks/TASK-006.md)

## Test Strategy

### Unit Tests
- `deepMergeModuleConfig` — all merge strategies, edge cases (empty arrays, missing fields, key collisions)
- `defineModuleConfig` — compile-time type tests (tsd or `@ts-expect-error` assertions)
- Generator output shape — run generator in a temp fixture dir, assert the generated file contains expected imports

### Integration Tests
- Full round-trip: fixture module with `extends` → generator runs → registry has merged config → route appears in assembled router

### Manual Tests
1. `pnpm dev` — confirm no console errors
2. Navigate to `/` — confirm dashboard home still renders (core module admin route)
3. Add a fixture module to `src/modules/`, run `pnpm generate-modules`, confirm registry is updated without restarting dev server

## Deployment Plan
1. All task branches squash-merged to `plan/02-module-system`
2. `plan/02-module-system` → `main` via PR, tagged `v0.2.0`

## Rollback Plan
1. Revert `plan/02-module-system` PR from `main`
2. `src/core/` and `src/modules/` directories are new — no existing files are deleted by this plan (only `src/routes/_app/index.tsx` is migrated in TASK-005; the original is preserved as a git history reference)

## Documentation
- `AGENTS.md` updated with new commit scopes (`modules`, `router`, `i18n`) and module structure conventions
- `src/core/module/types.ts` serves as the canonical API reference for module authors

## Open Questions
- None — all design decisions resolved before plan generation

## Change Log

### 2026-06-17
- Plan created
- Admin route strategy: programmatic `createRoute()` factories (option C confirmed by user)
- Overwrite strategy: extend + deep-merge (confirmed by user)
- i18n strategy: pre-build merge, Paraglide wiring deferred
- Module namespace: `@nivora-cms/`
