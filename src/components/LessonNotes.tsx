import { useStore } from '../store/useStore';
import { DurableNotes } from './ItemNotes';

// ---------------------------------------------------------------------------
// A class's own notes — what the teacher said, typed up while rewatching the
// recording, usually in Farsi.
//
// This is the SAME editor as the item's notebook (`DurableNotes`), not a second
// one that looks like it: explicit Done, a draft tagged with the class it was
// typed for, "Saved." only once IndexedDB has acknowledged the write, a failed
// write that keeps the text on screen with Try again and Copy, and an in-flight
// write that never owns the textarea.
//
// The bug this fixes was not in an editor at all. The store's own patch
// boundary read `patch.notes ?? l.notes`, which cannot tell an OMITTED field
// from a deliberately empty one — so clearing a class's notes silently wrote
// the previous notes straight back. `updateLesson` now decides on the presence
// of the key; this component simply sends the owner's actual intent.
// ---------------------------------------------------------------------------

const PLACEHOLDER = 'What was covered, what the teacher said, what to do before the next class.';

export default function LessonNotes({ lessonId, label = 'Class notes' }: { lessonId: string; label?: string }) {
  const lesson = useStore((s) => s.db.lessons.find((l) => l.id === lessonId));
  const updateLesson = useStore((s) => s.updateLesson);
  if (!lesson) return null;
  return (
    <DurableNotes
      ownerId={lessonId}
      saved={lesson.notes ?? ''}
      // `notes` is ALWAYS present in this patch, including when it is
      // `undefined` — that presence is what tells the store the owner means to
      // empty it rather than to leave it alone.
      onSave={(text) => updateLesson(lessonId, { notes: text })}
      label={label}
      placeholder={PLACEHOLDER}
    />
  );
}
