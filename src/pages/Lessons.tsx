import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  assignedForLesson,
  cleanFileTitle,
  daysUntil,
  formatFileSize,
  ITEM_STATUS_LABELS,
  lessonsForInstrument,
  nextLessonFor,
  nextLessonNumber,
  questionsForNextClass,
  resolveRecording,
  todayISODate,
  type Lesson,
  type LessonFileKind,
} from '../domain';
import { useStore } from '../store/useStore';
import { getNasBaseUrl } from '../store/backup';
import { Field } from '../components/ui';
import { MusicIcon, PlayIcon, PlusIcon, ReportIcon, XIcon } from '../components/icons';
import { relativeDay } from '../components/format';
import Attachments from '../components/Attachments';
import ClassQuestions from '../components/ClassQuestions';
import QuickAdd from '../components/QuickAdd';

/** "Class 37 · 2026-07-09" when numbered, else just the date. */
function lessonLabel(lesson: Lesson): string {
  return typeof lesson.number === 'number' ? `Class ${lesson.number} · ${lesson.date}` : lesson.date;
}

/**
 * The class workflow: log each lesson's date, then — after rewatching your
 * recording — write up what was said (Farsi welcome). The nearest upcoming
 * lesson becomes the deadline that prioritises items flagged "for class".
 */
export default function Lessons() {
  const db = useStore((s) => s.db);
  const now = useMemo(() => new Date(), []);
  const instruments = db.instruments.filter((i) => i.active);
  const wide = useIsWide();

  return (
    <div className="stack-lg">
      <header className="stack-sm">
        <h1 className="page-title">Lessons</h1>
        <p className="page-sub">
          Your classes, per instrument — dates and the notes you take when rewatching the recording.
        </p>
      </header>

      {wide ? (
        <WideLessons now={now} />
      ) : (
        instruments.map((inst) => (
          <InstrumentLessons key={inst.id} instrumentId={inst.id} name={inst.name} now={now} />
        ))
      )}
    </div>
  );
}

function useIsWide(): boolean {
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 1000px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1000px)');
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return wide;
}

/**
 * MacBook layout: lesson list on the left, the open lesson (long Farsi notes,
 * linked items, files) with real room on the right. Phones keep the simple
 * drill-down cards.
 */
