# @nivora-cms/ui — ✅ COMPLETE (commit 52e8ff6, merged develop db6d6bd, 2026-06-17)

The NIVORA design system. Tailwind CSS v4 + shadcn/ui primitives + a custom component library. Used by `@nivora-cms/admin`, `@nivora-cms/auth`, and `apps/admin` for all UI rendering.

## Depends on
Nothing (pure React + Tailwind — no CMS packages).

## Tech
- Tailwind CSS v4 (CSS-first, `@theme` tokens — NO `tailwind.config.js`)
- shadcn/ui (Radix-based, New York style)
- **`@iconify-json/tabler`** + **`unplugin-icons`** (Tabler icon set via Vite auto-import — replaces lucide-react)
- @fontsource (self-hosted fonts — Michroma display, Space Grotesk UI, JetBrains Mono code)
- cmdk (command palette / search)
- sonner (toast notifications)
- @tanstack/react-table (data tables)
- @tanstack/react-form (forms)
- class-variance-authority + clsx + tailwind-merge

## Icons

Iconify is used instead of lucide-react. The **Tabler** icon set (`@iconify-json/tabler`) is the default — 5000+ consistent 2px stroke icons with excellent admin UI coverage. `unplugin-icons` (Vite plugin) auto-imports icons as virtual React components with full tree-shaking.

```ts
// vite.config.ts (in apps/admin and packages/ui)
import Icons from 'unplugin-icons/vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'

export default {
  plugins: [
    Icons({
      compiler: 'jsx',
      jsx: 'react',
      autoInstall: false,    // icon packs installed explicitly
    }),
  ],
}
```

Usage:
```tsx
// Named import — tree-shaken, fully typed
import IconLayoutDashboard from '~icons/tabler/layout-dashboard'
import IconFilePlus from '~icons/tabler/file-plus'

<IconLayoutDashboard class="size-4" />
```

The `Icon` component from `@iconify/react` can be used for dynamic icon names (e.g. from `PackageConfig.navigation[].icon`):

```tsx
import { Icon } from '@iconify/react'
// icon name from PackageConfig.navigation
<Icon icon={`tabler:${item.icon}`} class="size-4" />
```

Icon names in `PackageConfig.navigation` use the Tabler slug format (kebab-case, no `tabler:` prefix) — the Sidebar component adds the prefix at render time.

## Directory Structure

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── ui/                       # Generated shadcn/ui files — do not edit directly
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── select.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── separator.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── AppShell.tsx          # Fixed sidebar + scrollable main
│   │   │   ├── Sidebar.tsx           # Nav groups; icon rendered via <Icon icon={`tabler:${item.icon}`} />
│   │   │   ├── TopBar.tsx            # Page title slot, search trigger, actions
│   │   │   ├── PageHeader.tsx        # Title + breadcrumb + action slot
│   │   │   └── ContentGrid.tsx       # Responsive grid wrapper
│   │   ├── data/
│   │   │   ├── DataTable.tsx         # @tanstack/react-table wrapper
│   │   │   ├── DataForm.tsx          # @tanstack/react-form wrapper with Zod integration
│   │   │   ├── TagInput.tsx          # Tag input for array settings fields
│   │   │   └── MediaPicker.tsx       # File selection modal; onFetch prop supplied by content package
│   │   └── feedback/
│   │       ├── CommandPalette.tsx    # cmdk integration, ⌘K shortcut, extensible commands
│   │       ├── ConfirmDialog.tsx     # Accessible confirmation modal
│   │       ├── EmptyState.tsx        # Illustrated empty state
│   │       └── toasts.ts             # Typed sonner helpers: toast.success(), toast.error()
│   ├── theme/
│   │   ├── ThemeProvider.tsx         # SSR-safe dark/light mode, cookie-persisted
│   │   ├── ThemeToggle.tsx           # Light / dark / system toggle button
│   │   └── tokens.css                # @theme design tokens — colors, typography, spacing, radii
│   └── utils.ts                      # cn() utility
├── components.json                   # shadcn/ui config (New York style)
└── nivora.config.ts
```

## `nivora.config.ts`

```ts
import { definePackageConfig } from '@nivora-cms/core'

