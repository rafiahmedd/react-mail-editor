import { Image as ImageIcon, Minus, MoveVertical, PlayCircle } from 'lucide-react'
import { defineBlock, type BlockRenderProps } from '@/types/blocks'
import type { BoxValue, TextAlign } from '@/types/schema'
import type { InspectorSchema } from '@/types/inspector'
import { box } from '@/config/defaults'
import { cell, esc, safeUrl } from '@/lib/html'
import { padding } from '@/lib/style'
import { lineStyleOptions, spacingGroup } from './common'

/* ------------------------------------------------------------------ */
/* Image                                                               */
/* ------------------------------------------------------------------ */

export interface ImageValues {
  src: string
  alt: string
  width: number
  autoWidth: boolean
  align: TextAlign
  href: string
  borderRadius: number
  padding: BoxValue
  caption: string
  captionColor: string
  captionSize: number
  [key: string]: unknown
}

const imageInspector: InspectorSchema = [
  {
    title: 'Image',
    controls: [
      { type: 'image', key: 'src', label: 'Source', wide: true },
      { type: 'text', key: 'alt', label: 'Alt text', help: 'Shown when images are blocked — always fill this in.' },
      { type: 'link', key: 'href', label: 'Link' },
    ],
  },
  {
    title: 'Style',
    controls: [
      { type: 'toggle', key: 'autoWidth', label: 'Fill width', responsive: true },
      {
        type: 'slider',
        key: 'width',
        label: 'Width',
        unit: 'px',
        min: 20,
        max: 700,
        showIf: (v) => !v.autoWidth,
        responsive: true,
      },
      { type: 'align', key: 'align', label: 'Align', responsive: true },
      { type: 'number', key: 'borderRadius', label: 'Radius', unit: 'px', min: 0, max: 200 },
    ],
  },
  {
    title: 'Caption',
    defaultOpen: false,
    controls: [
      { type: 'text', key: 'caption', label: 'Caption' },
      { type: 'color', key: 'captionColor', label: 'Color', showIf: (v) => !!v.caption },
      { type: 'number', key: 'captionSize', label: 'Size', unit: 'px', min: 8, max: 24, showIf: (v) => !!v.caption },
    ],
  },
  spacingGroup(),
]

function ImageRender(p: BlockRenderProps<ImageValues>) {
  const v = p.values
  return (
    <div style={{ padding: padding(v.padding), textAlign: v.align }}>
      {v.src ? (
        <img
          src={v.src}
          alt={v.alt}
          style={{
            display: 'inline-block',
            width: v.autoWidth ? '100%' : v.width,
            maxWidth: '100%',
            height: 'auto',
            borderRadius: v.borderRadius,
          }}
        />
      ) : (
        <div
          style={{
            border: '1px dashed #cbd5e1',
            borderRadius: 8,
            padding: '32px 12px',
            color: '#94a3b8',
            fontSize: 13,
            textAlign: 'center',
          }}
        >
          Click to choose an image
        </div>
      )}
      {v.caption ? (
        <div style={{ marginTop: 8, color: v.captionColor, fontSize: v.captionSize }}>
          {v.caption}
        </div>
      ) : null}
    </div>
  )
}

export const imageBlock = defineBlock<ImageValues>({
  type: 'image',
  label: 'Image',
  icon: ImageIcon,
  group: 'media',
  keywords: ['picture', 'photo', 'banner', 'logo'],
  defaultValues: () => ({
    src: '',
    alt: '',
    width: 552,
    autoWidth: true,
    align: 'center',
    href: '',
    borderRadius: 8,
    padding: box(12, 24, 12, 24),
    caption: '',
    captionColor: '#64748b',
    captionSize: 12,
  }),
  render: ImageRender,
  inspector: imageInspector,
  responsiveKeys: ['autoWidth', 'width', 'align', 'padding'],
  toHtml(v, ctx) {
    if (!v.src) return ''
    const w = v.autoWidth ? ctx.contentWidth : v.width
    const img =
      `<img class="${ctx.className}-i" src="${esc(safeUrl(v.src, true))}" alt="${esc(v.alt)}" ` +
      `width="${w}" style="display:block;border:0;outline:none;text-decoration:none;` +
      `width:${v.autoWidth ? '100%' : `${v.width}px`};max-width:100%;height:auto;` +
      `border-radius:${v.borderRadius}px;-ms-interpolation-mode:bicubic;" />`
    const linked = v.href
      ? `<a href="${esc(safeUrl(v.href))}" target="_blank">${img}</a>`
      : img
    const caption = v.caption
      ? `<div style="margin-top:8px;color:${v.captionColor};font-size:${v.captionSize}px;font-family:${ctx.fontFamily};">${esc(v.caption)}</div>`
      : ''
    return cell(
      v.align,
      padding(v.padding),
      `<span style="display:inline-block;max-width:100%;">${linked}</span>${caption}`,
      ctx.className,
    )
  },
  toText: (v) => (v.alt || v.caption ? `[${v.alt || v.caption}]\n` : ''),
  mobileCss(v, m, sel) {
    const td: string[] = []
    const img: string[] = []
    if (m.padding) td.push(`padding:${padding(m.padding as BoxValue)} !important`)
    if (m.align) td.push(`text-align:${m.align} !important`)
    if (m.autoWidth === true) img.push('width:100% !important')
    else if (typeof m.width === 'number') img.push(`width:${m.width}px !important`)
    return (
      (td.length ? `${sel}{${td.join(';')};}` : '') +
      (img.length ? `${sel}-i{${img.join(';')};}` : '')
    )
  },
})

