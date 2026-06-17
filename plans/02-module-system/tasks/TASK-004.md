# TASK-004: i18n message collection pre-build step

## Status
Planned

## Priority
Medium

## Type
Infrastructure

## Owner
Team

## Created
2026-06-17

## Due Date
—

## Parent Plan
../index.md

---

## Summary
Write a `scripts/collect-i18n.ts` script that scans all discovered modules for their `i18n/*.json` translation files, namespaces each module's messages under its module slug, merges them into locale-specific output files, and writes the results to `src/i18n/merged/<locale>.json`. Paraglide will read from this output directory in a future plan.

## Business Value
Translations are split across modules for encapsulation (each module owns its own strings). Without a collection step, there's no single file for Paraglide (or any i18n system) to compile. This script is the build-time bridge between per-module message files and the global i18n namespace.

## Acceptance Criteria
- [ ] `pnpm collect-i18n` scans all module `i18n/*.json` files and writes `src/i18n/merged/en.json`
- [ ] Each module's messages are namespaced under the module slug, e.g. `core.dashboard.title`
- [ ] If two modules define the same namespaced key, the later-discovered module wins (with a console warning)
- [ ] Running `pnpm collect-i18n` is idempotent — same input produces same output
- [ ] The script handles missing `i18n/` directories gracefully (skips, no error)
- [ ] `src/i18n/merged/` is added to `.gitignore`
- [ ] `pnpm lint` and `pnpm build` pass

## Requirements
- Module slug is derived from the module name: `@nivora-cms/core` → `core`, `@nivora-cms/blog` → `blog`
- Input files: `src/modules/<name>/i18n/<locale>.json` (flat or nested JSON, any locale)
- Output: `src/i18n/merged/<locale>.json` — one file per discovered locale
- At minimum, each module must supply `en.json` (enforced by convention, not the script)
- The script shares the same fast-glob discovery logic as `generate-modules.ts` — consider extracting shared discovery into `scripts/lib/discover-modules.ts`

## Technical Design

### Shared discovery utility (`scripts/lib/discover-modules.ts`)
Both `generate-modules.ts` and `collect-i18n.ts` need to know which modules are active. Extract the discovery step:

```ts
// scripts/lib/discover-modules.ts
import fg from 'fast-glob'
import path from 'node:path'

export interface DiscoveredModule {
  name: string      // '@nivora-cms/core'
  slug: string      // 'core'
  configPath: string
  rootDir: string   // absolute path to module root dir
}

export async function discoverModules(cwd: string): Promise<DiscoveredModule[]> {
  // scan local src/modules/*
  // scan node_modules/@nivora-cms/* (for future npm packages)
  // return sorted list
}
```

### `scripts/collect-i18n.ts` algorithm
```
1. Call discoverModules()
2. For each module, glob i18n/<locale>.json files
3. For each file, read JSON and namespace all keys:
   key 'dashboard.title' in module 'core' → 'core.dashboard.title'
4. Merge into a per-locale accumulator object (warn on collision)
5. Write src/i18n/merged/<locale>.json for each locale
```

### Message file format convention
Each module's `i18n/en.json` uses flat dot-notation keys:
```json
{
  "dashboard.title": "Dashboard",
  "dashboard.subtitle": "Welcome back",
  "nav.home": "Home"
}
```

After namespacing, these become:
```json
{
  "core.dashboard.title": "Dashboard",
  "core.dashboard.subtitle": "Welcome back",
  "core.nav.home": "Home"
}
```

### `.gitignore` addition
```
# Generated i18n
src/i18n/merged/
```

### Integration with the build pipeline
Add `collect-i18n` to run alongside `generate-modules` in a combined `codegen` script:
```json
"codegen": "tsx scripts/generate-modules.ts && tsx scripts/collect-i18n.ts",
"predev": "pnpm codegen",
"prebuild": "pnpm codegen"
```

The Vite plugin watcher (from TASK-002) can also watch `src/modules/*/i18n/*.json` and re-run `collect-i18n` on change.

