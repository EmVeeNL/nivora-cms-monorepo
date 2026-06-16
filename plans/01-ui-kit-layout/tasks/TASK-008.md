# TASK-008: Two-Column Content Layout

## Status
Planned

## Priority
Medium

## Type
Feature

## Owner
Team

## Created
2026-06-16

## Due Date
2026-06-20

## Parent Plan
../index.md

---

## Summary
Build the two-column bottom section of the dashboard home: a wide left column for the "Top Products" data table area and a narrow right column for the "Top Customers Location" side panel. This is the third and final section of the dashboard home layout, delivered by `DashboardLayout`'s `section3` slot.

## Business Value
The split-column layout separates two complementary data surfaces — a wide table and a narrow list/map — matching the visual rhythm established in the reference design. The layout itself (the column ratio and spacing) is the deliverable; content is injected via slots.

## Acceptance Criteria
- [ ] `src/components/TwoColumnContent.tsx` exists and exports a named `TwoColumnContent` component
- [ ] `TwoColumnContent` renders a wide left column (`flex-[3]`) and a narrow right column (`flex-[1]`) in a flex row
- [ ] `src/components/ContentTable.tsx` exists and exports a named `ContentTable` component (table layout shell)
- [ ] `src/components/SidePanel.tsx` exists and exports a named `SidePanel` component (side panel layout shell)
- [ ] `ContentTable` has a header slot (title + optional action), a column header row, and a body slot for table rows
- [ ] `SidePanel` has a header slot and a body slot
- [ ] A `TableRow` layout component exists in `src/components/TableRow.tsx` for data rows
- [ ] `DashboardLayout`'s `section3` slot is updated to receive `<TwoColumnContent>`
- [ ] `pnpm lint` and `pnpm build` pass with zero errors

## Requirements
- Column ratio: left 3 parts, right 1 part (`flex-[3]` and `flex-[1]`) with `gap-6`
- Both columns are cards: `bg-surface border border-border rounded-lg`
- Table column headers: `text-xs uppercase tracking-wide text-text-muted` with a `border-b border-border`
- Table rows: `border-b border-border` (last row: `border-0`)
- Table row height: ~44 px (`h-11`)
- Side panel: same card surface as the table
- No real data — only structural slots and placeholder rows

## Technical Design

### Component tree
```
<TwoColumnContent>
  ├── leftSlot → <ContentTable>
  │   ├── header (title + action button)
  │   ├── <thead> column header row
  │   └── <tbody> {rows slot}
  │       └── <TableRow> × n
  └── rightSlot → <SidePanel>
      ├── header (title)
      └── body {children}
```

### Props interfaces
```tsx
// TwoColumnContent
interface TwoColumnContentProps {
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  className?: string;
}

// ContentTable
interface ContentTableProps {
  title?: React.ReactNode;
  action?: React.ReactNode;
  columns?: string[];          // column header labels
  rows?: React.ReactNode;      // <TableRow> instances
  className?: string;
}

// TableRow
interface TableRowProps {
  cells?: React.ReactNode[];   // one ReactNode per column cell
  className?: string;
}

// SidePanel
interface SidePanelProps {
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}
```

### Column ratio and layout
```
<div class="flex gap-6">
  <div class="flex-[3] min-w-0">   {leftSlot}
  <div class="flex-[1] min-w-0">   {rightSlot}
```

`min-w-0` prevents flex children from overflowing when content is wide.

### Table structure (semantic HTML)
Use `<table>` → `<thead>` → `<tbody>` for the ContentTable — proper semantic table even though it is layout-only at this stage. This ensures the table structure is accessible and correct for future data binding.

### Visual measurements (from reference)
- Column header padding: `px-4 py-3`
- Column header text: `text-xs uppercase tracking-wide text-text-muted`
- Row padding: `px-4 py-3` (rows should be `h-11`)
- Row text: `text-sm text-text`
- Table card: no internal padding on the outer card — padding lives in the `th`/`td` cells
- Side panel padding: `p-4`

### ContentTable columns (from reference)
The reference shows: Product | Price | Visit | Sales | Revenue — five columns. Use these as placeholder column header strings in `src/routes/index.tsx`.

### SidePanel sections (from reference)
The reference shows two sub-sections: "Top Customers Location" (country + flag + count) and "Top Customers" (avatar + name + revenue). In this task, treat the side panel body as a single `children` slot — the caller decides the internal structure.

## Dependencies
- TASK-001 — CSS tokens and `cn()` utility
- TASK-005 — `DashboardLayout` `section3` slot must exist

