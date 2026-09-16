import { useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  attachmentPolicy,
  BLOCK_MODE_LABELS,
  FOCUS_LABELS,
  ITEM_STATUS_LABELS,
  ITEM_STATUS_ORDER,
  ITEM_TYPE_LABELS,
  RATING_LABELS,
  REVIEW_MODE_LABELS,
  isLosslesslyRemovable,
  partsOf,
  pickNextPart,
  RESULT_LABELS,
  stallHint,
  itemFiles,
  itemOwnedAttachments,
  type BlockResult,
  type GuitarFields,
  type PersianFields,
  type PracticeItem,
  pendingScheduleConflict,
  todayISODate,
  type ISODate,
  type PracticeItem as PracticeItemT,
  type Review,
} from '../domain';
import { useStore } from '../store/useStore';
import { getMaterial, instrumentName, itemBlocks, materialLabel } from '../store/lookups';
import { defaultStartInput } from '../store/sessionHelpers';
import { addAttachment, formatBytes, removeAttachment } from '../store/attachments';
import ItemForm from '../components/ItemForm';
import { ItemAgenda } from '../components/LessonAgenda';
import { itemToValues, valuesToCreateInput, type ItemFormValues } from '../components/itemFormValues';
import { GUITAR_FIELDS, PERSIAN_FIELDS } from '../components/itemFields';
import ItemMaterial from '../components/ItemMaterial';
import ItemNotes from '../components/ItemNotes';
import { Field, OptionPills, Stars, StatusBadge, Stat } from '../components/ui';
import { ArrowLeftIcon, PlayIcon, PlusIcon } from '../components/icons';
import { formatMinutes, relativeDay, relativeFromDateTime, formatDateTimeISO } from '../components/format';
import { useDecisionNow } from '../components/useDecisionNow';

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
  const scheduleReviewAgain = useStore((s) => s.scheduleReviewAgain);
  const navigate = useNavigate();
  const location = useLocation();
  // Explicit, safe return context: back to where the item was opened from.
  const from = (location.state as { from?: string } | null)?.from ?? '/repertoire';
  const fromLabel = from === '/' ? 'Today' : from.startsWith('/lessons') ? 'Lessons' : from.startsWith('/pathway') ? 'Stage' : from.startsWith('/items/') ? 'Piece' : 'Repertoire';
  // The date controls below decide against TODAY, so this page cannot freeze
  // its clock at mount: a tab left open across local midnight would otherwise
  // offer (and write) yesterday's "today".
  const now = useDecisionNow();
  // Arriving via "add details" (QuickAdd) opens the form straight away.
  const [editing, setEditing] = useState(Boolean((location.state as { edit?: boolean } | null)?.edit));
  // A save the store REFUSED (an ambiguous pending schedule it will not guess
  // at) has to be visible where the save happened, not swallowed.
  const [saveRefusal, setSaveRefusal] = useState<string | null>(null);

  const item = db.items.find((i) => i.id === id);
  const blocks = useMemo(() => (item ? itemBlocks(db, item.id) : []), [db, item]);

  if (!item) {
    return (
      <div className="stack">
        <Link to="/repertoire" className="link">
          ← Back to repertoire
        </Link>
        <div className="card">This item no longer exists.</div>
      </div>
    );
  }

  const material = getMaterial(db, item.materialId);
  const stage = item.stageId ? db.pathwayStages.find((s) => s.id === item.stageId) : undefined;
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
    const refusal = updateItem(item.id, valuesToCreateInput(values));
    setSaveRefusal(refusal);
    if (!refusal) setEditing(false);
  }

  if (editing) {
    return (
      <div className="stack">
        <button className="link row" style={{ background: 'none', border: 'none' }} onClick={() => setEditing(false)}>
          <ArrowLeftIcon width={16} height={16} /> Cancel edit
        </button>
        <h1 className="page-title">Edit item</h1>
        {saveRefusal && (
          <div className="card card-quiet small" role="alert" style={{ color: 'var(--tone-warn)' }}>
            <span dir="ltr">{saveRefusal}</span>
          </div>
        )}
        <ItemForm initial={itemToValues(item)} submitLabel="Save changes" onSubmit={handleEdit} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <Link to={from} className="link row" style={{ gap: 4, width: 'fit-content' }}>
        <ArrowLeftIcon width={16} height={16} /> {fromLabel}
      </Link>

      {/* Title and the details that belong to it in ONE group, so a Farsi
          item's name and its own metadata line align to the same edge. */}
      <header className="stack-sm" dir="auto">
        <div className="row between" style={{ alignItems: 'flex-start' }}>
          <h1 className="page-title">
            {item.title}
          </h1>
          <StatusBadge status={item.status} />
        </div>
        {/* ITEM_TYPE_LABELS is generated English metadata, never user text —
            it gets its own dir="ltr" isolate. The instrument name is the
            owner's own editable text (renameable in Settings, Farsi
            included), so it gets dir="auto" instead of being pinned to a
            foreign LTR base. stage.code and the material label stay bare:
            both are user-authored and can be Farsi themselves (the Setar/Tar
            seeds author stage codes in Farsi too), so they correctly share
            the group's own resolved direction rather than being pinned to a
            foreign one. */}
        <div className="row-wrap small dim">
          <span dir="auto">{instrumentName(db, item.instrumentId)}</span>
          <span className="faint">·</span>
          <span dir="ltr">{ITEM_TYPE_LABELS[item.itemType]}</span>
          {stage && (
            <>
              <span className="faint">·</span>
              <Link to={`/pathway/${stage.pathwayId}/${stage.id}`} className="link">
                {stage.code}
              </Link>
            </>
          )}
          {material && (
            <>
              <span className="faint">·</span>
              <span>{materialLabel(material)}</span>
            </>
          )}
        </div>
        {/* Generated English metadata, never user text — each gets its own
            dir="ltr" isolate so it can't inherit the title's RTL base. */}
        <div className="row-wrap" style={{ gap: 16, marginTop: 4 }}>
          <span className="row tiny faint" style={{ gap: 6 }}>
            <Stars value={item.importance} /> {RATING_LABELS.importance.toLowerCase()}
          </span>
          <span className="tiny faint" dir="ltr">
            {RATING_LABELS.difficulty.toLowerCase()} {item.difficulty}/5
          </span>
          {item.saturationWarning && (
            <span className="tiny warn-flag" dir="ltr">saturated — consider resting</span>
          )}
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

      <ConnectedTo item={item} />

      {/* Commitments and questions, each naming its own class. */}
      <ItemAgenda itemId={item.id} />

      <div className="card grid-stats">
        <Stat value={item.timesPractised} label="Blocks" />
        <Stat value={formatMinutes(item.totalMinutes)} label="Total time" />
        <Stat value={relativeFromDateTime(item.lastPractisedAt, now)} label="Last practised" />
        <Stat value={item.nextReviewDate ? relativeDay(item.nextReviewDate, now) : '—'} label="Next review" />
      </div>
      <div className="tiny faint" style={{ marginTop: -6 }}>
        {(item.reviewMode ?? 'auto') === 'manual'
          ? 'Reviews: you set the dates.'
          : (item.reviewMode ?? 'auto') === 'interval'
            ? `Reviews: every ${item.reviewIntervalDays ?? 7} days.`
            : item.srReps
              ? `Spaced repetition · ${item.srReps} good review${item.srReps === 1 ? '' : 's'} · ease ${(item.srEase ?? 2.5).toFixed(1)}.`
              : 'Reviews: spaced repetition (auto).'}
      </div>

      <ScheduleAgain
        item={item}
        conflict={pendingScheduleConflict(item, db.reviews)}
        onSchedule={(date) => scheduleReviewAgain(item.id, date)}
      />

      <ReviewOwnership item={item} now={now} />

      <section className="stack-sm">
        <div className="section-label">Status</div>
        <OptionPills
          ariaLabel="Set status"
          value={item.status}
          onChange={(s) => setItemStatus(item.id, s)}
          options={ITEM_STATUS_ORDER.map((s) => ({ value: s, label: ITEM_STATUS_LABELS[s] }))}
        />
      </section>

      <PartsSection item={item} now={now} />

      <ConnectionsSection item={item} />

      <ItemNotes itemId={item.id} />

      <MaterialSection item={item} />

      <ItemFilesCrud itemId={item.id} />

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

      <BlockHistory blocks={blocks} />

      <button
        className="btn btn-danger btn-sm"
        style={{ width: 'fit-content' }}
        onClick={() => {
          if (confirm(`Delete "${item.title}" and its ${blocks.length} block(s)? This cannot be undone.`)) {
            deleteItem(item.id);
            navigate(from);
          }
        }}
      >
        Delete item
      </button>
    </div>
  );
}

