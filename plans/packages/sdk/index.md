# @nivora-cms/sdk

Type-safe JavaScript/TypeScript client for consuming the NIVORA CMS REST API. Framework-agnostic — works in React, Vue, Svelte, or plain JS. Published to npm independently; no workspace deps on other `@nivora-cms/*` packages.

## Depends on
Nothing (standalone — communicates with the deployed API over HTTP).

## Tech
- TypeScript
- `ofetch` (lightweight fetch wrapper with retry + error handling)
- Zod v4 (response validation in dev mode — stripped from production builds)

## Directory Structure

```
packages/sdk/
├── src/
│   ├── client.ts              # createClient({ baseUrl, apiKey? }) factory
│   ├── resources/
│   │   ├── content.ts         # client.content(type).list/get/getBySlug
│   │   ├── pages.ts           # client.pages.list/getBySlug
│   │   ├── assets.ts          # client.assets.list/getUrl
│   │   └── search.ts          # client.search(query, options?)
│   ├── auth/
│   │   └── interceptors.ts    # withApiKey(key), withOAuth(token) request interceptors
│   ├── types/
│   │   ├── responses.ts       # API response shapes (hand-maintained for v1)
│   │   └── errors.ts          # NivoraApiError class
│   └── react/
│       ├── hooks.ts           # useContent, useEntry, useSearch (built on @tanstack/react-query)
│       └── index.ts           # Sub-package export: @nivora-cms/sdk/react
└── package.json               # exports: { '.': './src/index.ts', './react': './src/react/index.ts' }
```

Note: The SDK has no `nivora.config.ts` — it is not a CMS package that runs inside the admin. It is a standalone npm package for frontend consumers of the API.

## Phases

### 01-client-foundation
1. `createClient({ baseUrl, apiKey? })` — factory returns a typed client instance; stores config for all requests
2. Request interceptors — `withApiKey(key)` adds `X-API-Key` header; `withOAuth(token)` adds `Authorization: Bearer` header; composable
3. `NivoraApiError` class — status code, message, `error.code` string from API response; thrown on non-2xx
4. Response types — hand-written TypeScript interfaces for all API response shapes matching `@nivora-cms/content` and `@nivora-cms/auth` API routes

### 02-content-queries
1. `client.content(type).list(options?)` — paginated entry list; options: `page`, `pageSize`, `filter`, `sort`, `locale`, `populate`
2. `client.content(type).get(id)` — single entry by ID
3. `client.content(type).getBySlug(slug)` — single entry by slug
4. `client.pages.list()` — full page tree
5. `client.pages.getBySlug(slug)` — page by slug (supports nested: `about/team`)
6. `client.assets.list(options?)` — asset list with folder filter
7. `client.search(query, options?)` — full-text search; options: `type`, `locale`, `limit`

### 03-dx-features
1. TypeScript generics — `client.content<PostEntry>('posts').list()` returns `PaginatedResponse<PostEntry>`
2. React hooks sub-package (`@nivora-cms/sdk/react`) — `useContent`, `useEntry`, `useSearch`, `usePage` built on `@tanstack/react-query`; tree-shaken by bundlers that don't use React
3. `stale-while-revalidate` — SDK respects `Cache-Control` headers; passes through to `ofetch` cache options
4. ETag support — stores `ETag` from responses; sends `If-None-Match` on repeat requests; handles 304 transparently
5. CLI codegen (`npx @nivora-cms/sdk codegen --url https://my-cms.com`) — generates TypeScript types from live OpenAPI spec; deferred to v1.1

## Notes
- Published to npm as a standalone package — users install it in their frontend project, not inside the NIVORA monorepo
- v1 ships with hand-maintained response types; codegen from the live OpenAPI spec is planned for v1.1 when the spec is stable
- The React hooks sub-package requires `@tanstack/react-query` as a peer dependency; the base client has no React dep
