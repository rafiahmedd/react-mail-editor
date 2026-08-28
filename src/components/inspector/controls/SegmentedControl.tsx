import type { SelectOption } from '@/types/inspector'
import { ToggleGroup, ToggleGroupItem } from '@/ui/toggle-group'
import { cn } from '@/lib/utils'

export interface SegmentedControlProps {
  value: string | number
  onChange: (next: string | number) => void
  options: SelectOption[]
  className?: string
}

export function SegmentedControl({
  value,
  onChange,
  options,
  className,
}: SegmentedControlProps) {
  return (
    <ToggleGroup
      type="single"
      value={String(value ?? '')}
      onValueChange={(next) => {
        if (!next) return
        const opt = options.find((o) => String(o.value) === next)
        onChange(opt ? opt.value : next)
      }}
      className={cn('rme:flex rme:w-full', className)}
    >
      {options.map((o) => (
        <ToggleGroupItem
          key={String(o.value)}
          value={String(o.value)}
          title={o.label}
          className="rme:flex-1 rme:truncate rme:text-[11px]"
        >
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
