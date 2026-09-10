import { describe, expect, it } from 'vitest';
import {
  decideReplacement,
  deferredSyncRetry,
  hasUnfinishedPractice,
  installDatabase,
  isStaleClock,
  proposedCloseMinutes,
  type UnfinishedBlock,
  type UnfinishedRoutine,
} from './practiceSession';
import { createBlock, createInstrument } from './factories';
import { emptyDB } from './seed';
import type { PracticeDB } from './types';

const NOW = new Date('2026-06-18T12:00:00.000Z');

/**
 * A block being practised right now: 12 minutes into a 10-minute target. Past
 * its target, which is completely ordinary — practising past the target is
 * normal, so this is LIVE, not stale.
 */
function liveBlock(o: Partial<UnfinishedBlock> = {}): UnfinishedBlock {
  return { itemId: 'item-1', targetMinutes: 10, accumulatedSeconds: 12 * 60, running: true, ...o };
}

/** The same block paused — genuinely elapsed minutes, no live timestamp. */
function pausedBlock(): UnfinishedBlock {
  return liveBlock({ running: false });
}

/** A clock left running overnight: eight hours against a ten-minute target. */
function staleBlock(): UnfinishedBlock {
  return liveBlock({ accumulatedSeconds: 8 * 3600 });
}

function routine(o: Partial<UnfinishedRoutine> = {}): UnfinishedRoutine {
  return { routineId: 'routine-1', accumulatedSeconds: 5 * 60, running: true, ...o };
}

const NOTHING = { active: null, activeRoutine: null };

// --- A1: nothing replaces an unfinished session -------------------------------
//
// `active` lives outside `db`, so the revision counter never bumps while you
// practise; a mid-block device therefore looks UNCHANGED to the hash
// comparison, a remote change resolves to a straight pull, and importDB nulls
// `active`. Committed data is archived first — the in-flight block is not.
//
// The invariant is UNCONDITIONAL. Only PRESENCE decides: running or paused,
// fresh or stale, ordinary or routine. An earlier draft let a stale clock stop
// deferring, which would have promoted a heuristic about a DURATION into an
// authority to destroy practice — a session paused at three genuine hours
// crosses any sensible threshold.

