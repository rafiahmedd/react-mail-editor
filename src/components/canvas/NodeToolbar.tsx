import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function NodeToolbar({
  side = 'top-left',
  tone = 'brand',
  children,
}: {
  side?: 'top-left' | 'top-right' | 'bottom-right'
  tone?: 'brand' | 'muted'
  children: ReactNode
}) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className={cn(
        'rme:absolute rme:z-30 rme:flex rme:items-center rme:gap-px rme:rounded-md rme:px-0.5 rme:py-0.5 rme:shadow-md',
        tone === 'brand'
          ? 'rme:bg-brand rme:text-on-brand'
          : 'rme:bg-panel rme:text-subtle rme:border rme:border-line',
        side === 'top-left' && 'rme:-top-3 rme:left-1',
        side === 'top-right' && 'rme:-top-3 rme:right-1',
        side === 'bottom-right' && 'rme:-bottom-3 rme:right-1',
      )}
    >
      {children}
    </div>
  )
}

export function NodeButton({
  icon: Icon,
  title,
  onClick,
  disabled,
  tone = 'brand',
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  onClick?: (e: React.MouseEvent) => void
  disabled?: boolean
  tone?: 'brand' | 'muted'
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'rme:flex rme:h-5 rme:w-5 rme:items-center rme:justify-center rme:rounded rme:transition-colors rme:disabled:opacity-40',
        tone === 'brand'
          ? 'rme:hover:bg-white/25'
          : 'rme:hover:bg-hover rme:hover:text-ink',
      )}
    >
      <Icon className="rme:h-3.5 rme:w-3.5" />
    </button>
  )
}

export function NodeLabel({ children }: { children: ReactNode }) {
  return (
    <span className="rme:px-1 rme:text-[10px] rme:font-semibold rme:uppercase rme:tracking-wide">
      {children}
    </span>
  )
}
