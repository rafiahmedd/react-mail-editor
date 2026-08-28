import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import type {
  ColorMode,
  EditorApi,
  EditorConfig,
  ExportOptions,
  SaveTemplatePayload,
  ThemeTokens,
} from '@/types/config'
import type { BlockDefinition } from '@/types/blocks'
import type { Design, Device, Selection, Values } from '@/types/schema'
import { createEditorStore, migrate, type EditorStore } from '@/store/editorStore'
import {
  EditorProvider,
  type EditorRuntime,
  type ResolvedConfig,
} from '@/store/context'
import { BlockRegistry } from '@/blocks/registry'
import { builtinBlocks } from '@/blocks/builtins'
import { BUILTIN_TEMPLATES } from '@/config/templates'
import { FONTS } from '@/config/fonts'
import { exportHtml, exportText } from '@/export/exportHtml'
import { cn, debounce, deepClone } from '@/lib/utils'
import { DragInfoCtx, type DragInfo } from './dnd/DragContext'
import { TopBar } from './layout/TopBar'
import { LeftRail } from './layout/LeftRail'
import { Inspector } from './layout/Inspector'
import { MetaBar } from './layout/MetaBar'
import { StatusBar } from './layout/StatusBar'
import { Canvas } from './canvas/Canvas'
import { prefetchRichTextWhenIdle } from './rte/RichText'
import { Modals, prefetchModalsWhenIdle } from './modals/LazyModals'
import { ToastProvider, useToast } from '@/ui/toast'
import { TooltipProvider } from '@/ui/tooltip'
import '@/styles/editor.css'

export interface EmailEditorProps {
  /** Controlled design JSON. Omit for uncontrolled use. */
  value?: Design
  onChange?: (design: Design) => void
  defaultValue?: Design

  blocks?: BlockDefinition<Values>[]
  disabledBlocks?: string[]

  theme?: ThemeTokens
  colorMode?: ColorMode
  onColorModeChange?: (mode: ColorMode) => void

  preview?: boolean
  onPreviewChange?: (preview: boolean) => void

  config?: EditorConfig
  /** `local` autosaves to localStorage, `none` hands persistence to the host. */
  storage?: 'local' | 'none'

  onLoad?: () => Design | Promise<Design | undefined | null> | undefined | null
  onSave?: (design: Design) => void | Promise<void>
  onSaveTemplate?: (payload: SaveTemplatePayload) => void | Promise<void>
  onExport?: (html: string, design: Design) => void | Promise<void>
  onImageUpload?: (file: File) => Promise<string>
  onSelect?: (selection: Selection) => void
  onReady?: (api: EditorApi) => void

  /** Replace the entire top bar. */
  header?: ReactNode
  /** Replace just the logo/brand area. */
  headerBrand?: ReactNode
  /** Inject buttons next to the built-in actions. */
  headerActions?: ReactNode
  /** Replace the empty-canvas state. */
  emptyState?: ReactNode

  className?: string
  style?: CSSProperties
}

const DEFAULT_ACTIONS = {
  undo: true,
  preview: true,
  theme: true,
  templates: true,
  new: true,
  import: true,
  save: true,
  saveTemplate: false,
  export: true,
  fullscreen: true,
  variables: true,
  layers: true,
  meta: true,
}

const DEFAULT_LABELS = {
  brand: 'Email Builder',
  undo: 'Undo',
  redo: 'Redo',
  preview: 'Preview',
  templates: 'Templates',
  new: 'New design',
  import: 'Import JSON',
  save: 'Save',
  saveTemplate: 'Save as template',
  export: 'Export',
  fullscreen: 'Fullscreen',
  variables: 'Merge variables',
  layers: 'Layers',
}

/**
 * `forwardRef` rather than React 19's ref-as-a-prop, because WordPress still
 * bundles React 18.3 — on 18, `ref` never reaches a function component's props
 * and the imperative API would silently be `undefined`. `forwardRef` behaves
 * identically on both majors.
 */
export const EmailEditor = forwardRef<EditorApi, EmailEditorProps>(
  function EmailEditor(props, ref) {
    return (
      <ToastProvider>
        <EmailEditorInner {...props} apiRef={ref} />
      </ToastProvider>
    )
  },
)

