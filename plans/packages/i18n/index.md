# @nivora-cms/i18n

Paraglide JS integration for the NIVORA admin UI. Locale is user-preference based (stored in D1 `users.locale` column), not URL-path based. Handles message collection from all `@nivora-cms/*` packages, compilation, and runtime locale switching.

## Depends on
Nothing (standalone — no internal CMS deps).

## Tech
- Paraglide JS (`@inlang/paraglide-js`)
- @inlang/paraglide-vite (Vite plugin for compilation)
- inlang project config (`project.inlang/settings.json`)

## Directory Structure

```
packages/i18n/
├── src/
│   ├── provider/
│   │   ├── LocaleProvider.tsx        # Passes locale to Paraglide runtime; SSR-safe
│   │   └── use-locale.ts             # useLocale() hook — returns current locale + setLocale fn
│   └── components/
│       └── LocaleSwitcher.tsx        # Dropdown in TopBar; updates user profile via server fn
├── scripts/
│   └── collect-messages.ts           # Scans packages' i18n/en.json → messages/en.json
├── messages/                          # Compiled by Paraglide from collected source files
│   └── en.json                       # Combined namespaced messages (generated — do not edit)
├── project.inlang/
│   └── settings.json                 # inlang project config
└── nivora.config.ts
```

## `nivora.config.ts`

```ts
import { definePackageConfig } from '@nivora-cms/core'

export default definePackageConfig({
  name: 'i18n',
  description: 'User-preference locale and message compilation via Paraglide JS',
  version: '0.1.0',

  routes: {
    admin: false,
    api: false,
  },

  settings: {
    defaultLocale: {
      type: 'string',
      input: 'select',
      default: 'en',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Nederlands', value: 'nl' },
      ],
      label: 'Default locale',
      description: 'Used when a user has not set a locale preference',
    },
    fallbackLocale: {
      type: 'string',
      input: 'select',
      default: 'en',
      options: [
        { label: 'English', value: 'en' },
      ],
      label: 'Fallback locale',
      description: 'Used when a message is missing in the selected locale',
    },
  },
})
```

## Phases

### 01-paraglide-setup
1. Install Paraglide + Vite plugin; configure `project.inlang/settings.json`
2. `collect-messages.ts` script — scans all workspace packages' `i18n/<locale>.json` files, namespaces keys by package slug (e.g. `content.editor.save`), merges into `messages/en.json`
3. Vite plugin integration — `@inlang/paraglide-vite` compiles messages at build time; outputs typed `paraglide/messages.js`
4. Base English messages — all core UI strings (navigation labels, action buttons, error messages, confirmations) in the `admin.*` and `core.*` namespaces
5. Type-safe usage — `import * as m from 'paraglide/messages'`; message key typos caught at compile time

### 02-user-preference-locale
1. Locale stored in user profile — `users.locale` column in D1 (VARCHAR, default `'en'`)
2. `LocaleProvider` — reads locale from session in `__root.tsx` loader; injects into Paraglide runtime before render; SSR-safe (no flash)
3. `LocaleSwitcher` — dropdown in admin TopBar and user settings page; calls a server fn to update `users.locale` in D1; triggers page reload to pick up new compiled messages
4. SSR locale injection — TanStack Start `__root.tsx` loader fetches user locale; passed as `context.locale` to all child loaders
5. Adding a new locale — process: create `packages/*/i18n/<locale>.json`, run `pnpm collect-messages`, rebuild

## Notes
- Paraglide compiles messages at build time — zero runtime overhead; no dynamic string loading
- Message keys follow the pattern `<package-slug>.<feature>.<key>`: `content.editor.save`, `auth.login.title`, `admin.nav.dashboard`
- Each package owns its own `i18n/en.json` with its namespace; the collection script merges them
- RTL support is deferred; document CSS `dir` attribute approach for when it's needed

## Admin UI locale vs Content locale — two separate systems

These are independent and must not be confused:

| | Admin UI locale | Content locale |
|---|---|---|
| **Owned by** | `@nivora-cms/i18n` | `@nivora-cms/content` |
| **Stored in** | `users.locale` in D1 | `content_entries.locale` column in D1 |
| **Configured in** | `@nivora-cms/i18n` settings: `defaultLocale`, `fallbackLocale` | `@nivora-cms/content` settings: `defaultLocale`, `enabledLocales`, `localeFallback` |
| **Affects** | Admin panel button labels, form labels, navigation text | Which translation of content is served by the API |
| **Switching** | User profile setting; reloads compiled Paraglide messages | `?locale=` query param on API requests or locale bar in entry editor |
| **Fallback** | Paraglide falls back to `fallbackLocale` for missing message keys | API returns `defaultLocale` entry when requested locale has no translation |

A user with admin UI locale `nl` editing content can still edit the `en` translation of an entry — the two settings are orthogonal.
