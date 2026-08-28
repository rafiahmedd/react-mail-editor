import { Move, Palette, Type, SquareDashed, Smartphone } from 'lucide-react'
import type { InspectorGroup, SelectOption } from '@/types/inspector'
import type { BoxValue, Values } from '@/types/schema'
import { FONT_WEIGHTS } from '@/config/fonts'
import { padding } from '@/lib/style'

export const weightOptions: SelectOption[] = FONT_WEIGHTS.map((w) => ({
  label: w.label,
  value: w.value,
}))

export const alignOptions: SelectOption[] = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
]

export const vAlignOptions: SelectOption[] = [
  { label: 'Top', value: 'top' },
  { label: 'Middle', value: 'middle' },
  { label: 'Bottom', value: 'bottom' },
]

export const lineStyleOptions: SelectOption[] = [
  { label: 'Solid', value: 'solid' },
  { label: 'Dashed', value: 'dashed' },
  { label: 'Dotted', value: 'dotted' },
  { label: 'Double', value: 'double' },
]

export const targetOptions: SelectOption[] = [
  { label: 'New tab', value: '_blank' },
  { label: 'Same tab', value: '_self' },
]

/** The `Spacing` accordion every block shares. */
export function spacingGroup(key = 'padding', label = 'Padding'): InspectorGroup {
  return {
    title: 'Spacing',
    icon: Move,
    controls: [{ type: 'spacing', key, label, responsive: true }],
  }
}

export function borderGroup(key = 'border', radiusKey = 'borderRadius'): InspectorGroup {
  return {
    title: 'Border',
    icon: SquareDashed,
    defaultOpen: false,
    controls: [
      { type: 'border', key, label: 'Border' },
      { type: 'number', key: radiusKey, label: 'Radius', unit: 'px', min: 0, max: 100 },
    ],
  }
}

export const groupIcons = { Move, Palette, Type, SquareDashed, Smartphone }

/**
 * Default mobile CSS for the generic keys most blocks share. Blocks only need
 * a custom `mobileCss` when they expose something unusual.
 */
export function genericMobileCss(
  values: Values,
  mobile: Values,
  selector: string,
): string {
  const rules: string[] = []
  if (mobile.padding) rules.push(`padding:${padding(mobile.padding as BoxValue)} !important`)
  if (mobile.align) rules.push(`text-align:${String(mobile.align)} !important`)
  if (typeof mobile.fontSize === 'number')
    rules.push(`font-size:${mobile.fontSize}px !important`)
  if (typeof mobile.lineHeight === 'number')
    rules.push(`line-height:${mobile.lineHeight} !important`)
  if (mobile.hidden === true) rules.push('display:none !important')
  if (!rules.length) return ''
  return `${selector}{${rules.join(';')};}`
}

/** Blocks that expose an `align` key can share this alignment CSS target. */
export function alignSelector(className: string): string {
  return `.${className}`
}
