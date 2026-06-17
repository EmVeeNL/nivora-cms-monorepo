# nivora.config.ts — Package Config Specification

Every `@nivora-cms/*` package and every `src/modules/*` local module **must** export a default `definePackageConfig(...)` from its `nivora.config.ts`. This file is the single source of truth for what a package contributes to the CMS: identity, navigation, permissions, DB tables, settings UI, API/admin route registration, and install lifecycle hooks.

The module registry generator reads these files to build `module-registry.gen.ts`.

---

## Full Shape

```ts
import { definePackageConfig } from '@nivora-cms/core'

export default definePackageConfig({

  // ─── Identity ──────────────────────────────────────────────────────────────

  name: 'Content',            // plain string OR i18n object { en: '...', nl: '...' }
  description: 'Content types, pages, and media management',
  version: '0.1.0',

  // Semver ranges — validated at install time
  dependencies: {
    '@nivora-cms/core': '^0.1.0',
    '@nivora-cms/adapter-cloudflare': '^0.1.0',
  },

  // ─── Routes ────────────────────────────────────────────────────────────────
  // true = this package exports an adminRouteFactory / apiRouter
  routes: {
    admin: true,
    api: true,
  },

  // ─── Permissions ───────────────────────────────────────────────────────────
  // dot-notation: '<package>.<resource>.<action>'
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
  ],

  // ─── Navigation ────────────────────────────────────────────────────────────
  // Single item or array. Items with the same `group` are visually grouped in
  // the sidebar. Groups are sorted by the lowest `order` value of their items.
  navigation: [
    {
      label: 'Pages',
      icon: 'layout',
      route: '/admin/content/pages',
      group: 'Content',
      order: 10,
      permission: 'content.pages.read',
    },
    {
      label: 'Entries',
      icon: 'file-text',
      route: '/admin/content/entries',
      group: 'Content',
      order: 20,
      permission: 'content.entries.read',
    },
    {
      label: 'Media',
      icon: 'image',
      route: '/admin/content/media',
      group: 'Content',
      order: 30,
      permission: 'content.media.read',
    },
    {
      label: 'Content Types',
      icon: 'settings-2',
      route: '/admin/content/types',
      group: 'Content',
      order: 40,
      permission: 'content.types.read',
    },
  ],

  // ─── Database ──────────────────────────────────────────────────────────────
  db: {
    migrations: './migrations',   // path to Drizzle migration files
    tables: [                     // D1 table names owned by this package
      'content_types',
      'content_entries',
      'content_versions',
      'content_pages',
      'content_page_versions',
      'block_library',
      'assets',
      'asset_folders',
      'menus',
      'menu_items',
    ],
  },

  // ─── Hooks ─────────────────────────────────────────────────────────────────
  hooks: {
    async beforeInstall() {
      // Validate D1 migration compatibility; check for conflicting table names
    },
    async afterInstall() {
      // Seed default content types (page, post)
      // Create default block library entries (hero, text, image)
    },
    async beforeUninstall() {
      // Warn (throw) if content entries exist — prevent accidental data loss
    },
    async afterUninstall() {
      // Clean up KV search index
    },
  },

  // ─── Settings ──────────────────────────────────────────────────────────────
  // These render as fields on the admin Settings page, grouped by package.
  // Values are stored in KV under `settings:<package-slug>:<key>`.
  settings: {

    // boolean → switch
    enableVersioning: {
      type: 'boolean',
      input: 'switch',
      default: true,
      label: 'Enable versioning',
      description: 'Keep a history of all content changes',
    },

    // number with constraints
    maxVersionsPerEntry: {
      type: 'number',
      input: 'number',
      default: 50,
      min: 1,
      max: 1000,
      label: 'Max versions per entry',
    },

    // string → select
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

    // string → radio
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

    // string → text (URL)
    previewUrl: {
      type: 'string',
      input: 'text',
      default: '',
      label: 'Preview base URL',
      description: 'e.g. https://mysite.com — used for the page builder preview iframe',
    },

    // number
    mediaMaxSizeMb: {
      type: 'number',
      input: 'number',
      default: 50,
      min: 1,
      max: 500,
      label: 'Max upload size (MB)',
    },

    // array → tag-input
    allowedMediaTypes: {
      type: 'array',
      input: 'tag-input',
      default: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
      itemType: 'string',
      label: 'Allowed media MIME types',
    },
  },

  // ─── Entities ──────────────────────────────────────────────────────────────
  // Informational — shown on the install screen; used for dependency resolution
  entities: [
    'ContentType',
    'ContentEntry',
    'ContentVersion',
    'ContentPage',
    'ContentPageVersion',
    'BlockLibraryItem',
    'Asset',
    'AssetFolder',
    'Menu',
    'MenuItem',
  ],

})
```

