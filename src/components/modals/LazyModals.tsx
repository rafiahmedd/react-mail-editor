import { ExportModal, loadBeautifier } from './ExportModal'
import { PreviewModal } from './PreviewModal'
import { TemplatesModal } from './TemplatesModal'
import { VariablesModal } from './VariablesModal'
import { MetaModal } from './MetaModal'

/**
 * Modal host.
 *
 * The dialogs themselves are small (~21 KB combined) so they stay in the entry
 * bundle — splitting them only bought a pile of extra network round-trips. What
 * they *pull in* is another matter: the export dialog's HTML formatter is ~220
 * KB and is fetched on demand from inside `ExportModal`, warmed here on idle.
 *
 * Only the open dialog is mounted, so four unused Radix portals never exist.
 */
export type ModalName = 'export' | 'templates' | 'variables' | 'preview' | 'meta'

export function prefetchModalsWhenIdle(): () => void {
  if (typeof window === 'undefined') return () => undefined

  const ric = window.requestIdleCallback
  if (typeof ric === 'function') {
    const handle = ric(() => void loadBeautifier(), { timeout: 6000 })
    return () => window.cancelIdleCallback?.(handle)
  }
  const timer = window.setTimeout(() => void loadBeautifier(), 2500)
  return () => window.clearTimeout(timer)
}

export function Modals({
  modal,
  onClose,
}: {
  modal: ModalName | null
  onClose: () => void
}) {
  if (!modal) return null

  const onOpenChange = (open: boolean) => {
    if (!open) onClose()
  }

  return (
    <>
      {modal === 'export' ? <ExportModal open onOpenChange={onOpenChange} /> : null}
      {modal === 'preview' ? <PreviewModal open onOpenChange={onOpenChange} /> : null}
      {modal === 'templates' ? <TemplatesModal open onOpenChange={onOpenChange} /> : null}
      {modal === 'variables' ? <VariablesModal open onOpenChange={onOpenChange} /> : null}
      {modal === 'meta' ? <MetaModal open onOpenChange={onOpenChange} /> : null}
    </>
  )
}
