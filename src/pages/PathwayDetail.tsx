import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  currentStage,
  groupStages,
  pathwayProgress,
  routinesOfPathway,
  stageProgress,
  stagesOfPathway,
  stageUnits,
  courseForPathway,
  offeredCourseLevels,
  type CourseLevelOffer,
  type PathwayRoutine,
  type PathwayStage,
} from '../domain';
import { useStore } from '../store/useStore';
import { instrumentName } from '../store/lookups';
import { Field } from '../components/ui';
import RoutineDuration from '../components/RoutineDuration';
import { ArrowLeftIcon, CheckIcon, ChevronRightIcon, PlayIcon, PlusIcon } from '../components/icons';

export default function PathwayDetail() {
  const { pathwayId } = useParams();
  const db = useStore((s) => s.db);
  const updatePathway = useStore((s) => s.updatePathway);
  const deletePathway = useStore((s) => s.deletePathway);
  const addStage = useStore((s) => s.addStage);
  const addCourseLevels = useStore((s) => s.addCourseLevels);
  const moveStage = useStore((s) => s.moveStage);
  const renameSection = useStore((s) => s.renameSection);
  const navigate = useNavigate();

  const pathway = db.pathways.find((p) => p.id === pathwayId);
  const stages = useMemo(() => (pathway ? stagesOfPathway(db.pathwayStages, pathway.id) : []), [db.pathwayStages, pathway]);
  // Routines placed on the pathway itself (no stage) — stage-scoped ones show on their stage instead.
  const pathwayRoutines = useMemo(
    () => (pathway ? routinesOfPathway(db.pathwayRoutines, pathway.id).filter((r) => !r.stageId) : []),
    [db.pathwayRoutines, pathway],
  );

  const [editing, setEditing] = useState(false);
  const [addingStage, setAddingStage] = useState(false);
  const [stageCode, setStageCode] = useState('');
  const [stageTitle, setStageTitle] = useState('');
  /** '' = no section; '__new__' = create a new section name. */
  const [stageGroup, setStageGroup] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [renamingGroup, setRenamingGroup] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  if (!pathway) {
    return (
      <div className="stack">
        <Link to="/repertoire" className="link">
          ← Back to repertoire
        </Link>
        <div className="card">That pathway doesn’t exist.</div>
      </div>
    );
  }

  const current = currentStage(db.pathwayStages, db.items, pathway.id, pathway.currentStageId);
  const prog = pathwayProgress(db.pathwayStages, db.items, pathway.id);
  const grouped = groupStages(stages);
  const groupNames = [...new Set(stages.map((s) => s.group).filter((g): g is string => !!g))];

  function submitStage() {
    if (!stageTitle.trim() && !stageCode.trim()) return;
    const group = stageGroup === '__new__' ? newGroupName.trim() : stageGroup;
    addStage(pathway!.id, {
      code: stageCode || stageTitle.slice(0, 6),
      title: stageTitle || stageCode,
      group: group || undefined,
    });
    setStageCode('');
    setStageTitle('');
    setNewGroupName('');
    setAddingStage(false);
  }

  return (
    <div className="stack-lg">
      <Link to="/repertoire" className="link row" style={{ gap: 4, width: 'fit-content' }}>
        <ArrowLeftIcon width={16} height={16} /> Repertoire
      </Link>

      {editing ? (
        <PathwayEditForm
          pathway={pathway}
          instruments={db.instruments}
          onSave={(patch) => {
            updatePathway(pathway.id, patch);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <header className="stack-sm" dir="auto">
          <h1 className="page-title">{pathway.name}</h1>
          {/* The instrument name is the owner's own editable text (renameable
              in Settings, Farsi included) — its own dir="auto" isolate, same
              as pathway.source right after it, so neither is pinned to a
              foreign LTR base or speaks for the other. The 'General'
              fallback (no instrument) is plain ASCII and resolves the same
              way under dir="auto". */}
          <div className="tiny faint">
            <span dir="auto">{pathway.instrumentId ? instrumentName(db, pathway.instrumentId) : 'General'}</span>
            {pathway.source && (
              <>
                {' · '}
                <span dir="auto">{pathway.source}</span>
              </>
            )}
          </div>
          {/* description/note are authored independently of the pathway's own
              name (a user can edit either on its own) — their own dir="auto"
              isolates resolve from their own content, not from pathway.name's. */}
          {pathway.description && (
            <p className="page-sub" dir="auto">
              {pathway.description}
            </p>
          )}
          {pathway.note && (
            <div className="card card-quiet small dim" dir="auto" style={{ marginTop: 4 }}>
              {pathway.note}
            </div>
          )}
          <div className="row" style={{ gap: 8, marginTop: 4 }}>
            <button className="btn btn-sm" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => {
                if (confirm(`Delete the pathway “${pathway.name}” and all its stages? Your practice items are kept.`)) {
                  deletePathway(pathway.id);
                  navigate('/repertoire');
                }
              }}
            >
              Delete
            </button>
          </div>
        </header>
      )}

      {current && (
        <article className="card card-accent stack-sm">
          <div className="row between">
            <span className="eyebrow">You are here</span>
            <span className="tiny faint mono-num">
              {prog.done}/{prog.total} solid
            </span>
          </div>
          <div className="title-md" style={{ fontSize: '1.2rem' }}>
            {current.code}
            {current.title !== current.code ? ` · ${current.title}` : ''}
          </div>
          <Link to={`/pathway/${pathway.id}/${current.id}`} className="btn btn-primary">
            Continue this stage
          </Link>
        </article>
      )}

      <section className="stack-sm">
        <div className="row between">
          <div className="section-label">Guided routines</div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(`/routine/new?instrument=${pathway.instrumentId ?? ''}&pathway=${pathway.id}`)}
          >
            <PlusIcon /> New routine
          </button>
        </div>
        {pathwayRoutines.map((r) => (
          <RoutineRow
            key={r.id}
            routine={r}
            onStart={(short) => navigate(`/routine/${r.id}${short ? '?short=1' : ''}`)}
            onEdit={() => navigate(`/routine/${r.id}/edit`)}
          />
        ))}
        {pathwayRoutines.length === 0 && <div className="card card-quiet small dim">No pathway-level routines — stage routines show on their stage.</div>}
      </section>

      <section className="stack-sm">
        <div className="row between">
          <div className="section-label">Stages</div>
          <button className="btn btn-ghost btn-sm" onClick={() => setAddingStage((a) => !a)}>
            <PlusIcon /> Add stage
          </button>
        </div>

        {pathway && (
          <CourseLevels
            pathwayId={pathway.id}
            stages={db.pathwayStages}
            onAdd={(keys) => addCourseLevels(pathway.id, keys)}
          />
        )}

        {addingStage && (
          <div className="card stack-sm">
            <div className="grid-2">
              <Field label="Short code">
                <input className="input" dir="auto" placeholder="e.g. 2A / Shur" value={stageCode} onChange={(e) => setStageCode(e.target.value)} />
              </Field>
              <Field label="Section" hint="Which part of the path this stage sits in.">
                <select className="select" value={stageGroup} onChange={(e) => setStageGroup(e.target.value)} aria-label="Section for the new stage">
                  <option value="">No section</option>
                  {groupNames.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                  <option value="__new__">New section…</option>
                </select>
              </Field>
            </div>
            {stageGroup === '__new__' && (
              <Field label="New section name">
                <input className="input" dir="auto" placeholder="e.g. Book 3" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
              </Field>
            )}
            <Field label="Title">
              <input className="input" dir="auto" value={stageTitle} onChange={(e) => setStageTitle(e.target.value)} />
            </Field>
            <button className="btn btn-primary" onClick={submitStage}>
              Add stage
            </button>
          </div>
        )}

        {grouped.map((g, gi) => (
          <div key={gi} className="stack-sm">
            {g.group &&
              (renamingGroup === g.group ? (
                <div className="row" style={{ gap: 8, marginTop: gi ? 8 : 0 }}>
                  <input
                    className="input grow"
                    dir="auto"
                    value={renameValue}
                    autoFocus
                    aria-label={`Rename section ${g.group}`}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && renameValue.trim()) {
                        renameSection(pathway.id, g.group, renameValue);
                        setRenamingGroup(null);
                      }
                      if (e.key === 'Escape') setRenamingGroup(null);
                    }}
                  />
                  <button
                    className="btn btn-sm btn-primary"
                    disabled={!renameValue.trim()}
                    onClick={() => {
                      renameSection(pathway.id, g.group, renameValue);
                      setRenamingGroup(null);
                    }}
                  >
                    Save
                  </button>
                  <button className="btn btn-sm" onClick={() => setRenamingGroup(null)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="row between" style={{ marginTop: gi ? 8 : 0 }}>
                  <div className="small dim" style={{ fontWeight: 600 }} dir="auto">
                    {g.group}
                  </div>
                  <button
                    className="link tiny"
                    style={{ background: 'none', border: 'none' }}
                    onClick={() => {
                      setRenamingGroup(g.group!);
                      setRenameValue(g.group!);
                    }}
                  >
                    rename
                  </button>
                </div>
              ))}
            {g.stages.map((stage) => (
              <StageRow
                key={stage.id}
                stage={stage}
                num={stages.findIndex((s) => s.id === stage.id) + 1}
                db={db}
                isCurrent={stage.id === current?.id}
                isPinned={pathway.currentStageId === stage.id}
                onOpen={() => navigate(`/pathway/${pathway.id}/${stage.id}`)}
                onMove={(d) => moveStage(stage.id, d)}
              />
            ))}
          </div>
        ))}

        {stages.length === 0 && <div className="card card-quiet small dim">No stages yet — add the first one above.</div>}
      </section>
    </div>
  );
}

