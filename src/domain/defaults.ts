import type { BlockMode, FocusArea, ItemStatus, PracticeItem } from './types';

// ---------------------------------------------------------------------------
// Smart defaults that make the quick-start flow near-instant. The user can
// override any of these, but a good default means they rarely need to.
// ---------------------------------------------------------------------------

export const DEFAULT_DURATION_MINUTES = 10;

export const DURATION_PRESETS = [5, 10, 15, 20, 30] as const;

const MODE_BY_STATUS: Record<ItemStatus, BlockMode> = {
  new: 'learn',
  fragile: 'repair',
  repairing: 'repair',
  usable: 'integrate',
  integrated: 'maintain',
  performable: 'perform',
  maintenance: 'maintain',
  dormant: 'diagnose',
};

export function defaultModeForStatus(status: ItemStatus): BlockMode {
  return MODE_BY_STATUS[status];
}

export function defaultFocusForItem(item: PracticeItem): FocusArea {
  return item.primaryFocus ?? 'other';
}