function EmailEditorInner({
  value,
  onChange,
  defaultValue,
  blocks: customBlocks,
  disabledBlocks,
  theme,
  colorMode = 'light',
  onColorModeChange,
  preview,
  onPreviewChange,
  config,
  storage = 'local',
  onLoad,
  onSave,
  onSaveTemplate,
  onExport,
  onImageUpload,
  onSelect,
  onReady,
  header,
  headerBrand,
  headerActions,
  emptyState,
  className,
  style,
  apiRef,
}: EmailEditorProps & { apiRef?: Ref<EditorApi> }) {
  const { notify } = useToast()

  /* ---------------- config ---------------- */
  const resolved: ResolvedConfig = useMemo(
    () => ({
      contentWidth: config?.contentWidth ?? 600,
      devices: config?.devices ?? ['desktop', 'tablet', 'mobile'],
      labeledActions: config?.labeledActions ?? true,
      templates: config?.templates ?? BUILTIN_TEMPLATES,
      autosaveMs: config?.autosaveMs ?? 800,
      storageKey: config?.storageKey ?? 'react-mail-editor:design',
      variableSyntax: config?.variableSyntax ?? 'triple',
      fonts: config?.fonts ?? FONTS,
      showMetaBar: config?.showMetaBar ?? true,
      historyLimit: config?.historyLimit ?? 60,
      prefetch: config?.prefetch ?? true,
      actions: { ...DEFAULT_ACTIONS, ...(config?.actions ?? {}) },
      labels: { ...DEFAULT_LABELS, ...(config?.labels ?? {}) },
    }),
    [config],
  )

  /* ---------------- registry ---------------- */
  const [registryVersion, setRegistryVersion] = useState(0)
  const registry = useMemo(() => {
    const defs = [...builtinBlocks, ...(customBlocks ?? [])]
    return new BlockRegistry(defs, disabledBlocks ?? [])
    // registryVersion forces a rebuild after registerBlock()

  }, [customBlocks, disabledBlocks, registryVersion])

  /* ---------------- store ---------------- */
  const storeRef = useRef<EditorStore | null>(null)
  if (!storeRef.current) {
    storeRef.current = createEditorStore({
      initialDesign: value ?? defaultValue ?? readLocal(storage, resolved.storageKey),
      contentWidth: resolved.contentWidth,
      historyLimit: resolved.historyLimit,
      layersOpen: config?.layersOpen ?? false,
    })
  }
  const store = storeRef.current

  /* ---------------- modals ---------------- */
  const [modal, setModal] = useState<
    'export' | 'templates' | 'variables' | 'preview' | 'meta' | null
  >(null)

  /* ---------------- host callbacks ---------------- */
  const uploadImage = useCallback(
    async (file: File): Promise<string> => {
      if (onImageUpload) return onImageUpload(file)
      return await fileToDataUrl(file)
    },
    [onImageUpload],
  )

  const doExportHtml = useCallback(
    (options?: ExportOptions) => {
      const design = store.getState().design
      const html = exportHtml(design, registry, {
        variableMode: options?.variables ?? 'token',
        variableSyntax: resolved.variableSyntax,
      })
      return html
    },
    [store, registry, resolved.variableSyntax],
  )

  const runtime: EditorRuntime = useMemo(
    () => ({
      uploadImage,
      notify,
      openModal: setModal,
      async save() {
        const design = deepClone(store.getState().design)
        if (onSave) {
          await onSave(design)
          store.getState().markClean()
          notify('Design saved')
        } else {
          downloadFile(
            JSON.stringify(design, null, 2),
            `${slug(design.name ?? 'email')}.json`,
            'application/json',
          )
          store.getState().markClean()
          notify('Design downloaded as JSON')
        }
      },
      async exportDesign() {
        const design = deepClone(store.getState().design)
        const html = doExportHtml()
        if (onExport) await onExport(html, design)
        else setModal('export')
      },
      async saveTemplate() {
        const design = deepClone(store.getState().design)
        const name =
          typeof window !== 'undefined'
            ? window.prompt('Template name', design.name ?? 'My template')
            : design.name
        if (!name) return
        await onSaveTemplate?.({ name, design, html: doExportHtml() })
        notify('Template saved')
      },
    }),
    [uploadImage, notify, onSave, onSaveTemplate, onExport, store, doExportHtml],
  )

  /* ---------------- controlled sync ---------------- */
  const lastEmitted = useRef<string>('')

  useEffect(() => {
    if (!value) return
    const incoming = JSON.stringify(value)
    if (incoming === lastEmitted.current) return
    if (incoming === JSON.stringify(store.getState().design)) return
    store.getState().loadDesign(value, false)
  }, [value, store])

  useEffect(() => {
    if (!onChange) return
    const emit = debounce((design: Design) => {
      lastEmitted.current = JSON.stringify(design)
      onChange(design)
    }, 250)
    const unsub = store.subscribe((s, prev) => {
      if (s.design !== prev.design) emit(s.design)
    })
    return () => {
      emit.cancel()
      unsub()
    }
  }, [onChange, store])

  /* ---------------- preview / colorMode sync ---------------- */
  useEffect(() => {
    if (preview !== undefined) store.getState().setPreview(preview)
  }, [preview, store])

  useEffect(() => {
    const unsub = store.subscribe((s, prev) => {
      if (s.preview !== prev.preview) onPreviewChange?.(s.preview)
      if (s.selection !== prev.selection) onSelect?.(s.selection)
      if (s.dark !== prev.dark) onColorModeChange?.(s.dark ? 'dark' : 'light')
    })
    return unsub
  }, [store, onPreviewChange, onSelect, onColorModeChange])

  const [systemDark, setSystemDark] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemDark(mq.matches)
    const on = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  useEffect(() => {
    store.getState().setDark(colorMode === 'dark' || (colorMode === 'auto' && systemDark))
  }, [colorMode, systemDark, store])

  /* ---------------- initial load ---------------- */
  useEffect(() => {
    let cancelled = false
    if (!onLoad) return
    void (async () => {
      try {
        const loaded = await onLoad()
        if (!cancelled && loaded?.body) store.getState().loadDesign(loaded, false)
      } catch (err) {
        notify(err instanceof Error ? err.message : 'Could not load the design', 'error')
      }
    })()
    return () => {
      cancelled = true
    }

  }, [])

  /* ---------------- localStorage autosave ---------------- */
  useEffect(() => {
    if (storage !== 'local' || typeof window === 'undefined') return
    const persist = debounce((design: Design) => {
      try {
        window.localStorage.setItem(resolved.storageKey, JSON.stringify(design))
      } catch {
        /* quota or privacy mode — silently skip */
      }
    }, resolved.autosaveMs)
    const unsub = store.subscribe((s, prev) => {
      if (s.design !== prev.design) persist(s.design)
    })
    return () => {
      persist.flush()
      unsub()
    }
  }, [storage, resolved.storageKey, resolved.autosaveMs, store])

  /* ---------------- imperative API ---------------- */
  const api = useMemo<EditorApi>(
    () => ({
      getDesign: () => deepClone(store.getState().design),
      loadDesign: (d) => store.getState().loadDesign(d),
      newDesign: () => store.getState().resetDesign(),
      exportHtml: (options) => doExportHtml(options),
      exportText: () => exportText(store.getState().design, registry),
      save: () => runtime.save(),
      export: () => runtime.exportDesign(),
      undo: () => store.getState().undo(),
      redo: () => store.getState().redo(),
      canUndo: () => store.getState().past.length > 0,
      canRedo: () => store.getState().future.length > 0,
      registerBlock: (def) => {
        registry.register(def)
        setRegistryVersion((v) => v + 1)
      },
      select: (sel) => store.getState().select(sel.kind, sel.id),
      selectBody: () => store.getState().selectBody(),
      setDevice: (d: Device) => store.getState().setDevice(d),
      setPreview: (on) => store.getState().setPreview(on),
      setColorMode: (mode) =>
        store.getState().setDark(mode === 'dark' || (mode === 'auto' && systemDark)),
    }),
    [store, registry, runtime, doExportHtml, systemDark],
  )

  useImperativeHandle(apiRef, () => api, [api])

  const readyFired = useRef(false)
  useEffect(() => {
    if (readyFired.current) return
    readyFired.current = true
    onReady?.(api)
  }, [api, onReady])

  /* ---------------- warm the lazy chunks ---------------- */
  // Tiptap and the modals live in separate chunks so they stay out of the
  // initial payload. Fetching them on idle keeps the first double-click and the
  // first Export click instant without delaying first paint.
  useEffect(() => {
    if (!resolved.prefetch) return
    const cancels = [prefetchRichTextWhenIdle(), prefetchModalsWhenIdle()]
    return () => cancels.forEach((c) => c())
  }, [resolved.prefetch])

  /* ---------------- keyboard shortcuts ---------------- */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      const typing =
        t &&
        (t.tagName === 'INPUT' ||
          t.tagName === 'TEXTAREA' ||
          t.isContentEditable ||
          t.closest('[contenteditable="true"]'))
      const mod = e.metaKey || e.ctrlKey
      const s = store.getState()

      if (mod && e.key.toLowerCase() === 'z') {
        if (typing) return
        e.preventDefault()
        e.shiftKey ? s.redo() : s.undo()
        return
      }
      if (mod && e.key.toLowerCase() === 'y' && !typing) {
        e.preventDefault()
        s.redo()
        return
      }
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault()
        void runtime.save()
        return
      }
      if (mod && e.key.toLowerCase() === 'p' && !typing) {
        e.preventDefault()
        s.setPreview()
        return
      }
      if (typing) return
      if (mod && e.key.toLowerCase() === 'd') {
        const sel = s.selection
        if (sel.kind === 'row' || sel.kind === 'content') {
          e.preventDefault()
          s.duplicateNode(sel.kind, sel.id!)
        }
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const sel = s.selection
        if (sel.kind === 'row' || sel.kind === 'content') {
          e.preventDefault()
          s.removeNode(sel.kind, sel.id!)
        }
        return
      }
      if (e.key === 'Escape') {
        if (s.editingId) s.setEditing(null)
        else if (s.preview) s.setPreview(false)
        else s.selectBody()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [store, runtime])

  /* ---------------- drag and drop ---------------- */
  const [drag, setDrag] = useState<DragInfo>({ kind: null, ref: null, overId: null })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  const collision: CollisionDetection = useCallback((args) => {
    const hits = pointerWithin(args)
    return hits.length ? hits : rectIntersection(args)
  }, [])

  const onDragStart = (e: DragStartEvent) => {
    const data = e.active.data.current as
      | { kind: DragInfo['kind']; blockType?: string; id?: string }
      | undefined
    if (!data?.kind) return
    store.getState().beginBatch()
    setDrag({
      kind: data.kind,
      ref: data.blockType ?? data.id ?? null,
      overId: null,
    })
  }

  const onDragOver = (e: DragOverEvent) =>
    setDrag((d) => ({ ...d, overId: e.over ? String(e.over.id) : null }))

  const onDragEnd = (e: DragEndEvent) => {
    const active = e.active.data.current as Record<string, unknown> | undefined
    const over = e.over?.data.current as Record<string, unknown> | undefined
    setDrag({ kind: null, ref: null, overId: null })
    const s = store.getState()

    try {
      if (!active || !over) return

      if (over.kind === 'content-slot') {
        const columnId = String(over.columnId)
        const index = Number(over.index)
        if (active.kind === 'new-block') {
          const content = registry.create(String(active.blockType))
          if (content) s.addContent(content, columnId, index)
        } else if (active.kind === 'content') {
          s.moveContent(String(active.id), columnId, index)
        }
        return
      }

      if (over.kind === 'row-slot') {
        const index = Number(over.index)
        if (active.kind === 'new-row') {
          s.addRow(active.cells as number[], index)
        } else if (active.kind === 'row') {
          const from = s.design.body.rows.findIndex((r) => r.id === active.id)
          if (from !== -1) s.moveRow(from, from < index ? index - 1 : index)
        }
      }
    } finally {
      s.endBatch()
    }
  }

  /* ---------------- theme vars ---------------- */
  const themeStyle = useMemo(() => themeToStyle(theme), [theme])
  const dark = useStoreValue(store, (s) => s.dark)
  const fullscreen = useStoreValue(store, (s) => s.fullscreen)
  const inspectorOpen = useStoreValue(store, (s) => s.inspectorOpen)
  const previewMode = useStoreValue(store, (s) => s.preview)

  return (
    <EditorProvider store={store} blocks={registry} config={resolved} runtime={runtime}>
      <TooltipProvider delayDuration={350}>
        <DragInfoCtx.Provider value={drag}>
          <DndContext
            sensors={sensors}
            collisionDetection={collision}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDragCancel={() => {
              setDrag({ kind: null, ref: null, overId: null })
              store.getState().endBatch()
            }}
          >
            <div
              className={cn(
                'rme-root rme:flex rme:h-full rme:min-h-0 rme:w-full rme:flex-col rme:overflow-hidden rme:bg-canvas rme:text-ink',
                dark && 'rme-dark',
                fullscreen && 'rme:fixed rme:inset-0 rme:z-[9990] rme:h-screen',
                className,
              )}
              style={{ ...themeStyle, ...style }}
            >
              {header ?? (
                <TopBar brand={headerBrand} extraActions={headerActions} />
              )}

              <div className="rme:flex rme:min-h-0 rme:flex-1">
                {!previewMode ? <LeftRail /> : null}

                <div className="rme:flex rme:min-w-0 rme:flex-1 rme:flex-col">
                  {resolved.showMetaBar && !previewMode ? <MetaBar /> : null}
                  <Canvas emptyState={emptyState} />
                  <StatusBar />
                </div>

                {inspectorOpen && !previewMode ? <Inspector /> : null}
              </div>
            </div>

            <DragOverlay dropAnimation={null}>
              {drag.kind ? <DragGhost drag={drag} registry={registry} /> : null}
            </DragOverlay>
          </DndContext>

          <Modals modal={modal} onClose={() => setModal(null)} />
        </DragInfoCtx.Provider>
      </TooltipProvider>
    </EditorProvider>
  )
}

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */

