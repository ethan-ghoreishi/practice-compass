import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  currentStage,
  getCurriculum,
  overallProgress,
  stageProgress,
  stagesForLevel,
  stepsForStage,
  type CurriculumStage,
} from '../domain';
import { useStore } from '../store/useStore';
import { CheckIcon, ChevronRightIcon } from '../components/icons';

export default function Pathway() {
  const progress = useStore((s) => s.db.curriculum);
  const navigate = useNavigate();
  const curriculum = useMemo(() => getCurriculum(), []);

  const current = currentStage(curriculum, progress);
  const overall = overallProgress(curriculum, progress);
  const currentIndex = current ? curriculum.stages.findIndex((s) => s.id === current.id) : 0;

  return (
    <div className="stack-lg">
      <header className="stack-sm">
        <div className="eyebrow">{curriculum.name}</div>
        <h1 className="page-title">Your pathway</h1>
        <p className="page-sub">{curriculum.description}</p>
      </header>

      {current && (
        <article className="card card-accent stack-sm">
          <div className="row between">
            <span className="eyebrow">You are here</span>
            <span className="tiny faint">
              Stage {currentIndex + 1} of {overall.stagesTotal}
            </span>
          </div>
          <div className="title-md" style={{ fontSize: '1.25rem' }}>
            {current.code} · {current.title}
          </div>
          <ProgressBar value={stageDone(curriculum, progress, current)} total={stageTotal(curriculum, progress, current)} />
          <div className="row" style={{ marginTop: 4 }}>
            <Link to={`/pathway/${current.code}`} className="btn btn-primary grow">
              Continue this stage
            </Link>
          </div>
          <div className="tiny faint">
            {overall.stepsDone} of {overall.stepsTotal} steps done across the whole path · no rush, move on when it feels right.
          </div>
        </article>
      )}

      {curriculum.levels.map((level) => {
        const stages = stagesForLevel(curriculum, level.number);
        return (
          <section key={level.number} className="stack-sm">
            <div>
              <h2 className="title-md">{level.title}</h2>
              <p className="small dim" style={{ marginTop: 2 }}>
                {level.summary}
              </p>
            </div>

            {!level.available || stages.length === 0 ? (
              <div className="card card-quiet small faint">On the road ahead — add these stages when you arrive.</div>
            ) : (
              <div className="stack-sm">
                {stages.map((stage) => (
                  <StageRow
                    key={stage.id}
                    stage={stage}
                    isCurrent={stage.id === current?.id}
                    done={stageDone(curriculum, progress, stage)}
                    total={stageTotal(curriculum, progress, stage)}
                    onOpen={() => navigate(`/pathway/${stage.code}`)}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function stageDone(c: ReturnType<typeof getCurriculum>, p: ReturnType<typeof useStore.getState>['db']['curriculum'], stage: CurriculumStage) {
  return stageProgress(stepsForStage(c, p, stage.id), p).done;
}
function stageTotal(c: ReturnType<typeof getCurriculum>, p: ReturnType<typeof useStore.getState>['db']['curriculum'], stage: CurriculumStage) {
  return stepsForStage(c, p, stage.id).length;
}

function StageRow({
  stage,
  isCurrent,
  done,
  total,
  onOpen,
}: {
  stage: CurriculumStage;
  isCurrent: boolean;
  done: number;
  total: number;
  onOpen: () => void;
}) {
  const complete = total > 0 && done === total;
  return (
    <button
      className={`card card-link list-row${isCurrent ? ' card-accent' : ''}`}
      style={{ width: '100%', textAlign: 'left', padding: 'var(--space-3) var(--space-4)' }}
      onClick={onOpen}
    >
      <div
        className="stage-badge"
        style={{
          background: complete ? 'var(--tone-good-soft)' : isCurrent ? 'var(--accent-soft)' : 'var(--surface-2)',
          color: complete ? 'var(--tone-good)' : isCurrent ? 'var(--accent)' : 'var(--text-dim)',
        }}
      >
        {complete ? <CheckIcon width={18} height={18} /> : stage.code}
      </div>
      <div className="grow">
        <div className="row" style={{ gap: 8 }}>
          <span>{stage.code}</span>
          {isCurrent && <span className="badge tone-progress">Current</span>}
          {complete && <span className="badge tone-good">Complete</span>}
        </div>
        <div className="tiny faint">{stage.title === stage.code ? stage.mainAreas.slice(0, 4).join(' · ') : stage.title}</div>
        <ProgressBar value={done} total={total} compact />
      </div>
      <ChevronRightIcon width={16} height={16} className="faint" />
    </button>
  );
}

function ProgressBar({ value, total, compact }: { value: number; total: number; compact?: boolean }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="row" style={{ gap: 8, marginTop: compact ? 6 : 0 }}>
      <span className="balance-track grow">
        <span className="balance-fill" style={{ width: `${pct}%` }} />
      </span>
      <span className="tiny faint mono-num" style={{ minWidth: 38, textAlign: 'right' }}>
        {value}/{total}
      </span>
    </div>
  );
}
