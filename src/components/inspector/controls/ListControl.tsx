import { useState } from 'react'
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { SOCIAL_NETWORKS, findNetwork } from '@/config/social'
import type { SelectOption } from '@/types/inspector'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { ImageControl } from './ImageControl'
import { SelectControl } from './SelectControl'
import { cn } from '@/lib/utils'

export type ListItemKind = 'social' | 'menu' | 'row' | 'icon'

export interface ListControlProps {
  value: unknown[]
  onChange: (next: unknown[]) => void
  itemKind: ListItemKind
  upload: (file: File) => Promise<string>
  className?: string
}

type Bag = Record<string, unknown>

const NETWORK_OPTIONS: SelectOption[] = SOCIAL_NETWORKS.map((n) => ({
  label: n.label,
  value: n.id,
  hint: n.color,
}))

const str = (v: unknown): string => (typeof v === 'string' ? v : '')

function defaultItem(kind: ListItemKind, items: unknown[]): unknown {
  switch (kind) {
    case 'social':
      return { network: 'facebook', url: 'https://facebook.com/' }
    case 'menu':
      return { text: 'Link', url: '#' }
    case 'icon':
      return { icon: '', title: 'Title', text: 'Description' }
    case 'row': {
      const first = items[0]
      const width = Array.isArray(first) && first.length > 0 ? first.length : 3
      return Array.from({ length: width }, () => '')
    }
  }
}

/** Reorderable item editor — arrow buttons instead of drag, by design. */
export function ListControl({
  value,
  onChange,
  itemKind,
  upload,
  className,
}: ListControlProps) {
  const items: unknown[] = Array.isArray(value) ? value : []

  const replace = (index: number, next: unknown) => {
    const copy = items.slice()
    copy[index] = next
    onChange(copy)
  }

  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= items.length) return
    const copy = items.slice()
    const [item] = copy.splice(index, 1)
    copy.splice(target, 0, item)
    onChange(copy)
  }

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div className={cn('rme:space-y-1.5', className)}>
      {items.map((item, i) => (
        <div key={i} className="rme:rounded-lg rme:border rme:border-line rme:p-2 rme:space-y-1.5">
          <div className="rme:flex rme:items-center rme:gap-1">
            <span className="rme:text-[10px] rme:font-semibold rme:uppercase rme:tracking-wide rme:text-faint">
              {itemKind === 'row' ? `Row ${i + 1}` : `Item ${i + 1}`}
            </span>
            <span className="rme:ml-auto rme:flex rme:items-center rme:gap-0.5">
              <Button
                type="button"
                size="iconSm"
                variant="ghost"
                title="Move up"
                aria-label="Move up"
                disabled={i === 0}
                onClick={() => move(i, -1)}
              >
                <ArrowUp className="rme:h-3.5 rme:w-3.5" />
              </Button>
              <Button
                type="button"
                size="iconSm"
                variant="ghost"
                title="Move down"
                aria-label="Move down"
                disabled={i === items.length - 1}
                onClick={() => move(i, 1)}
              >
                <ArrowDown className="rme:h-3.5 rme:w-3.5" />
              </Button>
              <Button
                type="button"
                size="iconSm"
                variant="ghost"
                title="Delete"
                aria-label="Delete"
                className="rme:text-danger rme:hover:bg-danger-soft"
                onClick={() => remove(i)}
              >
                <Trash2 className="rme:h-3.5 rme:w-3.5" />
              </Button>
            </span>
          </div>

          <ItemEditor
            kind={itemKind}
            item={item}
            upload={upload}
            onChange={(next) => replace(i, next)}
          />
        </div>
      ))}

      <Button
        type="button"
        size="sm"
        variant="outline"
        className="rme:w-full"
        onClick={() => onChange([...items, defaultItem(itemKind, items)])}
      >
        <Plus className="rme:h-3.5 rme:w-3.5" />
        Add {itemKind === 'row' ? 'row' : 'item'}
      </Button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Per-kind editors                                                    */
/* ------------------------------------------------------------------ */

