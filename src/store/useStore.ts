import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { clearBlobs, deleteBlob, idbStorage, storageSettled, storageWasEmpty } from './idb';
import { withRevision } from './revision';
import {
  acknowledgeThrough,
  applyBlockStats,
  applyRoutineRun,
  catalogForStage,
  isLosslesslyRemovable,
  completeOpenReviewsFor,
  computeReviewOutcome,
  installDatabase,
  createPreparation,
  createQuestion,
  detachItem as detachAgendaItem,
  detachLesson as detachAgendaLesson,
  markQuestionAsked as markAgendaQuestionAsked,
  reopenQuestion as reopenAgendaQuestion,
  retargetEntriesForItemInstrument,
  retargetEntry as retargetAgendaEntry,
  completePlanSegment,
  planSegmentStartable,
  scheduleAgainPlan,
  transferToAutomaticReview,
  AUTOMATIC_TRANSFER_REASON,
  validateUnfinishedText,
  skipPlanSegment as skipPlanSegmentRun,
  setQuestionAnswer as setAgendaQuestionAnswer,
  resolveReviewDate,
  applyReviewDateToRows,
  applyReviewDateToRow,
  clampSchedulingParams,
  createBlock,
  createInstrument,
  createItem,
  createLesson,
  createMaterial,
  createReview,
  createSeedDB,
  detachIncompatibleRoutinesForPathway,
  detachRoutinesFromPathway,
  detachRoutinesFromStage,
  duplicateRoutineData,
  focusForItem,
  groupBlocksByItem,
  itemFromCatalogEntry,
  itemOwnedAttachments,
  retargetRoutineInstrument,
  runElapsedSeconds,
  segmentBoundaries,
  skipCurrentSegment,
  toRunSegments,
  snoozePlan,
  SNOOZE_DAYS_DEFAULT,
  todayISODate,
  unbindItemFromRoutines,
  unbindItemWhereInstrumentMismatch,
  defaultModeForStatus,
  DEFAULT_DURATION_MINUTES,
  emptyDB,
  newId,
  nowISO,
  withSuppression,
  withoutSuppression,
  planArchiveImport,
  applyArchiveImport,
  type ImportPlan,
  type ImportSummary,
  type ReconcileDecision,
  type SourceIndex,
  SCHEMA_VERSION,
  seedPathways,
  validateDB,
  SchemaTooNewError,
  type BlockMode,
  type BlockResult,
  type FocusArea,
  type GuitarFields,
  type ID,
  type Instrument,
  type AttachmentMeta,
  type ISODate,
  type ItemStatus,
  type LessonFileKind,
  type LessonRecording,
  type Material,
  type MaterialSourceType,
  type MaterialStatus,
  type Pathway,
  type PathwayRoutine,
  type PathwayStage,
  type PersianFields,
  type PracticeDB,
  type PracticeItem,
  type Rating,
  type ReviewAnswer,
  type ReviewMode,
  type ReviewType,
  type RoutineSegment,
  type RunSegment,
  type PlanRunSegment,
  type SchedulingParams,
  type SessionPlan,
} from '../domain';
import type { CreateItemInput } from '../domain/factories';

// ---------------------------------------------------------------------------
// The single app store. Holds the whole local database, the live practice
// session, and a colour-scheme preference. Everything persists to
// localStorage; domain logic stays pure and is called from the actions here.
// ---------------------------------------------------------------------------

export type ThemePref = 'system' | 'light' | 'dark';

export interface ArchiveCommitResult {
  ok: boolean;
  /** 'applied' · 'unchanged' · 'stale' (re-preview) · 'refused' · 'unsaved'. */
  status: 'applied' | 'unchanged' | 'stale' | 'refused' | 'unsaved';
  message: string;
  summary?: ImportSummary;
  /** On 'stale': the decisions whose premise moved, so the screen can drop them. */
  staleDecisions?: ReconcileDecision[];
}

/**
 * Module scope, for the same reason `githubSync`'s own `running` is: it
 * describes THIS DEVICE'S in-flight durability, not app data. A failed
 * IndexedDB write leaves the new graph in memory but not on disk, so the next
 * attempt must WRITE AGAIN even though nothing in the plan changed — otherwise
 * the retry says "Already current" over data that was never saved.
 */
let archivePersistFailed = false;

export interface ActiveSession {
  itemId: ID;
  instrumentId: ID;
  materialId?: ID;
  mode: BlockMode;
  focus: FocusArea;
  constraint?: string;
  targetMinutes: number;
  startedAt: string;
  /** Seconds accumulated up to the last pause. */
  accumulatedSeconds: number;
  running: boolean;
  /** When the current running segment began (if running). */
  segmentStartedAt?: string;
  /** A quick note jotted during practice; pre-fills the close screen. */
  note?: string;
  /** Count of boundaries already announced (practiceSignal.ts). Absent reads as zero — see nextSignal. */
  signalledThrough?: number;
}

export function sessionElapsedSeconds(s: ActiveSession, now: Date = new Date()): number {
  const live = s.running && s.segmentStartedAt
    ? (now.getTime() - new Date(s.segmentStartedAt).getTime()) / 1000
    : 0;
  return Math.max(0, Math.floor(s.accumulatedSeconds + live));
}

/** A plan segment plus its live run status (the domain's own run shape). */
export type PlanSegmentState = PlanRunSegment;

/** The Session Plan currently being run (ephemeral — never in PracticeDB). */
export interface ActivePlan {
  instrumentId: ID;
  budgetMinutes: number;
  startedAt: string;
  /** Index of the next segment to practise. */
  pointer: number;
  segments: PlanSegmentState[];
}

/**
 * A routine run in progress (ephemeral — never in PracticeDB). Same
 * accumulated-seconds-plus-live-since-timestamp shape as `ActiveSession`, for
 * the same reason: living in the store — not component state — means
 * navigating away (a nav-bar tap, browser back) never silently loses
 * genuinely-elapsed bound-item practice, exactly like an active block. Only
 * one routine can run at a time, matching `active`/`activePlan`.
 */
export interface ActiveRoutine {
  routineId: ID;
  shortOnTime: boolean;
  /**
   * The segment list as it was AT START — label, essential, itemId — frozen
   * here rather than re-derived live from the routine's current data. The
   * routine can be edited (segments added/removed) while a run is in
   * progress (Edit is reachable from StageDetail/PathwayDetail with no
   * "is this active" guard); re-deriving from live data would desync this
   * list's length from `segs` below and index past the end of one of them —
   * a blank runner screen. A run's segments are what was actually started.
   */
  authoredSegments: RoutineSegment[];
  /** Same length/order as authoredSegments; .seconds mutates (Skip clamps it). */
  segs: RunSegment[];
  accumulatedSeconds: number;
  running: boolean;
  runningSince?: string;
  /** Count of boundaries already announced (practiceSignal.ts). Absent reads as zero — see nextSignal. */
  signalledThrough?: number;
}

/** Advance the pointer to the next still-pending segment (or one past the end). */
export interface StartSessionInput {
  itemId: ID;
  instrumentId: ID;
  materialId?: ID;
  mode: BlockMode;
  focus: FocusArea;
  constraint?: string;
  targetMinutes: number;
}

export interface CloseSessionInput {
  result: BlockResult;
  durationMinutes: number;
  observation?: string;
  nextAction?: string;
  newStatus?: ItemStatus;
  /**
   * What the close screen answered about the next review. 'unanswered' (no
   * result chosen) must leave the item's date AND its open review row exactly
   * as they are — see ReviewAnswer in scheduling.ts.
   */
  answer: ReviewAnswer;
  nextReviewDate?: ISODate;
  reviewType?: ReviewType;
  /**
   * A question raised during this close. It becomes its OWN agenda entry —
   * it never overwrites an existing question, and it never marks the item as
   * work committed for a class. Targetless means honestly unassigned.
   */
  newQuestion?: { text: string; lessonId?: ID };
  /**
   * The `now` the close screen actually PREVIEWED its decision with — never
   * read from module scope inside `closeSession`. Recomputing a fresh
   * `new Date()` here instead would let the saved date silently diverge from
   * the one the screen just showed if the local day rolled between the
   * screen's last render and this call; the caller (`CloseBlock`) is
   * responsible for checking that first and refusing to call this while they
   * disagree. Defaults to `new Date()` for callers with no decision to keep
   * in step (there are none in-app; only tests omit it).
   */
  now?: Date;
}

export interface ItemPatch {
  instrumentId?: ID;
  title?: string;
  itemType?: PracticeItem['itemType'];
  materialId?: ID;
  status?: ItemStatus;
  importance?: Rating;
  difficulty?: Rating;
  primaryFocus?: FocusArea;
  /** Working notes. `undefined` CLEARS them — emptying the notebook is deliberate. */
  notes?: string;
  /** `undefined` (key absent) keeps the schedule; `null` clears it; an ISODate moves it — and its open review row with it (§1.5). */
  nextReviewDate?: ISODate | null;
  reviewMode?: ReviewMode;
  reviewIntervalDays?: number;
  persian?: PersianFields;
  guitar?: GuitarFields;
}

interface StoreState {
  db: PracticeDB;
  /** Monotonic data revision — bumped by middleware on every db mutation. */
  rev: number;
  active: ActiveSession | null;
  theme: ThemePref;
  /** True once the async IndexedDB store has finished rehydrating. */
  hydrated: boolean;
  /**
   * The instrument the user chose to practise right now ("I'm practising Setar").
   * Persisted so Today reopens where they left off. Null = overview.
   */
  sessionInstrumentId: ID | null;
  /** Reviews the user said "not now" to — hidden for the rest of *today* only. */
  notNow: { date: string; ids: ID[] };
  /** The Session Plan being run right now (ephemeral; not in PracticeDB). */
  activePlan: ActivePlan | null;
  /** Last chosen plan duration per instrument, so the picker remembers. */
  planMinutesByInstrument: Record<ID, number>;
  /** The routine run in progress right now (ephemeral; not in PracticeDB). */
  activeRoutine: ActiveRoutine | null;

