import { createStore, type StoreApi } from 'zustand/vanilla'
import { produce } from 'immer'
import type {
  Column,
  ColumnLocation,
  Content,
  ContentLocation,
  Design,
  Device,
  DesignMeta,
  DesignVariable,
  Row,
  Selection,
  SelectionKind,
  Values,
} from '@/types/schema'
import { createColumn, createDesign, createRow } from '@/config/defaults'
import { deepClone, uid } from '@/lib/utils'

/** Edits sharing a history key inside this window coalesce into one step. */
const COALESCE_MS = 600

export type NodeKind = 'body' | 'row' | 'column' | 'content'
/** Which breakpoint the inspector is currently editing. */
export type EditScope = 'desktop' | 'mobile'

export interface EditorState {
  design: Design
  selection: Selection
  device: Device
  scope: EditScope
  preview: boolean
  dark: boolean
  fullscreen: boolean
  inspectorOpen: boolean
  layersOpen: boolean
  paletteOpen: boolean
  hoverId: string | null
  /** Content id currently in inline rich-text editing. */
  editingId: string | null
  zoom: number
  dirty: boolean
  past: string[]
  future: string[]

  /* history */
  record: (key?: string) => void
  beginBatch: () => void
  endBatch: () => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  /* lookups */
  findRow: (id: string) => Row | null
  findColumn: (id: string) => ColumnLocation | null
  findContent: (id: string) => ContentLocation | null

  /* selection + view */
  select: (kind: SelectionKind, id: string | null) => void
  selectAndInspect: (kind: SelectionKind, id: string | null) => void
  selectBody: () => void
  setHover: (id: string | null) => void
  setEditing: (id: string | null) => void
  setDevice: (d: Device) => void
  setScope: (s: EditScope) => void
  setPreview: (v?: boolean) => void
  setDark: (v: boolean) => void
  setFullscreen: (v?: boolean) => void
  setInspectorOpen: (v: boolean) => void
  setLayersOpen: (v: boolean) => void
  setPaletteOpen: (v: boolean) => void
  setZoom: (z: number) => void

  /* value updates */
  updateValues: (
    kind: NodeKind,
    id: string | null,
    patch: Values,
    historyKey?: string,
  ) => void
  updateMobile: (
    kind: NodeKind,
    id: string | null,
    patch: Values,
    historyKey?: string,
  ) => void
  clearMobileKey: (kind: NodeKind, id: string | null, key: string) => void
  renameNode: (kind: NodeKind, id: string, name: string) => void
  toggleLock: (kind: 'row' | 'content', id: string) => void
  setDesignName: (name: string) => void
  updateMeta: (patch: Partial<DesignMeta>, historyKey?: string) => void
  updateVariables: (next: DesignVariable[]) => void

  /* structure */
  addRow: (cells?: number[], atIndex?: number) => Row
  setRowCells: (id: string, cells: number[]) => void
  addContent: (content: Content, columnId: string, atIndex?: number) => void
  appendBlock: (content: Content) => Content | undefined
  removeNode: (kind: 'row' | 'content' | 'column', id: string) => void
  duplicateNode: (kind: 'row' | 'content', id: string) => void
  moveRow: (fromIndex: number, toIndex: number) => void
  moveContent: (contentId: string, toColumnId: string, toIndex: number) => void
  nudgeContent: (id: string, delta: number) => void

  /* load / reset */
  loadDesign: (design: Design, recordHistory?: boolean) => void
  resetDesign: () => void
  markClean: () => void
}

export type EditorStore = StoreApi<EditorState>

export interface CreateStoreOptions {
  initialDesign?: Design
  contentWidth?: number
  historyLimit?: number
  layersOpen?: boolean
}

