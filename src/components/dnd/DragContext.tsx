import { createContext, useContext } from 'react'

export type DragKind = 'new-block' | 'new-row' | 'content' | 'row' | null

export interface DragInfo {
  kind: DragKind
  /** Block type for `new-block`, node id for `content` / `row`. */
  ref: string | null
  overId: string | null
}

export const DragInfoCtx = createContext<DragInfo>({
  kind: null,
  ref: null,
  overId: null,
})

export function useDragInfo(): DragInfo {
  return useContext(DragInfoCtx)
}

/** True while something that can land inside a column is being dragged. */
export function isBlockDrag(kind: DragKind): boolean {
  return kind === 'new-block' || kind === 'content'
}

/** True while something that can land between rows is being dragged. */
export function isRowDrag(kind: DragKind): boolean {
  return kind === 'new-row' || kind === 'row'
}

/* Droppable id helpers — kept in one place so parsing stays consistent. */
export const slotId = (columnId: string, index: number) => `slot:${columnId}:${index}`
export const rowSlotId = (index: number) => `rowslot:${index}`
export const columnDropId = (columnId: string) => `col:${columnId}`
