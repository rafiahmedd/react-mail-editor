import type { BlockDefinition } from '@/types/blocks'
import type { Content, ContentType, Values } from '@/types/schema'
import { uid } from '@/lib/utils'

export class BlockRegistry {
  private map = new Map<ContentType, BlockDefinition<Values>>()

  constructor(defs: BlockDefinition<Values>[] = [], disabled: string[] = []) {
    const hidden = new Set(disabled)
    for (const def of defs) if (!hidden.has(def.type)) this.map.set(def.type, def)
  }

  register(def: BlockDefinition<Values>): void {
    this.map.set(def.type, def)
  }

  get(type: ContentType): BlockDefinition<Values> | undefined {
    return this.map.get(type)
  }

  has(type: ContentType): boolean {
    return this.map.has(type)
  }

  get list(): BlockDefinition<Values>[] {
    return [...this.map.values()]
  }

  /** Blocks grouped for the palette, preserving registration order. */
  grouped(): { group: string; items: BlockDefinition<Values>[] }[] {
    const order = ['content', 'media', 'layout', 'advanced']
    const buckets = new Map<string, BlockDefinition<Values>[]>()
    for (const def of this.map.values()) {
      const g = def.group ?? 'content'
      if (!buckets.has(g)) buckets.set(g, [])
      buckets.get(g)!.push(def)
    }
    return [...buckets.entries()]
      .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
      .map(([group, items]) => ({ group, items }))
  }

  /** Fresh content node of the given type with its default values. */
  create(type: ContentType): Content | null {
    const def = this.map.get(type)
    if (!def) return null
    return { id: uid('el'), type, values: def.defaultValues() }
  }

  /** Merge desktop values with the node's mobile overrides. */
  static resolve<V extends Values>(values: V, mobile: Partial<V> | undefined, mobileMode: boolean): V {
    return mobileMode && mobile ? ({ ...values, ...mobile } as V) : values
  }
}
