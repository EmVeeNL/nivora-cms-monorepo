# @nivora-cms/admin

The admin shell — layouts, navigation, module registry, package route injection, dashboard framework, and the settings page. Consumes `@nivora-cms/ui` for all rendering. Domain-specific admin views (content, users, roles) live in their owning packages (`@nivora-cms/content`, `@nivora-cms/auth`) and are injected via `adminRouteFactory`.

## Depends on
- `@nivora-cms/core` (PackageConfig interfaces, definePackageConfig)
- `@nivora-cms/ui` (all components, design system)
- `@nivora-cms/auth` (session checks, permission hooks, `jwtOrApiKeyMiddleware`)
- `@nivora-cms/i18n` (all admin UI text)

## Tech
- TanStack Start (SSR React framework — the shell is a TanStack Start app when used in `apps/admin`)
- TanStack Router — programmatic `createRoute()` for package admin route injection
- @tanstack/react-query (data fetching in dashboard widgets and settings)
- Zod v4 (settings field validation)
- Generator script (`scripts/generate-modules.ts`) — emits `module-registry.gen.ts` + `api-registry.gen.ts`
- tsx + fast-glob (generator runtime)

## Directory Structure

```
packages/admin/
├── src/
│   ├── core/
│   │   ├── module-registry.gen.ts    # Generated — imports adminRouteFactory from each package
│   │   ├── api-registry.gen.ts       # Generated — imports apiRouter from each package
│   │   └── registry.ts               # Typed registry loader (reads gen files)
│   ├── layouts/
│   │   ├── AppShell.tsx              # Fixed sidebar + scrollable main
│   │   ├── Sidebar.tsx               # Nav groups from PackageConfig.navigation
│   │   └── TopBar.tsx                # Search trigger, breadcrumb, user menu
│   ├── routes/
│   │   ├── __root.tsx                # TanStack Router root route (session guard)
│   │   ├── _app.tsx                  # Authenticated layout route (AppShell)
│   │   ├── _app.index.tsx            # /admin — dashboard
│   │   └── _app.settings.tsx         # /admin/settings — package settings page
│   ├── router.tsx                    # Assembles route tree: file-based core + injected package routes
│   ├── dashboard/
│   │   ├── WidgetGrid.tsx
│   │   ├── widgets/
│   │   │   ├── RecentEntries.tsx
│   │   │   ├── StorageUsage.tsx
│   │   │   ├── ActiveUsers.tsx
│   │   │   └── QuickActions.tsx
│   │   └── fns/
│   │       └── dashboard.fns.ts      # createServerFn for widget data
│   └── settings/
│       ├── SettingsPage.tsx          # Renders PackageConfig.settings for all packages
│       ├── SettingsGroup.tsx         # Per-package settings section
│       ├── SettingsFieldRenderer.tsx # Renders switch / number / select / radio / tag-input
│       └── fns/
│           └── settings.fns.ts       # Read/write settings via KV
├── scripts/
│   └── generate-modules.ts           # Discovery + code generation script
└── nivora.config.ts
```

## `nivora.config.ts`

```ts
import { definePackageConfig } from '@nivora-cms/core'

export default definePackageConfig({
  name: 'Admin',
  description: 'Admin shell, navigation, dashboard, and settings',
  version: '0.1.0',

  dependencies: {
    '@nivora-cms/core': '^0.1.0',
    '@nivora-cms/ui': '^0.1.0',
    '@nivora-cms/auth': '^0.1.0',
    '@nivora-cms/i18n': '^0.1.0',
  },

  routes: {
    // The admin package IS the shell — it does not inject routes into itself
    admin: false,
    api: false,
  },

  navigation: {
    label: 'Dashboard',
    icon: 'layout-dashboard',
    route: '/admin',
    group: 'General',
    order: 0,
  },

  settings: {
    siteName: {
      type: 'string',
      input: 'text',
      default: 'NIVORA CMS',
      label: 'Site name',
      description: 'Displayed in the browser tab and admin header',
    },
    dateFormat: {
      type: 'string',
      input: 'select',
      default: 'DD/MM/YYYY',
      options: [
        { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
        { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
        { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
      ],
      label: 'Date format',
    },
    defaultLocale: {
      type: 'string',
      input: 'select',
      default: 'en',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Nederlands', value: 'nl' },
      ],
      label: 'Default locale',
    },
  },
})
```

## Phases

### 01-shell-and-module-system
1. Package config types — `PackageConfig`, `definePackageConfig`, `AdminRouteFactory` re-exported from `@nivora-cms/core` for convenience
2. `generate-modules.ts` discovery script — scans all workspace packages + `apps/admin/src/modules/*` for `nivora.config.ts`; emits `module-registry.gen.ts` (admin routes) and `api-registry.gen.ts` (API routers)
3. Vite plugin (`vite-plugin-nivora.ts`) — watches `*/nivora.config.ts` and re-runs generate script on change
4. Route tree assembly in `router.tsx` — imports file-based routes + all `adminRouteFactory` entries from generated registry; appends them as children of the `_app` layout route
5. `Sidebar.tsx` — reads `PackageConfig.navigation` from all registered packages; builds grouped nav items; filters by user permissions via `usePermission`
6. Local override semantics — `apps/admin/src/modules/<slug>/nivora.config.ts` with `extends: '@nivora-cms/<slug>'` deep-merges over the base package config

### 02-dashboard
1. Dashboard layout — `WidgetGrid` with responsive 12-column grid; widget add/remove/reorder (positions saved to KV)
2. Widget protocol — `DashboardWidget` config shape: `id`, `title`, `colSpan`, `component`; widgets register via the generated registry
3. Core widgets — "Recent Entries" (latest 5 published), "Storage Usage" (R2 used/limit), "Active Users" (sessions last 24h), "Quick Actions" (create entry, upload media)
4. Widget server fns — `createServerFn` in `dashboard/fns/dashboard.fns.ts` backed by D1 + R2 queries

### 03-settings-page
1. `SettingsPage.tsx` — reads all registered packages' `PackageConfig.settings`; groups by package
2. `SettingsFieldRenderer.tsx` — maps `input` type to the correct `@nivora-cms/ui` form component:
   - `switch` → `<Switch />`
   - `number` → `<Input type="number" min max />`
   - `select` → `<Select />`
   - `radio` → `<RadioGroup />`
   - `tag-input` → `<TagInput />`
   - `text` | `textarea` → `<Input />` | `<Textarea />`
3. Settings save — `settings.fns.ts` writes changed values to KV; only changed fields are written
4. Settings defaults — on first load, if a setting has no KV value, the `default` from `PackageConfig.settings` is used; defaults are NOT pre-written to KV

### 04-media-library
1. Media library route — `/admin/content/media` (provided here as a shell route; asset data comes from `@nivora-cms/content` server fns)
2. Grid/list view toggle, folder tree, filter by MIME type group, sort by date/size/name
3. Upload zone — drag-and-drop + file picker; multi-file; progress indicators; upload via `@nivora-cms/content` server fn
4. Asset detail drawer — preview, metadata, copy URL, rename, move to folder, delete with confirmation

## Notes
- The admin package is consumed by `apps/admin` — it is not deployed standalone
- `apps/admin/src/modules/` local modules take precedence over same-slug `@nivora-cms/*` packages in the registry (local override semantics)
- All sidebar navigation items are derived from `PackageConfig.navigation` across all registered packages — never hardcoded in `Sidebar.tsx`
- The settings page is generic: it renders any `PackageConfig.settings` schema — no package-specific code in this file
