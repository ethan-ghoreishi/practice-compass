import { useStore } from '../store/useStore';
import { DurableNotes } from './ItemNotes';

// ---------------------------------------------------------------------------
// A class's own notes — what the teacher said, typed up while rewatching the
// recording, usually in Farsi.
//
// This is the SAME editor as the item's notebook (`DurableNotes`), not a second
// one that looks like it: autosave with no dependency on Done, a device-local
// draft, every write aimed at the class it was typed for, "Saved." only once
// IndexedDB has acknowledged the write, a failed write that keeps the text on
// screen with Try again and Copy, and an in-flight write that never owns the
// textarea. Its id space is the LESSON's: an item sharing the id is a
// different notebook.
//
// Clearing a class's notes is a real write: the store decides by the PRESENCE
// of the notes key, never `??`.
// ---------------------------------------------------------------------------

const PLACEHOLDER = 'What was covered, what the teacher said, what to do before the next class.';

export default function LessonNotes({ lessonId, label = 'Class notes' }: { lessonId: string; label?: string }) {
  const lesson = useStore((s) => s.db.lessons.find((l) => l.id === lessonId));
  if (!lesson) return null;
  return (
    <DurableNotes owner={{ kind: 'lesson', id: lessonId }} saved={lesson.notes ?? ''} label={label} placeholder={PLACEHOLDER} />
  );
}
