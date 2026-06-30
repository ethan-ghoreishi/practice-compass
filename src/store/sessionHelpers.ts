import {
  DEFAULT_DURATION_MINUTES,
  defaultFocusForItem,
  defaultModeForStatus,
  type PracticeItem,
} from '../domain';
import type { StartSessionInput } from './useStore';

/** Smart defaults for starting a block on a given item (status → mode, etc.). */
export function defaultStartInput(item: PracticeItem): StartSessionInput {
  return {
    itemId: item.id,
    instrumentId: item.instrumentId,
    materialId: item.materialId,
    mode: defaultModeForStatus(item.status),
    focus: defaultFocusForItem(item),
    targetMinutes: DEFAULT_DURATION_MINUTES,
  };
}
