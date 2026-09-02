/**
 * Guard: no default, template, or demo value in `src/` may point at a
 * third-party host the browser (or a recipient's mail client) will fetch.
 *
 * Run: `node netcheck.mjs`
 */
import { readFileSync } from 'node:fs'
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

/** Hosts that never cause a fetch: XML namespaces and link-field placeholders. */
const INERT = new Set([
  'www.w3.org', 'example.com',
  'facebook.com', 'x.com', 'instagram.com', 'linkedin.com', 'youtube.com',
  'www.youtube.com', 'tiktok.com', 'pinterest.com', 'github.com', 'wa.me',
  't.me', 'discord.gg', 'threads.net', 'reddit.com', 'dribbble.com',
  'behance.net', 'open.spotify.com', 'medium.com',
])

/** Fetched at runtime, deliberately kept. Shrink this list, never grow it. */
const ALLOWED_FETCH = new Map([
  ['img.youtube.com', 'derived at runtime from a URL the author pastes; never from a default'],
])

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx|css)$/.test(p) ? [p] : []
  })
}

const seen = new Map()
for (const file of walk('src')) {
  const text = readFileSync(file, 'utf8')
  for (const [, host] of text.matchAll(/https?:\/\/([a-z0-9-]+(?:\.[a-z0-9-]+)+)/gi)) {
    if (INERT.has(host)) continue
    if (!seen.has(host)) seen.set(host, [])
    seen.get(host).push(file)
  }
}

let failed = false
for (const [host, files] of [...seen].sort()) {
  const why = ALLOWED_FETCH.get(host)
  if (why) console.log(`ok    ${host} — ${why}`)
  else {
    failed = true
    console.error(`FAIL  ${host} — unapproved third-party fetch in ${[...new Set(files)].join(', ')}`)
  }
}
console.log(failed ? '\nnetcheck: FAILED' : '\nnetcheck: clean')
process.exit(failed ? 1 : 0)
