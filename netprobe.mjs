/**
 * Runtime counterpart to netcheck.mjs.
 *
 * netcheck.mjs greps the source and runs anywhere. This one loads the real
 * editor in a browser and asserts two things a grep cannot:
 *   1. nothing off-origin is requested, and
 *   2. every image on the canvas actually decoded — which is how the broken
 *      LinkedIn glyph (cdn.simpleicons.org 404'd it) would have been caught.
 *
 * The playground boots BUILTIN_TEMPLATES[0], which carries the social block and
 * an image block, so a plain page load already exercises the inlined assets.
 *
 * Run: `npm run dev` in one shell, then `node netprobe.mjs`
 */
import { chromium } from 'playwright'

const ORIGIN = 'http://127.0.0.1:5173'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const p = await b.newPage({ viewport: { width: 1600, height: 950 } })

const offsite = new Set()
p.on('request', (r) => {
  const u = r.url()
  if (/^(data|blob):/.test(u) || u.startsWith(ORIGIN)) return
  offsite.add(new URL(u).host)
})

await p.goto(ORIGIN, { waitUntil: 'networkidle' })
await p.waitForSelector('[data-rme-node]')
await p.waitForTimeout(1500) // let the idle prefetch settle too

const images = await p.evaluate(() =>
  [...document.querySelectorAll('[data-rme-node] img')].map((i) => ({
    src: i.currentSrc || i.src,
    ok: i.complete && i.naturalWidth > 0,
    alt: i.alt,
  })),
)
await b.close()

const hosts = [...offsite].sort()
const broken = images.filter((i) => !i.ok)

console.log(`images on canvas: ${images.length} (${images.filter((i) => i.ok).length} decoded)`)
if (hosts.length) console.error(`FAIL third-party requests: ${hosts.join(', ')}`)
if (!images.length) console.error('FAIL no images found — the probe is not exercising anything')
for (const i of broken) console.error(`FAIL broken image: ${i.alt || '(no alt)'} ${i.src.slice(0, 60)}`)

const failed = hosts.length || broken.length || !images.length
console.log(failed ? '\nnetprobe: FAILED' : '\nnetprobe: clean')
process.exit(failed ? 1 : 0)
