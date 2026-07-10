import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  currentStage,
  groupStages,
  pathwayProgress,
  stageProgress,
  stagesOfPathway,
  stageUnits,
  type PathwayStage,
} from '../domain';
import { useStore } from '../store/useStore';
import { instrumentName } from '../store/lookups';
import { Field } from '../components/ui';
import { ArrowLeftIcon, CheckIcon, ChevronRightIcon, PlusIcon } from '../components/icons';

export default function PathwayDetail() {
  const { pathwayId } = useParams();
  const db = useStore((s) => s.db);
  const updatePathway = useStore((s) => s.updatePathway);
  const deletePathway = useStore((s) => s.deletePathway);
  const addStage = useStore((s) => s.addStage);
  const moveStage = useStore((s) => s.moveStage);
  const renameSection = useStore((s) => s.renameSection);
  const navigate = useNavigate();

  const pathway = db.pathways.find((p) => p.id === pathwayId);
  const stages = useMemo(() => (pathway ? stagesOfPathway(db.pathwayStages, pathway.id) : []), [db.pathwayStages, pathway]);

  const [editing, setEditing] = useState(false);
  const [addingStage, setAddingStage] = useState(false);
  const [stageCode, setStageCode] = useState('');
  const [stageTitle, setStageTitle] = useState('');
  /** '' = no section; '__new__' = create a new section name. */
  const [stageGroup, setStageGroup] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [renamingGroup, setRenamingGroup] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  if (!pathway) {
    return (
      <div className="stack">
        <Link to="/repertoire" className="link">
          ← Back to repertoire
        </Link>
        <div className="card">That pathway doesn’t exist.</div>
      </div>
    );
  }

  const current = currentStage(db.pathwayStages, db.items, pathway.id, pathway.currentStageId);
  const prog = pathwayProgress(db.pathwayStages, db.items, pathway.id);
  const grouped = groupStages(stages);
  const groupNames = [...new Set(stages.map((s) => s.group).filter((g): g is string => !!g))];

  function submitStage() {
    if (!stageTitle.trim() && !stageCode.trim()) return;
    const group = stageGroup === '__new__' ? newGroupName.trim() : stageGroup;
    addStage(pathway!.id, {
      code: stageCode || stageTitle.slice(0, 6),
      title: stageTitle || stageCode,
      group: group || undefined,
    });
    setStageCode('');
    setStageTitle('');
    setNewGroupName('');
    setAddingStage(false);
  }

  return (
    <div className="stack-lg">
      <Link to="/repertoire" className="link row" style={{ gap: 4, width: 'fit-content' }}>
        <ArrowLeftIcon width={16} height={16} /> Repertoire
      </Link>

      {editing ? (
        <PathwayEditForm
          pathway={pathway}
          instruments={db.instruments}
          onSave={(patch) => {
            updatePathway(pathway.id, patch);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <header className="stack-sm">
          <h1 className="page-title">{pathway.name}</h1>
          <div className="tiny faint">
            {pathway.instrumentId ? instrumentName(db, pathway.instrumentId) : 'General'}
            {pathway.source ? ` · ${pathway.source}` : ''}
          </div>
          {pathway.description && <p className="page-sub">{pathway.description}</p>}
          {pathway.note && (
            <div className="card card-quiet small dim" style={{ marginTop: 4 }}>
              {pathway.note}
            </div>
          )}
          <div className="row" style={{ gap: 8, marginTop: 4 }}>
            <button className="btn btn-sm" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => {
                if (confirm(`Delete the pathway “${pathway.name}” and all its stages? Your practice items are kept.`)) {
                  deletePathway(pathway.id);
                  navigate('/repertoire');
                }
              }}
            >
              Delete
            </button>
          </div>
        </header>
      )}

      {current && (
        <article className="card card-accent stack-sm">
          <div className="row between">
            <span className="eyebrow">You are here</span>
            <span className="tiny faint mono-num">
              {prog.done}/{prog.total} solid
            </span>
          </div>
          <div className="title-md" style={{ fontSize: '1.2rem' }}>
            {current.code}
            {current.title !== current.code ? ` · ${current.title}` : ''}
          </div>
          <Link to={`/pathway/${pathway.id}/${current.id}`} className="btn btn-primary">
            Continue this stage
          </Link>
        </article>
      )}

      <section className="stack-sm">
        <div className="row between">
          <div className="section-label">Stages</div>
          <button className="btn btn-ghost btn-sm" onClick={() => setAddingStage((a) => !a)}>
            <PlusIcon /> Add stage
          </button>
        </div>

        {addingStage && (
          <div className="card stack-sm">
            <div className="grid-2">
              <Field label="Short code">
                <input className="input" dir="auto" placeholder="e.g. 2A / Shur" value={stageCode} onChange={(e) => setStageCode(e.target.value)} />
              </Field>
              <Field label="Section" hint="Which part of the path this stage sits in.">
                <select className="select" value={stageGroup} onChange={(e) => setStageGroup(e.target.value)} aria-label="Section for the new stage">
                  <option value="">No section</option>
                  {groupNames.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                  <option value="__new__">New section…</option>
                </select>
              </Field>
            </div>
            {stageGroup === '__new__' && (
              <Field label="New section name">
                <input className="input" dir="auto" placeholder="e.g. Book 3" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
              </Field>
            )}
            <Field label="Title">
              <input className="input" dir="auto" value={stageTitle} onChange={(e) => setStageTitle(e.target.value)} />
            </Field>
            <button className="btn btn-primary" onClick={submitStage}>
              Add stage
            </button>
          </div>
        )}

        {grouped.map((g, gi) => (
          <div key={gi} className="stack-sm">
            {g.group &&
              (renamingGroup === g.group ? (
                <div className="row" style={{ gap: 8, marginTop: gi ? 8 : 0 }}>
                  <input
                    className="input grow"
                    dir="auto"
                    value={renameValue}
                    autoFocus
                    aria-label={`Rename section ${g.group}`}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && renameValue.trim()) {
                        renameSection(pathway.id, g.group, renameValue);
                        setRenamingGroup(null);
                      }
                      if (e.key === 'Escape') setRenamingGroup(null);
                    }}
                  />
                  <button
                    className="btn btn-sm btn-primary"
                    disabled={!renameValue.trim()}
                    onClick={() => {
                      renameSection(pathway.id, g.group, renameValue);
                      setRenamingGroup(null);
                    }}
                  >
                    Save
                  </button>
                  <button className="btn btn-sm" onClick={() => setRenamingGroup(null)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="row between" style={{ marginTop: gi ? 8 : 0 }}>
                  <div className="small dim" style={{ fontWeight: 600 }} dir="auto">
                    {g.group}
                  </div>
                  <button
                    className="link tiny"
                    style={{ background: 'none', border: 'none' }}
                    onClick={() => {
                      setRenamingGroup(g.group!);
                      setRenameValue(g.group!);
                    }}
                  >
                    rename
                  </button>
                </div>
              ))}
            {g.stages.map((stage) => (
              <StageRow
                key={stage.id}
                stage={stage}
                num={stages.findIndex((s) => s.id === stage.id) + 1}
                db={db}
                isCurrent={stage.id === current?.id}
                isPinned={pathway.currentStageId === stage.id}
                onOpen={() => navigate(`/pathway/${pathway.id}/${stage.id}`)}
                onMove={(d) => moveStage(stage.id, d)}
              />
            ))}
          </div>
        ))}

        {stages.length === 0 && <div className="card card-quiet small dim">No stages yet — add the first one above.</div>}
      </section>
    </div>
  );
}

