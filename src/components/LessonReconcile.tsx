import { useNavigate } from 'react-router-dom';
import { canonicalStringify, lessonFiles, lessonTwins, type AnsweredQuestion, type ID, type PracticeDB, type ReconcileDecision, type ReconcileQuestion } from '../domain';
import { useStore } from '../store/useStore';

// ---------------------------------------------------------------------------
// ONE CLASS, ONE RECORD — the owner's side of it (docs/setar-lesson-lifecycle.md).
//
// When the archive's session and a class planned in Compass turn out to be the
// same class, Refresh asks ONCE: Combine into your class, or Keep separate.
// The question says what each side holds, so the answer is an informed one,
// and what Combine keeps is said before anything is written. Nothing here
// decides: the decision travels through `planArchiveImport` like every other.
// ---------------------------------------------------------------------------

/** What one lesson holds, in plain counts — what a Combine would carry over. */
function holdings(db: PracticeDB, lessonId: ID): string {
  const lesson = db.lessons.find((l) => l.id === lessonId);
  if (!lesson) return 'no longer on this device';
  const agenda = db.lessonAgenda.filter((e) => e.lessonId === lessonId);
  const n = (count: number, one: string, many = `${one}s`) => (count ? `${count} ${count === 1 ? one : many}` : null);
  const parts = [
    lesson.notes?.trim() ? 'notes' : null,
    n(lesson.itemIds?.length ?? 0, 'linked piece'),
    n(agenda.filter((e) => e.kind === 'preparation').length, 'commitment'),
    n(agenda.filter((e) => e.kind === 'question').length, 'question'),
    n(lesson.recordings?.length ?? 0, 'own link'),
    n(db.attachments.filter((a) => a.ownerType === 'lesson' && a.ownerId === lessonId).length, 'attachment'),
    lesson.source ? n(lessonFiles(db, lessonId).filter((f) => 'archive' in f && f.archive).length, 'archive file') : null,
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : 'nothing written yet';
}

/** "Class 41 · 2026-10-27" — generated, never the owner's text. */
function labelOf(db: PracticeDB, id: ID): string {
  const l = db.lessons.find((x) => x.id === id);
  return l ? `${typeof l.number === 'number' ? `Class ${l.number} · ` : ''}${l.date}` : 'a class';
}

/** The duplicate question, as Refresh shows it: both sides, then the two answers. */
export function DuplicateQuestion({
  q,
  onDecide,
  onClear,
}: {
  q: ReconcileQuestion | AnsweredQuestion;
  onDecide: (d: ReconcileDecision) => void;
  onClear: () => void;
}) {
  const db = useStore((s) => s.db);
  const sessionN = q.sessionN!;
  const lessonId = q.lessonId!;
  const answers: { label: string; decision: ReconcileDecision }[] = [
    { label: 'Combine into my class', decision: { kind: 'merge-lesson', sessionN, lessonId, boundId: q.boundId! } },
    { label: 'Keep separate', decision: { kind: 'separate-lesson', sessionN, lessonId } },
  ];
  return (
    <div className="list-row stack-sm" style={{ alignItems: 'flex-start' }}>
      <div style={{ textAlign: 'start' }}>
        <strong>{q.label} appears twice</strong>
        <div className="tiny faint">Your class ({labelOf(db, lessonId)}): {holdings(db, lessonId)}</div>
        <div className="tiny faint">From the archive: {holdings(db, q.boundId!)}</div>
        <div className="tiny faint">
          {'answer' in q && !q.ambiguous
            ? 'The classes changed since you answered; your answer still applies until you clear it.'
            : 'Combine keeps YOUR class — its id, notes, links, commitments, questions and files — adds everything the archive’s copy holds, and shows the archive’s recording on it. Nothing is deleted. Keep separate is remembered and not asked again.'}
        </div>
      </div>
      <div className="row" style={{ gap: 6, flexWrap: 'wrap' }} role="group" aria-label={`Answer for ${q.label}`}>
        {answers.map(({ label, decision }) => {
          const chosen = 'answer' in q && canonicalStringify(q.answer) === canonicalStringify(decision);
          return (
            <button key={label} type="button" className={`option btn-touch${chosen ? ' selected' : ''}`} aria-pressed={chosen} onClick={() => onDecide(decision)}>
              {label}
            </button>
          );
        })}
        {'answer' in q && (
          <button type="button" className="btn btn-ghost btn-sm btn-touch" onClick={onClear}>
            Clear answer
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * On the class itself: says it has a twin and where the one decision is.
 * Deleting either copy is NOT the way — a delete drops the class's own files
 * and hides the archive session for good.
 */
export function LessonTwinNotice({ lessonId }: { lessonId: ID }) {
  const db = useStore((s) => s.db);
  const navigate = useNavigate();
  const twin = lessonTwins(db).find((t) => t.lessonId === lessonId || t.boundId === lessonId);
  if (!twin) return null;
  return (
    <div className="card card-quiet stack-sm" role="note" style={{ textAlign: 'start' }}>
      <span className="small">
        Class {twin.sessionN} appears twice: your class and the archive’s copy of the same session. Combine them once
        in Refresh Setar archive — nothing is lost, and the recording joins your class. Please don’t delete either
        copy to fix it.
      </span>
      <button type="button" className="btn btn-sm btn-touch" style={{ width: 'fit-content' }} onClick={() => navigate('/settings')}>
        Review in Refresh Setar archive
      </button>
    </div>
  );
}
