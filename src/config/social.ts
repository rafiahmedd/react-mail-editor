import { SOCIAL_ICON_PATHS } from './socialIcons'

export interface SocialNetwork {
  id: string
  label: string
  color: string
  /** Simple Icons slug — keys into the inlined glyph paths. */
  slug: string
  placeholder: string
}

export const SOCIAL_NETWORKS: SocialNetwork[] = [
  { id: 'facebook', label: 'Facebook', color: '#1877F2', slug: 'facebook', placeholder: 'https://facebook.com/' },
  { id: 'x', label: 'X (Twitter)', color: '#000000', slug: 'x', placeholder: 'https://x.com/' },
  { id: 'instagram', label: 'Instagram', color: '#E4405F', slug: 'instagram', placeholder: 'https://instagram.com/' },
  { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2', slug: 'linkedin', placeholder: 'https://linkedin.com/in/' },
  { id: 'youtube', label: 'YouTube', color: '#FF0000', slug: 'youtube', placeholder: 'https://youtube.com/@' },
  { id: 'tiktok', label: 'TikTok', color: '#000000', slug: 'tiktok', placeholder: 'https://tiktok.com/@' },
  { id: 'pinterest', label: 'Pinterest', color: '#BD081C', slug: 'pinterest', placeholder: 'https://pinterest.com/' },
  { id: 'github', label: 'GitHub', color: '#181717', slug: 'github', placeholder: 'https://github.com/' },
  { id: 'whatsapp', label: 'WhatsApp', color: '#25D366', slug: 'whatsapp', placeholder: 'https://wa.me/' },
  { id: 'telegram', label: 'Telegram', color: '#26A5E4', slug: 'telegram', placeholder: 'https://t.me/' },
  { id: 'discord', label: 'Discord', color: '#5865F2', slug: 'discord', placeholder: 'https://discord.gg/' },
  { id: 'threads', label: 'Threads', color: '#000000', slug: 'threads', placeholder: 'https://threads.net/@' },
  { id: 'reddit', label: 'Reddit', color: '#FF4500', slug: 'reddit', placeholder: 'https://reddit.com/r/' },
  { id: 'dribbble', label: 'Dribbble', color: '#EA4C89', slug: 'dribbble', placeholder: 'https://dribbble.com/' },
  { id: 'behance', label: 'Behance', color: '#1769FF', slug: 'behance', placeholder: 'https://behance.net/' },
  { id: 'spotify', label: 'Spotify', color: '#1DB954', slug: 'spotify', placeholder: 'https://open.spotify.com/' },
  { id: 'medium', label: 'Medium', color: '#000000', slug: 'medium', placeholder: 'https://medium.com/@' },
  { id: 'email', label: 'Email', color: '#64748B', slug: 'maildotru', placeholder: 'mailto:hello@example.com' },
  { id: 'website', label: 'Website', color: '#0F172A', slug: 'googlechrome', placeholder: 'https://example.com' },
]

export function findNetwork(id: string): SocialNetwork | undefined {
  return SOCIAL_NETWORKS.find((n) => n.id === id)
}

/**
 * The network glyph as an inline SVG data URI, tinted to `color`.
 *
 * This used to be a `cdn.simpleicons.org` URL, which meant the editor hit that
 * CDN on every paint and every exported email handed each recipient's IP and
 * open-time to it. Nothing is fetched now.
 */
export function networkIconUrl(id: string, color = '#ffffff'): string {
  const net = findNetwork(id)
  const path = net && SOCIAL_ICON_PATHS[net.slug]
  if (!path) return ''
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ` +
    `width="24" height="24" fill="${color}"><path d="${path}"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export interface ResolvedSocial {
  color: string
  image: string
  label: string
  isCustom: boolean
}

export function resolveSocial(item: {
  network: string
  icon?: string
  color?: string
}): ResolvedSocial {
  const net = findNetwork(item.network)
  return {
    color: item.color || net?.color || '#64748B',
    image: item.icon || networkIconUrl(item.network),
    label: net?.label || item.network,
    isCustom: Boolean(item.icon),
  }
}