function StageRow({
  stage,
  num,
  db,
  isCurrent,
  isPinned,
  onOpen,
  onMove,
}: {
  stage: PathwayStage;
  num: number;
  db: ReturnType<typeof useStore.getState>['db'];
  isCurrent: boolean;
  isPinned: boolean;
  onOpen: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const sp = stageProgress(stageUnits(stage, db.items));
  return (
    <div className={`card list-row${isCurrent ? ' card-accent' : ''}`} style={{ padding: 'var(--space-3) var(--space-4)' }}>
      <div
        className="stage-badge"
        style={{
          background: sp.complete ? 'var(--tone-good-soft)' : isCurrent ? 'var(--accent-soft)' : 'var(--surface-2)',
          color: sp.complete ? 'var(--tone-good)' : isCurrent ? 'var(--accent)' : 'var(--text-dim)',
        }}
      >
        {sp.complete ? <CheckIcon width={18} height={18} /> : num}
      </div>
      <button className="grow" style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'inherit' }} onClick={onOpen}>
        <div className="row" style={{ gap: 8 }}>
          <span dir="auto">{stage.code}</span>
          {isCurrent && <span className="badge tone-progress">{isPinned ? 'Current · pinned' : 'Current'}</span>}
          {sp.complete && <span className="badge tone-good">Done</span>}
          {sp.addedItems > 0 && !sp.complete && (
            <span className="tiny faint">{sp.addedItems} item{sp.addedItems === 1 ? '' : 's'}</span>
          )}
        </div>
        <div className="tiny faint" dir="auto">{stage.title !== stage.code ? stage.title : `${sp.total} piece${sp.total === 1 ? '' : 's'}`}</div>
        <div className="row" style={{ gap: 8, marginTop: 6 }}>
          <span className="balance-track grow" style={{ maxWidth: 180 }}>
            <span className="balance-fill" style={{ width: `${sp.percent}%` }} />
          </span>
          <span className="tiny faint mono-num">
            {sp.done}/{sp.total}
          </span>
        </div>
      </button>
      <div className="stack" style={{ gap: 2 }}>
        <button className="btn btn-ghost btn-sm" style={{ minHeight: 22, padding: '0 6px' }} onClick={() => onMove(-1)} aria-label="Move up">
          ↑
        </button>
        <button className="btn btn-ghost btn-sm" style={{ minHeight: 22, padding: '0 6px' }} onClick={() => onMove(1)} aria-label="Move down">
          ↓
        </button>
      </div>
      <ChevronRightIcon width={16} height={16} className="faint" onClick={onOpen} style={{ cursor: 'pointer' }} />
    </div>
  );
}

