# @nivora-cms/adapter-cloudflare — ✅ COMPLETE (commit f5f1738, 2026-06-17)

Implements all `@nivora-cms/core` platform interfaces for Cloudflare. Owns the Drizzle schema, D1 migrations, R2 storage, KV cache, Queues, and Cron Triggers. This is the only adapter for v1.

## Depends on
- `@nivora-cms/core` (implements its interfaces)

## Tech
- Drizzle ORM (`drizzle-orm/d1` for D1, `drizzle-kit` for migrations)
- Cloudflare D1 (SQLite via Workers binding)
- Cloudflare R2 (object storage)
- Cloudflare KV (key-value / cache)
- Cloudflare Queues (background jobs)
- Cloudflare Cron Triggers (scheduled tasks)
- Wrangler (local dev via Miniflare)

## Directory Structure

```
packages/adapter-cloudflare/
├── src/
│   ├── db/
│   │   ├── client.ts          # createDb(env: Env): DrizzleD1Database
│   │   └── schema/            # All Drizzle table definitions (imported by feature packages)
│   │       └── index.ts       # Re-exports all schema tables
│   ├── storage/
│   │   └── r2.adapter.ts      # R2StorageAdapter implements StorageAdapter
│   ├── cache/
│   │   └── kv.adapter.ts      # KVCacheAdapter implements CacheAdapter
│   │   └── settings.ts        # getSetting<T>(pkg, key), setSetting<T>(pkg, key, value) helpers
│   ├── queue/
│   │   └── queue.adapter.ts   # CloudflareQueueAdapter implements QueueAdapter
│   ├── cron/
│   │   └── cron.adapter.ts    # CloudflareCronAdapter implements CronAdapter
│   ├── types.ts               # Env type (Cloudflare Workers bindings), re-exported for consumers
│   └── index.ts               # Barrel: createDb, adapters, Env, getSetting
├── drizzle.config.ts          # drizzle-kit config pointing at D1
└── nivora.config.ts
```

## `nivora.config.ts`

```ts
import { definePackageConfig } from '@nivora-cms/core'

export default definePackageConfig({
  name: 'Cloudflare Adapter',
  description: 'Cloudflare D1, R2, KV, Queues, and Cron Triggers adapter',
  version: '0.1.0',

  dependencies: {
    '@nivora-cms/core': '^0.1.0',
  },

  routes: {
    admin: false,
    api: false,
  },

  // No navigation, permissions, db, or settings — this package is infrastructure
})
```

## Phases

### 01-d1-database
1. Drizzle setup — install drizzle-orm + drizzle-kit; `drizzle.config.ts` pointing at D1
2. `Env` type — declares all Cloudflare bindings (`D1Database`, `R2Bucket`, `KVNamespace`, `Queue`, `ASSETS`) in one place; re-exported for `apps/admin` and all packages
3. `createDb(env: Env): DrizzleD1Database` factory — single call site to get a typed Drizzle instance
4. Base schema module — `src/db/schema/index.ts` initially empty; feature packages co-locate their Drizzle tables inside their own `entities/` but import `Env` and `createDb` from here
5. Miniflare config — `wrangler.toml` `[[d1_databases]]` binding for local dev; `d1Persist` path set to Wrangler's local SQLite for test/dev parity

### 02-r2-storage
1. `R2StorageAdapter` — implements `StorageAdapter` from `@nivora-cms/core`
2. Upload — `PutObjectCommand` with content-type header, size limit guard, allowed MIME type check
3. Signed URLs — presigned GET URLs (private bucket) via `env.BUCKET.createPresignedUrl()`; public URLs for public bucket
4. Delete + list — `delete(key)`, `list(prefix?)` for housekeeping
5. Miniflare R2 config — local bucket via `[[r2_buckets]]` in `wrangler.toml`

### 03-kv-cache
1. `KVCacheAdapter` — implements `CacheAdapter` from `@nivora-cms/core`
2. TTL support — passes `expirationTtl` to KV `put()`
3. Namespace prefixing — `<namespace>:<key>` to isolate keys by feature (e.g. `search:index`, `settings:content:enableVersioning`)
4. `getSetting<T>(pkg: string, key: string): Promise<T | null>` — reads `settings:<pkg>:<key>` from KV; exported as convenience helper
5. `setSetting<T>(pkg: string, key: string, value: T): Promise<void>` — writes setting to KV
6. Miniflare KV config — local namespace via `[[kv_namespaces]]`

### 04-queues-and-cron
1. `CloudflareQueueAdapter` — implements `QueueAdapter`; wraps `env.QUEUE.send()` with typed payload
2. Queue consumer entry point — base `queue()` handler in `apps/admin`; routes messages to registered handlers by job type
3. `CloudflareCronAdapter` — implements `CronAdapter`; routes `scheduled()` Worker events to registered handlers
4. Job type registry — typed job definitions with Zod payload schemas; handler lookup by `job.type`
5. Miniflare queues config — local queue simulation via `[[queues]]` in `wrangler.toml`

## Notes
- `Env` type is the single authoritative type for Cloudflare Worker bindings — import it from here, not from generated types
- Feature packages (content, auth) define their own Drizzle entity files; the adapter does NOT own content schema — it only provides the Drizzle client
- `getSetting` / `setSetting` are thin KV wrappers — they do NOT read `PackageConfig.settings` defaults; settings pages in admin write defaults on first load
- Adapter is injected at runtime (passed via `createDb(env)`, `new R2StorageAdapter(env.BUCKET)`) — feature code never imports from `cloudflare:workers` directly
