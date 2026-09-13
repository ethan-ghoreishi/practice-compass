import { describe, expect, it } from 'vitest';
import { buildReason, pickNextPart, recommend, recommendForInstrument, stallHint } from './recommend';
import { buildSessionPlan, swapSegment } from './plan';
import { createSeedDB } from './seed';
import { createBlock, createItem, createLesson } from './factories';
import { createPreparation, createQuestion, preparationDatesByItem } from './lessonAgenda';
import { scoreItem } from './scoring';
import { addDays, toISODate } from './util';
import type { BlockResult, ISODate, Lesson, PracticeItem } from './types';

const NOW = new Date('2026-06-18T12:00:00.000Z');
const INST = 'inst';
const day = (n: number): ISODate => toISODate(addDays(NOW, n));

function mk(o: Partial<PracticeItem> & { id: string; title: string }): PracticeItem {
  const base = createItem(
    {
      instrumentId: o.instrumentId ?? INST,
      title: o.title,
      status: o.status ?? 'usable',
      importance: o.importance ?? 3,
      difficulty: o.difficulty ?? 3,
    },
    NOW,
  );
  return { ...base, ...o };
}

function sameBlocks(item: PracticeItem, n = 3) {
  return Array.from({ length: n }, (_, idx) =>
    createBlock(
      {
        practiceItemId: item.id,
        instrumentId: item.instrumentId,
        durationMinutes: 10,
        mode: 'repair',
        focus: 'tone',
        result: 'same' as BlockResult,
        startedAt: addDays(NOW, -(40 + idx)).toISOString(),
      },
      NOW,
    ),
  );
}

// ---------------------------------------------------------------------------
// ac-5 — B3/C2
// ---------------------------------------------------------------------------

describe('one eligibility policy, shared by every automatic pool', () => {
  it('recommendations exclude resting items and question only urgency', () => {
    const resting = mk({ id: 'resting', title: 'resting piece', status: 'dormant', importance: 5, difficulty: 5 });
    const active = mk({ id: 'active', title: 'active piece', status: 'usable', importance: 2, difficulty: 2 });

    // 1. DORMANT vs ACTIVE across recommend, plan and swap — including when
    //    resting material would otherwise outscore everything.
    const recs = recommend([resting, active], [], NOW);
    for (const card of [recs.best, recs.quickWin, recs.maintenance]) {
      expect(card?.score.item.id).not.toBe('resting');
    }
    expect(recs.best?.score.item.id).toBe('active');

    const plan = buildSessionPlan({
      instrumentId: INST,
      budgetMinutes: 30,
      now: NOW,
      items: [resting, active],
      blocks: [],
      reviews: [],
    });
    expect(plan.segments.map((s) => s.itemId)).not.toContain('resting');

    const swapped = swapSegment(plan, 0, {
      instrumentId: INST,
      now: NOW,
      items: [resting, active],
      blocks: [],
      reviews: [],
    });
    expect(swapped.segments.map((s) => s.itemId)).not.toContain('resting');

    // 2. A resting-only pool is HONESTLY EMPTY — never resurrected by a
    //    fallback that quietly widens to "everything left".
    const onlyResting = recommend([resting], [], NOW);
    expect(onlyResting.best).toBeNull();
    expect(onlyResting.quickWin).toBeNull();
    expect(onlyResting.maintenance).toBeNull();
    const emptyPlan = buildSessionPlan({
      instrumentId: INST,
      budgetMinutes: 30,
      now: NOW,
      items: [resting],
      blocks: [],
      reviews: [],
    });
    expect(emptyPlan.segments).toEqual([]);
    expect(emptyPlan.summary).toContain('resting');

    // 3. Direct, deliberate practice of a resting item stays possible: its
    //    data is intact and a simple status change brings it straight back.
    expect(resting.nextReviewDate).toBe(undefined);
    const reactivated = { ...resting, status: 'usable' as const };
    expect(recommend([reactivated, active], [], NOW).best?.score.item.id).toBe('resting');

    // 4. A QUESTION alone changes no practice priority. A PREPARATION naming
    //    a real future class does — from its OWN class's date.
    const lessonSoon: Lesson = { ...createLesson({ instrumentId: INST, date: day(1) }, NOW), id: 'lesson-soon' };
    const lessonLater: Lesson = { ...createLesson({ instrumentId: INST, date: day(25) }, NOW), id: 'lesson-later' };
    const lessonPast: Lesson = { ...createLesson({ instrumentId: INST, date: day(-3) }, NOW), id: 'lesson-past' };
    const otherInstrumentLesson: Lesson = {
      ...createLesson({ instrumentId: 'other', date: day(1) }, NOW),
      id: 'lesson-other',
    };
    const lessons = [lessonSoon, lessonLater, lessonPast, otherInstrumentLesson];

    const questionOnly = mk({ id: 'q-only', title: 'has a question' });
    const preparedSoon = mk({ id: 'prep-soon', title: 'for the class on Friday' });
    const preparedLater = mk({ id: 'prep-later', title: 'for a class next month' });
    const preparedPast = mk({ id: 'prep-past', title: 'was for a class that has gone' });
    const unassigned = mk({ id: 'prep-none', title: 'class work, no class named' });
    const wrongInstrument = mk({ id: 'prep-other', title: "another instrument's class" });

    const agenda = [
      createQuestion({ id: 'q1', text: 'ask about the foroud', instrumentId: INST, itemId: 'q-only', lessonId: 'lesson-soon', now: NOW }),
      createPreparation({ id: 'p1', itemId: 'prep-soon', instrumentId: INST, lessonId: 'lesson-soon', now: NOW }),
      createPreparation({ id: 'p2', itemId: 'prep-later', instrumentId: INST, lessonId: 'lesson-later', now: NOW }),
      createPreparation({ id: 'p3', itemId: 'prep-past', instrumentId: INST, lessonId: 'lesson-past', now: NOW }),
      createPreparation({ id: 'p4', itemId: 'prep-none', instrumentId: INST, now: NOW }),
      createPreparation({ id: 'p5', itemId: 'prep-other', instrumentId: INST, lessonId: 'lesson-other', now: NOW }),
    ];
    const dates = preparationDatesByItem(agenda, lessons, NOW);

    expect(dates.get('q-only')).toBeUndefined();
    expect(dates.get('prep-soon')).toBe(day(1));
    expect(dates.get('prep-later')).toBe(day(25));
    expect(dates.get('prep-past')).toBeUndefined();
    expect(dates.get('prep-none')).toBeUndefined();
    expect(dates.get('prep-other')).toBeUndefined(); // target on another instrument

    const base = scoreItem(questionOnly, [], NOW, dates.get('q-only')).total;
    expect(scoreItem(preparedPast, [], NOW, dates.get('prep-past')).total).toBe(base);
    expect(scoreItem(unassigned, [], NOW, dates.get('prep-none')).total).toBe(base);
    expect(scoreItem(wrongInstrument, [], NOW, dates.get('prep-other')).total).toBe(base);
    expect(scoreItem(preparedLater, [], NOW, dates.get('prep-later')).total).toBeGreaterThan(base);
    expect(scoreItem(preparedSoon, [], NOW, dates.get('prep-soon')).total).toBeGreaterThan(
      scoreItem(preparedLater, [], NOW, dates.get('prep-later')).total,
    );

    const withAgenda = recommend(
      [questionOnly, preparedSoon, preparedLater, preparedPast, unassigned, wrongInstrument],
      [],
      NOW,
      dates,
    );
    expect(withAgenda.best?.score.item.id).toBe('prep-soon');
    expect(withAgenda.best?.reason).toContain(day(1));
    // No reason anywhere claims a question is a reason to practise.
    for (const card of [withAgenda.best, withAgenda.quickWin, withAgenda.maintenance]) {
      expect(card?.reason ?? '').not.toContain('question');
    }
  });
});

