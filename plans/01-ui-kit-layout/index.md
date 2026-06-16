# Project: UI Kit — Dashboard Layout

## Overview
Build a reusable, dark-themed UI kit for the NIVORA CMS admin interface modelled on a modern SaaS dashboard design (reference: Diggo Dribbble shot). This plan covers **layout-only** components: the app shell (sidebar + main area), the top navigation bar, and the structural skeleton of the dashboard home page. No real content, no routing, no business logic — only composable React layout components styled with Tailwind CSS v4 and shadcn/ui primitives.

## Goals
- Establish a consistent dark-mode design system using CSS custom properties and Tailwind v4
- Install and configure shadcn/ui as the primitive component library
- Build a reusable `AppShell` layout (fixed sidebar + scrollable main area) that every CMS page will inherit
- Create the Sidebar and TopBar layout components matching the reference design
- Scaffold the Dashboard home page structure: onboarding cards row, metrics row, and the two-column bottom area (table + side panel)
- Document every component's prop API via TypeScript interfaces

## Success Criteria
- [ ] shadcn/ui is installed, `components.json` is committed, and `src/lib/utils.ts` (`cn`) is present
- [ ] Dark-mode CSS custom properties are defined in `src/styles.css` under `@theme`
- [ ] `AppShell` renders with a fixed 240 px sidebar and a scrollable main content area
- [ ] `Sidebar` displays a logo area, nav items (icon + label + active state), and a user profile strip at the bottom
- [ ] `TopBar` displays a page title slot, a search input, icon action buttons, and a primary CTA button
- [ ] Dashboard home page layout renders all three sections (onboarding row, metrics row, two-column content)
- [ ] All components are fully TypeScript-typed — no `any`
- [ ] `pnpm lint` and `pnpm build` pass with zero errors
- [ ] Tailwind v4 border-color convention (`border-border`) is used throughout

## Scope

### In Scope
- Dark-mode theme setup: CSS custom properties, Tailwind `@theme` block, colour palette
- shadcn/ui installation and `components.json` configuration
- `AppShell` layout component (sidebar slot + main content slot)
- `Sidebar` navigation component (logo, nav items, user strip) — layout only
- `TopBar` component (title, search, actions, CTA) — layout only
- Dashboard home page layout wrapper
- Onboarding cards row layout (4-column horizontal strip)
- Metrics row layout (4 stat cards)
- Two-column bottom layout (wide table area + narrow side panel)
- Base `Card` layout shell (header, body slots)

### Out of Scope
- Real navigation links or TanStack Router integration
- Content population or real data
- Mobile / responsive layout (desktop-first, 1280 px+ viewport assumed)
- Sidebar collapsed / expanded toggle animation
- Light mode or theme switcher
- API integration of any kind
- Automated tests (deferred to a later plan)
- Accessibility audit (deferred)
- Animation or transition polish

## Status
Status: Done
Progress: 100%

## Milestones
| Milestone | Status | Due |
|-----------|--------|-----|
| Theme & shadcn/ui setup | Done | 2026-06-17 |
| App shell (sidebar + top bar) | Done | 2026-06-17 |
| Dashboard home page layout | Done | 2026-06-17 |
| Section layouts (onboarding, metrics, two-col) | Done | 2026-06-17 |
| SSR theme + 4 alternative layouts | In Progress | 2026-06-22 |

## Architecture
- **Framework**: TanStack Start (React 19, SSR) — routes in `src/routes/`, layouts in `src/layouts/`
- **Styling**: Tailwind CSS v4, CSS-first. All design tokens in `src/styles.css` via `@theme {}`. No `tailwind.config.js`.
- **UI primitives**: shadcn/ui — generated files in `src/components/ui/`. Extend (do not edit) via wrapper components in `src/components/`.
- **Utilities**: `cn()` in `src/lib/utils.ts` (merges Tailwind classes safely via `clsx` + `tailwind-merge`)
- **Path aliases**: `#/*` → `./src/*` (configured in `package.json` `imports`)
- **Icons**: `lucide-react` (already installed)

## Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| shadcn/ui + Tailwind v4 compatibility | High | Use `shadcn@latest`; verify `components.json` sets `tailwind.version: 4`; test `Button` renders before proceeding |
| Tailwind v4 border-color default change | Medium | Enforce `border-border` convention in AGENTS.md and code-review checklist |
| React 19 peer-dep conflicts with shadcn/ui packages | Medium | Use `--legacy-peer-deps` only if unavoidable; pin versions that work |
| `#/*` path alias not resolved by shadcn/ui codegen | Low | Verify generated imports; adjust `components.json` `aliases` if needed |

