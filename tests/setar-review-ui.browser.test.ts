import { describe, expect, it } from 'vitest';
import type { Locator } from 'playwright';
import OWNER_V16_TEXT from './fixtures/setar-practice-owner-v16.json?raw';
import CASES from './fixtures/setar-review-ui.json';
import { hashState } from '../src/domain/canonical';
import { validateDB } from '../src/domain/io';
import { SCHEMA_VERSION, type PracticeDB } from '../src/domain/types';
import {
  connectSync,
  importBackup,
  importOutcome,
  installFakeGitHub,
  newFakeRemote,
  openPracticeApp,
  openSettings,
  persistedDb,
  persistedUntil,
  publishRemote,
  publishSourceIndex,
  reload,
  remoteStateText,
  stampSourceIndex,
  type Engine,
  type PracticeApp,
} from './practiceBrowser';

// ---------------------------------------------------------------------------
// Review Setar setup and Refresh Setar archive, as the owner sees them: the
// ORDER of every generated line that embeds values, measured on screen, and
// every choice control's visible selected state and what Apply writes.
//
// The family proof for direction (ac-1) lives here and in one committed
// fixture, tests/fixtures/setar-review-ui.json, whose expected lines were
// written by hand. Classes crossed: title Farsi / English (the group resolves
// RTL / LTR, asserted) × values Farsi / English / mixed, every cell on setup
// rows and every cell but English × English on difference rows; setup kind, place, study source, suggestion and
// class rows in proposed and exception states; archive differences in
// "Archive metadata differs" and "Review differences" (one registry key
// renamed to English for the English-title cells); the attention list; phone
// and desktop; Chromium and WebKit. Limits: class and suggestion rows are only
// ever exceptions (planSetarSetup proposes neither) and their values are
// always generated English, so they have no Farsi- or mixed-value cell; the
// "Archive metadata differs" rows keep Farsi keys, the English-key cells are
// in "Review differences", the same DifferenceRow.
// ---------------------------------------------------------------------------

const CLOCK = new Date('2026-10-05T09:00:00.000Z');
const T = CLOCK.toISOString();
const OWNER_V16: { data: PracticeDB } = JSON.parse(OWNER_V16_TEXT);
type Db = PracticeDB;

/**
 * A registry key renamed wherever the archive names it — the graph and the
 * item's binding — and nowhere else: an item's title is the owner's.
 */
const renameKeys = <V,>(v: V, keys: Record<string, string>): V =>
  typeof v === 'string'
    ? ((keys[v] ?? v) as V)
    : Array.isArray(v)
      ? (v.map((x) => renameKeys(x, keys)) as V)
      : v && typeof v === 'object'
        ? (Object.fromEntries(Object.entries(v).map(([k, x]) => [k, renameKeys(x, keys)])) as V)
        : v;

/** The owner-shaped seed with this fixture's edits. */
function fixtureDb(): Db {
  const base = validateDB(OWNER_V16);
  const e = CASES.edits;
  return {
    ...base,
    attachments: [],
    archiveSources: renameKeys(base.archiveSources, e.pieceKeys),
    items: base.items.map((i) => {
      const title = (e.titles as Record<string, string>)[i.id];
      const persian = (e.persian as Record<string, Record<string, string>>)[i.id];
      const placement = (e.placement as Record<string, { materialId?: string; stageId?: string }>)[i.id];
      return {
        ...i,
        ...(title ? { title } : {}),
        ...(persian ? { persian: { ...i.persian, ...persian } } : {}),
        ...placement,
        ...(i.source ? { source: renameKeys(i.source, e.pieceKeys) } : {}),
      };
    }),
    materials: base.materials.map((m) => {
      const title = (e.materials as Record<string, string>)[m.id];
      return title ? { ...m, title } : m;
    }),
    pathwayStages: base.pathwayStages.map((s) => {
      const st = (e.stages as Record<string, { code: string; title: string }>)[s.id];
      return st ? { ...s, ...st } : s;
    }),
  };
}

