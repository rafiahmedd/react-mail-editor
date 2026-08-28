import { Switch } from '@/ui/switch'
import { cn } from '@/lib/utils'

export interface ToggleControlProps {
  value: boolean
  onChange: (next: boolean) => void
  className?: string
}

export function ToggleControl({ value, onChange, className }: ToggleControlProps) {
  return (
    <div className={cn('rme:flex rme:items-center', className)}>
      <Switch checked={Boolean(value)} onCheckedChange={(next) => onChange(next)} />
    </div>
  )
}
