# TASK-009: SSR Dark/Light Mode & 4 Alternative Dashboard Layouts

## Status
Done

## Priority
High

## Type
Feature

## Owner
Team

## Created
2026-06-16

## Due Date
2026-06-22

## Parent Plan
../index.md

---

## Summary
Implement an SSR-safe dark/light mode toggle (zero-flash on server render, cookie-persisted) and build four additional dashboard layout designs beyond the default — Compact (icon-only sidebar), Top Navigation (horizontal nav bar), Split (sidebar + dual-panel), and Focused (full-viewport, minimal header). Each layout is a standalone component with a demo route.

## Business Value
A CMS admin panel needs to serve different workflows. A content editor benefits from a Focused full-screen layout; a data analyst benefits from the Split list/detail view; users sensitive to eye strain need a Light mode. These layouts make the UI kit genuinely versatile rather than a single-template kit.

## Acceptance Criteria
- [ ] The `dark`/`light` CSS class on `<html>` is set by a **blocking `<script>`** before `<HeadContent />`, preventing flash on SSR
- [ ] Theme preference is persisted in a `theme` cookie (`path=/; max-age=1 year`)
- [ ] A `ThemeProvider` context (`src/components/ThemeProvider.tsx`) provides `{ theme, setTheme }` to the tree
- [ ] A `ThemeToggle` component (`src/components/ThemeToggle.tsx`) toggles the theme and updates the cookie
- [ ] `src/layouts/CompactLayout.tsx` renders a 64 px icon-only sidebar + topbar + scrollable content
- [ ] `src/layouts/TopNavLayout.tsx` renders a horizontal nav bar replacing the sidebar, full-width content below
- [ ] `src/layouts/SplitLayout.tsx` renders sidebar (240 px) + left panel (320 px list area) + right panel (flex-1 detail area)
- [ ] `src/layouts/FocusedLayout.tsx` renders a minimal 48 px fixed top bar and a full-viewport content area
- [ ] Demo routes exist for each layout at `/layouts/compact`, `/layouts/top-nav`, `/layouts/split`, `/layouts/focused`
- [ ] All layouts correctly inherit the dark/light theme (CSS variables cascade from `.dark` / `:root`)
- [ ] `pnpm lint` and `pnpm build` pass with zero errors

## Requirements
- **Zero flash**: The blocking script must run before any CSS is painted. `suppressHydrationWarning` on `<html>` required.
- **Cookie-based**: `localStorage` is not SSR-safe. Only `document.cookie` (readable on server via request headers in future) is used.
- **No layout coupling**: Each layout component accepts `sidebar`, `topBar`, and `children` (or layout-specific) props. No layout imports another layout.
- **Fallback theme**: Default to `dark` if no cookie exists (matches the reference design).
- **TypeScript strict**: No `any`. All cookie-reading guarded by `typeof document !== 'undefined'`.

## Technical Design

### SSR Theme — Zero Flash Pattern
```html
<!-- In <head>, BEFORE <HeadContent /> -->
<script>
(function(){
  try{
    var m=document.cookie.match(/\btheme=([^;]+)/);
    document.documentElement.className=m?m[1]:'dark';
  }catch(e){}
})()
</script>
```
`suppressHydrationWarning` on `<html>` suppresses React's hydration warning when the class differs between server render and client (expected — script runs client-side only).

### ThemeProvider
```tsx
// State initializer reads cookie on client, returns 'dark' on server
const [theme, setThemeState] = useState<'light'|'dark'>(() => {
  if (typeof document === 'undefined') return 'dark'
  return (document.cookie.match(/\btheme=([^;]+)/)?.[1] as 'light'|'dark') ?? 'dark'
})

function setTheme(t: 'light'|'dark') {
  setThemeState(t)
  document.cookie = `theme=${t};path=/;max-age=${365*24*3600}`
  document.documentElement.className = t
}
```

useEffect on mount syncs React state with what the blocking script set:
```tsx
useEffect(() => {
  const cls = document.documentElement.className
  if (cls === 'light' || cls === 'dark') setThemeState(cls)
}, [])
```

### Layout 1: CompactLayout (`src/layouts/CompactLayout.tsx`)
```
<aside style="width: var(--sidebar-compact-width)">  64 px
  NavItem icons only (no labels)
<main style="margin-left: var(--sidebar-compact-width)">
  TopBar + children
```

### Layout 2: TopNavLayout (`src/layouts/TopNavLayout.tsx`)
```
<header> full-width sticky top bar
  Logo | NavItems (horizontal) | Actions | CTA
<main> full-width, no margin-left
  children
```
NavItems are horizontal with icon + label, separated by dividers.