function WideLessons({ now }: { now: Date }) {
  const db = useStore((s) => s.db);
  const addLesson = useStore((s) => s.addLesson);
  const deleteLesson = useStore((s) => s.deleteLesson);
  const instruments = db.instruments.filter((i) => i.active);

  const allLessons = useMemo(
    () => [...db.lessons].sort((a, b) => b.date.localeCompare(a.date)),
    [db.lessons],
  );
  const defaultSelection = useMemo(() => {
    const upcoming = [...allLessons].reverse().find((l) => l.date >= todayISODate(now));
    return upcoming?.id ?? allLessons[0]?.id ?? null;
  }, [allLessons, now]);
  const [selectedId, setSelectedId] = useState<string | null>(defaultSelection);
  const selected = allLessons.find((l) => l.id === selectedId) ?? null;

  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [date, setDate] = useState(todayISODate(now));
  const [num, setNum] = useState('');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 'var(--space-5)', alignItems: 'start' }}>
      <div className="stack">
        {instruments.map((inst) => {
          const lessons = lessonsForInstrument(db.lessons, inst.id);
          const next = nextLessonFor(db.lessons, inst.id, now);
          const flagged = assignedForLesson(db.items).filter((i) => i.instrumentId === inst.id);
          return (
            <section key={inst.id} className="stack-sm">
              <div className="row between">
                <h2 className="title-md" style={{ fontSize: '1.05rem' }}>
                  {inst.name}
                </h2>
                {next && <span className="badge tone-progress">next {relativeDay(next.date, now)}</span>}
              </div>
              {next && flagged.length > 0 && (
                <div className="tiny dim">
                  {flagged.length} item{flagged.length === 1 ? '' : 's'} to prepare · {daysUntil(next.date, now)} day
                  {daysUntil(next.date, now) === 1 ? '' : 's'} left
                </div>
              )}
              <div className="card card-flush list">
                {lessons.map((l) => (
                  <button
                    key={l.id}
                    className="list-row"
                    style={{
                      background: l.id === selectedId ? 'var(--accent-soft)' : 'none',
                      border: 'none',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: 'inherit',
                    }}
                    onClick={() => setSelectedId(l.id)}
                  >
                    <span className="grow">{lessonLabel(l)}</span>
                    <span className="tiny faint">{l.notes ? 'notes ✓' : l.date >= todayISODate(now) ? 'upcoming' : '—'}</span>
                  </button>
                ))}
                {lessons.length === 0 && <div className="list-row tiny faint">No classes logged.</div>}
              </div>
              {addingFor === inst.id ? (
                <div className="row" style={{ gap: 8 }}>
                  <input
                    className="input"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    aria-label="Class number (optional)"
                    placeholder="No."
                    value={num}
                    onChange={(e) => setNum(e.target.value)}
                    style={{ width: 72 }}
                  />
                  <input className="input grow" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      const id = addLesson({ instrumentId: inst.id, date, number: num.trim() ? Number(num) : undefined });
                      setAddingFor(null);
                      setNum('');
                      setSelectedId(id);
                    }}
                  >
                    Add
                  </button>
                  <button className="btn btn-sm" aria-label="Cancel" onClick={() => setAddingFor(null)}>
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ width: 'fit-content' }}
                  onClick={() => {
                    setNum(String(nextLessonNumber(db.lessons, inst.id)));
                    setAddingFor(inst.id);
                  }}
                >
                  <PlusIcon /> Add a class
                </button>
              )}
            </section>
          );
        })}
      </div>

      <div className="card stack-sm" style={{ minHeight: 320 }}>
        {selected ? (
          <>
            <div className="row between">
              <strong>
                {instruments.find((i) => i.id === selected.instrumentId)?.name} · {lessonLabel(selected)}
              </strong>
              <span className="tiny faint">{relativeDay(selected.date, now)}</span>
            </div>
            <LessonDetail lesson={selected} onDelete={() => deleteLesson(selected.id)} />
          </>
        ) : (
          <div className="small dim">Pick a class on the left — or add one.</div>
        )}
      </div>
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
  const [num, setNum] = useState('');

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
          <Field label="Class no.">
            <input
              className="input"
              type="number"
              inputMode="numeric"
              min={1}
              placeholder="No."
              value={num}
              onChange={(e) => setNum(e.target.value)}
              style={{ width: 72 }}
            />
          </Field>
          <Field label="Class date">
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <button
            className="btn btn-primary"
            style={{ alignSelf: 'flex-end' }}
            onClick={() => {
              addLesson({ instrumentId, date, number: num.trim() ? Number(num) : undefined });
              setNum('');
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
        <button
          className="btn btn-sm"
          style={{ width: 'fit-content' }}
          onClick={() => {
            setNum(String(nextLessonNumber(db.lessons, instrumentId)));
            setAdding(true);
          }}
        >
          <PlusIcon /> Add a class
        </button>
      )}
    </section>
  );
}

function LessonCard({ lesson, now, onDelete }: { lesson: Lesson; now: Date; onDelete: () => void }) {
  const upcoming = lesson.date >= todayISODate(now);
  const [open, setOpen] = useState(upcoming || !lesson.notes);

  return (
    <article className="card stack-sm">
      <button
        className="row between"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, width: '100%' }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="row" style={{ gap: 8 }}>
          <strong>{lessonLabel(lesson)}</strong>
          <span className="tiny faint">{relativeDay(lesson.date, now)}</span>
          {upcoming && <span className="badge tone-progress">upcoming</span>}
        </span>
        <span className="tiny faint">{open ? 'close' : lesson.notes ? 'notes ✓' : 'add notes'}</span>
      </button>

      {open && <LessonDetail lesson={lesson} onDelete={onDelete} />}
    </article>
  );
}

