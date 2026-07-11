import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BLOCK_MODE_LABELS,
  DEFAULT_DURATION_MINUTES,
  DURATION_PRESETS,
  defaultFocusForItem,
  defaultModeForStatus,
  FOCUS_LABELS,
  ITEM_TYPE_LABELS,
  type BlockMode,
  type FocusArea,
  type PracticeItem,
} from '../domain';
import { useStore } from '../store/useStore';
import { itemsForInstrument } from '../store/lookups';
import { Field, OptionPills, StatusBadge } from '../components/ui';
import { recordToOptions } from '../components/options';
import { PlayIcon, PlusIcon } from '../components/icons';

const MODE_OPTIONS = recordToOptions(BLOCK_MODE_LABELS);
const FOCUS_OPTIONS = recordToOptions(FOCUS_LABELS);

export default function StartBlock() {
  const db = useStore((s) => s.db);
  const addItem = useStore((s) => s.addItem);
  const startSession = useStore((s) => s.startSession);
  const sessionInstrumentId = useStore((s) => s.sessionInstrumentId);
  const navigate = useNavigate();
  const location = useLocation();
  const preselect = (location.state as { selectItem?: string } | null)?.selectItem;

  const activeInstruments = db.instruments.filter((i) => i.active);
  // Inherit the session's instrument ("I'm practising Setar now").
  const sessionDefault =
    sessionInstrumentId && sessionInstrumentId !== 'all'
      ? activeInstruments.find((i) => i.id === sessionInstrumentId)?.id
      : undefined;
  const preselected = preselect ? db.items.find((i) => i.id === preselect) : undefined;
  const [instrumentId, setInstrumentId] = useState(
    preselected?.instrumentId ?? sessionDefault ?? activeInstruments[0]?.id ?? '',
  );
  const [selectedItemId, setSelectedItemId] = useState<string | null>(preselected?.id ?? null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');

  // Block configuration (smart defaults from the preselected item, if any)
  const [mode, setMode] = useState<BlockMode>(preselected ? defaultModeForStatus(preselected.status) : 'learn');
  const [focus, setFocus] = useState<FocusArea>(preselected ? defaultFocusForItem(preselected) : 'other');
  const [duration, setDuration] = useState<number>(DEFAULT_DURATION_MINUTES);

  // Quick-create draft: TITLE ONLY. Anything richer goes through the one
  // complete "Add practice item" form (which returns here ready to begin).
  const [title, setTitle] = useState('');

  const items = useMemo(() => itemsForInstrument(db, instrumentId), [db, instrumentId]);
  const filtered = useMemo(
    () =>
      items.filter((i) => i.title.toLowerCase().includes(search.trim().toLowerCase())),
    [items, search],
  );
  const selectedItem = items.find((i) => i.id === selectedItemId) ?? null;

  function pickInstrument(id: string) {
    setInstrumentId(id);
    setSelectedItemId(null);
    setCreating(false);
  }

  function pickItem(item: PracticeItem) {
    setSelectedItemId(item.id);
    setCreating(false);
    setMode(defaultModeForStatus(item.status));
    setFocus(defaultFocusForItem(item));
    setDuration(DEFAULT_DURATION_MINUTES);
  }

  function beginCreate() {
    setCreating(true);
    setSelectedItemId(null);
    setMode('learn');
    setFocus('other');
    setDuration(DEFAULT_DURATION_MINUTES);
  }

  const ready = creating ? title.trim().length > 0 : selectedItem !== null;

  function handleStart() {
    if (!instrumentId) return;
    let itemId = selectedItemId;
    if (creating) {
      if (!title.trim()) return;
      itemId = addItem({ instrumentId, title });
    }
    if (!itemId) return;
    startSession({
      itemId,
      instrumentId,
      materialId: creating ? undefined : selectedItem?.materialId,
      mode,
      focus,
      constraint: undefined,
      targetMinutes: duration,
    });
    navigate('/active');
  }

  if (activeInstruments.length === 0) {
    return (
      <div className="stack">
        <h1 className="page-title">Start a block</h1>
        <div className="card small dim">
          Add an instrument first in <span className="link" onClick={() => navigate('/more')}>More → Settings</span>.
        </div>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <header className="stack-sm">
        <h1 className="page-title">Start a block</h1>
        <p className="page-sub">Three quick choices: what, how, how long.</p>
      </header>

      {/* Step 1 — instrument */}
      <section className="stack-sm">
        <div className="section-label">1 · Instrument</div>
        <OptionPills
          ariaLabel="Instrument"
          value={instrumentId}
          onChange={pickInstrument}
          options={activeInstruments.map((i) => ({ value: i.id, label: i.name }))}
        />
      </section>

      {/* Step 2 — item */}
      <section className="stack-sm">
        <div className="row between">
          <div className="section-label">2 · Practice item</div>
          <button className="btn btn-sm" onClick={creating ? () => setCreating(false) : beginCreate}>
            {creating ? 'Pick existing' : <><PlusIcon /> Quick add</>}
          </button>
        </div>

        {creating ? (
          <div className="card stack-sm">
            <Field label="Title" hint="Just a name — add and begin. Details can wait.">
              <input
                className="input"
                dir="auto"
                autoFocus
                placeholder="e.g. Iraq phrase 4 ending"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>
            <button
              className="link small"
              style={{ background: 'none', border: 'none', textAlign: 'left', width: 'fit-content' }}
              onClick={() => navigate('/items/new', { state: { from: '/start' } })}
            >
              Need the full form (source, dastgāh, importance…)? Add with details →
            </button>
          </div>
        ) : (
          <div className="stack-sm">
            {items.length > 4 && (
              <input
                className="input"
                placeholder="Search items…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            )}
            {filtered.length === 0 ? (
              <div className="card card-quiet small dim">
                No items for this instrument yet. Use “New item”.
              </div>
            ) : (
              <div className="card card-flush list">
                {filtered.map((item) => (
                  <button
                    key={item.id}
                    className="list-row"
                    style={{
                      background: item.id === selectedItemId ? 'var(--accent-soft)' : 'none',
                      border: 'none',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: 'inherit',
                    }}
                    onClick={() => pickItem(item)}
                  >
                    <div className="grow">
                      <div className="truncate">{item.title}</div>
                      <div className="tiny faint">{ITEM_TYPE_LABELS[item.itemType]}</div>
                    </div>
                    <StatusBadge status={item.status} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Step 3 — mode / focus / duration */}
      {ready && (
        <section className="stack">
          <div className="section-label">3 · Mode, focus &amp; duration</div>
          <Field label="Mode">
            <OptionPills ariaLabel="Mode" value={mode} onChange={setMode} options={MODE_OPTIONS} />
          </Field>
          <Field label="Focus">
            <OptionPills ariaLabel="Focus" value={focus} onChange={setFocus} options={FOCUS_OPTIONS} />
          </Field>
          <Field label="Duration">
            <OptionPills
              ariaLabel="Duration"
              value={String(duration)}
              onChange={(v) => setDuration(Number(v))}
              options={DURATION_PRESETS.map((d) => ({ value: String(d), label: `${d} min` }))}
            />
          </Field>
        </section>
      )}

      <button className="btn btn-primary btn-lg btn-block" disabled={!ready} onClick={handleStart}>
        <PlayIcon /> Begin practice
      </button>
    </div>
  );
}
