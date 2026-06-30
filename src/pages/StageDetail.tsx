import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  routinesOfStage,
  stageProgress,
  stepsOfStage,
  STEP_KIND_LABELS,
  STEP_STATUS_LABELS,
  STRAND_LABELS,
  STRAND_ORDER,
  type PathwayRoutine,
  type PathwayStep,
  type StepKind,
  type StepStatus,
  type StepStrand,
} from '../domain';
import { useStore } from '../store/useStore';
import { Field } from '../components/ui';
import { ArrowLeftIcon, ClockIcon, PlayIcon, PlusIcon } from '../components/icons';

const STATUS_ORDER: StepStatus[] = ['todo', 'in_progress', 'done'];
const KINDS = Object.keys(STEP_KIND_LABELS) as StepKind[];

export default function StageDetail() {
  const { pathwayId, stageId } = useParams();
  const db = useStore((s) => s.db);
  const updateStage = useStore((s) => s.updateStage);
  const deleteStage = useStore((s) => s.deleteStage);
  const addStep = useStore((s) => s.addStep);
  const startStepSession = useStore((s) => s.startStepSession);
  const navigate = useNavigate();

  const stage = db.pathwayStages.find((s) => s.id === stageId);
  const steps = useMemo(() => (stage ? stepsOfStage(db.pathwaySteps, stage.id) : []), [db.pathwaySteps, stage]);
  const routines = useMemo(() => (stage ? routinesOfStage(db.pathwayRoutines, stage.id) : []), [db.pathwayRoutines, stage]);

  const [editing, setEditing] = useState(false);
  const [editCode, setEditCode] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editIntro, setEditIntro] = useState('');

  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStrand, setNewStrand] = useState<StepStrand>('exercise');

  if (!stage) {
    return (
      <div className="stack">
        <Link to="/pathway" className="link">
          ← Back to pathways
        </Link>
        <div className="card">That stage doesn’t exist.</div>
      </div>
    );
  }

  const sp = stageProgress(steps);
  const backTo = `/pathway/${pathwayId}`;

  function startEdit() {
    setEditCode(stage!.code);
    setEditTitle(stage!.title);
    setEditIntro(stage!.intro ?? '');
    setEditing(true);
  }
  function saveEdit() {
    updateStage(stage!.id, { code: editCode.trim() || stage!.code, title: editTitle.trim() || editCode, intro: editIntro.trim() || undefined });
    setEditing(false);
  }
  function submitNew() {
    if (!newTitle.trim()) return;
    addStep(stage!.id, { title: newTitle, strand: newStrand });
    setNewTitle('');
    setAdding(false);
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
              <input className="input" value={editCode} onChange={(e) => setEditCode(e.target.value)} />
            </Field>
            <Field label="Title">
              <input className="input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </Field>
          </div>
          <Field label="Intro">
            <textarea className="textarea" value={editIntro} onChange={(e) => setEditIntro(e.target.value)} />
          </Field>
          <div className="row">
            <button className="btn btn-primary grow" onClick={saveEdit}>
              Save
            </button>
            <button className="btn" onClick={() => setEditing(false)}>
              Cancel
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
              {sp.done}/{sp.total} done
            </span>
          </div>
          <div className="row" style={{ gap: 8, marginTop: 2 }}>
            <button className="btn btn-sm" onClick={startEdit}>
              Edit stage
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => {
                if (confirm(`Delete the stage “${stage.code}” and its steps?`)) {
                  deleteStage(stage.id);
                  navigate(backTo);
                }
              }}
            >
              Delete
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
        <div className="row between">
          <div className="section-label">Steps</div>
          <button className="btn btn-ghost btn-sm" onClick={() => setAdding((a) => !a)}>
            <PlusIcon /> Add step
          </button>
        </div>

        {adding && (
          <div className="card stack-sm">
            <input className="input" autoFocus placeholder="Step title…" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitNew()} />
            <div className="row" style={{ gap: 8 }}>
              <select className="select grow" value={newStrand} onChange={(e) => setNewStrand(e.target.value as StepStrand)}>
                {STRAND_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STRAND_LABELS[s]}
                  </option>
                ))}
              </select>
              <button className="btn btn-primary" disabled={!newTitle.trim()} onClick={submitNew}>
                Add
              </button>
            </div>
          </div>
        )}

        <div className="stack-sm">
          {steps.map((step) => (
            <StepCard key={step.id} step={step} isLast={step.order === steps[steps.length - 1].order} onPractise={() => { startStepSession(step); navigate('/active'); }} />
          ))}
          {steps.length === 0 && <div className="card card-quiet small dim">No steps yet — add the first one above.</div>}
        </div>
      </section>
    </div>
  );
}

