import { useEffect, useRef, useState } from 'react'
import { Star } from 'lucide-react'
import {
  EmailEditor,
  defineBlock,
  BUILTIN_TEMPLATES,
  type Design,
  type EditorApi,
  type Values,
  type BlockDefinition,
  type BlockRenderProps,
} from '@/index'

/* A custom block, to prove third-party registration works end to end. */
interface RatingValues extends Values {
  stars: number
  color: string
  label: string
  size: number
  align: 'left' | 'center' | 'right'
}

const ratingBlock = defineBlock<RatingValues>({
  type: 'rating',
  label: 'Rating',
  icon: Star,
  group: 'content',
  keywords: ['stars', 'review', 'score'],
  defaultValues: () => ({
    stars: 5,
    color: '#f59e0b',
    label: 'Loved by 2,000+ teams',
    size: 26,
    align: 'center',
  }),
  render: ({ values }: BlockRenderProps<RatingValues>) => (
    <div style={{ padding: '16px 24px', textAlign: values.align }}>
      <div style={{ color: values.color, fontSize: values.size, letterSpacing: 2 }}>
        {'★'.repeat(Math.max(0, Math.min(5, values.stars)))}
        <span style={{ color: '#e2e8f0' }}>
          {'★'.repeat(5 - Math.max(0, Math.min(5, values.stars)))}
        </span>
      </div>
      {values.label ? (
        <div style={{ marginTop: 6, fontSize: 13, color: '#64748b' }}>{values.label}</div>
      ) : null}
    </div>
  ),
  inspector: [
    {
      title: 'Rating',
      controls: [
        { type: 'slider', key: 'stars', label: 'Stars', min: 0, max: 5, step: 1 },
        { type: 'color', key: 'color', label: 'Color' },
        { type: 'number', key: 'size', label: 'Size', unit: 'px', min: 12, max: 60 },
        { type: 'text', key: 'label', label: 'Caption' },
        { type: 'align', key: 'align', label: 'Align' },
      ],
    },
  ],
  toHtml: (v) =>
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>` +
    `<td align="${v.align}" style="padding:16px 24px;">` +
    `<div style="color:${v.color};font-size:${v.size}px;letter-spacing:2px;">${'&#9733;'.repeat(v.stars)}</div>` +
    (v.label
      ? `<div style="margin-top:6px;font-size:13px;color:#64748b;">${v.label}</div>`
      : '') +
    `</td></tr></table>`,
  toText: (v) => `${'*'.repeat(v.stars)} ${v.label}`,
})

export function App() {
  const apiRef = useRef<EditorApi>(null)
  const [design, setDesign] = useState<Design>(
    () => structuredClone(BUILTIN_TEMPLATES[0].design),
  )

  // Exposed so the automated compatibility run can assert that the *ref* path
  // works — that is exactly what silently breaks on React 18 without forwardRef.
  useEffect(() => {
    ;(window as unknown as Record<string, unknown>).__rmeApi = apiRef.current
  }, [])

  return (
    <div style={{ height: '100vh' }}>
      <EmailEditor
        ref={apiRef}
        value={design}
        onChange={setDesign}
        storage="none"
        blocks={[ratingBlock as unknown as BlockDefinition<Values>]}
        config={{
          labels: { brand: 'React Mail Editor' },
          actions: { saveTemplate: true },
          layersOpen: false,
        }}
        onSave={(d) => {
          // eslint-disable-next-line no-console
          console.log('saved design', d)
        }}
        onExport={(html) => {
          // eslint-disable-next-line no-console
          console.log('exported html length', html.length)
        }}
      />
    </div>
  )
}
