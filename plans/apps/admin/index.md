# apps/admin

The TanStack Start application — the Cloudflare Worker entry point. Thin by design: it wires together all `@nivora-cms/*` packages and provides a place for the developer to add custom routes, custom modules, and package overrides.

## Depends on
All `@nivora-cms/*` packages via `workspace:*` references.

## Tech
- TanStack Start (React 19, SSR)
- TanStack Router (file-based routing for core shell; programmatic for module routes)
- Cloudflare Workers (Wrangler, `@cloudflare/vite-plugin`)
- Miniflare (local D1, R2, KV via Wrangler dev)
- Vite 8 + `@tanstack/router-plugin` + `nivoraModulesPlugin`

## What lives here (not in packages)

```
apps/admin/
├── src/
│   ├── routes/          # core shell routes (__root, _app layout, 404)
│   │   └── __root.tsx   # SSR root: theme script, locale injection, HeadContent
│   ├── modules/         # local module overrides + custom modules
│   │   └── (empty at scaffold time — developer adds their own)
│   └── env.ts           # Cloudflare Env type re-exported from adapter-cloudflare
├── wrangler.toml        # D1, R2, KV, Queue, Cron bindings
├── vite.config.ts       # Cloudflare plugin + router plugin + modules plugin
├── worker-entry.ts      # Cloudflare Worker fetch + scheduled + queue handlers
└── package.json         # workspace:* deps on all @nivora-cms/* packages
```

## Phases

### 01-project-setup
1. Migrate current `src/` → `apps/admin/src/` as part of monorepo restructuring
2. Update `wrangler.toml` bindings — D1, R2, KV, Queue named per project
3. `worker-entry.ts` — `fetch()` handler (TanStack Start SSR), `scheduled()` (cron), `queue()` (queue consumer)
4. Miniflare local dev — `.dev.vars`, `wrangler.toml` local overrides; `pnpm dev` starts Miniflare + Vite
5. Environment types — `Env` interface wired from `@nivora-cms/adapter-cloudflare`

### 02-package-integration
1. Inject adapter — `createDb(env)`, `createStorage(env)` from `@nivora-cms/adapter-cloudflare` passed into app context
2. Mount Hono API — `@nivora-cms/api` Hono app mounted at `/api` in `worker-entry.ts`
3. Auth middleware — better-auth session middleware in `__root.tsx` server loader
4. Locale provider — inject user locale from session into Paraglide runtime on SSR
5. Module registry — `pnpm generate-modules` runs on `predev` + `prebuild`; emits `module-registry.gen.ts`

## Notes
- `apps/admin/src/modules/` is the escape hatch — everything in `@nivora-cms/admin` can be overridden here
- Custom routes in `apps/admin/src/routes/` are file-based and take priority over module routes
- The Worker entry is a single Worker with both the admin SSR and the public API — split into separate Workers only if needed for performance
