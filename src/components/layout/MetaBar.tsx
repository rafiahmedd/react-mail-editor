import { Eye, Pencil } from 'lucide-react'
import { useEditor, useEditorStoreApi, useRuntime } from '@/store/context'
import { Button } from '@/ui/button'

/**
 * The subject / preview-text strip above the canvas. These never render inside
 * the email itself (except the preheader), but they are the two fields that
 * decide whether anyone opens it — so they belong in view, not buried.
 */
export function MetaBar() {
  const store = useEditorStoreApi()
  const runtime = useRuntime()
  const meta = useEditor((s) => s.design.meta ?? {})
  const name = useEditor((s) => s.design.name ?? '')

  return (
    <div className="rme:flex rme:shrink-0 rme:items-center rme:gap-3 rme:border-b rme:border-line rme:bg-panel rme:px-4 rme:py-1.5">
      <input
        value={name}
        onChange={(e) => store.getState().setDesignName(e.target.value)}
        placeholder="Untitled email"
        aria-label="Design name"
        className="rme:w-40 rme:shrink-0 rme:rounded rme:px-1 rme:py-0.5 rme:text-xs rme:font-semibold rme:text-ink rme:outline-none rme:hover:bg-hover rme:focus:bg-hover"
      />
      <span className="rme:h-4 rme:w-px rme:shrink-0 rme:bg-line" />
      <label className="rme:flex rme:min-w-0 rme:flex-1 rme:items-center rme:gap-2">
        <span className="rme:shrink-0 rme:text-[10px] rme:font-semibold rme:uppercase rme:tracking-wide rme:text-faint">
          Subject
        </span>
        <input
          value={meta.subject ?? ''}
          onChange={(e) => store.getState().updateMeta({ subject: e.target.value }, 'meta:subject')}
          placeholder="What lands in the inbox…"
          className="rme:min-w-0 rme:flex-1 rme:rounded rme:px-1 rme:py-0.5 rme:text-xs rme:text-ink rme:outline-none rme:placeholder:text-faint rme:hover:bg-hover rme:focus:bg-hover"
        />
      </label>
      <label className="rme:flex rme:min-w-0 rme:flex-1 rme:items-center rme:gap-2">
        <span className="rme:shrink-0 rme:text-[10px] rme:font-semibold rme:uppercase rme:tracking-wide rme:text-faint">
          Preview
        </span>
        <input
          value={meta.preview ?? ''}
          onChange={(e) => store.getState().updateMeta({ preview: e.target.value }, 'meta:preview')}
          placeholder="The line shown after the subject"
          className="rme:min-w-0 rme:flex-1 rme:rounded rme:px-1 rme:py-0.5 rme:text-xs rme:text-ink rme:outline-none rme:placeholder:text-faint rme:hover:bg-hover rme:focus:bg-hover"
        />
      </label>
      <Button
        variant="ghost"
        size="iconSm"
        aria-label="Email details"
        onClick={() => runtime.openModal('meta')}
      >
        <Pencil className="rme:h-3.5 rme:w-3.5" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => runtime.openModal('preview')}
      >
        <Eye className="rme:h-3.5 rme:w-3.5" />
        Inbox preview
      </Button>
    </div>
  )
}
