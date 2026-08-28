import { Slider } from '@/ui/slider'
import { cn } from '@/lib/utils'

export interface SliderControlProps {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  className?: string
}

export function SliderControl({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  className,
}: SliderControlProps) {
  const safe = Number.isFinite(value) ? value : min
  return (
    <div className={cn('rme:flex rme:items-center rme:gap-2', className)}>
      <Slider
        value={[safe]}
        min={min}
        max={max}
        step={step}
        onValueChange={(next) => {
          const n = next[0]
          if (typeof n === 'number' && n !== value) onChange(n)
        }}
        className="rme:flex-1"
      />
      <span className="rme:w-11 rme:text-right rme:text-[11px] rme:tabular-nums rme:text-subtle">
        {`${safe}${unit}`}
      </span>
    </div>
  )
}
