# AGENTS.md — NIVORA CMS

This file is the authoritative guide for AI agents (and human developers) working in this repository.
**Read this file at the start of every session before touching any code.**

---

## Project Overview

NIVORA CMS is a modular, dark-themed Content Management System built with:

| Concern | Technology |
|---------|-----------|
| Framework | TanStack Start (React 19, SSR) |
| Styling | Tailwind CSS v4 (CSS-first, no config file) |
| UI primitives | shadcn/ui (Radix-based) |
| Language | TypeScript (strict) |
| Bundler | Vite 8 |
| Linter / Formatter | Biome |
| Runtime | Cloudflare Workers (via Wrangler) |

The visual reference is a dark-mode SaaS dashboard — fixed sidebar, top navigation bar, and a content grid area.

---

## Repository Structure

```
nivora-cms/
├── plans/                        # Plan-driven development docs
│   ├── templates/                # Reusable plan/task templates
│   │   ├── index-template.md     # Copy this when starting a new plan
│   │   └── task-template.md      # Copy this when creating a new task
│   └── NN-plan-name/             # One folder per plan (zero-padded number)
│       ├── index.md              # Full plan document
│       └── tasks/                # One .md file per task
│           └── TASK-NNN.md
├── public/                       # Static assets
├── src/
│   ├── components/               # Reusable UI components
│   │   └── ui/                   # shadcn/ui generated primitives (do not edit directly)
│   ├── layouts/                  # App shell and page-level layout components
│   ├── lib/                      # Shared utilities (cn, etc.)
│   ├── routes/                   # TanStack Start file-based routes
│   └── styles.css                # Global CSS — Tailwind v4 entry point
├── AGENTS.md                     # This file
├── biome.json                    # Linter / formatter config
├── package.json
├── tsconfig.json
├── vite.config.ts
└── wrangler.jsonc                # Cloudflare Workers config
```

---

## Development Workflow

### Branch Strategy

Every plan gets its own **fresh branch cut from `main`**. There is no long-lived `develop` branch.

| Branch | Purpose | Base branch |
|--------|---------|-------------|
| `main` | Production-ready code only | — |
| `plan/NN-short-description` | All work for one plan | `main` |
| `feat/TASK-NNN-short-description` | Individual task within a plan | `plan/NN-*` |
| `fix/TASK-NNN-short-description` | Bug fix tied to a task | `plan/NN-*` |
| `hotfix/short-description` | Emergency production fix | `main` |

### Branch Naming Rules

- Lowercase and hyphens only — no underscores, no extra slashes
- Include the task ID when a tracked task exists: `feat/TASK-003-sidebar`
- Keep the description to 3–5 words
- Examples:
  - `plan/02-content-api`
  - `feat/TASK-010-post-model`
  - `fix/TASK-011-slug-collision`
  - `hotfix/sidebar-z-index`

### Workflow — Step by Step

#### Starting a new plan
```bash
# Always branch from main
git checkout main
git pull origin main
git checkout -b plan/NN-short-description

# Bump minor version immediately (see Semantic Versioning section)
# Update package.json, nivora.config.json, then commit:
git add package.json nivora.config.json
git commit -m "chore(release): bump version to vX.Y.0

Refs: plan NN"
```

#### Starting a task within a plan
```bash
git checkout plan/NN-short-description
git checkout -b feat/TASK-NNN-short-description

# Bump patch version (see Semantic Versioning section)
# Update package.json, nivora.config.json, then commit alongside work:
git commit -m "feat(scope): description

Refs: TASK-NNN"
```

#### Pre-commit checklist (mandatory — run before every commit)
```bash
# 1. Biome auto-fix + check (must exit 0)
pnpm biome check --write .

# 2. Tests (must pass)
pnpm test
```

Both must pass with zero errors before `git commit`. Never commit if either fails.

#### Opening and merging a PR with gh
```bash
# Open PR from task branch → plan branch
gh pr create \
  --base plan/NN-short-description \
  --title "feat(scope): TASK-NNN short description" \
  --body "Refs: TASK-NNN"

# Squash-merge the PR
gh pr merge --squash --delete-branch

# When all tasks in the plan are done: open PR from plan branch → main
gh pr create \
  --base main \
  --title "feat: plan NN — short description (vX.Y.0)" \
  --body "Closes plan NN. Bumps version to vX.Y.0."

gh pr merge --squash --delete-branch

# Tag the merge commit on main
git checkout main && git pull origin main
git tag -a vX.Y.Z -m "vX.Y.Z"
git push origin --tags
```

#### Hotfix
```bash
git checkout main && git pull origin main
git checkout -b hotfix/short-description

# Fix, run pre-commit checklist, commit, then:
gh pr create --base main --title "fix: short description"
gh pr merge --squash --delete-branch

git checkout main && git pull origin main
git tag -a vX.Y.Z -m "vX.Y.Z"
git push origin --tags
```

---

## Semantic Versioning

The project follows `MAJOR.MINOR.PATCH` (e.g. `0.2.3`).

