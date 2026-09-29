import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  hiddenUnits,
  linkCandidates,
  pathwayStageContext,
  routinesOfStage,
  stageProgress,
  stageUnits,
  ITEM_STATUS_LABELS,
  STRAND_LABELS,
  type Material,
  type PathwayRoutine,
  type StageUnit,
  courseStage,
  itemsPreparedForLesson,
} from '../domain';
import { useStore } from '../store/useStore';
import QuickAdd from '../components/QuickAdd';
import RoutineDuration from '../components/RoutineDuration';
import { Field } from '../components/ui';
import { ItemChoice, SourceChoice } from '../components/ReferenceChoices';
import { ArrowLeftIcon, CheckIcon, PlayIcon, PlusIcon } from '../components/icons';

export default function StageDetail() {
  const { pathwayId, stageId } = useParams();
  const db = useStore((s) => s.db);
  const updateStage = useStore((s) => s.updateStage);
  const deleteStage = useStore((s) => s.deleteStage);
  const updatePathway = useStore((s) => s.updatePathway);
  const addFromCatalog = useStore((s) => s.addFromCatalog);
  const addCourseRoutine = useStore((s) => s.addCourseRoutine);
  const linkReference = useStore((s) => s.linkReference);
  const unlinkReference = useStore((s) => s.unlinkReference);
  const removeFromPathway = useStore((s) => s.removeFromPathway);
  const setReferenceHidden = useStore((s) => s.setReferenceHidden);
  const chooseCourseSource = useStore((s) => s.chooseCourseSource);
  const startItemSession = useStore((s) => s.startItemSession);
  const activeRoutine = useStore((s) => s.activeRoutine);
  const navigate = useNavigate();

  const stage = db.pathwayStages.find((s) => s.id === stageId);
  const pathway = stage ? db.pathways.find((p) => p.id === stage.pathwayId) : undefined;
  // The pathway's instrument and hidden suggestions: every row, the progress
  // bar and the next suggestion read the SAME resolution.
  const ctx = useMemo(() => pathwayStageContext(pathway), [pathway]);
  const units = useMemo(() => (stage ? stageUnits(stage, db.items, ctx) : []), [stage, db.items, ctx]);
  const hidden = useMemo(() => (stage ? hiddenUnits(stage, db.items, ctx) : []), [stage, db.items, ctx]);
  const routines = useMemo(() => (stage ? routinesOfStage(db.pathwayRoutines, stage.id) : []), [db.pathwayRoutines, stage]);
  // "for class" is a commitment to a NAMED class in the lesson agenda, not a
  // rolling flag on the item.
  const committedItemIds = useMemo(
    () => itemsPreparedForLesson(db.lessonAgenda, db.lessons, new Date()),
    [db.lessonAgenda, db.lessons],
  );

  const [editing, setEditing] = useState(false);
  const [editCode, setEditCode] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editIntro, setEditIntro] = useState('');
  // What the last tap did, said plainly — never an Undo that deletes.
  const [notice, setNotice] = useState<string | null>(null);
  // An explicit choice in progress: which item a suggestion is, or which
  // study source a course is.
  const [choosing, setChoosing] = useState<{ unit: StageUnit; mode: 'link' | 'ambiguous' } | null>(null);
  const [sourceChoice, setSourceChoice] = useState<{ itemId: string; materials: Material[] } | null>(null);
  // A stage this course owns can write two routines from the course's own
  // syllabus. Both become ORDINARY EDITABLE routines — neither is a live view.
  const course = stageId ? courseStage(stageId) : undefined;

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
    const result = addFromCatalog(stage!.id, unit.key);
    // Two of the owner's items already answer this suggestion: nothing was
    // created or picked — the owner chooses.
    if (result.candidates) {
      setChoosing({ unit, mode: 'ambiguous' });
      return;
    }
    setNotice(result.created ? `Added “${unit.title}” to your items — not practised yet.` : `“${unit.title}” is already one of your items.`);
    if (result.sourceCandidates) setSourceChoice({ itemId: result.id, materials: result.sourceCandidates });
  }

  function practise(unit: StageUnit) {
    // A routine is running: resolve it there rather than trying to start a
    // block alongside it — startItemSession would just no-op and leave the
    // user on a dead "no block in progress" screen.
    if (activeRoutine) {
      navigate(`/routine/${activeRoutine.routineId}${activeRoutine.shortOnTime ? '?short=1' : ''}`);
      return;
    }
    const itemId = unit.item?.id ?? addFromCatalog(stage!.id, unit.key).id;
    if (!itemId) {
      setChoosing({ unit, mode: 'ambiguous' });
      return;
    }
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

      <section className="stack-sm">
        <div className="row between">
          <div className="section-label">Guided routines</div>
          {pathway && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate(`/routine/new?instrument=${pathway.instrumentId ?? ''}&pathway=${pathway.id}&stage=${stage.id}`)}
            >
              <PlusIcon /> New routine
            </button>
          )}
        </div>
        {routines.map((r) => (
          <RoutineCard
            key={r.id}
            routine={r}
            onStart={(short) => navigate(`/routine/${r.id}${short ? '?short=1' : ''}`)}
            onEdit={() => navigate(`/routine/${r.id}/edit`)}
          />
        ))}
        {course && course.group.routine.length > 0 && (
          <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
            <button
              className="btn btn-sm"
              onClick={() => {
                const id = addCourseRoutine(stage.id, 'level');
                if (id) navigate(`/routine/${id}/edit`);
              }}
            >
              Use this level’s routine
            </button>
            <button
              className="btn btn-sm"
              onClick={() => {
                const id = addCourseRoutine(stage.id, 'position');
                if (id) navigate(`/routine/${id}/edit`);
              }}
            >
              Build one for where I am
            </button>
          </div>
        )}
        {course && course.group.routine.length > 0 && (
          <div className="tiny faint" style={{ textAlign: 'start' }}>
            {/* Fixed English page copy, never user text — inline LTR isolate. */}
            <span dir="ltr">
              Both write an ordinary routine you can reorder and retime. “Where I am” is the previous
              level’s essentials plus only the sections you have already added.
            </span>
          </div>
        )}
      </section>

      <section className="stack-sm">
        <div className="section-label">In this stage</div>
        {notice && (
          <p className="tiny dim" role="status" style={{ margin: 0 }}>
            {notice}
          </p>
        )}
        {sourceChoice && course && (
          <SourceChoice
            courseName={course.course.sourceName}
            materials={sourceChoice.materials}
            onChoose={(materialId) => {
              chooseCourseSource(sourceChoice.itemId, materialId, course.course.id);
              setSourceChoice(null);
            }}
            onCancel={() => setSourceChoice(null)}
          />
        )}
        <div className="stack-sm">
          {units.map((u) =>
            choosing?.unit.key === u.key ? (
              <ItemChoice
                key={u.key}
                heading={choosing.mode === 'ambiguous' ? `Which item is “${u.title}”?` : `Link an existing item to “${u.title}”`}
                explanation={
                  choosing.mode === 'ambiguous'
                    ? 'More than one of your items answers this suggestion. Choose the one it is — every item stays exactly as it is.'
                    : 'Choose one of your items on this instrument. Nothing about it changes except that it now answers this suggestion.'
                }
                items={choosing.mode === 'ambiguous' ? u.candidates ?? [] : linkCandidates(db.items, ctx.instrumentId, u.entry?.title ?? u.title)}
                sameTitle={(i) => i.title.trim() === (u.entry?.title ?? u.title).trim()}
                onChoose={(itemId) => {
                  const refusal = pathway && u.ref ? linkReference(pathway.id, u.ref, itemId) : 'This suggestion cannot be linked.';
                  if (!refusal) {
                    setChoosing(null);
                    setNotice(`Linked — “${db.items.find((i) => i.id === itemId)?.title ?? ''}” now answers this suggestion.`);
                  }
                  return refusal;
                }}
                onCancel={() => setChoosing(null)}
              />
            ) : (
              <UnitRow
                key={u.key}
                unit={u}
                returnTo={here}
                committedItemIds={committedItemIds}
                onPractise={() => practise(u)}
                onAdd={() => addSuggestion(u)}
                onChoose={() => setChoosing({ unit: u, mode: u.candidates ? 'ambiguous' : 'link' })}
                onHide={pathway && u.ref ? () => setReferenceHidden(pathway.id, u.ref!, true) : undefined}
                onUnlink={u.item && u.ref ? () => unlinkReference(u.item!.id, u.ref!) : undefined}
                onRemoveFromPathway={u.item && pathway ? () => removeFromPathway(u.item!.id, pathway.id) : undefined}
              />
            ),
          )}
          {units.length === 0 && (
            <div className="card card-quiet small dim">Nothing here yet — add your first piece below.</div>
          )}
        </div>
        {hidden.length > 0 && pathway && (
          <details className="card card-quiet">
            <summary className="small">Hidden suggestions ({hidden.length})</summary>
            <p className="tiny dim">Hidden here only. Your own items stay in My repertoire and in this stage if you placed them.</p>
            <div className="stack-sm">
              {hidden.map((u) => (
                <div key={u.key} className="row between" style={{ gap: 8 }}>
                  <span className="small" dir="auto">
                    {u.title}
                  </span>
                  <button
                    className="btn btn-sm"
                    aria-label={`Restore ${u.title}`}
                    onClick={() => setReferenceHidden(pathway.id, u.ref!, false)}
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </details>
        )}
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
  committedItemIds,
  onPractise,
  onAdd,
  onChoose,
  onHide,
  onUnlink,
  onRemoveFromPathway,
}: {
  unit: StageUnit;
  returnTo: string;
  /** Items with a live commitment to a specific class (the lesson agenda). */
  committedItemIds: Set<string>;
  onPractise: () => void;
  onAdd: () => void;
  onChoose: () => void;
  onHide?: () => void;
  onUnlink?: () => void;
  onRemoveFromPathway?: () => void;
}) {
  const navigate = useNavigate();
  const item = unit.item;
  const ambiguous = !item && !!unit.candidates;

  // One line of metadata, never duplicated: strand, then the item's status
  // (which is exactly "Not practised yet" for a freshly-added suggestion), or
  // what the suggestion needs. The status lives here alone.
  const meta = [
    unit.strand ? STRAND_LABELS[unit.strand] : null,
    item ? ITEM_STATUS_LABELS[item.status] : ambiguous ? `${unit.candidates!.length} of your items answer this — choose one` : 'suggestion',
    item && committedItemIds.has(item.id) ? 'for class' : null,
  ].filter(Boolean);

  // Every secondary action keeps the owner's work: none of them deletes.
  const menu: { label: string; run: () => void }[] = [
    ...(!item && !ambiguous ? [{ label: 'Link an existing item…', run: onChoose }] : []),
    ...(!item && onHide ? [{ label: 'Hide this suggestion', run: onHide }] : []),
    ...(item && onUnlink ? [{ label: 'Unlink reference (keeps the item)', run: onUnlink }] : []),
    ...(item && onRemoveFromPathway ? [{ label: 'Remove from pathway (keeps the item)', run: onRemoveFromPathway }] : []),
  ];

  return (
    <div className={`card stage-unit${unit.state === 'done' ? ' card-quiet' : ''}`}>
      <span
        className="stage-badge"
        style={{
          width: 34,
          height: 34,
          background:
            unit.state === 'done' ? 'var(--tone-good-soft)' : unit.state === 'in_progress' ? 'var(--accent-soft)' : 'var(--surface-2)',
          color: unit.state === 'done' ? 'var(--tone-good)' : unit.state === 'in_progress' ? 'var(--accent)' : 'var(--text-faint)',
        }}
        aria-hidden
      >
        {unit.state === 'done' ? <CheckIcon width={16} height={16} /> : unit.state === 'in_progress' ? '·' : ''}
      </span>

      <button
        className="stage-unit-text"
        onClick={() => (item ? navigate(`/items/${item.id}`, { state: { from: returnTo } }) : ambiguous ? onChoose() : onAdd())}
        title={item ? 'Open item' : ambiguous ? 'Choose which item this is' : 'Add to your items'}
        dir="auto"
      >
        <div className="stage-unit-title">
          {unit.title}
        </div>
        {/* Generated English metadata, never user text — its own dir="ltr"
            isolate keeps it from inheriting a Farsi title's RTL base. */}
        <div className="tiny faint">
          <span dir="ltr">{meta.join(' · ')}</span>
        </div>
      </button>

      {menu.length > 0 && (
        <details className="stage-unit-menu">
          <summary className="btn btn-ghost stage-unit-action" aria-label={`More actions for ${unit.title}`}>
            ⋯
          </summary>
          <div className="stage-unit-menu-list card">
            {menu.map((m) => (
              <button key={m.label} className="btn btn-ghost btn-sm btn-block" style={{ justifyContent: 'flex-start' }} onClick={m.run}>
                {m.label}
              </button>
            ))}
          </div>
        </details>
      )}

      {/* Fixed-size trailing action: Play once added, Add before. */}
      {item ? (
        <button className="btn btn-primary stage-unit-action" onClick={onPractise} aria-label={`Practise ${unit.title}`}>
          <PlayIcon />
        </button>
      ) : ambiguous ? (
        <button className="btn stage-unit-action" onClick={onChoose} aria-label={`Choose which item is ${unit.title}`}>
          ?
        </button>
      ) : (
        <button className="btn stage-unit-action" onClick={onAdd} aria-label={`Add ${unit.title} to your items`}>
          <PlusIcon />
        </button>
      )}
    </div>
  );
}

function RoutineCard({
  routine,
  onStart,
  onEdit,
}: {
  routine: PathwayRoutine;
  onStart: (shortOnTime: boolean) => void;
  onEdit: () => void;
}) {
  const total = routine.segments.reduce((s, x) => s + x.minutes, 0);
  const bound = routine.segments.some((s) => s.itemId);
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
            <span dir="ltr">
              {routine.segments.length} segments · {total} min{bound ? '' : ' · guided warm-up, not logged as practice'}
            </span>
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
