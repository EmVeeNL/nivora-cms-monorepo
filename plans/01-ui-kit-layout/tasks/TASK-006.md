# TASK-006: Onboarding Cards Row Layout

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
2026-06-19

## Parent Plan
../index.md

---

## Summary
Build the "Getting Started" onboarding section: a horizontal row of four equal-width cards, each acting as a step indicator. The layout uses a `GettingStartedSection` wrapper and a generic `OnboardingCard` component. No real content — only structural slots and placeholder children.

## Business Value
Onboarding cards guide new CMS users through initial setup steps. The layout must accommodate exactly four cards at equal width with a consistent gap, matching the reference design's upper "Getting Started" strip.

## Acceptance Criteria
- [ ] `src/components/GettingStartedSection.tsx` exists and exports a named component
- [ ] `GettingStartedSection` renders a header row (title left + progress indicator right) and a four-column card grid below
- [ ] `src/components/OnboardingCard.tsx` exists and exports a named `OnboardingCard` component
- [ ] `OnboardingCard` renders a card surface with an icon slot at the top, a title slot, and a description slot
- [ ] Four `OnboardingCard` instances fill the row with equal width and consistent gap
- [ ] The progress indicator in the section header is a `ProgressBadge` component showing a percentage value (`n%`)
- [ ] `DashboardLayout`'s `section1` slot is updated to receive `<GettingStartedSection>`
- [ ] `pnpm lint` and `pnpm build` pass with zero errors

## Requirements
- Four cards in a 4-column CSS grid with `gap-4` (16 px)
- Card surface: `bg-surface` with `border border-border` and `rounded-lg`
- Card internal padding: `p-4` (16 px)
- Section title: `text-sm font-semibold text-text`
- Progress badge: a small pill (`rounded-full bg-surface border border-border text-xs text-text-muted px-2 py-0.5`)
- Each card has a minimum height to accommodate icon + title + description without collapsing

## Technical Design

### Component tree
```
<GettingStartedSection>
  ├── <header>
  │   ├── <h2> "Getting Started" </h2>
  │   └── <ProgressBadge progress={50} />
  └── <div class="grid grid-cols-4 gap-4">
      ├── <OnboardingCard icon={…} title={…} description={…} />
      └── × 4
```

### Props interfaces
```tsx
// ProgressBadge
interface ProgressBadgeProps {
  progress: number; // 0–100
  className?: string;
}

// OnboardingCard
interface OnboardingCardProps {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  isComplete?: boolean;
  className?: string;
}

// GettingStartedSection
interface GettingStartedSectionProps {
  progress?: number;        // passed to ProgressBadge
  cards?: React.ReactNode;  // slot for the four <OnboardingCard> instances
}
```

### Visual measurements (from reference)
- Section header height: ~32 px, section title `text-sm font-semibold`
- Card min-height: ~120 px
- Card icon area: 24×24 px circle or square icon container, 12 px from top
- Card title: `text-sm font-medium text-text`, `mt-3`
- Card description: `text-xs text-text-muted`, `mt-1`, 2-line max (no truncation in layout)
- Progress badge: white-ish pill showing "50%" in the reference

### Complete vs incomplete card state
In the reference, completed steps show a filled green circle icon; incomplete steps show an empty or outlined icon. Add an `isComplete?: boolean` prop to `OnboardingCard` — the caller decides the icon; the card can apply a subtle `opacity-60` to incomplete cards if desired (keep it minimal for now).

## Dependencies
- TASK-001 — CSS tokens and `cn()` utility
- TASK-005 — `DashboardLayout` `section1` slot must exist

## Implementation Steps
1. Create `src/components/ProgressBadge.tsx`:
   - Render a `<span>` with progress value formatted as `{progress}%`
   - Apply pill styling
2. Create `src/components/OnboardingCard.tsx`:
   - Render a card surface (`bg-surface border border-border rounded-lg p-4`)
   - Three slots: icon (top), title, description — all `React.ReactNode`
3. Create `src/components/GettingStartedSection.tsx`:
   - Render section header (title + ProgressBadge)
   - Render 4-column grid with the `cards` slot
4. Update `src/routes/index.tsx`:
   - Pass `<GettingStartedSection>` to `DashboardLayout`'s `section1` slot
   - Include four `<OnboardingCard>` instances with placeholder lucide icons and placeholder text nodes
5. Run `pnpm dev` — visually confirm the four-card row
6. Run `pnpm lint` and `pnpm build`

## Instructions for Developer
- Use `grid grid-cols-4 gap-4` — not flexbox — for the four-card row (equal-width columns enforced)
- `border border-border` — always both classes for card borders (Tailwind v4 rule)
- Keep `GettingStartedSection` free of specific card content — the `cards` prop is a `ReactNode` slot
- The `ProgressBadge` value is a number prop (`progress: number`), not a string — format it inside the component

## Files Expected To Change
- `src/components/ProgressBadge.tsx` — new file
- `src/components/OnboardingCard.tsx` — new file
- `src/components/GettingStartedSection.tsx` — new file
- `src/routes/index.tsx` — pass GettingStartedSection to section1 slot

---

## AI Context

### Relevant Files
- `src/layouts/DashboardLayout.tsx` — understand the section1 slot API
- `src/styles.css` — check `--color-surface`, `--color-border` tokens
- `src/lib/utils.ts` — `cn()` utility

### Constraints
- Must use CSS grid (`grid-cols-4`), not flexbox, for the four-card row
- `border border-border` must be used together on every card
- No hardcoded card titles or descriptions in `GettingStartedSection.tsx` itself

### Validation Commands
```bash
pnpm lint
pnpm build
```

### Expected Outcome
The top section of the dashboard renders a "Getting Started" header with a "50%" badge, and four dark surface cards side-by-side in a horizontal row, each showing a placeholder icon, title, and description.

---

## Test Plan

### Unit Tests
None for this task.

### Integration Tests
None for this task.

### Manual Tests
1. Run `pnpm dev` — confirm four equal-width cards render in a row
2. Confirm cards have rounded corners, dark surface background, and visible border
3. Confirm section title "Getting Started" appears top-left, progress badge top-right
4. Confirm 16 px gap between cards
5. Confirm cards have equal height (CSS grid enforces this by default via `align-items: stretch`)

## Definition of Done
- [ ] Code implemented per Acceptance Criteria
- [ ] `pnpm lint` passes with zero errors
- [ ] `pnpm build` passes with zero errors
- [ ] Task status updated to `Done` in this file
- [ ] Plan `index.md` Task Summary updated (TASK-006 → Done, progress updated)
- [ ] Completion Summary filled in below
- [ ] Feature branch `feat/TASK-006-onboarding-cards` PR opened against `develop`

## Risks
- At narrow viewports (< 900 px), four columns may be too cramped — acceptable for now (desktop-only scope), but note for future responsive plan

## Notes
- The reference design shows step icons in a small coloured circle (checkmark for done, number or icon for pending) — the `icon` slot accommodates this without prescribing a specific icon

---

## Progress Updates

### 2026-06-16
- Task created

---

## Completion Summary
(To be filled when complete)
