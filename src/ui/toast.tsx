import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

export type ToastKind = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  message: string
  kind: ToastKind
}

export interface ToastContextValue {
  /** Push a toast onto the stack. Auto-dismisses after ~3.2s. */
  notify: (message: string, kind?: ToastKind) => void
  /** Remove a toast early. */
  dismiss: (id: string) => void
  toasts: ToastItem[]
}

const TOAST_DURATION = 3200

const ToastContext = React.createContext<ToastContextValue | null>(null)

const kindClass: Record<ToastKind, string> = {
  success: 'rme:border-l-2 rme:border-l-emerald-500',
  error: 'rme:border-l-2 rme:border-l-danger',
  info: 'rme:border-l-2 rme:border-l-brand',
}

let seq = 0
function nextId(): string {
  seq = (seq + 1) % 1_000_000
  return `rme-toast-${Date.now().toString(36)}-${seq.toString(36)}`
}

export function ToastProvider({ children }: { children?: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])
  const [mounted, setMounted] = React.useState(false)
  const timers = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  React.useEffect(() => {
    setMounted(true)
    const pending = timers.current
    return () => {
      pending.forEach((t) => clearTimeout(t))
      pending.clear()
    }
  }, [])

  const dismiss = React.useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notify = React.useCallback(
    (message: string, kind: ToastKind = 'info') => {
      const id = nextId()
      setToasts((prev) => [...prev, { id, message, kind }])
      const timer = setTimeout(() => {
        timers.current.delete(id)
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, TOAST_DURATION)
      timers.current.set(id, timer)
    },
    [],
  )

  const value = React.useMemo<ToastContextValue>(
    () => ({ notify, dismiss, toasts }),
    [notify, dismiss, toasts],
  )

  const stack =
    mounted && typeof document !== 'undefined'
      ? createPortal(
          <div
            data-slot="toast-stack"
            className="rme-portal rme:fixed rme:bottom-4 rme:right-4 rme:z-[10001] rme:flex rme:flex-col rme:gap-2"
          >
            {toasts.map((toast) => (
              <div
                key={toast.id}
                role="status"
                aria-live="polite"
                data-slot="toast"
                onClick={() => dismiss(toast.id)}
                className={cn(
                  'rme-animate-in',
                  'rme:pointer-events-auto rme:max-w-[320px] rme:cursor-pointer rme:rounded-lg rme:border rme:border-line rme:bg-panel rme:px-3 rme:py-2 rme:text-xs rme:text-ink rme:shadow-lg',
                  kindClass[toast.kind],
                )}
              >
                {toast.message}
              </div>
            ))}
          </div>,
          document.body,
        )
      : null

  return (
    <ToastContext.Provider value={value}>
      {children}
      {stack}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast() must be used inside a <ToastProvider>.')
  }
  return ctx
}
