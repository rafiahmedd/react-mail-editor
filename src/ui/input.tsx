import * as React from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Input = forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<'input'>>(
  function Input({ className, type, ...props }, ref) {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          'rme:h-8 rme:w-full rme:rounded-md rme:border rme:border-line rme:bg-panel rme:px-2.5 rme:text-xs rme:text-ink rme:transition-colors',
          'rme:placeholder:text-faint',
          'rme:focus-visible:outline-none rme:focus-visible:ring-2 rme:focus-visible:ring-ring/50',
          'rme:disabled:cursor-not-allowed rme:disabled:opacity-50',
          'rme:file:border-0 rme:file:bg-transparent rme:file:text-xs rme:file:font-medium rme:file:text-ink',
          className,
        )}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'
