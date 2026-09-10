import type { ID, PracticeDB } from './types';

// ---------------------------------------------------------------------------
// Pure decisions about the unfinished practice SESSION itself — the sibling of
// practiceSignal.ts, which owns pure decisions about a running clock's
// SIGNALS (wake lock, boundary announcements). Nothing here may ever be fed
// into `shouldKeepAwake` or `nextSignal`: no wake-lock or audio outcome may
// influence a recorded minute, and no staleness verdict may influence whether
// the screen stays awake.
//
// TWO INDEPENDENT QUESTIONS live here, and conflating them is the bug this
// module exists to prevent:
//
//   PRESENCE     — does an unfinished session exist? That, and ONLY that,
//                  decides whether a whole-database replacement may proceed.
//                  Running or paused, fresh or stale, ordinary or routine: a
//                  session that exists is protected.
//   PLAUSIBILITY — does this session's elapsed figure still look like time
//                  someone actually played? That, and ONLY that, decides what
//                  minutes are proposed at close and whether the session is
//                  worth drawing attention to.
//
// A stale verdict never touches the first question, and no threshold in this
// file is wired to a destructive path. An implausible DURATION says nothing
// about whether the session holds practice worth keeping: a session paused at
// three genuine hours would cross any sensible threshold, and discarding it
// would be a heuristic promoted into an authority to destroy data.
// ---------------------------------------------------------------------------

/**
 * The unfinished-clock shapes this module reads. Structurally compatible with
 * the store's `ActiveSession` / `ActiveRoutine` (which live in useStore.ts
 * because they are EPHEMERAL store state, never persisted domain types), and
 * declared here so the domain stays free of any store import.
 *
 * The timing fields are deliberately part of the input to `decideReplacement`
 * even though it must never read them — that is what makes "a stale session
 * blocks a replacement exactly as hard as a live one" a genuine assertion
 * over genuinely different inputs, rather than a tautology.
 */
export interface UnfinishedBlock {
  itemId: ID;
  targetMinutes: number;
  accumulatedSeconds: number;
  running: boolean;
}

export interface UnfinishedRoutine {
  routineId: ID;
  accumulatedSeconds: number;
  running: boolean;
}

export interface UnfinishedPractice {
  kind: 'block' | 'routine';
  /** What to call it in a visible message — never a fabricated title. */
  label: string;
}

export interface EphemeralPractice {
  active: UnfinishedBlock | null;
  activeRoutine: UnfinishedRoutine | null;
}

/**
 * PRESENCE, and nothing else. Never reads `running` — pausing a session must
 * protect it, not expose it — and never reads elapsed time. The frozen
 * `active` + `activeRoutine` pair the persist middleware's `merge` produces on
 * hydration is unfinished practice like any other: both are paused, both hold
 * genuinely-elapsed minutes, and the owner resolves one of them.
 */
export function hasUnfinishedPractice(s: EphemeralPractice): boolean {
  return !!s.active || !!s.activeRoutine;
}

/** Describe the unfinished session for a visible message, or null if none. */
export function unfinishedPractice(
  s: EphemeralPractice,
  labels?: { itemTitle?: string; routineName?: string },
): UnfinishedPractice | null {
  if (s.active) return { kind: 'block', label: labels?.itemTitle?.trim() || 'a practice block' };
  if (s.activeRoutine) return { kind: 'routine', label: labels?.routineName?.trim() || 'a routine' };
  return null;
}

/**
 * How a whole-database replacement is answered while practice is unfinished.
 * `defer` is quiet and retried; `refuse` is said out loud. Neither is ever a
 * silent no-op, and neither ever discards the session.
 */
export type ReplacementOutcome = 'proceed' | 'defer' | 'refuse';

export interface ReplacementDecision {
  outcome: ReplacementOutcome;
  /** Empty when the replacement proceeds; otherwise what the owner is told. */
  message: string;
}

/**
 * THE CORE SAFETY DECISION. An unfinished practice session — ordinary or
 * routine, RUNNING OR PAUSED, FRESH OR STALE — is never destroyed by a
 * replacement the owner did not explicitly aim at it.
 *
 * Automatic (background sync) and deliberate (Import, Restore archive, Keep
 * remote) are answered differently because silence would be wrong in opposite
 * directions: a background merge waiting its turn is not a failure and an
 * alert would be noise, while a deliberate choice that quietly did nothing
 * looks like a broken button.
 *
 * Only PRESENCE is read. The elapsed figures on the inputs are ignored by
 * construction — staleness is not, and can never become, permission to
 * destroy practice.
 */
