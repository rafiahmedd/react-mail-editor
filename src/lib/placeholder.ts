/**
 * Inline SVG data URIs for the editor's default and demo assets.
 *
 * These defaults used to point at `placehold.co` and `api.iconify.design`, so
 * simply opening the editor fired requests at third-party servers — and any
 * email exported before the author swapped the asset out shipped those URLs to
 * recipients, leaking their IP and open-time to a host nobody agreed to.
 *
 * Everything here is generated in-process. No network, works offline, and the
 * bytes are small enough to sit inline in a `src` attribute.
 */

/** `#` and friends must be percent-encoded to survive a `src` attribute. */
const dataUri = (svg: string): string =>
  `data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`

const escapeXml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * A grey "drop your image here" tile, sized to the slot it fills.
 *
 * Rendered at the real pixel dimensions so the canvas reserves the right space
 * and nothing reflows once a real image replaces it.
 */
export function placeholderImage(width: number, height: number, label = 'Image'): string {
  const fontSize = Math.max(12, Math.min(48, Math.round(Math.min(width, height) / 9)))
  return dataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"
       viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(label)}">
       <rect width="${width}" height="${height}" fill="#e2e8f0"/>
       <text x="${width / 2}" y="${height / 2}" fill="#64748b" font-size="${fontSize}"
         font-family="Helvetica,Arial,sans-serif" text-anchor="middle"
         dominant-baseline="central">${escapeXml(label)}</text>
     </svg>`,
  )
}

/**
 * Lucide glyph geometry, copied from `lucide-react` so the data URI needs no
 * React render pass. Keep these in sync by hand if the icons are ever redrawn —
 * they are demo content, so drift is cosmetic.
 */
const ICON_PATHS: Record<string, string> = {
  'circle-check': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  zap: '<path d="M15.914 4a1.5 1.5 0 0 0-2.474-1.561l-9 9A1.5 1.5 0 0 0 5.5 14h4.002a.5.5 0 0 1 .471.666L8.086 20a1.5 1.5 0 0 0 2.475 1.56l9-9A1.5 1.5 0 0 0 18.5 10h-3.997a.5.5 0 0 1-.472-.667z"/>',
  smartphone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  'shield-check':
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
}

export type PlaceholderIcon = keyof typeof ICON_PATHS

/** A stroked lucide glyph as a standalone SVG data URI. */
export function iconDataUri(name: PlaceholderIcon, color = '#4f46e5', size = 24): string {
  return dataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"
       viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name]}</svg>`,
  )
}
