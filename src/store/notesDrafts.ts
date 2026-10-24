import type { PracticeDB } from '../domain/types';
import type { NoteOwner } from './useStore';

// ---------------------------------------------------------------------------
// The device-local recovery copy of notes being typed.
//
// Canonical notes live ONLY in the item or lesson (`notes`, through the
// store). This is a temporary, owner-typed safety net for the gap before the
// canonical write is acknowledged by IndexedDB: written synchronously on every
// keystroke (localStorage acknowledges at once) and replayed through the
// store's ordinary `saveNotes` decision after a reload that interrupted it. It
// is never part of PracticeDB, a backup, an export or sync, and it never
// decides anything on its own: `saveNotes` compares its `base` with what is
// stored, so a draft can never silently overwrite newer text or recreate a
// deleted record.
//
// ONE owner of the base, for every editor lifetime, the reload replay and
// every whole-state write: `notesLanded`, called as each persisted state lands
// in IndexedDB. The base moves only to landed text this copy ACCOUNTS for —
// text this device's `saveNotes` wrote, the stored text it kept beside its
// own, or the text an editor showed once words are typed over it — never to a
// replacement nobody typed over (a sync, an import), so a replay still keeps
// both. The copy is dropped only when the latest write has
// landed holding its words.
//
// Every access is wrapped: storage that is full, blocked or absent costs only
// this safety net, never the edit itself.
// ---------------------------------------------------------------------------

const PREFIX = 'pc-note-draft:';

export interface NoteDraft {
  /** The words on screen. */
  text: string;
  /** The text on disk these words account for — how a competing change is recognised. */
  base: string;
}

function keyFor(owner: NoteOwner): string {
  return `${PREFIX}${owner.kind}:${owner.id}`;
}

const norm = (t: string | undefined) => (t ?? '').trim();

/** The state IndexedDB last acknowledged (the hydrated one until a write lands). */
let landed: PracticeDB | null = null;
/** Per owner: the base the held copy carries. */
const bases = new Map<string, string>();
/** Per owner: texts this device's `saveNotes` put in the store, or an editor's words were typed over (normalised). */
const accounted = new Map<string, Set<string>>();
/** Per owner: what an open editor showed, until its first keystroke accounts for it. */
const shownAtOpen = new Map<string, string>();

function account(key: string, ...texts: string[]): void {
  const set = accounted.get(key) ?? new Set<string>();
  for (const t of texts) set.add(norm(t));
  accounted.set(key, set);
}

function landedNotes(owner: NoteOwner): string | undefined {
  if (!landed) return undefined;
  const rec = owner.kind === 'item' ? landed.items.find((i) => i.id === owner.id) : landed.lessons.find((l) => l.id === owner.id);
  return rec ? (rec.notes ?? '') : undefined;
}

/** The base for this owner's copy: landed text it accounts for, else what it already had. */
function baseFor(owner: NoteOwner, fallback: string): string {
  const key = keyFor(owner);
  const disk = landedNotes(owner);
  if (disk !== undefined && accounted.get(key)?.has(norm(disk))) bases.set(key, disk);
  return bases.get(key) ?? fallback;
}

/** The persisted state as hydrated: what is on disk before this session writes. */
export function notesHydrated(db: PracticeDB): void {
  landed = db;
}

/**
 * A whole persisted state just landed. Each held copy re-bases onto it when
 * it accounts for the landed text, and is dropped when `latest` (no later
 * write issued) and the landed text holds its words.
 */
export function notesLanded(db: PracticeDB, latest: boolean): void {
  landed = db;
  for (const { owner, draft } of heldNoteDrafts()) {
    const disk = landedNotes(owner);
    if (disk === undefined) continue; // a gone record: the copy stays, recreating nothing
    if (latest && norm(disk) === norm(draft.text)) {
      dropNoteDraft(owner);
      continue;
    }
    const base = baseFor(owner, draft.base);
    if (base !== draft.base) write(owner, { text: draft.text, base });
  }
}

/** `saveNotes` put `written` in the store, over or beside `stored`: the copy accounts for both. */
export function notesWritten(owner: NoteOwner, stored: string, written: string): void {
  account(keyFor(owner), stored, written);
}

/**
 * An editor opens on this owner, showing `shown`: with no copy held, what is on
 * disk is the base. Opening alone accounts for nothing — a held copy's words
 * were not typed over `shown` — but the first keystroke (`holdNoteDraft`) does:
 * from then on the copy's words ARE edited from it, landed or still landing.
 */
export function noteEditBegins(owner: NoteOwner, shown: string): void {
  const key = keyFor(owner);
  shownAtOpen.set(key, shown);
  const held = heldNoteDraft(owner);
  if (held) bases.set(key, bases.get(key) ?? held.base);
  else bases.set(key, landedNotes(owner) ?? shown);
}

function write(owner: NoteOwner, draft: NoteDraft): boolean {
  try {
    localStorage.setItem(keyFor(owner), JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

/** Keep the latest text for this owner. Returns false when the device refused it. */
export function holdNoteDraft(owner: NoteOwner, text: string): boolean {
  const key = keyFor(owner);
  const shown = shownAtOpen.get(key);
  if (shown !== undefined) {
    shownAtOpen.delete(key);
    account(key, shown);
  }
  return write(owner, { text, base: baseFor(owner, heldNoteDraft(owner)?.base ?? landedNotes(owner) ?? '') });
}

/** Forget this owner's copy: its words are on disk. */
export function dropNoteDraft(owner: NoteOwner): void {
  bases.delete(keyFor(owner));
  accounted.delete(keyFor(owner));
  try {
    localStorage.removeItem(keyFor(owner));
  } catch {
    /* best-effort */
  }
}

/** This owner's held draft, if any. */
export function heldNoteDraft(owner: NoteOwner): NoteDraft | null {
  try {
    const draft = JSON.parse(localStorage.getItem(keyFor(owner)) ?? 'null') as NoteDraft | null;
    return draft && typeof draft.text === 'string' && typeof draft.base === 'string' ? draft : null;
  } catch {
    return null;
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
