import { describe, expect, it } from 'vitest';
import {
  createPreparation,
  createQuestion,
  defaultTargetLesson,
  detachItem,
  detachLesson,
  isOpenQuestion,
  isUnassigned,
  markQuestionAsked,
  preparationDatesByItem,
  preparationsForLesson,
  questionsForLesson,
  reopenQuestion,
  retargetEntriesForItemInstrument,
  retargetEntry,
  setQuestionAnswer,
  unassignedForInstrument,
  validateLessonAgenda,
} from './lessonAgenda';
import {
  openQuestionsForInstrument,
  openQuestionsForLessonId,
  questionsForLessonId,
  unassignedOpenQuestions,
} from './questions';
import { buildReportData } from './report';
import { recommend } from './recommend';
import { scoreItem } from './scoring';
import { createInstrument, createItem, createLesson } from './factories';
import { emptyDB } from './seed';
import { addDays, parseISODate, toISODate } from './util';
import type { ID, ISODate, Lesson, LessonAgendaEntry, PracticeItem, PracticeDB } from './types';

const NOW = new Date('2026-05-10T10:00:00.000Z');
const INST = 'setar';
const OTHER = 'guitar';
const day = (n: number): ISODate => toISODate(addDays(NOW, n));

function lesson(id: ID, date: ISODate, instrumentId = INST): Lesson {
  return { ...createLesson({ instrumentId, date }, NOW), id };
}

function item(id: ID, instrumentId = INST, title = id): PracticeItem {
  return { ...createItem({ instrumentId, title }, NOW), id };
}

// ---------------------------------------------------------------------------
// ac-12 — C1/C2
// ---------------------------------------------------------------------------

