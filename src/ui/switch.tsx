import * as React from 'react'
import { forwardRef } from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

export const Switch = forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(function Switch({ className, ...props }, ref) {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      data-slot="switch"
      className={cn(
        'rme:inline-flex rme:h-[18px] rme:w-8 rme:shrink-0 rme:cursor-pointer rme:items-center rme:rounded-full rme:border rme:border-transparent rme:transition-colors',
        'rme:focus-visible:outline-none rme:focus-visible:ring-2 rme:focus-visible:ring-ring/50',
        'rme:disabled:cursor-not-allowed rme:disabled:opacity-50',
        'rme:data-[state=checked]:bg-brand rme:data-[state=unchecked]:bg-active',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'rme:pointer-events-none rme:block rme:h-3.5 rme:w-3.5 rme:rounded-full rme:bg-white rme:shadow rme:transition-transform',
          'rme:data-[state=checked]:translate-x-[15px] rme:data-[state=unchecked]:translate-x-[2px]',
        )}
      />
    </SwitchPrimitive.Root>
  )
})
Switch.displayName = 'Switch'