export default definePackageConfig({
  name: 'UI',
  description: 'Design system — Tailwind v4, shadcn/ui, Tabler icons, component library',
  version: '0.1.0',

  routes: {
    admin: false,
    api: false,
  },

  settings: {
    defaultTheme: {
      type: 'string',
      input: 'radio',
      default: 'system',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
        { label: 'System', value: 'system' },
      ],
      label: 'Default theme',
      description: 'Initial theme before user sets a preference',
    },
    accentColor: {
      type: 'string',
      input: 'color',
      default: '#6366f1',
      label: 'Accent color',
      description: 'Primary brand color used for active states and CTAs',
    },
  },
})
```

## Phases

### 01-foundation
1. Package setup — `package.json`, `tsconfig.json`, Vite lib mode build config; explicit exports map
2. Tailwind CSS v4 — `tokens.css` with `@theme` block: color palette, typography scale, spacing, radii, shadows; all as CSS custom properties
3. shadcn/ui init — `components.json` (New York style, Tailwind v4 mode); generate base primitives
4. Icons setup:
   - Install `@iconify-json/tabler` and `@iconify/react`
   - Add `unplugin-icons` to Vite config (`compiler: 'jsx'`, `jsx: 'react'`)
   - Add TypeScript declaration for `~icons/*` virtual modules (shipped in `@types/unplugin-icons` or `env.d.ts`)
   - Document naming convention: Tabler icon slug → `tabler:<slug>` for dynamic use, `~icons/tabler/<slug>` for static import
5. Fonts — install `@fontsource/michroma`, `@fontsource/space-grotesk`, `@fontsource/jetbrains-mono`; import in `tokens.css`
6. `cn()` utility — `clsx` + `tailwind-merge`; exported from `@nivora-cms/ui/utils`
7. CRITICAL: Every `border-{side}` class must be accompanied by `border-border` — Tailwind v4 does not set border color automatically

### 02-layout-components
1. `AppShell` — fixed sidebar (240px) + scrollable main; CSS Grid layout
2. `Sidebar` — grouped nav items from props; `<Icon icon={`tabler:${item.icon}`} />` for dynamic nav icons; active state from router; collapsible to icon-only mode; user avatar strip at bottom
3. `TopBar` — breadcrumb slot, page title, `CommandPalette` trigger, user dropdown
4. `PageHeader` — `title`, `description`, `breadcrumb`, `actions` slot
5. `ContentGrid` — 12-column responsive CSS Grid wrapper

### 03-data-components
1. `DataTable` — @tanstack/react-table wrapper; column sorting, pagination, row selection, row actions dropdown
2. `DataForm` — @tanstack/react-form wrapper; Zod schema prop; field error display
3. `TagInput` — add/remove string tags; Enter to add, Backspace to remove last
4. `MediaPicker` — modal with asset grid; search; filter by type; `onFetch(options)` prop + `onSelect(assets[])` callback

### 04-feedback-and-overlay
1. Toast helpers — `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()`, `toast.promise()`
2. `CommandPalette` — cmdk modal; `⌘K`; `registerCommands(commands[])` API; built-in commands: navigation, recent entries, settings
3. `ConfirmDialog` — accessible; returns a promise for `await confirm()` usage pattern
4. `EmptyState` — icon + title + description + optional CTA

### 05-theming
1. `ThemeProvider` + `ThemeToggle` — migrated from existing Plan 01 work; SSR-safe; cookie-persisted (`theme=dark|light|system`)
2. CSS variable override API — document how `apps/admin` can override `--color-primary` etc. for white-label deployments

## Notes
- Generated shadcn/ui files live in `src/components/ui/` — never edit directly; create wrapper components instead
- All components export full TypeScript prop interfaces; no `any`
- Components are server-component-safe by default — only add `'use client'` when interaction is required
- `MediaPicker` does NOT fetch assets directly — it accepts an `onFetch` prop so `@nivora-cms/content` supplies the server fn
- `unplugin-icons` virtual modules require TypeScript declaration; add `/// <reference types="unplugin-icons/types/react" />` in `env.d.ts`
