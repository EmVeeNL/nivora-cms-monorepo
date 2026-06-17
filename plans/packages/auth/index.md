# @nivora-cms/auth

Admin authentication and access control. Uses better-auth for session-based admin login. Manages ACL stored in D1. Issues OAuth2 tokens and JWTs for API consumers. Exports a Hono router (`apiRouter`) that `@nivora-cms/api` mounts at `/api/auth`.

## Depends on
- `@nivora-cms/core` (platform interfaces, definePackageConfig)
- `@nivora-cms/ui` (login page, auth UI components)
- `@nivora-cms/adapter-cloudflare` (injected at runtime: Drizzle DB instance, KV for token storage)

## Tech
- better-auth (session management, user CRUD, email+password, social OAuth providers)
- Drizzle ORM (ACL schema — roles, permissions, assignments)
- Zod v4 (auth input validation)
- Hono (auth API routes — exported as `apiRouter`, mounted at `/api/auth`)
- jose (JWT signing RS256, verification, key rotation)

## Directory Structure

```
packages/auth/
├── src/
│   ├── entities/
│   │   ├── users.entity.ts          # Extended user fields (avatar, locale, last_login)
│   │   ├── roles.entity.ts
│   │   ├── permissions.entity.ts
│   │   ├── role-permissions.entity.ts
│   │   └── user-roles.entity.ts
│   ├── services/
│   │   ├── session.service.ts       # better-auth session helpers
│   │   ├── acl.service.ts           # checkPermission, getUserPermissions
│   │   ├── token.service.ts         # JWT issue/verify/revoke, key rotation
│   │   └── invite.service.ts        # Admin invite flow
│   ├── middleware/
│   │   ├── require-session.ts       # TanStack Start server fn middleware
│   │   ├── require-permission.ts    # Permission check middleware
│   │   └── jwt-or-api-key.ts        # Hono middleware — verifies Bearer JWT or X-API-Key
│   ├── api/                         # Hono router — exported for @nivora-cms/api
│   │   ├── routes/
│   │   │   ├── token.route.ts       # POST /api/auth/token (OAuth2 flows)
│   │   │   ├── refresh.route.ts     # POST /api/auth/refresh
│   │   │   ├── revoke.route.ts      # POST /api/auth/revoke
│   │   │   ├── me.route.ts          # GET /api/auth/me
│   │   │   └── keys.route.ts        # POST/DELETE /api/auth/keys
│   │   └── router.ts                # Hono router; exports apiRouter + apiBasePath
│   ├── admin/
│   │   ├── fns/
│   │   │   ├── users.fns.ts
│   │   │   ├── roles.fns.ts
│   │   │   └── invites.fns.ts
│   │   └── routes/
│   │       └── index.ts             # adminRouteFactory for /admin/users, /admin/roles
│   └── hooks/
│       └── use-permission.ts        # React hook: usePermission('content.entries.write')
├── migrations/
├── i18n/
│   └── en.json
└── nivora.config.ts
```

## Phases

### 01-better-auth-setup
1. Install + configure better-auth with D1 adapter (Drizzle)
2. User entity additions — `avatar`, `locale` (user preference), `lastLoginAt`, `isActive`, `invitedBy`
3. Session management — `getSession()` server function for TanStack Start loaders; session cookie config
4. Email + password — invite-only flow (`super_admin` sends invite link); no open registration
5. Login page component (in `@nivora-cms/ui`) — form, error states, redirect after login, SSR-safe

### 02-acl
1. Role schema — `roles` table: `name`, `slug`, `description`, `isSystem`; built-in: `super_admin`, `admin`, `editor`, `viewer`
2. Permission schema — `permissions` table: dot-notation strings (`content.entries.write`) registered by packages via `nivora.config.ts`
3. Role-permission + user-role assignment tables
4. `checkPermission(userId, permission, db)` — D1 query; used in server fns and Hono middleware
5. `requirePermissionMiddleware(permission)` — TanStack Start server fn middleware
6. `jwtOrApiKeyMiddleware(env)` — Hono middleware for API routes (verifies JWT Bearer OR `X-API-Key` header); exports for `@nivora-cms/api` to use
7. `usePermission(permission)` — React hook for conditional admin UI rendering
8. Permission seeding — on package `afterInstall`, registers all permissions from all installed packages' `nivora.config.ts`

### 03-api-auth
1. OAuth2 token endpoint — `POST /api/auth/token` (client_credentials + authorization_code)
2. Token refresh — `POST /api/auth/refresh` with rotation (old token invalidated)
3. Token revocation — `POST /api/auth/revoke`; token stored as revoked in KV until expiry
4. `GET /api/auth/me` — returns API consumer identity + granted scopes
5. API key management — `POST /api/auth/keys` generates key (shown once); `DELETE /api/auth/keys/:id` revokes; stored as SHA-256 hash in D1
6. JWT key rotation — RS256 key pair stored in KV; rotation schedule via Cron; old keys kept for verification grace period
7. Scopes — derived from permissions: `content.entries.read` permission → `content:entries:read` scope

### 04-admin-ui
1. User list — `DataTable` with name, email, roles, status, last login; invite + deactivate actions
2. Invite flow — send invite email (via `@nivora-cms/emails`) with signed token; accept invite → set password
3. Role management — list roles, permission matrix heatmap, create custom role
4. API keys page — list active keys, generate new key (secret shown once), revoke

## Notes
- better-auth handles the admin session (cookie-based); OAuth2/JWT is entirely separate for API consumers
- All ACL permissions are sourced from `permissions[]` in each package's `nivora.config.ts`; registered into D1 on package install
- `jwtOrApiKeyMiddleware` is exported from this package and imported by `@nivora-cms/api` — auth logic stays here, not in the API assembler
- Invite-only by default: set `ALLOW_OPEN_REGISTRATION=true` in `wrangler.toml` to allow self-signup
