import { useMemo } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { useEditor, useEditorStoreApi } from '@/store/context'
import { bgColor, padding } from '@/lib/style'
import { safeUrl } from '@/lib/html'
import { cn } from '@/lib/utils'
import { RowView } from './RowView'
import { RowSlot } from './DropSlot'
import { Button } from '@/ui/button'

const DEVICE_WIDTH = { desktop: null, tablet: 768, mobile: 375 } as const

export function Canvas({ emptyState }: { emptyState?: React.ReactNode }) {
  const store = useEditorStoreApi()
  const design = useEditor((s) => s.design)
  const device = useEditor((s) => s.device)
  const zoom = useEditor((s) => s.zoom)
  const preview = useEditor((s) => s.preview)
  const selectedBody = useEditor((s) => s.selection.kind === 'body')

  const v = design.body.values
  const frameWidth = DEVICE_WIDTH[device]
  const bg = safeUrl(v.backgroundImage?.url, true)

  const bodyStyle = useMemo(
    () => ({
      width: v.contentWidth,
      maxWidth: '100%',
      backgroundColor: v.contentBackground,
      borderRadius: v.borderRadius || undefined,
      color: v.textColor,
      fontFamily: v.fontFamily?.value,
      direction: v.direction,
      overflow: v.borderRadius ? ('hidden' as const) : undefined,
    }),
    [v],
  )

  return (
    <div
      className="rme:relative rme:flex-1 rme:overflow-auto rme-scroll"
      style={{
        backgroundColor: bgColor(v.backgroundColor) || 'var(--rme-ui-canvas)',
        backgroundImage: bg ? `url('${bg}')` : undefined,
        backgroundRepeat: v.backgroundImage?.repeat,
        backgroundSize: v.backgroundImage?.size,
        backgroundPosition: v.backgroundImage?.position,
      }}
      onClick={() => {
        if (!preview) store.getState().selectAndInspect('body', design.body.id)
      }}
      /*
       * Links on the canvas never navigate.
       *
       * Two surfaces paint author HTML verbatim — RichText (text and heading
       * blocks) and the Custom HTML block — so any anchor in the copy is a
       * real, clickable link sitting on the design surface. Nothing else
       * cancels it: the block handlers call stopPropagation(), which does not
       * touch a browser default, so a click on `<a href="…">Unsubscribe</a>`
       * navigated the whole page.
       *
       * That loses the design. Every unsaved edit lives in this component's
       * store, so following a link — even a placeholder `href="#"` — throws it
       * away. Hosts have it worse: an editor embedded in an app with
       * client-side routing sees `#` rewrite the route and unmount the editor
       * from underneath itself, which is how this was found (a WordPress admin
       * running the editor under a HashRouter, where double-clicking a text
       * block to edit it bounced the user back to the app's home screen).
       *
       * Capture phase, because the target's own handlers stopPropagation and a
       * bubble-phase listener here would never run. preventDefault only — the
       * click still reaches ContentView, so selecting a block and
       * double-clicking to edit it are unaffected. `download` anchors are left
       * alone: exports build those detached from the document today, but a
       * genuine in-canvas download should still work if one ever appears.
       */
      onClickCapture={(e) => {
        const el = e.target instanceof Element ? e.target : null
        const anchor = el?.closest('a[href]')
        if (anchor && !anchor.hasAttribute('download')) e.preventDefault()
      }}
    >
      <div
        className="rme:mx-auto rme:origin-top rme:transition-[width]"
        style={{
          width: frameWidth ? Math.min(frameWidth, 900) : '100%',
          transform: zoom !== 1 ? `scale(${zoom})` : undefined,
          padding: padding(v.padding),
        }}
      >
        <div
          className={cn(
            'rme:mx-auto rme:transition-shadow rme-canvas-doc',
            device !== 'desktop' && 'rme:shadow-xl',
            !preview && selectedBody && 'rme:outline rme:outline-2 rme:outline-brand/70',
          )}
          style={bodyStyle}
        >
          {design.body.rows.length === 0 ? (
            <EmptyCanvas custom={emptyState} />
          ) : (
            design.body.rows.map((row, i) => (
              <RowView key={row.id} row={row} index={i} total={design.body.rows.length} />
            ))
          )}
        </div>
      </div>

      {!preview && design.body.rows.length > 0 ? (
        <div className="rme:pb-16" />
      ) : null}
    </div>
  )
}

function EmptyCanvas({ custom }: { custom?: React.ReactNode }) {
  const store = useEditorStoreApi()
  if (custom) return <>{custom}</>
  return (
    <div className="rme:px-6 rme:py-16">
      <RowSlot index={0} />
      <div className="rme:flex rme:flex-col rme:items-center rme:gap-3 rme:rounded-xl rme:border-2 rme:border-dashed rme:border-line rme:px-6 rme:py-14 rme:text-center">
        <Sparkles className="rme:h-7 rme:w-7 rme:text-faint" />
        <div>
          <p className="rme:text-sm rme:font-semibold rme:text-ink">
            Start building your email
          </p>
          <p className="rme:mt-1 rme:text-xs rme:text-subtle">
            Drag a layout from the left, or add a single-column row to begin.
          </p>
        </div>
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            store.getState().addRow([12])
          }}
        >
          <Plus className="rme:h-4 rme:w-4" />
          Add a row
        </Button>
      </div>
    </div>
  )
}
