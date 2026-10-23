import { useEffect, useRef, useState } from 'react';
import { useStore, type NoteOwner, type NoteSaveOutcome } from '../store/useStore';
import { storageSettled } from '../store/idb';
import { dropNoteDraft, holdNoteDraft } from '../store/notesDrafts';

// ---------------------------------------------------------------------------
// Working notes — the item's ONE notebook, and the one editor for it (a
// lesson's class notes use the very same editor, `DurableNotes`).
//
// The same component on Item Detail, on the practice screen and inside a bound
// routine segment, so there is never a second copy of this text or a second
// way to edit it. What it must get right:
//
//   • It belongs to the RECORD, not to the block. Finishing, discarding,
//     navigating away or reloading never disturbs it, and editing it never
//     touches the clock, the elapsed figure, a block, a review or SM-2 state.
//   • NOTHING DEPENDS ON DONE. Every keystroke is held at once on this device
//     (`notesDrafts.ts`, acknowledged synchronously); after a short quiet
//     interval the text is written to the record; leaving — another route, a
//     collapse, Finish, a routine boundary, a different item — writes it
//     straight away. Done only flushes and closes. Never on blur alone.
//   • It never saves A's text onto B. The draft carries the record it was
//     typed for, and every write — a flush on the way out included — goes to
//     THAT record through the store's `saveNotes`, which also refuses to
//     recreate a deleted record and keeps both texts when the stored notes
//     changed underneath (a sync, an import, another editor).
//   • "Saved." waits for IndexedDB, never a timer or the store; a failed write
//     keeps the text on screen with Try again (which always writes) and Copy.
//   • AN IN-FLIGHT WRITE NEVER OWNS THE EDITOR. The textarea stays live while a
//     write settles; only the LATEST write may speak (`saveSeq`), and the
//     draft is read through a REF, never a closure or a ref an effect mirrors.
// ---------------------------------------------------------------------------

const PLACEHOLDER =
  'What this piece is, what to watch for, what your teacher said — anything you want in front of you next time.';

/** The quiet interval after the last keystroke before the text is written. */
export const AUTOSAVE_QUIET_MS = 800;

type SaveState = { phase: 'idle' | 'saving' | 'saved' } | { phase: 'failed'; message: string };

/** The text being edited, together with the RECORD it was typed for and the stored text it was typed over. */
type Draft = { owner: NoteOwner; text: string; base: string };

const keyOf = (o: NoteOwner) => `${o.kind}:${o.id}`;

/** What the store holds for this record right now. */
function storedNotes(owner: NoteOwner): string {
  const db = useStore.getState().db;
  const rec = owner.kind === 'item' ? db.items.find((i) => i.id === owner.id) : db.lessons.find((l) => l.id === owner.id);
  return rec?.notes ?? '';
}

/**
 * The item's notebook. A thin wrapper over {@link DurableNotes} — the
 * durability model is identical for an item and for a lesson, and a second
 * copy of it is exactly how one of the two ends up subtly different.
 */
export default function ItemNotes({
  itemId,
  /** Collapsed while practising; open on the item's own screen. */
  startExpanded = true,
  label = 'Working notes',
}: {
  itemId: string;
  startExpanded?: boolean;
  label?: string;
}) {
  const item = useStore((s) => s.db.items.find((i) => i.id === itemId));
  if (!item) return null;
  return (
    <DurableNotes
      owner={{ kind: 'item', id: itemId }}
      saved={item.notes ?? ''}
      label={label}
      placeholder={PLACEHOLDER}
      startExpanded={startExpanded}
    />
  );
}

/**
 * The durable free-text editor: autosave, a device-local draft, a draft tagged
 * with its record, acknowledged persistence, retry, and an in-flight write
 * that never owns the textarea.
 */
