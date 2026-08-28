import { Table2 } from 'lucide-react'
import { defineBlock, type BlockRenderProps } from '@/types/blocks'
import type { BoxValue, FontValue, TextAlign } from '@/types/schema'
import type { InspectorSchema } from '@/types/inspector'
import { DEFAULT_FONT } from '@/config/fonts'
import { box } from '@/config/defaults'
import { cell, esc, resolveVariables, stripTags } from '@/lib/html'
import { padding } from '@/lib/style'
import { spacingGroup } from './common'
import { registerFont } from './text'

export interface TableValues {
  /** Row-major cell text. The first row is the header when `hasHeader`. */
  rows: string[][]
  hasHeader: boolean
  headerBg: string
  headerColor: string
  cellColor: string
  borderColor: string
  borderWidth: number
  cellPadding: number
  fontSize: number
  fontFamily: FontValue
  striped: boolean
  stripeColor: string
  align: TextAlign
  padding: BoxValue
  [key: string]: unknown
}

const inspector: InspectorSchema = [
  {
    title: 'Data',
    controls: [
      { type: 'list', key: 'rows', itemKind: 'row', wide: true },
      { type: 'toggle', key: 'hasHeader', label: 'Header row' },
    ],
  },
  {
    title: 'Style',
    controls: [
      { type: 'color', key: 'headerBg', label: 'Header background' },
      { type: 'color', key: 'headerColor', label: 'Header text' },
      { type: 'color', key: 'cellColor', label: 'Cell text' },
      { type: 'color', key: 'borderColor', label: 'Border color' },
      { type: 'number', key: 'borderWidth', label: 'Border width', unit: 'px', min: 0, max: 6 },
      { type: 'number', key: 'cellPadding', label: 'Cell padding', unit: 'px', min: 0, max: 32 },
      { type: 'font', key: 'fontFamily', label: 'Font' },
      { type: 'number', key: 'fontSize', label: 'Size', unit: 'px', min: 8, max: 28, responsive: true },
      { type: 'toggle', key: 'striped', label: 'Striped rows' },
      { type: 'color', key: 'stripeColor', label: 'Stripe color', showIf: (v) => !!v.striped },
      { type: 'align', key: 'align', label: 'Align', responsive: true },
    ],
  },
  spacingGroup(),
]

/** Background for a body row, accounting for the header offset. */
function stripeBg(v: TableValues, rowIndex: number): string {
  if (!v.striped) return ''
  const bodyIndex = v.hasHeader ? rowIndex - 1 : rowIndex
  return bodyIndex % 2 === 1 ? v.stripeColor : ''
}

function TableRender(p: BlockRenderProps<TableValues>) {
  const v = p.values
  const rows = v.rows ?? []
  const border = v.borderWidth > 0 ? `${v.borderWidth}px solid ${v.borderColor}` : undefined
  return (
    <div style={{ padding: padding(v.padding), textAlign: v.align }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: v.fontFamily?.value,
          fontSize: v.fontSize,
        }}
      >
        <tbody>
          {rows.map((row, ri) => {
            const header = v.hasHeader && ri === 0
            const bg = header ? v.headerBg : stripeBg(v, ri)
            return (
              <tr key={`r-${ri}`}>
                {(row ?? []).map((text, ci) => (
                  <td
                    key={`c-${ri}-${ci}`}
                    style={{
                      border,
                      padding: v.cellPadding,
                      background: bg || undefined,
                      color: header ? v.headerColor : v.cellColor,
                      fontWeight: header ? 700 : 400,
                      textAlign: 'left',
                      verticalAlign: 'top',
                    }}
                  >
                    {text}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export const tableBlock = defineBlock<TableValues>({
  type: 'table',
  label: 'Table',
  icon: Table2,
  group: 'advanced',
  keywords: ['grid', 'rows', 'columns', 'order', 'receipt', 'data'],
  description: 'A simple data table — order summaries, specs, comparisons.',
  defaultValues: () => ({
    rows: [
      ['Item', 'Qty', 'Price'],
      ['Merino crew sweater', '1', '$89.00'],
      ['Canvas tote bag', '2', '$38.00'],
    ],
    hasHeader: true,
    headerBg: '#f1f5f9',
    headerColor: '#0f172a',
    cellColor: '#334155',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    cellPadding: 10,
    fontSize: 14,
    fontFamily: DEFAULT_FONT,
    striped: false,
    stripeColor: '#f8fafc',
    align: 'center',
    padding: box(12, 24, 12, 24),
  }),
  render: TableRender,
  inspector,
  responsiveKeys: ['align', 'padding', 'fontSize'],
  toHtml(v, ctx) {
    registerFont(v.fontFamily, ctx)
    const rows = v.rows ?? []
    if (!rows.length) return ''
    const border = v.borderWidth > 0 ? `border:${v.borderWidth}px solid ${v.borderColor};` : ''

    const body = rows
      .map((row, ri) => {
        const header = v.hasHeader && ri === 0
        const bg = header ? v.headerBg : stripeBg(v, ri)
        const cells = (row ?? [])
          .map((text) => {
            const value = esc(
              stripTags(
                resolveVariables(text, ctx.variables, ctx.variableMode, ctx.variableSyntax),
              ),
            )
            return (
              `<td align="left" valign="top" style="${border}padding:${v.cellPadding}px;` +
              `${bg ? `background-color:${bg};` : ''}` +
              `color:${header ? v.headerColor : v.cellColor};` +
              `font-family:${v.fontFamily.value};font-size:${v.fontSize}px;` +
              `font-weight:${header ? 'bold' : 'normal'};line-height:1.5;` +
              `mso-line-height-rule:exactly;">${value}</td>`
            )
          })
          .join('')
        return `<tr>${cells}</tr>`
      })
      .join('')

    const table =
      `<table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" ` +
      `class="${ctx.className}-tb" style="width:100%;border-collapse:collapse;` +
      `font-family:${v.fontFamily.value};font-size:${v.fontSize}px;">${body}</table>`

    return cell(v.align, padding(v.padding), table, ctx.className)
  },
  toText: (v) =>
    `${(v.rows ?? [])
      .map((row) => (row ?? []).map((c) => stripTags(c)).join(' | '))
      .join('\n')}\n`,
  mobileCss(v, m, sel) {
    const td: string[] = []
    const tb: string[] = []
    if (m.padding) td.push(`padding:${padding(m.padding as BoxValue)} !important`)
    if (m.align) td.push(`text-align:${m.align} !important`)
    if (typeof m.fontSize === 'number') tb.push(`font-size:${m.fontSize}px !important`)
    return (
      (td.length ? `${sel}{${td.join(';')};}` : '') +
      (tb.length ? `${sel}-tb{${tb.join(';')};}` : '') +
      (tb.length ? `${sel}-tb td{${tb.join(';')};}` : '')
    )
  },
})
