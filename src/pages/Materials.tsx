import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MATERIAL_SOURCE_LABELS,
  MATERIAL_STATUS_LABELS,
  type Material,
  type MaterialSourceType,
  type MaterialStatus,
} from '../domain';
import { useStore } from '../store/useStore';
import { EmptyState, Field } from '../components/ui';
import { recordToOptions } from '../components/options';
import { ArrowLeftIcon, FolderIcon, PlusIcon } from '../components/icons';

// A source is deliberately simple: one name that says what it is and where it
// came from ("Radif Mirzā Abdollāh", "Honarestān Book 2", "CGS Level 1"),
// plus a kind, a status and a free note. Piece-level detail (dastgāh, gusheh,
// composer, teacher's remarks…) lives on the items themselves, never here —
// the old parent-title / section / teacher-source fields duplicated that and
// made the flow confusing.
interface Draft {
  id?: string;
  instrumentId: string;
  title: string;
  sourceType: MaterialSourceType;
  status: MaterialStatus;
  notes: string;
}

const SOURCE_OPTIONS = recordToOptions(MATERIAL_SOURCE_LABELS);
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
  const from = (location.state as { from?: string } | null)?.from ?? '/repertoire';

  const [draft, setDraft] = useState<Draft | null>(null);

  const itemCount = (materialId: string) => db.items.filter((i) => i.materialId === materialId).length;

  function save() {
    if (!draft || !draft.title.trim()) return;
    const payload = {
      instrumentId: draft.instrumentId,
      title: draft.title.trim(),
      sourceType: draft.sourceType,
      status: draft.status,
      notes: draft.notes.trim() || undefined,
    };
    if (draft.id) updateMaterial(draft.id, payload);
    else addMaterial(payload);
    setDraft(null);
  }

  return (
    <div className="stack-lg">
      <Link to={from} className="link row" style={{ gap: 4, width: 'fit-content' }}>
        <ArrowLeftIcon width={16} height={16} /> Back
      </Link>

      <header className="row between">
        <div>
          <h1 className="page-title">Study sources</h1>
          <p className="page-sub">Where practice items come from — a radif, method book, collection, course or teacher handout. Nothing else lives here.</p>
        </div>
        {db.instruments.length > 0 && (
          <button className="btn btn-primary" onClick={() => setDraft(emptyDraft(db.instruments[0].id))}>
            <PlusIcon /> New
          </button>
        )}
      </header>

      {draft && (
        <div className="card stack">
          <div className="grid-2">
            <Field label="Instrument">
              <select
                className="select"
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
            <Field label="Kind">
              <select
                className="select"
                value={draft.sourceType}
                onChange={(e) => setDraft({ ...draft, sourceType: e.target.value as MaterialSourceType })}
              >
                {SOURCE_OPTIONS.map((o) => (
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
            <button className="btn btn-primary grow" disabled={!draft.title.trim()} onClick={save}>
              {draft.id ? 'Save changes' : 'Create source'}
            </button>
            <button className="btn" onClick={() => setDraft(null)}>
              Cancel
            </button>
          </div>
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
            <section key={inst.id} className="stack-sm">
              <h2 className="title-md">{inst.name}</h2>
              <div className="card card-flush list">
                {mats.map((m) => (
                  <div key={m.id} className="list-row">
                    <div className="grow">
                      <div className="truncate" dir="auto">
                        {m.title}
                      </div>
                      <div className="tiny faint">
                        {MATERIAL_SOURCE_LABELS[m.sourceType]} · {MATERIAL_STATUS_LABELS[m.status]} ·{' '}
                        {itemCount(m.id)} item{itemCount(m.id) === 1 ? '' : 's'}
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => setDraft(fromMaterial(m))}>
                      Edit
                    </button>
                    <button
                      className="btn btn-ghost btn-sm btn-danger"
                      onClick={() => {
                        if (confirm(`Delete "${m.title}"? Items keep working — they just lose this source label.`))
                          deleteMaterial(m.id);
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