  setTheme: (t: ThemePref) => void;
  setSessionInstrument: (id: ID | null) => void;

  /** Merge + clamp scheduling knobs. Passing null resets to the defaults. */
  updateSchedulingParams: (patch: Partial<SchedulingParams> | null) => void;

  // Session Plan (a time-budgeted programme over real practice blocks)
  /** Remember the chosen duration for an instrument's next plan. */
  setPlanMinutes: (instrumentId: ID, minutes: number) => void;
  /** Begin running a built plan (segments become pending). */
  startPlan: (plan: SessionPlan) => void;
  /** Start a real block seeded from the current segment (→ /active → /close). */
  beginPlanSegment: () => void;
  /** Mark the current segment skipped and advance (no data written). */
  skipPlanSegment: () => void;
  /** End the running plan (clears it). */
  endPlan: () => void;

  // Attachments (metadata; blobs live in IndexedDB via src/store/idb.ts)
  addAttachmentMeta: (meta: AttachmentMeta) => void;
  removeAttachmentMeta: (id: ID) => void;

  // Instruments
  addInstrument: (input: { name: string; family?: string }) => ID;
  updateInstrument: (id: ID, patch: Partial<Pick<Instrument, 'name' | 'family' | 'active'>>) => void;

  // Lessons (classes with a teacher)
  addLesson: (input: { instrumentId: ID; date: ISODate; notes?: string; number?: number }) => ID;
  updateLesson: (id: ID, patch: { date?: ISODate; notes?: string; number?: number }) => void;
  deleteLesson: (id: ID) => void;
  /** Link/unlink an existing item to a lesson (a link, never ownership). */
  linkItemToLesson: (lessonId: ID, itemId: ID) => void;
  addLessonRecording: (
    lessonId: ID,
    input: {
      title: string;
      path: string;
      kind?: LessonFileKind;
      date?: ISODate;
      sizeBytes?: number;
      durationLabel?: string;
      notes?: string;
    },
  ) => ID;
  removeLessonRecording: (lessonId: ID, recordingId: ID) => void;
  unlinkItemFromLesson: (lessonId: ID, itemId: ID) => void;

  // Materials
  addMaterial: (input: {
    instrumentId: ID;
    title: string;
    sourceType?: MaterialSourceType;
    sourceName?: string;
    parentTitle?: string;
    section?: string;
    teacherOrSource?: string;
    notes?: string;
    status?: MaterialStatus;
  }) => ID;
  updateMaterial: (id: ID, patch: Partial<Omit<Material, 'id' | 'createdAt'>>) => void;
  deleteMaterial: (id: ID) => void;

  // Items
  addItem: (input: CreateItemInput) => ID;
  /**
   * Save an item's own fields. Returns null, or the reason it REFUSED — a save
   * that would hand an ambiguous pending schedule to the engine is refused
   * whole rather than half-applied.
   */
  updateItem: (id: ID, patch: ItemPatch) => string | null;
  setItemStatus: (id: ID, status: ItemStatus) => void;
  deleteItem: (id: ID) => void;
  /** Delete a catalog item ONLY if lossless (fresh, never practised); returns whether it did. */
  removeCatalogItem: (id: ID) => boolean;
  placeItemInStage: (itemId: ID, stageId: ID | undefined) => void;

  // --- The archive source graph -------------------------------------------
  /**
   * Preview what a published index would do to THIS database, against the
   * revision it was decided at. Pure decision, no write.
   */
  previewArchiveImport: (input: {
    index: SourceIndex;
    instrumentId: ID;
    decisions?: ReconcileDecision[];
    /** This device's own media base, for converting a stored full URL. */
    verifiedBase?: string;
    now?: Date;
  }) => { plan: ImportPlan; rev: number };
  /** Apply a previewed plan in ONE mutation, and wait for IndexedDB to say so. */
  commitArchiveImport: (input: {
    index: SourceIndex;
    instrumentId: ID;
    decisions?: ReconcileDecision[];
    verifiedBase?: string;
    decidedFromRev: number;
    now?: Date;
  }) => Promise<ArchiveCommitResult>;
  /** Hide ONE archive resource — on one item, or everywhere. */
  hideArchiveResource: (archiveId: ID, path: string, itemId?: ID) => void;
  /** Lift a suppression, so the next refresh may bring that entity back. */
  resetArchiveSuppression: (archiveId: ID, kind: 'piece' | 'session' | 'resource' | 'link', ref: string) => void;
  /** Attach a direct NAS reference to an item — no artificial lesson needed. */
  addItemReference: (itemId: ID, ref: { title: string; path: string; kind?: LessonFileKind; notes?: string }) => void;
  /** Remove a direct item reference. Never touches the file it points at. */
  removeItemReference: (itemId: ID, refId: ID) => void;

  // Lesson agenda — commitments and questions, each naming its own class
  /** Commit an item to a specific class (or capture it unassigned). Returns the entry id. */
  addLessonPreparation: (itemId: ID, lessonId?: ID) => ID | null;
  /** Raise a question. It is its own entry; nothing else is overwritten. */
  addLessonQuestion: (input: { text: string; instrumentId: ID; itemId?: ID; lessonId?: ID }) => ID | null;
  /** Edit a question's text. Never touches its asked state or answer. */
  updateLessonQuestion: (id: ID, text: string) => void;
  /** Point an entry at a different class, or at none. The only carry-forward. */
  setAgendaTarget: (id: ID, lessonId: ID | undefined) => void;
  /** Mark asked (optionally with the teacher's answer). Logs no practice. */
  markQuestionAsked: (id: ID, answer?: string) => void;
  /** Put an asked question back on the open list. */
  reopenQuestion: (id: ID) => void;
  /** Record or replace a teacher answer without changing the asked state. */
  setQuestionAnswer: (id: ID, answer: string) => void;
  /** Remove an entry. Never deletes the item or its practice. */
  removeAgendaEntry: (id: ID) => void;
  /** Create a practice item from a stage's reference catalog entry; returns its id. */
  addFromCatalog: (stageId: ID, entryKey: string) => ID;
  /** Begin a session on an existing item (with smart defaults). */
  startItemSession: (itemId: ID) => void;

  // Session
  startSession: (input: StartSessionInput) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  setSessionNote: (note: string) => void;
  /** Persist how many target boundaries have been announced (practiceSignal.ts) — store state, not component state, so navigating away and back never re-announces. */
  setSessionSignal: (marker: number) => void;
  cancelSession: () => void;
  closeSession: (input: CloseSessionInput) => void;

  // Reviews
  completeReview: (id: ID, result?: BlockResult) => void;
  /** "Not now": hide a due review for the rest of today (no schedule change). */
  notNowReview: (id: ID) => void;
  /** Snooze: honestly move the due date N days from today (no SM-2 change). */
  snoozeReview: (id: ID, days?: number) => void;
  /**
   * "Schedule again" from the item itself: set the one pending date on both
   * the item and its review row, creating the row when none is open. Purely
   * administrative — no block, no result, no SM-2 progress.
   */
  scheduleReviewAgain: (itemId: ID, dueDate: ISODate, reviewType?: ReviewType) => void;
  /**
   * Hand this item's next review back to the engine, KEEPING its pending date.
   * Returns null on success, or the reason it refused (an ambiguous pending
   * schedule the owner has to resolve first). Records no practice.
   */
  useAutomaticReviewDates: (itemId: ID) => string | null;

  // Pathways
  addPathway: (input: { name: string; instrumentId?: ID; source?: string; description?: string; note?: string }) => ID;
  updatePathway: (id: ID, patch: Partial<Pick<Pathway, 'name' | 'instrumentId' | 'source' | 'description' | 'note' | 'archived' | 'currentStageId'>>) => void;
  deletePathway: (id: ID) => void;
  reseedDefaultPathways: () => void;

  addStage: (pathwayId: ID, input: { code: string; title: string; group?: string; intro?: string }) => ID;
  updateStage: (id: ID, patch: Partial<Pick<PathwayStage, 'code' | 'title' | 'group' | 'intro'>>) => void;
  deleteStage: (id: ID) => void;
  moveStage: (id: ID, dir: -1 | 1) => void;
  /** Rename a section heading across all of a pathway's stages. */
  renameSection: (pathwayId: ID, oldGroup: string | undefined, newGroup: string) => void;

  // Routines (ordinary editable data, placement optional, instrument required)
  addRoutine: (input: {
    name: string;
    instrumentId: ID;
    pathwayId?: ID;
    stageId?: ID;
    segments?: RoutineSegment[];
  }) => ID;
  /**
   * Full-form save: a complete replace, not a partial patch. Every save
   * re-enforces the binding + placement invariants against the instrument
   * being saved, whether or not it changed — never trusts the form on
   * faith. `instrumentId` is optional here (unlike addRoutine): editing an
   * already-unscoped legacy routine must be able to save without inventing
   * one.
   */
  updateRoutine: (
    id: ID,
    patch: { name: string; segments: RoutineSegment[]; instrumentId?: ID; pathwayId?: ID; stageId?: ID },
  ) => void;
  deleteRoutine: (id: ID) => void;
  duplicateRoutine: (id: ID) => ID;
  /**
   * Begin running a routine (segments become the live run). A no-op if an
   * ordinary block is running, or if a DIFFERENT routine is already active —
   * callers must resolve (resume/finish/discard) that one first, so its
   * in-flight elapsed time is never silently overwritten or double-counted.
   */
  startRoutineRun: (routineId: ID, shortOnTime: boolean, authoredSegments: RoutineSegment[]) => void;
  pauseRoutineRun: () => void;
  resumeRoutineRun: () => void;
  /** Mark the current segment skipped; finishes the run if that was the last one. */
  skipRoutineRun: () => void;
  /** Turn the active run into real practice blocks — at most one per distinct bound item, carrying its actual elapsed running time — then clear it. */
  finishRoutine: () => void;
  /** Persist how many segment boundaries have been announced (practiceSignal.ts) — store state, not component state, so navigating away and back never re-announces. */
  setRoutineSignal: (marker: number) => void;

