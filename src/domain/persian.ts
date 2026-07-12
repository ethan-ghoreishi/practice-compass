import type { PracticeItem } from './types';
import { faCollator, normalizePersian } from './farsi';

/**
 * The Persian repertoire view: radif gushehs and composed maestro pieces are
 * all ordinary items — this groups them by their dastgāh/āvāz so the whole
 * repertoire reads as one musical map. Pure and deterministic. Works for both
 * Farsi and Latin spellings (the canonical seed data is Farsi, but users may
 * type either).
 */

export const UNCLASSIFIED_DASTGAH = '__unclassified__';

/**
 * Standard concert order of the seven dastgāh and five āvāz. Each entry lists
 * fold-keys (Farsi + Latin) that identify it; grouping ranks by the first
 * token found in the folded dastgāh name.
 */
const DASTGAH_RANK: [tokens: string[], rank: number][] = [
  [['شور', 'shur'], 0],
  [['ابوعطا', 'abuata', 'abu'], 1],
  [['ترک', 'tork'], 2],
  [['افشار', 'afshar'], 3],
  [['دشتی', 'dasht'], 4],
  [['همایون', 'homayun'], 5],
  [['اصفهان', 'esfahan', 'esfah'], 6],
  [['سهگاه', 'segah'], 7],
  [['چهارگاه', 'chahargah'], 8],
  [['ماهور', 'mahur'], 9],
  [['نوا', 'nava'], 10],
  [['راست', 'rast'], 11],
];

/**
 * Fold a dastgāh name to a comparison key: normalize Persian variants, drop
 * ZWNJ / spaces / latin diacritics, lowercase. So "Āvāz-e Afshāri",
 * "افشاری", "افشاري" all fold together.
 */
function fold(name: string): string {
  let s = normalizePersian(name).replace(/‌/g, '').replace(/\s+/g, '');
  // Farsi "āvāz"/"dastgāh" prefix — strip while still composed (before NFD,
  // which would decompose آ and break the match).
  s = s.replace(/^(آواز|دستگاه)/, '');
  // Latin fold: lowercase, drop combining diacritics.
  s = s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  // Latin "āvāz-e"/"dastgāh-e" prefix, now diacritic-free.
  s = s.replace(/^(avaz|dastgah)[-e]*/, '');
  return s;
}

function dastgahRank(foldedKey: string): number {
  for (const [tokens, rank] of DASTGAH_RANK) {
    if (tokens.some((t) => foldedKey.includes(t))) return rank;
  }
  return DASTGAH_RANK.length;
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
        : [...g.spellings.entries()].sort((a, b) => b[1] - a[1] || faCollator.compare(a[0], b[0]))[0][0];
    return { key, dastgah: label, items: [...g.items].sort((a, b) => faCollator.compare(a.title, b.title)) };
  });

  return groups
    .sort((a, b) => {
      if (a.key === UNCLASSIFIED_DASTGAH) return 1;
      if (b.key === UNCLASSIFIED_DASTGAH) return -1;
      const ra = dastgahRank(a.key);
      const rb = dastgahRank(b.key);
      return ra !== rb ? ra - rb : faCollator.compare(a.key, b.key);
    })
    .map(({ dastgah, items: list }) => ({ dastgah, items: list }));
}
