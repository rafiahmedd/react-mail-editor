import './styles/editor.css'

/* Component */
export { EmailEditor } from './components/EmailEditor'
export type { EmailEditorProps } from './components/EmailEditor'

/* Block authoring */
export { defineBlock } from './types/blocks'
export { BlockRegistry } from './blocks/registry'
export { builtinBlocks } from './blocks/builtins'
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
} from './blocks/builtins'

/* Export engine — usable server-side (Node) with a registry */
export { exportHtml, exportText, checkCompatibility, htmlSize } from './export/exportHtml'
export type { ExportHtmlOptions, CompatIssue } from './export/exportHtml'

/* Config + factories */
export { createDesign, createRow, createColumn, createBody, box, LAYOUT_PRESETS } from './config/defaults'
export { BUILTIN_TEMPLATES } from './config/templates'
export { FONTS, DEFAULT_FONT, FONT_WEIGHTS } from './config/fonts'
export { SOCIAL_NETWORKS } from './config/social'
export { migrate } from './store/editorStore'

/* Types */
export type {
  Design,
  Body,
  BodyValues,
  Row,
  RowValues,
  Column,
  ColumnValues,
  Content,
  ContentType,
  BuiltinContentType,
  DesignMeta,
  DesignVariable,
  Device,
  Selection,
  SelectionKind,
  BoxValue,
  BorderValue,
  BgImage,
  FontValue,
  TextAlign,
  VerticalAlign,
  Values,
} from './types/schema'
export { SCHEMA_VERSION } from './types/schema'

export type {
  BlockDefinition,
  BlockRenderProps,
  BlockGroup,
  ExportContext,
  VariableMode,
  VariableSyntax,
} from './types/blocks'

export type {
  ControlDef,
  InspectorGroup,
  InspectorSchema,
  SelectOption,
} from './types/inspector'

export type {
  EditorApi,
  EditorConfig,
  ExportOptions,
  ColorMode,
  ThemeTokens,
  ThemeColors,
  TemplateEntry,
  ToolbarActions,
  ToolbarLabels,
  SaveTemplatePayload,
} from './types/config'
