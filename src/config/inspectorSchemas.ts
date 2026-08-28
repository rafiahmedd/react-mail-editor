import {
  Settings,
  Palette,
  Move,
  SquareDashed,
  Smartphone,
  Type,
  Link2,
  Columns3,
} from 'lucide-react'
import type { InspectorSchema } from '@/types/inspector'
import { vAlignOptions, lineStyleOptions } from '@/blocks/common'

export const bodyInspector: InspectorSchema = [
  {
    title: 'General',
    icon: Settings,
    controls: [
      {
        type: 'number',
        key: 'contentWidth',
        label: 'Width',
        unit: 'px',
        min: 320,
        max: 900,
        help: '600px is the safest width across email clients.',
      },
      { type: 'font', key: 'fontFamily', label: 'Font' },
      { type: 'color', key: 'textColor', label: 'Text' },
      {
        type: 'segmented',
        key: 'direction',
        label: 'Direction',
        options: [
          { label: 'LTR', value: 'ltr' },
          { label: 'RTL', value: 'rtl' },
        ],
      },
      { type: 'text', key: 'language', label: 'Language', placeholder: 'en' },
    ],
  },
  {
    title: 'Background',
    icon: Palette,
    controls: [
      { type: 'color', key: 'backgroundColor', label: 'Page' },
      { type: 'color', key: 'contentBackground', label: 'Email' },
      { type: 'background', key: 'backgroundImage', label: 'Background image' },
    ],
  },
  {
    title: 'Links',
    icon: Link2,
    defaultOpen: false,
    controls: [{ type: 'color', key: 'linkColor', label: 'Link color' }],
  },
  {
    title: 'Spacing & shape',
    icon: Move,
    defaultOpen: false,
    controls: [
      { type: 'spacing', key: 'padding', label: 'Page padding' },
      { type: 'number', key: 'borderRadius', label: 'Radius', unit: 'px', min: 0, max: 40 },
    ],
  },
  {
    title: 'Dark mode',
    icon: Smartphone,
    defaultOpen: false,
    controls: [
      {
        type: 'toggle',
        key: 'darkModeSupport',
        label: 'Dark mode CSS',
        help: 'Adds color-scheme meta and a prefers-color-scheme block to the export.',
      },
    ],
  },
]

export const rowInspector: InspectorSchema = [
  {
    title: 'Background',
    icon: Palette,
    controls: [
      { type: 'color', key: 'backgroundColor', label: 'Row', allowTransparent: true },
      { type: 'color', key: 'columnsBackground', label: 'Columns', allowTransparent: true },
      { type: 'background', key: 'backgroundImage', label: 'Background image' },
    ],
  },
  {
    title: 'Layout',
    icon: Columns3,
    controls: [
      { type: 'spacing', key: 'padding', label: 'Padding', responsive: true },
      { type: 'number', key: 'gap', label: 'Column gap', unit: 'px', min: 0, max: 48 },
      { type: 'select', key: 'verticalAlign', label: 'Align', options: vAlignOptions },
    ],
  },
  {
    title: 'Border',
    icon: SquareDashed,
    defaultOpen: false,
    controls: [
      { type: 'border', key: 'border', label: 'Border' },
      { type: 'number', key: 'borderRadius', label: 'Radius', unit: 'px', min: 0, max: 60 },
    ],
  },
  {
    title: 'Responsive',
    icon: Smartphone,
    defaultOpen: false,
    controls: [
      { type: 'toggle', key: 'stackOnMobile', label: 'Stack on mobile' },
      {
        type: 'toggle',
        key: 'reverseOnMobile',
        label: 'Reverse order',
        showIf: (v) => Boolean(v.stackOnMobile),
        help: 'Two-column rows only — puts the right column first on mobile.',
      },
      { type: 'toggle', key: 'hideOnMobile', label: 'Hide on mobile' },
      { type: 'toggle', key: 'hideOnDesktop', label: 'Hide on desktop' },
    ],
  },
]

export const columnInspector: InspectorSchema = [
  {
    title: 'Background',
    icon: Palette,
    controls: [
      { type: 'color', key: 'backgroundColor', label: 'Color', allowTransparent: true },
      { type: 'background', key: 'backgroundImage', label: 'Background image' },
    ],
  },
  {
    title: 'Layout',
    icon: Move,
    controls: [
      { type: 'spacing', key: 'padding', label: 'Padding', responsive: true },
      { type: 'select', key: 'verticalAlign', label: 'Align', options: vAlignOptions },
    ],
  },
  {
    title: 'Border',
    icon: SquareDashed,
    defaultOpen: false,
    controls: [
      { type: 'border', key: 'border', label: 'Border' },
      { type: 'number', key: 'borderRadius', label: 'Radius', unit: 'px', min: 0, max: 60 },
    ],
  },
]

export { lineStyleOptions, Type }
