import { useMemo, useState } from 'react'
import { LayoutTemplate, Search } from 'lucide-react'
import type { TemplateEntry } from '@/types/config'
import { useConfig, useEditorStoreApi, useRuntime } from '@/store/context'
import { cn, deepClone } from '@/lib/utils'
import { Badge } from '@/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Input } from '@/ui/input'

export function TemplatesModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { templates } = useConfig()
  const store = useEditorStoreApi()
  const runtime = useRuntime()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return templates
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) || (t.category ?? '').toLowerCase().includes(q),
    )
  }, [templates, query])

  const apply = (template: TemplateEntry) => {
    if (typeof window !== 'undefined') {
      const ok = window.confirm(
        `Replace the current design with "${template.name}"? Unsaved changes will be lost.`,
      )
      if (!ok) return
    }
    store.getState().loadDesign(deepClone(template.design))
    runtime.notify(`Loaded "${template.name}"`, 'success')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent width="52rem">
        <DialogHeader>
          <DialogTitle>Templates</DialogTitle>
          <DialogDescription>
            Start from a ready-made design. Loading a template replaces the current email.
          </DialogDescription>
        </DialogHeader>

        <div className="rme:flex rme:min-h-0 rme:flex-1 rme:flex-col rme:gap-3 rme:px-5 rme:py-4">
          {templates.length ? (
            <div className="rme:relative">
              <Search className="rme:pointer-events-none rme:absolute rme:left-2.5 rme:top-1/2 rme:h-3.5 rme:w-3.5 rme:-translate-y-1/2 rme:text-faint" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search templates…"
                aria-label="Search templates"
                className="rme:pl-8"
              />
            </div>
          ) : null}

          {!templates.length ? (
            <EmptyState />
          ) : !filtered.length ? (
            <p className="rme:py-10 rme:text-center rme:text-xs rme:text-faint">
              No templates match “{query}”.
            </p>
          ) : (
            <div className="rme:min-h-0 rme:flex-1 rme:overflow-y-auto rme-scroll rme:-mx-1 rme:px-1 rme:pb-1">
              <div className="rme:grid rme:grid-cols-2 rme:gap-3 rme:sm:grid-cols-3">
                {filtered.map((t) => (
                  <TemplateCard key={t.id} template={t} onPick={() => apply(t)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TemplateCard({
  template,
  onPick,
}: {
  template: TemplateEntry
  onPick: () => void
}) {
  const rows = template.design?.body?.rows?.length ?? 0

  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        'rme:group rme:flex rme:flex-col rme:overflow-hidden rme:rounded-lg rme:border rme:border-line rme:bg-panel rme:text-left rme:transition-colors',
        'rme:hover:border-brand/60 rme:hover:bg-hover',
        'rme:focus-visible:outline-none rme:focus-visible:ring-2 rme:focus-visible:ring-ring/50',
      )}
    >
      <span className="rme:block rme:h-28 rme:w-full rme:overflow-hidden rme:border-b rme:border-line rme:bg-canvas">
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt=""
            loading="lazy"
            className="rme:h-full rme:w-full rme:object-cover"
          />
        ) : (
          <Placeholder rows={rows} />
        )}
      </span>
      <span className="rme:flex rme:flex-col rme:gap-1.5 rme:p-2.5">
        <span className="rme:truncate rme:text-xs rme:font-medium rme:text-ink">
          {template.name}
        </span>
        {template.category ? (
          <span>
            <Badge variant="muted">{template.category}</Badge>
          </span>
        ) : null}
      </span>
    </button>
  )
}

/** Abstract stand-in for a missing thumbnail — bar count follows the row count. */
function Placeholder({ rows }: { rows: number }) {
  const bars = Math.max(3, Math.min(6, rows || 3))
  return (
    <span className="rme:flex rme:h-full rme:w-full rme:flex-col rme:justify-center rme:gap-1.5 rme:px-4">
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          className="rme:block rme:h-1.5 rme:rounded-full rme:bg-active"
          style={{ width: `${100 - ((i * 37) % 55)}%` }}
        />
      ))}
    </span>
  )
}

function EmptyState() {
  return (
    <div className="rme:flex rme:flex-col rme:items-center rme:justify-center rme:gap-2 rme:py-12 rme:text-center">
      <LayoutTemplate className="rme:h-8 rme:w-8 rme:text-faint" />
      <p className="rme:text-xs rme:font-medium rme:text-ink">No templates yet</p>
      <p className="rme:max-w-sm rme:text-[11px] rme:leading-relaxed rme:text-subtle">
        Templates are supplied by the host application through{' '}
        <code className="rme:font-mono rme:text-faint">config.templates</code> — an array of{' '}
        <code className="rme:font-mono rme:text-faint">
          {'{ id, name, category?, thumbnail?, design }'}
        </code>{' '}
        entries.
      </p>
    </div>
  )
}
