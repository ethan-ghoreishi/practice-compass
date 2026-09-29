import { useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  defaultSourceInstrument,
  MATERIAL_SOURCE_LABELS,
  MATERIAL_STATUS_LABELS,
  NEW_SOURCE_KINDS,
  sourceKindOptions,
  type Material,
  type MaterialSourceType,
  type MaterialStatus,
} from '../domain';
import { useStore } from '../store/useStore';
import { EmptyState, Field, SaveStatus, useAcknowledgedSaves } from '../components/ui';
import { recordToOptions } from '../components/options';
import { ArrowLeftIcon, FolderIcon, PlusIcon } from '../components/icons';

// A study source is the named book, collection or radif edition, course or
// teaching material a piece is studied FROM — not a person (Composer / maestro
// classifies the work), not a pathway (organisation) and not a lesson (linked
// separately). One name, a kind, a status and a free note. Fields this compact
// editor does not show (source name, parent title, section, teacher) are kept
// exactly as they are: a save only ever patches what is on screen.
interface Draft {
  id?: string;
  instrumentId: string;
  title: string;
  sourceType: MaterialSourceType;
  status: MaterialStatus;
  notes: string;
}

const STATUS_OPTIONS = recordToOptions(MATERIAL_STATUS_LABELS);

function emptyDraft(instrumentId: string): Draft {
  return { instrumentId, title: '', sourceType: 'other', status: 'active', notes: '' };
}

function fromMaterial(m: Material): Draft {
  return {
    id: m.id,
    instrumentId: m.instrumentId,
    title: m.title,
    sourceType: m.sourceType,
    status: m.status,
    notes: m.notes ?? '',
  };
}

