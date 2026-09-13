import { describe, expect, it } from 'vitest';
import { type BlockResult, createItem, planNextReview, REVIEW_TYPE_LABELS, type ReviewPlan } from '../domain';
import { relativeDay, reviewOverrideSurvivesResultChange, reviewSummaryLine, splitLines } from './format';

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
 * A manually chosen review date must survive changing the result WHEN NO
 * AUTOMATIC PLAN EXISTS — the rule the close screen used to keep before this
 * lane restructured it around a single `ReviewPlan`, and lost. The predicate
 * is bound to the actual engine here (not just asserted in prose): a
 * manual-mode item has no automatic plan for any of the six results, and an
 * auto-mode item has one for every one of them.
 */
describe('reviewOverrideSurvivesResultChange', () => {
  it('a manually chosen date survives changing the result when no automatic plan exists', () => {
    const manualItem = createItem(
      { instrumentId: 'i', title: 'درآمد شور', status: 'fragile', reviewMode: 'manual' },
      NOW,
    );
    for (const result of ALL_RESULTS) {
      expect(planNextReview({ item: manualItem, result, now: NOW })).toBeNull();
    }
    expect(reviewOverrideSurvivesResultChange(manualItem.reviewMode)).toBe(true);

    const autoItem = createItem({ instrumentId: 'i', title: 'Étude', status: 'fragile' }, NOW);
    for (const result of ALL_RESULTS) {
      expect(planNextReview({ item: autoItem, result, now: NOW })).not.toBeNull();
    }
    expect(reviewOverrideSurvivesResultChange(autoItem.reviewMode)).toBe(false);
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
