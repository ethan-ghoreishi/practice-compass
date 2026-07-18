import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  isLosslesslyRemovable,
  routinesOfStage,
  stageProgress,
  stageUnits,
  ITEM_STATUS_LABELS,
  STRAND_LABELS,
  type PathwayRoutine,
  type StageUnit,
} from '../domain';
import { useStore } from '../store/useStore';
import QuickAdd from '../components/QuickAdd';
import { Field } from '../components/ui';
import { ArrowLeftIcon, CheckIcon, MinusIcon, PlayIcon, PlusIcon, XIcon } from '../components/icons';

export default function StageDetail() {
  const { pathwayId, stageId } = useParams();
  const db = useStore((s) => s.db);
  const updateStage = useStore((s) => s.updateStage);
  const deleteStage = useStore((s) => s.deleteStage);
  const updatePathway = useStore((s) => s.updatePathway);
  const addFromCatalog = useStore((s) => s.addFromCatalog);
  const removeCatalogItem = useStore((s) => s.removeCatalogItem);
  const startItemSession = useStore((s) => s.startItemSession);
  const navigate = useNavigate();

  const stage = db.pathwayStages.find((s) => s.id === stageId);
  const pathway = stage ? db.pathways.find((p) => p.id === stage.pathwayId) : undefined;
  const units = useMemo(() => (stage ? stageUnits(stage, db.items) : []), [stage, db.items]);
  const routines = useMemo(() => (stage ? routinesOfStage(db.pathwayRoutines, stage.id) : []), [db.pathwayRoutines, stage]);
  const blocksOf = (itemId: string) => db.blocks.filter((b) => b.practiceItemId === itemId);

  const [editing, setEditing] = useState(false);
  const [editCode, setEditCode] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editIntro, setEditIntro] = useState('');
  const [undo, setUndo] = useState<{ id: string; title: string } | null>(null);

  if (!stage) {
    return (
      <div className="stack">
        <Link to="/repertoire" className="link">
          ← Back to repertoire
        </Link>
        <div className="card">That stage doesn't exist.</div>
      </div>
    );
  }

  const sp = stageProgress(units);
  const backTo = `/pathway/${pathwayId}`;
  const here = `/pathway/${pathwayId}/${stageId}`;
  const isPinned = pathway?.currentStageId === stage.id;
  const hasSuggestions = units.some((u) => !u.item);

  function startEdit() {
    setEditCode(stage!.code);
    setEditTitle(stage!.title);
    setEditIntro(stage!.intro ?? '');
    setEditing(true);
  }
  function saveEdit() {
    updateStage(stage!.id, {
      code: editCode.trim() || stage!.code,
      title: editTitle.trim() || editCode,
      intro: editIntro.trim() || undefined,
    });
    setEditing(false);
  }

  function addSuggestion(unit: StageUnit) {
    const id = addFromCatalog(stage!.id, unit.key);
    // Adding is organisation, not commitment — the undo card lingers calmly
    // until dismissed or you leave, rather than vanishing on a timer.
    setUndo({ id, title: unit.title });
  }

  function practise(unit: StageUnit) {
    const itemId = unit.item?.id ?? addFromCatalog(stage!.id, unit.key);
    startItemSession(itemId);
    navigate('/active');
  }

  return (
    <div className="stack-lg">
      <Link to={backTo} className="link row" style={{ gap: 4, width: 'fit-content' }}>
        <ArrowLeftIcon width={16} height={16} /> Pathway
      </Link>

      {editing ? (
        <div className="card stack-sm">
          <div className="grid-2">
            <Field label="Code">
              <input className="input" dir="auto" value={editCode} onChange={(e) => setEditCode(e.target.value)} />
            </Field>
            <Field label="Title">
              <input className="input" dir="auto" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </Field>
          </div>
          <Field label="Intro">
            <textarea className="textarea" dir="auto" value={editIntro} onChange={(e) => setEditIntro(e.target.value)} />
          </Field>
          <div className="row">
            <button className="btn btn-primary grow" onClick={saveEdit}>
              Save
            </button>
            <button className="btn" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                if (confirm(`Delete the stage "${stage.code}"? Your items are kept — they just leave the stage.`)) {
                  deleteStage(stage.id);
                  navigate(backTo);
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <header className="stack-sm">
          <h1 className="page-title">
            {stage.code}
            {stage.title !== stage.code ? ` · ${stage.title}` : ''}
          </h1>
          {stage.intro && <p className="page-sub">{stage.intro}</p>}
          <div className="row" style={{ gap: 8 }}>
            <span className="balance-track grow" style={{ maxWidth: 220 }}>
              <span className="balance-fill" style={{ width: `${sp.percent}%` }} />
            </span>
            <span className="tiny faint mono-num">
              {sp.done}/{sp.total} solid
            </span>
          </div>
          <div className="row" style={{ gap: 8 }}>
            {pathway && (
              <button
                className={`btn btn-sm${isPinned ? ' btn-primary' : ''}`}
                aria-pressed={isPinned}
                title="Make this the stage Today points to for this instrument"
                onClick={() => updatePathway(pathway.id, { currentStageId: isPinned ? undefined : stage.id })}
              >
                {isPinned ? 'Current stage ✓' : 'Set as current stage'}
              </button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={startEdit}>
              Edit
            </button>
          </div>
        </header>
      )}

      {routines.length > 0 && (
        <section className="stack-sm">
          <div className="section-label">Guided routines</div>
          {routines.map((r) => (
            <RoutineCard key={r.id} routine={r} onStart={() => navigate(`/routine/${r.id}`)} />
          ))}
        </section>
      )}

      <section className="stack-sm">
        <div className="section-label">In this stage</div>
        {undo && (
          <div className="card card-quiet row between small" style={{ gap: 8 }}>
            <span className="truncate" dir="auto">
              Added “{undo.title}” — not practised yet.
            </span>
            <div className="row" style={{ gap: 6, flex: 'none' }}>
              <button
                className="btn btn-sm"
                onClick={() => {
                  // Re-checks live state (a block may have been logged since the
                  // banner appeared) — never silently deletes practised work.
                  removeCatalogItem(undo.id);
                  setUndo(null);
                }}
              >
                Undo
              </button>
              <button
                className="btn btn-ghost btn-sm"
                aria-label="Dismiss"
                style={{ minHeight: 30, padding: '0 6px' }}
                onClick={() => setUndo(null)}
              >
                <XIcon width={14} height={14} />
              </button>
            </div>
          </div>
        )}
        <div className="stack-sm">
          {units.map((u) => (
            <UnitRow
              key={u.key}
              unit={u}
              returnTo={here}
              removable={!!u.item && isLosslesslyRemovable(u.item, blocksOf(u.item.id))}
              onPractise={() => practise(u)}
              onAdd={() => addSuggestion(u)}
              onRemove={() => {
                if (u.item) removeCatalogItem(u.item.id);
              }}
            />
          ))}
          {units.length === 0 && (
            <div className="card card-quiet small dim">Nothing here yet — add your first piece below.</div>
          )}
        </div>
        <QuickAdd stageId={stage.id} />
        <div className="tiny faint">
          Anything you add here is a normal practice item — it also appears under “All items” and in recommendations.
          {hasSuggestions && (
            <>
              {' '}
              Greyed entries are <strong>reference suggestions</strong>
              {pathway?.source ? ` (from ${pathway.source})` : ''} — a starting aid, not a fixed syllabus; everything is
              editable once added.
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function UnitRow({
  unit,
  returnTo,
  removable,
  onPractise,
  onAdd,
  onRemove,
}: {
  unit: StageUnit;
  returnTo: string;
  removable: boolean;
  onPractise: () => void;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const navigate = useNavigate();
  const item = unit.item;

  // One line of metadata, never duplicated: strand, then the item's status
  // (which is exactly "Not practised yet" for a freshly-added suggestion), or
  // the reference hint before it is added. The status lives here alone — there
  // is no separate status badge on the row.
  const meta = [
    unit.strand ? STRAND_LABELS[unit.strand] : null,
    item ? ITEM_STATUS_LABELS[item.status] : 'reference suggestion — tap to add',
    item?.assignedForLesson ? 'for class' : null,
  ].filter(Boolean);

  return (
    <div className={`card stage-unit${removable ? ' stage-unit--removable' : ''}${unit.state === 'done' ? ' card-quiet' : ''}`}>
      <span
        className="stage-badge"
        style={{
          width: 34,
          height: 34,
          background:
            unit.state === 'done' ? 'var(--tone-good-soft)' : unit.state === 'in_progress' ? 'var(--accent-soft)' : 'var(--surface-2)',
          color: unit.state === 'done' ? 'var(--tone-good)' : unit.state === 'in_progress' ? 'var(--accent)' : 'var(--text-faint)',
        }}
      >
        {unit.state === 'done' ? <CheckIcon width={16} height={16} /> : unit.state === 'in_progress' ? '·' : ''}
      </span>

      <button
        className="stage-unit-text"
        onClick={() => (item ? navigate(`/items/${item.id}`, { state: { from: returnTo } }) : onAdd())}
        title={item ? 'Open item' : 'Add to your items'}
      >
        <div className="stage-unit-title" dir="auto">
          {unit.title}
        </div>
        <div className="tiny faint">{meta.join(' · ')}</div>
        {unit.entry?.about && !item && (
          <div className="tiny dim" style={{ marginTop: 3 }}>
            {unit.entry.about}
          </div>
        )}
      </button>

      {/* A freshly-added catalog item (no practice logged) keeps a lossless
          Remove so undo stays reachable after the banner is gone — it reverts
          the row to a suggestion. It disappears the moment practice begins. */}
      {removable && (
        <button
          className="btn btn-ghost stage-unit-action"
          onClick={onRemove}
          aria-label={`Remove ${unit.title} — no practice logged`}
          title="Remove (no practice logged)"
        >
          <MinusIcon />
        </button>
      )}

      {/* Fixed-size trailing action: Play once added, Add before. */}
      {item ? (
        <button className="btn btn-primary stage-unit-action" onClick={onPractise} aria-label={`Practise ${unit.title}`}>
          <PlayIcon />
        </button>
      ) : (
        <button className="btn stage-unit-action" onClick={onAdd} aria-label={`Add ${unit.title} to your items`}>
          <PlusIcon />
        </button>
      )}
    </div>
  );
}

function RoutineCard({ routine, onStart }: { routine: PathwayRoutine; onStart: () => void }) {
  const total = routine.segments.reduce((s, x) => s + x.minutes, 0);
  return (
    <article className="card row between">
      <div>
        <div className="title-md" style={{ fontSize: '1.02rem' }}>
          {routine.name}
        </div>
        <div className="tiny faint">
          {routine.segments.length} segments · {total} min · guided warm-up, not logged as practice
        </div>
      </div>
      <button className="btn btn-primary btn-sm" onClick={onStart}>
        <PlayIcon /> Start
      </button>
    </article>
  );
}