function StepCard({ step, onPractise }: { step: PathwayStep; isLast: boolean; onPractise: () => void }) {
  const setStepStatus = useStore((s) => s.setStepStatus);
  const updateStep = useStore((s) => s.updateStep);
  const deleteStep = useStore((s) => s.deleteStep);
  const moveStep = useStore((s) => s.moveStep);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(step.title);
  const [strand, setStrand] = useState<StepStrand>(step.strand);
  const [kind, setKind] = useState<StepKind>(step.kind);
  const [notes, setNotes] = useState(step.notes ?? '');
  const [bpm, setBpm] = useState(step.targetBpm ? String(step.targetBpm) : '');

  function save() {
    updateStep(step.id, {
      title: title.trim() || step.title,
      strand,
      kind,
      notes: notes.trim() || undefined,
      targetBpm: bpm ? Number(bpm) : undefined,
    });
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="card stack-sm">
        <Field label="Title">
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <div className="grid-2">
          <Field label="Strand">
            <select className="select" value={strand} onChange={(e) => setStrand(e.target.value as StepStrand)}>
              {STRAND_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STRAND_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Kind">
            <select className="select" value={kind} onChange={(e) => setKind(e.target.value as StepKind)}>
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {STEP_KIND_LABELS[k]}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Notes">
          <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <Field label="Target BPM (optional)">
          <input className="input" type="number" value={bpm} onChange={(e) => setBpm(e.target.value)} style={{ maxWidth: 120 }} />
        </Field>
        <div className="row">
          <button className="btn btn-primary grow" onClick={save}>
            Save
          </button>
          <button className="btn" onClick={() => setEditing(false)}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={() => deleteStep(step.id)}>
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`card stack-sm${step.status === 'done' ? ' card-quiet' : ''}`}>
      <div className="row between" style={{ alignItems: 'flex-start' }}>
        <div className="grow">
          <div className="row" style={{ gap: 8 }}>
            <span className="chip">{STRAND_LABELS[step.strand]}</span>
            {step.targetBpm && (
              <span className="chip">
                <ClockIcon width={12} height={12} /> {step.targetBpm} bpm
              </span>
            )}
          </div>
          <div className="title-md" style={{ fontSize: '1.02rem', marginTop: 6 }}>
            {step.title}
          </div>
          {step.notes && (
            <div className="small dim" style={{ marginTop: 4 }}>
              {step.notes}
            </div>
          )}
        </div>
        <div className="stack" style={{ gap: 2 }}>
          <button className="btn btn-ghost btn-sm" style={{ minHeight: 22, padding: '0 6px' }} onClick={() => moveStep(step.id, -1)} aria-label="Move up">
            ↑
          </button>
          <button className="btn btn-ghost btn-sm" style={{ minHeight: 22, padding: '0 6px' }} onClick={() => moveStep(step.id, 1)} aria-label="Move down">
            ↓
          </button>
        </div>
      </div>

      <div className="row between">
        <div className="options">
          {STATUS_ORDER.map((st) => (
            <button key={st} className={`option${step.status === st ? ' selected' : ''}`} onClick={() => setStepStatus(step.id, st)}>
              {STEP_STATUS_LABELS[st]}
            </button>
          ))}
        </div>
        {step.kind !== 'checkpoint' && (
          <button className="btn btn-sm btn-primary" onClick={onPractise}>
            <PlayIcon /> Practise
          </button>
        )}
      </div>
      <button className="link tiny" style={{ background: 'none', border: 'none', width: 'fit-content' }} onClick={() => setEditing(true)}>
        Edit step
      </button>
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