/* ------------------------------------------------------------------ */
/* Divider                                                             */
/* ------------------------------------------------------------------ */

export interface DividerValues {
  color: string
  thickness: number
  width: number
  style: 'solid' | 'dashed' | 'dotted' | 'double'
  align: TextAlign
  padding: BoxValue
  [key: string]: unknown
}

function DividerRender(p: BlockRenderProps<DividerValues>) {
  const v = p.values
  return (
    <div style={{ padding: padding(v.padding), textAlign: v.align }}>
      <div
        style={{
          display: 'inline-block',
          width: `${v.width}%`,
          borderTop: `${v.thickness}px ${v.style} ${v.color}`,
          verticalAlign: 'middle',
        }}
      />
    </div>
  )
}

export const dividerBlock = defineBlock<DividerValues>({
  type: 'divider',
  label: 'Divider',
  icon: Minus,
  group: 'layout',
  keywords: ['line', 'separator', 'hr', 'rule'],
  defaultValues: () => ({
    color: '#e2e8f0',
    thickness: 1,
    width: 100,
    style: 'solid',
    align: 'center',
    padding: box(12, 24, 12, 24),
  }),
  render: DividerRender,
  inspector: [
    {
      title: 'Style',
      controls: [
        { type: 'color', key: 'color', label: 'Color' },
        { type: 'number', key: 'thickness', label: 'Thickness', unit: 'px', min: 1, max: 20 },
        { type: 'slider', key: 'width', label: 'Width', unit: '%', min: 10, max: 100 },
        { type: 'select', key: 'style', label: 'Line style', options: lineStyleOptions },
        { type: 'align', key: 'align', label: 'Align' },
      ],
    },
    spacingGroup(),
  ],
  responsiveKeys: ['padding', 'width'],
  toHtml(v, ctx) {
    const line =
      `<table role="presentation" border="0" width="${v.width}%" cellpadding="0" cellspacing="0" ` +
      `style="width:${v.width}%;border-collapse:collapse;">` +
      `<tr><td style="border-top:${v.thickness}px ${v.style} ${v.color};font-size:0;line-height:0;">&nbsp;</td></tr>` +
      `</table>`
    return cell(v.align, padding(v.padding), line, ctx.className)
  },
  toText: () => '----------------------------------------\n',
})

/* ------------------------------------------------------------------ */
/* Spacer                                                              */
/* ------------------------------------------------------------------ */

export interface SpacerValues {
  height: number
  backgroundColor: string
  [key: string]: unknown
}

function SpacerRender(p: BlockRenderProps<SpacerValues>) {
  const v = p.values
  return (
    <div
      style={{
        height: v.height,
        background: v.backgroundColor === 'transparent' ? undefined : v.backgroundColor,
      }}
    />
  )
}

export const spacerBlock = defineBlock<SpacerValues>({
  type: 'spacer',
  label: 'Spacer',
  icon: MoveVertical,
  group: 'layout',
  keywords: ['gap', 'space', 'margin', 'padding'],
  defaultValues: () => ({ height: 24, backgroundColor: 'transparent' }),
  render: SpacerRender,
  inspector: [
    {
      title: 'Size',
      controls: [
        { type: 'slider', key: 'height', label: 'Height', unit: 'px', min: 2, max: 200, responsive: true },
        { type: 'color', key: 'backgroundColor', label: 'Background', allowTransparent: true },
      ],
    },
  ],
  responsiveKeys: ['height'],
  toHtml(v, ctx) {
    const bg = v.backgroundColor && v.backgroundColor !== 'transparent'
      ? `background-color:${v.backgroundColor};`
      : ''
    return (
      `<table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">` +
      `<tr><td class="${ctx.className}" style="height:${v.height}px;line-height:${v.height}px;font-size:0;${bg}">&nbsp;</td></tr>` +
      `</table>`
    )
  },
  toText: () => '\n',
  mobileCss(v, m, sel) {
    if (typeof m.height !== 'number') return ''
    return `${sel}{height:${m.height}px !important;line-height:${m.height}px !important;}`
  },
})

/* ------------------------------------------------------------------ */
/* Video (thumbnail + play overlay — email clients cannot play video)  */
/* ------------------------------------------------------------------ */

