import { MousePointerClick } from 'lucide-react'
import { defineBlock, type BlockRenderProps } from '@/types/blocks'
import type { BorderValue, BoxValue, FontValue, TextAlign } from '@/types/schema'
import type { InspectorSchema } from '@/types/inspector'
import { DEFAULT_FONT } from '@/config/fonts'
import { box, noBorder } from '@/config/defaults'
import { cell, esc, resolveVariables, safeUrl, stripTags } from '@/lib/html'
import { borderCss, padding } from '@/lib/style'
import { spacingGroup, targetOptions, weightOptions } from './common'
import { registerFont } from './text'

export interface ButtonValues {
  text: string
  href: string
  target: '_blank' | '_self'
  backgroundColor: string
  color: string
  fontFamily: FontValue
  fontSize: number
  fontWeight: number
  border: BorderValue
  borderRadius: number
  innerPadding: BoxValue
  containerPadding: BoxValue
  align: TextAlign
  fullWidth: boolean
  letterSpacing: number
  [key: string]: unknown
}

const inspector: InspectorSchema = [
  {
    title: 'Content',
    controls: [
      { type: 'text', key: 'text', label: 'Label' },
      { type: 'link', key: 'href', label: 'Link' },
      { type: 'select', key: 'target', label: 'Opens in', options: targetOptions },
    ],
  },
  {
    title: 'Style',
    controls: [
      { type: 'color', key: 'backgroundColor', label: 'Background' },
      { type: 'color', key: 'color', label: 'Text color' },
      { type: 'font', key: 'fontFamily', label: 'Font' },
      { type: 'number', key: 'fontSize', label: 'Size', unit: 'px', min: 8, max: 32, responsive: true },
      { type: 'select', key: 'fontWeight', label: 'Weight', options: weightOptions },
      { type: 'number', key: 'letterSpacing', label: 'Letter spacing', unit: 'px', min: -2, max: 10 },
      { type: 'number', key: 'borderRadius', label: 'Radius', unit: 'px', min: 0, max: 60 },
      { type: 'border', key: 'border', label: 'Border' },
      { type: 'align', key: 'align', label: 'Align', responsive: true },
      { type: 'toggle', key: 'fullWidth', label: 'Full width', responsive: true },
    ],
  },
  {
    title: 'Spacing',
    controls: [
      { type: 'spacing', key: 'innerPadding', label: 'Button padding', responsive: true },
      { type: 'spacing', key: 'containerPadding', label: 'Outer padding', responsive: true },
    ],
  },
]

function ButtonRender(p: BlockRenderProps<ButtonValues>) {
  const v = p.values
  return (
    <div style={{ padding: padding(v.containerPadding), textAlign: v.align }}>
      <span
        style={{
          display: v.fullWidth ? 'block' : 'inline-block',
          background: v.backgroundColor,
          color: v.color,
          fontFamily: v.fontFamily?.value,
          fontSize: v.fontSize,
          fontWeight: v.fontWeight,
          letterSpacing: v.letterSpacing,
          borderRadius: v.borderRadius,
          border: borderCss(v.border) || undefined,
          padding: padding(v.innerPadding),
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      >
        {v.text || 'Button'}
      </span>
    </div>
  )
}

export const buttonBlock = defineBlock<ButtonValues>({
  type: 'button',
  label: 'Button',
  icon: MousePointerClick,
  group: 'content',
  keywords: ['cta', 'call to action', 'link'],
  defaultValues: () => ({
    text: 'Get started',
    href: 'https://example.com',
    target: '_blank',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    fontFamily: DEFAULT_FONT,
    fontSize: 15,
    fontWeight: 600,
    border: noBorder(),
    borderRadius: 8,
    innerPadding: box(14, 28, 14, 28),
    containerPadding: box(12, 24, 12, 24),
    align: 'left',
    fullWidth: false,
    letterSpacing: 0,
  }),
  render: ButtonRender,
  inspector,
  responsiveKeys: ['fontSize', 'align', 'fullWidth', 'innerPadding', 'containerPadding'],
  toHtml(v, ctx) {
    registerFont(v.fontFamily, ctx)
    const b = borderCss(v.border)
    const label = esc(
      stripTags(
        resolveVariables(v.text, ctx.variables, ctx.variableMode, ctx.variableSyntax),
      ),
    ).replace(/\{\{\{?/g, (m) => m) // keep merge tokens intact
    const href = esc(safeUrl(v.href)) || '#'

    // VML fallback keeps the button clickable and rounded in Outlook desktop.
    const vml =
      `<!--[if mso]>` +
      `<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" ` +
      `href="${href}" style="height:${v.fontSize + v.innerPadding.top + v.innerPadding.bottom}px;` +
      `v-text-anchor:middle;width:${v.fullWidth ? ctx.contentWidth - 48 : Math.max(120, label.length * (v.fontSize * 0.62) + v.innerPadding.left + v.innerPadding.right)}px;" ` +
      `arcsize="${Math.min(50, Math.round((v.borderRadius / Math.max(1, v.fontSize + v.innerPadding.top + v.innerPadding.bottom)) * 100))}%" ` +
      `${v.border.width ? `strokecolor="${v.border.color}" strokeweight="${v.border.width}px"` : 'stroke="f"'} fillcolor="${v.backgroundColor}">` +
      `<w:anchorlock/><center style="color:${v.color};font-family:${v.fontFamily.value};font-size:${v.fontSize}px;font-weight:${v.fontWeight};">${label}</center>` +
      `</v:roundrect><![endif]-->`

    const anchor =
      `<!--[if !mso]><!-- --><a class="${ctx.className}-b" href="${href}" target="${v.target}" ` +
      `style="display:${v.fullWidth ? 'block' : 'inline-block'};background:${v.backgroundColor};` +
      `color:${v.color};font-family:${v.fontFamily.value};font-size:${v.fontSize}px;` +
      `font-weight:${v.fontWeight};letter-spacing:${v.letterSpacing}px;text-decoration:none;` +
      `border-radius:${v.borderRadius}px;${b ? `border:${b};` : ''}padding:${padding(v.innerPadding)};` +
      `mso-padding-alt:0;text-align:center;line-height:1.2;">${label}</a><!--<![endif]-->`

    // Outranks the export's blanket dark-mode text rule on specificity, so a
    // button keeps the colours it was given instead of turning into link blue.
    ctx.addDarkCss(
      `.rme-container a.${ctx.className}-b{background:${v.backgroundColor} !important;color:${v.color} !important;}`,
    )

    return cell(v.align, padding(v.containerPadding), vml + anchor, ctx.className)
  },
  toText: (v) => `${stripTags(v.text)}: ${v.href}\n`,
  mobileCss(v, m, sel) {
    const td: string[] = []
    const btn: string[] = []
    if (m.containerPadding)
      td.push(`padding:${padding(m.containerPadding as BoxValue)} !important`)
    if (m.align) td.push(`text-align:${m.align} !important`)
    if (m.innerPadding) btn.push(`padding:${padding(m.innerPadding as BoxValue)} !important`)
    if (m.fontSize) btn.push(`font-size:${m.fontSize}px !important`)
    if (m.fullWidth !== undefined)
      btn.push(`display:${m.fullWidth ? 'block' : 'inline-block'} !important`)
    return (
      (td.length ? `${sel}{${td.join(';')};}` : '') +
      (btn.length ? `${sel}-b{${btn.join(';')};}` : '')
    )
  },
})
