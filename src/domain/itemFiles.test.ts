import { describe, expect, it } from 'vitest';
import { itemFiles } from './itemFiles';
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
    ...partial,
  };
}

describe('itemFiles', () => {
  it('lists a linked lesson’s references with the item’s attachments, deduplicating references by path', () => {
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
