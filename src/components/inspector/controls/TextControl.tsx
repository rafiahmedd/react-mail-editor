import { Input } from '@/ui/input'

export interface TextControlProps {
  value: string
  onChange: (next: string) => void
  placeholder?: string
  className?: string
}

export function TextControl({ value, onChange, placeholder, className }: TextControlProps) {
  return (
    <Input
      type="text"
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    />
  )
}
