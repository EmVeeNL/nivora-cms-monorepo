# TASK-001: Theme & shadcn/ui Setup

## Status
Planned

## Priority
Critical

## Type
Infrastructure

## Owner
Team

## Created
2026-06-16

## Due Date
2026-06-17

## Parent Plan
../index.md

---

## Summary
Install shadcn/ui, configure it for Tailwind CSS v4, and define the dark-mode design system via CSS custom properties in `src/styles.css`. This is the foundational task — all subsequent layout tasks depend on the theme tokens and the `cn()` utility being in place.

## Business Value
Without a coherent token-based theme, every component will use ad-hoc colour values that are impossible to maintain or retheme. The shadcn/ui install also provides the `Button`, `Input`, and other primitives used by layout components in later tasks.

## Acceptance Criteria
- [ ] `pnpm dlx shadcn@latest init` completes without error; `components.json` is present at repo root
- [ ] `src/lib/utils.ts` exists and exports a `cn()` function (using `clsx` + `tailwind-merge`)
- [ ] `src/styles.css` defines all required CSS custom properties under `:root` and `@theme`
- [ ] Dark background (`--color-background`) is a near-black (`oklch` or hex `#0d0f14` equivalent)
- [ ] A `Button` component can be imported from `#/components/ui/button` without TypeScript errors
- [ ] `pnpm lint` and `pnpm build` pass with zero errors

## Requirements
- Use Tailwind v4 CSS-first approach — no `tailwind.config.js`
- shadcn/ui `components.json` must specify `tailwind.version: 4`
- Colour tokens must use CSS custom properties (`--color-*`) so they can be overridden by future themes
- The `cn()` utility must be importable as `#/lib/utils`
- Only the `Button` component needs to be added in this task (smoke-test that shadcn/ui works); other components are added per-task as needed

## Technical Design

### Colour Palette (reference design analysis)
The reference design uses a very dark near-black background with slightly lighter card surfaces, mid-grey borders, and a blue primary accent.

```
--color-background:    #0d0f14    (page background)
--color-surface:       #141720    (card / panel background)
--color-surface-hover: #1c2030    (hover state on nav items)
--color-border:        #232738    (card borders, dividers)
--color-text:          #e2e8f0    (primary text)
--color-text-muted:    #6b7280    (secondary / caption text)
--color-primary:       #3b82f6    (blue CTA button, active nav)
--color-primary-hover: #2563eb    (CTA button hover)
```

### Tailwind v4 @theme block
In Tailwind v4, CSS custom properties registered inside `@theme {}` become Tailwind utilities automatically. Define the palette there so classes like `bg-background`, `text-muted`, `border-border` are available.

### shadcn/ui init flags
```bash
pnpm dlx shadcn@latest init \
  --style default \
  --base-color slate \
  --css-variables true
```
Then verify `components.json` has `"tailwind": { "version": "4" }`. If not, set it manually.

### Path aliases in components.json
shadcn/ui needs to know the alias for `src/`:
```json
{
  "aliases": {
    "components": "#/components",
    "utils": "#/lib/utils",
    "ui": "#/components/ui",
    "lib": "#/lib",
    "hooks": "#/hooks"
  }
}
```

## Dependencies
None — this is the first task.

## Implementation Steps
1. Run `pnpm dlx shadcn@latest init` and answer the prompts (style: default, base colour: slate, CSS variables: yes)
2. Verify `components.json` is created; set `tailwind.version` to `"4"` and update `aliases` to use `#/` prefix
3. Open `src/styles.css` and add a `@theme {}` block with all colour tokens listed above
4. Ensure the existing `@import "tailwindcss"` line remains at the top of `src/styles.css`
5. Add `border-color: var(--color-border)` as the default border colour in the theme so `border-border` works
6. Run `pnpm dlx shadcn@latest add button` to install the first primitive and verify the import path
7. Run `pnpm lint` — fix any Biome warnings in generated files if needed
8. Run `pnpm build` — confirm zero TypeScript errors

## Instructions for Developer
- Do **not** create `tailwind.config.js` — this project uses the Tailwind v4 CSS-first approach exclusively
- If `shadcn init` tries to create a `tailwind.config.ts`, cancel and use the `--no-tailwind-config` flag if available, or delete the generated file afterwards
- The `cn()` utility in `src/lib/utils.ts` is typically: `import { clsx } from 'clsx'; import { twMerge } from 'tailwind-merge'; export function cn(...inputs) { return twMerge(clsx(inputs)); }` — keep it exactly this shape
- Do not rename or move the generated `src/components/ui/button.tsx` — shadcn/ui expects it at that path for future `add` commands

## Files Expected To Change
- `components.json` — created by shadcn/ui init
- `src/styles.css` — add `@theme {}` block with colour tokens
- `src/lib/utils.ts` — created by shadcn/ui init (cn utility)
- `src/components/ui/button.tsx` — created by `shadcn add button`
- `package.json` — new deps: `clsx`, `tailwind-merge`, `class-variance-authority`, `@radix-ui/react-slot`
- `pnpm-lock.yaml` — updated lockfile

---

## AI Context

### Relevant Files
- `src/styles.css` — Tailwind entry point; add `@theme {}` here
- `package.json` — check existing deps before installing to avoid duplicates
- `tsconfig.json` — verify path aliases are configured (`#/*`)
- `vite.config.ts` — verify `@tailwindcss/vite` plugin is present

### Constraints
- Must not create `tailwind.config.js` or `tailwind.config.ts`
- Must not install ESLint or Prettier — Biome is the linter/formatter
- Colour tokens must use CSS custom properties, not hardcoded Tailwind palette classes
- The `#/*` alias must be used in all imports (not relative `../../` paths crossing directory boundaries)

### Validation Commands
```bash
pnpm lint
pnpm build
```

### Expected Outcome
Running `pnpm dev` renders a blank dark page (background `#0d0f14`); importing `Button` from `#/components/ui/button` and rendering it shows a styled button with no TypeScript errors and no console errors.

---

## Test Plan

### Unit Tests
None for this task.

### Integration Tests
None for this task.

### Manual Tests
1. Run `pnpm dev` — page background should be near-black (`#0d0f14`)
2. Temporarily add `<Button>Test</Button>` to `src/routes/index.tsx` — button should render with correct dark styling
3. Remove the temporary button before committing
4. Run `pnpm build` — must complete with zero errors

## Definition of Done
- [ ] Code implemented per Acceptance Criteria
- [ ] `pnpm lint` passes with zero errors
- [ ] `pnpm build` passes with zero errors
- [ ] Task status updated to `Done` in this file
- [ ] Plan `index.md` Task Summary updated (TASK-001 → Done)
- [ ] Completion Summary filled in below
- [ ] Feature branch `feat/TASK-001-theme-setup` PR opened against `develop`

## Risks
- shadcn/ui `init` may generate a `tailwind.config.js` — delete it if so
- `clsx` / `tailwind-merge` version mismatches with existing deps — check `pnpm-lock.yaml` after install

## Notes
- The reference design uses `oklch` colour space in modern browsers; hex fallbacks are fine for now
- If `pnpm dlx shadcn@latest init` fails, try `pnpm dlx shadcn-ui@latest init` (older package name)

---

## Progress Updates

### 2026-06-16
- Task created

---

## Completion Summary
(To be filled when complete)