### Layout 3: SplitLayout (`src/layouts/SplitLayout.tsx`)
```
<aside style="width: var(--sidebar-width)">       240 px
<div class="flex flex-1 overflow-hidden">
  <div class="w-80 border-r border-border">       320 px list panel
    {listPanel}
  <main class="flex-1 overflow-y-auto">           flex-1 detail
    {children}
```

### Layout 4: FocusedLayout (`src/layouts/FocusedLayout.tsx`)
```
<header class="fixed inset-x-0 top-0 h-12">      minimal bar
  Logo | ThemeToggle | Close/Nav button
<main class="pt-12 h-screen overflow-y-auto">      full content
  {children}
```

### Demo Routes
```
src/routes/layouts/compact.tsx
src/routes/layouts/top-nav.tsx
src/routes/layouts/split.tsx
src/routes/layouts/focused.tsx
```
Each demo route renders its layout shell with the same placeholder content (section title + lorem lorem blocks).

## Dependencies
- TASK-001 — CSS variables must be set up (already done; this task only adds ThemeProvider/toggle on top)
- TASK-002 — AppShell must exist (CompactLayout is a variant of it)
- TASK-003 — NavItem must exist (CompactLayout reuses it with `showLabel={false}` prop)
- TASK-004 — TopBar must exist (all layouts except FocusedLayout can reuse it)

## Implementation Steps
1. Update `src/components/NavItem.tsx` to accept a `showLabel?: boolean` prop (default `true`) — needed by CompactLayout
2. Create `src/components/ThemeProvider.tsx` with `ThemeProvider`, `useTheme`, and `ThemeContext`
3. Create `src/components/ThemeToggle.tsx` using `useTheme()` and lucide `Sun` / `Moon` icons
4. Update `src/routes/__root.tsx`:
   - Add blocking theme script before `<HeadContent />`
   - Add `suppressHydrationWarning` on `<html>`
   - Wrap body children with `<ThemeProvider>`
5. Create `src/layouts/CompactLayout.tsx` — 64 px icon-only sidebar + topbar + content
6. Create `src/layouts/TopNavLayout.tsx` — horizontal nav + full-width content
7. Create `src/layouts/SplitLayout.tsx` — sidebar + list panel + detail panel
8. Create `src/layouts/FocusedLayout.tsx` — minimal fixed header + full-viewport content
9. Create `src/routes/layouts/compact.tsx` — demo page
10. Create `src/routes/layouts/top-nav.tsx` — demo page
11. Create `src/routes/layouts/split.tsx` — demo page
12. Create `src/routes/layouts/focused.tsx` — demo page
13. Export all four new layouts from `src/layouts/index.ts`
14. Run `pnpm lint` and `pnpm build`

## Instructions for Developer
- The blocking script must be a raw `<script>` tag with `dangerouslySetInnerHTML` — do NOT use an external script file, as it must be synchronous and inline to block paint
- The `suppressHydrationWarning` attribute goes on `<html>` only, not on `<body>` or inner elements
- `ThemeProvider` must NOT call `document.cookie` during SSR (server render). Always guard with `typeof document !== 'undefined'`
- `CompactLayout` sidebar must show icons only — use `showLabel={false}` on `NavItem`; do not create a separate icon-only nav item component
- `SplitLayout` listPanel and detail area must both have `overflow-y-auto` independently — both scroll separately
- `TopNavLayout` uses horizontal flex for nav items — use `flex-row gap-1` instead of `flex-col`
- All four layouts must consume the CSS variable `--topbar-height` and `--sidebar-width` to stay in sync with the design system
- `border-r border-border` together on every vertical divider — Tailwind v4 rule applies

## Files Expected To Change
- `src/components/NavItem.tsx` — add `showLabel` prop
- `src/components/ThemeProvider.tsx` — new file
- `src/components/ThemeToggle.tsx` — new file
- `src/routes/__root.tsx` — blocking script + ThemeProvider wrapper
- `src/layouts/CompactLayout.tsx` — new file
- `src/layouts/TopNavLayout.tsx` — new file
- `src/layouts/SplitLayout.tsx` — new file
- `src/layouts/FocusedLayout.tsx` — new file
- `src/layouts/index.ts` — add four new exports
- `src/routes/layouts/compact.tsx` — new demo route
- `src/routes/layouts/top-nav.tsx` — new demo route
- `src/routes/layouts/split.tsx` — new demo route
- `src/routes/layouts/focused.tsx` — new demo route
- `src/routeTree.gen.ts` — auto-regenerated by TanStack Router

---

## AI Context

### Relevant Files
- `src/routes/__root.tsx` — must be updated for blocking script and ThemeProvider
- `src/layouts/AppShell.tsx` — reference for CompactLayout (same structure, different sidebar width)
- `src/components/NavItem.tsx` — must add `showLabel` prop for CompactLayout
- `src/styles.css` — must have `:root` and `.dark` blocks for the CSS variables to cascade

