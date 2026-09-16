import { describe, expect, it } from 'vitest';
import {
  addDays,
  type BlockResult,
  createItem,
  planNextReview,
  REVIEW_TYPE_LABELS,
  type ReviewPlan,
  toISODate,
} from '../domain';
import {
  closeOverrideDate,
  relativeDay,
  reviewDateDraftFor,
  reviewOverrideSurvivesResultChange,
  reviewSummaryLine,
  splitLines,
} from './format';

const NOW = new Date('2026-06-18T12:00:00.000Z');

const ALL_RESULTS: BlockResult[] = [
  'worse',
  'same',
  'slightly_better',
  'stable_alone',
  'stable_in_context',
  'performable',
];

/**
 * The close screen collapses the whole scheduling decision to ONE line, with
 * the date field, the review type and "Why this date?" a tap behind it. That is
 * only safe if the line and the field are two renderings of the SAME value — so
 * this asserts the formatter REPORTS a plan rather than deriving anything of its
 * own. A formatter that recomputed a date could disagree with the field; one
 * that can only read the three fields it is handed cannot.
 */
describe('reviewSummaryLine', () => {
  it("the one-line review summary reports exactly the ReviewPlan's due date, type and rationale", () => {
    // A REAL plan from the engine — the same call CloseBlock makes — so this is
    // bound to the value the screen actually holds, not a hand-written stub.
    const item = createItem({ instrumentId: 'i', title: 'درآمد شور', status: 'fragile' }, NOW);
    const plan = planNextReview({ item, result: 'worse', now: NOW });
    expect(plan).not.toBeNull();

    const line = reviewSummaryLine(plan as ReviewPlan, NOW);

    expect(line).toContain(relativeDay(plan!.dueDate, NOW));
    expect(line).toContain(REVIEW_TYPE_LABELS[plan!.reviewType]);
    expect(line).toContain(plan!.rationale);

    // …and nothing else: the line is exactly those three fields, in order.
    expect(line).toBe(
      `Review ${relativeDay(plan!.dueDate, NOW)} · ${REVIEW_TYPE_LABELS[plan!.reviewType]} · ${plan!.rationale}`,
    );
  });

  it('follows the plan it is given, so a corrected date is the date it reports', () => {
    // The screen folds a manual correction INTO the one plan value rather than
    // keeping a second date beside it. Whatever ends up in that value is what
    // the line says — there is no path by which the line keeps the engine's
    // date while the field shows another.
    const engine: ReviewPlan = {
      intervalDays: 2,
      dueDate: '2026-06-20',
      reviewType: 'repair',
      changeStrategy: false,
      rationale: 'A slip resets the interval to 2 days.',
    };
    const corrected: ReviewPlan = { ...engine, dueDate: '2026-07-01', rationale: 'The date you chose.' };

    expect(reviewSummaryLine(engine, NOW)).toBe('Review in 2 days · Repair · A slip resets the interval to 2 days.');
    expect(reviewSummaryLine(corrected, NOW)).toBe('Review in 13 days · Repair · The date you chose.');
  });
});

/**
 * A manually chosen review date must survive changing the result WHENEVER THE
 * ENGINE'S ANSWER DOES NOT DEPEND ON THE RESULT. The predicate is bound to the
 * actual engine here, not asserted in prose: it asks the engine for all six
 * results and compares the dates it gets back.
 */
describe('reviewOverrideSurvivesResultChange', () => {
  it('a manually chosen date survives changing the result when no automatic plan depends on it', () => {
    // Manual mode: no automatic plan for ANY result, ever.
    const manualItem = createItem(
      { instrumentId: 'i', title: 'درآمد شور', status: 'fragile', reviewMode: 'manual' },
      NOW,
    );
    for (const result of ALL_RESULTS) {
      expect(planNextReview({ item: manualItem, result, now: NOW })).toBeNull();
    }
    expect(reviewOverrideSurvivesResultChange(manualItem, NOW)).toBe(true);

    // A PROTECTED future date: the answer is "the existing one" whatever the
    // judgement, so a date the owner typed was never tied to a result either.
    const protectedItem = {
      ...createItem({ instrumentId: 'i', title: 'Protected', status: 'fragile' }, NOW),
      nextReviewDate: toISODate(addDays(NOW, 6)),
    };
    expect(reviewOverrideSurvivesResultChange(protectedItem, NOW)).toBe(true);

    // A DUE automatic item: the engine answers differently per result, so a
    // correction made for one judgement must not be carried to another.
    const dueItem = {
      ...createItem({ instrumentId: 'i', title: 'Étude', status: 'fragile' }, NOW),
      nextReviewDate: toISODate(NOW),
      nextReviewSource: 'auto' as const,
    };
    for (const result of ALL_RESULTS) {
      expect(planNextReview({ item: dueItem, result, now: NOW })).not.toBeNull();
    }
    expect(reviewOverrideSurvivesResultChange(dueItem, NOW)).toBe(false);
  });
});

