import type { BorderValue } from '@/types/schema'
import type { SelectOption } from '@/types/inspector'
import { NumberControl } from './NumberControl'
import { SelectControl } from './SelectControl'
import { ColorControl } from './ColorControl'
import { cn } from '@/lib/utils'

export interface BorderControlProps {
  value: BorderValue
  onChange: (next: BorderValue) => void
  className?: string
}

const STYLES: SelectOption[] = [
  { label: 'Solid', value: 'solid' },
  { label: 'Dashed', value: 'dashed' },
  { label: 'Dotted', value: 'dotted' },
  { label: 'Double', value: 'double' },
]

const EMPTY_BORDER: BorderValue = { width: 0, style: 'solid', color: '#e2e8f0' }

export function BorderControl({ value, onChange, className }: BorderControlProps) {
  const border: BorderValue = value ?? EMPTY_BORDER

  return (
    <div className={cn('rme:grid rme:grid-cols-[56px_1fr_28px] rme:gap-1.5', className)}>
      <NumberControl
        value={border.width ?? 0}
        min={0}
        max={40}
        unit=""
        onChange={(width) => onChange({ ...border, width })}
      />
      <SelectControl
        value={border.style ?? 'solid'}
        options={STYLES}
        onChange={(style) => onChange({ ...border, style: style as BorderValue['style'] })}
      />
      <ColorControl
        compact
        value={border.color ?? '#e2e8f0'}
        onChange={(color) => onChange({ ...border, color })}
      />
    </div>
  )
}
