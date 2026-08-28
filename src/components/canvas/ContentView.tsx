import { useDraggable } from '@dnd-kit/core'
import {
  ChevronDown,
  ChevronUp,
  Copy,
  GripVertical,
  Lock,
  Trash2,
} from 'lucide-react'
import type { Content } from '@/types/schema'
import { useBlocks, useEditor, useEditorStoreApi, useRuntime } from '@/store/context'
import { cn } from '@/lib/utils'
import { NodeButton, NodeToolbar } from './NodeToolbar'
import { ContentSlot } from './DropSlot'

export function ContentView({
  content,
  columnId,
  index,
  count,
}: {
  content: Content
  columnId: string
  index: number
  count: number
}) {
  const store = useEditorStoreApi()
  const blocks = useBlocks()
  const runtime = useRuntime()

  const selected = useEditor(
    (s) => s.selection.kind === 'content' && s.selection.id === content.id,
  )
  const hovered = useEditor((s) => s.hoverId === content.id)
  const editing = useEditor((s) => s.editingId === content.id)
  const preview = useEditor((s) => s.preview)
  const device = useEditor((s) => s.device)
  const bodyValues = useEditor((s) => s.design.body.values)
  const variables = useEditor((s) => s.design.variables ?? [])

  const def = blocks.get(content.type)

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } =
    useDraggable({
      id: content.id,
      disabled: preview || content.locked,
      data: { kind: 'content', id: content.id },
    })

  if (!def) {
    return (
      <div className="rme:m-2 rme:rounded rme:border rme:border-dashed rme:border-danger rme:p-3 rme:text-xs rme:text-danger">
        Unknown block type “{content.type}”
      </div>
    )
  }

  const Render = def.render
  const showChrome = !preview && (hovered || selected)
  const values =
    device === 'mobile' && content.mobile
      ? { ...content.values, ...content.mobile }
      : content.values

  return (
    <>
      <ContentSlot columnId={columnId} index={index} first={index === 0} />
      <div
        ref={setNodeRef}
        data-rme-node={content.id}
        className={cn(
          'rme:relative rme:transition-[outline-color,opacity]',
          'rme:outline rme:outline-1 rme:-outline-offset-1 rme:outline-transparent',
          !preview && hovered && !selected && 'rme:outline-dashed rme:outline-brand/50',
          selected && 'rme:outline-2 rme:outline-brand',
          isDragging && 'rme:opacity-40',
        )}
        onMouseOver={(e) => {
          if (preview) return
          e.stopPropagation()
          store.getState().setHover(content.id)
        }}
        onMouseLeave={() => {
          if (store.getState().hoverId === content.id) store.getState().setHover(null)
        }}
        onClick={(e) => {
          if (preview) return
          e.stopPropagation()
          store.getState().selectAndInspect('content', content.id)
        }}
        onDoubleClick={(e) => {
          if (preview || !def.inlineEditable) return
          e.stopPropagation()
          store.getState().setEditing(content.id)
        }}
      >
        {showChrome ? (
          <NodeToolbar side="top-right">
            {content.locked ? (
              <NodeButton
                icon={Lock}
                title="Unlock"
                onClick={() => store.getState().toggleLock('content', content.id)}
              />
            ) : (
              <span
                ref={setActivatorNodeRef}
                {...listeners}
                {...attributes}
                title="Drag to move"
                className="rme:flex rme:h-5 rme:w-4 rme:cursor-grab rme:items-center rme:justify-center rme:active:cursor-grabbing"
              >
                <GripVertical className="rme:h-3.5 rme:w-3.5" />
              </span>
            )}
            <NodeButton
              icon={ChevronUp}
              title="Move up"
              disabled={index === 0}
              onClick={() => store.getState().nudgeContent(content.id, -1)}
            />
            <NodeButton
              icon={ChevronDown}
              title="Move down"
              disabled={index === count - 1}
              onClick={() => store.getState().nudgeContent(content.id, 1)}
            />
            <NodeButton
              icon={Copy}
              title="Duplicate"
              onClick={() => store.getState().duplicateNode('content', content.id)}
            />
            <NodeButton
              icon={Trash2}
              title="Delete"
              onClick={() => {
                store.getState().removeNode('content', content.id)
                runtime.notify(`${def.label} deleted`, 'info')
              }}
            />
          </NodeToolbar>
        ) : null}

        <Render
          values={values}
          block={content}
          selected={selected}
          editing={editing}
          device={device}
          preview={preview}
          body={bodyValues}
          variables={variables}
          uploadImage={runtime.uploadImage}
          setEditing={(on) => store.getState().setEditing(on ? content.id : null)}
          update={(patch, key) =>
            store
              .getState()
              .updateValues(
                'content',
                content.id,
                patch as Record<string, unknown>,
                key,
              )
          }
        />
      </div>
      {index === count - 1 ? (
        <ContentSlot columnId={columnId} index={count} />
      ) : null}
    </>
  )
}
