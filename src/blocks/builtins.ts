import type { BlockDefinition } from '@/types/blocks'
import type { Values } from '@/types/schema'

import { headingBlock, textBlock } from './text'
import { buttonBlock } from './button'
import { dividerBlock, imageBlock, spacerBlock, videoBlock } from './media'
import { socialBlock } from './social'
import { menuBlock } from './menu'
import { iconListBlock } from './icons'
import { htmlBlock } from './html'
import { countdownBlock } from './countdown'
import { tableBlock } from './table'
import { productBlock } from './product'

/**
 * Every block shipped with the editor, in palette order. Each definition is
 * widened to `BlockDefinition<Values>` — the registry stores them behind the
 * loose `Values` bag, and `BlockDefinition` is invariant in `V`.
 */
export const builtinBlocks: BlockDefinition<Values>[] = [
  headingBlock as unknown as BlockDefinition<Values>,
  textBlock as unknown as BlockDefinition<Values>,
  buttonBlock as unknown as BlockDefinition<Values>,
  imageBlock as unknown as BlockDefinition<Values>,
  dividerBlock as unknown as BlockDefinition<Values>,
  spacerBlock as unknown as BlockDefinition<Values>,
  socialBlock as unknown as BlockDefinition<Values>,
  menuBlock as unknown as BlockDefinition<Values>,
  iconListBlock as unknown as BlockDefinition<Values>,
  videoBlock as unknown as BlockDefinition<Values>,
  productBlock as unknown as BlockDefinition<Values>,
  tableBlock as unknown as BlockDefinition<Values>,
  countdownBlock as unknown as BlockDefinition<Values>,
  htmlBlock as unknown as BlockDefinition<Values>,
]

export {
  headingBlock,
  textBlock,
  buttonBlock,
  imageBlock,
  dividerBlock,
  spacerBlock,
  videoBlock,
  socialBlock,
  menuBlock,
  iconListBlock,
  htmlBlock,
  countdownBlock,
  tableBlock,
  productBlock,
}
