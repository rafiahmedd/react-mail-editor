import { useMemo } from 'react'
import { Braces, Plus, Trash2 } from 'lucide-react'
import type { DesignVariable } from '@/types/schema'
import { useConfig, useEditor, useEditorStoreApi } from '@/store/context'
import { formatToken } from '@/lib/html'
import { Button } from '@/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'

const TYPES: DesignVariable['type'][] = ['string', 'number', 'url', 'date']

/** Merge tokens only tolerate a conservative character set across ESPs. */
function sanitizeName(raw: string): string {
  return raw.replace(/[^A-Za-z0-9_.]/g, '')
}

function nextName(existing: DesignVariable[]): string {
  const taken = new Set(existing.map((v) => v.name))
  let n = existing.length + 1
  while (taken.has(`variable_${n}`)) n++
  return `variable_${n}`
}

export function VariablesModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const store = useEditorStoreApi()
  const config = useConfig()
  const variables = useEditor((s) => s.design.variables) ?? []

  const duplicates = useMemo(() => {
    const seen = new Map<string, number>()
    for (const v of variables) seen.set(v.name, (seen.get(v.name) ?? 0) + 1)
    return new Set([...seen.entries()].filter(([, n]) => n > 1).map(([name]) => name))
  }, [variables])

  const commit = (next: DesignVariable[]) => store.getState().updateVariables(next)

  const patch = (index: number, values: Partial<DesignVariable>) =>
    commit(variables.map((v, i) => (i === index ? { ...v, ...values } : v)))

  const remove = (index: number) => commit(variables.filter((_, i) => i !== index))

  const add = () =>
    commit([
      ...variables,
      { name: nextName(variables), label: '', type: 'string', fallback: '' },
    ])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent width="42rem">
        <DialogHeader>
          <DialogTitle>Merge variables</DialogTitle>
          <DialogDescription>
            Variables can be inserted into any text block from the rich-text toolbar. They are
            emitted as merge tokens on export, so your sending platform fills them in — or are
            replaced by their fallback values when you export with “Use fallback values”.
          </DialogDescription>
        </DialogHeader>

        <div className="rme:flex rme:min-h-0 rme:flex-1 rme:flex-col rme:px-5 rme:py-4">
          {variables.length ? (
            <>
              <div className="rme:grid rme:grid-cols-[1.2fr_1.2fr_0.8fr_1.2fr_auto] rme:gap-2 rme:pb-1.5">
                <Label>Name</Label>
                <Label>Label</Label>
                <Label>Type</Label>
                <Label>Fallback</Label>
                <span className="rme:w-7" />
              </div>

              <div className="rme:flex rme:min-h-0 rme:flex-1 rme:flex-col rme:gap-2 rme:overflow-y-auto rme-scroll rme:pr-0.5">
                {variables.map((variable, i) => {
                  return (
                    <div key={i} className="rme:flex rme:flex-col rme:gap-1">
                      <div className="rme:grid rme:grid-cols-[1.2fr_1.2fr_0.8fr_1.2fr_auto] rme:items-center rme:gap-2">
                        <Input
                          value={variable.name}
                          aria-label="Variable name"
                          placeholder="first_name"
                          onChange={(e) => patch(i, { name: sanitizeName(e.target.value) })}
                        />
                        <Input
                          value={variable.label ?? ''}
                          aria-label="Variable label"
                          placeholder="First name"
                          onChange={(e) => patch(i, { label: e.target.value })}
                        />
                        <Select
                          value={variable.type}
                          onValueChange={(v) =>
                            patch(i, { type: v as DesignVariable['type'] })
                          }
                        >
                          <SelectTrigger aria-label="Variable type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TYPES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          value={variable.fallback}
                          aria-label="Fallback value"
                          placeholder="there"
                          onChange={(e) => patch(i, { fallback: e.target.value })}
                        />
                        <Button
                          variant="ghost"
                          size="iconSm"
                          aria-label={`Delete ${variable.name || 'variable'}`}
                          onClick={() => remove(i)}
                        >
                          <Trash2 className="rme:text-danger" />
                        </Button>
                      </div>

                      <div className="rme:flex rme:flex-wrap rme:items-center rme:gap-2 rme:pl-0.5">
                        <span className="rme:font-mono rme:text-[10px] rme:text-faint">
                          {formatToken(variable.name || 'name', config.variableSyntax)}
                        </span>
                        {!variable.name.trim() ? (
                          <span className="rme:text-[10px] rme:text-danger">
                            Name cannot be empty.
                          </span>
                        ) : duplicates.has(variable.name) ? (
                          <span className="rme:text-[10px] rme:text-danger">
                            Duplicate name — only the first will resolve.
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="rme:flex rme:flex-col rme:items-center rme:justify-center rme:gap-2 rme:py-10 rme:text-center">
              <Braces className="rme:h-8 rme:w-8 rme:text-faint" />
              <p className="rme:text-xs rme:font-medium rme:text-ink">No variables yet</p>
              <p className="rme:max-w-sm rme:text-[11px] rme:leading-relaxed rme:text-subtle">
                Add one to personalise the email — for example{' '}
                <span className="rme:font-mono rme:text-faint">
                  {formatToken('first_name', config.variableSyntax)}
                </span>
                .
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <span className="rme:mr-auto rme:text-[11px] rme:text-faint">
            {variables.length} variable{variables.length === 1 ? '' : 's'}
          </span>
          <Button variant="outline" onClick={add}>
            <Plus />
            Add variable
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
