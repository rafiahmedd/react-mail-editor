import { Heading as HeadingIcon, Type as TypeIcon } from 'lucide-react'
import { defineBlock, type BlockRenderProps, type ExportContext } from '@/types/blocks'
import type { BoxValue, FontValue, TextAlign } from '@/types/schema'
import { DEFAULT_FONT, fontUrl } from '@/config/fonts'
import { box } from '@/config/defaults'
import { cell, esc, inlineText, resolveVariables, safeUrl, stripTags } from '@/lib/html'
import { padding } from '@/lib/style'
import { RichText } from '@/components/rte/RichText'
import { spacingGroup, weightOptions } from './common'
import type { InspectorSchema } from '@/types/inspector'

/* ------------------------------------------------------------------ */
/* Heading                                                             */
/* ------------------------------------------------------------------ */

export interface HeadingValues {
  text: string
  level: 'h1' | 'h2' | 'h3' | 'h4'
  fontFamily: FontValue
  fontSize: number
  fontWeight: number
  color: string
  align: TextAlign
  lineHeight: number
  letterSpacing: number
  href: string
  padding: BoxValue
  [key: string]: unknown
}

const headingInspector: InspectorSchema = [
  {
    title: 'Content',
    controls: [
      { type: 'richtext', key: 'text', label: 'Text', wide: true },
      {
        type: 'segmented',
        key: 'level',
        label: 'Tag',
        options: [
          { label: 'H1', value: 'h1' },
          { label: 'H2', value: 'h2' },
          { label: 'H3', value: 'h3' },
          { label: 'H4', value: 'h4' },
        ],
      },
      { type: 'link', key: 'href', label: 'Link' },
    ],
  },
  {
    title: 'Style',
    controls: [
      { type: 'font', key: 'fontFamily', label: 'Font' },
      { type: 'number', key: 'fontSize', label: 'Size', unit: 'px', min: 8, max: 90, responsive: true },
      { type: 'select', key: 'fontWeight', label: 'Weight', options: weightOptions },
      { type: 'color', key: 'color', label: 'Color' },
      { type: 'align', key: 'align', label: 'Align', responsive: true },
      { type: 'number', key: 'lineHeight', label: 'Line height', step: 0.05, min: 0.8, max: 3 },
      { type: 'number', key: 'letterSpacing', label: 'Letter spacing', unit: 'px', min: -5, max: 20 },
    ],
  },
  spacingGroup(),
]

function HeadingRender(p: BlockRenderProps<HeadingValues>) {
  const v = p.values
  return (
    <div style={{ padding: padding(v.padding), textAlign: v.align }}>
      <RichText
        singleLine
        value={v.text}
        editable={!p.preview}
        active={p.editing}
        onActivate={() => p.setEditing(true)}
        onDeactivate={() => p.setEditing(false)}
        onChange={(html) => p.update({ text: html }, `text:${p.block.id}`)}
        placeholder="Your headline"
        variables={p.variables}
        linkColor={p.body.linkColor}
        style={{
          fontFamily: v.fontFamily?.value,
          fontSize: v.fontSize,
          fontWeight: v.fontWeight,
          color: v.color,
          lineHeight: v.lineHeight,
          letterSpacing: v.letterSpacing,
          margin: 0,
        }}
      />
    </div>
  )
}

export const headingBlock = defineBlock<HeadingValues>({
  type: 'heading',
  label: 'Heading',
  icon: HeadingIcon,
  group: 'content',
  keywords: ['title', 'h1', 'h2', 'headline'],
  inlineEditable: true,
  defaultValues: () => ({
    text: 'Your headline goes here',
    level: 'h2',
    fontFamily: DEFAULT_FONT,
    fontSize: 28,
    fontWeight: 700,
    color: '#0f172a',
    align: 'left',
    lineHeight: 1.3,
    letterSpacing: 0,
    href: '',
    padding: box(12, 24, 12, 24),
  }),
  render: HeadingRender,
  inspector: headingInspector,
  responsiveKeys: ['fontSize', 'align', 'padding'],
  toHtml(v, ctx) {
    registerFont(v.fontFamily, ctx)
    const inner = inlineText(
      resolveVariables(v.text, ctx.variables, ctx.variableMode, ctx.variableSyntax),
    )
    const body = v.href
      ? `<a href="${esc(safeUrl(v.href))}" style="color:inherit;text-decoration:none;">${inner}</a>`
      : inner
    const style =
      `margin:0;font-family:${v.fontFamily.value};font-size:${v.fontSize}px;` +
      `font-weight:${v.fontWeight};color:${v.color};line-height:${v.lineHeight};` +
      `letter-spacing:${v.letterSpacing}px;mso-line-height-rule:exactly;`
    return cell(
      v.align,
      padding(v.padding),
      `<${v.level} class="${ctx.className}-t" style="${style}">${body}</${v.level}>`,
      ctx.className,
    )
  },
  toText: (v) => `${stripTags(v.text)}\n`,
  mobileCss(v, m, sel) {
    const td: string[] = []
    const txt: string[] = []
    if (m.padding) td.push(`padding:${padding(m.padding as BoxValue)} !important`)
    if (m.align) td.push(`text-align:${m.align} !important`)
    if (m.fontSize) txt.push(`font-size:${m.fontSize}px !important`)
    return (
      (td.length ? `${sel}{${td.join(';')};}` : '') +
      (txt.length ? `${sel}-t{${txt.join(';')};}` : '')
    )
  },
})

