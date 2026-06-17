# TASK-001: Module type system + defineModuleConfig + merge utility

## Status
Planned

## Priority
Critical

## Type
Infrastructure

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
Define the TypeScript interfaces that describe every module's configuration, export a `defineModuleConfig` typed helper for module authors, and write a `deepMergeModuleConfig` utility that correctly handles all per-field merge strategies. This is the pure type/utility foundation — no file scanning, no Vite plugin, no runtime side effects.

## Business Value
Without a stable type contract, every module author must guess what keys are valid and what types are expected. A typed `defineModuleConfig` turns authoring errors into compile-time errors instead of silent runtime bugs. `deepMergeModuleConfig` is the shared primitive used by the generator (TASK-002) for local-overrides-npm-package scenarios.

## Acceptance Criteria
- [ ] `defineModuleConfig({ name: '@nivora-cms/core', ... })` returns a fully typed `ModuleConfig` — TypeScript catches invalid keys and wrong value types
- [ ] All `SettingsField` types (`string`, `number`, `boolean`, `select`, `multiselect`, `textarea`, `color`, `image`, `date`, `json`) are represented in the union
- [ ] `deepMergeModuleConfig(base, override)` correctly applies all merge strategies documented in `index.md`
- [ ] Barrel export from `src/core/module/index.ts` covers all public types and functions
- [ ] `pnpm lint` and `pnpm build` pass with zero errors

## Requirements
- `defineModuleConfig` is an identity function — it returns its argument unchanged; the value lies purely in the TypeScript generic constraint
- All interfaces use `interface` not `type` (project convention)
- No `any` — strict types throughout
- `SettingsField` uses a discriminated union on `type` so that `options` is only valid when `type` is `'select' | 'multiselect'`, `validation` is type-specific, etc.
- `DashboardWidget.dataSource` supports both `'serverFn'` and `'rest'` source types
- `SidebarItem` supports nested `children` for sub-navigation (max one level deep in v1)
- The merge utility is a pure function with no I/O; it must be independently testable

## Technical Design

### File structure
```
src/core/module/
├── types.ts      ← all interfaces + discriminated unions
├── define.ts     ← defineModuleConfig helper
├── merge.ts      ← deepMergeModuleConfig utility
└── index.ts      ← barrel export
```

### `types.ts` key shapes

```ts
// Discriminated union for settings fields
interface SettingsFieldBase {
  key: string
  label: string
  description?: string
  required?: boolean
}
interface StringField extends SettingsFieldBase {
  type: 'string' | 'textarea' | 'color' | 'image'
  default?: string
  validation?: { minLength?: number; maxLength?: number; pattern?: string }
}
interface NumberField extends SettingsFieldBase {
  type: 'number'
  default?: number
  validation?: { min?: number; max?: number }
}
interface BooleanField extends SettingsFieldBase {
  type: 'boolean'
  default?: boolean
}
interface DateField extends SettingsFieldBase {
  type: 'date'
  default?: string // ISO 8601
}
interface JsonField extends SettingsFieldBase {
  type: 'json'
  default?: unknown
}
interface SelectField extends SettingsFieldBase {
  type: 'select' | 'multiselect'
  options: Array<{ label: string; value: string }>
  default?: string | string[]
}
export type SettingsField =
  | StringField | NumberField | BooleanField | DateField | JsonField | SelectField
```

```ts
export interface SidebarItem {
  label: string
  icon: string           // lucide-react icon name, e.g. 'LayoutDashboard'
  route: string
  badge?: string
  children?: Omit<SidebarItem, 'children'>[]  // max one level deep
}

export interface SidebarGroup {
  group?: string   // undefined = ungrouped, appears at top
  order?: number   // lower = higher in sidebar
  items: SidebarItem[]
}
```

```ts
export interface DashboardWidget {
  id: string
  title: string
  description?: string
  component: string   // relative path to React component from module root
  dataSource?: {
    type: 'serverFn' | 'rest'
    endpoint: string        // serverFn export path or REST URL
    refreshInterval?: number // ms; undefined = no polling
  }
  size: 'sm' | 'md' | 'lg' | 'full'
  order?: number
}

export interface DashboardComponent {
  id: string
  component: string  // relative path from module root
  slot: string       // named slot in the dashboard layout
}
```

