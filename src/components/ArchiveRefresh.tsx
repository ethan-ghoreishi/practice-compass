import { useMemo, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { fetchPublishedIndex, type FetchedIndex } from '../store/archiveIndex';
import { getNasBaseUrl } from '../store/backup';
import {
  SETAR_ARCHIVE_ID,
  archiveFor,
  describeArchiveAccess,
  archiveRootUrl,
  decisionMatchesSuggestion,
  archiveValueDecision,
  type ArchiveSource,
  type ImportPlan,
  type MetadataField,
  type MetadataSuggestion,
  type ReconcileDecision,
  type SourceSuppression,
} from '../domain';
import { SaveStatus, useAcknowledgedSaves } from './ui';

// ---------------------------------------------------------------------------
// "Refresh Setar archive" — the ONE routine action.
//
// No filesystem picker, no URL to type, no crawler output. It fetches the
// latest PUBLISHED index (a small JSON file the NAS scanner writes to its own
// branch of the private data repository), says what would change, asks only
// the questions that genuinely need an owner, and applies the lot in one go.
//
// It is deliberately honest about what it knows: the index was FETCHED at a
// device-local time and CHANGED when the scanner last published something
// different. Neither is proof that a scan ran recently, and this never says
// "last scanned" — Refresh reads what the NAS job last PUBLISHED; it never
// rescans the NAS.
// ---------------------------------------------------------------------------

/** The owner's runbook for every source declaration this screen can point to. */
const RUNBOOK = 'https://github.com/ethan-ghoreishi/practice-compass/blob/main/docs/setar-archive.md#7-when-refresh-says-something-needs-attention';

type Phase =
  | { kind: 'idle' }
  | { kind: 'working' }
  | { kind: 'error'; message: string }
  | { kind: 'done'; message: string; plan?: ImportPlan; commitSha?: string }
  | { kind: 'preview'; fetched: FetchedIndex; rev: number; plan: ImportPlan; notice?: string };

export default function ArchiveRefresh() {
  const db = useStore((s) => s.db);
  const preview = useStore((s) => s.previewArchiveImport);
  const commit = useStore((s) => s.commitArchiveImport);
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  const [decisions, setDecisions] = useState<ReconcileDecision[]>([]);
  const [instrumentId, setInstrumentId] = useState<string>('');
  const [reviewing, setReviewing] = useState(false);

  const source = archiveFor(db, SETAR_ARCHIVE_ID);
  // FIRST USE picks the instrument only when there is no doubt about it. An
  // archive already bound keeps its own instrument for good.
  const candidates = useMemo(
    () => db.instruments.filter((i) => i.active && (/setar/i.test(i.name) || i.name.includes('سه'))),
    [db.instruments],
  );
  const chosen = source?.instrumentId ?? (candidates.length === 1 ? candidates[0]!.id : instrumentId);

  const access = describeArchiveAccess({
    indexFetchedAt: phase.kind === 'preview' ? phase.fetched.fetchedAt.slice(0, 16).replace('T', ' ') : null,
    indexChangedAt: source ? source.acceptedAt.slice(0, 16).replace('T', ' ') : null,
    baseUrl: getNasBaseUrl(),
  });
  const rootUrl = archiveRootUrl(getNasBaseUrl());

  function showPlan(fetched: FetchedIndex, nextDecisions: ReconcileDecision[], notice?: string) {
    const { plan, rev } = preview({
      index: fetched.index,
      instrumentId: chosen,
      decisions: nextDecisions,
      verifiedBase: rootUrl ?? undefined,
    });
    setPhase({ kind: 'preview', fetched, rev, plan, ...(notice ? { notice } : {}) });
  }

  async function startRefresh() {
    if (!chosen) {
      setPhase({ kind: 'error', message: 'Choose which instrument this archive belongs to first.' });
      return;
    }
    setPhase({ kind: 'working' });
    setDecisions([]);
    setReviewing(false);
    const result = await fetchPublishedIndex();
    if (!result.ok) {
      setPhase({ kind: 'error', message: result.error });
      return;
    }
    showPlan(result.value, []);
  }

  function decide(next: ReconcileDecision) {
    if (phase.kind !== 'preview') return;
    const merged = [...decisions.filter((d) => !sameTarget(d, next)), next];
    setDecisions(merged);
    showPlan(phase.fetched, merged);
  }

  /** "Keep my value": withdraw the choice; Apply then keeps the owner's field. */
  function keepMine(sg: MetadataSuggestion) {
    if (phase.kind !== 'preview') return;
    const kept = decisions.filter((d) => !(d.kind === 'apply-field' && d.itemId === sg.itemId && d.field === sg.field));
    setDecisions(kept);
    showPlan(phase.fetched, kept);
  }

  async function apply() {
    if (phase.kind !== 'preview') return;
    const { fetched, rev } = phase;
    setPhase({ kind: 'working' });
    const result = await commit({
      index: fetched.index,
      instrumentId: chosen,
      decisions,
      verifiedBase: rootUrl ?? undefined,
      decidedFromRev: rev,
    });
    if (!result.ok) {
      if (result.status === 'stale') {
        // Something changed underneath; look again rather than apply a plan
        // that was decided against a database that has moved on. A decision
        // whose premise moved is DROPPED here — keeping it would re-submit the
        // same invalid answer for ever — and the fresh preview shows the
        // question, or the difference's real current value, as it is now.
        const kept = result.staleDecisions?.length
          ? decisions.filter((d) => !result.staleDecisions!.includes(d))
          : decisions;
        setDecisions(kept);
        // Said, never silent: the choice the owner made is no longer on screen.
        showPlan(fetched, kept, result.message);
        setPhase((p) => (p.kind === 'preview' ? p : { kind: 'error', message: result.message }));
        return;
      }
      setPhase({ kind: 'error', message: result.message });
      return;
    }
    setPhase({ kind: 'done', message: result.message, plan: phase.plan, commitSha: fetched.commitSha });
  }

  // A restore changes what a preview on screen was decided against: look again.
  const afterRestore = () => {
    if (phase.kind === 'preview') showPlan(phase.fetched, decisions);
  };

  const plan = phase.kind === 'preview' ? phase.plan : undefined;
  const standing = plan ? plan.differences.filter((d) => !d.fresh) : [];

  return (
    <section className="card stack-sm">
      <div className="row between">
        <h3 style={{ margin: 0 }}>Setar archive</h3>
        <button type="button" className="btn btn-sm btn-primary" onClick={() => void startRefresh()} disabled={phase.kind === 'working'}>
          {phase.kind === 'working' ? 'Working…' : 'Refresh Setar archive'}
        </button>
      </div>

      <p className="tiny faint" style={{ textAlign: 'start' }}>
        <span dir="ltr">
          Brings in classes, pieces and their material from the index the NAS job last published — it reads that
          index; it does not rescan the NAS. Your practice, notes and schedule are never changed by it.
        </span>
      </p>

      {!source && candidates.length !== 1 && (
        <label className="tiny" style={{ textAlign: 'start' }}>
          <span dir="ltr">Which instrument is this archive for?</span>
          <select className="input" value={instrumentId} onChange={(e) => setInstrumentId(e.target.value)}>
            <option value="">Choose…</option>
            {db.instruments.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="tiny faint" style={{ textAlign: 'start' }}>
        <div>
          <span dir="ltr">{access.index}</span>
        </div>
        {source && (
          <div>
            <span dir="ltr">Accepted index {source.indexHash.slice(0, 12)}</span>
          </div>
        )}
        <div>
          <span dir="ltr">{access.media}</span>
        </div>
        {rootUrl && (
          <a className="tiny" href={rootUrl} target="_blank" rel="noreferrer">
            Open archive root
          </a>
        )}
      </div>

      {phase.kind === 'error' && (
        <p className="tiny" style={{ color: 'var(--tone-alert)', textAlign: 'start' }} role="alert">
          <span dir="ltr">{phase.message}</span>
        </p>
      )}

      {phase.kind === 'done' && (
        <div className="tiny" aria-live="polite" style={{ textAlign: 'start' }}>
          <span dir="ltr">{phase.message}</span>
          {phase.plan && <Summary plan={phase.plan} done commitSha={phase.commitSha} />}
        </div>
      )}

      {phase.kind === 'preview' && phase.notice && (
        <p className="tiny" role="status" style={{ margin: 0, color: 'var(--tone-alert)' }}>
          {phase.notice}
        </p>
      )}
      {phase.kind === 'preview' && plan && (
        <div className="stack-sm">
          <Summary plan={plan} commitSha={phase.fetched.commitSha} />

          {plan.questions.length > 0 && (
            <div className="stack-sm">
              <div className="section-label">Needs a decision</div>
              {plan.questions.map((q) => (
                <div key={`${q.kind}-${q.pieceKey ?? q.sessionN}`} className="list-row stack-sm">
                  {/* The GROUP is the name and the sentence that belongs to it;
                      the fixed English buttons below sit OUTSIDE it, so a Farsi
                      piece name cannot claim their bidi base. */}
                  <div dir="auto" style={{ textAlign: 'start' }}>
                    <strong>{q.label}</strong>
                    <div className="tiny faint">
                      <span dir="ltr">
                        {q.kind === 'item'
                          ? 'An existing piece has this exact name.'
                          : 'More than one class matches this session.'}
                      </span>
                    </div>
                  </div>
                  <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                    {q.candidates.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="btn btn-sm"
                        onClick={() =>
                          decide(
                            q.kind === 'item'
                              ? { kind: 'link-item', pieceKey: q.pieceKey!, itemId: c.id }
                              : { kind: 'link-lesson', sessionN: q.sessionN!, lessonId: c.id },
                          )
                        }
                      >
                        Link to “{c.title}”
                      </button>
                    ))}
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() =>
                        decide(
                          q.kind === 'item'
                            ? { kind: 'create-item', pieceKey: q.pieceKey! }
                            : { kind: 'create-lesson', sessionN: q.sessionN! },
                        )
                      }
                    >
                      Create separately
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() =>
                        decide(
                          q.kind === 'item'
                            ? { kind: 'skip-item', pieceKey: q.pieceKey! }
                            : { kind: 'skip-lesson', sessionN: q.sessionN! },
                        )
                      }
                    >
                      Skip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {plan.suggestions.length > 0 && (
            <div className="stack-sm">
              <div className="section-label">Archive metadata differs</div>
              <p className="tiny faint" style={{ textAlign: 'start', margin: 0 }}>
                <span dir="ltr">
                  The registry changed these since this device last accepted the archive. Your value stays unless you
                  choose the archive’s.
                </span>
              </p>
              {plan.suggestions.map((sg) => (
                <DifferenceRow key={`${sg.itemId}-${sg.field}`} sg={sg} decisions={decisions} onUse={() => decide(archiveValueDecision(sg))} onKeep={() => keepMine(sg)} />
              ))}
            </div>
          )}

          {standing.length > 0 && (
            <div className="stack-sm">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ alignSelf: 'flex-start' }}
                aria-expanded={reviewing}
                onClick={() => setReviewing((r) => !r)}
              >
                {reviewing ? 'Hide differences' : `Review differences (${standing.length})`}
              </button>
              {reviewing && (
                <>
                  <p className="tiny faint" style={{ textAlign: 'start', margin: 0 }}>
                    <span dir="ltr">
                      Values you already have that differ from the registry, which has not changed them. Nothing here
                      changes unless you choose it.
                    </span>
                  </p>
                  {standing.map((sg) => (
                    <DifferenceRow key={`${sg.itemId}-${sg.field}`} sg={sg} decisions={decisions} onUse={() => decide(archiveValueDecision(sg))} onKeep={() => keepMine(sg)} />
                  ))}
                </>
              )}
            </div>
          )}

          <div className="row" style={{ gap: 8 }}>
            <button type="button" className="btn btn-primary" onClick={() => void apply()}>
              {plan.summary.unchanged ? 'Already current' : 'Apply'}
            </button>
            <button type="button" className="btn" onClick={() => setPhase({ kind: 'idle' })}>
              Cancel
            </button>
          </div>
          <p className="tiny faint" style={{ textAlign: 'start' }}>
            <span dir="ltr">
              Apply accepts the archive’s facts and keeps your own values except where you chose the archive’s. New
              pieces arrive resting, so today’s suggestions are not flooded; they stay searchable and you can start one
              directly whenever you like.
            </span>
          </p>
        </div>
      )}

      {source && <Recovery source={source} onRestored={afterRestore} />}
    </section>
  );
}

/** One field of one piece: the owner's value, the registry's, and the choice between them. */
function DifferenceRow({
  sg,
  decisions,
  onUse,
  onKeep,
}: {
  sg: MetadataSuggestion;
  decisions: ReconcileDecision[];
  onUse: () => void;
  onKeep: () => void;
}) {
  // The PREMISE is part of the match: a choice made against a value the owner
  // has since edited is no longer this difference's answer.
  const used = decisions.some((d) => decisionMatchesSuggestion(d, sg));
  return (
    <div className="list-row stack-sm">
      <div dir="auto" style={{ textAlign: 'start' }}>
        <strong>{sg.pieceKey}</strong>
        <div className="tiny faint">
          <span dir="ltr">{FIELD_LABELS[sg.field]} — yours: </span>
          <span dir="auto">{sg.from || '—'}</span>
          <span dir="ltr"> · archive: </span>
          <span dir="auto">{sg.to}</span>
          {sg.provisional && <span dir="ltr"> · the registry marks this identity provisional</span>}
        </div>
      </div>
      <div className="row" style={{ gap: 6, flexWrap: 'wrap' }} role="group" aria-label={`${FIELD_LABELS[sg.field]} of ${sg.pieceKey}`}>
        <button type="button" className="btn btn-sm btn-touch" aria-pressed={!used} onClick={onKeep}>
          Keep my value
        </button>
        <button type="button" className="btn btn-sm btn-touch" aria-pressed={used} onClick={onUse}>
          Use archive value
        </button>
      </div>
    </div>
  );
}

function Summary({ plan, done = false, commitSha }: { plan: ImportPlan; done?: boolean; commitSha?: string }) {
  const s = plan.summary;
  const [open, setOpen] = useState(false);
  const counts = [
    `${s.questions} to decide`,
    s.metadata ? `${s.metadata} archive change${s.metadata === 1 ? '' : 's'} to look at` : null,
    `${s.attention} needing attention`,
    s.suppressed ? `${s.suppressed} hidden or removed by you` : null,
  ].filter(Boolean);
  return (
    <div className="stack-sm">
      <div className="tiny" style={{ textAlign: 'start' }}>
        <span dir="ltr">
          {s.unchanged
            ? `Already current. ${counts.slice(1).join(' · ')}`
            : `${done ? 'Added' : 'Will add'} ${s.addedItems} pieces and ${s.addedLessons} classes · ${done ? 'Updated' : 'will update'} ${s.updatedLessons} · ${counts.join(' · ')}`}
        </span>
      </div>
      <div className="tiny faint" style={{ textAlign: 'start' }}>
        <span dir="ltr">
          Index {plan.indexHash.slice(0, 12)}
          {commitSha ? ` · published commit ${commitSha.slice(0, 7)}` : ''}
        </span>
      </div>
      {plan.attention.length > 0 && (
        <div className="tiny" style={{ textAlign: 'start' }}>
          <button type="button" className="link tiny" style={LINK_BTN} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {open ? 'Hide details' : `Show ${plan.attention.length} needing attention`}
          </button>
          {open && (
            <>
              <ul className="tiny faint stack-sm" style={{ marginTop: 6, listStyle: 'none', padding: 0 }}>
                {plan.attention.map((d, i) => (
                  <li key={`${d.path}-${i}`} className="row" dir="auto" style={{ gap: 6, textAlign: 'start' }}>
                    <span>{d.path}</span>
                    <span dir="ltr">— {d.reason}</span>
                  </li>
                ))}
              </ul>
              <p className="tiny faint" style={{ textAlign: 'start', margin: '6px 0 0' }}>
                <span dir="ltr">
                  These are the archive’s own words. A new piece, a class roster or a renamed file is declared in
                  PIECES.csv or RENAME-LOG.csv on the NAS — running the NAS job again changes nothing until then.{' '}
                </span>
                <a href={RUNBOOK} target="_blank" rel="noreferrer">
                  How to fix each one
                </a>
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * What the owner deleted, skipped, unlinked or hid — each one a decision a
 * refresh respects — listed so ONE of them can be lifted. Restoring lifts that
 * exact decision (its kind, its target and its item scope) and nothing else;
 * the next Refresh brings back what the archive still describes.
 */
function Recovery({ source, onRestored }: { source: ArchiveSource; onRestored: () => void }) {
  const items = useStore((s) => s.db.items);
  const restore = useStore((s) => s.restoreArchiveSuppression);
  const saves = useAcknowledgedSaves();
  // ONE outcome slot for the section, not one per row: a restored row leaves
  // the list the moment the store lifts it, and its Saving…/Not saved and Try
  // again must outlive it until storage has answered.
  const [last, setLast] = useState<{ target: Pick<SourceSuppression, 'kind' | 'ref' | 'itemId'>; label: string } | null>(null);
  // Restore removes its own row, button and all: keyboard focus moves to the
  // section's summary, which stays, instead of falling to the page.
  const summary = useRef<HTMLElement>(null);
  const rows = source.suppressions;
  if (rows.length === 0 && !last) return null;
  const run = (target: Pick<SourceSuppression, 'kind' | 'ref' | 'itemId'>, label: string) => {
    setLast({ target, label });
    saves.run('restore', label, () => restore(source.id, target), { current: () => label, again: () => undefined, saved: onRestored });
    summary.current?.focus();
  };
  // Generated English around ONE source value (a piece key, a class pair, a
  // path), each in its own isolate — the value resolves its own direction.
  const describe = (x: SourceSuppression): { lead: string; name: string; tail: string; owner?: string; there: boolean } => {
    if (x.kind === 'session') {
      return { lead: 'Class ', name: x.ref, tail: ' — deleted or skipped', there: source.sessions.some((s) => String(s.n) === x.ref && !s.unavailable) };
    }
    if (x.kind === 'piece') {
      return { lead: 'Piece ', name: x.ref, tail: ' — deleted or skipped', there: source.pieces.some((p) => p.key === x.ref && !p.unavailable) };
    }
    if (x.kind === 'link') {
      const n = x.ref.slice(0, x.ref.indexOf(':'));
      const key = x.ref.slice(x.ref.indexOf(':') + 1);
      return { lead: `Class ${n} and `, name: key, tail: ' — unlinked', there: source.sessions.some((s) => String(s.n) === n && s.members.some((m) => m.key === key)) };
    }
    const owner = x.itemId ? items.find((i) => i.id === x.itemId)?.title : undefined;
    return {
      lead: 'File ',
      name: x.ref,
      tail: x.itemId ? (owner ? ' — hidden on ' : ' — hidden on an item that no longer exists') : ' — hidden everywhere',
      // The item's title is the owner's text: its own isolate, never fused.
      ...(x.itemId && owner ? { owner } : {}),
      there: source.sessions.some((s) => s.resources.some((r) => r.path === x.ref && !r.unavailable)),
    };
  };
  return (
    <details className="card card-quiet stack-sm" open={last ? true : undefined}>
      <summary className="small" ref={summary}>
        Hidden and removed from the archive ({rows.length})
      </summary>
      {last && (
        <SaveStatus
          ack={saves.states.restore}
          subject={
            <>
              <span dir="ltr">Restore of </span>
              <span dir="auto">{last.label}</span>
              <span dir="ltr">: </span>
            </>
          }
          onRetry={() => run(last.target, last.label)}
        />
      )}
      <p className="tiny faint" style={{ textAlign: 'start' }}>
        <span dir="ltr">
          Restoring lifts that one decision; the next Refresh brings back what the archive still describes. Notes,
          links and files you deleted are not in the archive and cannot come back from it — restore those from a
          backup.{' '}
        </span>
        <a href={RUNBOOK} target="_blank" rel="noreferrer">
          The archive runbook
        </a>
      </p>
      <ul className="stack-sm" role="list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {rows.map((x) => {
          const key = `${x.kind}\u0000${x.ref}\u0000${x.itemId ?? ''}`;
          const { lead, name, tail, owner, there } = describe(x);
          const what = `${lead}${name}${tail}${owner ?? ''}`;
          return (
            <li key={key} className="row between" style={{ gap: 8, flexWrap: 'wrap' }}>
              <span className="small" style={{ textAlign: 'start' }}>
                <span dir="ltr">{lead}</span>
                <span dir="auto">{name}</span>
                <span dir="ltr">{tail}</span>
                {owner && <span dir="auto">{owner}</span>}
                <span className="tiny faint" dir="ltr">
                  {there ? ' · the archive still describes it' : ' · not described by the latest index'}
                </span>
              </span>
              <button type="button" className="btn btn-sm btn-touch" aria-label={`Restore ${what}`} onClick={() => run({ kind: x.kind, ref: x.ref, ...(x.itemId ? { itemId: x.itemId } : {}) }, what)}>
                Restore
              </button>
            </li>
          );
        })}
      </ul>
    </details>
  );
}

function sameTarget(a: ReconcileDecision, b: ReconcileDecision): boolean {
  // A FIELD decision is keyed by its record and field, not merely its piece:
  // keyed by piece alone, choosing a composer evicted the dastgāh choice made a
  // moment earlier, and either one evicted a Link/Skip answer about the same
  // piece.
  const key = (d: ReconcileDecision) =>
    d.kind === 'apply-field'
      ? `field:${d.itemId}:${d.field}`
      : 'pieceKey' in d
        ? `piece:${d.pieceKey}`
        : 'sessionN' in d
          ? `session:${d.sessionN}`
          : '';
  return key(a) === key(b) && key(a) !== '';
}

const LINK_BTN = { background: 'none', border: 'none', padding: 0 } as const;

/** Plain names for the registry fields an improvement can touch. */
const FIELD_LABELS: Record<MetadataField, string> = {
  dastgahAvaz: 'dastgāh',
  gusheh: 'gusheh',
  form: 'form',
  composer: 'composer',
};
