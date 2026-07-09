import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  routinesOfStage,
  stageProgress,
  stageUnits,
  ITEM_STATUS_LABELS,
  STRAND_LABELS,
  type PathwayRoutine,
  type StageUnit,
} from '../domain';
import { useStore } from '../store/useStore';
import QuickAdd from '../components/QuickAdd';
import { Field, StatusBadge } from '../components/ui';
import { ArrowLeftIcon, CheckIcon, ChevronRightIcon, PlayIcon, PlusIcon } from '../components/icons';

export default function StageDetail() {
  const { pathwayId, stageId } = useParams();
  const db = useStore((s) => s.db);
  const updateStage = useStore((s) => s.updateStage);
  const deleteStage = useStore((s) => s.deleteStage);
  const addFromCatalog = useStore((s) => s.addFromCatalog);
  const startItemSession = useStore((s) => s.startItemSession);
  const navigate = useNavigate();

  const stage = db.pathwayStages.find((s) => s.id === stageId);
  const units = useMemo(() => (stage ? stageUnits(stage, db.items) : []), [stage, db.items]);
  const routines = useMemo(() => (stage ? routinesOfStage(db.pathwayRoutines, stage.id) : []), [db.pathwayRoutines, stage]);

  const [editing, setEditing] = useState(false);
  const [editCode, setEditCode] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editIntro, setEditIntro] = useState('');

  if (!stage) {
    return (
      <div className="stack">
        <Link to="/repertoire" className="link">
          ← Back to repertoire
        </Link>
        <div className="card">That stage doesn't exist.</div>
      </div>
    );
  }

  const sp = stageProgress(units);
  const backTo = `/pathway/${pathwayId}`;

  function startEdit() {
    setEditCode(stage!.code);
    setEditTitle(stage!.title);
    setEditIntro(stage!.intro ?? '');
    setEditing(true);
  }
  function saveEdit() {
    updateStage(stage!.id, {
      code: editCode.trim() || stage!.code,
      title: editTitle.trim() || editCode,
      intro: editIntro.trim() || undefined,
    });
    setEditing(false);
  }

  function practise(unit: StageUnit) {
    const itemId = unit.item?.id ?? addFromCatalog(stage!.id, unit.key);
    startItemSession(itemId);
    navigate('/active');
  }

  return (
    <div className="stack-lg">
      <Link to={backTo} className="link row" style={{ gap: 4, width: 'fit-content' }}>
        <ArrowLeftIcon width={16} height={16} /> Pathway
      </Link>

      {editing ? (
        <div className="card stack-sm">
          <div className="grid-2">
            <Field label="Code">
              <input className="input" dir="auto" value={editCode} onChange={(e) => setEditCode(e.target.value)} />
            </Field>
            <Field label="Title">
              <input className="input" dir="auto" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </Field>
          </div>
          <Field label="Intro">
            <textarea className="textarea" dir="auto" value={editIntro} onChange={(e) => setEditIntro(e.target.value)} />
          </Field>
          <div className="row">
            <button className="btn btn-primary grow" onClick={saveEdit}>
              Save
            </button>
            <button className="btn" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                if (confirm(`Delete the stage "${stage.code}"? Your items are kept — they just leave the stage.`)) {
                  deleteStage(stage.id);
                  navigate(backTo);
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <header className="stack-sm">
          <h1 className="page-title">
            {stage.code}
            {stage.title !== stage.code ? ` · ${stage.title}` : ''}
          </h1>
          {stage.intro && <p className="page-sub">{stage.intro}</p>}
          <div className="row" style={{ gap: 8 }}>
            <span className="balance-track grow" style={{ maxWidth: 220 }}>
              <span className="balance-fill" style={{ width: `${sp.percent}%` }} />
            </span>
            <span className="tiny faint mono-num">
              {sp.done}/{sp.total} solid
            </span>
            <button className="btn btn-ghost btn-sm" onClick={startEdit}>
              Edit
            </button>
          </div>
        </header>
      )}

      {routines.length > 0 && (
        <section className="stack-sm">
          <div className="section-label">Guided routines</div>
          {routines.map((r) => (
            <RoutineCard key={r.id} routine={r} onStart={() => navigate(`/routine/${r.id}`)} />
          ))}
        </section>
      )}

      <section className="stack-sm">
        <div className="section-label">In this stage</div>
        <div className="stack-sm">
          {units.map((u) => (
            <UnitRow key={u.key} unit={u} onPractise={() => practise(u)} onAdd={() => addFromCatalog(stage.id, u.key)} />
          ))}
          {units.length === 0 && (
            <div className="card card-quiet small dim">Nothing here yet — add your first piece below.</div>
          )}
        </div>
        <QuickAdd stageId={stage.id} />
        <div className="tiny faint">
          Anything you add here is a normal practice item — it also appears under “All items” and in recommendations.
        </div>
      </section>
    </div>
  );
}

