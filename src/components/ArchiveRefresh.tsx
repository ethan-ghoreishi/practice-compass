import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { fetchPublishedIndex, type FetchedIndex } from '../store/archiveIndex';
import { getNasBaseUrl } from '../store/backup';
import {
  SETAR_ARCHIVE_ID,
  archiveFor,
  describeArchiveAccess,
  archiveRootUrl,
  decisionMatchesSuggestion,
  type ImportPlan,
  type MetadataField,
  type ReconcileDecision,
} from '../domain';

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
// "last scanned".
// ---------------------------------------------------------------------------

type Phase =
  | { kind: 'idle' }
  | { kind: 'working' }
  | { kind: 'error'; message: string }
  | { kind: 'done'; message: string; plan?: ImportPlan }
  | { kind: 'preview'; fetched: FetchedIndex; rev: number; plan: ImportPlan };

export default function ArchiveRefresh() {
  const db = useStore((s) => s.db);
  const preview = useStore((s) => s.previewArchiveImport);
  const commit = useStore((s) => s.commitArchiveImport);
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  const [decisions, setDecisions] = useState<ReconcileDecision[]>([]);
  const [instrumentId, setInstrumentId] = useState<string>('');

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

  function showPlan(fetched: FetchedIndex, nextDecisions: ReconcileDecision[]) {
    const { plan, rev } = preview({
      index: fetched.index,
      instrumentId: chosen,
      decisions: nextDecisions,
      verifiedBase: rootUrl ?? undefined,
    });
    setPhase({ kind: 'preview', fetched, rev, plan });
  }

  async function startRefresh() {
    if (!chosen) {
      setPhase({ kind: 'error', message: 'Choose which instrument this archive belongs to first.' });
      return;
    }
    setPhase({ kind: 'working' });
    setDecisions([]);
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
        // question, or the suggestion's real current value, as it is now.
        const kept = result.staleDecisions?.length
          ? decisions.filter((d) => !result.staleDecisions!.includes(d))
          : decisions;
        setDecisions(kept);
        showPlan(fetched, kept);
        setPhase((p) => (p.kind === 'preview' ? p : { kind: 'error', message: result.message }));
        return;
      }
      setPhase({ kind: 'error', message: result.message });
      return;
    }
    setPhase({ kind: 'done', message: result.message, plan: phase.plan });
  }

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
          Brings in classes, pieces and their material from the archive index published by the NAS scanner. Your
          practice, notes and schedule are never changed by it.
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
          {phase.plan && <Summary plan={phase.plan} />}
        </div>
      )}

      {phase.kind === 'preview' && (
        <div className="stack-sm">
          <Summary plan={phase.plan} />

          {phase.plan.questions.length > 0 && (
            <div className="stack-sm">
              <div className="section-label">Needs a decision</div>
              {phase.plan.questions.map((q) => (
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

          {phase.plan.suggestions.length > 0 && (
            <div className="stack-sm">
              <div className="section-label">The archive knows more about these</div>
              {/* A registry improvement to a piece the owner ALREADY has. It is
                  offered field by field and applied only when asked — never
                  written behind them, and never near their notebook. */}
              {phase.plan.suggestions.map((sg) => {
                // The PREMISE is part of the match: a choice made against a
                // value the owner has since edited is no longer this
                // suggestion's answer, so the button reads unpressed again.
                const applied = decisions.some((d) => decisionMatchesSuggestion(d, sg));
                return (
                  <div key={`${sg.pieceKey}-${sg.field}`} className="list-row stack-sm">
                    <div dir="auto" style={{ textAlign: 'start' }}>
                      <strong>{sg.pieceKey}</strong>
                      <div className="tiny faint">
                        <span dir="ltr">{FIELD_LABELS[sg.field]}: </span>
                        <span dir="auto">{sg.from || '—'}</span>
                        <span dir="ltr"> → </span>
                        <span dir="auto">{sg.to}</span>
                      </div>
                    </div>
                    <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn-sm"
                        aria-pressed={applied}
                        onClick={() =>
                          decide({
                            kind: 'apply-field',
                            pieceKey: sg.pieceKey,
                            // The RECORD the value was shown against, not just
                            // the piece: a rebase must not hand the answer to
                            // whichever item happens to hold that piece later.
                            itemId: sg.itemId,
                            field: sg.field,
                            from: sg.from,
                          })
                        }
                      >
                        {applied ? `Archive’s ${FIELD_LABELS[sg.field]} chosen` : `Use the archive’s ${FIELD_LABELS[sg.field]}`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="row" style={{ gap: 8 }}>
            <button type="button" className="btn btn-primary" onClick={() => void apply()}>
              {phase.plan.summary.unchanged ? 'Already current' : 'Apply'}
            </button>
            <button type="button" className="btn" onClick={() => setPhase({ kind: 'idle' })}>
              Cancel
            </button>
          </div>
          <p className="tiny faint" style={{ textAlign: 'start' }}>
            <span dir="ltr">
              New pieces arrive resting, so today’s suggestions are not flooded. They stay searchable and you can start
              one directly whenever you like.
            </span>
          </p>
        </div>
      )}
    </section>
  );
}

function Summary({ plan }: { plan: ImportPlan }) {
  const s = plan.summary;
  const [open, setOpen] = useState(false);
  return (
    <div className="stack-sm">
      <div className="tiny" style={{ textAlign: 'start' }}>
        <span dir="ltr">
          {s.unchanged
            ? 'Already current.'
            : `Added ${s.addedItems} pieces and ${s.addedLessons} classes · Updated ${s.updatedLessons} · ${s.questions} to decide · ${s.attention} needing attention`}
        </span>
      </div>
      {plan.attention.length > 0 && (
        <div className="tiny" style={{ textAlign: 'start' }}>
          <button type="button" className="link tiny" style={LINK_BTN} onClick={() => setOpen((o) => !o)}>
            {open ? 'Hide details' : `Show ${plan.attention.length} needing attention`}
          </button>
          {open && (
            <ul className="tiny faint stack-sm" style={{ marginTop: 6, listStyle: 'none', padding: 0 }}>
              {plan.attention.map((d, i) => (
                <li key={`${d.path}-${i}`} className="row" dir="auto" style={{ gap: 6, textAlign: 'start' }}>
                  <span>{d.path}</span>
                  <span dir="ltr">— {d.reason}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function sameTarget(a: ReconcileDecision, b: ReconcileDecision): boolean {
  // A FIELD decision is keyed by its field, not merely its piece: keyed by
  // piece alone, choosing a composer evicted the dastgāh choice made a moment
  // earlier, and either one evicted a Link/Skip answer about the same piece.
  const key = (d: ReconcileDecision) =>
    d.kind === 'apply-field'
      ? `field:${d.pieceKey}:${d.itemId}:${d.field}`
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
