import { useEffect, useState, type CSSProperties } from 'react'
import { Check } from 'lucide-react'
import { Input } from '@/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'
import { cn, isLight } from '@/lib/utils'

export interface ColorControlProps {
  value: string
  onChange: (next: string) => void
  allowTransparent?: boolean
  /** Swatch only — used inside dense composite controls like the border row. */
  compact?: boolean
  className?: string
}

/** 14 presets: neutrals plus one step of every common hue. */
const PRESETS = [
  '#0f172a',
  '#64748b',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#e2e8f0',
  '#ffffff',
  '#000000',
]

const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

export const CHECKER_STYLE: CSSProperties = {
  backgroundColor: '#fff',
  backgroundImage:
    'linear-gradient(45deg,#ccc 25%,transparent 25%),linear-gradient(-45deg,#ccc 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ccc 75%),linear-gradient(-45deg,transparent 75%,#ccc 75%)',
  backgroundSize: '8px 8px',
  backgroundPosition: '0 0,0 4px,4px -4px,-4px 0',
}

function isTransparentValue(v: string | undefined): boolean {
  return !v || v === 'transparent' || v === 'none'
}

/** Expand `#abc` → `#aabbcc` so `<input type="color">` accepts it. */
function toLongHex(v: string): string {
  const hex = v.trim()
  if (/^#[0-9a-f]{3}$/i.test(hex)) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
  }
  return /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#ffffff'
}

export function ColorControl({
  value,
  onChange,
  allowTransparent,
  compact,
  className,
}: ColorControlProps) {
  const transparent = isTransparentValue(value)
  const [draft, setDraft] = useState(() => (transparent ? '' : value))

  useEffect(() => {
    setDraft(isTransparentValue(value) ? '' : value)
  }, [value])

  const swatchStyle: CSSProperties = transparent
    ? CHECKER_STYLE
    : { backgroundColor: value }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={transparent ? 'Transparent' : value}
          className={cn(
            'rme:flex rme:h-8 rme:items-center rme:gap-2 rme:rounded-md rme:border rme:border-line rme:bg-panel rme:px-1.5 rme:text-[11px] rme:text-ink rme:transition-colors',
            'rme:hover:bg-hover',
            'rme:focus-visible:outline-none rme:focus-visible:ring-2 rme:focus-visible:ring-ring/50',
            compact ? 'rme:w-full rme:justify-center rme:px-0' : 'rme:w-full',
            className,
          )}
        >
          <span
            className="rme:h-4 rme:w-4 rme:shrink-0 rme:rounded rme:border rme:border-line"
            style={swatchStyle}
          />
          {compact ? null : (
            <span className="rme:truncate rme:tabular-nums rme:text-subtle">
              {transparent ? 'Transparent' : value.toLowerCase()}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="rme:w-56 rme:space-y-2">
        <input
          type="color"
          aria-label="Color picker"
          value={toLongHex(transparent ? '#ffffff' : value)}
          onChange={(e) => onChange(e.target.value)}
          className="rme:block rme:h-8 rme:w-full rme:cursor-pointer rme:rounded-md rme:border rme:border-line rme:bg-panel rme:p-0"
        />

        <Input
          value={draft}
          spellCheck={false}
          placeholder="#000000"
          onChange={(e) => {
            const next = e.target.value
            setDraft(next)
            const withHash = next.startsWith('#') ? next : `#${next}`
            if (HEX_RE.test(withHash)) onChange(withHash.toLowerCase())
          }}
          className="rme:font-mono rme:text-[11px]"
        />

        <div className="rme:grid rme:grid-cols-7 rme:gap-1">
          {PRESETS.map((c) => {
            const selected = !transparent && value.toLowerCase() === c
            return (
              <button
                key={c}
                type="button"
                title={c}
                aria-label={c}
                onClick={() => onChange(c)}
                className="rme:flex rme:h-5 rme:w-5 rme:items-center rme:justify-center rme:rounded rme:border rme:border-line rme:transition-transform rme:hover:scale-110"
                style={{ backgroundColor: c }}
              >
                {selected ? (
                  <Check
                    className={cn(
                      'rme:h-3 rme:w-3',
                      isLight(c) ? 'rme:text-ink' : 'rme:text-white',
                    )}
                  />
                ) : null}
              </button>
            )
          })}
        </div>

        {allowTransparent ? (
          <button
            type="button"
            onClick={() => onChange('transparent')}
            className={cn(
              'rme:flex rme:h-7 rme:w-full rme:items-center rme:gap-2 rme:rounded-md rme:border rme:border-line rme:px-2 rme:text-[11px] rme:text-subtle rme:transition-colors',
              'rme:hover:bg-hover',
              transparent && 'rme:border-brand rme:text-brand',
            )}
          >
            <span
              className="rme:h-3.5 rme:w-3.5 rme:rounded rme:border rme:border-line"
              style={CHECKER_STYLE}
            />
            Transparent
          </button>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
