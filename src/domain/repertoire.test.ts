import { describe, expect, it } from 'vitest';
import { discoverRepertoire, isWork, repertoireWorks } from './repertoire';
import { createItem } from './factories';
import type { CreateItemInput } from './factories';

const now = new Date('2026-07-11T10:00:00Z');

function item(input: Partial<CreateItemInput> & { title: string }) {
  return createItem({ instrumentId: 'setar', ...input }, now);
}

describe('My repertoire lens (repertoireWorks)', () => {
  it('a radif gusheh and a composed maestro piece coexist as works', () => {
    const gusheh = item({ title: 'Darāmad-e Afshāri', itemType: 'gusheh', persian: { dastgahAvaz: 'Afshāri', gusheh: 'Darāmad' } });
    const saba = item({
      title: 'Chahārmezrāb-e Sabā',
      itemType: 'full_piece',
      persian: { dastgahAvaz: 'Afshāri', form: 'Chahārmezrāb', composer: 'Abolhasan Sabā' },
    });
    const works = repertoireWorks([gusheh, saba]);
    expect(works.map((w) => w.work.title)).toEqual(['Chahārmezrāb-e Sabā', 'Darāmad-e Afshāri']);
  });

  it('a Classical Guitar piece appears through the same lens without any special model', () => {
    const guitar = item({ instrumentId: 'guitar', title: 'Lágrima', itemType: 'full_piece' });
    expect(isWork(guitar)).toBe(true);
  });

  it('technique drills and generic exercises are NOT works — they stay in the practice list', () => {
    expect(isWork(item({ title: 'Riz evenness', itemType: 'technique' }))).toBe(false);
    expect(isWork(item({ title: 'Spider exercise', itemType: 'exercise' }))).toBe(false);
    expect(isWork(item({ title: 'Random phrase', itemType: 'phrase' }))).toBe(false);
  });

  it('parts nest under their parent work and never appear as standalone works', () => {
    const piece = item({ title: 'Pish-darāmad-e Māhur', itemType: 'full_piece', persian: { dastgahAvaz: 'Māhur' } });
    const partB = item({ title: 'B section', itemType: 'section', parentItemId: piece.id });
    const partA = item({ title: 'A section', itemType: 'section', parentItemId: piece.id });
    // Even a part WITH Persian identity stays nested, not duplicated.
    const partC = item({ title: 'Forud phrase', itemType: 'phrase', parentItemId: piece.id, persian: { dastgahAvaz: 'Māhur' } });

    const works = repertoireWorks([piece, partB, partA, partC]);
    expect(works).toHaveLength(1);
    expect(works[0].parts.map((p) => p.title)).toEqual(['A section', 'B section', 'Forud phrase']);
  });

  it('an item linked to a source, stage and lesson appears exactly once — links never duplicate it', () => {
    const linked = item({
      title: 'Chahārmezrāb-e Sabā',
      itemType: 'full_piece',
      persian: { dastgahAvaz: 'Afshāri', form: 'Chahārmezrāb', composer: 'Abolhasan Sabā' },
      materialId: 'radif-saba',
      stageId: 'stage-afshari',
    });
    const works = repertoireWorks([linked]);
    expect(works).toHaveLength(1);
    expect(works[0].work.materialId).toBe('radif-saba');
    expect(works[0].work.stageId).toBe('stage-afshari');
  });

  it('offers each form present exactly once as a facet, whatever the spelling', () => {
    const items = [
      item({ title: 'A', itemType: 'full_piece', persian: { form: 'Chahārmezrāb' } }),
      item({ title: 'B', itemType: 'full_piece', persian: { form: 'chahārmezrāb' } }),
      item({ title: 'C', itemType: 'full_piece', persian: { form: 'Tasnif' } }),
    ];
    const found = discoverRepertoire({ items, materials: [], instruments: [], musicTerms: [] }, {});
    expect(found.facets.form.map((f) => [f.label, f.count])).toEqual([
      ['چهارمضراب', 2],
      ['تصنیف', 1],
    ]);
  });
});

// ---------------------------------------------------------------------------
// ac-5 — discovery over the committed legacy fixture, against expectations
// written BY HAND from the rules (tests/fixtures/repertoire-family-expectations.json).
// ---------------------------------------------------------------------------
import LEGACY_TEXT from '../../tests/fixtures/repertoire-legacy-v14.json?raw';
import EXPECT_TEXT from '../../tests/fixtures/repertoire-family-expectations.json?raw';
import { validateDB } from './io';