/**
 * Études & pieces: real practice items grouped under this one. The calm answer
 * to "where do I even start" is one concrete part, picked deterministically.
 */
function PartsSection({ item, now }: { item: PracticeItem; now: Date }) {
  const db = useStore((s) => s.db);
  const addItem = useStore((s) => s.addItem);
  const startItemSession = useStore((s) => s.startItemSession);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');

  const parts = useMemo(() => partsOf(item.id, db.items), [item.id, db.items]);
  const canHaveParts =
    item.itemType === 'full_piece' || item.itemType === 'exercise' || item.itemType === 'section' || parts.length > 0;
  const next = useMemo(
    () => (parts.length > 0 ? pickNextPart(item.id, db.items, db.blocks, now) : null),
    [parts.length, item.id, db.items, db.blocks, now],
  );
  const hint = useMemo(
    () => stallHint(item, db.blocks.filter((b) => b.practiceItemId === item.id)),
    [item, db.blocks],
  );

  if (!canHaveParts) return null;

  function addPart() {
    if (!title.trim()) return;
    addItem({
      instrumentId: item.instrumentId,
      title,
      parentItemId: item.id,
      itemType: 'section',
      materialId: item.materialId,
      stageId: item.stageId,
    });
    setTitle('');
  }

  return (
    <section className="stack-sm">
      <div className="section-label">Parts</div>

      {hint && <div className="card card-quiet small" style={{ color: 'var(--tone-warn)' }}>{hint}</div>}

      {next && (
        <div className="card card-accent row" style={{ gap: 10 }}>
          <div className="grow" style={{ minWidth: 0 }}>
            <div className="tiny" style={{ color: 'var(--accent)' }}>
              Practise this part now · 10 min
            </div>
            <div dir="auto">
              <div className="truncate">{next.score.item.title}</div>
              {/* next.reason is always English (buildReason) — its own
                  dir="ltr" isolate keeps its bidi base fixed regardless of
                  the title's. */}
              <div className="tiny faint truncate">
                <span dir="ltr">{next.reason}</span>
              </div>
            </div>
          </div>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              startItemSession(next.score.item.id);
              navigate('/active');
            }}
            aria-label={`Practise ${next.score.item.title}`}
          >
            <PlayIcon />
          </button>
        </div>
      )}

      {parts.length > 0 && (
        <div className="card card-flush list">
          {parts.map((p) => (
            <Link key={p.id} to={`/items/${p.id}`} state={{ from: `/items/${item.id}` }} className="list-row card-link" dir="auto" style={{ borderRadius: 0 }}>
              <div className="grow truncate">
                {p.title}
              </div>
              <StatusBadge status={p.status} />
            </Link>
          ))}
        </div>
      )}

      <div className="row" style={{ gap: 8 }}>
        <input
          className="input grow"
          dir="auto"
          aria-label="New part title"
          placeholder="Break off a part… e.g. bars 9–16, the forud"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addPart()}
        />
        <button className="btn" disabled={!title.trim()} onClick={addPart}>
          Add part
        </button>
      </div>
    </section>
  );
}

