# @nivora-cms/i18n — ✅ COMPLETE (feature/i18n, 2026-06-17)

Paraglide JS integration for the NIVORA admin UI. Locale is user-preference based (stored in D1 `users.locale` column), not URL-path based. Handles message collection from all `@nivora-cms/*` packages, compilation, and runtime locale switching.

## Depends on
Nothing (standalone — no internal CMS deps).

## Tech
- Paraglide JS (`@inlang/paraglide-js@^2.20.0`)
- `paraglideVitePlugin` — exported from `@inlang/paraglide-js` (used in `apps/admin/vite.config.ts`)
- inlang project config (`project.inlang/settings.json`)

## Directory Structure

```
packages/i18n/
├── src/
│   ├── context.ts                # LocaleContext, useLocaleContext, Locale type
│   ├── provider/
│   │   ├── LocaleProvider.tsx    # Passes locale + setLocale to React Context; SSR-safe
│   │   └── use-locale.ts         # useLocale() hook — returns { locale, setLocale, locales }
│   ├── components/
│   │   └── LocaleSwitcher.tsx    # Native <select> locale switcher; injectable onLocaleChange
│   ├── vite.ts                   # Re-exports paraglideVitePlugin from @inlang/paraglide-js
│   └── index.ts                  # Barrel: LocaleProvider, useLocale, LocaleSwitcher, types
├── scripts/
│   └── collect-messages.ts       # Scans packages' i18n/{locale}.json → messages/{locale}.json
├── messages/
│   ├── en.json                   # Source English messages (admin.* + core.* namespaces)
│   └── nl.json                   # Source Dutch messages
├── project.inlang/
│   └── settings.json             # inlang project config: baseLocale, locales, modules
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
      options: [{ label: 'English', value: 'en' }],
      label: 'Fallback locale',
      description: 'Used when a message is missing in the selected locale',
    },
  },
})
```

## Phases

### 01-paraglide-setup ✅
1. ✅ `@inlang/paraglide-js@^2.20.0` installed; `project.inlang/settings.json` configured
2. ✅ `collect-messages.ts` — scans all `packages/*/i18n/{locale}.json`, prefixes keys with package slug, merges into `messages/{locale}.json`
3. ✅ `src/vite.ts` re-exports `paraglideVitePlugin` from `@inlang/paraglide-js` under `@nivora-cms/i18n/vite`; wire into `apps/admin/vite.config.ts` during step 10
4. ✅ Base English + Dutch messages — `admin.*` and `core.*` namespaces in `messages/en.json` + `messages/nl.json`
5. Type-safe usage — deferred to `apps/admin` integration (step 10); `paraglideVitePlugin` outputs compiled `paraglide/` directory; import `* as m from 'paraglide/messages'`

### 02-user-preference-locale ✅
1. ✅ `LocaleProvider` — accepts `locale` (from SSR loader), `locales`, and `onLocaleChange` callback; manages locale state in React Context; SSR-safe (no flash)
2. ✅ `useLocale()` hook — returns `{ locale, setLocale, locales }`
3. ✅ `LocaleSwitcher` — native `<select>` in base package; admin TopBar wrapper created in `@nivora-cms/admin` (step 9)
4. Paraglide bridge — deferred to `apps/admin` step 10: `overwriteGetLocale(() => locale)` wires the React context into Paraglide's runtime for compiled message resolution
5. `users.locale` column — deferred to `@nivora-cms/auth` (step 5): Drizzle migration adds the column; server fn updates it via D1

## Notes
- Paraglide compiles messages at build time via `paraglideVitePlugin` in `apps/admin` — zero runtime overhead
- Message keys follow `<package-slug>.<feature>.<key>`: `content.editor.save`, `auth.login.title`, `admin.nav.dashboard`
- `messages/en.json` and `messages/nl.json` are the source files; the Vite plugin compiles them at build time
- `collect-messages.ts` only runs when new packages add their own `i18n/*.json` files
- Locale bridge to Paraglide runtime is set up in `apps/admin/__root.tsx` via `overwriteGetLocale()`
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
