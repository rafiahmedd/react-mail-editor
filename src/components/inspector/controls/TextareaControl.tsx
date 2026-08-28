import { Textarea } from '@/ui/textarea'
import { cn } from '@/lib/utils'

export interface TextareaControlProps {
  value: string
  onChange: (next: string) => void
  rows?: number
  /** Render in a monospaced face — used for raw HTML/CSS fields. */
  mono?: boolean
  placeholder?: string
  className?: string
}

export function TextareaControl({
  value,
  onChange,
  rows = 4,
  mono,
  placeholder,
  className,
}: TextareaControlProps) {
  return (
    <Textarea
      rows={rows}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(mono && 'rme:font-mono rme:text-[11px]', className)}
    />
  )
}
