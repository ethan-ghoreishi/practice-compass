import { useMemo, useState } from 'react';
import {
  groupBlocksByItem,
  isDue,
  ITEM_STATUS_LABELS,
  ITEM_STATUS_ORDER,
  ITEM_TYPE_LABELS,
  neglectedScore,
  overworkedItems,
  scoreItems,
  type ItemStatus,
  type ItemType,
} from '../domain';
import { useStore } from '../store/useStore';
import ItemCard from '../components/ItemCard';
import ItemForm from '../components/ItemForm';
import { emptyItemValues, valuesToCreateInput, type ItemFormValues } from '../components/itemFormValues';
import { EmptyState } from '../components/ui';
import { recordToOptions } from '../components/options';
import { ItemsIcon, PlusIcon } from '../components/icons';

type Quick = 'due' | 'fragile' | 'neglected' | 'overworked' | 'teacher';

const QUICK: { key: Quick; label: string }[] = [
  { key: 'due', label: 'Due today' },
  { key: 'fragile', label: 'Fragile' },
  { key: 'neglected', label: 'Neglected' },
  { key: 'overworked', label: 'Overworked' },
  { key: 'teacher', label: 'Teacher Q' },
];

const TYPE_OPTIONS = recordToOptions(ITEM_TYPE_LABELS);

export default function Items() {
  const db = useStore((s) => s.db);
  const addItem = useStore((s) => s.addItem);

  const now = useMemo(() => new Date(), []);
  const [search, setSearch] = useState('');
  const [instrumentId, setInstrumentId] = useState('');
  const [status, setStatus] = useState<ItemStatus | ''>('');
  const [type, setType] = useState<ItemType | ''>('');
  const [quick, setQuick] = useState<Set<Quick>>(new Set());
  const [creating, setCreating] = useState(false);

  const scored = useMemo(
    () => scoreItems(db.items, groupBlocksByItem(db.blocks), now),
    [db.items, db.blocks, now],
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
      if (quick.has('fragile') && item.status !== 'fragile' && item.status !== 'repairing') return false;
      if (quick.has('neglected') && neglectedScore(item, now) < 2) return false;
      if (quick.has('overworked') && !overworkedIds.has(item.id)) return false;
      if (quick.has('teacher') && !(item.teacherQuestion && item.teacherQuestion.trim())) return false;
      return true;
    });

  function handleCreate(values: ItemFormValues) {
    addItem(valuesToCreateInput(values));
    setCreating(false);
  }

  const defaultInstrument = db.instruments[0]?.id ?? '';

  return (
    <div className="stack-lg">
      <header className="row between">
        <div>
          <h1 className="page-title">Items</h1>
          <p className="page-sub">{db.items.length} in your library</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreating((c) => !c)}>
          <PlusIcon /> New
        </button>
      </header>

      {creating && db.instruments.length > 0 && (
        <ItemForm
          initial={emptyItemValues(defaultInstrument)}
          submitLabel="Create item"
          onSubmit={handleCreate}
          onCancel={() => setCreating(false)}
        />
      )}

      <div className="stack-sm">
        <input
          className="input"
          placeholder="Search items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
            Try clearing a filter, or add a new item.
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