/** The published index for the seed's graph, re-stamped as the scanner would, with `change` applied. */
async function indexFor(db: Db, change: (i: Record<string, unknown>) => void = () => {}) {
  const graph = db.archiveSources[0]!;
  const index: Record<string, unknown> = {
    format: 'setar-archive-index',
    version: 1,
    archiveId: graph.id,
    pieces: graph.pieces.map(({ unavailable: _u, ...p }) => (void _u, p)),
    sessions: graph.sessions.map(({ unavailable: _u, ...s }) => (void _u, { ...s, resources: s.resources.map(({ unavailable: _r, ...r }) => (void _r, r)) })),
    renames: graph.renames,
    diagnostics: graph.diagnostics,
  };
  change(index);
  return stampSourceIndex(index);
}
const withFixtureIndex = (i: Record<string, unknown>) => {
  for (const p of i.pieces as { key: string; composer?: string }[]) {
    const to = (CASES.index.composer as Record<string, string>)[p.key];
    if (to) p.composer = to;
  }
  i.diagnostics = CASES.index.diagnostics;
};

const wrap = (data: unknown) => JSON.stringify({ app: 'practice-compass', schemaVersion: SCHEMA_VERSION, exportedAt: T, data });
async function seeded(engine: Engine, data: Db, viewport: { width: number; height: number }) {
  const app = await openPracticeApp({ now: CLOCK, engine, viewport });
  await importBackup(app, 'owner.json', wrap(data));
  expect(await importOutcome(app)).toContain('Imported');
  await reload(app);
  return app;
}
const db = async (app: PracticeApp) => (await persistedDb(app)) as unknown as Db;
const until = <V,>(app: PracticeApp, read: (d: Db) => V, ok: (v: V) => boolean, timeout = 15_000): Promise<V> =>
  persistedUntil(app, (s) => read((s.state as { db: Db }).db), ok, timeout);
async function refreshArchive(app: PracticeApp) {
  await openSettings(app);
  await app.page.getByRole('button', { name: 'Refresh Setar archive' }).click();
  await app.page.getByRole('button', { name: /^(Apply|Already current)$/ }).waitFor({ timeout: 30_000 });
}
async function connected(app: PracticeApp, indexText: string) {
  const remote = newFakeRemote();
  await installFakeGitHub(app.page, remote);
  await connectSync(app);
  publishSourceIndex(remote, indexText, 'idx-ui');
  return remote;
}

// --- reading the order on screen ---------------------------------------------

type Box = { l: number; r: number; t: number; b: number };
/**
 * Where each token's characters actually render: found in the element's text
 * in LOGICAL order, then measured by a Range — the browser's own layout, never
 * a computed `direction` (every fragment's own direction was always right;
 * their ORDER was not).
 */
const measure = (el: Locator, tokens: string[]) =>
  el.evaluate((node, tokens) => {
    const nodes: Text[] = [];
    const starts: number[] = [];
    let text = '';
    const walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    while (walk.nextNode()) {
      const n = walk.currentNode as Text;
      starts.push(text.length);
      nodes.push(n);
      text += n.data;
    }
    const pos = (offset: number, end: boolean): [Text, number] => {
      for (let i = nodes.length - 1; i >= 0; i -= 1) if (end ? starts[i]! < offset : starts[i]! <= offset) return [nodes[i]!, offset - starts[i]!];
      return [nodes[0]!, 0];
    };
    const boxes = (from: number, to: number) => {
      const r = document.createRange();
      r.setStart(...pos(from, false));
      r.setEnd(...pos(to, true));
      return [...r.getClientRects()].filter((x) => x.width > 0.5).map((x) => ({ l: x.left, r: x.right, t: x.top, b: x.bottom }));
    };
    let from = 0;
    const found = tokens.map((t) => {
      const i = text.indexOf(t, from);
      if (i < 0) return null;
      from = i + t.length;
      return boxes(i, i + t.length);
    });
    return { text, found, whole: boxes(0, text.length) };
  }, tokens);

