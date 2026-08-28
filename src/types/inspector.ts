import type { ComponentType, ReactNode } from 'react'
import type { Values } from './schema'

export interface SelectOption {
  label: string
  value: string | number
  /** Optional swatch/icon shown next to the label. */
  hint?: string
}

interface BaseControl {
  /** Dotted paths are supported: `border.width`, `hideOn.mobile`. */
  key: string
  label?: string
  /** Helper text under the control. */
  help?: string
  /** Hide the control unless the predicate passes for the current values. */
  showIf?: (values: Values) => boolean
  /** Render the control full-width instead of the label/field split. */
  wide?: boolean
  /** Allow a per-device override for this key (adds a mobile toggle). */
  responsive?: boolean
}

export type ControlDef =
  | (BaseControl & { type: 'text'; placeholder?: string })
  | (BaseControl & { type: 'textarea'; rows?: number; mono?: boolean; placeholder?: string })
  | (BaseControl & {
      type: 'number'
      min?: number
      max?: number
      step?: number
      unit?: string
    })
  | (BaseControl & {
      type: 'slider'
      min?: number
      max?: number
      step?: number
      unit?: string
    })
  | (BaseControl & { type: 'color'; allowTransparent?: boolean })
  | (BaseControl & { type: 'select'; options: SelectOption[] })
  | (BaseControl & { type: 'segmented'; options: SelectOption[] })
  | (BaseControl & { type: 'align'; vertical?: boolean })
  | (BaseControl & { type: 'toggle' })
  | (BaseControl & { type: 'spacing' })
  | (BaseControl & { type: 'border' })
  | (BaseControl & { type: 'font' })
  | (BaseControl & { type: 'link' })
  | (BaseControl & { type: 'image' })
  | (BaseControl & { type: 'background' })
  | (BaseControl & { type: 'list'; itemKind: 'social' | 'menu' | 'row' | 'icon' })
  | (BaseControl & { type: 'richtext' })
  | (BaseControl & {
      type: 'custom'
      component: ComponentType<{
        value: unknown
        onChange: (v: unknown) => void
        values: Values
      }>
    })

export interface InspectorGroup {
  title: string
  icon?: ComponentType<{ className?: string }>
  /** Collapsed by default when `false`. */
  defaultOpen?: boolean
  controls: ControlDef[]
  /** Arbitrary node appended below the controls. */
  footer?: ReactNode
}

export type InspectorSchema = InspectorGroup[]
