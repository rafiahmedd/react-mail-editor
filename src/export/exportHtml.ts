/**
 * Design JSON → email-client-safe HTML.
 *
 * Layout strategy: a centred container table; each Row is a `<tr>`; columns use
 * the inline-block + MSO ghost-table hybrid so they sit side by side in Outlook
 * desktop and stack on mobile through media queries. Per-block markup comes
 * from the registry's `toHtml`, so custom blocks export too.
 */
import type { Column, Design, Row } from '@/types/schema'
import type { ExportContext, VariableMode, VariableSyntax } from '@/types/blocks'
import type { BlockRegistry } from '@/blocks/registry'
import { bgColor, bgImageCss, borderCss, padding } from '@/lib/style'
import { classId, isTransparent } from '@/lib/utils'
import { esc, resolveVariables, safeUrl } from '@/lib/html'
import { fontUrl } from '@/config/fonts'

export interface ExportHtmlOptions {
  variableMode?: VariableMode
  variableSyntax?: VariableSyntax
  /** Emit the dark-mode media block when the body opts in. Defaults to true. */
  darkMode?: boolean
}

interface Sink {
  mobile: string[]
  dark: string[]
  fonts: Set<string>
}

const MOBILE_BREAKPOINT = 600

export function exportHtml(
  design: Design,
  blocks: BlockRegistry,
  options: ExportHtmlOptions = {},
): string {
  const { variableMode = 'token', variableSyntax = 'triple' } = options
  const body = design.body
  const v = body.values
  const sink: Sink = { mobile: [], dark: [], fonts: new Set() }

  const bodyFont = fontUrl(v.fontFamily)
  if (bodyFont) sink.fonts.add(bodyFont)

  const makeCtx = (id: string): ExportContext => ({
    contentWidth: v.contentWidth,
    linkColor: v.linkColor,
    textColor: v.textColor,
    fontFamily: v.fontFamily.value,
    variables: design.variables ?? [],
    variableMode,
    variableSyntax,
    className: `rme-${classId(id)}`,
    addMobileCss: (css) => css && sink.mobile.push(css),
    addDarkCss: (css) => css && sink.dark.push(css),
    addFont: (url) => url && sink.fonts.add(url),
  })

  /* ---------------------------------------------------------------- */
  /* Content                                                          */
  /* ---------------------------------------------------------------- */

  const renderContent = (contentId: string, type: string, values: Record<string, unknown>, mobile?: Record<string, unknown>) => {
    const def = blocks.get(type)
    if (!def) return ''
    const ctx = makeCtx(contentId)
    const html = def.toHtml(values as never, ctx)
    if (mobile && Object.keys(mobile).length) {
      const selector = `.${ctx.className}`
      const css = def.mobileCss
        ? def.mobileCss(values as never, mobile as never, selector)
        : ''
      if (css) sink.mobile.push(css)
    }
    return html
  }

  /* ---------------------------------------------------------------- */
  /* Column                                                           */
  /* ---------------------------------------------------------------- */

  const renderColumn = (
    column: Column,
    widthPx: number,
    stack: boolean,
    gap: number,
  ): string => {
    const cv = column.values
    const cls = `rme-${classId(column.id)}`
    const inner = column.contents
      .map((c) => renderContent(c.id, c.type, c.values, c.mobile))
      .join('')

    const tableStyle =
      (bgColor(cv.backgroundColor) ? `background-color:${bgColor(cv.backgroundColor)};` : '') +
      bgImageCss(cv.backgroundImage, safeUrl(cv.backgroundImage?.url, true)) +
      (borderCss(cv.border) ? `border:${borderCss(cv.border)};` : '') +
      (cv.borderRadius ? `border-radius:${cv.borderRadius}px;` : '') +
      'border-collapse:separate;'

    if (stack) {
      sink.mobile.push(
        `.${cls}{display:block !important;width:100% !important;max-width:100% !important;}`,
      )
    }

    return (
      `<!--[if mso]><td width="${widthPx}" valign="${cv.verticalAlign}" style="padding:0;"><![endif]-->` +
      `<div class="${cls} rme-col" style="display:inline-block;vertical-align:${cv.verticalAlign};` +
      `width:100%;max-width:${widthPx}px;${gap ? `padding:0 ${gap / 2}px;` : ''}font-size:medium;text-align:left;">` +
      `<table role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="width:100%;${tableStyle}">` +
      `<tr><td valign="${cv.verticalAlign}" style="padding:${padding(cv.padding)};">${inner || '&nbsp;'}</td></tr>` +
      `</table></div>` +
      `<!--[if mso]></td><![endif]-->`
    )
  }

  /* ---------------------------------------------------------------- */
  /* Row                                                              */
  /* ---------------------------------------------------------------- */

  const renderRow = (row: Row): string => {
    const rv = row.values
    const cls = `rme-${classId(row.id)}`
    const innerWidth = v.contentWidth - rv.padding.left - rv.padding.right
    const total = row.cells.reduce((a, b) => a + b, 0) || 12

    const columns = row.columns
      .map((col, i) => {
        const w = Math.floor(((row.cells[i] ?? 12) / total) * innerWidth)
        return renderColumn(col, w, rv.stackOnMobile, rv.gap)
      })
      .join('')

    const colsBg = bgColor(rv.columnsBackground)
    const colsWrap =
      `<div style="font-size:0;text-align:center;${colsBg ? `background-color:${colsBg};` : ''}${rv.gap ? `margin:0 -${rv.gap / 2}px;` : ''}">` +
      `<!--[if mso]><table role="presentation" border="0" width="${innerWidth}" cellpadding="0" cellspacing="0"><tr><![endif]-->` +
      columns +
      `<!--[if mso]></tr></table><![endif]-->` +
      `</div>`

    const tdStyle =
      (bgColor(rv.backgroundColor) ? `background-color:${bgColor(rv.backgroundColor)};` : '') +
      bgImageCss(rv.backgroundImage, safeUrl(rv.backgroundImage?.url, true)) +
      `padding:${padding(rv.padding)};` +
      (borderCss(rv.border) ? `border:${borderCss(rv.border)};` : '') +
      (rv.borderRadius ? `border-radius:${rv.borderRadius}px;` : '')

    if (rv.hideOnMobile) {
      sink.mobile.push(
        `.${cls}{display:none !important;max-height:0 !important;overflow:hidden !important;mso-hide:all;}`,
      )
    }
    if (row.mobile?.padding) {
      sink.mobile.push(`.${cls}{padding:${padding(row.mobile.padding)} !important;}`)
    }
    if (rv.reverseOnMobile && rv.stackOnMobile && row.columns.length === 2) {
      // direction:rtl on the wrapper + ltr on each column flips the visual order
      // without touching source order — the only technique Gmail honours.
      sink.mobile.push(`.${cls} .rme-colwrap{direction:rtl !important;}`)
      sink.mobile.push(`.${cls} .rme-col{direction:ltr !important;}`)
    }

    const desktopHidden = rv.hideOnDesktop
      ? ' rme-hide-desktop'
      : ''

    return (
      `<tr><td class="${cls}${desktopHidden}" style="${tdStyle}">` +
      `<div class="rme-colwrap" style="font-size:0;">${colsWrap}</div>` +
      `</td></tr>`
    )
  }

  const rows = body.rows.map(renderRow).join('')

  /* ---------------------------------------------------------------- */
  /* Document                                                         */
  /* ---------------------------------------------------------------- */

  const previewText = design.meta?.preview ?? ''
  const preheader = previewText
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${v.contentBackground};opacity:0;">` +
      `${esc(resolveVariables(previewText, design.variables, variableMode, variableSyntax))}` +
      `${'&#847;&zwnj;&nbsp;'.repeat(30)}</div>`
    : ''

  const containerStyle =
    `width:${v.contentWidth}px;max-width:${v.contentWidth}px;margin:0 auto;` +
    `background-color:${v.contentBackground};` +
    (v.borderRadius ? `border-radius:${v.borderRadius}px;overflow:hidden;` : '') +
    bgImageCss(v.backgroundImage, safeUrl(v.backgroundImage?.url, true))

  const container =
    `<!--[if mso]><table role="presentation" border="0" width="${v.contentWidth}" align="center" cellpadding="0" cellspacing="0"><tr><td><![endif]-->` +
    `<table role="presentation" border="0" class="rme-container" width="${v.contentWidth}" align="center" cellpadding="0" cellspacing="0" style="${containerStyle}">` +
    rows +
    `</table>` +
    `<!--[if mso]></td></tr></table><![endif]-->`

  const fontLinks = [...sink.fonts]
    .map((url) => `<link href="${esc(url)}" rel="stylesheet" type="text/css" />`)
    .join('\n')

  // Darkening the container without also lightening the text is worse than no
  // dark mode at all: the inline `color:#0f172a` a heading carries survives the
  // repaint and lands black on black. Every rule below is !important because an
  // inline style is what it has to beat, and scoped to `.rme-container` so the
  // blanket text rule stays inside the email. Blocks that own their colours —
  // buttons — re-assert them through addDarkCss, which outranks these on
  // specificity.
  const darkText = ['td', 'div', 'p', 'span', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    .map((tag) => `.rme-container ${tag}`)
    .join(', ')

  const darkBlock =
    (options.darkMode ?? true) && v.darkModeSupport
      ? `
  :root{color-scheme:light dark;supported-color-schemes:light dark;}
  @media (prefers-color-scheme: dark){
    #body, .rme-bg{background-color:#0b1220 !important;}
    .rme-container{background-color:#111827 !important;}
    ${darkText}{color:#e5e7eb !important;}
    .rme-container a{color:#93c5fd !important;}
    ${sink.dark.join('\n    ')}
  }`
      : ''

  const mobileBlock = sink.mobile.length
    ? sink.mobile.join('\n    ')
    : ''

  const doc = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="${esc(v.language)}" dir="${v.direction}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />${
  darkBlock
    ? `
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />`
    : ''
}
<title>${esc(design.meta?.subject ?? design.name ?? '')}</title>
${fontLinks}
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<style>table,td,div,p,a,span{font-family:${escapeMso(v.fontFamily.value)} !important;}</style>
<![endif]-->
<style type="text/css">
  html,body{margin:0 auto !important;padding:0 !important;height:100% !important;width:100% !important;}
  *{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;}
  img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none;}
  a{color:${v.linkColor};}
  a[x-apple-data-detectors]{color:inherit !important;text-decoration:none !important;font-size:inherit !important;font-family:inherit !important;font-weight:inherit !important;line-height:inherit !important;}
  u + #body a{color:inherit;text-decoration:none;font-size:inherit;font-family:inherit;font-weight:inherit;line-height:inherit;}
  .rme-hide-desktop{display:none;font-size:0;max-height:0;line-height:0;overflow:hidden;mso-hide:all;}
  @media only screen and (max-width:${MOBILE_BREAKPOINT}px){
    .rme-container{width:100% !important;max-width:100% !important;}
    .rme-col{display:block !important;width:100% !important;max-width:100% !important;padding:0 !important;}
    .rme-hide-desktop{display:block !important;font-size:inherit !important;max-height:none !important;line-height:inherit !important;overflow:visible !important;}
    img{height:auto !important;}
    ${mobileBlock}
  }${darkBlock}
