import { useState } from 'react'
import { Menu as MenuIcon } from 'lucide-react'
import { defineBlock, type BlockRenderProps } from '@/types/blocks'
import type { BoxValue, FontValue, TextAlign, Values } from '@/types/schema'
import type { InspectorSchema } from '@/types/inspector'
import { DEFAULT_FONT } from '@/config/fonts'
import { box } from '@/config/defaults'
import { cell, esc, resolveVariables, safeUrl, stripTags } from '@/lib/html'
import { padding } from '@/lib/style'
import { spacingGroup, weightOptions } from './common'
import { registerFont } from './text'

export interface MenuItem {
  text: string
  url: string
}

export type MenuLayout = 'horizontal' | 'vertical'

export interface MenuValues {
  items: MenuItem[]
  layout: MenuLayout
  fontFamily: FontValue
  fontSize: number
  fontWeight: number
  color: string
  hoverColor: string
  separator: string
  spacing: number
  align: TextAlign
  padding: BoxValue
  underline: boolean
  [key: string]: unknown
}

const inspector: InspectorSchema = [
  {
    title: 'Items',
    controls: [
      { type: 'list', key: 'items', itemKind: 'menu', wide: true },
      {
        type: 'select',
        key: 'layout',
        label: 'Layout',
        options: [
          { label: 'Horizontal', value: 'horizontal' },
          { label: 'Vertical', value: 'vertical' },
        ],
      },
      {
        type: 'text',
        key: 'separator',
        label: 'Separator',
        placeholder: '|',
        help: 'Drawn between horizontal items. Leave blank for none.',
        showIf: (v: Values) => v.layout === 'horizontal',
      },
    ],
  },
  {
    title: 'Style',
    controls: [
      { type: 'font', key: 'fontFamily', label: 'Font' },
      { type: 'number', key: 'fontSize', label: 'Size', unit: 'px', min: 8, max: 32, responsive: true },
      { type: 'select', key: 'fontWeight', label: 'Weight', options: weightOptions },
      { type: 'color', key: 'color', label: 'Color' },
      { type: 'color', key: 'hoverColor', label: 'Hover color', help: 'Applied in the editor preview — most email clients ignore :hover.' },
      { type: 'toggle', key: 'underline', label: 'Underline' },
      { type: 'number', key: 'spacing', label: 'Spacing', unit: 'px', min: 0, max: 48 },
      { type: 'align', key: 'align', label: 'Align', responsive: true },
    ],
  },
  spacingGroup(),
]

function MenuRender(p: BlockRenderProps<MenuValues>) {
  const v = p.values
  const [hovered, setHovered] = useState(-1)
  const items = v.items ?? []
  const horizontal = v.layout === 'horizontal'
  return (
    <div style={{ padding: padding(v.padding), textAlign: v.align }}>
      {items.map((item, i) => {
        const link = (
          <span
            key={`i-${i}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(-1)}
            style={{
              display: 'inline-block',
              fontFamily: v.fontFamily?.value,
              fontSize: v.fontSize,
              fontWeight: v.fontWeight,
              color: hovered === i ? v.hoverColor || v.color : v.color,
              textDecoration: v.underline ? 'underline' : 'none',
              margin: horizontal ? `0 ${v.spacing / 2}px` : undefined,
              padding: horizontal ? undefined : `${v.spacing / 2}px 0`,
            }}
          >
            {item.text || 'Link'}
          </span>
        )
        if (!horizontal) return <div key={`r-${i}`}>{link}</div>
        const sep =
          v.separator && i < items.length - 1 ? (
            <span
              key={`s-${i}`}
              style={{
                display: 'inline-block',
                color: v.color,
                opacity: 0.5,
                fontFamily: v.fontFamily?.value,
                fontSize: v.fontSize,
              }}
            >
              {v.separator}
            </span>
          ) : null
        return (
          <span key={`w-${i}`}>
            {link}
            {sep}
          </span>
        )
      })}
    </div>
  )
}

export const menuBlock = defineBlock<MenuValues>({
  type: 'menu',
  label: 'Menu',
  icon: MenuIcon,
  group: 'content',
  keywords: ['nav', 'navigation', 'links', 'footer'],
  description: 'A navigation row of text links.',
  defaultValues: () => ({
    items: [
      { text: 'Home', url: 'https://example.com' },
      { text: 'Products', url: 'https://example.com/products' },
      { text: 'Pricing', url: 'https://example.com/pricing' },
      { text: 'Contact', url: 'https://example.com/contact' },
    ],
    layout: 'horizontal',
    fontFamily: DEFAULT_FONT,
    fontSize: 14,
    fontWeight: 500,
    color: '#334155',
    hoverColor: '#4f46e5',
    separator: '',
    spacing: 16,
    align: 'center',
    padding: box(12, 24, 12, 24),
    underline: false,
  }),
  render: MenuRender,
  inspector,
  responsiveKeys: ['align', 'padding', 'fontSize', 'layout'],
  toHtml(v, ctx) {
    registerFont(v.fontFamily, ctx)
    const items = v.items ?? []
    if (!items.length) return ''
    const horizontal = v.layout === 'horizontal'

    const linkStyle =
      `font-family:${v.fontFamily.value};font-size:${v.fontSize}px;` +
      `font-weight:${v.fontWeight};color:${v.color};` +
      `text-decoration:${v.underline ? 'underline' : 'none'};line-height:1.4;` +
      (horizontal
        ? `display:inline-block;margin:0 ${v.spacing / 2}px;`
        : `display:inline-block;padding:${v.spacing / 2}px 0;`)

    const anchor = (item: MenuItem) => {
      const label = esc(
        stripTags(
          resolveVariables(item.text, ctx.variables, ctx.variableMode, ctx.variableSyntax),
        ),
      )
      return (
        `<a class="${ctx.className}-l" href="${esc(safeUrl(item.url)) || '#'}" target="_blank" ` +
        `style="${linkStyle}">${label}</a>`
      )
    }

    let inner: string
    if (horizontal) {
      const sep = v.separator
        ? `<span style="font-family:${v.fontFamily.value};font-size:${v.fontSize}px;color:${v.color};opacity:0.5;">${esc(v.separator)}</span>`
        : ''
      inner = items.map(anchor).join(sep)
    } else {
      inner = items.map((item) => `<div>${anchor(item)}</div>`).join('')
    }

    return cell(v.align, padding(v.padding), inner, ctx.className)
  },
  toText: (v) =>
    `${(v.items ?? []).map((i) => `${stripTags(i.text)}: ${i.url}`).join('\n')}\n`,
  mobileCss(v, m, sel) {
    const td: string[] = []
    const link: string[] = []
    if (m.padding) td.push(`padding:${padding(m.padding as BoxValue)} !important`)
    if (m.align) td.push(`text-align:${m.align} !important`)
    if (typeof m.fontSize === 'number') link.push(`font-size:${m.fontSize}px !important`)
    if (m.layout === 'vertical') link.push('display:block !important;margin:0 !important')
    return (
      (td.length ? `${sel}{${td.join(';')};}` : '') +
      (link.length ? `${sel}-l{${link.join(';')};}` : '')
    )
  },
})
