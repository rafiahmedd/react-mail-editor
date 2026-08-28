import * as React from 'react'
import { forwardRef } from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Accordion = forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>(function Accordion({ ...props }, ref) {
  return <AccordionPrimitive.Root ref={ref} data-slot="accordion" {...props} />
})
Accordion.displayName = 'Accordion'

export const AccordionItem = forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(function AccordionItem({ className, ...props }, ref) {
  return (
    <AccordionPrimitive.Item
      ref={ref}
      data-slot="accordion-item"
      className={cn('rme:border-b rme:border-line', className)}
      {...props}
    />
  )
})
AccordionItem.displayName = 'AccordionItem'

export const AccordionTrigger = forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(function AccordionTrigger({ className, children, ...props }, ref) {
  return (
    <AccordionPrimitive.Header className="rme:flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        data-slot="accordion-trigger"
        className={cn(
          'rme:flex rme:w-full rme:flex-1 rme:items-center rme:justify-between rme:gap-2 rme:px-4 rme:py-2.5 rme:text-xs rme:font-semibold rme:uppercase rme:tracking-wide rme:text-subtle rme:transition-colors',
          'rme:hover:bg-hover',
          'rme:focus-visible:outline-none rme:focus-visible:ring-2 rme:focus-visible:ring-ring/50',
          'rme:disabled:pointer-events-none rme:disabled:opacity-50',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown className="rme:size-4 rme:shrink-0 rme:text-faint rme:transition-transform rme:duration-150 rme:data-[state=open]:rotate-180" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
})
AccordionTrigger.displayName = 'AccordionTrigger'

export const AccordionContent = forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(function AccordionContent({ className, children, ...props }, ref) {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      data-slot="accordion-content"
      className={cn('rme:overflow-hidden rme:text-xs rme:text-ink', className)}
      {...props}
    >
      <div className="rme:px-4 rme:pb-3 rme:pt-1">{children}</div>
    </AccordionPrimitive.Content>
  )
})
AccordionContent.displayName = 'AccordionContent'
