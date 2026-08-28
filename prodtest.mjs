import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const p = await b.newPage({ viewport: { width: 1400, height: 900 } })
const reqs = []
const errs = []
p.on('pageerror', e => errs.push(e.message))
p.on('response', async r => {
  const u = r.url()
  if (!/\.js(\?|$)/.test(u)) return
  const t = Date.now()
  reqs.push({ name: u.split('/').pop(), t })
})
const t0 = Date.now()
await p.goto('http://127.0.0.1:4173/', { waitUntil: 'load' })
await p.waitForSelector('.rme-root')
const paint = Date.now()
const atPaint = reqs.filter(r => r.t <= paint).map(r => r.name)
console.log('JS loaded before editor was on screen:')
atPaint.forEach(n => console.log('   ', n))
console.log('   → rich-text present?', atPaint.some(n => /RichText/.test(n)) ? 'YES (bad)' : 'no ✓')
console.log('   → js-beautify present?', atPaint.some(n => /^js-/.test(n)) ? 'YES (bad)' : 'no ✓')

await p.waitForTimeout(6000)
console.log('\nAfter idle window, total JS files:', reqs.length)
reqs.forEach(r => console.log('   ', r.name, `+${r.t - t0}ms`))

// interaction still works
await p.locator('[data-rme-node]').filter({ hasText: 'Thanks for joining' }).last().dblclick()
await p.waitForTimeout(1000)
console.log('\nrte toolbar:', await p.locator('[data-rme-rte-toolbar]').count(), '| ProseMirror:', await p.locator('.ProseMirror').count())
await p.keyboard.press('End'); await p.keyboard.type(' OK')
await p.waitForTimeout(500)
console.log('typing works:', await p.locator('[data-rme-node]').filter({ hasText: 'OK' }).count() > 0)
await p.keyboard.press('Escape')
await p.locator('button:has-text("Export")').first().click()
await p.waitForTimeout(1200)
const pre = await p.locator('pre').first().innerText()
console.log('export pretty-printed:', pre.includes('\n  <meta'))
console.log('ERRORS:', errs.length ? errs.join('; ') : 'none')
await b.close()
