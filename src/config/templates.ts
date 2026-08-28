import type { Design } from '@/types/schema'
import type { TemplateEntry } from '@/types/config'
import { SCHEMA_VERSION } from '@/types/schema'
import { box, createBody, createColumn, createRow, noBorder, noBgImage } from './defaults'
import { DEFAULT_FONT } from './fonts'
import { uid } from '@/lib/utils'

type Block = { id: string; type: string; values: Record<string, unknown> }

const el = (type: string, values: Record<string, unknown>): Block => ({
  id: uid('el'),
  type,
  values,
})

function design(
  name: string,
  meta: { subject: string; preview: string },
  rows: { cells: number[]; bg?: string; padding?: number[]; blocks: Block[][] }[],
): Design {
  const body = createBody()
  body.rows = rows.map((r) => {
    const row = createRow(r.cells)
    if (r.bg) row.values.backgroundColor = r.bg
    if (r.padding) {
      const [t, rt, b, l] = r.padding
      row.values.padding = box(t, rt, b, l)
    }
    row.columns = r.blocks.map((blocks) => {
      const col = createColumn()
      col.contents = blocks as never
      return col
    })
    return row
  })
  return {
    schemaVersion: SCHEMA_VERSION,
    name,
    variables: [
      { name: 'first_name', label: 'First name', type: 'string', fallback: 'there' },
      { name: 'company', label: 'Company', type: 'string', fallback: 'Acme Inc.' },
    ],
    meta,
    body,
  }
}

const font = DEFAULT_FONT

const heading = (text: string, over: Record<string, unknown> = {}) =>
  el('heading', {
    text,
    level: 'h2',
    fontFamily: font,
    fontSize: 28,
    fontWeight: 700,
    color: '#0f172a',
    align: 'left',
    lineHeight: 1.3,
    letterSpacing: 0,
    href: '',
    padding: box(16, 32, 8, 32),
    ...over,
  })

const text = (html: string, over: Record<string, unknown> = {}) =>
  el('text', {
    text: html,
    fontFamily: font,
    fontSize: 15,
    fontWeight: 400,
    color: '#475569',
    align: 'left',
    lineHeight: 1.65,
    letterSpacing: 0,
    padding: box(6, 32, 14, 32),
    ...over,
  })

const button = (label: string, href: string, over: Record<string, unknown> = {}) =>
  el('button', {
    text: label,
    href,
    target: '_blank',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    fontFamily: font,
    fontSize: 15,
    fontWeight: 600,
    border: noBorder(),
    borderRadius: 8,
    innerPadding: box(14, 30, 14, 30),
    containerPadding: box(8, 32, 24, 32),
    align: 'left',
    fullWidth: false,
    letterSpacing: 0,
    ...over,
  })

const image = (src: string, over: Record<string, unknown> = {}) =>
  el('image', {
    src,
    alt: '',
    width: 536,
    autoWidth: true,
    align: 'center',
    href: '',
    borderRadius: 0,
    padding: box(0, 0, 0, 0),
    caption: '',
    captionColor: '#64748b',
    captionSize: 12,
    ...over,
  })

const divider = () =>
  el('divider', {
    color: '#e2e8f0',
    thickness: 1,
    width: 100,
    style: 'solid',
    align: 'center',
    padding: box(8, 32, 8, 32),
  })

const spacer = (height = 24) => el('spacer', { height, backgroundColor: 'transparent' })

const social = () =>
  el('social', {
    icons: [
      { network: 'x', url: 'https://x.com/' },
      { network: 'linkedin', url: 'https://linkedin.com/company/' },
      { network: 'instagram', url: 'https://instagram.com/' },
    ],
    iconStyle: 'rounded',
    size: 30,
    spacing: 8,
    align: 'center',
    padding: box(16, 24, 8, 24),
  })

const footerText = (html: string) =>
  text(html, {
    fontSize: 12,
    color: '#94a3b8',
    align: 'center',
    padding: box(4, 32, 20, 32),
  })

/* ------------------------------------------------------------------ */