```ts
export interface ModuleConfig {
  name: string          // '@nivora-cms/module-name'
  extends?: string      // npm package this local module overrides

  database?: {
    migrations?: string // path to migrations dir (relative to module root)
    seeds?: string      // path to seeds dir
  }
  dashboard?: {
    widgets?: DashboardWidget[]
    components?: DashboardComponent[]
  }
  overwrites?: Record<string, string>  // target-module-name → local path
  search?: Array<{
    model: string
    fields: string[]
    weight?: Record<string, number>
  }>
  sidebar?: SidebarGroup[]
  routes?: {
    admin?: string  // path to routes/admin dir (relative to module root)
    api?: string    // path to routes/api dir
  }
  settings?: {
    fields: SettingsField[]
  }
  i18n?: {
    messages: string        // path to i18n dir (relative to module root)
    defaultLocale?: string  // defaults to 'en'
  }
  middleware?: {
    api?: string[]    // paths to middleware files
    admin?: string[]
  }
  emails?: Array<{
    id: string
    subject: string
    template: string  // path to template file
  }>
  permissions?: {
    file?: string  // path to permissions.ts
  }
}
```

### `define.ts`
```ts
export function defineModuleConfig(config: ModuleConfig): ModuleConfig {
  return config
}
```

### `merge.ts` — merge strategy per field
- `sidebar`: merge groups by `group` label; within each group, concatenate `items` (base first, override second); preserve `order` from override if provided
- `settings.fields`: merge by `key` — override wins on collision
- `dashboard.widgets`: merge by `id`
- `dashboard.components`: merge by `id`
- `emails`: merge by `id`
- `middleware.api` / `middleware.admin`: concatenate (base first)
- `overwrites`: `{ ...base.overwrites, ...override.overwrites }`
- `routes`: override replaces base entirely (`override.routes ?? base.routes`)
- `search`: override replaces base entirely
- `database`: override replaces base entirely
- `i18n`: override replaces base entirely
- `permissions`: override replaces base entirely

## Dependencies
None — this task has no upstream dependencies.

## Implementation Steps
1. Create `src/core/module/` directory
2. Write `src/core/module/types.ts` with all interfaces and discriminated unions
3. Write `src/core/module/define.ts` with `defineModuleConfig`
4. Write `src/core/module/merge.ts` with `deepMergeModuleConfig` — implement each field's strategy explicitly (no generic recursive deep merge)
5. Write `src/core/module/index.ts` barrel export
6. Run `pnpm lint` and fix any issues
7. Run `pnpm build` and confirm zero errors
8. Bump patch version in `package.json` and `nivora.config.json` (v0.2.0 → v0.2.1)

## Instructions for Developer
- The merge utility must be explicit per field, not a generic recursive merge. Generic deep merges produce wrong results for arrays (do you concat or replace?). Each field in `ModuleConfig` must have a documented, explicit merge decision.
- `defineModuleConfig` must NOT widen the return type. The return type must be `ModuleConfig`, not `typeof config` — otherwise downstream consumers lose the type constraint.
- The discriminated union for `SettingsField` must use a shared `type` discriminant so TypeScript narrows correctly. Test with `@ts-expect-error` on invalid combos.
- Do not use `Partial<ModuleConfig>` anywhere — all optional fields use `?` directly on the interface.

## Files Expected To Change
- `src/core/module/types.ts` — created
- `src/core/module/define.ts` — created
- `src/core/module/merge.ts` — created
- `src/core/module/index.ts` — created
- `package.json` — version bump
- `nivora.config.json` — version bump

---

## AI Context

### Relevant Files
- `plans/02-module-system/index.md` — full architecture decisions and merge strategy table
- `src/lib/utils.ts` — reference for utility file conventions
- `package.json` — current version (bump patch)

### Constraints
- No `any`
- `interface` over `type` for object shapes (project convention from AGENTS.md)
- No external dependencies in this task — pure TypeScript

### Validation Commands
```bash
pnpm lint
pnpm build
```

### Expected Outcome
`import { defineModuleConfig, deepMergeModuleConfig } from '#/core/module'` works, is fully typed, and `pnpm lint` + `pnpm build` pass clean.

---

## Test Plan

### Unit Tests
- Covered in TASK-006: unit tests for `deepMergeModuleConfig` covering each merge strategy and edge cases

### Integration Tests
- None at this level — types are tested by TypeScript compilation

### Manual Tests
1. In a scratch file, call `defineModuleConfig({ name: '@nivora-cms/test' })` and confirm autocomplete works
2. Try passing an invalid `type` in a `SettingsField` — confirm TypeScript error

## Definition of Done
- [ ] Code implemented per Acceptance Criteria
- [ ] Validation Commands all pass (`pnpm lint`, `pnpm build`)
- [ ] Task status updated to `Done` in this file
- [ ] Plan `index.md` Task Summary updated
- [ ] Completion Summary filled in below
- [ ] Feature branch PR opened against `plan/02-module-system`

## Risks
- Discriminated union for `SettingsField` may need `Extract<SettingsField, { type: T }>` helpers in the merge code — keep merge.ts lean, don't try to be too clever

## Notes
This task produces no runtime behavior — it's purely types and a pure utility. The value is entirely in the type safety it provides to TASK-002 (generator) and all future module authors.

---

## Progress Updates

### 2026-06-17
- Task created

---

## Completion Summary
(To be filled when complete)
