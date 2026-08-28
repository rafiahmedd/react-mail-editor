import { ShoppingBag } from 'lucide-react'
import { defineBlock, type BlockRenderProps } from '@/types/blocks'
import type { BorderValue, BoxValue, FontValue, TextAlign } from '@/types/schema'
import type { InspectorSchema } from '@/types/inspector'
import { DEFAULT_FONT } from '@/config/fonts'
import { box, noBorder } from '@/config/defaults'
import { cell, esc, resolveVariables, safeUrl, stripTags } from '@/lib/html'
import { borderCss, padding } from '@/lib/style'
import { spacingGroup } from './common'
import { registerFont } from './text'

export type ProductLayout = 'stacked' | 'side'

export interface ProductValues {
  image: string
  title: string
  description: string
  price: string
  oldPrice: string
  buttonText: string
  buttonUrl: string
  buttonColor: string
  buttonTextColor: string
  buttonRadius: number
  layout: ProductLayout
  titleSize: number
  titleColor: string
  priceSize: number
  priceColor: string
  textSize: number
  textColor: string
  fontFamily: FontValue
  cardBg: string
  cardRadius: number
  border: BorderValue
  align: TextAlign
  padding: BoxValue
  [key: string]: unknown
}

const MUTED = '#94a3b8'

const inspector: InspectorSchema = [
  {
    title: 'Product',
    controls: [
      { type: 'image', key: 'image', label: 'Image', wide: true },
      { type: 'text', key: 'title', label: 'Title' },
      { type: 'textarea', key: 'description', label: 'Description', rows: 3, wide: true },
      { type: 'text', key: 'price', label: 'Price' },
      { type: 'text', key: 'oldPrice', label: 'Compare at', help: 'Shown struck through next to the price.' },
    ],
  },
  {
    title: 'Button',
    controls: [
      { type: 'text', key: 'buttonText', label: 'Label' },
      { type: 'link', key: 'buttonUrl', label: 'Link' },
      { type: 'color', key: 'buttonColor', label: 'Background' },
      { type: 'color', key: 'buttonTextColor', label: 'Text color' },
      { type: 'number', key: 'buttonRadius', label: 'Radius', unit: 'px', min: 0, max: 60 },
    ],
  },
  {
    title: 'Style',
    controls: [
      {
        type: 'select',
        key: 'layout',
        label: 'Layout',
        options: [
          { label: 'Stacked', value: 'stacked' },
          { label: 'Side by side', value: 'side' },
        ],
      },
      { type: 'font', key: 'fontFamily', label: 'Font' },
      { type: 'number', key: 'titleSize', label: 'Title size', unit: 'px', min: 10, max: 40, responsive: true },
      { type: 'color', key: 'titleColor', label: 'Title color' },
      { type: 'number', key: 'priceSize', label: 'Price size', unit: 'px', min: 10, max: 40 },
      { type: 'color', key: 'priceColor', label: 'Price color' },
      { type: 'number', key: 'textSize', label: 'Text size', unit: 'px', min: 8, max: 24 },
      { type: 'color', key: 'textColor', label: 'Text color' },
      { type: 'color', key: 'cardBg', label: 'Card background', allowTransparent: true },
      { type: 'number', key: 'cardRadius', label: 'Card radius', unit: 'px', min: 0, max: 40 },
      { type: 'border', key: 'border', label: 'Border' },
      { type: 'align', key: 'align', label: 'Align', responsive: true },
    ],
  },
  spacingGroup(),
]

