import type {
  BlockMode,
  BlockResult,
  ISODate,
  ItemStatus,
  PracticeItem,
  ReviewType,
} from './types';
import { addDaysISODate, todayISODate } from './util';
import { daysSinceTouched } from './scoring';

// ---------------------------------------------------------------------------
// Spaced-review scheduling and gentle status suggestions.
//
// Nothing here mutates anything: these functions only *propose*. The user (via
// the close-block flow) always gets the final say.
// ---------------------------------------------------------------------------

const OFFSET_BY_RESULT: Record<Exclude<BlockResult, 'not_logged'>, number> = {
  worse: 1,
  same: 1,
  slightly_better: 2,
  stable_alone: 4,
  stable_in_context: 7,
  performable: 21, // spec range 14–28; default to the middle
};

function reviewTypeForResult(result: BlockResult): ReviewType {
  switch (result) {
    case 'worse':
    case 'same':
    case 'slightly_better':
      return 'repair';
    case 'stable_alone':
    case 'stable_in_context':
      return 'integration';
    case 'performable':
      return 'maintenance';
    default:
      return 'retention';
  }
}

export interface ReviewSuggestion {
  dueDate: ISODate;
  offsetDays: number;
  reviewType: ReviewType;
  /** True when the result was "same" — nudge the user to change approach. */
  changeStrategy: boolean;
  note?: string;
}

/**
 * Suggest the next review date when closing a block. Returns `null` for
 * `not_logged` (nothing concrete happened, so don't schedule anything).
 */
export function suggestReview(args: {
  result: BlockResult;
  mode?: BlockMode;
  status?: ItemStatus;
  now?: Date;
}): ReviewSuggestion | null {
  const { result, mode, status, now = new Date() } = args;
  if (result === 'not_logged') return null;

  let offsetDays = OFFSET_BY_RESULT[result];
  let reviewType = reviewTypeForResult(result);

  // Maintenance work that held up gets a long, calm interval.
  const maintaining = mode === 'maintain' || status === 'maintenance';
  if (maintaining && result !== 'worse' && result !== 'same') {
    offsetDays = 30;
    reviewType = 'maintenance';
  }

  return {
    dueDate: addDaysISODate(todayISODate(now), offsetDays),
    offsetDays,
    reviewType,
    changeStrategy: result === 'same',
    note: result === 'same' ? 'Same result again — try a different strategy or ask your teacher.' : undefined,
  };
}

export interface StatusSuggestion {
  /** Suggested new status, or `undefined` to keep the current one. */
  suggestedStatus?: ItemStatus;
  message?: string;
}

/**
 * Suggest (never force) a status change after a block closes.
 */
export function suggestStatusAfterBlock(args: {
  item: PracticeItem;
  result: BlockResult;
  last3AllSame: boolean;
}): StatusSuggestion {
  const { item, result, last3AllSame } = args;

  if (last3AllSame) {
    return { message: 'Three "same" results in a row — try a different strategy rather than changing status.' };
  }

  if (result === 'stable_alone' && (item.status === 'fragile' || item.status === 'repairing')) {
    return { suggestedStatus: 'usable', message: 'Stable on its own — promote to "usable"?' };
  }
  if (result === 'stable_in_context' && item.status === 'usable') {
    return { suggestedStatus: 'integrated', message: 'Holds up in context — promote to "integrated"?' };
  }
  if (result === 'performable' && item.status !== 'performable') {
    return { suggestedStatus: 'performable', message: 'Ready to perform — mark as "performable"?' };
  }

  return {};
}

/**
 * Suggest dormancy for long-untouched items (used by Insights, not the
 * close-block flow). Returns `true` when the item has not been touched for
 * 30+ days and isn't already resting.
 */
export function shouldSuggestDormant(item: PracticeItem, now: Date): boolean {
  if (item.status === 'maintenance' || item.status === 'dormant') return false;
  return daysSinceTouched(item, now) >= 30;
}
