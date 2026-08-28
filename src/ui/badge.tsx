import * as React from 'react'
import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const badgeVariants = cva(
  'rme:inline-flex rme:items-center rme:rounded rme:px-1.5 rme:py-0.5 rme:text-[10px] rme:font-semibold rme:uppercase rme:tracking-wide',
  {
    variants: {
      variant: {
        default: 'rme:bg-brand-soft rme:text-brand',
        outline: 'rme:border rme:border-line rme:text-subtle',
        muted: 'rme:bg-active rme:text-subtle',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type BadgeProps = React.ComponentPropsWithoutRef<'span'> &
  VariantProps<typeof badgeVariants>

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
})
Badge.displayName = 'Badge'
