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
  const A = { id: 'a', nextReviewDate: '2027-02-10' };
  const B = { id: 'b', nextReviewDate: '2027-05-05' };
  const openOnA = { forItem: 'a', seeded: '2027-02-10', text: '2027-02-10' };

  it('keeps an untouched draft while its item and date are unchanged', () => {
    expect(reviewDateDraftFor(openOnA, A)).toEqual(openOnA);
  });

  it('keeps text the owner typed for its own item', () => {
    const typed = { ...openOnA, text: '2027-03-01' };
    expect(reviewDateDraftFor(typed, A)).toEqual(typed);
  });

  it('DROPS a draft belonging to another item, so A\'s date cannot be saved onto B', () => {
    expect(reviewDateDraftFor(openOnA, B)).toBeNull();
    expect(reviewDateDraftFor({ ...openOnA, text: '2027-03-01' }, B)).toBeNull();
  });

  it('re-seeds an UNTOUCHED box when the item\'s own date moved beneath it', () => {
    // A sync pull, another tab, or a close screen moved the date. Saving the
    // captured one would silently revert a change the owner never saw.
    const moved = { ...A, nextReviewDate: '2027-04-20' };
    expect(reviewDateDraftFor(openOnA, moved)).toEqual({
      forItem: 'a',
      seeded: '2027-04-20',
      text: '2027-04-20',
    });
  });

  it('keeps TYPED text when the item\'s date moved, and stops re-deciding it', () => {
    const typed = { ...openOnA, text: '2027-03-01' };
    const moved = { ...A, nextReviewDate: '2027-04-20' };
    const once = reviewDateDraftFor(typed, moved);
    expect(once).toEqual({ forItem: 'a', seeded: '2027-04-20', text: '2027-03-01' });
    // The baseline caught up, so a later render leaves it exactly alone.
    expect(reviewDateDraftFor(once, moved)).toEqual(once);
  });

  it('leaves a box seeded with today alone on an item that has no date', () => {
    // The seed is deliberately NOT the item's date there (it has none), so the
    // "moved" comparison must not fire and empty the box.
    const seededToday = { forItem: 'a', seeded: '2026-06-18', text: '2026-06-18' };
    const noDate = { id: 'a' };
    expect(reviewDateDraftFor(seededToday, noDate)).toEqual(seededToday);
    expect(reviewDateDraftFor({ ...seededToday, text: '2027-01-01' }, noDate)).toEqual({
      ...seededToday,
      text: '2027-01-01',
    });
  });

  it('has nothing to reconcile when no draft is open', () => {
    expect(reviewDateDraftFor(null, A)).toBeNull();
  });
});