/**
 * Everything that already belongs to this piece, in ONE place: the class video
 * and score from the lessons it is linked to, and its own attachments,
 * composed and deduplicated by `itemFiles` — nothing new is stored to show
 * them. Files stays below for add/remove; this section is what was previously
 * unreachable (lesson references) or split across two sections (attachments).
 */
function MaterialSection({ item }: { item: PracticeItem }) {
  const db = useStore((s) => s.db);
  const files = useMemo(() => itemFiles(db, item.id), [db, item.id]);
  if (files.length === 0) return null;
  return (
    <section className="stack-sm">
      <div className="section-label">Material</div>
      <ItemMaterial itemId={item.id} />
    </section>
  );
}

/**
 * Add/remove only. Material above already shows every attachment with its
 * preview and Open action from the composed `itemFiles` list — this stays a
 * plain CRUD surface rather than a second, partial presentation of the same
 * files (the shared Attachments component still owns that full presentation
 * for a lesson's own attachments, which nothing else displays).
 */
function ItemFilesCrud({ itemId }: { itemId: string }) {
  const all = useStore((s) => s.db.attachments);
  const list = useMemo(
    () => itemOwnedAttachments(all, itemId).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [all, itemId],
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [sizeNote, setSizeNote] = useState<string | null>(null);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      for (const f of Array.from(files)) {
        const policy = attachmentPolicy(f.size, f.type || '');
        if (policy.level === 'block') {
          setSizeNote(`“${f.name}” (${formatBytes(f.size)}) was not added: ${policy.message}`);
          continue;
        }
        await addAttachment('item', itemId, f);
        if (policy.level === 'warn') {
          setSizeNote(`“${f.name}” is ${formatBytes(f.size)}. ${policy.message}`);
        }
      }
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <section className="stack-sm">
      <div className="row between">
        <div className="section-label">Files</div>
        <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} disabled={busy}>
          <PlusIcon /> {busy ? 'Adding…' : 'Add file'}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="application/pdf,image/*,audio/*" multiple hidden onChange={onFiles} />
      {sizeNote && (
        <div className="card card-quiet small" style={{ color: 'var(--tone-warn)' }}>
          {sizeNote}{' '}
          <button className="link tiny" style={{ background: 'none', border: 'none' }} onClick={() => setSizeNote(null)}>
            OK
          </button>
        </div>
      )}
      {list.length > 0 && (
        <div className="card card-flush list">
          {list.map((a) => (
            <div key={a.id} className="list-row" dir="auto">
              <div className="grow truncate">{a.name}</div>
              {/* Generated English metadata, never user text — its own
                  dir="ltr" isolate keeps it from inheriting a Farsi file
                  name's RTL base. */}
              <div className="tiny faint">
                <span dir="ltr">
                  {a.kind} · {formatBytes(a.size)}
                </span>
              </div>
              <button
                className="btn btn-ghost btn-sm btn-danger"
                onClick={() => {
                  if (confirm(`Remove "${a.name}"?`)) removeAttachment(a.id);
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Concise "why does this item exist" summary near the top: study source,
 * pathway stage, lessons, parent work — the same links, at a glance, without
 * hunting through sections. Editing them happens in Connections below.
 */
function ConnectedTo({ item }: { item: PracticeItem }) {
  const db = useStore((s) => s.db);
  const removeCatalogItem = useStore((s) => s.removeCatalogItem);
  const navigate = useNavigate();
  const material = item.materialId ? db.materials.find((m) => m.id === item.materialId) : undefined;
  const stage = item.stageId ? db.pathwayStages.find((s) => s.id === item.stageId) : undefined;
  const pathway = stage ? db.pathways.find((p) => p.id === stage.pathwayId) : undefined;
  const lessons = db.lessons.filter((l) => (l.itemIds ?? []).includes(item.id)).sort((a, b) => b.date.localeCompare(a.date));
  const parent = item.parentItemId ? db.items.find((i) => i.id === item.parentItemId) : undefined;
  const losslessInStage =
    !!stage && isLosslesslyRemovable(item, db.blocks.filter((b) => b.practiceItemId === item.id));

  if (!material && !stage && lessons.length === 0 && !parent) return null;

  return (
    <div className="card card-quiet stack-sm" style={{ paddingTop: 'var(--space-3)', paddingBottom: 'var(--space-3)' }}>
      <div className="section-label" style={{ marginBottom: 0 }}>
        Connected to
      </div>
      <div className="row-wrap small" style={{ gap: 14, rowGap: 6 }}>
        {parent && (
          <span className="dim">
            Part of{' '}
            <Link to={`/items/${parent.id}`} state={{ from: `/items/${item.id}` }} className="link" dir="auto">
              {parent.title}
            </Link>
          </span>
        )}
        {material && (
          <span className="dim" dir="auto">
            <span dir="ltr">Study source: </span>
            <strong style={{ color: 'var(--text)' }}>{material.title}</strong>
          </span>
        )}
        {stage && (
          <span className="dim">
            Path:{' '}
            <Link to={`/pathway/${stage.pathwayId}/${stage.id}`} className="link" dir="auto">
              {pathway ? `${pathway.name} — ` : ''}
              {stage.code}
            </Link>
          </span>
        )}
        {lessons.length > 0 && (
          <span className="dim">
            Lessons:{' '}
            {lessons.slice(0, 3).map((l, i) => (
              <span key={l.id}>
                {i > 0 && ', '}
                <Link to="/lessons" className="link">
                  {l.date}
                </Link>
              </span>
            ))}
            {lessons.length > 3 && ` +${lessons.length - 3}`}
          </span>
        )}
      </div>
      {losslessInStage && (
        <button
          className="link tiny"
          style={{ background: 'none', border: 'none', width: 'fit-content', textAlign: 'left' }}
          onClick={() => {
            // Provably lossless (no practice logged): revert to a suggestion.
            if (removeCatalogItem(item.id)) navigate(`/pathway/${stage!.pathwayId}/${stage!.id}`);
          }}
        >
          Remove from stage (no practice logged)
        </button>
      )}
    </div>
  );
}

/**
 * Who manages this item's next review — and the one explicit way to hand that
 * back to the app.
 *
 * The transfer KEEPS the pending date. The button says so, and deliberately
 * never calls the retained date a fresh calculation: `auto` means "the app has
 * authority over this date from now on", not "the app worked this date out"
 * and not "a review happened". Nothing here records practice.
 *
 * It reads the LIVE item out of the store on every render (never a value
 * captured when the panel mounted), so reopening it, switching to another item
 * or an update arriving from elsewhere can never act on a stale date.
 */
function ReviewOwnership({ item, now: polledNow }: { item: PracticeItem; now: Date }) {
  const transfer = useStore((s) => s.useAutomaticReviewDates);
  const scheduleAgain = useStore((s) => s.scheduleReviewAgain);
  const [refusal, setRefusal] = useState<string | null>(null);
  // `useDecisionNow` polls at most every 30 seconds, so on a screen left open
  // across local midnight it can lag the real day — and "Review today" writes
  // a DATE. Catch that at the one instant it matters, exactly as the close
  // screen's Save does: refresh what is shown and stop, so the second tap
  // writes the day it actually is rather than the day this page was opened on.
  const [nowOverride, setNowOverride] = useState<Date | null>(null);
  const now = nowOverride ?? polledNow;
  const today = todayISODate(now);
  const mode = item.reviewMode ?? 'auto';
  const engineOwnsDate = mode === 'auto' && (!item.nextReviewDate || item.nextReviewSource === 'auto');

  return (
    <div className="stack-sm">
      <div className="section-label">Review scheduling</div>
      <div className="card card-quiet stack-sm">
        <div className="small">
          <span dir="ltr">
            {mode === 'auto'
              ? item.nextReviewDate
                ? item.nextReviewSource === 'auto'
                  ? `The app manages this: next on ${item.nextReviewDate}.`
                  : `You chose ${item.nextReviewDate}; it is protected until it comes due.`
                : 'The app manages this. Nothing is scheduled.'
              : mode === 'interval'
                ? `Fixed cadence: every ${item.reviewIntervalDays ?? 7} days.`
                : 'You set each date yourself.'}
          </span>
        </div>
        {!engineOwnsDate && (
          <button
            className="btn btn-sm"
            style={{ width: 'fit-content' }}
            onClick={() => setRefusal(transfer(item.id))}
          >
            Use automatic scheduling
          </button>
        )}
        {!engineOwnsDate && (
          <p className="tiny faint">
            <span dir="ltr">
              {item.nextReviewDate
                ? `Keeps ${item.nextReviewDate} exactly as it is and lets the app manage it from there. It records no practice and calculates no new date — real practice from here decides what changes.`
                : `Hands scheduling to the app. Nothing is scheduled yet and nothing is invented; use “${item.nextReviewDate ? 'Change review date' : 'Schedule again'}” or Review today when you want a date.`}
            </span>
          </p>
        )}
        {engineOwnsDate && !item.nextReviewDate && (
          <>
            <button
              className="btn btn-sm"
              style={{ width: 'fit-content' }}
              onClick={() => {
                const trueNow = new Date();
                if (todayISODate(trueNow) !== today) {
                  setNowOverride(trueNow);
                  return;
                }
                scheduleAgain(item.id, today);
              }}
            >
              Review today ({today})
            </button>
            <p className="tiny faint">
              <span dir="ltr">
                Puts it on today&apos;s list. Administrative only: it records no practice and no result.
              </span>
            </p>
          </>
        )}
        {refusal && (
          <div className="small" role="alert" style={{ color: 'var(--tone-warn)' }}>
            <span dir="ltr">{refusal}</span>
          </div>
        )}
        <p className="tiny faint">
          <span dir="ltr">Current mode: {REVIEW_MODE_LABELS[mode]}.</span>
        </p>
      </div>
    </div>
  );
}

/**
 * Everything a recorded block actually holds — what you noticed, what you
 * decided to try next, and any constraint the block was played under, next to
 * its date, mode, focus, result and minutes.
 *
 * `nextAction` used to be written at every close and read only at the START of
 * the next block; `observation` reached the history but `constraint` never did
 * at all. Older entries sit behind one plain disclosure rather than being
 * unreachable past the tenth block.
 */
function BlockHistory({ blocks }: { blocks: PracticeItemBlocks }) {
  const [showAll, setShowAll] = useState(false);
  const RECENT = 10;
  const shown = showAll ? blocks : blocks.slice(0, RECENT);

  return (
    <section className="stack-sm">
      <div className="section-label">Practice history</div>
      {blocks.length === 0 ? (
        <div className="card card-quiet small dim">
          <span dir="ltr">No blocks yet.</span>
        </div>
      ) : (
        <>
          <div className="card card-flush list">
            {shown.map((b) => (
              <div key={b.id} className="list-row" style={{ alignItems: 'flex-start' }}>
                <div className="grow" style={{ minWidth: 0 }}>
                  {/* Mode/focus/date/minutes are generated English metadata —
                      one dir="ltr" isolate each so a Farsi observation below
                      cannot drag them around. */}
                  <div className="small">
                    <span dir="ltr">
                      {BLOCK_MODE_LABELS[b.mode]} · {FOCUS_LABELS[b.focus]}
                    </span>
                  </div>
                  {b.observation && (
                    <div className="tiny faint" style={{ whiteSpace: 'pre-wrap' }}>
                      <span dir="ltr">Noticed: </span>
                      <span dir="auto">{b.observation}</span>
                    </div>
                  )}
                  {b.nextAction && (
                    <div className="tiny faint" style={{ whiteSpace: 'pre-wrap' }}>
                      <span dir="ltr">Decided to try next: </span>
                      <span dir="auto">{b.nextAction}</span>
                    </div>
                  )}
                  {b.constraint && (
                    <div className="tiny faint" style={{ whiteSpace: 'pre-wrap' }}>
                      <span dir="ltr">Constraint: </span>
                      <span dir="auto">{b.constraint}</span>
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flex: 'none' }}>
                  <div className="tiny" style={{ color: RESULT_TONE[b.result] }}>
                    <span dir="ltr">{RESULT_LABELS[b.result]}</span>
                  </div>
                  <div className="tiny faint">
                    <span dir="ltr">
                      {formatDateTimeISO(b.startedAt)} · {b.durationMinutes}m
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {blocks.length > RECENT && (
            <button
              className="btn btn-sm"
              style={{ width: 'fit-content' }}
              aria-expanded={showAll}
              onClick={() => setShowAll((o) => !o)}
            >
              {showAll ? 'Show recent only' : `Show all ${blocks.length} blocks`}
            </button>
          )}
        </>
      )}
    </section>
  );
}

type PracticeItemBlocks = ReturnType<typeof itemBlocks>;

/** Where this item lives: its pathway stage and the lessons it appeared in. */
function ConnectionsSection({ item }: { item: PracticeItem }) {
  const db = useStore((s) => s.db);
  const placeItemInStage = useStore((s) => s.placeItemInStage);
  const linkItemToLesson = useStore((s) => s.linkItemToLesson);
  const unlinkItemFromLesson = useStore((s) => s.unlinkItemFromLesson);

  const stages = useMemo(() => {
    const pathways = db.pathways.filter((p) => !p.instrumentId || p.instrumentId === item.instrumentId);
    return pathways.flatMap((p) =>
      db.pathwayStages
        .filter((s) => s.pathwayId === p.id)
        .sort((a, b) => a.order - b.order)
        .map((s) => ({ stage: s, pathway: p })),
    );
  }, [db.pathways, db.pathwayStages, item.instrumentId]);

  const linkedLessons = useMemo(
    () => db.lessons.filter((l) => (l.itemIds ?? []).includes(item.id)).sort((a, b) => b.date.localeCompare(a.date)),
    [db.lessons, item.id],
  );
  const linkableLessons = useMemo(
    () =>
      db.lessons
        .filter((l) => l.instrumentId === item.instrumentId && !(l.itemIds ?? []).includes(item.id))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [db.lessons, item.instrumentId, item.id],
  );

  return (
    <section className="stack-sm">
      <div className="section-label">Connections</div>
      <div className="card stack-sm">
        <div className="field">
          <span className="field-label">Pathway stage</span>
          <select
            className="select"
            aria-label="Pathway stage this item belongs to"
            value={item.stageId ?? ''}
            onChange={(e) => placeItemInStage(item.id, e.target.value || undefined)}
          >
            <option value="">Not in a pathway</option>
            {stages.map(({ stage, pathway }) => (
              <option key={stage.id} value={stage.id}>
                {pathway.name} — {stage.code}
                {stage.title !== stage.code ? ` · ${stage.title}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <span className="field-label">Lessons this appeared in</span>
          {linkedLessons.length === 0 && <span className="tiny faint">None linked yet.</span>}
          {linkedLessons.map((l) => (
            <div key={l.id} className="row between small">
              <Link to="/lessons" className="link">
                Class on {l.date}
              </Link>
              <button
                className="btn btn-ghost btn-sm"
                title="Unlink (keeps both)"
                onClick={() => unlinkItemFromLesson(l.id, item.id)}
              >
                Unlink
              </button>
            </div>
          ))}
          {linkableLessons.length > 0 && (
            <select
              className="select"
              aria-label="Link this item to a lesson"
              value=""
              onChange={(e) => e.target.value && linkItemToLesson(e.target.value, item.id)}
            >
              <option value="">Link to a class…</option>
              {linkableLessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.date}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </section>
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

/**
 * Re-arm the pending review from the item itself. Deliberately administrative:
 * it writes ONE date onto the item and its review row (creating that row when
 * none is open — the case the old date helper could not reach, which left a
 * declined review unreachable from here) and does nothing else. No block, no
 * result, no statistics, no spacing progress.
 *
 * A date chosen here is the OWNER's, so the engine protects it until it comes
 * due rather than quietly moving it on the next successful session.
 */
function ScheduleAgain({
  item,
  conflict,
  onSchedule,
}: {
  item: PracticeItemT;
  conflict: { rows: Review[]; message: string } | null;
  onSchedule: (date: ISODate) => void;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<string>('');

  return (
    <div className="stack-sm">
      {conflict && (
        <div className="card card-quiet small" style={{ color: 'var(--tone-warn)' }}>
          <span dir="ltr">{conflict.message}</span>
        </div>
      )}
      {open ? (
        <Field label="Next review">
          <input
            className="input"
            type="date"
            aria-label="Next review date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ maxWidth: 200 }}
          />
          <div className="row" style={{ gap: 6 }}>
            <button
              className="btn btn-sm btn-primary"
              disabled={!date}
              onClick={() => {
                onSchedule(date);
                setOpen(false);
              }}
            >
              Save date
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
          <p className="tiny faint">
            <span dir="ltr">Setting a date records no practice and changes no spaced-repetition state.</span>
          </p>
        </Field>
      ) : (
        <button
          className="btn btn-sm"
          style={{ width: 'fit-content' }}
          onClick={() => {
            // Seeded when it OPENS, from the live item and the real day —
            // never once at mount, which would offer a date that has since
            // been changed elsewhere or a "today" that has since rolled over.
            setDate(item.nextReviewDate ?? todayISODate(new Date()));
            setOpen(true);
          }}
        >
          {item.nextReviewDate ? 'Change review date' : 'Schedule again'}
        </button>
      )}
    </div>
  );
}
