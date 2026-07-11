import type { PracticeItem } from './types';

/**
 * The Persian repertoire view: radif gushehs and composed maestro pieces are
 * all ordinary items — this groups them by their dastgāh/āvāz so the whole
 * repertoire reads as one musical map. Pure and deterministic.
 */

export const UNCLASSIFIED_DASTGAH = '__unclassified__';

/** Standard concert order of the seven dastgāh and five āvāz, for stable grouping. */
const DASTGAH_ORDER = [
  'shur',
  'abu',
  'tork',
  'afshar',
  'dashti',
  'nava',
  'homayun',
  'esfahan',
  'segah',
  'chahargah',
  'mahur',
  'rast',
];

/** Diacritic-insensitive fold so "Āvāz-e Afshāri", "Afshari", "AFSHĀRI" agree. */
function fold(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/^avaz[- e]+|^dastgah[- e]+/, '')
    .trim();
}

function dastgahRank(folded: string): number {
  const idx = DASTGAH_ORDER.findIndex((k) => folded.includes(k));
  return idx === -1 ? DASTGAH_ORDER.length : idx;
}

export interface DastgahGroup {
  dastgah: string;
  items: PracticeItem[];
}

/**
 * Group items by their `persian.dastgahAvaz`. Spelling variants ("Afshari",
 * "Āvāz-e Afshāri") fold into ONE group; the label shown is the group's most
 * common spelling — user text is never rewritten. Items with a form, composer
 * or gusheh but no dastgāh land in the UNCLASSIFIED_DASTGAH group at the end;
 * items with no Persian identity at all are omitted (plain technique work,
 * not repertoire).
 */
export function groupByDastgah(items: PracticeItem[]): DastgahGroup[] {
  const byKey = new Map<string, { items: PracticeItem[]; spellings: Map<string, number> }>();
  const empty = (): { items: PracticeItem[]; spellings: Map<string, number> } => ({
    items: [],
    spellings: new Map(),
  });
  for (const item of items) {
    const p = item.persian;
    if (!p) continue;
    const hasIdentity = [p.dastgahAvaz, p.form, p.composer, p.gusheh].some((v) => v && v.trim());
    if (!hasIdentity) continue;
    const raw = p.dastgahAvaz?.trim() || '';
    const key = raw ? fold(raw) || raw.toLowerCase() : UNCLASSIFIED_DASTGAH;
    const g = byKey.get(key) ?? empty();
    g.items.push(item);
    if (raw) g.spellings.set(raw, (g.spellings.get(raw) ?? 0) + 1);
    byKey.set(key, g);
  }

  const groups = [...byKey.entries()].map(([key, g]) => {
    const label =
      key === UNCLASSIFIED_DASTGAH
        ? UNCLASSIFIED_DASTGAH
        : [...g.spellings.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
    return { key, dastgah: label, items: [...g.items].sort((a, b) => a.title.localeCompare(b.title)) };
  });

  return groups
    .sort((a, b) => {
      if (a.key === UNCLASSIFIED_DASTGAH) return 1;
      if (b.key === UNCLASSIFIED_DASTGAH) return -1;
      const ra = dastgahRank(a.key);
      const rb = dastgahRank(b.key);
      return ra !== rb ? ra - rb : a.key.localeCompare(b.key);
    })
    .map(({ dastgah, items: list }) => ({ dastgah, items: list }));
}
