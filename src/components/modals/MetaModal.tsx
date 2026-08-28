import type { ReactNode } from 'react'
import { Mail } from 'lucide-react'
import type { DesignMeta } from '@/types/schema'
import { useEditor, useEditorStoreApi } from '@/store/context'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'

const SUBJECT_MAX = 60
const PREVIEW_MAX = 100

export function MetaModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const store = useEditorStoreApi()
  const name = useEditor((s) => s.design.name) ?? ''
  const meta = useEditor((s) => s.design.meta)

  const subject = meta?.subject ?? ''
  const preview = meta?.preview ?? ''
  const from = meta?.from ?? ''
  const replyTo = meta?.replyTo ?? ''

  const setMeta = (patch: Partial<DesignMeta>) => store.getState().updateMeta(patch)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent width="32rem">
        <DialogHeader>
          <DialogTitle>Email details</DialogTitle>
          <DialogDescription>
            Sending metadata. Only the preview text is rendered into the HTML (as the hidden
            preheader) — the rest is read by your application when it sends.
          </DialogDescription>
        </DialogHeader>

        <div className="rme:flex rme:flex-col rme:gap-3.5 rme:overflow-y-auto rme-scroll rme:px-5 rme:py-4">
          <Field label="Design name" htmlFor="rme-meta-name">
            <Input
              id="rme-meta-name"
              value={name}
              placeholder="Untitled email"
              onChange={(e) => store.getState().setDesignName(e.target.value)}
            />
          </Field>

          <Field label="Subject" htmlFor="rme-meta-subject">
            <Input
              id="rme-meta-subject"
              value={subject}
              placeholder="Your weekly digest is here"
              onChange={(e) => setMeta({ subject: e.target.value })}
            />
            <Counter value={subject.length} max={SUBJECT_MAX} />
          </Field>

          <Field label="Preview text" htmlFor="rme-meta-preview">
            <Input
              id="rme-meta-preview"
              value={preview}
              placeholder="The one line inboxes show next to the subject"
              onChange={(e) => setMeta({ preview: e.target.value })}
            />
            <Counter value={preview.length} max={PREVIEW_MAX} />
          </Field>

          <Field label="From" htmlFor="rme-meta-from">
            <Input
              id="rme-meta-from"
              value={from}
              placeholder="Your Company <hello@example.com>"
              onChange={(e) => setMeta({ from: e.target.value })}
            />
          </Field>

          <Field label="Reply-to" htmlFor="rme-meta-replyto">
            <Input
              id="rme-meta-replyto"
              type="email"
              value={replyTo}
              placeholder="support@example.com"
              onChange={(e) => setMeta({ replyTo: e.target.value })}
            />
          </Field>

          <p className="rme:flex rme:items-start rme:gap-1.5 rme:text-[11px] rme:leading-relaxed rme:text-faint">
            <Mail className="rme:mt-0.5 rme:h-3.5 rme:w-3.5 rme:shrink-0" />
            Subjects under {SUBJECT_MAX} characters and preview text under {PREVIEW_MAX} avoid
            truncation in most inboxes.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: ReactNode
}) {
  return (
    <div className="rme:flex rme:flex-col rme:gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}

function Counter({ value, max }: { value: number; max: number }) {
  return (
    <span
      className={cn(
        'rme:self-end rme:text-[10px] rme:tabular-nums',
        value > max ? 'rme:text-danger' : 'rme:text-faint',
      )}
    >
      {value}/{max}
    </span>
  )
}
