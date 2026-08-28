import * as React from 'react'
import { forwardRef } from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

// Radix's DropdownMenu Root is a context-only component and accepts no ref.
export function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

export const DropdownMenuTrigger = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
>(function DropdownMenuTrigger({ ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Trigger ref={ref} data-slot="dropdown-menu-trigger" {...props} />
  )
})
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger'

export const DropdownMenuContent = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(function DropdownMenuContent({ className, sideOffset = 4, align = 'start', ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        align={align}
        className={cn(
          'rme-portal',
          'rme:z-[10000] rme:min-w-[8rem] rme:overflow-hidden rme:rounded-md rme:border rme:border-line rme:bg-panel rme:p-1 rme:text-ink rme:shadow-lg',
          'rme:outline-none rme:transition-opacity rme:duration-150 rme:data-[state=closed]:opacity-0',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
})
DropdownMenuContent.displayName = 'DropdownMenuContent'

export const DropdownMenuItem = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & { inset?: boolean }
>(function DropdownMenuItem({ className, inset, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      data-slot="dropdown-menu-item"
      className={cn(
        'rme:relative rme:flex rme:h-7 rme:cursor-default rme:select-none rme:items-center rme:gap-2 rme:rounded rme:px-2 rme:text-xs rme:text-ink rme:outline-none rme:transition-colors',
        'rme:focus:bg-hover rme:data-[highlighted]:bg-hover',
        'rme:data-[disabled]:pointer-events-none rme:data-[disabled]:opacity-50',
        'rme:[&_svg]:size-4 rme:[&_svg]:shrink-0',
        inset && 'rme:pl-7',
        className,
      )}
      {...props}
    />
  )
})
DropdownMenuItem.displayName = 'DropdownMenuItem'

export const DropdownMenuCheckboxItem = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(function DropdownMenuCheckboxItem({ className, children, checked, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      data-slot="dropdown-menu-checkbox-item"
      checked={checked}
      className={cn(
        'rme:relative rme:flex rme:h-7 rme:cursor-default rme:select-none rme:items-center rme:gap-2 rme:rounded rme:py-1 rme:pl-7 rme:pr-2 rme:text-xs rme:text-ink rme:outline-none rme:transition-colors',
        'rme:focus:bg-hover rme:data-[highlighted]:bg-hover',
        'rme:data-[disabled]:pointer-events-none rme:data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <span className="rme:absolute rme:left-2 rme:flex rme:size-3.5 rme:items-center rme:justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check className="rme:size-3.5 rme:text-brand" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
})
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem'

export const DropdownMenuLabel = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }
>(function DropdownMenuLabel({ className, inset, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      data-slot="dropdown-menu-label"
      className={cn(
        'rme:px-2 rme:py-1.5 rme:text-[10px] rme:font-semibold rme:uppercase rme:tracking-wide rme:text-faint',
        inset && 'rme:pl-7',
        className,
      )}
      {...props}
    />
  )
})
DropdownMenuLabel.displayName = 'DropdownMenuLabel'

export const DropdownMenuSeparator = forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(function DropdownMenuSeparator({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      data-slot="dropdown-menu-separator"
      className={cn('rme:-mx-1 rme:my-1 rme:h-px rme:bg-line', className)}
      {...props}
    />
  )
})
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'
