# TASK-006: Tests — merge logic + generator output

## Status
Planned

## Priority
Medium

## Type
Testing

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
Write unit tests for `deepMergeModuleConfig`, the `flattenMessages` i18n helper, and the generator's output shape using a fixture module. These tests ensure the module system's core logic is correct and catches regressions when merge rules or the generator template change.

## Business Value
The merge logic has multiple rules per field — getting any one wrong silently produces incorrect module configs that are hard to debug at runtime. Unit tests make the rules explicit and catch regressions before they reach production.

## Acceptance Criteria
- [ ] `deepMergeModuleConfig` tests cover every merge strategy documented in `index.md`
- [ ] Edge cases tested: empty arrays, missing fields (undefined), key collisions, all-override scenario
- [ ] `flattenMessages` tests cover nested and flat input
- [ ] Generator fixture test: creates a temp fixture module, runs the generator, asserts the output file contains expected imports and registry entries
- [ ] All tests pass: `pnpm test`
- [ ] `pnpm lint` and `pnpm build` pass

## Requirements
- Tests live in `src/core/module/tests/` following the existing Vitest conventions
- Merge tests use the `unit` Vitest project (`*.test.ts`)
- Generator fixture test uses the `unit` project too (pure Node.js, no Cloudflare)
- No mocking of the file system — generator test writes to a real temp directory (use `node:os.tmpdir()`)
- Tests are self-cleaning — any temp files created are deleted in `afterEach`/`afterAll`

## Technical Design

### Test files
```
src/core/module/tests/
├── merge.test.ts         ← deepMergeModuleConfig unit tests
├── i18n-flatten.test.ts  ← flattenMessages unit tests
└── generator.test.ts     ← generator output shape test (fixture + real fs)
```

### `merge.test.ts` — key test cases

```ts
describe('deepMergeModuleConfig', () => {
  // sidebar: merge groups by label
  it('merges sidebar groups by group label — items concatenated', () => {})
  it('adds new group from override when no base group matches', () => {})
  it('override group order takes precedence', () => {})

  // settings.fields: merge by key
  it('override field with same key replaces base field', () => {})
  it('new field from override is added', () => {})
  it('base fields not in override are preserved', () => {})

  // routes: full replacement
  it('override routes replaces base routes entirely', () => {})
  it('missing override routes preserves base routes', () => {})

  // middleware: concatenate
  it('override middleware is appended after base', () => {})

  // overwrites: shallow merge
  it('override overwrites keys replace base, others preserved', () => {})

  // dashboard.widgets: merge by id
  it('widget with same id is replaced by override', () => {})
  it('new widget from override is added', () => {})

  // emails: merge by id
  it('email with same id is replaced by override', () => {})

  // edge cases
  it('handles empty base — returns override', () => {})
  it('handles empty override — returns base', () => {})
  it('preserves name from override', () => {})
  it('preserves extends from override', () => {})
})
```

### `i18n-flatten.test.ts`

```ts
describe('flattenMessages', () => {
  it('flattens nested object to dot-notation keys', () => {
    expect(flattenMessages({ dashboard: { title: 'Hello' } }))
      .toEqual({ 'dashboard.title': 'Hello' })
  })
  it('preserves already-flat keys unchanged', () => {})
  it('handles empty object', () => {})
  it('handles deeply nested object (3+ levels)', () => {})
})
```

### `generator.test.ts`

```ts
describe('generate-modules (fixture)', () => {
  it('emits a registry file with the fixture module imported', async () => {
    // 1. Create a temp dir with a minimal fixture module:
    //    fixture/nivora.config.ts with defineModuleConfig({ name: '@nivora-cms/test-fixture' })
    // 2. Run the generator pointed at the temp dir
    // 3. Read the generated output
    // 4. Assert:
    //    - File starts with the auto-generated header
    //    - Contains an import from the fixture's nivora.config.ts path
    //    - moduleRegistry includes '@nivora-cms/test-fixture'
  })

  it('handles a module with extends — emits deepMergeModuleConfig call', async () => {})

  it('emits empty registry when no modules exist', async () => {})
})
```

