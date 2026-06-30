import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  currentStage,
  pathwayProgress,
  stageProgress,
  stepsOfStage,
  type Pathway as PathwayT,
} from '../domain';
import { useStore } from '../store/useStore';
import { instrumentName } from '../store/lookups';
import { Field } from '../components/ui';
import { ChevronRightIcon, PathIcon, PlusIcon } from '../components/icons';

export default function Pathway() {
  const db = useStore((s) => s.db);
  const addPathway = useStore((s) => s.addPathway);
  const reseedDefaultPathways = useStore((s) => s.reseedDefaultPathways);
  const navigate = useNavigate();

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [instrumentId, setInstrumentId] = useState(db.instruments[0]?.id ?? '');
  const [source, setSource] = useState('');
  const [note, setNote] = useState('');

  const pathways = useMemo(() => [...db.pathways].sort((a, b) => a.order - b.order), [db.pathways]);

  function create() {
    if (!name.trim()) return;
    const id = addPathway({ name, instrumentId: instrumentId || undefined, source, note });
    setName('');
    setSource('');
    setNote('');
    setCreating(false);
    navigate(`/pathway/${id}`);
  }

  return (
    <div className="stack-lg">
      <header className="row between">
        <div>
          <h1 className="page-title">Pathways</h1>
          <p className="page-sub">Trusted routes to follow at your own pace — one per instrument, fully yours to edit.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreating((c) => !c)}>
          <PlusIcon /> New
        </button>
      </header>

      {creating && (
        <div className="card stack">
          <Field label="Name">
            <input className="input" autoFocus placeholder="e.g. Tar · my teacher's plan" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Instrument">
            <select className="select" value={instrumentId} onChange={(e) => setInstrumentId(e.target.value)}>
              <option value="">General (no instrument)</option>
              {db.instruments.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Source (optional)">
            <input className="input" placeholder="e.g. Radif of Mirzā Abdollāh" value={source} onChange={(e) => setSource(e.target.value)} />
          </Field>
          <Field label="How you'll use it (optional)">
            <textarea className="textarea" value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <div className="row">
            <button className="btn btn-primary grow" disabled={!name.trim()} onClick={create}>
              Create pathway
            </button>
            <button className="btn" onClick={() => setCreating(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {pathways.length === 0 ? (
        <div className="card stack-sm">
          <div className="small dim">You have no pathways yet.</div>
          <button className="btn btn-sm" style={{ width: 'fit-content' }} onClick={reseedDefaultPathways}>
            Restore the default pathways
          </button>
        </div>
      ) : (
        <div className="stack">
          {pathways.map((p) => (
            <PathwayCard key={p.id} pathway={p} db={db} onOpen={() => navigate(`/pathway/${p.id}`)} />
          ))}
        </div>
      )}

      <button className="link small" style={{ background: 'none', border: 'none', width: 'fit-content' }} onClick={reseedDefaultPathways}>
        Restore any missing default pathways
      </button>
    </div>
  );
}

function PathwayCard({
  pathway,
  db,
  onOpen,
}: {
  pathway: PathwayT;
  db: ReturnType<typeof useStore.getState>['db'];
  onOpen: () => void;
}) {
  const stage = currentStage(db.pathwayStages, db.pathwaySteps, pathway.id);
  const prog = pathwayProgress(db.pathwayStages, db.pathwaySteps, pathway.id);
  const sp = stage ? stageProgress(stepsOfStage(db.pathwaySteps, stage.id)) : null;

  return (
    <button className="card card-link stack-sm" style={{ width: '100%', textAlign: 'left' }} onClick={onOpen}>
      <div className="row between">
        <div className="row" style={{ gap: 8 }}>
          <PathIcon width={16} height={16} style={{ color: 'var(--accent)' }} />
          <span className="title-md">{pathway.name}</span>
        </div>
        <ChevronRightIcon width={16} height={16} className="faint" />
      </div>
      <div className="tiny faint">
        {pathway.instrumentId ? instrumentName(db, pathway.instrumentId) : 'General'}
        {pathway.source ? ` · ${pathway.source}` : ''}
      </div>
      {stage && (
        <div className="row between" style={{ marginTop: 2 }}>
          <span className="small dim truncate">
            Now: <strong style={{ color: 'var(--text)' }}>{stage.code}</strong> {stage.title !== stage.code ? `· ${stage.title}` : ''}
          </span>
        </div>
      )}
      <div className="row" style={{ gap: 8 }}>
        <span className="balance-track grow">
          <span className="balance-fill" style={{ width: `${sp?.percent ?? 0}%` }} />
        </span>
        <span className="tiny faint mono-num">
          {prog.stepsDone}/{prog.stepsTotal}
        </span>
      </div>
    </button>
  );
}
