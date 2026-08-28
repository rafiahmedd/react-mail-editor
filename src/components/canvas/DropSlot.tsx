import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { isBlockDrag, isRowDrag, rowSlotId, slotId, useDragInfo } from '../dnd/DragContext'

/** Insertion target between two blocks inside a column. */
export function ContentSlot({
  columnId,
  index,
  first,
}: {
  columnId: string
  index: number
  first?: boolean
}) {
  const drag = useDragInfo()
  const active = isBlockDrag(drag.kind)
  const id = slotId(columnId, index)
  const { setNodeRef, isOver } = useDroppable({
    id,
    disabled: !active,
    data: { kind: 'content-slot', columnId, index },
  })

  return (
    <div
      ref={setNodeRef}
      aria-hidden
      className={cn(
        'rme:relative rme:transition-all',
        active ? 'rme:h-3' : first ? 'rme:h-0' : 'rme:h-0',
      )}
    >
      {isOver ? (
        <div className="rme:absolute rme:inset-x-1 rme:top-1/2 rme:h-[3px] rme:-translate-y-1/2 rme:rounded-full rme:bg-brand rme:shadow-[0_0_0_3px_color-mix(in_srgb,var(--rme-ui-brand)_25%,transparent)]" />
      ) : null}
    </div>
  )
}

/** Insertion target between two rows in the body. */
export function RowSlot({ index }: { index: number }) {
  const drag = useDragInfo()
  const active = isRowDrag(drag.kind)
  const { setNodeRef, isOver } = useDroppable({
    id: rowSlotId(index),
    disabled: !active,
    data: { kind: 'row-slot', index },
  })

  return (
    <div
      ref={setNodeRef}
      aria-hidden
      className={cn('rme:relative rme:transition-all', active ? 'rme:h-4' : 'rme:h-0')}
    >
      {isOver ? (
        <div className="rme:absolute rme:inset-x-0 rme:top-1/2 rme:h-[3px] rme:-translate-y-1/2 rme:rounded-full rme:bg-brand rme:shadow-[0_0_0_3px_color-mix(in_srgb,var(--rme-ui-brand)_25%,transparent)]" />
      ) : null}
    </div>
  )
}

/** Whole-column fallback target so empty columns still accept a drop. */
export function EmptyColumnDrop({ columnId }: { columnId: string }) {
  const drag = useDragInfo()
  const active = isBlockDrag(drag.kind)
  const { setNodeRef, isOver } = useDroppable({
    id: slotId(columnId, 0),
    disabled: !active,
    data: { kind: 'content-slot', columnId, index: 0 },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rme:m-2 rme:flex rme:min-h-[72px] rme:items-center rme:justify-center rme:rounded-lg rme:border-2 rme:border-dashed rme:px-3 rme:text-center rme:text-[11px] rme:font-medium rme:transition-colors',
        isOver
          ? 'rme:border-brand rme:bg-brand-soft rme:text-brand'
          : 'rme:border-line rme:text-faint',
      )}
    >
      {isOver ? 'Drop to add here' : 'Drag content here'}
    </div>
  )
}