function UnitRow({ unit, onPractise, onAdd }: { unit: StageUnit; onPractise: () => void; onAdd: () => void }) {
  const navigate = useNavigate();
  const item = unit.item;

  return (
    <div className={`card row${unit.state === 'done' ? ' card-quiet' : ''}`} style={{ gap: 10 }}>
      <span
        className="stage-badge"
        style={{
          width: 34,
          height: 34,
          background:
            unit.state === 'done' ? 'var(--tone-good-soft)' : unit.state === 'in_progress' ? 'var(--accent-soft)' : 'var(--surface-2)',
          color: unit.state === 'done' ? 'var(--tone-good)' : unit.state === 'in_progress' ? 'var(--accent)' : 'var(--text-faint)',
        }}
      >
        {unit.state === 'done' ? <CheckIcon width={16} height={16} /> : unit.state === 'in_progress' ? '·' : ''}
      </span>

      <button
        className="grow"
        style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'inherit', minWidth: 0 }}
        onClick={() => (item ? navigate(`/items/${item.id}`) : onAdd())}
        title={item ? 'Open item' : 'Add to your items'}
      >
        <div className="truncate" dir="auto">
          {unit.title}
        </div>
        <div className="tiny faint row" style={{ gap: 6 }}>
          {unit.strand && <span>{STRAND_LABELS[unit.strand]}</span>}
          {item ? (
            <span>· {ITEM_STATUS_LABELS[item.status]}{item.assignedForLesson ? ' · for class' : ''}</span>
          ) : (
            <span>· suggestion — tap to add</span>
          )}
        </div>
        {unit.entry?.about && !item && (
          <div className="tiny dim" style={{ marginTop: 3 }}>
            {unit.entry.about}
          </div>
        )}
      </button>

      {item ? (
        <>
          <StatusBadge status={item.status} />
          <button className="btn btn-sm btn-primary" onClick={onPractise} aria-label={`Practise ${unit.title}`}>
            <PlayIcon />
          </button>
        </>
      ) : (
        <button className="btn btn-sm" onClick={onAdd} aria-label={`Add ${unit.title}`}>
          <PlusIcon /> Add
        </button>
      )}
      {item && <ChevronRightIcon width={14} height={14} className="faint" style={{ flex: 'none' }} />}
    </div>
  );
}

function RoutineCard({ routine, onStart }: { routine: PathwayRoutine; onStart: () => void }) {
  const total = routine.segments.reduce((s, x) => s + x.minutes, 0);
  return (
    <article className="card row between">
      <div>
        <div className="title-md" style={{ fontSize: '1.02rem' }}>
          {routine.name}
        </div>
        <div className="tiny faint">
          {routine.segments.length} segments · {total} min
        </div>
      </div>
      <button className="btn btn-primary btn-sm" onClick={onStart}>
        <PlayIcon /> Start
      </button>
    </article>
  );
}
