import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MATERIAL_SOURCE_LABELS,
  MATERIAL_STATUS_LABELS,
  type Material,
  type MaterialSourceType,
  type MaterialStatus,
} from '../domain';
import { useStore } from '../store/useStore';
import { materialLabel } from '../store/lookups';
import { EmptyState, Field } from '../components/ui';
import { recordToOptions } from '../components/options';
import { FolderIcon, PlusIcon } from '../components/icons';

interface Draft {
  id?: string;
  instrumentId: string;
  title: string;
  sourceType: MaterialSourceType;
  sourceName: string;
  parentTitle: string;
  section: string;
  teacherOrSource: string;
  status: MaterialStatus;
  notes: string;
}

const SOURCE_OPTIONS = recordToOptions(MATERIAL_SOURCE_LABELS);
const STATUS_OPTIONS = recordToOptions(MATERIAL_STATUS_LABELS);

function emptyDraft(instrumentId: string): Draft {
  return {
    instrumentId,
    title: '',
    sourceType: 'other',
    sourceName: '',
    parentTitle: '',
    section: '',
    teacherOrSource: '',
    status: 'active',
    notes: '',
  };
}

function fromMaterial(m: Material): Draft {
  return {
    id: m.id,
    instrumentId: m.instrumentId,
    title: m.title,
    sourceType: m.sourceType,
    sourceName: m.sourceName ?? '',
    parentTitle: m.parentTitle ?? '',
    section: m.section ?? '',
    teacherOrSource: m.teacherOrSource ?? '',
    status: m.status,
    notes: m.notes ?? '',
  };
}

export default function Materials() {
  const db = useStore((s) => s.db);
  const addMaterial = useStore((s) => s.addMaterial);
  const updateMaterial = useStore((s) => s.updateMaterial);
  const deleteMaterial = useStore((s) => s.deleteMaterial);

  const [draft, setDraft] = useState<Draft | null>(null);

  const itemCount = (materialId: string) => db.items.filter((i) => i.materialId === materialId).length;

  function save() {
    if (!draft || !draft.title.trim()) return;
    const payload = {
      instrumentId: draft.instrumentId,
      title: draft.title.trim(),
      sourceType: draft.sourceType,
      sourceName: draft.sourceName.trim() || undefined,
      parentTitle: draft.parentTitle.trim() || undefined,
      section: draft.section.trim() || undefined,
      teacherOrSource: draft.teacherOrSource.trim() || undefined,
      status: draft.status,
      notes: draft.notes.trim() || undefined,
    };
    if (draft.id) updateMaterial(draft.id, payload);
    else addMaterial(payload);
    setDraft(null);
  }

  return (
    <div className="stack-lg">
      <header className="row between">
        <div>
          <h1 className="page-title">Materials</h1>
          <p className="page-sub">Sources and collections your items belong to</p>
        </div>
        {db.instruments.length > 0 && (
          <button className="btn btn-primary" onClick={() => setDraft(emptyDraft(db.instruments[0].id))}>
            <PlusIcon /> New
          </button>
        )}
      </header>

      {draft && (
        <div className="card stack">
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
          <Field label="Title">
            <input className="input" value={draft.title} autoFocus onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </Field>
          <div className="grid-2">
            <Field label="Source type">
              <select className="select" value={draft.sourceType} onChange={(e) => setDraft({ ...draft, sourceType: e.target.value as MaterialSourceType })}>
                {SOURCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select className="select" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as MaterialStatus })}>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid-2">
            <Field label="Source name" hint="e.g. Radif Mirza Abdollah">
              <input className="input" value={draft.sourceName} onChange={(e) => setDraft({ ...draft, sourceName: e.target.value })} />
            </Field>
            <Field label="Parent title" hint="e.g. Afshari">
              <input className="input" value={draft.parentTitle} onChange={(e) => setDraft({ ...draft, parentTitle: e.target.value })} />
            </Field>
          </div>
          <div className="grid-2">
            <Field label="Section" hint="e.g. Iraq">
              <input className="input" value={draft.section} onChange={(e) => setDraft({ ...draft, section: e.target.value })} />
            </Field>
            <Field label="Teacher / source">
              <input className="input" value={draft.teacherOrSource} onChange={(e) => setDraft({ ...draft, teacherOrSource: e.target.value })} />
            </Field>
          </div>
          <Field label="Notes">
            <textarea className="textarea" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
          </Field>
          <div className="row">
            <button className="btn btn-primary grow" disabled={!draft.title.trim()} onClick={save}>
              {draft.id ? 'Save changes' : 'Create material'}
            </button>
            <button className="btn" onClick={() => setDraft(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {db.materials.length === 0 && !draft ? (
        <div className="card">
          <EmptyState icon={<FolderIcon />} title="No materials yet">
            Materials group your items — a radif, a course, a set of études.
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
                      <div className="truncate">{materialLabel(m)}</div>
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
                        if (confirm(`Delete material "${m.title}"? Items will be kept but detached.`)) deleteMaterial(m.id);
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

      <Link to="/items" className="link small">
        ← Back to items
      </Link>
    </div>
  );
}