const extent = (bs: Box[]) => ({ l: Math.min(...bs.map((b) => b.l)), r: Math.max(...bs.map((b) => b.r)) });

/** Every token present, each one after the last from the line's inline start (left, the line being one LTR isolate). */
async function readsInOrder(line: Locator, tokens: string[], where: string) {
  const m = await measure(line, tokens);
  const missing = tokens.filter((_, i) => !m.found[i]?.length);
  expect(missing, `${where}: tokens not found in "${m.text}"`).toEqual([]);
  // A token can render as several boxes (one per bidi run or wrapped line):
  // compare where the earlier one ENDS on its last line with where the later
  // one STARTS on its first.
  const onLine = (bs: Box[], pick: (ts: number[]) => number) => {
    const t = pick(bs.map((x) => x.t));
    const row = bs.filter((x) => Math.abs(x.t - t) < 1);
    return { t, b: row[0]!.b, l: Math.min(...row.map((x) => x.l)), r: Math.max(...row.map((x) => x.r)) };
  };
  for (let i = 1; i < tokens.length; i += 1) {
    const a = onLine(m.found[i - 1]!, (ts) => Math.max(...ts));
    const b = onLine(m.found[i]!, (ts) => Math.min(...ts));
    const sameLine = Math.abs(a.t - b.t) < (a.b - a.t) / 2;
    const ok = sameLine ? b.l >= a.r - 1 : b.t > a.t;
    expect(ok, `${where}: "${tokens[i]}" should follow "${tokens[i - 1]}" on screen in "${m.text}" (${JSON.stringify([a, b])})`).toBe(true);
  }
  return extent(m.whole);
}

/** The line starts where its group starts: the title's own start edge (right in RTL, left in LTR). */
async function startsWithTitle(group: Locator, title: Locator, line: { l: number; r: number }, dir: string, where: string) {
  expect(await group.evaluate((g) => getComputedStyle(g).direction), `${where}: the group's resolved direction`).toBe(dir);
  const t = extent((await measure(title, [])).whole);
  const gap = dir === 'rtl' ? Math.abs(t.r - line.r) : Math.abs(t.l - line.l);
  expect(gap, `${where}: the line starts at the title's start edge`).toBeLessThan(2);
}

const VIEWPORTS = [
  ['phone', { width: 390, height: 844 }],
  ['desktop', { width: 1280, height: 900 }],
] as const;