### Constraints
- Must NOT use `localStorage` for theme storage — use only `document.cookie`
- Blocking script must be synchronous and inline (`dangerouslySetInnerHTML`) — no `async` or `defer`
- `suppressHydrationWarning` on `<html>` is required — without it, React will warn in dev mode
- `ThemeProvider` must guard all `document.*` access with `typeof document !== 'undefined'`
- Each layout must be a standalone component — no layout wraps another layout

### Validation Commands
```bash
pnpm lint
pnpm build
```

### Expected Outcome
Navigating to `/layouts/compact`, `/layouts/top-nav`, `/layouts/split`, and `/layouts/focused` each shows a distinctly different layout design. Clicking the `ThemeToggle` button switches between dark and light mode instantly with no flash, and the preference persists across page reloads.

---

## Test Plan

### Unit Tests
None for this task.

### Integration Tests
None for this task.

### Manual Tests
1. Run `pnpm dev` — navigate to each layout demo route, confirm distinct visual structure
2. Toggle theme via `ThemeToggle` — confirm page switches between dark/light instantly
3. Reload the page after toggling — confirm no theme flash and correct theme persists
4. Open DevTools → Network → disable JS → reload — confirm server-rendered HTML has correct class (note: blocking script won't run without JS, but CSS variables default to `:root` light mode)
5. Confirm Compact layout shows icons only in sidebar (no text labels)
6. Confirm Top Nav layout has no left sidebar — nav is horizontal at the top
7. Confirm Split layout has three visible columns: left sidebar, center list panel, right detail area
8. Confirm Focused layout has a minimal 48 px header bar and full-viewport content area

## Definition of Done
- [ ] Code implemented per Acceptance Criteria
- [ ] `pnpm lint` passes with zero errors
- [ ] `pnpm build` passes with zero errors
- [ ] Task status updated to `Done` in this file
- [ ] Plan `index.md` Task Summary updated (TASK-009 → Done, progress → 100%)
- [ ] Completion Summary filled in below
- [ ] Feature branch `feat/TASK-009-theme-and-layouts` PR opened against `develop`

## Risks
- React 19 hydration may still warn even with `suppressHydrationWarning` on mismatched attributes other than `class` — investigate if build output shows warnings
- Cookie `SameSite` attribute: for Cloudflare Workers deployed on a custom domain, ensure the cookie is set without `SameSite=None` (default `SameSite=Lax` is fine)
- `TopNavLayout` horizontal nav may overflow at narrow viewports — acceptable for desktop-first scope

## Notes
- The CSS variable cascade (`:root` light values, `.dark` dark values) is set up in TASK-001. This task only adds the runtime mechanism to toggle which applies.
- Future improvement: read the `theme` cookie server-side in `__root.tsx`'s `beforeLoad` function to set the class in SSR HTML, eliminating the need for `suppressHydrationWarning`. This requires access to the request's `Cookie` header, which depends on the TanStack Start / Cloudflare Workers request context API.

---

## Progress Updates

### 2026-06-16
- Task created

### 2026-06-17
- Implemented ThemeProvider + ThemeToggle (cookie-based, SSR-safe)
- Blocking script already in __root.tsx from TASK-001 implementation; added ThemeProvider wrapper
- Refactored __root.tsx: AppShell moved to pathless layout route `_app.tsx`
- Created CompactLayout, TopNavLayout, SplitLayout, FocusedLayout
- Created demo routes at /layouts/compact, /layouts/top-nav, /layouts/split, /layouts/focused
- pnpm lint ✓ · pnpm build ✓ (client + SSR)

---

## Completion Summary
Implemented SSR-safe dark/light mode: blocking inline `<script>` in `<head>` reads the `theme` cookie and sets `document.documentElement.className` before paint, with `suppressHydrationWarning` on `<html>`. `ThemeProvider` provides `useTheme()` context to the whole tree; `ThemeToggle` toggles between dark/light and persists to a `theme` cookie (1-year max-age).

Refactored `__root.tsx` to be an HTML-only shell with `ThemeProvider` — AppShell moved to a TanStack Router pathless layout route `_app.tsx` so that layout demo routes escape it cleanly.

Four layout variants delivered:
- **CompactLayout** (`/layouts/compact`) — 64 px icon-only sidebar
- **TopNavLayout** (`/layouts/top-nav`) — horizontal navigation bar, no sidebar
- **SplitLayout** (`/layouts/split`) — sidebar + 320 px list panel + flex-1 detail area
- **FocusedLayout** (`/layouts/focused`) — 48 px minimal fixed header, full-viewport content
