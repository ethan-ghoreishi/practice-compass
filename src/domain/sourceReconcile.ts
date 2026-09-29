import type { ID, ISODate, Lesson, LessonRecording, MusicalValue, PracticeDB, PracticeItem } from './types';
import { isTermRef, resolveValue, TERM_FIELD_KIND, valueLabel, vocabulary, type Vocabulary } from './musicTerms';
import { createItem, createLesson } from './factories';
import { nowISO } from './util';
import {
  isSafeSourcePath,
  sourceItemId,
  sourceLessonId,
  type ArchiveSource,
  type SourceDiagnostic,
  type SourceIndex,
  type SourcePiece,
  type SourceSuppression,
} from './sourceArchive';

// ---------------------------------------------------------------------------
// Reconciling a published source index with the owner's own database.
//
// PURE and clock-explicit. Two steps, deliberately separate: `planArchiveImport`
// decides and explains, `applyArchiveImport` writes. The store commits the plan
// in ONE synchronous mutation, so a partially-applied import cannot exist.
//
// THE RULE THIS MODULE EXISTS FOR: the archive owns what the archive knows —
// registry facts, session facts, roles, memberships, availability. Everything
// else is the owner's and is seeded ONCE, then never written again. An import
// may establish repertoire membership, historical lesson provenance and source
// material. It may never establish recorded practice, a result, a review, or a
// deadline.
// ---------------------------------------------------------------------------

/**
 * The archive folder the owner's LEGACY references were written against. New
 * references are stored relative to the archive ROOT (the device base now ends
 * in `/setar-classes/`), so a legacy path carries one extra leading segment
 * that must come off before it can be looked up — and must not be written back.
 */
export const LEGACY_ARCHIVE_PREFIX = 'setar-classes/';

// --- decisions and questions -----------------------------------------------

export type ReconcileDecision =
  | { kind: 'link-item'; pieceKey: string; itemId: ID }
  | { kind: 'create-item'; pieceKey: string }
  | { kind: 'skip-item'; pieceKey: string }
  | { kind: 'link-lesson'; sessionN: number; lessonId: ID }
  | { kind: 'create-lesson'; sessionN: number }
  | { kind: 'skip-lesson'; sessionN: number }
  /**
   * A REGISTRY VALUE THE OWNER CHOSE TO TAKE — carrying `itemId`, the RECORD
   * it was shown against, and `from`, the value of theirs it was chosen
   * against. A decision is about the state the owner actually saw: the preview
   * and the commit are two moments, and between them a note can be saved, a
   * sync can land, another device can write.
   *
   * Without the PREMISE, choosing the archive's composer over an empty field
   * and then typing one yourself before pressing Apply replaced your own new
   * words with the registry's. Without the IDENTITY, the same answer landed on
   * whichever record happened to hold that piece at commit time: sync a
   * database where the piece is bound to item B instead, also with an empty
   * composer, and a choice made about A was written to B.
   */
  | { kind: 'apply-field'; pieceKey: string; itemId: ID; field: MetadataField; from: MusicalValue };

export type MetadataField = 'dastgahAvaz' | 'gusheh' | 'form' | 'composer';

export interface ReconcileCandidate {
  id: ID;
  title: string;
  why: string;
}

export interface ReconcileQuestion {
  kind: 'item' | 'lesson';
  /** Exactly one of these is set. */
  pieceKey?: string;
  sessionN?: number;
  label: string;
  candidates: ReconcileCandidate[];
}

/** A registry improvement the owner may apply to an already-seeded item. */
export interface MetadataSuggestion {
  pieceKey: string;
  itemId: ID;
  field: MetadataField;
  /** The owner's current value AS IT READS — a term's name, or their own text. */
  from: string;
  /** Set when that value is a term REFERENCE: the premise is the term itself. */
  fromTermId?: ID;
  to: string;
}

/**
 * Does the owner's field ALREADY say what the registry proposes? Literal text
 * compares exactly, as it always has. A term-backed field says it when the
 * registry's own spelling resolves to that same term — «Shur» in the registry
 * is not an improvement on a field that already IS شور. The registry text is
 * never rewritten; only the question "is there anything to offer" reads terms.
 */
function fieldAlreadySays(current: MusicalValue | undefined, proposed: string, field: MetadataField, vocab: Vocabulary): boolean {
  if (!isTermRef(current)) return (current ?? '') === proposed;
  if (field === 'gusheh') return false;
  const kind = TERM_FIELD_KIND[field];
  const mine = resolveValue(current, kind, vocab);
  const theirs = resolveValue(proposed, kind, vocab);
  return mine.status === 'term' && theirs.status === 'term' && mine.term.id === theirs.term.id;
}

/**
 * Does this decision still describe THIS suggestion? The one answer, used by
 * the plan's own summary and by `applyArchiveImport`'s write — a question with
 * two answers is how a preview and a commit come to mean different things.
 */
export function decisionMatchesSuggestion(d: ReconcileDecision, s: MetadataSuggestion): boolean {
  return (
    d.kind === 'apply-field' &&
    d.pieceKey === s.pieceKey &&
    // IDENTITY and PREMISE together: which record, and what of theirs it was
    // chosen against. Either one alone lets a rebase redirect the answer.
    d.itemId === s.itemId &&
    d.field === s.field &&
    // A term-backed premise is the term; a text premise is what the owner read.
    (isTermRef(d.from) ? d.from.termId === s.fromTermId : d.from === s.from)
  );
}

