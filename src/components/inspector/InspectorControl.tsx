import type { ReactNode } from 'react'
import type { ControlDef } from '@/types/inspector'
import type { BgImage, BorderValue, BoxValue, FontValue, Values } from '@/types/schema'
import { DEFAULT_FONT } from '@/config/fonts'
import {
  AlignControl,
  BackgroundControl,
  BorderControl,
  ColorControl,
  Field,
  FontControl,
  ImageControl,
  LinkControl,
  ListControl,
  NumberControl,
  RichTextControl,
  SegmentedControl,
  SelectControl,
  SliderControl,
  SpacingControl,
  TextControl,
  TextareaControl,
  ToggleControl,
} from './controls'

export interface InspectorControlProps {
  def: ControlDef
  value: unknown
  onChange: (next: unknown) => void
  values: Record<string, unknown>
  upload: (file: File) => Promise<string>
  /** Rendered next to the label — the per-device override toggle. */
  action?: ReactNode
}

/* Coercion helpers: node values come off a loose JSON bag. */

const asString = (v: unknown, fallback = ''): string =>
  typeof v === 'string' ? v : v == null ? fallback : String(v)

const asNumber = (v: unknown, fallback = 0): number => {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : Number.NaN
  return Number.isFinite(n) ? n : fallback
}

const asScalar = (v: unknown): string | number =>
  typeof v === 'number' ? v : asString(v)

const asBox = (v: unknown): BoxValue => {
  const b = (v ?? {}) as Partial<BoxValue>
  return {
    top: asNumber(b.top),
    right: asNumber(b.right),
    bottom: asNumber(b.bottom),
    left: asNumber(b.left),
  }
}

const asBorder = (v: unknown): BorderValue => {
  const b = (v ?? {}) as Partial<BorderValue>
  return {
    width: asNumber(b.width),
    style: b.style ?? 'solid',
    color: asString(b.color, '#e2e8f0') || '#e2e8f0',
  }
}

const asBg = (v: unknown): BgImage => {
  const b = (v ?? {}) as Partial<BgImage>
  return {
    url: asString(b.url),
    repeat: b.repeat ?? 'no-repeat',
    size: b.size ?? 'cover',
    position: asString(b.position, 'center center') || 'center center',
  }
}

const asFont = (v: unknown): FontValue => {
  const f = (v ?? {}) as Partial<FontValue>
  return typeof f.value === 'string' && f.value
    ? { label: asString(f.label, f.value), value: f.value, url: f.url }
    : DEFAULT_FONT
}

/** Controls that never make sense in the 88px label/field split. */
function isWide(def: ControlDef): boolean {
  switch (def.type) {
    case 'richtext':
    case 'list':
    case 'background':
    case 'image':
    case 'spacing':
      return true
    default:
      return def.wide === true
  }
}

/** Renders a single `ControlDef` inside a `Field`. */
export function InspectorControl({
  def,
  value,
  onChange,
  values,
  upload,
  action,
}: InspectorControlProps): ReactNode {
  const field = (children: ReactNode) => (
    <Field label={def.label} help={def.help} wide={isWide(def)} action={action}>
      {children}
    </Field>
  )

  switch (def.type) {
    case 'text':
      return field(
        <TextControl
          value={asString(value)}
          placeholder={def.placeholder}
          onChange={(next) => onChange(next)}
        />,
      )

    case 'textarea':
      return field(
        <TextareaControl
          value={asString(value)}
          rows={def.rows}
          mono={def.mono}
          placeholder={def.placeholder}
          onChange={(next) => onChange(next)}
        />,
      )

    case 'number':
      return field(
        <NumberControl
          value={asNumber(value, def.min ?? 0)}
          min={def.min}
          max={def.max}
          step={def.step}
          unit={def.unit}
          onChange={(next) => onChange(next)}
        />,
      )

    case 'slider':
      return field(
        <SliderControl
          value={asNumber(value, def.min ?? 0)}
          min={def.min}
          max={def.max}
          step={def.step}
          unit={def.unit}
          onChange={(next) => onChange(next)}
        />,
      )

    case 'color':
      return field(
        <ColorControl
          value={asString(value, 'transparent')}
          allowTransparent={def.allowTransparent}
          onChange={(next) => onChange(next)}
        />,
      )

    case 'select':
      return field(
        <SelectControl
          value={asScalar(value)}
          options={def.options}
          onChange={(next) => onChange(next)}
        />,
      )

    case 'segmented':
      return field(
        <SegmentedControl
          value={asScalar(value)}
          options={def.options}
          onChange={(next) => onChange(next)}
        />,
      )

    case 'align':
      return field(
        <AlignControl
          value={asString(value, def.vertical ? 'top' : 'left')}
          vertical={def.vertical}
          onChange={(next) => onChange(next)}
        />,
      )

    case 'toggle':
      return field(
        <ToggleControl value={Boolean(value)} onChange={(next) => onChange(next)} />,
      )

    case 'spacing':
      return field(
        <SpacingControl value={asBox(value)} onChange={(next) => onChange(next)} />,
      )

    case 'border':
      return field(
        <BorderControl value={asBorder(value)} onChange={(next) => onChange(next)} />,
      )

    case 'font':
      return field(<FontControl value={asFont(value)} onChange={(next) => onChange(next)} />)

    case 'link':
      return field(<LinkControl value={asString(value)} onChange={(next) => onChange(next)} />)

    case 'image':
      return field(
        <ImageControl
          value={asString(value)}
          upload={upload}
          onChange={(next) => onChange(next)}
        />,
      )

    case 'background':
      return field(
        <BackgroundControl
          value={asBg(value)}
          upload={upload}
          onChange={(next) => onChange(next)}
        />,
      )

    case 'list':
      return field(
        <ListControl
          value={Array.isArray(value) ? value : []}
          itemKind={def.itemKind}
          upload={upload}
          onChange={(next) => onChange(next)}
        />,
      )

    case 'richtext':
      return field(
        <RichTextControl value={asString(value)} onChange={(next) => onChange(next)} />,
      )

    case 'custom': {
      const Custom = def.component
      return field(<Custom value={value} onChange={onChange} values={values as Values} />)
    }
  }
}
