import type { ReactNode } from 'react'
import type { BgImage } from '@/types/schema'
import type { SelectOption } from '@/types/inspector'
import { ImageControl } from './ImageControl'
import { SelectControl } from './SelectControl'
import { cn } from '@/lib/utils'

export interface BackgroundControlProps {
  value: BgImage
  onChange: (next: BgImage) => void
  upload: (file: File) => Promise<string>
  className?: string
}

const EMPTY_BG: BgImage = {
  url: '',
  repeat: 'no-repeat',
  size: 'cover',
  position: 'center center',
}

const REPEATS: SelectOption[] = [
  { label: 'No repeat', value: 'no-repeat' },
  { label: 'Repeat', value: 'repeat' },
  { label: 'Repeat X', value: 'repeat-x' },
  { label: 'Repeat Y', value: 'repeat-y' },
]

const SIZES: SelectOption[] = [
  { label: 'Auto', value: 'auto' },
  { label: 'Cover', value: 'cover' },
  { label: 'Contain', value: 'contain' },
]

const POSITIONS: SelectOption[] = [
  { label: 'Left top', value: 'left top' },
  { label: 'Center top', value: 'center top' },
  { label: 'Right top', value: 'right top' },
  { label: 'Left center', value: 'left center' },
  { label: 'Center center', value: 'center center' },
  { label: 'Right center', value: 'right center' },
  { label: 'Left bottom', value: 'left bottom' },
  { label: 'Center bottom', value: 'center bottom' },
  { label: 'Right bottom', value: 'right bottom' },
]

function Sub({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rme:grid rme:grid-cols-[88px_1fr] rme:items-center rme:gap-2">
      <span className="rme:text-[11px] rme:font-medium rme:leading-tight rme:text-subtle">
        {label}
      </span>
      <div className="rme:min-w-0">{children}</div>
    </div>
  )
}

export function BackgroundControl({
  value,
  onChange,
  upload,
  className,
}: BackgroundControlProps) {
  const bg: BgImage = value ?? EMPTY_BG

  return (
    <div className={cn('rme:space-y-1.5', className)}>
      <ImageControl
        value={bg.url ?? ''}
        upload={upload}
        onChange={(url) => onChange({ ...bg, url })}
      />

      {bg.url ? (
        <div className="rme:space-y-1.5 rme:pt-0.5">
          <Sub label="Repeat">
            <SelectControl
              value={bg.repeat ?? 'no-repeat'}
              options={REPEATS}
              onChange={(repeat) => onChange({ ...bg, repeat: repeat as BgImage['repeat'] })}
            />
          </Sub>
          <Sub label="Size">
            <SelectControl
              value={bg.size ?? 'cover'}
              options={SIZES}
              onChange={(size) => onChange({ ...bg, size: size as BgImage['size'] })}
            />
          </Sub>
          <Sub label="Position">
            <SelectControl
              value={bg.position ?? 'center center'}
              options={POSITIONS}
              onChange={(position) => onChange({ ...bg, position: String(position) })}
            />
          </Sub>
        </div>
      ) : null}
    </div>
  )
}