describe('generated lines beside a Farsi title', () => {
  it('setar review and archive lines read in order beside a farsi title', async () => {
    const base = fixtureDb();
    const indexText = await indexFor(base, withFixtureIndex);
    for (const engine of ['chromium', 'webkit'] as Engine[]) {
      for (const [layout, viewport] of VIEWPORTS) {
        const where = `${engine} ${layout}`;
        const app = await seeded(engine, base, viewport);
        const { page } = app;
        try {
          // --- Review Setar setup --------------------------------------------
          await openSettings(app);
          await page.getByText('Review Setar setup').click();
          await page.getByRole('combobox', { name: 'Pathway to place items in' }).selectOption(CASES.setup.pathway);
          await page.getByRole('combobox', { name: `Study source for ${CASES.setup.source.group}` }).selectOption(CASES.setup.source.material);
          for (const g of CASES.setup.groups) {
            const group = page.getByRole('group', { name: `Setup of ${g.title}` });
            for (const tokens of g.lines) {
              const at = `${where} setup «${g.title}» ${tokens[0]}`;
              const line = group.locator('div.tiny:not(.faint)').filter({ hasText: tokens[0] }).first();
              const box = await readsInOrder(line, tokens, at);
              await startsWithTitle(group, group.locator('strong'), box, g.dir, at);
            }
          }

          // --- Refresh Setar archive -----------------------------------------
          await connected(app, indexText);
          await refreshArchive(app);
          const row = (d: { piece: string; field: string }) =>
            page.locator('.list-row').filter({ has: page.getByRole('group', { name: `${d.field} of ${d.piece}`, exact: true }) });
          for (const d of CASES.differences.fresh) {
            const at = `${where} Archive metadata differs «${d.piece}» ${d.field}`;
            const group = row(d).locator('div[dir="auto"]').first();
            const box = await readsInOrder(group.locator('div.tiny'), d.tokens, at);
            await startsWithTitle(group, group.locator('strong'), box, d.dir, at);
          }
          await page.getByRole('button', { name: /^Review differences/ }).click();
          for (const d of CASES.differences.standing) {
            const at = `${where} Review differences «${d.piece}» ${d.field}`;
            const group = row(d).locator('div[dir="auto"]').first();
            const box = await readsInOrder(group.locator('div.tiny'), d.tokens, at);
            await startsWithTitle(group, group.locator('strong'), box, d.dir, at);
          }
          await page.getByRole('button', { name: /^Show \d+ needing attention$/ }).click();
          for (const tokens of CASES.attention) {
            const at = `${where} attention ${tokens[0]}`;
            const item = page.locator('li').filter({ hasText: tokens[0]! });
            const box = await readsInOrder(item, tokens, at);
            const li = await item.evaluate((e) => {
              const r = e.getBoundingClientRect();
              return { l: r.left + parseFloat(getComputedStyle(e).paddingLeft) };
            });
            expect(Math.abs(box.l - li.l), `${at}: the line starts at the list's start edge`).toBeLessThan(2);
          }
          expect(app.pageErrors.map((e) => e.message), where).toEqual([]);
        } finally {
          await app.close();
        }
      }
    }
  }, 900_000);
});

// --- a choice shows itself -----------------------------------------------------

/** The style properties a pressed option may differ in; weight is the one that is not colour. */
const look = (l: Locator) =>
  l.evaluate((e) => {
    const s = getComputedStyle(e);
    return { fontWeight: s.fontWeight, background: s.backgroundColor, border: s.borderTopColor, color: s.color };
  });