function ProductRender(p: BlockRenderProps<ProductValues>) {
  const v = p.values
  const side = v.layout === 'side'

  const image = v.image ? (
    <img
      src={v.image}
      alt={v.title}
      style={{
        display: 'block',
        width: '100%',
        maxWidth: '100%',
        height: 'auto',
        borderRadius: side ? v.cardRadius : `${v.cardRadius}px ${v.cardRadius}px 0 0`,
      }}
    />
  ) : null

  const details = (
    <div style={{ padding: 16, fontFamily: v.fontFamily?.value, textAlign: v.align }}>
      <div
        style={{
          fontSize: v.titleSize,
          fontWeight: 700,
          color: v.titleColor,
          lineHeight: 1.3,
        }}
      >
        {v.title}
      </div>
      {v.description ? (
        <div
          style={{
            fontSize: v.textSize,
            color: v.textColor,
            lineHeight: 1.6,
            marginTop: 6,
          }}
        >
          {v.description}
        </div>
      ) : null}
      <div style={{ marginTop: 10 }}>
        <span style={{ fontSize: v.priceSize, fontWeight: 700, color: v.priceColor }}>
          {v.price}
        </span>
        {v.oldPrice ? (
          <span
            style={{
              fontSize: Math.round(v.priceSize * 0.8),
              color: MUTED,
              textDecoration: 'line-through',
              marginLeft: 8,
            }}
          >
            {v.oldPrice}
          </span>
        ) : null}
      </div>
      {v.buttonText ? (
        <div style={{ marginTop: 14 }}>
          <span
            style={{
              display: 'inline-block',
              background: v.buttonColor,
              color: v.buttonTextColor,
              fontSize: 14,
              fontWeight: 600,
              padding: '12px 22px',
              borderRadius: v.buttonRadius,
              lineHeight: 1.2,
            }}
          >
            {v.buttonText}
          </span>
        </div>
      ) : null}
    </div>
  )

  return (
    <div style={{ padding: padding(v.padding) }}>
      <div
        style={{
          background: v.cardBg === 'transparent' ? undefined : v.cardBg,
          borderRadius: v.cardRadius,
          border: borderCss(v.border) || undefined,
          overflow: 'hidden',
          display: side ? 'flex' : 'block',
          alignItems: side ? 'flex-start' : undefined,
        }}
      >
        <div style={{ width: side ? '40%' : '100%', flexShrink: 0 }}>{image}</div>
        <div style={{ width: side ? '60%' : '100%' }}>{details}</div>
      </div>
    </div>
  )
}