export function DurableNotes({
  owner,
  saved,
  label,
  placeholder,
  startExpanded = true,
}: {
  owner: NoteOwner;
  saved: string;
  label: string;
  placeholder: string;
  startExpanded?: boolean;
}) {
  const saveNotes = useStore((s) => s.saveNotes);
  const persistAgain = useStore((s) => s.persistAgain);
  const ownerKey = keyOf(owner);
  const [expanded, setExpanded] = useState(startExpanded);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [state, setState] = useState<SaveState>({ phase: 'idle' });
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quietTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Close the editor once the write Done asked for has landed. */
  const closing = useRef(false);
  /**
   * The same draft, readable from a settling write's callback and from the
   * flush on the way out. Every write of `draft` goes through `applyDraft`, so
   * the two cannot drift apart.
   */
  const draftRef = useRef<Draft | null>(null);
  /** Which write may still speak: only the latest acts on its outcome. */
  const saveSeq = useRef(0);
  /**
   * The text IndexedDB last acknowledged for this record — what the device
   * copy (`notesDrafts.ts`) is based on, so a replay after a reload compares
   * against what was really on disk. The in-memory draft's `base` moves
   * sooner: at each write, because the store holds that text from then on.
   */
  const durable = useRef('');

  function applyDraft(next: Draft | null) {
    draftRef.current = next;
    setDraft(next);
  }

  /**
   * Write ONE known text to the record it was typed for, and let only that
   * write's own outcome speak for it. Called by the quiet timer, by Done, by
   * a collapse and — through `flushRef` — on the way out, where `speak` is
   * false: nobody is left to tell, but the write and the clean-up still run.
   */
  function write(d: Draft, speak = true) {
    if (quietTimer.current) clearTimeout(quietTimer.current);
    quietTimer.current = null;
    const seq = (saveSeq.current += 1);
    if (speak) {
      if (savedTimer.current) clearTimeout(savedTimer.current);
      setState({ phase: 'saving' });
    }
    const outcome: NoteSaveOutcome = saveNotes(d.owner, d.text, d.base);
    if (outcome === 'gone') {
      if (speak && saveSeq.current === seq) setState({ phase: 'failed', message: 'this record no longer exists, so nothing was written.' });
      return;
    }
    // Unchanged text writes nothing of its own — so a retry after a failed
    // write still WRITES, rather than reporting the old failure again.
    if (outcome === 'unchanged') persistAgain();
    // From here the STORE holds this text, whatever IndexedDB says, so what is
    // typed next is based on it — and when both texts were kept, the editor
    // shows what the record now holds.
    const after = outcome === 'merged' ? storedNotes(d.owner) : d.text;
    const current = draftRef.current;
    if (current && keyOf(current.owner) === keyOf(d.owner)) {
      applyDraft({ ...current, base: after, ...(outcome === 'merged' ? { text: after } : {}) });
    }
    void storageSettled().then(
      () => {
        dropNoteDraft(d.owner, d.text);
        if (speak && saveSeq.current === seq) durable.current = after;
        if (!speak || saveSeq.current !== seq) return;
        const now = draftRef.current;
        if (!now || keyOf(now.owner) !== keyOf(d.owner)) return;
        if (now.text !== after) {
          // Newer words arrived meanwhile: they are not saved yet, so they are
          // neither cleared nor called saved — the next write carries them.
          write(now);
          return;
        }
        if (closing.current) {
          closing.current = false;
          applyDraft(null);
        }
        setState({ phase: 'saved' });
        savedTimer.current = setTimeout(() => setState({ phase: 'idle' }), 4000);
      },
      (e: unknown) => {
        if (!speak || saveSeq.current !== seq) return;
        // The text stays exactly where it is, still editable, with a way out.
        // A Done already pressed still stands: a retry that lands closes.
        setState({ phase: 'failed', message: e instanceof Error ? e.message : 'the device refused the write.' });
      },
    );
  }

  /** Write whatever is still unwritten, now. */
  function flush(speak = true) {
    const d = draftRef.current;
    if (!d) return;
    if (d.text === d.base && state.phase !== 'failed') {
      if (quietTimer.current) clearTimeout(quietTimer.current);
      quietTimer.current = null;
      return;
    }
    write(d, speak);
  }
  const flushRef = useRef(flush);
  flushRef.current = flush;

  // Leaving THIS record — a route change, the routine crossing into the next
  // bound segment, another class tapped, the editor unmounting — writes its
  // draft to the record it was typed for, then starts the next one clean.
  useEffect(() => {
    saveSeq.current += 1;
    applyDraft(null);
    setState({ phase: 'idle' });
    return () => flushRef.current(false);
  }, [ownerKey]);

  useEffect(
    () => () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
      if (quietTimer.current) clearTimeout(quietTimer.current);
    },
    [],
  );

  const editing = draft !== null && keyOf(draft.owner) === ownerKey;
  const shown = editing ? draft.text : saved;

  function beginEdit() {
    closing.current = false;
    durable.current = saved;
    setState({ phase: 'idle' });
    applyDraft({ owner, text: saved, base: saved });
  }

  function type(text: string) {
    const current = draftRef.current;
    if (!current || keyOf(current.owner) !== ownerKey) return;
    const next = { ...current, text };
    applyDraft(next);
    holdNoteDraft(next.owner, { text: next.text, base: durable.current });
    if (quietTimer.current) clearTimeout(quietTimer.current);
    quietTimer.current = setTimeout(() => {
      const d = draftRef.current;
      if (d && keyOf(d.owner) === ownerKey) write(d);
    }, AUTOSAVE_QUIET_MS);
  }

  function done() {
    const current = draftRef.current;
    if (!current || keyOf(current.owner) !== ownerKey) return;
    if (current.text === current.base && state.phase !== 'failed') {
      if (quietTimer.current) clearTimeout(quietTimer.current);
      applyDraft(null);
      setState({ phase: 'idle' });
      return;
    }
    closing.current = true;
    write(current);
  }

  function toggle() {
    // Collapsing is a Done: the words go to the record, and the editor closes
    // once they have landed (a failure keeps it open, with its way out).
    if (expanded && draftRef.current) done();
    setExpanded((o) => !o);
  }

  return (
    <section className="stack-sm">
      <div className="row between">
        <button
          type="button"
          className="row"
          aria-expanded={expanded}
          aria-label={expanded ? `Hide ${label}` : `Show ${label}`}
          onClick={toggle}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, gap: 6 }}
        >
          <span className="section-label" style={{ marginBottom: 0 }}>
            {label}
          </span>
          <span className="tiny faint">{expanded ? 'hide' : 'show'}</span>
        </button>
        {expanded &&
          (editing ? (
            <button type="button" className="btn btn-sm btn-primary" aria-label={`Done editing ${label}`} onClick={done}>
              Done
            </button>
          ) : (
            <button type="button" className="btn btn-sm" aria-label={`Edit ${label}`} onClick={beginEdit}>
              Edit
            </button>
          ))}
      </div>

      {expanded && (
        <>
          {editing ? (
            <textarea
              className="textarea"
              aria-label={label}
              style={{ minHeight: 120 }}
              placeholder={placeholder}
              value={draft.text}
              onChange={(e) => type(e.target.value)}
            />
          ) : shown ? (
            <div className="small notes-read" dir="auto" style={{ whiteSpace: 'pre-wrap', textAlign: 'start' }}>
              {shown}
            </div>
          ) : (
            <div className="small faint" style={{ textAlign: 'start' }}>
              <span dir="ltr">No notes yet.</span>
            </div>
          )}

          <div className="tiny" aria-live="polite" style={{ textAlign: 'start' }}>
            {state.phase === 'saving' && (
              <span className="faint">
                <span dir="ltr">Saving…</span>
              </span>
            )}
            {state.phase === 'saved' && (
              <span className="faint">
                <span dir="ltr">Saved.</span>
              </span>
            )}
            {state.phase === 'failed' && (
              <span style={{ color: 'var(--tone-alert)' }}>
                <span dir="ltr">Not saved — {state.message} Your text is still here.</span>{' '}
                <button
                  type="button"
                  className="link tiny"
                  style={LINK_BTN}
                  onClick={() => {
                    const d = draftRef.current;
                    if (d) write(d);
                  }}
                >
                  Try again
                </button>{' '}
                <button
                  type="button"
                  className="link tiny"
                  style={LINK_BTN}
                  onClick={() => void navigator.clipboard?.writeText(shown).catch(() => {})}
                >
                  Copy the text
                </button>
              </span>
            )}
          </div>
        </>
      )}
    </section>
  );
}

const LINK_BTN = { background: 'none', border: 'none', padding: 0 } as const;
