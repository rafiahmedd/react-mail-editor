import type { ComponentType } from 'react'
import type {
  BodyValues,
  Content,
  ContentType,
  Device,
  DesignVariable,
  Values,
} from './schema'
import type { InspectorSchema } from './inspector'

/** Palette grouping in the left rail. */
export type BlockGroup = 'content' | 'media' | 'layout' | 'advanced'

/** Everything a canvas renderer needs. */
export interface BlockRenderProps<V extends Values = Values> {
  values: V
  block: Content<V>
  selected: boolean
  /** True while the user is inline-editing this block's text. */
  editing: boolean
  device: Device
  preview: boolean
  body: BodyValues
  variables: DesignVariable[]
  /** Patch this block's values. `historyKey` coalesces rapid edits. */
  update: (patch: Partial<V>, historyKey?: string) => void
  /** Enter or leave inline editing for this block. */
  setEditing: (on: boolean) => void
  /** Upload handler wired from the editor props. */
  uploadImage: (file: File) => Promise<string>
}

/** How merge tokens are emitted on export. */
export type VariableMode = 'token' | 'fallback'
export type VariableSyntax = 'double' | 'triple' | 'percent'

export interface ExportContext {
  contentWidth: number
  linkColor: string
  textColor: string
  fontFamily: string
  variables: DesignVariable[]
  variableMode: VariableMode
  variableSyntax: VariableSyntax
  /** Unique, stable class name for this node — use it for mobile CSS. */
  className: string
  /** Push a rule into the document's `@media (max-width:600px)` block. */
  addMobileCss: (css: string) => void
  /** Push a rule into the document's dark-mode block. */
  addDarkCss: (css: string) => void
  /** Register a web-font URL for the `<head>`. */
  addFont: (url: string) => void
}

export interface BlockDefinition<V extends Values = Values> {
  type: ContentType
  label: string
  icon: ComponentType<{ className?: string }>
  group?: BlockGroup
  /** Extra search terms for the block search box. */
  keywords?: string[]
  description?: string
  defaultValues: () => V
  render: ComponentType<BlockRenderProps<V>>
  inspector: InspectorSchema
  /** Design JSON → email-safe HTML for this block. */
  toHtml: (values: V, ctx: ExportContext) => string
  /** Optional plain-text alternative used by the text export. */
  toText?: (values: V) => string
  /**
   * Emit mobile-only CSS for this block. Called with the merged mobile values
   * and the node's class selector. The default implementation handles the
   * generic `padding` / `fontSize` / `align` / `hidden` keys.
   */
  mobileCss?: (values: V, mobile: Partial<V>, selector: string) => string
  /** Keys the Mobile tab lets the author override. */
  responsiveKeys?: (keyof V & string)[]
  /** Block renders its own inline text editor; suppress the generic overlay. */
  inlineEditable?: boolean
}

/** Convenience identity helper that preserves the generic value type. */
export function defineBlock<V extends Values>(def: BlockDefinition<V>): BlockDefinition<V> {
  return def
}

export type AnyBlockDefinition = BlockDefinition<never> | BlockDefinition<Values>