</style>
</head>
<body id="body" style="margin:0;padding:0;width:100%;word-spacing:normal;background-color:${v.backgroundColor};">
${preheader}
<div class="rme-bg" role="article" aria-roledescription="email" aria-label="${esc(design.meta?.subject ?? '')}" lang="${esc(v.language)}" style="background-color:${v.backgroundColor};">
<table class="rme-bg" role="presentation" border="0" width="100%" cellpadding="0" cellspacing="0" style="background-color:${v.backgroundColor};">
<tr><td align="center" style="padding:${padding(v.padding)};">
${container}
</td></tr>
</table>
</div>
</body>
</html>`

  return variableMode === 'fallback'
    ? resolveVariables(doc, design.variables, 'fallback', variableSyntax)
    : doc
}

function escapeMso(stack: string): string {
  return stack.replace(/"/g, "'")
}

/* ------------------------------------------------------------------ */
/* Plain-text alternative                                              */
/* ------------------------------------------------------------------ */

export function exportText(design: Design, blocks: BlockRegistry): string {
  const out: string[] = []
  if (design.meta?.preview) out.push(design.meta.preview, '')
  for (const row of design.body.rows) {
    if (row.values.hideOnDesktop) continue
    for (const col of row.columns) {
      for (const content of col.contents) {
        const def = blocks.get(content.type)
        if (!def?.toText) continue
        const text = def.toText(content.values as never)
        if (text?.trim()) out.push(text.trim())
      }
    }
  }
  return out.join('\n\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

/* ------------------------------------------------------------------ */
/* Compatibility hints                                                 */
/* ------------------------------------------------------------------ */

export interface CompatIssue {
  level: 'warn' | 'info'
  message: string
  where?: string
}

/**
 * Cheap static checks that catch the mistakes that actually break emails in
 * the wild. Deliberately conservative — no false alarms.
 */
export function checkCompatibility(design: Design, html: string): CompatIssue[] {
  const issues: CompatIssue[] = []
  const bytes = new TextEncoder().encode(html).length

  if (bytes > 102_000) {
    issues.push({
      level: 'warn',
      message: `The HTML is ${(bytes / 1024).toFixed(0)} KB. Gmail clips messages above ~102 KB — trim content or move styles inline.`,
    })
  }

  if (!design.meta?.subject) {
    issues.push({ level: 'info', message: 'No subject line set in Settings → Email details.' })
  }
  if (!design.meta?.preview) {
    issues.push({
      level: 'info',
      message: 'No preview text. Inboxes will fall back to the first words of the email.',
    })
  }

  let images = 0
  let missingAlt = 0
  let httpAssets = 0
  let dataUris = 0

  for (const row of design.body.rows) {
    for (const col of row.columns) {
      for (const c of col.contents) {
        const values = c.values as Record<string, unknown>
        if (c.type === 'image' || c.type === 'video') {
          images++
          if (!String(values.alt ?? '').trim()) missingAlt++
        }
        const src = String(values.src ?? values.thumbnail ?? '')
        if (src.startsWith('http://')) httpAssets++
        if (src.startsWith('data:')) dataUris++
        if (c.type === 'html') {
          issues.push({
            level: 'info',
            message: 'A Custom HTML block is present — verify it renders in Outlook before sending.',
            where: c.id,
          })
        }
      }
    }
  }

  if (missingAlt) {
    issues.push({
      level: 'warn',
      message: `${missingAlt} image${missingAlt > 1 ? 's are' : ' is'} missing alt text. Many clients block images by default.`,
    })
  }
  if (httpAssets) {
    issues.push({
      level: 'warn',
      message: `${httpAssets} asset${httpAssets > 1 ? 's use' : ' uses'} http://. Use https:// or clients will warn about mixed content.`,
    })
  }
  if (dataUris) {
    issues.push({
      level: 'warn',
      message: `${dataUris} inline data: image${dataUris > 1 ? 's' : ''} found. Gmail and Outlook strip these — upload them to a CDN instead.`,
    })
  }
  if (!design.body.rows.length) {
    issues.push({ level: 'warn', message: 'The email is empty.' })
  }
  if (images === 0 && bytes < 2000) {
    issues.push({ level: 'info', message: 'Very short email — double-check the content is complete.' })
  }

  const unsubscribe = /unsubscribe|preferences|opt.?out/i.test(html)
  if (!unsubscribe) {
    issues.push({
      level: 'warn',
      message: 'No unsubscribe link detected. Bulk email requires one in most jurisdictions.',
    })
  }

  return issues
}

export function htmlSize(html: string): number {
  return new TextEncoder().encode(html).length
}
