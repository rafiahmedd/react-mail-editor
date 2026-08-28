import { Code2 } from 'lucide-react'
import { defineBlock, type BlockRenderProps } from '@/types/blocks'
import type { BoxValue } from '@/types/schema'
import type { InspectorSchema } from '@/types/inspector'
import { box } from '@/config/defaults'
import { sanitizeHtml, stripTags } from '@/lib/html'
import { padding } from '@/lib/style'
import { spacingGroup } from './common'

export interface HtmlValues {
  html: string
  padding: BoxValue
  [key: string]: unknown
}

const inspector: InspectorSchema = [
  {
    title: 'HTML',
    controls: [
      {
        type: 'textarea',
        key: 'html',
        label: 'Markup',
        mono: true,
        rows: 10,
        wide: true,
        help:
          'Inserted as-is into the exported email — write email-safe, table-based, ' +
          'inline-styled markup. Scripts, iframes and event handlers are stripped.',
      },
    ],
  },
  spacingGroup(),
]

function HtmlRender(p: BlockRenderProps<HtmlValues>) {
  const v = p.values
  if (!v.html) {
    return (
      <div style={{ padding: padding(v.padding) }}>
        <div
          style={{
            border: '1px dashed #cbd5e1',
            borderRadius: 8,
            padding: '24px 12px',
            color: '#94a3b8',
            fontSize: 13,
            textAlign: 'center',
          }}
        >
          Paste your custom HTML in the inspector
        </div>
      </div>
    )
  }
  return (
    <div
      style={{ padding: padding(v.padding) }}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(v.html) }}
    />
  )
}

export const htmlBlock = defineBlock<HtmlValues>({
  type: 'html',
  label: 'Custom HTML',
  icon: Code2,
  group: 'advanced',
  keywords: ['code', 'raw', 'markup', 'embed', 'snippet'],
  description: 'Drop in your own email-safe markup.',
  defaultValues: () => ({
    html: '<p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#334155;">Your custom HTML goes here.</p>',
    padding: box(12, 24, 12, 24),
  }),
  render: HtmlRender,
  inspector,
  responsiveKeys: ['padding'],
  toHtml(v, ctx) {
    const inner = sanitizeHtml(v.html)
    if (!inner.trim()) return ''
    return (
      `<table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" ` +
      `style="width:100%;border-collapse:collapse;">` +
      `<tr><td class="${ctx.className}" style="padding:${padding(v.padding)};">${inner}</td></tr>` +
      `</table>`
    )
  },
  toText: (v) => `${stripTags(v.html)}\n`,
  mobileCss(v, m, sel) {
    if (!m.padding) return ''
    return `${sel}{padding:${padding(m.padding as BoxValue)} !important;}`
  },
})
