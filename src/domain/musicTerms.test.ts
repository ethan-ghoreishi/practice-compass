import { describe, expect, it } from 'vitest';
import {
  BUILT_IN_TERMS,
  itemsUsingTerm,
  planAddTerm,
  planDeleteTerm,
  planUpdateTerm,
  reclassifiedItems,
  resolveValue,
  searchAliasTable,
  searchMatch,
  termKeys,
  valueFromInput,
  valueGroup,
  valueLabel,
  vocabulary,
} from './musicTerms';
import { groupByDastgah } from './persian';
import { createItem } from './factories';
import { persianSearchMatch } from './farsi';
import type { MusicTerm, PersianFields } from './types';

const NOW = new Date('2026-09-28T10:00:00.000Z');
const AT = NOW.toISOString();
const item = (id: string, persian: PersianFields) => ({ ...createItem({ instrumentId: 's', title: id, persian }, NOW), id });
const term = (id: string, kind: MusicTerm['kind'], name: string, aliases: string[], archived?: boolean): MusicTerm => ({
  id,
  kind,
  name,
  aliases,
  ...(archived ? { archived } : {}),
  createdAt: AT,
  updatedAt: AT,
});

describe('the shared musical vocabulary', () => {
  it('musical term resolution separates exact identity from broad search', () => {
    const vocab = vocabulary();

    // 1. CURATED UNIQUE ALIASES ARE IDENTITY: Shur and شور are one term, in
    //    every spelling the vocabulary curates — Latin, Farsi, Arabic yeh,
    //    the archive's hyphenated form — and group together.
    for (const spelling of ['Shur', 'shur', 'SHOUR', 'شور', 'دستگاه شور']) {
      const r = resolveValue(spelling, 'dastgah', vocab);
      expect(r.status === 'term' && r.term.id, spelling).toBe('dastgah:shur');
    }
    for (const spelling of ['افشاری', 'افشاري', 'آواز افشاری', 'Āvāz-e Afshāri', 'Afshari']) {
      const r = resolveValue(spelling, 'dastgah', vocab);
      expect(r.status === 'term' && r.term.id, spelling).toBe('dastgah:afshari');
    }
    expect(resolveValue('بیات-ترک', 'dastgah', vocab)).toMatchObject({ status: 'term', term: { id: 'dastgah:bayat-tork' } });
    expect(resolveValue('درویش-خان', 'composer', vocab)).toMatchObject({ status: 'term', term: { id: 'composer:darvish-khan' } });
    const groups = groupByDastgah([item('a', { dastgahAvaz: 'Shur' }), item('b', { dastgahAvaz: 'شور' })], vocab);
    expect(groups).toHaveLength(1);
    expect(groups[0].dastgah).toBe('شور');
    // …and the owner's text is never rewritten to say so.
    expect(valueLabel('Shur', vocab)).toBe('Shur');

    // 2. COMPOSITES, SUBSTRINGS AND UNKNOWN SPELLINGS NEVER ESTABLISH IDENTITY.
    for (const literal of ['دشتی/شور', 'درآمد شور', 'راک(ماهور)', 'Shurr', 'Sh', 'بیات']) {
      expect(resolveValue(literal, 'dastgah', vocab), literal).toEqual({ status: 'literal', text: literal });
    }
    // An alias is scoped to its KIND: a form's spelling is no dastgāh.
    expect(resolveValue('Reng', 'dastgah', vocab).status).toBe('literal');
    expect(resolveValue('Reng', 'form', vocab)).toMatchObject({ status: 'term', term: { id: 'form:reng' } });

    // 3. AMBIGUOUS NAMES NEVER PICK A FIRST WINNER. Inbound data can carry a
    //    custom term claiming a spelling a built-in already claims (the
    //    management planners refuse to create one): that spelling then means
    //    neither, visibly.
    const clash = vocabulary([term('term-mine', 'dastgah', 'My Shur', ['Shur'])]);
    const ambiguous = resolveValue('Shur', 'dastgah', clash);
    expect(ambiguous.status).toBe('ambiguous');
    expect(ambiguous.status === 'ambiguous' && ambiguous.candidates.map((t) => t.id).sort()).toEqual(['dastgah:shur', 'term-mine']);
    expect(valueGroup('Shur', 'dastgah', clash)).toEqual({ key: 'literal:shur', label: 'Shur' });
    // The unambiguous spellings of each still resolve.
    expect(resolveValue('شور', 'dastgah', clash)).toMatchObject({ status: 'term', term: { id: 'dastgah:shur' } });
    expect(resolveValue('My Shur', 'dastgah', clash)).toMatchObject({ status: 'term', term: { id: 'term-mine' } });

    // 4. RENAMED AND ARCHIVED TERMS KEEP THEIR STABLE REFERENCES.
    const renamed = planUpdateTerm([], [], 'dastgah:shur', { name: 'دستگاهِ شور' }, NOW);
    expect(renamed.ok).toBe(true);
    const afterRename = vocabulary(renamed.ok ? renamed.terms : []);
    const ref = { termId: 'dastgah:shur' };
    expect(resolveValue(ref, 'dastgah', afterRename)).toMatchObject({ status: 'term', via: 'reference', term: { id: 'dastgah:shur' } });
    expect(valueLabel(ref, afterRename)).toBe('دستگاهِ شور');
    // The former name is now a spelling of the SAME term, so old text still means it.
    expect(resolveValue('شور', 'dastgah', afterRename)).toMatchObject({ status: 'term', term: { id: 'dastgah:shur' } });
    const archived = planUpdateTerm(renamed.ok ? renamed.terms : [], [], 'dastgah:shur', { archived: true }, NOW);
    const afterArchive = vocabulary(archived.ok ? archived.terms : []);
    expect(resolveValue(ref, 'dastgah', afterArchive)).toMatchObject({ status: 'term', term: { archived: true } });
    expect(resolveValue('Shur', 'dastgah', afterArchive)).toMatchObject({ status: 'term', term: { id: 'dastgah:shur' } });
    // Archived terms are withdrawn only from NEW entry.
    expect(valueFromInput('دستگاهِ شور', 'dastgah', afterArchive)).toBe('دستگاهِ شور');
    expect(valueFromInput('دستگاهِ شور', 'dastgah', afterRename)).toEqual(ref);
    // Typing an alias keeps the owner's own text; only a term's NAME links.
    expect(valueFromInput('Shur', 'dastgah', vocab)).toBe('Shur');
    expect(valueFromInput('شور', 'dastgah', vocab)).toEqual(ref);

    // 5. BROADER SEARCH MATCHING NEVER CHANGES OWNERSHIP. Transliteration and
    //    substring matching find a piece; they decide nothing about what it is.
    const table = searchAliasTable(vocab);
    expect(persianSearchMatch('درآمد شور', 'shur', table)).toBe(true);
    expect(searchMatch('دشتی/شور', 'shur')).toBe(true);
    expect(resolveValue('درآمد شور', 'dastgah', vocab).status).toBe('literal');
    expect(resolveValue('دشتی/شور', 'dastgah', vocab).status).toBe('literal');
    // Nothing in the search path writes: a value resolved or searched is the same string after.
    const p: PersianFields = { dastgahAvaz: 'Shur' };
    searchMatch('Shur', 'sh');
    resolveValue(p.dastgahAvaz, 'dastgah', vocab);
    expect(p).toEqual({ dastgahAvaz: 'Shur' });
  });

  it('ships a vocabulary where no spelling means two terms of one kind', () => {
    const seen = new Map<string, string>();
    for (const t of BUILT_IN_TERMS) {
      for (const key of termKeys(t)) {
        const slot = `${t.kind}:${key}`;
        expect(seen.get(slot) ?? t.id, `${slot} claimed twice`).toBe(t.id);
        seen.set(slot, t.id);
      }
      // Ids never derive from a label: every id is namespaced ascii.
      expect(t.id).toMatch(/^(dastgah|form|composer):[a-z-]+$/);
    }
  });

  it('management planners refuse collisions, built-in deletion and deleting what an item means', () => {
    const items = [item('x', { form: 'Khatai' })];
    const added = planAddTerm([], { id: 'term-khatai', kind: 'form', name: 'ختایی', aliases: ['Khatai'] }, NOW);
    expect(added.ok).toBe(true);
    const terms = added.ok ? added.terms : [];
    // A second term claiming a spelling already taken is refused and explained.
    const clash = planAddTerm(terms, { id: 'term-2', kind: 'form', name: 'Other', aliases: ['khatai'] }, NOW);
    expect(clash).toMatchObject({ ok: false });
    expect(!clash.ok && clash.reason).toMatch(/already means/);
    // Removing a spelling an item is written with would change what it means.
    expect(planUpdateTerm(terms, items, 'term-khatai', { aliases: [] }, NOW)).toMatchObject({ ok: false });
    // Deleting: built-in refused, referenced (by text OR reference) refused, unused allowed.
    expect(planDeleteTerm(terms, [], 'form:reng')).toMatchObject({ ok: false });
    expect(planDeleteTerm(terms, items, 'term-khatai')).toMatchObject({ ok: false });
    expect(planDeleteTerm(terms, [item('y', { form: { termId: 'term-khatai' } })], 'term-khatai')).toMatchObject({ ok: false });
    expect(planDeleteTerm(terms, [], 'term-khatai')).toEqual({ ok: true, terms: [] });

    // AMBIGUOUS TEXT IS HELD IN PLACE BY EVERY CLAIMANT. An imported custom
    // term sharing a spelling with another (validation admits it; resolution
    // keeps that text literal) may neither be deleted nor lose the spelling,
    // for each field — against a built-in claimant and against a custom one —
    // because either hands the item to whichever claimant is left.
    const cases: { field: 'dastgahAvaz' | 'form' | 'composer'; kind: MusicTerm['kind']; spelling: string; other?: MusicTerm }[] = [
      { field: 'dastgahAvaz', kind: 'dastgah', spelling: 'Shur' },
      { field: 'form', kind: 'form', spelling: 'Reng' },
      { field: 'composer', kind: 'composer', spelling: 'Darvish Khan' },
      { field: 'form', kind: 'form', spelling: 'Naghmeh', other: term('term-other', 'form', 'Other naghmeh', ['Naghmeh']) },
    ];
    for (const c of cases) {
      const mine = term('term-mine', c.kind, `My ${c.spelling}`, [c.spelling]);
      const stored = [mine, ...(c.other ? [c.other] : [])];
      const piece = item('amb', { [c.field]: c.spelling });
      const label = `${c.field} ${c.spelling}${c.other ? ' (custom claimant)' : ''}`;
      expect(resolveValue(c.spelling, c.kind, vocabulary(stored)).status, label).toBe('ambiguous');
      // Neither term may be deleted out from under it, and the count says why.
      expect(itemsUsingTerm([piece], 'term-mine', vocabulary(stored)).map((i) => i.id), label).toEqual(['amb']);
      expect(planDeleteTerm(stored, [piece], 'term-mine').ok, label).toBe(false);
      if (c.other) expect(planDeleteTerm(stored, [piece], 'term-other').ok, label).toBe(false);
      // Removing the shared spelling is the same collapse, said as an edit.
      const dropped = planUpdateTerm(stored, [piece], 'term-mine', { aliases: [] }, NOW);
      expect(dropped.ok, label).toBe(false);
      expect(!dropped.ok && dropped.reason, label).toMatch(/quietly change what it means/);
      // …but the term is not stuck: the collision it arrived with is not this
      // edit's doing, so archiving it and renaming it (spelling kept) still work,
      // and the piece still reads as the owner wrote it.
      const archived = planUpdateTerm(stored, [piece], 'term-mine', { archived: true }, NOW);
      expect(archived.ok, label).toBe(true);
      const renamed = planUpdateTerm(archived.ok ? archived.terms : stored, [piece], 'term-mine', { name: `Mine ${c.spelling}` }, NOW);
      expect(renamed.ok, label).toBe(true);
      expect(resolveValue(c.spelling, c.kind, vocabulary(renamed.ok ? renamed.terms : [])).status, label).toBe('ambiguous');
      expect(reclassifiedItems([piece], c.kind, vocabulary(stored), vocabulary(renamed.ok ? renamed.terms : [])), label).toEqual([]);
      // With nothing written in that spelling, both edits are free.
      expect(planDeleteTerm(stored, [], 'term-mine').ok, label).toBe(true);
      expect(planUpdateTerm(stored, [], 'term-mine', { aliases: [] }, NOW).ok, label).toBe(true);
    }
    // Text that STAYS ambiguous reads literally either way: three claimants of
    // «Zarbi», one of them dropping it, reclassify nothing.
    const three = [term('term-a', 'form', 'Zarbi A', ['Zarbi']), term('term-b', 'form', 'Zarbi B', ['Zarbi'])];
    expect(planUpdateTerm(three, [item('z', { form: 'Zarbi' })], 'term-a', { aliases: [] }, NOW).ok).toBe(true);
    // Giving LITERAL text a term is what adding a spelling is for — allowed.
    const plain = item('plain', { form: 'Chaharpareh' });
    const claimed = planUpdateTerm(terms, [plain], 'term-khatai', { aliases: ['Khatai', 'Chaharpareh'] }, NOW);
    expect(claimed.ok).toBe(true);
    expect(resolveValue('Chaharpareh', 'form', vocabulary(claimed.ok ? claimed.terms : [])).status).toBe('term');
  });
});
