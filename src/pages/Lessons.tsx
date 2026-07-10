import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  assignedForLesson,
  daysUntil,
  ITEM_STATUS_LABELS,
  lessonsForInstrument,
  nextLessonFor,
  todayISODate,
  type Lesson,
} from '../domain';
import { useStore } from '../store/useStore';
import { Field } from '../components/ui';
import { PlusIcon, XIcon } from '../components/icons';
import { relativeDay } from '../components/format';
import Attachments from '../components/Attachments';
import QuickAdd from '../components/QuickAdd';

/**
 * The class workflow: log each lesson's date, then — after rewatching your
 * recording — write up what was said (Farsi welcome). The nearest upcoming
 * lesson becomes the deadline that prioritises items flagged "for class".
 */
export default function Lessons() {
  const db = useStore((s) => s.db);
  const now = useMemo(() => new Date(), []);
  const instruments = db.instruments.filter((i) => i.active);

  return (
    <div className="stack-lg">
      <header className="stack-sm">
        <h1 className="page-title">Lessons</h1>
        <p className="page-sub">
          Your classes, per instrument — dates and the notes you take when rewatching the recording.
        </p>
      </header>

      {instruments.map((inst) => (
        <InstrumentLessons key={inst.id} instrumentId={inst.id} name={inst.name} now={now} />
      ))}
    </div>
  );
}

