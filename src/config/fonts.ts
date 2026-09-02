import type { FontValue } from '@/types/schema'

/**
 * Email-safe stacks first, then popular families.
 *
 * These carried `url:` links to Google Fonts, emitted as a `<link>` in the
 * exported head — which handed every recipient's IP to Google on open. Gmail,
 * Outlook desktop and Yahoo strip webfonts anyway, so the fallback stack is
 * what most inboxes rendered regardless. Supply your own via `EditorConfig.fonts`
 * if you need a real webfont.
 */
export const FONTS: FontValue[] = [
  { label: 'System UI', value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Helvetica', value: "Helvetica, Arial, sans-serif" },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, Verdana, Segoe, sans-serif' },
  { label: 'Trebuchet MS', value: "'Trebuchet MS', Helvetica, sans-serif" },
  { label: 'Georgia', value: "Georgia, 'Times New Roman', serif" },
  { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
  { label: 'Courier New', value: "'Courier New', Courier, monospace" },
  { label: 'Lucida Sans', value: "'Lucida Sans Unicode', 'Lucida Grande', sans-serif" },
  {
    label: 'Inter',
    value: "Inter, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  {
    label: 'Roboto',
    value: 'Roboto, Helvetica, Arial, sans-serif',
  },
  {
    label: 'Open Sans',
    value: "'Open Sans', Helvetica, Arial, sans-serif",
  },
  {
    label: 'Lato',
    value: 'Lato, Helvetica, Arial, sans-serif',
  },
  {
    label: 'Montserrat',
    value: 'Montserrat, Helvetica, Arial, sans-serif',
  },
  {
    label: 'Poppins',
    value: 'Poppins, Helvetica, Arial, sans-serif',
  },
  {
    label: 'Playfair Display',
    value: "'Playfair Display', Georgia, serif",
  },
  {
    label: 'Merriweather',
    value: "Merriweather, Georgia, serif",
  },
]

export const DEFAULT_FONT: FontValue = FONTS[1]

export const FONT_WEIGHTS = [
  { label: 'Light', value: 300 },
  { label: 'Regular', value: 400 },
  { label: 'Medium', value: 500 },
  { label: 'Semibold', value: 600 },
  { label: 'Bold', value: 700 },
  { label: 'Extrabold', value: 800 },
]

/** Fonts that need a webfont link; used by the exporter. */
export function fontUrl(font: FontValue | undefined): string | undefined {
  if (font?.url) return font.url
  return FONTS.find((f) => f.value === font?.value)?.url
}
