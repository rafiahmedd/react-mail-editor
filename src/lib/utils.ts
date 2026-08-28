import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Every utility in this package is namespaced (`rme:flex`), so tailwind-merge
 * has to be told about the prefix or it will not dedupe conflicting classes.
 */
const twMerge = extendTailwindMerge({ prefix: 'rme' })

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Stable, collision-resistant node ids. */
let counter = 0
export function uid(prefix = 'n'): string {
  counter = (counter + 1) % 1_000_000
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${rand}`
}

/** Short, CSS-class-safe id derived from a node id (for mobile CSS hooks). */
export function classId(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return Math.abs(h).toString(36).slice(0, 7)
}

export function deepClone<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value)
    } catch {
      /* fall through — functions/symbols are not cloneable */
    }
  }
  return JSON.parse(JSON.stringify(value)) as T
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  ms: number,
): ((...args: A) => void) & { cancel: () => void; flush: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null
  let lastArgs: A | null = null
  const wrapped = (...args: A) => {
    lastArgs = args
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      if (lastArgs) fn(...lastArgs)
    }, ms)
  }
  wrapped.cancel = () => {
    if (timer) clearTimeout(timer)
    timer = null
  }
  wrapped.flush = () => {
    if (timer && lastArgs) {
      clearTimeout(timer)
      timer = null
      fn(...lastArgs)
    }
  }
  return wrapped
}

/** Read a possibly-dotted path from an object. */
export function getPath(obj: unknown, path: string): unknown {
  if (obj == null) return undefined
  if (!path.includes('.')) return (obj as Record<string, unknown>)[path]
  return path
    .split('.')
    .reduce<unknown>(
      (acc, key) => (acc == null ? undefined : (acc as Record<string, unknown>)[key]),
      obj,
    )
}

/** Immutably write a possibly-dotted path, returning a new patch object. */
export function setPath(
  source: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const parts = path.split('.')
  if (parts.length === 1) return { [parts[0]]: value }
  const [head, ...rest] = parts
  const branch = { ...((source[head] as Record<string, unknown>) ?? {}) }
  let cursor = branch
  for (let i = 0; i < rest.length - 1; i++) {
    cursor[rest[i]] = { ...((cursor[rest[i]] as Record<string, unknown>) ?? {}) }
    cursor = cursor[rest[i]] as Record<string, unknown>
  }
  cursor[rest[rest.length - 1]] = value
  return { [head]: branch }
}

export function isTransparent(color: string | undefined): boolean {
  return !color || color === 'transparent' || color === 'rgba(0,0,0,0)'
}

/** `#rrggbb` → `rgba(r,g,b,a)`; passes through anything it cannot parse. */
export function hexToRgba(hex: string, alpha: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim())
  if (!m) return hex
  const [r, g, b] = [m[1], m[2], m[3]].map((h) => parseInt(h, 16))
  return `rgba(${r},${g},${b},${alpha})`
}

/** Relative luminance — used to pick readable overlay text on a swatch. */
export function isLight(hex: string): boolean {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim())
  if (!m) return true
  const [r, g, b] = [m[1], m[2], m[3]].map((h) => parseInt(h, 16) / 255)
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.45
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}