export const BUILTIN_TEMPLATES: TemplateEntry[] = [
  {
    id: 'welcome',
    name: 'Welcome email',
    category: 'Onboarding',
    design: design(
      'Welcome email',
      { subject: 'Welcome to {{{company}}}', preview: 'Here is how to get started in two minutes.' },
      [
        {
          cells: [12],
          bg: '#4f46e5',
          padding: [28, 24, 28, 24],
          blocks: [
            [
              heading('Welcome aboard', {
                color: '#ffffff',
                align: 'center',
                fontSize: 30,
                padding: box(0, 0, 0, 0),
              }),
            ],
          ],
        },
        {
          cells: [12],
          blocks: [
            [
              heading('Hi {{{first_name}}} 👋', { fontSize: 22 }),
              text(
                '<p>Thanks for joining {{{company}}}. Your account is ready — the quickest way to see the value is to finish setting up your first project.</p>',
              ),
              button('Set up my project', 'https://example.com/start'),
              divider(),
              text(
                '<p><strong>Three things worth doing today</strong></p><ul><li>Invite a teammate</li><li>Connect your data source</li><li>Pick a notification schedule</li></ul>',
              ),
            ],
          ],
        },
        {
          cells: [12],
          bg: '#f8fafc',
          blocks: [
            [
              social(),
              footerText(
                '<p>You are receiving this because you created an account.<br /><a href="{{{unsubscribe_url}}}">Unsubscribe</a> · <a href="#">Manage preferences</a></p>',
              ),
            ],
          ],
        },
      ],
    ),
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    category: 'Marketing',
    design: design(
      'Newsletter',
      { subject: 'This month at {{{company}}}', preview: 'Product updates, a customer story and one good link.' },
      [
        {
          cells: [12],
          padding: [24, 24, 8, 24],
          blocks: [
            [
              text(
                '<p style="text-align:center"><strong>THE MONTHLY</strong></p>',
                { fontSize: 12, color: '#94a3b8', padding: box(0, 0, 0, 0) },
              ),
            ],
          ],
        },
        {
          cells: [12],
          blocks: [[image('https://placehold.co/1200x600/e2e8f0/64748b/png?text=Featured')]],
        },
        {
          cells: [12],
          blocks: [
            [
              heading('What shipped in March'),
              text(
                '<p>A faster editor, two new integrations and a redesigned settings page. Here is the short version.</p>',
              ),
              button('Read the full post', 'https://example.com/blog'),
            ],
          ],
        },
        {
          cells: [6, 6],
          padding: [8, 24, 8, 24],
          blocks: [
            [
              image('https://placehold.co/600x400/e2e8f0/64748b/png?text=Story', {
                borderRadius: 8,
              }),
              heading('Customer story', { fontSize: 17, padding: box(12, 8, 4, 8) }),
              text('<p>How Northwind cut onboarding time by 60%.</p>', {
                fontSize: 14,
                padding: box(0, 8, 8, 8),
              }),
            ],
            [
              image('https://placehold.co/600x400/e2e8f0/64748b/png?text=Guide', {
                borderRadius: 8,
              }),
              heading('New guide', { fontSize: 17, padding: box(12, 8, 4, 8) }),
              text('<p>The practical checklist for deliverability.</p>', {
                fontSize: 14,
                padding: box(0, 8, 8, 8),
              }),
            ],
          ],
        },
        {
          cells: [12],
          bg: '#f8fafc',
          blocks: [
            [
              social(),
              footerText(
                '<p>{{{company}}} · 123 Example Street<br /><a href="{{{unsubscribe_url}}}">Unsubscribe</a></p>',
              ),
            ],
          ],
        },
      ],
    ),
  },
  {
    id: 'receipt',
    name: 'Order receipt',
    category: 'Transactional',
    design: design(
      'Order receipt',
      { subject: 'Your order #1042 is confirmed', preview: 'Thanks for your order — here are the details.' },
      [
        {
          cells: [12],
          padding: [24, 24, 0, 24],
          blocks: [
            [
              heading('Order confirmed', { padding: box(0, 8, 4, 8) }),
              text(
                '<p>Thanks {{{first_name}}} — we have received your order and will email you again when it ships.</p>',
                { padding: box(0, 8, 12, 8) },
              ),
            ],
          ],
        },
        {
          cells: [12],
          blocks: [
            [
              el('table', {
                rows: [
                  ['Item', 'Qty', 'Price'],
                  ['Starter plan (annual)', '1', '$290.00'],
                  ['Extra seats', '3', '$87.00'],
                  ['Total', '', '$377.00'],
                ],
                hasHeader: true,
                headerBg: '#f1f5f9',
                headerColor: '#0f172a',
                cellColor: '#334155',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                cellPadding: 10,
                fontSize: 14,
                fontFamily: font,
                striped: false,
                stripeColor: '#f8fafc',
                align: 'center',
                padding: box(8, 24, 16, 24),
              }),
              button('View your order', 'https://example.com/orders/1042'),
              spacer(8),
            ],
          ],
        },
        {
          cells: [12],
          bg: '#f8fafc',
          blocks: [
            [
              footerText(
                '<p>Questions? Reply to this email and a human will answer.<br />{{{company}}}</p>',
              ),
            ],
          ],
        },
      ],
    ),
  },
  {
    id: 'announcement',
    name: 'Product announcement',
    category: 'Marketing',
    design: design(
      'Product announcement',
      { subject: 'Introducing something new', preview: 'A faster way to do the thing you do most.' },
      [
        {
          cells: [12],
          bg: '#0f172a',
          padding: [40, 32, 40, 32],
          blocks: [
            [
              text('<p style="text-align:center">NEW</p>', {
                fontSize: 11,
                color: '#818cf8',
                letterSpacing: 2,
                padding: box(0, 0, 8, 0),
              }),
              heading('Meet the new editor', {
                color: '#ffffff',
                align: 'center',
                fontSize: 34,
                padding: box(0, 0, 12, 0),
              }),
              text(
                '<p style="text-align:center">Everything you loved, rebuilt to be twice as fast.</p>',
                { color: '#cbd5e1', align: 'center', padding: box(0, 0, 20, 0) },
              ),
              button('See what changed', 'https://example.com/new', {
                align: 'center',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                containerPadding: box(0, 0, 0, 0),
              }),
            ],
          ],
        },
        {
          cells: [12],
          blocks: [
            [
              el('icons', {
                items: [
                  {
                    icon: 'https://api.iconify.design/lucide/zap.svg?color=%234f46e5',
                    title: 'Twice as fast',
                    text: 'Every interaction now lands in under 100 ms.',
                  },
                  {
                    icon: 'https://api.iconify.design/lucide/smartphone.svg?color=%234f46e5',
                    title: 'Mobile overrides',
                    text: 'Fine-tune spacing and type for small screens.',
                  },
                  {
                    icon: 'https://api.iconify.design/lucide/shield-check.svg?color=%234f46e5',
                    title: 'Safer exports',
                    text: 'URLs and raw HTML are sanitised automatically.',
                  },
                ],
                iconSize: 24,
                gap: 14,
                titleSize: 16,
                titleColor: '#0f172a',
                titleWeight: 600,
                textSize: 14,
                textColor: '#64748b',
                fontFamily: font,
                align: 'left',
                padding: box(24, 32, 16, 32),
              }),
            ],
          ],
        },
        {
          cells: [12],
          bg: '#f8fafc',
          blocks: [[social(), footerText('<p><a href="{{{unsubscribe_url}}}">Unsubscribe</a></p>')]],
        },
      ],
    ),
  },
  {
    id: 'blank',
    name: 'Blank canvas',
    category: 'Basic',
    design: (() => {
      const d = design('Untitled email', { subject: '', preview: '' }, [
        { cells: [12], blocks: [[heading('Your headline'), text('<p>Start writing…</p>')]] },
      ])
      d.body.values.backgroundImage = noBgImage()
      return d
    })(),
  },
]