describe('A1 · a replacement never destroys an unfinished practice session', () => {
  it('refuses a replacement for a running, a paused, and a stale unfinished session alike', () => {
    const cases: { why: string; session: { active: UnfinishedBlock | null; activeRoutine: UnfinishedRoutine | null } }[] = [
      { why: 'running ordinary block', session: { active: liveBlock(), activeRoutine: null } },
      { why: 'PAUSED block — pausing protects, it does not expose', session: { active: pausedBlock(), activeRoutine: null } },
      { why: 'STALE block — an implausible duration is never permission to discard', session: { active: staleBlock(), activeRoutine: null } },
      { why: 'running routine', session: { active: null, activeRoutine: routine() } },
      { why: 'paused routine', session: { active: null, activeRoutine: routine({ running: false }) } },
      {
        why: 'the frozen dual pair the persist merge produces — unfinished practice like any other',
        session: { active: pausedBlock(), activeRoutine: routine({ running: false }) },
      },
    ];

    for (const c of cases) {
      expect(hasUnfinishedPractice(c.session), c.why).toBe(true);
      expect(decideReplacement({ intent: 'deliberate', session: c.session }).outcome, c.why).toBe('refuse');
      expect(decideReplacement({ intent: 'automatic', session: c.session }).outcome, c.why).toBe('defer');
    }
  });

  it('allows a replacement when no unfinished practice session exists', () => {
    expect(hasUnfinishedPractice(NOTHING)).toBe(false);
    expect(decideReplacement({ intent: 'deliberate', session: NOTHING }).outcome).toBe('proceed');
    expect(decideReplacement({ intent: 'automatic', session: NOTHING }).outcome).toBe('proceed');
    // Nothing to say when nothing is in the way.
    expect(decideReplacement({ intent: 'deliberate', session: NOTHING }).message).toBe('');
  });

  it('reaches the same replacement decision for a stale session as for a live one', () => {
    // The two inputs genuinely differ — 12 minutes against 8 hours, one of
    // which `isStaleClock` calls stale — and the decision must not.
    const live = { active: liveBlock(), activeRoutine: null };
    const stale = { active: staleBlock(), activeRoutine: null };
    expect(isStaleClock(live.active.accumulatedSeconds, live.active.targetMinutes)).toBe(false);
    expect(isStaleClock(stale.active.accumulatedSeconds, stale.active.targetMinutes)).toBe(true);

    for (const intent of ['automatic', 'deliberate'] as const) {
      expect(decideReplacement({ intent, session: stale })).toEqual(decideReplacement({ intent, session: live }));
    }
  });

  it('defers automatic sync but returns an explicit refusal for a deliberate replacement', () => {
    const session = { active: liveBlock(), activeRoutine: null };
    const auto = decideReplacement({ intent: 'automatic', session, labels: { itemTitle: 'درآمد ماهور' } });
    const deliberate = decideReplacement({ intent: 'deliberate', session, labels: { itemTitle: 'درآمد ماهور' } });

    // A background merge waiting its turn is not a failure, and not silent.
    expect(auto.outcome).toBe('defer');
    expect(auto.message).toContain('درآمد ماهور');
    // A deliberate Import / Restore archive / Keep remote is told out loud —
    // never a silent no-op that looks like a broken button, never a silent
    // discard. Both name the session that is in the way.
    expect(deliberate.outcome).toBe('refuse');
    expect(deliberate.message).toContain('درآمد ماهور');
    expect(deliberate.outcome).not.toBe(auto.outcome);
  });

  it('names the blocking session neutrally rather than fabricating a title', () => {
    const noTitle = decideReplacement({ intent: 'deliberate', session: { active: liveBlock(), activeRoutine: null } });
    expect(noTitle.message).toContain('a practice block');
    const r = decideReplacement({ intent: 'deliberate', session: { active: null, activeRoutine: routine() } });
    expect(r.message).toContain('a routine');
  });
});

// --- The deferred sync really resumes ----------------------------------------
//
// The trigger is the blocking condition CLEARING, not an incidental database
// write. closeSession writes a block and bumps `rev`; cancelSession is a bare
// `set({ active: null })` that writes nothing at all. Watching `rev` would
// resume after a finish and wait forever after a discard.

describe('a deferred sync resumes when the blocking session clears', () => {
  it('resumes a deferred sync when the session clears, whether it was finished or discarded', () => {
    const item = 'item-1';
    const block = createBlock(
      { practiceItemId: item, instrumentId: 'setar', durationMinutes: 12, mode: 'repair', focus: 'tone', result: 'slightly_better', startedAt: NOW.toISOString() },
      NOW,
    );

    // Practising, sync deferred.
    const practising = { active: liveBlock(), activeRoutine: null, blocks: [], rev: 4 };
    // FINISHED: a block was written, so the revision counter moved.
    const finished = { active: null, activeRoutine: null, blocks: [block], rev: 5 };
    // DISCARDED: nothing was written at all, so the revision counter did NOT.
    // This is the half the rev-watching design silently failed.
    const discarded = { active: null, activeRoutine: null, blocks: [], rev: 4 };
    expect(discarded.rev).toBe(practising.rev);
    expect(discarded.blocks).toHaveLength(0);
    expect(finished.rev).not.toBe(practising.rev);

    for (const [why, after] of [['finished', finished], ['discarded', discarded]] as const) {
      expect(
        deferredSyncRetry({
          pending: true,
          wasUnfinished: hasUnfinishedPractice(practising),
          isUnfinished: hasUnfinishedPractice(after),
        }),
        why,
      ).toBe(true);
    }
  });

  it('does not fire without a pending deferral, and not while practice is still unfinished', () => {
    expect(deferredSyncRetry({ pending: false, wasUnfinished: true, isUnfinished: false })).toBe(false);
    expect(deferredSyncRetry({ pending: true, wasUnfinished: true, isUnfinished: true })).toBe(false);
    // An ordinary load with no session must not read as a transition.
    expect(deferredSyncRetry({ pending: true, wasUnfinished: false, isUnfinished: false })).toBe(false);
  });
});

