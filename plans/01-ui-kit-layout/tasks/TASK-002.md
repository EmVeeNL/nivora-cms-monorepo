# TASK-002: App Shell Layout Component

## Status
Planned

## Priority
Critical

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
Create the `AppShell` layout component that provides the two-region skeleton of the entire CMS: a fixed-width left sidebar region and a scrollable main content area to the right. This component is the root layout wrapper — every CMS page lives inside it.

## Business Value
Every page of the CMS shares the same chrome (sidebar + top bar). Having a single `AppShell` component means we change the layout once and all pages inherit it. Without this, each route would independently recreate the shell structure, causing divergence and duplication.

## Acceptance Criteria
- [ ] `src/layouts/AppShell.tsx` exists and exports a named `AppShell` component
- [ ] `AppShell` renders two regions: a fixed-position left sidebar column (240 px wide) and a right main content area that fills the remaining width
- [ ] The sidebar column does not scroll when the main content overflows vertically
- [ ] The main content area is independently scrollable
- [ ] `AppShell` accepts a `sidebar` prop (`React.ReactNode`) and a `children` prop (`React.ReactNode`)
- [ ] `src/routes/__root.tsx` is updated to wrap the route outlet with `<AppShell>`
- [ ] The full viewport is covered (no white flash, no uncovered area below the sidebar)
- [ ] `pnpm lint` and `pnpm build` pass with zero errors

## Requirements
- Full-height layout: both sidebar and main must fill 100 dvh (dynamic viewport height)
- Sidebar width controlled by the `--sidebar-width` CSS custom property (default: 240px)
- No horizontal scrollbar on the page
- Component is a pure layout shell — it must not import any icons, navigation data, or business logic

## Technical Design

### Structure
```
<div class="app-shell">          <!-- flex row, full viewport -->
  <aside class="sidebar-slot">   <!-- fixed, full height, --sidebar-width wide -->
    {sidebar prop}
  </aside>
  <main class="main-slot">       <!-- flex-1, overflow-y-auto -->
    {children}
  </main>
</div>
```

### CSS approach
Using Tailwind v4 utilities. The sidebar uses `fixed` positioning with full height; the main area uses `ml-[var(--sidebar-width)]` to offset for the fixed sidebar. Both regions share a dark background from `--color-background`.

### Props interface
```tsx
interface AppShellProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}
```

### Integration with TanStack Start
`src/routes/__root.tsx` defines the root layout for all routes via TanStack Router's `<Outlet />`. Wrap `<Outlet />` inside `<AppShell sidebar={<Sidebar />}>` here. The Sidebar component will be a placeholder `<div>` until TASK-003 is complete.

## Dependencies
- TASK-001 (Theme setup) — `--sidebar-width` CSS variable must exist; dark background token must be defined

## Implementation Steps
1. Add `--sidebar-width: 240px` to the `:root` block in `src/styles.css`
2. Create `src/layouts/AppShell.tsx`:
   - Define `AppShellProps` interface
   - Render a full-height flex container with sidebar (fixed) and main (offset by `--sidebar-width`)
3. Create `src/layouts/index.ts` re-exporting `AppShell` (barrel file for future layout exports)
4. Update `src/routes/__root.tsx`:
   - Import `AppShell`
   - Add a temporary placeholder `<aside>` as the `sidebar` prop (real sidebar comes in TASK-003)
   - Wrap `<Outlet />` in `<AppShell.Main>` or pass it as `children`
5. Run `pnpm dev` and verify the two-column layout is visible
6. Run `pnpm lint` and `pnpm build`

## Instructions for Developer
- Use `dvh` (dynamic viewport height) rather than `vh` to handle mobile browser chrome — `h-screen` in Tailwind v4 maps to `100dvh`
- The sidebar must be `position: fixed` (not `sticky`) so it stays put when the main content overflows
- Do not use CSS Grid for the top-level shell — the fixed sidebar requires the offset margin approach
- Keep `AppShell.tsx` under 40 lines — it is purely structural

## Files Expected To Change
- `src/styles.css` — add `--sidebar-width: 240px` to `:root`
- `src/layouts/AppShell.tsx` — new file
- `src/layouts/index.ts` — new barrel file
- `src/routes/__root.tsx` — wrap outlet with AppShell

---

## AI Context

### Relevant Files
- `src/routes/__root.tsx` — root route; read before modifying
- `src/styles.css` — add `--sidebar-width` here
- `AGENTS.md` — review Tailwind v4 border-color and layout conventions

### Constraints
- Must not use `100vh` — use `100dvh` (Tailwind `h-screen`) to support mobile browsers even though this is desktop-first
- Must not hard-code `240px` anywhere in the component — use `var(--sidebar-width)` from the CSS variable
- AppShell must not import any icon, navigation item, or data — it is purely structural

### Validation Commands
```bash
pnpm lint
pnpm build
```

### Expected Outcome
Visiting `http://localhost:3000` shows a full-height two-column layout: a 240 px dark left column (placeholder sidebar) and a scrollable right area, with no white flash or overflow.

---

## Test Plan

### Unit Tests
None for this task.

### Integration Tests
None for this task.

### Manual Tests
1. Run `pnpm dev` and open `http://localhost:3000`
2. Confirm sidebar column is fixed to the left at 240 px wide
3. Add a tall content block to the main area (temporary) — confirm only the right area scrolls; sidebar stays fixed
4. Inspect at 1440×900 — no horizontal scrollbar should appear
5. Remove temporary content before committing

## Definition of Done
- [ ] Code implemented per Acceptance Criteria
- [ ] `pnpm lint` passes with zero errors
- [ ] `pnpm build` passes with zero errors
- [ ] Task status updated to `Done` in this file
- [ ] Plan `index.md` Task Summary updated (TASK-002 → Done, progress updated)
- [ ] Completion Summary filled in below
- [ ] Feature branch `feat/TASK-002-app-shell` PR opened against `develop`

## Risks
- TanStack Start's SSR may cause hydration issues if the layout uses browser-only APIs — avoid `window` / `document` in the component

## Notes
- The `src/layouts/index.ts` barrel is not strictly required for TASK-002 but is a good habit that TASK-003 and TASK-004 will rely on

---

## Progress Updates

### 2026-06-16
- Task created

---

## Completion Summary
(To be filled when complete)