/**
 * THE SEAM between the close screen and the store. The screen shows the date
 * that will STAND — which, for a session before a review is due, is the item's
 * existing date. Handing that back as an explicit override would stamp every
 * engine-proposed date as the owner's (so nothing could ever bring it forward
 * again) and turn every "keep" into a write that completes the pending row.
 * Only a date actually typed into the field is an override.
 */
describe('closeOverrideDate', () => {
  it('passes on only a date the owner typed, never the date merely displayed', () => {
    expect(closeOverrideDate('scheduled', null)).toBeUndefined();
    expect(closeOverrideDate('scheduled', {})).toBeUndefined();
    // Changing only the review-type pills sets an override with no date.
    expect(closeOverrideDate('scheduled', { dueDate: undefined })).toBeUndefined();
    // A cleared field is a decline, handled by the answer — not a date.
    expect(closeOverrideDate('scheduled', { dueDate: '' })).toBeUndefined();
    expect(closeOverrideDate('scheduled', { dueDate: '2026-07-04' })).toBe('2026-07-04');
    // The other two answers never carry a date at all.
    expect(closeOverrideDate('declined', { dueDate: '2026-07-04' })).toBeUndefined();
    expect(closeOverrideDate('unanswered', { dueDate: '2026-07-04' })).toBeUndefined();
  });
});

describe('splitLines', () => {
  it('splits a multi-line free-text field into its trimmed, non-empty lines', () => {
    expect(splitLines('سوال اول؟\nسوال دوم؟')).toEqual(['سوال اول؟', 'سوال دوم؟']);
  });

  it('keeps a single line as one entry, and drops blank lines and surrounding whitespace', () => {
    expect(splitLines('one question')).toEqual(['one question']);
    expect(splitLines('a\n\n  \nb\n')).toEqual(['a', 'b']);
    expect(splitLines('  padded  ')).toEqual(['padded']);
  });
});

