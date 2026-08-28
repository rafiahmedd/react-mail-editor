/**
 * The Tiptap-backed editing surface.
 *
 * This module is loaded lazily by `RichText.tsx` — Tiptap + ProseMirror are
 * roughly two thirds of this package's weight, and an email that is being
 * viewed rather than typed into never needs them. Nothing outside this folder
 * may import it directly.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle, Color, FontSize } from '@tiptap/extension-text-style'
import { Placeholder } from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Braces,
  RemoveFormatting,
  Baseline,
} from 'lucide-react'
import type { DesignVariable } from '@/types/schema'
import type { RichTextProps } from './types'
import { Variable } from './VariableNode'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'
import { Input } from '@/ui/input'
import { Button } from '@/ui/button'


export default function RichTextEditor({
  value,
  onChange,
  active,
  onDeactivate,
  placeholder = 'Type something…',
  singleLine = false,
  style,
  className,
  variables = [],
  linkColor = '#4f46e5',
}: RichTextProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const latest = useRef(value)

  const editor = useEditor(
    {
      editable: active,
      content: value,
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: false,
          codeBlock: false,
          blockquote: false,
          horizontalRule: false,
          dropcursor: false,
          gapcursor: false,
          trailingNode: false,
          bulletList: singleLine ? false : {},
          orderedList: singleLine ? false : {},
          listItem: singleLine ? false : {},
          link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: null, target: null } },
        }),
        TextStyle,
        Color,
        FontSize,
        Variable.configure({ renderLabel: (n) => `{{${n}}}` }),
        Placeholder.configure({ placeholder }),
      ],
      editorProps: {
        attributes: { class: 'rme-rte-content' },
        handleKeyDown: (_view, event) => {
          if (singleLine && event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            onDeactivate?.()
            return true
          }
          if (event.key === 'Escape') {
            onDeactivate?.()
            return true
          }
          return false
        },
      },
      onUpdate: ({ editor: e }) => {
        const html = e.getHTML()
        latest.current = html
        onChange(html)
      },
    },
    [singleLine, placeholder],
  )

  /* Keep the editor in sync when the value changes from outside (undo, etc.) */
  useEffect(() => {
    if (!editor) return
    if (value !== latest.current && value !== editor.getHTML()) {
      latest.current = value
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  useEffect(() => {
    if (!editor) return
    editor.setEditable(active)
    if (active) {
      // Focus at the end so typing continues naturally.
      queueMicrotask(() => editor.commands.focus('end'))
    }
  }, [active, editor])

  /*
   * Click-outside commits the edit.
   *
   * `[data-rme-rte-toolbar]` is on the toolbar AND on every popover it opens.
   * Radix portals popover content to document.body, so a colour swatch, a link
   * field or the variable list is not a DOM descendant of the toolbar — without
   * the marker, mousedown inside any of them read as "clicked away", committed
   * the edit and unmounted the toolbar out from under the click.
   */
  useEffect(() => {
    if (!active) return
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (hostRef.current?.contains(target)) return
      if (target.closest('[data-rme-rte-toolbar]')) return
      onDeactivate?.()
    }
    document.addEventListener('mousedown', onDown, true)
    return () => document.removeEventListener('mousedown', onDown, true)
  }, [active, onDeactivate])

  return (
    <div
      ref={hostRef}
      className={cn('rme-rte', className)}
      style={style}
    >
      {active && editor ? (
        <RteToolbar
          editor={editor}
          anchor={hostRef.current}
          variables={variables}
          linkColor={linkColor}
        />
      ) : null}
      <EditorContent editor={editor} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Floating toolbar                                                    */
/* ------------------------------------------------------------------ */

function RteToolbar({
  editor,
  anchor,
  variables,
  linkColor,
}: {
  editor: Editor
  anchor: HTMLElement | null
  variables: DesignVariable[]
  linkColor: string
}) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [, force] = useState(0)

  useLayoutEffect(() => {
    if (!anchor) return
    const update = () => setRect(anchor.getBoundingClientRect())
    update()
    const ro = new ResizeObserver(update)
    ro.observe(anchor)
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [anchor])

  useEffect(() => {
    const rerender = () => force((n) => n + 1)
    editor.on('selectionUpdate', rerender)
    editor.on('transaction', rerender)
    return () => {
      editor.off('selectionUpdate', rerender)
      editor.off('transaction', rerender)
    }
  }, [editor])

  if (!rect || typeof document === 'undefined') return null

  const top = Math.max(8, rect.top - 46)
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - 460))

  return createPortal(
    <div
      data-rme-rte-toolbar
      className="rme-portal rme:fixed rme:z-[10002] rme:flex rme:items-center rme:gap-0.5 rme:rounded-lg rme:border rme:border-line rme:bg-panel rme:p-1 rme:shadow-xl rme-animate-in"
      style={{ top, left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <TB
        icon={Bold}
        title="Bold"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <TB
        icon={Italic}
        title="Italic"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <TB
        icon={UnderlineIcon}
        title="Underline"
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <TB
        icon={Strikethrough}
        title="Strikethrough"
        active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />

      <Divider />

      <ColorButton editor={editor} />

      {/*
        Ask the SCHEMA whether lists exist, not `editor.can()`.

        `editor.can().toggleBulletList()` looks like a feature probe and is
        actually a crash: when the BulletList extension is not loaded there is
        no `toggleBulletList` on the chain at all, so this threw
        "e.can(...).toggleBulletList is not a function" during render — killing
        the whole editor rather than hiding two buttons.

        It fired on every heading block, because `singleLine` turns
        bulletList/orderedList/listItem off in the StarterKit config above.
        Double-clicking a heading to edit it took the editor down with it.

        `editor.schema.nodes.x` is a plain lookup that cannot throw, and it
        answers the question actually being asked: is this node type available?
        Checked per button so disabling only one of the two cannot regress.
      */}
      {editor.schema.nodes.bulletList ? (
        <TB
          icon={List}
          title="Bulleted list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
      ) : null}
      {editor.schema.nodes.orderedList ? (
        <TB
          icon={ListOrdered}
          title="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
      ) : null}

      <Divider />

      <LinkButton editor={editor} linkColor={linkColor} />
      {variables.length ? <VariableButton editor={editor} variables={variables} /> : null}

      <Divider />

      <TB
        icon={RemoveFormatting}
        title="Clear formatting"
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
      />
    </div>,
    document.body,
  )
}

function Divider() {
  return <span className="rme:mx-0.5 rme:h-5 rme:w-px rme:bg-line" />
}

function TB({
  icon: Icon,
  title,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'rme:flex rme:h-7 rme:w-7 rme:items-center rme:justify-center rme:rounded-md rme:transition-colors',
        active
          ? 'rme:bg-brand rme:text-on-brand'
          : 'rme:text-subtle rme:hover:bg-hover rme:hover:text-ink',
      )}
    >
      <Icon className="rme:h-4 rme:w-4" />
    </button>
  )
}

const SWATCHES = [
  '#0f172a', '#334155', '#64748b', '#94a3b8',
  '#dc2626', '#ea580c', '#d97706', '#16a34a',
  '#0891b2', '#2563eb', '#4f46e5', '#9333ea',
  '#db2777', '#ffffff',
]

function ColorButton({ editor }: { editor: Editor }) {
  const current = (editor.getAttributes('textStyle').color as string) ?? ''
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Text color"
          className="rme:flex rme:h-7 rme:w-7 rme:items-center rme:justify-center rme:rounded-md rme:text-subtle rme:transition-colors rme:hover:bg-hover rme:hover:text-ink"
        >
          <Baseline className="rme:h-4 rme:w-4" style={current ? { color: current } : undefined} />
        </button>
      </PopoverTrigger>
      <PopoverContent data-rme-rte-toolbar="" className="rme:w-auto rme:p-2" align="start">
        <div className="rme:grid rme:grid-cols-7 rme:gap-1">
          {SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              onClick={() => editor.chain().focus().setColor(c).run()}
              className="rme:h-5 rme:w-5 rme:rounded rme:border rme:border-line"
              style={{ background: c }}
            />
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="rme:mt-2 rme:w-full"
          onClick={() => editor.chain().focus().unsetColor().run()}
        >
          Reset color
        </Button>
      </PopoverContent>
    </Popover>
  )
}

function LinkButton({ editor, linkColor }: { editor: Editor; linkColor: string }) {
  const [href, setHref] = useState('')
  const isLink = editor.isActive('link')

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) setHref((editor.getAttributes('link').href as string) ?? '')
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Link"
          className={cn(
            'rme:flex rme:h-7 rme:w-7 rme:items-center rme:justify-center rme:rounded-md rme:transition-colors',
            isLink
              ? 'rme:bg-brand rme:text-on-brand'
              : 'rme:text-subtle rme:hover:bg-hover rme:hover:text-ink',
          )}
        >
          <Link2 className="rme:h-4 rme:w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent data-rme-rte-toolbar="" align="start" className="rme:w-72">
        <div className="rme:flex rme:flex-col rme:gap-2">
          <span className="rme:text-[11px] rme:font-semibold rme:uppercase rme:tracking-wide rme:text-subtle">
            Link URL
          </span>
          <Input
            value={href}
            placeholder="https://example.com"
            onChange={(e) => setHref(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                apply()
              }
            }}
          />
          <div className="rme:flex rme:gap-2">
            <Button size="sm" className="rme:flex-1" onClick={apply}>
              Apply
            </Button>
            {isLink ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => editor.chain().focus().unsetLink().run()}
              >
                <Link2Off className="rme:h-3.5 rme:w-3.5" />
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )

  function apply() {
    const url = href.trim()
    if (!url) {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .setColor(linkColor)
      .run()
  }
}

