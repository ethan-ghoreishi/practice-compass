import type { ISODate, ItemStatus, PracticeBlock, PracticeItem } from './types';
import { isSaturated } from './scoring';
import { nowISO } from './util';

// ---------------------------------------------------------------------------
// Applying a closed block back onto its practice item.
//
// Pure: takes the current item plus the block being saved, returns a new item
// with refreshed stats. The store calls this; tests call it directly.
// ---------------------------------------------------------------------------

export interface ApplyBlockOptions {
  /** All blocks for this item, *including* the one being saved. */
  itemBlocksIncludingNew: PracticeBlock[];
  now: Date;
  /** Accepted status change, if the user took the suggestion. */
  newStatus?: ItemStatus;
  /** Next review date (from the scheduling suggestion or a manual override). */
  nextReviewDate?: ISODate;
}

export function applyBlockStats(
  item: PracticeItem,
  block: PracticeBlock,
  opts: ApplyBlockOptions,
): PracticeItem {
  const { itemBlocksIncludingNew, now, newStatus, nextReviewDate } = opts;
  const practisedAt = block.endedAt ?? block.startedAt ?? nowISO(now);

  return {
    ...item,
    timesPractised: item.timesPractised + 1,
    totalMinutes: item.totalMinutes + Math.max(0, Math.round(block.durationMinutes)),
    lastPractisedAt: practisedAt,
    // Keep the previous meaningful result when the block was left unlogged.
    lastResult: block.result === 'not_logged' ? item.lastResult : block.result,
    lastObservation: block.observation?.trim() ? block.observation.trim() : item.lastObservation,
    saturationWarning: isSaturated(itemBlocksIncludingNew, now),
    status: newStatus ?? item.status,
    nextReviewDate: nextReviewDate ?? item.nextReviewDate,
    updatedAt: nowISO(now),
  };
}