export interface ImportSummary {
  addedItems: number;
  addedLessons: number;
  updatedLessons: number;
  questions: number;
  attention: number;
  /** Nothing at all would change: the same index, already accepted. */
  unchanged: boolean;
}

export interface ImportPlan {
  archiveId: string;
  instrumentId: ID;
  indexHash: string;
  /** The graph to persist, carrying the owner's existing suppressions. */
  source: ArchiveSource;
  newItems: PracticeItem[];
  newLessons: Lesson[];
  /** Existing lessons adopted into the archive (id preserved, binding added). */
  adoptedLessons: Lesson[];
  /**
   * Already-bound lessons whose stored reference PATHS the rename log moved —
   * the row, its title and its notes untouched, only the path text rewritten.
   */
  repairedLessons: Lesson[];
  /** Existing items adopted by an explicit owner decision. */
  adoptedItems: PracticeItem[];
  questions: ReconcileQuestion[];
  suggestions: MetadataSuggestion[];
  attention: SourceDiagnostic[];
  /**
   * Decisions whose PREMISE moved: the owner's value is no longer the one the
   * choice was made against, or a link target has since been deleted, bound
   * elsewhere or moved to another instrument. They are not applied and not
   * quietly turned into some other action — the commit refuses and the owner
   * looks again at what is actually there now.
   */
  staleDecisions: ReconcileDecision[];
  summary: ImportSummary;
}

// --- helpers ---------------------------------------------------------------

/** Strip the legacy archive-folder prefix; leave anything else alone. */
export function toArchiveRelative(path: string): string {
  return path.startsWith(LEGACY_ARCHIVE_PREFIX) ? path.slice(LEGACY_ARCHIVE_PREFIX.length) : path;
}

function suppressionKey(s: SourceSuppression): string {
  return `${s.kind}\u0000${s.ref}\u0000${s.itemId ?? ''}`;
}

/**
 * WHERE DOES THIS ARCHIVE PATH POINT NOW? One reading, for everything that
 * uses a stored path as an IDENTITY.
 *
 * `repairReferencePath` followed the whole logged chain while adoption took a
 * single hop and a suppression took none at all, so one rename log gave three
 * different answers about the same file. With A -> B -> C logged, B in session
 * 1 and C in session 2, a legacy class was adopted as session 1 on the
 * strength of B and then had that very reference repaired into session 2 —
 * bound to one class, pointing at another's files. A hidden resource,
 * meanwhile, stayed keyed to the old path and simply reappeared under the new
 * one.
 *
 * A CYCLE YIELDS NO IDENTITY AT ALL, and saying so is the whole return type.
 * A log that loops says nothing about where the file is, and picking a
 * stopping point would invent one. This used to hand back
 * `{ path, cycle: true }` — a perfectly usable-looking path beside a flag —
 * and only ONE of the three callers read the flag: `hasSourcePathEvidence`
 * refused it, while the suppression re-key and `retainMissing` walked straight
 * past it. With A->B and B->A logged, an owner's hide of A was re-keyed onto
 * B, so A reappeared and the wrong file went dark. `null` is what makes that
 * unrepresentable: there is no path to drop the verdict and still use.
 */
export function followRenames(path: string, renames: Map<string, string>): string | null {
  let current = path;
  const seen = new Set<string>([current]);
  while (renames.has(current)) {
    const next = renames.get(current)!;
    if (seen.has(next)) return null;
    seen.add(next);
    current = next;
  }
  return current;
}

/** The registry facts an item is SEEDED from — identity, never working detail. */
function persianFromPiece(piece: SourcePiece) {
  return {
    // "گوشه" is the form that identifies a gusheh. Every other form is carried
    // verbatim; none of them is turned into a category the registry never made.
    ...(piece.form === 'گوشه' ? { gusheh: piece.piece || piece.key } : {}),
    ...(piece.dastgah ? { dastgahAvaz: piece.dastgah } : {}),
    ...(piece.form ? { form: piece.form } : {}),
    ...(piece.composer ? { composer: piece.composer } : {}),
  };
}

/**
 * A NEW library item for a canonical piece.
 *
 * `status: 'dormant'` ("Resting") is an explicit ADMINISTRATIVE import policy,
 * not a judgement about the music: ninety-four pieces arriving as live
 * candidates would flood every recommendation and every session plan on the
 * day of the import. A resting item is still searchable, still in My
 * repertoire, and still directly startable — the owner decides what comes back.
 *
 * Nothing about practice is seeded: no last practice, no result, no review
 * date, no SM-2 state. `createItem` already leaves every one of those empty;
 * this function adds no field it does not.
 */
function itemForPiece(archiveId: string, instrumentId: ID, piece: SourcePiece, now: Date): PracticeItem {
  const item = createItem(
    {
      instrumentId,
      // The canonical key IS the piece's name in this archive, byte for byte.
      title: piece.key,
      itemType: piece.form === 'گوشه' ? 'gusheh' : 'full_piece',
      status: 'dormant',
      persian: persianFromPiece(piece),
    },
    now,
  );
  return { ...item, id: sourceItemId(archiveId, piece.key), source: { archiveId, pieceKey: piece.key } };
}

/** A historical lesson for one archive session. */
function lessonForSession(
  archiveId: string,
  instrumentId: ID,
  session: { n: number; date: ISODate },
  now: Date,
): Lesson {
  const lesson = createLesson({ instrumentId, date: session.date, number: session.n }, now);
  return {
    ...lesson,
    id: sourceLessonId(archiveId, session.n),
    source: { archiveId, sessionN: session.n },
    // HISTORY, whatever the clock says. See `isUpcomingLesson`.
    origin: 'archive',
  };
}

