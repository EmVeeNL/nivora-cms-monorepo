# @nivora-cms/auth — ✅ COMPLETE (feature/auth, 2026-06-17)

Admin authentication and access control. Uses better-auth for session-based admin login. Manages ACL stored in D1. Issues OAuth2 tokens and JWTs for API consumers. Exports a Hono router (`apiRouter`) that `@nivora-cms/api` mounts at `/api/auth`.

## Depends on
- `@nivora-cms/core` (platform interfaces, definePackageConfig)
- `@nivora-cms/adapter-cloudflare` (injected at runtime: Drizzle DB instance, KV for token storage)

## Tech
- better-auth@^1.6.19 (session management, email+password, tanstack-start cookies plugin)
- @better-auth/drizzle-adapter@^1.6.19 (Drizzle adapter for D1)
- drizzle-orm@^0.45.2 + sqlite-core (ACL schema — roles, permissions, assignments)
- jose@^6.2.3 (JWT signing RS256, key rotation)
- Hono@^4.12.25 (auth API routes — exported as `apiRouter`, mounted at `/api/auth`)

## Directory Structure

```
packages/auth/
├── src/
│   ├── entities/
│   │   ├── users.entity.ts          # Extended user fields (avatar, locale, lastLoginAt, isActive, invitedBy)
│   │   ├── sessions.entity.ts       # better-auth session table
│   │   ├── accounts.entity.ts       # better-auth OAuth accounts table
│   │   ├── verifications.entity.ts  # better-auth verification tokens
│   │   ├── roles.entity.ts          # ACL roles
│   │   ├── permissions.entity.ts    # Dot-notation permission names
│   │   ├── role-permissions.entity.ts
│   │   ├── user-roles.entity.ts
│   │   └── index.ts                 # Re-exports all entities
│   ├── auth.ts                      # createAuth(db, config) factory + Auth type
│   ├── services/
│   │   ├── session.service.ts       # getSession(auth, headers)
│   │   ├── acl.service.ts           # checkPermission, getUserPermissions, getUserRoles
│   │   ├── token.service.ts         # JWT RS256: issueToken, verifyToken, revokeToken, rotateKeys
│   │   └── invite.service.ts        # createInvite, acceptInvite
│   ├── middleware/
│   │   ├── require-session.ts       # requireSession(auth, headers) — throws UnauthorizedError
│   │   ├── require-permission.ts    # requirePermission(userId, permission, db) — throws ForbiddenError
│   │   └── jwt-or-api-key.ts        # Hono middleware — verifies Bearer JWT or X-API-Key header
│   ├── api/                         # Hono router — exported for @nivora-cms/api
│   │   ├── routes/
│   │   │   ├── token.route.ts       # POST /api/auth/token (client_credentials)
│   │   │   ├── refresh.route.ts     # POST /api/auth/refresh
│   │   │   ├── revoke.route.ts      # POST /api/auth/revoke
│   │   │   ├── me.route.ts          # GET /api/auth/me
│   │   │   └── keys.route.ts        # POST/DELETE /api/auth/keys
│   │   └── router.ts                # Hono router; exports apiRouter + apiBasePath
│   ├── admin/
│   │   ├── fns/
│   │   │   ├── users.fns.ts         # listUsers, getUserById, deactivateUser, updateUserLocale
│   │   │   ├── roles.fns.ts         # listRoles, createRole, assign/remove, permissions CRUD
│   │   │   └── invites.fns.ts       # inviteUser
│   │   └── routes/
│   │       └── index.ts             # adminRouteFactory stub (TanStack Router routes added in step 10)
│   └── hooks/
│       └── use-permission.ts        # usePermission(permission, { userPermissions }) React hook
├── i18n/
│   └── en.json                      # auth.login.*, auth.users.*, auth.roles.*, auth.invite.*, etc.
└── nivora.config.ts
```

## Key Design Decisions

- `createAuth(db, config)` factory — better-auth instance created per-request (Cloudflare Workers pattern)
- Drizzle entities define all 8 tables; `drizzleAdapter(db, { provider: "sqlite", usePlural: true })` maps them
- JWT stored in KV with RS256 key pair (`jwt:keys:current` / `jwt:keys:previous` for rotation grace period)
- Revoked JTIs stored in KV with TTL matching token expiry
- API key stored as SHA-256 hash — raw key shown once to user at generation time
- `jwtOrApiKeyMiddleware` exported for `@nivora-cms/api` to protect all `/api/v1/*` routes

## Phases

### 01-better-auth-setup ✅
1. ✅ better-auth + @better-auth/drizzle-adapter installed; createAuth(db, config) factory
2. ✅ User entity — avatar, locale, lastLoginAt, isActive, invitedBy extended fields
3. ✅ getSession(auth, headers) helper; requireSession middleware
4. ✅ Email + password enabled; invite flow via sendVerificationEmail
5. Login page — deferred to @nivora-cms/admin (step 9)

### 02-acl ✅
1. ✅ roles table — name, slug, description, isSystem
2. ✅ permissions table — dot-notation name, packageSlug
3. ✅ role_permissions + user_roles junction tables with composite PKs
4. ✅ checkPermission(userId, permission, db), getUserPermissions, getUserRoles
5. ✅ requirePermission(userId, permission, db) middleware
6. ✅ jwtOrApiKeyMiddleware Hono middleware — Bearer JWT or X-API-Key
7. ✅ usePermission(permission, { userPermissions }) React hook
8. Permission seeding — deferred: registerPermissions() fn exported; called on package install

### 03-api-auth ✅
1. ✅ POST /api/auth/token — client_credentials grant
2. ✅ POST /api/auth/refresh — token rotation
3. ✅ POST /api/auth/revoke — JTI stored in KV
4. ✅ GET /api/auth/me — returns sub + scope
5. ✅ POST/DELETE /api/auth/keys — generate/revoke API keys
6. ✅ rotateKeys(kv) — moves current → previous; called via CronAdapter
7. Scope validation on /api/v1 routes — deferred to @nivora-cms/api (step 8)

### 04-admin-ui
- Deferred to steps 9 + 10 (admin package + apps/admin integration)
- User list DataTable, invite flow, role management, API keys page

## Notes
- drizzle-orm bumped to ^0.45.2 (better-auth peer dep); also updated in adapter-cloudflare
- better-auth handles admin session (cookie-based); OAuth2/JWT is entirely separate for API consumers
- Admin UI locale (`users.locale`) is updated via `updateUserLocale(id, locale, db)` — bridges @nivora-cms/i18n
- `betterAuth` baseURL and secret must come from Cloudflare Worker env vars (not hardcoded)
