import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { StepStrand } from '../domain';
import { useStore } from '../store/useStore';
import { PlusIcon } from './icons';

/**
 * The fastest way to capture a new practice item: pick an instrument, type a
 * title (Farsi welcome — the field is direction-aware), press Add. Everything
 * else has smart defaults and can be filled in later on the item page.
 */
export default function QuickAdd({ stageId, strand }: { stageId?: string; strand?: StepStrand }) {
  const db = useStore((s) => s.db);
  const addItem = useStore((s) => s.addItem);

  const instruments = useMemo(() => db.instruments.filter((i) => i.active), [db.instruments]);
  const stage = stageId ? db.pathwayStages.find((s) => s.id === stageId) : undefined;
  const pathway = stage ? db.pathways.find((p) => p.id === stage.pathwayId) : undefined;

  const [instrumentId, setInstrumentId] = useState(pathway?.instrumentId ?? instruments[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  function add() {
    if (!title.trim() || !instrumentId) return;
    const id = addItem({
      instrumentId: pathway?.instrumentId ?? instrumentId,
      title,
      stageId,
      strand,
    });
    setTitle('');
    setLastAddedId(id);
    setTimeout(() => setLastAddedId((cur) => (cur === id ? null : cur)), 4000);
  }

  return (
    <div className="card stack-sm">
      {!pathway?.instrumentId && instruments.length > 1 && (
        <div className="options">
          {instruments.map((i) => (
            <button
              key={i.id}
              className={`option${instrumentId === i.id ? ' selected' : ''}`}
              onClick={() => setInstrumentId(i.id)}
            >
              {i.name}
            </button>
          ))}
        </div>
      )}
      <div className="row" style={{ gap: 8 }}>
        <input
          className="input grow"
          dir="auto"
          placeholder={stage ? `Add to ${stage.code}… e.g. گوشه، قطعه` : 'New item… e.g. چهارمضراب شور'}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button className="btn btn-primary" disabled={!title.trim() || !instrumentId} onClick={add}>
          <PlusIcon /> Add
        </button>
      </div>
      {lastAddedId && (
        <div className="tiny" style={{ color: 'var(--tone-good)' }}>
          Added ✓{' '}
          <Link to={`/items/${lastAddedId}`} className="link">
            add details
          </Link>
        </div>
      )}
    </div>
  );
}
