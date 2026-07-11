import type { PracticeItem } from './types';

/**
 * "My repertoire" is a LENS over ordinary practice items — the musical works
 * the user actually plays — never a parallel database. A work is a top-level
 * item that is musically identifiable:
 *   • anything with Persian identity (dastgāh/āvāz, form, composer, gusheh) —
 *     radif gushehs AND composed maestro pieces alike;
 *   • any full piece (guitar or otherwise) or gusheh-typed item.
 * Passages, parts, technique drills and generic exercises stay in the
 * Practice list; parts appear NESTED under their parent work here, never as
 * duplicate standalone entries.
 */

export function isWork(item: PracticeItem): boolean {
  if (item.parentItemId) return false; // parts live under their parent
  const p = item.persian;
  const hasPersianIdentity = !!p && [p.dastgahAvaz, p.form, p.composer, p.gusheh].some((v) => v && v.trim());
  return hasPersianIdentity || item.itemType === 'full_piece' || item.itemType === 'gusheh';
}

export interface RepertoireWork {
  work: PracticeItem;
  parts: PracticeItem[];
}

/** Top-level works with their parts attached, alphabetical by title. */
export function repertoireWorks(items: PracticeItem[]): RepertoireWork[] {
  return items
    .filter(isWork)
    .map((work) => ({
      work,
      parts: items
        .filter((i) => i.parentItemId === work.id)
        .sort((a, b) => a.title.localeCompare(b.title)),
    }))
    .sort((a, b) => a.work.title.localeCompare(b.work.title));
}

/** Distinct Persian forms present, for compact filter chips. */
export function formsPresent(works: RepertoireWork[]): string[] {
  const set = new Map<string, string>();
  for (const { work } of works) {
    const f = work.persian?.form?.trim();
    if (f && !set.has(f.toLowerCase())) set.set(f.toLowerCase(), f);
  }
  return [...set.values()].sort((a, b) => a.localeCompare(b));
}
