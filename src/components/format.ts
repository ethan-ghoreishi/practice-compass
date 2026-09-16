import {
  dayDiff,
  parseISODate,
  planNextReview,
  REVIEW_TYPE_LABELS,
  type BlockResult,
  type PracticeItem,
  type ReviewAnswer,
  type ReviewPlan,
  type SchedulingParams,
} from '../domain';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatShortDate(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatDateTimeISO(iso: string): string {
  return formatShortDate(new Date(iso));
}

/** Friendly relative day from an ISODate (calendar) string. */
export function relativeDay(dateISO: string, now: Date = new Date()): string {
  const diff = dayDiff(now, parseISODate(dateISO)); // +future, -past
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff === -1) return 'yesterday';
  if (diff > 1) return `in ${diff} days`;
  return `${-diff} days ago`;
}

/** Friendly relative day from a full ISO datetime. */
export function relativeFromDateTime(iso: string | undefined, now: Date = new Date()): string {
  if (!iso) return 'never';
  const diff = dayDiff(new Date(iso), now); // days since
  if (diff <= 0) return 'today';
  if (diff === 1) return 'yesterday';
  return `${diff} days ago`;
}

export function pluralize(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/**
 * A free-text field's own non-empty lines. There is no data structure for
 * "multiple questions" — a lesson-agenda question's text, `currentProblem` and
 * `lastObservation`
 * are each one `<textarea>`, so two distinct questions typed for the same
 * item live as two lines of one string. This is how a renderer tells "one
 * line" (plain text) from "several" (worth a bulleted breakdown) apart,
 * without inventing a schema change for what is still one field.
 */
export function splitLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * The close screen's ONE honest line for the review decision — "Review in 2
 * days · Repair · …" — read off the SAME ReviewPlan that seeds the date field
 * behind the disclosure.
 *
 * It is a pure FORMATTER, never a second derivation: it reports the plan's
 * three fields and computes no date of its own. That is what makes
 * r-explainable-scheduling's "the date shown before saving is exactly the date
 * saved" hold by construction on a screen where the decision is collapsed to a
 * line — a divergent date is unrepresentable, not merely remembered about.
 */
export function reviewSummaryLine(plan: ReviewPlan, now: Date = new Date()): string {
  return `Review ${relativeDay(plan.dueDate, now)} · ${REVIEW_TYPE_LABELS[plan.reviewType]} · ${plan.rationale}`;
}

/**
 * Whether a manual date correction on the close screen should survive picking
 * a different result.
 *
 * A correction the owner made earlier belongs to the date the PREVIOUS result
 * produced, so carrying it forward would pin a date to a judgement it was
 * never made about — unless the engine's answer does not depend on the
 * judgement at all. That is now true in several more cases than "manual mode":
 * a fixed cadence, a date the owner chose, a legacy date of unknown
 * provenance, and an ordinary automatic date that is simply not due yet all
 * produce the SAME answer for every result, so a typed-in date was never tied
 * to one of them.
 *
 * So this asks the real engine instead of naming the cases: does the plan
 * differ across the six results? It is a BOOLEAN GATE on whether an automatic
 * plan that depends on the result exists at all — not a second value that
 * could disagree with CloseBlock's single derivation.
 */
export function reviewOverrideSurvivesResultChange(
  item: PracticeItem,
  now: Date,
  params?: SchedulingParams,
): boolean {
  const dates = RESULTS_FOR_OVERRIDE_CHECK.map(
    (result) => planNextReview({ item, result, now, params })?.dueDate ?? null,
  );
  return new Set(dates).size === 1;
}

const RESULTS_FOR_OVERRIDE_CHECK: BlockResult[] = [
  'worse',
  'same',
  'slightly_better',
  'stable_alone',
  'stable_in_context',
  'performable',
];

/**
 * The date a close hands to the store as an EXPLICIT OWNER OVERRIDE.
 *
 * ONLY a date the owner actually typed into the field. The close screen shows
 * the date that will stand, which for an early session is the item's EXISTING
 * date — passing that back as an override would be catastrophically wrong in
 * two ways at once: it would stamp every engine-proposed date as user-chosen
 * (so `worse` could never bring it forward again), and it would turn every
 * "keep" decision into a write, completing the pending review row and
 * replacing it on a session that was only extra practice.
 *
 * The discriminator is `override.dueDate` specifically, not `override` itself:
 * changing only the review-type pills sets an override with no date, and that
 * is not the owner choosing a date.
 */
export function closeOverrideDate(
  answer: ReviewAnswer,
  override: { dueDate?: string } | null,
): string | undefined {
  if (answer !== 'scheduled') return undefined;
  return override?.dueDate ? override.dueDate : undefined;
}

/**
 * The open "Change review date" draft, reconciled against the item the screen
 * is ACTUALLY showing right now.
 *
 * A date editor is a panel that stays mounted across things that change what
 * it is editing. `/items/A` → `/items/B` is a route PARAMETER change, so React
 * keeps the same component instance and only the props move; an import, a sync
 * pull or another tab can likewise replace the item's own date while the panel
 * sits open. Neither remounts anything, so an untouched draft quietly becomes
 * a date belonging to something that is no longer on screen — and "Save date"
 * then writes it through the CURRENT item's callback. A's 2027-02-10 lands on
 * B.
 *
 * So the draft carries the item it was opened for, the item's own date at that
 * moment, and the value the box was actually OFFERED — and this decides what it
 * still means. It is the same rule `ItemNotes` applies to the notebook — a
 * draft is bound to what it was typed for — expressed once, purely, where a
 * Node test can reach it:
 *
 *   • a DIFFERENT item  → dropped. Never re-pointed, never saved onto B.
 *   • the item's own date UNCHANGED → the draft stands, whatever is in it.
 *   • the item's date MOVED beneath an untouched box → re-seeded, so the panel
 *     offers what the item now says rather than a value the owner never chose
 *     and would silently revert.
 *   • the item's date moved beneath TYPED text → the text stands. It is the
 *     owner's own intent, not a stale capture; only the baseline catches up so
 *     this decision is not re-made on every later render.
 *
 * THREE FACTS, THREE FIELDS — and conflating two of them was a real defect.
 * `seeded` used to hold "the item's date, or today when it had none", which
 * made "the item has no date" indistinguishable from "the item's date happens
 * to be today", so the only way to stop a dateless item's today-box being
 * re-seeded to empty was to skip the comparison entirely whenever the item had
 * no date (`if (!current) return draft`). That exemption is what a live update
 * CLEARING the date then fell into: the box went on showing — and Save date
 * went on writing — a date the item no longer had, a schedule the owner had
 * every reason to believe was gone. There is no exemption now. `seeded` is the
 * item's own date and is EMPTY when it has none, `offered` is what the box was
 * filled with (the date, or today), and "untouched" is `text === offered`. The
 * absent→present, present→absent and present→different transitions are then
 * one rule rather than three cases, and a cleared date re-seeds the box to
 * today exactly as opening it fresh on that item would.
 *
 * `today` is passed in rather than read from a clock here: this module is
 * pure, and the caller already has the day the rest of its screen is rendered
 * against.
 */
export interface ReviewDateDraft {
  /** The item this draft was opened for. */
  forItem: string;
  /** The item's OWN pending date when the box was last (re-)seeded; '' for none. */
  seeded: string;
  /** What the box was filled with then — the item's date, or today. */
  offered: string;
  /** What is in the box now. */
  text: string;
}

export function reviewDateDraftFor(
  draft: ReviewDateDraft | null,
  item: { id: string; nextReviewDate?: string },
  today: string,
): ReviewDateDraft | null {
  if (!draft) return null;
  if (draft.forItem !== item.id) return null;
  const current = item.nextReviewDate ?? '';
  if (current === draft.seeded) return draft;
  const offered = current || today;
  return draft.text === draft.offered
    ? { forItem: draft.forItem, seeded: current, offered, text: offered }
    : { ...draft, seeded: current };
}
