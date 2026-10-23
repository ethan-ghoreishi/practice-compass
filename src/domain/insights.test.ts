import { describe, expect, it } from 'vitest';
import { generateInsights, insightOfTheDay } from './insights';
import { createBlock, createInstrument, createItem } from './factories';
import { emptyDB } from './seed';
import type { FocusArea, ItemStatus, PracticeDB, PracticeItem } from './types';

// ---------------------------------------------------------------------------
// Insights are English sentences about the owner's own text. Each owner value
// is a bidi isolate (U+2068…U+2069) so a Farsi title followed by digits stops
// pulling the words after it out of order; a title never embeds a value; and
// the wording says which data it describes — the chosen last-N-day window, or
// the items as they stand right now.
// ---------------------------------------------------------------------------

const NOW = new Date('2026-10-20T21:00:00.000Z');
const FSI = '⁨';
const PDI = '⁩';
const iso = (v: string) => `${FSI}${v}${PDI}`;
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000 + 3_600_000).toISOString();

function item(id: string, instrumentId: string, title: string, o: Partial<PracticeItem> = {}): PracticeItem {
  return { ...createItem({ instrumentId, title }, new Date('2026-08-01T09:00:00.000Z')), id, ...o };
}

const block = (practiceItemId: string, instrumentId: string, ago: number, minutes: number, focus: FocusArea, result: 'same' | 'slightly_better' = 'same') =>
  createBlock({ practiceItemId, instrumentId, durationMinutes: minutes, mode: 'repair', focus, startedAt: daysAgo(ago), result }, NOW);

const status = (s: ItemStatus) => ({ status: s });

function db(): PracticeDB {
  return {
    ...emptyDB(),
    instruments: [
      { ...createInstrument({ name: 'تار' }, NOW), id: 'tar' },
      { ...createInstrument({ name: 'Guitar' }, NOW), id: 'gtr' },
      // Practised once, long ago: going quiet.
      { ...createInstrument({ name: 'سه‌تار' }, NOW), id: 'setar' },
    ],
    items: [
      item('iraq', 'tar', 'عراق 3', { ...status('repairing'), importance: 5, lastResult: 'same', timesPractised: 3 }),
      item('etude', 'gtr', 'Etude 12', { ...status('fragile'), lastResult: 'stable_alone', timesPractised: 2 }),
      item('pre', 'gtr', `${FSI}Already isolated${PDI}`, { ...status('fragile') }),
      item('dar', 'setar', 'درآمد 2', { ...status('usable'), importance: 5, lastPractisedAt: daysAgo(40) }),
    ],
    blocks: [
      // Inside 7 days: عراق 3 three times on tone, Etude 12 once.
      block('iraq', 'tar', 1, 15, 'tone'),
      block('iraq', 'tar', 2, 15, 'tone'),
      block('iraq', 'tar', 3, 15, 'tone'),
      block('etude', 'gtr', 2, 10, 'rhythm', 'slightly_better'),
      // Inside 30 days only: Etude 12 dominates, on rhythm.
      block('etude', 'gtr', 10, 60, 'rhythm', 'slightly_better'),
      block('etude', 'gtr', 12, 60, 'rhythm', 'slightly_better'),
      block('etude', 'gtr', 14, 60, 'rhythm', 'slightly_better'),
      block('etude', 'gtr', 16, 60, 'rhythm', 'slightly_better'),
      block('dar', 'setar', 40, 20, 'tone', 'slightly_better'),
    ],
    lessonAgenda: [
      { id: 'q', kind: 'question', instrumentId: 'tar', itemId: 'iraq', text: 'Why early?', createdAt: NOW.toISOString(), updatedAt: NOW.toISOString() },
    ],
  };
}

const OWNER_VALUES = ['عراق 3', 'Etude 12', 'درآمد 2', 'تار', 'Guitar', 'سه‌تار'];
const count = (text: string, part: string) => text.split(part).length - 1;

