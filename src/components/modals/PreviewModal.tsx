import { useMemo, useState, type ReactNode } from 'react'
import { FileText, Mail, Monitor, Moon, Smartphone, Sun } from 'lucide-react'
import { useBlocks, useConfig, useEditor } from '@/store/context'
import { exportHtml, exportText } from '@/export/exportHtml'
import { resolveVariables } from '@/lib/html'
import { cn } from '@/lib/utils'
import { Button } from '@/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'

type PreviewDevice = 'desktop' | 'mobile'

export function PreviewModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const design = useEditor((s) => s.design)
  const blocks = useBlocks()
  const config = useConfig()

  const [device, setDevice] = useState<PreviewDevice>('desktop')
  const [dark, setDark] = useState(false)
  const [plain, setPlain] = useState(false)

  const html = useMemo(
    () =>
      exportHtml(design, blocks, {
        variableMode: 'fallback',
        variableSyntax: config.variableSyntax,
      }),
    [design, blocks, config.variableSyntax],
  )

  const text = useMemo(() => exportText(design, blocks), [design, blocks])

  const from = design.meta?.from || 'Your Company'
  // Resolve merge tokens in the inbox chrome too — a preview that still
  // shows {{{first_name}}} in the subject line is not much of a preview.
  const resolve = (t: string | undefined) =>
    resolveVariables(t ?? '', design.variables, 'fallback', config.variableSyntax)
  const subject = resolve(design.meta?.subject) || '(no subject)'
  const preview = resolve(design.meta?.preview)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent width="70rem">
        <DialogHeader>
          <DialogTitle>Preview</DialogTitle>
          <DialogDescription>
            An inbox simulation. Merge variables are shown with their fallback values.
          </DialogDescription>
        </DialogHeader>

        <div className="rme:flex rme:min-h-0 rme:flex-1 rme:flex-col rme:gap-3 rme:px-5 rme:py-4">
          {/* Toolbar */}
          <div className="rme:flex rme:flex-wrap rme:items-center rme:gap-2">
            <div className="rme:inline-flex rme:h-8 rme:items-center rme:gap-0.5 rme:rounded-lg rme:bg-active/60 rme:p-0.5">
              <Segment
                active={device === 'desktop' && !plain}
                onClick={() => {
                  setDevice('desktop')
                  setPlain(false)
                }}
              >
                <Monitor className="rme:h-4 rme:w-4" />
                Desktop
              </Segment>
              <Segment
                active={device === 'mobile' && !plain}
                onClick={() => {
                  setDevice('mobile')
                  setPlain(false)
                }}
              >
                <Smartphone className="rme:h-4 rme:w-4" />
                Mobile
              </Segment>
            </div>

            <Button
              variant={dark ? 'secondary' : 'ghost'}
              size="default"
              aria-pressed={dark}
              onClick={() => setDark((d) => !d)}
            >
              {dark ? <Moon /> : <Sun />}
              {dark ? 'Dark client' : 'Light client'}
            </Button>

            <Button
              variant={plain ? 'secondary' : 'ghost'}
              size="default"
              aria-pressed={plain}
              onClick={() => setPlain((p) => !p)}
            >
              <FileText />
              Plain text
            </Button>
          </div>

          {/* Simulated client */}
          <div
            className={cn(
              'rme:flex rme:min-h-0 rme:flex-1 rme:flex-col rme:gap-3 rme:rounded-xl rme:border rme:border-line rme:p-3',
              dark ? 'rme:bg-neutral-900' : 'rme:bg-canvas',
            )}
            style={dark ? { colorScheme: 'dark' } : undefined}
          >
            {/* Fake inbox row */}
            <div
              className={cn(
                'rme:flex rme:items-start rme:gap-3 rme:rounded-lg rme:border rme:p-3',
                dark
                  ? 'rme:border-neutral-700 rme:bg-neutral-800'
                  : 'rme:border-line rme:bg-panel',
              )}
            >
              <span
                className={cn(
                  'rme:flex rme:h-8 rme:w-8 rme:shrink-0 rme:items-center rme:justify-center rme:rounded-full',
                  dark ? 'rme:bg-neutral-700' : 'rme:bg-brand-soft',
                )}
              >
                <Mail
                  className={cn('rme:h-4 rme:w-4', dark ? 'rme:text-neutral-300' : 'rme:text-brand')}
                />
              </span>
              <div className="rme:min-w-0 rme:flex-1">
                <div
                  className={cn(
                    'rme:truncate rme:text-xs rme:font-semibold',
                    dark ? 'rme:text-neutral-100' : 'rme:text-ink',
                  )}
                >
                  {from}
                </div>
                <div
                  className={cn(
                    'rme:truncate rme:text-xs',
                    dark ? 'rme:text-neutral-200' : 'rme:text-ink',
                  )}
                >
                  {subject}
                </div>
                <div
                  className={cn(
                    'rme:truncate rme:text-[11px]',
                    dark ? 'rme:text-neutral-400' : 'rme:text-faint',
                  )}
                >
                  {preview || 'No preview text set.'}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="rme:min-h-0 rme:flex-1 rme:overflow-auto rme-scroll">
              {plain ? (
                <pre
                  className={cn(
                    'rme:h-[62vh] rme:overflow-auto rme-scroll rme:rounded-lg rme:border rme:border-line rme:p-4 rme:font-mono rme:text-[11px] rme:leading-relaxed rme:whitespace-pre-wrap rme:break-words',
                    dark
                      ? 'rme:bg-neutral-800 rme:text-neutral-100'
                      : 'rme:bg-white rme:text-neutral-900',
                  )}
                >
                  {text}
                </pre>
              ) : (
                <div
                  className={cn(
                    'rme:mx-auto',
                    device === 'mobile' ? 'rme:w-[375px] rme:max-w-full' : 'rme:w-full',
                  )}
                >
                  <iframe
                    srcDoc={html}
                    title="Email preview"
                    sandbox="allow-same-origin"
                    className="rme:h-[62vh] rme:w-full rme:rounded-lg rme:border rme:border-line rme:bg-white"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Segment({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-state={active ? 'active' : 'inactive'}
      className={cn(
        'rme:inline-flex rme:h-7 rme:items-center rme:justify-center rme:gap-1.5 rme:whitespace-nowrap rme:rounded-md rme:px-2.5 rme:text-xs rme:font-medium rme:text-subtle rme:transition-colors',
        'rme:hover:text-ink',
        'rme:focus-visible:outline-none rme:focus-visible:ring-2 rme:focus-visible:ring-ring/50',
        'rme:data-[state=active]:bg-panel rme:data-[state=active]:text-ink rme:data-[state=active]:shadow-sm',
      )}
    >
      {children}
    </button>
  )
}
