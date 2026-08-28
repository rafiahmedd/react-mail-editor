import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Columns3,
  Copy,
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  Rows3,
  Trash2,
} from 'lucide-react'
import type { Column, Content, Row } from '@/types/schema'
import { useBlocks, useEditor, useEditorStoreApi } from '@/store/context'
import { cn } from '@/lib/utils'

/**
 * Structural outline of the email. Long newsletters get unwieldy on the canvas —
 * this gives one-click selection, rename, reorder and visibility control at any
 * depth without hunting for the right hover target.
 */
export function LayersPanel() {
  const rows = useEditor((s) => s.design.body.rows)
  const store = useEditorStoreApi()
  const selection = useEditor((s) => s.selection)
  const bodyId = useEditor((s) => s.design.body.id)

  return (
    <div className="rme:flex-1 rme:overflow-y-auto rme:p-1.5 rme-scroll">
      <button
        type="button"
        onClick={() => store.getState().selectAndInspect('body', bodyId)}
        className={cn(
          'rme:mb-1 rme:flex rme:w-full rme:items-center rme:gap-1.5 rme:rounded-md rme:px-2 rme:py-1.5 rme:text-[11px] rme:font-semibold rme:transition-colors',
          selection.kind === 'body'
            ? 'rme:bg-brand-soft rme:text-brand'
            : 'rme:text-subtle rme:hover:bg-hover',
        )}
      >
        <Rows3 className="rme:h-3.5 rme:w-3.5" />
        Email body
      </button>

      {rows.length === 0 ? (
        <p className="rme:px-2 rme:py-6 rme:text-center rme:text-[11px] rme:text-faint">
          Nothing here yet. Add a layout to begin.
        </p>
      ) : (
        rows.map((row, i) => (
          <RowNode key={row.id} row={row} index={i} total={rows.length} />
        ))
      )}
    </div>
  )
}

function RowNode({ row, index, total }: { row: Row; index: number; total: number }) {
  const store = useEditorStoreApi()
  const selected = useEditor(
    (s) => s.selection.kind === 'row' && s.selection.id === row.id,
  )
  const [open, setOpen] = useState(true)
  const hidden = row.values.hideOnDesktop && row.values.hideOnMobile

  return (
    <div className="rme:mb-0.5">
      <NodeRow
        depth={0}
        selected={selected}
        icon={
          <button
            type="button"
            aria-label={open ? 'Collapse' : 'Expand'}
            onClick={(e) => {
              e.stopPropagation()
              setOpen((o) => !o)
            }}
            className="rme:flex rme:h-4 rme:w-4 rme:items-center rme:justify-center rme:text-faint"
          >
            {open ? (
              <ChevronDown className="rme:h-3 rme:w-3" />
            ) : (
              <ChevronRight className="rme:h-3 rme:w-3" />
            )}
          </button>
        }
        label={row.name || `Row ${index + 1}`}
        meta={`${row.cells.length} col${row.cells.length > 1 ? 's' : ''}`}
        onSelect={() => store.getState().selectAndInspect('row', row.id)}
        onRename={(name) => store.getState().renameNode('row', row.id, name)}
        onMouseEnter={() => store.getState().setHover(row.id)}
        onMouseLeave={() => store.getState().setHover(null)}
        actions={
          <>
            <MiniAction
              icon={hidden ? EyeOff : Eye}
              label={hidden ? 'Show row' : 'Hide row everywhere'}
              active={hidden}
              onClick={() =>
                store.getState().updateValues('row', row.id, {
                  hideOnDesktop: !hidden,
                  hideOnMobile: !hidden,
                })
              }
            />
            <MiniAction
              icon={row.locked ? Lock : LockOpen}
              label={row.locked ? 'Unlock' : 'Lock'}
              active={row.locked}
              onClick={() => store.getState().toggleLock('row', row.id)}
            />
            <MiniAction
              icon={Copy}
              label="Duplicate"
              onClick={() => store.getState().duplicateNode('row', row.id)}
            />
            <MiniAction
              icon={Trash2}
              label="Delete"
              danger
              onClick={() => store.getState().removeNode('row', row.id)}
            />
          </>
        }
        onMove={(dir) => store.getState().moveRow(index, index + dir)}
        canMoveUp={index > 0}
        canMoveDown={index < total - 1}
      />

      {open
        ? row.columns.map((col, ci) => (
            <ColumnNode key={col.id} column={col} index={ci} />
          ))
        : null}
    </div>
  )
}

function ColumnNode({ column, index }: { column: Column; index: number }) {
  const store = useEditorStoreApi()
  const selected = useEditor(
    (s) => s.selection.kind === 'column' && s.selection.id === column.id,
  )

  return (
    <div>
      <NodeRow
        depth={1}
        selected={selected}
        icon={<Columns3 className="rme:h-3 rme:w-3 rme:text-faint" />}
        label={column.name || `Column ${index + 1}`}
        meta={`${column.contents.length}`}
        onSelect={() => store.getState().selectAndInspect('column', column.id)}
        onRename={(name) => store.getState().renameNode('column', column.id, name)}
      />
      {column.contents.map((content, i) => (
        <ContentNode
          key={content.id}
          content={content}
          index={i}
          count={column.contents.length}
        />
      ))}
    </div>
  )
}

