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
export default function QuickAdd({
  stageId,
  strand,
  lessonId,
}: {
  stageId?: string;
  strand?: StepStrand;
  /** When set, the new item is linked to this lesson on creation. */
  lessonId?: string;
}) {
  const db = useStore((s) => s.db);
  const addItem = useStore((s) => s.addItem);
  const linkItemToLesson = useStore((s) => s.linkItemToLesson);
  const sessionInstrumentId = useStore((s) => s.sessionInstrumentId);

  const instruments = useMemo(() => db.instruments.filter((i) => i.active), [db.instruments]);
  const stage = stageId ? db.pathwayStages.find((s) => s.id === stageId) : undefined;
  const pathway = stage ? db.pathways.find((p) => p.id === stage.pathwayId) : undefined;
  const lesson = lessonId ? db.lessons.find((l) => l.id === lessonId) : undefined;

  // Context wins: the stage's pathway instrument, then the lesson's instrument,
  // then the current session instrument, then the first active one.
  const contextInstrument =
    pathway?.instrumentId ??
    lesson?.instrumentId ??
    (sessionInstrumentId && sessionInstrumentId !== 'all'
      ? instruments.find((i) => i.id === sessionInstrumentId)?.id
      : undefined);

  const [instrumentId, setInstrumentId] = useState(contextInstrument ?? instruments[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  function add() {
    if (!title.trim() || !instrumentId) return;
    const id = addItem({
      instrumentId: contextInstrument ?? instrumentId,
      title,
      stageId,
      strand,
    });
    if (lessonId) linkItemToLesson(lessonId, id);
    setTitle('');
    setLastAddedId(id);
    setTimeout(() => setLastAddedId((cur) => (cur === id ? null : cur)), 6000);
  }

  return (
    <div className="card stack-sm">
      {!contextInstrument && instruments.length > 1 && (
        <div className="options" role="group" aria-label="Instrument for the new item">
          {instruments.map((i) => (
            <button
              key={i.id}
              className={`option${instrumentId === i.id ? ' selected' : ''}`}
              aria-pressed={instrumentId === i.id}
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
          aria-label="New item title"
          placeholder={
            lesson
              ? 'Add an item from this lesson… e.g. گوشه، قطعه'
              : stage
                ? `Add to ${stage.code}… e.g. گوشه، قطعه`
                : 'New item… e.g. چهارمضراب شور'
          }
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button className="btn btn-primary" disabled={!title.trim() || (!contextInstrument && !instrumentId)} onClick={add}>
          <PlusIcon /> Add
        </button>
      </div>
      {lastAddedId && (
        <div className="tiny" style={{ color: 'var(--tone-good)' }}>
          Added ✓{' '}
          <Link to={`/items/${lastAddedId}`} state={{ edit: true }} className="link">
            add details
          </Link>
        </div>
      )}
    </div>
  );
}