function StageRow({
  stage,
  num,
  db,
  isCurrent,
  isPinned,
  onOpen,
  onMove,
}: {
  stage: PathwayStage;
  num: number;
  db: ReturnType<typeof useStore.getState>['db'];
  isCurrent: boolean;
  isPinned: boolean;
  onOpen: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const sp = stageProgress(stageUnits(stage, db.items));
  return (
    <div className={`card list-row${isCurrent ? ' card-accent' : ''}`} style={{ padding: 'var(--space-3) var(--space-4)' }}>
      <div
        className="stage-badge"
        style={{
          background: sp.complete ? 'var(--tone-good-soft)' : isCurrent ? 'var(--accent-soft)' : 'var(--surface-2)',
          color: sp.complete ? 'var(--tone-good)' : isCurrent ? 'var(--accent)' : 'var(--text-dim)',
        }}
      >
        {sp.complete ? <CheckIcon width={18} height={18} /> : num}
      </div>
      <button className="grow" dir="auto" style={{ background: 'none', border: 'none', textAlign: 'start', cursor: 'pointer', color: 'inherit' }} onClick={onOpen}>
        {/* stage.code leads (the group's own anchor); the badges after it are
            fixed English, never user text — each gets its own dir="ltr"
            isolate so it can't inherit stage.code's RTL base. */}
        <div className="row" style={{ gap: 8 }}>
          <span>{stage.code}</span>
          {isCurrent && (
            <span className="badge tone-progress" dir="ltr">{isPinned ? 'Current · pinned' : 'Current'}</span>
          )}
          {sp.complete && <span className="badge tone-good" dir="ltr">Done</span>}
          {sp.addedItems > 0 && !sp.complete && (
            <span className="tiny faint" dir="ltr">{sp.addedItems} item{sp.addedItems === 1 ? '' : 's'}</span>
          )}
        </div>
        {/* stage.title is the SAME stage's own fuller name, not a value
            authored independently of stage.code — it stays bare, exactly
            like stage.code's own span above, so the two agree on whichever
            direction the group resolves rather than one silently
            overriding the other. The piece-count fallback (rendered only
            when title and code are the same) is generated English and
            gets its own dir="ltr" isolate. */}
        <div className="tiny faint">
          {stage.title !== stage.code ? (
            <span>{stage.title}</span>
          ) : (
            <span dir="ltr">{sp.total} piece{sp.total === 1 ? '' : 's'}</span>
          )}
        </div>
        <div className="row" style={{ gap: 8, marginTop: 6 }}>
          <span className="balance-track grow" style={{ maxWidth: 180 }}>
            <span className="balance-fill" style={{ width: `${sp.percent}%` }} />
          </span>
          <span className="tiny faint mono-num">
            {sp.done}/{sp.total}
          </span>
        </div>
      </button>
      <div className="stack" style={{ gap: 2 }}>
        <button className="btn btn-ghost btn-sm" style={{ minHeight: 22, padding: '0 6px' }} onClick={() => onMove(-1)} aria-label="Move up">
          ↑
        </button>
        <button className="btn btn-ghost btn-sm" style={{ minHeight: 22, padding: '0 6px' }} onClick={() => onMove(1)} aria-label="Move down">
          ↓
        </button>
      </div>
      <ChevronRightIcon width={16} height={16} className="faint" onClick={onOpen} style={{ cursor: 'pointer' }} />
    </div>
  );
}

function RoutineRow({
  routine,
  onStart,
  onEdit,
}: {
  routine: PathwayRoutine;
  onStart: (shortOnTime: boolean) => void;
  onEdit: () => void;
}) {
  const total = routine.segments.reduce((s, x) => s + x.minutes, 0);
  const hasEssential = routine.segments.some((s) => s.essential);
  return (
    <article className="card stack-sm">
      <div className="row between">
        <div dir="auto">
          <div className="title-md" style={{ fontSize: '1.02rem' }}>
            {routine.name}
          </div>
          {/* Generated English metadata, never user text — its own dir="ltr"
              isolate keeps it from inheriting a Farsi routine name's RTL base. */}
          <div className="tiny faint">
            <span dir="ltr">{routine.segments.length} segments · {total} min</span>
          </div>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn btn-ghost btn-sm" onClick={onEdit}>
            Edit
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onStart(false)}>
            <PlayIcon /> Start
          </button>
        </div>
      </div>
      {hasEssential && (
        <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-end' }} onClick={() => onStart(true)}>
          Short on time — essentials only
        </button>
      )}
      <RoutineDuration routine={routine} />
    </article>
  );
}

