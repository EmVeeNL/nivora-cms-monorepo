# TASK-004: Top Navigation Bar Component

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
Build the `TopBar` layout component that renders at the top of the main content area. It contains four layout regions in a horizontal row: a page title (left), a centred search input, icon action buttons (right of search), and a primary CTA button (far right). All content is injected via props.

## Business Value
The top bar provides the contextual identity of each page (title) and quick-access affordances (search, actions, CTA). Having it as a standalone component means any page can declare its own title and CTA while inheriting the consistent layout structure.

## Acceptance Criteria
- [ ] `src/layouts/TopBar.tsx` exists and exports a named `TopBar` component
- [ ] TopBar renders four regions in a horizontal flex row: `titleSlot`, `searchSlot`, `actionsSlot`, `ctaSlot`
- [ ] TopBar has a bottom border (`border-b border-border`)
- [ ] TopBar height is approximately 56 px (defined via a `--topbar-height` CSS variable)
- [ ] TopBar background matches the page background (`bg-background`)
- [ ] A `SearchInput` layout component is created in `src/components/SearchInput.tsx` (an unstyled input shell — no logic)
- [ ] `src/routes/index.tsx` (dashboard home) is updated to include `<TopBar>` with placeholder slot content
- [ ] `pnpm lint` and `pnpm build` pass with zero errors

## Requirements
- TopBar must span the full width of the main content area (not the full viewport — it lives inside the main column)
- TopBar should be `sticky` at the top of the main scroll container (position: sticky; top: 0)
- The search input shell must have the dark surface background, border, and rounded corners from the reference design
- The CTA button slot is a `React.ReactNode` — the caller decides what button to pass (shadcn/ui `Button` from TASK-001)
- TopBar must not import any hardcoded page title or icon

## Technical Design

### Structure
```
<header class="top-bar">
  ├── <div class="title-slot">     {titleSlot}   -- page title / breadcrumb
  ├── <div class="search-slot">    {searchSlot}  -- search input
  ├── <div class="actions-slot">   {actionsSlot} -- icon buttons
  └── <div class="cta-slot">       {ctaSlot}     -- primary button
```

### Props interface
```tsx
interface TopBarProps {
  titleSlot?: React.ReactNode;
  searchSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
  ctaSlot?: React.ReactNode;
}
```

### SearchInput props
```tsx
interface SearchInputProps {
  placeholder?: string;
  className?: string;
}
```

### Visual measurements (from reference design)
- TopBar height: 56 px (`--topbar-height: 56px`)
- Horizontal padding: 24 px (`px-6`)
- Search input width: ~280 px, height: 36 px
- Search input bg: `var(--color-surface)`, border: `var(--color-border)`, border-radius: 8 px
- Icon buttons: 32×32 px, `text-text-muted`
- CTA button: shadcn/ui `Button` with `variant="default"` (blue)

### Layout approach
```css
.top-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  height: var(--topbar-height);
  padding-inline: 1.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
}
```

Title slot takes its natural width (`shrink-0`); search slot grows to fill (`flex-1`); actions and CTA are `shrink-0`.

## Dependencies
- TASK-001 — CSS tokens and `cn()` must exist; shadcn/ui `Button` available
- TASK-002 — `AppShell` main area must exist (TopBar renders inside it)

## Implementation Steps
1. Add `--topbar-height: 56px` to the `:root` block in `src/styles.css`
2. Create `src/components/SearchInput.tsx`:
   - Render a `<div>` wrapper with the search icon (lucide `Search`) and an `<input>` element
   - Apply dark surface background, border, and rounded style
   - No `onChange` or state — purely structural
3. Create `src/layouts/TopBar.tsx`:
   - Define `TopBarProps` interface
   - Render the four-region horizontal flex `<header>` with sticky positioning
4. Export `TopBar` from `src/layouts/index.ts`
5. Update `src/routes/index.tsx`:
   - Import `TopBar`, `SearchInput`, and `Button` (from shadcn/ui)
   - Render `<TopBar>` at the top of the page with placeholder slots
6. Run `pnpm dev` — visually confirm the top bar sticks to the top as main content scrolls
7. Run `pnpm lint` and `pnpm build`

## Instructions for Developer
- Use `position: sticky; top: 0` (Tailwind: `sticky top-0`) — not `fixed`. The TopBar lives inside the scrollable main area and should scroll with the page but stick at the top of the visible area.
- `z-index: 10` (`z-10`) is required so the sticky TopBar overlaps content that scrolls beneath it
- The search slot should `flex-1` so it fills available space between the title and the action buttons
- `border-b border-border` — always both classes together (Tailwind v4 rule)
- Do not add any state, event handlers, or `useRef` inside `TopBar.tsx` — defer all behaviour to a later plan

## Files Expected To Change
- `src/styles.css` — add `--topbar-height: 56px`
- `src/components/SearchInput.tsx` — new file
- `src/layouts/TopBar.tsx` — new file
- `src/layouts/index.ts` — add TopBar export
- `src/routes/index.tsx` — add TopBar with placeholder slots

---

## AI Context

### Relevant Files
- `src/layouts/AppShell.tsx` — understand how the main area is structured
- `src/styles.css` — check existing CSS variables before adding new ones
- `src/components/ui/button.tsx` — import path for CTA button example
- `src/lib/utils.ts` — `cn()` utility

### Constraints
- Must use `sticky` positioning, not `fixed` — the TopBar scrolls with the page but sticks at the visible top
- Must not hardcode any page title, icon, or button label in `TopBar.tsx`
- `border-b` must always be paired with `border-border`
- The `SearchInput` must be a pure layout shell — no controlled/uncontrolled input state

### Validation Commands
```bash
pnpm lint
pnpm build
```

### Expected Outcome
The top navigation bar appears at the top of the main content area, sticks as the content beneath it scrolls, shows a page title on the left, a search input in the centre, and a CTA button on the right — matching the reference design's header region.

---

## Test Plan

### Unit Tests
None for this task.

### Integration Tests
None for this task.

### Manual Tests
1. Run `pnpm dev` and open `http://localhost:3000`
2. Confirm top bar renders with correct height (~56 px)
3. Add a tall spacer to the page — confirm top bar sticks as content scrolls beneath it
4. Confirm bottom border is visible (subtle dark border separating top bar from content)
5. Confirm search input has dark surface background with rounded corners
6. Confirm CTA button appears on the far right
7. Remove temporary spacer before committing

## Definition of Done
- [ ] Code implemented per Acceptance Criteria
- [ ] `pnpm lint` passes with zero errors
- [ ] `pnpm build` passes with zero errors
- [ ] Task status updated to `Done` in this file
- [ ] Plan `index.md` Task Summary updated (TASK-004 → Done, progress updated)
- [ ] Completion Summary filled in below
- [ ] Feature branch `feat/TASK-004-top-bar` PR opened against `develop`

## Risks
- `sticky` may not work if a parent container has `overflow: hidden` or `overflow: auto` — ensure the main content area uses `overflow-y: auto` only on the root scroll container, not on intermediate wrappers

## Notes
- The reference design shows two icon-button groups between the search and CTA: a notification bell and a settings/avatar icon — these can be placeholder `<button>` elements with lucide icons in `__root.tsx`

---

## Progress Updates

### 2026-06-16
- Task created

---

## Completion Summary
(To be filled when complete)
