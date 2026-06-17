# @nivora-cms/core

> **Status: ✅ COMPLETE** — committed `a9ee6c1` on `feature/core` → `develop` (2026-06-17)

Pure TypeScript package — no runtime code, no dependencies. Defines two things:

1. **Platform adapter interfaces** — `StorageAdapter`, `QueueAdapter`, `CacheAdapter`, `CronAdapter` that `@nivora-cms/adapter-cloudflare` (and future adapters) implement.
2. **`definePackageConfig` + `PackageConfig` types** — the canonical type for every package's `nivora.config.ts`.

## Depends on
Nothing.

## Tech
- TypeScript only (no runtime imports)

## Phases

### 01-platform-interfaces ✅
1. ✅ `PlatformConfig` — `featureFlags?: Record<string, boolean>`
2. ✅ `StorageAdapter` — `upload`, `delete`, `url`, `exists`, `list`, `getSignedUrl`
3. ✅ `QueueAdapter` — `enqueue<T>(queue, payload, options?)`
4. ✅ `CronAdapter` — `register(schedule, handler)` + `dispatch(event)`
5. ✅ `CacheAdapter` — `get<T>`, `set<T>`, `delete`, `has`
6. ✅ `DatabaseAdapter<TDb = unknown>` — generic opaque wrapper; concrete type from adapter-cloudflare
7. ✅ Package `exports` map — `"."`: `"./src/index.ts"` (ships TS source directly)

### 02-package-config ✅
1. ✅ `LocalizedString` — `string | Record<string, string>`
2. ✅ `NavigationItem` — label, icon, route, group, order, permission, children
3. ✅ `SettingsFieldConfig` — discriminated union: BooleanField | NumberField | StringField | SelectField | ArrayField
4. ✅ `PackageDbConfig` — migrations path + owned table names
5. ✅ `PackageHooks` — beforeInstall, afterInstall, beforeUninstall, afterUninstall (all async)
6. ✅ `PackageConfig` — full interface including `extends?` for local module overrides
7. ✅ `definePackageConfig(config: PackageConfig): PackageConfig` — identity function

## Notes
- This package ships no compiled JS — consuming packages import `.ts` source directly via workspace `paths`
- `definePackageConfig` is an identity function; its value is purely the TypeScript constraint it applies
- All types must be minimal — only what adapters and packages need; no UI types, no business logic types
- The full `PackageConfig` spec with examples lives in `plans/packages/PACKAGE-CONFIG.md`
