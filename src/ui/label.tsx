import * as React from 'react'
import { forwardRef } from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/lib/utils'

export const Label = forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(function Label({ className, ...props }, ref) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      data-slot="label"
      className={cn(
        'rme:text-xs rme:font-medium rme:text-subtle rme:leading-none rme:select-none',
        'rme:peer-disabled:cursor-not-allowed rme:peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
})
Label.displayName = 'Label'
