import * as React from 'react'
import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'rme:inline-flex rme:items-center rme:justify-center rme:gap-1.5 rme:rounded-md rme:font-medium rme:transition-colors rme:disabled:pointer-events-none rme:disabled:opacity-50 rme:shrink-0 rme:[&_svg]:size-4 rme:[&_svg]:shrink-0 rme:focus-visible:outline-none rme:focus-visible:ring-2 rme:focus-visible:ring-ring/50',
  {
    variants: {
      variant: {
        default: 'rme:bg-brand rme:text-on-brand rme:hover:bg-brand/90',
        secondary: 'rme:bg-active rme:text-ink rme:hover:bg-active/70',
        outline:
          'rme:border rme:border-line rme:bg-transparent rme:text-ink rme:hover:bg-hover',
        ghost: 'rme:bg-transparent rme:text-ink rme:hover:bg-hover',
        danger: 'rme:bg-danger rme:text-white rme:hover:bg-danger/90',
        link: 'rme:bg-transparent rme:text-brand rme:underline-offset-4 rme:hover:underline',
      },
      size: {
        sm: 'rme:h-7 rme:px-2 rme:text-xs',
        default: 'rme:h-8 rme:px-3 rme:text-xs',
        lg: 'rme:h-9 rme:px-4 rme:text-sm',
        icon: 'rme:h-8 rme:w-8 rme:p-0',
        iconSm: 'rme:h-7 rme:w-7 rme:p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ButtonProps = React.ComponentPropsWithoutRef<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
})
Button.displayName = 'Button'
