# TASK-005: Core module scaffold (`@nivora-cms/core`)

## Status
Planned

## Priority
High

## Type
Feature

## Owner
Team

## Created
2026-06-17

## Due Date
—

## Parent Plan
../index.md

---

## Summary
Create the `@nivora-cms/core` module at `src/modules/core/` following the full module directory structure. This includes a complete `nivora.config.ts`, English translations, the admin route that replaces `src/routes/_app/index.tsx`, a permissions skeleton, and all required subdirectories. This is the reference implementation that demonstrates every convention introduced in this plan.

## Business Value
The core module is both the foundation of the CMS (it owns the dashboard home and core settings) and the canonical example for future module authors. Getting it right establishes the patterns that all other modules will follow.

## Acceptance Criteria
- [ ] `src/modules/core/` exists with the full directory structure listed below
- [ ] `src/modules/core/nivora.config.ts` is valid, fully typed, and passes `pnpm lint`
- [ ] `src/modules/core/i18n/en.json` covers at minimum: sidebar labels, dashboard title, and page titles
- [ ] `src/modules/core/routes/admin/index.ts` exports `adminRouteFactory` which renders the dashboard home at `path: '/'`
- [ ] `src/routes/_app/index.tsx` is deleted — the core module admin route is the sole source of truth for `/`
- [ ] `src/modules/core/permissions.ts` defines the core permissions skeleton (no enforcement yet)
- [ ] After running `pnpm generate-modules`, the core module appears in `moduleRegistry`
- [ ] `pnpm dev` starts and `/` renders the dashboard home from the module route
- [ ] `pnpm lint` and `pnpm build` pass

## Requirements
- Every subdirectory in the module structure must exist (empty directories get a `.gitkeep` file)
- All non-empty files must be fully typed (no `any`)
- The dashboard home component migrated into the module must be visually identical to the current one in `src/routes/_app/index.tsx`
- The admin route component is lazy-loaded via `lazyRouteComponent`
- `permissions.ts` exports a typed `CorePermissions` object — structure to be enforced in the permissions plan

## Technical Design

### Full directory structure
```
src/modules/core/
├── nivora.config.ts
├── i18n/
│   └── en.json
├── routes/
│   ├── admin/
│   │   ├── index.ts            ← adminRouteFactory export
│   │   └── DashboardPage.tsx   ← migrated from src/routes/_app/index.tsx
│   └── api/
│       └── index.ts            ← placeholder (no API routes in core yet)
├── components/
│   └── .gitkeep
├── widgets/
│   └── .gitkeep
├── services/
│   └── .gitkeep
├── schema/
│   └── .gitkeep
├── types/
│   └── .gitkeep
├── assets/
│   └── .gitkeep
├── database/
│   ├── migrations/
│   │   └── .gitkeep
│   └── seeds/
│       └── .gitkeep
├── middleware/
│   └── .gitkeep
├── emails/
│   └── .gitkeep
└── permissions.ts
```

### `nivora.config.ts`
```ts
import { defineModuleConfig } from '#/core/module/index.ts'

export default defineModuleConfig({
  name: '@nivora-cms/core',

  sidebar: [
    {
      group: undefined,  // ungrouped — appears at the very top
      order: 0,
      items: [
        {
          label: 'Dashboard',
          icon: 'LayoutDashboard',
          route: '/',
        },
      ],
    },
    {
      group: 'System',
      order: 100,
      items: [
        {
          label: 'Settings',
          icon: 'Settings',
          route: '/settings',
        },
      ],
    },
  ],

  routes: {
    admin: './routes/admin',
    api: './routes/api',
  },

  settings: {
    fields: [
      {
        key: 'site_name',
        type: 'string',
        label: 'Site Name',
        description: 'Used in page titles and meta tags',
        default: 'NIVORA CMS',
        required: true,
      },
      {
        key: 'site_description',
        type: 'textarea',
        label: 'Site Description',
        default: '',
      },
      {
        key: 'default_locale',
        type: 'select',
        label: 'Default Language',
        default: 'en',
        options: [{ label: 'English', value: 'en' }],
      },
      {
        key: 'timezone',
        type: 'string',
        label: 'Timezone',
        default: 'UTC',
      },
    ],
  },

  i18n: {
    messages: './i18n',
    defaultLocale: 'en',
  },

  permissions: {
    file: './permissions.ts',
  },
})
```

### `i18n/en.json`
```json
{
  "nav.dashboard": "Dashboard",
  "nav.settings": "Settings",
  "dashboard.title": "Dashboard",
  "dashboard.welcome": "Welcome to NIVORA CMS",
  "settings.title": "Settings",
  "settings.site_name.label": "Site Name",
  "settings.site_description.label": "Site Description",
  "settings.default_locale.label": "Default Language",
  "settings.timezone.label": "Timezone"
}
```

### `routes/admin/index.ts`
```ts
import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import type { AnyRoute } from '@tanstack/react-router'

export const adminRouteFactory = (parentRoute: AnyRoute) =>
  createRoute({
    getParentRoute: () => parentRoute,
    path: '/',
    component: lazyRouteComponent(() => import('./DashboardPage')),
  })
```

### `routes/admin/DashboardPage.tsx`
Migrate the component currently in `src/routes/_app/index.tsx`. This file will contain the JSX for the dashboard home page — identical to the current implementation.

### `routes/api/index.ts`
```ts
// Placeholder — API routes for the core module will be added in the content API plan
export {}
```

