import type { DesignVariable } from '@/types/schema'
import type { VariableMode, VariableSyntax } from '@/types/blocks'

export function esc(s: string | undefined | null): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Allow only safe URL schemes in exported `href`/`src` values. Relative and
 * anchor URLs pass through; `javascript:`, `data:text/html`, `vbscript:` are
 * dropped. Set `allowDataImage` on `<img src>` to permit inline images.
 */
const SAFE_SCHEME = /^(https?|mailto|tel|sms):/i
export function safeUrl(url: string | null | undefined, allowDataImage = false): string {
  const u = (url ?? '').trim()
  if (!u) return ''
  if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) return u // relative / anchor / query
  if (SAFE_SCHEME.test(u)) return u
  if (allowDataImage && /^data:image\/(png|jpe?g|gif|webp|svg\+xml)[;,]/i.test(u)) return u
  return ''
}

/** Strip rich-text block wrappers so a heading stays on one line. */
export function inlineText(html: string): string {
  return html
    .replace(/<\/p>\s*<p[^>]*>/gi, '<br />')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '')
    .replace(/<\/?div[^>]*>/gi, '')
}

/** Very small allow-list sanitiser for the raw-HTML block and rich text. */
const BLOCKED_TAGS = /<\/?(script|iframe|object|embed|link|meta|base|form|input)\b[^>]*>/gi
const EVENT_ATTRS = /\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi
const JS_URLS = /((?:href|src|xlink:href)\s*=\s*)(["']?)\s*(?:javascript|vbscript|data:text\/html)\s*:[^"'\s>]*/gi

export function sanitizeHtml(html: string): string {
  return String(html ?? '')
    .replace(BLOCKED_TAGS, '')
    .replace(EVENT_ATTRS, '')
    .replace(JS_URLS, '$1$2#')
}

/** Strip all tags — used by the plain-text export. */
export function stripTags(html: string): string {
  return String(html ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/* ------------------------------------------------------------------ */
/* Merge variables                                                     */
/* ------------------------------------------------------------------ */

const DELIMS: Record<VariableSyntax, [string, string]> = {
  double: ['{{', '}}'],
  triple: ['{{{', '}}}'],
  percent: ['%%', '%%'],
}

export function formatToken(name: string, syntax: VariableSyntax = 'triple'): string {
  const [open, close] = DELIMS[syntax] ?? DELIMS.triple
  return `${open}${name}${close}`
}

export function tokenRe(syntax: VariableSyntax = 'triple'): RegExp {
  const [open, close] = DELIMS[syntax] ?? DELIMS.triple
  const e = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`${e(open)}\\s*([\\w.-]+)\\s*${e(close)}`, 'g')
}

/** Chips are serialised by the editor as `<span data-rme-var="name">…</span>`. */
export function chipRe(): RegExp {
  return /<span[^>]*data-rme-var="([\w.-]+)"[^>]*>.*?<\/span>/gi
}

/**
 * Resolve variable chips/tokens in exported HTML. In `token` mode chips become
 * bare merge tokens for a server-side engine; in `fallback` mode chips and raw
 * tokens are replaced with the variable's fallback value.
 */
export function resolveVariables(
  html: string,
  variables: DesignVariable[] | undefined,
  mode: VariableMode = 'token',
  syntax: VariableSyntax = 'triple',
): string {
  let out = String(html ?? '').replace(chipRe(), (_m, name: string) => {
    if (mode === 'token') return formatToken(name, syntax)
    const v = variables?.find((x) => x.name === name)
    return esc(v?.fallback ?? '')
  })
  if (mode === 'fallback') {
    out = out.replace(tokenRe(syntax), (_m, name: string) => {
      const v = variables?.find((x) => x.name === name)
      return v ? esc(v.fallback) : formatToken(name, syntax)
    })
  }
  return out
}

/** Standard single-cell wrapper used by most blocks. */
export function cell(
  align: string,
  pad: string,
  inner: string,
  className = '',
  extraTd = '',
): string {
  return (
    `<table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" ` +
    `style="width:100%;border-collapse:collapse;">` +
    `<tr><td${className ? ` class="${className}"` : ''} align="${align}" ` +
    `style="padding:${pad};${extraTd}">${inner}</td></tr></table>`
  )
}
