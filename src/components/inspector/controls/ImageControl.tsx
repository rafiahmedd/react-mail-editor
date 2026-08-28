import { useRef, useState } from 'react'
import { Image as ImageIcon, Trash2, Upload } from 'lucide-react'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { cn } from '@/lib/utils'

export interface ImageControlProps {
  value: string
  onChange: (next: string) => void
  upload: (file: File) => Promise<string>
  className?: string
}

export function ImageControl({ value, onChange, upload, className }: ImageControlProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pick = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    setBusy(true)
    try {
      const url = await upload(file)
      if (url) onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className={cn('rme:space-y-1.5', className)}>
      <div
        className={cn(
          'rme:flex rme:h-20 rme:w-full rme:items-center rme:justify-center rme:overflow-hidden rme:rounded-lg rme:border rme:bg-canvas',
          value ? 'rme:border-line' : 'rme:border-dashed rme:border-line',
        )}
      >
        {value ? (
          <img
            src={value}
            alt=""
            className="rme:h-full rme:w-full rme:object-contain"
            onError={() => setError('Image failed to load')}
          />
        ) : (
          <span className="rme:flex rme:flex-col rme:items-center rme:gap-1 rme:text-faint">
            <ImageIcon className="rme:h-4 rme:w-4" />
            <span className="rme:text-[10px]">No image</span>
          </span>
        )}
      </div>

      <div className="rme:flex rme:items-center rme:gap-1.5">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          className="rme:flex-1"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="rme:h-3.5 rme:w-3.5" />
          {busy ? 'Uploading…' : 'Upload'}
        </Button>
        <Button
          type="button"
          size="iconSm"
          variant="ghost"
          title="Remove image"
          aria-label="Remove image"
          disabled={!value || busy}
          onClick={() => {
            setError(null)
            onChange('')
          }}
        >
          <Trash2 className="rme:h-3.5 rme:w-3.5" />
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="rme:hidden"
          onChange={(e) => void pick(e.target.files?.[0])}
        />
      </div>

      <Input
        type="text"
        spellCheck={false}
        placeholder="https://…/image.png"
        value={value ?? ''}
        onChange={(e) => {
          setError(null)
          onChange(e.target.value)
        }}
      />

      {busy ? (
        <p className="rme:flex rme:items-center rme:gap-1 rme:text-[10px] rme:text-faint">
          <span className="rme:h-2.5 rme:w-2.5 rme:animate-spin rme:rounded-full rme:border rme:border-line rme:border-t-brand" />
          Uploading…
        </p>
      ) : null}
      {error ? <p className="rme:text-[10px] rme:text-danger">{error}</p> : null}
    </div>
  )
}
