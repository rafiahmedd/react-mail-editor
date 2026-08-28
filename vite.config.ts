import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'

/**
 * `use-sync-external-store` is external for one reason: it is CJS, and it
 * `require('react')`.
 *
 * @tiptap/react imports `use-sync-external-store/shim/index.js` and
 * `.../shim/with-selector.js`. Bundling them means rolldown converts CJS to
 * ESM, and a `require()` of an EXTERNAL module (react, right above) cannot be
 * converted — it becomes a call to rolldown's `__require` polyfill, which
 * throws "Calling `require` for \"react\" in an environment that doesn't expose
 * the `require` function" the moment the module is evaluated.
 *
 * That module lands in the lazy `rich-text` chunk, so it detonated on the first
 * double-click into a text block — and only for consumers of `dist`. The
 * playground runs from `src` through the dev server, where deps are
 * pre-bundled and the CJS never reaches this path, which is why this was
 * invisible here and fatal in a host app.
 *
 * Left to the consumer's bundler, which converts the CJS correctly. It is a
 * declared dependency so it is always installed alongside this package.
 */
const external = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'react-dom/client',
  /^use-sync-external-store(\/|$)/,
]

/**
 * Give the two heavyweight lazy chunks stable, readable names. Everything else
 * is left to Rollup, which hoists genuinely shared modules on its own.
 */
function manualChunks(id: string): string | undefined {
  if (id.includes('js-beautify')) return 'html-format'
  if (/[\\/](@tiptap|prosemirror-[a-z]+|linkifyjs|orderedmap|rope-sequence|w3c-keyname)[\\/]/.test(id)) {
    return 'rich-text'
  }
  return undefined
}

/**
 * Two explicit outputs rather than `lib.formats`, because each format needs its
 * own chunk extension — otherwise the ESM and CJS chunks collide on disk. The
 * lazy chunks (`rich-text`, the modals) are what keep Tiptap and js-beautify
 * out of the entry bundle, so code splitting must stay enabled here.
 */
export default defineConfig({
  plugins: [react(), tailwindcss(), dts({ include: ['src'], insertTypesEntry: true })],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  build: {
    lib: { entry: resolve(__dirname, 'src/index.ts'), name: 'ReactMailEditor' },
    rollupOptions: {
      external,
      output: [
        {
          format: 'es',
          entryFileNames: 'react-mail-editor.js',
          chunkFileNames: 'chunks/[name]-[hash].js',
          manualChunks,
          assetFileNames: (info) =>
            info.names?.[0]?.endsWith('.css') ? 'style.css' : '[name][extname]',
        },
        {
          format: 'cjs',
          entryFileNames: 'react-mail-editor.cjs',
          chunkFileNames: 'chunks/[name]-[hash].cjs',
          manualChunks,
          exports: 'named',
          assetFileNames: (info) =>
            info.names?.[0]?.endsWith('.css') ? 'style.css' : '[name][extname]',
        },
      ],
    },
    sourcemap: true,
    cssCodeSplit: false,
    emptyOutDir: true,
  },
})
