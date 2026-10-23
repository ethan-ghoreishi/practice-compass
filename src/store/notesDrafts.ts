import type { NoteOwner } from './useStore';

// ---------------------------------------------------------------------------
// The device-local recovery copy of notes being typed.
//
// Canonical notes live ONLY in the item or lesson (`notes`, through the
// store). This is a temporary, owner-typed safety net for the gap before the
// canonical write is acknowledged by IndexedDB: written synchronously on every
// keystroke (localStorage acknowledges at once), dropped once the canonical
// write it describes has landed, and replayed through the store's ordinary
// `saveNotes` decision after a reload that interrupted it. It is never part of
// PracticeDB, a backup, an export or sync, and it never decides anything on
// its own: `saveNotes` compares its `base` with what is stored, so a draft can
// never silently overwrite newer text or recreate a deleted record.
//
// Every access is wrapped: storage that is full, blocked or absent costs only
// this safety net, never the edit itself.
// ---------------------------------------------------------------------------

const PREFIX = 'pc-note-draft:';

export interface NoteDraft {
  /** The words on screen. */
  text: string;
  /** The stored notes this text was typed over — how a competing change is recognised. */
  base: string;
}

function keyFor(owner: NoteOwner): string {
  return `${PREFIX}${owner.kind}:${owner.id}`;
}

/** Keep the latest text for this owner. Returns false when the device refused it. */
export function holdNoteDraft(owner: NoteOwner, draft: NoteDraft): boolean {
  try {
    localStorage.setItem(keyFor(owner), JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

/** Forget this owner's draft — only while it still holds `text`, so newer words typed meanwhile survive. */
export function dropNoteDraft(owner: NoteOwner, text: string): void {
  try {
    const raw = localStorage.getItem(keyFor(owner));
    if (raw && (JSON.parse(raw) as NoteDraft).text === text) localStorage.removeItem(keyFor(owner));
  } catch {
    /* the safety net is best-effort; the canonical write already landed */
  }
}

/** Every held draft, for replay after a reload. Unreadable entries are skipped, never thrown. */
export function heldNoteDrafts(): { owner: NoteOwner; draft: NoteDraft }[] {
  const out: { owner: NoteOwner; draft: NoteDraft }[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(PREFIX)) continue;
      const rest = key.slice(PREFIX.length);
      const kind = rest.slice(0, rest.indexOf(':'));
      const id = rest.slice(rest.indexOf(':') + 1);
      if ((kind !== 'item' && kind !== 'lesson') || !id) continue;
      const draft = JSON.parse(localStorage.getItem(key) ?? 'null') as NoteDraft | null;
      if (draft && typeof draft.text === 'string' && typeof draft.base === 'string') out.push({ owner: { kind, id }, draft });
    }
  } catch {
    /* unreadable storage: nothing to replay */
  }
  return out;
}
