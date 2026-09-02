import { Share2 } from 'lucide-react'
import { defineBlock, type BlockRenderProps } from '@/types/blocks'
import type { BoxValue, TextAlign } from '@/types/schema'
import type { InspectorSchema } from '@/types/inspector'
import { box } from '@/config/defaults'
import { findNetwork, networkIconUrl, resolveSocial } from '@/config/social'
import { cell, esc, safeUrl } from '@/lib/html'
import { padding } from '@/lib/style'
import { spacingGroup } from './common'

export interface SocialItem {
  network: string
  url: string
  /** Custom icon URL — overrides the built-in glyph. */
  icon?: string
  /** Custom brand colour — overrides the network default. */
  color?: string
}

export type SocialIconStyle = 'rounded' | 'square' | 'circle-outline'

export interface SocialValues {
  icons: SocialItem[]
  iconStyle: SocialIconStyle
  size: number
  spacing: number
  align: TextAlign
  padding: BoxValue
  [key: string]: unknown
}

const inspector: InspectorSchema = [
  {
    title: 'Icons',
    controls: [{ type: 'list', key: 'icons', itemKind: 'social', wide: true }],
  },
  {
    title: 'Style',
    controls: [
      {
        type: 'select',
        key: 'iconStyle',
        label: 'Shape',
        options: [
          { label: 'Rounded', value: 'rounded' },
          { label: 'Square', value: 'square' },
          { label: 'Outline', value: 'circle-outline' },
        ],
      },
      { type: 'number', key: 'size', label: 'Size', unit: 'px', min: 16, max: 72 },
      { type: 'number', key: 'spacing', label: 'Spacing', unit: 'px', min: 0, max: 40 },
      { type: 'align', key: 'align', label: 'Align', responsive: true },
    ],
  },
  spacingGroup(),
]

/** Corner radius in px (or `50%`) for the current icon style. */
function radiusFor(style: SocialIconStyle, size: number): string {
  if (style === 'square') return '6px'
  return `${Math.round(size / 2)}px`
}

/**
 * Built-in glyphs are white on the brand colour. The outline style has no fill,
 * so the glyph is redrawn in the brand colour instead. An author-supplied icon
 * is a URL we do not control, so it is passed through untouched.
 */
function glyphUrl(network: string, image: string, color: string, outline: boolean, custom: boolean): string {
  if (custom) return image
  return networkIconUrl(network, outline ? color : '#ffffff')
}

function SocialRender(p: BlockRenderProps<SocialValues>) {
  const v = p.values
  const outline = v.iconStyle === 'circle-outline'
  const justify =
    v.align === 'center' ? 'center' : v.align === 'right' ? 'flex-end' : 'flex-start'
  return (
    <div style={{ padding: padding(v.padding), textAlign: v.align }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: justify }}>
        {(v.icons ?? []).map((item, i) => {
          const r = resolveSocial(item)
          return (
            <span
              key={`${item.network}-${i}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: v.size,
                height: v.size,
                margin: `0 ${v.spacing / 2}px`,
                background: outline ? 'transparent' : r.color,
                border: outline ? `2px solid ${r.color}` : undefined,
                borderRadius: radiusFor(v.iconStyle, v.size),
                boxSizing: 'border-box',
              }}
            >
              {r.image ? (
                <img
                  src={glyphUrl(item.network, r.image, r.color, outline, r.isCustom)}
                  alt={r.label}
                  style={{
                    width: Math.round(v.size * 0.55),
                    height: Math.round(v.size * 0.55),
                    display: 'block',
                  }}
                />
              ) : null}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export const socialBlock = defineBlock<SocialValues>({
  type: 'social',
  label: 'Social',
  icon: Share2,
  group: 'content',
  keywords: ['share', 'follow', 'facebook', 'instagram', 'linkedin', 'icons'],
  description: 'A row of social network icons linking to your profiles.',
  defaultValues: () => ({
    icons: ['facebook', 'x', 'instagram', 'linkedin'].map((id) => ({
      network: id,
      url: findNetwork(id)?.placeholder ?? '',
    })),
    iconStyle: 'rounded',
    size: 32,
    spacing: 8,
    align: 'center',
    padding: box(12, 24, 12, 24),
  }),
  render: SocialRender,
  inspector,
  responsiveKeys: ['align', 'padding', 'spacing'],
  toHtml(v, ctx) {
    const items = v.icons ?? []
    if (!items.length) return ''
    const outline = v.iconStyle === 'circle-outline'
    const radius = radiusFor(v.iconStyle, v.size)
    const glyph = Math.round(v.size * 0.55)

    const icons = items
      .map((item) => {
        const r = resolveSocial(item)
        const href = esc(safeUrl(item.url)) || '#'
        const img = r.image
          ? `<img src="${esc(safeUrl(glyphUrl(item.network, r.image, r.color, outline, r.isCustom), true))}" ` +
            `alt="${esc(r.label)}" width="${glyph}" height="${glyph}" ` +
            `style="display:block;border:0;outline:none;text-decoration:none;` +
            `width:${glyph}px;height:${glyph}px;" />`
          : '&nbsp;'
        const chip =
          `<table role="presentation" border="0" cellpadding="0" cellspacing="0" ` +
          `style="border-collapse:separate;">` +
          `<tr><td align="center" valign="middle" width="${v.size}" height="${v.size}" ` +
          `style="width:${v.size}px;height:${v.size}px;line-height:${v.size}px;` +
          `${outline ? `background-color:transparent;border:2px solid ${r.color};` : `background-color:${r.color};`}` +
          `border-radius:${radius};text-align:center;mso-padding-alt:0;">${img}</td></tr>` +
          `</table>`
        return (
          `<a class="${ctx.className}-i" href="${href}" target="_blank" ` +
          `style="display:inline-block;margin:0 ${v.spacing / 2}px;text-decoration:none;` +
          `border-radius:${radius};">${chip}</a>`
        )
      })
      .join('')

    return cell(v.align, padding(v.padding), icons, ctx.className)
  },
  toText: (v) =>
    `${(v.icons ?? [])
      .map((i) => `${resolveSocial(i).label}: ${i.url}`)
      .join('\n')}\n`,
  mobileCss(v, m, sel) {
    const td: string[] = []
    const link: string[] = []
    if (m.padding) td.push(`padding:${padding(m.padding as BoxValue)} !important`)
    if (m.align) td.push(`text-align:${m.align} !important`)
    if (typeof m.spacing === 'number') link.push(`margin:0 ${m.spacing / 2}px !important`)
    return (
      (td.length ? `${sel}{${td.join(';')};}` : '') +
      (link.length ? `${sel}-i{${link.join(';')};}` : '')
    )
  },
})
