import { describe, expect, it } from 'vitest';
import V13_SETAR_TEXT from './fixtures/setar-legacy-v13.json?raw';
import { goTo, importBackup, openPracticeApp, persistedUntil, reload, type PracticeApp } from './practiceBrowser';

// ---------------------------------------------------------------------------
// ac-17 — a class's notes can be cleared, and are never written to the wrong
// class.
//
// The defect was NOT in an editor. `updateLesson` read `patch.notes ?? l.notes`,
// which cannot tell an OMITTED field from a deliberately empty one, so deleting
// a class's notes wrote the previous notes straight back — the app silently
// refusing to delete what the owner had just deleted. This drives the real
// editor against the real store and checks the bytes that actually persisted.
// ---------------------------------------------------------------------------

const NOW = new Date('2026-09-17T09:00:00.000Z');

/** The persisted notes of one lesson, straight out of IndexedDB. */
async function persistedNotes(app: PracticeApp, lessonId: string): Promise<string | undefined> {
  const { state } = await (await import('./practiceBrowser')).readPersistedState(app);
  const db = (state as { db: { lessons: { id: string; notes?: string }[] } }).db;
  return db.lessons.find((l) => l.id === lessonId)?.notes;
}

/**
 * The ONE class card for a label, open. Several cards can be open at once (a
 * class with no notes opens itself), so every control is reached THROUGH the
 * card rather than by page-wide role — otherwise a click could land on another
 * class's editor, which is the very confusion this test exists to rule out.
 */
