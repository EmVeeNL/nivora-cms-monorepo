# @nivora-cms/editor

Lexical-based rich text editor for the NIVORA admin. Used in content entry forms wherever a `richtext` field is defined. Serializes to/from a portable JSON format stored in D1.

## Depends on
- `@nivora-cms/ui` (toolbar button styles, media picker modal)

## Tech
- Lexical (Meta's extensible text editor framework)
- @lexical/react (React bindings)
- @lexical/rich-text, @lexical/list, @lexical/link, @lexical/code (official Lexical plugins)
- @lexical/html (HTML serialization)
- Zod v4 (editor state validation)

## Directory Structure

```
packages/editor/
├── src/
│   ├── components/
│   │   ├── RichTextEditor.tsx        # Main editor component (controlled)
│   │   ├── Toolbar.tsx               # Bold, Italic, H1–H3, list, blockquote, code, table
│   │   └── ReadonlyRenderer.tsx      # Static HTML output without editor overhead
│   ├── nodes/
│   │   ├── ImageNode.tsx             # Custom image node with R2-backed media picker
│   │   ├── LinkNode.tsx              # Internal + external link node
│   │   ├── CodeNode.tsx              # Syntax-highlighted code block (Prism via Web Worker)
│   │   └── TableNode.tsx             # Basic table node
│   ├── plugins/
│   │   ├── AutoSavePlugin.tsx        # Debounced save (2s); fires onChange callback
│   │   ├── CharCountPlugin.tsx       # Live word/character count in toolbar footer
│   │   └── MediaPickerPlugin.tsx     # Opens @nivora-cms/ui MediaPicker for image insertion
│   ├── serializers/
│   │   ├── to-html.ts                # editorStateToHtml(state): string
│   │   └── to-text.ts                # editorStateToPlainText(state): string (for search indexing)
│   └── index.ts                      # Barrel: RichTextEditor, ReadonlyRenderer, serializers
└── nivora.config.ts
```

## `nivora.config.ts`

```ts
import { definePackageConfig } from '@nivora-cms/core'

export default definePackageConfig({
  name: 'Editor',
  description: 'Lexical rich text editor for content entry forms',
  version: '0.1.0',

  dependencies: {
    '@nivora-cms/core': '^0.1.0',
    '@nivora-cms/ui': '^0.1.0',
  },

  routes: {
    admin: false,
    api: false,
  },

  settings: {
    spellCheck: {
      type: 'boolean',
      input: 'switch',
      default: true,
      label: 'Spell check',
      description: 'Enable browser spell check in the rich text editor',
    },
    autoSaveDelay: {
      type: 'number',
      input: 'number',
      default: 2000,
      min: 500,
      max: 10000,
      label: 'Auto-save delay (ms)',
      description: 'Milliseconds after last keystroke before auto-save triggers',
    },
    codeHighlighting: {
      type: 'boolean',
      input: 'switch',
      default: true,
      label: 'Code syntax highlighting',
      description: 'Highlight code blocks using Prism (loaded via Web Worker)',
    },
  },
})
```

## Phases

### 01-lexical-setup
1. Install Lexical + React bindings; configure editor theme using `@nivora-cms/ui` CSS custom properties
2. Base `RichTextEditor` component — controlled state, `onChange(editorState)` callback, `initialValue` prop (Lexical JSON)
3. Toolbar — Bold, Italic, Underline, Strikethrough, H1–H3, ordered/unordered list, blockquote, code block
4. JSON serialization — Lexical editor state ↔ JSON (`JSON.stringify(editorState)` / `createEditorStateFromJson`)
5. `editorStateToHtml(state)` — uses `@lexical/html` for API responses; HTML is derived on read, never stored

### 02-advanced-nodes
1. Image node — opens `@nivora-cms/ui` MediaPicker modal; stores R2 asset key + alt text + dimensions
2. Link node — two modes: internal (search + select content entry, resolves to slug at delivery) + external (URL + target + rel)
3. Code block node — language selector; Prism syntax highlighting loaded via Web Worker (keeps main thread unblocked)
4. Table node — insert, add/remove rows and columns, basic cell editing

### 03-editing-features
1. Character/word count plugin — live display in toolbar footer
2. Auto-save plugin — debounced save (configurable delay from settings); triggers `onAutoSave(editorState)` callback
3. `ReadonlyRenderer` — renders a saved Lexical JSON state as static HTML using `@lexical/html`; no editor bundle loaded; used for preview panes and search snippets
4. `editorStateToPlainText(state)` — extracts plain text for MiniSearch indexing (strips formatting)

## Notes
- Lexical chosen over TipTap for lighter bundle size and no Node.js dependencies (safe in Cloudflare Workers context for serialization utilities)
- Editor state is always stored as Lexical JSON in D1; HTML is derived on read via `editorStateToHtml`, never stored separately
- The editor is a client component — wrap in `'use client'` boundary in TanStack Start route files
- `ReadonlyRenderer` is a server component — safe to import in SSR contexts
