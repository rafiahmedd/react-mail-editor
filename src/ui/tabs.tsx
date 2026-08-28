import * as React from 'react'
import { forwardRef } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

export const Tabs = forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(function Tabs({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Root
      ref={ref}
      data-slot="tabs"
      className={cn('rme:flex rme:flex-col rme:gap-2', className)}
      {...props}
    />
  )
})
Tabs.displayName = 'Tabs'

export const TabsList = forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function TabsList({ className, ...props }, ref) {
  return (
    <TabsPrimitive.List
      ref={ref}
      data-slot="tabs-list"
      className={cn(
        'rme:inline-flex rme:h-8 rme:items-center rme:gap-0.5 rme:rounded-lg rme:bg-active/60 rme:p-0.5',
        className,
      )}
      {...props}
    />
  )
})
TabsList.displayName = 'TabsList'

export const TabsTrigger = forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      data-slot="tabs-trigger"
      className={cn(
        'rme:inline-flex rme:h-7 rme:items-center rme:justify-center rme:gap-1.5 rme:whitespace-nowrap rme:rounded-md rme:px-2.5 rme:text-xs rme:font-medium rme:text-subtle rme:transition-colors',
        'rme:hover:text-ink',
        'rme:focus-visible:outline-none rme:focus-visible:ring-2 rme:focus-visible:ring-ring/50',
        'rme:disabled:pointer-events-none rme:disabled:opacity-50',
        'rme:data-[state=active]:bg-panel rme:data-[state=active]:text-ink rme:data-[state=active]:shadow-sm',
        'rme:[&_svg]:size-4 rme:[&_svg]:shrink-0',
        className,
      )}
      {...props}
    />
  )
})
TabsTrigger.displayName = 'TabsTrigger'

export const TabsContent = forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(function TabsContent({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      data-slot="tabs-content"
      className={cn('rme:flex-1 rme:outline-none', className)}
      {...props}
    />
  )
})
TabsContent.displayName = 'TabsContent'
