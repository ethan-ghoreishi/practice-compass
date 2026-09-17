import { describe, expect, it } from 'vitest';
import SETAR_INDEX_TEXT from '../../tests/fixtures/setar-archive.json?raw';
import { lessonFiles, type ItemFileReference } from './itemFiles';
import { decodeSourceIndex } from './sourceArchive';
import { applyArchiveImport, planArchiveImport } from './sourceReconcile';
import { emptyDB } from './seed';
import { createLesson } from './factories';
import { resolveRecordingUrl } from './recordings';
import { attachmentsOwnedBy, itemFiles, itemOwnedAttachments } from './itemFiles';
import type { AttachmentMeta, Lesson, LessonRecording, PracticeDB } from './types';

function recording(partial: Partial<LessonRecording> & { id: string; path: string }): LessonRecording {
  return {
    title: partial.path,
    kind: 'video',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

function lesson(partial: Partial<Lesson> & { id: string; date: string }): Lesson {
  return {
    instrumentId: 'setar',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

function attachment(partial: Partial<AttachmentMeta> & { id: string; ownerId: string }): AttachmentMeta {
  return {
    ownerType: 'item',
    name: partial.id,
    mime: 'application/pdf',
    size: 1024,
    kind: 'pdf',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

function db(partial: Partial<PracticeDB>): PracticeDB {
  return {
    schemaVersion: 11,
    instruments: [],
    materials: [],
    items: [],
    blocks: [],
    reviews: [],
    pathways: [],
    pathwayStages: [],
    pathwayRoutines: [],
    attachments: [],
    lessons: [],
    // Schema v12's lesson agenda. This file's own subject (composing an
    // item's material) is untouched by it; the field is listed because
    // PracticeDB now requires it.
    lessonAgenda: [],
    archiveSources: [],
    ...partial,
  };
}

describe('itemFiles', () => {
  it("lists a linked lesson's references with the item's attachments, deduplicating references by path", () => {
    const shared = 'setar-classes/session-37/score.pdf';
    const state = db({
      lessons: [
        lesson({
          id: 'l-37',
          date: '2026-07-09',
          itemIds: ['it'],
          recordings: [
            recording({ id: 'r-score', path: shared, kind: 'pdf', title: 'Score' }),
            recording({ id: 'r-video', path: 'setar-classes/session-37/class.mp4', title: 'Class 37' }),
          ],
        }),
        // An EARLIER lesson the item is also linked to, referencing the same
        // score by a leading-slash spelling of the same path.
        lesson({
          id: 'l-36',
          date: '2026-06-09',
          itemIds: ['it'],
          recordings: [recording({ id: 'r-score-again', path: `/${shared}`, kind: 'pdf', title: 'Score again' })],
        }),
      ],
      attachments: [attachment({ id: 'a-photo', ownerId: 'it', name: 'page.jpg', kind: 'image', mime: 'image/jpeg' })],
    });

    const files = itemFiles(state, 'it');

    // Newest lesson first, video before score within it, then attachments.
    expect(files.map((f) => f.id)).toEqual(['r-video', 'r-score', 'a-photo']);
    expect(files.filter((f) => f.source === 'reference' && f.path.endsWith('score.pdf'))).toHaveLength(1);
  });

  it("keeps a lesson-owned attachment out of an item's own attachments even when the item and a lesson it is linked to share an id", () => {
    // Reviewer counterexample, reproduced exactly: a database containing an
    // item AND a lesson with the same id, with an attachment whose ownerType
    // is 'lesson' and ownerId is that shared id. ownerId alone is not a valid
    // ownership test — it is only correct together with ownerType.
    const sharedId = 'shared-id';
    const attachments = [
      attachment({ id: 'a-item-own', ownerId: sharedId, ownerType: 'item', name: 'item-file.pdf' }),
      attachment({ id: 'a-lesson-own', ownerId: sharedId, ownerType: 'lesson', name: 'lesson-file.pdf' }),
    ];

    expect(itemOwnedAttachments(attachments, sharedId).map((a) => a.id)).toEqual(['a-item-own']);

    // The item is genuinely linked to the colliding-id lesson, so its
    // recording legitimately appears — only the lesson's ATTACHMENT must not.
    const state = db({
      lessons: [
        lesson({
          id: sharedId,
          date: '2026-07-09',
          itemIds: [sharedId],
          recordings: [recording({ id: 'r-class', path: 'a/class.mp4' })],
        }),
      ],
      attachments,
    });
    expect(itemFiles(state, sharedId).map((f) => f.id)).toEqual(['r-class', 'a-item-own']);
  });

  it("mirrors the collision the other way: a lesson's own attachments never include an item's, on the same shared id", () => {
    // The surface this guards is the lesson Files section (Attachments.tsx,
    // rendered with ownerType="lesson") and ItemCard's file-count badge
    // (ownerType="item") — both must resolve through attachmentsOwnedBy
    // rather than filtering ownerId alone, or a collision leaks across owners
    // in both directions: the lesson's list would show/allow deleting the
    // item's attachment, and the item's count would include the lesson's.
    const sharedId = 'shared-id';
    const attachments = [
      attachment({ id: 'a-item-own', ownerId: sharedId, ownerType: 'item', name: 'item-file.pdf' }),
      attachment({ id: 'a-lesson-own', ownerId: sharedId, ownerType: 'lesson', name: 'lesson-file.pdf' }),
    ];

    expect(attachmentsOwnedBy(attachments, 'lesson', sharedId).map((a) => a.id)).toEqual(['a-lesson-own']);
    expect(attachmentsOwnedBy(attachments, 'item', sharedId).map((a) => a.id)).toEqual(['a-item-own']);
  });

  it('excludes references from lessons the item is not linked to and returns nothing when it has none', () => {
    const state = db({
      lessons: [
        lesson({
          id: 'l-other',
          date: '2026-07-09',
          itemIds: ['someone-else'],
          recordings: [recording({ id: 'r-other', path: 'setar-classes/other/class.mp4' })],
        }),
      ],
      attachments: [attachment({ id: 'a-other', ownerId: 'someone-else' })],
    });

    expect(itemFiles(state, 'it')).toEqual([]);
    expect(itemFiles(state, 'someone-else').map((f) => f.id)).toEqual(['r-other', 'a-other']);
  });

  it('tags every entry with how it opens so a reference is never treated as an attachment', () => {
    const state = db({
      lessons: [
        lesson({
          id: 'l-37',
          date: '2026-07-09',
          itemIds: ['it'],
          recordings: [recording({ id: 'r-video', path: 'setar-classes/session-37/class.mp4' })],
        }),
      ],
      attachments: [attachment({ id: 'a-pdf', ownerId: 'it', name: 'handout.pdf' })],
    });

    const [ref, att] = itemFiles(state, 'it');
    expect(ref.source).toBe('reference');
    // A reference carries the path the NAS base URL resolves; an attachment
    // carries none, because it opens as a blob and would 404 through the base.
    expect(ref.source === 'reference' && ref.path).toBe('setar-classes/session-37/class.mp4');
    expect(att.source).toBe('attachment');
    expect('path' in att).toBe(false);
  });

  it('treats a local image as inline-renderable and every PDF, audio file and NAS reference as open-only', () => {
    const state = db({
      lessons: [
        lesson({
          id: 'l-37',
          date: '2026-07-09',
          itemIds: ['it'],
          recordings: [
            recording({ id: 'r-video', path: 'a/class.mp4', kind: 'video' }),
            // `inferKind` maps jpg/png/heic to 'doc', so no NAS reference can
            // ever be read as an image — and a remote origin could not render
            // under the static production CSP anyway.
            recording({ id: 'r-photo', path: 'a/page.jpg', kind: 'doc' }),
          ],
        }),
      ],
      attachments: [
        attachment({ id: 'a-image', ownerId: 'it', name: 'page.jpg', kind: 'image', mime: 'image/jpeg' }),
        attachment({ id: 'a-pdf', ownerId: 'it', name: 'score.pdf', kind: 'pdf' }),
        attachment({ id: 'a-audio', ownerId: 'it', name: 'clip.m4a', kind: 'audio', mime: 'audio/mp4' }),
      ],
    });

    const inline = Object.fromEntries(itemFiles(state, 'it').map((f) => [f.id, f.inline]));
    expect(inline).toEqual({
      'r-video': false,
      'r-photo': false,
      'a-image': true,
      'a-pdf': false,
      'a-audio': false,
    });
  });
});

// ---------------------------------------------------------------------------
// ac-13 — one composition, correctly scoped, for the item screen and Active.
// ---------------------------------------------------------------------------

describe('archive material for a piece', () => {
  const NOW = new Date('2026-09-17T09:00:00.000Z');
  const SETAR = 'inst-setar';
  const INDEX = decodeSourceIndex(JSON.parse(SETAR_INDEX_TEXT) as unknown);

  function imported(): PracticeDB {
    const base: PracticeDB = {
      ...emptyDB(),
      instruments: [
        {
          id: SETAR,
          name: 'Setar',
          family: 'Persian',
          active: true,
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
      ],
    };
    return applyArchiveImport(base, planArchiveImport({ db: base, index: INDEX, instrumentId: SETAR, now: NOW }));
  }

  const idFor = (db: PracticeDB, key: string) => db.items.find((i) => i.source?.pieceKey === key)!.id;

  it('practice material shows only useful correctly scoped archive resources', () => {
    const db = imported();

    // --- a piece with a correction AND a clean score -------------------------
    const mahur = itemFiles(db, idFor(db, 'پیش-درامد-ماهور-هرمزی')) as ItemFileReference[];
    // The teacher's corrected copy leads, and nothing else the piece has is
    // dropped to make room for it.
    expect(mahur[0]!.archive!.role).toBe('تصحیح');
    expect(mahur.filter((f) => f.path.includes('تصحیح-پیش-درامد-ماهور-هرمزی'))).toHaveLength(2);
    expect(mahur.some((f) => f.archive!.role === 'نمونه')).toBe(true);

    // No piece in the real corpus currently carries BOTH a correction and a
    // clean score of its own, so the retention rule is exercised against a
    // graph that does: the correction still leads, and the clean score is
    // RETAINED below it rather than replaced by it.
    const cleanScore = {
      path: 'session-18-21-01-2025/نت-پیش-درامد-ماهور-هرمزی.pdf',
      role: 'نت',
      kind: 'score' as const,
      title: 'نت پیش درامد ماهور هرمزی',
      part: null,
      pieces: ['پیش-درامد-ماهور-هرمزی'],
      group: null,
    };
    const withClean: PracticeDB = {
      ...db,
      archiveSources: db.archiveSources.map((src) => ({
        ...src,
        sessions: src.sessions.map((sess) =>
          sess.n === 18 ? { ...sess, resources: [...sess.resources, cleanScore] } : sess,
        ),
      })),
    };
    const bothKinds = itemFiles(withClean, idFor(db, 'پیش-درامد-ماهور-هرمزی')) as ItemFileReference[];
    const roles = bothKinds.map((f) => f.archive!.role);
    expect(roles[0]).toBe('تصحیح');
    expect(roles).toContain('نت');
    expect(roles.indexOf('تصحیح')).toBeLessThan(roles.indexOf('نت'));
    expect(bothKinds.some((f) => f.path === cleanScore.path)).toBe(true);

    // --- a class recording stays with the LESSON ----------------------------
    expect(mahur.every((f) => f.archive?.role !== 'ضبط-کلاس')).toBe(true);
    for (const item of db.items) {
      for (const f of itemFiles(db, item.id)) {
        if (f.source !== 'reference') continue;
        expect(f.path).not.toContain('ضبط-کلاس');
        // ...and the owner's own practice recordings are never material either.
        expect(f.path).not.toContain('تمرین-من');
      }
    }
    const lesson13 = db.lessons.find((l) => l.source?.sessionN === 13)!;
    const lessonSide = lessonFiles(db, lesson13.id) as ItemFileReference[];
    expect(lessonSide[0]!.path).toContain('ضبط-کلاس');
    expect(lessonSide.every((f) => f.lessonId === lesson13.id)).toBe(true);

    // --- EVERY FILE ON A LESSON HAS EXACTLY ONE SECTION THAT RENDERS IT -----
    // This composition used to include the owner's OWN references and the
    // lesson's attachments as well. The lesson page renders both in their own
    // editable sections, so each authored file appeared twice: once here, and
    // once again where it can actually be removed. An ITEM is the opposite
    // case and is unchanged — its material comes from records its own page has
    // no section for, which is why `itemFiles` stays the whole composition.
    const withOwnFiles: PracticeDB = {
      ...db,
      lessons: db.lessons.map((l) =>
        l.id === lesson13.id
          ? {
              ...l,
              recordings: [
                {
                  id: 'own-ref',
                  title: 'My own link',
                  path: 'session-13-03-09-2024/my-own-file.mp4',
                  kind: 'video' as const,
                  createdAt: '2026-01-01T00:00:00.000Z',
                },
              ],
            }
          : l,
      ),
      attachments: [
        {
          id: 'own-att',
          ownerType: 'lesson' as const,
          ownerId: lesson13.id,
          name: 'handout.pdf',
          mime: 'application/pdf',
          size: 2048,
          kind: 'pdf' as const,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    };
    const composed = lessonFiles(withOwnFiles, lesson13.id);
    expect(composed.every((f) => f.source === 'reference' && f.archive !== undefined)).toBe(true);
    expect(composed.some((f) => f.title === 'My own link')).toBe(false);
    expect(composed.some((f) => f.source === 'attachment')).toBe(false);
    // The archive's own material is untouched by the owner's additions.
    expect(composed.map((f) => f.id)).toEqual(lessonSide.map((f) => f.id));

    // --- an UNNAMED demonstration is one ordered logical group --------------
    const araqGusheh = itemFiles(db, idFor(db, 'کرشمه-در-عراق')) as ItemFileReference[];
    const demo = araqGusheh.filter((f) => f.archive?.role === 'نمونه' && f.archive.sessionN === 13);
    expect(demo.map((f) => f.archive!.part)).toEqual([1, 2]);
    expect(new Set(demo.map((f) => f.archive!.group)).size).toBe(1);
    // It belongs to every canonical member of session 13 — all eight — and the
    // eight are exactly the roster, not a guessed set.
    const members = INDEX.sessions.find((s) => s.n === 13)!.roster;
    expect(members).toHaveLength(8);
    for (const key of members) {
      const files = itemFiles(db, idFor(db, key)) as ItemFileReference[];
      expect(files.some((f) => f.path === 'session-13-03-09-2024/نمونه-1.mp4')).toBe(true);
    }

    // --- a NAMED score or demo NEVER bleeds onto a sibling piece ------------
    const zendan = itemFiles(db, idFor(db, 'به-زندان-شوشتری')) as ItemFileReference[];
    expect(zendan.some((f) => f.path === 'session-28-28-10-2025/نمونه-به-زندان-شوشتری.mp4')).toBe(true);
    const sibling = itemFiles(db, idFor(db, 'ضربی-شکسته-لطفی')) as ItemFileReference[];
    expect(sibling.some((f) => f.path.includes('به-زندان'))).toBe(false);
    // The session-13 notation names ONE piece and reaches only that one.
    const named = 'session-13-03-09-2024/نت-ضربی-عراق-ماهور-میرزا-حسینقلی.pdf';
    expect((itemFiles(db, idFor(db, 'ضربی-عراق-ماهور-میرزا-حسینقلی')) as ItemFileReference[]).some((f) => f.path === named)).toBe(true);
    expect(araqGusheh.some((f) => f.path === named)).toBe(false);

    // --- every session the piece appears in stays reachable -----------------
    const chain = itemFiles(db, idFor(db, 'چهارمضراب-ماهور-صبا')) as ItemFileReference[];
    const sessions = [...new Set(chain.map((f) => f.archive!.sessionN))].sort((a, b) => a - b);
    // Its own registry row names sessions 9-12 and 16; the material from the
    // EARLIER lessons of that run is still reachable, with its provenance.
    expect(sessions).toContain(16);
    expect(sessions.some((n) => n < 16)).toBe(true);
    expect(chain.every((f) => f.archive!.date.length === 10)).toBe(true);

    // --- a DIRECT item reference needs no lesson at all ----------------------
    const target = idFor(db, 'عراق');
    const direct: PracticeDB = {
      ...db,
      items: db.items.map((i) =>
        i.id === target
          ? {
              ...i,
              references: [
                {
                  id: 'own-1',
                  title: 'My own copy of the score',
                  path: 'session-12-06-08-2024/some-other-file.pdf',
                  kind: 'pdf' as const,
                  notes: 'Printed for the stand.',
                  createdAt: '2026-09-01T00:00:00.000Z',
                },
              ],
            }
          : i,
      ),
    };
    const withDirect = itemFiles(direct, target) as ItemFileReference[];
    const mine = withDirect.find((f) => f.id === 'own-1')!;
    expect(mine).toBeDefined();
    expect(mine.lessonId).toBeUndefined();
    expect(mine.archive).toBeUndefined();
    expect(mine.notes).toBe('Printed for the stand.');
    // It is a REFERENCE — the same resolver as every archive and legacy path,
    // and never an attachment blob.
    expect(mine.source).toBe('reference');
    expect(resolveRecordingUrl('https://192.168.0.20:5010/setar-classes', mine)).toContain(
      '/setar-classes/session-12-06-08-2024/',
    );
    expect(withDirect.every((f) => f.inline === false)).toBe(true);

    // --- a MANUAL, unclassified lesson stays reachable, unscoped ------------
    const manualLesson: Lesson = {
      ...createLesson({ instrumentId: SETAR, date: '2026-02-02' }, NOW),
      id: 'manual-lesson',
      itemIds: [target],
      recordings: [
        {
          id: 'manual-ref',
          title: 'Something a teacher sent',
          path: 'elsewhere/whatever.pdf',
          kind: 'pdf',
          createdAt: '2026-02-02T00:00:00.000Z',
        },
      ],
    };
    const withManual = itemFiles({ ...direct, lessons: [...direct.lessons, manualLesson] }, target) as ItemFileReference[];
    const manual = withManual.find((f) => f.id === 'manual-ref')!;
    expect(manual).toBeDefined();
    expect(manual.lessonId).toBe('manual-lesson');
    // Nothing invented a scope for it: it carries no archive provenance.
    expect(manual.archive).toBeUndefined();

    // --- an archive-bound lesson does not re-deliver its whole folder -------
    // Linking the item to its own archive lesson must not drag the class
    // recording back onto the piece through the lesson route.
    const linked: PracticeDB = {
      ...direct,
      lessons: direct.lessons.map((l) =>
        l.source?.sessionN === 12 ? { ...l, itemIds: [...(l.itemIds ?? []), target] } : l,
      ),
    };
    const afterLink = itemFiles(linked, target) as ItemFileReference[];
    expect(afterLink.some((f) => f.path.includes('ضبط-کلاس'))).toBe(false);
    expect(afterLink.map((f) => f.path)).toEqual(withDirect.map((f) => f.path));
  });
});