## Dependencies
- TASK-002 — `fast-glob` is already installed; discovery logic is shared

## Implementation Steps
1. Create `scripts/lib/` directory
2. Write `scripts/lib/discover-modules.ts` — refactor the discovery portion from `generate-modules.ts` into this shared util (or create it fresh if `generate-modules.ts` inlines discovery)
3. Write `scripts/collect-i18n.ts`
4. Update `package.json` scripts: add `collect-i18n`, update `predev`/`prebuild` to use combined `codegen`
5. Add `src/i18n/merged/` to `.gitignore`
6. Run `pnpm collect-i18n` — confirm output at `src/i18n/merged/en.json`
7. Run `pnpm lint` and `pnpm build`
8. Bump patch version

## Instructions for Developer
- Module slug extraction: strip the `@nivora-cms/` prefix and any remaining `/` segments. `@nivora-cms/blog-posts` → `blog-posts`.
- Nested JSON input (e.g. `{ "dashboard": { "title": "..." } }`) should be flattened to dot notation before namespacing. Write a small `flattenMessages(obj, prefix)` helper for this.
- The output file is purely a build artifact. It should NOT be imported by application code directly — it's the input for Paraglide's compiler (future plan). Do not create TypeScript types or imports for it yet.
- When the Vite plugin watches for i18n changes, add: `server.watcher.add('src/modules/*/i18n/*.json')`

## Files Expected To Change
- `scripts/lib/discover-modules.ts` — created
- `scripts/collect-i18n.ts` — created
- `scripts/generate-modules.ts` — refactored to use `discoverModules()` from shared lib
- `vite/plugins/modules.ts` — add i18n file watcher
- `package.json` — add `collect-i18n` script, update `predev`/`prebuild`, version bump
- `nivora.config.json` — version bump
- `.gitignore` — add `src/i18n/merged/`
- `src/i18n/merged/en.json` — created (generated, gitignored)

---

## AI Context

### Relevant Files
- `scripts/generate-modules.ts` — (from TASK-002) source of discovery logic to refactor
- `vite/plugins/modules.ts` — (from TASK-002) add i18n file watcher here
- `src/modules/core/i18n/en.json` — (from TASK-005) the first real input for this script
- `package.json` — update scripts

### Constraints
- No external i18n library dependencies in this script — it's just JSON merging and file I/O
- The output format must remain stable (flat dot-notation) since Paraglide integration will depend on it

### Validation Commands
```bash
pnpm collect-i18n
pnpm lint
pnpm build
```

### Expected Outcome
`src/i18n/merged/en.json` exists after `pnpm collect-i18n`, contains namespaced keys from all discovered modules, and `pnpm build` triggers collection automatically via `prebuild`.

---

## Test Plan

### Unit Tests
- Unit test for the `flattenMessages` helper (nested → dot notation)
- Unit test for the namespacing logic (`core.key` from `core` module + `key`)
- Unit test for collision detection (two modules with same key → warning + last-wins behavior)

### Integration Tests
- Fixture modules with known i18n files → confirm merged output shape

### Manual Tests
1. `pnpm collect-i18n` — inspect `src/i18n/merged/en.json`
2. Add a duplicate key to two fixture modules — confirm console warning appears

## Definition of Done
- [ ] Code implemented per Acceptance Criteria
- [ ] Validation Commands all pass (`pnpm lint`, `pnpm build`)
- [ ] Task status updated to `Done` in this file
- [ ] Plan `index.md` Task Summary updated
- [ ] Completion Summary filled in below
- [ ] Feature branch PR opened against `plan/02-module-system`

## Risks
- None significant — this is pure Node.js file I/O with no runtime impact

## Notes
This task depends on the core module (`src/modules/core/i18n/en.json`) existing as input. If TASK-005 is not yet done, the script will produce an empty `en.json` — that is valid and not an error. The CI check for a non-empty output can be added alongside the Paraglide integration plan.

---

## Progress Updates

### 2026-06-17
- Task created

---

## Completion Summary
(To be filled when complete)