async function openLesson(app: PracticeApp, label: string) {
  await goTo(app, '/lessons');
  const card = app.page.getByRole('article').filter({ hasText: label });
  await card.first().waitFor({ timeout: 20_000 });
  if (!(await card.getByRole('button', { name: /Class notes/ }).first().isVisible())) {
    await card.getByRole('button', { name: new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).first().click();
  }
  await card.getByRole('button', { name: /Class notes/ }).first().waitFor({ timeout: 20_000 });
  return card;
}

describe('class notes', () => {
  it('lesson notes can be cleared and saved durably without cross-lesson drafts', async () => {
    const app = await openPracticeApp({ now: NOW, viewport: { width: 390, height: 844 } });
    try {
      await importBackup(app, 'setar-legacy-v13.json', V13_SETAR_TEXT);

      // --- the bug, reproduced through the REAL editor --------------------
      let card = await openLesson(app, 'Class 38 · 2026-09-27');
      expect(await persistedNotes(app, 'L-38-upcoming')).toBe('Ask about the right-hand angle.');

      await card.getByRole('button', { name: 'Edit Class notes' }).click();
      const box = card.getByRole('textbox', { name: 'Class notes' });
      await box.fill('');
      // SAVING IS EXPLICIT. Blur alone must not commit anything.
      await box.blur();
      expect(await persistedNotes(app, 'L-38-upcoming')).toBe('Ask about the right-hand angle.');

      await card.getByRole('button', { name: 'Done editing Class notes' }).click();
      // "Saved." waits for IndexedDB, so this is a real acknowledgement.
      await card.getByText('Saved.').waitFor({ timeout: 20_000 });
      await persistedUntil(
        app,
        (s) =>
          ((s.state as { db: { lessons: { id: string; notes?: string }[] } }).db.lessons.find(
            (l) => l.id === 'L-38-upcoming',
          )?.notes ?? null),
        (v) => v === undefined || v === null,
      );

      // ...and it is STILL cleared after a reload — the fix is in the stored
      // bytes, not in a React state that happens to look right.
      await reload(app);
      expect(await persistedNotes(app, 'L-38-upcoming')).toBeUndefined();
      card = await openLesson(app, 'Class 38 · 2026-09-27');
      expect(await card.getByText('No notes yet.').first().isVisible()).toBe(true);

      // --- writing real notes, and a DRAFT that is never committed ---------
      await card.getByRole('button', { name: 'Edit Class notes' }).click();
      await card.getByRole('textbox', { name: 'Class notes' }).fill('دست راست را سبک‌تر بگیر.');
      await card.getByRole('button', { name: 'Done editing Class notes' }).click();
      await card.getByText('Saved.').waitFor({ timeout: 20_000 });
      expect(await persistedNotes(app, 'L-38-upcoming')).toBe('دست راست را سبک‌تر بگیر.');

      // An UNSAVED draft is exactly that: reloading keeps the SAVED text and
      // silently commits nothing.
      await card.getByRole('button', { name: 'Edit Class notes' }).click();
      await card.getByRole('textbox', { name: 'Class notes' }).fill('half a thought I never finished');
      await reload(app);
      expect(await persistedNotes(app, 'L-38-upcoming')).toBe('دست راست را سبک‌تر بگیر.');

      // --- THE DRAFT IS TAGGED WITH ITS OWN CLASS --------------------------
      // Typing into one class and then opening another must not carry the text
      // across, and must not write it onto the second class.
      card = await openLesson(app, 'Class 38 · 2026-09-27');
      await card.getByRole('button', { name: 'Edit Class notes' }).click();
      await card.getByRole('textbox', { name: 'Class notes' }).fill('typed for class 38 only');
      card = await openLesson(app, 'Class 1 · 2023-09-26');
      // The first class shows ITS OWN notes, not the draft.
      expect(await card.getByText('Started the first chahārmezrāb.').first().isVisible()).toBe(true);
      await card.getByRole('button', { name: 'Edit Class notes' }).click();
      expect(await card.getByRole('textbox', { name: 'Class notes' }).inputValue()).toBe(
        'Started the first chahārmezrāb.',
      );
      await card.getByRole('button', { name: 'Done editing Class notes' }).click();
      // Neither class was written with the other's words.
      expect(await persistedNotes(app, 'L-1')).toBe('Started the first chahārmezrāb.');
      expect(await persistedNotes(app, 'L-38-upcoming')).toBe('دست راست را سبک‌تر بگیر.');

      // --- LEAVING THE SCREEN entirely still saves what was typed ----------
      card = await openLesson(app, 'Class 1 · 2023-09-26');
      await card.getByRole('button', { name: 'Edit Class notes' }).click();
      await card.getByRole('textbox', { name: 'Class notes' }).fill('rewatched it — the return is the problem');
      await card.getByRole('button', { name: 'Done editing Class notes' }).click();
      await goTo(app, '/today');
      await persistedUntil(
        app,
        (s) =>
          (s.state as { db: { lessons: { id: string; notes?: string }[] } }).db.lessons.find((l) => l.id === 'L-1')
            ?.notes ?? '',
        (v) => v === 'rewatched it — the return is the problem',
      );

      // --- NOTHING ELSE MOVED ----------------------------------------------
      const { state } = await (await import('./practiceBrowser')).readPersistedState(app);
      const db = (state as {
        db: {
          items: { id: string; notes?: string; totalMinutes: number; nextReviewDate?: string; srReps?: number }[];
          blocks: { observation?: string; nextAction?: string; durationMinutes: number }[];
          reviews: unknown[];
          lessonAgenda: unknown[];
        };
      }).db;
      const dashti = db.items.find((i) => i.id === 'own-dashti')!;
      expect(dashti.notes).toBe('Teacher: keep the mezrab light on the return.');
      expect(dashti.totalMinutes).toBe(145);
      expect(dashti.nextReviewDate).toBe('2026-09-24');
      expect(dashti.srReps).toBe(3);
      expect(db.blocks).toHaveLength(1);
      expect(db.blocks[0]!.observation).toBe('The return is still heavy.');
      expect(db.blocks[0]!.nextAction).toBe('Half tempo, four bars at a time.');
      expect(db.blocks[0]!.durationMinutes).toBe(30);
      expect(db.reviews).toHaveLength(1);
      expect(db.lessonAgenda).toHaveLength(1);
      expect(app.pageErrors).toEqual([]);
    } finally {
      await app.close();
    }
  });
});
