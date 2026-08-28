import type {
  BgImage,
  Body,
  BorderValue,
  BoxValue,
  Column,
  ColumnValues,
  Design,
  Row,
  RowValues,
} from '@/types/schema'
import { SCHEMA_VERSION } from '@/types/schema'
import { DEFAULT_FONT } from './fonts'
import { uid } from '@/lib/utils'

/* Value primitive factories ----------------------------------------- */

export function box(top = 0, right = top, bottom = top, left = right): BoxValue {
  return { top, right, bottom, left }
}

export function noBorder(): BorderValue {
  return { width: 0, style: 'solid', color: '#e2e8f0' }
}

export function noBgImage(): BgImage {
  return { url: '', repeat: 'no-repeat', size: 'cover', position: 'center center' }
}

/* Structure factories ------------------------------------------------ */

export function columnValues(): ColumnValues {
  return {
    backgroundColor: 'transparent',
    backgroundImage: noBgImage(),
    padding: box(0),
    border: noBorder(),
    borderRadius: 0,
    verticalAlign: 'top',
  }
}

export function createColumn(): Column {
  return { id: uid('col'), contents: [], values: columnValues() }
}

export function rowValues(): RowValues {
  return {
    backgroundColor: 'transparent',
    columnsBackground: 'transparent',
    backgroundImage: noBgImage(),
    fullWidth: false,
    padding: box(0),
    border: noBorder(),
    borderRadius: 0,
    verticalAlign: 'top',
    gap: 0,
    hideOnDesktop: false,
    hideOnMobile: false,
    stackOnMobile: true,
    reverseOnMobile: false,
  }
}

export function createRow(cells: number[] = [12]): Row {
  return {
    id: uid('row'),
    cells,
    columns: cells.map(() => createColumn()),
    values: rowValues(),
  }
}

export function createBody(contentWidth = 600): Body {
  return {
    id: uid('body'),
    values: {
      contentWidth,
      backgroundColor: '#f1f5f9',
      contentBackground: '#ffffff',
      backgroundImage: noBgImage(),
      fontFamily: DEFAULT_FONT,
      textColor: '#1f2937',
      linkColor: '#4f46e5',
      direction: 'ltr',
      language: 'en',
      padding: box(24, 12, 24, 12),
      borderRadius: 0,
      darkModeSupport: true,
    },
    rows: [],
  }
}

export function createDesign(contentWidth = 600): Design {
  return {
    schemaVersion: SCHEMA_VERSION,
    name: 'Untitled email',
    variables: [],
    meta: { subject: '', preview: '' },
    body: createBody(contentWidth),
  }
}

/* Layout presets shown in the Container panel ------------------------ */

export const LAYOUT_PRESETS: { label: string; cells: number[] }[] = [
  { label: '1 column', cells: [12] },
  { label: '2 columns', cells: [6, 6] },
  { label: '3 columns', cells: [4, 4, 4] },
  { label: '4 columns', cells: [3, 3, 3, 3] },
  { label: '1 : 2', cells: [4, 8] },
  { label: '2 : 1', cells: [8, 4] },
  { label: '1 : 3', cells: [3, 9] },
  { label: '3 : 1', cells: [9, 3] },
  { label: '1 : 2 : 1', cells: [3, 6, 3] },
]
