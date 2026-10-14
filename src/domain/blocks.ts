import type { BlockResult, FocusArea, ISODate, ISODateTime, ItemStatus, PracticeBlock, PracticeItem, Rating } from './types';
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
  /**
   * Next review date. `undefined` keeps the item's existing date, `null`
   * clears it (the item has no next review), an ISODate sets it (§1.1).
   */
  nextReviewDate?: ISODate | null;
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
    saturationWarning: isSaturated(itemBlocksIncludingNew, now),
    status: newStatus ?? item.status,
    nextReviewDate: nextReviewDate === undefined ? item.nextReviewDate : (nextReviewDate ?? undefined),
    updatedAt: nowISO(now),
  };
}

/**
 * What the owner revised on the item at close — the three fields most likely
 * to change because of the practice that just happened. By KEY PRESENCE: an
 * absent key is untouched and never written; `primaryFocus: null` is a
 * deliberate clear to None.
 */
export interface CloseItemEdits {
  status?: ItemStatus;
  primaryFocus?: FocusArea | null;
  difficulty?: Rating;
}

/**
 * Apply the close screen's item edits onto the item `applyBlockStats` just
 * refreshed. An explicit status wins; the engine's suggested status applies
 * only to a close that recorded a result — "Save without a result" keeps the
 * owner's own edits and drops the suggestion. Nothing else on the item moves:
 * the review decision was already taken from the item AS PRACTISED.
 */
export function applyCloseEdits(
  item: PracticeItem,
  opts: { edits?: CloseItemEdits; suggestedStatus?: ItemStatus; result: BlockResult },
): PracticeItem {
  const { edits = {}, suggestedStatus, result } = opts;
  const status = 'status' in edits ? edits.status : result === 'not_logged' ? undefined : suggestedStatus;
  const next = { ...item };
  if (status !== undefined) next.status = status;
  if ('primaryFocus' in edits) {
    if (edits.primaryFocus === null || edits.primaryFocus === undefined) delete next.primaryFocus;
    else next.primaryFocus = edits.primaryFocus;
  }
  if ('difficulty' in edits && edits.difficulty !== undefined) next.difficulty = edits.difficulty;
  return next;
}

/**
 * The next action chosen the LAST time this item was practised — the last step
 * of the practice loop, which used to be written on every close and read
 * nowhere. Closing the loop means showing it before you start playing.
 *
 * The most recent NON-EMPTY one wins: a later block that recorded none should
 * not blank out a decision that still stands. Order is derived here rather
 * than trusted from the caller, so a differently-sorted list still answers
 * correctly.
 */
export function lastNextAction(blocks: PracticeBlock[]): string | undefined {
  return [...blocks]
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .map((b) => b.nextAction?.trim())
    .find((a): a is string => !!a);
}

/**
 * The most recent NON-EMPTY observation, DERIVED from the blocks themselves
 * together with the day it was recorded.
 *
 * The item used to cache this as `lastObservation`, which made it a second,
 * silently diverging copy of something the blocks already knew — and one with
 * no date, so a sentence from six months ago read exactly like last night's.
 * Deriving it instead means it is always the real record, and it can be
 * LABELLED with when it was written wherever it is shown.
 */
export function latestObservation(blocks: PracticeBlock[]): { text: string; at: ISODateTime } | undefined {
  return [...blocks]
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .map((b) => ({ text: b.observation?.trim() ?? '', at: b.startedAt }))
    .find((o): o is { text: string; at: ISODateTime } => o.text.length > 0);
}