---

## TypeScript Types (defined in `@nivora-cms/core`)

```ts
export type LocalizedString = string | Record<string, string>

export interface NavigationItem {
  label: LocalizedString
  icon: string                  // Tabler icon slug (kebab-case, no prefix): 'layout-dashboard', 'file-text'
  route: string                 // admin route path
  group: string                 // sidebar group label
  order?: number
  permission?: string           // optional: hide if user lacks this permission
  children?: Omit<NavigationItem, 'group' | 'children'>[]
}

export type SettingsInputType =
  | 'text' | 'textarea' | 'number' | 'switch' | 'checkbox'
  | 'select' | 'radio' | 'tag-input' | 'color' | 'date' | 'json'

interface SettingsBase {
  label: LocalizedString
  description?: LocalizedString
  required?: boolean
}

interface BooleanField extends SettingsBase {
  type: 'boolean'
  input: 'switch' | 'checkbox'
  default?: boolean
}

interface NumberField extends SettingsBase {
  type: 'number'
  input: 'number'
  default?: number
  min?: number
  max?: number
}

interface StringField extends SettingsBase {
  type: 'string'
  input: 'text' | 'textarea' | 'color' | 'date'
  default?: string
  validation?: { minLength?: number; maxLength?: number; pattern?: string }
}

interface SelectField extends SettingsBase {
  type: 'string'
  input: 'select' | 'radio'
  default?: string
  options: Array<{ label: LocalizedString; value: string }>
}

interface ArrayField extends SettingsBase {
  type: 'array'
  input: 'tag-input'
  default?: string[]
  itemType: 'string' | 'number'
}

export type SettingsFieldConfig =
  | BooleanField | NumberField | StringField | SelectField | ArrayField

export interface PackageDbConfig {
  migrations?: string    // relative path to migrations directory
  tables?: string[]      // D1 table names this package owns
}

export interface PackageHooks {
  beforeInstall?: () => Promise<void>
  afterInstall?: () => Promise<void>
  beforeUninstall?: () => Promise<void>
  afterUninstall?: () => Promise<void>
}

export interface PackageConfig {
  name: LocalizedString
  description?: LocalizedString
  version: string
  dependencies?: Record<string, string>

  routes?: {
    admin?: boolean   // package exports adminRouteFactory
    api?: boolean     // package exports apiRouter from ./api
  }

  permissions?: string[]
  navigation?: NavigationItem | NavigationItem[]

  db?: PackageDbConfig
  hooks?: PackageHooks
  settings?: Record<string, SettingsFieldConfig>
  entities?: string[]
}

export function definePackageConfig(config: PackageConfig): PackageConfig {
  return config
}
```

---

## Settings Storage

Settings values are persisted in Cloudflare KV under the key pattern:

```
settings:<package-slug>:<field-key>
```

Example: `settings:content:enableVersioning` → `true`

The `@nivora-cms/admin` settings page reads the `PackageConfig.settings` map from every registered package, renders the appropriate input per `input` type, and writes values back to KV on save.

At runtime, packages read their settings via:

```ts
import { getSetting } from '@nivora-cms/adapter-cloudflare/kv'

const enableVersioning = await getSetting<boolean>('content', 'enableVersioning')
```

---

## Extends (local overrides)

A local module in `apps/admin/src/modules/` can override a `@nivora-cms/*` package:

```ts
// apps/admin/src/modules/content/nivora.config.ts
export default definePackageConfig({
  name: 'Custom Content',
  extends: '@nivora-cms/content',   // replaces this package in the registry

  // Only override what differs — rest is deep-merged from the base
  settings: {
    defaultEntryStatus: {
      type: 'string',
      input: 'select',
      default: 'published',   // different default
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      label: 'Default entry status',
    },
  },
})
```

Merge rules follow the same strategy as the old `ModuleConfig` deep-merge (see `plans/02-module-system` for field-level merge strategy).
