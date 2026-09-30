import type { ID, PracticeDB, PracticeItem } from './types';
import { faCollator, persianSearchMatch } from './farsi';
import { hasPersianIdentity } from './persian';
import {
  compareGroups,
  searchAliasTable,
  TERM_FIELD_KIND,
  valueGroup,
  valueSearchTexts,
  vocabulary,
  type TermField,
  type ValueGroup,
  type Vocabulary,
} from './musicTerms';

/**
 * "My repertoire" is a LENS over ordinary practice items — the musical works
 * the user actually plays — never a parallel database. A work is a top-level
 * item that is musically identifiable:
 *   • anything with Persian identity (dastgāh/āvāz, form, composer, gusheh) —
 *     radif gushehs AND composed maestro pieces alike;
 *   • any full piece (guitar or otherwise) or gusheh-typed item — including a
 *     title-only one nobody has classified yet.
 * Passages, parts, technique drills and generic exercises stay in the
 * Practice list; parts appear NESTED under their parent work here, never as
 * duplicate standalone entries.
 */

export function isWork(item: PracticeItem): boolean {
  if (item.parentItemId) return false; // parts live under their parent
  return hasPersianIdentity(item) || item.itemType === 'full_piece' || item.itemType === 'gusheh';
}

export interface RepertoireWork {
  work: PracticeItem;
  parts: PracticeItem[];
}

const byTitle = (a: PracticeItem, b: PracticeItem) => faCollator.compare(a.title, b.title) || (a.id < b.id ? -1 : 1);

/** Top-level works with their parts attached, alphabetical by title. */
export function repertoireWorks(items: PracticeItem[]): RepertoireWork[] {
  return items
    .filter(isWork)
    .map((work) => ({ work, parts: items.filter((i) => i.parentItemId === work.id).sort(byTitle) }))
    .sort((a, b) => byTitle(a.work, b.work));
}

// --- discovery ------------------------------------------------------------------

export type RepertoireGrouping = 'dastgah' | 'form' | 'composer' | 'source';
export type FacetField = 'dastgah' | 'form' | 'composer';

/** Facet → the item field it reads. */
export const FACET_FIELD: Record<FacetField, TermField> = { dastgah: 'dastgahAvaz', form: 'form', composer: 'composer' };

/** The facet value an item with nothing in that field carries. */
export const NO_VALUE = 'none';

export interface RepertoireQuery {
  text?: string;
  /** '' or undefined = every instrument. */
  instrumentId?: ID | '';
  /** Facet keys (`term:<id>`, `literal:<key>` or NO_VALUE); undefined = any. */
  dastgah?: string;
  form?: string;
  composer?: string;
  /** Undefined = the view's natural grouping (dastgāh for Persian, source otherwise). */
  groupBy?: RepertoireGrouping;
}

export interface FacetOption {
  key: string;
  label: string;
  count: number;
  /** A curated term (vs. the owner's own literal text). */
  termId?: ID;
}

export interface DiscoveredWork extends RepertoireWork {
  /** Parts that matched the text query — why a parent is shown. */
  matchedParts: PracticeItem[];
}

export interface DiscoveryGroup {
  key: string;
  label: string;
  /** The "no value" bucket: works with no metadata for this grouping. */
  unclassified: boolean;
  /** How the group is labelled when `unclassified` (which field was empty). */
  grouping: RepertoireGrouping;
  works: DiscoveredWork[];
}

export interface Discovery {
  /**
   * The facet values actually APPLIED: a key that names no option here — a
   * stale link, a deleted term, a typo — is ignored rather than trusted, so a
   * filter can never silently empty the screen with no option to show for it.
   */
  applied: Partial<Record<FacetField, string>>;
  /** Works on the chosen instrument(s) before any query or facet. */
  scopeCount: number;
  /** Works left after the query and facets. */
  matchCount: number;
  groups: DiscoveryGroup[];
  facets: Record<FacetField, FacetOption[]>;
}

type DiscoveryDB = Pick<PracticeDB, 'items' | 'materials' | 'instruments' | 'musicTerms'>;

/**
 * Every string one item can be FOUND by: its title, gusheh, each classifying
 * value as written AND the name and aliases of the term it resolves to, its
 * study source, and any literal archive aliases. Search only — none of this
 * decides what the item is.
 */
export function itemSearchTexts(
  item: PracticeItem,
  db: Pick<PracticeDB, 'materials'>,
  vocab: Vocabulary,
  archiveAliases: string[] = [],
): string[] {
  const out = [item.title];
  if (item.persian?.gusheh) out.push(item.persian.gusheh);
  for (const field of Object.values(FACET_FIELD)) {
    out.push(...valueSearchTexts(item.persian?.[field], TERM_FIELD_KIND[field], vocab));
  }
  const source = item.materialId ? db.materials.find((m) => m.id === item.materialId) : undefined;
  if (source) out.push(source.title);
  out.push(...archiveAliases);
  return out;
}

function facetGroup(item: PracticeItem, facet: FacetField, vocab: Vocabulary): ValueGroup | null {
  return valueGroup(item.persian?.[FACET_FIELD[facet]], facet, vocab);
}

const NO_LABEL: Record<RepertoireGrouping, string> = {
  dastgah: 'No dastgāh yet',
  form: 'No form yet',
  composer: 'No composer yet',
  source: 'No study source yet',
};

