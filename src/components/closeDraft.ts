import type { BlockResult, FocusArea, ItemStatus, Rating, ReviewType } from '../domain';

/**
 * What the owner had typed and chosen on the close screen when they went Back
 * to practise more — held IN MEMORY for the live app session only, never in
 * the store's persisted state, the database, sync or a backup (a reload loses
 * it, by design).
 *
 * It belongs to ONE block: the active session's identity (`closeDraftKey`),
 * never just its item, so a new, finished, discarded or replaced session on
 * the same item can never receive it. It holds the owner's INPUTS only — the
 * review date, status suggestion and minutes proposal are derived again from
 * the current time and settings when the screen comes back; a minutes figure
 * survives only if the owner corrected it.
 */
export interface CloseDraft {
  key: string;
  /** The block's own note when this was held: a note changed since wins. */
  sessionNote: string | undefined;
  result: BlockResult | null;
  observation: string;
  nextAction: string;
  /** Minutes the owner typed; null keeps the live proposal. */
  correctedMinutes: number | null;
  comeBack: boolean;
  override: { dueDate?: string; reviewType?: ReviewType } | null;
  statusPick: ItemStatus | null;
  focusPick: FocusArea | '' | null;
  effortPick: Rating | null;
  becomeTeacherQ: boolean;
  teacherQText: string;
}

let held: CloseDraft | null = null;

/** The identity of one practice block: when it started, and what. */
export function closeDraftKey(session: { startedAt: string; itemId: string }): string {
  return `${session.startedAt}\u0000${session.itemId}`;
}

export function holdCloseDraft(draft: CloseDraft): void {
  held = draft;
}

/** The draft held for exactly this block, or null; one for another block is dropped. */
export function closeDraftFor(key: string): CloseDraft | null {
  if (held && held.key !== key) held = null;
  return held;
}

/** Forget this block's draft — and only this block's: a newer one stays. */
export function dropCloseDraft(key: string): void {
  if (held?.key === key) held = null;
}
