import { useState } from 'react'
import { Link2 } from 'lucide-react'
import type { BoxValue } from '@/types/schema'
import { cn } from '@/lib/utils'

export interface SpacingControlProps {
  value: BoxValue
  onChange: (next: BoxValue) => void
  min?: number
  max?: number
  className?: string
}

const SIDES: { key: keyof BoxValue; label: string }[] = [
  { key: 'top', label: 'T' },
  { key: 'right', label: 'R' },
  { key: 'bottom', label: 'B' },
  { key: 'left', label: 'L' },
]

const EMPTY_BOX: BoxValue = { top: 0, right: 0, bottom: 0, left: 0 }

function allEqual(box: BoxValue): boolean {
  return box.top === box.right && box.right === box.bottom && box.bottom === box.left
}

/** Four-sided box editor with an optional "same on all sides" link. */
export function SpacingControl({
  value,
  onChange,
  min = 0,
  max = 400,
  className,
}: SpacingControlProps) {
  const box: BoxValue = value ?? EMPTY_BOX
  const [linked, setLinked] = useState(() => allEqual(box))

  const write = (side: keyof BoxValue, raw: string) => {
    const parsed = raw.trim() === '' ? min : Number(raw)
    const n = Math.min(max, Math.max(min, Number.isFinite(parsed) ? parsed : min))
    onChange(linked ? { top: n, right: n, bottom: n, left: n } : { ...box, [side]: n })
  }

  return (
    <div className={cn('rme:flex rme:items-center rme:gap-2', className)}>
      <div className="rme:grid rme:flex-1 rme:grid-cols-2 rme:gap-1.5">
        {SIDES.map(({ key, label }) => (
          <label key={key} className="rme:flex rme:items-center rme:gap-1">
            <span className="rme:w-3 rme:shrink-0 rme:text-[10px] rme:text-faint">{label}</span>
            <input
              type="number"
              inputMode="numeric"
              min={min}
              max={max}
              value={String(box[key] ?? 0)}
              onChange={(e) => write(key, e.target.value)}
              className="rme:h-7 rme:w-full rme:rounded-md rme:border rme:border-line rme:bg-panel rme:text-center rme:text-[11px] rme:tabular-nums rme:text-ink rme:transition-colors rme:focus-visible:outline-none rme:focus-visible:ring-2 rme:focus-visible:ring-ring/50"
            />
          </label>
        ))}
      </div>

      <button
        type="button"
        title={linked ? 'Unlink sides' : 'Link all sides'}
        aria-pressed={linked}
        data-state={linked ? 'on' : 'off'}
        onClick={() => {
          const next = !linked
          setLinked(next)
          if (next) {
            const n = box.top
            onChange({ top: n, right: n, bottom: n, left: n })
          }
        }}
        className={cn(
          'rme:flex rme:h-7 rme:w-7 rme:shrink-0 rme:items-center rme:justify-center rme:rounded-md rme:border rme:border-line rme:text-subtle rme:transition-colors',
          'rme:hover:bg-hover',
          'rme:focus-visible:outline-none rme:focus-visible:ring-2 rme:focus-visible:ring-ring/50',
          'rme:data-[state=on]:border-brand rme:data-[state=on]:bg-brand rme:data-[state=on]:text-on-brand',
        )}
      >
        <Link2 className="rme:h-3.5 rme:w-3.5" />
      </button>
    </div>
  )
}
