import { useMemo, useRef, useState, type ReactNode } from 'react';
import { useStore } from '../store/useStore';
import {
  ITEM_STATUS_LABELS,
  SETAR_ARCHIVE_ID,
  archiveFor,
  setupSourceId,
  canonicalStringify,
  planSetarSetup,
  type ID,
  type PracticeDB,
  type SetupContext,
  type SetupProposal,
  type SetupSelection,
  type SetupValue,
} from '../domain';
import { SaveStatus, useAcknowledgedSaves } from './ui';

// ---------------------------------------------------------------------------
// "Review Setar setup" — an optional look at how the current Setar library is
// organised against the evidence the archive holds. It never runs on its own:
// the owner opens it, picks the instrument and pathway, reads each row's
// evidence, and applies exactly the rows they selected, in one save.
// ---------------------------------------------------------------------------

const FIELD: Record<SetupProposal['field'], string> = {
  status: 'Status',
  kind: 'Kind',
  stage: 'Place',
  source: 'Study source',
  reference: 'Suggestion',
  class: 'Class',
};

const KIND: Record<string, string> = {
  gusheh: 'gusheh (radif)',
  full_piece: 'composed piece',
  exercise: 'exercise / étude',
  improvisation: 'improvisation',
};

/** A value as text, split into generated English and the owner's own words. */
type Part = { text: string; authored?: boolean };
function parts(db: PracticeDB, v: SetupValue | undefined): Part[] {
  if (!v) return [{ text: '—' }];
  if ('status' in v) return [{ text: ITEM_STATUS_LABELS[v.status] }];
  if ('itemType' in v) return [{ text: `${KIND[v.itemType] ?? v.itemType}${v.gusheh ? ' · ' : ''}` }, ...(v.gusheh ? [{ text: v.gusheh, authored: true }] : [])];
  if ('stageId' in v) {
    if (!v.stageId) return [{ text: 'not placed' }];
    const st = db.pathwayStages.find((s) => s.id === v.stageId);
    return st ? [{ text: `${st.code}${st.title !== st.code ? ` · ${st.title}` : ''}`, authored: true }] : [{ text: 'another stage' }];
  }
  if ('materialId' in v) {
    if (!v.materialId) return [{ text: 'none' }];
    if (v.materialId.startsWith('new:')) return [{ text: 'a new study source' }];
    const title = db.materials.find((m) => m.id === v.materialId)?.title;
    return title ? [{ text: title, authored: true }] : [{ text: 'another study source' }];
  }
  if ('catalogRefs' in v) return [{ text: v.catalogRefs?.length ? `answers ${v.catalogRefs.length}` : 'answers none' }];
  return [{ text: v.linked ? 'linked' : 'unlinked' }];
}
const show = (db: PracticeDB, v: SetupValue | undefined): string => parts(db, v).map((x) => x.text).join('');

/** The same value for the screen: generated English isolated LTR, the owner's words each resolving their own direction. */
function Value({ db, v }: { db: PracticeDB; v: SetupValue | undefined }) {
  return (
    <>
      {parts(db, v).map((x, i) =>
        x.authored ? (
          <span key={i} dir="auto">
            {x.text}
          </span>
        ) : (
          <span key={i} dir="ltr">
            {x.text}
          </span>
        ),
      )}
    </>
  );
}

const same = (a: unknown, b: unknown) => canonicalStringify(a) === canonicalStringify(b);

/** What the owner chose AND the value they saw when they chose it — the premise a commit is checked against. */
type Pick = { before: SetupValue; after: SetupValue };
interface Draft {
  /** id → the pick (null: deliberately left as it is). */
  choices: Record<string, Pick | null>;
  /** The rows SHOWN when choosing began, with the premise they were shown with: only these may be selected by default — a row that arrives later is shown, never auto-joined. */
  seen: Record<string, Pick> | null;
}

const selectionsOf = (d: Draft): SetupSelection[] =>
  [...new Set([...Object.keys(d.seen ?? {}), ...Object.keys(d.choices)])].flatMap((id) => {
    const pick = id in d.choices ? d.choices[id] : d.seen?.[id];
    return pick && !same(pick.after, pick.before) ? [{ id, before: pick.before, after: pick.after }] : [];
  });

