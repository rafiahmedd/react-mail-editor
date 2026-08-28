import * as React from 'react'
import { forwardRef } from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

// Radix's Select Root is a context-only component and accepts no ref.
export function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

export const SelectGroup = forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Group>
>(function SelectGroup({ ...props }, ref) {
  return <SelectPrimitive.Group ref={ref} data-slot="select-group" {...props} />
})
SelectGroup.displayName = 'SelectGroup'

export const SelectValue = forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
>(function SelectValue({ ...props }, ref) {
  return <SelectPrimitive.Value ref={ref} data-slot="select-value" {...props} />
})
SelectValue.displayName = 'SelectValue'

export const SelectTrigger = forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(function SelectTrigger({ className, children, ...props }, ref) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      data-slot="select-trigger"
      className={cn(
        'rme:flex rme:h-8 rme:w-full rme:items-center rme:justify-between rme:gap-1.5 rme:rounded-md rme:border rme:border-line rme:bg-panel rme:px-2.5 rme:text-xs rme:text-ink rme:transition-colors',
        'rme:hover:bg-hover',
        'rme:data-[placeholder]:text-faint',
        'rme:focus-visible:outline-none rme:focus-visible:ring-2 rme:focus-visible:ring-ring/50',
        'rme:disabled:cursor-not-allowed rme:disabled:opacity-50',
        'rme:[&>span]:truncate rme:[&_svg]:size-4 rme:[&_svg]:shrink-0',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="rme:size-4 rme:text-faint" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})
SelectTrigger.displayName = 'SelectTrigger'

export const SelectScrollUpButton = forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(function SelectScrollUpButton({ className, ...props }, ref) {
  return (
    <SelectPrimitive.ScrollUpButton
      ref={ref}
      data-slot="select-scroll-up-button"
      className={cn(
        'rme:flex rme:h-6 rme:cursor-default rme:items-center rme:justify-center rme:text-faint',
        className,
      )}
      {...props}
    >
      <ChevronUp className="rme:size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
})
SelectScrollUpButton.displayName = 'SelectScrollUpButton'

export const SelectScrollDownButton = forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(function SelectScrollDownButton({ className, ...props }, ref) {
  return (
    <SelectPrimitive.ScrollDownButton
      ref={ref}
      data-slot="select-scroll-down-button"
      className={cn(
        'rme:flex rme:h-6 rme:cursor-default rme:items-center rme:justify-center rme:text-faint',
        className,
      )}
      {...props}
    >
      <ChevronDown className="rme:size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
})
SelectScrollDownButton.displayName = 'SelectScrollDownButton'

export const SelectContent = forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(function SelectContent(
  { className, children, position = 'popper', sideOffset = 4, ...props },
  ref,
) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        data-slot="select-content"
        position={position}
        sideOffset={sideOffset}
        className={cn(
          'rme-portal',
          'rme:relative rme:z-[10000] rme:min-w-[8rem] rme:max-h-96 rme:overflow-hidden rme:rounded-md rme:border rme:border-line rme:bg-panel rme:text-ink rme:shadow-lg',
          'rme:data-[state=closed]:opacity-0',
          position === 'popper' &&
            'rme:data-[side=bottom]:translate-y-0 rme:data-[side=top]:-translate-y-0',
          className,
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'rme:p-1',
            position === 'popper' &&
              'rme:h-[var(--radix-select-trigger-height)] rme:w-full rme:min-w-[var(--radix-select-trigger-width)]',
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
})
SelectContent.displayName = 'SelectContent'

export const SelectLabel = forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(function SelectLabel({ className, ...props }, ref) {
  return (
    <SelectPrimitive.Label
      ref={ref}
      data-slot="select-label"
      className={cn(
        'rme:px-2 rme:py-1.5 rme:text-[10px] rme:font-semibold rme:uppercase rme:tracking-wide rme:text-faint',
        className,
      )}
      {...props}
    />
  )
})
SelectLabel.displayName = 'SelectLabel'

export const SelectItem = forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(function SelectItem({ className, children, ...props }, ref) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      data-slot="select-item"
      className={cn(
        'rme:relative rme:flex rme:h-7 rme:w-full rme:cursor-default rme:select-none rme:items-center rme:rounded rme:py-1 rme:pl-2 rme:pr-7 rme:text-xs rme:text-ink rme:outline-none rme:transition-colors',
        'rme:focus:bg-hover rme:data-[highlighted]:bg-hover',
        'rme:data-[disabled]:pointer-events-none rme:data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <span className="rme:absolute rme:right-2 rme:flex rme:size-3.5 rme:items-center rme:justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="rme:size-3.5 rme:text-brand" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  )
})
SelectItem.displayName = 'SelectItem'

export const SelectSeparator = forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(function SelectSeparator({ className, ...props }, ref) {
  return (
    <SelectPrimitive.Separator
      ref={ref}
      data-slot="select-separator"
      className={cn('rme:-mx-1 rme:my-1 rme:h-px rme:bg-line', className)}
      {...props}
    />
  )
})
SelectSeparator.displayName = 'SelectSeparator'
