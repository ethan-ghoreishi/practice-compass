import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { storageSettled } from '../store/idb';

// ---------------------------------------------------------------------------
// Working notes — the item's ONE notebook, and the one editor for it.
//
// The same component on Item Detail, on the practice screen and inside a bound
// routine segment, so there is never a second copy of this text or a second
// way to edit it. What it must get right:
//
//   • It belongs to the ITEM, not to the block. Finishing, discarding,
//     navigating away or reloading never disturbs it, and editing it never
//     touches the clock, the elapsed figure, a block, a review or SM-2 state.
//   • It never saves A's text onto B. A timer tick, a store update from
//     elsewhere, or a routine crossing a segment boundary re-renders this
//     component constantly; the draft therefore carries the item it was typed
//     for, and is dropped rather than written when that changes.
//   • Saving is EXPLICIT (Done), never blur-only — blur-only saving makes a
//     stale copy authoritative the moment anything else steals focus — and it
//     never claims success before IndexedDB has acknowledged the write. A
//     failed write keeps the text on screen with retry and copy: losing what
//     someone just wrote is the one outcome this must never produce.
// ---------------------------------------------------------------------------

const PLACEHOLDER =
  'What this piece is, what to watch for, what your teacher said — anything you want in front of you next time.';

type SaveState = { phase: 'idle' | 'saving' | 'saved' } | { phase: 'failed'; message: string };

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
  const updateItem = useStore((s) => s.updateItem);
  const saved = item?.notes ?? '';

  const [expanded, setExpanded] = useState(startExpanded);
  /**
   * The draft, TAGGED with the item it was typed for. Keeping the tag in the
   * same state value as the text is what makes a stale editor impossible to
   * commit: there is no window in which one has been re-pointed at a new item
   * while the other still names the old one.
   */
  const [draft, setDraft] = useState<{ forItem: string; text: string } | null>(null);
  const [state, setState] = useState<SaveState>({ phase: 'idle' });
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Switching item — an Item Detail route change, a routine crossing into the
  // next bound segment — abandons the draft rather than carrying it across.
  useEffect(() => {
    setDraft(null);
    setState({ phase: 'idle' });
  }, [itemId]);

  useEffect(
    () => () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    },
    [],
  );

  if (!item) return null;

  const editing = draft !== null && draft.forItem === itemId;
  const shown = editing ? draft.text : saved;

  function beginEdit() {
    setState({ phase: 'idle' });
    setDraft({ forItem: itemId, text: saved });
  }

  function save() {
    // Re-read the draft at the instant of saving and check its tag again: the
    // click that reaches here is the only thing that writes, and it must be
    // writing THIS item's own words.
    if (!draft || draft.forItem !== itemId || !item) return;
    const text = draft.text;
    const next = text.trim() || undefined;
    // Emptying the notebook is deliberate and must persist — `undefined` IS a
    // saved value here, never a reason to keep what was there.
    if ((item.notes ?? undefined) === next) {
      setDraft(null);
      setState({ phase: 'idle' });
      return;
    }
    setState({ phase: 'saving' });
    updateItem(itemId, { notes: next });
    // The store's persist middleware has queued the IndexedDB write by now.
    // "Saved." waits for THAT, not for a timer.
    void storageSettled().then(
      () => {
        setDraft(null);
        setState({ phase: 'saved' });
        savedTimer.current = setTimeout(() => setState({ phase: 'idle' }), 4000);
      },
      (e: unknown) => {
        // The text stays exactly where it is, still editable, with a way out.
        setState({ phase: 'failed', message: e instanceof Error ? e.message : 'the device refused the write.' });
      },
    );
  }

  return (
    <section className="stack-sm">
      <div className="row between">
        <button
          type="button"
          className="row"
          aria-expanded={expanded}
          aria-label={expanded ? `Hide ${label}` : `Show ${label}`}
          onClick={() => setExpanded((o) => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, gap: 6 }}
        >
          <span className="section-label" style={{ marginBottom: 0 }}>
            {label}
          </span>
          <span className="tiny faint">{expanded ? 'hide' : 'show'}</span>
        </button>
        {expanded &&
          (editing ? (
            <button
              type="button"
              className="btn btn-sm btn-primary"
              aria-label={`Done editing ${label}`}
              onClick={save}
              disabled={state.phase === 'saving'}
            >
              {state.phase === 'saving' ? 'Saving…' : 'Done'}
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
              placeholder={PLACEHOLDER}
              value={draft.text}
              onChange={(e) => setDraft({ forItem: itemId, text: e.target.value })}
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
            {state.phase === 'saved' && (
              <span className="faint">
                <span dir="ltr">Saved.</span>
              </span>
            )}
            {state.phase === 'failed' && (
              <span style={{ color: 'var(--tone-alert)' }}>
                <span dir="ltr">Not saved — {state.message} Your text is still here.</span>{' '}
                <button type="button" className="link tiny" style={LINK_BTN} onClick={save}>
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
