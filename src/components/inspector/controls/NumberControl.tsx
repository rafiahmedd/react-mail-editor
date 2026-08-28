import { useEffect, useRef, useState } from 'react'
import { Input } from '@/ui/input'
import { cn } from '@/lib/utils'

export interface NumberControlProps {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  className?: string
}

function clampTo(n: number, min?: number, max?: number): number {
  let out = n
  if (typeof min === 'number' && out < min) out = min
  if (typeof max === 'number' && out > max) out = max
  return out
}

/** Compact numeric input with the unit rendered inside the field. */
export function NumberControl({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  className,
}: NumberControlProps) {
  const fallback = min ?? 0
  const [draft, setDraft] = useState(() =>
    Number.isFinite(value) ? String(value) : String(fallback),
  )
  const focused = useRef(false)

  /* Follow external updates (undo, mobile override switch) while idle. */
  useEffect(() => {
    if (focused.current) return
    setDraft(Number.isFinite(value) ? String(value) : String(fallback))
  }, [value, fallback])

  const commit = (raw: string) => {
    const trimmed = raw.trim()
    const parsed = trimmed === '' ? Number.NaN : Number(trimmed)
    const next = clampTo(Number.isFinite(parsed) ? parsed : fallback, min, max)
    setDraft(String(next))
    if (next !== value) onChange(next)
  }

  return (
    <div className={cn('rme:relative', className)}>
      <Input
        type="number"
        inputMode="decimal"
        value={draft}
        min={min}
        max={max}
        step={step}
        onFocus={() => {
          focused.current = true
        }}
        onChange={(e) => {
          const raw = e.target.value
          setDraft(raw)
          const parsed = raw.trim() === '' ? Number.NaN : Number(raw)
          if (Number.isFinite(parsed) && parsed !== value) onChange(parsed)
        }}
        onBlur={(e) => {
          focused.current = false
          commit(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit((e.target as HTMLInputElement).value)
        }}
        className={cn(
          'rme:tabular-nums',
          'rme:[&::-webkit-outer-spin-button]:m-0 rme:[&::-webkit-inner-spin-button]:m-0',
          unit && 'rme:pr-7',
        )}
      />
      {unit ? (
        <span className="rme:pointer-events-none rme:absolute rme:right-2 rme:top-1/2 rme:-translate-y-1/2 rme:text-[10px] rme:text-faint">
          {unit}
        </span>
      ) : null}
    </div>
  )
}
