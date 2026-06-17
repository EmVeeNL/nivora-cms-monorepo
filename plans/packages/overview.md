# NIVORA CMS — Architecture Overview

## Monorepo Structure

```
nivora-cms/
├── apps/
│   └── admin/                    # TanStack Start entry point (Cloudflare Worker)
│       └── src/
│           ├── modules/          # local package overrides + custom modules
│           └── routes/           # app-specific routes (thin shell)
├── packages/
│   ├── core/                     # @nivora-cms/core             — platform interfaces + PackageConfig types
│   ├── ui/                       # @nivora-cms/ui               — design system
│   ├── admin/                    # @nivora-cms/admin            — shell, registry, route injection, settings page
│   ├── auth/                     # @nivora-cms/auth             — better-auth, ACL, OAuth2/JWT; owns /api/auth routes
│   ├── content/                  # @nivora-cms/content          — types, fields, pages, assets, search; owns /api/v1/* routes
│   ├── editor/                   # @nivora-cms/editor           — Lexical rich text
│   ├── api/                      # @nivora-cms/api              — thin Hono orchestrator (no domain logic)
│   ├── i18n/                     # @nivora-cms/i18n             — Paraglide + user-preference locale
│   ├── adapter-cloudflare/       # @nivora-cms/adapter-cloudflare — D1, R2, KV, Queues, Cron
│   ├── sdk/                      # @nivora-cms/sdk              — JS client for API consumers
│   └── create-starter/           # @nivora-cms/create-starter   — pnpm create CLI
├── plans/                        # plan-driven development docs
├── pnpm-workspace.yaml
├── biome.json                    # root linter/formatter
├── tsconfig.json                 # root tsconfig (base, extended per package)
└── package.json                  # root devDependencies (biome, vitest, tsx)
```

## Package Dependency Graph

```
@nivora-cms/core          — no internal deps (pure interfaces + PackageConfig types)
@nivora-cms/ui            — no internal deps
@nivora-cms/adapter-cloudflare → @nivora-cms/core
@nivora-cms/i18n          — no internal deps
@nivora-cms/auth          → @nivora-cms/core, @nivora-cms/ui
@nivora-cms/content       → @nivora-cms/core, @nivora-cms/editor, @nivora-cms/auth
@nivora-cms/editor        → @nivora-cms/ui
@nivora-cms/api           → @nivora-cms/core  (+ dynamic: all packages with routes.api: true via api-registry.gen.ts)
@nivora-cms/admin         → @nivora-cms/core, @nivora-cms/ui, @nivora-cms/auth, @nivora-cms/i18n
@nivora-cms/sdk           — no internal deps (standalone API client)
@nivora-cms/create-starter — no internal deps (standalone CLI)

apps/admin                → all packages above + @nivora-cms/adapter-cloudflare
```

## Implementation Order

Ordered by dependency depth — build bottom-up.

| # | Package | Reason |
|---|---------|--------|
| 0 | monorepo setup | workspace config, tooling, gitflow |
| 1 | `@nivora-cms/core` | pure interfaces — all packages reference these |
| 2 | `@nivora-cms/ui` | design system — admin + auth render from this |
| 3 | `@nivora-cms/adapter-cloudflare` | DB, storage, queues — enables persistence |
| 4 | `@nivora-cms/i18n` ✅ | standalone — needed early for admin UI strings |
| 5 | `@nivora-cms/auth` | needs core + ui; owns /api/auth routes |
| 6 | `@nivora-cms/editor` | needs ui only |
| 7 | `@nivora-cms/content` | needs core + editor + auth; owns /api/v1 routes |
| 8 | `@nivora-cms/api` | thin orchestrator — assembles routers from content + auth |
| 9 | `@nivora-cms/admin` | needs ui + auth + i18n; owns module registry |
| 10 | `apps/admin` | integrates all packages |
| 11 | `@nivora-cms/sdk` | wraps the deployed API |
| 12 | `@nivora-cms/create-starter` | scaffolds the whole stack — last |

## Full Tech Stack

