import { useEffect, useState } from 'react'
import { Timer } from 'lucide-react'
import { defineBlock, type BlockRenderProps } from '@/types/blocks'
import type { BoxValue, FontValue, TextAlign } from '@/types/schema'
import type { InspectorSchema } from '@/types/inspector'
import { DEFAULT_FONT } from '@/config/fonts'
import { box } from '@/config/defaults'
import { cell, esc, safeUrl } from '@/lib/html'
import { padding } from '@/lib/style'
import { spacingGroup } from './common'
import { registerFont } from './text'

export interface CountdownLabels {
  days: string
  hours: string
  minutes: string
  seconds: string
}

export interface CountdownValues {
  /** ISO datetime, e.g. `2026-12-31T23:59:00Z`. */
  targetDate: string
  labels: CountdownLabels
  boxColor: string
  digitColor: string
  labelColor: string
  digitSize: number
  labelSize: number
  boxRadius: number
  gap: number
  showSeconds: boolean
  align: TextAlign
  padding: BoxValue
  expiredText: string
  fontFamily: FontValue
  /** Optional countdown-image service URL — replaces the static boxes. */
  imageUrl: string
  [key: string]: unknown
}

export interface Remaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  expired: boolean
}

/** Time left until `targetDate`, clamped at zero. */
export function remainingFrom(targetDate: string, now = Date.now()): Remaining {
  const target = Date.parse(targetDate)
  if (Number.isNaN(target)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false }
  }
  const ms = target - now
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  const total = Math.floor(ms / 1000)
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    expired: false,
  }
}

const pad2 = (n: number) => String(n).padStart(2, '0')

function units(v: CountdownValues, r: Remaining): { value: string; label: string }[] {
  const all = [
    { value: String(r.days), label: v.labels?.days ?? 'Days' },
    { value: pad2(r.hours), label: v.labels?.hours ?? 'Hours' },
    { value: pad2(r.minutes), label: v.labels?.minutes ?? 'Minutes' },
    { value: pad2(r.seconds), label: v.labels?.seconds ?? 'Seconds' },
  ]
  return v.showSeconds ? all : all.slice(0, 3)
}

const inspector: InspectorSchema = [
  {
    title: 'Countdown',
    controls: [
      {
        type: 'text',
        key: 'targetDate',
        label: 'Target date',
        placeholder: '2026-12-31T23:59:00Z',
        help: 'ISO date, e.g. 2026-12-31T23:59:00Z',
      },
      { type: 'toggle', key: 'showSeconds', label: 'Show seconds' },
      { type: 'text', key: 'expiredText', label: 'Expired text' },
      {
        type: 'text',
        key: 'imageUrl',
        label: 'Image URL',
        help: 'Optional. Point this at a countdown-image service to export a live, ticking image instead of static boxes.',
      },
    ],
  },
  {
    title: 'Labels',
    defaultOpen: false,
    controls: [
      { type: 'text', key: 'labels.days', label: 'Days' },
      { type: 'text', key: 'labels.hours', label: 'Hours' },
      { type: 'text', key: 'labels.minutes', label: 'Minutes' },
      { type: 'text', key: 'labels.seconds', label: 'Seconds' },
    ],
  },
  {
    title: 'Style',
    controls: [
      { type: 'color', key: 'boxColor', label: 'Box color', allowTransparent: true },
      { type: 'color', key: 'digitColor', label: 'Digit color' },
      { type: 'color', key: 'labelColor', label: 'Label color' },
      { type: 'number', key: 'digitSize', label: 'Digit size', unit: 'px', min: 12, max: 72, responsive: true },
      { type: 'number', key: 'labelSize', label: 'Label size', unit: 'px', min: 8, max: 24 },
      { type: 'number', key: 'boxRadius', label: 'Radius', unit: 'px', min: 0, max: 40 },
      { type: 'number', key: 'gap', label: 'Gap', unit: 'px', min: 0, max: 40 },
      { type: 'font', key: 'fontFamily', label: 'Font' },
      { type: 'align', key: 'align', label: 'Align', responsive: true },
    ],
  },
  spacingGroup(),
]

function CountdownRender(p: BlockRenderProps<CountdownValues>) {
  const v = p.values
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const r = remainingFrom(v.targetDate, now)

  if (r.expired) {
    return (
      <div style={{ padding: padding(v.padding), textAlign: v.align }}>
        <span
          style={{
            fontFamily: v.fontFamily?.value,
            fontSize: v.digitSize * 0.6,
            color: v.digitColor,
          }}
        >
          {v.expiredText || 'This offer has expired.'}
        </span>
      </div>
    )
  }

  return (
    <div style={{ padding: padding(v.padding), textAlign: v.align }}>
      {units(v, r).map((u) => (
        <span
          key={u.label}
          style={{
            display: 'inline-block',
            margin: `0 ${v.gap / 2}px`,
            background: v.boxColor === 'transparent' ? undefined : v.boxColor,
            borderRadius: v.boxRadius,
            padding: '10px 14px',
            textAlign: 'center',
            minWidth: v.digitSize * 1.8,
            fontFamily: v.fontFamily?.value,
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: v.digitSize,
              fontWeight: 700,
              color: v.digitColor,
              lineHeight: 1.1,
            }}
          >
            {u.value}
          </span>
          <span
            style={{
              display: 'block',
              fontSize: v.labelSize,
              color: v.labelColor,
              lineHeight: 1.4,
            }}
          >
            {u.label}
          </span>
        </span>
      ))}
    </div>
  )
}

