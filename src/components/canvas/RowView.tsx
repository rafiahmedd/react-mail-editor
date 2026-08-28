import { useDraggable } from '@dnd-kit/core'
import {
  ChevronDown,
  ChevronUp,
  Copy,
  GripVertical,
  Lock,
  Trash2,
} from 'lucide-react'
import type { Column, Row } from '@/types/schema'
import { useEditor, useEditorStoreApi } from '@/store/context'
import { bgColor, bgImageCss, borderCss, padding } from '@/lib/style'
import { safeUrl } from '@/lib/html'
import { cn } from '@/lib/utils'
import { NodeButton, NodeLabel, NodeToolbar } from './NodeToolbar'
import { ContentView } from './ContentView'
import { EmptyColumnDrop, RowSlot } from './DropSlot'

export function RowView({
  row,
  index,
  total,
}: {
  row: Row
  index: number
  total: number
}) {
  const store = useEditorStoreApi()
  const selected = useEditor(
    (s) => s.selection.kind === 'row' && s.selection.id === row.id,
  )
  const hovered = useEditor((s) => s.hoverId === row.id)
  const preview = useEditor((s) => s.preview)
  const device = useEditor((s) => s.device)

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } =
    useDraggable({
      id: row.id,
      disabled: preview || row.locked,
      data: { kind: 'row', id: row.id, index },
    })

  const v = device === 'mobile' && row.mobile ? { ...row.values, ...row.mobile } : row.values
  const stacked = device === 'mobile' && v.stackOnMobile

  if (preview && ((device === 'mobile' && v.hideOnMobile) || (device !== 'mobile' && v.hideOnDesktop))) {
    return null
  }

  const showChrome = !preview && (hovered || selected)
  const hiddenHere =
    (device === 'mobile' && v.hideOnMobile) || (device !== 'mobile' && v.hideOnDesktop)

  const total12 = row.cells.reduce((a, b) => a + b, 0) || 12
  const columns = stacked && v.reverseOnMobile ? [...row.columns].reverse() : row.columns

  return (
    <>
      <RowSlot index={index} />
      <div
        ref={setNodeRef}
        data-rme-node={row.id}
        className={cn(
          'rme:relative rme:transition-[outline-color,opacity]',
          'rme:outline rme:outline-1 rme:-outline-offset-1 rme:outline-transparent',
          !preview && hovered && !selected && 'rme:outline-dashed rme:outline-brand/40',
          selected && 'rme:outline-2 rme:outline-brand',
          isDragging && 'rme:opacity-40',
          hiddenHere && !preview && 'rme:opacity-45',
        )}
        style={{
          backgroundColor: bgColor(v.backgroundColor) || undefined,
          padding: padding(v.padding),
          border: borderCss(v.border) || undefined,
          borderRadius: v.borderRadius || undefined,
          ...bgStyle(v.backgroundImage?.url, v),
        }}
        onMouseOver={(e) => {
          if (preview) return
          e.stopPropagation()
          store.getState().setHover(row.id)
        }}
        onMouseLeave={() => {
          if (store.getState().hoverId === row.id) store.getState().setHover(null)
        }}
        onClick={(e) => {
          if (preview) return
          e.stopPropagation()
          store.getState().selectAndInspect('row', row.id)
        }}
      >
        {showChrome ? (
          <NodeToolbar side="top-left">
            {row.locked ? (
              <NodeButton
                icon={Lock}
                title="Unlock row"
                onClick={() => store.getState().toggleLock('row', row.id)}
              />
            ) : (
              <span
                ref={setActivatorNodeRef}
                {...listeners}
                {...attributes}
                title="Drag to reorder"
                className="rme:flex rme:h-5 rme:w-4 rme:cursor-grab rme:items-center rme:justify-center rme:active:cursor-grabbing"
              >
                <GripVertical className="rme:h-3.5 rme:w-3.5" />
              </span>
            )}
            <NodeLabel>{row.name || 'Row'}</NodeLabel>
            <NodeButton
              icon={ChevronUp}
              title="Move up"
              disabled={index === 0}
              onClick={() => store.getState().moveRow(index, index - 1)}
            />
            <NodeButton
              icon={ChevronDown}
              title="Move down"
              disabled={index === total - 1}
              onClick={() => store.getState().moveRow(index, index + 1)}
            />
            <NodeButton
              icon={Copy}
              title="Duplicate row"
              onClick={() => store.getState().duplicateNode('row', row.id)}
            />
            <NodeButton
              icon={Trash2}
              title="Delete row"
              onClick={() => store.getState().removeNode('row', row.id)}
            />
          </NodeToolbar>
        ) : null}

        <div
          style={{
            display: 'flex',
            flexWrap: stacked ? 'wrap' : 'nowrap',
            alignItems: alignItems(v.verticalAlign),
            backgroundColor: bgColor(v.columnsBackground) || undefined,
            margin: v.gap ? `0 -${v.gap / 2}px` : undefined,
          }}
        >
          {columns.map((col) => (
            <ColumnView
              key={col.id}
              column={col}
              width={
                stacked
                  ? '100%'
                  : `${((row.cells[row.columns.indexOf(col)] ?? 12) / total12) * 100}%`
              }
              gap={v.gap}
            />
          ))}
        </div>
      </div>
      {index === total - 1 ? <RowSlot index={total} /> : null}
    </>
  )
}

