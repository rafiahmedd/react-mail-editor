import * as React from 'react'
import { forwardRef } from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'

export const Slider = forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(function Slider({ className, defaultValue, value, min = 0, max = 100, ...props }, ref) {
  const thumbCount = React.useMemo(() => {
    if (Array.isArray(value)) return value.length
    if (Array.isArray(defaultValue)) return defaultValue.length
    return 1
  }, [value, defaultValue])

  return (
    <SliderPrimitive.Root
      ref={ref}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'rme:relative rme:flex rme:w-full rme:touch-none rme:select-none rme:items-center',
        'rme:data-[disabled]:opacity-50',
        'rme:data-[orientation=vertical]:h-full rme:data-[orientation=vertical]:w-auto rme:data-[orientation=vertical]:flex-col',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          'rme:relative rme:grow rme:overflow-hidden rme:rounded-full rme:bg-active',
          'rme:data-[orientation=horizontal]:h-1 rme:data-[orientation=horizontal]:w-full',
          'rme:data-[orientation=vertical]:w-1 rme:data-[orientation=vertical]:h-full',
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            'rme:absolute rme:bg-brand',
            'rme:data-[orientation=horizontal]:h-full',
            'rme:data-[orientation=vertical]:w-full',
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }, (_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          data-slot="slider-thumb"
          className={cn(
            'rme:block rme:h-3.5 rme:w-3.5 rme:rounded-full rme:border-2 rme:border-brand rme:bg-panel rme:shadow rme:transition-colors',
            'rme:focus-visible:outline-none rme:focus-visible:ring-2 rme:focus-visible:ring-ring/50',
            'rme:disabled:pointer-events-none',
          )}
        />
      ))}
    </SliderPrimitive.Root>
  )
})
Slider.displayName = 'Slider'
