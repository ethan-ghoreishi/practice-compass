import { describe, expect, it } from 'vitest';
import {
  applyReviewDateToRow,
  applyReviewDateToRows,
  clampSchedulingParams,
  completeOpenReviewsFor,
  computeReviewOutcome,
  decideReview,
  DEFAULT_SCHEDULING_PARAMS,
  isProtectedPendingDate,
  pendingScheduleConflict,
  planNextReview,
  resolveReviewDate,
  SCHEDULING_BOUNDS,
  scheduleAgainPlan,
  shouldSuggestDormant,
  snoozePlan,
  suggestStatusAfterBlock,
  validateSchedulingFields,
} from './scheduling';
import type { BlockResult, ISODate, PracticeItem, Review, SchedulingParams } from './types';
import { applyBlockStats } from './blocks';
import { createBlock, createItem, createReview } from './factories';
import { addDays, toISODate } from './util';
import type { ItemStatus, Rating } from './types';

const NOW = new Date('2026-06-18T12:00:00.000Z');
const TODAY = toISODate(NOW);
const day = (n: number): ISODate => toISODate(addDays(NOW, n));

/** A closed block, for handing an outcome's date through applyBlockStats. */
function closedBlock() {
  return createBlock(
    { practiceItemId: 'item-1', instrumentId: 'i', durationMinutes: 10, mode: 'repair', focus: 'tone', result: 'not_logged', startedAt: NOW.toISOString() },
    NOW,
  );
}

function item(o: Partial<PracticeItem> & { status?: ItemStatus; importance?: Rating; difficulty?: Rating } = {}): PracticeItem {
  const base = createItem(
    { instrumentId: 'i', title: 't', status: o.status ?? 'usable', importance: o.importance ?? 3, difficulty: o.difficulty ?? 3 },
    NOW,
  );
  return { ...base, id: 'item-1', ...o };
}

const STABLE: BlockResult[] = ['stable_alone', 'stable_in_context', 'performable'];
const ALL_RESULTS: BlockResult[] = ['worse', 'same', 'slightly_better', ...STABLE];

// ---------------------------------------------------------------------------
// ac-1 — A1/A2/A3
// ---------------------------------------------------------------------------

