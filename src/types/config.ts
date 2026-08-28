import type { Design, Device, Selection } from './schema'
import type { BlockDefinition } from './blocks'
import type { Values } from './schema'

/* ------------------------------------------------------------------ */
/* Theming                                                            */
/* ------------------------------------------------------------------ */

export interface ThemeColors {
  canvas?: string
  panel?: string
  rail?: string
  header?: string
  line?: string
  ink?: string
  subtle?: string
  faint?: string
  brand?: string
  brandSoft?: string
  onBrand?: string
  hover?: string
  active?: string
  danger?: string
  dangerSoft?: string
  ring?: string
}

export interface ThemeTokens {
  colors?: ThemeColors
  /** Overrides applied only in dark mode. */
  dark?: ThemeColors
  font?: {
    sans?: string
    baseSize?: string
  }
  radius?: string
}

export type ColorMode = 'light' | 'dark' | 'auto'

/* ------------------------------------------------------------------ */
/* Config                                                            */
/* ------------------------------------------------------------------ */

export interface ToolbarActions {
  undo?: boolean
  preview?: boolean
  theme?: boolean
  templates?: boolean
  new?: boolean
  import?: boolean
  save?: boolean
  saveTemplate?: boolean
  export?: boolean
  fullscreen?: boolean
  variables?: boolean
  layers?: boolean
  meta?: boolean
}

export interface ToolbarLabels {
  brand?: string
  undo?: string
  redo?: string
  preview?: string
  templates?: string
  new?: string
  import?: string
  save?: string
  saveTemplate?: string
  export?: string
  fullscreen?: string
  variables?: string
  layers?: string
}

export interface TemplateEntry {
  id: string
  name: string
  /** Optional thumbnail URL shown in the gallery. */
  thumbnail?: string
  category?: string
  design: Design
}

export interface EditorConfig {
  /** Default canvas width in px (also the exported container width). */
  contentWidth?: number
  devices?: Device[]
  actions?: ToolbarActions
  labels?: ToolbarLabels
  /** Show text labels on the primary buttons instead of icon-only. */
  labeledActions?: boolean
  templates?: TemplateEntry[]
  /** localStorage autosave debounce (ms). Ignored when `storage="none"`. */
  autosaveMs?: number
  /** localStorage key used when `storage="local"`. */
  storageKey?: string
  /** Merge-token delimiters used on export. */
  variableSyntax?: 'double' | 'triple' | 'percent'
  /** Font stacks offered by the font control. */
  fonts?: { label: string; value: string; url?: string }[]
  /** Open the layers panel by default. */
  layersOpen?: boolean
  /** Show the subject/preview meta bar above the canvas. */
  showMetaBar?: boolean
  /** Max undo steps retained. */
  historyLimit?: number
  /**
   * Warm the lazily-loaded chunks (the rich-text editor, the HTML formatter)
   * once the browser is idle, so the first double-click and the first Export
   * click are instant. Set `false` on metered or very slow connections — the
   * chunks then load on first use instead. Defaults to `true`.
   */
  prefetch?: boolean
}

/* ------------------------------------------------------------------ */
/* Imperative API                                                     */
/* ------------------------------------------------------------------ */

export interface ExportOptions {
  /** `token` keeps `{{{name}}}`; `fallback` substitutes fallback values. */
  variables?: 'token' | 'fallback'
  /** Pretty-print the output. Defaults to true. */
  beautify?: boolean
  /** Minify by stripping comments/whitespace. Overrides `beautify`. */
  minify?: boolean
}

export interface EditorApi {
  /** Deep-cloned snapshot of the current design. */
  getDesign: () => Design
  loadDesign: (design: Design) => void
  /** Clear to a fresh, empty design (no confirmation prompt). */
  newDesign: () => void
  exportHtml: (options?: ExportOptions) => string
  exportText: () => string
  save: () => void | Promise<void>
  export: () => void | Promise<void>
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  registerBlock: (def: BlockDefinition<Values>) => void
  select: (selection: Selection) => void
  selectBody: () => void
  setDevice: (device: Device) => void
  setPreview: (on: boolean) => void
  setColorMode: (mode: ColorMode) => void
}

export interface SaveTemplatePayload {
  name: string
  design: Design
  html: string
}
