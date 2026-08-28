import * as React from 'react'
import { forwardRef } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Radix's Dialog Root is a context-only component and accepts no ref.
export function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

export const DialogTrigger = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>
>(function DialogTrigger({ ...props }, ref) {
  return <DialogPrimitive.Trigger ref={ref} data-slot="dialog-trigger" {...props} />
})
DialogTrigger.displayName = 'DialogTrigger'

export const DialogClose = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>(function DialogClose({ ...props }, ref) {
  return <DialogPrimitive.Close ref={ref} data-slot="dialog-close" {...props} />
})
DialogClose.displayName = 'DialogClose'

export const DialogOverlay = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function DialogOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      data-slot="dialog-overlay"
      className={cn(
        'rme-portal',
        'rme:fixed rme:inset-0 rme:z-[9998] rme:bg-black/50',
        'rme:transition-opacity rme:duration-150 rme:data-[state=closed]:opacity-0',
        className,
      )}
      {...props}
    />
  )
})
DialogOverlay.displayName = 'DialogOverlay'

export type DialogContentProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> & {
  /** Preferred dialog width (any CSS length). Defaults to 42rem. */
  width?: string
  /** Set to false to hide the built-in close button. */
  showCloseButton?: boolean
}

export const DialogContent = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(function DialogContent(
  { className, children, width, showCloseButton = true, style, ...props },
  ref,
) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        data-slot="dialog-content"
        style={width ? ({ ...style, '--rme-dialog-w': width } as React.CSSProperties) : style}
        className={cn(
          'rme-portal',
          'rme:fixed rme:left-1/2 rme:top-1/2 rme:z-[9999] rme:-translate-x-1/2 rme:-translate-y-1/2 rme:flex rme:max-h-[88vh] rme:w-[min(94vw,var(--rme-dialog-w,42rem))] rme:flex-col rme:rounded-xl rme:border rme:border-line rme:bg-panel rme:text-ink rme:shadow-2xl',
          'rme:outline-none rme:transition-opacity rme:duration-150 rme:data-[state=closed]:opacity-0',
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close
            data-slot="dialog-close-button"
            className={cn(
              'rme:absolute rme:right-3 rme:top-3 rme:inline-flex rme:h-7 rme:w-7 rme:items-center rme:justify-center rme:rounded-md rme:text-subtle rme:transition-colors',
              'rme:hover:bg-hover rme:hover:text-ink',
              'rme:focus-visible:outline-none rme:focus-visible:ring-2 rme:focus-visible:ring-ring/50',
              'rme:disabled:pointer-events-none',
            )}
          >
            <X className="rme:size-4" />
            <span className="rme:sr-only">Close</span>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
})
DialogContent.displayName = 'DialogContent'

export const DialogHeader = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(function DialogHeader({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="dialog-header"
      className={cn(
        'rme:flex rme:flex-col rme:gap-1 rme:border-b rme:border-line rme:px-5 rme:py-3.5',
        className,
      )}
      {...props}
    />
  )
})
DialogHeader.displayName = 'DialogHeader'

export const DialogFooter = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(function DialogFooter({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="dialog-footer"
      className={cn(
        'rme:flex rme:items-center rme:justify-end rme:gap-2 rme:border-t rme:border-line rme:px-5 rme:py-3',
        className,
      )}
      {...props}
    />
  )
})
DialogFooter.displayName = 'DialogFooter'

export const DialogTitle = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function DialogTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      data-slot="dialog-title"
      className={cn('rme:text-sm rme:font-semibold rme:text-ink', className)}
      {...props}
    />
  )
})
DialogTitle.displayName = 'DialogTitle'

export const DialogDescription = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      data-slot="dialog-description"
      className={cn('rme:text-xs rme:text-subtle', className)}
      {...props}
    />
  )
})
DialogDescription.displayName = 'DialogDescription'
