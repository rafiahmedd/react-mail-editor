import type { SelectOption } from '@/types/inspector'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'

export interface SelectControlProps {
  value: string | number
  onChange: (next: string | number) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
}

/** Radix rejects an empty item value, so empty strings ride a sentinel. */
const EMPTY = '__rme_empty__'

const encode = (v: string | number): string => (v === '' ? EMPTY : String(v))

export function SelectControl({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  className,
}: SelectControlProps) {
  const current = options.find((o) => encode(o.value) === encode(value))

  return (
    <Select
      value={current ? encode(current.value) : undefined}
      onValueChange={(next) => {
        const opt = options.find((o) => encode(o.value) === next)
        /* Coerce back to the option's original type (string | number). */
        onChange(opt ? opt.value : next === EMPTY ? '' : next)
      }}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={encode(o.value)} value={encode(o.value)}>
            <span className="rme:flex rme:items-center rme:gap-1.5">
              {o.hint ? (
                <span
                  className="rme:h-2.5 rme:w-2.5 rme:shrink-0 rme:rounded-full rme:border rme:border-line"
                  style={{ backgroundColor: o.hint }}
                />
              ) : null}
              <span className="rme:truncate">{o.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
