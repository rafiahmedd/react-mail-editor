import * as React from 'react'
import { forwardRef } from 'react'
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import { cn } from '@/lib/utils'

export const ToggleGroup = forwardRef<
  React.ComponentRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>
>(function ToggleGroup({ className, ...props }, ref) {
  return (
    <ToggleGroupPrimitive.Root
      ref={ref}
      data-slot="toggle-group"
      className={cn(
        'rme:inline-flex rme:rounded-md rme:border rme:border-line rme:bg-panel rme:p-0.5 rme:gap-0.5',
        className,
      )}
      {...props}
    />
  )
})
ToggleGroup.displayName = 'ToggleGroup'

export const ToggleGroupItem = forwardRef<
  React.ComponentRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(function ToggleGroupItem({ className, ...props }, ref) {
  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      data-slot="toggle-group-item"
      className={cn(
        'rme:inline-flex rme:h-6 rme:min-w-6 rme:items-center rme:justify-center rme:px-1.5 rme:rounded rme:text-xs rme:text-subtle rme:transition-colors',
        'rme:hover:bg-hover',
        'rme:focus-visible:outline-none rme:focus-visible:ring-2 rme:focus-visible:ring-ring/50',
        'rme:disabled:pointer-events-none rme:disabled:opacity-50',
        'rme:data-[state=on]:bg-brand rme:data-[state=on]:text-on-brand',
        'rme:[&_svg]:size-3.5 rme:[&_svg]:shrink-0',
        className,
      )}
      {...props}
    />
  )
})
ToggleGroupItem.displayName = 'ToggleGroupItem'