export default function Materials() {
  const db = useStore((s) => s.db);
  const addMaterial = useStore((s) => s.addMaterial);
  const updateMaterial = useStore((s) => s.updateMaterial);
  const deleteMaterial = useStore((s) => s.deleteMaterial);
  const location = useLocation();
  const [params] = useSearchParams();
  const sessionInstrumentId = useStore((s) => s.sessionInstrumentId);
  const from = (location.state as { from?: string } | null)?.from ?? '/repertoire';
  // A new source starts on the instrument being browsed (or practised); never
  // a required choice, and never written back anywhere.
  const newSourceInstrument = defaultSourceInstrument(params.get('instrument') ?? sessionInstrumentId, db.instruments);

  const [draft, setDraftState] = useState<Draft | null>(null);
  // The live draft, readable when a write settles — a ref, never a render's copy.
  const draftRef = useRef<Draft | null>(null);
  const setDraft = (next: Draft | null) => {
    draftRef.current = next;
    setDraftState(next);
  };
  // "Saved." waits for IndexedDB and speaks only for the draft it wrote; the
  // editor closes only then. A failed write keeps it open with Try again, a
  // refusal (a course key already held there) says why. Deleted sources keep
  // their outcome here, since their row is gone.
  const saves = useAcknowledgedSaves();
  const [deleted, setDeleted] = useState<Record<string, string>>({});
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const itemCount = (materialId: string) => db.items.filter((i) => i.materialId === materialId).length;

  const draftKey = () => JSON.stringify(draftRef.current && { ...draftRef.current, id: undefined });

  function save() {
    const current = draftRef.current;
    if (!current || !current.title.trim()) return;
    const carried = draftKey();
    saves.run(
      'draft',
      carried,
      () => {
        const payload = {
          instrumentId: current.instrumentId,
          title: current.title.trim(),
          sourceType: current.sourceType,
          status: current.status,
          notes: current.notes.trim() || undefined,
        };
        if (current.id) return updateMaterial(current.id, payload);
        // Created once: a retry, or a save of newer text, updates THIS source.
        setDraft({ ...current, id: addMaterial(payload) });
        return null;
      },
      {
        current: draftKey,
        again: save,
        // Close the editor only once storage acknowledged exactly what it shows.
        saved: () => {
          setLastSaved(current.title.trim());
          setDraft(null);
        },
      },
    );
  }
  const ack = saves.states.draft;

  function openDraft(next: Draft) {
    saves.reset('draft');
    setLastSaved(null);
    setDraft(next);
  }

  function remove(m: Material) {
    setDeleted((d) => ({ ...d, [m.id]: m.title }));
    saves.run(m.id, 'delete', () => {
      deleteMaterial(m.id);
      return null;
    });
  }

  return (
    <div className="stack-lg">
      <Link to={from} className="link row" style={{ gap: 4, width: 'fit-content' }}>
        <ArrowLeftIcon width={16} height={16} /> Back
      </Link>

      <header className="row between">
        <div>
          <h1 className="page-title">Study sources</h1>
          <p className="page-sub">
            The book, collection or radif edition, course or teaching material a piece is studied from. A composer or
            maestro is set on the piece; a lesson is linked on its own.
          </p>
        </div>
        {db.instruments.length > 0 && (
          <button className="btn btn-primary" onClick={() => openDraft(emptyDraft(newSourceInstrument))}>
            <PlusIcon /> New
          </button>
        )}
      </header>

      {!draft && lastSaved && (
        <p className="tiny" role="status" style={{ margin: 0 }}>
          <span dir="auto">{lastSaved}</span> — Saved.
        </p>
      )}
      {Object.entries(deleted).map(([id, title]) => (
        <SaveStatus
          key={id}
          ack={saves.states[id]}
          subject={<><span dir="auto">{title}</span> deleted — </>}
          onRetry={() =>
            saves.run(id, 'delete', () => {
              deleteMaterial(id);
              return null;
            })
          }
        />
      ))}

      {draft && (
        <div className="card stack">
          <div className="grid-2">
            <Field label="Instrument">
              <select
                className="select"
                aria-label="Instrument"
                value={draft.instrumentId}
                onChange={(e) => setDraft({ ...draft, instrumentId: e.target.value })}
              >
                {db.instruments.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Kind"
              hint={NEW_SOURCE_KINDS.find((k) => k.kind === draft.sourceType)?.example ?? 'An older kind, kept exactly as it was.'}
            >
              <select
                className="select"
                aria-label="Kind"
                value={draft.sourceType}
                onChange={(e) => setDraft({ ...draft, sourceType: e.target.value as MaterialSourceType })}
              >
                {sourceKindOptions(draft.id ? db.materials.find((m) => m.id === draft.id)?.sourceType : undefined).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Name" hint="One clear name — e.g. Radif Mirzā Abdollāh · Honarestān Book 2 · CGS Level 1.">
            <input
              className="input"
              dir="auto"
              aria-label="Source name"
              value={draft.title}
              autoFocus
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </Field>
          <Field label="Status" hint="Are you actively working from it right now?">
            <select
              className="select"
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value as MaterialStatus })}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Notes">
            <textarea className="textarea" dir="auto" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
          </Field>
          <div className="row">
            <button className="btn btn-primary grow" disabled={!draft.title.trim() || ack?.status === 'saving'} onClick={save}>
              {draft.id ? 'Save changes' : 'Create source'}
            </button>
            <button
              className="btn"
              onClick={() => {
                saves.reset('draft');
                setDraft(null);
              }}
            >
              Cancel
            </button>
          </div>
          <SaveStatus ack={ack} current={draftKey()} onRetry={save} />
        </div>
      )}

      {db.materials.length === 0 && !draft ? (
        <div className="card">
          <EmptyState icon={<FolderIcon />} title="No study sources yet">
            A source is where an item comes from — a radif, a method book, a course, a set of études. Optional, but
            handy for grouping. You can also create one inline while creating an item.
          </EmptyState>
        </div>
      ) : (
        db.instruments.map((inst) => {
          const mats = db.materials.filter((m) => m.instrumentId === inst.id);
          if (mats.length === 0) return null;
          return (
            <section key={inst.id} className="stack-sm" dir="auto">
              <h2 className="title-md">{inst.name}</h2>
              <div className="card card-flush list">
                {mats.map((m) => (
                  <div key={m.id} className="list-row">
                    <div className="grow" dir="auto">
                      <div className="truncate">
                        {m.title}
                      </div>
                      {/* Generated English metadata, never user text — its own
                          dir="ltr" isolate keeps it from inheriting a Farsi
                          source title's RTL base. */}
                      <div className="tiny faint">
                        <span dir="ltr">
                          {MATERIAL_SOURCE_LABELS[m.sourceType]} · {MATERIAL_STATUS_LABELS[m.status]} ·{' '}
                          {itemCount(m.id)} item{itemCount(m.id) === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => openDraft(fromMaterial(m))}>
                      Edit
                    </button>
                    <button
                      className="btn btn-ghost btn-sm btn-danger"
                      onClick={() => {
                        if (confirm(`Delete "${m.title}"? Items keep working — they just lose this source label.`)) remove(m);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
