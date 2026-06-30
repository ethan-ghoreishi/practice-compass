import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  getCurriculum,
  stageProgress,
  stepsForStage,
  STEP_STATUS_LABELS,
  STRAND_LABELS,
  type CurriculumRoutine,
  type CurriculumStep,
  type StepStatus,
  type StepStrand,
} from '../domain';
import { useStore } from '../store/useStore';
import { ArrowLeftIcon, ClockIcon, PlayIcon, PlusIcon } from '../components/icons';

const STATUS_ORDER: StepStatus[] = ['todo', 'in_progress', 'done'];
const STRANDS = Object.keys(STRAND_LABELS) as StepStrand[];

export default function StageDetail() {
  const { code } = useParams();
  const progress = useStore((s) => s.db.curriculum);
  const setStepStatus = useStore((s) => s.setStepStatus);
  const addCustomStep = useStore((s) => s.addCustomStep);
  const deleteCustomStep = useStore((s) => s.deleteCustomStep);
  const startStepSession = useStore((s) => s.startStepSession);
  const navigate = useNavigate();

  const curriculum = useMemo(() => getCurriculum(), []);
  const stage = curriculum.stages.find((s) => s.code === code);

  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStrand, setNewStrand] = useState<StepStrand>('exercise');

  if (!stage) {
    return (
      <div className="stack">
        <Link to="/pathway" className="link">
          ← Back to pathway
        </Link>
        <div className="card">That stage doesn’t exist.</div>
      </div>
    );
  }

  const steps = stepsForStage(curriculum, progress, stage.id);
  const sp = stageProgress(steps, progress);
  const routines = curriculum.routines.filter((r) => r.stageId === stage.id);

  function practise(step: CurriculumStep) {
    startStepSession(step);
    navigate('/active');
  }

  function submitNew() {
    if (!newTitle.trim()) return;
    addCustomStep(stage!.id, { title: newTitle, strand: newStrand });
    setNewTitle('');
    setAdding(false);
  }

  return (
    <div className="stack-lg">
      <Link to="/pathway" className="link row" style={{ gap: 4, width: 'fit-content' }}>
        <ArrowLeftIcon width={16} height={16} /> Pathway
      </Link>

      <header className="stack-sm">
        <div className="eyebrow">Level {stage.levelNumber}</div>
        <h1 className="page-title">
          {stage.code}
          {stage.title !== stage.code ? ` · ${stage.title}` : ''}
        </h1>
        {stage.intro && <p className="page-sub">{stage.intro}</p>}
        <div className="row" style={{ gap: 8, marginTop: 4 }}>
          <span className="balance-track grow" style={{ maxWidth: 220 }}>
            <span className="balance-fill" style={{ width: `${sp.percent}%` }} />
          </span>
          <span className="tiny faint mono-num">
            {sp.done}/{sp.total} done
          </span>
        </div>
        {!stage.detailed && (
          <div className="tiny faint">
            Outline from the course — one item per practice area. Follow the CGS {stage.code} videos and mark each as you go.
          </div>
        )}
      </header>

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
            <input
              className="input"
              autoFocus
              placeholder="Step title…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitNew()}
            />
            <div className="row" style={{ gap: 8 }}>
              <select className="select grow" value={newStrand} onChange={(e) => setNewStrand(e.target.value as StepStrand)}>
                {STRANDS.map((s) => (
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
          {steps.map((step) => {
            const status = progress.stepStatus[step.id] ?? 'todo';
            return (
              <div key={step.id} className={`card stack-sm${status === 'done' ? ' card-quiet' : ''}`}>
                <div className="row between" style={{ alignItems: 'flex-start' }}>
                  <div className="grow">
                    <div className="row" style={{ gap: 8 }}>
                      <span className="chip">{STRAND_LABELS[step.strand]}</span>
                      {step.targetBpm && (
                        <span className="chip">
                          <ClockIcon width={12} height={12} /> {step.targetBpm} bpm
                        </span>
                      )}
                      {step.custom && <span className="tiny faint">added by you</span>}
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
                </div>

                <div className="row between">
                  <div className="options">
                    {STATUS_ORDER.map((st) => (
                      <button
                        key={st}
                        className={`option${status === st ? ' selected' : ''}`}
                        onClick={() => setStepStatus(step.id, st)}
                      >
                        {STEP_STATUS_LABELS[st]}
                      </button>
                    ))}
                  </div>
                  {step.kind !== 'checkpoint' && (
                    <button className="btn btn-sm btn-primary" onClick={() => practise(step)}>
                      <PlayIcon /> Practise
                    </button>
                  )}
                </div>

                {step.custom && (
                  <button
                    className="link tiny"
                    style={{ background: 'none', border: 'none', width: 'fit-content' }}
                    onClick={() => deleteCustomStep(step.id)}
                  >
                    Remove step
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function RoutineCard({ routine, onStart }: { routine: CurriculumRoutine; onStart: () => void }) {
  const total = routine.segments.reduce((s, x) => s + x.minutes, 0);
  return (
    <article className="card stack-sm">
      <div className="row between">
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
      </div>
    </article>
  );
}