export default function SetarSetupReview() {
  const db = useStore((s) => s.db);
  const commit = useStore((s) => s.commitSetarSetup);
  const saves = useAcknowledgedSaves();
  const archive = archiveFor(db, SETAR_ARCHIVE_ID);
  // Identity is never read off a name: the archive's own instrument when there
  // is one, otherwise the owner picks.
  const [instrumentId, setInstrumentId] = useState<ID>(archive?.instrumentId ?? '');
  const [pathwayId, setPathwayId] = useState<ID>('');
  const [sources, setSources] = useState<NonNullable<SetupContext['sources']>>({});
  // The draft is written by the handlers (state for the screen, a ref for the
  // save that settles later) — never mirrored from an effect.
  const [draft, setDraftState] = useState<Draft>({ choices: {}, seen: null });
  const draftRef = useRef(draft);
  const setDraft = (next: Draft) => {
    draftRef.current = next;
    setDraftState(next);
  };

  const context: SetupContext = useMemo(
    () => ({ instrumentId, ...(pathwayId ? { pathwayId } : {}), sources }),
    [instrumentId, pathwayId, sources],
  );
  const plan = useMemo(() => (instrumentId ? planSetarSetup(db, context) : null), [db, context, instrumentId]);
  // Derived once per review (React's guarded set-during-render pattern): each
  // proposed row is selected with the premise it is SHOWN with.
  if (plan && !draft.seen) {
    setDraft({
      ...draft,
      seen: Object.fromEntries(plan.proposals.flatMap((p) => (p.state === 'proposed' && p.after ? [[p.id, { before: p.before, after: p.after }]] : []))),
    });
  }

  const restart = () => {
    setDraft({ choices: {}, seen: null });
    saves.reset('setup');
  };

  if (!plan) {
    return (
      <SetupShell>
        <label className="tiny" style={{ textAlign: 'start' }}>
          <span dir="ltr">Which instrument is your Setar?</span>
          <select className="input" value={instrumentId} onChange={(e) => (setInstrumentId(e.target.value), restart())}>
            <option value="">Choose…</option>
            {db.instruments.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </label>
      </SetupShell>
    );
  }

  const chosenFor = (p: SetupProposal): Pick | undefined => (p.id in draft.choices ? (draft.choices[p.id] ?? undefined) : draft.seen?.[p.id]);
  // The pick carries what the owner SAW (`p.before` NOW is what the store checks it against).
  const choose = (p: SetupProposal, after: SetupValue | null) =>
    setDraft({ ...draftRef.current, choices: { ...draftRef.current.choices, [p.id]: after ? { before: p.before, after } : null } });
  const status = plan.proposals.filter((p) => p.field === 'status');
  const rows = plan.proposals.filter((p) => p.field !== 'status');
  const byItem = new Map<ID, SetupProposal[]>();
  for (const p of rows) byItem.set(p.itemId, [...(byItem.get(p.itemId) ?? []), p]);
  const selections = selectionsOf(draft);
  const title = (id: ID) => db.items.find((i) => i.id === id)?.title ?? id;

  // ONE save, for what is on screen NOW: the settle reads the live draft, so a
  // second item chosen while this write is pending is written next, never cleared.
  const save = () => {
    const sent = selectionsOf(draftRef.current);
    saves.run('setup', canonicalStringify(sent), () => commit({ context, selections: sent }), {
      current: () => canonicalStringify(selectionsOf(draftRef.current)),
      again: save,
      saved: () => {
        setDraft({ choices: {}, seen: null });
        // A source made here is, from now on, THAT group's source — each group
        // its own — so a rerun reads it as done rather than making another.
        const made = useStore.getState().db.materials;
        setSources((cur) =>
          Object.fromEntries(
            Object.entries(cur).map(([key, v]) => {
              const id = setupSourceId(instrumentId, key);
              return [key, 'create' in v && made.some((m) => m.id === id) ? { materialId: id } : v];
            }),
          ),
        );
      },
    });
  };

  return (
    <SetupShell>
      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        <label className="tiny grow" style={{ textAlign: 'start' }}>
          <span dir="ltr">Instrument</span>
          <select className="input" aria-label="Instrument to review" value={instrumentId} onChange={(e) => (setInstrumentId(e.target.value), restart())}>
            {db.instruments.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </label>
        <label className="tiny grow" style={{ textAlign: 'start' }}>
          <span dir="ltr">Pathway to place items in</span>
          <select className="input" aria-label="Pathway to place items in" value={pathwayId} onChange={(e) => (setPathwayId(e.target.value), restart())}>
            <option value="">Don’t place anything</option>
            {plan.pathways.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {plan.sourceGroups.map((g) => {
        const current = sources[g.key];
        const value = current ? ('create' in current ? 'create' : current.materialId) : '';
        return (
          <label key={g.key} className="tiny" style={{ textAlign: 'start' }}>
            <span dir="ltr">{g.kind === 'declared' ? 'The registry declares ' : 'Items answering the reference '}</span>
            <span dir="auto">«{g.label}»</span>
            <span dir="ltr"> for {g.itemIds.length} items — which study source is it?</span>
            <select
              className="input"
              aria-label={`Study source for ${g.label}`}
              value={value}
              onChange={(e) => {
                const v = e.target.value;
                setSources((s) => {
                  const next = { ...s };
                  if (!v) delete next[g.key];
                  else next[g.key] = v === 'create' ? { create: true } : { materialId: v };
                  return next;
                });
                restart();
              }}
            >
              <option value="">Not now</option>
              {plan.materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
              <option value="create">Create a new one named «{g.label}»</option>
            </select>
          </label>
        );
      })}

      <details className="card card-quiet stack-sm">
        <summary className="small">Keeping fresh — choose which items ({status.filter((p) => chosenFor(p)).length} chosen)</summary>
        <p className="tiny faint" style={{ textAlign: 'start' }}>
          <span dir="ltr">
            An item being in the archive says nothing about whether you have learned it, so none is chosen for you.
            Notes say why you might leave one out.
          </span>
        </p>
        <button
          type="button"
          className="btn btn-sm"
          style={{ alignSelf: 'flex-start' }}
          onClick={() => {
            const choices = { ...draftRef.current.choices };
            for (const p of status) if (p.state !== 'correct' && !/—/.test(p.evidence)) choices[p.id] = { before: p.before, after: p.choices[0]!.after };
            setDraft({ ...draftRef.current, choices });
          }}
        >
          Choose every item without a note
        </button>
        <ul className="stack-sm" role="list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {status.map((p) => (
            <li key={p.id} className="row" style={{ gap: 8 }}>
              <input
                type="checkbox"
                aria-label={`Keeping fresh: ${title(p.itemId)}`}
                disabled={p.state === 'correct'}
                checked={p.state === 'correct' || !!chosenFor(p)}
                onChange={(e) => choose(p, e.target.checked ? p.choices[0]!.after : null)}
              />
              <span className="small grow" dir="auto" style={{ textAlign: 'start' }}>
                <span>{title(p.itemId)}</span>{' '}
                <span className="tiny faint" dir="ltr">
                  {p.evidence}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </details>

      <div className="stack-sm">
        <div className="section-label">Organisation</div>
        {[...byItem.entries()].map(([itemId, ps]) => {
          const open = ps.filter((p) => p.state !== 'correct');
          if (open.length === 0) return null;
          return (
            <div key={itemId} className="card card-quiet stack-sm" role="group" dir="auto" aria-label={`Setup of ${title(itemId)}`} style={{ textAlign: 'start' }}>
              <strong className="small">{title(itemId)}</strong>
              {open.map((p) => (
                <div key={p.id} className="stack-sm">
                  <div className="tiny" style={{ textAlign: 'start' }}>
                    <span dir="ltr">{FIELD[p.field]}: </span>
                    <Value db={db} v={p.before} />
                    {p.state === 'proposed' ? (
                      <>
                        <span dir="ltr"> → </span>
                        <Value db={db} v={p.after} />
                      </>
                    ) : null}
                  </div>
                  <div className="tiny faint" style={{ textAlign: 'start' }}>
                    <span dir="ltr">{p.evidence}</span>
                  </div>
                  {p.state === 'proposed' ? (
                    <label className="tiny row" style={{ gap: 6 }}>
                      <input
                        type="checkbox"
                        aria-label={`${FIELD[p.field]} of ${title(itemId)}: ${show(db, p.after)}`}
                        checked={!!chosenFor(p)}
                        onChange={(e) => choose(p, e.target.checked ? p.after! : null)}
                      />
                      <span dir="ltr">Apply</span>
                    </label>
                  ) : p.choices.length ? (
                    <select
                      className="input"
                      aria-label={`${FIELD[p.field]} of ${title(itemId)}`}
                      value={p.choices.findIndex((c) => same(c.after, chosenFor(p)?.after))}
                      onChange={(e) => {
                        const i = Number(e.target.value);
                        choose(p, i < 0 ? null : p.choices[i]!.after);
                      }}
                    >
                      <option value={-1}>Leave it as it is</option>
                      {p.choices.map((c, i) => (
                        <option key={i} value={i}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  ) : null}
                </div>
              ))}
            </div>
          );
        })}
        <p className="tiny faint" style={{ textAlign: 'start' }}>
          <span dir="ltr">{rows.filter((p) => p.state === 'correct').length} already as the evidence says.</span>
        </p>
      </div>

      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary" disabled={selections.length === 0} onClick={save}>
          Apply {selections.length} selected
        </button>
        <SaveStatus ack={saves.states.setup} onRetry={save} />
        {saves.states.setup?.status === 'refused' ? (
          <button type="button" className="btn btn-sm" onClick={restart}>
            Look again
          </button>
        ) : null}
      </div>
    </SetupShell>
  );
}

function SetupShell({ children }: { children: ReactNode }) {
  return (
    <details className="card stack-sm">
      <summary>
        <span className="small" style={{ fontWeight: 600 }}>
          Review Setar setup
        </span>
      </summary>
      <p className="tiny faint" style={{ textAlign: 'start' }}>
        <span dir="ltr">
          An optional look at kinds, places, study sources and classes against the archive’s evidence. Nothing changes
          until you apply the rows you choose — never your notes, history, reviews or dates.
        </span>
      </p>
      {children}
    </details>
  );
}