### `permissions.ts`
```ts
export const CorePermissions = {
  DASHBOARD_VIEW: 'core:dashboard:view',
  SETTINGS_VIEW: 'core:settings:view',
  SETTINGS_EDIT: 'core:settings:edit',
} as const

export type CorePermission = (typeof CorePermissions)[keyof typeof CorePermissions]
```

## Dependencies
- TASK-001 — `defineModuleConfig` must exist
- TASK-002 — generator must exist to pick up this module
- TASK-003 — `adminRouteFactory` contract defined; router must be ready to consume it

## Implementation Steps
1. Create the full directory structure (with `.gitkeep` files for empty dirs)
2. Write `src/modules/core/nivora.config.ts`
3. Write `src/modules/core/i18n/en.json`
4. Write `src/modules/core/permissions.ts`
5. Write `src/modules/core/routes/api/index.ts` (placeholder stub)
6. Write `src/modules/core/routes/admin/index.ts` (factory)
7. Migrate dashboard component from `src/routes/_app/index.tsx` → `src/modules/core/routes/admin/DashboardPage.tsx`
   - Copy content, adjust import paths if needed (they use `#/` aliases — these still work)
   - Rename the default export to `DashboardPage` (named export, not default)
8. Delete `src/routes/_app/index.tsx` — TanStack Router will regenerate `routeTree.gen.ts` without it
9. Run `pnpm generate-routes` (or let `pnpm dev` trigger it) to update `routeTree.gen.ts`
10. Run `pnpm generate-modules` to include the core module in the registry
11. Run `pnpm dev` and confirm `/` renders correctly
12. Run `pnpm lint` and `pnpm build`
13. Bump patch version

## Instructions for Developer
- When migrating `DashboardPage` from `src/routes/_app/index.tsx`, the existing file uses `createFileRoute` — strip that entirely. The new component file is just a React component file with a named export (`export function DashboardPage()`), not a route file.
- After deleting `src/routes/_app/index.tsx`, TanStack Router may show a warning about the missing route — this is expected and resolves once the router is rebuilt with the module route in place.
- The `lazyRouteComponent` import comes from `@tanstack/react-router`. If it's not available in the installed version, use `React.lazy(() => import('./DashboardPage'))` with a `<Suspense>` boundary on the parent — check the installed version first.
- Do NOT put navigation or sidebar rendering logic in the module. The `Sidebar` component in `src/layouts/Sidebar.tsx` will eventually read from `getAllSidebarGroups()` (wired in a future plan). For now, the sidebar nav items in `src/routes/_app.tsx` remain hardcoded — the sidebar wiring is a follow-up.

## Files Expected To Change
- `src/modules/core/` — entire directory tree created
- `src/routes/_app/index.tsx` — deleted
- `src/routeTree.gen.ts` — auto-regenerated (loses `AppIndexRoute`)
- `package.json` — version bump
- `nivora.config.json` — version bump

---

## AI Context

### Relevant Files
- `src/routes/_app/index.tsx` — component to migrate; read it before starting
- `src/routes/_app.tsx` — parent layout; check imports it uses that DashboardPage might need
- `src/core/module/types.ts` — (TASK-001) ModuleConfig interface
- `src/core/module/define.ts` — (TASK-001) defineModuleConfig
- `src/core/module-registry.gen.ts` — (TASK-002) generator output; run generate-modules after task
- `plans/02-module-system/index.md` — merge strategy and directory structure spec

### Constraints
- Dashboard home component must be visually identical to current — do not refactor or restyle
- All import paths use `#/` alias (`#/components/...`, `#/layouts/...`) — these resolve correctly from anywhere in `src/`
- No functional changes to the dashboard in this task — pure structural migration

### Validation Commands
```bash
pnpm generate-modules
pnpm dev  # manual: confirm / renders correctly
pnpm lint
pnpm build
```

### Expected Outcome
`pnpm dev` renders the dashboard home at `/`, sourced from the core module's admin route. `pnpm generate-modules` lists `@nivora-cms/core` in the generated registry.

---

## Test Plan

### Unit Tests
- None — this is structural migration, covered by visual manual test

### Integration Tests
- Covered in TASK-006: assert core module appears in `moduleRegistry` with correct `name` and `sidebar`

### Manual Tests
1. `pnpm dev` — navigate to `http://localhost:3000/` — dashboard renders identically to pre-migration
2. `pnpm generate-modules` — inspect `src/core/module-registry.gen.ts` — confirm `@nivora-cms/core` import
3. `pnpm collect-i18n` — inspect `src/i18n/merged/en.json` — confirm `core.*` keys present

## Definition of Done
- [ ] Code implemented per Acceptance Criteria
- [ ] Validation Commands all pass (`pnpm lint`, `pnpm build`)
- [ ] Task status updated to `Done` in this file
- [ ] Plan `index.md` Task Summary updated
- [ ] Completion Summary filled in below
- [ ] Feature branch PR opened against `plan/02-module-system`

## Risks
- After deleting `src/routes/_app/index.tsx`, the TanStack Router plugin may emit warnings or errors during `pnpm dev` until the new module route is registered. These are transient — running `pnpm generate-modules` and restarting dev resolves them.
- `lazyRouteComponent` availability: verify this export exists in the installed `@tanstack/react-router` version before using it

## Notes
The sidebar items defined in `nivora.config.ts` (Dashboard, Settings) are future-use — no sidebar wiring happens in this plan. The `Sidebar` component in `src/routes/_app.tsx` continues to use its hardcoded `NAV_ITEMS` array for now. Sidebar wiring from module configs is a follow-up task in a future plan.

---

## Progress Updates

### 2026-06-17
- Task created

---

## Completion Summary
(To be filled when complete)
