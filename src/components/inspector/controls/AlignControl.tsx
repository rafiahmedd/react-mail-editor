import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
} from 'lucide-react'
import type { TextAlign, VerticalAlign } from '@/types/schema'
import { ToggleGroup, ToggleGroupItem } from '@/ui/toggle-group'
import { cn } from '@/lib/utils'

export interface AlignControlProps {
  value: string
  onChange: (next: string) => void
  /** Switch to top/middle/bottom instead of left/center/right. */
  vertical?: boolean
  className?: string
}

type Item = { value: TextAlign | VerticalAlign; label: string; Icon: typeof AlignLeft }

const HORIZONTAL: Item[] = [
  { value: 'left', label: 'Left', Icon: AlignLeft },
  { value: 'center', label: 'Center', Icon: AlignCenter },
  { value: 'right', label: 'Right', Icon: AlignRight },
]

const VERTICAL: Item[] = [
  { value: 'top', label: 'Top', Icon: ArrowUp },
  { value: 'middle', label: 'Middle', Icon: AlignJustify },
  { value: 'bottom', label: 'Bottom', Icon: ArrowDown },
]

export function AlignControl({ value, onChange, vertical, className }: AlignControlProps) {
  const items = vertical ? VERTICAL : HORIZONTAL
  return (
    <ToggleGroup
      type="single"
      value={value ?? ''}
      onValueChange={(next) => {
        if (next) onChange(next)
      }}
      className={cn('rme:flex rme:w-full', className)}
    >
      {items.map(({ value: v, label, Icon }) => (
        <ToggleGroupItem key={v} value={v} title={label} aria-label={label} className="rme:flex-1">
          <Icon />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
