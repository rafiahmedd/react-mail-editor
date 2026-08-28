import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Textarea } from '@/ui/textarea'
import { cn } from '@/lib/utils'

export interface RichTextControlProps {
  value: string
  onChange: (next: string) => void
  className?: string
}

/**
 * Rich text is authored inline on the canvas (see `components/rte/RichText`);
 * the inspector only offers a raw-HTML escape hatch.
 */
export function RichTextControl({ value, onChange, className }: RichTextControlProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className={cn('rme:space-y-1.5', className)}>
      <p className="rme:text-[11px] rme:text-subtle">
        Double-click the block on the canvas to edit the text inline.
      </p>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rme:flex rme:items-center rme:gap-1 rme:text-[10px] rme:text-faint rme:transition-colors rme:hover:text-ink"
      >
        <ChevronDown
          className={cn('rme:h-3 rme:w-3 rme:transition-transform', open && 'rme:rotate-180')}
        />
        Edit HTML
      </button>

      {open ? (
        <Textarea
          rows={6}
          spellCheck={false}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="rme:font-mono rme:text-[11px]"
        />
      ) : null}
    </div>
  )
}
