import { describe, expect, it } from 'vitest';
import {
  backfillCourseSourceKeys,
  defaultSourceInstrument,
  findCourseSource,
  NEW_SOURCE_KINDS,
  sourceKindOptions,
  withCourseSourceKey,
} from './studySources';
import {
  courseSourceQuestions,
  courseStageId,
  COURSES,
  planCatalogAddition,
  planChooseCourseSource,
  resolveCourseSource,
} from './courseSeed';
import { catalogForStage } from './pathwaySeed';
import { CGS_COURSE } from './courseData';
import { KHONYAGAR_COURSE } from './khonyagarData';
import { serializeExport, validateDB } from './io';
import { MATERIAL_SOURCE_LABELS } from './labels';
import type { Material } from './types';
import LEGACY_TEXT from '../../tests/fixtures/repertoire-legacy-v14.json?raw';
import CURRENT_TEXT from '../../tests/fixtures/repertoire-current-v15.json?raw';

const NOW = new Date('2026-09-28T10:00:00.000Z');

describe('study sources', () => {
  it('study sources clarify new choices without rewriting legacy meaning', () => {
    // 1. NEW SOURCES are offered five clear kinds, each with an example; the
    //    old "Repertoire" kind reads as what it is — a Collection.
    const fresh = sourceKindOptions();
    expect(fresh.map((o) => o.value)).toEqual(['radif', 'method_book', 'repertoire', 'course', 'other']);
    expect(fresh.find((o) => o.value === 'repertoire')!.label).toBe('Collection');
    expect(NEW_SOURCE_KINDS.every((k) => k.example.length > 10)).toBe(true);
    for (const legacy of ['piece', 'song', 'lesson', 'etude', 'technique', 'exercise', 'improvisation'] as const) {
      expect(fresh.some((o) => o.value === legacy), legacy).toBe(false);
      // …but a source that already carries one keeps it, labelled, selectable.
      const own = sourceKindOptions(legacy);
      expect(own.at(-1)).toEqual({ value: legacy, label: `${MATERIAL_SOURCE_LABELS[legacy]} (older kind)` });
    }

    // 2. LEGACY KINDS AND FIELDS THE COMPACT EDITOR DOES NOT SHOW survive an
    //    edit (the editor patches only what is on screen) and an export.
    const db = validateDB(JSON.parse(LEGACY_TEXT));
    const radif = db.materials.find((m) => m.id === 'mat-radif')!;
    const song = db.materials.find((m) => m.id === 'mat-song')!;
    const edited: Material[] = db.materials.map((m) =>
      m.id === radif.id ? { ...m, ...{ title: 'ردیف میرزا عبدالله (برومند)', sourceType: 'radif', status: 'active', notes: undefined } } : m,
    );
    const roundTrip = validateDB(JSON.parse(serializeExport({ ...db, materials: edited }, NOW)));
    const back = roundTrip.materials.find((m) => m.id === radif.id)!;
    expect([back.sourceName, back.parentTitle, back.section, back.teacherOrSource]).toEqual([
      radif.sourceName,
      radif.parentTitle,
      radif.section,
      radif.teacherOrSource,
    ]);
    expect(roundTrip.materials.find((m) => m.id === song.id)).toEqual(song);
    expect(song.sourceType).toBe('song');

    // 3. A NEW SOURCE starts on the browsed or session instrument when it exists.
    expect(defaultSourceInstrument('inst-tar', db.instruments)).toBe('inst-tar');
    expect(defaultSourceInstrument('gone', db.instruments)).toBe('inst-setar');
    expect(defaultSourceInstrument(null, db.instruments)).toBe('inst-setar');

    // 4. A KNOWN COURSE SOURCE, renamed, is still the course's: its stable key
    //    is reused, no second copy is minted.
    const current = validateDB(JSON.parse(CURRENT_TEXT));
    const renamed = current.materials.find((m) => m.id === 'mat-cgs')!;
    expect(renamed.title).toBe('My CGS (renamed)');
    const reuse = resolveCourseSource(current.materials, CGS_COURSE, 'inst-guitar', NOW);
    expect([reuse.materialId, reuse.materials]).toEqual(['mat-cgs', current.materials]);
    const added = planCatalogAddition(current, courseStageId(CGS_COURSE, '2b'), 'chords', catalogForStage(courseStageId(CGS_COURSE, '2b')).find((e) => e.key === 'chords'), 'inst-guitar', NOW);
    expect(added.items.find((i) => i.id === added.itemId)!.materialId).toBe('mat-cgs');
    expect(added.materials).toBe(current.materials);

    // …the migration keyed ONLY the uniquely proven origin…
    expect(db.materials.find((m) => m.id === 'mat-cgs')!.sourceKey).toBe('course:cgs');
    expect(backfillCourseSourceKeys(db.materials, COURSES)).toBe(db.materials);

    // 5. …and TWO candidates are a question, never a first match: nothing is
    //    keyed, the new item is left without a source, and the choice is offered.
    expect(db.materials.filter((m) => m.id.startsWith('mat-khon')).map((m) => m.sourceKey)).toEqual([undefined, undefined]);
    const lookup = findCourseSource(db.materials, KHONYAGAR_COURSE, 'inst-tar');
    expect(lookup.status === 'ambiguous' && lookup.candidates.map((m) => m.id)).toEqual(['mat-khon-1', 'mat-khon-2']);
    const kStage = courseStageId(KHONYAGAR_COURSE, KHONYAGAR_COURSE.groups[0].key);
    const kEntry = catalogForStage(kStage)[0];
    const asked = planCatalogAddition(db, kStage, kEntry.key, kEntry, 'inst-tar', NOW);
    expect(asked.created).toBe(true);
    expect(asked.items.find((i) => i.id === asked.itemId)!.materialId).toBeUndefined();
    expect(asked.sourceCandidates!.map((m) => m.id)).toEqual(['mat-khon-1', 'mat-khon-2']);
    expect(asked.materials).toBe(db.materials);
    // 6. THE QUESTION IS SAVED DATA, NOT A SCREEN'S MEMORY. Whatever the tap
    //    (Play adds exactly as Add does), the new item is left waiting, and the
    //    question is derived from the database: it survives an export/reload,
    //    and a REPEAT Add of the now-bound suggestion asks it again while
    //    writing nothing.
    const afterFirst = { ...db, items: asked.items, materials: asked.materials };
    const reloaded = validateDB(JSON.parse(serializeExport(afterFirst, NOW)));
    const questionOf = (d: Pick<typeof db, 'items' | 'materials'>) => courseSourceQuestions(d, KHONYAGAR_COURSE);
    expect(questionOf(reloaded).map((q) => [q.instrumentId, q.candidates.map((m) => m.id), q.items.map((i) => i.id)])).toEqual([
      ['inst-tar', ['mat-khon-1', 'mat-khon-2'], [asked.itemId]],
    ]);
    const again = planCatalogAddition(reloaded, kStage, kEntry.key, kEntry, 'inst-tar', NOW);
    expect([again.created, again.itemId, again.items, again.materials]).toEqual([false, asked.itemId, reloaded.items, reloaded.materials]);
    expect(again.items).toBe(reloaded.items);
    expect(again.sourceCandidates!.map((m) => m.id)).toEqual(['mat-khon-1', 'mat-khon-2']);
    // Moved out of its stage, it is still asked: the course is read from the
    // references it answers, never from where it sits.
    const moved = reloaded.items.map((i) => (i.id === asked.itemId ? { ...i, stageId: undefined } : i));
    expect(questionOf({ ...reloaded, items: moved })[0].items.map((i) => i.id)).toEqual([asked.itemId]);
    // A second suggestion added while it is still open joins the SAME question.
    const kEntry2 = catalogForStage(kStage)[1];
    const second = planCatalogAddition(reloaded, kStage, kEntry2.key, kEntry2, 'inst-tar', NOW);
    const both = { ...reloaded, items: second.items, materials: second.materials };
    expect(questionOf(both)[0].items.map((i) => i.id)).toEqual([asked.itemId, second.itemId]);
    // 7. THE ANSWER goes to exactly the items the question named — both here —
    //    keys the chosen source, and ends the question. Choosing again (a
    //    retry) restates it and changes nothing further.
    const answered = planChooseCourseSource(both, KHONYAGAR_COURSE, 'mat-khon-2', [asked.itemId, second.itemId], NOW);
    if (!answered.ok) throw new Error(answered.reason);
    expect(answered.items.filter((i) => i.materialId === 'mat-khon-2').map((i) => i.id)).toEqual([asked.itemId, second.itemId]);
    expect(questionOf(answered)).toEqual([]);
    const retried = planChooseCourseSource(answered, KHONYAGAR_COURSE, 'mat-khon-2', [asked.itemId, second.itemId], NOW);
    expect(retried.ok && [retried.items, retried.materials]).toEqual([answered.items, answered.materials]);
    // …and ONLY to those: a course item it did not name keeps no source —
    // one without a source looks exactly like one the owner cleared.
    const onlyFirst = planChooseCourseSource(both, KHONYAGAR_COURSE, 'mat-khon-2', [asked.itemId], NOW);
    expect(onlyFirst.ok && onlyFirst.items.find((i) => i.id === second.itemId)!.materialId).toBeUndefined();
    // A source on another instrument is refused, never half-applied.
    expect(planChooseCourseSource(both, KHONYAGAR_COURSE, 'mat-cgs', [asked.itemId], NOW)).toMatchObject({ ok: false });

    // The owner's answer keys exactly the one chosen.
    const chosen = withCourseSourceKey(db.materials, 'mat-khon-2', KHONYAGAR_COURSE);
    expect(chosen.filter((m) => m.sourceKey).map((m) => [m.id, m.sourceKey])).toEqual([
      ['mat-cgs', 'course:cgs'],
      ['mat-khon-2', 'course:khonyagar'],
    ]);
    expect(findCourseSource(chosen, KHONYAGAR_COURSE, 'inst-tar')).toMatchObject({ status: 'keyed', material: { id: 'mat-khon-2' } });
    // Sources are never shared across instruments.
    expect(findCourseSource(chosen, KHONYAGAR_COURSE, 'inst-setar').status).toBe('none');
  });
});