export interface VideoValues {
  url: string
  thumbnail: string
  alt: string
  width: number
  autoWidth: boolean
  align: TextAlign
  borderRadius: number
  padding: BoxValue
  playColor: string
  showPlay: boolean
  [key: string]: unknown
}

/** Best-effort thumbnail for a YouTube/Vimeo URL. */
export function guessThumbnail(url: string): string {
  const yt = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/.exec(url)
  if (yt) return `https://img.youtube.com/vi/${yt[1]}/maxresdefault.jpg`
  return ''
}

function VideoRender(p: BlockRenderProps<VideoValues>) {
  const v = p.values
  const thumb = v.thumbnail || guessThumbnail(v.url)
  return (
    <div style={{ padding: padding(v.padding), textAlign: v.align }}>
      <span
        style={{
          display: 'inline-block',
          position: 'relative',
          width: v.autoWidth ? '100%' : v.width,
          maxWidth: '100%',
        }}
      >
        {thumb ? (
          <img
            src={thumb}
            alt={v.alt}
            style={{ width: '100%', height: 'auto', borderRadius: v.borderRadius, display: 'block' }}
          />
        ) : (
          <div
            style={{
              background: '#0f172a',
              borderRadius: v.borderRadius,
              paddingTop: '56%',
            }}
          />
        )}
        {v.showPlay ? (
          <span
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: v.playColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 22,
              }}
            >
              ▶
            </span>
          </span>
        ) : null}
      </span>
    </div>
  )
}

export const videoBlock = defineBlock<VideoValues>({
  type: 'video',
  label: 'Video',
  icon: PlayCircle,
  group: 'media',
  keywords: ['youtube', 'vimeo', 'movie', 'play'],
  description: 'Clickable thumbnail — email clients cannot embed real video.',
  defaultValues: () => ({
    url: '', // ponytail: empty so inserting the block fetches no thumbnail; the dark placeholder shows until an author pastes a URL
    thumbnail: '',
    alt: 'Watch the video',
    width: 552,
    autoWidth: true,
    align: 'center',
    borderRadius: 8,
    padding: box(12, 24, 12, 24),
    playColor: 'rgba(15,23,42,0.75)',
    showPlay: true,
  }),
  render: VideoRender,
  inspector: [
    {
      title: 'Video',
      controls: [
        { type: 'link', key: 'url', label: 'Video URL' },
        { type: 'image', key: 'thumbnail', label: 'Thumbnail', wide: true, help: 'Left blank, YouTube thumbnails are detected automatically.' },
        { type: 'text', key: 'alt', label: 'Alt text' },
      ],
    },
    {
      title: 'Style',
      controls: [
        { type: 'toggle', key: 'showPlay', label: 'Play badge' },
        { type: 'color', key: 'playColor', label: 'Badge color', showIf: (v) => !!v.showPlay },
        { type: 'toggle', key: 'autoWidth', label: 'Fill width' },
        { type: 'slider', key: 'width', label: 'Width', unit: 'px', min: 100, max: 700, showIf: (v) => !v.autoWidth },
        { type: 'align', key: 'align', label: 'Align', responsive: true },
        { type: 'number', key: 'borderRadius', label: 'Radius', unit: 'px', min: 0, max: 60 },
      ],
    },
    spacingGroup(),
  ],
  responsiveKeys: ['align', 'padding'],
  toHtml(v, ctx) {
    const thumb = v.thumbnail || guessThumbnail(v.url)
    if (!thumb) return ''
    const w = v.autoWidth ? ctx.contentWidth : v.width
    // A play badge is composited by stacking a background image cell over the
    // thumbnail — this survives Gmail, Apple Mail and Outlook.com.
    const img =
      `<img src="${esc(safeUrl(thumb, true))}" alt="${esc(v.alt)}" width="${w}" ` +
      `style="display:block;border:0;width:${v.autoWidth ? '100%' : `${v.width}px`};` +
      `max-width:100%;height:auto;border-radius:${v.borderRadius}px;" />`
    const overlay = v.showPlay
      ? `<div style="position:absolute;top:0;left:0;right:0;bottom:0;">` +
        `<table role="presentation" border="0" width="100%" height="100%" cellpadding="0" cellspacing="0">` +
        `<tr><td align="center" valign="middle">` +
        `<span style="display:inline-block;width:56px;height:56px;line-height:56px;border-radius:50%;` +
        `background:${v.playColor};color:#ffffff;font-size:22px;text-align:center;">&#9654;</span>` +
        `</td></tr></table></div>`
      : ''
    const inner =
      `<a href="${esc(safeUrl(v.url))}" target="_blank" style="display:inline-block;position:relative;max-width:100%;text-decoration:none;">` +
      img +
      overlay +
      `</a>`
    return cell(v.align, padding(v.padding), inner, ctx.className)
  },
  toText: (v) => `${v.alt || 'Watch the video'}: ${v.url}\n`,
})