/** Notes, linked items, files and delete — the body of an open lesson. */
function LessonDetail({ lesson, onDelete }: { lesson: Lesson; onDelete: () => void }) {
  const db = useStore((s) => s.db);
  const updateLesson = useStore((s) => s.updateLesson);
  const now = useMemo(() => new Date(), []);
  const [text, setText] = useState(lesson.notes ?? '');

  // Editing a different lesson resets the draft (wide-screen pane reuse).
  useEffect(() => {
    setText(lesson.notes ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  function save() {
    const next = text.trim() || undefined;
    if ((lesson.notes ?? undefined) !== next) updateLesson(lesson.id, { notes: next });
  }

  const upcoming = lesson.date >= todayISODate(now);
  const questions = useMemo(
    () => questionsForNextClass(db.items, lesson.instrumentId),
    [db.items, lesson.instrumentId],
  );
  const instrumentName = db.instruments.find((i) => i.id === lesson.instrumentId)?.name ?? 'Instrument';

  return (
    <>
      <textarea
        className="textarea"
        dir="auto"
        style={{ minHeight: 160 }}
        placeholder="Notes from the class — what was covered, what your teacher said, what to prepare… (فارسی هم می‌شود)"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={save}
      />

      <LessonItems lesson={lesson} />

      {/* Questions belong to the class ahead — show them on the upcoming lesson. */}
      {upcoming && <ClassQuestions instrumentName={instrumentName} dateLabel={lessonLabel(lesson)} questions={questions} />}

      <LessonRecordings lesson={lesson} />

      <Attachments
        ownerType="lesson"
        ownerId={lesson.id}
        emptyHint="Attach small hand-outs for this class — PDFs of pieces, photos of notation, short audio. Full class videos are too big for the app: add them as a Class recording above (a NAS link), not here."
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
  );
}

/** Guess a reference's kind from its path extension (used when adding). */
function inferKind(path: string): LessonFileKind {
  const ext = (path.split('.').pop() ?? '').toLowerCase();
  if (['mp4', 'mov', 'm4v', 'webm', 'mkv'].includes(ext)) return 'video';
  if (ext === 'pdf') return 'pdf';
  if (['mp3', 'm4a', 'wav', 'aac', 'ogg'].includes(ext)) return 'audio';
  if (['doc', 'docx', 'txt', 'rtf', 'jpg', 'jpeg', 'png', 'heic'].includes(ext)) return 'doc';
  return 'video';
}

const KIND_ORDER: Record<LessonFileKind, number> = { video: 0, pdf: 1, doc: 2, audio: 3 };

function KindIcon({ kind }: { kind: LessonFileKind }) {
  if (kind === 'video') return <PlayIcon width={16} height={16} />;
  if (kind === 'audio') return <MusicIcon width={16} height={16} />;
  return <ReportIcon width={16} height={16} />; // pdf / doc
}

/**
 * Lesson NAS references — the class video plus score PDFs/docs, all links,
 * never the bytes. A file is only fetched when the user taps Open; deleting a
 * reference never touches the NAS file. Video first, then scores/docs.
 */
function LessonRecordings({ lesson }: { lesson: Lesson }) {
  const addLessonRecording = useStore((s) => s.addLessonRecording);
  const removeLessonRecording = useStore((s) => s.removeLessonRecording);
  const navigate = useNavigate();
  const baseUrl = getNasBaseUrl();
  const recordings = useMemo(
    () =>
      [...(lesson.recordings ?? [])].sort(
        (a, b) => KIND_ORDER[a.kind ?? 'video'] - KIND_ORDER[b.kind ?? 'video'],
      ),
    [lesson.recordings],
  );

  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [path, setPath] = useState('');
  const [notes, setNotes] = useState('');

  function add() {
    if (!path.trim()) return;
    addLessonRecording(lesson.id, {
      title: title.trim() || cleanFileTitle(path.trim()) || 'Class file',
      path: path.trim(),
      kind: inferKind(path.trim()),
      date: lesson.date,
      notes: notes.trim() || undefined,
    });
    setTitle('');
    setPath('');
    setNotes('');
    setAdding(false);
  }

  function open(rec: (typeof recordings)[number]) {
    const r = resolveRecording(baseUrl, rec);
    if (r.status !== 'ok') return; // button is disabled unless resolvable
    window.open(r.url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="stack-sm">
      <div className="row between">
        <div className="section-label">Class recording &amp; scores</div>
        <button className="btn btn-ghost btn-sm" onClick={() => setAdding((v) => !v)}>
          {adding ? 'Cancel' : <><PlusIcon /> Add link</>}
        </button>
      </div>

      {recordings.length === 0 && !adding && (
        <div className="card card-quiet small dim">
          Full class videos and scores live on your NAS, not in the app. Add a link to open them from here.
        </div>
      )}

      {recordings.map((rec) => {
        const resolution = resolveRecording(baseUrl, rec);
        const kind = rec.kind ?? 'video';
        const size = formatFileSize(rec.sizeBytes);
        const meta = ['Stored on NAS', kind === 'video' ? null : kind.toUpperCase(), size, rec.durationLabel]
          .filter(Boolean)
          .join(' · ');
        return (
          <div key={rec.id} className="card row between" style={{ gap: 10 }}>
            <span className="faint" style={{ flex: 'none', display: 'grid', placeItems: 'center' }} aria-hidden="true">
              <KindIcon kind={kind} />
            </span>
            <div className="grow" style={{ minWidth: 0 }}>
              <div className="truncate" dir="auto">
                {rec.title}
              </div>
              <div className="tiny faint">{meta}</div>
              {rec.notes && (
                <div className="tiny dim" dir="auto">
                  {rec.notes}
                </div>
              )}
              {resolution.status === 'no-base' && (
                <div className="tiny" style={{ color: 'var(--tone-warn)' }}>
                  Set your NAS base URL in{' '}
                  <button className="link" style={{ background: 'none', border: 'none' }} onClick={() => navigate('/settings')}>
                    Settings
                  </button>{' '}
                  to open this.
                </div>
              )}
              {resolution.status === 'bad-base' && (
                <div className="tiny" style={{ color: 'var(--tone-alert)' }}>
                  Your NAS base URL isn’t a valid web address — fix it in{' '}
                  <button className="link" style={{ background: 'none', border: 'none' }} onClick={() => navigate('/settings')}>
                    Settings
                  </button>
                  .
                </div>
              )}
            </div>
            <button className="btn btn-sm btn-primary" disabled={resolution.status !== 'ok'} onClick={() => open(rec)}>
              Open
            </button>
            <button
              className="btn btn-ghost btn-sm"
              aria-label="Remove this link (the NAS file is kept)"
              title="Remove link (the NAS file is kept)"
              onClick={() => {
                if (confirm('Remove this link? The file on your NAS is not deleted.')) removeLessonRecording(lesson.id, rec.id);
              }}
            >
              <XIcon width={14} height={14} />
            </button>
          </div>
        );
      })}

      {adding && (
        <div className="card stack-sm">
          <input
            className="input"
            dir="auto"
            placeholder="Title — e.g. Class recording"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="input"
            placeholder="NAS path or https:// link — e.g. setar-classes/session-37/class.mp4 or …/score.pdf"
            value={path}
            onChange={(e) => setPath(e.target.value)}
          />
          <input className="input" dir="auto" placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div className="tiny faint">
            Video, PDF or audio — the kind is detected from the file. A relative path resolves against your NAS base
            URL (Settings); full https:// links are used as-is. The file opens only when you tap “Open”.
          </div>
          <button className="btn btn-primary" disabled={!path.trim()} onClick={add}>
            Add link
          </button>
        </div>
      )}
    </div>
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
