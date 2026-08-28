/**
 * Dark-mode readability of the exported HTML.
 *
 *   npm run build && node darkmode.mjs
 *
 * Exists because the dark block used to darken `.rme-container` and nothing
 * else: every block writes its colour inline, so a #0f172a heading stayed
 * #0f172a and shipped black on near-black. Nothing in the export was
 * malformed, which is exactly why review missed it — the bug is only visible
 * as a contrast ratio.
 *
 * Renders the real export in both colour schemes and measures every text node
 * against what is actually painted behind it.
 */
import { createRequire } from 'module'
import assert from 'assert'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { chromium } from 'playwright'

const require = createRequire(import.meta.url)
const {
  exportHtml, BlockRegistry, builtinBlocks, createDesign, createRow,
  headingBlock, textBlock, buttonBlock, dividerBlock,
} = require('./dist/react-mail-editor.cjs')

const AA = 4.5

const content = (type, block, values) => ({
  id: `c_${type}`,
  type,
  values: { ...block.defaultValues(), ...values },
})

const design = createDesign()
const row = createRow()
row.columns[0].contents = [
  content('heading', headingBlock, { text: 'Welcome, Ada' }),
  content('text', textBlock, {
    text: '<p>Your account is ready. <a href="https://example.com">Reset your password</a> if you need to.</p>',
  }),
  content('button', buttonBlock, { text: 'Go to dashboard', href: 'https://example.com' }),
  content('divider', dividerBlock, {}),
]
design.body.rows = [row]
design.meta = { subject: 'Welcome', preview: 'Your account is ready' }

const html = exportHtml(design, new BlockRegistry(builtinBlocks), { variableMode: 'fallback' })
assert.ok(html.includes('prefers-color-scheme'), 'the export lost its dark-mode block')

const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'rme-')), 'export.html')
fs.writeFileSync(file, html)

const luminance = (css) => {
  const [r, g, b] = css.match(/[\d.]+/g).slice(0, 3).map(Number).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

/* Matches lazytest.mjs: the devcontainer keeps its browser outside the
   playwright cache. Falls back to whatever `npx playwright install` put there. */
const CONTAINER_CHROMIUM = '/opt/pw-browsers/chromium'
const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM ??
    (fs.existsSync(CONTAINER_CHROMIUM) ? CONTAINER_CHROMIUM : undefined),
})
const failures = []

for (const colorScheme of ['light', 'dark']) {
  const page = await browser.newPage({ colorScheme })
  await page.goto('file://' + file)

  /* Only leaf text matters: an ancestor reports the colour its children may
     each override, so measuring it would pass a heading that never inherits. */
  const spots = await page.evaluate(() =>
    [...document.querySelectorAll('.rme-container *')]
      .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
      .map((el) => {
        let ground = el
        while (ground && getComputedStyle(ground).backgroundColor === 'rgba(0, 0, 0, 0)') {
          ground = ground.parentElement
        }
        return {
          text: el.textContent.trim().slice(0, 30),
          color: getComputedStyle(el).color,
          behind: ground ? getComputedStyle(ground).backgroundColor : 'rgb(255,255,255)',
        }
      }))

  assert.ok(spots.length, `${colorScheme}: nothing rendered`)

  for (const spot of spots) {
    const ratio = contrast(spot.color, spot.behind)
    if (ratio < AA) {
      failures.push(`${colorScheme}: "${spot.text}" ${ratio.toFixed(2)}:1 (${spot.color} on ${spot.behind})`)
    }
  }
  await page.close()
}

await browser.close()
fs.rmSync(path.dirname(file), { recursive: true, force: true })

assert.deepStrictEqual(failures, [], `text below ${AA}:1 —\n  ${failures.join('\n  ')}`)
console.log(`darkmode: OK (light + dark, all text >= ${AA}:1)`)