export function decideReplacement(args: {
  intent: 'automatic' | 'deliberate';
  session: EphemeralPractice;
  labels?: { itemTitle?: string; routineName?: string };
}): ReplacementDecision {
  const blocking = unfinishedPractice(args.session, args.labels);
  if (!blocking) return { outcome: 'proceed', message: '' };

  const what = blocking.kind === 'block' ? `an unfinished practice block (${blocking.label})` : `an unfinished routine (${blocking.label})`;
  if (args.intent === 'automatic') {
    return { outcome: 'defer', message: `Waiting on ${what} — sync will finish on its own once you finish or discard it.` };
  }
  return {
    outcome: 'refuse',
    message: `Not replaced: ${what} is still open, and replacing your data would destroy it. Finish or discard it first — Today's In-progress card leads straight there.`,
  };
}

/**
 * Whether a DEFERRED sync should fire now. The trigger is the blocking
 * condition CLEARING, not an incidental database write: `closeSession` writes
 * a block (bumping the revision counter), but `cancelSession` is a bare
 * `set({ active: null })` that writes nothing at all. Watching the revision
 * would resume after a finish and wait forever after a discard.
 */
export function deferredSyncRetry(args: { pending: boolean; wasUnfinished: boolean; isUnfinished: boolean }): boolean {
  return args.pending && args.wasUnfinished && !args.isUnfinished;
}

// --- PLAUSIBILITY: what minutes to propose, and what to draw attention to ----

/**
 * A clock is stale when elapsed exceeds BOTH a generous multiple of its own
 * target AND an absolute floor — so a short block is judged against the floor
 * (a 10-minute target is not abandoned at 40 minutes) and a long one against
 * the multiple (a 90-minute target is not abandoned at 3 hours).
 *
 * These are heuristics wired to exactly two non-destructive outcomes: the
 * minutes CloseBlock proposes, and the attention state that makes a session
 * holding sync visible. Never to a destructive path.
 */
export const STALE_TARGET_MULTIPLE = 4;
export const STALE_FLOOR_SECONDS = 3 * 3600;

export function isStaleClock(elapsedSeconds: number, targetMinutes: number): boolean {
  const targetSeconds = Math.max(1, targetMinutes) * 60;
  return elapsedSeconds > targetSeconds * STALE_TARGET_MULTIPLE && elapsedSeconds > STALE_FLOOR_SECONDS;
}

export interface ProposedMinutes {
  minutes: number;
  /** True when the wall-clock figure was rejected as implausible. */
  stale: boolean;
}

/**
 * The minutes to pre-fill on the close screen. Ordinary overtime is untouched
 * — practising past the target is completely normal and still proposes the
 * real elapsed time. An abandoned clock proposes the block's own TARGET
 * instead, so a forgotten timer can never quietly write eight hours of
 * practice that did not happen. The figure is a proposal either way: it is an
 * editable field and the owner's correction always wins.
 */
export function proposedCloseMinutes(elapsedSeconds: number, targetMinutes: number): ProposedMinutes {
  const stale = isStaleClock(elapsedSeconds, targetMinutes);
  const minutes = stale ? Math.max(1, Math.round(targetMinutes)) : Math.max(1, Math.round(elapsedSeconds / 60));
  return { minutes, stale };
}

// --- Installing a replacement database ---------------------------------------

/**
 * Everything the store must set when a new database is installed. The `db` and
 * the ephemeral reset arrive in ONE object deliberately: `importDB`,
 * `resetDemo` and `clearAll` each become a single `set()` of this result, so
 * installing a database WITHOUT clearing the state that pointed at the old one
 * stops being an omission a reviewer has to catch and becomes something the
 * code cannot express. (The Node test environment cannot import useStore.ts —
 * it pulls in Dexie via ./idb — so this shape is what protects the wiring.)
 */
export interface InstalledDatabase {
  db: PracticeDB;
  active: null;
  activeRoutine: null;
  activePlan: null;
  notNow: { date: string; ids: ID[] };
  sessionInstrumentId: ID | null;
}

/**
 * Install a replacement database, clearing every piece of ephemeral state tied
 * to the one it replaces: the running plan, today's dismissed reviews, and a
 * session instrument the new database does not contain. A session instrument
 * that still resolves is KEPT, as is the cross-instrument 'all' overview —
 * there is nothing dangling about either.
 *
 * This is not a guard. Deliberate erasure (reset to demo, erase everything) is
 * aimed at destroying the data and already confirms first; refusing it would
 * be obstruction rather than safety. It must simply leave nothing pointing at
 * a database that no longer exists.
 */
export function installDatabase(args: { db: PracticeDB; sessionInstrumentId: ID | null }): InstalledDatabase {
  const { db, sessionInstrumentId } = args;
  const keepInstrument =
    sessionInstrumentId === 'all' || db.instruments.some((i) => i.id === sessionInstrumentId);
  return {
    db,
    active: null,
    activeRoutine: null,
    activePlan: null,
    notNow: { date: '', ids: [] },
    sessionInstrumentId: keepInstrument ? sessionInstrumentId : null,
  };
}