/**
 * "Add new levels from this course" — a COURSE-SCOPED action, deliberately
 * separate from "restore default pathways", which is unchanged.
 *
 * It adds nothing on its own: it OFFERS the levels this course has and this
 * pathway does not, and adds only the ones ticked. That is the whole point of
 * not folding this into `reseedDefaultPathways` — a stage the owner
 * deliberately deleted has an absent deterministic id exactly like a
 * never-seeded one, so an additive shipped button would silently resurrect it.
 * Here it reappears in a LIST, never in the pathway, and only if they choose it.
 */
function CourseLevels({
  pathwayId,
  stages,
  onAdd,
}: {
  pathwayId: string;
  stages: PathwayStage[];
  onAdd: (groupKeys: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const course = courseForPathway(pathwayId);
  const offers: CourseLevelOffer[] = useMemo(
    () => (course ? offeredCourseLevels(course, stages) : []),
    [course, stages],
  );
  if (!course || offers.length === 0) return null;

  if (!open) {
    return (
      <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => setOpen(true)}>
        <PlusIcon /> Add new levels from this course ({offers.length})
      </button>
    );
  }

  return (
    <div className="card stack-sm">
      <div className="tiny faint" style={{ textAlign: 'start' }}>
        {/* Fixed English page copy, never user text — inline LTR isolate. */}
        <span dir="ltr">
          Levels this course has that this pathway does not. Nothing is added unless you tick it.
        </span>
      </div>
      {offers.map((o) => (
        <label key={o.groupKey} className="row" style={{ gap: 8 }}>
          <input
            type="checkbox"
            checked={picked.includes(o.groupKey)}
            onChange={(e) =>
              setPicked((p) => (e.target.checked ? [...p, o.groupKey] : p.filter((k) => k !== o.groupKey)))
            }
          />
          {/* The course's own level code and focus line — generated reference
              data from `courseData.ts`, never the owner's text and never
              renameable, so it carries its own inline LTR isolate rather than
              resolving from whatever else is on the row. */}
          <span dir="ltr">
            {o.code} — {o.title}
          </span>
        </label>
      ))}
      <div className="row" style={{ gap: 6 }}>
        <button
          className="btn btn-primary btn-sm"
          disabled={picked.length === 0}
          onClick={() => {
            onAdd(picked);
            setPicked([]);
            setOpen(false);
          }}
        >
          Add {picked.length} level{picked.length === 1 ? '' : 's'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function PathwayEditForm({
  pathway,
  instruments,
  onSave,
  onCancel,
}: {
  pathway: { name: string; instrumentId?: string; source?: string; description?: string; note?: string };
  instruments: { id: string; name: string }[];
  onSave: (patch: { name: string; instrumentId?: string; source?: string; description?: string; note?: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(pathway.name);
  const [instrumentId, setInstrumentId] = useState(pathway.instrumentId ?? '');
  const [source, setSource] = useState(pathway.source ?? '');
  const [description, setDescription] = useState(pathway.description ?? '');
  const [note, setNote] = useState(pathway.note ?? '');
  return (
    <div className="card stack">
      <Field label="Name">
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Instrument">
        <select className="select" value={instrumentId} onChange={(e) => setInstrumentId(e.target.value)}>
          <option value="">General (no instrument)</option>
          {instruments.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Based on / reference" hint="Where this route comes from — e.g. CGS syllabus, your teacher's plan.">
        <input className="input" dir="auto" value={source} onChange={(e) => setSource(e.target.value)} />
      </Field>
      <Field label="Description">
        <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <Field label="How you'll use it">
        <textarea className="textarea" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      <div className="row">
        <button
          className="btn btn-primary grow"
          disabled={!name.trim()}
          onClick={() => onSave({ name: name.trim(), instrumentId: instrumentId || undefined, source: source.trim() || undefined, description: description.trim() || undefined, note: note.trim() || undefined })}
        >
          Save
        </button>
        <button className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