describe('eligible retention evidence, and nothing else, advances spacing', () => {
  it('early successful practice preserves the pending review and spacing state', () => {
    // A future AUTOMATIC date: the review has not happened yet, so a good
    // session before it is extra practice, not retrieval evidence.
    const pending = day(5);
    const base = item({
      nextReviewDate: pending,
      nextReviewSource: 'auto',
      srReps: 2,
      srEase: 2.5,
      srIntervalDays: 6,
    });

    for (const result of STABLE) {
      const d = decideReview({ item: base, result, now: NOW });
      expect(d.disposition, result).toBe('keep');
      expect(d.effectiveDate, result).toBe(pending);
      expect(d.advanced, result).toBe(false);
      expect(d.sr, result).toBeUndefined();

      // The pending ROW keeps its identity too: nothing is completed and
      // nothing replaces it.
      const outcome = computeReviewOutcome({ item: base, result, answer: 'scheduled', now: NOW });
      expect(outcome.nextReviewDate, result).toBeUndefined();
      expect(outcome.completeOpenReviews, result).toBe(false);
      expect(outcome.review, result).toBeUndefined();

      const rows = [createReview({ practiceItemId: base.id, dueDate: pending, reviewType: 'retention' }, NOW)];
      expect(
        completeOpenReviewsFor({
          reviews: rows,
          practiceItemId: base.id,
          complete: outcome.completeOpenReviews,
          result,
          now: NOW,
        }),
        result,
      ).toEqual(rows);

      // The real block stats DO change — minutes and results are recorded.
      const next = applyBlockStats(base, closedBlock(), {
        itemBlocksIncludingNew: [closedBlock()],
        now: NOW,
        nextReviewDate: outcome.nextReviewDate,
      });
      expect(next.timesPractised, result).toBe(base.timesPractised + 1);
      expect(next.nextReviewDate, result).toBe(pending);
      expect(next.srReps, result).toBe(2);
      expect(next.srIntervalDays, result).toBe(6);
    }
  });

  it('a due stable result advances spacing exactly once per local calendar day', () => {
    const due = item({ nextReviewDate: TODAY, nextReviewSource: 'auto', srReps: 1, srIntervalDays: 2, srEase: 2.5 });

    const first = decideReview({ item: due, result: 'stable_alone', now: NOW });
    expect(first.disposition).toBe('set');
    expect(first.advanced).toBe(true);
    expect(first.sr).toMatchObject({ srReps: 2, srIntervalDays: 6, srLastProgressDay: TODAY });
    expect(first.dueDate).toBe(day(6));

    // The marker the first advance wrote is what blocks a second one — even
    // after the date has been cleared and re-armed, or the app reloaded.
    const advancedToday = { ...due, ...first.sr, nextReviewDate: first.dueDate, nextReviewSource: 'auto' as const };
    const second = decideReview({ item: advancedToday, result: 'performable', now: NOW });
    expect(second.disposition).toBe('keep');
    expect(second.advanced).toBe(false);

    const rearmed = { ...advancedToday, nextReviewDate: undefined };
    const third = decideReview({ item: rearmed, result: 'performable', now: NOW });
    expect(third.advanced).toBe(false);
    expect(third.disposition).toBe('keep');

    // Tomorrow, with the review genuinely due again, it advances once more.
    const tomorrow = new Date(addDays(NOW, 1));
    const dueAgain = { ...advancedToday, nextReviewDate: toISODate(tomorrow) };
    expect(decideReview({ item: dueAgain, result: 'performable', now: tomorrow }).advanced).toBe(true);
  });

  it('a first schedule with no date is an eligible opportunity, and unlogged results never advance', () => {
    const fresh = item({ nextReviewDate: undefined });
    const first = decideReview({ item: fresh, result: 'stable_alone', now: NOW });
    expect(first.disposition).toBe('set');
    expect(first.advanced).toBe(true);
    expect(first.dueDate).toBe(day(2));

    for (const result of [undefined, 'not_logged'] as (BlockResult | undefined)[]) {
      const d = decideReview({ item: fresh, result, now: NOW });
      expect(d.disposition, String(result)).toBe('keep');
      expect(d.advanced, String(result)).toBe(false);
      expect(d.sr, String(result)).toBeUndefined();
    }

    // Routine exposure is exactly this case: `applyRoutineRun` writes blocks
    // with the factory default `not_logged` and never reaches a close screen,
    // so a routine can never become a retention judgement.
    const routineClose = computeReviewOutcome({
      item: fresh,
      result: 'not_logged',
      answer: 'unanswered',
      now: NOW,
    });
    expect(routineClose.nextReviewDate).toBeUndefined();
    expect(routineClose.completeOpenReviews).toBe(false);
    expect(routineClose.sr).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// ac-2 — A3/A4
// ---------------------------------------------------------------------------

describe('no improvement is not failed recall', () => {
  it('only deterioration can bring an automatic review forward', () => {
    const pending = day(5);
    const auto = item({ nextReviewDate: pending, nextReviewSource: 'auto', srReps: 3, srIntervalDays: 10, srEase: 2.5 });

    // `same` and `slightly_better` before the date: schedule and SR untouched,
    // and never described as a slip.
    for (const result of ['same', 'slightly_better'] as BlockResult[]) {
      const d = decideReview({ item: auto, result, now: NOW });
      expect(d.disposition, result).toBe('keep');
      expect(d.effectiveDate, result).toBe(pending);
      expect(d.sr, result).toBeUndefined();
      expect(d.rationale.toLowerCase(), result).not.toContain('slip');
    }

    // At the due date they REPEAT the current gap: no extra repetition, no
    // ease change, no reset.
    const due = { ...auto, nextReviewDate: TODAY };
    for (const result of ['same', 'slightly_better'] as BlockResult[]) {
      const d = decideReview({ item: due, result, now: NOW });
      expect(d.disposition, result).toBe('set');
      expect(d.advanced, result).toBe(false);
      expect(d.sr, result).toMatchObject({ srReps: 3, srEase: 2.5, srIntervalDays: 10 });
      expect(d.sr?.srLastProgressDay, result).toBeUndefined();
      expect(d.dueDate, result).toBe(day(10));
      expect(d.rationale.toLowerCase(), result).not.toContain('slip');
    }

    // With no interval yet, "the same gap again" is the configured first gap.
    const neverScheduled = item({ nextReviewDate: TODAY, nextReviewSource: 'auto' });
    expect(decideReview({ item: neverScheduled, result: 'same', now: NOW }).dueDate).toBe(day(2));
  });

  it('worse shortens an automatic future date to min(existing, repair) and never postpones it', () => {
    const params: SchedulingParams = { ...DEFAULT_SCHEDULING_PARAMS, sm2SlipResetDays: 3 };

    // Far-off date: the repair proposal is earlier, so it wins.
    const far = item({ nextReviewDate: day(30), nextReviewSource: 'auto', srReps: 4, srIntervalDays: 30 });
    const shortened = decideReview({ item: far, result: 'worse', now: NOW, params });
    expect(shortened.disposition).toBe('set');
    expect(shortened.dueDate).toBe(day(3));
    expect(shortened.sr).toMatchObject({ srReps: 0, srIntervalDays: 3 });

    // A date already sooner than the repair proposal is NOT pushed out.
    const soon = item({ nextReviewDate: day(1), nextReviewSource: 'auto' });
    expect(decideReview({ item: soon, result: 'worse', now: NOW, params }).dueDate).toBe(day(1));

    // Repetition cannot slide it either: feeding the result back in leaves it.
    const after = { ...soon, nextReviewDate: day(1) };
    expect(decideReview({ item: after, result: 'worse', now: NOW, params }).dueDate).toBe(day(1));
  });

  it('the rationale reports the final saved date, not the raw setting', () => {
    const params: SchedulingParams = { ...DEFAULT_SCHEDULING_PARAMS, sm2SlipResetDays: 3 };
    // importance 1 / difficulty 1 stretch 3 days to round(3 × 1.16 × 1.10) = 4.
    const easy = item({ importance: 1, difficulty: 1, nextReviewDate: TODAY, nextReviewSource: 'auto' });
    const d = decideReview({ item: easy, result: 'worse', now: NOW, params });
    expect(d.dueDate).toBe(day(4));
    expect(d.rationale).toContain('4 days');
    expect(d.rationale).not.toContain('3 days');
  });
});

// ---------------------------------------------------------------------------
// ac-3 — A5/C6
// ---------------------------------------------------------------------------

describe('a date the owner owns is not the engine’s to move', () => {
  it('manual and fixed dates survive extra practice without advancing spacing', () => {
    const future = day(9);
    const protectedItems: { label: string; value: PracticeItem }[] = [
      { label: 'manual override of an auto date', value: item({ nextReviewDate: future, nextReviewSource: 'user' }) },
      { label: 'manual mode', value: item({ nextReviewDate: future, reviewMode: 'manual', nextReviewSource: 'user' }) },
      {
        label: 'fixed cadence',
        value: item({ nextReviewDate: future, reviewMode: 'interval', reviewIntervalDays: 14, nextReviewSource: 'auto' }),
      },
      { label: 'snoozed date', value: item({ nextReviewDate: future, nextReviewSource: 'user' }) },
      { label: 'legacy unknown provenance', value: item({ nextReviewDate: future, nextReviewSource: undefined }) },
    ];

    for (const { label, value } of protectedItems) {
      expect(isProtectedPendingDate(value, NOW), label).toBe(true);
      for (const result of ALL_RESULTS) {
        const d = decideReview({ item: value, result, now: NOW });
        expect(d.disposition, `${label} · ${result}`).toBe('keep');
        expect(d.effectiveDate, `${label} · ${result}`).toBe(future);
        expect(d.advanced, `${label} · ${result}`).toBe(false);
        expect(d.sr, `${label} · ${result}`).toBeUndefined();
      }
    }
  });

  it('a due protected date hands the item back to its own review mode', () => {
    // AT the date, protection ends — it is the review, whoever chose it.
    const dueUserDate = item({ nextReviewDate: TODAY, nextReviewSource: 'user', srReps: 1, srIntervalDays: 2 });
    expect(isProtectedPendingDate(dueUserDate, NOW)).toBe(false);
    const advanced = decideReview({ item: dueUserDate, result: 'stable_alone', now: NOW });
    expect(advanced.advanced).toBe(true);
    expect(advanced.dueDate).toBe(day(6));

    // A fixed cadence uses its configured gap and leaves SM-2 alone.
    const dueFixed = item({
      nextReviewDate: TODAY,
      reviewMode: 'interval',
      reviewIntervalDays: 14,
      srReps: 3,
      srEase: 2.5,
      srIntervalDays: 10,
    });
    const fixed = decideReview({ item: dueFixed, result: 'stable_in_context', now: NOW });
    expect(fixed.dueDate).toBe(day(14));
    expect(fixed.sr).toBeUndefined();
    expect(fixed.advanced).toBe(false);

    // Manual mode never proposes at all — the pending schedule simply stands.
    const dueManual = item({ nextReviewDate: TODAY, reviewMode: 'manual' });
    const manual = computeReviewOutcome({ item: dueManual, result: 'stable_alone', answer: 'scheduled', now: NOW });
    expect(manual.nextReviewDate).toBeUndefined();
    expect(manual.completeOpenReviews).toBe(false);

    // …unless the owner explicitly declines.
    const declined = computeReviewOutcome({ item: dueManual, result: 'stable_alone', answer: 'declined', now: NOW });
    expect(declined.nextReviewDate).toBeNull();
    expect(declined.completeOpenReviews).toBe(true);
  });

  it('an explicit date edit is respected in either direction and recorded as the owner’s', () => {
    const auto = item({ nextReviewDate: TODAY, nextReviewSource: 'auto', srReps: 1, srIntervalDays: 2 });
    const engineDate = decideReview({ item: auto, result: 'stable_alone', now: NOW }).dueDate;
    expect(engineDate).toBe(day(6));

    for (const chosen of [day(2), day(40)]) {
      const outcome = computeReviewOutcome({
        item: auto,
        result: 'stable_alone',
        answer: 'scheduled',
        nextReviewDate: chosen,
        now: NOW,
      });
      expect(outcome.nextReviewDate, chosen).toBe(chosen);
      expect(outcome.nextReviewSource, chosen).toBe('user');
      expect(outcome.review?.dueDate, chosen).toBe(chosen);
    }
  });
});

// ---------------------------------------------------------------------------
// ac-4 — A6
// ---------------------------------------------------------------------------

describe('the pending review has exactly one date, and three honest answers', () => {
  it('decline unanswered and schedule again make distinct pending review transitions', () => {
    const pending = day(4);
    const base = item({ nextReviewDate: pending, nextReviewSource: 'auto', srReps: 2, srIntervalDays: 6 });
    const openRow = createReview({ practiceItemId: base.id, dueDate: pending, reviewType: 'retention' }, NOW);
    const completedRow: Review = {
      ...createReview({ practiceItemId: base.id, dueDate: day(-30), reviewType: 'retention' }, NOW),
      id: 'old',
      completedAt: NOW.toISOString(),
      result: 'stable_alone',
    };
    const rows = [completedRow, openRow];

    // 1. UNANSWERED — nothing about the schedule was judged.
    const unanswered = computeReviewOutcome({ item: base, result: 'not_logged', answer: 'unanswered', now: NOW });
    expect(unanswered).toMatchObject({ nextReviewDate: undefined, nextReviewSource: undefined, completeOpenReviews: false });
    expect(
      completeOpenReviewsFor({ reviews: rows, practiceItemId: base.id, complete: false, now: NOW }),
    ).toEqual(rows);

    // 2. DECLINED — a deliberate No: date cleared, row completed, no fake
    //    result and no spacing progress.
    const declined = computeReviewOutcome({ item: base, result: 'same', answer: 'declined', now: NOW });
    expect(declined).toMatchObject({ nextReviewDate: null, nextReviewSource: null, completeOpenReviews: true });
    expect(declined.sr).toBeUndefined();
    const afterDecline = applyBlockStats(base, closedBlock(), {
      itemBlocksIncludingNew: [closedBlock()],
      now: NOW,
      nextReviewDate: declined.nextReviewDate,
    });
    expect(afterDecline.nextReviewDate).toBeUndefined();
    expect(afterDecline.srReps).toBe(2); // untouched
    const closedRows = completeOpenReviewsFor({
      reviews: rows,
      practiceItemId: base.id,
      complete: true,
      result: 'same',
      now: NOW,
    });
    expect(closedRows.every((r) => !!r.completedAt)).toBe(true);
    expect(closedRows.find((r) => r.id === 'old')).toEqual(completedRow); // history intact

    // 3. SCHEDULE AGAIN with an existing open row — the row MOVES, no
    //    duplicate is created, and nothing is completed.
    const chosen = day(11);
    const edit = scheduleAgainPlan({ item: afterDecline, reviews: [completedRow, openRow], dueDate: chosen, now: NOW });
    expect(edit.createRow).toBe(false);
    expect(edit.reviews.filter((r) => !r.completedAt)).toHaveLength(1);
    expect(edit.reviews.find((r) => r.id === openRow.id)?.dueDate).toBe(chosen);
    expect(edit.reviews.find((r) => r.id === 'old')).toEqual(completedRow);

    // 4. SCHEDULE AGAIN with NO open row — one has to be created, which the
    //    old date helper could never do: it only updated existing rows.
    const noRow = scheduleAgainPlan({ item: afterDecline, reviews: [completedRow], dueDate: chosen, now: NOW });
    expect(noRow.createRow).toBe(true);
    expect(noRow.reviews).toEqual([completedRow]);

    // Repeating it does not pile up pending rows.
    const again = scheduleAgainPlan({
      item: afterDecline,
      reviews: [completedRow, { ...openRow, dueDate: chosen }],
      dueDate: chosen,
      now: NOW,
    });
    expect(again.createRow).toBe(false);
    expect(again.reviews.filter((r) => !r.completedAt)).toHaveLength(1);

    // 5. SNOOZE — one row moves, honestly, with no SM-2 change.
    const snoozed = snoozePlan(2, NOW);
    expect(snoozed.dueDate).toBe(day(2));
    const snoozedRows = applyReviewDateToRow({
      reviews: [completedRow, openRow],
      reviewId: openRow.id,
      instruction: snoozed.dueDate,
      now: NOW,
    })!;
    expect(snoozedRows.find((r) => r.id === openRow.id)?.dueDate).toBe(snoozed.dueDate);
    expect(snoozedRows.find((r) => r.id === 'old')).toEqual(completedRow);

    // 6. Item and row always agree after a scheduled close.
    const dueItem = { ...base, nextReviewDate: TODAY };
    const scheduled = computeReviewOutcome({ item: dueItem, result: 'stable_alone', answer: 'scheduled', now: NOW });
    expect(scheduled.review?.dueDate).toBe(scheduled.nextReviewDate);
  });

  it('conflicting legacy pending dates are reported, not silently discarded', () => {
    const base = item({ nextReviewDate: day(4) });
    const a = { ...createReview({ practiceItemId: base.id, dueDate: day(4), reviewType: 'retention' }, NOW), id: 'a' };
    const b = { ...createReview({ practiceItemId: base.id, dueDate: day(9), reviewType: 'retention' }, NOW), id: 'b' };

    expect(pendingScheduleConflict(base, [a])).toBeNull();
    const conflict = pendingScheduleConflict(base, [a, b])!;
    expect(conflict.rows.map((r) => r.id)).toEqual(['a', 'b']);
    expect(conflict.message).toContain(day(9));

    // Normalising is a deliberate WRITE, and it keeps both rows — nothing is
    // deleted and no completion is fabricated.
    const normalised = applyReviewDateToRows({
      reviews: [a, b],
      practiceItemId: base.id,
      instruction: day(4),
      now: NOW,
    })!;
    expect(normalised).toHaveLength(2);
    expect(normalised.every((r) => r.dueDate === day(4) && !r.completedAt)).toBe(true);
    expect(pendingScheduleConflict(base, normalised)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// The preview the close screen renders is the decision it saves
// ---------------------------------------------------------------------------

describe('planNextReview previews the decision, never a second one', () => {
  it('shows the date that will stand, whether the decision writes it or keeps it', () => {
    const kept = item({ nextReviewDate: day(5), nextReviewSource: 'user' });
    expect(planNextReview({ item: kept, result: 'stable_alone', now: NOW })?.dueDate).toBe(day(5));

    const due = item({ nextReviewDate: TODAY, nextReviewSource: 'auto' });
    const preview = planNextReview({ item: due, result: 'stable_alone', now: NOW })!;
    const saved = computeReviewOutcome({ item: due, result: 'stable_alone', answer: 'scheduled', now: NOW });
    expect(preview.dueDate).toBe(saved.nextReviewDate);

    // Nothing at all to show when there is genuinely no date.
    const blank = item({ nextReviewDate: undefined, reviewMode: 'manual' });
    expect(planNextReview({ item: blank, result: 'stable_alone', now: NOW })).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Inbound validation (used by ac-15's wiring test too)
// ---------------------------------------------------------------------------

describe('validateSchedulingFields', () => {
  it('rejects unreadable new scheduling data and tolerates legacy debris', () => {
    const good = item({ nextReviewDate: day(3), nextReviewSource: 'auto', srLastProgressDay: TODAY });
    expect(validateSchedulingFields({ items: [good], reviews: [] })).toBeNull();

    expect(
      validateSchedulingFields({ items: [{ ...good, nextReviewDate: 'soon' }], reviews: [] }),
    ).toMatch(/next-review date/);
    expect(
      validateSchedulingFields({ items: [{ ...good, nextReviewSource: 'guess' as never }], reviews: [] }),
    ).toMatch(/review-date source/);
    expect(
      validateSchedulingFields({ items: [{ ...good, srLastProgressDay: '18-06-2026' }], reviews: [] }),
    ).toMatch(/spacing-progress day/);
    expect(validateSchedulingFields({ items: [{ ...good, srEase: NaN }], reviews: [] })).toMatch(/srEase/);

    // A pending row pointing at a deleted item is legacy debris, not invalid
    // new intent: it must not make an entire restore fail.
    const orphan = createReview({ practiceItemId: 'gone', dueDate: day(1), reviewType: 'retention' }, NOW);
    expect(validateSchedulingFields({ items: [good], reviews: [orphan] })).toBeNull();
    expect(
      validateSchedulingFields({ items: [good], reviews: [{ ...orphan, dueDate: 'whenever' }] }),
    ).toMatch(/due date/);
  });
});

// ---------------------------------------------------------------------------
// Unchanged behaviour that must stay unchanged
// ---------------------------------------------------------------------------

describe('scheduling knobs', () => {
  it('defaults reproduce the historical intervals exactly', () => {
    expect(DEFAULT_SCHEDULING_PARAMS).toEqual({
      sm2FirstIntervalDays: 2,
      sm2SecondIntervalDays: 6,
      sm2SlipResetDays: 1,
      warmupShare: 0.12,
      deepWorkShare: 0.33,
      reviewSlotMinMinutes: 3,
      reviewSlotMaxMinutes: 7,
    });
  });

  it('clamps every knob into its documented bounds', () => {
    const wild = clampSchedulingParams({
      sm2FirstIntervalDays: 99,
      sm2SecondIntervalDays: -4,
      sm2SlipResetDays: 2.4,
      warmupShare: 0.9,
      deepWorkShare: 0.01,
      reviewSlotMinMinutes: 100,
      reviewSlotMaxMinutes: 1,
    });
    for (const key of Object.keys(SCHEDULING_BOUNDS) as (keyof SchedulingParams)[]) {
      const [lo, hi] = SCHEDULING_BOUNDS[key];
      expect(wild[key], key).toBeGreaterThanOrEqual(lo);
      expect(wild[key], key).toBeLessThanOrEqual(hi);
    }
    expect(wild.reviewSlotMaxMinutes).toBeGreaterThanOrEqual(wild.reviewSlotMinMinutes);
    expect(clampSchedulingParams(undefined)).toEqual(DEFAULT_SCHEDULING_PARAMS);
  });

  it('the configured gaps actually drive the dates', () => {
    const params: SchedulingParams = { ...DEFAULT_SCHEDULING_PARAMS, sm2FirstIntervalDays: 4, sm2SecondIntervalDays: 9 };
    const first = decideReview({ item: item({ nextReviewDate: TODAY }), result: 'stable_alone', now: NOW, params });
    expect(first.dueDate).toBe(day(4));
    const second = decideReview({
      item: item({ nextReviewDate: TODAY, srReps: 1, srIntervalDays: 4 }),
      result: 'stable_alone',
      now: NOW,
      params,
    });
    expect(second.dueDate).toBe(day(9));
  });
});

describe('the tri-state review-date instruction', () => {
  it('absent keeps, null clears, a date sets both sides', () => {
    expect(resolveReviewDate(undefined)).toBeUndefined();
    expect(resolveReviewDate(null)).toEqual({ nextReviewDate: undefined });
    expect(resolveReviewDate(day(3))).toEqual({ nextReviewDate: day(3) });

    const open = createReview({ practiceItemId: 'item-1', dueDate: day(1), reviewType: 'retention' }, NOW);
    expect(applyReviewDateToRows({ reviews: [open], practiceItemId: 'item-1', instruction: undefined, now: NOW })).toBeUndefined();
    expect(applyReviewDateToRows({ reviews: [open], practiceItemId: 'item-1', instruction: null, now: NOW })).toEqual([]);
    expect(
      applyReviewDateToRows({ reviews: [open], practiceItemId: 'item-1', instruction: day(8), now: NOW })![0].dueDate,
    ).toBe(day(8));
  });
});

describe('status suggestions and dormancy', () => {
  it('suggests, never forces, and still flags a three-same streak', () => {
    expect(
      suggestStatusAfterBlock({ item: item({ status: 'fragile' }), result: 'stable_alone', last3AllSame: false })
        .suggestedStatus,
    ).toBe('usable');
    expect(
      suggestStatusAfterBlock({ item: item({ status: 'usable' }), result: 'stable_in_context', last3AllSame: false })
        .suggestedStatus,
    ).toBe('integrated');
    const streak = suggestStatusAfterBlock({ item: item(), result: 'same', last3AllSame: true });
    expect(streak.suggestedStatus).toBeUndefined();
    expect(streak.message).toContain('different strategy');
  });

  it('suggests dormancy only for long-untouched, still-active material', () => {
    const old = item({ lastPractisedAt: addDays(NOW, -40).toISOString() });
    expect(shouldSuggestDormant(old, NOW)).toBe(true);
    expect(shouldSuggestDormant({ ...old, status: 'dormant' }, NOW)).toBe(false);
    expect(shouldSuggestDormant(item({ lastPractisedAt: addDays(NOW, -2).toISOString() }), NOW)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Regression coverage carried forward from before this lane.
//
// These invariants belong to code this lane KEPT — the two row-scoped date
// writers, the snooze clamp, the explicit-`now` contract and the params
// default. The lane's ac-named tables exercise each of these functions, but
// only on their main branch and only ever with rows belonging to ONE item, so
// the isolation and edge branches below stopped being covered when the old
// per-function tests were replaced. Restored verbatim in substance; nothing
// here asserts anything about the new decision engine.
// ---------------------------------------------------------------------------

describe('a date write touches the rows it names, and nothing else', () => {
  const openRow = (dueDate: ISODate, o: Partial<Review> = {}): Review => ({
    ...createReview({ practiceItemId: 'item-1', dueDate, reviewType: 'retention' }, NOW),
    ...o,
  });

  it('moving an item’s date leaves completed rows and other items untouched', () => {
    const mine = openRow(day(-1));
    const completedMine = { ...openRow(day(-30)), id: 'done', completedAt: NOW.toISOString() };
    const other = { ...createReview({ practiceItemId: 'item-2', dueDate: day(1), reviewType: 'retention' }, NOW), id: 'other' };

    const updated = applyReviewDateToRows({
      reviews: [mine, completedMine, other],
      practiceItemId: 'item-1',
      instruction: day(5),
      now: NOW,
    })!;

    expect(updated.find((r) => r.id === mine.id)!.dueDate).toBe(day(5));
    expect(updated.find((r) => r.id === 'done')).toEqual(completedMine);
    expect(updated.find((r) => r.id === 'other')).toEqual(other);
  });

  it('the row-scoped write keeps, clears or moves exactly one row', () => {
    const a = { ...openRow(day(-14)), id: 'a' };
    const b = { ...openRow(day(-1)), id: 'b' };
    const other = { ...createReview({ practiceItemId: 'item-2', dueDate: day(1), reviewType: 'retention' }, NOW), id: 'other' };

    // ABSENT — no write at all, so the caller leaves its rows as they are.
    expect(applyReviewDateToRow({ reviews: [a], reviewId: 'a', instruction: undefined, now: NOW })).toBeUndefined();

    // NULL — removes only the named row; a SECOND open row for the SAME item
    // survives, which is what makes this distinct from the item-scoped write.
    const cleared = applyReviewDateToRow({ reviews: [a, b], reviewId: 'a', instruction: null, now: NOW })!;
    expect(cleared.find((r) => r.id === 'a')).toBeUndefined();
    expect(cleared.find((r) => r.id === 'b')!.dueDate).toBe(b.dueDate);

    // A DATE — moves the named row and leaves another item's row alone.
    const moved = applyReviewDateToRow({ reviews: [a, other], reviewId: 'a', instruction: day(5), now: NOW })!;
    expect(moved.find((r) => r.id === 'a')!.dueDate).toBe(day(5));
    expect(moved.find((r) => r.id === 'other')).toEqual(other);
  });

  it('snooze never lands in the past or on today', () => {
    expect(snoozePlan(2, NOW).dueDate).toBe(day(2));
    expect(snoozePlan(0, NOW).dueDate).toBe(day(1));
    expect(snoozePlan(-3, NOW).dueDate).toBe(day(1));
  });
});

describe('the engine never reads the wall clock, and its defaults are the default', () => {
  it('requires an explicit now at the type level', () => {
    // @ts-expect-error — `now` is required; omitting it must fail to compile
    // rather than silently fall back to `new Date()`.
    computeReviewOutcome({ item: item(), answer: 'scheduled' });
  });

  it('passing the explicit defaults is byte-identical to passing nothing', () => {
    const cases: { it: PracticeItem; r: BlockResult }[] = [
      { it: item({ nextReviewDate: TODAY }), r: 'stable_alone' },
      { it: item({ nextReviewDate: TODAY, srReps: 1, srIntervalDays: 2 }), r: 'stable_alone' },
      { it: item({ nextReviewDate: TODAY, srReps: 2, srIntervalDays: 6 }), r: 'stable_in_context' },
      { it: item({ nextReviewDate: TODAY, srReps: 4, srIntervalDays: 30 }), r: 'worse' },
      { it: item({ nextReviewDate: TODAY, importance: 5, difficulty: 5, srReps: 2, srIntervalDays: 6 }), r: 'stable_in_context' },
    ];
    for (const c of cases) {
      expect(decideReview({ item: c.it, result: c.r, now: NOW, params: DEFAULT_SCHEDULING_PARAMS })).toEqual(
        decideReview({ item: c.it, result: c.r, now: NOW }),
      );
      expect(planNextReview({ item: c.it, result: c.r, now: NOW, params: DEFAULT_SCHEDULING_PARAMS })).toEqual(
        planNextReview({ item: c.it, result: c.r, now: NOW }),
      );
    }
  });
});