## Implementation Steps
1. Create `src/components/TableRow.tsx`:
   - Render a `<tr>` with `border-b border-border` and `text-sm`
   - Map `cells` prop to `<td>` elements with `px-4 py-3`
2. Create `src/components/ContentTable.tsx`:
   - Card shell (no padding — padding belongs in cells)
   - Header row: `flex justify-between items-center px-4 py-3 border-b border-border`
   - `<table class="w-full">` with `<thead>` (column headers) and `<tbody>` (rows slot)
3. Create `src/components/SidePanel.tsx`:
   - Card shell with `p-4`
   - Header: title + optional action
   - Body: `children` slot
4. Create `src/components/TwoColumnContent.tsx`:
   - `flex gap-6` wrapper with `flex-[3]` left and `flex-[1]` right
5. Update `src/routes/index.tsx`:
   - Pass `<TwoColumnContent>` to `DashboardLayout`'s `section3` slot
   - Include `<ContentTable>` with 5 placeholder column headers and 6 placeholder `<TableRow>` instances
   - Include `<SidePanel>` with placeholder children
6. Run `pnpm dev` — confirm two-column layout with table and side panel
7. Run `pnpm lint` and `pnpm build`

## Instructions for Developer
- Use semantic `<table>` / `<thead>` / `<tbody>` / `<tr>` / `<th>` / `<td>` — do not fake a table with divs
- `border-b border-border` on `<tr>` elements — both classes always together
- `min-w-0` on both flex children prevents overflow when table content is wide
- The `cells` prop in `TableRow` is `React.ReactNode[]` — the caller decides cell content; do not coerce to strings
- The side panel right column must never overflow horizontally — use `overflow-hidden` or `min-w-0` as needed

## Files Expected To Change
- `src/components/TableRow.tsx` — new file
- `src/components/ContentTable.tsx` — new file
- `src/components/SidePanel.tsx` — new file
- `src/components/TwoColumnContent.tsx` — new file
- `src/routes/index.tsx` — pass TwoColumnContent to section3 slot

---

## AI Context

### Relevant Files
- `src/layouts/DashboardLayout.tsx` — section3 slot API
- `src/styles.css` — colour tokens (`--color-surface`, `--color-border`, etc.)
- `src/lib/utils.ts` — `cn()` utility
- `src/components/GettingStartedSection.tsx` — card pattern reference

### Constraints
- Must use semantic `<table>` elements — no div-based table
- `border-b border-border` must always appear together on row elements
- `min-w-0` required on flex children to prevent overflow
- No hardcoded column names or cell data inside the component files — all content passed via props from `src/routes/index.tsx`

### Validation Commands
```bash
pnpm lint
pnpm build
```

### Expected Outcome
The bottom section of the dashboard renders a wide data table on the left (with 5 column headers and 6 placeholder rows) and a narrower side panel on the right — both as dark surface cards matching the reference design's bottom section.

---

## Test Plan

### Unit Tests
None for this task.

### Integration Tests
None for this task.

### Manual Tests
1. Run `pnpm dev` — confirm two-column layout: wide left, narrow right
2. Confirm column ratio is roughly 3:1
3. Confirm table header row has column labels and a bottom border
4. Confirm 6 table rows each have a bottom border (last row no border)
5. Confirm side panel has a distinct header and body area
6. Resize the browser window slightly — confirm no horizontal overflow from the table column

## Definition of Done
- [ ] Code implemented per Acceptance Criteria
- [ ] `pnpm lint` passes with zero errors
- [ ] `pnpm build` passes with zero errors
- [ ] Task status updated to `Done` in this file
- [ ] Plan `index.md` Task Summary updated (TASK-008 → Done, progress → 100%)
- [ ] Completion Summary filled in below
- [ ] Feature branch `feat/TASK-008-two-column-layout` PR opened against `develop`
- [ ] After this task merges to `develop`, cut `release/v0.1.0` per the plan's Deployment Plan

## Risks
- The 3:1 flex ratio may cause the side panel to be too narrow if the table has many columns — `overflow-x-auto` on the ContentTable card resolves this
- Table borders may double-up at section boundaries — use `border-collapse: collapse` on the `<table>` element

## Notes
- The reference design's side panel shows two sub-sections: country list ("Top Customers Location") and person list ("Top Customers"). These will be separate components in a future content plan — for now, the `SidePanel` body is a single slot.

---

## Progress Updates

### 2026-06-16
- Task created

---

## Completion Summary
(To be filled when complete)
