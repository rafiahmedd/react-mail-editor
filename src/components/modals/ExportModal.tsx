import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Check, Code2, Copy, Download, FileJson, FileText, Info } from 'lucide-react'
import type { VariableMode } from '@/types/blocks'
import { useBlocks, useConfig, useEditor, useRuntime } from '@/store/context'
import { checkCompatibility, exportHtml, exportText, htmlSize } from '@/export/exportHtml'
import { cn, formatBytes } from '@/lib/utils'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Label } from '@/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { Switch } from '@/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'

type ExportTab = 'html' | 'json' | 'text'

const EXTENSION: Record<ExportTab, string> = {
  html: '.html',
  json: '.json',
  text: '.txt',
}

const MIME: Record<ExportTab, string> = {
  html: 'text/html;charset=utf-8',
  json: 'application/json;charset=utf-8',
  text: 'text/plain;charset=utf-8',
}

function slugify(name: string | undefined): string {
  const slug = (name ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'email'
}

export function ExportModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const design = useEditor((s) => s.design)
  const blocks = useBlocks()
  const config = useConfig()
  const runtime = useRuntime()

  const [tab, setTab] = useState<ExportTab>('html')
  const [variableMode, setVariableMode] = useState<VariableMode>('token')
  const [pretty, setPretty] = useState(true)
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current)
    },
    [],
  )

  const rawHtml = useMemo(
    () =>
      exportHtml(design, blocks, {
        variableMode,
        variableSyntax: config.variableSyntax,
      }),
    [design, blocks, variableMode, config.variableSyntax],
  )

  // js-beautify is ~220 KB and only ever runs behind this dialog, so it is
  // fetched on demand. Until it lands we show the raw export, which is already
  // correct — just less readable.
  const [beautify, setBeautify] = useState<Beautifier | null>(null)
  useEffect(() => {
    let cancelled = false
    void loadBeautifier().then((fn) => {
      if (!cancelled) setBeautify(() => fn)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const html = useMemo(() => {
    const formatted = beautify
      ? beautify(rawHtml, {
          indent_size: 2,
          wrap_line_length: 0,
          preserve_newlines: true,
          max_preserve_newlines: 1,
          indent_inner_html: false,
          extra_liners: [],
        })
      : rawHtml
    return pretty ? formatted : formatted.replace(/>\s+</g, '><')
  }, [rawHtml, pretty, beautify])

  const json = useMemo(() => JSON.stringify(design, null, 2), [design])
  const text = useMemo(() => exportText(design, blocks), [design, blocks])

  const issues = useMemo(() => checkCompatibility(design, rawHtml), [design, rawHtml])
  const warnings = issues.filter((i) => i.level === 'warn').length

  const output = tab === 'html' ? html : tab === 'json' ? json : text
  const size = htmlSize(output)

  const filename = `${slugify(design.name)}${EXTENSION[tab]}`

  const copy = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      runtime.notify('Clipboard unavailable in this browser', 'error')
      return
    }
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      runtime.notify('Copied to clipboard', 'success')
      if (copyTimer.current) clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), 1500)
    } catch {
      runtime.notify('Could not copy to clipboard', 'error')
    }
  }

  const download = () => {
    if (typeof document === 'undefined' || typeof URL === 'undefined') return
    const blob = new Blob([output], { type: MIME[tab] })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    runtime.notify(`Downloaded ${filename}`, 'success')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent width="56rem">
        <DialogHeader>
          <DialogTitle>Export</DialogTitle>
          <DialogDescription>
            Copy or download the email as client-safe HTML, the design JSON, or a plain-text
            alternative.
          </DialogDescription>
        </DialogHeader>

        <div className="rme:flex rme:min-h-0 rme:flex-1 rme:flex-col rme:gap-3 rme:px-5 rme:py-4">
          {/* Options */}
          <div className="rme:flex rme:flex-wrap rme:items-center rme:gap-4">
            <div className="rme:flex rme:items-center rme:gap-2">
              <Label htmlFor="rme-export-vars">Merge variables</Label>
              <Select
                value={variableMode}
                onValueChange={(v) => setVariableMode(v as VariableMode)}
              >
                <SelectTrigger id="rme-export-vars" className="rme:w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="token">Keep merge tokens</SelectItem>
                  <SelectItem value="fallback">Use fallback values</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rme:flex rme:items-center rme:gap-2">
              <Switch
                id="rme-export-pretty"
                checked={pretty}
                onCheckedChange={setPretty}
                disabled={tab !== 'html'}
              />
              <Label htmlFor="rme-export-pretty">Pretty print</Label>
            </div>
          </div>

          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as ExportTab)}
            className="rme:min-h-0 rme:flex-1"
          >
            <TabsList>
              <TabsTrigger value="html">
                <Code2 />
                HTML
              </TabsTrigger>
              <TabsTrigger value="json">
                <FileJson />
                JSON
              </TabsTrigger>
              <TabsTrigger value="text">
                <FileText />
                Plain text
              </TabsTrigger>
            </TabsList>

            <div className="rme:flex rme:flex-wrap rme:items-center rme:gap-1.5 rme:pt-1">
              <Badge variant="muted">{formatBytes(size)}</Badge>
              <Badge variant={warnings ? 'default' : 'outline'}>
                {warnings} warning{warnings === 1 ? '' : 's'}
              </Badge>
              {tab === 'html' ? (
                <span className="rme:text-[11px] rme:text-faint">
                  Gmail clips messages above ~102 KB.
                </span>
              ) : null}
            </div>

            <TabsContent value="html">
              <CodeBox value={html} />
            </TabsContent>
            <TabsContent value="json">
              <CodeBox value={json} />
            </TabsContent>
            <TabsContent value="text">
              <CodeBox value={text} />
            </TabsContent>
          </Tabs>

          {/* Checks */}
          <div className="rme:flex rme:flex-col rme:gap-1.5">
            <h3 className="rme:text-[11px] rme:font-semibold rme:uppercase rme:tracking-wide rme:text-faint">
              Checks
            </h3>
            {issues.length ? (
              <ul className="rme:flex rme:max-h-32 rme:flex-col rme:gap-1 rme:overflow-y-auto rme-scroll">
                {issues.map((issue, i) => (
                  <li
                    key={`${issue.level}-${i}`}
                    className={cn(
                      'rme:flex rme:items-start rme:gap-1.5 rme:text-[11px] rme:leading-relaxed',
                      issue.level === 'warn' ? 'rme:text-danger' : 'rme:text-subtle',
                    )}
                  >
                    {issue.level === 'warn' ? (
                      <AlertTriangle className="rme:mt-0.5 rme:h-3.5 rme:w-3.5 rme:shrink-0" />
                    ) : (
                      <Info className="rme:mt-0.5 rme:h-3.5 rme:w-3.5 rme:shrink-0" />
                    )}
                    <span>{issue.message}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rme:flex rme:items-center rme:gap-1.5 rme:text-[11px] rme:text-emerald-600">
                <Check className="rme:h-3.5 rme:w-3.5 rme:shrink-0" />
                No issues found.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <span className="rme:mr-auto rme:truncate rme:font-mono rme:text-[11px] rme:text-faint">
            {filename}
          </span>
          <Button variant="outline" onClick={copy}>
            {copied ? <Check /> : <Copy />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button onClick={download}>
            <Download />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CodeBox({ value }: { value: string }) {
  return (
    <div className="rme:mt-2 rme:overflow-hidden rme:rounded-lg rme:border rme:border-line rme:bg-canvas">
      <pre className="rme:max-h-[46vh] rme:overflow-auto rme-scroll rme:p-3 rme:font-mono rme:text-[11px] rme:leading-relaxed rme:whitespace-pre-wrap rme:break-all rme:text-ink">
        {value}
      </pre>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Lazy HTML formatter                                                 */
/* ------------------------------------------------------------------ */

type Beautifier = (source: string, options: Record<string, unknown>) => string

let beautifierPromise: Promise<Beautifier> | null = null

/** Fetch js-beautify once and share the promise across dialog openings. */
export function loadBeautifier(): Promise<Beautifier> {
  beautifierPromise ??= import('js-beautify').then(
    (m) => (m.html ?? (m as { default?: { html: Beautifier } }).default?.html) as Beautifier,
  )
  return beautifierPromise
}
