import { useMemo, useState, type ReactNode } from 'react';
import { useStore } from '../store/useStore';
import {
  ITEM_STATUS_LABELS,
  SETAR_ARCHIVE_ID,
  archiveFor,
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

function show(db: PracticeDB, v: SetupValue | undefined): string {
  if (!v) return '—';
  if ('status' in v) return ITEM_STATUS_LABELS[v.status];
  if ('itemType' in v) return `${KIND[v.itemType] ?? v.itemType}${v.gusheh ? ` · ${v.gusheh}` : ''}`;
  if ('stageId' in v) {
    const st = v.stageId ? db.pathwayStages.find((s) => s.id === v.stageId) : undefined;
    return v.stageId ? (st ? `${st.code}${st.title !== st.code ? ` · ${st.title}` : ''}` : 'another stage') : 'not placed';
  }
  if ('materialId' in v) {
    if (!v.materialId) return 'none';
    if (v.materialId.startsWith('new:')) return 'a new study source';
    return db.materials.find((m) => m.id === v.materialId)?.title ?? 'another study source';
  }
  if ('catalogRefs' in v) return v.catalogRefs?.length ? `answers ${v.catalogRefs.length}` : 'answers none';
  return v.linked ? 'linked' : 'unlinked';
}

const same = (a: unknown, b: unknown) => canonicalStringify(a) === canonicalStringify(b);

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
  // id → the value chosen (null: deliberately left as it is).
  const [choices, setChoices] = useState<Record<string, SetupValue | null>>({});
  // The rows SHOWN when the owner started choosing: only these may be
  // selected by default — a row that arrives later is shown, never auto-joined.
  const [seen, setSeen] = useState<Set<string> | null>(null);

  const context: SetupContext = useMemo(
    () => ({ instrumentId, ...(pathwayId ? { pathwayId } : {}), sources }),
    [instrumentId, pathwayId, sources],
  );
  const plan = useMemo(() => (instrumentId ? planSetarSetup(db, context) : null), [db, context, instrumentId]);
  // Derived once per review (React's guarded set-during-render pattern).
  if (plan && !seen) setSeen(new Set(plan.proposals.map((p) => p.id)));

  const restart = () => {
    setChoices({});
    setSeen(null);
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

  const chosenFor = (p: SetupProposal): SetupValue | undefined => {
    if (p.id in choices) return choices[p.id] ?? undefined;
    return p.state === 'proposed' && seen?.has(p.id) ? p.after : undefined;
  };
  const choose = (id: string, v: SetupValue | null) => setChoices((c) => ({ ...c, [id]: v }));
  const status = plan.proposals.filter((p) => p.field === 'status');
  const rows = plan.proposals.filter((p) => p.field !== 'status');
  const byItem = new Map<ID, SetupProposal[]>();
  for (const p of rows) byItem.set(p.itemId, [...(byItem.get(p.itemId) ?? []), p]);
  const selections: SetupSelection[] = plan.proposals.flatMap((p) => {
    const after = chosenFor(p);
    return after && !same(after, p.before) ? [{ id: p.id, before: p.before, after }] : [];
  });
  const title = (id: ID) => db.items.find((i) => i.id === id)?.title ?? id;

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
          onClick={() =>
            setChoices((c) => {
              const next = { ...c };
              for (const p of status) if (p.state !== 'correct' && !/—/.test(p.evidence)) next[p.id] = p.choices[0]!.after;
              return next;
            })
          }
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
                onChange={(e) => choose(p.id, e.target.checked ? p.choices[0]!.after : null)}
              />
              <span className="small grow" style={{ textAlign: 'start' }}>
                <span dir="auto">{title(p.itemId)}</span>{' '}
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
            <div key={itemId} className="card card-quiet stack-sm" role="group" aria-label={`Setup of ${title(itemId)}`}>
              <strong className="small" dir="auto" style={{ textAlign: 'start' }}>
                {title(itemId)}
              </strong>
              {open.map((p) => (
                <div key={p.id} className="stack-sm">
                  <div className="tiny" style={{ textAlign: 'start' }}>
                    <span dir="ltr">
                      {FIELD[p.field]}: {show(db, p.before)}
                      {p.state === 'proposed' ? ` → ${show(db, p.after)}` : ''}
                    </span>
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
                        onChange={(e) => choose(p.id, e.target.checked ? p.after! : null)}
                      />
                      <span dir="ltr">Apply</span>
                    </label>
                  ) : p.choices.length ? (
                    <select
                      className="input"
                      aria-label={`${FIELD[p.field]} of ${title(itemId)}`}
                      value={p.choices.findIndex((c) => same(c.after, chosenFor(p)))}
                      onChange={(e) => {
                        const i = Number(e.target.value);
                        choose(p.id, i < 0 ? null : p.choices[i]!.after);
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
        <button
          type="button"
          className="btn btn-primary"
          disabled={selections.length === 0}
          onClick={() => {
            const key = canonicalStringify(selections);
            saves.run('setup', key, () => commit({ context, selections }), {
              current: () => key,
              again: () => undefined,
              saved: () => {
                setChoices({});
                setSeen(null);
                // A study source made here is named from now on, so a rerun
                // reads it as done rather than making another.
                setSources((s) =>
                  Object.fromEntries(
                    Object.entries(s).map(([k, v]) => {
                      if (!('create' in v)) return [k, v];
                      const madeFor = selections.find((x) => x.id.startsWith('source:'));
                      const id = madeFor ? useStore.getState().db.items.find((i) => i.id === madeFor.id.split(':')[1])?.materialId : undefined;
                      return [k, id ? { materialId: id } : v];
                    }),
                  ),
                );
              },
            });
          }}
        >
          Apply {selections.length} selected
        </button>
        <SaveStatus
          ack={saves.states.setup}
          onRetry={() => saves.run('setup', saves.states.setup!.carried, () => commit({ context, selections }))}
        />
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