describe('preparation and questions are independent commitments', () => {
  it('lesson preparation and questions have independent specific targets', () => {
    const lessonA = lesson('A', day(3));
    const lessonB = lesson('B', day(17));
    const lessonOther = lesson('X', day(3), OTHER);
    const lessons = [lessonA, lessonB, lessonOther];

    const gushe = item('gushe', INST, 'گوشهٔ عراق');
    const items = [gushe, item('other-inst', OTHER, 'Guitar study')];

    // ONE item, a question for class A and a commitment to prepare for B.
    const agenda: LessonAgendaEntry[] = [
      createQuestion({ id: 'q-a', text: 'Is my foroud right?', instrumentId: INST, itemId: 'gushe', lessonId: 'A', now: NOW }),
      createPreparation({ id: 'p-b', itemId: 'gushe', instrumentId: INST, lessonId: 'B', now: NOW }),
    ];

    // Each class shows ITS OWN agenda — never the other's, and never the same
    // list on every future class as the instrument-wide filter used to.
    expect(questionsForLesson(agenda, 'A').map((q) => q.id)).toEqual(['q-a']);
    expect(questionsForLesson(agenda, 'B')).toEqual([]);
    expect(preparationsForLesson(agenda, 'B').map((p) => p.id)).toEqual(['p-b']);
    expect(preparationsForLesson(agenda, 'A')).toEqual([]);
    expect(openQuestionsForLessonId(agenda, items, 'A').map((q) => q.id)).toEqual(['q-a']);
    expect(openQuestionsForLessonId(agenda, items, 'B')).toEqual([]);

    // Several same-instrument future lessons stay distinct.
    expect(defaultTargetLesson(lessons, INST, NOW)?.id).toBe('A');
    expect(questionsForLessonId(agenda, items, 'A')).toHaveLength(1);
    expect(questionsForLessonId(agenda, items, 'B')).toHaveLength(0);

    // PRIORITY: the question contributes nothing; only the preparation does,
    // and from ITS OWN class's date (17 days out), not class A's 3 days.
    const dates = preparationDatesByItem(agenda, lessons, NOW);
    expect(dates.get('gushe')).toBe(day(17));
    const questionOnly = [agenda[0]];
    expect(preparationDatesByItem(questionOnly, lessons, NOW).size).toBe(0);
    expect(scoreItem(gushe, [], NOW, preparationDatesByItem(questionOnly, lessons, NOW).get('gushe')).parts.lesson).toBe(0);
    expect(scoreItem(gushe, [], NOW, dates.get('gushe')).parts.lesson).toBeGreaterThan(0);

    const recs = recommend([gushe], [], NOW, preparationDatesByItem(questionOnly, lessons, NOW));
    expect(recs.best?.reason ?? '').not.toContain('class');

    // Lesson.itemIds is untouched by any of this — "worked on in this class"
    // and "committed to prepare for this class" remain separate facts.
    expect(lessonA.itemIds).toEqual([]);
    expect(lessonB.itemIds).toEqual([]);

    // With NO future class on the instrument, capture is visibly UNASSIGNED
    // rather than pointed at a class that does not exist.
    const pastOnly = [lesson('P', day(-5))];
    expect(defaultTargetLesson(pastOnly, INST, NOW)).toBeUndefined();
    const captured = createQuestion({ id: 'q-free', text: 'Anything else?', instrumentId: INST, now: NOW });
    expect(isUnassigned(captured)).toBe(true);
    expect(unassignedForInstrument([captured], INST).map((e) => e.id)).toEqual(['q-free']);
    expect(unassignedOpenQuestions([captured], items, INST).map((q) => q.id)).toEqual(['q-free']);
    // …and it is NOT folded into any class's own agenda.
    expect(openQuestionsForLessonId([captured], items, 'A')).toEqual([]);

    // Cross-instrument targets are REFUSED, never silently rewritten.
    expect(retargetEntry(agenda, 'q-a', 'X', lessons, NOW)).toBe(agenda);
    const db: PracticeDB = {
      ...emptyDB(),
      instruments: [
        { ...createInstrument({ name: 'Setar' }, NOW), id: INST },
        { ...createInstrument({ name: 'Guitar' }, NOW), id: OTHER },
      ],
      items,
      lessons,
      lessonAgenda: agenda,
    };
    expect(validateLessonAgenda(db)).toBeNull();
    expect(
      validateLessonAgenda({ ...db, lessonAgenda: [{ ...agenda[0], lessonId: 'X' }] }),
    ).toMatch(/different instrument/);
    expect(
      validateLessonAgenda({ ...db, lessonAgenda: [{ ...agenda[1], itemId: 'other-inst' }] }),
    ).toMatch(/different instrument/);

    // The report keeps open questions labelled as CURRENT state, and the
    // chosen class's agenda separate from it.
    const report = buildReportData(db, { instrumentId: INST, from: day(-30), to: day(0), now: NOW, lessonId: 'A' });
    expect(report.openQuestions.map((q) => q.id)).toEqual(['q-a']);
    expect(report.lessonQuestions.map((q) => q.id)).toEqual(['q-a']);
    expect(report.lessonHistory).toEqual([]);
    const noLesson = buildReportData(db, { instrumentId: INST, from: day(-30), to: day(0), now: NOW });
    expect(noLesson.lessonQuestions).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// ac-13 — C3/C4
// ---------------------------------------------------------------------------

describe('asked questions are history, not a rolling to-do list', () => {
  it('asked questions remain historical without automatic carry forward', () => {
    const classNow = lesson('now', day(2));
    const classNext = lesson('next', day(16));
    const lessons = [classNow, classNext];
    const piece = item('piece', INST, 'Piece');
    const items = [piece];

    let agenda: LessonAgendaEntry[] = [
      createQuestion({ id: 'q1', text: 'First question', instrumentId: INST, itemId: 'piece', lessonId: 'now', now: NOW }),
      createQuestion({ id: 'q2', text: 'Second question', instrumentId: INST, itemId: 'piece', lessonId: 'now', now: NOW }),
      createPreparation({ id: 'p1', itemId: 'piece', instrumentId: INST, lessonId: 'now', now: NOW }),
    ];

    // Several questions on one item never overwrite each other.
    expect(openQuestionsForLessonId(agenda, items, 'now')).toHaveLength(2);

    // MARK ASKED, with and without an answer. Explicit and reversible.
    agenda = markQuestionAsked(agenda, 'q1', NOW, 'Yes — lighten the ornament.');
    agenda = markQuestionAsked(agenda, 'q2', NOW);
    const asked = agenda.filter((e) => e.kind === 'question');
    expect(asked.every((q) => !!(q as { askedAt?: string }).askedAt)).toBe(true);
    expect(questionsForLessonId(agenda, items, 'now').find((q) => q.id === 'q1')?.answer).toContain('lighten');
    expect(questionsForLessonId(agenda, items, 'now').find((q) => q.id === 'q2')?.answer).toBeUndefined();
    // They leave the OPEN lists…
    expect(openQuestionsForLessonId(agenda, items, 'now')).toEqual([]);
    expect(openQuestionsForInstrument(agenda, items, INST)).toEqual([]);
    // …and stay on the class they were asked at, never copied to the next one.
    expect(questionsForLessonId(agenda, items, 'now')).toHaveLength(2);
    expect(questionsForLessonId(agenda, items, 'next')).toEqual([]);

    // THE CLASS DATE PASSES: asked entries do not reappear, and preparation
    // urgency ends after the class's own local calendar day.
    // LOCAL calendar day, not UTC: a date-only class is still "today" at
    // 23:30 local on its own date, and gone the next morning.
    const dayOf = parseISODate(classNow.date);
    dayOf.setHours(23, 30, 0, 0);
    expect(preparationDatesByItem(agenda, lessons, dayOf).get('piece')).toBe(classNow.date);
    const dayAfter = addDays(parseISODate(classNow.date), 1);
    expect(preparationDatesByItem(agenda, lessons, dayAfter).get('piece')).toBeUndefined();
    expect(openQuestionsForLessonId(agenda, items, 'now')).toEqual([]);

    // An UNASKED question on a past class stays on that class.
    let withOpen = [
      ...agenda,
      createQuestion({ id: 'q3', text: 'Never got to ask this', instrumentId: INST, itemId: 'piece', lessonId: 'now', now: NOW }),
    ];
    expect(openQuestionsForLessonId(withOpen, items, 'now').map((q) => q.id)).toEqual(['q3']);
    expect(openQuestionsForLessonId(withOpen, items, 'next')).toEqual([]);
    // Only an EXPLICIT move changes its target.
    withOpen = retargetEntry(withOpen, 'q3', 'next', lessons, NOW);
    expect(openQuestionsForLessonId(withOpen, items, 'next').map((q) => q.id)).toEqual(['q3']);
    expect(openQuestionsForLessonId(withOpen, items, 'now')).toEqual([]);

    // REOPEN puts an asked question back, and an answer can be edited without
    // changing the asked state.
    const reopened = reopenQuestion(agenda, 'q1', NOW);
    expect(openQuestionsForLessonId(reopened, items, 'now').map((q) => q.id)).toEqual(['q1']);
    expect(isOpenQuestion(reopened.find((e) => e.id === 'q1')!)).toBe(true);
    const reanswered = setQuestionAnswer(agenda, 'q1', 'Actually: keep the ornament.', NOW);
    expect(questionsForLessonId(reanswered, items, 'now').find((q) => q.id === 'q1')?.answer).toContain('keep');
    expect((reanswered.find((e) => e.id === 'q1') as { askedAt?: string }).askedAt).toBeTruthy();
    expect(
      (setQuestionAnswer(agenda, 'q1', '   ', NOW).find((e) => e.id === 'q1') as { answer?: string }).answer,
    ).toBeUndefined();

    // RESCHEDULING the class keeps identity and moves the urgency with it.
    const moved = [{ ...classNow, date: day(40) }, classNext];
    expect(preparationDatesByItem(agenda, moved, NOW).get('piece')).toBe(day(40));

    // DELETING the class: entries survive, become visibly unassigned, and
    // REMEMBER which class they were for. Nothing is reassigned.
    const detached = detachLesson(agenda, 'now', NOW);
    expect(detached).toHaveLength(agenda.length);
    for (const e of detached) {
      expect(isUnassigned(e)).toBe(true);
      expect(e.detachedFromLessonId).toBe('now');
    }
    const detachedQ1 = detached.find((e) => e.id === 'q1') as { text: string; answer?: string; askedAt?: string };
    expect(detachedQ1.text).toBe('First question');
    expect(detachedQ1.answer).toContain('lighten');
    expect(detachedQ1.askedAt).toBeTruthy();
    expect(openQuestionsForLessonId(detached, items, 'next')).toEqual([]);
    expect(preparationDatesByItem(detached, lessons, NOW).size).toBe(0);

    // DELETING the item: its PREPARATION goes with it (a commitment to
    // prepare something that no longer exists means nothing); its QUESTIONS
    // survive, detached, because the question and the teacher's answer are
    // the owner's record of a class.
    const itemGone = detachItem(agenda, 'piece', NOW);
    expect(itemGone.filter((e) => e.kind === 'preparation')).toEqual([]);
    const survived = itemGone.filter((e) => e.kind === 'question');
    expect(survived).toHaveLength(2);
    for (const q of survived) {
      expect((q as { itemId?: string }).itemId).toBeUndefined();
      expect((q as { detachedFromItemId?: string }).detachedFromItemId).toBe('piece');
    }
    expect((survived[0] as { text: string }).text).toBe('First question');
    // A detached question still renders, with no title and no crash.
    expect(questionsForLessonId(itemGone, [], 'now').map((q) => q.title)).toEqual([undefined, undefined]);

    // MOVING the item to another instrument takes its entries with it and
    // clears a target that no longer matches.
    const retargeted = retargetEntriesForItemInstrument(agenda, 'piece', OTHER, lessons, NOW);
    for (const e of retargeted) {
      expect(e.instrumentId).toBe(OTHER);
      expect(e.lessonId).toBeUndefined();
      expect(e.detachedFromLessonId).toBe('now');
    }

    // NONE of these actions logs practice or completes a review: they are
    // pure array transforms over the agenda alone.
    const db: PracticeDB = {
      ...emptyDB(),
      instruments: [{ ...createInstrument({ name: 'Setar' }, NOW), id: INST }],
      items,
      lessons,
      lessonAgenda: agenda,
    };
    const before = JSON.stringify({ blocks: db.blocks, reviews: db.reviews, items: db.items });
    for (const next of [detached, itemGone, retargeted, reopened, reanswered]) {
      const after: PracticeDB = { ...db, lessonAgenda: next };
      expect(JSON.stringify({ blocks: after.blocks, reviews: after.reviews, items: after.items })).toBe(before);
    }
  });
});