/**
 * Read a stored reference path as an ARCHIVE-RELATIVE one.
 *
 * A full URL sitting under THIS DEVICE's own verified base names the same file
 * as the relative path beneath it — written differently, nothing more. Adoption
 * evidence and path repair therefore have to read a stored path the SAME way,
 * or one of them adopts a class the other cannot fix: a lesson whose references
 * were saved as full links would carry perfectly good evidence that nothing
 * recognised.
 *
 * Anything it cannot read as archive-relative — a foreign origin, a link with a
 * query or fragment, a URL with no verified base to measure it against, an
 * unsafe path — comes back as the repair outcome that case deserves, so the two
 * callers cannot disagree about those either.
 */
type RelativeRead = { ok: true; relative: string; wasUrl: boolean } | { ok: false; outcome: ReferenceRepair };

function readArchiveRelative(raw: string, verifiedBase?: string): RelativeRead {
  if (!raw) return { ok: false, outcome: { status: 'attention', reason: 'This reference has no path.', code: 'no-path' } };

  let relative = raw;
  let wasUrl = false;
  if (/^https?:\/\//i.test(raw)) {
    wasUrl = true;
    if (!verifiedBase) {
      return {
        ok: false,
        outcome: {
          status: 'attention',
          reason: 'A full link cannot be converted without a verified media base.',
          code: 'no-base',
        },
      };
    }
    let url: URL;
    let base: URL;
    try {
      url = new URL(raw);
      base = new URL(verifiedBase);
    } catch {
      return { ok: false, outcome: { status: 'attention', reason: 'That link could not be read as a URL.', code: 'bad-url' } };
    }
    if (url.search || url.hash) return { ok: false, outcome: { status: 'unchanged' } };
    const prefix = base.toString().replace(/\/+$/, '') + '/';
    if (!url.toString().startsWith(prefix)) return { ok: false, outcome: { status: 'unchanged' } };
    // Decoded per SEGMENT because `resolveRecording` re-encodes on the way out;
    // a Farsi filename copied percent-encoded would otherwise double-escape.
    relative = url
      .toString()
      .slice(prefix.length)
      .split('/')
      .map((seg) => {
        try {
          return decodeURIComponent(seg);
        } catch {
          return seg;
        }
      })
      .join('/');
  }

  const stripped = toArchiveRelative(relative);
  if (!isSafeSourcePath(stripped)) {
    return { ok: false, outcome: { status: 'attention', reason: 'That path is not a safe archive path.', code: 'unsafe' } };
  }
  return { ok: true, relative: stripped, wasUrl };
}

/**
 * Does this lesson carry EXACT source-path evidence that it is this session?
 *
 * A reference whose stored path — once the legacy archive prefix is off, and
 * once the rename log has been followed — sits inside that session's folder is
 * proof the owner's own record already points at these very files. Date and
 * number agreeing is not: two classes can share a number across years, and the
 * owner's upcoming class 38 and archive session 38 are a real, live example of
 * exactly that collision.
 */
function hasSourcePathEvidence(
  lesson: Lesson,
  folder: string,
  renames: Map<string, string>,
  verifiedBase?: string,
): boolean {
  return (lesson.recordings ?? []).some((r) => {
    const read = readArchiveRelative(r.path.trim(), verifiedBase);
    if (!read.ok) return false;
    const moved = followRenames(read.relative, renames);
    if (moved === null) return false; // no reading, therefore no evidence
    return moved.startsWith(`${folder}/`);
  });
}

/**
 * Keep what the source has STOPPED describing, flagged unavailable.
 *
 * A piece removed from the registry, a session folder that is gone, a file that
 * was deleted — the app has an item bound to it, a lesson bound to it and
 * material listed from it. Replacing the graph with the incoming index alone
 * would leave those bindings pointing at nothing, which `validateDB` refuses at
 * every door: the next Refresh, and every one after it, would fail outright.
 *
 * So provenance is RETAINED and labelled instead. The owner sees that the file
 * is no longer in the archive and decides what to do; nothing of theirs is
 * deleted to make the two agree. A row that comes back is simply the incoming
 * row again, with no flag — the source is authoritative about what it HAS.
 */
