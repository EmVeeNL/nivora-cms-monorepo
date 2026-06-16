# TASK-007: Metrics Row Layout

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
Build the metrics (stats) row: a horizontal strip of four equal-width `MetricCard` components, each showing a label, a large numeric value, and a comparison trend line (delta vs. last month). This is the second section of the dashboard home, sitting between the onboarding row and the two-column content area.

## Business Value
Metric cards provide an at-a-glance overview of key business numbers (products, builds, revenue, rating). The layout must be immediately scannable — four equal cards with a clear visual hierarchy (big number, muted label, small trend).

## Acceptance Criteria
- [ ] `src/components/MetricCard.tsx` exists and exports a named `MetricCard` component
- [ ] `MetricCard` has three content slots: `label`, `value`, and `trend`
- [ ] `src/components/MetricsRow.tsx` exists and exports a named `MetricsRow` component
- [ ] `MetricsRow` renders four `MetricCard` instances in a 4-column grid with `gap-4`
- [ ] A `TrendBadge` component in `src/components/TrendBadge.tsx` renders the delta value with an up/down icon and colour
- [ ] `DashboardLayout`'s `section2` slot is updated to receive `<MetricsRow>`
- [ ] `pnpm lint` and `pnpm build` pass with zero errors

## Requirements
- Four metric cards in a 4-column CSS grid with `gap-4`
- Card surface: `bg-surface`, `border border-border`, `rounded-lg`, `p-4`
- `label`: `text-xs text-text-muted uppercase tracking-wide`
- `value`: `text-2xl font-bold text-text`
- `trend`: small text below the value; positive delta = `text-green-500`, negative = `text-red-400`, neutral = `text-text-muted`
- Each card has a small icon at the top-right corner (an icon slot — `React.ReactNode`)
- The value and label are stacked vertically; the icon is at top-right

## Technical Design

### Component tree
```
<MetricsRow>
  └── <div class="grid grid-cols-4 gap-4">
      └── <MetricCard> × 4
          ├── <div class="top-row">   label + icon (space-between)
          ├── <div class="value">     big number
          └── <div class="trend">     TrendBadge
```

### Props interfaces
```tsx
// TrendBadge
interface TrendBadgeProps {
  delta: string;        // e.g. "+12%" or "-3.2%"
  direction: 'up' | 'down' | 'neutral';
  label?: string;       // e.g. "vs Last Month"
  className?: string;
}

// MetricCard
interface MetricCardProps {
  label?: React.ReactNode;
  value?: React.ReactNode;
  trend?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

// MetricsRow
interface MetricsRowProps {
  cards?: React.ReactNode;  // slot for four <MetricCard> instances
}
```

### Visual measurements (from reference design)
- Card padding: `p-5` (20 px)
- Label: `text-xs uppercase tracking-wide text-text-muted`, `mb-1`
- Value: `text-2xl font-bold text-text`, `mb-2`
- Icon (top-right): 20×20 px, `text-text-muted`
- TrendBadge: `text-xs`, arrow icon 12 px, comparison text in `text-text-muted`
- Reference values: Products 14 (↑6 vs last month), Build This Month 425 (↑110), Revenue $3,316.50 (↑$996), Rating 4.8 (↑0.4)

### TrendBadge colour rules
```
direction === 'up'      → text-green-500  + ArrowUp icon
direction === 'down'    → text-red-400    + ArrowDown icon
direction === 'neutral' → text-text-muted + Minus icon
```

## Dependencies
- TASK-001 — CSS tokens and `cn()` utility
- TASK-005 — `DashboardLayout` `section2` slot must exist

## Implementation Steps
1. Create `src/components/TrendBadge.tsx`:
   - Render a `<span>` with delta value and directional arrow icon (lucide `TrendingUp` / `TrendingDown`)
   - Apply colour based on `direction` prop using `cn()`
2. Create `src/components/MetricCard.tsx`:
   - Card shell (`bg-surface border border-border rounded-lg p-5`)
   - Top row: label left + icon right (`flex justify-between items-start`)
   - Value below with large bold typography
   - TrendBadge slot at the bottom
3. Create `src/components/MetricsRow.tsx`:
   - 4-column grid wrapper accepting a `cards` slot
4. Update `src/routes/index.tsx`:
   - Pass `<MetricsRow>` to `DashboardLayout`'s `section2` slot
   - Include four `<MetricCard>` instances with placeholder slot values
5. Run `pnpm dev` — visually verify the four metric cards
6. Run `pnpm lint` and `pnpm build`

## Instructions for Developer
- Use `grid grid-cols-4 gap-4` on the `MetricsRow` wrapper — same grid pattern as the onboarding row
- `border border-border` together on every card — never just `border`
- The `value` slot is `React.ReactNode` — the caller formats the number (e.g., `$3,316.50` or `4.8`) so `MetricCard` stays generic
- `TrendBadge` direction controls only the colour and icon — the delta string is passed by the caller

## Files Expected To Change
- `src/components/TrendBadge.tsx` — new file
- `src/components/MetricCard.tsx` — new file
- `src/components/MetricsRow.tsx` — new file
- `src/routes/index.tsx` — pass MetricsRow to section2 slot

---

## AI Context

### Relevant Files
- `src/layouts/DashboardLayout.tsx` — section2 slot API
- `src/components/GettingStartedSection.tsx` — reuse the 4-column grid pattern
- `src/styles.css` — colour tokens
- `src/lib/utils.ts` — `cn()` utility

### Constraints
- Must use CSS grid for the four-card row (same as TASK-006)
- `border border-border` must be paired — never `border` alone
- `TrendBadge` must not hard-code the delta sign — accept `delta: string` and `direction` separately
- No placeholder numbers inside `MetricsRow.tsx` — pass them from `src/routes/index.tsx`

### Validation Commands
```bash
pnpm lint
pnpm build
```

### Expected Outcome
A row of four dark-surface metric cards renders below the onboarding section, each showing a label at top-left, an icon at top-right, a large bold value, and a small coloured trend indicator.

---

## Test Plan

### Unit Tests
None for this task.

### Integration Tests
None for this task.

### Manual Tests
1. Run `pnpm dev` — confirm four equal-width metric cards in a row
2. Confirm the large value is prominently sized (`text-2xl`)
3. Confirm the trend badge shows a green up arrow for positive delta
4. Confirm the trend badge shows a red down arrow for negative delta
5. Confirm cards share equal height

## Definition of Done
- [ ] Code implemented per Acceptance Criteria
- [ ] `pnpm lint` passes with zero errors
- [ ] `pnpm build` passes with zero errors
- [ ] Task status updated to `Done` in this file
- [ ] Plan `index.md` Task Summary updated (TASK-007 → Done, progress updated)
- [ ] Completion Summary filled in below
- [ ] Feature branch `feat/TASK-007-metrics-row` PR opened against `develop`

## Risks
- `text-green-500` and `text-red-400` are default Tailwind palette classes — confirm they are available in Tailwind v4 without additional configuration (they should be, as Tailwind v4 includes the default palette)

## Notes
- Revenue formatting (currency symbol + decimal) is handled by the caller — `MetricCard` renders it as-is via the `value` slot

---

## Progress Updates

### 2026-06-16
- Task created

---

## Completion Summary
(To be filled when complete)