export function unclassifiedLabel(grouping: RepertoireGrouping): string {
  return NO_LABEL[grouping];
}

/**
 * My repertoire's search, facets and grouping — ONE pure function, so the
 * screen, a test and a returning back-navigation all get the same answer.
 *
 * EVERY ELIGIBLE WORK APPEARS EXACTLY ONCE: a parent whose part matched is
 * shown (with the matching parts named) rather than the part standing alone;
 * a title-only full piece with no metadata lands in the grouping's "No … yet"
 * group instead of vanishing. Facet options come only from the owner's actual
 * works on the chosen instrument(s) — never an empty catalogue category. No
 * stored value is read differently or changed by any of it.
 */
export function discoverRepertoire(
  db: DiscoveryDB,
  query: RepertoireQuery,
  archiveAliases: Map<ID, string[]> = new Map(),
): Discovery {
  const vocab = vocabulary(db.musicTerms);
  const inScope = db.items.filter((i) => !query.instrumentId || i.instrumentId === query.instrumentId);
  const works = repertoireWorks(inScope);
  const persian = new Set(db.instruments.filter((i) => i.family === 'Persian').map((i) => i.id));

  const facets = {} as Record<FacetField, FacetOption[]>;
  for (const facet of ['dastgah', 'form', 'composer'] as FacetField[]) {
    const options = new Map<string, FacetOption & { group?: ValueGroup }>();
    let none = 0;
    for (const { work } of works) {
      const g = facetGroup(work, facet, vocab);
      if (!g) {
        none += 1;
        continue;
      }
      const o = options.get(g.key) ?? { key: g.key, label: g.label, count: 0, termId: g.termId, group: g };
      o.count += 1;
      options.set(g.key, o);
    }
    const list = [...options.values()]
      .sort((a, b) => compareGroups(a.group!, b.group!, vocab))
      .map(({ key, label, count, termId }) => ({ key, label, count, ...(termId ? { termId } : {}) }));
    if (none && list.length) list.push({ key: NO_VALUE, label: unclassifiedLabel(facet), count: none });
    facets[facet] = list;
  }

  const applied: Partial<Record<FacetField, string>> = {};
  for (const facet of ['dastgah', 'form', 'composer'] as FacetField[]) {
    const want = query[facet];
    if (want && facets[facet].some((o) => o.key === want)) applied[facet] = want;
  }

  const text = query.text?.trim() ?? '';
  const table = searchAliasTable(vocab);
  const matches = (item: PracticeItem) =>
    itemSearchTexts(item, db, vocab, archiveAliases.get(item.id)).some((t) => persianSearchMatch(t, text, table));
  const facetOk = (item: PracticeItem) =>
    (['dastgah', 'form', 'composer'] as FacetField[]).every((facet) => {
      const want = applied[facet];
      if (!want) return true;
      const g = facetGroup(item, facet, vocab);
      return want === NO_VALUE ? !g : g?.key === want;
    });

  const found: DiscoveredWork[] = [];
  for (const w of works) {
    if (!facetOk(w.work)) continue;
    if (!text) {
      found.push({ ...w, matchedParts: [] });
      continue;
    }
    const matchedParts = w.parts.filter(matches);
    if (matches(w.work) || matchedParts.length) found.push({ ...w, matchedParts });
  }

  const groups = new Map<string, DiscoveryGroup & { order?: ValueGroup }>();
  const place = (key: string, label: string, grouping: RepertoireGrouping, w: DiscoveredWork, order?: ValueGroup) => {
    const g = groups.get(key) ?? { key, label, unclassified: !order && grouping !== 'source', grouping, works: [], order };
    g.works.push(w);
    groups.set(key, g);
  };
  for (const w of found) {
    const grouping: RepertoireGrouping = query.groupBy ?? (persian.has(w.work.instrumentId) ? 'dastgah' : 'source');
    if (grouping === 'source') {
      const m = w.work.materialId ? db.materials.find((x) => x.id === w.work.materialId) : undefined;
      if (m) place(`source:${m.id}`, m.title, grouping, w);
      else {
        place(`source:${NO_VALUE}`, NO_LABEL.source, grouping, w);
        groups.get(`source:${NO_VALUE}`)!.unclassified = true;
      }
      continue;
    }
    const g = facetGroup(w.work, grouping, vocab);
    if (g) place(`${grouping}:${g.key}`, g.label, grouping, w, g);
    else place(`${grouping}:${NO_VALUE}`, NO_LABEL[grouping], grouping, w);
  }
  const rank: Record<RepertoireGrouping, number> = { dastgah: 0, form: 1, composer: 2, source: 3 };
  const ordered = [...groups.values()].sort((a, b) => {
    if (a.grouping !== b.grouping) return rank[a.grouping] - rank[b.grouping];
    if (a.unclassified !== b.unclassified) return a.unclassified ? 1 : -1;
    if (a.order && b.order) return compareGroups(a.order, b.order, vocab);
    return faCollator.compare(a.label, b.label);
  });

  return {
    applied,
    scopeCount: works.length,
    matchCount: found.length,
    groups: ordered.map((g) => ({
      key: g.key,
      label: g.label,
      unclassified: g.unclassified,
      grouping: g.grouping,
      works: g.works.sort((a, b) => byTitle(a.work, b.work)),
    })),
    facets,
  };
}