function retainMissing(previous: ArchiveSource | undefined, index: SourceIndex, renames: Map<string, string>) {
  if (!previous) return { pieces: index.pieces, sessions: index.sessions };

  const incomingKeys = new Set(index.pieces.map((p) => p.key));
  const pieces = [
    ...index.pieces,
    ...previous.pieces.filter((p) => !incomingKeys.has(p.key)).map((p) => ({ ...p, unavailable: true as const })),
  ];

  const incomingSessions = new Map(index.sessions.map((s) => [s.n, s]));
  // Every path the incoming graph describes, ACROSS sessions: a rename can
  // move a file into a different session (the log's own A -> B -> C shape), and
  // asking only "is it still in THIS session" would flag such a file as gone
  // while the very same bytes sit in the graph under their new name.
  const anywhere = new Set(index.sessions.flatMap((s) => s.resources.map((r) => r.path)));
  // A cycle is NOT a move: with no readable destination there is nothing to
  // say the bytes are elsewhere in the graph, so the row keeps its provenance
  // and its `unavailable` flag rather than being silently dropped.
  const movedNotGone = (path: string) => {
    const to = followRenames(path, renames);
    return to !== null && anywhere.has(to);
  };
  const sessions = index.sessions.map((s) => {
    const before = previous.sessions.find((x) => x.n === s.n);
    if (!before) return s;
    const paths = new Set(s.resources.map((r) => r.path));
    // A RENAMED FILE MOVED; IT DID NOT GO MISSING. Its old row is dropped
    // rather than retained-and-flagged, because the log says exactly where the
    // bytes went and the incoming row describes them. Safe to drop: only
    // pieces and sessions carry item/lesson bindings, so no binding can dangle
    // on a resource row, and a manual unclassified lesson's own reference
    // reaches material through the LESSON, never through this graph.
    const gone = before.resources
      .filter((r) => !paths.has(r.path) && !movedNotGone(r.path))
      .map((r) => ({ ...r, unavailable: true as const }));
    return gone.length > 0 ? { ...s, resources: [...s.resources, ...gone] } : s;
  });
  for (const before of previous.sessions) {
    if (incomingSessions.has(before.n)) continue;
    sessions.push({
      ...before,
      unavailable: true,
      // …and a file this vanished session's folder was renamed OUT of is in the
      // graph already, under its new session. Keeping it here too would list
      // one file twice, once falsely as missing.
      resources: before.resources
        .filter((r) => !movedNotGone(r.path))
        .map((r) => ({ ...r, unavailable: true as const })),
    });
  }
  sessions.sort((a, b) => a.n - b.n);
  return { pieces, sessions };
}

// --- planning --------------------------------------------------------------

export interface PlanInput {
  db: PracticeDB;
  index: SourceIndex;
  instrumentId: ID;
  decisions?: ReconcileDecision[];
  /**
   * This DEVICE's confirmed media base, when it has one. Only a full URL
   * sitting under it may be rewritten to an archive-relative path; without it
   * a stored `https://…` link is left exactly as the owner saved it.
   */
  verifiedBase?: string;
  now: Date;
}

/**
 * Decide what an import would do, without doing any of it.
 *
 * EXACT SOURCE BINDING WINS. A record already bound to a source identity IS
 * that entity, whatever its title or date has since been edited to. Only an
 * UNBOUND record is a candidate for anything, and only exact evidence adopts
 * one: everything weaker becomes a question with the candidates named.
 */
