/**
 * Email design schema.
 *
 * The whole email is one serializable JSON tree:
 *   Design → Body → Row[] → Column[] → Content[]
 *
 * Every node carries a loose `values` bag (per-node shape) plus an optional
 * `mobile` bag holding a *partial* override applied under the mobile media
 * query. Shared value primitives below are typed so inspector controls and the
 * export engine can rely on them.
 */

export const SCHEMA_VERSION = 2

/* ------------------------------------------------------------------ */
/* Shared value primitives                                            */
/* ------------------------------------------------------------------ */

export interface BoxValue {
  top: number
  right: number
  bottom: number
  left: number
}

export interface BorderValue {
  width: number
  style: 'solid' | 'dashed' | 'dotted' | 'double'
  color: string
}

export interface BgImage {
  url: string
  repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'
  size: 'auto' | 'cover' | 'contain'
  position: string
}

export interface FontValue {
  label: string
  /** CSS font stack, e.g. `Arial, Helvetica, sans-serif` */
  value: string
  /** Optional web-font URL emitted as `@import` in the export head. */
  url?: string
}

export type TextAlign = 'left' | 'center' | 'right'
export type VerticalAlign = 'top' | 'middle' | 'bottom'
export type Device = 'desktop' | 'tablet' | 'mobile'

/** A generic node values bag. Blocks narrow this with their own interface. */
export type Values = Record<string, unknown>

/* ------------------------------------------------------------------ */
/* Content blocks                                                     */
/* ------------------------------------------------------------------ */

export type BuiltinContentType =
  | 'heading'
  | 'text'
  | 'button'
  | 'image'
  | 'divider'
  | 'spacer'
  | 'social'
  | 'menu'
  | 'html'
  | 'video'
  | 'countdown'
  | 'table'
  | 'product'
  | 'icons'

/** Built-in types plus anything the host registers. */
export type ContentType = BuiltinContentType | (string & {})

export interface Content<V extends Values = Values> {
  id: string
  type: ContentType
  values: V
  /** Partial overrides applied inside the mobile media query. */
  mobile?: Partial<V>
  /** Author-facing name shown in the layers tree. */
  name?: string
  locked?: boolean
}

/* ------------------------------------------------------------------ */
/* Structure: Column → Row → Body                                     */
/* ------------------------------------------------------------------ */

export interface ColumnValues extends Values {
  backgroundColor: string
  backgroundImage: BgImage
  padding: BoxValue
  border: BorderValue
  borderRadius: number
  verticalAlign: VerticalAlign
}

export interface Column {
  id: string
  contents: Content[]
  values: ColumnValues
  mobile?: Partial<ColumnValues>
  name?: string
}

export interface RowValues extends Values {
  backgroundColor: string
  columnsBackground: string
  backgroundImage: BgImage
  fullWidth: boolean
  padding: BoxValue
  border: BorderValue
  borderRadius: number
  verticalAlign: VerticalAlign
  /** Gap between columns, in px. */
  gap: number
  hideOnDesktop: boolean
  hideOnMobile: boolean
  stackOnMobile: boolean
  /** Reverse the stacking order on mobile (right column first). */
  reverseOnMobile: boolean
}

export interface Row {
  id: string
  /** 12-grid distribution, e.g. [12] | [6,6] | [4,4,4] */
  cells: number[]
  columns: Column[]
  values: RowValues
  mobile?: Partial<RowValues>
  name?: string
  locked?: boolean
}

export interface BodyValues extends Values {
  contentWidth: number
  backgroundColor: string
  contentBackground: string
  backgroundImage: BgImage
  fontFamily: FontValue
  textColor: string
  linkColor: string
  direction: 'ltr' | 'rtl'
  language: string
  padding: BoxValue
  borderRadius: number
  /** Dark-mode friendly export (`color-scheme` + `prefers-color-scheme` block). */
  darkModeSupport: boolean
}

export interface Body {
  id: string
  values: BodyValues
  rows: Row[]
}

/** A template-level merge variable, reusable across the whole design. */
export interface DesignVariable {
  name: string
  label?: string
  type: 'string' | 'number' | 'url' | 'date'
  fallback: string
}

/**
 * Email sending metadata. Not part of the rendered HTML (except `preview`,
 * which becomes the hidden preheader) — your app reads it when sending.
 */
export interface DesignMeta {
  subject?: string
  from?: string
  replyTo?: string
  /** Inbox preview text (the email's hidden preheader). */
  preview?: string
  /** Custom fields round-trip untouched. */
  [key: string]: string | undefined
}

export interface Design {
  schemaVersion: number
  name?: string
  variables?: DesignVariable[]
  meta?: DesignMeta
  body: Body
}

/* ------------------------------------------------------------------ */
/* Selection                                                          */
/* ------------------------------------------------------------------ */

export type SelectionKind = 'body' | 'row' | 'column' | 'content' | null

export interface Selection {
  kind: SelectionKind
  id: string | null
}

/** Result of resolving a content id inside the tree. */
export interface ContentLocation {
  row: Row
  rowIndex: number
  column: Column
  columnIndex: number
  content: Content
  index: number
}

export interface ColumnLocation {
  row: Row
  rowIndex: number
  column: Column
  index: number
}
