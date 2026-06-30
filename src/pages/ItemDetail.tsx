import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  BLOCK_MODE_LABELS,
  FOCUS_LABELS,
  ITEM_STATUS_LABELS,
  ITEM_STATUS_ORDER,
  ITEM_TYPE_LABELS,
  RESULT_LABELS,
  type BlockResult,
  type GuitarFields,
  type PersianFields,
} from '../domain';
import { useStore } from '../store/useStore';
import { getMaterial, instrumentName, itemBlocks, materialLabel } from '../store/lookups';
import { defaultStartInput } from '../store/sessionHelpers';
import ItemForm from '../components/ItemForm';
import { itemToValues, valuesToCreateInput, type ItemFormValues } from '../components/itemFormValues';
import { GUITAR_FIELDS, PERSIAN_FIELDS } from '../components/itemFields';
import { OptionPills, Stars, StatusBadge, Stat } from '../components/ui';
import { ArrowLeftIcon, PlayIcon } from '../components/icons';
import { formatMinutes, relativeDay, relativeFromDateTime, formatDateTimeISO } from '../components/format';

const RESULT_TONE: Record<BlockResult, string> = {
  worse: 'var(--tone-alert)',
  same: 'var(--tone-warn)',
  slightly_better: 'var(--tone-progress)',
  stable_alone: 'var(--tone-good)',
  stable_in_context: 'var(--tone-good)',
  performable: 'var(--tone-good)',
  not_logged: 'var(--text-faint)',
};

const RESULT_HEIGHT: Record<BlockResult, number> = {
  worse: 8,
  same: 14,
  slightly_better: 20,
  stable_alone: 28,
  stable_in_context: 34,
  performable: 40,
  not_logged: 6,
};

