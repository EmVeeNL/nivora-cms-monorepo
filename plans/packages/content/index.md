# @nivora-cms/content

The content layer of NIVORA CMS. Owns two distinct content paradigms:

1. **Structured content** — dynamic content types (like Contentful/Strapi). Users define content types with typed fields; the system generates Zod schemas and admin forms.
2. **Page builder** — hierarchical page tree with a reusable block library and a Storyblok-style split-pane preview. Blocks are JSON field configurations rendered by the frontend.

Also owns: assets/media, navigation menus, taxonomies, full-text search, and the content resolution pipeline that enriches block data at delivery time.

**Multilingual:** Every content entry and page has a `locale` field. Locale variants of the same logical piece of content are linked by a `translation_group_id`. When a requested locale has no translation, the API falls back to the `defaultLocale` (configurable per-CMS). Fallback can be disabled to return 404 instead.

## Depends on
- `@nivora-cms/core` (platform interfaces, definePackageConfig)
- `@nivora-cms/adapter-cloudflare` (injected at runtime: Drizzle DB, R2, KV)
- `@nivora-cms/editor` (Lexical — used for `richtext` fields in entry forms)
- `@nivora-cms/auth` (permission checks in server fns and API middleware)

## Tech
- Drizzle ORM (entity schemas + D1 queries)
- Zod v4 (dynamic schema generation from field definitions + API validation)
- Hono (API route handlers — exported as `apiRouter`)
- MiniSearch (in-process full-text search, index stored in KV per locale)
- TanStack Router `createRoute()` (admin route factories)
- @tanstack/react-query (data fetching in admin UI components)
- @tanstack/react-table (content lists, asset library)
- @tanstack/react-form (entry editor forms)

## Storage Strategy — Hybrid JSON + Indexed Columns

Content field values are stored in a `data TEXT` (JSON) column. All fields the API filters, sorts, or queries on get dedicated indexed columns. This avoids EAV complexity while keeping schema migrations unnecessary when content types change.

D1/SQLite's `json_extract()` is available for querying specific JSON fields when needed.

```
content_entries columns:
  id, content_type_id, translation_group_id  — relations
  locale, slug, status, published_at          — indexed; API filters these
  author_id, created_at, updated_at, deleted_at — metadata
  data TEXT (JSON)                            — all field values live here
```