export function planArchiveImport({ db, index, instrumentId, decisions = [], verifiedBase, now }: PlanInput): ImportPlan {
  const vocab = vocabulary(db.musicTerms ?? []);
  const archiveId = index.archiveId;
  const existing = db.archiveSources?.find((s) => s.id === archiveId);
  const suppressions = existing?.suppressions ?? [];
  const isSuppressed = (kind: SourceSuppression['kind'], ref: string) =>
    suppressions.some((s) => s.kind === kind && s.ref === ref && s.itemId === undefined);

  // EVERY DECISION IS ACCOUNTED FOR: applied, already realised, or STALE.
  //
  // The loops below start with `if (already bound) continue` / `if (already
  // suppressed) continue`, which meant a decision about a record that had been
  // bound between the preview and the commit was never looked at at all — no
  // adoption, no question, and an EMPTY `staleDecisions`, so the commit
  // reported success for an action it had not performed. Marking what is used
  // and sweeping the rest closes that for every kind at once, rather than
  // adding a stale check inside each early return.
  const consumed = new Set<ReconcileDecision>();
  const decisionFor = <T extends ReconcileDecision['kind']>(kind: T, match: (d: ReconcileDecision) => boolean) =>
    decisions.find((d) => d.kind === kind && match(d));
  const acted = <T,>(d: T): T => {
    if (d) consumed.add(d as unknown as ReconcileDecision);
    return d;
  };

  // A SKIP IS A DECISION, AND A DECISION IS PERSISTED.
  //
  // It used to live only in this call's `decisions` argument, so the owner's
  // "no, not this one" survived exactly as long as the preview screen did: the
  // next refresh — or simply a reload — asked the identical question again,
  // with nothing in the database to show it had ever been answered. It becomes
  // a suppression, the same record every other deliberate removal writes, which
  // a refresh, a reload and a sync all already respect.
  const addedSuppressions: SourceSuppression[] = [];
  const knownSuppressions = new Set(suppressions.map(suppressionKey));
  const suppress = (kind: SourceSuppression['kind'], ref: string) => {
    const entry: SourceSuppression = { kind, ref, at: nowISO(now) };
    if (knownSuppressions.has(suppressionKey(entry))) return;
    knownSuppressions.add(suppressionKey(entry));
    addedSuppressions.push(entry);
  };

  const renames = new Map(index.renames.map((r) => [r.from, r.to]));
  const staleDecisions: ReconcileDecision[] = [];

  // --- lessons ------------------------------------------------------------
  const boundLessons = new Map<number, Lesson>();
  for (const l of db.lessons) {
    if (l.source?.archiveId === archiveId) boundLessons.set(l.source.sessionN, l);
  }

  const newLessons: Lesson[] = [];
  const adoptedLessons: Lesson[] = [];
  const questions: ReconcileQuestion[] = [];

  for (const session of index.sessions) {
    if (boundLessons.has(session.n)) continue;
    if (isSuppressed('session', String(session.n))) continue;

    const skip = decisionFor('skip-lesson', (d) => 'sessionN' in d && d.sessionN === session.n);
    if (skip) {
      acted(skip);
      suppress('session', String(session.n));
      continue;
    }

    // "Create separately" ends the question: the owner has said this session is
    // NOT any of the classes already in their database. Without this branch the
    // decision was silently dropped and the ambiguous candidates re-asked for
    // ever — the item side had it from the start, and the lesson side did not.
    const createSeparately = decisionFor('create-lesson', (d) => 'sessionN' in d && d.sessionN === session.n);
    if (createSeparately) {
      acted(createSeparately);
      newLessons.push(lessonForSession(archiveId, instrumentId, session, now));
      continue;
    }

    const linked = decisionFor('link-lesson', (d) => 'sessionN' in d && d.sessionN === session.n) as
      | { kind: 'link-lesson'; sessionN: number; lessonId: ID }
      | undefined;
    if (linked) {
      // The SAME conditions the candidate list is built from — a link may only
      // adopt a record that is still unbound and still this instrument's.
      // Deleted, bound elsewhere or moved since the preview, the decision is
      // STALE, never silently turned into "create a new class instead".
      acted(linked);
      const target = db.lessons.find((l) => l.id === linked.lessonId);
      if (target && !target.source && target.instrumentId === instrumentId) {
        adoptedLessons.push({ ...target, source: { archiveId, sessionN: session.n }, origin: 'archive' });
        continue;
      }
      staleDecisions.push(linked);
    }

    // AUTO-ADOPT only a UNIQUE candidate with all three: same instrument, same
    // date, same number, and a reference that actually points into this
    // session's own folder.
    const candidates = db.lessons.filter(
      (l) =>
        !l.source &&
        l.instrumentId === instrumentId &&
        l.date === session.date &&
        l.number === session.n &&
        hasSourcePathEvidence(l, session.folder, renames, verifiedBase),
    );
    if (candidates.length === 1) {
      adoptedLessons.push({ ...candidates[0]!, source: { archiveId, sessionN: session.n }, origin: 'archive' });
      continue;
    }
    if (candidates.length > 1) {
      questions.push({
        kind: 'lesson',
        sessionN: session.n,
        label: `Class ${session.n} · ${session.date}`,
        candidates: candidates.map((l) => ({
          id: l.id,
          title: `${l.date}${l.number ? ` · class ${l.number}` : ''}`,
          why: 'Same date and number, and it already links to this folder.',
        })),
      });
      continue;
    }
    newLessons.push(lessonForSession(archiveId, instrumentId, session, now));
  }

  // --- items --------------------------------------------------------------
  const boundItems = new Map<string, PracticeItem>();
  for (const i of db.items) {
    if (i.source?.archiveId === archiveId) boundItems.set(i.source.pieceKey, i);
  }

  const newItems: PracticeItem[] = [];
  const adoptedItems: PracticeItem[] = [];
  const suggestions: MetadataSuggestion[] = [];

  for (const piece of index.pieces) {
    const bound = boundItems.get(piece.key);
    if (bound) {
      // SOURCE FACTS update; the owner's own fields never do. A later registry
      // improvement is OFFERED, field by field, and applied only on an explicit
      // decision — including when the owner's value is deliberately EMPTY.
      for (const field of ['dastgahAvaz', 'gusheh', 'form', 'composer'] as MetadataField[]) {
        const proposed = persianFromPiece(piece)[field] ?? '';
        const current = bound.persian?.[field];
        if (proposed && !fieldAlreadySays(current, proposed, field, vocab)) {
          suggestions.push({
            pieceKey: piece.key,
            itemId: bound.id,
            field,
            from: valueLabel(current, vocab),
            ...(isTermRef(current) ? { fromTermId: current.termId } : {}),
            to: proposed,
          });
        }
      }
      continue;
    }
    if (isSuppressed('piece', piece.key)) continue;

    const skipItem = decisionFor('skip-item', (d) => 'pieceKey' in d && d.pieceKey === piece.key);
    if (skipItem) {
      acted(skipItem);
      suppress('piece', piece.key);
      continue;
    }
    const linked = decisionFor('link-item', (d) => 'pieceKey' in d && d.pieceKey === piece.key) as
      | { kind: 'link-item'; pieceKey: string; itemId: ID }
      | undefined;
    if (linked) {
      acted(linked);
      const target = db.items.find((i) => i.id === linked.itemId);
      if (target && !target.source && target.instrumentId === instrumentId) {
        adoptedItems.push({ ...target, source: { archiveId, pieceKey: piece.key } });
        continue;
      }
      staleDecisions.push(linked); // see the lesson branch above
    }
    const createNow = acted(decisionFor('create-item', (d) => 'pieceKey' in d && d.pieceKey === piece.key));

    // CANDIDATES are EXACT equality only: the canonical key itself, or one of
    // the registry's own literal aliases. Nothing is normalised, folded or
    // transliterated here — that is search, and search is not identity. A
    // built-in `catalogKey` is never compared at all: "iraq" is a catalogue
    // slug, عراق is a canonical Farsi key, and equating them would merge two
    // different things on a coincidence of meaning.
    const literals = new Set<string>([piece.key, ...piece.aliases]);
    const candidates = createNow
      ? []
      : db.items.filter(
          (i) => !i.source && i.instrumentId === instrumentId && literals.has(i.title.trim()),
        );

    if (candidates.length > 0) {
      questions.push({
        kind: 'item',
        pieceKey: piece.key,
        label: piece.key,
        candidates: candidates.map((i) => ({
          id: i.id,
          title: i.title,
          why: i.title.trim() === piece.key ? 'Same title as the archive name.' : 'Matches a name this piece used to have.',
        })),
      });
      continue;
    }
    newItems.push(itemForPiece(archiveId, instrumentId, piece, now));
  }

  // --- EXACT REFERENCE REPAIR, inside the refresh the owner actually runs ---
  //
  // The rename log is published WITH the index, so the one moment the app can
  // repair a stored path is the moment it accepts a new graph. Adopting a
  // legacy class and leaving its own references pointing at names the archive
  // renamed years ago is half a job: the lesson binds, and every file on it
  // still 404s.
  //
  // Scope is the lessons this archive OWNS — the ones adopted by this plan and
  // the ones already bound. A lesson the archive has no claim on is not
  // something a refresh may rewrite.
  //
  // ONE pass over both, so `adoptedLessons` in the plan is byte-identical to
  // what `applyArchiveImport` installs: a preview that shows an old path while
  // the commit writes a new one is the plan/apply divergence this module is
  // built to make impossible.
  const known = new Set(index.sessions.flatMap((s) => s.resources.map((r) => r.path)));
  const repairAttention: SourceDiagnostic[] = [];
  const repair = (l: Lesson): { lesson: Lesson; changed: boolean } => {
    const outcome = repairLessonReferences(l, renames, known, verifiedBase);
    for (const a of outcome.attention) {
      // 'not-described' is NOT reported: the index describes only the material
      // scoped to pieces and classes, so a path it never names and never
      // renamed is outside what it knows — never evidence the file is gone.
      // See `RepairReason`.
      if (a.code === 'not-described') continue;
      repairAttention.push({ path: a.path, reason: a.reason });
    }
    return { lesson: outcome.lesson, changed: outcome.repaired > 0 };
  };

  const repairedAdopted = adoptedLessons.map((l) => repair(l).lesson);
  const repairedLessons: Lesson[] = [];
  for (const bound of boundLessons.values()) {
    const outcome = repair(bound);
    if (outcome.changed) repairedLessons.push(outcome.lesson);
  }

  // --- the graph to persist ------------------------------------------------
  // What the source still describes, PLUS what it has stopped describing,
  // flagged. New records above were minted from `index.pieces` alone, so a
  // retained-but-unavailable piece never comes back as a fresh item.
  const retained = retainMissing(existing, index, renames);
  const source: ArchiveSource = {
    id: archiveId,
    instrumentId,
    indexHash: index.contentHash,
    acceptedAt: nowISO(now),
    pieces: retained.pieces,
    sessions: retained.sessions,
    renames: index.renames,
    diagnostics: index.diagnostics,
    // A HIDE FOLLOWS ITS FILE, exactly as a stored reference does. A resource
    // suppression is keyed BY PATH, so a rename left the decision pointing at
    // a name the archive no longer uses: the file came back into view under
    // its new path while the old, hidden row sat there flagged unavailable.
    // Rewriting the ref is not editing the owner's decision — it is the same
    // decision about the same bytes, said in the archive's current words. The
    // `itemId` scope is carried untouched, and re-keying cannot duplicate:
    // `suppressionKey` de-duplicates the result.
    suppressions: dedupeSuppressions([
      ...suppressions.map((sup) => {
        if (sup.kind !== 'resource') return sup;
        // A HIDE FOLLOWS ITS FILE ONLY WHERE THE LOG SAYS WHERE THE FILE WENT.
        // A cycle names no destination, so the decision stays exactly where the
        // owner put it: moving it to an arbitrary stop on the loop would both
        // un-hide what they hid and hide something they did not.
        const to = followRenames(sup.ref, renames);
        return to === null ? sup : { ...sup, ref: to };
      }),
      ...addedSuppressions,
    ]),
  };

  // A field decision only counts as a change when there is a suggestion for it
  // to apply — a stale one left over from an earlier preview changes nothing.
  const appliedFields = decisions.filter((d) => suggestions.some((x) => decisionMatchesSuggestion(d, x)));
  for (const d of appliedFields) acted(d);

  // THE SWEEP. Anything the loops above did not act on is either an action
  // that has ALREADY HAPPENED — the owner pressed Apply, it was written, and
  // the same decision is still in hand on the next preview — or an answer to a
  // question that no longer stands.
  //
  // The already-done branch is LOOP PREVENTION, not politeness:
  // `ArchiveRefresh` drops a stale decision and re-previews, and a realised
  // action can never be consumed by a loop that skips its record, so without
  // it the same decision would go stale for ever.
  const realised = (d: ReconcileDecision): boolean => {
    switch (d.kind) {
      case 'skip-item':
        return isSuppressed('piece', d.pieceKey);
      case 'skip-lesson':
        return isSuppressed('session', String(d.sessionN));
      case 'link-item':
        return boundItems.get(d.pieceKey)?.id === d.itemId;
      case 'create-item':
        return boundItems.get(d.pieceKey)?.id === sourceItemId(archiveId, d.pieceKey);
      case 'link-lesson':
        return boundLessons.get(d.sessionN)?.id === d.lessonId;
      case 'create-lesson':
        return boundLessons.get(d.sessionN)?.id === sourceLessonId(archiveId, d.sessionN);
      case 'apply-field': {
        // No live suggestion can mean two opposite things. The registry value
        // is already in the owner's field — done — or the registry no longer
        // proposes one, which is a premise that moved.
        const piece = index.pieces.find((x) => x.key === d.pieceKey);
        const item = boundItems.get(d.pieceKey);
        if (!piece || !item || item.id !== d.itemId) return false;
        const proposed = persianFromPiece(piece)[d.field] ?? '';
        return proposed !== '' && fieldAlreadySays(item.persian?.[d.field], proposed, d.field, vocab);
      }
    }
  };
  for (const d of decisions) {
    if (consumed.has(d) || staleDecisions.includes(d)) continue;
    if (realised(d)) continue;
    staleDecisions.push(d);
  }
  const changesRecords =
    newItems.length > 0 ||
    newLessons.length > 0 ||
    adoptedLessons.length > 0 ||
    adoptedItems.length > 0 ||
    repairedLessons.length > 0 ||
    addedSuppressions.length > 0 ||
    appliedFields.length > 0;
  const sameGraph = existing?.indexHash === index.contentHash;
  const attention = [...index.diagnostics, ...repairAttention];

  return {
    archiveId,
    instrumentId,
    indexHash: index.contentHash,
    source,
    newItems,
    newLessons,
    adoptedLessons: repairedAdopted,
    repairedLessons,
    adoptedItems,
    questions,
    suggestions,
    attention,
    staleDecisions,
    summary: {
      addedItems: newItems.length,
      addedLessons: newLessons.length,
      updatedLessons: repairedAdopted.length + adoptedItems.length + repairedLessons.length,
      questions: questions.length,
      attention: attention.length,
      unchanged: sameGraph && !changesRecords && questions.length === 0,
    },
  };
}

