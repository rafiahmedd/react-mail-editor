import { useRef, type ReactNode } from 'react'
import {
  BookmarkPlus,
  Braces,
  Code2,
  Eye,
  EyeOff,
  FilePlus2,
  FolderOpen,
  LayoutTemplate,
  Mail,
  Maximize2,
  Minimize2,
  Monitor,
  Moon,
  PanelRight,
  Redo2,
  Save,
  Smartphone,
  Sun,
  Tablet,
  Undo2,
} from 'lucide-react'
import type { Device } from '@/types/schema'
import { useConfig, useEditor, useEditorStoreApi, useRuntime } from '@/store/context'
import { cn } from '@/lib/utils'
import { Button } from '@/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip'

const DEVICES: { id: Device; icon: typeof Monitor; label: string }[] = [
  { id: 'desktop', icon: Monitor, label: 'Desktop' },
  { id: 'tablet', icon: Tablet, label: 'Tablet' },
  { id: 'mobile', icon: Smartphone, label: 'Mobile' },
]

export function TopBar({
  brand,
  extraActions,
}: {
  brand?: ReactNode
  extraActions?: ReactNode
}) {
  const store = useEditorStoreApi()
  const config = useConfig()
  const runtime = useRuntime()
  const fileRef = useRef<HTMLInputElement>(null)

  const device = useEditor((s) => s.device)
  const preview = useEditor((s) => s.preview)
  const dark = useEditor((s) => s.dark)
  const fullscreen = useEditor((s) => s.fullscreen)
  const inspectorOpen = useEditor((s) => s.inspectorOpen)
  const canUndo = useEditor((s) => s.past.length > 0)
  const canRedo = useEditor((s) => s.future.length > 0)
  const dirty = useEditor((s) => s.dirty)

  const devices = DEVICES.filter((d) => config.devices.includes(d.id))
  const a = config.actions
  const l = config.labels

  return (
    <header className="rme:flex rme:h-12 rme:shrink-0 rme:items-center rme:justify-between rme:gap-3 rme:border-b rme:border-line rme:bg-header rme:px-3">
      {/* Brand */}
      <div className="rme:flex rme:min-w-0 rme:items-center rme:gap-2">
        {brand ?? (
          <>
            <span className="rme:flex rme:h-6 rme:w-6 rme:items-center rme:justify-center rme:rounded-md rme:bg-brand rme:text-on-brand">
              <Mail className="rme:h-3.5 rme:w-3.5" />
            </span>
            <span className="rme:truncate rme:text-xs rme:font-semibold rme:tracking-tight rme:text-ink">
              {l.brand}
            </span>
          </>
        )}
        {dirty ? (
          <span
            title="Unsaved changes"
            className="rme:ml-1 rme:h-1.5 rme:w-1.5 rme:shrink-0 rme:rounded-full rme:bg-brand"
          />
        ) : null}
      </div>

      {/* Device toggles */}
      {devices.length > 1 ? (
        <div className="rme:flex rme:items-center rme:gap-0.5 rme:rounded-lg rme:bg-active/60 rme:p-0.5">
          {devices.map((d) => (
            <Tooltip key={d.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={d.label}
                  aria-pressed={device === d.id}
                  onClick={() => store.getState().setDevice(d.id)}
                  className={cn(
                    'rme:flex rme:h-7 rme:w-7 rme:items-center rme:justify-center rme:rounded-md rme:transition-colors',
                    device === d.id
                      ? 'rme:bg-panel rme:text-ink rme:shadow-sm'
                      : 'rme:text-subtle rme:hover:text-ink',
                  )}
                >
                  <d.icon className="rme:h-4 rme:w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{d.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      ) : null}

      {/* Actions */}
      <div className="rme:flex rme:items-center rme:gap-1">
        {a.undo ? (
          <Group>
            <Act
              icon={Undo2}
              label={`${l.undo} (Ctrl+Z)`}
              disabled={!canUndo}
              onClick={() => store.getState().undo()}
            />
            <Act
              icon={Redo2}
              label={`${l.redo} (Ctrl+Shift+Z)`}
              disabled={!canRedo}
              onClick={() => store.getState().redo()}
            />
          </Group>
        ) : null}

        <Group>
          {a.preview ? (
            <Act
              icon={preview ? EyeOff : Eye}
              label={preview ? 'Exit preview' : `${l.preview} (Ctrl+P)`}
              active={preview}
              onClick={() => store.getState().setPreview()}
            />
          ) : null}
          {a.theme ? (
            <Act
              icon={dark ? Sun : Moon}
              label={dark ? 'Light interface' : 'Dark interface'}
              onClick={() => store.getState().setDark(!dark)}
            />
          ) : null}
          <Act
            icon={PanelRight}
            label="Toggle settings panel"
            active={inspectorOpen}
            onClick={() => store.getState().setInspectorOpen(!inspectorOpen)}
          />
        </Group>

        {a.templates || a.new || a.import || a.variables ? (
          <Group>
            {a.templates ? (
              <Act
                icon={LayoutTemplate}
                label={l.templates}
                onClick={() => runtime.openModal('templates')}
              />
            ) : null}
            {a.variables ? (
              <Act
                icon={Braces}
                label={l.variables}
                onClick={() => runtime.openModal('variables')}
              />
            ) : null}
            {a.new ? (
              <Act
                icon={FilePlus2}
                label={l.new}
                onClick={() => {
                  if (
                    typeof window === 'undefined' ||
                    window.confirm('Start a new design? Unsaved changes will be lost.')
                  ) {
                    store.getState().resetDesign()
                    runtime.notify('New design created', 'info')
                  }
                }}
              />
            ) : null}
            {a.import ? (
              <>
                <Act
                  icon={FolderOpen}
                  label={l.import}
                  onClick={() => fileRef.current?.click()}
                />
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  className="rme:sr-only"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      const design = JSON.parse(await file.text())
                      if (!design?.body) throw new Error('Not a design file')
                      store.getState().loadDesign(design)
                      runtime.notify('Design imported')
                    } catch (err) {
                      runtime.notify(
                        err instanceof Error ? err.message : 'Import failed',
                        'error',
                      )
                    } finally {
                      e.target.value = ''
                    }
                  }}
                />
              </>
            ) : null}
          </Group>
        ) : null}

        {a.fullscreen ? (
          <Act
            icon={fullscreen ? Minimize2 : Maximize2}
            label={fullscreen ? 'Exit fullscreen' : l.fullscreen}
            active={fullscreen}
            onClick={() => store.getState().setFullscreen()}
          />
        ) : null}

        {a.saveTemplate ? (
          <Act
            icon={BookmarkPlus}
            label={l.saveTemplate}
            onClick={() => void runtime.saveTemplate()}
          />
        ) : null}

        {a.export ? (
          <Button variant="outline" size="default" onClick={() => runtime.openModal('export')}>
            <Code2 className="rme:h-4 rme:w-4" />
            {config.labeledActions ? l.export : null}
          </Button>
        ) : null}

        {a.save ? (
          <Button size="default" onClick={() => void runtime.save()}>
            <Save className="rme:h-4 rme:w-4" />
            {config.labeledActions ? l.save : null}
          </Button>
        ) : null}

        {extraActions}
      </div>
    </header>
  )
}

function Group({ children }: { children: ReactNode }) {
  return (
    <div className="rme:flex rme:items-center rme:gap-0.5 rme:border-r rme:border-line rme:pr-1.5 rme:last:border-0">
      {children}
    </div>
  )
}

function Act({
  icon: Icon,
  label,
  onClick,
  disabled,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  disabled?: boolean
  active?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={active ? 'default' : 'ghost'}
          size="icon"
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
        >
          <Icon className="rme:h-4 rme:w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