export function createEditorStore(opts: CreateStoreOptions = {}): EditorStore {
  const historyLimit = opts.historyLimit ?? 60
  let lastKey: string | null = null
  let lastTime = -Infinity
  let batchSnapshot: string | null = null

  return createStore<EditorState>()((set, get) => {
    /* ---------------------------------------------------------------- */
    /* helpers                                                          */
    /* ---------------------------------------------------------------- */

    const snapshot = () => JSON.stringify(get().design)

    const pushPast = (snap: string) =>
      set((s) => {
        const past = [...s.past, snap]
        if (past.length > historyLimit) past.shift()
        return { past, future: [], dirty: true }
      })

    /** Mutate the design immutably and mark dirty. */
    const mutate = (recipe: (d: Design) => void) =>
      set((s) => ({ design: produce(s.design, recipe), dirty: true }))

    const normalizeSelection = () => {
      const s = get()
      const { kind, id } = s.selection
      if (kind === 'body' || kind === null || !id) return
      const exists =
        (kind === 'row' && s.findRow(id)) ||
        (kind === 'column' && s.findColumn(id)) ||
        (kind === 'content' && s.findContent(id))
      if (!exists) s.selectBody()
    }

    /** Locate a node's values bag inside an immer draft. */
    const draftNode = (
      d: Design,
      kind: NodeKind,
      id: string | null,
    ): { values: Values; mobile?: Values } | null => {
      if (kind === 'body') return d.body as unknown as { values: Values }
      for (const row of d.body.rows) {
        if (kind === 'row' && row.id === id) return row as unknown as { values: Values }
        for (const col of row.columns) {
          if (kind === 'column' && col.id === id)
            return col as unknown as { values: Values }
          if (kind === 'content') {
            const found = col.contents.find((c) => c.id === id)
            if (found) return found as unknown as { values: Values }
          }
        }
      }
      return null
    }

    return {
      /* ---------------- state ---------------- */
      design: opts.initialDesign ?? createDesign(opts.contentWidth),
      selection: { kind: 'body', id: null },
      device: 'desktop',
      scope: 'desktop',
      preview: false,
      dark: false,
      fullscreen: false,
      inspectorOpen: true,
      layersOpen: opts.layersOpen ?? false,
      paletteOpen: true,
      hoverId: null,
      editingId: null,
      zoom: 1,
      dirty: false,
      past: [],
      future: [],

      /* ---------------- history ---------------- */
      record(key) {
        if (batchSnapshot !== null) return // inside an explicit batch
        const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
        const sameBurst = key != null && key === lastKey && now - lastTime < COALESCE_MS
        lastKey = key ?? null
        lastTime = now
        if (sameBurst) return
        pushPast(snapshot())
      },

      beginBatch() {
        if (batchSnapshot === null) batchSnapshot = snapshot()
      },

      endBatch() {
        if (batchSnapshot === null) return
        const before = batchSnapshot
        batchSnapshot = null
        if (before !== snapshot()) {
          pushPast(before)
          lastKey = null
        }
      },

      undo() {
        const { past, design } = get()
        if (!past.length) return
        const prev = past[past.length - 1]
        set((s) => ({
          past: s.past.slice(0, -1),
          future: [...s.future, JSON.stringify(design)],
          design: JSON.parse(prev) as Design,
          dirty: true,
        }))
        lastKey = null
        normalizeSelection()
      },

      redo() {
        const { future, design } = get()
        if (!future.length) return
        const next = future[future.length - 1]
        set((s) => ({
          future: s.future.slice(0, -1),
          past: [...s.past, JSON.stringify(design)],
          design: JSON.parse(next) as Design,
          dirty: true,
        }))
        lastKey = null
        normalizeSelection()
      },

      canUndo: () => get().past.length > 0,
      canRedo: () => get().future.length > 0,

      /* ---------------- lookups ---------------- */
      findRow: (id) => get().design.body.rows.find((r) => r.id === id) ?? null,

      findColumn(id) {
        const rows = get().design.body.rows
        for (let ri = 0; ri < rows.length; ri++) {
          const index = rows[ri].columns.findIndex((c) => c.id === id)
          if (index !== -1)
            return { row: rows[ri], rowIndex: ri, column: rows[ri].columns[index], index }
        }
        return null
      },

      findContent(id) {
        const rows = get().design.body.rows
        for (let ri = 0; ri < rows.length; ri++) {
          const row = rows[ri]
          for (let ci = 0; ci < row.columns.length; ci++) {
            const column = row.columns[ci]
            const index = column.contents.findIndex((c) => c.id === id)
            if (index !== -1)
              return {
                row,
                rowIndex: ri,
                column,
                columnIndex: ci,
                content: column.contents[index],
                index,
              }
          }
        }
        return null
      },

      /* ---------------- selection + view ---------------- */
      select: (kind, id) => set({ selection: { kind, id }, editingId: null }),

      selectAndInspect: (kind, id) =>
        set({ selection: { kind, id }, inspectorOpen: true }),

      selectBody: () =>
        set((s) => ({ selection: { kind: 'body', id: s.design.body.id } })),

      setHover: (id) => set({ hoverId: id }),
      setEditing: (id) => set({ editingId: id }),
      setDevice: (d) => set({ device: d, scope: d === 'mobile' ? 'mobile' : 'desktop' }),
      setScope: (s) => set({ scope: s }),
      setPreview: (v) =>
        set((s) => ({ preview: v ?? !s.preview, editingId: null, hoverId: null })),
      setDark: (v) => set({ dark: v }),
      setFullscreen: (v) => set((s) => ({ fullscreen: v ?? !s.fullscreen })),
      setInspectorOpen: (v) => set({ inspectorOpen: v }),
      setLayersOpen: (v) => set({ layersOpen: v }),
      setPaletteOpen: (v) => set({ paletteOpen: v }),
      setZoom: (z) => set({ zoom: z }),

      /* ---------------- value updates ---------------- */
      updateValues(kind, id, patch, historyKey) {
        get().record(historyKey)
        mutate((d) => {
          const node = draftNode(d, kind, id)
          if (node) Object.assign(node.values, patch)
        })
      },

      updateMobile(kind, id, patch, historyKey) {
        get().record(historyKey)
        mutate((d) => {
          const node = draftNode(d, kind, id) as
            | { values: Values; mobile?: Values }
            | null
          if (!node) return
          node.mobile = { ...(node.mobile ?? {}), ...patch }
        })
      },

      clearMobileKey(kind, id, key) {
        get().record()
        mutate((d) => {
          const node = draftNode(d, kind, id) as
            | { values: Values; mobile?: Values }
            | null
          if (!node?.mobile) return
          delete node.mobile[key]
          if (!Object.keys(node.mobile).length) delete node.mobile
        })
      },

      renameNode(kind, id, name) {
        get().record(`name:${id}`)
        mutate((d) => {
          const node = draftNode(d, kind, id) as { name?: string } | null
          if (node) node.name = name || undefined
        })
      },

      toggleLock(kind, id) {
        get().record()
        mutate((d) => {
          const node = draftNode(d, kind, id) as { locked?: boolean } | null
          if (node) node.locked = !node.locked
        })
      },

      setDesignName(name) {
        get().record('design:name')
        mutate((d) => {
          d.name = name
        })
      },

      updateMeta(patch, historyKey) {
        get().record(historyKey ?? 'design:meta')
        mutate((d) => {
          d.meta = { ...(d.meta ?? {}), ...patch }
        })
      },

      updateVariables(next) {
        get().record()
        mutate((d) => {
          d.variables = next
        })
      },

      /* ---------------- structure ---------------- */
      addRow(cells = [12], atIndex) {
        get().record()
        const row = createRow(cells)
        mutate((d) => {
          d.body.rows.splice(atIndex ?? d.body.rows.length, 0, row)
        })
        get().selectAndInspect('row', row.id)
        return row
      },

      setRowCells(id, cells) {
        get().record()
        mutate((d) => {
          const row = d.body.rows.find((r) => r.id === id)
          if (!row) return
          const old = row.columns
          const next: Column[] = cells.map((_, i) => old[i] ?? createColumn())
          // Anything dropped off the end keeps its content by appending it to
          // the last surviving column — never silently destroy the author's work.
          if (old.length > cells.length) {
            const tail = old.slice(cells.length).flatMap((c) => c.contents)
            if (tail.length) next[next.length - 1].contents.push(...tail)
          }
          row.cells = cells
          row.columns = next
        })
      },

      addContent(content, columnId, atIndex) {
        get().record()
        mutate((d) => {
          for (const row of d.body.rows) {
            const col = row.columns.find((c) => c.id === columnId)
            if (col) {
              col.contents.splice(atIndex ?? col.contents.length, 0, content)
              return
            }
          }
        })
        get().selectAndInspect('content', content.id)
      },

      /** Insert relative to the current selection — the click-to-add path. */
      appendBlock(content) {
        const s = get()
        const sel = s.selection

        if (sel.kind === 'content' && sel.id) {
          const found = s.findContent(sel.id)
          if (found) {
            s.addContent(content, found.column.id, found.index + 1)
            return content
          }
        }
        if (sel.kind === 'column' && sel.id) {
          s.addContent(content, sel.id)
          return content
        }
        if (sel.kind === 'row' && sel.id) {
          const row = s.findRow(sel.id)
          if (row?.columns.length) {
            s.addContent(content, row.columns[0].id)
            return content
          }
        }

        // Nothing useful selected — append to the last row, creating one if needed.
        const rows = s.design.body.rows
        if (!rows.length) {
          const row = s.addRow([12])
          s.addContent(content, row.columns[0].id)
          return content
        }
        const last = rows[rows.length - 1]
        s.addContent(content, last.columns[last.columns.length - 1].id)
        return content
      },

      removeNode(kind, id) {
        get().record()
        mutate((d) => {
          if (kind === 'row') {
            d.body.rows = d.body.rows.filter((r) => r.id !== id)
            return
          }
          if (kind === 'column') {
            // A column cannot exist alone — drop its parent row.
            d.body.rows = d.body.rows.filter(
              (r) => !r.columns.some((c) => c.id === id),
            )
            return
          }
          for (const row of d.body.rows) {
            for (const col of row.columns) {
              const i = col.contents.findIndex((c) => c.id === id)
              if (i !== -1) {
                col.contents.splice(i, 1)
                return
              }
            }
          }
        })
        normalizeSelection()
      },

      duplicateNode(kind, id) {
        get().record()
        let newId: string | null = null
        mutate((d) => {
          if (kind === 'row') {
            const i = d.body.rows.findIndex((r) => r.id === id)
            if (i === -1) return
            const copy = reId(deepClone(d.body.rows[i])) as Row
            newId = copy.id
            d.body.rows.splice(i + 1, 0, copy)
            return
          }
          for (const row of d.body.rows) {
            for (const col of row.columns) {
              const i = col.contents.findIndex((c) => c.id === id)
              if (i !== -1) {
                const copy = reId(deepClone(col.contents[i])) as Content
                newId = copy.id
                col.contents.splice(i + 1, 0, copy)
                return
              }
            }
          }
        })
        if (newId) get().selectAndInspect(kind, newId)
      },

      moveRow(fromIndex, toIndex) {
        if (fromIndex === toIndex) return
        get().record()
        mutate((d) => {
          const [row] = d.body.rows.splice(fromIndex, 1)
          if (row) d.body.rows.splice(toIndex, 0, row)
        })
      },

      moveContent(contentId, toColumnId, toIndex) {
        get().record()
        mutate((d) => {
          let moved: Content | null = null
          let fromColumnId = ''
          let fromIndex = -1
          outer: for (const row of d.body.rows) {
            for (const col of row.columns) {
              const i = col.contents.findIndex((c) => c.id === contentId)
              if (i !== -1) {
                fromColumnId = col.id
                fromIndex = i
                moved = col.contents.splice(i, 1)[0]
                break outer
              }
            }
          }
          if (!moved) return
          for (const row of d.body.rows) {
            const col = row.columns.find((c) => c.id === toColumnId)
            if (col) {
              const insertAt =
                fromColumnId === toColumnId && fromIndex < toIndex ? toIndex - 1 : toIndex
              col.contents.splice(Math.max(0, insertAt), 0, moved)
              return
            }
          }
        })
      },

      nudgeContent(id, delta) {
        const found = get().findContent(id)
        if (!found) return
        const next = found.index + delta
        if (next < 0 || next >= found.column.contents.length) return
        get().record()
        mutate((d) => {
          for (const row of d.body.rows) {
            const col = row.columns.find((c) => c.id === found.column.id)
            if (col) {
              const [item] = col.contents.splice(found.index, 1)
              col.contents.splice(next, 0, item)
              return
            }
          }
        })
      },

      /* ---------------- load / reset ---------------- */
      loadDesign(design, recordHistory = true) {
        if (recordHistory) get().record()
        set({ design: migrate(design), editingId: null })
        normalizeSelection()
      },

      resetDesign() {
        get().record()
        set({ design: createDesign(opts.contentWidth) })
        get().selectBody()
      },

      markClean: () => set({ dirty: false }),
    }
  })
}

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */

