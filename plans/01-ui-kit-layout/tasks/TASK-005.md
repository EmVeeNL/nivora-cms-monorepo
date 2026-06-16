# TASK-005: Dashboard Home Page Layout

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
2026-06-19

## Parent Plan
../index.md

---

## Summary
Create the overall page layout for the Dashboard home route. This is the outer wrapper that composes the `TopBar` and the three content sections (onboarding row, metrics row, two-column bottom) into a single scrollable page. The sections themselves are implemented in TASK-006, TASK-007, and TASK-008; this task provides the page frame and section slots.

## Business Value
The dashboard home is the first thing an admin sees after login. Establishing its layout structure early validates the entire layout system (AppShell → TopBar → page sections) end-to-end before filling in individual sections.

## Acceptance Criteria
- [ ] `src/layouts/DashboardLayout.tsx` exists and exports a named `DashboardLayout` component
- [ ] `DashboardLayout` renders the `TopBar` at the top and a padded content area below it
- [ ] The content area has `24 px` padding on all sides (`p-6`)
- [ ] `DashboardLayout` accepts four section slots as props: `topBarSlot`, `section1`, `section2`, `section3`
- [ ] `src/routes/index.tsx` is updated to use `<DashboardLayout>` with placeholder sections
- [ ] A `SectionTitle` component is created in `src/components/SectionTitle.tsx` for section heading labels
- [ ] `pnpm lint` and `pnpm build` pass with zero errors

## Requirements
- Content area background: `bg-background` (same as the page — the sections themselves define their own surface)
- Sections are stacked vertically with `24 px` gap between them (`gap-6`)
- `DashboardLayout` must not know about the internal structure of each section — it accepts them as `React.ReactNode` slots
- The component must render correctly with empty / undefined section slots (graceful degradation)

## Technical Design

### Structure
```
<DashboardLayout>
  ├── <TopBar ... />                             (topBarSlot prop)
  └── <div class="content-area">                 p-6, flex-col, gap-6
      ├── {section1}                             TASK-006: Onboarding cards
      ├── {section2}                             TASK-007: Metrics row
      └── {section3}                             TASK-008: Two-column content
```

### Props interface
```tsx
interface DashboardLayoutProps {
  topBarSlot?: React.ReactNode;
  section1?: React.ReactNode;
  section2?: React.ReactNode;
  section3?: React.ReactNode;
}
```

### SectionTitle props
```tsx
interface SectionTitleProps {
  children: React.ReactNode;
  action?: React.ReactNode; // optional right-aligned element (e.g. "View all" link)
  className?: string;
}
```

### Visual measurements (from reference design)
- Content area padding: 24 px (`p-6`)
- Gap between sections: 24 px (`gap-6`)
- Section title font: `text-base font-semibold text-text`
- Section title margin-bottom: 16 px before the section content

## Dependencies
- TASK-001 — theme tokens
- TASK-002 — AppShell (DashboardLayout lives inside the main slot)
- TASK-003 — Sidebar (already composing into AppShell by this point)
- TASK-004 — TopBar (imported and composed in DashboardLayout)

## Implementation Steps
1. Create `src/components/SectionTitle.tsx`:
   - Render an `<h2>` with a right-aligned `action` slot in a flex row
   - Apply section title styles (`text-base font-semibold`)
2. Create `src/layouts/DashboardLayout.tsx`:
   - Define `DashboardLayoutProps`
   - Render `topBarSlot` at the top, followed by a `<div class="content p-6 flex flex-col gap-6">` containing the three section slots
3. Export `DashboardLayout` from `src/layouts/index.ts`
4. Update `src/routes/index.tsx`:
   - Replace existing content with `<DashboardLayout>` with placeholder `<div>` sections for each slot
   - Pass a real `<TopBar>` to `topBarSlot` with "Home" as the title
5. Run `pnpm dev` — confirm the page renders with correct padding and spacing
6. Run `pnpm lint` and `pnpm build`

## Instructions for Developer
- Keep `DashboardLayout` free of any section-specific logic — it only handles spacing and composition
- The `topBarSlot` should default to `undefined` if not passed — do not render an empty TopBar wrapper
- Use `flex flex-col gap-6` on the content area, not `space-y-6` — the gap utility works better with flex children
- `SectionTitle` should use `<h2>` (not `<h1>`) — the page-level heading is the route title in TopBar

## Files Expected To Change
- `src/components/SectionTitle.tsx` — new file
- `src/layouts/DashboardLayout.tsx` — new file
- `src/layouts/index.ts` — add DashboardLayout export
- `src/routes/index.tsx` — refactor to use DashboardLayout with placeholder slots

---

## AI Context

### Relevant Files
- `src/routes/index.tsx` — current home page; replace its content with DashboardLayout
- `src/layouts/AppShell.tsx` — understand the main area this layout lives inside
- `src/layouts/TopBar.tsx` — TopBar to compose into the topBarSlot
- `src/styles.css` — check colour tokens

### Constraints
- `DashboardLayout` must not render section headings or content directly — all content via slots
- Must use `gap-6` (not `space-y-6`) on the flex column content area
- No section slot should cause layout breakage if passed as `undefined`

### Validation Commands
```bash
pnpm lint
pnpm build
```

### Expected Outcome
The dashboard home page renders with a sticky top bar showing "Home" as the title, and three placeholder section areas below it — all with consistent 24 px padding and spacing.

---

## Test Plan

### Unit Tests
None for this task.

### Integration Tests
None for this task.

### Manual Tests
1. Run `pnpm dev` and open `http://localhost:3000`
2. Confirm the page title "Home" appears in the TopBar
3. Confirm there are three visually distinct section placeholders with even spacing between them
4. Confirm 24 px padding around the content area
5. Confirm `SectionTitle` renders with a bold label and right-aligned action placeholder

## Definition of Done
- [ ] Code implemented per Acceptance Criteria
- [ ] `pnpm lint` passes with zero errors
- [ ] `pnpm build` passes with zero errors
- [ ] Task status updated to `Done` in this file
- [ ] Plan `index.md` Task Summary updated (TASK-005 → Done, progress updated)
- [ ] Completion Summary filled in below
- [ ] Feature branch `feat/TASK-005-dashboard-layout` PR opened against `develop`

## Risks
- If `topBarSlot` is rendered unconditionally, an empty `<header>` element may cause layout issues — guard with a conditional render

## Notes
- In the reference design, sections have no visible header titles at the section level — the `SectionTitle` component is for future use by content-heavy sections like "Top Products". Include it but do not apply it to every section by default.

---

## Progress Updates

### 2026-06-16
- Task created

---

## Completion Summary
(To be filled when complete)
