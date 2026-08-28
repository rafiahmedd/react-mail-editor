import { useMemo, useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { Blocks, LayoutGrid, Layers, Search, X } from 'lucide-react'
import type { BlockDefinition } from '@/types/blocks'
import type { Values } from '@/types/schema'
import { useBlocks, useEditor, useEditorStoreApi } from '@/store/context'
import { LAYOUT_PRESETS } from '@/config/defaults'
import { cn } from '@/lib/utils'
import { Input } from '@/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip'
import { LayersPanel } from './LayersPanel'

type Tab = 'blocks' | 'layouts' | 'layers'

const GROUP_LABELS: Record<string, string> = {
  content: 'Content',
  media: 'Media',
  layout: 'Layout',
  advanced: 'Advanced',
}

export function LeftRail() {
  const store = useEditorStoreApi()
  const blocks = useBlocks()
  const open = useEditor((s) => s.paletteOpen)
  const layersOpen = useEditor((s) => s.layersOpen)
  const [tab, setTab] = useState<Tab>('blocks')
  const [query, setQuery] = useState('')

  const activeTab: Tab = layersOpen ? 'layers' : tab

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const groups = blocks.grouped()
    if (!q) return groups
    return groups
      .map((g) => ({
        group: g.group,
        items: g.items.filter(
          (b) =>
            b.label.toLowerCase().includes(q) ||
            b.type.toLowerCase().includes(q) ||
            b.keywords?.some((k) => k.toLowerCase().includes(q)),
        ),
      }))
      .filter((g) => g.items.length)
  }, [blocks, query])

  const selectTab = (next: Tab) => {
    if (next === 'layers') {
      store.getState().setLayersOpen(true)
      store.getState().setPaletteOpen(true)
      return
    }
    store.getState().setLayersOpen(false)
    if (activeTab === next && open) {
      store.getState().setPaletteOpen(false)
    } else {
      setTab(next)
      store.getState().setPaletteOpen(true)
    }
  }

  return (
    <aside className="rme:flex rme:shrink-0">
      {/* Icon rail */}
      <div className="rme:flex rme:w-12 rme:shrink-0 rme:flex-col rme:items-center rme:gap-1 rme:border-r rme:border-line rme:bg-rail rme:py-2">
        <RailTab
          icon={Blocks}
          label="Blocks"
          active={activeTab === 'blocks' && open}
          onClick={() => selectTab('blocks')}
        />
        <RailTab
          icon={LayoutGrid}
          label="Layouts"
          active={activeTab === 'layouts' && open}
          onClick={() => selectTab('layouts')}
        />
        <RailTab
          icon={Layers}
          label="Layers"
          active={activeTab === 'layers' && open}
          onClick={() => selectTab('layers')}
        />
      </div>

      {/* Panel */}
      {open ? (
        <div className="rme:flex rme:w-60 rme:shrink-0 rme:flex-col rme:border-r rme:border-line rme:bg-rail">
          <div className="rme:flex rme:items-center rme:justify-between rme:border-b rme:border-line rme:px-3 rme:py-2">
            <span className="rme:text-[11px] rme:font-semibold rme:uppercase rme:tracking-wide rme:text-subtle">
              {activeTab === 'blocks'
                ? 'Blocks'
                : activeTab === 'layouts'
                  ? 'Layouts'
                  : 'Layers'}
            </span>
            <button
              type="button"
              aria-label="Close panel"
              onClick={() => {
                store.getState().setPaletteOpen(false)
                store.getState().setLayersOpen(false)
              }}
              className="rme:flex rme:h-5 rme:w-5 rme:items-center rme:justify-center rme:rounded rme:text-faint rme:transition-colors rme:hover:bg-hover rme:hover:text-ink"
            >
              <X className="rme:h-3.5 rme:w-3.5" />
            </button>
          </div>

          {activeTab === 'blocks' ? (
            <>
              <div className="rme:relative rme:px-2.5 rme:py-2">
                <Search className="rme:pointer-events-none rme:absolute rme:left-4.5 rme:top-1/2 rme:h-3.5 rme:w-3.5 rme:-translate-y-1/2 rme:text-faint" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search blocks"
                  className="rme:pl-7"
                />
              </div>
              <div className="rme:flex-1 rme:overflow-y-auto rme:px-2.5 rme:pb-3 rme-scroll">
                {results.map((g) => (
                  <div key={g.group} className="rme:mb-3">
                    <p className="rme:mb-1.5 rme:px-1 rme:text-[10px] rme:font-semibold rme:uppercase rme:tracking-wide rme:text-faint">
                      {GROUP_LABELS[g.group] ?? g.group}
                    </p>
                    <div className="rme:grid rme:grid-cols-2 rme:gap-1.5">
                      {g.items.map((b) => (
                        <PaletteItem key={b.type} block={b} />
                      ))}
                    </div>
                  </div>
                ))}
                {!results.length ? (
                  <p className="rme:px-1 rme:py-6 rme:text-center rme:text-[11px] rme:text-faint">
                    No blocks match “{query}”.
                  </p>
                ) : null}
              </div>
            </>
          ) : null}

          {activeTab === 'layouts' ? (
            <div className="rme:flex-1 rme:space-y-1.5 rme:overflow-y-auto rme:p-2.5 rme-scroll">
              {LAYOUT_PRESETS.map((p) => (
                <LayoutItem key={p.label} label={p.label} cells={p.cells} />
              ))}
            </div>
          ) : null}

          {activeTab === 'layers' ? <LayersPanel /> : null}
        </div>
      ) : null}
    </aside>
  )
}