function ContentNode({
  content,
  index,
  count,
}: {
  content: Content
  index: number
  count: number
}) {
  const store = useEditorStoreApi()
  const blocks = useBlocks()
  const selected = useEditor(
    (s) => s.selection.kind === 'content' && s.selection.id === content.id,
  )
  const def = blocks.get(content.type)
  const Icon = def?.icon

  return (
    <NodeRow
      depth={2}
      selected={selected}
      icon={Icon ? <Icon className="rme:h-3 rme:w-3 rme:text-faint" /> : null}
      label={content.name || def?.label || content.type}
      meta={content.mobile && Object.keys(content.mobile).length ? 'M' : undefined}
      onSelect={() => store.getState().selectAndInspect('content', content.id)}
      onRename={(name) => store.getState().renameNode('content', content.id, name)}
      onMouseEnter={() => store.getState().setHover(content.id)}
      onMouseLeave={() => store.getState().setHover(null)}
      onMove={(dir) => store.getState().nudgeContent(content.id, dir)}
      canMoveUp={index > 0}
      canMoveDown={index < count - 1}
      actions={
        <>
          <MiniAction
            icon={content.locked ? Lock : LockOpen}
            label={content.locked ? 'Unlock' : 'Lock'}
            active={content.locked}
            onClick={() => store.getState().toggleLock('content', content.id)}
          />
          <MiniAction
            icon={Copy}
            label="Duplicate"
            onClick={() => store.getState().duplicateNode('content', content.id)}
          />
          <MiniAction
            icon={Trash2}
            label="Delete"
            danger
            onClick={() => store.getState().removeNode('content', content.id)}
          />
        </>
      }
    />
  )
}

function NodeRow({
  depth,
  selected,
  icon,
  label,
  meta,
  actions,
  onSelect,
  onRename,
  onMouseEnter,
  onMouseLeave,
  onMove,
  canMoveUp,
  canMoveDown,
}: {
  depth: number
  selected: boolean
  icon: React.ReactNode
  label: string
  meta?: string
  actions?: React.ReactNode
  onSelect: () => void
  onRename?: (name: string) => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onMove?: (dir: -1 | 1) => void
  canMoveUp?: boolean
  canMoveDown?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(label)

  return (
    <div
      role="treeitem"
      aria-selected={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
        if (onMove && e.key === 'ArrowUp' && e.altKey && canMoveUp) {
          e.preventDefault()
          onMove(-1)
        }
        if (onMove && e.key === 'ArrowDown' && e.altKey && canMoveDown) {
          e.preventDefault()
          onMove(1)
        }
      }}
      onDoubleClick={() => {
        if (!onRename) return
        setDraft(label)
        setEditing(true)
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'rme:group rme:flex rme:cursor-pointer rme:items-center rme:gap-1.5 rme:rounded-md rme:py-1 rme:pr-1 rme:text-[11px] rme:transition-colors',
        selected
          ? 'rme:bg-brand-soft rme:text-brand'
          : 'rme:text-subtle rme:hover:bg-hover',
      )}
      style={{ paddingLeft: 6 + depth * 12 }}
    >
      <span className="rme:flex rme:h-4 rme:w-4 rme:shrink-0 rme:items-center rme:justify-center">
        {icon}
      </span>
      {editing && onRename ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            onRename(draft.trim())
            setEditing(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onRename(draft.trim())
              setEditing(false)
            }
            if (e.key === 'Escape') setEditing(false)
            e.stopPropagation()
          }}
          onClick={(e) => e.stopPropagation()}
          className="rme:min-w-0 rme:flex-1 rme:rounded rme:border rme:border-brand rme:bg-panel rme:px-1 rme:py-0.5 rme:text-[11px] rme:text-ink rme:outline-none"
        />
      ) : (
        <span className="rme:min-w-0 rme:flex-1 rme:truncate">{label}</span>
      )}
      {meta && !editing ? (
        <span className="rme:shrink-0 rme:rounded rme:bg-active rme:px-1 rme:text-[9px] rme:font-semibold rme:text-faint rme:group-hover:hidden">
          {meta}
        </span>
      ) : null}
      {actions ? (
        <span className="rme:hidden rme:shrink-0 rme:items-center rme:gap-px rme:group-hover:flex">
          {actions}
        </span>
      ) : null}
    </div>
  )
}

function MiniAction({
  icon: Icon,
  label,
  onClick,
  active,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  active?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        'rme:flex rme:h-4.5 rme:w-4.5 rme:items-center rme:justify-center rme:rounded rme:transition-colors rme:hover:bg-active',
        active && 'rme:text-brand',
        danger && 'rme:hover:text-danger',
      )}
    >
      <Icon className="rme:h-3 rme:w-3" />
    </button>
  )
}
