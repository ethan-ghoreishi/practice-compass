import type { ISODate, PracticeItem } from './types';
import { effectiveReturnDate, returnIntentOf } from './scoring';
import { addDaysISODate, dayDiff, parseISODate, toISODate, todayISODate } from './util';

// ---------------------------------------------------------------------------
// The ONE "Next practice" answer for an item: why it comes back, and when.
//
// It is DERIVED on every read — from the item's stored date, its return
// intention, its last real practice and its live class preparation — and is
// never written anywhere. The stored review date stays exactly what it is
// (who chose it is part of it); when this answer is earlier, the stored date
// is reported beside it as KEPT, never described as overwritten or
// recalculated. Ranking reads the same derivation (`effectiveReturnDate`,
// `lessonUrgencyScore`), so the explanation and the suggestion cannot drift.
// ---------------------------------------------------------------------------

export type NextPracticeKind = 'class' | 'working' | 'retention' | 'none';

export interface NextPractice {
  kind: NextPracticeKind;
  /** When it next wants practice; absent when nothing is scheduled. */
  date?: ISODate;
  /** One honest sentence, English page copy. */
  sentence: string;
  /** The item's stored review date, when it differs from `date` and stands. */
  keptDate?: ISODate;
  /** Why the kept date stands, when there is one. */
  keptNote?: string;
}

function provenance(item: PracticeItem): string {
  const mode = item.reviewMode ?? 'auto';
  if (mode === 'manual') return 'your date';
  if (mode === 'interval') return 'fixed cadence';
  if (item.nextReviewSource === 'user') return 'your date';
  if (item.nextReviewSource === 'auto') return 'set by the app';
  return 'an older date';
}

/**
 * Why and when this item next wants practice. `preparationDate` is the date of
 * the class it is LIVE-committed to (`preparationDatesByItem`), if any — a
 * passed, removed, unassigned, archive or other-instrument class never
 * reaches here. Class preparation leads while it is live: practised today, it
 * returns tomorrow (or on the class day itself); otherwise it is wanted today.
 */
export function nextPractice(args: { item: PracticeItem; preparationDate?: ISODate; now: Date }): NextPractice {
  const { item, preparationDate, now } = args;
  const today = todayISODate(now);
  const stored = item.nextReviewDate;
  const lastDay = item.lastPractisedAt ? toISODate(new Date(item.lastPractisedAt)) : undefined;
  const kept = (date: ISODate | undefined) =>
    stored && stored !== date ? { keptDate: stored, keptNote: `Review date ${stored} stays as it is (${provenance(item)}).` } : {};

  if (preparationDate && preparationDate >= today) {
    const tomorrow = addDaysISODate(today, 1);
    const date = lastDay === today && preparationDate > today ? tomorrow : today;
    const away = dayDiff(now, parseISODate(preparationDate));
    const when = away === 0 ? 'today' : `on ${preparationDate} (${away} day${away === 1 ? '' : 's'} away)`;
    return {
      kind: 'class',
      date,
      sentence: `Class preparation — for your class ${when}; ${date === today ? 'practise it today' : 'back tomorrow'}.`,
      ...kept(date),
    };
  }

  if (returnIntentOf(item) === 'working') {
    const date = effectiveReturnDate(item);
    if (!date) return { kind: 'working', sentence: 'Working on this — no return date yet; it comes up as it waits.' };
    return { kind: 'working', date, sentence: `Working on this — next practice ${date}.`, ...kept(date) };
  }

  if (!stored) return { kind: 'none', sentence: 'Keep fresh — no whole-item check is scheduled.' };
  return { kind: 'retention', date: stored, sentence: `Keep fresh — whole-item check on ${stored}.` };
}

// --- Inbound validation (schema v17) ------------------------------------------

/**
 * The v17 fields of an INBOUND database: a block's evidence scope. Absent is
 * legacy-unknown and passes; anything else must be one of the two scopes.
 * (`returnIntent` is checked with the other scheduling fields.)
 */
export function validateEvidenceScopes(db: { blocks: { id: string; scope?: unknown }[] }): string | null {
  for (const b of db.blocks) {
    if (b.scope !== undefined && b.scope !== 'focused' && b.scope !== 'whole') {
      return `Practice block "${b.id}" has an unknown evidence scope.`;
    }
  }
  return null;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const finiteAtLeastZero = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0;

/**
 * The unfinished-run shapes that reach live state from persisted storage
 * (`activeRoutine`, `activePlan` — ephemeral, never in PracticeDB), checked
 * at hydration before anything is installed. A legacy run without the v17
 * flags is valid exactly as it was; a wrong type is refused, never coerced.
 */
export function validateUnfinishedRun(state: { activeRoutine?: unknown; activePlan?: unknown }): string | null {
  const r = state.activeRoutine;
  if (r !== undefined && r !== null) {
    if (!isRecord(r) || !Array.isArray(r.segs) || !Array.isArray(r.authoredSegments)) return 'The unfinished routine run is not readable.';
    if (r.segs.length !== r.authoredSegments.length) return 'The unfinished routine run lists a different number of segments than it started with.';
    if (!finiteAtLeastZero(r.accumulatedSeconds)) return 'The unfinished routine run has an unreadable elapsed time.';
    for (const seg of r.segs) {
      if (!isRecord(seg) || !finiteAtLeastZero(seg.seconds)) return 'The unfinished routine run has an unreadable segment.';
      if (seg.itemId !== undefined && typeof seg.itemId !== 'string') return 'The unfinished routine run has an unreadable item binding.';
      if (seg.skipped !== undefined && typeof seg.skipped !== 'boolean') return 'The unfinished routine run has an unreadable skip.';
    }
  }
  const p = state.activePlan;
  if (p !== undefined && p !== null) {
    if (!isRecord(p) || !Array.isArray(p.segments) || typeof p.pointer !== 'number') return 'The running session plan is not readable.';
    for (const seg of p.segments) {
      if (!isRecord(seg) || !['pending', 'done', 'skipped'].includes(seg.status as string)) return 'The running session plan has an unreadable segment.';
      if (seg.actualMinutes !== undefined && !finiteAtLeastZero(seg.actualMinutes)) return 'The running session plan has unreadable recorded minutes.';
    }
  }
  return null;
}

// --- Study-focus prompts --------------------------------------------------------
//
// A small, dismissible way to start a title-only Theory / listening study item
// about the material in front of you. Each prompt is a QUESTION to take to
// your own teacher's recording or source — never an asserted fact about the
// dastgāh. Built-in wording is Farsi behind a stable ascii id; the dastgāh is
// whatever the item already names. Nothing is created without the owner's tap
// (the prompt only pre-fills Add practice item).

export interface StudyPrompt {
  id: string;
  title: string;
}

const STUDY_PROMPTS: { id: string; title: (dastgah: string) => string }[] = [
  { id: 'study-listen-teacher', title: (d) => `گوش دادن به اجرای استاد از ${d}` },
  { id: 'study-compare-phrases', title: (d) => `مقایسهٔ جمله‌های ${d}` },
  { id: 'study-note-functions', title: (d) => `نقش نت‌ها در ${d}، از روی منبع خودم` },
];

/** The prompts for one named dastgāh; none without one. */
export function studyPromptsFor(dastgah: string | undefined): StudyPrompt[] {
  const name = dastgah?.trim();
  if (!name) return [];
  return STUDY_PROMPTS.map((p) => ({ id: p.id, title: p.title(name) }));
}
