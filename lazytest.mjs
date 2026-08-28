import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const p = await b.newPage({ viewport: { width: 1600, height: 950 } })
const errs = []
const loaded = []
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message))
p.on('console', m => { if (m.type()==='error' && !/Failed to load resource|ERR_TUNNEL/.test(m.text())) errs.push(m.text()) })
p.on('request', r => { const u = r.url(); if (/tiptap|prosemirror|RichTextEditor|beautify/i.test(u)) loaded.push(u.split('/').pop().split('?')[0]) })

await p.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' })
await p.waitForTimeout(400)
console.log('A. tiptap requests immediately after first paint:', loaded.length)

// idle prefetch should kick in shortly after
await p.waitForTimeout(4000)
console.log('B. after idle prefetch:', loaded.length > 0 ? 'warmed' : 'NOT warmed')

// static text renders without the editor
const txt = await p.locator('[data-rme-node]').filter({ hasText: 'Thanks for joining' }).last().innerText()
console.log('C. static text renders:', JSON.stringify(txt.slice(0,40)))

// double click -> editor mounts
await p.locator('[data-rme-node]').filter({ hasText: 'Thanks for joining' }).last().dblclick()
await p.waitForTimeout(1200)
console.log('D. rte toolbar after dblclick:', await p.locator('[data-rme-rte-toolbar]').count())
console.log('E. ProseMirror mounted:', await p.locator('.ProseMirror').count())

// type into it
await p.keyboard.press('End'); await p.keyboard.type(' Edited!')
await p.waitForTimeout(600)
const after = await p.locator('[data-rme-node]').filter({ hasText: 'Edited!' }).count()
console.log('F. typing works:', after > 0)

// export modal + beautify
await p.keyboard.press('Escape')
await p.locator('button:has-text("Export")').first().click()
await p.waitForTimeout(1500)
const pre = await p.locator('pre').first().innerText()
console.log('G. export pretty-printed:', pre.includes('\n  <meta') || pre.includes('\n<head>'))
console.log('   export length:', pre.length)
await p.keyboard.press('Escape')
await p.waitForTimeout(300)

// preview modal still fine
await p.locator('button:has-text("Inbox preview")').click()
await p.waitForTimeout(1200)
console.log('H. preview iframe tables:', await p.frameLocator('iframe[title="Email preview"]').locator('table').count())

console.log('ERRORS:', errs.length ? errs.slice(0,6).join('\n  ') : 'none')
await b.close()