describe('reviewDateDraftFor', () => {
  const TODAY = '2026-06-18';
  const A = { id: 'a', nextReviewDate: '2027-02-10' };
  const B = { id: 'b', nextReviewDate: '2027-05-05' };
  const openOnA = { forItem: 'a', seeded: '2027-02-10', offered: '2027-02-10', text: '2027-02-10' };
  // What ScheduleAgain seeds on an item with NO date: the item's own date is
  // empty, and the box is offered today.
  const openOnDateless = { forItem: 'a', seeded: '', offered: TODAY, text: TODAY };

  it('keeps an untouched draft while its item and date are unchanged', () => {
    expect(reviewDateDraftFor(openOnA, A, TODAY)).toEqual(openOnA);
  });

  it('keeps text the owner typed for its own item', () => {
    const typed = { ...openOnA, text: '2027-03-01' };
    expect(reviewDateDraftFor(typed, A, TODAY)).toEqual(typed);
  });

  it('DROPS a draft belonging to another item, so A\'s date cannot be saved onto B', () => {
    expect(reviewDateDraftFor(openOnA, B, TODAY)).toBeNull();
    expect(reviewDateDraftFor({ ...openOnA, text: '2027-03-01' }, B, TODAY)).toBeNull();
  });

  // --- The item's own date moving beneath the box: ONE rule, every direction -
  // present→different, present→absent and absent→present are the same
  // question ("is this box still offering what the item says?") and must not
  // be three cases with three answers. `seeded` records the item's own date
  // (empty when it has none) and `offered` what the box was filled with, so
  // "untouched" is decidable without exempting any transition.

  it('re-seeds an UNTOUCHED box when the item\'s own date moved beneath it', () => {
    // A sync pull, another tab, or a close screen moved the date. Saving the
    // captured one would silently revert a change the owner never saw.
    const moved = { ...A, nextReviewDate: '2027-04-20' };
    expect(reviewDateDraftFor(openOnA, moved, TODAY)).toEqual({
      forItem: 'a',
      seeded: '2027-04-20',
      offered: '2027-04-20',
      text: '2027-04-20',
    });
  });

  it('re-seeds an UNTOUCHED box when the item\'s date was CLEARED beneath it', () => {
    // The sealed counterexample. A live update (a sync pull, a declined review
    // closed elsewhere) removes A's pending date while the panel sits open.
    // The old rule skipped the comparison entirely whenever the item had no
    // date, so the box went on showing 2027-02-10 and "Save date" wrote it
    // back — resurrecting a schedule the item no longer had. It is the same
    // "the item's date moved" case as every other, and re-seeds to what a
    // fresh open would offer: today.
    const cleared = { id: 'a' };
    expect(reviewDateDraftFor(openOnA, cleared, TODAY)).toEqual({
      forItem: 'a',
      seeded: '',
      offered: TODAY,
      text: TODAY,
    });
    // …and it stays settled: the baseline caught up, so a later render with
    // the same (dateless) item leaves it exactly alone rather than re-deciding.
    const once = reviewDateDraftFor(openOnA, cleared, TODAY)!;
    expect(reviewDateDraftFor(once, cleared, TODAY)).toEqual(once);
  });

  it('re-seeds an UNTOUCHED today-box when the item GAINED a date beneath it', () => {
    // The mirror image, and the reason "the item has no date" cannot simply be
    // spelled as an empty `seeded` on the text as well: the box was offered
    // today, today is not the item's date, and the box must still follow the
    // item when one arrives.
    const gained = { id: 'a', nextReviewDate: '2027-04-20' };
    expect(reviewDateDraftFor(openOnDateless, gained, TODAY)).toEqual({
      forItem: 'a',
      seeded: '2027-04-20',
      offered: '2027-04-20',
      text: '2027-04-20',
    });
  });

  it('keeps TYPED text through every move of the item\'s own date', () => {
    // The owner's intent outranks the item's date in all three directions, and
    // the baseline catches up each time so it is not re-decided every render.
    const typed = { ...openOnA, text: '2027-03-01' };
    const moved = { ...A, nextReviewDate: '2027-04-20' };
    const once = reviewDateDraftFor(typed, moved, TODAY);
    expect(once).toEqual({ forItem: 'a', seeded: '2027-04-20', offered: '2027-02-10', text: '2027-03-01' });
    expect(reviewDateDraftFor(once, moved, TODAY)).toEqual(once);

    // Cleared beneath TYPED text: the text is theirs and stands.
    expect(reviewDateDraftFor(typed, { id: 'a' }, TODAY)).toEqual({
      forItem: 'a',
      seeded: '',
      offered: '2027-02-10',
      text: '2027-03-01',
    });
    // Gained beneath a typed today-box: likewise.
    const typedOnDateless = { ...openOnDateless, text: '2027-01-01' };
    expect(reviewDateDraftFor(typedOnDateless, { id: 'a', nextReviewDate: '2027-04-20' }, TODAY)).toEqual({
      forItem: 'a',
      seeded: '2027-04-20',
      offered: TODAY,
      text: '2027-01-01',
    });
  });

  it('leaves a box seeded with today alone on an item that still has no date', () => {
    // The item's date has not moved — it is absent and stays absent — so
    // nothing here re-seeds, including across a later day: the comparison is
    // against the ITEM, never against `today`.
    const noDate = { id: 'a' };
    expect(reviewDateDraftFor(openOnDateless, noDate, TODAY)).toEqual(openOnDateless);
    expect(reviewDateDraftFor(openOnDateless, noDate, '2026-06-19')).toEqual(openOnDateless);
    expect(reviewDateDraftFor({ ...openOnDateless, text: '2027-01-01' }, noDate, TODAY)).toEqual({
      ...openOnDateless,
      text: '2027-01-01',
    });
  });

  it('has nothing to reconcile when no draft is open', () => {
    expect(reviewDateDraftFor(null, A, TODAY)).toBeNull();
  });
});
