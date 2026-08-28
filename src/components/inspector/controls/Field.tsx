import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface FieldProps {
  label?: string
  /** Helper text rendered under the control. */
  help?: string
  /** Stack the label above a full-width control. */
  wide?: boolean
  /** Node pinned to the right of the label (mobile-override toggle, etc.). */
  action?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * The row primitive every inspector control sits in: an 88px label column and
 * a flexible control column, or a stacked full-width layout when `wide`.
 */
export function Field({ label, help, wide, action, children, className }: FieldProps) {
  const labelNode =
    label || action ? (
      <div className="rme:flex rme:min-w-0 rme:items-center rme:gap-1">
        {label ? (
          <span className="rme:truncate rme:text-[11px] rme:font-medium rme:leading-tight rme:text-subtle">
            {label}
          </span>
        ) : null}
        {action ? (
          <span className="rme:ml-auto rme:flex rme:shrink-0 rme:items-center">{action}</span>
        ) : null}
      </div>
    ) : null

  if (wide || !label) {
    return (
      <div className={cn('rme:py-1.5', className)}>
        {labelNode ? <div className="rme:mb-1.5">{labelNode}</div> : null}
        <div className="rme:w-full rme:min-w-0">{children}</div>
        {help ? <p className="rme:mt-1 rme:text-[10px] rme:text-faint">{help}</p> : null}
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="rme:grid rme:grid-cols-[88px_1fr] rme:items-center rme:gap-2 rme:py-1.5">
        {labelNode}
        <div className="rme:min-w-0">{children}</div>
      </div>
      {help ? (
        <p className="rme:-mt-1 rme:pb-1.5 rme:pl-[96px] rme:text-[10px] rme:text-faint">{help}</p>
      ) : null}
    </div>
  )
}
