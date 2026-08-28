import { Suspense, lazy, useEffect, type ComponentType } from 'react'
import { cn } from '@/lib/utils'
import type { RichTextProps } from './types'

export type { RichTextProps } from './types'

/**
 * Rich text, split in two.
 *
 * Most of the time a text block is being *looked at*, not typed into — the
 * canvas renders it, the preview renders it, the layers tree ignores it. Tiptap
 * and ProseMirror are ~900 KB of source and are only needed for the few seconds
 * a caret is actually inside a block, so the editing surface lives in a
 * separate chunk that is fetched the first time someone starts editing.
 *
 * The fallback is the same static markup the wrapper already renders, so the
 * swap is visually seamless: no layout shift, no flash of empty content.
 */
const LazyEditor = lazy(() => import('./RichTextEditor')) as ComponentType<RichTextProps>

let pending: Promise<unknown> | null = null

/**
 * Warm the editor chunk ahead of time. Called on idle from the editor shell and
 * on pointer-enter of an editable block, so by the time a double-click lands
 * the module is almost always already parsed.
 */
export function prefetchRichText(): Promise<unknown> {
  pending ??= import('./RichTextEditor')
  return pending
}

/** Schedule `prefetchRichText` for the next idle slot (browser only). */
export function prefetchRichTextWhenIdle(): () => void {
  if (typeof window === 'undefined') return () => undefined

  const ric = window.requestIdleCallback
  if (typeof ric === 'function') {
    const handle = ric(() => void prefetchRichText(), { timeout: 4000 })
    return () => window.cancelIdleCallback?.(handle)
  }
  const timer = window.setTimeout(() => void prefetchRichText(), 1500)
  return () => window.clearTimeout(timer)
}

export function RichText(props: RichTextProps) {
  const { value, editable, active, onActivate, style, className } = props

  // Editing is unreachable in preview mode, so don't pay for the chunk there.
  useEffect(() => {
    if (!editable) return
    return prefetchRichTextWhenIdle()
  }, [editable])

  const staticView = (
    <div
      className={cn(editable && 'rme-rte', className)}
      style={style}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  )

  if (!editable) return staticView

  if (!active) {
    return (
      <div
        className={cn('rme-rte', className)}
        style={style}
        onPointerEnter={() => void prefetchRichText()}
        onDoubleClick={(e) => {
          e.stopPropagation()
          onActivate?.()
        }}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    )
  }

  return (
    <Suspense fallback={staticView}>
      <LazyEditor {...props} />
    </Suspense>
  )
}
