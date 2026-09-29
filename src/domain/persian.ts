import type { PracticeItem } from './types';
import { faCollator } from './farsi';
import { compareGroups, hasValue, valueGroup, vocabulary, type ValueGroup, type Vocabulary } from './musicTerms';

/**
 * The Persian repertoire view: radif gushehs and composed maestro pieces are
 * all ordinary items — this groups them by their dastgāh/āvāz so the whole
 * repertoire reads as one musical map. Pure and deterministic.
 *
 * GROUPING IS IDENTITY, SO IT IS EXACT. A value groups under a term when it is
 * a reference to it or its text is exactly one of that term's curated
 * spellings — «شور» and «Shur» are one group. Anything else groups by its own
 * text: a composite («دشتی/شور»), an unknown spelling and a gusheh-in-dastgāh
 * note («راک(ماهور)») are never folded into a term by a prefix, a substring or
 * a transliteration. The owner's text is never rewritten; a term group is
 * labelled with the term's current name.
 */

export const UNCLASSIFIED_DASTGAH = '__unclassified__';

export interface DastgahGroup {
  dastgah: string;
  items: PracticeItem[];
}

/** True when an item carries any Persian identity at all. */
export function hasPersianIdentity(item: PracticeItem): boolean {
  const p = item.persian;
  return !!p && (hasValue(p.dastgahAvaz) || hasValue(p.form) || hasValue(p.composer) || hasValue(p.gusheh));
}

/**
 * Group items by their `persian.dastgahAvaz`. Items with a form, composer or
 * gusheh but no dastgāh land in the UNCLASSIFIED_DASTGAH group at the end;
 * items with no Persian identity at all are omitted — this answers "which
 * dastgāh", and says nothing about an item it has no evidence for. (My
 * repertoire's own discovery lists those works too, under "No dastgāh yet".)
 * Term groups follow the standard concert order; literal groups follow, by
 * name; a literal group is labelled with its most common spelling.
 */
export function groupByDastgah(items: PracticeItem[], vocab: Vocabulary = vocabulary()): DastgahGroup[] {
  const groups = new Map<string, { group: ValueGroup; items: PracticeItem[]; spellings: Map<string, number> }>();
  const unclassified: PracticeItem[] = [];
  for (const item of items) {
    if (!hasPersianIdentity(item)) continue;
    const g = valueGroup(item.persian?.dastgahAvaz, 'dastgah', vocab);
    if (!g) {
      unclassified.push(item);
      continue;
    }
    const entry = groups.get(g.key) ?? { group: g, items: [] as PracticeItem[], spellings: new Map<string, number>() };
    entry.items.push(item);
    if (!g.termId) entry.spellings.set(g.label, (entry.spellings.get(g.label) ?? 0) + 1);
    groups.set(g.key, entry);
  }
  const byTitle = (list: PracticeItem[]) => [...list].sort((a, b) => faCollator.compare(a.title, b.title));
  const out = [...groups.values()]
    .map((e) => ({
      group: e.group.termId
        ? e.group
        : { ...e.group, label: [...e.spellings.entries()].sort((a, b) => b[1] - a[1] || faCollator.compare(a[0], b[0]))[0][0] },
      items: e.items,
    }))
    .sort((a, b) => compareGroups(a.group, b.group, vocab))
    .map((e) => ({ dastgah: e.group.label, items: byTitle(e.items) }));
  if (unclassified.length) out.push({ dastgah: UNCLASSIFIED_DASTGAH, items: byTitle(unclassified) });
  return out;
}