| Segment | Who bumps it | When |
|---------|-------------|------|
| **MAJOR** | Human only | Manually, for breaking architectural changes |
| **MINOR** | Agent / developer | At the start of every new plan — reset patch to `0` |
| **PATCH** | Agent / developer | After every completed task within a plan |

### Version files — all three must be in sync

| File | Field |
|------|-------|
| `package.json` | `"version"` |
| `nivora.config.json` | `"version"` |
| Git tag | `vX.Y.Z` on the merge commit to `main` |

### Version bump rules

- **New plan starts** → bump minor, reset patch: `0.1.4` → `0.2.0`
  - Commit on the plan branch: `chore(release): bump version to v0.2.0`
- **Task completes** → bump patch: `0.2.0` → `0.2.1`
  - Include the version bump in the task's final commit
- **Hotfix** → bump patch on current version: `0.2.1` → `0.2.2`
- **Never** bump the version without also updating all three files

---

## Conventional Commits

All commit messages **must** follow the [Conventional Commits v1.0.0](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <short description>

[optional body — explain WHY, not what]

[optional footer — Refs, BREAKING CHANGE, etc.]
```

### Types

| Type | When to use |
|------|------------|
| `feat` | New feature or component |
| `fix` | Bug fix |
| `docs` | Documentation only (plans, AGENTS.md, README) |
| `style` | Formatting or whitespace — zero logic change |
| `refactor` | Restructure without changing behaviour |
| `test` | Add or update tests |
| `chore` | Maintenance — deps, config, tooling |
| `build` | Build system changes (vite.config, wrangler, tsconfig) |
| `perf` | Measurable performance improvement |
| `ci` | CI/CD pipeline configuration |

### Scopes (project-specific)

| Scope | Covers |
|-------|--------|
| `theme` | CSS custom properties, dark mode, Tailwind entry |
| `layout` | App shell, sidebar, top bar, page wrappers |
| `ui-kit` | Reusable UI components in `src/components/` |
| `dashboard` | Dashboard page structure and sections |
| `routing` | TanStack Router routes and loaders |
| `deps` | Dependency installs or removals |
| `plans` | Plan documents and task files in `plans/` |
| `agents` | AGENTS.md |
| `config` | biome.json, tsconfig.json, vite.config.ts, wrangler.jsonc |

### Examples

```
feat(layout): add app shell with sidebar and main content area

Refs: TASK-002
```

```
feat(ui-kit): create sidebar navigation component

Layout-only: no real routing links yet. Navigation items
accept an icon, label, and active flag via props.

Refs: TASK-003
```

```
fix(theme): add missing border-border class to card component

Tailwind v4 does not automatically set border colour — the
border-border utility must be added explicitly alongside any
border-{side} class.

Refs: TASK-001
```

```
chore(deps): install shadcn/ui and configure components.json

Refs: TASK-001
```

```
docs(plans): add plan 01 UI kit layout index and task files
```

### Rules

- Subject line: **72 characters max**
- Use **imperative mood** — "add" not "added", "create" not "creates"
- **No period** at the end of the subject line
- Reference task IDs in the footer: `Refs: TASK-001`
- Breaking changes: append `!` after type/scope and explain in footer:
  ```
  feat(layout)!: change AppShell children API to named slots

  BREAKING CHANGE: AppShell no longer accepts children directly.
  Use <AppShell.Sidebar> and <AppShell.Main> named slots instead.
  ```

---

## Plan-Driven Development

### What Is a Plan?

A plan is a folder in `plans/NN-plan-name/` containing:
- `index.md` — the full plan document (goals, scope, architecture, decisions, task table)
- `tasks/TASK-NNN.md` — one file per task, in increasing numerical order

Plan numbers are **zero-padded to two digits**: `01`, `02`, …, `99`.
Task numbers are **zero-padded to three digits**: `TASK-001`, `TASK-002`, …

### Starting a New Plan

1. Copy `plans/templates/index-template.md` → `plans/NN-name/index.md`
2. Fill in every section — leave nothing as a placeholder
3. Copy `plans/templates/task-template.md` → `plans/NN-name/tasks/TASK-NNN.md` for each task
4. Commit: `docs(plans): add plan NN index and task files`

### Picking Up Work (Agent Protocol)

1. Read `plans/` directory — find the plan whose `index.md` has `Status: In Progress`
2. In that plan's `index.md`, find the first task with status `Ready` (or `Planned` if none are `Ready`)
3. **Read the full task file** before writing a single line of code
4. Update the task status to `In Progress`
5. Create a feature branch: `feat/TASK-NNN-description`
6. Implement the task, committing at logical checkpoints
7. Run all Validation Commands listed in the task file — fix failures before marking done
8. Update task status to `Done`, fill in **Completion Summary**
9. Update `index.md` Task Summary table and recalculate the **Progress %**
10. Open a PR to `develop`

### Task Status Flow

```
Backlog → Planned → Ready → In Progress → In Review → Testing → Done
                                        ↓
                                    Blocked (explain why in Notes)
                                        ↓
                                    → Ready (when unblocked)
```

### Updating a Task

Always update the task `.md` file when status changes — do not leave stale statuses.
Add a dated entry to **Progress Updates** for every meaningful milestone.

---

## Commands

### Development

```bash
pnpm dev              # Start Vite dev server on http://localhost:3000
pnpm build            # Production build (Vite → Cloudflare Workers)
pnpm preview          # Preview production build locally
```

### Code Quality

```bash
pnpm lint             # Biome lint check
pnpm format           # Biome format (writes files)
pnpm check            # Biome lint + format check combined (read-only)
```

### Testing

```bash
pnpm test             # Run Vitest (unit tests)
```

### Deployment

```bash
pnpm deploy           # pnpm build && wrangler deploy
```

### shadcn/ui

```bash
pnpm dlx shadcn@latest add button    # Add a component
pnpm dlx shadcn@latest add sidebar   # etc.
```

---

## Code Conventions

### TypeScript

- Strict mode is enabled in `tsconfig.json` — no `any`, no `@ts-ignore`
- Prefer `interface` over `type` for component props
- Name props interfaces `{ComponentName}Props`
- Named exports for all components (no default exports)

### React

- Functional components only
- No class components
- `children` typed as `React.ReactNode`
- Keep layout components layout-only — no data fetching, no business logic

### Tailwind CSS v4

- CSS-first configuration in `src/styles.css` via `@theme`
- **CRITICAL**: `border-{side}` alone has no color in v4 — always add `border-border` as well
  - Wrong: `<div className="border-b">`
  - Correct: `<div className="border-b border-border">`
- Use `@layer components` for non-primitive reusable styles
- Design tokens live as CSS custom properties under `@theme`

### shadcn/ui

- Generated files land in `src/components/ui/` — **do not edit these directly**
- Extend primitives by wrapping them in `src/components/` (e.g., `src/components/NavItem.tsx`)
- Use the `cn()` utility from `src/lib/utils.ts` for conditional class merging

### File Naming

| Kind | Convention | Example |
|------|-----------|---------|
| React component | `PascalCase.tsx` | `Sidebar.tsx` |
| Layout component | `PascalCase.tsx` in `src/layouts/` | `AppShell.tsx` |
| Utility / helper | `camelCase.ts` | `utils.ts` |
| Route file | TanStack Start convention | `routes/index.tsx` |
| Plan index | `index.md` | `plans/01-ui-kit-layout/index.md` |
| Task file | `TASK-NNN.md` (uppercase) | `tasks/TASK-001.md` |

---

## Non-Obvious Gotchas

1. **Tailwind v4 border color** — `border` / `border-t` / `border-b` render with no color unless `border-border` is also present. This affects every card, divider, and table row.

2. **React 19 + Strict Mode** — effects are double-invoked in development. Do not attempt to suppress this.

3. **TanStack Start SSR** — SSR is on by default. Avoid `window`, `document`, and other browser-only globals at module scope. Guard with `typeof window !== 'undefined'` or use `useEffect`.

4. **Biome replaces ESLint + Prettier** — do not install both. Biome handles linting and formatting via `biome.json`.

5. **Path aliases** — the project uses `#/*` → `./src/*` (see `package.json` `imports`). Use `#/components/...` not relative paths crossing directory boundaries.

6. **Cloudflare Workers constraints** — no Node.js built-ins (fs, path, crypto) unless polyfilled. Use Web APIs.

---

## What NOT to Do

- **Do not create `tailwind.config.js`** — this is a v4 CSS-first project. All config goes in `src/styles.css`.
- **Do not install ESLint or Prettier** — Biome is the single source of truth for code style.
- **Do not push directly to `main`** — all merges go through a `gh pr merge --squash` PR.
- **Do not branch task branches from `main`** — branch from the current plan branch.
- **Do not skip Conventional Commits format** — it drives changelogs and release automation.
- **Do not commit without running `pnpm biome check --write .` and `pnpm test` first** — both must pass.
- **Do not forget to bump the version** — every plan (minor) and every task (patch) requires a version bump in `package.json`, `nivora.config.json`, and a git tag on the merge commit to `main`.
- **Do not edit `src/components/ui/` files** — they are generated by shadcn/ui and will be overwritten.
- **Do not add content to layout tasks** — layout components must be content-agnostic; no hardcoded labels, counts, or data.
- **Do not leave task `.md` statuses stale** — update them as work progresses.
- **Do not mark a task Done without running Validation Commands** — a passing build and lint are the minimum bar.

---

## Change Log

### 2026-06-17
- Replaced gitflow develop-branch model with plan-branch-from-main strategy
- Added Semantic Versioning section (major by hand, minor per plan, patch per task)
- Added pre-commit checklist: `pnpm biome check --write` + `pnpm test` must pass before every commit
- Added `gh` CLI workflow for opening and merging PRs
- Added version tracking: `package.json`, `nivora.config.json`, git tag must stay in sync
- Created `nivora.config.json` at `v0.1.0`
- Added `"version": "0.1.0"` to `package.json`

### 2026-06-16
- Initial AGENTS.md created
- Covers: gitflow, conventional commits, plan-driven workflow, code conventions, gotchas