## Dependencies
- `tailwindcss@^4` — already installed
- `lucide-react@^0.545` — already installed
- `shadcn/ui` — to be installed in TASK-001
- `clsx` + `tailwind-merge` — installed as part of shadcn/ui init

## Decisions

### 2026-06-16
- **Dark mode only** for this plan — no light/dark toggle. Dark palette defined as default (`:root`) tokens.
- **CSS custom properties** for colour tokens rather than hardcoded Tailwind classes, enabling easy future theming.
- **240 px fixed sidebar width** — defined as a CSS variable `--sidebar-width` so it can be changed in one place.
- **Named-slot pattern** for `AppShell`: `<AppShell.Sidebar>` and `<AppShell.Main>` instead of positional children, for explicitness.
- **Layout-only constraint**: every component in this plan accepts `children: React.ReactNode` for content slots. No hardcoded labels, counts, or icons.
- **`src/layouts/` directory** for shell-level components; `src/components/` for reusable UI pieces. This mirrors the TanStack Start convention.

## Task Summary

| ID | Title | Status | Priority | Owner |
|----|-------|--------|----------|-------|
| TASK-001 | Theme & shadcn/ui Setup | Done | Critical | Team |
| TASK-002 | App Shell Layout Component | Done | Critical | Team |
| TASK-003 | Sidebar Navigation Component | Done | High | Team |
| TASK-004 | Top Navigation Bar Component | Done | High | Team |
| TASK-005 | Dashboard Home Page Layout | Done | High | Team |
| TASK-006 | Onboarding Cards Row Layout | Done | Medium | Team |
| TASK-007 | Metrics Row Layout | Done | Medium | Team |
| TASK-008 | Two-Column Content Layout | Done | Medium | Team |
| TASK-009 | SSR Dark/Light Mode & 4 Alt Layouts | Done | High | Team |

## Task Links
- [TASK-001](tasks/TASK-001.md)
- [TASK-002](tasks/TASK-002.md)
- [TASK-003](tasks/TASK-003.md)
- [TASK-004](tasks/TASK-004.md)
- [TASK-005](tasks/TASK-005.md)
- [TASK-006](tasks/TASK-006.md)
- [TASK-007](tasks/TASK-007.md)
- [TASK-008](tasks/TASK-008.md)
- [TASK-009](tasks/TASK-009.md)

## Test Strategy

### Unit Tests
Deferred to a later plan. Layout components are visual — unit tests add little value until behaviour (routing, state) is added.

### Integration Tests
Deferred. No API or data layer in this plan.

### Manual Tests
- Open `http://localhost:3000` after `pnpm dev` and visually compare against the reference design screenshot
- Verify the sidebar is fixed and does not scroll with the main content
- Verify the main content area is independently scrollable
- Verify all components render without console errors
- Verify `pnpm build` produces a valid bundle with no TypeScript errors
- Check at 1440×900 viewport (target size)

## Deployment Plan
1. Feature branches merged to `develop` task-by-task via squash PRs
2. After TASK-008 is Done, cut `release/v0.1.0` from `develop`
3. Merge `release/v0.1.0` → `main`, tag `v0.1.0`
4. Back-merge `release/v0.1.0` → `develop`

## Rollback Plan
1. Revert the feature branch PR(s) on `develop`
2. If shadcn/ui causes irreversible issues: `pnpm remove` installed packages and restore `src/styles.css` from git
3. Validate `pnpm build` passes after rollback

## Documentation
- This `index.md` is the authoritative plan document
- Component prop interfaces serve as inline API documentation
- `AGENTS.md` at repo root covers all conventions referenced here

## Open Questions
- Should the sidebar use a `<nav>` element with `aria-label` now, or defer accessibility to a later plan?
- Is 240 px the right sidebar width, or should it be 260 px to match the reference more closely?
- Should `AppShell` be a TanStack Start `_layout.tsx` route, or a standalone component imported by `__root.tsx`?

## Change Log

### 2026-06-17
- TASK-001 through TASK-008 implemented and verified (`pnpm lint` + `pnpm build` pass)
- SSR dark/light mode: blocking script in `__root.tsx`, CSS variables in `:root` / `.dark`
- TASK-009 planned: SSR `ThemeProvider`, `ThemeToggle`, 4 alternative dashboard layouts

### 2026-06-16
- Plan created
- Reference design: Dribbble dark SaaS dashboard ("Diggo")
- Reference design: Dribbble dark SaaS dashboard ("Diggo") — dark background, fixed left sidebar with icon+label nav items, top bar with search and CTA, dashboard home with 4-column onboarding row, 4-metric stats row, and two-column bottom layout (table + customers panel)
