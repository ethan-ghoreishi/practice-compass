import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  currentStage,
  groupBlocksByItem,
  groupByDastgah,
  isDue,
  ITEM_STATUS_LABELS,
  ITEM_STATUS_ORDER,
  ITEM_TYPE_LABELS,
  neglectedScore,
  nextLessonDates,
  overworkedItems,
  pathwayProgress,
  scoreItems,
  stageProgress,
  stageUnits,
  UNCLASSIFIED_DASTGAH,
  type ItemStatus,
  type ItemType,
  type Pathway as PathwayT,
} from '../domain';
import { useStore } from '../store/useStore';
import { instrumentName } from '../store/lookups';
import ItemCard from '../components/ItemCard';
import QuickAdd from '../components/QuickAdd';
import { Field, StatusBadge } from '../components/ui';
import { recordToOptions } from '../components/options';
import { relativeFromDateTime } from '../components/format';
import { ChevronRightIcon, ItemsIcon, PathIcon, PlusIcon } from '../components/icons';
import { EmptyState } from '../components/ui';

type View = 'paths' | 'persian' | 'all';

export default function Repertoire() {
  const db = useStore((s) => s.db);
  const [view, setView] = useState<View>('paths');
  const navigate = useNavigate();

  const hasPersian = db.instruments.some((i) => i.family === 'Persian' && i.active);

  return (
    <div className="stack-lg">
      <header className="stack-sm">
        <div className="row between">
          <h1 className="page-title">Repertoire</h1>
          <div className="row" style={{ gap: 8 }}>
            <Link to="/materials" state={{ from: '/repertoire' }} className="btn btn-ghost btn-sm">
              Sources
            </Link>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/items/new', { state: { from: '/repertoire' } })}>
              <PlusIcon /> New item
            </button>
          </div>
        </div>
        <div className="options" role="group" aria-label="Repertoire view">
          <button className={`option${view === 'paths' ? ' selected' : ''}`} aria-pressed={view === 'paths'} onClick={() => setView('paths')}>
            By pathway
          </button>
          {hasPersian && (
            <button
              className={`option${view === 'persian' ? ' selected' : ''}`}
              aria-pressed={view === 'persian'}
              onClick={() => setView('persian')}
            >
              Persian pieces
            </button>
          )}
          <button className={`option${view === 'all' ? ' selected' : ''}`} aria-pressed={view === 'all'} onClick={() => setView('all')}>
            All items
          </button>
        </div>
      </header>

      {view === 'paths' ? <PathwaysView /> : view === 'persian' ? <PersianView /> : <AllItemsView />}
    </div>
  );
}

// --- Persian pieces: the repertoire beyond the radif -------------------------
//
// Maestro pieces (a chahār-mezrāb of Sabā in Afshāri, a pish-darāmad of
// Shahnāzi…) are ordinary items carrying dastgāh/form/composer — this view
// groups them by dastgāh so the whole Persian repertoire is visible in one
// musical map, radif and composed pieces side by side.

