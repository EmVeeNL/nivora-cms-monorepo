# @nivora-cms/core

Pure TypeScript package — no runtime code, no dependencies. Defines two things:

1. **Platform adapter interfaces** — `StorageAdapter`, `QueueAdapter`, `CacheAdapter`, `CronAdapter` that `@nivora-cms/adapter-cloudflare` (and future adapters) implement.
2. **`definePackageConfig` + `PackageConfig` types** — the canonical type for every package's `nivora.config.ts`.

## Depends on
Nothing.

## Tech
- TypeScript only (no runtime imports)

## Phases

### 01-platform-interfaces
1. `PlatformConfig` — base config shape all adapters accept (Cloudflare env bindings shape, feature flags)
2. `StorageAdapter` — `upload`, `delete`, `url`, `exists`, `list`, `getSignedUrl` for object storage
3. `QueueAdapter` — `enqueue<T>(queue, payload, options?)` for background jobs
4. `CronAdapter` — `register(schedule, handler)` for scheduled tasks
5. `CacheAdapter` — `get<T>`, `set<T>`, `delete`, `has` for key-value cache
6. `DatabaseAdapter` — thin type wrapper over a Drizzle instance (passed between packages for type-safe injection)
7. Package `exports` map in `package.json` — explicit named exports, no barrel ambiguity

### 02-package-config
1. `LocalizedString` — `string | Record<string, string>` (plain or i18n object)
2. `NavigationItem` — label, icon, route, group, order, permission, optional children
3. `SettingsFieldConfig` — discriminated union of `BooleanField | NumberField | StringField | SelectField | ArrayField`; each variant typed to its `input` type
4. `PackageDbConfig` — migrations path + owned table names
5. `PackageHooks` — `beforeInstall`, `afterInstall`, `beforeUninstall`, `afterUninstall` (all async)
6. `PackageConfig` — full config interface (see `plans/packages/PACKAGE-CONFIG.md` for canonical spec)
7. `definePackageConfig(config: PackageConfig): PackageConfig` — identity function for type safety

## Notes
- This package ships no compiled JS — consuming packages import `.ts` source directly via workspace `paths`
- `definePackageConfig` is an identity function; its value is purely the TypeScript constraint it applies
- All types must be minimal — only what adapters and packages need; no UI types, no business logic types
- The full `PackageConfig` spec with examples lives in `plans/packages/PACKAGE-CONFIG.md`
