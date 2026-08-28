import type { CSSProperties } from 'react'
import type { DesignVariable } from '@/types/schema'

/**
 * Shared prop shape for the rich-text surface.
 *
 * This file deliberately imports nothing from Tiptap so that the light wrapper
 * in `RichText.tsx` — and therefore every block that renders text — can be
 * typed without pulling the editor into the main bundle.
 */
export interface RichTextProps {
  value: string
  onChange: (html: string) => void
  /** Enter editing on double-click. When false the HTML is rendered statically. */
  editable: boolean
  active: boolean
  onActivate?: () => void
  onDeactivate?: () => void
  placeholder?: string
  /** Headings are single-line: Enter commits instead of creating a paragraph. */
  singleLine?: boolean
  style?: CSSProperties
  className?: string
  variables?: DesignVariable[]
  linkColor?: string
}
