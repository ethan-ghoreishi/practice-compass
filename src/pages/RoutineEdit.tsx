import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { type RoutineSegment } from '../domain';
import { useStore } from '../store/useStore';
import { Field } from '../components/ui';
import { ArrowLeftIcon, MinusIcon, PlusIcon } from '../components/icons';

/**
 * Create or edit a routine. One full-form editor for both: creating starts
 * from an empty (or preselected) shape, editing loads the existing one —
 * "copy Stage 1 and adjust" reaches this same screen via Duplicate.
 */
export default function RoutineEdit() {
  const { routineId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const db = useStore((s) => s.db);
  const activeRoutine = useStore((s) => s.activeRoutine);
  const addRoutine = useStore((s) => s.addRoutine);
  const updateRoutine = useStore((s) => s.updateRoutine);
  const deleteRoutine = useStore((s) => s.deleteRoutine);
  const duplicateRoutine = useStore((s) => s.duplicateRoutine);

  const existing = routineId ? db.pathwayRoutines.find((r) => r.id === routineId) : undefined;
  const instruments = db.instruments.filter((i) => i.active);
  const preselect = params.get('instrument');
  // A brand-new routine defaults to an instrument (required at creation).
  // Editing an EXISTING routine preserves whatever it already has, including
  // no instrument at all — an honestly unscoped legacy routine must not have
  // one invented for it just by being opened and saved.
  const defaultInstrument = existing
    ? (existing.instrumentId ?? '')
    : (preselect && instruments.some((i) => i.id === preselect) ? preselect : instruments[0]?.id) || '';

  const [name, setName] = useState(existing?.name ?? '');
  const [instrumentId, setInstrumentId] = useState(defaultInstrument);
  const [pathwayId, setPathwayId] = useState(existing?.pathwayId ?? params.get('pathway') ?? '');
  const [stageId, setStageId] = useState(existing?.stageId ?? params.get('stage') ?? '');
  const [segments, setSegments] = useState<RoutineSegment[]>(existing?.segments ?? []);

  const backTo = existing?.stageId
    ? `/pathway/${existing.pathwayId}/${existing.stageId}`
    : existing?.pathwayId
      ? `/pathway/${existing.pathwayId}`
      : '/';

  // A General (no-instrument) pathway accepts any routine; otherwise the
  // instruments must match — the same rule the store enforces on save.
  const availablePathways = db.pathways.filter((p) => !p.instrumentId || p.instrumentId === instrumentId);
  const availableStages = pathwayId ? db.pathwayStages.filter((s) => s.pathwayId === pathwayId).sort((a, b) => a.order - b.order) : [];
  const bindableItems = db.items.filter((i) => i.instrumentId === instrumentId);

  function onInstrumentChange(next: string) {
    setInstrumentId(next);
    // Bindings and placement that no longer match are dropped locally too, so
    // the form never shows a state the store wouldn't actually save.
    setSegments((segs) => segs.map((s) => (s.itemId && bindableItemIds(db, next).has(s.itemId) ? s : { ...s, itemId: undefined })));
    if (pathwayId) {
      const p = db.pathways.find((x) => x.id === pathwayId);
      if (p?.instrumentId && p.instrumentId !== next) {
        setPathwayId('');
        setStageId('');
      }
    }
  }

  function onPathwayChange(next: string) {
    setPathwayId(next);
    setStageId('');
  }

  function addSegment() {
    setSegments((s) => [...s, { label: '', minutes: 5 }]);
  }
  function updateSegment(i: number, patch: Partial<RoutineSegment>) {
    setSegments((s) => s.map((seg, idx) => (idx === i ? { ...seg, ...patch } : seg)));
  }
  function removeSegment(i: number) {
    setSegments((s) => s.filter((_, idx) => idx !== i));
  }
  function moveSegment(i: number, dir: -1 | 1) {
    setSegments((s) => {
      const j = i + dir;
      if (j < 0 || j >= s.length) return s;
      const next = [...s];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  const cleanSegments = () =>
    segments
      .filter((s) => s.label.trim())
      .map((s) => ({ ...s, label: s.label.trim(), minutes: Math.max(1, Math.round(s.minutes) || 1) }));

  // A brand-new routine requires an instrument; editing an already-unscoped
  // routine must stay saveable without forcing one to be picked first.
  const canSave = name.trim() !== '' && (instrumentId !== '' || !!existing);

  function save() {
    if (!canSave) return;
    const name_ = name.trim();
    const pathwayId_ = pathwayId || undefined;
    const stageId_ = stageId || undefined;
    const segments_ = cleanSegments();
    if (existing) {
      updateRoutine(existing.id, { name: name_, instrumentId: instrumentId || undefined, pathwayId: pathwayId_, stageId: stageId_, segments: segments_ });
      navigate(backTo, { replace: true });
    } else {
      // canSave guarantees instrumentId is set for a new routine.
      const id = addRoutine({ name: name_, instrumentId, pathwayId: pathwayId_, stageId: stageId_, segments: segments_ });
      navigate(stageId_ ? `/pathway/${pathwayId_}/${stageId_}` : pathwayId_ ? `/pathway/${pathwayId_}` : '/', {
        replace: true,
        state: { newRoutineId: id },
      });
    }
  }

  return (
    <div className="stack-lg">
      <Link to={backTo} className="link row" style={{ gap: 4, width: 'fit-content' }}>
        <ArrowLeftIcon width={16} height={16} /> Back
      </Link>

      <header className="stack-sm">
        <h1 className="page-title">{existing ? 'Edit routine' : 'New routine'}</h1>
      </header>

      <div className="card stack">
        <Field label="Name">
          <input className="input" dir="auto" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My Setar warm-up" />
        </Field>

        <Field
          label="Instrument"
          hint={instrumentId === '' && existing ? 'No instrument set — it stays that way until you choose one.' : undefined}
        >
          <select className="select" value={instrumentId} onChange={(e) => onInstrumentChange(e.target.value)}>
            {instruments.length === 0 && <option value="">No instruments yet</option>}
            {instruments.length > 0 && instrumentId === '' && <option value="">Choose an instrument…</option>}
            {instruments.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid-2">
          <Field label="Pathway (optional)">
            <select className="select" value={pathwayId} onChange={(e) => onPathwayChange(e.target.value)}>
              <option value="">Unplaced — just this routine</option>
              {availablePathways.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Stage (optional)">
            <select className="select" value={stageId} onChange={(e) => setStageId(e.target.value)} disabled={!pathwayId}>
              <option value="">Whole pathway</option>
              {availableStages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      <section className="stack-sm">
        <div className="row between">
          <div className="section-label">Segments</div>
          <button className="btn btn-ghost btn-sm" onClick={addSegment}>
            <PlusIcon /> Add segment
          </button>
        </div>

        {segments.length === 0 && <div className="card card-quiet small dim">No segments yet — add the first one.</div>}

        <div className="stack-sm">
          {segments.map((seg, i) => (
            <div key={i} className="card stack-sm">
              <div className="row" style={{ gap: 8 }}>
                <input
                  className="input grow"
                  dir="auto"
                  placeholder="Segment label"
                  value={seg.label}
                  onChange={(e) => updateSegment(i, { label: e.target.value })}
                />
                <input
                  className="input"
                  type="number"
                  min={1}
                  style={{ width: 72 }}
                  value={seg.minutes}
                  onChange={(e) => updateSegment(i, { minutes: Number(e.target.value) })}
                  aria-label="Minutes"
                />
                <span className="tiny faint">min</span>
              </div>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                <select
                  className="select grow"
                  value={seg.itemId ?? ''}
                  onChange={(e) => updateSegment(i, { itemId: e.target.value || undefined })}
                  aria-label="Bind to a practice item (optional)"
                >
                  <option value="">Unbound — countdown only, not logged</option>
                  {bindableItems.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.title}
                    </option>
                  ))}
                </select>
                <label className="row" style={{ gap: 4, alignItems: 'center' }}>
                  <input type="checkbox" checked={!!seg.essential} onChange={(e) => updateSegment(i, { essential: e.target.checked })} />
                  <span className="tiny">essential</span>
                </label>
              </div>
              <div className="row between">
                <div className="row" style={{ gap: 4 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => moveSegment(i, -1)} disabled={i === 0} aria-label="Move up">
                    ↑
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => moveSegment(i, 1)} disabled={i === segments.length - 1} aria-label="Move down">
                    ↓
                  </button>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => removeSegment(i)} aria-label="Remove segment">
                  <MinusIcon /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="row">
        <button className="btn btn-primary grow" disabled={!canSave} onClick={save}>
          Save
        </button>
      </div>

      {existing && (
        <div className="row" style={{ gap: 8 }}>
          <button
            className="btn"
            onClick={() => {
              const id = duplicateRoutine(existing.id);
              if (id) navigate(`/routine/${id}/edit`, { replace: true });
            }}
          >
            Duplicate
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              const isRunning = activeRoutine?.routineId === existing.id;
              const question = isRunning
                ? `Delete the routine "${existing.name}"? It's currently running — this saves what you've practised so far, then deletes the routine.`
                : `Delete the routine "${existing.name}"?`;
              if (confirm(question)) {
                deleteRoutine(existing.id);
                navigate(backTo, { replace: true });
              }
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function bindableItemIds(db: ReturnType<typeof useStore.getState>['db'], instrumentId: string): Set<string> {
  return new Set(db.items.filter((i) => i.instrumentId === instrumentId).map((i) => i.id));
}
