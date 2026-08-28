import { createContext, useContext, type ReactNode } from 'react'
import { useStore } from 'zustand'
import type { EditorState, EditorStore } from './editorStore'
import type { BlockRegistry } from '@/blocks/registry'
import type { EditorConfig } from '@/types/config'

/* ------------------------------------------------------------------ */
/* Store                                                              */
/* ------------------------------------------------------------------ */

const StoreCtx = createContext<EditorStore | null>(null)

export function useEditorStoreApi(): EditorStore {
  const store = useContext(StoreCtx)
  if (!store) throw new Error('react-mail-editor: used outside <EmailEditor>')
  return store
}

/** Subscribe to a slice of editor state. */
export function useEditor<T>(selector: (s: EditorState) => T): T {
  return useStore(useEditorStoreApi(), selector)
}

/** Non-reactive access to actions (stable across renders). */
export function useActions(): EditorState {
  return useEditorStoreApi().getState()
}

/* ------------------------------------------------------------------ */
/* Blocks + config + runtime                                          */
/* ------------------------------------------------------------------ */

const BlocksCtx = createContext<BlockRegistry | null>(null)

export function useBlocks(): BlockRegistry {
  const b = useContext(BlocksCtx)
  if (!b) throw new Error('react-mail-editor: block registry unavailable')
  return b
}

export type ResolvedConfig = Required<
  Pick<
    EditorConfig,
    | 'contentWidth'
    | 'devices'
    | 'labeledActions'
    | 'templates'
    | 'autosaveMs'
    | 'storageKey'
    | 'variableSyntax'
    | 'fonts'
    | 'showMetaBar'
    | 'historyLimit'
    | 'prefetch'
  >
> & {
  actions: Required<NonNullable<EditorConfig['actions']>>
  labels: Required<NonNullable<EditorConfig['labels']>>
}

const ConfigCtx = createContext<ResolvedConfig | null>(null)

export function useConfig(): ResolvedConfig {
  const c = useContext(ConfigCtx)
  if (!c) throw new Error('react-mail-editor: config unavailable')
  return c
}

export type ToastKind = 'success' | 'error' | 'info'

export interface EditorRuntime {
  uploadImage: (file: File) => Promise<string>
  notify: (message: string, kind?: ToastKind) => void
  /** Fired by the toolbar; wired to the host's props in EmailEditor. */
  save: () => void | Promise<void>
  exportDesign: () => void | Promise<void>
  saveTemplate: () => void | Promise<void>
  openModal: (
    modal: 'export' | 'templates' | 'variables' | 'preview' | 'meta' | null,
  ) => void
}

const RuntimeCtx = createContext<EditorRuntime | null>(null)

export function useRuntime(): EditorRuntime {
  const r = useContext(RuntimeCtx)
  if (!r) throw new Error('react-mail-editor: runtime unavailable')
  return r
}

/* ------------------------------------------------------------------ */
/* Provider                                                           */
/* ------------------------------------------------------------------ */

export function EditorProvider(props: {
  store: EditorStore
  blocks: BlockRegistry
  config: ResolvedConfig
  runtime: EditorRuntime
  children: ReactNode
}) {
  const { store, blocks, config, runtime, children } = props
  return (
    <StoreCtx.Provider value={store}>
      <BlocksCtx.Provider value={blocks}>
        <ConfigCtx.Provider value={config}>
          <RuntimeCtx.Provider value={runtime}>{children}</RuntimeCtx.Provider>
        </ConfigCtx.Provider>
      </BlocksCtx.Provider>
    </StoreCtx.Provider>
  )
}