  // Data management
  exportDB: () => PracticeDB;
  importDB: (raw: unknown) => void;
  resetDemo: () => void;
  clearAll: () => void;
}

function touch<T extends { updatedAt: string }>(entity: T, now: Date): T {
  return { ...entity, updatedAt: nowISO(now) };
}

export const useStore = create<StoreState>()(
  persist(
    withRevision((set, get) => ({
      db: emptyDB(),
      rev: 0,
      active: null,
      theme: 'system',
      hydrated: false,
      sessionInstrumentId: null,
      notNow: { date: '', ids: [] },
      activePlan: null,
      planMinutesByInstrument: {},
      activeRoutine: null,

      setTheme: (theme) => set({ theme }),

      updateSchedulingParams: (patch) =>
        set((s) => ({
          db: {
            ...s.db,
            // null ⇒ reset (drop the field so it falls back to defaults).
            settings: patch === null ? undefined : clampSchedulingParams({ ...s.db.settings, ...patch }),
          },
        })),

      setPlanMinutes: (instrumentId, minutes) =>
        set((s) => ({
          planMinutesByInstrument: { ...s.planMinutesByInstrument, [instrumentId]: Math.max(5, Math.round(minutes)) },
        })),

      startPlan: (plan) =>
        set({
          activePlan: {
            instrumentId: plan.instrumentId,
            budgetMinutes: plan.budgetMinutes,
            startedAt: nowISO(),
            pointer: 0,
            segments: plan.segments.map((seg) => ({ ...seg, status: 'pending' as const })),
          },
        }),

      beginPlanSegment: () => {
        const { activePlan, db, active, activeRoutine } = get();
        if (!activePlan) return;
        const seg = activePlan.segments[activePlan.pointer];
        // Revalidated LIVE against the same pure check a test can reach, never
        // trusted from the plan: an item can be deleted or moved to another
        // instrument between building the plan and reaching this segment.
        const check = planSegmentStartable(activePlan, db.items, !!active || !!activeRoutine);
        if (!check.ok) {
          // A deleted or moved item is visibly skipped (and skipping logs
          // nothing); a busy clock is refused outright rather than replaced.
          if (check.reason === 'deleted' || check.reason === 'moved') get().skipPlanSegment();
          return;
        }
        const item = check.item;
        if (!seg) return;
        get().startSession({
          itemId: item.id,
          instrumentId: item.instrumentId,
          materialId: item.materialId,
          mode: seg.mode,
          focus: seg.focus,
          targetMinutes: seg.minutes,
        });
      },

      skipPlanSegment: () =>
        set((s) => (s.activePlan ? { activePlan: skipPlanSegmentRun(s.activePlan) } : {})),

      endPlan: () => set({ activePlan: null }),

      setSessionInstrument: (sessionInstrumentId) => set({ sessionInstrumentId }),

      addAttachmentMeta: (meta) => {
        set((s) => ({ db: { ...s.db, attachments: [...s.db.attachments, meta] } }));
      },
      removeAttachmentMeta: (id) => {
        set((s) => ({ db: { ...s.db, attachments: s.db.attachments.filter((a) => a.id !== id) } }));
      },

      addInstrument: (input) => {
        const now = new Date();
        const inst = createInstrument(input, now);
        set((s) => ({ db: { ...s.db, instruments: [...s.db.instruments, inst] } }));
        return inst.id;
      },

      updateInstrument: (id, patch) => {
        const now = new Date();
        set((s) => ({
          db: {
            ...s.db,
            instruments: s.db.instruments.map((i) =>
              i.id === id ? touch({ ...i, ...patch }, now) : i,
            ),
          },
        }));
      },

      addLesson: (input) => {
        const now = new Date();
        const lesson = createLesson(input, now);
        set((s) => ({ db: { ...s.db, lessons: [...s.db.lessons, lesson] } }));
        return lesson.id;
      },

      updateLesson: (id, patch) => {
        const now = new Date();
        // AN OMITTED FIELD AND A DELIBERATELY EMPTY ONE ARE DIFFERENT THINGS.
        // `patch.notes ?? l.notes` could not tell them apart, so clearing a
        // lesson's notes was IMPOSSIBLE: the editor sends `undefined` for empty
        // text and the store handed the previous notes straight back, which
        // looked to the owner like the app silently refusing to delete what
        // they had just deleted. The PRESENCE of the key is the intent — the
        // same distinction `resolveReviewDate` already makes for a date.
        const clearsNotes = 'notes' in patch && !patch.notes;
        set((s) => ({
          db: {
            ...s.db,
            lessons: s.db.lessons.map((l) =>
              l.id === id
                ? touch(
                    { ...l, ...patch, notes: clearsNotes ? undefined : ('notes' in patch ? patch.notes : l.notes) },
                    now,
                  )
                : l,
            ),
          },
        }));
      },

      deleteLesson: (id) => {
        const detachNow = new Date();
        const lessonSource = get().db.lessons.find((l) => l.id === id)?.source;
        // The lesson owns its attachments; linked items are never touched.
        // ownerId alone is not a lesson id — an item can share it — so only
        // an attachment whose ownerType is ALSO 'lesson' is this lesson's own.
        const owned = get().db.attachments.filter((a) => a.ownerType === 'lesson' && a.ownerId === id);
        for (const a of owned) void deleteBlob(a.id);
        set((s) => ({
          db: {
            ...s.db,
            lessons: s.db.lessons.filter((l) => l.id !== id),
            attachments: s.db.attachments.filter((a) => !(a.ownerType === 'lesson' && a.ownerId === id)),
            // Entries that named it become visibly unassigned and REMEMBER
            // which class they were for. Nothing is deleted and nothing is
            // silently reassigned to another class.
            lessonAgenda: detachAgendaLesson(s.db.lessonAgenda, id, detachNow),
            // A DELETION IS A DECISION, and the next refresh must respect it:
            // without this the very same class comes straight back, because the
            // source still describes it. Recorded in the SAME mutation as the
            // delete, so there is no window in which one happened and not the
            // other.
            archiveSources: lessonSource
              ? withSuppression(s.db.archiveSources, lessonSource.archiveId, {
                  kind: 'session',
                  ref: String(lessonSource.sessionN),
                  at: nowISO(detachNow),
                })
              : s.db.archiveSources,
          },
        }));
      },

      linkItemToLesson: (lessonId, itemId) => {
        const now = new Date();
        set((s) => ({
          db: {
            ...s.db,
            lessons: s.db.lessons.map((l) =>
              l.id === lessonId && !(l.itemIds ?? []).includes(itemId)
                ? touch({ ...l, itemIds: [...(l.itemIds ?? []), itemId] }, now)
                : l,
            ),
          },
        }));
      },

      addLessonRecording: (lessonId, input) => {
        const now = new Date();
        const rec: LessonRecording = {
          id: newId(),
          title: input.title.trim() || 'Class recording',
          path: input.path.trim(),
          kind: input.kind ?? 'video',
          date: input.date,
          sizeBytes: input.sizeBytes,
          durationLabel: input.durationLabel,
          notes: input.notes?.trim() || undefined,
          createdAt: nowISO(now),
        };
        set((s) => ({
          db: {
            ...s.db,
            lessons: s.db.lessons.map((l) =>
              l.id === lessonId ? touch({ ...l, recordings: [...(l.recordings ?? []), rec] }, now) : l,
            ),
          },
        }));
        return rec.id;
      },

      // Removes only the REFERENCE. The NAS file is never touched.
      removeLessonRecording: (lessonId, recordingId) => {
        const now = new Date();
        set((s) => ({
          db: {
            ...s.db,
            lessons: s.db.lessons.map((l) =>
              l.id === lessonId
                ? touch({ ...l, recordings: (l.recordings ?? []).filter((r) => r.id !== recordingId) }, now)
                : l,
            ),
          },
        }));
      },

      unlinkItemFromLesson: (lessonId, itemId) => {
        const now = new Date();
        const { db } = get();
        // An archive association is DERIVED from the session's membership, not
        // stored on the lesson — so removing it means recording the owner's
        // decision, in the same mutation, or the graph simply asserts it again.
        const lessonSource = db.lessons.find((l) => l.id === lessonId)?.source;
        const itemSource = db.items.find((i) => i.id === itemId)?.source;
        const both = lessonSource && itemSource && lessonSource.archiveId === itemSource.archiveId ? lessonSource : null;
        set((s) => ({
          db: {
            ...s.db,
            lessons: s.db.lessons.map((l) =>
              l.id === lessonId
                ? touch({ ...l, itemIds: (l.itemIds ?? []).filter((x) => x !== itemId) }, now)
                : l,
            ),
            archiveSources: both
              ? withSuppression(s.db.archiveSources, both.archiveId, {
                  kind: 'link',
                  ref: `${both.sessionN}:${itemSource!.pieceKey}`,
                  at: nowISO(now),
                })
              : s.db.archiveSources,
          },
        }));
      },

      addMaterial: (input) => {
        const now = new Date();
        const mat = createMaterial(input, now);
        set((s) => ({ db: { ...s.db, materials: [...s.db.materials, mat] } }));
        return mat.id;
      },

      updateMaterial: (id, patch) => {
        const now = new Date();
        set((s) => ({
          db: {
            ...s.db,
            materials: s.db.materials.map((m) =>
              m.id === id ? touch({ ...m, ...patch }, now) : m,
            ),
          },
        }));
      },

      deleteMaterial: (id) => {
        set((s) => ({
          db: {
            ...s.db,
            materials: s.db.materials.filter((m) => m.id !== id),
            // Detach items from the removed material rather than deleting them.
            items: s.db.items.map((i) =>
              i.materialId === id ? { ...i, materialId: undefined } : i,
            ),
          },
        }));
      },

      addItem: (input) => {
        const now = new Date();
        const item = createItem(input, now);
        set((s) => ({ db: { ...s.db, items: [...s.db.items, item] } }));
        return item.id;
      },

      updateItem: (id, patch) => {
        const now = new Date();
        // Route the review date through the shared resolver (§1.5): absent
        // leaves the schedule untouched, so a blind spread of `patch` can
        // never silently wipe it; an ISODate moves the open review row with
        // it; null clears both sides honestly.
        const { nextReviewDate, ...rest } = patch;
        const write = resolveReviewDate(nextReviewDate);
        const current = get().db.items.find((i) => i.id === id);
        const newInstrumentId =
          rest.instrumentId !== undefined && current && rest.instrumentId !== current.instrumentId
            ? rest.instrumentId
            : undefined;
        // AN ARCHIVE BINDING NAMES ONE INSTRUMENT'S SOURCE. Moving the item
        // elsewhere would leave a binding that resolves to the wrong
        // instrument — a graph `validateDB` refuses at every inbound door, so
        // writing it here would produce a database this device could not
        // re-import. Refuse BEFORE the mutation and say what to do instead;
        // detaching from the archive is a separate, explicit act.
        if (newInstrumentId && current?.source) {
          return 'This piece is linked to the Setar archive. Detach it from the archive before moving it to another instrument.';
        }
        // A SAVED mode change from manual/fixed-cadence to automatic is the
        // same administrative transfer the item screen's own button performs —
        // the form must not be a second, quieter route that leaves the date's
        // provenance (and therefore its protection) saying something different.
        // An unrelated save on an already-auto item takes neither branch, so a
        // date the owner chose keeps its protection untouched.
        const movingToAuto = rest.reviewMode === 'auto' && !!current && (current.reviewMode ?? 'auto') !== 'auto';
        const transfer = movingToAuto
          ? transferToAutomaticReview({ item: current!, reviews: get().db.reviews, now })
          : null;
        if (transfer && !transfer.ok) return transfer.reason;
        const transferredRows =
          transfer && transfer.ok
            ? transfer.createRow
              ? [
                  ...transfer.reviews,
                  createReview(
                    {
                      practiceItemId: id,
                      dueDate: transfer.keptDate!,
                      reviewType: transfer.reviewType,
                      reason: AUTOMATIC_TRANSFER_REASON,
                    },
                    now,
                  ),
                ]
              : transfer.reviews
            : null;
        set((s) => ({
          db: {
            ...s.db,
            items: s.db.items.map((i) => {
              if (i.id !== id) return i;
              const next = { ...i, ...rest };
              if (write) {
                next.nextReviewDate = write.nextReviewDate;
                // A date arriving through an explicit item patch is the
                // OWNER'S, never the engine's — stamp the provenance here so
                // this cannot become a fourth path that writes a date without
                // one (closeSession, snoozeReview and scheduleReviewAgain all
                // stamp their own). Without it an owner-edited date on an
                // auto-source item would stay 'auto' and lose the protection
                // A4/A5 promise it. Clearing the date clears the provenance.
                next.nextReviewSource = write.nextReviewDate ? 'user' : undefined;
              }
              if (transfer && transfer.ok) {
                // Same DATE, new authority. Only the provenance moves.
                next.nextReviewSource = transfer.item.nextReviewSource;
              }
              return touch(next, now);
            }),
            reviews:
              applyReviewDateToRows({ reviews: s.db.reviews, practiceItemId: id, instruction: nextReviewDate, now }) ??
              transferredRows ??
              s.db.reviews,
            // An item that changes instrument no longer belongs in a routine
            // scoped to the old one — unbind it there; matching routines keep it.
            pathwayRoutines: newInstrumentId
              ? unbindItemWhereInstrumentMismatch(s.db.pathwayRoutines, id, newInstrumentId, now)
              : s.db.pathwayRoutines,
            // Its commitments and questions follow it; a class target that no
            // longer matches is cleared rather than pointing at another
            // instrument's lesson.
            lessonAgenda: newInstrumentId
              ? retargetEntriesForItemInstrument(s.db.lessonAgenda, id, newInstrumentId, s.db.lessons, now)
              : s.db.lessonAgenda,
          },
        }));
        return null;
      },

      setItemStatus: (id, status) => {
        const now = new Date();
        set((s) => ({
          db: {
            ...s.db,
            items: s.db.items.map((i) => (i.id === id ? touch({ ...i, status }, now) : i)),
          },
        }));
      },

      deleteItem: (id) => {
        // ownerId alone is not an item id — a lesson can share it — so only
        // an attachment owned by THIS item (ownerType 'item' too) is deleted.
        const owned = itemOwnedAttachments(get().db.attachments, id);
        for (const a of owned) void deleteBlob(a.id);
        const now = new Date();
        const itemSource = get().db.items.find((i) => i.id === id)?.source;
        set((s) => ({
          db: {
            ...s.db,
            items: s.db.items
              .filter((i) => i.id !== id)
              // Parts of a deleted piece stay, but ungrouped.
              .map((i) => (i.parentItemId === id ? touch({ ...i, parentItemId: undefined }, now) : i)),
            blocks: s.db.blocks.filter((b) => b.practiceItemId !== id),
            reviews: s.db.reviews.filter((r) => r.practiceItemId !== id),
            attachments: s.db.attachments.filter((a) => !(a.ownerType === 'item' && a.ownerId === id)),
            lessons: s.db.lessons.map((l) =>
              (l.itemIds ?? []).includes(id)
                ? touch({ ...l, itemIds: (l.itemIds ?? []).filter((x) => x !== id) }, now)
                : l,
            ),
            // The segment survives as an unbound countdown — never removed.
            pathwayRoutines: unbindItemFromRoutines(s.db.pathwayRoutines, id, now),
            // Commitments to prepare a deleted item go with it; QUESTIONS
            // survive, detached, because a question and its answer are the
            // owner's record of a class, not a property of the item.
            lessonAgenda: detachAgendaItem(s.db.lessonAgenda, id, now),
            // The same rule as a deleted class: a refresh, a reload and a sync
            // must not resurrect a piece the owner deliberately removed.
            archiveSources: itemSource
              ? withSuppression(s.db.archiveSources, itemSource.archiveId, {
                  kind: 'piece',
                  ref: itemSource.pieceKey,
                  at: nowISO(now),
                })
              : s.db.archiveSources,
          },
          active: s.active?.itemId === id ? null : s.active,
        }));
      },

      removeCatalogItem: (id) => {
        const s = get();
        const item = s.db.items.find((i) => i.id === id);
        if (!item) return false;
        const itemBlocks = s.db.blocks.filter((b) => b.practiceItemId === id);
        // Only proceed when the deletion is provably lossless — a fresh,
        // never-practised catalog item reverting to a suggestion.
        if (!isLosslesslyRemovable(item, itemBlocks)) return false;
        get().deleteItem(id);
        return true;
      },

      placeItemInStage: (itemId, stageId) => {
        const now = new Date();
        set((s) => ({
          db: {
            ...s.db,
            items: s.db.items.map((i) => (i.id === itemId ? touch({ ...i, stageId }, now) : i)),
          },
        }));
      },

      previewArchiveImport: ({ index, instrumentId, decisions, verifiedBase, now }) => {
        // ONE statement, so the plan and the revision it was decided against
        // cannot drift apart across an await that does not exist yet.
        const { db, rev } = get();
        return {
          plan: planArchiveImport({ db, index, instrumentId, decisions, verifiedBase, now: now ?? new Date() }),
          rev,
        };
      },

      commitArchiveImport: async ({ index, instrumentId, decisions = [], verifiedBase, decidedFromRev, now }) => {
        const at = now ?? new Date();
        // REBASE, never overwrite. A block finished, a note saved or an item
        // deleted while the index was being fetched has bumped `rev`; the plan
        // is recomputed against the database as it is NOW, so none of that work
        // is lost. A rebase that turns up a NEW question is not something to
        // decide on the owner's behalf — it goes back for another look.
        const before = get();
        const rebased = before.rev !== decidedFromRev;
        const plan = planArchiveImport({ db: before.db, index, instrumentId, decisions, verifiedBase, now: at });
        if (rebased && plan.questions.length > 0) {
          return {
            ok: false,
            status: 'stale',
            message: 'Your practice data changed while the index was being read, and this refresh now needs a decision. Look again.',
          };
        }
        // AND A DECISION WHOSE PREMISE MOVED IS NOT A DECISION ANY MORE. A new
        // QUESTION is not the only way a rebase invalidates an answer: the
        // owner choosing the archive's composer over an empty field, then
        // typing one of their own before pressing Apply, raised no question at
        // all and overwrote the words they had just written. The plan reports
        // both kinds of premise now — a moved value and a link target that has
        // been deleted, bound elsewhere or moved instrument — and this refuses
        // on either, whether or not `rev` moved.
        if (plan.staleDecisions.length > 0) {
          return {
            ok: false,
            status: 'stale',
            message: 'Something you had already decided about has changed since. Look again before applying.',
            staleDecisions: plan.staleDecisions,
          };
        }

        // "ALREADY CURRENT" IS WHATEVER `applyArchiveImport` ITSELF SAYS.
        // It returns the SAME OBJECT when a plan changes nothing, so asking it
        // is one source of truth for the question. The summary's own
        // `unchanged` was a second, and it answered about the INDEX alone: an
        // owner decision taken against an already-current index — skipping a
        // candidate, applying one registry field, a path the rename log moved —
        // was reported "Already current" and thrown away unwritten.
        const proposed = applyArchiveImport(before.db, plan, decisions);
        if (proposed === before.db && !archivePersistFailed) {
          return { ok: true, status: 'unchanged', message: 'Already current.', summary: plan.summary };
        }

        // VALIDATE THE WHOLE PROPOSED DATABASE BEFORE INSTALLING ANY OF IT —
        // the same function every inbound door runs. A graph this device would
        // refuse to import is a graph it must not write.
        try {
          validateDB(proposed);
        } catch (e) {
          return {
            ok: false,
            status: 'refused',
            message: e instanceof Error ? e.message : 'That index could not be applied.',
          };
        }

        // ONE synchronous mutation. No per-file commit, no blob copying, and
        // never `importDB`/`installDatabase`: this ADDS to the database, it
        // does not replace it, so the running clock, the routine, the plan and
        // every unrelated field stay exactly as they are.
        set({ db: proposed });
        try {
          await storageSettled();
        } catch {
          // The store already holds the new graph, so a retry that asked
          // "has anything changed?" would answer "no" and save nothing. The
          // flag is what makes the retry a real write rather than a false
          // "Already current".
          archivePersistFailed = true;
          return {
            ok: false,
            status: 'unsaved',
            message: 'The archive was read, but this device could not save it. Try again.',
            summary: plan.summary,
          };
        }
        archivePersistFailed = false;
        return { ok: true, status: 'applied', message: 'Archive updated.', summary: plan.summary };
      },

      hideArchiveResource: (archiveId, path, itemId) => {
        const at = nowISO(new Date());
        set((s) => ({
          db: {
            ...s.db,
            // `itemId` present hides it on THAT item only — a demonstration
            // shared by eight pieces stays available to the other seven.
            archiveSources: withSuppression(s.db.archiveSources, archiveId, {
              kind: 'resource',
              ref: path,
              ...(itemId ? { itemId } : {}),
              at,
            }),
          },
        }));
      },

      resetArchiveSuppression: (archiveId, kind, ref) => {
        set((s) => ({
          db: {
            ...s.db,
            archiveSources: withoutSuppression(
              s.db.archiveSources,
              archiveId,
              (x) => x.kind === kind && x.ref === ref,
            ),
          },
        }));
      },

      addItemReference: (itemId, ref) => {
        const now = new Date();
        set((s) => ({
          db: {
            ...s.db,
            items: s.db.items.map((i) =>
              i.id === itemId
                ? touch(
                    {
                      ...i,
                      references: [
                        ...(i.references ?? []),
                        {
                          id: newId(),
                          title: ref.title.trim() || ref.path,
                          path: ref.path.trim(),
                          kind: ref.kind ?? 'video',
                          notes: ref.notes?.trim() || undefined,
                          createdAt: nowISO(now),
                        },
                      ],
                    },
                    now,
                  )
                : i,
            ),
          },
        }));
      },

      removeItemReference: (itemId, refId) => {
        const now = new Date();
        set((s) => ({
          db: {
            ...s.db,
            items: s.db.items.map((i) =>
              i.id === itemId
                ? touch({ ...i, references: (i.references ?? []).filter((r) => r.id !== refId) }, now)
                : i,
            ),
          },
        }));
      },

      addLessonPreparation: (itemId, lessonId) => {
        const now = new Date();
        const { db } = get();
        const item = db.items.find((i) => i.id === itemId);
        if (!item) return null;
        // A class on another instrument is never a valid target — refuse
        // rather than silently rewriting either side.
        if (lessonId) {
          const lesson = db.lessons.find((l) => l.id === lessonId);
          if (!lesson || lesson.instrumentId !== item.instrumentId) return null;
        }
        // One commitment per item per class: committing twice is the same
        // commitment, not two.
        const existing = db.lessonAgenda.find(
          (e) => e.kind === 'preparation' && e.itemId === itemId && e.lessonId === lessonId,
        );
        if (existing) return existing.id;
        const entry = createPreparation({
          id: newId(),
          itemId,
          instrumentId: item.instrumentId,
          lessonId,
          now,
        });
        set((st) => ({ db: { ...st.db, lessonAgenda: [...st.db.lessonAgenda, entry] } }));
        return entry.id;
      },

      addLessonQuestion: (input) => {
        const now = new Date();
        const text = input.text.trim();
        if (!text) return null;
        const { db } = get();
        if (input.itemId) {
          const item = db.items.find((i) => i.id === input.itemId);
          if (!item || item.instrumentId !== input.instrumentId) return null;
        }
        if (input.lessonId) {
          const lesson = db.lessons.find((l) => l.id === input.lessonId);
          if (!lesson || lesson.instrumentId !== input.instrumentId) return null;
        }
        const entry = createQuestion({ id: newId(), ...input, text, now });
        set((st) => ({ db: { ...st.db, lessonAgenda: [...st.db.lessonAgenda, entry] } }));
        return entry.id;
      },

      updateLessonQuestion: (id, text) => {
        const now = new Date();
        const trimmed = text.trim();
        if (!trimmed) return;
        set((s) => ({
          db: {
            ...s.db,
            lessonAgenda: s.db.lessonAgenda.map((e) =>
              e.id === id && e.kind === 'question' ? touch({ ...e, text: trimmed }, now) : e,
            ),
          },
        }));
      },

      setAgendaTarget: (id, lessonId) => {
        const now = new Date();
        set((s) => ({
          db: { ...s.db, lessonAgenda: retargetAgendaEntry(s.db.lessonAgenda, id, lessonId, s.db.lessons, now) },
        }));
      },

      markQuestionAsked: (id, answer) => {
        const now = new Date();
        set((s) => ({ db: { ...s.db, lessonAgenda: markAgendaQuestionAsked(s.db.lessonAgenda, id, now, answer) } }));
      },

      reopenQuestion: (id) => {
        const now = new Date();
        set((s) => ({ db: { ...s.db, lessonAgenda: reopenAgendaQuestion(s.db.lessonAgenda, id, now) } }));
      },

      setQuestionAnswer: (id, answer) => {
        const now = new Date();
        set((s) => ({ db: { ...s.db, lessonAgenda: setAgendaQuestionAnswer(s.db.lessonAgenda, id, answer, now) } }));
      },

      removeAgendaEntry: (id) => {
        set((s) => ({ db: { ...s.db, lessonAgenda: s.db.lessonAgenda.filter((e) => e.id !== id) } }));
      },

      addFromCatalog: (stageId, entryKey) => {
        const { db } = get();
        // Reuse an existing item already created from this catalog entry.
        const existing = db.items.find((i) => i.stageId === stageId && i.catalogKey === entryKey);
        if (existing) return existing.id;

        const entry = catalogForStage(stageId).find((e) => e.key === entryKey);
        const stage = db.pathwayStages.find((s) => s.id === stageId);
        const pathway = stage ? db.pathways.find((p) => p.id === stage.pathwayId) : undefined;
        const instrumentId =
          (pathway?.instrumentId && db.instruments.find((i) => i.id === pathway.instrumentId)?.id) ||
          db.instruments.find((i) => i.active)?.id ||
          db.instruments[0]?.id ||
          '';
        const now = new Date();
        const item = entry
          ? itemFromCatalogEntry(entry, instrumentId, now)
          : createItem({ instrumentId, title: 'New item', stageId }, now);
        set((s) => ({ db: { ...s.db, items: [...s.db.items, item] } }));
        return item.id;
      },

      startItemSession: (itemId) => {
        const { db } = get();
        const item = db.items.find((i) => i.id === itemId);
        if (!item) return;
        get().startSession({
          itemId: item.id,
          instrumentId: item.instrumentId,
          materialId: item.materialId,
          mode: defaultModeForStatus(item.status),
          focus: focusForItem(item),
          targetMinutes: DEFAULT_DURATION_MINUTES,
        });
      },

      startSession: (input) => {
        const { active, activeRoutine } = get();
        // Never silently overwrite an existing session's elapsed time, and
        // never let an ordinary block run alongside a routine — every start
        // path (direct item starts, Session Plan segments) routes through
        // here, so this one guard is what keeps only one practice clock
        // ticking at a time. The caller must resolve the existing one first
        // (finish/discard/resume it) — same rule startRoutineRun applies in
        // the other direction.
        if (active || activeRoutine) return;
        const now = new Date();
        set({
          active: {
            ...input,
            startedAt: nowISO(now),
            accumulatedSeconds: 0,
            running: true,
            segmentStartedAt: nowISO(now),
          },
        });
      },

      pauseSession: () => {
        const { active } = get();
        if (!active || !active.running) return;
        set({
          active: {
            ...active,
            accumulatedSeconds: sessionElapsedSeconds(active),
            running: false,
            segmentStartedAt: undefined,
          },
        });
      },

      resumeSession: () => {
        const { active, activeRoutine } = get();
        if (!active || active.running) return;
        // A routine clock is also live (only reachable from persisted state
        // predating this guard) — resuming would tick two clocks at once,
        // same as a fresh start. Resolve it first (finish/discard it).
        if (activeRoutine) return;
        set({ active: { ...active, running: true, segmentStartedAt: nowISO() } });
      },

      setSessionNote: (note) => {
        const { active } = get();
        if (!active) return;
        set({ active: { ...active, note } });
      },

      setSessionSignal: (marker) => {
        const { active } = get();
        if (!active) return;
        set({ active: { ...active, signalledThrough: marker } });
      },

      cancelSession: () => set({ active: null }),

      closeSession: (input) => {
        const now = input.now ?? new Date();
        const { active, db, activePlan } = get();
        if (!active) return;
        const item = db.items.find((i) => i.id === active.itemId);
        if (!item) {
          set({ active: null });
          return;
        }

        const block = createBlock(
          {
            practiceItemId: item.id,
            instrumentId: active.instrumentId,
            materialId: active.materialId,
            startedAt: active.startedAt,
            endedAt: nowISO(now),
            durationMinutes: input.durationMinutes,
            mode: active.mode,
            focus: active.focus,
            constraint: active.constraint,
            result: input.result,
            observation: input.observation,
            nextAction: input.nextAction,
            createdReview: input.answer === 'scheduled',
          },
          now,
        );

        // The one decision behind closing a block: does the item get a next
        // review at all, and — if so — the single date written to both the
        // item and its new Review row (§1.1–§1.3).
        const outcome = computeReviewOutcome({
          item,
          result: input.result,
          answer: input.answer,
          nextReviewDate: input.nextReviewDate,
          reviewType: input.reviewType,
          now,
          params: clampSchedulingParams(db.settings),
        });

        const existing = db.blocks.filter((b) => b.practiceItemId === item.id);
        let updatedItem = applyBlockStats(item, block, {
          itemBlocksIncludingNew: [...existing, block],
          now,
          newStatus: input.newStatus,
          nextReviewDate: outcome.nextReviewDate,
        });
        if (outcome.sr) {
          updatedItem = {
            ...updatedItem,
            srReps: outcome.sr.srReps,
            srEase: outcome.sr.srEase,
            srIntervalDays: outcome.sr.srIntervalDays,
            // The one-advance-per-day marker only moves when the decision
            // actually advanced spacing; every other close leaves it alone.
            ...(outcome.sr.srLastProgressDay ? { srLastProgressDay: outcome.sr.srLastProgressDay } : {}),
          };
        }
        // Provenance travels with the date, from the same decision: an
        // engine-proposed date is the engine's to move again, a typed one is
        // the owner's and is protected until it comes due.
        if (outcome.nextReviewSource !== undefined) {
          updatedItem = {
            ...updatedItem,
            nextReviewSource: outcome.nextReviewSource ?? undefined,
          };
        }

        // A question raised here becomes its own agenda entry. It never
        // overwrites another question and never commits the item to a class.
        const questionText = input.newQuestion?.text.trim();
        // The same target validation the guarded action applies: a class on
        // another instrument is never a valid target, so the question is saved
        // honestly unassigned rather than pointed at somebody else's lesson.
        const questionLessonId = input.newQuestion?.lessonId;
        const questionLesson = questionLessonId ? db.lessons.find((l) => l.id === questionLessonId) : undefined;
        const newQuestion = questionText
          ? createQuestion({
              id: newId(),
              text: questionText,
              instrumentId: item.instrumentId,
              itemId: item.id,
              lessonId: questionLesson?.instrumentId === item.instrumentId ? questionLesson.id : undefined,
              now,
            })
          : undefined;

        // Complete this item's open reviews only when the SAME decision that
        // set the date says so, and schedule the next from that one date
        // (§1.2). Deciding it separately and unconditionally here is exactly
        // how the row and the date used to come apart.
        const reviews = completeOpenReviewsFor({
          reviews: db.reviews,
          practiceItemId: item.id,
          complete: outcome.completeOpenReviews,
          result: input.result,
          now,
        });
        if (outcome.review) {
          reviews.push(
            createReview(
              {
                practiceItemId: item.id,
                dueDate: outcome.review.dueDate,
                reviewType: outcome.review.reviewType,
              },
              now,
            ),
          );
        }

        // If a Session Plan is running and this block closed its current
        // segment's item, mark that segment done and advance. The plain flow
        // (no active plan) is byte-identical to before.
        const nextPlan = activePlan ? completePlanSegment(activePlan, item.id) : activePlan;

        set({
          db: {
            ...db,
            blocks: [...db.blocks, block],
            items: db.items.map((i) => (i.id === item.id ? updatedItem : i)),
            reviews,
            lessonAgenda: newQuestion ? [...db.lessonAgenda, newQuestion] : db.lessonAgenda,
          },
          active: null,
          activePlan: nextPlan,
        });
      },

      completeReview: (id, result) => {
        const now = new Date();
        set((s) => ({
          db: {
            ...s.db,
            reviews: s.db.reviews.map((r) =>
              r.id === id ? { ...r, completedAt: nowISO(now), result, updatedAt: nowISO(now) } : r,
            ),
          },
        }));
      },

      notNowReview: (id) => {
        const today = todayISODate();
        set((s) => {
          const sameDay = s.notNow.date === today;
          return {
            notNow: { date: today, ids: sameDay ? [...new Set([...s.notNow.ids, id])] : [id] },
          };
        });
      },

      snoozeReview: (id, days = SNOOZE_DAYS_DEFAULT) => {
        const now = new Date();
        const { dueDate } = snoozePlan(days, now);
        // The existing correct model: one date, resolved once. The write is
        // scoped to the SELECTED row only (applyReviewDateToRow) — snoozing
        // one due review must not silently move a sibling open review for
        // the same item, unlike closeSession/updateItem where the item's
        // whole schedule is what's being decided.
        const write = resolveReviewDate(dueDate)!;
        set((s) => {
          const review = s.db.reviews.find((r) => r.id === id);
          if (!review) return s;
          return {
            db: {
              ...s.db,
              reviews:
                applyReviewDateToRow({ reviews: s.db.reviews, reviewId: id, instruction: dueDate, now }) ??
                s.db.reviews,
              // Keep the item's own schedule in step so nothing shows overdue.
              // A snooze is the owner's own choice of date, so it is stamped
              // as theirs: extra practice before it must not quietly undo it.
              items: s.db.items.map((i) =>
                i.id === review.practiceItemId
                  ? touch({ ...i, nextReviewDate: write.nextReviewDate, nextReviewSource: 'user' as const }, now)
                  : i,
              ),
            },
          };
        });
      },

      // --- Pathways --------------------------------------------------------

      scheduleReviewAgain: (itemId, dueDate, reviewType) => {
        const now = new Date();
        set((s) => {
          const item = s.db.items.find((i) => i.id === itemId);
          if (!item) return s;
          const plan = scheduleAgainPlan({ item, reviews: s.db.reviews, dueDate, reviewType, now });
          const reviews = plan.createRow
            ? [
                ...plan.reviews,
                createReview({ practiceItemId: itemId, dueDate: plan.dueDate, reviewType: plan.reviewType }, now),
              ]
            : plan.reviews;
          return {
            db: {
              ...s.db,
              // The owner chose this date, so the engine treats it as
              // authoritative until it comes due. No block, no result, no
              // statistics and no SM-2 movement: this is administration.
              items: s.db.items.map((i) =>
                i.id === itemId
                  ? touch({ ...i, nextReviewDate: plan.dueDate, nextReviewSource: 'user' as const }, now)
                  : i,
              ),
              reviews,
            },
          };
        });
      },

      useAutomaticReviewDates: (itemId) => {
        const now = new Date();
        const state = get();
        // Decided against the LIVE item and rows, never against whatever a
        // panel captured when it mounted — including whether the item is
        // still there at all.
        const transfer = transferToAutomaticReview({
          item: state.db.items.find((i) => i.id === itemId),
          reviews: state.db.reviews,
          now,
        });
        if (!transfer.ok) return transfer.reason;
        const reviews = transfer.createRow
          ? [
              ...transfer.reviews,
              createReview(
                { practiceItemId: itemId, dueDate: transfer.keptDate!, reviewType: transfer.reviewType, reason: AUTOMATIC_TRANSFER_REASON },
                now,
              ),
            ]
          : transfer.reviews;
        set((s) => ({
          db: {
            ...s.db,
            items: s.db.items.map((i) => (i.id === itemId ? transfer.item : i)),
            reviews,
          },
        }));
        return null;
      },

      addPathway: (input) => {
        const now = new Date();
        const ts = nowISO(now);
        const pathway: Pathway = {
          id: newId(),
          instrumentId: input.instrumentId,
          name: input.name.trim(),
          source: input.source?.trim() || undefined,
          description: input.description?.trim() || undefined,
          note: input.note?.trim() || undefined,
          order: get().db.pathways.length,
          createdAt: ts,
          updatedAt: ts,
        };
        set((s) => ({ db: { ...s.db, pathways: [...s.db.pathways, pathway] } }));
        return pathway.id;
      },

      updatePathway: (id, patch) => {
        const now = new Date();
        const current = get().db.pathways.find((p) => p.id === id);
        const instrumentChanged = 'instrumentId' in patch && current && patch.instrumentId !== current.instrumentId;
        set((s) => ({
          db: {
            ...s.db,
            pathways: s.db.pathways.map((p) => (p.id === id ? touch({ ...p, ...patch }, now) : p)),
            // Neither side is silently rewritten to agree — an incompatible
            // placed routine is detached instead.
            pathwayRoutines: instrumentChanged
              ? detachIncompatibleRoutinesForPathway(s.db.pathwayRoutines, id, patch.instrumentId, now)
              : s.db.pathwayRoutines,
          },
        }));
      },

      deletePathway: (id) => {
        const now = new Date();
        set((s) => {
          const stageIds = new Set(s.db.pathwayStages.filter((st) => st.pathwayId === id).map((st) => st.id));
          return {
            db: {
              ...s.db,
              pathways: s.db.pathways.filter((p) => p.id !== id),
              pathwayStages: s.db.pathwayStages.filter((st) => st.pathwayId !== id),
              // A user's routine is detached, never deleted — same rule as items.
              pathwayRoutines: detachRoutinesFromPathway(s.db.pathwayRoutines, id, now),
              // Items are kept — they simply leave their stages.
              items: s.db.items.map((i) =>
                i.stageId && stageIds.has(i.stageId) ? touch({ ...i, stageId: undefined }, now) : i,
              ),
            },
          };
        });
      },

      reseedDefaultPathways: () => {
        const now = new Date();
        const { db } = get();
        const ids = {
          guitar: db.instruments.find((i) => /guitar/i.test(i.name))?.id ?? '',
          setar: db.instruments.find((i) => /setar/i.test(i.name) || i.name.includes('سه'))?.id ?? '',
          tar:
            db.instruments.find((i) => (/^tar$/i.test(i.name.trim()) || i.name.includes('تار')) && !/setar/i.test(i.name))?.id ?? '',
        };
        const seeded = seedPathways(ids, now);
        const have = new Set(db.pathways.map((p) => p.id));
        const newP = seeded.pathways.filter((p) => !have.has(p.id));
        const newIds = new Set(newP.map((p) => p.id));
        set((s) => ({
          db: {
            ...s.db,
            pathways: [...s.db.pathways, ...newP],
            pathwayStages: [...s.db.pathwayStages, ...seeded.pathwayStages.filter((x) => newIds.has(x.pathwayId))],
            pathwayRoutines: [...s.db.pathwayRoutines, ...seeded.pathwayRoutines.filter((x) => !!x.pathwayId && newIds.has(x.pathwayId))],
          },
        }));
      },

      addStage: (pathwayId, input) => {
        const now = new Date();
        const ts = nowISO(now);
        const order = get().db.pathwayStages.filter((s) => s.pathwayId === pathwayId).length;
        const stage: PathwayStage = {
          id: newId(),
          pathwayId,
          code: input.code.trim() || 'New',
          title: input.title.trim(),
          group: input.group?.trim() || undefined,
          intro: input.intro?.trim() || undefined,
          order,
          createdAt: ts,
          updatedAt: ts,
        };
        set((s) => ({ db: { ...s.db, pathwayStages: [...s.db.pathwayStages, stage] } }));
        return stage.id;
      },

      updateStage: (id, patch) => {
        const now = new Date();
        set((s) => ({
          db: { ...s.db, pathwayStages: s.db.pathwayStages.map((st) => (st.id === id ? touch({ ...st, ...patch }, now) : st)) },
        }));
      },

      deleteStage: (id) => {
        const now = new Date();
        set((s) => ({
          db: {
            ...s.db,
            pathwayStages: s.db.pathwayStages.filter((st) => st.id !== id),
            // Stage deletion is not pathway deletion — the routine keeps its
            // pathwayId and only stageId is cleared.
            pathwayRoutines: detachRoutinesFromStage(s.db.pathwayRoutines, id, now),
            // Items stay — they just leave the stage.
            items: s.db.items.map((i) => (i.stageId === id ? touch({ ...i, stageId: undefined }, now) : i)),
            // Un-pin any pathway pointing at the removed stage.
            pathways: s.db.pathways.map((p) =>
              p.currentStageId === id ? touch({ ...p, currentStageId: undefined }, now) : p,
            ),
          },
        }));
      },

      renameSection: (pathwayId, oldGroup, newGroup) => {
        const now = new Date();
        const next = newGroup.trim() || undefined;
        set((s) => ({
          db: {
            ...s.db,
            pathwayStages: s.db.pathwayStages.map((st) =>
              st.pathwayId === pathwayId && (st.group ?? undefined) === (oldGroup ?? undefined)
                ? touch({ ...st, group: next }, now)
                : st,
            ),
          },
        }));
      },

      moveStage: (id, dir) => {
        set((s) => {
          const stage = s.db.pathwayStages.find((x) => x.id === id);
          if (!stage) return s;
          const sibs = s.db.pathwayStages
            .filter((x) => x.pathwayId === stage.pathwayId)
            .sort((a, b) => a.order - b.order);
          const idx = sibs.findIndex((x) => x.id === id);
          const swap = sibs[idx + dir];
          if (!swap) return s;
          const now = new Date();
          return {
            db: {
              ...s.db,
              pathwayStages: s.db.pathwayStages.map((x) =>
                x.id === stage.id ? touch({ ...x, order: swap.order }, now) : x.id === swap.id ? touch({ ...x, order: stage.order }, now) : x,
              ),
            },
          };
        });
      },

      // --- Routines ----------------------------------------------------------

      addRoutine: (input) => {
        const now = new Date();
        const ts = nowISO(now);
        const draft: PathwayRoutine = {
          id: newId(),
          instrumentId: input.instrumentId,
          pathwayId: input.pathwayId,
          stageId: input.stageId,
          name: input.name.trim() || 'New routine',
          segments: input.segments ?? [],
          order: get().db.pathwayRoutines.length,
          createdAt: ts,
          updatedAt: ts,
        };
        // Never trust the caller's bindings/placement on faith — the same
        // invariant enforcement updateRoutine applies on every save.
        const { db } = get();
        const pathway = draft.pathwayId ? db.pathways.find((p) => p.id === draft.pathwayId) : undefined;
        const stage = draft.stageId ? db.pathwayStages.find((st) => st.id === draft.stageId) : undefined;
        const routine = retargetRoutineInstrument(draft, draft.instrumentId, db.items, pathway, stage, now);
        set((s) => ({ db: { ...s.db, pathwayRoutines: [...s.db.pathwayRoutines, routine] } }));
        return routine.id;
      },

      updateRoutine: (id, patch) => {
        const now = new Date();
        const { db } = get();
        const current = db.pathwayRoutines.find((r) => r.id === id);
        if (!current) return;
        set((s) => ({
          db: {
            ...s.db,
            pathwayRoutines: s.db.pathwayRoutines.map((r) => {
              if (r.id !== id) return r;
              const merged: PathwayRoutine = {
                ...r,
                name: patch.name.trim() || r.name,
                segments: patch.segments,
                instrumentId: patch.instrumentId,
                pathwayId: patch.pathwayId,
                stageId: patch.stageId,
              };
              // Always re-enforce the binding + placement invariants against
              // the instrument actually being saved — whether or not it
              // changed — rather than trusting whatever the form happened to
              // submit.
              const pathway = merged.pathwayId ? s.db.pathways.find((p) => p.id === merged.pathwayId) : undefined;
              const stage = merged.stageId ? s.db.pathwayStages.find((st) => st.id === merged.stageId) : undefined;
              return retargetRoutineInstrument(merged, merged.instrumentId, s.db.items, pathway, stage, now);
            }),
          },
        }));
      },

      deleteRoutine: (id) => {
        // Deleting the routine currently running must not strand
        // `activeRoutine` pointing at a now-dead id (every other routine's
        // Start would then redirect to a "Routine not found" dead end with
        // no way back). Finish it first — honestly saving whatever bound-item
        // time has genuinely elapsed, same as any other early finish — rather
        // than silently discarding it.
        if (get().activeRoutine?.routineId === id) get().finishRoutine();
        set((s) => ({ db: { ...s.db, pathwayRoutines: s.db.pathwayRoutines.filter((r) => r.id !== id) } }));
      },

      duplicateRoutine: (id) => {
        const now = new Date();
        const { db } = get();
        const routine = db.pathwayRoutines.find((r) => r.id === id);
        if (!routine) return '';
        const copy = duplicateRoutineData(routine, db.pathwayRoutines.length, now);
        set((s) => ({ db: { ...s.db, pathwayRoutines: [...s.db.pathwayRoutines, copy] } }));
        return copy.id;
      },

      startRoutineRun: (routineId, shortOnTime, authoredSegments) => {
        const { activeRoutine, active } = get();
        // Same guard as startSession, in the other direction: an ordinary
        // block already running must be resolved before a routine can start.
        if (active) return;
        if (activeRoutine && activeRoutine.routineId !== routineId) return;
        set({
          activeRoutine: {
            routineId,
            shortOnTime,
            authoredSegments,
            segs: toRunSegments(authoredSegments),
            accumulatedSeconds: 0,
            running: true,
            runningSince: nowISO(),
          },
        });
      },

      pauseRoutineRun: () => {
        const { activeRoutine } = get();
        if (!activeRoutine?.running) return;
        set({
          activeRoutine: {
            ...activeRoutine,
            accumulatedSeconds: runElapsedSeconds(activeRoutine.accumulatedSeconds, activeRoutine.runningSince, true, new Date()),
            running: false,
            runningSince: undefined,
          },
        });
      },

      resumeRoutineRun: () => {
        const { activeRoutine, active } = get();
        if (!activeRoutine || activeRoutine.running) return;
        // Same guard as resumeSession, in the other direction.
        if (active) return;
        set({ activeRoutine: { ...activeRoutine, running: true, runningSince: nowISO() } });
      },

      // Mutates segs only — never decides the run is over. Whether a skip
      // lands on the final segment (locateClock's `finished` flips true) is
      // detected uniformly by RoutineRunner's one completion effect, the same
      // place natural (tick/background-catch-up) completion is detected. A
      // second "did this finish it" branch here previously called
      // finishRoutine() directly, bypassing the component's result snapshot
      // and leaving the screen blank once activeRoutine was cleared out from
      // under it.
      skipRoutineRun: () => {
        const { activeRoutine } = get();
        if (!activeRoutine) return;
        const elapsedSeconds = runElapsedSeconds(activeRoutine.accumulatedSeconds, activeRoutine.runningSince, activeRoutine.running, new Date());
        const segs = skipCurrentSegment(activeRoutine.segs, elapsedSeconds);
        // Skip clamps the boundary onto elapsed itself — acknowledge it silently
        // (never nextSignal's announcing path), or the very next render would
        // see a freshly-passed boundary and announce a segment the user just
        // chose to end themselves.
        const signalledThrough = acknowledgeThrough(activeRoutine.signalledThrough, elapsedSeconds, segmentBoundaries(segs));
        set({ activeRoutine: { ...activeRoutine, segs, signalledThrough } });
      },

      setRoutineSignal: (marker) => {
        const { activeRoutine } = get();
        if (!activeRoutine) return;
        set({ activeRoutine: { ...activeRoutine, signalledThrough: marker } });
      },

      finishRoutine: () => {
        const { activeRoutine, db } = get();
        if (!activeRoutine) return;
        const now = new Date();
        const elapsedSeconds = runElapsedSeconds(activeRoutine.accumulatedSeconds, activeRoutine.runningSince, activeRoutine.running, now);
        const outcome = applyRoutineRun(activeRoutine.segs, elapsedSeconds, db.items, groupBlocksByItem(db.blocks), now);
        const updatedById = new Map(outcome.items.map((i) => [i.id, i]));
        set((s) => ({
          activeRoutine: null,
          db: {
            ...s.db,
            blocks: outcome.blocks.length > 0 ? [...s.db.blocks, ...outcome.blocks] : s.db.blocks,
            items: s.db.items.map((i) => updatedById.get(i.id) ?? i),
          },
        }));
      },

      exportDB: () => get().db,

      // The three — and only three — places a new `db` object is installed.
      // Each is a single `set()` of `installDatabase`, which returns the new
      // database TOGETHER WITH the ephemeral reset: no path can install a
      // database while leaving the running plan, today's dismissed reviews or
      // a now-dangling session instrument pointing at the one it replaced.
      // (resetDemo and clearAll never pass through importFullBackup, so a fix
      // that lived only there would silently miss two of the three.)
      importDB: (raw) => {
        set((s) => installDatabase({ db: validateDB(raw), sessionInstrumentId: s.sessionInstrumentId }));
      },

      resetDemo: () => {
        void clearBlobs();
        set((s) => installDatabase({ db: createSeedDB(), sessionInstrumentId: s.sessionInstrumentId }));
      },

      clearAll: () => {
        void clearBlobs();
        set((s) => installDatabase({ db: emptyDB(), sessionInstrumentId: s.sessionInstrumentId }));
      },
    })),
    {
      name: 'practice-compass',
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() => idbStorage),
      partialize: (s) => ({
        db: s.db,
        rev: s.rev,
        active: s.active,
        theme: s.theme,
        sessionInstrumentId: s.sessionInstrumentId,
        notNow: s.notNow,
        activePlan: s.activePlan,
        planMinutesByInstrument: s.planMinutesByInstrument,
        activeRoutine: s.activeRoutine,
      }),
      // Every other inbound door — manual import, sync pull, Keep remote,
      // archive restore — installs a database only through `validateDB`
      // (§C7): it refuses a newer-than-supported schema outright instead of
      // relabelling it down, runs the shared migration chain, and rejects
      // structurally/semantically invalid data (an impossible calendar date,
      // a dangling live reference) with actionable detail. Hydration used to
      // call `migrateToCurrent` directly instead, which does none of that —
      // a persisted schema newer than this build understands got silently
      // stamped down to SCHEMA_VERSION (migrations.ts's own final line) and
      // hydrated anyway, and already-current-but-invalid data sailed
      // straight into live state. Routing both hooks below through
      // `validateDB` closes that gap at the one place ALL persisted state
      // re-enters live state, rather than teaching every UI caller to check
      // it separately.
      //
      // Letting `validateDB` THROW here (never caught) is deliberate, not an
      // oversight: zustand's own hydrate() only calls `merge` — and only
      // persists the result back to storage — once `migrate` has RETURNED,
      // and only calls its raw internal `set()` once `merge` has returned. A
      // thrown validation error rejects that promise chain before either
      // happens (see zustand's `middleware.js`), so the previously live AND
      // the previously persisted state are both left exactly as they were:
      // no partial hydration, no silent downgrade-and-relabel, no
      // destructive write-back of a refused newer snapshot. This trades away
      // opening the app's hydration gate on a refusal (zustand's own
      // `hasHydrated`/`onFinishHydration` are wired to the success path
      // only) — a deliberate choice, not an oversight: EVERY external call
      // to `useStore.setState` — which is the only way to flip that gate —
      // is itself wrapped by this same persist middleware to write straight
      // back to storage afterwards, so forcing the gate open here would
      // re-persist whatever `db` is currently live and silently destroy the
      // very data a refusal (most of all a genuinely newer schema) exists to
      // protect. `getLastHydrationError()` below still surfaces WHY, without
      // that write.
      migrate: (persisted) => {
        const state = persisted as { db?: PracticeDB; active?: unknown } | undefined;
        // `validateDB` reads the schema version off `state.db` itself (the
        // same source of truth every other inbound door uses) rather than
        // the envelope-level version zustand would pass as a second
        // argument here — the two are always kept in sync by this app's own
        // writes, and deriving from one place avoids two version signals
        // that could ever disagree.
        if (state?.db) state.db = validateDB(state.db);
        // `active` lives OUTSIDE PracticeDB, so `validateDB` cannot see its
        // scratch observation — yet it reaches live state through this very
        // boundary and is rendered the moment the practice screen opens.
        const unfinished = validateUnfinishedText((persisted as { active?: unknown } | undefined)?.active);
        if (unfinished) throw new Error(unfinished);
        return state as unknown;
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<StoreState>;
        // Zustand only calls `migrate` above when the persisted version
        // differs from the current one — a persisted database that ALREADY
        // claims the current schema never reaches it, even when it carries a
        // stray `assignedForLesson`/`teacherQuestion` an interrupted write
        // left behind, or genuinely invalid current-schema data a corrupt
        // write produced. `merge` is the one place ALL persisted state
        // re-enters live state regardless of whether `migrate` ran (the same
        // reasoning the active/activeRoutine freeze below relies on), so it
        // is where both the idempotent legacy conversion AND the §C7
        // validation close for good: run the SAME `validateDB` call
        // `migrate` makes, unconditionally. Calling it again on state
        // `migrate` already validated is safe and cheap — it is pure and
        // `migrateToV12`'s own docstring guarantees its tail step is a no-op
        // wherever no legacy field survives — and throwing here on invalid
        // current-version data is exactly as safe as throwing in `migrate`:
        // `set()` is never reached, and this branch never queues a persist
        // write-back regardless (zustand only writes back after a
        // version-mismatched `migrate` ran).
        const db = p.db ? validateDB(p.db) : current.db;
        const unfinished = validateUnfinishedText(p.active);
        if (unfinished) throw new Error(unfinished);
        const merged = { ...current, ...p, db };
        // The start/resume guards keep active/activeRoutine from BOTH being
        // set going forward, but a device that persisted a dual-running
        // state before those guards existed reaches this merge unchecked —
        // hydration is the one place ALL persisted state re-enters the
        // store, so it's the one place left to close. Passing both straight
        // through would let each keep ticking live from its own timestamp
        // and double-log the same wall-clock interval, exactly the bug the
        // guards exist to prevent. Freeze both (the same transform
        // pauseSession/pauseRoutineRun already do) rather than discarding
        // either: nothing already elapsed is lost, neither clock advances
        // further on its own, and the ordinary finish/discard flow is what
        // the user resolves one with before the guards allow resuming or
        // starting the other.
        if (merged.active && merged.activeRoutine) {
          const now = new Date();
          merged.active = {
            ...merged.active,
            accumulatedSeconds: sessionElapsedSeconds(merged.active, now),
            running: false,
            segmentStartedAt: undefined,
          };
          merged.activeRoutine = {
            ...merged.activeRoutine,
            accumulatedSeconds: runElapsedSeconds(
              merged.activeRoutine.accumulatedSeconds,
              merged.activeRoutine.runningSince,
              merged.activeRoutine.running,
              now,
            ),
            running: false,
            runningSince: undefined,
          };
        }
        return merged;
      },
      // A thrown `migrate`/`merge` above rejects zustand's internal hydration
      // promise before it ever calls its OWN raw `set()` — correct, and the
      // whole point: it's what leaves both live and persisted state
      // untouched. Recording the reason here must not undo that: EVERY
      // external call to `useStore.setState` (any ordinary store action
      // included) is itself wrapped by this same persist middleware to
      // write straight back to storage afterwards — see `setItem()` below
      // this config and its unconditional call from `api.setState`. Calling
      // it here to flip a "hydration failed" flag would immediately
      // re-persist whatever `db` happens to be live, silently overwriting
      // the very data this refusal exists to protect (a genuinely newer
      // schema this build cannot read, most of all). `lastHydrationError` is
      // therefore a plain module variable, never store state — but a cold
      // start (nothing has ever hydrated successfully) needs a REACTIVE
      // signal too, or the UI has no way to notice the refusal and stays on
      // "Loading…" forever: `useHydrationStatus` below is a separate,
      // unpersisted store (the same shape `useSyncStatus` already uses for
      // sync phase), so writing to IT never touches `useStore`'s persist
      // middleware and can never become the destructive write-back this
      // guard exists to prevent.
      onRehydrateStorage: () => (_state, error) => {
        lastHydrationError = error ? (error instanceof Error ? error.message : String(error)) : null;
        useHydrationStatus.setState(
          error
            ? { refused: true, message: lastHydrationError, tooNew: error instanceof SchemaTooNewError }
            : { refused: false, message: null, tooNew: false },
        );
      },
    },
  ),
);

