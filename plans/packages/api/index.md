# @nivora-cms/api

Thin orchestration layer. Assembles the API from Hono routers exported by other packages, applies global middleware, aggregates the OpenAPI spec, and exposes the combined API to the Cloudflare Worker. Owns NO domain logic.

## Depends on
- `@nivora-cms/core` (PackageConfig interfaces)
- All packages with `routes.api: true` (discovered via module registry)

## Tech
- Hono (app assembly, global middleware)
- @hono/zod-openapi (OpenAPI 3.1 aggregation)
- @hono/swagger-ui (API docs UI)
- jose (JWT verification middleware — delegates actual JWT logic to `@nivora-cms/auth`)

## How it works

Each package with `routes.api: true` exports from a dedicated `api` entry point:

```ts
// @nivora-cms/content/api
export { apiRouter } from './src/api/router.ts'
export { apiBasePath } from './src/api/router.ts'  // optional; default: '/v1'
```

The module registry generator detects packages with `routes.api: true` and emits `api-registry.gen.ts`:

```ts
// src/core/api-registry.gen.ts (generated — do not edit)
import { apiRouter as contentApiRouter } from '@nivora-cms/content/api'
import { apiRouter as authApiRouter, apiBasePath as authBasePath } from '@nivora-cms/auth/api'

export const apiRouters = [
  { slug: 'content', basePath: '/v1', router: contentApiRouter },
  { slug: 'auth',    basePath: '/auth', router: authApiRouter },
]
```

`@nivora-cms/api` reads this registry and assembles the Hono app:

```ts
import { apiRouters } from '@/core/api-registry.gen.ts'

export function createApiApp(env: Env): Hono {
  const app = new Hono()

  // Global middleware (applied to all routes)
  app.use('*', cors({ origin: env.CORS_ORIGINS?.split(',') ?? ['*'] }))
  app.use('*', requestId())
  app.use('*', logger())
  app.use('*', secureHeaders())
  app.use('/v1/*', rateLimitMiddleware(env))   // rate limit versioned API only

  // Mount package routers
  for (const { basePath, router } of apiRouters) {
    app.route(`/api${basePath}`, router)
  }

  // Platform routes
  app.get('/api/health', healthHandler(env))
  app.get('/api/docs', swaggerUI({ url: '/api/openapi.json' }))
  app.get('/api/openapi.json', openApiHandler(apiRouters))

  return app
}
```

## Directory Structure

```
packages/api/
├── src/
│   ├── middleware/
│   │   ├── cors.ts          # CORS configuration (reads from KV settings)
│   │   ├── rate-limit.ts    # Cloudflare rate limiting
│   │   ├── request-id.ts    # X-Request-ID header
│   │   ├── logger.ts        # Structured JSON request logging
│   │   └── secure-headers.ts# Security headers (CSP, HSTS, etc.)
│   ├── handlers/
│   │   ├── health.ts        # GET /api/health — D1 ping + version
│   │   └── openapi.ts       # GET /api/openapi.json — aggregated spec
│   ├── app.ts               # createApiApp(env) — the main export
│   └── types.ts             # Hono Env type, RouterEntry type
└── nivora.config.ts         # definePackageConfig({ name: 'API', routes: { api: false } })
```

## Phases

### 01-app-assembly
1. `createApiApp(env)` — Hono app factory; imports `apiRouters` from generated registry
2. Global middleware stack (cors, requestId, logger, secureHeaders, rateLimitMiddleware)
3. Health check handler — `GET /api/health` returns `{ status, version, db: 'ok' | 'error' }`
4. OpenAPI aggregation — merges OpenAPI specs from each package's `apiRouter.openApiSpec`; serves at `GET /api/openapi.json`
5. Swagger UI — `GET /api/docs` renders interactive API explorer
6. Mount in `apps/admin` Worker `fetch` handler: `app.fetch(request, env, ctx)`

### 02-api-registry-generator
The generator script (`scripts/generate-modules.ts`) is updated to also emit `src/core/api-registry.gen.ts`:
1. Detect packages with `routes.api: true` in their `nivora.config.ts`
2. Check that the package exports `apiRouter` from its `api` sub-path
3. Emit import statements and the `apiRouters` array
4. Vite plugin watches `*/nivora.config.ts` changes and re-runs the generator

### 03-authentication-middleware
Not all routes are public. The JWT verification middleware is mounted selectively:

```ts
// Mount auth middleware on write routes only
app.use('/v1/*', jwtOrApiKeyMiddleware(env))  // verifies Bearer token or X-API-Key
// Read routes that need auth are handled per-route in the package router
```

The actual JWT verification logic lives in `@nivora-cms/auth` (jose + key rotation). `@nivora-cms/api` imports the middleware factory and passes the `env` for key access.

## Notes
- `@nivora-cms/api` never imports domain types directly — it only knows about router registrations and middleware
- Each package's Hono router is responsible for its own request validation (Zod) and error responses
- Error format is standardized: `{ error: { code: string, message: string, details?: unknown } }` — each package must conform to this shape
- The OpenAPI spec is assembled lazily (on first request to `/api/openapi.json`) and cached in KV
