import type { FontValue } from '@/types/schema'

/** Email-safe stacks first, then popular web fonts with their CDN URLs. */
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
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  },
  {
    label: 'Roboto',
    value: 'Roboto, Helvetica, Arial, sans-serif',
    url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
  },
  {
    label: 'Open Sans',
    value: "'Open Sans', Helvetica, Arial, sans-serif",
    url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap',
  },
  {
    label: 'Lato',
    value: 'Lato, Helvetica, Arial, sans-serif',
    url: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap',
  },
  {
    label: 'Montserrat',
    value: 'Montserrat, Helvetica, Arial, sans-serif',
    url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap',
  },
  {
    label: 'Poppins',
    value: 'Poppins, Helvetica, Arial, sans-serif',
    url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
  },
  {
    label: 'Playfair Display',
    value: "'Playfair Display', Georgia, serif",
    url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap',
  },
  {
    label: 'Merriweather',
    value: "Merriweather, Georgia, serif",
    url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap',
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