function InstrumentLessons({ instrumentId, name, now }: { instrumentId: string; name: string; now: Date }) {
  const db = useStore((s) => s.db);
  const addLesson = useStore((s) => s.addLesson);
  const deleteLesson = useStore((s) => s.deleteLesson);

  const lessons = useMemo(() => lessonsForInstrument(db.lessons, instrumentId), [db.lessons, instrumentId]);
  const next = nextLessonFor(db.lessons, instrumentId, now);
  const flagged = useMemo(
    () => assignedForLesson(db.items).filter((i) => i.instrumentId === instrumentId),
    [db.items, instrumentId],
  );

  const [adding, setAdding] = useState(false);
  const [date, setDate] = useState(todayISODate(now));

  return (
    <section className="stack-sm">
      <div className="row between">
        <h2 className="title-md">{name}</h2>
        {next ? (
          <span className="badge tone-progress">
            next class {relativeDay(next.date, now)}
          </span>
        ) : (
          <span className="tiny faint">no class planned</span>
        )}
      </div>

      {next && flagged.length > 0 && (
        <div className="card card-quiet small dim">
          {flagged.length} item{flagged.length === 1 ? '' : 's'} to complete before this class ·{' '}
          {daysUntil(next.date, now)} day{daysUntil(next.date, now) === 1 ? '' : 's'} left —{' '}
          <Link to="/repertoire" className="link">
            see them
          </Link>
        </div>
      )}

      <div className="stack-sm">
        {lessons.map((l) => (
          <LessonCard key={l.id} lesson={l} now={now} onDelete={() => deleteLesson(l.id)} />
        ))}
        {lessons.length === 0 && !adding && (
          <div className="card card-quiet small dim">No lessons logged yet.</div>
        )}
      </div>

      {adding ? (
        <div className="card row" style={{ gap: 8 }}>
          <Field label="Class date">
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <button
            className="btn btn-primary"
            style={{ alignSelf: 'flex-end' }}
            onClick={() => {
              addLesson({ instrumentId, date });
              setAdding(false);
            }}
          >
            Add
          </button>
          <button className="btn" style={{ alignSelf: 'flex-end' }} onClick={() => setAdding(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <button className="btn btn-sm" style={{ width: 'fit-content' }} onClick={() => setAdding(true)}>
          <PlusIcon /> Add a class
        </button>
      )}
    </section>
  );
}

function LessonCard({ lesson, now, onDelete }: { lesson: Lesson; now: Date; onDelete: () => void }) {
  const updateLesson = useStore((s) => s.updateLesson);
  const upcoming = lesson.date >= todayISODate(now);
  const [open, setOpen] = useState(upcoming || !lesson.notes);
  const [text, setText] = useState(lesson.notes ?? '');

  function save() {
    const next = text.trim() || undefined;
    if ((lesson.notes ?? undefined) !== next) updateLesson(lesson.id, { notes: next });
  }

  return (
    <article className="card stack-sm">
      <button
        className="row between"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, width: '100%' }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="row" style={{ gap: 8 }}>
          <strong>{lesson.date}</strong>
          <span className="tiny faint">{relativeDay(lesson.date, now)}</span>
          {upcoming && <span className="badge tone-progress">upcoming</span>}
        </span>
        <span className="tiny faint">{open ? 'close' : lesson.notes ? 'notes ✓' : 'add notes'}</span>
      </button>

      {open && (
        <>
          <textarea
            className="textarea"
            dir="auto"
            style={{ minHeight: 120 }}
            placeholder="Notes from the class — what was covered, what your teacher said, what to prepare… (فارسی هم می‌شود)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={save}
          />

          <LessonItems lesson={lesson} />

          <Attachments
            ownerType="lesson"
            ownerId={lesson.id}
            emptyHint="Attach the hand-outs for this class — PDFs of pieces, photos of notation. Keep the class video recordings in your session folders; they'd bloat the backup."
          />

          <button
            className="link tiny"
            style={{ background: 'none', border: 'none', width: 'fit-content', color: 'var(--tone-alert)' }}
            onClick={() => {
              if (confirm(`Delete the ${lesson.date} lesson? Its notes and attached files go with it; linked practice items are kept.`)) onDelete();
            }}
          >
            Delete lesson
          </button>
        </>
      )}
    </article>
  );
}

/** The items worked on / created in this lesson: link, create, flag, unlink. */
function LessonItems({ lesson }: { lesson: Lesson }) {
  const db = useStore((s) => s.db);
  const linkItemToLesson = useStore((s) => s.linkItemToLesson);
  const unlinkItemFromLesson = useStore((s) => s.unlinkItemFromLesson);
  const toggleAssignedForLesson = useStore((s) => s.toggleAssignedForLesson);
  const [linking, setLinking] = useState(false);

  const linked = (lesson.itemIds ?? [])
    .map((id) => db.items.find((i) => i.id === id))
    .filter((i): i is NonNullable<typeof i> => !!i);
  const linkable = db.items.filter(
    (i) => i.instrumentId === lesson.instrumentId && !(lesson.itemIds ?? []).includes(i.id),
  );

  return (
    <div className="stack-sm">
      <div className="row between">
        <div className="section-label">Worked on in this class</div>
        {linkable.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={() => setLinking((v) => !v)}>
            Link existing…
          </button>
        )}
      </div>

      {linking && (
        <select
          className="select"
          aria-label="Link an existing item to this lesson"
          value=""
          onChange={(e) => {
            if (e.target.value) {
              linkItemToLesson(lesson.id, e.target.value);
              setLinking(false);
            }
          }}
        >
          <option value="">Choose an item…</option>
          {linkable.map((i) => (
            <option key={i.id} value={i.id}>
              {i.title}
            </option>
          ))}
        </select>
      )}

      {linked.length > 0 && (
        <div className="card card-flush list">
          {linked.map((item) => (
            <div key={item.id} className="list-row" style={{ paddingLeft: 'var(--space-3)', paddingRight: 'var(--space-3)' }}>
              <Link to={`/items/${item.id}`} state={{ from: '/lessons' }} className="grow" style={{ minWidth: 0 }}>
                <div className="truncate" dir="auto">
                  {item.title}
                </div>
                <div className="tiny faint">{ITEM_STATUS_LABELS[item.status]}</div>
              </Link>
              <button
                className={`btn btn-sm${item.assignedForLesson ? ' btn-primary' : ''}`}
                aria-pressed={!!item.assignedForLesson}
                title="Work on this before the next class"
                onClick={() => toggleAssignedForLesson(item.id)}
              >
                {item.assignedForLesson ? 'Next class ✓' : 'For next class'}
              </button>
              <button
                className="btn btn-ghost btn-sm"
                title="Unlink from this lesson (the item is kept)"
                aria-label={`Unlink ${item.title} from this lesson — the item is kept`}
                onClick={() => unlinkItemFromLesson(lesson.id, item.id)}
              >
                <XIcon width={14} height={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <QuickAdd lessonId={lesson.id} />
    </div>
  );
}