// --- A2: honest minutes ------------------------------------------------------

describe('A2 · an abandoned clock never writes practice that did not happen', () => {
  it('proposes the target for an abandoned block and the real elapsed minutes for an overrun one', () => {
    // Abandoned: eight hours against a ten-minute target. Propose the target,
    // not the fabricated gap that would otherwise poison the item's totals,
    // the instrument balance, the Teacher Report and every insight forever.
    const abandoned = proposedCloseMinutes(8 * 3600, 10);
    expect(abandoned.stale).toBe(true);
    expect(abandoned.minutes).toBe(10);

    // Genuinely overrun: twenty minutes past a ten-minute target. Practising
    // past the target is completely ordinary and still proposes the real time.
    const overrun = proposedCloseMinutes(30 * 60, 10);
    expect(overrun.stale).toBe(false);
    expect(overrun.minutes).toBe(30);
  });

  it('judges a short block against the floor and a long one against the multiple', () => {
    // A 10-minute target is not abandoned at 40 minutes (4× target) — the
    // absolute floor is what decides a short block.
    expect(isStaleClock(40 * 60, 10)).toBe(false);
    // A 90-minute target is not abandoned at 3 hours either — the multiple is
    // what decides a long one, and 3h is only 2× its target.
    expect(isStaleClock(3 * 3600, 90)).toBe(false);
    // Both thresholds crossed.
    expect(isStaleClock(9 * 3600, 90)).toBe(true);
  });
});

// --- A8: installing a new database leaves nothing pointing at the old one -----

describe('A8 · installing a replacement database clears the state that pointed at the old one', () => {
  function dbWith(instrumentIds: string[]): PracticeDB {
    return {
      ...emptyDB(),
      instruments: instrumentIds.map((id) => ({ ...createInstrument({ name: id }, NOW), id })),
    };
  }

  it('clears the running plan and drops a session instrument the new database lacks, keeping one it has', () => {
    const incoming = dbWith(['setar']);

    // Dropped: the new database has no such instrument, so keeping it would
    // scope Today to something that no longer exists.
    const dangling = installDatabase({ db: incoming, sessionInstrumentId: 'guitar' });
    expect(dangling.sessionInstrumentId).toBeNull();

    // Kept: it still resolves, so there is nothing dangling about it.
    expect(installDatabase({ db: incoming, sessionInstrumentId: 'setar' }).sessionInstrumentId).toBe('setar');
    // Kept: the cross-instrument overview is not an instrument reference.
    expect(installDatabase({ db: incoming, sessionInstrumentId: 'all' }).sessionInstrumentId).toBe('all');

    // Cleared in the SAME object as the new db — which is what makes it
    // impossible for importDB, resetDemo or clearAll to install a database
    // without the reset. (The Node environment cannot import useStore.ts, so
    // the function's SHAPE is what protects the wiring; the manual:OWNER check
    // exercises all three on device.)
    expect(dangling.activePlan).toBeNull();
    expect(dangling.active).toBeNull();
    expect(dangling.activeRoutine).toBeNull();
    expect(dangling.notNow).toEqual({ date: '', ids: [] });
    expect(dangling.db).toBe(incoming);
  });

  it('cannot return a database without the ephemeral reset beside it', () => {
    // The signature is the guarantee: every key the store must set arrives
    // together, so `set(installDatabase(...))` is the whole operation.
    const result = installDatabase({ db: dbWith(['setar']), sessionInstrumentId: null });
    expect(Object.keys(result).sort()).toEqual(
      ['active', 'activePlan', 'activeRoutine', 'db', 'notNow', 'sessionInstrumentId'].sort(),
    );
  });
});