/**
 * Insert a merge variable at the caret.
 *
 * GROUPED AND SEARCHABLE, because a flat list stops being usable fast. A host
 * app hands this component whatever variables the current template supports —
 * for an LMS enrollment email that is comfortably thirty — and the previous
 * version rendered all of them as one unlabelled 224px scroll box. Finding
 * `{{enrollment.expiry_date}}` in that meant scrolling and reading tokens.
 *
 * The grouping needs no schema change: variable names are conventionally
 * `namespace.field`, so the namespace IS the group. Names without a dot fall
 * back to a single "General" group, so a consumer that does not use the
 * convention sees exactly what it saw before.
 */
function VariableButton({
  editor,
  variables,
}: {
  editor: Editor
  variables: DesignVariable[]
}) {
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()

    // Matched against the label AND the token, because people search for both
    // "first name" and "student.".
    const matched = q
      ? variables.filter(
          (v) =>
            v.name.toLowerCase().includes(q) ||
            (v.label ?? '').toLowerCase().includes(q),
        )
      : variables

    const byGroup = new Map<string, DesignVariable[]>()

    for (const v of matched) {
      const dot = v.name.indexOf('.')
      const key = dot > 0 ? v.name.slice(0, dot) : ''
      const list = byGroup.get(key)
      if (list) list.push(v)
      else byGroup.set(key, [v])
    }

    // Insertion order, which is the order the host supplied — it already
    // reflects whatever grouping that app considers meaningful.
    return Array.from(byGroup, ([key, items]) => ({ key, label: groupLabel(key), items }))
  }, [variables, query])

  const empty = groups.length === 0

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Insert merge variable"
          className="rme:flex rme:h-7 rme:w-7 rme:items-center rme:justify-center rme:rounded-md rme:text-subtle rme:transition-colors rme:hover:bg-hover rme:hover:text-ink"
        >
          <Braces className="rme:h-4 rme:w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent data-rme-rte-toolbar="" align="start" className="rme:w-72 rme:p-0">
        {/* Only worth a search box once there is enough to search through. */}
        {variables.length > 8 ? (
          <div className="rme:border-b rme:border-line rme:p-1.5">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search variables…"
              className="rme:w-full rme:rounded rme:bg-active/50 rme:px-2 rme:py-1.5 rme:text-xs rme:text-ink rme:outline-none rme:placeholder:text-faint"
            />
          </div>
        ) : null}

        <div className="rme:max-h-72 rme:overflow-y-auto rme-scroll rme:p-1.5">
          {empty ? (
            <p className="rme:px-2 rme:py-6 rme:text-center rme:text-xs rme:text-faint">
              No variable matches “{query}”.
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.key || 'general'} className="rme:mb-1 rme:last:mb-0">
                {group.label ? (
                  <div className="rme:sticky rme:top-0 rme:bg-panel rme:px-2 rme:py-1 rme:text-[10px] rme:font-semibold rme:uppercase rme:tracking-wide rme:text-faint">
                    {group.label}
                  </div>
                ) : null}
                {group.items.map((v) => (
                  <button
                    key={v.name}
                    type="button"
                    onClick={() => editor.chain().focus().insertVariable(v.name).run()}
                    className="rme:flex rme:w-full rme:flex-col rme:items-start rme:rounded rme:px-2 rme:py-1.5 rme:text-left rme:transition-colors rme:hover:bg-hover"
                  >
                    <span className="rme:text-xs rme:font-medium rme:text-ink">
                      {v.label || v.name}
                    </span>
                    <span className="rme:font-mono rme:text-[10px] rme:text-faint">
                      {`{{${v.name}}}`}
                    </span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** `student` -> `Student`, `set_password` -> `Set password`, `''` -> no header. */
function groupLabel(key: string): string {
  if (!key) return ''

  const words = key.replace(/_/g, ' ')

  return words.charAt(0).toUpperCase() + words.slice(1)
}
