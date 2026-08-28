import { useMemo, useState } from 'react'
import {
  ChevronRight,
  Copy,
  Monitor,
  PanelRightClose,
  Smartphone,
  Trash2,
  RotateCcw,
  Columns3,
} from 'lucide-react'
import type { InspectorSchema } from '@/types/inspector'
import type { SelectionKind } from '@/types/schema'
import { useBlocks, useEditor, useEditorStoreApi, useRuntime } from '@/store/context'
import type { NodeKind } from '@/store/editorStore'
import { bodyInspector, columnInspector, rowInspector } from '@/config/inspectorSchemas'
import { LAYOUT_PRESETS } from '@/config/defaults'
import { cn, getPath, setPath } from '@/lib/utils'
import { InspectorControl } from '../inspector/InspectorControl'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/ui/accordion'
import { Button } from '@/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip'

interface Target {
  title: string
  kind: NodeKind
  id: string | null
  schema: InspectorSchema
  values: Record<string, unknown>
  mobile: Record<string, unknown>
  responsiveKeys: string[]
}

export function Inspector() {
  const store = useEditorStoreApi()
  const blocks = useBlocks()
  const runtime = useRuntime()
  const selection = useEditor((s) => s.selection)
  const design = useEditor((s) => s.design)
  const scope = useEditor((s) => s.scope)

  const target = useMemo<Target | null>(() => {
    const s = store.getState()
    if (selection.kind === 'body') {
      return {
        title: 'Email body',
        kind: 'body',
        id: design.body.id,
        schema: bodyInspector,
        values: design.body.values as unknown as Record<string, unknown>,
        mobile: {},
        responsiveKeys: [],
      }
    }
    if (selection.kind === 'row' && selection.id) {
      const row = s.findRow(selection.id)
      if (!row) return null
      return {
        title: row.name || 'Row',
        kind: 'row',
        id: row.id,
        schema: rowInspector,
        values: row.values as unknown as Record<string, unknown>,
        mobile: (row.mobile ?? {}) as Record<string, unknown>,
        responsiveKeys: ['padding'],
      }
    }
    if (selection.kind === 'column' && selection.id) {
      const found = s.findColumn(selection.id)
      if (!found) return null
      return {
        title: 'Column',
        kind: 'column',
        id: found.column.id,
        schema: columnInspector,
        values: found.column.values as unknown as Record<string, unknown>,
        mobile: (found.column.mobile ?? {}) as Record<string, unknown>,
        responsiveKeys: ['padding'],
      }
    }
    if (selection.kind === 'content' && selection.id) {
      const found = s.findContent(selection.id)
      if (!found) return null
      const def = blocks.get(found.content.type)
      return {
        title: found.content.name || def?.label || found.content.type,
        kind: 'content',
        id: found.content.id,
        schema: def?.inspector ?? [],
        values: found.content.values,
        mobile: (found.content.mobile ?? {}) as Record<string, unknown>,
        responsiveKeys: (def?.responsiveKeys as string[]) ?? [],
      }
    }
    return null
  }, [selection, design, blocks, store])

  const crumbs = useCrumbs()
  const mobileScope = scope === 'mobile'

  if (!target) {
    return (
      <aside className="rme:flex rme:w-80 rme:shrink-0 rme:flex-col rme:border-l rme:border-line rme:bg-panel" />
    )
  }

  const effective = mobileScope ? { ...target.values, ...target.mobile } : target.values

  const read = (key: string) => getPath(effective, key)

  const write = (key: string, value: unknown) => {
    const s = store.getState()
    const historyKey = `${target.kind}:${target.id}:${key}:${scope}`
    const patch = setPath(effective, key, value)
    if (mobileScope) s.updateMobile(target.kind, target.id, patch, historyKey)
    else s.updateValues(target.kind, target.id, patch, historyKey)
  }

  const visibleGroups = target.schema
    .map((g) => ({
      ...g,
      controls: g.controls.filter((c) => {
        if (c.showIf && !c.showIf(effective)) return false
        // In the mobile scope only responsive controls are editable.
        if (mobileScope && !c.responsive) return false
        return true
      }),
    }))
    .filter((g) => g.controls.length)

  const canDuplicate = target.kind === 'row' || target.kind === 'content'
  const canDelete = target.kind !== 'body'

  return (
    <aside className="rme:flex rme:w-80 rme:shrink-0 rme:flex-col rme:border-l rme:border-line rme:bg-panel">
      {/* Header */}
      <div className="rme:flex rme:items-center rme:justify-between rme:gap-2 rme:border-b rme:border-line rme:px-3 rme:py-2.5">
        <h2 className="rme:truncate rme:text-xs rme:font-semibold rme:text-ink">
          {target.title}
        </h2>
        <div className="rme:flex rme:items-center rme:gap-0.5">
          {canDuplicate ? (
            <IconAction
              icon={Copy}
              label="Duplicate"
              onClick={() =>
                store
                  .getState()
                  .duplicateNode(target.kind as 'row' | 'content', target.id!)
              }
            />
          ) : null}
          {canDelete ? (
            <IconAction
              icon={Trash2}
              label={`Delete ${target.kind}`}
              danger
              onClick={() => {
                store
                  .getState()
                  .removeNode(target.kind as 'row' | 'content' | 'column', target.id!)
                runtime.notify('Deleted', 'info')
              }}
            />
          ) : null}
          <IconAction
            icon={PanelRightClose}
            label="Close panel"
            onClick={() => store.getState().setInspectorOpen(false)}
          />
        </div>
      </div>

      {/* Breadcrumb */}
      {crumbs.length > 1 ? (
        <nav
          aria-label="Selection path"
          className="rme:flex rme:flex-wrap rme:items-center rme:gap-0.5 rme:border-b rme:border-line rme:px-3 rme:py-1.5"
        >
          {crumbs.map((c, i) => (
            <span key={c.kind + c.id} className="rme:flex rme:items-center rme:gap-0.5">
              {i > 0 ? (
                <ChevronRight className="rme:h-3 rme:w-3 rme:shrink-0 rme:text-faint" />
              ) : null}
              <button
                type="button"
                disabled={i === crumbs.length - 1}
                onClick={() => store.getState().selectAndInspect(c.kind, c.id)}
                className={cn(
                  'rme:max-w-[8rem] rme:truncate rme:rounded rme:px-1 rme:py-0.5 rme:text-[11px] rme:transition-colors',
                  i === crumbs.length - 1
                    ? 'rme:font-semibold rme:text-ink'
                    : 'rme:text-faint rme:hover:bg-hover rme:hover:text-ink',
                )}
              >
                {c.label}
              </button>
            </span>
          ))}
        </nav>
      ) : null}

      {/* Device scope switch */}
      {target.responsiveKeys.length ? (
        <div className="rme:flex rme:items-center rme:gap-1 rme:border-b rme:border-line rme:px-3 rme:py-2">
          <ScopeTab
            active={!mobileScope}
            icon={Monitor}
            label="Desktop"
            onClick={() => store.getState().setScope('desktop')}
          />
          <ScopeTab
            active={mobileScope}
            icon={Smartphone}
            label="Mobile"
            count={Object.keys(target.mobile).length}
            onClick={() => store.getState().setScope('mobile')}
          />
        </div>
      ) : null}

      {mobileScope ? (
        <p className="rme:border-b rme:border-line rme:bg-brand-soft rme:px-3 rme:py-2 rme:text-[11px] rme:text-brand">
          Editing mobile overrides. Only values you change here are emitted in the
          mobile media query.
        </p>
      ) : null}

      {/* Row layout switcher */}
      {target.kind === 'row' && !mobileScope ? (
        <RowLayoutPicker rowId={target.id!} />
      ) : null}

      {/* Controls */}
      <div className="rme:flex-1 rme:overflow-y-auto rme-scroll">
        {visibleGroups.length ? (
          <Accordion
            type="multiple"
            defaultValue={visibleGroups
              .filter((g) => g.defaultOpen !== false)
              .map((g) => g.title)}
          >
            {visibleGroups.map((group) => (
              <AccordionItem key={group.title} value={group.title}>
                <AccordionTrigger>
                  <span className="rme:flex rme:items-center rme:gap-1.5">
                    {group.icon ? <group.icon className="rme:h-3.5 rme:w-3.5" /> : null}
                    {group.title}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  {group.controls.map((ctrl) => (
                    <InspectorControl
                      key={ctrl.key}
                      def={ctrl}
                      value={read(ctrl.key)}
                      values={effective}
                      upload={runtime.uploadImage}
                      onChange={(v) => write(ctrl.key, v)}
                      action={
                        mobileScope && ctrl.key in target.mobile ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() =>
                                  store
                                    .getState()
                                    .clearMobileKey(target.kind, target.id, ctrl.key)
                                }
                                className="rme:flex rme:h-4 rme:w-4 rme:items-center rme:justify-center rme:rounded rme:text-brand rme:hover:bg-hover"
                              >
                                <RotateCcw className="rme:h-3 rme:w-3" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Reset to desktop value</TooltipContent>
                          </Tooltip>
                        ) : undefined
                      }
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="rme:p-6 rme:text-center rme:text-[11px] rme:text-faint">
            {mobileScope
              ? 'This element has no mobile-specific settings.'
              : 'No editable properties for this selection.'}
          </div>
        )}
      </div>
    </aside>
  )
}

function RowLayoutPicker({ rowId }: { rowId: string }) {
  const store = useEditorStoreApi()
  const row = useEditor((s) => s.findRow(rowId))
  const [open, setOpen] = useState(false)
  if (!row) return null
  const current = row.cells.join('-')

  return (
    <div className="rme:border-b rme:border-line rme:px-3 rme:py-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rme:flex rme:w-full rme:items-center rme:justify-between rme:text-[11px] rme:font-medium rme:text-subtle"
      >
        <span className="rme:flex rme:items-center rme:gap-1.5">
          <Columns3 className="rme:h-3.5 rme:w-3.5" />
          Column layout
        </span>
        <ChevronRight
          className={cn(
            'rme:h-3.5 rme:w-3.5 rme:transition-transform',
            open && 'rme:rotate-90',
          )}
        />
      </button>
      {open ? (
        <div className="rme:mt-2 rme:grid rme:grid-cols-3 rme:gap-1.5">
          {LAYOUT_PRESETS.map((p) => {
            const active = p.cells.join('-') === current
            return (
              <button
                key={p.label}
                type="button"
                title={p.label}
                onClick={() => store.getState().setRowCells(rowId, p.cells)}
                className={cn(
                  'rme:flex rme:h-8 rme:items-center rme:gap-0.5 rme:rounded-md rme:border rme:p-1 rme:transition-colors',
                  active
                    ? 'rme:border-brand rme:bg-brand-soft'
                    : 'rme:border-line rme:hover:border-brand/50',
                )}
              >
                {p.cells.map((c, i) => (
                  <span
                    key={i}
                    className={cn(
                      'rme:h-full rme:rounded-sm',
                      active ? 'rme:bg-brand' : 'rme:bg-active',
                    )}
                    style={{ flexGrow: c }}
                  />
                ))}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function ScopeTab({
  active,
  icon: Icon,
  label,
  count,
  onClick,
}: {
  active: boolean
  icon: React.ComponentType<{ className?: string }>
  label: string
  count?: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rme:flex rme:flex-1 rme:items-center rme:justify-center rme:gap-1.5 rme:rounded-md rme:px-2 rme:py-1 rme:text-[11px] rme:font-medium rme:transition-colors',
        active
          ? 'rme:bg-brand rme:text-on-brand'
          : 'rme:text-subtle rme:hover:bg-hover rme:hover:text-ink',
      )}
    >
      <Icon className="rme:h-3.5 rme:w-3.5" />
      {label}
      {count ? (
        <span
          className={cn(
            'rme:rounded rme:px-1 rme:text-[9px] rme:font-bold',
            active ? 'rme:bg-white/25' : 'rme:bg-brand-soft rme:text-brand',
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  )
}

function IconAction({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="iconSm" aria-label={label} onClick={onClick}>
          <Icon className={cn('rme:h-4 rme:w-4', danger && 'rme:text-danger')} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

interface Crumb {
  label: string
  kind: SelectionKind
  id: string
}

function useCrumbs(): Crumb[] {
  const store = useEditorStoreApi()
  const blocks = useBlocks()
  const selection = useEditor((s) => s.selection)
  const bodyId = useEditor((s) => s.design.body.id)

  return useMemo(() => {
    const s = store.getState()
    const list: Crumb[] = [{ label: 'Body', kind: 'body', id: bodyId }]
    if (selection.kind === 'row' && selection.id) {
      list.push({ label: 'Row', kind: 'row', id: selection.id })
    } else if (selection.kind === 'column' && selection.id) {
      const f = s.findColumn(selection.id)
      if (f) {
        list.push({ label: 'Row', kind: 'row', id: f.row.id })
        list.push({ label: `Column ${f.index + 1}`, kind: 'column', id: f.column.id })
      }
    } else if (selection.kind === 'content' && selection.id) {
      const f = s.findContent(selection.id)
      if (f) {
        const def = blocks.get(f.content.type)
        list.push({ label: 'Row', kind: 'row', id: f.row.id })
        list.push({
          label: `Column ${f.columnIndex + 1}`,
          kind: 'column',
          id: f.column.id,
        })
        list.push({
          label: f.content.name || def?.label || f.content.type,
          kind: 'content',
          id: f.content.id,
        })
      }
    }
    return list
  }, [selection, bodyId, store, blocks])
}