function RailTab({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          aria-pressed={active}
          onClick={onClick}
          className={cn(
            'rme:flex rme:h-9 rme:w-9 rme:items-center rme:justify-center rme:rounded-lg rme:transition-colors',
            active
              ? 'rme:bg-brand rme:text-on-brand'
              : 'rme:text-subtle rme:hover:bg-hover rme:hover:text-ink',
          )}
        >
          <Icon className="rme:h-[18px] rme:w-[18px]" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

function PaletteItem({ block }: { block: BlockDefinition<Values> }) {
  const store = useEditorStoreApi()
  const blocks = useBlocks()
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new:${block.type}`,
    data: { kind: 'new-block', blockType: block.type },
  })
  const Icon = block.icon

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      type="button"
      title={block.description || `Add ${block.label}`}
      onClick={() => {
        const content = blocks.create(block.type)
        if (content) store.getState().appendBlock(content)
      }}
      className={cn(
        'rme:flex rme:cursor-grab rme:flex-col rme:items-center rme:gap-1.5 rme:rounded-lg rme:border rme:border-line rme:bg-panel rme:px-2 rme:py-2.5 rme:text-center rme:transition-all rme:hover:border-brand rme:hover:shadow-sm rme:active:scale-95',
        isDragging && 'rme:opacity-40',
      )}
    >
      <Icon className="rme:h-4 rme:w-4 rme:text-subtle" />
      <span className="rme:text-[10px] rme:font-medium rme:leading-tight rme:text-ink">
        {block.label}
      </span>
    </button>
  )
}

function LayoutItem({ label, cells }: { label: string; cells: number[] }) {
  const store = useEditorStoreApi()
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `newrow:${cells.join('-')}`,
    data: { kind: 'new-row', cells },
  })

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      type="button"
      title={`Add ${label}`}
      onClick={() => store.getState().addRow(cells)}
      className={cn(
        'rme:flex rme:w-full rme:cursor-grab rme:items-center rme:gap-1 rme:rounded-lg rme:border rme:border-line rme:bg-panel rme:p-1.5 rme:transition-all rme:hover:border-brand rme:hover:shadow-sm rme:active:scale-[0.98]',
        isDragging && 'rme:opacity-40',
      )}
    >
      <span className="rme:flex rme:h-7 rme:flex-1 rme:items-stretch rme:gap-1">
        {cells.map((c, i) => (
          <span key={i} className="rme:rounded-sm rme:bg-active" style={{ flexGrow: c }} />
        ))}
      </span>
      <span className="rme:ml-1 rme:shrink-0 rme:text-[10px] rme:font-medium rme:text-subtle">
        {label}
      </span>
    </button>
  )
}