function DragGhost({ drag, registry }: { drag: DragInfo; registry: BlockRegistry }) {
  let label = 'Move'
  if (drag.kind === 'new-block' && drag.ref) {
    label = registry.get(drag.ref)?.label ?? drag.ref
  } else if (drag.kind === 'new-row') {
    label = 'New row'
  } else if (drag.kind === 'row') {
    label = 'Row'
  } else if (drag.kind === 'content' && drag.ref) {
    label = 'Block'
  }
  return (
    <div className="rme-portal rme:pointer-events-none rme:rounded-lg rme:border rme:border-brand rme:bg-panel rme:px-3 rme:py-1.5 rme:text-xs rme:font-medium rme:text-brand rme:shadow-xl">
      {label}
    </div>
  )
}

/** Tiny local `useStore` so this file does not need the context hooks. */
function useStoreValue<T>(store: EditorStore, selector: (s: ReturnType<EditorStore['getState']>) => T): T {
  const [v, setV] = useState(() => selector(store.getState()))
  useEffect(() => {
    setV(selector(store.getState()))
    return store.subscribe((s) => {
      const next = selector(s)
      setV((prev) => (Object.is(prev, next) ? prev : next))
    })

  }, [store])
  return v
}

function themeToStyle(theme?: ThemeTokens): CSSProperties {
  if (!theme) return {}
  const out: Record<string, string> = {}
  const map = (colors: NonNullable<ThemeTokens['colors']>, suffix = '') => {
    for (const [k, val] of Object.entries(colors)) {
      if (!val) continue
      out[`--rme-ui-${kebab(k)}${suffix}`] = val
    }
  }
  if (theme.colors) map(theme.colors)
  if (theme.font?.sans) out['--rme-ui-font-sans'] = theme.font.sans
  if (theme.font?.baseSize) out['--rme-ui-font-size'] = theme.font.baseSize
  if (theme.radius) out['--rme-ui-radius'] = theme.radius
  return out as CSSProperties
}

function kebab(s: string): string {
  return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
}

function readLocal(storage: 'local' | 'none', key: string): Design | undefined {
  if (storage !== 'local' || typeof window === 'undefined') return undefined
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as Design
    return parsed?.body ? migrate(parsed) : undefined
  } catch {
    return undefined
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read the file'))
    reader.readAsDataURL(file)
  })
}

function downloadFile(content: string, filename: string, type: string) {
  if (typeof document === 'undefined') return
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'email'
  )
}
