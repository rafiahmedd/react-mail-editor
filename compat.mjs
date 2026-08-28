import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const p = await b.newPage({ viewport: { width: 1500, height: 950 } })
const errs = [], warns = []
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message))
p.on('console', m => {
  const t = m.text()
  if (/Failed to load resource|ERR_TUNNEL/.test(t)) return
  if (m.type() === 'error') errs.push(t)
  if (m.type() === 'warning' && /ref|forwardRef|Function components/i.test(t)) warns.push(t)
})
await p.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(2500)

const R = await p.evaluate(() => (window).React?.version ?? 'n/a')
console.log('React version in page:', await p.evaluate(() => {
  // vite dev serves react as a module; read it off the api instead
  return document.querySelector('.rme-root') ? 'mounted' : 'NOT MOUNTED'
}))

// 1. imperative ref API (the thing that breaks on React 18 without forwardRef)
const api = await p.evaluate(() => {
  const a = (window).__rmeApi
  if (!a) return { present: false }
  return { present: true, rows: a.getDesign().body.rows.length, htmlLen: a.exportHtml().length, canUndo: a.canUndo() }
})
console.log('1. ref API:', JSON.stringify(api))

// 2. tooltip (TooltipTrigger asChild -> Button; needs the ref for anchoring)
await p.locator('button[aria-label*="Toggle settings panel"]').first().hover()
await p.waitForTimeout(900)
const tip = await p.locator('[role="tooltip"]').count()
console.log('2. tooltip renders:', tip > 0)

// 3. popover via a color control (PopoverTrigger asChild)
await p.locator('[data-rme-node]').filter({ hasText: 'Thanks for joining' }).last().click()
await p.waitForTimeout(500)
await p.locator('button:has-text("STYLE")').first().click().catch(()=>{})
await p.waitForTimeout(400)
const swatch = p.locator('aside button').filter({ hasText: '#' }).first()
if (await swatch.count()) { await swatch.click(); await p.waitForTimeout(700) }
console.log('3. popover opens:', await p.locator('input[type="color"]').count() > 0)
await p.keyboard.press('Escape'); await p.waitForTimeout(300)

// 4. select (Radix Select trigger + portal content)
await p.locator('aside button[role="combobox"]').first().click().catch(()=>{})
await p.waitForTimeout(700)
console.log('4. select listbox:', await p.locator('[role="listbox"], [role="option"]').count() > 0)
await p.keyboard.press('Escape'); await p.waitForTimeout(300)

// 5. dialog
await p.locator('button:has-text("Export")').first().click()
await p.waitForTimeout(1400)
console.log('5. dialog opens:', await p.locator('[role="dialog"]').count() > 0, '| html len:', (await p.locator('pre').first().innerText()).length)
await p.keyboard.press('Escape'); await p.waitForTimeout(400)

// 6. drag and drop
const before = await p.locator('[data-rme-node]').count()
const src = await p.getByRole('button', { name: /Divider/ }).first().boundingBox()
const tgt = await p.locator('[data-rme-node]').filter({ hasText: 'Thanks for joining' }).last().boundingBox()
await p.mouse.move(src.x+src.width/2, src.y+src.height/2); await p.mouse.down()
await p.mouse.move(src.x+40, src.y+30, {steps:5}); await p.mouse.move(tgt.x+tgt.width/2, tgt.y+2, {steps:15})
await p.waitForTimeout(400); await p.mouse.up(); await p.waitForTimeout(700)
console.log('6. drag & drop:', (await p.locator('[data-rme-node]').count()) > before)

// 7. inline rich text
await p.locator('[data-rme-node]').filter({ hasText: 'Thanks for joining' }).last().dblclick()
await p.waitForTimeout(1300)
console.log('7. rte toolbar:', await p.locator('[data-rme-rte-toolbar]').count(), '| ProseMirror:', await p.locator('.ProseMirror').count())
await p.keyboard.press('End'); await p.keyboard.type(' Yes')
await p.waitForTimeout(500)
console.log('8. typing:', (await p.locator('[data-rme-node]').filter({ hasText: 'Yes' }).count()) > 0)

console.log('ERRORS:', errs.length ? errs.slice(0,5).join('\n  ') : 'none')
console.log('REF WARNINGS:', warns.length ? warns.slice(0,5).join('\n  ') : 'none')
await b.close()