export const countdownBlock = defineBlock<CountdownValues>({
  type: 'countdown',
  label: 'Countdown',
  icon: Timer,
  group: 'advanced',
  keywords: ['timer', 'deadline', 'urgency', 'sale', 'expires'],
  description: 'A deadline timer. Exports as a static snapshot unless you supply an image URL.',
  defaultValues: () => ({
    targetDate: new Date(Date.now() + 7 * 86400_000).toISOString().slice(0, 19) + 'Z',
    labels: { days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' },
    boxColor: '#4f46e5',
    digitColor: '#ffffff',
    labelColor: '#c7d2fe',
    digitSize: 30,
    labelSize: 11,
    boxRadius: 8,
    gap: 10,
    showSeconds: true,
    align: 'center',
    padding: box(16, 24, 16, 24),
    expiredText: 'This offer has expired.',
    fontFamily: DEFAULT_FONT,
    imageUrl: '',
  }),
  render: CountdownRender,
  inspector,
  responsiveKeys: ['align', 'padding', 'digitSize'],
  toHtml(v, ctx) {
    registerFont(v.fontFamily, ctx)

    // An author-supplied countdown-image service is the only way to get a
    // genuinely live timer, so it wins over the static snapshot.
    if (v.imageUrl) {
      const src = esc(safeUrl(v.imageUrl, true))
      if (src) {
        const img =
          `<img class="${ctx.className}-i" src="${src}" alt="${esc(v.expiredText || 'Countdown')}" ` +
          `style="display:inline-block;border:0;outline:none;max-width:100%;height:auto;` +
          `border-radius:${v.boxRadius}px;" />`
        return cell(v.align, padding(v.padding), img, ctx.className)
      }
    }

    const r = remainingFrom(v.targetDate)
    const note =
      `<!-- Static countdown snapshot, rendered at export time. Email clients ` +
      `cannot run JavaScript: for a live, ticking timer set this block's "Image URL" ` +
      `to a countdown-image service that renders the remaining time as a GIF. -->`

    if (r.expired) {
      const expired =
        `<span class="${ctx.className}-d" style="font-family:${v.fontFamily.value};` +
        `font-size:${Math.round(v.digitSize * 0.6)}px;color:${v.digitColor};line-height:1.4;` +
        `mso-line-height-rule:exactly;">${esc(v.expiredText || 'This offer has expired.')}</span>`
      return note + cell(v.align, padding(v.padding), expired, ctx.className)
    }

    const bg = v.boxColor && v.boxColor !== 'transparent' ? `background-color:${v.boxColor};` : ''
    const cells = units(v, r)
      .map(
        (u) =>
          `<td align="center" valign="middle" ` +
          `style="padding:0 ${v.gap / 2}px;font-family:${v.fontFamily.value};">` +
          `<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse:separate;">` +
          `<tr><td align="center" style="${bg}border-radius:${v.boxRadius}px;padding:10px 14px;` +
          `min-width:${Math.round(v.digitSize * 1.8)}px;text-align:center;mso-padding-alt:0;">` +
          `<div class="${ctx.className}-d" style="font-family:${v.fontFamily.value};font-size:${v.digitSize}px;` +
          `font-weight:700;color:${v.digitColor};line-height:1.1;mso-line-height-rule:exactly;">${esc(u.value)}</div>` +
          `<div style="font-family:${v.fontFamily.value};font-size:${v.labelSize}px;color:${v.labelColor};` +
          `line-height:1.4;mso-line-height-rule:exactly;">${esc(u.label)}</div>` +
          `</td></tr></table></td>`,
      )
      .join('')

    const inner =
      `<table role="presentation" border="0" cellpadding="0" cellspacing="0" ` +
      `align="${v.align}" style="border-collapse:collapse;display:inline-table;">` +
      `<tr>${cells}</tr></table>`

    return note + cell(v.align, padding(v.padding), inner, ctx.className)
  },
  toText(v) {
    const r = remainingFrom(v.targetDate)
    if (r.expired) return `${v.expiredText || 'This offer has expired.'}\n`
    return `${units(v, r)
      .map((u) => `${u.value} ${u.label}`)
      .join(' ')}\n`
  },
  mobileCss(v, m, sel) {
    const td: string[] = []
    const digit: string[] = []
    if (m.padding) td.push(`padding:${padding(m.padding as BoxValue)} !important`)
    if (m.align) td.push(`text-align:${m.align} !important`)
    if (typeof m.digitSize === 'number') digit.push(`font-size:${m.digitSize}px !important`)
    return (
      (td.length ? `${sel}{${td.join(';')};}` : '') +
      (digit.length ? `${sel}-d{${digit.join(';')};}` : '')
    )
  },
})
