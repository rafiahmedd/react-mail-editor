import type { FontValue } from '@/types/schema'
import { DEFAULT_FONT, FONTS } from '@/config/fonts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'

export interface FontControlProps {
  value: FontValue
  onChange: (next: FontValue) => void
  className?: string
}

export function FontControl({ value, onChange, className }: FontControlProps) {
  const current = FONTS.find((f) => f.value === value?.value) ?? value ?? DEFAULT_FONT
  const known = FONTS.some((f) => f.value === current.value)

  return (
    <Select
      value={known ? current.value : undefined}
      onValueChange={(next) => {
        const font = FONTS.find((f) => f.value === next)
        if (font) onChange(font)
      }}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="Font">
          <span style={{ fontFamily: current.value }}>{current.label}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {FONTS.map((f) => (
          <SelectItem key={f.value} value={f.value}>
            <span style={{ fontFamily: f.value }}>{f.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