function PersianView() {
  const db = useStore((s) => s.db);
  const navigate = useNavigate();
  const now = useMemo(() => new Date(), []);

  const persianIds = useMemo(
    () => new Set(db.instruments.filter((i) => i.family === 'Persian').map((i) => i.id)),
    [db.instruments],
  );
  const [instrumentId, setInstrumentId] = useState('');

  const groups = useMemo(() => {
    const items = db.items.filter(
      (i) => persianIds.has(i.instrumentId) && (!instrumentId || i.instrumentId === instrumentId),
    );
    return groupByDastgah(items);
  }, [db.items, persianIds, instrumentId]);

  const persianInstruments = db.instruments.filter((i) => persianIds.has(i.id) && i.active);

  return (
    <div className="stack">
      <p className="page-sub" style={{ marginTop: -8 }}>
        Everything you play in each dastgāh and āvāz — radif gushehs and composed pieces from the maestros together.
        Give an item a dastgāh, form or composer and it appears here.
      </p>

      {persianInstruments.length > 1 && (
        <div className="options" role="group" aria-label="Instrument">
          <button className={`option${!instrumentId ? ' selected' : ''}`} aria-pressed={!instrumentId} onClick={() => setInstrumentId('')}>
            Both
          </button>
          {persianInstruments.map((i) => (
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

      {groups.length === 0 && (
        <div className="card">
          <EmptyState icon={<ItemsIcon />} title="Nothing classified yet">
            Add a dastgāh, form or composer to any Setar/Tar item (or create a new one) and it shows up here, grouped
            by dastgāh.
          </EmptyState>
        </div>
      )}

      {groups.map((g) => (
        <section key={g.dastgah} className="stack-sm">
          <div className="row between">
            <h2 className="title-md" dir="auto">
              {g.dastgah === UNCLASSIFIED_DASTGAH ? 'No dastgāh yet' : g.dastgah}
            </h2>
            <span className="tiny faint">
              {g.items.length} piece{g.items.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="card card-flush list">
            {g.items.map((item) => (
              <Link
                key={item.id}
                to={`/items/${item.id}`}
                state={{ from: '/repertoire' }}
                className="list-row card-link"
                style={{ borderRadius: 0 }}
              >
                <div className="grow" style={{ minWidth: 0 }}>
                  <div className="truncate" dir="auto">
                    {item.title}
                  </div>
                  <div className="tiny faint truncate" dir="auto">
                    {[
                      item.persian?.form,
                      item.persian?.composer,
                      item.persian?.gusheh && `gusheh: ${item.persian.gusheh}`,
                      instrumentName(db, item.instrumentId),
                      item.lastPractisedAt ? `last ${relativeFromDateTime(item.lastPractisedAt, now)}` : 'not practised yet',
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </Link>
            ))}
          </div>
        </section>
      ))}

      <button className="btn" style={{ width: 'fit-content' }} onClick={() => navigate('/items/new', { state: { from: '/repertoire' } })}>
        <PlusIcon /> Add a piece with details
      </button>
    </div>
  );
}

// --- By pathway --------------------------------------------------------------

function PathwaysView() {
  const db = useStore((s) => s.db);
  const addPathway = useStore((s) => s.addPathway);
  const reseedDefaultPathways = useStore((s) => s.reseedDefaultPathways);
  const navigate = useNavigate();

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [instrumentId, setInstrumentId] = useState(db.instruments[0]?.id ?? '');

  const pathways = useMemo(() => [...db.pathways].sort((a, b) => a.order - b.order), [db.pathways]);

  function create() {
    if (!name.trim()) return;
    const id = addPathway({ name, instrumentId: instrumentId || undefined });
    setName('');
    setCreating(false);
    navigate(`/pathway/${id}`);
  }

  return (
    <div className="stack">
      <p className="page-sub" style={{ marginTop: -8 }}>
        Your items, organised along the routes you trust. Add pieces from each stage's list, at your own pace.
      </p>

      {pathways.map((p) => (
        <PathwayCard key={p.id} pathway={p} db={db} onOpen={() => navigate(`/pathway/${p.id}`)} />
      ))}

      {creating ? (
        <div className="card stack-sm">
          <Field label="Name">
            <input className="input" dir="auto" autoFocus placeholder="e.g. Tar · my teacher's plan" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Instrument">
            <select className="select" value={instrumentId} onChange={(e) => setInstrumentId(e.target.value)}>
              <option value="">General</option>
              {db.instruments.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
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
      ) : (
        <div className="row-wrap">
          <button className="btn btn-sm" onClick={() => setCreating(true)}>
            <PlusIcon /> New pathway
          </button>
          {pathways.length === 0 && (
            <button className="btn btn-sm" onClick={reseedDefaultPathways}>
              Restore default pathways
            </button>
          )}
        </div>
      )}
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
  const stage = currentStage(db.pathwayStages, db.items, pathway.id);
  const prog = pathwayProgress(db.pathwayStages, db.items, pathway.id);
  const sp = stage ? stageProgress(stageUnits(stage, db.items)) : null;

  return (
    <button className="card card-link stack-sm" style={{ width: '100%', textAlign: 'left' }} onClick={onOpen}>
      <div className="row between">
        <div className="row" style={{ gap: 8, minWidth: 0 }}>
          <PathIcon width={16} height={16} style={{ color: 'var(--accent)', flex: 'none' }} />
          <span className="title-md truncate">{pathway.name}</span>
        </div>
        <ChevronRightIcon width={16} height={16} className="faint" style={{ flex: 'none' }} />
      </div>
      <div className="tiny faint truncate">
        {pathway.instrumentId ? instrumentName(db, pathway.instrumentId) : 'General'}
        {stage ? ` · now: ${stage.code}${stage.title !== stage.code ? ` — ${stage.title}` : ''}` : ''}
      </div>
      <div className="row" style={{ gap: 8 }}>
        <span className="balance-track grow">
          <span className="balance-fill" style={{ width: `${sp?.percent ?? 0}%` }} />
        </span>
        <span className="tiny faint mono-num">
          {prog.done}/{prog.total}
        </span>
      </div>
    </button>
  );
}

// --- All items ---------------------------------------------------------------

type Quick = 'due' | 'lesson' | 'fragile' | 'neglected' | 'overworked' | 'teacher';

const QUICK: { key: Quick; label: string }[] = [
  { key: 'due', label: 'Due today' },
  { key: 'lesson', label: 'For class' },
  { key: 'fragile', label: 'Fragile' },
  { key: 'neglected', label: 'Neglected' },
  { key: 'overworked', label: 'Overworked' },
  { key: 'teacher', label: 'Teacher Q' },
];

const TYPE_OPTIONS = recordToOptions(ITEM_TYPE_LABELS);

function AllItemsView() {
  const db = useStore((s) => s.db);

  const now = useMemo(() => new Date(), []);
  const [search, setSearch] = useState('');
  const [instrumentId, setInstrumentId] = useState('');
  const [status, setStatus] = useState<ItemStatus | ''>('');
  const [type, setType] = useState<ItemType | ''>('');
  const [quick, setQuick] = useState<Set<Quick>>(new Set());

  const lessonDates = useMemo(() => nextLessonDates(db.lessons, now), [db.lessons, now]);
  const scored = useMemo(
    () => scoreItems(db.items, groupBlocksByItem(db.blocks), now, lessonDates),
    [db.items, db.blocks, now, lessonDates],
  );
  const overworkedIds = useMemo(
    () => new Set(overworkedItems(db.items, db.blocks, now).map((i) => i.id)),
    [db.items, db.blocks, now],
  );

  const toggleQuick = (k: Quick) =>
    setQuick((s) => {
      const next = new Set(s);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const visible = scored
    .map((s) => s.item)
    .filter((item) => {
      if (search && !item.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
      if (instrumentId && item.instrumentId !== instrumentId) return false;
      if (status && item.status !== status) return false;
      if (type && item.itemType !== type) return false;
      if (quick.has('due') && !isDue(item, now)) return false;
      if (quick.has('lesson') && !item.assignedForLesson) return false;
      if (quick.has('fragile') && item.status !== 'fragile' && item.status !== 'repairing') return false;
      if (quick.has('neglected') && neglectedScore(item, now) < 2) return false;
      if (quick.has('overworked') && !overworkedIds.has(item.id)) return false;
      if (quick.has('teacher') && !(item.teacherQuestion && item.teacherQuestion.trim())) return false;
      return true;
    });

  return (
    <div className="stack">
      <QuickAdd />

      <div className="stack-sm">
        <input className="input" dir="auto" placeholder="Search items…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="row" style={{ gap: 8 }}>
          <select className="select" value={instrumentId} onChange={(e) => setInstrumentId(e.target.value)}>
            <option value="">All instruments</option>
            {db.instruments.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value as ItemStatus | '')}>
            <option value="">Any status</option>
            {ITEM_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {ITEM_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select className="select" value={type} onChange={(e) => setType(e.target.value as ItemType | '')}>
            <option value="">Any type</option>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="row-wrap">
          {QUICK.map((q) => (
            <button
              key={q.key}
              className={`chip${quick.has(q.key) ? ' tone-progress' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => toggleQuick(q.key)}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="card">
          <EmptyState icon={<ItemsIcon />} title="No items match">
            Try clearing a filter, or add one above — just a title is enough.
          </EmptyState>
        </div>
      ) : (
        <div className="stack">
          {visible.map((item) => (
            <ItemCard key={item.id} item={item} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}