function ItemEditor({
  kind,
  item,
  onChange,
  upload,
}: {
  kind: ListItemKind
  item: unknown
  onChange: (next: unknown) => void
  upload: (file: File) => Promise<string>
}) {
  switch (kind) {
    case 'social':
      return <SocialItemEditor item={(item as Bag) ?? {}} onChange={onChange} />
    case 'menu':
      return <MenuItemEditor item={(item as Bag) ?? {}} onChange={onChange} />
    case 'icon':
      return <IconItemEditor item={(item as Bag) ?? {}} onChange={onChange} upload={upload} />
    case 'row':
      return <RowItemEditor cells={Array.isArray(item) ? (item as unknown[]) : []} onChange={onChange} />
  }
}

function SocialItemEditor({
  item,
  onChange,
}: {
  item: Bag
  onChange: (next: unknown) => void
}) {
  const network = str(item.network) || 'facebook'
  const net = findNetwork(network)
  const [showCustom, setShowCustom] = useState(() => Boolean(str(item.icon)))

  return (
    <div className="rme:space-y-1.5">
      <SelectControl
        value={network}
        options={NETWORK_OPTIONS}
        onChange={(next) => onChange({ ...item, network: String(next) })}
      />
      <Input
        type="text"
        spellCheck={false}
        value={str(item.url)}
        placeholder={net?.placeholder ?? 'https://example.com'}
        onChange={(e) => onChange({ ...item, url: e.target.value })}
      />
      <button
        type="button"
        onClick={() => setShowCustom((v) => !v)}
        className="rme:flex rme:items-center rme:gap-1 rme:text-[10px] rme:text-faint rme:transition-colors rme:hover:text-ink"
      >
        <ChevronDown
          className={cn('rme:h-3 rme:w-3 rme:transition-transform', showCustom && 'rme:rotate-180')}
        />
        Custom icon
      </button>
      {showCustom ? (
        <Input
          type="text"
          spellCheck={false}
          value={str(item.icon)}
          placeholder="https://…/icon.png"
          onChange={(e) => onChange({ ...item, icon: e.target.value })}
        />
      ) : null}
    </div>
  )
}

function MenuItemEditor({ item, onChange }: { item: Bag; onChange: (next: unknown) => void }) {
  return (
    <div className="rme:space-y-1.5">
      <Input
        type="text"
        value={str(item.text)}
        placeholder="Label"
        onChange={(e) => onChange({ ...item, text: e.target.value })}
      />
      <Input
        type="text"
        spellCheck={false}
        value={str(item.url)}
        placeholder="https://example.com"
        onChange={(e) => onChange({ ...item, url: e.target.value })}
      />
    </div>
  )
}

function IconItemEditor({
  item,
  onChange,
  upload,
}: {
  item: Bag
  onChange: (next: unknown) => void
  upload: (file: File) => Promise<string>
}) {
  return (
    <div className="rme:space-y-1.5">
      <ImageControl
        value={str(item.icon)}
        upload={upload}
        onChange={(icon) => onChange({ ...item, icon })}
      />
      <Input
        type="text"
        value={str(item.title)}
        placeholder="Title"
        onChange={(e) => onChange({ ...item, title: e.target.value })}
      />
      <Input
        type="text"
        value={str(item.text)}
        placeholder="Description"
        onChange={(e) => onChange({ ...item, text: e.target.value })}
      />
    </div>
  )
}

function RowItemEditor({
  cells,
  onChange,
}: {
  cells: unknown[]
  onChange: (next: unknown) => void
}) {
  const write = (index: number, text: string) => {
    const copy = cells.map(str)
    copy[index] = text
    onChange(copy)
  }

  return (
    <div className="rme:space-y-1.5">
      <div className="rme:flex rme:flex-wrap rme:gap-1">
        {cells.map((cell, i) => (
          <Input
            key={i}
            type="text"
            value={str(cell)}
            placeholder={`Cell ${i + 1}`}
            onChange={(e) => write(i, e.target.value)}
            className="rme:h-7 rme:w-[calc(50%-2px)] rme:text-[11px]"
          />
        ))}
      </div>
      <div className="rme:flex rme:gap-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="rme:flex-1 rme:text-[11px]"
          onClick={() => onChange([...cells.map(str), ''])}
        >
          + cell
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="rme:flex-1 rme:text-[11px]"
          disabled={cells.length <= 1}
          onClick={() => onChange(cells.map(str).slice(0, -1))}
        >
          − cell
        </Button>
      </div>
    </div>
  )
}