/* ------------------------------------------------------------------ */
/* Text (paragraph / rich body copy)                                   */
/* ------------------------------------------------------------------ */

export interface TextValues {
  text: string
  fontFamily: FontValue
  fontSize: number
  fontWeight: number
  color: string
  align: TextAlign
  lineHeight: number
  letterSpacing: number
  padding: BoxValue
  [key: string]: unknown
}

const textInspector: InspectorSchema = [
  {
    title: 'Content',
    controls: [{ type: 'richtext', key: 'text', label: 'Text', wide: true }],
  },
  {
    title: 'Style',
    controls: [
      { type: 'font', key: 'fontFamily', label: 'Font' },
      { type: 'number', key: 'fontSize', label: 'Size', unit: 'px', min: 8, max: 48, responsive: true },
      { type: 'select', key: 'fontWeight', label: 'Weight', options: weightOptions },
      { type: 'color', key: 'color', label: 'Color' },
      { type: 'align', key: 'align', label: 'Align', responsive: true },
      { type: 'number', key: 'lineHeight', label: 'Line height', step: 0.05, min: 0.8, max: 3 },
      { type: 'number', key: 'letterSpacing', label: 'Letter spacing', unit: 'px', min: -5, max: 20 },
    ],
  },
  spacingGroup(),
]

function TextRender(p: BlockRenderProps<TextValues>) {
  const v = p.values
  return (
    <div style={{ padding: padding(v.padding), textAlign: v.align }}>
      <RichText
        value={v.text}
        editable={!p.preview}
        active={p.editing}
        onActivate={() => p.setEditing(true)}
        onDeactivate={() => p.setEditing(false)}
        onChange={(html) => p.update({ text: html }, `text:${p.block.id}`)}
        placeholder="Write your message…"
        variables={p.variables}
        linkColor={p.body.linkColor}
        className="rme-canvas-doc"
        style={{
          fontFamily: v.fontFamily?.value,
          fontSize: v.fontSize,
          fontWeight: v.fontWeight,
          color: v.color,
          lineHeight: v.lineHeight,
          letterSpacing: v.letterSpacing,
        }}
      />
    </div>
  )
}

export const textBlock = defineBlock<TextValues>({
  type: 'text',
  label: 'Text',
  icon: TypeIcon,
  group: 'content',
  keywords: ['paragraph', 'copy', 'body', 'rich text'],
  inlineEditable: true,
  defaultValues: () => ({
    text: '<p>This is a paragraph of text. Double-click to edit it and replace it with your own content.</p>',
    fontFamily: DEFAULT_FONT,
    fontSize: 15,
    fontWeight: 400,
    color: '#334155',
    align: 'left',
    lineHeight: 1.65,
    letterSpacing: 0,
    padding: box(8, 24, 8, 24),
  }),
  render: TextRender,
  inspector: textInspector,
  responsiveKeys: ['fontSize', 'align', 'padding'],
  toHtml(v, ctx) {
    registerFont(v.fontFamily, ctx)
    const html = resolveVariables(
      v.text,
      ctx.variables,
      ctx.variableMode,
      ctx.variableSyntax,
    )
    const style =
      `font-family:${v.fontFamily.value};font-size:${v.fontSize}px;` +
      `font-weight:${v.fontWeight};color:${v.color};line-height:${v.lineHeight};` +
      `letter-spacing:${v.letterSpacing}px;mso-line-height-rule:exactly;`
    return cell(
      v.align,
      padding(v.padding),
      `<div class="${ctx.className}-t" style="${style}">${html}</div>`,
      ctx.className,
    )
  },
  toText: (v) => `${stripTags(v.text)}\n`,
  mobileCss(v, m, sel) {
    const td: string[] = []
    const txt: string[] = []
    if (m.padding) td.push(`padding:${padding(m.padding as BoxValue)} !important`)
    if (m.align) td.push(`text-align:${m.align} !important`)
    if (m.fontSize) txt.push(`font-size:${m.fontSize}px !important`)
    return (
      (td.length ? `${sel}{${td.join(';')};}` : '') +
      (txt.length ? `${sel}-t{${txt.join(';')};}` : '')
    )
  },
})

/** Register a webfont URL so the exporter can add it to `<head>`. */
export function registerFont(font: FontValue | undefined, ctx: ExportContext): void {
  const url = fontUrl(font)
  if (url) ctx.addFont(url)
}
