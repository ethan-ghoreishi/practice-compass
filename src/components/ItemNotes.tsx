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
//   • AN IN-FLIGHT WRITE NEVER OWNS THE EDITOR. The textarea stays live while
//     IndexedDB is acknowledging, so the words typed during that window are
//     NEWER than the ones being written. A settling write may therefore only
//     speak for the text it actually carried: it clears the draft and says
//     "Saved." when the draft is still exactly that text, and otherwise
//     re-issues the write for what is on screen now. Clearing the draft on
//     whatever settles — which is what this did — drops those words and puts
//     "Saved." over the older ones. Only the LATEST save may act at all
//     (`saveSeq`, bumped by a retry AND by switching item), so neither a slow
//     first write nor one issued for the previous notebook can overrule what
//     replaced it, and the draft is read through a REF rather than a closure
//     or an effect-mirrored copy: `storageSettled()` resolves in a microtask
//     that can land between a keystroke's `setDraft` and the next effect.
// ---------------------------------------------------------------------------

const PLACEHOLDER =
  'What this piece is, what to watch for, what your teacher said — anything you want in front of you next time.';

type SaveState = { phase: 'idle' | 'saving' | 'saved' } | { phase: 'failed'; message: string };

/** The text being edited, together with the RECORD it was typed for. */
type Draft = { forItem: string; text: string };

/**
 * The item's notebook. A thin wrapper over {@link DurableNotes} — the
 * durability model below is identical for an item and for a lesson, and a
 * second copy of it is exactly how one of the two ends up subtly different.
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
  const updateItem = useStore((s) => s.updateItem);
  if (!item) return null;
  return (
    <DurableNotes
      ownerId={itemId}
      saved={item.notes ?? ''}
      onSave={(text) => updateItem(itemId, { notes: text })}
      label={label}
      placeholder={PLACEHOLDER}
      startExpanded={startExpanded}
    />
  );
}

/**
 * The durable free-text editor: explicit save, tagged draft, acknowledged
 * persistence, retry, and an in-flight write that never owns the textarea.
 *
 * `onSave` receives the text ALREADY normalised to `undefined` when empty, and
 * must write it to the store synchronously — `storageSettled()` is captured
 * immediately afterwards, so an asynchronous write would hand this the wrong
 * promise.
 */
export function DurableNotes({
  ownerId,
  saved,
  onSave,
  label,
  placeholder,
  startExpanded = true,
}: {
  ownerId: string;
  saved: string;
  onSave: (text: string | undefined) => void;
  label: string;
  placeholder: string;
  startExpanded?: boolean;
}) {

  const [expanded, setExpanded] = useState(startExpanded);
  /**
   * The draft, TAGGED with the item it was typed for. Keeping the tag in the
   * same state value as the text is what makes a stale editor impossible to
   * commit: there is no window in which one has been re-pointed at a new item
   * while the other still names the old one.
   */
  const [draft, setDraft] = useState<Draft | null>(null);
  const [state, setState] = useState<SaveState>({ phase: 'idle' });
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /**
   * The same draft, readable from a settling write's callback. A microtask can
   * land between a keystroke's `setDraft` and React's next render, so neither
   * the closure the write was issued in nor a ref mirrored by an effect is
   * sound here: both can be a keystroke behind the textarea. Every write of
   * `draft` goes through `applyDraft`, so the two cannot drift apart — and the
   * unmount cleanup deliberately does NOT clear it, so leaving the screen
   * ENTIRELY (a different route) still saves words typed while the write was
   * settling. Switching ITEM is the opposite case and is disowned instead: the
   * effect below bumps `saveSeq`, because those words were typed for a
   * notebook that is no longer the one on screen.
   */
  const draftRef = useRef<Draft | null>(null);
  /**
   * Which save may still speak. Only the LATEST one acts on its outcome: a slow
   * first write settling after a retry replaced it must not clear a draft, show
   * "Saved." or re-issue anything on behalf of text that has been superseded.
   */
  const saveSeq = useRef(0);

  function applyDraft(next: Draft | null) {
    draftRef.current = next;
    setDraft(next);
  }

  // Switching record — an Item Detail route change, a routine crossing into
  // the next bound segment, tapping a different class — abandons the draft
  // rather than carrying it across. Any write still in flight for the previous
  // record is disowned with it, so it can never land on this one.
  useEffect(() => {
    saveSeq.current += 1;
    applyDraft(null);
    setState({ phase: 'idle' });
  }, [ownerId]);

  useEffect(
    () => () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    },
    [],
  );

  const editing = draft !== null && draft.forItem === ownerId;
  const shown = editing ? draft.text : saved;

  function beginEdit() {
    setState({ phase: 'idle' });
    applyDraft({ forItem: ownerId, text: saved });
  }

  /**
   * Write ONE known text, and let only that text's own outcome speak for it.
   *
   * `text` is captured here rather than read back in the callback on purpose:
   * it is what this write actually carries, and the comparison against the
   * live draft when it settles is the whole difference between "the editor is
   * saved" and "an older write finished while you were still typing".
   */
  function write(text: string, forItem: string) {
    const seq = (saveSeq.current += 1);
    // A "Saved." from the PREVIOUS write is still counting down to idle; left
    // running it would clear this write's own state four seconds in.
    if (savedTimer.current) clearTimeout(savedTimer.current);
    // Emptying the notebook is deliberate and must persist — `undefined` IS a
    // saved value here, never a reason to keep what was there.
    setState({ phase: 'saving' });
    if (forItem !== ownerId) return;
    onSave(text.trim() || undefined);
    // The store's persist middleware has queued the IndexedDB write by now.
    // "Saved." waits for THAT, not for a timer.
    void storageSettled().then(
      () => {
        // ONE ownership test, not two: the item-change effect above bumps
        // `saveSeq`, so a write issued for a previous item — or superseded by
        // a retry — fails this and says nothing at all. A second `forItem`
        // comparison here would be untestable, because there is no state in
        // which it and this disagree.
        if (saveSeq.current !== seq) return;
        const now = draftRef.current;
        // Newer words arrived while IndexedDB was acknowledging. They are not
        // saved, so they are neither cleared nor called saved — they are
        // written, which is what pressing Done asked for in the first place.
        if (now && now.text !== text) {
          write(now.text, forItem);
          return;
        }
        applyDraft(null);
        setState({ phase: 'saved' });
        savedTimer.current = setTimeout(() => setState({ phase: 'idle' }), 4000);
      },
      (e: unknown) => {
        if (saveSeq.current !== seq) return;
        // The text stays exactly where it is, still editable, with a way out.
        setState({ phase: 'failed', message: e instanceof Error ? e.message : 'the device refused the write.' });
      },
    );
  }

  function save() {
    // Re-read the draft at the instant of saving and check its tag again: the
    // click that reaches here is the only thing that writes, and it must be
    // writing THIS item's own words. The REF, not the render's copy: a
    // keystroke that has not been painted yet is still the newest text.
    const current = draftRef.current;
    if (!current || current.forItem !== ownerId) return;
    // The store already holds the new text after a FAILED attempt (the write
    // that failed was to storage, not to memory), so this "nothing changed"
    // short-circuit would make Try again a silent no-op: the person would see
    // the failure clear with their words still only in RAM. A retry therefore
    // always re-issues the write.
    if (state.phase !== 'failed' && (saved || undefined) === (current.text.trim() || undefined)) {
      applyDraft(null);
      setState({ phase: 'idle' });
      return;
    }
    write(current.text, ownerId);
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
              placeholder={placeholder}
              value={draft.text}
              onChange={(e) => applyDraft({ forItem: ownerId, text: e.target.value })}
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
