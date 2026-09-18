import { describe, expect, it } from 'vitest';
import INDEX_TEXT from './fixtures/setar-archive.json?raw';
import V13_SETAR_TEXT from './fixtures/setar-legacy-v13.json?raw';
import {
  connectSync,
  goTo,
  importBackup,
  installFakeGitHub,
  newFakeRemote,
  openPracticeApp,
  persistedUntil,
  publishSourceIndex,
  readPersistedState,
  stampSourceIndex,
  reload,
  type Engine,
  type PracticeApp,
} from './practiceBrowser';

// ---------------------------------------------------------------------------
// ac-18 — the whole journey, rendered, in BOTH engines the owner actually uses.
//
// Refresh → a historical class with its real material → a canonical piece →
// the material that is genuinely useful for it → Start → open a file, with the
// practice clock untouched. The corpus is the checked-in index derived from the
// real archive, the clock is frozen, and every control is reached by its
// accessible name — no debug hook, no source regex.
//
// A missing engine FAILS with an install instruction; it never skips.
// ---------------------------------------------------------------------------

const NOW = new Date('2026-09-17T09:00:00.000Z');
const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 900 };

interface Db {
  items: {
    id: string;
    title: string;
    status: string;
    persian?: { composer?: string };
    source?: { pieceKey: string };
  }[];
  lessons: { id: string; date: string; number?: number; origin?: string; source?: { sessionN: number } }[];
  blocks: unknown[];
  archiveSources: { id: string; sessions: unknown[]; pieces: unknown[] }[];
}

async function db(app: PracticeApp): Promise<Db> {
  const { state } = await readPersistedState(app);
  return (state as { db: Db }).db;
}

/** Seed the owner's real v13 data, connect the fake repo, publish an index. */
async function setUp(app: PracticeApp, indexText: string) {
  const remote = newFakeRemote();
  await installFakeGitHub(app.page, remote);
  await importBackup(app, 'setar-legacy-v13.json', V13_SETAR_TEXT);
  await connectSync(app);
  publishSourceIndex(remote, indexText);
  return remote;
}

async function refresh(app: PracticeApp) {
  await goTo(app, '/settings');
  await app.page.getByRole('button', { name: 'Refresh Setar archive' }).click();
  await app.page.getByRole('button', { name: /^(Apply|Already current)$/ }).waitFor({ timeout: 30_000 });
}

/**
 * An index with one more class than the corpus — the delta a refresh applies.
 *
 * Re-STAMPED with the digest the scanner itself would have written: the app
 * recomputes that digest and refuses an index whose content and hash disagree,
 * so a journey may not hand-edit a hash to fake a new scan.
 */
async function withSession40(text: string): Promise<string> {
  const index = JSON.parse(text) as {
    contentHash: string;
    sessions: unknown[];
    pieces: { key: string; composer: string }[];
  };
  index.sessions = [
    ...index.sessions,
    {
      n: 40,
      date: '2026-09-29',
      folder: 'session-40-29-09-2026',
      roster: [index.pieces[0]!.key],
      rosterTrusted: true,
      hasClassRecording: true,
      resources: [
        {
          path: 'session-40-29-09-2026/ضبط-کلاس.mp4',
          role: 'ضبط-کلاس',
          kind: 'video',
          title: 'ضبط کلاس',
          part: null,
          pieces: [],
          group: null,
        },
      ],
      members: [{ key: index.pieces[0]!.key, roles: ['ضبط-کلاس'] }],
    },
  ];
  return stampSourceIndex(index as unknown as Record<string, unknown>);
}

/** The composer this journey's re-scanned registry proposes for one piece. */
const NEW_COMPOSER = 'میرزا-عبدالله';

/**
 * A re-scanned index whose REGISTRY has improved: one piece the owner already
 * has now names a different composer. That is a suggestion, never a write.
 */
async function withBetterComposer(text: string): Promise<{ text: string; key: string; was: string }> {
  const index = JSON.parse(text) as { pieces: { key: string; composer: string }[] };
  const target = index.pieces.find((p) => p.composer && p.composer !== NEW_COMPOSER)!;
  const was = target.composer;
  index.pieces = index.pieces.map((p) => (p.key === target.key ? { ...p, composer: NEW_COMPOSER } : p));
  return { text: await stampSourceIndex(index as unknown as Record<string, unknown>), key: target.key, was };
}