/**
 * The message from the most recent REFUSED hydration attempt (§C7), or null
 * if the last attempt installed cleanly. Deliberately not store state: see
 * `onRehydrateStorage` above for why recording it through `useStore.setState`
 * would itself trigger the exact destructive write-back this guard exists to
 * prevent.
 */
let lastHydrationError: string | null = null;
export function getLastHydrationError(): string | null {
  return lastHydrationError;
}

export interface HydrationStatus {
  /** True from the moment a hydration attempt is refused (§C7) — including
   *  the very first one this device ever makes, so a cold start with already
   *  invalid persisted bytes is never silently indistinguishable from an
   *  ordinary in-flight load. */
  refused: boolean;
  /** The refusal's human-readable message, or null when not refused. */
  message: string | null;
  /** True when the refusal was specifically a newer-than-supported schema —
   *  an app update fixes this, not a data restore. */
  tooNew: boolean;
}
/**
 * The reactive counterpart to `getLastHydrationError()`: what `App.tsx`
 * actually subscribes to so a refused cold start can render an explanation
 * instead of staying on "Loading…" indefinitely (`hydrated` never turns
 * true on a refusal, and zustand's own `onFinishHydration` is wired to the
 * success path only). Never persisted, never derived from `useStore` —
 * see `onRehydrateStorage` above for why.
 */
export const useHydrationStatus = create<HydrationStatus>(() => ({
  refused: false,
  message: null,
  tooNew: false,
}));

// Async IndexedDB hydration: flip the gate when done, and seed a fresh install.
function finishHydration() {
  if (storageWasEmpty && useStore.getState().db.pathways.length === 0) {
    useStore.setState({ db: createSeedDB(), hydrated: true });
  } else {
    useStore.setState({ hydrated: true });
  }
}
if (useStore.persist.hasHydrated()) finishHydration();
else useStore.persist.onFinishHydration(finishHydration);