| Concern | Package | Library / Tool |
|---------|---------|----------------|
| Framework | apps/admin | TanStack Start (React 19, SSR) |
| Runtime | apps/admin | Cloudflare Workers |
| Local dev DB/storage | apps/admin | Miniflare (via Wrangler) |
| Routing | admin pkg + apps/admin | TanStack Router (file-based core, programmatic packages) |
| Data fetching | apps/admin | @tanstack/react-query |
| Tables | @nivora-cms/ui | @tanstack/react-table |
| Forms | @nivora-cms/ui | @tanstack/react-form |
| Styling | @nivora-cms/ui | Tailwind CSS v4 (CSS-first, no config file) |
| UI primitives | @nivora-cms/ui | shadcn/ui (Radix-based, New York style) |
| Icons | @nivora-cms/ui | Tabler (`@iconify-json/tabler` + `unplugin-icons`) |
| Fonts | @nivora-cms/ui | @fontsource (self-hosted) |
| Command palette | @nivora-cms/ui | cmdk |
| Notifications | @nivora-cms/ui | sonner |
| Auth | @nivora-cms/auth | better-auth |
| API auth | @nivora-cms/auth | OAuth2 + JWT (jose, RS256) |
| ORM | @nivora-cms/adapter-cloudflare | Drizzle ORM |
| Database | @nivora-cms/adapter-cloudflare | Cloudflare D1 (SQLite) |
| File storage | @nivora-cms/adapter-cloudflare | Cloudflare R2 |
| Key-value / cache | @nivora-cms/adapter-cloudflare | Cloudflare KV |
| Settings storage | @nivora-cms/adapter-cloudflare | KV pattern: `settings:<pkg>:<key>` |
| Job queues | @nivora-cms/adapter-cloudflare | Cloudflare Queues |
| Scheduled jobs | @nivora-cms/adapter-cloudflare | Cloudflare Cron Triggers |
| Validation | all packages | Zod v4 |
| Rich text editor | @nivora-cms/editor | Lexical |
| Full-text search | @nivora-cms/content | MiniSearch (index serialized to KV) |
| i18n | @nivora-cms/i18n | Paraglide JS |
| API routing | @nivora-cms/api | Hono |
| Linting + formatting | root | Biome |
| Testing | all packages | Vitest |
| Package manager | root | pnpm (workspaces) |
| Git workflow | root | Gitflow |
| Commits | root | Conventional Commits |

## Key Architectural Decisions

### `nivora.config.ts` — universal package descriptor
Every `@nivora-cms/*` package and every `apps/admin/src/modules/*` local module exports a `definePackageConfig(...)` from its `nivora.config.ts`. This is the single source of truth for:
- Package identity, version, and dependencies
- Whether the package contributes admin routes (`routes.admin`) or API routes (`routes.api`)
- Sidebar navigation items (`navigation`)
- Registered permissions (`permissions`)
- D1 tables owned (`db.tables`) and migration path (`db.migrations`)
- Settings UI fields and KV-stored values (`settings`)
- Install/uninstall lifecycle hooks (`hooks`)

The module registry generator reads all `nivora.config.ts` files and emits `module-registry.gen.ts` and `api-registry.gen.ts`. See `plans/packages/PACKAGE-CONFIG.md` for the canonical type definitions and full example.

### API ownership — packages own their routes
Domain packages export their Hono routers directly:
- `@nivora-cms/content` exports `apiRouter` → mounted at `/api/v1`
- `@nivora-cms/auth` exports `apiRouter` → mounted at `/api/auth`

`@nivora-cms/api` is a **thin orchestrator** only — it reads `api-registry.gen.ts`, mounts the routers, and applies global middleware (CORS, rate-limit, request-ID, secure-headers). It owns no domain logic.

The generator emits `api-registry.gen.ts` by detecting packages with `routes.api: true` in their `nivora.config.ts` and checking that they export `apiRouter` from a `/api` sub-path.

### Admin route injection
Each package with `routes.admin: true` exports an `adminRouteFactory` from its `admin/routes/index.ts`. The generator emits `module-registry.gen.ts` importing these factories. `apps/admin` assembles the TanStack Router tree by appending all factory-produced routes as children of the authenticated `_app` layout route. Core shell routes (dashboard, settings) remain file-based.

### Platform abstraction
`@nivora-cms/core` defines `StorageAdapter`, `QueueAdapter`, `CronAdapter`, `CacheAdapter`, and `DatabaseAdapter` interfaces. `@nivora-cms/adapter-cloudflare` implements all of them for Cloudflare Workers. No other adapter exists for v1 — but adding one (Neon + Vercel) only requires a new package; feature packages never import from `cloudflare:workers` directly.

### Auth split
- **Admin sessions**: better-auth (cookie-based) in `@nivora-cms/auth`
- **API consumers**: OAuth2 + JWT (jose, RS256 key rotation) in `@nivora-cms/auth`
- `jwtOrApiKeyMiddleware` is exported from `@nivora-cms/auth` and imported by `@nivora-cms/api` — auth logic stays in one place
- ACL permissions are sourced from `permissions[]` in each package's `nivora.config.ts` and registered into D1 on package install

### Local overrides
`apps/admin/src/modules/<slug>/nivora.config.ts` with `extends: '@nivora-cms/<slug>'` deep-merges over the base package config in the generator. The local module takes full precedence in the route registry; components are resolved to the local path first.

### i18n
Paraglide JS, user-preference based (stored in `users.locale` in D1), NOT URL-path based. Language switching updates the user profile; the admin UI re-renders with the new locale. Each package has an `i18n/en.json` with its own namespace; `scripts/collect-messages.ts` merges them into a single compiled file.

### Content delivery
Content is stored as typed JSON in D1. The resolution pipeline (`@nivora-cms/content`) runs at API delivery time — not at save time — enriching block/entry JSON with live data (asset URLs, resolved relations, dynamic block data). Preview uses iframe + `window.postMessage` for live field sync; a short-lived token handles initial draft content load.

## Gitflow

```
main              — production-only; tagged releases
develop           — integration branch; all feature/fix PRs merge here
feature/<name>    — branched from develop; one feature per branch
release/<v>       — branched from develop when cutting a release → merges to main + develop
hotfix/<name>     — branched from main; merges back to main + develop
```
