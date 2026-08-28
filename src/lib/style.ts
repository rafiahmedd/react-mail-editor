import type { BgImage, BorderValue, BoxValue } from '@/types/schema'
import { isTransparent } from './utils'

/** BoxValue → CSS shorthand. */
export function padding(box: BoxValue | undefined): string {
  if (!box) return '0'
  return `${box.top}px ${box.right}px ${box.bottom}px ${box.left}px`
}

export function borderCss(b: BorderValue | undefined): string {
  return b && b.width > 0 ? `${b.width}px ${b.style} ${b.color}` : ''
}

export function bgColor(c: string | undefined): string {
  return isTransparent(c) ? '' : (c as string)
}

export function bgImageCss(b: BgImage | undefined, url: string): string {
  if (!b || !url) return ''
  const safe = url.replace(/['"()\\\n\r]/g, encodeURIComponent)
  return (
    `background-image:url('${safe}');` +
    `background-repeat:${b.repeat};` +
    `background-size:${b.size};` +
    `background-position:${b.position};`
  )
}

/** Build a CSS declaration string from an object, skipping empty values. */
export function css(decls: Record<string, string | number | undefined | false>): string {
  return Object.entries(decls)
    .filter(([, v]) => v !== undefined && v !== '' && v !== false)
    .map(([k, v]) => `${k}:${v};`)
    .join('')
}

/** camelCase → kebab-case for style objects that must become strings. */
export function kebab(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
}