// --- applying --------------------------------------------------------------

/**
 * Apply a plan to a database, returning a NEW database — or the SAME OBJECT
 * when the plan changes nothing at all, so an unchanged refresh cannot bump the
 * revision counter or churn a timestamp.
 *
 * Nothing here touches a block, a review, an agenda entry, a practice counter,
 * a result or any scheduling field. It adds records and it replaces the source
 * graph; that is the whole of it.
 */
export function applyArchiveImport(db: PracticeDB, plan: ImportPlan, decisions: ReconcileDecision[] = []): PracticeDB {
  const existing = db.archiveSources?.find((s) => s.id === plan.archiveId);
  const graphChanged = !existing || existing.indexHash !== plan.indexHash;
  // AN OWNER DECISION IS A CHANGE even when the index is not. A skip recorded
  // against an already-current graph writes a suppression, and comparing the
  // index hash alone returned the database untouched — which is precisely how
  // "Skip" survived the preview and nothing else. The digest is verified at the
  // reader, so an equal hash really does mean an equal graph; the suppression
  // list is the part it says nothing about.
  const knownSuppressions = new Set((existing?.suppressions ?? []).map(suppressionKey));
  const suppressionsChanged =
    plan.source.suppressions.length !== knownSuppressions.size ||
    plan.source.suppressions.some((s) => !knownSuppressions.has(suppressionKey(s)));
  // A field decision counts only when the plan actually OFFERS that field —
  // the same rule the plan's own summary applies, so "nothing to do" means the
  // same thing on both sides of the preview/commit boundary. A decision left
  // over from an earlier preview must not make an unchanged refresh a write.
  const applied = decisions.filter(
    (d): d is Extract<ReconcileDecision, { kind: 'apply-field' }> =>
      plan.suggestions.some((x) => decisionMatchesSuggestion(d, x)),
  );
  const nothingToDo =
    !graphChanged &&
    !suppressionsChanged &&
    plan.newItems.length === 0 &&
    plan.newLessons.length === 0 &&
    plan.adoptedLessons.length === 0 &&
    plan.repairedLessons.length === 0 &&
    plan.adoptedItems.length === 0 &&
    applied.length === 0;
  if (nothingToDo) return db;

  const adoptedLessonIds = new Set(plan.adoptedLessons.map((l) => l.id));
  const repairedById = new Map(plan.repairedLessons.map((l) => [l.id, l]));
  const fieldsByItem = new Map<ID, MetadataSuggestion[]>();
  for (const s of plan.suggestions) {
    if (!applied.some((d) => decisionMatchesSuggestion(d, s))) continue;
    fieldsByItem.set(s.itemId, [...(fieldsByItem.get(s.itemId) ?? []), s]);
  }

  const items = db.items.map((item) => {
    const adopted = plan.adoptedItems.find((i) => i.id === item.id);
    const fields = fieldsByItem.get(item.id);
    if (!adopted && !fields) return item;
    const base = adopted ?? item;
    if (!fields) return base;
    return {
      ...base,
      persian: { ...base.persian, ...Object.fromEntries(fields.map((f) => [f.field, f.to])) },
      updatedAt: plan.source.acceptedAt,
    };
  });

  // A repaired path carries NO `updatedAt`: the archive renamed a file, which
  // is a source fact about where the bytes are, not the owner revising their
  // own record. The field application above DOES touch it, because that one is
  // the owner choosing to change a value of theirs. The asymmetry is the point.
  const lessons = db.lessons.map((l) => {
    if (adoptedLessonIds.has(l.id)) return plan.adoptedLessons.find((x) => x.id === l.id)!;
    return repairedById.get(l.id) ?? l;
  });

  const sources = (db.archiveSources ?? []).filter((s) => s.id !== plan.archiveId);

  return {
    ...db,
    // Adopted records are rewritten IN PLACE above — they keep their own ids,
    // their practice history and their position. Only genuinely new records are
    // appended.
    items: [...items, ...plan.newItems],
    lessons: [...lessons, ...plan.newLessons],
    archiveSources: [...sources, plan.source],
  };
}

