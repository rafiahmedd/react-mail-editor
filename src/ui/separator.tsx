import * as React from 'react'
import { forwardRef } from 'react'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import { cn } from '@/lib/utils'

export const Separator = forwardRef<
  React.ComponentRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(function Separator(
  { className, orientation = 'horizontal', decorative = true, ...props },
  ref,
) {
  return (
    <SeparatorPrimitive.Root
      ref={ref}
      data-slot="separator"
      orientation={orientation}
      decorative={decorative}
      className={cn(
        'rme:shrink-0 rme:bg-line',
        orientation === 'horizontal' ? 'rme:h-px rme:w-full' : 'rme:w-px rme:h-full',
        className,
      )}
      {...props}
    />
  )
})
Separator.displayName = 'Separator'