/** Give every node in a cloned subtree fresh ids. */
function reId(node: Row | Content): Row | Content {
  if ('cells' in node) {
    node.id = uid('row')
    for (const col of node.columns) {
      col.id = uid('col')
      for (const content of col.contents) content.id = uid('el')
    }
  } else {
    node.id = uid('el')
  }
  return node
}

/**
 * Bring older designs forward. Legacy v1 designs used `paragraph`
 * instead of `text`, `hideOn.{mobile,desktop}` instead of flat booleans and
 * `body.values.preheaderText` instead of `meta.preview`.
 */
export function migrate(input: Design): Design {
  const d = deepClone(input)
  if (!d.body) return createDesign()
  d.variables ??= []
  d.meta ??= {}

  const bodyValues = d.body.values as unknown as Record<string, unknown>
  if (typeof bodyValues.preheaderText === 'string' && !d.meta.preview) {
    d.meta.preview = bodyValues.preheaderText as string
    delete bodyValues.preheaderText
  }
  bodyValues.borderRadius ??= 0
  bodyValues.darkModeSupport ??= true
  bodyValues.backgroundImage ??= {
    url: '',
    repeat: 'no-repeat',
    size: 'cover',
    position: 'center center',
  }

  for (const row of d.body.rows ?? []) {
    const rv = row.values as unknown as Record<string, unknown>
    const hideOn = rv.hideOn as { mobile?: boolean; desktop?: boolean } | undefined
    if (hideOn) {
      rv.hideOnMobile ??= Boolean(hideOn.mobile)
      rv.hideOnDesktop ??= Boolean(hideOn.desktop)
      delete rv.hideOn
    }
    rv.hideOnMobile ??= false
    rv.hideOnDesktop ??= false
    rv.gap ??= 0
    rv.reverseOnMobile ??= false
    rv.stackOnMobile ??= true
    for (const col of row.columns ?? []) {
      const cv = col.values as unknown as Record<string, unknown>
      cv.backgroundImage ??= {
        url: '',
        repeat: 'no-repeat',
        size: 'cover',
        position: 'center center',
      }
      for (const content of col.contents ?? []) {
        if ((content.type as string) === 'paragraph') content.type = 'text'
      }
    }
  }

  d.schemaVersion = 2
  return d
}
