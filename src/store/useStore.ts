import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { clearBlobs, deleteBlob, idbStorage, storageSettled, storageWasEmpty } from './idb';
import { dropNoteDraft, heldNoteDrafts, holdNoteDraft, notesHydrated, notesLanded, notesWritten } from './notesDrafts';
import { withRevision } from './revision';
import { primePracticeSound } from '../components/practiceCue';
import {
  acknowledgeThrough,
  partRelationRefusal,
  applyBlockStats,
  applyCloseEdits,
  applyRoutineRun,
  captureRoutineResults,
  catalogForStage,
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
  captureTargetProblem,
  openQuestionCapture,
  type QuestionCapture,
  type PlanStartCheck,
  lessonLabel,
  planClassCoverage,
  planStartRefusal,
  requiredClassWork,
  scheduleAgainPlan,
  transferToAutomaticReview,
  AUTOMATIC_TRANSFER_REASON,
  validateUnfinishedText,
  validateUnfinishedRun,
  returnIntentOf,
  removePendingSegment,
  skipSegmentUnpractised,
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
  buildLevelRoutine,
  buildPositionRoutine,
  courseForPathway,
  courseRoutine,
  courseStage,
  planStageAddition,
  planChooseCourseSource,
  planCourseLevels,
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
  archiveFor,
  sessionMembership,
  planArchiveImport,
  applyArchiveImport,
  type ImportPlan,
  type ImportSummary,
  type ReconcileDecision,
  type SourceIndex,
  type SourceSuppression,
  applySetarSetup,
  type SetupContext,
  type SetupSelection,
  SCHEMA_VERSION,
  planDefaultPathways,
  planDefaultStages,
  planAddTerm,
  planDeleteTerm,
  planLinkReference,
  planRemoveFromPathway,
  planSetReferenceHidden,
  planUnlinkReference,
  planUpdateTerm,
  courseById,
  isBuiltInTerm,
  settleLegacyEvidence,
  legacyClaimRefusal,
  bindingClash,
  sourceKeyClash,
  validateReferences,
  validateStudySources,
  COURSES,
  type MusicTermKind,
  validateDB,
  SchemaTooNewError,
  type BlockMode,
  type BlockResult,
  type EvidenceScope,
  type ReturnIntent,
  type FocusArea,
  type GuitarFields,
  type ID,
  type Instrument,
  type AttachmentMeta,
  type ISODate,
  type CloseItemEdits,
  type RoutineCapture,
  type ItemStatus,
  type LessonFileKind,
  type LessonQuestion,
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
  /**
   * When THIS run started — its identity, so a boundary claim made against a
   * run that has since finished and been restarted is refused. Absent on a run
   * persisted before it existed, which then claims as `undefined`.
   */
  startedAt?: string;
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
  /** What the result describes: a focused chunk (default) or an explicit whole-item check. */
  scope?: EvidenceScope;
  durationMinutes: number;
  observation?: string;
  nextAction?: string;
  /**
   * What the owner revised on the item at close (status, primary focus,
   * effort, return intention), by key presence — absent keys are never
   * written. Applied in this close's one write; the review is decided from
   * the item as practised, under the return intention this close leaves it in.
   */
  itemEdits?: CloseItemEdits;
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

/** Whose notes: an item's Working notes or a lesson's class notes. Ids of the two never mix. */
export interface NoteOwner {
  kind: 'item' | 'lesson';
  id: ID;
}
export type NoteSaveOutcome = 'unchanged' | 'written' | 'merged' | 'gone';

/** The heading a kept competing text sits under (see `saveNotes`). */
export const KEPT_DRAFT_HEADING = '— Also typed on this device (kept, not merged) —';

export interface ItemPatch {
  instrumentId?: ID;
  /** Present-and-undefined clears the link; a change is judged by `partRelationRefusal`. */
  parentItemId?: ID;
  title?: string;
  itemType?: PracticeItem['itemType'];
  /** Present-and-undefined clears it; the form sends one only for Theory / listening study. */
  strand?: PracticeItem['strand'];
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
  /**
   * Begin running a built plan (segments become pending) — only once its class
   * coverage, rechecked against live data and the true day, allows it:
   * `acceptedKey` is the coverage a partial-start choice was made against.
   * Returns the refusal (nothing installed) or null.
   */
  startPlan: (plan: SessionPlan, acceptedKey?: string) => 'empty' | 'short' | 'partial' | null;
  /** Start a real block seeded from the current segment (→ /active → /close). Returns the live check it ran. */
  beginPlanSegment: () => PlanStartCheck | null;
  /** Skip a pending segment — the current one by default — recording nothing; other targets keep their minutes. */
  skipPlanSegment: (index?: number) => void;
  /** Skip the plan segment whose block is open right now WITHOUT saving it: the block is discarded and the segment skipped. */
  skipPlanBlockUnsaved: () => void;
  /** End the running plan (clears it). */
  endPlan: () => void;

  // Attachments (metadata; blobs live in IndexedDB via src/store/idb.ts)
  addAttachmentMeta: (meta: AttachmentMeta) => void;
  removeAttachmentMeta: (id: ID) => void;

  // Instruments
  addInstrument: (input: { name: string; family?: string }) => ID;
  /** Returns a refusal (and changes nothing) for an empty name; a name is saved trimmed. */
  updateInstrument: (id: ID, patch: Partial<Pick<Instrument, 'name' | 'family' | 'active'>>) => string | null;

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
  /** Returns the refusal (a course key already held on that instrument), or null. */
  updateMaterial: (id: ID, patch: Partial<Omit<Material, 'id' | 'createdAt'>>) => string | null;
  deleteMaterial: (id: ID) => void;

  // Items
  /** Refused, creating nothing, when the input names a parent it may not have (`partRelationRefusal`). */
  addItem: (input: CreateItemInput) => ID | { refusal: string };
  /**
   * Save an item's own fields. Returns null, or the reason it REFUSED — a save
   * that would hand an ambiguous pending schedule to the engine is refused
   * whole rather than half-applied.
   */
  updateItem: (id: ID, patch: ItemPatch) => string | null;
  setItemStatus: (id: ID, status: ItemStatus) => void;
  deleteItem: (id: ID) => void;
  /** Returns the refusal (one of several candidates for a suggestion), or null. */
  placeItemInStage: (itemId: ID, stageId: ID | undefined) => string | null;

  // --- Reference suggestions: reversible organisation, never deletion -------
  /** Make an existing same-instrument item the answer to a suggestion. Returns the refusal, or null. */
  linkReference: (pathwayId: ID, refId: string, itemId: ID) => string | null;
  /** The item stops answering one suggestion; it keeps everything else. */
  unlinkReference: (itemId: ID, refId: string) => void;
  /** The item leaves this pathway's stages; its suggestions there are hidden. Nothing is unbound or deleted. */
  removeFromPathway: (itemId: ID, pathwayId: ID) => string | null;
  /** Hide or restore one suggestion in one pathway. Visibility only. */
  setReferenceHidden: (pathwayId: ID, refId: string, hidden: boolean) => void;
  /** Answer "which study source is this course?" for the items the question named (`courseSourceQuestions`). */
  chooseCourseSource: (itemIds: ID[], materialId: ID, courseId: string) => string | null;

  // --- Shared musical terms (each returns the refusal, or null) --------------
  /** Returns the new term's id, or the refusal. */
  addTerm: (input: { kind: MusicTermKind; name: string; aliases: string[] }) => { id: ID } | { refusal: string };
  updateTerm: (id: ID, patch: { name?: string; aliases?: string[]; archived?: boolean }) => string | null;
  deleteTerm: (id: ID) => string | null;

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
  /**
   * Lift ONE owner suppression — the exact kind, target and item scope — so
   * the next Refresh may bring that source entity back. Returns a refusal or
   * null; the caller waits for storage before saying it is saved.
   */
  restoreArchiveSuppression: (archiveId: ID, target: Pick<SourceSuppression, 'kind' | 'ref' | 'itemId'>) => string | null;
  /**
   * "Review Setar setup": write EXACTLY the selected rows in one validated
   * mutation, each re-checked against the value the owner saw. Returns the
   * refusal, or null; the caller waits for storage before saying Saved, and a
   * retry writes again even when the rows are already in place.
   */
  commitSetarSetup: (input: { context: SetupContext; selections: SetupSelection[]; now?: Date }) => string | null;
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
  /**
   * Create a practice item from a stage's reference catalog entry.
   *
   * Take one catalogue suggestion into the owner's items. Reports whether it
   * actually CREATED one: a work the course carries across levels resolves to
   * the item added at an earlier level, and an Undo may never reach that.
   */
  addFromCatalog: (
    stageId: ID,
    entryKey: string,
    /** The owner explicitly asked for a NEW item beside the unlinked ones placed in the stage. */
    separate?: boolean,
  ) => {
    id: ID;
    created: boolean;
    candidates?: PracticeItem[];
    placed?: PracticeItem[];
    sourceCandidates?: Material[];
    refusal?: string;
  };
  /**
   * Write one of a course stage's own routines — the level's, or one built for
   * where the owner actually is — as an ordinary editable routine. Returns its
   * id, or null when the stage belongs to no course.
   */
  addCourseRoutine: (stageId: ID, kind: 'level' | 'position') => ID | null;
  /**
   * Add the SELECTED course levels a pathway does not have. Adds nothing on its
   * own — see `offeredCourseLevels`. Deliberately separate from
   * `reseedDefaultPathways`, which adds only whole missing pathways.
   */
  addCourseLevels: (pathwayId: ID, groupKeys: string[]) => void;
  /**
   * Add the SELECTED shipped stages a present default pathway lacks (see
   * `offeredDefaultStages`). Adds nothing on its own, never a routine, and a
   * choice that adds nothing writes nothing.
   */
  addDefaultStages: (pathwayId: ID, stageIds: string[]) => void;
  /** Begin a session on an existing item (with smart defaults). */
  startItemSession: (itemId: ID) => void;

  // Session
  startSession: (input: StartSessionInput) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  setSessionNote: (note: string) => void;
  /**
   * The boundary marker (practiceSignal.ts) lives in store state, not component
   * state, so navigating away and back never re-announces. CLAIM a boundary
   * announcement for the block that STARTED at `startedAt`:
   * true — and the marker advanced — only when that block is still the one
   * running, is running, and has not already announced through `marker`. A
   * refused claim changes nothing, so a replayed effect, a remount or a stale
   * observation can never announce twice; only a true claim may sound.
   */
  claimSessionSignal: (startedAt: string, marker: number) => boolean;
  cancelSession: () => void;
  closeSession: (input: CloseSessionInput) => void;
  /** Working on this / Keep fresh — administrative: no practice, no date, no spacing state moves. */
  setReturnIntent: (itemId: ID, intent: ReturnIntent) => void;
  /**
   * Write an item's or a lesson's notes, decided against what is stored NOW:
   * unchanged text writes nothing; text based on the stored text replaces it;
   * text based on something the store no longer holds (a sync, an import or
   * another editor changed it) KEEPS both — the stored text, then this one
   * under a marked heading. A record that no longer exists is never recreated.
   */
  saveNotes: (owner: NoteOwner, text: string, base: string) => NoteSaveOutcome;
  /** Re-issue the persist write for the state already in memory (a retry after a failed IndexedDB write). */
  persistAgain: () => void;

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
  /** Returns the refusal (it holds one of several candidates for a suggestion), or null. */
  deletePathway: (id: ID) => string | null;
  /**
   * Add the SELECTED shipped default pathways this database lacks — whole
   * pathways only, never stages into one that exists. Adds nothing on its own:
   * see `offeredDefaultPathways`.
   */
  reseedDefaultPathways: (pathwayIds: string[]) => void;

  addStage: (pathwayId: ID, input: { code: string; title: string; group?: string; intro?: string }) => ID;
  updateStage: (id: ID, patch: Partial<Pick<PathwayStage, 'code' | 'title' | 'group' | 'intro'>>) => void;
  /** Returns the refusal (it holds one of several candidates for a suggestion), or null. */
  deleteStage: (id: ID) => string | null;
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
  /** MOVE ON: end the current segment now, keeping the time practised in it. */
  moveOnRoutineRun: () => void;
  /** SKIP: end the current segment now and record nothing for it, however long it ran. */
  skipRoutineRun: () => void;
  /** Remove a segment the run has not reached yet; records nothing, changes no other segment. */
  removeRoutineSegment: (index: number) => void;
  /** Turn the active run into real practice blocks — at most one per distinct bound item, carrying its actual elapsed running time — then clear it. */
  /** Saves the run; returns the ids of the blocks it created, for Routine complete's capture. */
  finishRoutine: () => ID[];
  /**
   * Routine complete's capture: a result and one line per recorded item,
   * written onto that run's own blocks. Returns a refusal, or null.
   */
  recordRoutineCapture: (runBlockIds: ID[], captures: RoutineCapture[]) => string | null;
  /** The routine twin of `claimSessionSignal`, for the run that started at `startedAt` (segment boundaries). */
  claimRoutineSignal: (startedAt: string | undefined, marker: number) => boolean;

  // Data management
  exportDB: () => PracticeDB;
  importDB: (raw: unknown) => void;
  resetDemo: () => void;
  clearAll: () => void;
}

function touch<T extends { updatedAt: string }>(entity: T, now: Date): T {
  return { ...entity, updatedAt: nowISO(now) };
}

/**
 * THE SAME RULES RELOAD ENFORCES, checked BEFORE a local write that can move a
 * binding, an item's instrument or a course key. Said for the owner first, the
 * validators themselves as the backstop — so nothing this device writes is a
 * database its own next load (or any other door) would refuse.
 */
const IDENTITY_FIELDS = ['instrumentId', 'stageId', 'catalogKey', 'catalogRefs'] as const;

function identityRefusal(db: PracticeDB): string | null {
  return bindingClash(db.items) ?? sourceKeyClash(db.materials) ?? validateReferences(db) ?? validateStudySources(db, COURSES);
}

/**
 * The persisted state goes to IndexedDB as JSON; as each write LANDS, the
 * notes recovery copies learn what is on disk (`notesLanded`) — the one place
 * their base moves, whoever wrote the notes and whatever action persisted them.
 * `idbStorage.setItem` assigns its write synchronously, so `storageSettled()`
 * right after it is this write's own acknowledgement.
 */
const jsonStorage = createJSONStorage(() => idbStorage)!;
const landingStorage: typeof jsonStorage = {
  ...jsonStorage,
  setItem: (name, value) => {
    const result = jsonStorage.setItem(name, value);
    const written = storageSettled();
    const db = (value.state as { db?: PracticeDB }).db;
    if (db) void written.then(() => notesLanded(db, written === storageSettled()), () => undefined);
    return result;
  },
};

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

      startPlan: (plan, acceptedKey) => {
        // The run's installation is the one door every Start passes: a
        // sub-floor class slot, or omissions no choice was made against, never
        // become a running plan, whatever the preview showed.
        const { db, rev } = get();
        const now = new Date();
        const coverage = planClassCoverage(
          plan,
          requiredClassWork(db.lessonAgenda, db.lessons, db.items, plan.instrumentId, now),
          db.items,
          `${rev}|${todayISODate(now)}`,
        );
        const refusal = planStartRefusal(plan, coverage, acceptedKey);
        if (refusal) return refusal;
        set({
          activePlan: {
            instrumentId: plan.instrumentId,
            budgetMinutes: plan.budgetMinutes,
            startedAt: nowISO(),
            pointer: 0,
            segments: plan.segments.map((seg) => ({ ...seg, status: 'pending' as const })),
          },
        });
        return null;
      },

      beginPlanSegment: () => {
        const { activePlan, db, active, activeRoutine } = get();
        if (!activePlan) return null;
        const seg = activePlan.segments[activePlan.pointer];
        // Revalidated LIVE against the same pure check a test can reach, never
        // trusted from the plan: an item can be deleted, moved to another
        // instrument or become a whole work (a larger class floor) between
        // building the plan and reaching this segment.
        const required = requiredClassWork(db.lessonAgenda, db.lessons, db.items, activePlan.instrumentId, new Date()).itemIds;
        const check = planSegmentStartable(activePlan, db.items, !!active || !!activeRoutine, required);
        if (!check.ok) {
          // A deleted or moved item is visibly skipped (and skipping logs
          // nothing); a busy clock or a sub-floor class slot is refused
          // outright, the segment left for the owner to skip.
          if (check.reason === 'deleted' || check.reason === 'moved') get().skipPlanSegment();
          return check;
        }
        const item = check.item;
        if (!seg) return check;
        get().startSession({
          itemId: item.id,
          instrumentId: item.instrumentId,
          materialId: item.materialId,
          mode: seg.mode,
          focus: seg.focus,
          targetMinutes: seg.minutes,
        });
        return check;
      },

      skipPlanSegment: (index) =>
        set((s) => (s.activePlan ? { activePlan: skipPlanSegmentRun(s.activePlan, index) } : {})),

      skipPlanBlockUnsaved: () => {
        const { active, activePlan } = get();
        if (!active || !activePlan) return;
        const seg = activePlan.segments[activePlan.pointer];
        // Only the block that IS the current segment; anything else practised
        // off-plan is resolved through its own Finish or Discard.
        if (!seg || seg.itemId !== active.itemId || seg.status !== 'pending') return;
        set({ active: null, activePlan: skipPlanSegmentRun(activePlan) });
      },

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
        // A name is the owner's handle on everything filed under it: saved
        // trimmed, and never emptied (no read refuses an empty one already
        // stored — this only stops a new one being written).
        const named = 'name' in patch ? { ...patch, name: (patch.name ?? '').trim() } : patch;
        if ('name' in named && !named.name) return 'An instrument needs a name.';
        set((s) => ({
          db: {
            ...s.db,
            instruments: s.db.instruments.map((i) =>
              i.id === id ? touch({ ...i, ...named }, now) : i,
            ),
          },
        }));
        return null;
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
        const { db } = get();
        const lesson = db.lessons.find((l) => l.id === lessonId);
        const item = db.items.find((i) => i.id === itemId);
        // RELINKING WHAT THE ARCHIVE SAYS lifts the owner's own unlink — the
        // one suppression that hid it — and copies nothing: the session's
        // membership stays a source fact, never authored history in itemIds.
        const member = lesson && item ? sessionMembership(db, lesson, item) : null;
        const unlinked = member
          ? archiveFor(db, member.archiveId)?.suppressions.some((x) => x.kind === 'link' && x.ref === member.link && x.itemId === undefined)
          : false;
        if (member && unlinked) {
          set((s) => ({
            db: {
              ...s.db,
              archiveSources: withoutSuppression(
                s.db.archiveSources,
                member.archiveId,
                (x) => x.kind === 'link' && x.ref === member.link && x.itemId === undefined,
              ),
            },
          }));
          return;
        }
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
        // Only where the session really lists this piece: a suppression for a
        // link the archive never made would be a decision about nothing.
        const lesson = db.lessons.find((l) => l.id === lessonId);
        const item = db.items.find((i) => i.id === itemId);
        const member = lesson && item ? sessionMembership(db, lesson, item) : null;
        set((s) => ({
          db: {
            ...s.db,
            lessons: s.db.lessons.map((l) =>
              l.id === lessonId && (l.itemIds ?? []).includes(itemId)
                ? touch({ ...l, itemIds: (l.itemIds ?? []).filter((x) => x !== itemId) }, now)
                : l,
            ),
            archiveSources: member
              ? withSuppression(s.db.archiveSources, member.archiveId, {
                  kind: 'link',
                  ref: member.link,
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
        const { db } = get();
        const materials = db.materials.map((m) => (m.id === id ? touch({ ...m, ...patch }, now) : m));
        const refusal = identityRefusal({ ...db, materials });
        if (refusal) return refusal;
        set((s) => ({ db: { ...s.db, materials } }));
        return null;
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
        if (input.parentItemId) {
          const refusal = partRelationRefusal(get().db.items, { instrumentId: input.instrumentId, parentItemId: input.parentItemId });
          if (refusal) return { refusal };
        }
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
        // A part's parent, judged only when this write sets or changes the
        // relationship or the instrument — an unrelated edit to a record that
        // already breaks the rule is never newly refused.
        const nextParent = 'parentItemId' in rest ? rest.parentItemId || undefined : current?.parentItemId;
        if (current && (newInstrumentId || nextParent !== (current.parentItemId || undefined))) {
          const relation = partRelationRefusal(get().db.items, {
            id,
            instrumentId: newInstrumentId ?? current.instrumentId,
            parentItemId: nextParent,
          });
          if (relation) return relation;
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
        const db = get().db;
        const patched = db.items.map((i) => {
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
        });
        // A new stage, key or instrument moves an UNDECIDED item's legacy
        // evidence: settle it first (one of several candidates refuses), and
        // refuse anything this device's own reload would refuse.
        // Only a patch that touches identity is judged: a notes save (the
        // notebook ignores this return value) must never be refusable.
        const settled = settleLegacyEvidence(db, patched, now);
        if (!settled.ok) return settled.reason;
        if (IDENTITY_FIELDS.some((k) => k in rest)) {
          const identity = legacyClaimRefusal(db, settled.items) ?? identityRefusal({ ...db, items: settled.items });
          if (identity) return identity;
        }
        set((s) => ({
          db: {
            ...s.db,
            items: settled.items,
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

      linkReference: (pathwayId, refId, itemId) => {
        const { db } = get();
        const pathway = db.pathways.find((p) => p.id === pathwayId);
        const plan = planLinkReference(db, refId, itemId, pathway?.instrumentId || undefined, new Date());
        if (!plan.ok) return plan.reason;
        const refusal = identityRefusal({ ...db, items: plan.items });
        if (refusal) return refusal;
        if (plan.items !== db.items) set((s) => ({ db: { ...s.db, items: plan.items } }));
        return null;
      },

      unlinkReference: (itemId, refId) => {
        const { db } = get();
        const plan = planUnlinkReference(db.items, itemId, refId, new Date());
        if (plan.ok && plan.items !== db.items) set((s) => ({ db: { ...s.db, items: plan.items } }));
      },

      removeFromPathway: (itemId, pathwayId) => {
        const { db } = get();
        const plan = planRemoveFromPathway(db, itemId, pathwayId, new Date());
        if (!plan.ok) return plan.reason;
        if (plan.items !== db.items || plan.pathways !== db.pathways) {
          set((s) => ({ db: { ...s.db, items: plan.items, pathways: plan.pathways } }));
        }
        return null;
      },

      setReferenceHidden: (pathwayId, refId, hidden) => {
        const { db } = get();
        const plan = planSetReferenceHidden(db.pathways, pathwayId, refId, hidden, new Date());
        if (plan.ok && plan.pathways !== db.pathways) set((s) => ({ db: { ...s.db, pathways: plan.pathways } }));
      },

      chooseCourseSource: (itemIds, materialId, courseId) => {
        const course = courseById(courseId);
        const { db } = get();
        if (!course) return 'That item or study source no longer exists.';
        const plan = planChooseCourseSource(db, course, materialId, itemIds, new Date());
        if (!plan.ok) return plan.reason;
        const refusal = identityRefusal({ ...db, materials: plan.materials, items: plan.items });
        if (refusal) return refusal;
        // Always a write, even when a retry re-states an answer already in
        // memory: the save it is retrying never reached IndexedDB.
        set((s) => ({ db: { ...s.db, materials: plan.materials, items: plan.items } }));
        return null;
      },

      addTerm: (input) => {
        const { db } = get();
        const id = `term-${newId()}`;
        const plan = planAddTerm(db.musicTerms, { ...input, id }, new Date());
        if (!plan.ok) return { refusal: plan.reason };
        set((s) => ({ db: { ...s.db, musicTerms: plan.terms } }));
        return { id };
      },

      updateTerm: (id, patch) => {
        const { db } = get();
        const plan = planUpdateTerm(db.musicTerms, db.items, id, patch, new Date());
        if (!plan.ok) return plan.reason;
        set((s) => ({ db: { ...s.db, musicTerms: plan.terms } }));
        return null;
      },

      deleteTerm: (id) => {
        const { db } = get();
        // Already gone (a Try again after the first write failed): the store
        // holds the deletion; write it again rather than refuse, so a retry is
        // never a silent no-op over a write that never reached storage.
        if (!isBuiltInTerm(id) && !db.musicTerms.some((t) => t.id === id)) {
          set((s) => ({ db: { ...s.db, musicTerms: [...s.db.musicTerms] } }));
          return null;
        }
        const plan = planDeleteTerm(db.musicTerms, db.items, id);
        if (!plan.ok) return plan.reason;
        set((s) => ({ db: { ...s.db, musicTerms: plan.terms } }));
        return null;
      },

      placeItemInStage: (itemId, stageId) => {
        const now = new Date();
        const { db } = get();
        const settled = settleLegacyEvidence(
          db,
          db.items.map((i) => (i.id === itemId ? touch({ ...i, stageId }, now) : i)),
          now,
        );
        if (!settled.ok) return settled.reason;
        set((s) => ({ db: { ...s.db, items: settled.items } }));
        return null;
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

      restoreArchiveSuppression: (archiveId, target) => {
        if (!get().db.archiveSources.some((a) => a.id === archiveId)) return 'That archive is no longer on this device.';
        // EXACTLY the chosen decision: kind, target AND scope. Matching kind
        // and target alone also lifted every sibling hide of the same file on
        // OTHER items — a restore of one decision undoing several.
        //
        // Always a write, even when the decision is already gone from memory:
        // a retry after a refused write must persist again, never report the
        // in-memory state as saved.
        set((s) => ({
          db: {
            ...s.db,
            archiveSources: withoutSuppression(
              s.db.archiveSources,
              archiveId,
              (x) => x.kind === target.kind && x.ref === target.ref && x.itemId === target.itemId,
            ),
          },
        }));
        return null;
      },

      commitSetarSetup: ({ context, selections, now }) => {
        // Re-planned against the database as it is NOW, inside the action: a
        // row that moved, vanished or changed meaning since it was shown
        // refuses the whole commit (`applySetarSetup`), and a row that
        // arrived since was never selected, so it cannot join.
        const outcome = applySetarSetup(get().db, context, selections, now ?? new Date());
        if (!outcome.ok) return outcome.reason;
        try {
          validateDB(outcome.db);
        } catch (e) {
          return e instanceof Error ? e.message : 'That change could not be applied.';
        }
        // ONE mutation, of `db` alone — the running clock, routine and plan are
        // not part of it. Always a write: a retry after a refused write must
        // persist again, even when every row is already in place.
        set({ db: outcome.db });
        return null;
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

      addFromCatalog: (stageId, entryKey, separate = false) => {
        const { db } = get();
        const entry = catalogForStage(stageId).find((e) => e.key === entryKey);
        const stage = db.pathwayStages.find((s) => s.id === stageId);
        const pathway = stage ? db.pathways.find((p) => p.id === stage.pathwayId) : undefined;
        const instrumentId =
          (pathway?.instrumentId && db.instruments.find((i) => i.id === pathway.instrumentId)?.id) ||
          db.instruments.find((i) => i.active)?.id ||
          db.instruments[0]?.id ||
          '';
        // The whole decision — existing-item reuse, a course work carried
        // forward from an earlier level, and the course's own study source
        // found-or-created — is ONE pure value, applied in ONE set(). The Node
        // test environment cannot import this file (Dexie, through ./idb), so
        // the decision is proved in courseSeed.test.ts and this SHAPE is what
        // protects the wiring.
        const plan = planStageAddition(db, stageId, entryKey, entry, instrumentId, new Date(), separate);
        // Reuse and an ambiguous answer change nothing — no set(), no revision.
        // A write reload would refuse is never applied (a backstop: the plan
        // itself creates a binding only where nothing on that instrument holds it).
        const changed = plan.items !== db.items || plan.materials !== db.materials;
        const refusal = changed ? identityRefusal({ ...db, items: plan.items, materials: plan.materials }) : null;
        if (refusal) return { id: '', created: false, refusal };
        if (changed) {
          set((s) => ({ db: { ...s.db, items: plan.items, materials: plan.materials } }));
        }
        return {
          id: plan.itemId,
          created: plan.created,
          ...(plan.candidates ? { candidates: plan.candidates } : {}),
          ...(plan.placed ? { placed: plan.placed } : {}),
          ...(plan.sourceCandidates ? { sourceCandidates: plan.sourceCandidates } : {}),
        };
      },

      addCourseRoutine: (stageId, kind) => {
        const { db } = get();
        const found = courseStage(stageId);
        if (!found) return null;
        const now = new Date();
        const segments =
          kind === 'level'
            ? buildLevelRoutine(found.course, found.group.key, db.items)
            : buildPositionRoutine(found.course, found.group.key, db.items);
        const pathway = db.pathways.find((p) => p.id === found.course.pathwayId);
        const order = db.pathwayRoutines.filter((r) => r.stageId === stageId).length;
        const routine = courseRoutine(found.course, found.group, segments, pathway?.instrumentId, order, kind, now);
        set((s) => ({ db: { ...s.db, pathwayRoutines: [...s.db.pathwayRoutines, routine] } }));
        return routine.id;
      },

      addCourseLevels: (pathwayId, groupKeys) => {
        const course = courseForPathway(pathwayId);
        if (!course) return;
        const now = new Date();
        // One pure decision, one set(). It adds only what was selected and only
        // what is genuinely absent, so a stage the owner deleted is offered
        // again but never recreated on its own.
        set((s) => ({
          db: { ...s.db, pathwayStages: planCourseLevels(course, s.db.pathwayStages, groupKeys, now) },
        }));
      },

      addDefaultStages: (pathwayId, stageIds) => {
        const { db } = get();
        const pathwayStages = planDefaultStages(db, pathwayId, stageIds, new Date());
        if (pathwayStages !== db.pathwayStages) set((s) => ({ db: { ...s.db, pathwayStages } }));
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
        // Every block start — direct, from a stage, the next item, a Session
        // Plan Begin — is a tap that reaches this call synchronously, so the
        // practice sound is readied HERE, inside that gesture, before anything
        // navigates. A refused start (another clock) readies it all the same.
        primePracticeSound();
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
        primePracticeSound(); // Resume is a tap too — on the practice screen and on Close
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

      claimSessionSignal: (startedAt, marker) => {
        const { active } = get();
        // Read and written in ONE synchronous call: nothing can interleave.
        if (!active || active.startedAt !== startedAt || !active.running) return false;
        if ((active.signalledThrough ?? 0) >= marker) return false;
        set({ active: { ...active, signalledThrough: marker } });
        return true;
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
            scope: input.scope ?? 'focused',
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
          scope: input.scope ?? 'focused',
          // The intention this close leaves the item in — an explicit
          // readiness choice made on this screen decides this very date.
          intent: input.itemEdits?.returnIntent ?? returnIntentOf(item),
        });

        const existing = db.blocks.filter((b) => b.practiceItemId === item.id);
        let updatedItem = applyBlockStats(item, block, {
          itemBlocksIncludingNew: [...existing, block],
          now,
          nextReviewDate: outcome.nextReviewDate,
        });
        // The owner's own revisions only — a suggestion applies when they
        // took it, never because a result was recorded. `outcome` was already
        // decided, so an edited status or effort never moves the date shown.
        updatedItem = applyCloseEdits(updatedItem, { edits: input.itemEdits });
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
        const nextPlan = activePlan ? completePlanSegment(activePlan, item.id, block.durationMinutes) : activePlan;

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

      setReturnIntent: (itemId, intent) => {
        const now = new Date();
        set((s) => ({
          db: {
            ...s.db,
            // The intention only: the stored date, its provenance, its open
            // row, spacing history, status and every statistic stay exactly
            // as they are. A later assessed close decides the next date.
            items: s.db.items.map((i) => (i.id === itemId && i.returnIntent !== intent ? touch({ ...i, returnIntent: intent }, now) : i)),
          },
        }));
      },

      saveNotes: (owner, text, base) => {
        const now = new Date();
        const db = get().db;
        const record =
          owner.kind === 'item' ? db.items.find((i) => i.id === owner.id) : db.lessons.find((l) => l.id === owner.id);
        if (!record) return 'gone';
        const norm = (t: string | undefined) => (t ?? '').trim();
        const stored = norm(record.notes);
        const wanted = norm(text);
        if (stored === wanted) return 'unchanged';
        // Both changed since this text was typed: keep BOTH, the stored text
        // first, never one silently over the other.
        const merged = stored !== norm(base) && stored !== '' && wanted !== '';
        const notes = merged ? `${stored}\n\n${KEPT_DRAFT_HEADING}\n${wanted}` : stored !== norm(base) && wanted === '' ? stored : wanted;
        if (notes === stored) return 'unchanged';
        set((s) => ({
          db: {
            ...s.db,
            ...(owner.kind === 'item'
              ? { items: s.db.items.map((i) => (i.id === owner.id ? touch({ ...i, notes: notes || undefined }, now) : i)) }
              : { lessons: s.db.lessons.map((l) => (l.id === owner.id ? touch({ ...l, notes: notes || undefined }, now) : l)) }),
          },
        }));
        // The device copy now accounts for this text and for what was stored;
        // after a merge it becomes the kept-both text, so neither a retry nor a
        // reload replays the old draft against it a second time.
        notesWritten(owner, record.notes ?? '', notes);
        if (merged) holdNoteDraft(owner, notes);
        return merged ? 'merged' : 'written';
      },

      persistAgain: () => set({}),

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
        const { db } = get();
        const stageIds = new Set(db.pathwayStages.filter((st) => st.pathwayId === id).map((st) => st.id));
        // Items are kept — they simply leave their stages, with any undecided
        // legacy answer settled first (one of several candidates refuses).
        const settled = settleLegacyEvidence(
          db,
          db.items.map((i) => (i.stageId && stageIds.has(i.stageId) ? touch({ ...i, stageId: undefined }, now) : i)),
          now,
        );
        if (!settled.ok) return settled.reason;
        set((s) => ({
          db: {
            ...s.db,
            pathways: s.db.pathways.filter((p) => p.id !== id),
            pathwayStages: s.db.pathwayStages.filter((st) => st.pathwayId !== id),
            // A user's routine is detached, never deleted — same rule as items.
            pathwayRoutines: detachRoutinesFromPathway(s.db.pathwayRoutines, id, now),
            items: settled.items,
          },
        }));
        return null;
      },

      reseedDefaultPathways: (pathwayIds) => {
        const { db } = get();
        // One pure decision, one set() — and NO set() when it adds nothing, so
        // a tap on a stale button bumps no revision and schedules no sync.
        const next = planDefaultPathways(db, pathwayIds, new Date());
        if (next.pathways === db.pathways) return;
        set((s) => ({ db: { ...s.db, ...next } }));
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
        const { db } = get();
        // Items stay — they just leave the stage, with any undecided legacy
        // answer settled first (one of several candidates refuses).
        const settled = settleLegacyEvidence(
          db,
          db.items.map((i) => (i.stageId === id ? touch({ ...i, stageId: undefined }, now) : i)),
          now,
        );
        if (!settled.ok) return settled.reason;
        set((s) => ({
          db: {
            ...s.db,
            pathwayStages: s.db.pathwayStages.filter((st) => st.id !== id),
            // Stage deletion is not pathway deletion — the routine keeps its
            // pathwayId and only stageId is cleared.
            pathwayRoutines: detachRoutinesFromStage(s.db.pathwayRoutines, id, now),
            items: settled.items,
            // Un-pin any pathway pointing at the removed stage.
            pathways: s.db.pathways.map((p) =>
              p.currentStageId === id ? touch({ ...p, currentStageId: undefined }, now) : p,
            ),
          },
        }));
        return null;
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
        // Only ever called from a Start tap (a card, a duration, the runner's
        // own Start) — never from an effect — so this is inside the gesture.
        primePracticeSound();
        const { activeRoutine, active } = get();
        // Same guard as startSession, in the other direction: an ordinary
        // block already running must be resolved before a routine can start.
        if (active) return;
        // AND A RUN ALREADY IN PROGRESS IS NEVER RESTARTED FROM ZERO — not even
        // its OWN routine's. This used to refuse only a DIFFERENT routine,
        // which was enough while `RoutineRunner`'s begin effect (guarded by
        // `!activeRoutine`) was the only caller. It is not the only caller any
        // more: a duration can be chosen from Today, a stage or a pathway, all
        // of which a mid-run owner can navigate to, because a run deliberately
        // survives navigation. Starting there would reset `accumulatedSeconds`
        // to 0 and silently discard practice that genuinely elapsed. The caller
        // still navigates, so the owner lands on the clock that is actually
        // running and resolves it — the same deterministic way out every other
        // page gives them.
        if (activeRoutine) return;
        const at = nowISO();
        set({
          activeRoutine: {
            routineId,
            shortOnTime,
            authoredSegments,
            segs: toRunSegments(authoredSegments),
            accumulatedSeconds: 0,
            running: true,
            runningSince: at,
            startedAt: at,
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
        primePracticeSound();
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
      moveOnRoutineRun: () => {
        const { activeRoutine } = get();
        if (!activeRoutine) return;
        const elapsedSeconds = runElapsedSeconds(activeRoutine.accumulatedSeconds, activeRoutine.runningSince, activeRoutine.running, new Date());
        const segs = skipCurrentSegment(activeRoutine.segs, elapsedSeconds);
        const signalledThrough = acknowledgeThrough(activeRoutine.signalledThrough, elapsedSeconds, segmentBoundaries(segs));
        set({ activeRoutine: { ...activeRoutine, segs, signalledThrough } });
      },

      removeRoutineSegment: (index) => {
        const { activeRoutine } = get();
        if (!activeRoutine) return;
        const elapsedSeconds = runElapsedSeconds(activeRoutine.accumulatedSeconds, activeRoutine.runningSince, activeRoutine.running, new Date());
        const segs = removePendingSegment(activeRoutine.segs, index, elapsedSeconds);
        if (segs === activeRoutine.segs) return;
        set({ activeRoutine: { ...activeRoutine, segs } });
      },

      skipRoutineRun: () => {
        const { activeRoutine } = get();
        if (!activeRoutine) return;
        const elapsedSeconds = runElapsedSeconds(activeRoutine.accumulatedSeconds, activeRoutine.runningSince, activeRoutine.running, new Date());
        const segs = skipSegmentUnpractised(activeRoutine.segs, elapsedSeconds);
        // Skip clamps the boundary onto elapsed itself — acknowledge it silently
        // (never nextSignal's announcing path), or the very next render would
        // see a freshly-passed boundary and announce a segment the user just
        // chose to end themselves.
        const signalledThrough = acknowledgeThrough(activeRoutine.signalledThrough, elapsedSeconds, segmentBoundaries(segs));
        set({ activeRoutine: { ...activeRoutine, segs, signalledThrough } });
      },

      claimRoutineSignal: (startedAt, marker) => {
        const { activeRoutine } = get();
        if (!activeRoutine || activeRoutine.startedAt !== startedAt || !activeRoutine.running) return false;
        if ((activeRoutine.signalledThrough ?? 0) >= marker) return false;
        set({ activeRoutine: { ...activeRoutine, signalledThrough: marker } });
        return true;
      },

      finishRoutine: () => {
        const { activeRoutine, db } = get();
        if (!activeRoutine) return [];
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
        return outcome.blocks.map((b) => b.id);
      },

      recordRoutineCapture: (runBlockIds, captures) => {
        const { db } = get();
        const outcome = captureRoutineResults(db, runBlockIds, captures, new Date());
        if ('refused' in outcome) return outcome.refused;
        // An unchanged capture returns the same arrays — but Save and Try again
        // still write what memory holds, so a capture whose earlier write
        // failed is made durable now rather than acknowledged by that failure.
        if (outcome.blocks !== db.blocks || outcome.items !== db.items) {
          set((s) => ({ db: { ...s.db, blocks: outcome.blocks, items: outcome.items } }));
        } else set({});
        return null;
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
      storage: landingStorage,
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
        const run = validateUnfinishedRun((persisted ?? {}) as { activeRoutine?: unknown; activePlan?: unknown });
        if (run) throw new Error(run);
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
        const run = validateUnfinishedRun(p);
        if (run) throw new Error(run);
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

/**
 * Notes typed before a reload interrupted their canonical write are replayed
 * through the ordinary `saveNotes` decision — so a draft whose record is gone
 * stays on the device and recreates nothing, and one whose stored text changed
 * meanwhile keeps both. A copy the disk already holds is simply dropped; the
 * rest settle as their write lands (`notesLanded`), like every other write.
 */
function replayNoteDrafts() {
  for (const { owner, draft } of heldNoteDrafts()) {
    const outcome = useStore.getState().saveNotes(owner, draft.text, draft.base);
    if (outcome === 'unchanged') dropNoteDraft(owner);
  }
}

// Async IndexedDB hydration: flip the gate when done, and seed a fresh install.
function finishHydration() {
  notesHydrated(useStore.getState().db);
  if (storageWasEmpty && useStore.getState().db.pathways.length === 0) {
    useStore.setState({ db: createSeedDB() });
  }
  replayNoteDrafts();
  useStore.setState({ hydrated: true });
}
if (useStore.persist.hasHydrated()) finishHydration();
else useStore.persist.onFinishHydration(finishHydration);

// ---------------------------------------------------------------------------
// A TEACHER QUESTION CAPTURED WHILE PRACTISING — one lifecycle, in memory.
//
// The words live here, outside any screen, so a Routine boundary, its final
// automatic completion, navigation or an unmounted editor never takes them
// away; they are never persisted themselves (no draft collection) — only the
// agenda question they write is. One lifecycle serves the quiet-interval
// autosave, Done, Try again and the flush on exit:
//
//  - Ownership is frozen at opening (`openQuestionCapture`). The FIRST write
//    revalidates it and appends ONE agenda question; every later write —
//    autosave, Done, retry — updates THAT id, never another, and never
//    recreates it once it has been removed elsewhere.
//  - Blank text writes nothing: it never creates a question nor overwrites a
//    written one. A write the question needs anyway — Try again, or its class
//    chosen with the field empty — carries the words it holds in memory, and
//    is acknowledged like any other.
//  - "Saved" is IndexedDB's acknowledgement of the question an attempt wrote
//    — its words, class, item and instrument as they stood (`storageSettled`
//    captured beside the write). A change to that question elsewhere (its
//    class retargeted or deleted, its item moved or deleted) is not covered
//    by it: the capture is unacknowledged again until its own write lands.
//    A question removed elsewhere leaves a blank field nothing to write: Done
//    lets it go, never recreating it. Only the latest attempt
//    may set the status; any answered attempt settles (never stuck saving);
//    an older acknowledgement never closes or clears newer words.
//  - A failure keeps the words, owner and id; Try again always writes again.
//    Nothing retries on its own, and practice never waits for any of it.
// ---------------------------------------------------------------------------

/** The quiet interval after the last keystroke before the words are written (the notes' own). */
export const QUESTION_AUTOSAVE_MS = 800;

export interface LiveQuestion {
  /** Frozen at opening: who the words belong to until the question exists. */
  owner: QuestionCapture;
  /** The practice it was opened in (its clock's start): a SETTLED capture is not carried into another. */
  session: string;
  text: string;
  /** The agenda question this capture writes — set by its first write, never replaced. */
  questionId?: ID;
  /** The latest attempt: the words it carried and how the device answered. */
  attempt?: { seq: number; carried: string; wrote: string; status: 'saving' | 'saved' | 'failed' };
  /** The newest words IndexedDB acknowledged for this capture. */
  written?: string;
  /** Done was tapped: close once the latest words are acknowledged. */
  closing?: boolean;
  /** The field held focus — restored if the editor remounts (Routine complete). */
  focused?: boolean;
}

interface LiveQuestionState {
  capture: LiveQuestion | null;
  /** What the last closed capture saved, said beside "+ Ask teacher". */
  note: string | null;
}

export const useLiveQuestion = create<LiveQuestionState>(() => ({ capture: null, note: null }));

let autosave: ReturnType<typeof setTimeout> | undefined;
let attempts = 0;
let writtenSeq = 0;

const liveCapture = () => useLiveQuestion.getState().capture;
const patchLive = (patch: Partial<LiveQuestion>) =>
  useLiveQuestion.setState((s) => (s.capture ? { capture: { ...s.capture, ...patch } } : {}));
const cancelAutosave = () => {
  clearTimeout(autosave);
  autosave = undefined;
};

/** The agenda entry a written capture belongs to now (a deleted class may have detached it), or undefined once removed. */
export function liveQuestionEntry(capture: LiveQuestion, agenda: PracticeDB['lessonAgenda']) {
  return capture.questionId ? agenda.find((e): e is LessonQuestion => e.id === capture.questionId && e.kind === 'question') : undefined;
}

/** What a write leaves on the device for this question: compared by value, so a rebuilt (synced, imported) entry still matches. */
const questionState = (e: LessonQuestion) => JSON.stringify([e.text, e.lessonId ?? null, e.itemId ?? null, e.instrumentId]);

/** IndexedDB acknowledged the question exactly as it stands now — not merely the words, its class, item and instrument too. */
export function liveQuestionAcknowledged(capture: LiveQuestion, agenda: PracticeDB['lessonAgenda']): boolean {
  const entry = liveQuestionEntry(capture, agenda);
  return !!entry && capture.attempt?.status === 'saved' && capture.attempt.wrote === questionState(entry);
}

/**
 * Nothing of this capture is left to write: its question acknowledged as it
 * stands, or a blank field with nothing outstanding — never written, or its
 * question removed elsewhere (never recreated). A blank field whose question's
 * last write failed, or which changed elsewhere since, is NOT settled.
 */
export function liveQuestionSettled(capture: LiveQuestion, agenda: PracticeDB['lessonAgenda']): boolean {
  const words = capture.text.trim();
  if (!capture.questionId) return !words;
  const acknowledged = liveQuestionAcknowledged(capture, agenda);
  if (!words) return acknowledged || !liveQuestionEntry(capture, agenda);
  return acknowledged && capture.attempt!.carried === words;
}

export function openLiveQuestion(instrumentId: ID, itemId: ID | undefined, session: string): void {
  cancelAutosave();
  const owner = openQuestionCapture(useStore.getState().db.lessons, instrumentId, itemId, new Date());
  useLiveQuestion.setState({ capture: { owner, session, text: '', focused: true }, note: null });
}

export function editLiveQuestion(text: string): void {
  if (!liveCapture()) return;
  patchLive({ text, closing: false });
  cancelAutosave();
  if (text.trim()) autosave = setTimeout(() => saveLiveQuestion(), QUESTION_AUTOSAVE_MS);
}

export function focusLiveQuestion(focused: boolean): void {
  patchLive({ focused });
}

/**
 * The one write. Coalesces with an attempt already carrying these words
 * (autosave + Done, a repeated tap, exit flushing) unless `force` — Try
 * again, which writes even when memory has not changed.
 */
export function saveLiveQuestion(force = false): void {
  cancelAutosave();
  const capture = liveCapture();
  if (!capture) return;
  const store = useStore.getState();
  const entry = liveQuestionEntry(capture, store.db.lessonAgenda);
  // Blank writes nothing of its own — but a forced write (Try again, a class
  // chosen) still writes the question, carrying the words it holds in memory.
  const words = capture.text.trim() || (force && entry ? entry.text : '');
  if (!words) return;
  const attempt = capture.attempt;
  if (!force && attempt?.carried === words && (attempt.status === 'saving' || liveQuestionAcknowledged(capture, store.db.lessonAgenda))) return;
  let questionId = capture.questionId;
  if (questionId) {
    // Its own question, or nothing: removed elsewhere, it is never recreated.
    if (!entry) return;
    store.updateLessonQuestion(questionId, words);
  } else {
    if (captureTargetProblem(store.db, capture.owner, new Date())) return;
    questionId = store.addLessonQuestion({ text: words, ...capture.owner }) ?? undefined;
    if (!questionId) return;
  }
  const seq = ++attempts;
  // Captured in the same tick as the write: this attempt's own outcome, and the question it wrote.
  const written = storageSettled();
  const wrote = questionState(liveQuestionEntry({ ...capture, questionId }, useStore.getState().db.lessonAgenda)!);
  patchLive({ questionId, attempt: { seq, carried: words, wrote, status: 'saving' } });
  const settle = (ok: boolean) => {
    const now = liveCapture();
    if (now?.questionId !== questionId) return; // closed, or another capture
    const latest = now.attempt?.seq === seq;
    const patch: Partial<LiveQuestion> = {};
    if (ok && seq > writtenSeq) {
      writtenSeq = seq;
      patch.written = words;
    }
    if (latest) {
      patch.attempt = { seq, carried: words, wrote, status: ok ? 'saved' : 'failed' };
      if (!ok) patch.closing = false;
    }
    patchLive(patch);
    const after = liveCapture()!;
    if (!(latest && ok && after.closing)) return;
    // Done waits on THIS question: changed elsewhere meanwhile, it is written again before closing.
    if (liveQuestionSettled(after, useStore.getState().db.lessonAgenda)) finishLiveQuestion();
    else saveLiveQuestion(true);
  };
  written.then(
    () => settle(true),
    () => settle(false),
  );
}

/** Choose the class deliberately: before the question exists it is the frozen owner; after, its own agenda target. */
export function chooseLiveQuestionLesson(lessonId: ID | undefined): void {
  const capture = liveCapture();
  if (!capture) return;
  if (capture.questionId) {
    useStore.getState().setAgendaTarget(capture.questionId, lessonId);
    saveLiveQuestion(true);
    return;
  }
  const { instrumentId, itemId } = capture.owner;
  patchLive({ owner: { instrumentId, ...(itemId ? { itemId } : {}), ...(lessonId ? { lessonId } : {}) } });
  if (capture.text.trim()) saveLiveQuestion();
}

/** Keep the words without the item that is no longer valid (only before the question exists). */
export function dropLiveQuestionItem(): void {
  const capture = liveCapture();
  if (!capture || capture.questionId) return;
  const { instrumentId, lessonId } = capture.owner;
  patchLive({ owner: { instrumentId, ...(lessonId ? { lessonId } : {}) } });
  if (capture.text.trim()) saveLiveQuestion();
}

/** The question was removed elsewhere: deliberately write these words as a NEW question (its owner revalidated). */
export function saveLiveQuestionAsNew(): void {
  const capture = liveCapture();
  if (!capture) return;
  patchLive({ questionId: undefined, attempt: undefined, written: undefined });
  saveLiveQuestion(true);
}

/** Leaving the editor (navigation, Finish, unmount): what is still waiting for its quiet interval is written now. */
export function flushLiveQuestion(): void {
  if (autosave !== undefined) saveLiveQuestion();
}

/**
 * Done: flush, and close only once the latest write is acknowledged. Blank
 * closes without writing (a written question stays as it was). Failed,
 * refused or removed words keep the editor open — they are never discarded
 * silently; clearing the field is the deliberate way to let them go.
 */
export function closeLiveQuestion(): void {
  const capture = liveCapture();
  if (!capture) return;
  if (liveQuestionSettled(capture, useStore.getState().db.lessonAgenda)) return finishLiveQuestion();
  patchLive({ closing: true });
  // Unless a write is already on its way, the question is written again (with
  // an empty field too): Done never closes over words, or a class, the device
  // has not acknowledged.
  saveLiveQuestion(capture.attempt?.status !== 'saving');
}

function finishLiveQuestion(): void {
  cancelAutosave();
  const capture = liveCapture();
  if (!capture) return;
  const entry = liveQuestionEntry(capture, useStore.getState().db.lessonAgenda);
  const lesson = entry?.lessonId ? useStore.getState().db.lessons.find((l) => l.id === entry.lessonId) : undefined;
  useLiveQuestion.setState({
    capture: null,
    note: entry && capture.written ? `Question saved on this device${lesson ? ` for ${lessonLabel(lesson)}` : ' — unassigned'}.` : null,
  });
}