describe('archive metadata choices, seen', () => {
  it('archive metadata choices show the selected option and apply exactly it', async () => {
    const base = fixtureDb();
    const indexText = await indexFor(base, withFixtureIndex);
    const [F1, F2] = CASES.differences.fresh as { piece: string; field: string }[];
    const idOf = (key: string) => base.items.find((i) => i.source?.pieceKey === key)!.id;
    const f1 = idOf(F1!.piece);
    const f2 = idOf(F2!.piece);
    for (const engine of ['chromium', 'webkit'] as Engine[]) {
      const where = engine;
      const app = await seeded(engine, base, { width: 390, height: 844 });
      const { page } = app;
      const choice = (d: { piece: string; field: string }, name: 'Keep my value' | 'Use archive value') =>
        page.getByRole('group', { name: `${d.field} of ${d.piece}`, exact: true }).getByRole('button', { name });
      // The look once it has settled: `.option` eases between states, and the
      // pointer is moved off so a hover is not read as a state.
      const pressedLook = async (d: { piece: string; field: string }, pressed: 'Keep my value' | 'Use archive value') => {
        const other = pressed === 'Keep my value' ? 'Use archive value' : 'Keep my value';
        expect(await choice(d, pressed).getAttribute('aria-pressed'), `${where}: ${pressed} pressed`).toBe('true');
        expect(await choice(d, other).getAttribute('aria-pressed'), `${where}: ${other} not pressed`).toBe('false');
        await page.mouse.move(0, 0);
        for (const b of [choice(d, pressed), choice(d, other)]) await b.evaluate((e) => Promise.all(e.getAnimations().map((a) => a.finished)));
        return { on: await look(choice(d, pressed)), off: await look(choice(d, other)) };
      };
      try {
        const remote = await connected(app, indexText);
        await refreshArchive(app);

        // The default is Keep, and it LOOKS chosen — by weight, not colour alone.
        const first = await pressedLook(F1!, 'Keep my value');
        expect(first.on.fontWeight, `${where}: weight marks the choice`).not.toBe(first.off.fontWeight);
        expect(first.on.background, `${where}: so does the fill`).not.toBe(first.off.background);
        // Click swaps it, and the two looks swap with it.
        await choice(F1!, 'Use archive value').click();
        expect(await pressedLook(F1!, 'Use archive value'), where).toEqual(first);
        // The choice is SEEN to count before Apply: the summary names it.
        expect(await page.locator('main').innerText(), where).toMatch(/classes · will set 1 field to the archive’s value · /);
        // The keyboard does the same: Keep (Enter), then Use again (Space).
        await choice(F1!, 'Keep my value').focus();
        await page.keyboard.press('Enter');
        expect(await pressedLook(F1!, 'Keep my value'), where).toEqual(first);
        expect(await page.locator('main').innerText(), where).not.toMatch(/to the archive’s value/);
        await choice(F1!, 'Use archive value').focus();
        await page.keyboard.press('Space');
        expect(await pressedLook(F1!, 'Use archive value'), where).toEqual(first);
        // The other difference is untouched: still Keep, still looking it.
        expect(await pressedLook(F2!, 'Keep my value'), where).toEqual(first);

        // ANOTHER DEVICE moves F1's premise: Apply is refused and the fresh
        // preview shows Keep — selected on screen, not only in the attribute.
        const pulled = structuredClone(await db(app)) as Db;
        pulled.items = pulled.items.map((i) => (i.id === f1 ? { ...i, persian: { ...i.persian, composer: { termId: 'composer:vaziri' } } } : i));
        publishRemote(remote, remoteStateText(pulled), await hashState(pulled), 99);
        await page.getByRole('button', { name: 'Sync now' }).click();
        await until(app, (x) => JSON.stringify(x.items.find((i) => i.id === f1)!.persian?.composer), (v) => v === '{"termId":"composer:vaziri"}');
        const beforeApply = await db(app);
        await page.getByRole('button', { name: 'Apply' }).click();
        await page.getByRole('status').filter({ hasText: 'has changed since' }).waitFor({ timeout: 15_000 });
        expect(await pressedLook(F1!, 'Keep my value'), where).toEqual(first);
        expect(JSON.stringify(await db(app)), where).toBe(JSON.stringify(beforeApply));

        // Use on F1, Keep on F2: Apply writes the archive's value to F1 only.
        await choice(F1!, 'Use archive value').click();
        expect(await pressedLook(F1!, 'Use archive value'), where).toEqual(first);
        await page.getByRole('button', { name: 'Apply' }).click();
        await page.getByText('Archive updated.').waitFor({ timeout: 30_000 });
        expect(await page.locator('main').innerText(), where).toMatch(/classes · set 1 field to the archive’s value · /);
        const after = await until(app, (x) => x, (x) => x.items.find((i) => i.id === f1)!.persian?.composer === 'ابوالحسن صبا');
        expect(after.items.find((i) => i.id === f2)!.persian?.composer, where).toBe(beforeApply.items.find((i) => i.id === f2)!.persian?.composer);
        expect(after.items.find((i) => i.id === f2)!.persian?.composer, where).toBe('Morad-Khani');
        await reload(app);
        expect((await db(app)).items.find((i) => i.id === f1)!.persian?.composer, where).toBe('ابوالحسن صبا');
        expect(app.pageErrors.map((e) => e.message), where).toEqual([]);
      } finally {
        await app.close();
      }
    }
  }, 600_000);
});

