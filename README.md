# react-mail-editor

A customizable, extensible **drag-and-drop email builder for React 19**, built on
[shadcn/ui](https://ui.shadcn.com) + Radix + Tailwind v4.

It ships as one self-contained component with **zero global setup**: no Tailwind
in your host app, no CSS reset, no provider tree. Drop it into a WordPress admin
page, a Laravel Inertia app, a Django template or any React SPA — the styles are
namespaced and scoped so the host cannot leak in and the editor cannot leak out.

```bash
npm install react-mail-editor
```

```tsx
import { useState } from 'react'
import { EmailEditor, type Design } from 'react-mail-editor'
import 'react-mail-editor/style.css'

export function App() {
  const [design, setDesign] = useState<Design>()

  // Give it a sized container — the editor fills 100% height.
  return (
    <div style={{ height: '100vh' }}>
      <EmailEditor value={design} onChange={setDesign} />
    </div>
  )
}
```

### React compatibility

Works on **React 18.3 and React 19**. Every component uses `forwardRef`, not
React 19's ref-as-a-prop, specifically so the package runs against the React
that WordPress bundles — [WordPress 7.1 still ships React
18.3](https://make.wordpress.org/core/2026/07/24/react-19-punted-beyond-wordpress-7-1-experiment-in-gutenberg/)
after the React 19 upgrade was reverted in Gutenberg.

```jsonc
"peerDependencies": { "react": "^18.0.0 || ^19.0.0", "react-dom": "^18.0.0 || ^19.0.0" }
```

The full interaction suite (imperative ref API, tooltips, popovers, selects,
dialogs, drag & drop, inline rich text) is run against both 18.3.1 and 19.2 —
zero errors and zero ref warnings on either.

---

## Features

- **Drag & drop that lands where you aim.** A drop target sits in every gap, so
  you can drag blocks from the palette into any column, move them across
  columns and reorder rows — with a live insertion line and keyboard-accessible
  dragging.
- **14 built-in blocks** — heading, text, button, image, divider, spacer,
  social, menu, icon list, video, product card, table, countdown and custom
  HTML — plus `defineBlock()` for your own.
- **Layers tree.** Select, rename, lock, hide and reorder at any depth, which
  beats hunting for hover targets on a long newsletter.
- **Real mobile overrides.** A Desktop/Mobile scope switch writes per-block
  overrides that export as genuine `@media (max-width: 600px)` rules — not
  inline styles, which email clients ignore inside media queries.
- **Inbox preview.** Sender/subject/preheader chrome, desktop and mobile
  frames, a dark-client toggle and a plain-text view.
- **Export to HTML, JSON or plain text**, with merge tokens either kept for a
  server-side merge engine or replaced by their fallback values, pretty-printed
  or minified.
- **Pre-send checks** for the things that actually break sends: Gmail's ~102 KB
  clipping limit, missing `alt` text, `http://` assets, inline `data:` images
  and a missing unsubscribe link.
- **Built for real inboxes.** Table-based layout with inline styles, MSO ghost
  tables and VML `roundrect` buttons for Outlook, and an optional
  `prefers-color-scheme` block in the exported email.
- **Merge variables** insertable into any text block from the rich-text toolbar
  and managed from one panel.
- **Undo/redo** with edit coalescing, localStorage autosave, a template
  gallery, token-based theming and full keyboard shortcuts.
- **Style isolation** that survives WordPress admin CSS — see
  [WordPress integration](#wordpress-integration).

---

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` / `onChange` | `Design` / `(d) => void` | — | Controlled design JSON (debounced ~250 ms). |
| `defaultValue` | `Design` | — | Uncontrolled starting design. |
| `blocks` | `BlockDefinition[]` | `[]` | Custom blocks, merged with the built-ins. |
| `disabledBlocks` | `string[]` | `[]` | Hide built-in block types. |
| `theme` | `ThemeTokens` | — | Colour / typography overrides. |
| `colorMode` | `'light' \| 'dark' \| 'auto'` | `'light'` | Editor chrome theme. |
| `onColorModeChange` | `(m) => void` | — | Fires when the user toggles it. |
| `preview` / `onPreviewChange` | `boolean` / `(b) => void` | — | Controlled preview mode. |
| `config` | `EditorConfig` | — | Feature flags, labels, templates, autosave. |
| `storage` | `'local' \| 'none'` | `'local'` | `local` autosaves to `localStorage`. |
| `onLoad` | `() => Design \| Promise<Design>` | — | Fetch the initial design (e.g. from your API). |
| `onSave` | `(design) => void \| Promise` | download JSON | Handles **Save**. |
| `onSaveTemplate` | `(payload) => void \| Promise` | — | Handles **Save as template**. |
| `onExport` | `(html, design) => void \| Promise` | opens modal | Receives the exported HTML. |
| `onImageUpload` | `(file) => Promise<string>` | base64 | Upload an image, return its URL. |
| `onSelect` | `(selection) => void` | — | Selection changed. |
| `onReady` | `(api: EditorApi) => void` | — | Imperative API handle. |
| `ref` | `Ref<EditorApi>` | — | Same API via a ref. |
| `header` / `headerBrand` / `headerActions` / `emptyState` | `ReactNode` | — | Slot overrides. |

### Imperative API

```ts
const api = useRef<EditorApi>(null)

api.current.getDesign()            // deep-cloned snapshot
api.current.loadDesign(design)
api.current.newDesign()
api.current.exportHtml({ variables: 'fallback' })
api.current.exportText()
api.current.save(); api.current.export()
api.current.undo(); api.current.redo()
api.current.canUndo(); api.current.canRedo()
api.current.registerBlock(def)
api.current.select({ kind: 'content', id })
api.current.setDevice('mobile')
api.current.setPreview(true)
api.current.setColorMode('dark')
```

### Keyboard

`Ctrl/⌘+Z` undo · `Ctrl/⌘+Shift+Z` redo · `Ctrl/⌘+S` save · `Ctrl/⌘+P` preview ·
`Ctrl/⌘+D` duplicate selection · `Delete` remove selection · `Esc` leave inline
editing / preview.

---

## Build your own block

A block is one object: default values, a canvas renderer, an inspector schema
and an HTML serialiser. Everything else (selection, drag & drop, undo, mobile
overrides, export) comes for free.

```tsx
import { defineBlock, type BlockRenderProps, type Values } from 'react-mail-editor'
import { Star } from 'lucide-react'

interface RatingValues extends Values {
  stars: number
  color: string
  align: 'left' | 'center' | 'right'
}

export const ratingBlock = defineBlock<RatingValues>({
  type: 'rating',
  label: 'Rating',
  icon: Star,
  group: 'content',
  keywords: ['stars', 'review'],
  defaultValues: () => ({ stars: 5, color: '#f59e0b', align: 'center' }),

  // Canvas renderer — inline styles only, so it looks like the email.
  render: ({ values }: BlockRenderProps<RatingValues>) => (
    <div style={{ padding: '16px 24px', textAlign: values.align, color: values.color }}>
      {'★'.repeat(values.stars)}
    </div>
  ),

  inspector: [
    {
      title: 'Rating',
      controls: [
        { type: 'slider', key: 'stars', label: 'Stars', min: 0, max: 5, step: 1 },
        { type: 'color', key: 'color', label: 'Color' },
        { type: 'align', key: 'align', label: 'Align', responsive: true },
      ],
    },
  ],

  // Email-safe HTML.
  toHtml: (v, ctx) =>
    `<table role="presentation" width="100%"><tr><td class="${ctx.className}" align="${v.align}" ` +
    `style="padding:16px 24px;color:${v.color};">${'&#9733;'.repeat(v.stars)}</td></tr></table>`,

  toText: (v) => '*'.repeat(v.stars),

  // Optional: what the Mobile tab may override, and the CSS it emits.
  responsiveKeys: ['align'],
  mobileCss: (v, m, sel) => (m.align ? `${sel}{text-align:${m.align} !important;}` : ''),
})
```

```tsx
<EmailEditor blocks={[ratingBlock]} />
```

**Inspector control catalog:** `text`, `textarea`, `number`, `slider`, `color`,
`select`, `segmented`, `align`, `toggle`, `spacing`, `border`, `font`, `link`,
`image`, `background`, `list`, `richtext`, `custom`.

Any control with `responsive: true` becomes editable in the Mobile scope; the
value is stored in the node's `mobile` bag and emitted inside
`@media (max-width: 600px)` — never as an inline style, so real email clients
honour it.

---

## Theming

Tokens are scoped per instance, so several themed editors can coexist on one page.

```tsx
<EmailEditor
  colorMode="auto"
  theme={{
    colors: { brand: '#0ea5e9', brandSoft: '#e0f2fe', ink: '#0b1324' },
    dark: { brand: '#38bdf8' },
    font: { sans: 'Inter, sans-serif', baseSize: '13px' },
    radius: '0.375rem',
  }}
/>
```

You can also set the `--rme-ui-*` custom properties on any ancestor of
`.rme-root`.

---

## Config

```ts
const config: EditorConfig = {
  contentWidth: 600,
  devices: ['desktop', 'mobile'],
  actions: { import: false, saveTemplate: true },   // all default true except saveTemplate
  labels: { brand: 'Acme Mailer', save: 'Publish' },
  labeledActions: true,
  templates: myTemplates,        // replaces the five built-ins
  autosaveMs: 800,               // localStorage debounce; ignored when storage="none"
  storageKey: 'acme:email',
  variableSyntax: 'triple',      // {{{name}}} | {{name}} | %%name%%
  fonts: myFontStacks,
  layersOpen: false,
  showMetaBar: true,
  historyLimit: 60,
  prefetch: true,           // warm the lazy chunks on idle; false = load on first use
}
```

---

## Bundle size

The two heaviest dependencies are code-split, because neither is needed to
*display* an email — only to edit text in one, or to pretty-print an export.

| Chunk | Raw | Gzip | Loaded |
| --- | ---: | ---: | --- |
| `react-mail-editor.js` (entry) | 423 KB | **107 KB** | immediately |
| shared UI chunk | 132 KB | 39 KB | immediately |
| `chunks/rich-text-*.js` (Tiptap + ProseMirror) | 507 KB | 140 KB | on idle, or first double-click |
| `chunks/html-format-*.js` (js-beautify) | 117 KB | 27 KB | on idle, or first Export |
| `style.css` | 43 KB | 7 KB | immediately |

Initial JS drops from **314 KB gzip to ~146 KB** — the editor paints, the canvas
renders and drag & drop works before Tiptap is anywhere on the wire.

The lazy chunks are prefetched during the first idle window, so in practice the
first double-click is still instant; blocks also warm the editor chunk on
pointer-enter. Set `config.prefetch: false` to load them strictly on first use.

> If you re-bundle the package (webpack, Vite, Rollup, `@wordpress/scripts`),
> your bundler inherits the split automatically — the dynamic `import()`
> boundaries are preserved in both the ESM and CJS builds.

---

## Server-side persistence

```tsx
<EmailEditor
  storage="none"
  onLoad={async () => (await api.get('/designs/1')).data.design}
  onSave={async (design) => api.put('/designs/1', { design })}
  onImageUpload={async (file) => (await api.upload(file)).url}
  onExport={(html) => api.post('/designs/1/render', { html })}
  headerActions={<button onClick={publish}>Publish</button>}
/>
```

**What to persist:** the `design` is plain JSON — store it in one `json`/`jsonb`/
`longtext` column. The HTML is derived; only cache it if you want a
ready-to-send render.

```
designs:  id | name | design (json) | html (longtext, optional) | updated_at
```

For continuous autosave, debounce `onChange` yourself — it already fires
debounced at ~250 ms.

### Rendering on the server

The export engine has no React dependency, so you can render in Node:

```ts
import { exportHtml, BlockRegistry, builtinBlocks } from 'react-mail-editor'

const registry = new BlockRegistry(builtinBlocks)
const html = exportHtml(designFromDatabase, registry, { variableMode: 'fallback' })
```

---

## WordPress integration

The editor is a React island; WordPress only has to host a div, hand it a nonce
and expose two REST routes. Designs live in a **custom table**, not `wp_posts`.

**`includes/Email/DesignRepository.php`** (PSR-4, `Acme\Mailer\Email\DesignRepository`)

```php
<?php
namespace Acme\Mailer\Email;

defined( 'ABSPATH' ) || exit;

final class DesignRepository {

	public static function table(): string {
		global $wpdb;
		return $wpdb->prefix . 'acme_email_designs';
	}

	public static function install(): void {
		global $wpdb;
		$table   = self::table();
		$collate = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE {$table} (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			name VARCHAR(191) NOT NULL DEFAULT '',
			subject VARCHAR(255) NOT NULL DEFAULT '',
			design LONGTEXT NOT NULL,
			html LONGTEXT NULL,
			author_id BIGINT UNSIGNED NOT NULL DEFAULT 0,
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			KEY author_id (author_id),
			KEY updated_at (updated_at)
		) {$collate};";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		\dbDelta( $sql );
	}

	public static function find( int $id ): ?array {
		global $wpdb;
		$row = $wpdb->get_row(
			$wpdb->prepare( 'SELECT * FROM ' . self::table() . ' WHERE id = %d', $id ),
			ARRAY_A
		);
		return $row ?: null;
	}

	public static function save( int $id, array $data ): int {
		global $wpdb;

		$payload = [
			'name'      => (string) ( $data['name'] ?? '' ),
			'subject'   => (string) ( $data['subject'] ?? '' ),
			'design'    => wp_json_encode( $data['design'] ),
			'html'      => (string) ( $data['html'] ?? '' ),
			'author_id' => get_current_user_id(),
		];

		if ( $id > 0 ) {
			$wpdb->update( self::table(), $payload, [ 'id' => $id ] );
			return $id;
		}

		$wpdb->insert( self::table(), $payload );
		return (int) $wpdb->insert_id;
	}
}
```

**`includes/Rest/DesignController.php`**

```php
<?php
namespace Acme\Mailer\Rest;

use Acme\Mailer\Email\DesignRepository;
use WP_REST_Request;
use WP_REST_Response;

defined( 'ABSPATH' ) || exit;

final class DesignController {

	public const NAMESPACE = 'acme-mailer/v1';

	public function register(): void {
		add_action( 'rest_api_init', [ $this, 'routes' ] );
	}

	public function routes(): void {
		register_rest_route(
			self::NAMESPACE,
			'/designs/(?P<id>\d+)',
			[
				[
					'methods'             => 'GET',
					'callback'            => [ $this, 'get_design' ],
					'permission_callback' => [ $this, 'can_edit' ],
				],
				[
					'methods'             => 'POST',
					'callback'            => [ $this, 'save_design' ],
					'permission_callback' => [ $this, 'can_edit' ],
				],
			]
		);
	}

	public function can_edit(): bool {
		return current_user_can( 'manage_options' );
	}

	public function get_design( WP_REST_Request $request ): WP_REST_Response {
		$row = DesignRepository::find( (int) $request['id'] );

		if ( ! $row ) {
			return new WP_REST_Response( [ 'design' => null ], 404 );
		}

		return new WP_REST_Response(
			[ 'design' => json_decode( $row['design'], true ) ],
			200
		);
	}

	public function save_design( WP_REST_Request $request ): WP_REST_Response {
		$body = $request->get_json_params();

		// The design is opaque JSON — store it verbatim, but never trust the
		// HTML: re-render it server-side or sanitise before sending.
		$id = DesignRepository::save(
			(int) $request['id'],
			[
				'name'    => sanitize_text_field( $body['name'] ?? '' ),
				'subject' => sanitize_text_field( $body['meta']['subject'] ?? '' ),
				'design'  => $body['design'] ?? [],
				'html'    => $body['html'] ?? '',
			]
		);

		return new WP_REST_Response( [ 'id' => $id ], 200 );
	}
}
```

**Your JSX and your build**

Nothing special is required. The package ships pre-compiled JS, so your own
`.jsx` files are compiled by `@wordpress/scripts` as usual and the editor is
just another import. Keep React external — do **not** bundle your own copy — so
the plugin uses WordPress's React:

```js
// webpack.config.js — @wordpress/scripts defaults already do this.
// react, react-dom and react/jsx-runtime are externalised to the
// `react`, `react-dom` and `react-jsx-runtime` script handles, which the
// generated build/editor.asset.php lists as dependencies for you.
const defaults = require('@wordpress/scripts/config/webpack.config')
module.exports = defaults
```

Requires `@wordpress/scripts` 28+ (and WordPress 6.6+) for the automatic
`react-jsx-runtime` handle — see [JSX in WordPress
6.6](https://make.wordpress.org/core/2024/06/06/jsx-in-wordpress-6-6/). On older
toolchains the classic transform still works; `react/jsx-runtime` is a thin shim
that delegates to `react`, so letting webpack bundle it is harmless as long as
`react` itself stays external.

**Enqueue the bundle on your admin page**

```php
add_action( 'admin_enqueue_scripts', function ( $hook ) {
	if ( 'toplevel_page_acme-mailer' !== $hook ) {
		return;
	}

	$asset = require ACME_MAILER_PATH . 'build/editor.asset.php'; // from @wordpress/scripts

	wp_enqueue_script( 'acme-mailer-editor', ACME_MAILER_URL . 'build/editor.js', $asset['dependencies'], $asset['version'], true );
	wp_enqueue_style( 'acme-mailer-editor', ACME_MAILER_URL . 'build/style.css', [], $asset['version'] );

	wp_localize_script( 'acme-mailer-editor', 'AcmeMailer', [
		'restUrl'  => esc_url_raw( rest_url( 'acme-mailer/v1' ) ),
		'nonce'    => wp_create_nonce( 'wp_rest' ),
		'designId' => absint( $_GET['design'] ?? 0 ),
	] );
} );

add_action( 'admin_menu', function () {
	add_menu_page( 'Emails', 'Emails', 'manage_options', 'acme-mailer', function () {
		echo '<div class="wrap"><div id="acme-mailer-root" style="height:calc(100vh - 100px)"></div></div>';
	}, 'dashicons-email' );
} );
```

**`src/editor.tsx`**

```tsx
import { useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { EmailEditor, type Design } from 'react-mail-editor'
import 'react-mail-editor/style.css'

declare const AcmeMailer: { restUrl: string; nonce: string; designId: number }

const headers = { 'Content-Type': 'application/json', 'X-WP-Nonce': AcmeMailer.nonce }

function Editor() {
  const api = useRef(null)

  return (
    <EmailEditor
      ref={api}
      storage="none"
      config={{ labels: { brand: 'Acme Mailer' } }}
      onLoad={async () => {
        if (!AcmeMailer.designId) return undefined
        const res = await fetch(`${AcmeMailer.restUrl}/designs/${AcmeMailer.designId}`, { headers })
        return res.ok ? (await res.json()).design : undefined
      }}
      onSave={async (design: Design) => {
        await fetch(`${AcmeMailer.restUrl}/designs/${AcmeMailer.designId}`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ name: design.name, meta: design.meta, design }),
        })
      }}
      onImageUpload={async (file) => {
        const body = new FormData()
        body.append('file', file)
        const res = await fetch(`${AcmeMailer.restUrl.replace('acme-mailer/v1', 'wp/v2')}/media`, {
          method: 'POST',
          headers: { 'X-WP-Nonce': AcmeMailer.nonce },
          body,
        })
        return (await res.json()).source_url
      }}
    />
  )
}

createRoot(document.getElementById('acme-mailer-root')!).render(<Editor />)
```

> **Why the styles survive `wp-admin`:** every utility is namespaced `rme:` and
> emitted *unlayered with `!important`*, because cascade layers lose to
> unlayered host rules — and WordPress styles `button`, `input` and `select`
> globally. A scoped reset under `.rme-root` / `.rme-portal` sits at specificity
> `(0,0,2)` with `!important`, which outranks `wp-admin`'s element rules while
> still losing to the editor's own utilities. Tailwind's preflight is never
> loaded, so nothing in your admin screen is touched.

---

## Laravel / Django / Flask

Identical shape: render a div, boot React into it, and point `onLoad` / `onSave`
at two JSON endpoints.

```blade
{{-- resources/views/emails/edit.blade.php --}}
<div id="mail-editor"
     data-design-url="{{ route('emails.show', $email) }}"
     data-save-url="{{ route('emails.update', $email) }}"
     data-csrf="{{ csrf_token() }}"
     style="height: 100vh"></div>
@vite('resources/js/mail-editor.tsx')
```

```php
// app/Http/Controllers/EmailController.php
public function update(Request $request, Email $email)
{
    $validated = $request->validate([
        'design'       => ['required', 'array'],
        'design.body'  => ['required', 'array'],
        'name'         => ['nullable', 'string', 'max:191'],
    ]);

    $email->update([
        'name'   => $validated['name'] ?? $email->name,
        'design' => $validated['design'],   // cast to 'array' on the model
    ]);

    return response()->json(['ok' => true]);
}
```

For Django/Flask, serve the same JSON from a view and mount the bundle in a
template — nothing about the editor is framework-specific.

---

## Notes on the exported HTML

- Table-based layout with inline styles, MSO ghost tables for Outlook column
  support, and VML `roundrect` buttons so rounded CTAs survive Outlook desktop.
- Mobile behaviour is a real `@media (max-width: 600px)` block: columns stack,
  per-block overrides apply, and rows can be hidden per breakpoint.
- Merge variables export as `{{{name}}}` (configurable) or are replaced with
  their fallback values.
- Custom-HTML blocks and rich text are sanitised: `<script>`, `<iframe>`,
  `on*` handlers and `javascript:` URLs are stripped on export.
- Predefined social icons load from the Simple Icons CDN. For maximum Outlook
  compatibility, supply your own hosted PNG per item.

---

## Development

```bash
npm run dev          # playground at http://localhost:5173
npm run typecheck
npm run build        # dist/ (ESM + CJS + d.ts + style.css)
npm run build:demo
```

The playground deliberately ships hostile global CSS (`button { background:
hotpink !important }`, `* { box-sizing: content-box }`) so style isolation
regressions are visible immediately.

## License

MIT