describe('My repertoire discovery', () => {
  it('repertoire discovery includes every eligible work without duplicate parents', () => {
    const db = validateDB(JSON.parse(LEGACY_TEXT));
    const want = JSON.parse(EXPECT_TEXT).legacy.setarDiscovery;
    const ids = (works: { work: { id: string } }[]) => works.map((w) => w.work.id).sort();

    // No query, no facet: every eligible Setar work, grouped by dastgāh — the
    // title-only full piece and the uncurated gushehs in "No dastgāh yet",
    // «Shur» and «شور» in ONE group, the composite in its own.
    const all = discoverRepertoire(db, { instrumentId: 'inst-setar' });
    expect(all.scopeCount).toBe(want.scopeCount);
    expect(all.matchCount).toBe(want.scopeCount);
    expect(all.groups.map((g) => ({ key: g.key, label: g.unclassified ? 'No dastgāh yet' : g.label, unclassified: g.unclassified, works: ids(g.works) }))).toEqual(
      want.groups.map((g: { works: string[] }) => ({ ...g, works: [...g.works].sort() })),
    );
    // Every work exactly once; a part never stands alone; its parent carries it.
    const shown = all.groups.flatMap((g) => g.works.map((w) => w.work.id));
    expect(new Set(shown).size).toBe(shown.length);
    for (const [parent, parts] of Object.entries(want.partsOf as Record<string, string[]>)) {
      expect(shown).not.toContain(parts[0]);
      const w = all.groups.flatMap((g) => g.works).find((x) => x.work.id === parent)!;
      expect(w.parts.map((p) => p.id)).toEqual(parts);
    }

    // Facets come from the owner's own works only — and "no value" is its own option.
    for (const facet of ['dastgah', 'form', 'composer'] as const) {
      expect(all.facets[facet].map((o) => [o.key, o.count]), facet).toEqual(want.facets[facet]);
    }

    // Query: terms (in any spelling), maestros, sources and raw text; a
    // matching PART brings its parent, once, naming the part.
    for (const s of want.searches as { q: string; works: string[]; matchedParts?: Record<string, string[]> }[]) {
      const found = discoverRepertoire(db, { instrumentId: 'inst-setar', text: s.q });
      const works = found.groups.flatMap((g) => g.works);
      expect(works.map((w) => w.work.id).sort(), s.q).toEqual([...s.works].sort());
      for (const [parent, parts] of Object.entries(s.matchedParts ?? {})) {
        expect(works.find((w) => w.work.id === parent)!.matchedParts.map((p) => p.id)).toEqual(parts);
      }
      // A search that finds nothing says so distinctly from a library with nothing in it.
      if (s.works.length === 0) expect([found.matchCount, found.scopeCount]).toEqual([0, want.scopeCount]);
    }

    // Combined facets narrow together; "none" finds the unclassified.
    for (const f of want.facetFilters as { works: string[]; dastgah?: string; form?: string; composer?: string }[]) {
      const found = discoverRepertoire(db, { instrumentId: 'inst-setar', dastgah: f.dastgah, form: f.form, composer: f.composer });
      expect(found.groups.flatMap((g) => g.works).map((w) => w.work.id).sort()).toEqual([...f.works].sort());
    }

    // Existing archive title aliases are searched too (search only).
    const aliased = discoverRepertoire(db, { instrumentId: 'inst-setar', text: 'تصنیف بی‌نام' }, new Map([['it-title-only', ['تصنیف بی‌نام']]]));
    expect(aliased.groups.flatMap((g) => g.works).map((w) => w.work.id)).toEqual(['it-title-only']);

    // An instrument with no works at all is a different state from "no match".
    const empty = discoverRepertoire({ ...db, items: db.items.filter((i) => i.instrumentId !== 'inst-setar') }, { instrumentId: 'inst-setar' });
    expect([empty.scopeCount, empty.matchCount, empty.groups]).toEqual([0, 0, []]);

    // Any other grouping still lists every work exactly once.
    for (const groupBy of ['form', 'composer', 'source'] as const) {
      const g = discoverRepertoire(db, { instrumentId: 'inst-setar', groupBy });
      const everyone = g.groups.flatMap((x) => x.works.map((w) => w.work.id));
      expect(everyone.sort(), groupBy).toEqual(ids(all.groups.flatMap((x) => x.works)));
    }
  });
});