describe('recommend', () => {
  it('selects distinct, explained cards and never repeats an item', () => {
    const db = createSeedDB(NOW);
    const dates = preparationDatesByItem(db.lessonAgenda, db.lessons, NOW);
    const recs = recommend(db.items, db.blocks, NOW, dates);
    const ids = [recs.best, recs.quickWin, recs.maintenance].filter(Boolean).map((r) => r!.score.item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const card of [recs.best, recs.quickWin, recs.maintenance]) {
      if (card) expect(card.reason.length).toBeGreaterThan(0);
    }
  });

  it('scopes to one instrument', () => {
    const db = createSeedDB(NOW);
    const setar = db.instruments.find((i) => i.name === 'Setar')!;
    const recs = recommendForInstrument(setar.id, db.items, db.blocks, NOW);
    for (const card of [recs.best, recs.quickWin, recs.maintenance]) {
      if (card) expect(card.score.item.instrumentId).toBe(setar.id);
    }
  });

  it('names the decisive numbers in the reason', () => {
    const overdue = mk({ id: 'od', title: 'overdue', nextReviewDate: day(-4), importance: 5 });
    const reason = buildReason(scoreItem(overdue, [], NOW), 'best');
    expect(reason).toContain('4 days overdue');
    expect(reason).toContain('important');
  });
});

describe('parts and stall hints', () => {
  it('picks one part deterministically and skips resting parts', () => {
    const parent = mk({ id: 'parent', title: 'étude' });
    const partA = mk({ id: 'part-a', title: 'bars 1–8', parentItemId: 'parent', status: 'fragile', importance: 5 });
    const partB = mk({ id: 'part-b', title: 'bars 9–16', parentItemId: 'parent', status: 'dormant', importance: 5, difficulty: 5 });
    const pick = pickNextPart('parent', [parent, partA, partB], [], NOW);
    expect(pick?.score.item.id).toBe('part-a');
  });

  it('offers a calm strategy hint after three same results — and nothing else', () => {
    const item = mk({ id: 'stalled', title: 'stalled', itemType: 'full_piece' });
    const blocks = sameBlocks(item);
    expect(stallHint(item, blocks)).toContain('smaller unit');
    expect(stallHint(item, [])).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Regression coverage carried forward from before this lane.
//
// An EMPTY library is a different branch from a resting-only one: ac-5 proves
// a pool that exists but is all resting stays honestly empty, and says nothing
// about there being no items at all, or about an instrument that simply has
// none of its own. Both are live branches; both were covered before.
// ---------------------------------------------------------------------------

describe('nothing to recommend is a real answer', () => {
  it('an empty library yields empty cards, and a bare instrument never borrows another’s', () => {
    const empty = recommend([], [], NOW);
    expect(empty.best).toBeNull();
    expect(empty.quickWin).toBeNull();
    expect(empty.maintenance).toBeNull();

    // An instrument with no items of its own returns nothing — it must never
    // reach across to the instrument that does have work.
    const theirs = mk({ id: 'theirs', title: 'Guitar study', instrumentId: 'guitar', importance: 5 });
    const bare = recommendForInstrument(INST, [theirs], [], NOW);
    expect(bare.best).toBeNull();
    expect(bare.quickWin).toBeNull();
    expect(bare.maintenance).toBeNull();

    // …while the instrument that owns it still gets it.
    expect(recommendForInstrument('guitar', [theirs], [], NOW).best?.score.item.id).toBe('theirs');

    // A piece with no parts has no part to practise next.
    expect(pickNextPart('theirs', [theirs], [], NOW)).toBeNull();
  });
});
