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
 * "multiple questions" — `teacherQuestion`/`currentProblem`/`lastObservation`
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
