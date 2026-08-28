import { Link2 } from 'lucide-react'
import { Input } from '@/ui/input'
import { cn } from '@/lib/utils'

export interface LinkControlProps {
  value: string
  onChange: (next: string) => void
  placeholder?: string
  className?: string
}

/** Anything without a scheme, an anchor, a root path or a merge tag is suspect. */
function looksBroken(raw: string): boolean {
  const v = raw.trim()
  if (!v) return false
  if (v.startsWith('#') || v.startsWith('/') || v.startsWith('{{')) return false
  return !v.includes(':')
}

export function LinkControl({
  value,
  onChange,
  placeholder = 'https://example.com',
  className,
}: LinkControlProps) {
  const warn = looksBroken(value ?? '')

  return (
    <div className={cn('rme:min-w-0', className)}>
      <div className="rme:relative">
        <Link2 className="rme:pointer-events-none rme:absolute rme:left-2 rme:top-1/2 rme:h-3.5 rme:w-3.5 rme:-translate-y-1/2 rme:text-faint" />
        <Input
          type="text"
          value={value ?? ''}
          spellCheck={false}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="rme:pl-7"
        />
      </div>
      {warn ? (
        <p className="rme:mt-1 rme:text-[10px] rme:text-danger">
          Missing a scheme — try https://
        </p>
      ) : null}
    </div>
  )
}