// --- suppression -----------------------------------------------------------

/**
 * Record an owner decision that a refresh, a reload and a sync must all
 * respect. Narrowly scoped BY CONSTRUCTION: a resource hidden on one item
 * carries that item's id and leaves every sibling alone.
 *
 * Idempotent, so re-deleting the same thing does not grow the list.
 */
export function withSuppression(
  sources: ArchiveSource[],
  archiveId: string,
  suppression: SourceSuppression,
): ArchiveSource[] {
  return sources.map((s) => {
    if (s.id !== archiveId) return s;
    const key = suppressionKey(suppression);
    if (s.suppressions.some((x) => suppressionKey(x) === key)) return s;
    return { ...s, suppressions: [...s.suppressions, suppression] };
  });
}

/** Keep the FIRST of each distinct decision; re-keying two refs onto one path
 * must not grow the list. */
function dedupeSuppressions(list: SourceSuppression[]): SourceSuppression[] {
  const seen = new Set<string>();
  return list.filter((s) => {
    const k = suppressionKey(s);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Lift a suppression, so the next refresh may import that entity again. */
export function withoutSuppression(
  sources: ArchiveSource[],
  archiveId: string,
  match: (s: SourceSuppression) => boolean,
): ArchiveSource[] {
  return sources.map((s) => (s.id === archiveId ? { ...s, suppressions: s.suppressions.filter((x) => !match(x)) } : s));
}

// --- exact reference repair (no fuzzy matching, ever) ----------------------

/**
 * Why a repair could not proceed. The CODE exists because one of these is not
 * something the app may state as a fact: the published index deliberately
 * describes only the material the archive scopes to pieces and classes — 125
 * of its 258 files (the owner's own practice takes) are absent from it by
 * construction — so a path that is neither renamed nor described is simply
 * OUTSIDE what the index knows, never evidence that the file is gone. Every
 * other code is a real finding about the log itself.
 */
export type RepairReason = 'no-path' | 'unsafe' | 'no-base' | 'bad-url' | 'cycle' | 'renamed-gone' | 'not-described';

export type ReferenceRepair =
  | { status: 'repaired'; path: string }
  | { status: 'unchanged' }
  | { status: 'attention'; reason: string; code: RepairReason };

/**
 * Repair ONE stored reference path against the archive's own rename log.
 *
 * EXACT mapping only. A path that the log does not name is left exactly as it
 * is with a reason — never matched by title, by size, by modification time or
 * by similarity. A full URL is converted only when it sits under the device's
 * VERIFIED base, and a URL carrying a query or fragment is not a plain file
 * path and stays untouched.
 */
export function repairReferencePath(
  path: string,
  renames: Map<string, string>,
  known: Set<string>,
  verifiedBase?: string,
): ReferenceRepair {
  const raw = path.trim();
  const read = readArchiveRelative(raw, verifiedBase);
  if (!read.ok) return read.outcome;
  const { relative: stripped, wasUrl } = read;

  // Follow the rename chain — the SAME reading adoption and suppression use.
  const moved = followRenames(stripped, renames);
  if (moved === null) return { status: 'attention', reason: 'The rename log loops on this path.', code: 'cycle' };
  const current = moved;
  if (current === stripped) {
    // A REWRITE INTO THE CURRENT NAMESPACE IS NOT A CLAIM THAT THE FILE EXISTS.
    // The device base is the archive ROOT, so a stored path carrying the legacy
    // archive folder — or written as a full URL beneath that base — names the
    // same bytes in words the base no longer addresses. This used to happen
    // only for a path the index DESCRIBES, which left an archive class holding
    // two namespaces at once: the owner's own practice takes (125 of the
    // archive's 258 files are outside the index by construction) kept the old
    // prefix and resolved to `<base>/setar-classes/setar-classes/…` the moment
    // the base was corrected. Saying it in one namespace is the repair; whether
    // the index describes the file is a separate question, answered below.
    if (wasUrl || stripped !== raw) return { status: 'repaired', path: current };
    if (known.has(current)) return { status: 'unchanged' };
    return { status: 'attention', reason: 'The archive no longer has a file at this path.', code: 'not-described' };
  }
  if (!known.has(current)) {
    return { status: 'attention', reason: 'This file was renamed, but the archive no longer has it.', code: 'renamed-gone' };
  }
  return { status: 'repaired', path: current };
}

/** Repair every reference on a lesson, preserving each row and its metadata. */
export function repairLessonReferences(
  lesson: Lesson,
  renames: Map<string, string>,
  known: Set<string>,
  verifiedBase?: string,
): { lesson: Lesson; repaired: number; attention: { title: string; path: string; reason: string; code: RepairReason }[] } {
  let repaired = 0;
  const attention: { title: string; path: string; reason: string; code: RepairReason }[] = [];
  const recordings: LessonRecording[] = (lesson.recordings ?? []).map((r) => {
    const outcome = repairReferencePath(r.path, renames, known, verifiedBase);
    if (outcome.status === 'repaired') {
      repaired += 1;
      // The ROW survives with its own title, notes, date and size: only the
      // path text changes. Two rows that now point at one physical file stay
      // two rows — deleting one would delete something the owner wrote.
      return { ...r, path: outcome.path };
    }
    if (outcome.status === 'attention') {
      attention.push({ title: r.title, path: r.path, reason: outcome.reason, code: outcome.code });
    }
    return r;
  });
  return { lesson: { ...lesson, recordings }, repaired, attention };
}
