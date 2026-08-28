import { Node, mergeAttributes } from '@tiptap/core'

export interface VariableOptions {
  /** Rendered inside the chip, e.g. `{{{name}}}` or a friendly label. */
  renderLabel: (name: string) => string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    rmeVariable: {
      insertVariable: (name: string) => ReturnType
    }
  }
}

/**
 * An atomic inline node for merge variables. Serialises to
 * `<span data-rme-var="name" class="rme-var-chip">label</span>` so the exporter
 * can swap it for a merge token or its fallback value.
 */
export const Variable = Node.create<VariableOptions>({
  name: 'rmeVariable',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  addOptions() {
    return { renderLabel: (name: string) => name }
  },

  addAttributes() {
    return {
      name: {
        default: '',
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-rme-var') ?? '',
        renderHTML: (attrs) => ({ 'data-rme-var': String(attrs.name ?? '') }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-rme-var]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    const name = String(node.attrs.name ?? '')
    return [
      'span',
      mergeAttributes(HTMLAttributes, { class: 'rme-var-chip' }),
      this.options.renderLabel(name),
    ]
  },

  renderText({ node }) {
    return `{{{${node.attrs.name}}}}`
  },

  addCommands() {
    return {
      insertVariable:
        (name: string) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { name } }),
    }
  },
})