export const productBlock = defineBlock<ProductValues>({
  type: 'product',
  label: 'Product card',
  icon: ShoppingBag,
  group: 'advanced',
  keywords: ['shop', 'ecommerce', 'item', 'price', 'buy', 'card'],
  description: 'Image, copy, price and a call to action in one card.',
  defaultValues: () => ({
    image: 'https://placehold.co/600x600/e2e8f0/64748b/png?text=Product',
    title: 'Merino crew sweater',
    description: 'Lightweight, breathable and machine washable — in four new colours.',
    price: '$89.00',
    oldPrice: '$119.00',
    buttonText: 'Shop now',
    buttonUrl: 'https://example.com/product',
    buttonColor: '#4f46e5',
    buttonTextColor: '#ffffff',
    buttonRadius: 8,
    layout: 'stacked',
    titleSize: 18,
    titleColor: '#0f172a',
    priceSize: 18,
    priceColor: '#0f172a',
    textSize: 14,
    textColor: '#475569',
    fontFamily: DEFAULT_FONT,
    cardBg: '#ffffff',
    cardRadius: 12,
    border: { ...noBorder(), width: 1 },
    align: 'left',
    padding: box(12, 24, 12, 24),
  }),
  render: ProductRender,
  inspector,
  responsiveKeys: ['align', 'padding', 'titleSize'],
  toHtml(v, ctx) {
    registerFont(v.fontFamily, ctx)
    const side = v.layout === 'side'
    const b = borderCss(v.border)
    const cardBg = v.cardBg && v.cardBg !== 'transparent' ? `background-color:${v.cardBg};` : ''
    const inner = ctx.contentWidth - v.padding.left - v.padding.right
    const imgWidth = side ? Math.round(inner * 0.4) : inner

    const title = esc(
      stripTags(resolveVariables(v.title, ctx.variables, ctx.variableMode, ctx.variableSyntax)),
    )
    const description = esc(
      stripTags(
        resolveVariables(v.description, ctx.variables, ctx.variableMode, ctx.variableSyntax),
      ),
    )
    const price = esc(
      stripTags(resolveVariables(v.price, ctx.variables, ctx.variableMode, ctx.variableSyntax)),
    )
    const oldPrice = esc(
      stripTags(resolveVariables(v.oldPrice, ctx.variables, ctx.variableMode, ctx.variableSyntax)),
    )
    const label = esc(
      stripTags(
        resolveVariables(v.buttonText, ctx.variables, ctx.variableMode, ctx.variableSyntax),
      ),
    )

    const image = v.image
      ? `<img src="${esc(safeUrl(v.image, true))}" alt="${esc(stripTags(v.title))}" width="${imgWidth}" ` +
        `style="display:block;border:0;outline:none;width:100%;max-width:100%;height:auto;` +
        `border-radius:${side ? `${v.cardRadius}px` : `${v.cardRadius}px ${v.cardRadius}px 0 0`};` +
        `-ms-interpolation-mode:bicubic;" />`
      : ''

    const button = v.buttonText
      ? `<div style="padding-top:14px;">` +
        `<a href="${esc(safeUrl(v.buttonUrl)) || '#'}" target="_blank" ` +
        `style="display:inline-block;background:${v.buttonColor};color:${v.buttonTextColor};` +
        `font-family:${v.fontFamily.value};font-size:14px;font-weight:600;text-decoration:none;` +
        `padding:12px 22px;border-radius:${v.buttonRadius}px;mso-padding-alt:0;line-height:1.2;` +
        `text-align:center;">${label}</a></div>`
      : ''

    const priceRow =
      `<div style="padding-top:10px;">` +
      `<span style="font-family:${v.fontFamily.value};font-size:${v.priceSize}px;font-weight:bold;` +
      `color:${v.priceColor};">${price}</span>` +
      (oldPrice
        ? `<span style="font-family:${v.fontFamily.value};font-size:${Math.round(v.priceSize * 0.8)}px;` +
          `color:${MUTED};text-decoration:line-through;padding-left:8px;">${oldPrice}</span>`
        : '') +
      `</div>`

    const details =
      `<div style="font-family:${v.fontFamily.value};text-align:${v.align};">` +
      `<div class="${ctx.className}-h" style="font-size:${v.titleSize}px;font-weight:bold;color:${v.titleColor};` +
      `line-height:1.3;mso-line-height-rule:exactly;">${title}</div>` +
      (description
        ? `<div style="font-size:${v.textSize}px;color:${v.textColor};line-height:1.6;padding-top:6px;` +
          `mso-line-height-rule:exactly;">${description}</div>`
        : '') +
      priceRow +
      button +
      `</div>`

    const cardStyle = `${cardBg}border-radius:${v.cardRadius}px;${b ? `border:${b};` : ''}`

    let card: string
    if (side) {
      // Two cells that stack under the mobile media query (see mobileCss).
      card =
        `<table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" ` +
        `style="width:100%;border-collapse:collapse;${cardStyle}">` +
        `<tr>` +
        `<td class="${ctx.className}-c" width="40%" valign="top" style="width:40%;padding:0;">${image}</td>` +
        `<td class="${ctx.className}-c" width="60%" valign="top" style="width:60%;padding:16px;">${details}</td>` +
        `</tr></table>`
    } else {
      card =
        `<table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" ` +
        `style="width:100%;border-collapse:collapse;${cardStyle}">` +
        (image ? `<tr><td style="padding:0;">${image}</td></tr>` : '') +
        `<tr><td style="padding:16px;">${details}</td></tr>` +
        `</table>`
    }

    return cell('center', padding(v.padding), card, ctx.className)
  },
  toText: (v) =>
    [
      stripTags(v.title),
      stripTags(v.description),
      v.oldPrice ? `${stripTags(v.price)} (was ${stripTags(v.oldPrice)})` : stripTags(v.price),
      v.buttonText ? `${stripTags(v.buttonText)}: ${v.buttonUrl}` : '',
    ]
      .filter(Boolean)
      .join('\n') + '\n',
  mobileCss(v, m, sel) {
    const td: string[] = []
    const head: string[] = []
    if (m.padding) td.push(`padding:${padding(m.padding as BoxValue)} !important`)
    if (m.align) td.push(`text-align:${m.align} !important`)
    if (typeof m.titleSize === 'number') head.push(`font-size:${m.titleSize}px !important`)
    // The side-by-side layout collapses to a single column on narrow screens.
    const stack =
      v.layout === 'side'
        ? `${sel}-c{display:block !important;width:100% !important;max-width:100% !important;}`
        : ''
    return (
      (td.length ? `${sel}{${td.join(';')};}` : '') +
      (head.length ? `${sel}-h{${head.join(';')};}` : '') +
      stack
    )
  },
})