function PathwayEditForm({
  pathway,
  instruments,
  onSave,
  onCancel,
}: {
  pathway: { name: string; instrumentId?: string; source?: string; description?: string; note?: string };
  instruments: { id: string; name: string }[];
  onSave: (patch: { name: string; instrumentId?: string; source?: string; description?: string; note?: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(pathway.name);
  const [instrumentId, setInstrumentId] = useState(pathway.instrumentId ?? '');
  const [source, setSource] = useState(pathway.source ?? '');
  const [description, setDescription] = useState(pathway.description ?? '');
  const [note, setNote] = useState(pathway.note ?? '');
  return (
    <div className="card stack">
      <Field label="Name">
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Instrument">
        <select className="select" value={instrumentId} onChange={(e) => setInstrumentId(e.target.value)}>
          <option value="">General (no instrument)</option>
          {instruments.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Source">
        <input className="input" value={source} onChange={(e) => setSource(e.target.value)} />
      </Field>
      <Field label="Description">
        <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <Field label="How you'll use it">
        <textarea className="textarea" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      <div className="row">
        <button
          className="btn btn-primary grow"
          disabled={!name.trim()}
          onClick={() => onSave({ name: name.trim(), instrumentId: instrumentId || undefined, source: source.trim() || undefined, description: description.trim() || undefined, note: note.trim() || undefined })}
        >
          Save
        </button>
        <button className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