describe('answered archive questions', () => {
  it('answered archive questions stay visible and apply only the final answer', async () => {
    const seed = fixtureDb();
    const template = seed.items.find((i) => i.id === 'it-riz')!;
    const base: Db = {
      ...seed,
      items: [...seed.items, ...CASES.questions.items.map((q) => ({ ...template, id: q.id, title: q.title, stageId: undefined, catalogRefs: undefined }))],
    };
    const [Q1, Q2] = CASES.questions.pieces;
    const indexText = await indexFor(base, (i) => {
      const pieces = i.pieces as Record<string, unknown>[];
      for (const q of CASES.questions.pieces) pieces.push({ ...pieces[0], key: q.key, piece: q.key, aliases: q.aliases, sessions: [] });
    });
    for (const engine of ['chromium', 'webkit'] as Engine[]) {
      const where = engine;
      const app = await seeded(engine, base, { width: 390, height: 844 });
      const { page } = app;
      const answers = (q: { key: string }) => page.getByRole('group', { name: `Answer for ${q.key}`, exact: true });
      const pressed = async (q: { key: string }) =>
        answers(q)
          .getByRole('button')
          .evaluateAll((bs) => bs.filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => [b.textContent, b.classList.contains('selected')]));
      const toDecide = async () => /(\d+) to decide/.exec(await page.getByText(/\d+ to decide/).first().innerText())?.[1];
      try {
        const remote = await connected(app, indexText);
        await refreshArchive(app);
        expect(await toDecide(), where).toBe('2');
        expect([await pressed(Q1!), await pressed(Q2!)], where).toEqual([[], []]);

        // Skip Q1: still listed, Skip shown selected, one left to decide.
        await answers(Q1!).getByRole('button', { name: 'Skip' }).click();
        expect(await pressed(Q1!), where).toEqual([['Skip', true]]);
        expect(await toDecide(), where).toBe('1');
        // Switched to a Link: only that one is selected.
        await answers(Q1!).getByRole('button', { name: 'Link to “Pishdaramad test”' }).click();
        expect(await pressed(Q1!), where).toEqual([['Link to “Pishdaramad test”', true]]);
        expect(await toDecide(), where).toBe('1');
        // Q2 answered, then CLEARED: open again, nothing selected.
        await answers(Q2!).getByRole('button', { name: 'Create separately' }).click();
        expect(await pressed(Q2!), where).toEqual([['Create separately', true]]);
        expect(await toDecide(), where).toBe('0');
        await answers(Q2!).getByRole('button', { name: 'Clear answer' }).click();
        expect(await pressed(Q2!), where).toEqual([]);
        expect(await answers(Q2!).getByRole('button', { name: 'Clear answer' }).count(), where).toBe(0);
        expect(await toDecide(), where).toBe('1');
        const before = await db(app);

        // Apply writes exactly the final answer: Q1 linked to the alias item;
        // the skip it replaced, and the cleared Q2, write nothing.
        await page.getByRole('button', { name: 'Apply' }).click();
        await page.getByText('Archive updated.').waitFor({ timeout: 30_000 });
        const after = await until(app, (x) => x, (x) => !!x.items.find((i) => i.id === 'it-q1-alias')!.source);
        const item = (id: string) => after.items.find((i) => i.id === id)!;
        expect(item('it-q1-alias').source, where).toEqual({ archiveId: 'setar-classes', pieceKey: Q1!.key });
        expect([item('it-q1-key').source, item('it-q2').source], where).toEqual([undefined, undefined]);
        expect(after.items.filter((i) => i.source?.pieceKey === Q2!.key), where).toEqual([]);
        expect(after.archiveSources[0]!.suppressions.filter((s) => s.ref === Q1!.key || s.ref === Q2!.key), where).toEqual([]);
        expect(item('it-q2'), where).toEqual(before.items.find((i) => i.id === 'it-q2'));
        // The next refresh asks only Q2 again.
        await reload(app);
        await refreshArchive(app);
        expect(await toDecide(), where).toBe('1');
        await expect.poll(() => answers(Q2!).count(), { message: where }).toBe(1);
        expect(await answers(Q1!).count(), where).toBe(0);

        // THE MATCH MOVES AFTER THE ANSWER: Q2 skipped, then its only
        // exact-name candidate is renamed on another device and pulled. The
        // next preview (Skip pressed again) no longer has a question to ask,
        // yet Apply would still write the skip — so the row stays, Skip still
        // selected, saying the matches changed, and can still be switched.
        // Q2's one exact-name candidate retitled on the other device and pulled.
        let pulls = 99;
        const retitle = async (title: string) => {
          const pulled = structuredClone(await db(app)) as Db;
          pulled.items = pulled.items.map((i) => (i.id === 'it-q2' ? { ...i, title } : i));
          publishRemote(remote, remoteStateText(pulled), await hashState(pulled), pulls++);
          await page.getByRole('button', { name: 'Sync now' }).click();
          await until(app, (x) => x.items.find((i) => i.id === 'it-q2')!.title, (t) => t === title);
        };
        const answeredThenMoved = async () => {
          await answers(Q2!).getByRole('button', { name: 'Skip' }).click();
          expect(await pressed(Q2!), where).toEqual([['Skip', true]]);
          await retitle('تصنیف-تست (renamed)');
          await answers(Q2!).getByRole('button', { name: 'Skip' }).click();
          await page.getByText('The matches changed since you answered').waitFor({ timeout: 15_000 });
          expect(await pressed(Q2!), where).toEqual([['Skip', true]]);
          expect(await toDecide(), where).toBe('0');
          await answers(Q2!).getByRole('button', { name: 'Create separately' }).click();
          expect(await pressed(Q2!), where).toEqual([['Create separately', true]]);
          await answers(Q2!).getByRole('button', { name: 'Skip' }).click();
          expect(await pressed(Q2!), where).toEqual([['Skip', true]]);
        };
        await answeredThenMoved();

        // CLEARED after the match moved: open again with no candidate, counted,
        // nothing selected — and Apply writes NOTHING for it, not the unasked
        // default (adding the piece) that a refresh with no answer would take.
        await answers(Q2!).getByRole('button', { name: 'Clear answer' }).click();
        await page.getByText(/No existing piece has this name now\. You cleared your answer, so Apply writes nothing for it/).waitFor({ timeout: 15_000 });
        expect(await pressed(Q2!), where).toEqual([]);
        expect(await answers(Q2!).getByRole('button').allInnerTexts(), where).toEqual(['Create separately', 'Skip']);
        expect(await toDecide(), where).toBe('1');
        const clearedBefore = await db(app);
        await page.getByRole('button', { name: 'Apply' }).click();
        await page.getByText('Already current.', { exact: true }).waitFor({ timeout: 30_000 });
        const clearedAfter = await db(app);
        expect(clearedAfter.items, where).toEqual(clearedBefore.items);
        expect(clearedAfter.archiveSources, where).toEqual(clearedBefore.archiveSources);
        expect(clearedAfter.items.filter((i) => i.source?.pieceKey === Q2!.key), where).toEqual([]);
        expect(clearedAfter.archiveSources[0]!.suppressions.some((s) => s.ref === Q2!.key), where).toBe(false);

        // The match comes back, so Q2 is asked again; answered, moved, KEPT.
        await retitle('تصنیف-تست');
        await reload(app);
        await refreshArchive(app);
        await expect.poll(() => answers(Q2!).count(), { message: where }).toBe(1);
        await answeredThenMoved();
        // Apply writes the skip on screen: a suppression, and the renamed item untouched.
        const renamedBefore = (await db(app)).items.find((i) => i.id === 'it-q2');
        await page.getByRole('button', { name: 'Apply' }).click();
        await page.getByText('Archive updated.').waitFor({ timeout: 30_000 });
        const skipped = await until(app, (x) => x, (x) => x.archiveSources[0]!.suppressions.some((s) => s.ref === Q2!.key));
        expect(skipped.items.find((i) => i.id === 'it-q2'), where).toEqual(renamedBefore);
        expect(skipped.items.filter((i) => i.source?.pieceKey === Q2!.key), where).toEqual([]);
        expect(app.pageErrors.map((e) => e.message), where).toEqual([]);
      } finally {
        await app.close();
      }
    }
  }, 600_000);
});