export default function ItemDetail() {
  const { id } = useParams();
  const db = useStore((s) => s.db);
  const startSession = useStore((s) => s.startSession);
  const setItemStatus = useStore((s) => s.setItemStatus);
  const updateItem = useStore((s) => s.updateItem);
  const deleteItem = useStore((s) => s.deleteItem);
  const navigate = useNavigate();
  const now = useMemo(() => new Date(), []);
  const [editing, setEditing] = useState(false);

  const item = db.items.find((i) => i.id === id);
  const blocks = useMemo(() => (item ? itemBlocks(db, item.id) : []), [db, item]);

  if (!item) {
    return (
      <div className="stack">
        <Link to="/items" className="link">
          ← Back to items
        </Link>
        <div className="card">This item no longer exists.</div>
      </div>
    );
  }

  const material = getMaterial(db, item.materialId);
  const persianEntries = PERSIAN_FIELDS.filter((f) => item.persian?.[f.key as keyof PersianFields]);
  const guitarEntries = GUITAR_FIELDS.filter((f) => item.guitar?.[f.key as keyof GuitarFields]);
  const trend = [...blocks].reverse(); // chronological

  function start() {
    if (!item) return;
    startSession(defaultStartInput(item));
    navigate('/active');
  }

  function handleEdit(values: ItemFormValues) {
    if (!item) return;
    updateItem(item.id, valuesToCreateInput(values));
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="stack">
        <button className="link row" style={{ background: 'none', border: 'none' }} onClick={() => setEditing(false)}>
          <ArrowLeftIcon width={16} height={16} /> Cancel edit
        </button>
        <h1 className="page-title">Edit item</h1>
        <ItemForm initial={itemToValues(item)} submitLabel="Save changes" onSubmit={handleEdit} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <Link to="/items" className="link row" style={{ gap: 4, width: 'fit-content' }}>
        <ArrowLeftIcon width={16} height={16} /> Items
      </Link>

      <header className="stack-sm">
        <div className="row between" style={{ alignItems: 'flex-start' }}>
          <h1 className="page-title">{item.title}</h1>
          <StatusBadge status={item.status} />
        </div>
        <div className="row-wrap small dim">
          <span>{instrumentName(db, item.instrumentId)}</span>
          <span className="faint">·</span>
          <span>{ITEM_TYPE_LABELS[item.itemType]}</span>
          {material && (
            <>
              <span className="faint">·</span>
              <span>{materialLabel(material)}</span>
            </>
          )}
        </div>
        <div className="row-wrap" style={{ gap: 16, marginTop: 4 }}>
          <span className="row tiny faint" style={{ gap: 6 }}>
            <Stars value={item.importance} /> importance
          </span>
          <span className="tiny faint">difficulty {item.difficulty}/5</span>
          {item.saturationWarning && <span className="tiny warn-flag">saturated — consider resting</span>}
        </div>
      </header>

      <div className="row">
        <button className="btn btn-primary btn-lg grow" onClick={start}>
          <PlayIcon /> Start a block
        </button>
        <button className="btn btn-lg" onClick={() => setEditing(true)}>
          Edit
        </button>
      </div>

      <div className="card grid-stats">
        <Stat value={item.timesPractised} label="Blocks" />
        <Stat value={formatMinutes(item.totalMinutes)} label="Total time" />
        <Stat value={relativeFromDateTime(item.lastPractisedAt, now)} label="Last practised" />
        <Stat value={item.nextReviewDate ? relativeDay(item.nextReviewDate, now) : '—'} label="Next review" />
      </div>

      <section className="stack-sm">
        <div className="section-label">Status</div>
        <OptionPills
          ariaLabel="Set status"
          value={item.status}
          onChange={(s) => setItemStatus(item.id, s)}
          options={ITEM_STATUS_ORDER.map((s) => ({ value: s, label: ITEM_STATUS_LABELS[s] }))}
        />
      </section>

      {(item.currentProblem || item.bestStrategy || item.teacherQuestion || item.lastObservation) && (
        <div className="stack-sm">
          {item.currentProblem && <DetailNote label="Current problem" text={item.currentProblem} />}
          {item.bestStrategy && <DetailNote label="Best strategy" text={item.bestStrategy} />}
          {item.teacherQuestion && <DetailNote label="Teacher question" text={item.teacherQuestion} tone="warn" />}
          {item.lastObservation && <DetailNote label="Last observation" text={item.lastObservation} />}
        </div>
      )}

      {item.tags.length > 0 && (
        <div className="row-wrap">
          {item.tags.map((t) => (
            <span key={t} className="chip">
              #{t}
            </span>
          ))}
        </div>
      )}

      {trend.length > 0 && (
        <section className="stack-sm">
          <div className="section-label">Result trend</div>
          <div className="card">
            <div className="row" style={{ alignItems: 'flex-end', gap: 6, height: 48 }}>
              {trend.map((b) => (
                <span
                  key={b.id}
                  title={`${formatDateTimeISO(b.startedAt)} · ${RESULT_LABELS[b.result]}`}
                  style={{
                    width: 12,
                    height: RESULT_HEIGHT[b.result],
                    borderRadius: 3,
                    background: RESULT_TONE[b.result],
                    display: 'inline-block',
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {(persianEntries.length > 0 || guitarEntries.length > 0) && (
        <section className="stack-sm">
          <div className="section-label">Details</div>
          <div className="card grid-2">
            {persianEntries.map((f) => (
              <FieldRow key={f.key} label={f.label} value={item.persian![f.key as keyof PersianFields]!} />
            ))}
            {guitarEntries.map((f) => (
              <FieldRow key={f.key} label={f.label} value={item.guitar![f.key as keyof GuitarFields]!} />
            ))}
          </div>
        </section>
      )}

      <section className="stack-sm">
        <div className="section-label">Recent blocks</div>
        {blocks.length === 0 ? (
          <div className="card card-quiet small dim">No blocks yet.</div>
        ) : (
          <div className="card card-flush list">
            {blocks.slice(0, 10).map((b) => (
              <div key={b.id} className="list-row">
                <div className="grow">
                  <div className="small">
                    {BLOCK_MODE_LABELS[b.mode]} · {FOCUS_LABELS[b.focus]}
                  </div>
                  {b.observation && <div className="tiny faint">{b.observation}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="tiny" style={{ color: RESULT_TONE[b.result] }}>
                    {RESULT_LABELS[b.result]}
                  </div>
                  <div className="tiny faint">
                    {formatDateTimeISO(b.startedAt)} · {b.durationMinutes}m
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <button
        className="btn btn-danger btn-sm"
        style={{ width: 'fit-content' }}
        onClick={() => {
          if (confirm(`Delete "${item.title}" and its ${blocks.length} block(s)? This cannot be undone.`)) {
            deleteItem(item.id);
            navigate('/items');
          }
        }}
      >
        Delete item
      </button>
    </div>
  );
}

function DetailNote({ label, text, tone }: { label: string; text: string; tone?: 'warn' }) {
  return (
    <div className="card card-quiet">
      <div className="section-label" style={{ marginBottom: 4, color: tone === 'warn' ? 'var(--tone-warn)' : undefined }}>
        {label}
      </div>
      <div className="small">{text}</div>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="stack" style={{ gap: 2 }}>
      <span className="tiny faint">{label}</span>
      <span className="small">{value}</span>
    </div>
  );
}