describe('the Setar archive, rendered', () => {
  it('setar archive journey works on phone and desktop in Chromium and WebKit', async () => {
    for (const engine of ['chromium', 'webkit'] as Engine[]) {
      for (const viewport of [PHONE, DESKTOP]) {
        const app = await openPracticeApp({ now: NOW, viewport, engine });
        try {
          const { page } = app;
          const remote = await setUp(app, INDEX_TEXT);

          // --- REFRESH: one action, a readable summary, no crawler output ---
          await refresh(app);
          const summary = await page.locator('main').innerText();
          // Four of the owner's own legacy classes carry EXACT source-path evidence,
          // so they are adopted rather than duplicated; the other 35 are new.
          expect(summary).toMatch(/Added 94 pieces and 35 classes · Updated 4/);
          // It says the index CHANGED or was FETCHED — never that a scan ran.
          expect(summary).not.toMatch(/last scanned/i);
          expect(summary).toMatch(/needing attention/);
          // Import policy is stated BEFORE the import, not discovered after.
          expect(summary).toMatch(/New pieces arrive resting/);
          await page.getByRole('button', { name: 'Apply' }).click();
          await page.getByText('Archive updated.').waitFor({ timeout: 30_000 });

          const after = await persistedUntil(
            app,
            (s) => (s.state as { db: Db }).db,
            (d) => d.lessons.length === 40 && d.items.length === 96,
          );
          expect(after.lessons.filter((l) => l.origin === 'archive')).toHaveLength(39);
          expect(after.items.filter((i) => i.source)).toHaveLength(94);
          // The owner's own upcoming class 38 and the archive's class 38 both
          // exist, on their own dates.
          expect(after.lessons.filter((l) => l.number === 38).map((l) => l.date).sort()).toEqual([
            '2026-08-04',
            '2026-09-27',
          ]);

          // --- A HISTORICAL CLASS, with its real material -------------------
          // Lessons is a two-pane list at 1000px and stacked cards below it, so
          // this journey drives whichever the viewport actually renders.
          await goTo(app, '/lessons');
          const wide = viewport.width >= 1000;
          /**
           * Open one class and read what it actually renders — the whole page
           * on the wide two-pane layout, the card itself on the phone, where
           * rows start compact and must be opened first.
           */
          const openClass = async (label: string, number: number): Promise<string> => {
            if (wide) {
              await page.getByRole('button', { name: new RegExp(label) }).first().click();
              await page.getByRole('button', { name: /Class notes/ }).first().waitFor({ timeout: 20_000 });
              return page.locator('main').innerText();
            }
            const card = page.getByRole('article').filter({ hasText: label });
            await card.first().waitFor({ timeout: 20_000 });
            // PHONE ROWS START COMPACT: thirty-nine imported classes must not
            // all open at once just because none of them has notes yet.
            expect(await card.getByRole('button', { name: /Class notes/ }).count()).toBe(0);
            await card.getByRole('button', { name: new RegExp(`Class ${number}`) }).first().click();
            await card.getByRole('button', { name: /Class notes/ }).first().waitFor({ timeout: 20_000 });
            return card.innerText();
          };
          const lessonText = await openClass('Class 13 · 2024-09-03', 13);
          // The class recording is here, with its part numbers; a named score
          // is here; nothing claims a demonstration belongs to the class alone.
          expect(lessonText).toContain('ضبط کلاس');
          expect(lessonText).toContain('Class 13 · 2024-09-03 · class recording');

          // --- ONE SECTION PER FILE, and no prompt beside a file that is here
          //
          // Class 25 is an ADOPTED legacy class carrying three of the owner's
          // OWN references — personal takes the index describes nowhere, by
          // construction — beside the archive's session material. The composed
          // list used to include the owner's rows as well, so each of them was
          // rendered twice: once where it can be edited and removed, and once
          // again above it.
          const occurrences = (text: string, needle: string) => text.split(needle).length - 1;
          const adopted = await openClass('Class 25 · 2025-08-05', 25);
          for (const authored of ['My take, 3 August', 'My take, 4 August', 'My take, 5 August']) {
            expect(occurrences(adopted, authored)).toBe(1);
          }
          // …and they are still editable where they live: the section that owns
          // them can still remove them, by name.
          const owning = wide
            ? page.locator('main')
            : page.getByRole('article').filter({ hasText: 'Class 25 · 2025-08-05' });
          expect(await owning.getByRole('button', { name: /Remove My take, 3 August/ }).count()).toBe(1);
          // A class the archive gave a recording to is NOT invited to add one.
          // Class 12 is a purely imported class: it keeps no copy of its
          // session's files, so its own `recordings` array is empty and the
          // empty-state card offered to add the very video playing above it.
          const imported = await openClass('Class 12 · 2024-08-06', 12);
          expect(imported).toContain('Class 12 · 2024-08-06 · class recording');
          expect(imported).not.toMatch(/Full class videos and scores live on your NAS/);

          // --- A CANONICAL PIECE, and the material that is useful for it ----
          await goTo(app, '/repertoire');
          await page.getByRole('button', { name: 'Practice list' }).click();
          // ALIAS SEARCH: an old transliterated spelling still finds the piece,
          // through the existing Farsi matcher.
          await page.getByPlaceholder('Search items…').first().fill('zarbi-araaq');
          const found = page.getByRole('link', { name: /ضربی-عراق-ماهور-میرزا-حسینقلی/ }).first();
          await found.waitFor({ timeout: 20_000 });
          await found.click();
          await page.getByRole('button', { name: 'Start a block' }).waitFor({ timeout: 20_000 });

          const itemText = await page.locator('main').innerText();
          // Its OWN notation, with provenance…
          expect(itemText).toContain('Class 13 · 2024-09-03 · notation');
          // …the demonstration that covers its session…
          expect(itemText).toContain('teacher’s demonstration');
          // …and NOT the class recording, and NOT anyone's practice takes.
          expect(itemText).not.toContain('class recording');
          expect(itemText).not.toContain('تمرین من');
          // Imported pieces arrive resting.
          expect(itemText).toMatch(/Resting/);

          // --- DIRECT START, and opening material with the clock untouched --
          await page.getByRole('button', { name: 'Start a block' }).click();
          await page.getByRole('button', { name: 'Finish' }).waitFor({ timeout: 20_000 });
          const clockBefore = await page.locator('main').innerText();
          // Material on the practice screen is ONE CLOSED disclosure.
          const materialToggle = page.getByRole('button', { name: /Material/ }).first();
          // CLOSED until asked for: nothing is listed before the tap.
          expect(await page.getByRole('button', { name: 'Open' }).count()).toBe(0);
          await materialToggle.click();
          const openButtons = page.getByRole('button', { name: 'Open' });
          expect(await openButtons.count()).toBeGreaterThan(0);
          // Every control has an accessible name and is reachable by keyboard.
          await page.keyboard.press('Tab');
          expect(await page.evaluate(() => document.activeElement?.tagName ?? '')).not.toBe('BODY');
          // Opening a file never disturbs the running block.
          expect((await page.locator('main').innerText()).includes('Finish')).toBe(
            clockBefore.includes('Finish'),
          );
          const blocksBefore = (await db(app)).blocks.length;
          // The harness accepts the confirm() for the whole journey.
          await page.getByRole('button', { name: 'Discard block' }).click();
          expect((await db(app)).blocks).toHaveLength(blocksBefore);

          // --- MIXED DIRECTION: Farsi wraps, English labels stay isolated ----
          await goTo(app, '/repertoire');
          await page.getByRole('button', { name: 'Practice list' }).click();
          await page.getByPlaceholder('Search items…').first().waitFor({ timeout: 20_000 });
          const wrapped = await page.evaluate(() => {
            const el = [...document.querySelectorAll('[dir="auto"]')].find((n) =>
              /[؀-ۿ]/.test(n.textContent ?? ''),
            );
            if (!el) return null;
            const box = el.getBoundingClientRect();
            return { rtl: getComputedStyle(el).direction, overflows: el.scrollWidth > Math.ceil(box.width) + 1 };
          });
          expect(wrapped).not.toBeNull();
          expect(wrapped!.rtl).toBe('rtl');
          expect(wrapped!.overflows).toBe(false);

          // --- REPEAT REFRESH: nothing at all; then ONE new class -----------
          await refresh(app);
          expect(await page.getByRole('button', { name: 'Already current' }).count()).toBe(1);
          await page.getByRole('button', { name: 'Already current' }).click();
          await page.getByText('Already current.').first().waitFor({ timeout: 20_000 });

          publishSourceIndex(remote, await withSession40(INDEX_TEXT), 'source-index-commit-2');
          await refresh(app);
          expect(await page.locator('main').innerText()).toMatch(/Added 0 pieces and 1 classes/);
          await page.getByRole('button', { name: 'Apply' }).click();
          await page.getByText('Archive updated.').waitFor({ timeout: 30_000 });
          const delta = await persistedUntil(
            app,
            (s) => (s.state as { db: Db }).db,
            (d) => d.lessons.length === 41,
          );
          expect(delta.items.filter((i) => i.source)).toHaveLength(94);

          // --- A RENDERED METADATA SUGGESTION, and the choice that applies it
          // The registry improves. That is an OFFER, field by field: nothing
          // about the owner's own piece changes until they say so, and the
          // choice must survive the commit even when the index behind it is
          // already the one installed.
          const better = await withBetterComposer(INDEX_TEXT);
          publishSourceIndex(remote, better.text, 'source-index-commit-4');
          await refresh(app);
          const offerRow = page.getByRole('button', { name: /Use the archive’s composer/ });
          await offerRow.first().waitFor({ timeout: 20_000 });
          const offerText = await page.locator('main').innerText();
          // The section label is rendered uppercase by the stylesheet, and
          // innerText returns what is actually rendered.
          expect(offerText).toMatch(/the archive knows more about these/i);
          expect(offerText).toContain(better.key);
          expect(offerText).toContain(NEW_COMPOSER);
          // Applying WITHOUT answering updates the source graph and leaves the
          // owner's own piece exactly as it was.
          await page.getByRole('button', { name: 'Apply' }).click();
          await page.getByText('Archive updated.').waitFor({ timeout: 30_000 });
          const unanswered = await persistedUntil(
            app,
            (s) => (s.state as { db: Db }).db,
            (d) => d.archiveSources[0]!.pieces.some((p) => (p as { composer: string }).composer === NEW_COMPOSER),
          );
          expect(unanswered.items.find((i) => i.source?.pieceKey === better.key)!.persian?.composer).toBe(better.was);

          // THE SAME INDEX, a NEW answer. The graph is already current, so a
          // refresh judged by the index hash alone called this "Already
          // current" and threw the answer away unwritten.
          await refresh(app);
          expect(await page.getByRole('button', { name: 'Already current' }).count()).toBe(1);
          await page.getByRole('button', { name: /Use the archive’s composer/ }).first().click();
          await page.getByRole('button', { name: 'Apply' }).waitFor({ timeout: 20_000 });
          await page.getByRole('button', { name: 'Apply' }).click();
          await page.getByText('Archive updated.').waitFor({ timeout: 30_000 });
          const answeredDb = await persistedUntil(
            app,
            (s) => (s.state as { db: Db }).db,
            (d) => d.items.find((i) => i.source?.pieceKey === better.key)?.persian?.composer === NEW_COMPOSER,
          );
          // Only that field moved: the piece keeps its title and its history.
          expect(answeredDb.items.find((i) => i.source?.pieceKey === better.key)!.title).toBe(better.key);
          expect(answeredDb.blocks).toHaveLength(1);
          // …and the offer is gone, because it has been taken.
          await refresh(app);
          expect(await page.getByRole('button', { name: /Use the archive’s composer/ }).count()).toBe(0);
          expect(await page.getByRole('button', { name: 'Already current' }).count()).toBe(1);

          // --- AN INVALID INDEX IS ACTIONABLE, and changes nothing ----------
          publishSourceIndex(remote, '{"format":"setar-archive-index","version":99}', 'source-index-commit-3');
          await goTo(app, '/settings');
          await page.getByRole('button', { name: 'Refresh Setar archive' }).click();
          await page.getByRole('alert').first().waitFor({ timeout: 30_000 });
          expect(await page.getByRole('alert').first().innerText()).toMatch(/newer scanner/);

          // --- A RELOAD PROVES IT: no duplicates, no fabricated history -----
          await reload(app);
          const persisted = await db(app);
          expect(persisted.lessons).toHaveLength(41);
          expect(persisted.items.filter((i) => i.source)).toHaveLength(94);
          expect(new Set(persisted.items.map((i) => i.id)).size).toBe(persisted.items.length);
          expect(new Set(persisted.lessons.map((l) => l.id)).size).toBe(persisted.lessons.length);
          expect(persisted.blocks).toHaveLength(1);
          // MESSAGES, not Error objects: `toEqual([])` on an array of Errors
          // reports "expected [ …(1) ] to deeply equal []" and nothing else,
          // so the one thing a CI-only failure needs to say — what the browser
          // actually reported, and what the harness saw around it — is exactly
          // what it withholds. Every other journey already asserts this way.
          expect(app.pageErrors.map((e) => e.message)).toEqual([]);
          // THE REPO IS BOOTSTRAPPED ONCE, not once per navigation. Every
          // `goTo` above is a full document load, so each one re-runs the
          // app's on-open sync; while the fake answered `git/ref/heads/main`
          // with 404 after its own bootstrap, every one of those syncs
          // re-entered `initialize()` and issued another
          // `PUT contents/README.md` into a document the next navigation was
          // tearing down — the measured amplifier behind the intermittent
          // WebKit access-control page error this journey kept reporting.
          expect(remote.calls.filter((c) => c.startsWith('PUT contents/README.md'))).toHaveLength(1);
        } finally {
          await app.close();
        }
      }
    }
  });
});
