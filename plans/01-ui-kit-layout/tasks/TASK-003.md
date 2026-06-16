# TASK-003: Sidebar Navigation Component

## Status
Planned

## Priority
High

## Type
Feature

## Owner
Team

## Created
2026-06-16

## Due Date
2026-06-18

## Parent Plan
../index.md

---

## Summary
Build the `Sidebar` layout component that renders inside the `AppShell`'s sidebar slot. It has three vertical regions: a logo/brand area at the top, a scrollable navigation item list in the middle, and a user profile strip pinned to the bottom. All content is injected via props — no hardcoded labels or icons.

## Business Value
The sidebar is the primary navigation affordance of the CMS. Getting its layout right early means all future pages automatically get correct navigation chrome without per-page duplication.

## Acceptance Criteria
- [ ] `src/layouts/Sidebar.tsx` exists and exports a named `Sidebar` component
- [ ] Sidebar renders a top logo area, a middle nav items area, and a bottom user strip — all three are always visible regardless of nav item count
- [ ] Each nav item displays an icon (left), a label (right), and applies an `isActive` visual state (blue background highlight)
- [ ] `NavItem` is a separate component exported from `src/components/NavItem.tsx`
- [ ] `Sidebar` accepts a `logoSlot`, `navItems`, and `userSlot` prop
- [ ] The nav items list scrolls independently if it overflows (unlikely at this scale, but required for resilience)
- [ ] `AppShell` in `__root.tsx` is updated to pass `<Sidebar>` instead of the placeholder `<aside>`
- [ ] `pnpm lint` and `pnpm build` pass with zero errors

## Requirements
- Sidebar background: `bg-surface` (CSS variable `--color-surface`)
- Right border: `border-r border-border` (Tailwind v4 — must include `border-border`)
- Nav item active state: `bg-primary/10 text-primary` (blue tint background, blue text)
- Nav item hover state: `hover:bg-surface-hover`
- Sidebar must fill the full height of its container (it lives inside the `fixed` sidebar column from AppShell)
- Component must be layout-only: no real route links, no `useRouter`, no data fetching

## Technical Design

### Component tree
```
<Sidebar>
  ├── <div class="logo-area">        {logoSlot}
  ├── <nav class="nav-area">         scrollable
  │   └── <NavItem> × n              icon + label + active
  └── <div class="user-strip">       {userSlot}
```

### Props interfaces
```tsx
// src/components/NavItem.tsx
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

// src/layouts/Sidebar.tsx
interface SidebarProps {
  logoSlot: React.ReactNode;
  navItems: React.ReactNode;   // caller renders <NavItem> list
  userSlot: React.ReactNode;
}
```

### Visual measurements (from reference design)
- Sidebar width: `var(--sidebar-width)` = 240 px (set in TASK-002)
- Logo area height: ~56 px
- Nav item height: ~40 px; icon size: 18 px; padding: 8 px 12 px
- User strip height: ~56 px
- Brand name text: `text-sm font-semibold text-text`

### Colours
```
sidebar bg:          bg-[var(--color-surface)]
right border:        border-r border-[var(--color-border)]
nav item default:    text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]
nav item active:     bg-[var(--color-primary)]/10 text-[var(--color-primary)]
user strip divider:  border-t border-[var(--color-border)]
```

## Dependencies
- TASK-001 — CSS custom properties and `cn()` utility must exist
- TASK-002 — `AppShell` sidebar slot must exist to accept the `<Sidebar>` component

## Implementation Steps
1. Create `src/components/NavItem.tsx`:
   - Define `NavItemProps` interface
   - Render an `<button>` with flex layout: icon left, label right, active/hover classes via `cn()`
2. Create `src/layouts/Sidebar.tsx`:
   - Define `SidebarProps` interface
   - Render three-region flex-column layout (logo top, nav middle flex-1 overflow-y-auto, user bottom)
   - Apply sidebar background and right border
3. Export `Sidebar` from `src/layouts/index.ts`
4. Update `src/routes/__root.tsx`:
   - Import `Sidebar` and placeholder icon/label data
   - Pass a real `<Sidebar>` to `AppShell`'s `sidebar` prop with example nav items using lucide-react icons
5. Run `pnpm dev` — visually confirm sidebar renders correctly
6. Run `pnpm lint` and `pnpm build`

## Instructions for Developer
- The `NavItem` click handler is `onClick?: () => void` — no routing in this task
- Use `lucide-react` for icons in the `__root.tsx` example (the Sidebar itself must not import any icons)
- Always use `border-r border-border` together — never `border-r` alone (Tailwind v4 border-color rule)
- The user strip must be pinned to the bottom: use `flex flex-col h-full` on the sidebar container and `mt-auto` on the user strip, or `justify-between` on the flex container

## Files Expected To Change
- `src/components/NavItem.tsx` — new file
- `src/layouts/Sidebar.tsx` — new file
- `src/layouts/index.ts` — add Sidebar export
- `src/routes/__root.tsx` — replace placeholder aside with `<Sidebar>`

---

## AI Context

### Relevant Files
- `src/layouts/AppShell.tsx` — understand the sidebar slot API before implementing
- `src/styles.css` — check available colour tokens
- `src/lib/utils.ts` — `cn()` utility for conditional classes
- `AGENTS.md` — review border-border convention and file naming rules

### Constraints
- Must not import `useNavigate`, `Link`, or any TanStack Router primitive — layout only
- Must not hardcode any icon or label string inside `Sidebar.tsx` itself — all content via props
- Must pair `border-r` with `border-border` (or the CSS variable equivalent)
- `NavItem` must use `<button>` not `<a>` — no href in this task

### Validation Commands
```bash
pnpm lint
pnpm build
```

### Expected Outcome
The sidebar renders as a dark-surfaced left column with a logo area at top, a list of icon+label navigation items in the middle (one item visually active with blue highlight), and a user profile strip at the bottom — matching the reference design's left panel.

---

## Test Plan

### Unit Tests
None for this task.

### Integration Tests
None for this task.

### Manual Tests
1. Run `pnpm dev` and open `http://localhost:3000`
2. Confirm sidebar has three distinct regions: logo top, nav middle, user bottom
3. Confirm one nav item has the active (blue tint) visual state
4. Hover over non-active nav items — confirm hover state appears
5. Confirm the user strip is always at the bottom regardless of nav item count
6. Confirm the right border of the sidebar is visible (subtle dark border)

## Definition of Done
- [ ] Code implemented per Acceptance Criteria
- [ ] `pnpm lint` passes with zero errors
- [ ] `pnpm build` passes with zero errors
- [ ] Task status updated to `Done` in this file
- [ ] Plan `index.md` Task Summary updated (TASK-003 → Done, progress updated)
- [ ] Completion Summary filled in below
- [ ] Feature branch `feat/TASK-003-sidebar-component` PR opened against `develop`

## Risks
- Tailwind v4 opacity modifier syntax (`bg-primary/10`) may require the colour to be registered in `@theme` as an RGB or OKLCH value — verify this works; if not, use a hardcoded `rgba()` fallback

## Notes
- Reference design shows ~8 nav items in the sidebar: Home, Products, Email, Customers, Payouts, Library, Settings, Help — use these as example data in `__root.tsx` but keep them as strings/icons passed from outside `Sidebar.tsx`

---

## Progress Updates

### 2026-06-16
- Task created

---

## Completion Summary
(To be filled when complete)