The `data` column is validated against a Zod schema (generated from the content type's field definitions) on every write, never on read.

## Directory Structure

```
packages/content/
├── src/
│   ├── entities/                     # Drizzle table definitions
│   │   ├── content-types.entity.ts   # Dynamic content type definitions
│   │   ├── content-entries.entity.ts # Hybrid: indexed cols + JSON data field
│   │   ├── content-versions.entity.ts# Version history (data snapshot per version)
│   │   ├── pages.entity.ts           # Hierarchical page tree
│   │   ├── page-versions.entity.ts   # Page version history
│   │   ├── blocks.entity.ts          # Block library
│   │   ├── assets.entity.ts          # Media file metadata (R2 references)
│   │   ├── asset-folders.entity.ts   # Folder structure for assets
│   │   ├── menus.entity.ts           # Navigation menus + items
│   │   └── taxonomies.entity.ts      # Categories, tags
│   ├── fields/                       # Field type system
│   │   ├── types.ts                  # FieldDefinition, FieldType union
│   │   ├── registry.ts               # Extensible field type registry
│   │   ├── schema-builder.ts         # buildZodSchema(fields) → ZodObject
│   │   └── built-in/                 # One file per field type
│   │       ├── text.ts               # text, textarea, slug, email, url
│   │       ├── richtext.ts           # richtext (Lexical JSON)
│   │       ├── number.ts             # number, integer
│   │       ├── boolean.ts
│   │       ├── date.ts               # date, datetime
│   │       ├── select.ts             # select, multiselect
│   │       ├── media.ts              # single asset reference
│   │       ├── relation.ts           # reference to another content type
│   │       ├── repeater.ts           # array of sub-fields
│   │       └── json.ts               # raw JSON
│   ├── services/                     # Business logic (no HTTP, no DB — takes deps as args)
│   │   ├── content-type.service.ts
│   │   ├── entry.service.ts          # locale + translation_group_id aware
│   │   ├── translation.service.ts    # create/list/delete translations; fallback resolution
│   │   ├── page.service.ts
│   │   ├── block.service.ts
│   │   ├── asset.service.ts
│   │   ├── menu.service.ts
│   │   ├── taxonomy.service.ts
│   │   ├── search.service.ts         # per-locale MiniSearch index
│   │   └── resolution.service.ts     # Content resolution pipeline
│   ├── repositories/                 # Drizzle queries (no business logic)
│   │   ├── content-type.repository.ts
│   │   ├── entry.repository.ts       # findByLocale, findWithFallback, findByTranslationGroup
│   │   ├── page.repository.ts
│   │   ├── block.repository.ts
│   │   ├── asset.repository.ts
│   │   └── menu.repository.ts
│   ├── api/                          # Hono route handlers — PUBLIC REST API
│   │   ├── routes/
│   │   │   ├── entries.route.ts      # GET /api/v1/:type (locale param + fallback)
│   │   │   ├── pages.route.ts        # GET /api/v1/pages/slug/* (locale param + fallback)
│   │   │   ├── blocks.route.ts       # GET /api/v1/blocks
│   │   │   ├── assets.route.ts       # GET/POST /api/v1/assets
│   │   │   ├── search.route.ts       # GET /api/v1/search?q=&locale=
│   │   │   └── preview.route.ts      # POST /api/v1/preview/token
│   │   └── router.ts                 # Hono router — exported as `apiRouter`
│   ├── admin/                        # Admin UI — server fns + route factories + components
│   │   ├── fns/
│   │   │   ├── content-types.fns.ts
│   │   │   ├── entries.fns.ts        # locale-aware CRUD + translation management
│   │   │   ├── translations.fns.ts   # createTranslation, listTranslations
│   │   │   ├── pages.fns.ts
│   │   │   ├── blocks.fns.ts
│   │   │   └── assets.fns.ts
│   │   ├── routes/
│   │   │   ├── index.ts              # exports adminRouteFactory
│   │   │   ├── content-types/        # /admin/content/types
│   │   │   ├── entries/              # /admin/content/:type (list + editor)
│   │   │   ├── pages/                # /admin/content/pages
│   │   │   ├── blocks/               # /admin/content/blocks
│   │   │   └── assets/               # /admin/content/assets
│   │   └── components/
│   │       ├── ContentTypeBuilder/
│   │       ├── EntryEditor/
│   │       │   ├── EntryEditor.tsx
│   │       │   ├── FieldRenderer.tsx
│   │       │   ├── LocaleBar.tsx     # locale switcher + translation status badges
│   │       │   └── PreviewPane.tsx
│   │       ├── TranslationManager/
│   │       │   ├── TranslationList.tsx   # Shows all locale variants + missing translations
│   │       │   └── CreateTranslation.tsx # Copy from existing locale + edit
│   │       ├── PageBuilder/
│   │       │   ├── PageTree.tsx
│   │       │   ├── BlockCanvas.tsx
│   │       │   ├── BlockFieldEditor.tsx
│   │       │   └── PreviewIframe.tsx
│   │       ├── BlockLibrary/
│   │       ├── AssetLibrary/
│   │       └── MenuEditor/
│   ├── schema/
│   │   ├── entry.schema.ts
│   │   ├── page.schema.ts
│   │   ├── asset.schema.ts
│   │   └── preview.schema.ts
│   └── types/
│       ├── content.types.ts
│       ├── field.types.ts
│       ├── locale.types.ts           # LocaleCode, TranslationGroup, LocaleFallbackResult
│       └── resolution.types.ts
├── migrations/
├── i18n/
│   └── en.json
└── nivora.config.ts
```

## `nivora.config.ts`

```ts
import { definePackageConfig } from '@nivora-cms/core'

export default definePackageConfig({
  name: 'Content',
  description: 'Content types, pages, media, and multilingual content management',
  version: '0.1.0',

  dependencies: {
    '@nivora-cms/core': '^0.1.0',
    '@nivora-cms/adapter-cloudflare': '^0.1.0',
  },

  routes: {
    admin: true,
    api: true,
  },

  permissions: [
    'content.types.read',
    'content.types.write',
    'content.entries.read',
    'content.entries.write',
    'content.entries.publish',
    'content.pages.read',
    'content.pages.write',
    'content.pages.publish',
    'content.media.read',
    'content.media.upload',
    'content.media.delete',
    'content.translations.manage',
  ],

  navigation: [
    { label: 'Pages',         icon: 'layout',       route: '/admin/content/pages',   group: 'Content', order: 10, permission: 'content.pages.read' },
    { label: 'Entries',       icon: 'file-text',     route: '/admin/content/entries', group: 'Content', order: 20, permission: 'content.entries.read' },
    { label: 'Media',         icon: 'photo',         route: '/admin/content/assets',  group: 'Content', order: 30, permission: 'content.media.read' },
    { label: 'Content Types', icon: 'table-options', route: '/admin/content/types',   group: 'Content', order: 40, permission: 'content.types.read' },
  ],

  db: {
    migrations: './migrations',
    tables: [
      'content_types', 'content_entries', 'content_versions',
      'content_pages', 'content_page_versions', 'block_library',
      'assets', 'asset_folders', 'menus', 'menu_items',
    ],
  },

  hooks: {
    async afterInstall() {
      // Seed default content types (page, post)
      // Create default block library entries (hero, text, image)
    },
    async beforeUninstall() {
      // Throw if content entries exist — prevent accidental data loss
    },
    async afterUninstall() {
      // Clean up KV search indices
    },
  },

  settings: {
    // ─── Locale ────────────────────────────────────────────────────────────────
    defaultLocale: {
      type: 'string',
      input: 'text',
      default: 'en',
      label: 'Default content locale',
      description: 'Primary locale (BCP 47, e.g. en, nl, de). Fallback returns this when a translation is missing.',
    },
    enabledLocales: {
      type: 'array',
      input: 'tag-input',
      default: ['en'],
      itemType: 'string',
      label: 'Enabled locales',
      description: 'BCP 47 locale codes. Only listed locales can be created in the editor.',
    },
    localeFallback: {
      type: 'boolean',
      input: 'switch',
      default: true,
      label: 'Enable locale fallback',
      description: 'Return defaultLocale content when the requested locale has no translation, instead of 404.',
    },

    // ─── Entries ───────────────────────────────────────────────────────────────
    enableVersioning: {
      type: 'boolean',
      input: 'switch',
      default: true,
      label: 'Enable versioning',
    },
    maxVersionsPerEntry: {
      type: 'number',
      input: 'number',
      default: 50,
      min: 1,
      max: 1000,
      label: 'Max versions per entry',
    },
    defaultEntryStatus: {
      type: 'string',
      input: 'select',
      default: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      label: 'Default entry status',
    },
    slugGeneration: {
      type: 'string',
      input: 'radio',
      default: 'auto',
      options: [
        { label: 'Auto (from title)', value: 'auto' },
        { label: 'Manual', value: 'manual' },
      ],
      label: 'Slug generation',
    },

    // ─── Preview ───────────────────────────────────────────────────────────────
    previewUrl: {
      type: 'string',
      input: 'text',
      default: '',
      label: 'Preview base URL',
      description: 'e.g. https://mysite.com — used for the page builder preview iframe',
    },

    // ─── Media ─────────────────────────────────────────────────────────────────
    mediaMaxSizeMb: {
      type: 'number',
      input: 'number',
      default: 50,
      min: 1,
      max: 500,
      label: 'Max upload size (MB)',
    },
    allowedMediaTypes: {
      type: 'array',
      input: 'tag-input',
      default: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
      itemType: 'string',
      label: 'Allowed media MIME types',
    },
  },

  entities: [
    'ContentType', 'ContentEntry', 'ContentVersion',
    'ContentPage', 'ContentPageVersion', 'BlockLibraryItem',
    'Asset', 'AssetFolder', 'Menu', 'MenuItem',
  ],
})
```

---

## Phases

### 01-entities-and-field-system

#### Hybrid schema

`content_entries` uses a mix of indexed columns and a JSON `data` column:

```ts
// entities/content-entries.entity.ts
export const contentEntries = sqliteTable('content_entries', {
  id:                  text('id').primaryKey(),
  contentTypeId:       text('content_type_id').notNull().references(() => contentTypes.id),
  translationGroupId:  text('translation_group_id').notNull(),  // links locale variants
  locale:              text('locale').notNull(),                  // BCP 47: 'en', 'nl', 'de'
  slug:                text('slug').notNull(),
  status:              text('status').notNull().default('draft'), // draft | review | published | archived
  publishedAt:         integer('published_at', { mode: 'timestamp' }),
  authorId:            text('author_id'),
  data:                text('data').notNull(),                    // JSON — validated on write
  createdAt:           integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt:           integer('updated_at', { mode: 'timestamp' }).notNull(),
  deletedAt:           integer('deleted_at', { mode: 'timestamp' }),
}, (t) => ({
  uniqueSlugPerTypeLocale: unique().on(t.contentTypeId, t.slug, t.locale),
  localeIdx:           index('entries_locale_idx').on(t.locale),
  translationGroupIdx: index('entries_translation_group_idx').on(t.translationGroupId),
  statusIdx:           index('entries_status_idx').on(t.status),
  publishedAtIdx:      index('entries_published_at_idx').on(t.publishedAt),
}))
```

`content_pages` uses the same hybrid pattern:

```ts
export const contentPages = sqliteTable('content_pages', {
  id:                  text('id').primaryKey(),
  translationGroupId:  text('translation_group_id').notNull(),
  locale:              text('locale').notNull(),
  parentId:            text('parent_id'),
  slug:                text('slug').notNull(),
  fullPath:            text('full_path').notNull(),   // indexed for slug/* lookups
  status:              text('status').notNull().default('draft'),
  publishedVersionId:  text('published_version_id'),
  content:             text('content').notNull(),     // JSON — array of block instances
  ...timestamps,
  deletedAt:           integer('deleted_at', { mode: 'timestamp' }),
}, (t) => ({
  uniquePathLocale:    unique().on(t.fullPath, t.locale),
  fullPathIdx:         index('pages_full_path_idx').on(t.fullPath),
  localeIdx:           index('pages_locale_idx').on(t.locale),
}))
```

#### Field system

1. Field type registry — `FieldDefinition` type, `registerFieldType`, built-in types
2. `buildZodSchema(fields: FieldDefinition[])` — Zod object for validating `data` JSON on write
3. `buildFormFields(fields: FieldDefinition[])` — `@tanstack/react-form` field config
4. Drizzle migrations for all entities

### 02-services-and-repositories

1. Repository helpers for each entity — typed Drizzle queries, pagination, soft delete
2. `findWithFallback(slug, locale, defaultLocale, db)` — tries `locale` first; if not found and `localeFallback=true`, returns the `defaultLocale` entry and sets `wasLocale: defaultLocale` on the result so the API can add `X-Nivora-Locale-Fallback` header
3. `findByTranslationGroup(translationGroupId, db)` — all locale variants for a logical content item
4. Content type service — CRUD, field validation, slug uniqueness, system type protection
5. Entry service — CRUD with `translationGroupId` generation on first entry; Zod validation against dynamic schema; status transitions
6. Translation service:
   - `createTranslation(entryId, targetLocale, db)` — creates a new entry in the same translation group, optionally copying `data` from source locale
   - `listTranslations(translationGroupId, db)` — all locale variants with their status
   - `deleteTranslation(entryId, db)` — cannot delete the last variant (would orphan the translation group)
7. Version service — create version on save, restore version, prune old versions
8. Page service — hierarchical path building, `publishedVersionId` management, locale-aware
9. Asset service — R2 upload/delete, metadata in D1, folder management, URL generation
10. Menu + taxonomy service — CRUD

### 03-resolution-pipeline

Runs at content delivery time. Enriches block/entry JSON with live data before sending to the frontend — the same pattern as Kantoor's `cms.service.ts`.

1. `resolveInternalLinks(content, locale)` — replace page ID references with resolved `fullPath` for the requested locale (falls back to `defaultLocale` path if no locale variant)
2. `resolveAssetReferences(content)` — replace asset IDs with `{ url, filename, contentType, width, height }`
3. `resolveRelations(content, populate?, locale?)` — expand relation field IDs to full entry objects; respects `?populate=` query param; locale-aware fallback
4. `resolveDynamicBlocks(content, locale)` — blocks that inject live data (e.g. "latest posts" block fetches actual entries at render time, respecting locale)
5. Pipeline runner — `resolveContent(content, options)` runs resolvers in order; each resolver is independently testable

### 04-api-routes

All routes use Hono + `@hono/zod-validator`. Locale is passed as a query param — never in the URL path.

1. Entries routes:
   - `GET /api/v1/:type` — list entries; `?locale=en` (defaults to `defaultLocale`); `?status=published`; pagination + filter + sort
   - `GET /api/v1/:type/:id` — single entry; `?locale=nl`; `?populate=author,tags`
   - `GET /api/v1/:type/slug/:slug` — by slug + locale; runs resolution pipeline
   - `GET /api/v1/:type/:id/translations` — all locale variants (status overview)

2. Pages routes:
   - `GET /api/v1/pages` — full tree for a locale (`?locale=nl`)
   - `GET /api/v1/pages/slug/*` — nested slug with locale param; runs resolution pipeline

3. Locale fallback response:
   - When fallback is triggered, response includes header `X-Nivora-Locale-Fallback: en` and body field `_locale: 'en'`
   - Consumers can use this to render a "viewing in English" notice

4. Blocks, assets, search, preview routes (locale-aware where applicable)

5. ETag support on all GET routes (304 Not Modified for unchanged content)

6. OpenAPI spec via `@hono/zod-openapi`

### 05-admin-content-types-and-entries

1. Content type list + builder — drag-and-drop field editor
2. Entry list — filterable `DataTable` per content type; locale column showing translation completeness (e.g. `EN ✓ | NL ✓ | DE —`)
3. `LocaleBar` — bar above the entry editor showing all `enabledLocales`; current locale highlighted; click to switch locale variant; badges for status per locale (draft / published / missing)
4. Entry editor — form from field definitions; `FieldRenderer` for each field type; tabbed (Content | SEO | Meta)
5. `TranslationManager` — drawer or tab showing all translations; "Create translation" copies data from a source locale to a new locale entry in the same translation group; shows which locales are missing
6. Version history panel — right drawer; list previous versions; restore with confirmation

### 06-admin-page-builder

1. Page tree — folder/page hierarchy; locale selector at tree level (shows tree for chosen locale, missing pages greyed out)
2. Block canvas + block field editor
3. `PreviewIframe` with `window.postMessage` sync
4. Preview token management (generate on open, refresh before expiry, revoke on close)
5. Block library sidebar

### 07-admin-assets-and-menus

Assets are locale-agnostic (same R2 file across all locales). Alt text and captions are stored in the asset metadata JSON as a map: `{ alt: { en: '...', nl: '...' } }`.

1. Asset library — grid/list, folder tree, filter by type, sort
2. Upload flow — drag-and-drop, multi-file, progress, R2 upload via server fn
3. Asset detail drawer — per-locale alt text + caption editing
4. Menu editor — nested drag-and-drop; each menu item can have locale-specific labels

### 08-search

1. MiniSearch index per locale — `search:index:<locale>` in KV (e.g. `search:index:en`, `search:index:nl`)
2. Index builder — indexes published entries by locale; configurable fields + boost weights per content type
3. Index lifecycle — rebuild on entry publish/unpublish via Queue job; load from KV on cold start
4. Search API — `GET /api/v1/search?q=&locale=en` — results include content type, slug, title snippet, score

---

## Key Design Decisions

### Hybrid JSON + indexed columns (not EAV)
EAV (Entity-Attribute-Value, as used by Magento) requires N JOINs to reconstruct an entity and produces unmaintainable SQL. Pure JSON loses filtering and indexing. The hybrid approach — JSON `data` column for field values, typed indexed columns for everything the API queries on — gives the flexibility of document storage with the queryability of relational storage.

### Locale-per-entry, not inline translations
Each locale is a separate DB row linked by `translation_group_id`. Benefits:
- Different publication state per locale (Dutch draft, English published)
- Different author per locale
- Simple `WHERE locale = ?` queries — no `json_extract` needed for locale filtering
- Slug can differ per locale (SEO-friendly URLs)
- Missing translations are simply absent rows — easy to detect

### Fallback: missing locale → `defaultLocale`, not 404
When `localeFallback=true` (default), a request for a locale that has no translation returns the `defaultLocale` content with a `X-Nivora-Locale-Fallback` header. Consumers can show a "content not available in your language" notice without the page breaking. Set `localeFallback=false` to return 404 for missing translations.

### Blocks are field configuration, not React components
Block library items are JSON field config stored in D1. The frontend decides how to render each block type by its `slug`. This decouples content authoring from frontend implementation.

### Resolution pipeline at delivery time
Block data is NOT resolved at save time. Resolvers run in `GET /api/v1/pages/slug/*` and similar endpoints. Dynamic blocks (e.g. "recent posts") always return current data without re-saving content.

### Preview via token + postMessage
The iframe listens for `postMessage` from the parent admin window. The admin sends field updates as the editor types (debounced 300ms). The preview token is only used for the initial draft content load.
