import { useMemo } from 'react'
import { AlertTriangle, Minus, Plus, Ruler } from 'lucide-react'
import { useBlocks, useEditor, useEditorStoreApi } from '@/store/context'
import { checkCompatibility, exportHtml, htmlSize } from '@/export/exportHtml'
import { clamp, formatBytes } from '@/lib/utils'

export function StatusBar() {
  const store = useEditorStoreApi()
  const blocks = useBlocks()
  const design = useEditor((s) => s.design)
  const zoom = useEditor((s) => s.zoom)
  const device = useEditor((s) => s.device)

  const { size, warnings, blockCount } = useMemo(() => {
    const html = exportHtml(design, blocks)
    const issues = checkCompatibility(design, html)
    let count = 0
    for (const row of design.body.rows)
      for (const col of row.columns) count += col.contents.length
    return {
      size: htmlSize(html),
      warnings: issues.filter((i) => i.level === 'warn').length,
      blockCount: count,
    }
  }, [design, blocks])

  const setZoom = (delta: number) =>
    store.getState().setZoom(clamp(Math.round((zoom + delta) * 100) / 100, 0.5, 1.5))

  return (
    <div className="rme:flex rme:h-7 rme:shrink-0 rme:items-center rme:justify-between rme:gap-4 rme:border-t rme:border-line rme:bg-panel rme:px-3 rme:text-[10px] rme:text-faint">
      <div className="rme:flex rme:items-center rme:gap-3">
        <span>
          {design.body.rows.length} row{design.body.rows.length === 1 ? '' : 's'}
        </span>
        <span>
          {blockCount} block{blockCount === 1 ? '' : 's'}
        </span>
        <span className={size > 102_000 ? 'rme:font-semibold rme:text-danger' : undefined}>
          {formatBytes(size)}
        </span>
        {warnings ? (
          <span className="rme:flex rme:items-center rme:gap-1 rme:text-danger">
            <AlertTriangle className="rme:h-3 rme:w-3" />
            {warnings} check{warnings === 1 ? '' : 's'}
          </span>
        ) : null}
      </div>

      <div className="rme:flex rme:items-center rme:gap-2">
        <span className="rme:flex rme:items-center rme:gap-1 rme:capitalize">
          <Ruler className="rme:h-3 rme:w-3" />
          {device} · {design.body.values.contentWidth}px
        </span>
        <span className="rme:flex rme:items-center rme:gap-0.5">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setZoom(-0.1)}
            className="rme:flex rme:h-4 rme:w-4 rme:items-center rme:justify-center rme:rounded rme:hover:bg-hover rme:hover:text-ink"
          >
            <Minus className="rme:h-3 rme:w-3" />
          </button>
          <span className="rme:w-8 rme:text-center rme:tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => setZoom(0.1)}
            className="rme:flex rme:h-4 rme:w-4 rme:items-center rme:justify-center rme:rounded rme:hover:bg-hover rme:hover:text-ink"
          >
            <Plus className="rme:h-3 rme:w-3" />
          </button>
        </span>
      </div>
    </div>
  )
}