Note: The generator test calls the generator function directly (not via `execSync`) for speed and testability. Extract the generator's core logic into an async function `generateModuleRegistry(options: { cwd: string, outputPath: string })` so it can be called in tests without spawning a child process.

## Dependencies
- TASK-001 — `deepMergeModuleConfig` and `flattenMessages` must exist
- TASK-002 — generator function must be extractable for testing
- TASK-004 — `flattenMessages` lives in `scripts/lib/` and must be importable in tests

## Implementation Steps
1. Create `src/core/module/tests/` directory
2. Write `src/core/module/tests/merge.test.ts` — cover all strategies and edge cases
3. Write `src/core/module/tests/i18n-flatten.test.ts`
4. Refactor generator: extract core logic into `generateModuleRegistry()` function (testable without CLI)
5. Write `src/core/module/tests/generator.test.ts` — fixture-based test
6. Run `pnpm test` — all must pass
7. Run `pnpm lint` and `pnpm build`
8. Bump patch version

## Instructions for Developer
- `flattenMessages` lives in `scripts/lib/collect-i18n.ts` or a shared util. Import it in the test using a relative path — do NOT use the `#/` alias for files in `scripts/` (only `src/` is covered by the alias).
- The generator test should not depend on `node_modules/@nivora-cms/*` existing — all test scenarios use local fixture dirs in `os.tmpdir()`.
- Use `import.meta.url` + `URL` to build absolute paths in tests (Vitest runs as ESM).
- Keep fixture module configs minimal — just `name` and one `sidebar` item to keep the test readable.
- Do not snapshot-test the full generated file string — it's fragile. Instead, assert on specific substrings (the import line, the module name in `moduleRegistry`).

## Files Expected To Change
- `src/core/module/tests/merge.test.ts` — created
- `src/core/module/tests/i18n-flatten.test.ts` — created
- `src/core/module/tests/generator.test.ts` — created
- `scripts/generate-modules.ts` — refactor: extract `generateModuleRegistry()` function
- `package.json` — version bump
- `nivora.config.json` — version bump

---

## AI Context

### Relevant Files
- `src/core/module/merge.ts` — (TASK-001) function under test
- `scripts/collect-i18n.ts` — (TASK-004) `flattenMessages` function under test
- `scripts/generate-modules.ts` — (TASK-002) function to extract and test
- `vitest.config.ts` — existing test config; `unit` project runs `*.test.ts` in Node
- `plans/02-module-system/index.md` — merge strategy table (the spec for merge tests)

### Constraints
- All tests use the `unit` Vitest project — no jsdom, no Cloudflare bindings
- Temp directories created in tests must be cleaned up (no leftover files in the repo)
- No snapshot tests — assert on specific expected values

### Validation Commands
```bash
pnpm test
pnpm lint
pnpm build
```

### Expected Outcome
`pnpm test` passes with all merge, i18n, and generator tests green. Coverage of `merge.ts` is effectively 100% (all branches exercised).

---

## Test Plan

### Unit Tests
- `merge.test.ts` — every merge strategy and edge case
- `i18n-flatten.test.ts` — flattenMessages helper
- `generator.test.ts` — generator output with fixture modules

### Integration Tests
- None beyond the generator fixture test

### Manual Tests
- None — this task is entirely automated tests

## Definition of Done
- [ ] Code implemented per Acceptance Criteria
- [ ] Validation Commands all pass (`pnpm test`, `pnpm lint`, `pnpm build`)
- [ ] Task status updated to `Done` in this file
- [ ] Plan `index.md` Task Summary updated
- [ ] Completion Summary filled in below
- [ ] Feature branch PR opened against `plan/02-module-system`

## Risks
- Generator test requires writing and reading actual files — may be slow on first run. Use `os.tmpdir()` for a RAM-backed path if available on the CI platform.

## Notes
This is the last task in Plan 02. After it passes, update `plans/02-module-system/index.md` status to `Done`, open the plan PR to `main`, and tag `v0.2.0`.

---

## Progress Updates

### 2026-06-17
- Task created

---

## Completion Summary
(To be filled when complete)