describe('insights', () => {
  it('insights isolate owner text and say which window they describe', () => {
    const source = db();
    const before = JSON.stringify(source);
    const week = generateInsights(source, NOW, 7);
    const month = generateInsights(source, NOW, 30);

    for (const [windowDays, insights] of [
      [7, week],
      [30, month],
    ] as const) {
      for (const i of insights) {
        const where = `${windowDays}d ${i.id}`;
        // Every owner value in a body is isolated wherever it appears (a
        // value inside another is counted once, as the longer one).
        for (const v of OWNER_VALUES) {
          const bare = count(i.body.split(iso(v)).join(''), v) - OWNER_VALUES.filter((o) => o !== v && o.includes(v)).reduce((n, o) => n + count(i.body, iso(o)), 0);
          expect(bare, `${where}: ${v} unisolated in ${i.body}`).toBe(0);
        }
        // An already-isolated value is never wrapped again.
        expect(i.body, where).not.toContain(`${FSI}${FSI}`);
        // A title never embeds a value.
        expect(OWNER_VALUES.some((v) => i.title.includes(v)) || /[⁦-⁩]/.test(i.title), `${where}: ${i.title}`).toBe(false);
        // Window wording follows windowDays; 30 never says "this week".
        expect(i.body, where).not.toMatch(/this week/);
        if (i.scope === 'window' && /days/.test(i.body)) expect(i.body, where).toContain(`last ${windowDays} days`);
      }
    }

    const byId = (list: typeof week) => Object.fromEntries(list.map((i) => [i.id, i]));
    const w = byId(week);
    const m = byId(month);

    // The approved wording, independently written out.
    expect(w['instrument-balance']).toMatchObject({
      scope: 'window',
      title: 'Instrument balance',
      body: `Over the last 7 days: ${iso('تار')} 82%, ${iso('Guitar')} 18%. Is that the balance you intended?`,
    });
    expect(m['instrument-balance'].body).toBe(`Over the last 30 days: ${iso('Guitar')} 85%, ${iso('تار')} 15%. Is that the balance you intended?`);
    expect(w['most-practised']).toMatchObject({ scope: 'window', body: `Most of your time went to "${iso('عراق 3')}" — 45 min across 3 blocks.` });
    expect(m['most-practised'].body).toBe(`Most of your time went to "${iso('Etude 12')}" — 250 min across 5 blocks.`);
    expect(w['common-focus']).toMatchObject({ scope: 'window', body: '3 blocks in the last 7 days focused on tone.' });
    expect(m['common-focus'].body).toBe('5 blocks in the last 30 days focused on rhythm.');
    expect(w['idle-setar']).toMatchObject({ scope: 'now', title: 'An instrument going quiet', body: `${iso('سه‌تار')} hasn't been practised for 40 days.` });
    expect(w['fragile']).toMatchObject({ scope: 'now', body: `3 items are fragile or under repair: ${iso('عراق 3')}, ${iso('Etude 12')}, ${FSI}Already isolated${PDI}.` });
    expect(w['same-iraq']).toMatchObject({ scope: 'now', body: `"${iso('عراق 3')}" has produced the same result three times. Try a different strategy or ask your teacher.` });
    expect(w['improved']).toMatchObject({ scope: 'now', body: `"${iso('Etude 12')}" reached "Stable alone" after 2 blocks.` });
    expect(w['teacher-questions']).toMatchObject({ scope: 'now', body: `You have 1 open question to raise: ${iso('عراق 3')}.` });
    expect(w['next-priorities'].scope).toBe('now');

    // Scope matches the data: a window insight moves with the window, a
    // right-now insight does not.
    for (const id of Object.keys(w)) {
      if (w[id].scope === 'now') expect(m[id], id).toEqual(w[id]);
    }
    expect(['instrument-balance', 'most-practised', 'common-focus'].every((id) => w[id].body !== m[id].body)).toBe(true);

    // Stored values never gain marks; Today's pick reads the same insights.
    expect(JSON.stringify(source)).toBe(before);
    expect(week).toContainEqual(insightOfTheDay(week, NOW));
  });
});
