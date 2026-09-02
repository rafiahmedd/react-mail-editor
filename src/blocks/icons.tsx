import { ListChecks } from 'lucide-react'
import { defineBlock, type BlockRenderProps } from '@/types/blocks'
import type { BoxValue, FontValue, TextAlign } from '@/types/schema'
import type { InspectorSchema } from '@/types/inspector'
import { DEFAULT_FONT } from '@/config/fonts'
import { box } from '@/config/defaults'
import { cell, esc, resolveVariables, safeUrl, stripTags } from '@/lib/html'
import { padding } from '@/lib/style'
import { spacingGroup, weightOptions } from './common'
import { registerFont } from './text'
import { iconDataUri } from '@/lib/placeholder'

export interface IconListItem {
  /** Image URL for the leading icon. */
  icon: string
  title: string
  text: string
}

export interface IconListValues {
  items: IconListItem[]
  iconSize: number
  gap: number
  titleSize: number
  titleColor: string
  titleWeight: number
  textSize: number
  textColor: string
  fontFamily: FontValue
  align: TextAlign
  padding: BoxValue
  [key: string]: unknown
}

/** Inline SVG — no CDN round-trip, and it still renders as a real image. */
const DEFAULT_ICON = iconDataUri('circle-check')

const inspector: InspectorSchema = [
  {
    title: 'Items',
    controls: [{ type: 'list', key: 'items', itemKind: 'icon', wide: true }],
  },
  {
    title: 'Style',
    controls: [
      { type: 'number', key: 'iconSize', label: 'Icon size', unit: 'px', min: 12, max: 96 },
      { type: 'number', key: 'gap', label: 'Gap', unit: 'px', min: 0, max: 48 },
      { type: 'font', key: 'fontFamily', label: 'Font' },
      { type: 'number', key: 'titleSize', label: 'Title size', unit: 'px', min: 8, max: 40, responsive: true },
      { type: 'select', key: 'titleWeight', label: 'Title weight', options: weightOptions },
      { type: 'color', key: 'titleColor', label: 'Title color' },
      { type: 'number', key: 'textSize', label: 'Text size', unit: 'px', min: 8, max: 32 },
      { type: 'color', key: 'textColor', label: 'Text color' },
      { type: 'align', key: 'align', label: 'Align', responsive: true },
    ],
  },
  spacingGroup(),
]

function IconListRender(p: BlockRenderProps<IconListValues>) {
  const v = p.values
  const items = v.items ?? []
  return (
    <div style={{ padding: padding(v.padding), textAlign: v.align }}>
      <table
        style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}
      >
        <tbody>
          {items.map((item, i) => (
            <tr key={`row-${i}`}>
              <td
                style={{
                  width: v.iconSize,
                  paddingRight: v.gap,
                  paddingBottom: i < items.length - 1 ? v.gap : 0,
                  verticalAlign: 'top',
                }}
              >
                {item.icon ? (
                  <img
                    src={item.icon}
                    alt=""
                    style={{
                      width: v.iconSize,
                      height: v.iconSize,
                      display: 'block',
                    }}
                  />
                ) : null}
              </td>
              <td
                style={{
                  verticalAlign: 'top',
                  paddingBottom: i < items.length - 1 ? v.gap : 0,
                  fontFamily: v.fontFamily?.value,
                }}
              >
                <div
                  style={{
                    fontSize: v.titleSize,
                    fontWeight: v.titleWeight,
                    color: v.titleColor,
                    lineHeight: 1.35,
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: v.textSize,
                    color: v.textColor,
                    lineHeight: 1.6,
                    marginTop: 4,
                  }}
                >
                  {item.text}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const iconListBlock = defineBlock<IconListValues>({
  type: 'icons',
  label: 'Icon list',
  icon: ListChecks,
  group: 'content',
  keywords: ['features', 'benefits', 'checklist', 'bullets', 'usp'],
  description: 'Icon + heading + description rows — the classic feature list.',
  defaultValues: () => ({
    items: [
      {
        icon: DEFAULT_ICON,
        title: 'Free shipping',
        text: 'On every order over $50, anywhere in the country.',
      },
      {
        icon: DEFAULT_ICON,
        title: '30-day returns',
        text: 'Changed your mind? Send it back, no questions asked.',
      },
      {
        icon: DEFAULT_ICON,
        title: 'Support that answers',
        text: 'Real people, replying in under two hours on weekdays.',
      },
    ],
    iconSize: 28,
    gap: 14,
    titleSize: 16,
    titleColor: '#0f172a',
    titleWeight: 600,
    textSize: 14,
    textColor: '#475569',
    fontFamily: DEFAULT_FONT,
    align: 'left',
    padding: box(12, 24, 12, 24),
  }),
  render: IconListRender,
  inspector,
  responsiveKeys: ['align', 'padding', 'titleSize'],
  toHtml(v, ctx) {
    registerFont(v.fontFamily, ctx)
    const items = v.items ?? []
    if (!items.length) return ''

    const rows = items
      .map((item, i) => {
        const gapBottom = i < items.length - 1 ? v.gap : 0
        const icon = item.icon
          ? `<img src="${esc(safeUrl(item.icon, true))}" alt="" width="${v.iconSize}" height="${v.iconSize}" ` +
            `style="display:block;border:0;outline:none;width:${v.iconSize}px;height:${v.iconSize}px;" />`
          : '&nbsp;'
        const title = esc(
          stripTags(
            resolveVariables(item.title, ctx.variables, ctx.variableMode, ctx.variableSyntax),
          ),
        )
        const text = resolveVariables(
          item.text,
          ctx.variables,
          ctx.variableMode,
          ctx.variableSyntax,
        )
        return (
          `<tr>` +
          `<td valign="top" width="${v.iconSize}" ` +
          `style="width:${v.iconSize}px;padding-right:${v.gap}px;padding-bottom:${gapBottom}px;">${icon}</td>` +
          `<td valign="top" style="padding-bottom:${gapBottom}px;font-family:${v.fontFamily.value};text-align:left;">` +
          `<div class="${ctx.className}-h" style="font-size:${v.titleSize}px;font-weight:${v.titleWeight};` +
          `color:${v.titleColor};line-height:1.35;mso-line-height-rule:exactly;">${title}</div>` +
          `<div style="font-size:${v.textSize}px;color:${v.textColor};line-height:1.6;padding-top:4px;` +
          `mso-line-height-rule:exactly;">${esc(stripTags(text))}</div>` +
          `</td></tr>`
        )
      })
      .join('')

    const table =
      `<table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" ` +
      `style="width:100%;border-collapse:collapse;">${rows}</table>`

    return cell(v.align, padding(v.padding), table, ctx.className)
  },
  toText: (v) =>
    `${(v.items ?? [])
      .map((i) => `- ${stripTags(i.title)}\n  ${stripTags(i.text)}`)
      .join('\n')}\n`,
  mobileCss(v, m, sel) {
    const td: string[] = []
    const head: string[] = []
    if (m.padding) td.push(`padding:${padding(m.padding as BoxValue)} !important`)
    if (m.align) td.push(`text-align:${m.align} !important`)
    if (typeof m.titleSize === 'number') head.push(`font-size:${m.titleSize}px !important`)
    return (
      (td.length ? `${sel}{${td.join(';')};}` : '') +
      (head.length ? `${sel}-h{${head.join(';')};}` : '')
    )
  },
})