function ColumnView({
  column,
  width,
  gap,
}: {
  column: Column
  width: string
  gap: number
}) {
  const store = useEditorStoreApi()
  const selected = useEditor(
    (s) => s.selection.kind === 'column' && s.selection.id === column.id,
  )
  const preview = useEditor((s) => s.preview)
  const v = column.values

  return (
    <div
      data-rme-node={column.id}
      style={{
        width,
        flex: `0 0 ${width}`,
        maxWidth: width,
        padding: gap ? `0 ${gap / 2}px` : undefined,
        boxSizing: 'border-box',
      }}
    >
      <div
        className={cn(
          'rme:relative rme:h-full rme:transition-[outline-color]',
          'rme:outline rme:outline-1 rme:-outline-offset-1 rme:outline-transparent',
          selected && 'rme:outline-2 rme:outline-brand',
        )}
        style={{
          backgroundColor: bgColor(v.backgroundColor) || undefined,
          padding: padding(v.padding),
          border: borderCss(v.border) || undefined,
          borderRadius: v.borderRadius || undefined,
          ...bgStyle(v.backgroundImage?.url, v),
        }}
        onClick={(e) => {
          if (preview) return
          e.stopPropagation()
          store.getState().selectAndInspect('column', column.id)
        }}
      >
        {column.contents.length === 0 ? (
          preview ? null : (
            <EmptyColumnDrop columnId={column.id} />
          )
        ) : (
          column.contents.map((content, i) => (
            <ContentView
              key={content.id}
              content={content}
              columnId={column.id}
              index={i}
              count={column.contents.length}
            />
          ))
        )}
      </div>
    </div>
  )
}

function alignItems(v: string): 'flex-start' | 'center' | 'flex-end' {
  return v === 'middle' ? 'center' : v === 'bottom' ? 'flex-end' : 'flex-start'
}

function bgStyle(
  url: string | undefined,
  v: { backgroundImage?: { repeat: string; size: string; position: string } },
): React.CSSProperties {
  const safe = safeUrl(url, true)
  if (!safe || !v.backgroundImage) return {}
  return {
    backgroundImage: `url('${safe}')`,
    backgroundRepeat: v.backgroundImage.repeat,
    backgroundSize: v.backgroundImage.size,
    backgroundPosition: v.backgroundImage.position,
  } as React.CSSProperties
}

export { bgImageCss }
