import * as React from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.ComponentPropsWithoutRef<'textarea'>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        'rme:min-h-[70px] rme:w-full rme:resize-y rme:rounded-md rme:border rme:border-line rme:bg-panel rme:px-2.5 rme:py-1.5 rme:text-xs rme:text-ink rme:transition-colors',
        'rme:placeholder:text-faint',
        'rme:focus-visible:outline-none rme:focus-visible:ring-2 rme:focus-visible:ring-ring/50',
        'rme:disabled:cursor-not-allowed rme:disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'
