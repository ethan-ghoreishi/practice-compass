import { describe, expect, it } from 'vitest';
import { createItem, planNextReview, REVIEW_TYPE_LABELS, type ReviewPlan } from '../domain';
import { relativeDay, reviewSummaryLine } from './format';

const NOW = new Date('2026-06-18T12:00:00.000Z');

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
