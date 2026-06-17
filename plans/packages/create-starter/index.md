# @nivora-cms/create-starter

Interactive CLI scaffolder. `pnpm create @nivora-cms/starter@latest my-project` bootstraps a full NIVORA CMS monorepo: workspace config, Cloudflare adapter wired, Wrangler configured, ready to `pnpm dev`.

## Depends on
Nothing (standalone Node.js CLI — no internal CMS deps at runtime).

## Tech
- Node.js (ESM CLI runtime)
- `@clack/prompts` (interactive CLI prompts — nicer UX than inquirer)
- `tiged` / `degit` (template scaffolding from bundled templates)
- `execa` (run `pnpm install` post-scaffold)
- Simple string interpolation (project name injection into config files)

## Directory Structure

```
packages/create-starter/
├── bin/
│   └── cli.js                    # Entrypoint (#!/usr/bin/env node)
├── src/
│   ├── prompts.ts                # @clack/prompts flow: name → adapter → confirm
│   ├── scaffold.ts               # Copy template, interpolate vars, run pnpm install
│   ├── utils.ts                  # File write helpers, template var substitution
│   └── index.ts                  # Main orchestrator
├── templates/
│   └── cloudflare/               # Full scaffolded project template (v1 — only adapter)
│       ├── apps/
│       │   └── admin/            # TanStack Start app skeleton with Cloudflare Workers preset
│       │       ├── src/
│       │       │   ├── modules/  # Empty placeholder for local module overrides
│       │       │   └── routes/   # Minimal root route
│       │       └── wrangler.toml.template
│       ├── pnpm-workspace.yaml
│       ├── package.json.template
│       ├── biome.json
│       ├── tsconfig.json
│       └── .gitignore
└── package.json                  # "bin": { "create-@nivora-cms/starter": "bin/cli.js" }
```

Note: The CLI itself has no `nivora.config.ts` — it is not a CMS package; it is a scaffolding tool published to npm.

## Phases

### 01-cli-foundation
1. Package setup — `package.json` with `"bin"` field pointing to `bin/cli.js`; Node.js ESM; `"publishConfig": { "access": "public" }`
2. Prompt flow — `@clack/prompts` sequence: project name → (adapter: Cloudflare shown as only option for v1) → confirmation summary → proceed
3. Scaffold step — copy `templates/cloudflare/` into the target directory; substitute `{{PROJECT_NAME}}` and `{{PROJECT_SLUG}}` placeholders in all template files
4. `wrangler.toml` generation — generate with project-slug-prefixed binding names (`D1_{{PROJECT_SLUG}}`, `KV_{{PROJECT_SLUG}}`, `R2_{{PROJECT_SLUG}}`)
5. Post-install — run `pnpm install` in the new project directory via `execa`; print "Next steps" (create D1 database, set secrets, deploy)

### 02-template-content
1. `apps/admin/` template — TanStack Start app with Cloudflare Workers adapter preset; minimal `__root.tsx`, `_app.tsx`, `index.tsx`
2. Root config files — `pnpm-workspace.yaml` (`apps/*` + `packages/*`), root `package.json`, `biome.json` (shared linting), `tsconfig.json` (path aliases)
3. Example local module — `apps/admin/src/modules/hello/` — minimal `nivora.config.ts` (no routes, no settings, just identity) demonstrating the module pattern
4. Gitflow setup — initialize `main` + `develop` branches via `git init && git checkout -b develop`; add branch naming guide to `CONTRIBUTING.md`
5. `.gitignore` — standard Node + Cloudflare Workers ignores (`.wrangler/`, `.dev.vars`, `node_modules`)

### 03-dx-polish
1. `--template` flag — `pnpm create @nivora-cms/starter@latest my-project --template cloudflare` skips prompts
2. Version check — on run, check npm for newer version of `@nivora-cms/create-starter`; suggest update with exact command
3. Error recovery — if `pnpm install` fails, print exact commands the user can run manually; do not leave partial state
4. README generation — project-specific `README.md` with project name, setup steps (D1 create, secrets), and deploy command

## Notes
- Template content is bundled inside the package (inside `templates/`) — works offline; no GitHub fetch at runtime
- v1 supports Cloudflare only; the adapter prompt is pre-answered but the prompt flow is built to support future adapters
- The scaffolded project uses `@nivora-cms/*` packages as regular npm dependencies (not workspace deps) — the generated project is a standalone consumer, not a contributor to the monorepo
