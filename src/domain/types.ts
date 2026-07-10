// ---------------------------------------------------------------------------
// Practice Compass — domain types
//
// Everything is plain, serialisable data. Timestamps are full ISO strings
// (`ISODateTime`); calendar dates with no time-of-day are `YYYY-MM-DD`
// (`ISODate`). The whole graph round-trips cleanly through JSON for the
// local-first store and for export/import.
// ---------------------------------------------------------------------------

export type ID = string;
export type ISODate = string; // "2026-06-18"
export type ISODateTime = string; // "2026-06-18T09:30:00.000Z"

// --- Instrument ------------------------------------------------------------

export interface Instrument {
  id: ID;
  name: string;
  family?: string;
  active: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

// --- Lessons (classes with a teacher) --------------------------------------
//
// A per-instrument log of lessons/classes. Each has a date and free-form notes
// (e.g. what your teacher said, taken while rewatching the recording — Farsi
// welcome). The nearest upcoming lesson is the deadline that prioritises items
// flagged "for next class". Available for every instrument.

export interface Lesson {
  id: ID;
  instrumentId: ID;
  date: ISODate;
  /** Free-form class notes (Farsi supported). */
  notes?: string;
  /**
   * Practice items worked on / created in this lesson. A link, not ownership:
   * unlinking never deletes the item, and this is separate from the item's
   * `assignedForLesson` flag (work *for the next* class).
   */
  itemIds?: ID[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

// --- Material ---------------------------------------------------------------

export type MaterialSourceType =
  | 'radif'
  | 'method_book'
  | 'repertoire'
  | 'piece'
  | 'song'
  | 'course'
  | 'lesson'
  | 'etude'
  | 'technique'
  | 'exercise'
  | 'improvisation'
  | 'other';

export type MaterialStatus =
  | 'new'
  | 'active'
  | 'maintenance'
  | 'dormant'
  | 'archived';

export interface Material {
  id: ID;
  instrumentId: ID;
  title: string;
  sourceType: MaterialSourceType;
  sourceName?: string;
  parentTitle?: string;
  section?: string;
  teacherOrSource?: string;
  notes?: string;
  status: MaterialStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

// --- Practice item ----------------------------------------------------------

export type ItemType =
  | 'phrase'
  | 'section'
  | 'bar'
  | 'gusheh'
  | 'full_piece'
  | 'exercise'
  | 'technique'
  | 'improvisation'
  | 'body'
  | 'memory'
  | 'other';

/** How the next-review date is decided for an item. */
export type ReviewMode = 'auto' | 'interval' | 'manual';

export type ItemStatus =
  | 'new'
  | 'fragile'
  | 'repairing'
  | 'usable'
  | 'integrated'
  | 'performable'
  | 'maintenance'
  | 'dormant';

/** 1–5 rating. */
export type Rating = 1 | 2 | 3 | 4 | 5;

/** Persian-music specific, optional metadata. */
export interface PersianFields {
  dastgahAvaz?: string;
  gusheh?: string;
  /** Musical form, e.g. pish-darāmad, chahār-mezrāb, tasnif, reng, qet‘e. */
  form?: string;
  /** Composer / maestro, e.g. Darvish Khān, Sabā. */
  composer?: string;
  phraseLabel?: string;
  shahed?: string;
  ist?: string;
  foroud?: string;
  importantNote?: string;
  ornamentIssue?: string;
  mezrabIssue?: string;
}

/** Classical-guitar specific, optional metadata. */
export interface GuitarFields {
  lessonNumber?: string;
  barRange?: string;
  rightHandIssue?: string;
  leftHandIssue?: string;
  toneIssue?: string;
  fingering?: string;
  tempo?: string;
  stringNoiseIssue?: string;
  bodyTensionNote?: string;
}

export interface PracticeItem {
  id: ID;
  instrumentId: ID;
  materialId?: ID;
  /** Optional placement in a pathway stage — this is how items live *in* a path. */
  stageId?: ID;
  /** Optional pathway category (for grouping/labelling within a stage). */
  strand?: StepStrand;
  /** Reference-catalog entry this item was created from (dedupes suggestions). */
  catalogKey?: string;
  /** Flagged to complete before the instrument's next lesson/class. */
  assignedForLesson?: boolean;
  /**
   * Parent piece/étude when this item is one of its parts (a phrase, bars, a
   * section, a technical problem). Parts are ordinary items; this only groups
   * them under the parent for the calm "practise this part next" view.
   */
  parentItemId?: ID;
  title: string;
  itemType: ItemType;
  status: ItemStatus;
  importance: Rating;
  difficulty: Rating;
  currentProblem?: string;
  primaryFocus?: FocusArea;
  bestStrategy?: string;
  teacherQuestion?: string;
  /** Free-form running notes / annotations (your "notebook" for this item). */
  notes?: string;
  tags: string[];
  nextReviewDate?: ISODate;
  /** How nextReviewDate is chosen. Defaults to 'auto' (the scheduling engine). */
  reviewMode?: ReviewMode;
  /** Fixed cadence in days, used when reviewMode === 'interval'. */
  reviewIntervalDays?: number;
  // --- Spaced-repetition state (SM-2-style; maintained by the review engine) ---
  /** Consecutive successful reviews. */
  srReps?: number;
  /** Ease factor (how fast intervals grow); starts at 2.5, floor 1.3. */
  srEase?: number;
  /** The interval (days) that produced the current nextReviewDate. */
  srIntervalDays?: number;
  lastPractisedAt?: ISODateTime;
  timesPractised: number;
  totalMinutes: number;
  lastResult?: BlockResult;
  lastObservation?: string;
  saturationWarning?: boolean;
  // Instrument-specific metadata, nested to keep the core item readable.
  persian?: PersianFields;
  guitar?: GuitarFields;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

// --- Practice block ---------------------------------------------------------

export type BlockMode =
  | 'learn'
  | 'repair'
  | 'integrate'
  | 'maintain'
  | 'perform'
  | 'explore'
  | 'diagnose';

export type FocusArea =
  | 'pitch'
  | 'rhythm'
  | 'tone'
  | 'fingering'
  | 'right_hand'
  | 'left_hand'
  | 'mezrab'
  | 'relaxation'
  | 'memory'
  | 'phrase_direction'
  | 'ornament'
  | 'tahrir'
  | 'transition'
  | 'musical_meaning'
  | 'dynamics'
  | 'tempo'
  | 'body'
  | 'other';

export type BlockResult =
  | 'worse'
  | 'same'
  | 'slightly_better'
  | 'stable_alone'
  | 'stable_in_context'
  | 'performable'
  | 'not_logged';

export interface PracticeBlock {
  id: ID;
  practiceItemId: ID;
  instrumentId: ID;
  materialId?: ID;
  startedAt: ISODateTime;
  endedAt?: ISODateTime;
  durationMinutes: number;
  mode: BlockMode;
  focus: FocusArea;
  constraint?: string;
  result: BlockResult;
  observation?: string;
  nextAction?: string;
  bodyNote?: string;
  createdReview: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

// --- Review -----------------------------------------------------------------

export type ReviewType =
  | 'retention'
  | 'repair'
  | 'integration'
  | 'maintenance'
  | 'teacher_check';

export interface Review {
  id: ID;
  practiceItemId: ID;
  dueDate: ISODate;
  reviewType: ReviewType;
  reason?: string;
  completedAt?: ISODateTime;
  result?: BlockResult;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

// --- Pathways ---------------------------------------------------------------
//
// A Pathway is a fully editable, trustable route to mastery — for any
// instrument. Pathway → Stages → Steps (+ optional guided Routines). Unlike
// the first version, pathways are persisted DATA the user can create, rename,
// reorder and delete. Seeded defaults exist for Guitar (CGS), Setar (radif &
// repertoire) and Tar (Honarestān method), all freely editable.

export type StepStrand =
  | 'warmup'
  | 'right_hand'
  | 'left_hand'
  | 'mezrab'
  | 'chords'
  | 'arpeggios'
  | 'scales'
  | 'exercise'
  | 'rhythm'
  | 'sight_reading'
  | 'radif'
  | 'repertoire'
  | 'improvisation'
  | 'ornament'
  | 'piece'
  | 'phrasing'
  | 'fretboard'
  | 'practice_skills'
  | 'reading_theory'
  | 'technique'
  | 'other';

export type StepKind = 'video' | 'exercise' | 'drill' | 'piece' | 'reading' | 'checkpoint';

export type StepStatus = 'todo' | 'in_progress' | 'done';

export interface Pathway {
  id: ID;
  /** The instrument this path is for (undefined = general / cross-instrument). */
  instrumentId?: ID;
  name: string;
  source?: string;
  description?: string;
  /** Free-form guidance shown at the top of the path (e.g. how it's used). */
  note?: string;
  /**
   * User-pinned "where I am now". Teacher-led work jumps around, so the
   * current stage is the user's choice; when unset (or stale) it falls back
   * to the first stage that isn't complete.
   */
  currentStageId?: ID;
  archived?: boolean;
  order: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface PathwayStage {
  id: ID;
  pathwayId: ID;
  /** Short label, e.g. "1A", "Shur", "Book 1". Free text. */
  code: string;
  title: string;
  /** Optional section heading to group stages under (e.g. "Level 1", "Book 1"). */
  group?: string;
  intro?: string;
  order: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

/**
 * A reference suggestion shown inside a stage (e.g. a gushe in the radif, a CGS
 * lesson area). It is *not* persisted data — it's code-defined guidance the user
 * turns into a real PracticeItem with one tap. `key` is stable within its stage.
 */
export interface CatalogEntry {
  key: string;
  stageId: ID;
  title: string;
  strand: StepStrand;
  kind: StepKind;
  /** "What it is / what to notice" — supports conscious practice. */
  about?: string;
  /** Practice guidance. */
  notes?: string;
  targetBpm?: number;
  persian?: PersianFields;
  guitar?: GuitarFields;
}

export interface RoutineSegment {
  label: string;
  minutes: number;
  note?: string;
  essential?: boolean;
}

export interface PathwayRoutine {
  id: ID;
  pathwayId: ID;
  /** Optional stage the routine belongs to (undefined = whole pathway). */
  stageId?: ID;
  name: string;
  segments: RoutineSegment[];
  order: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

// --- Attachments ------------------------------------------------------------
//
// File metadata is persisted in the main DB (small, reactive); the actual file
// bytes live as Blobs in IndexedDB (see src/store/idb.ts), keyed by id.

export type AttachmentKind = 'pdf' | 'image' | 'audio' | 'other';

/** What an attachment belongs to. */
export type AttachmentOwnerType = 'item' | 'lesson';

export interface AttachmentMeta {
  id: ID;
  ownerType: AttachmentOwnerType;
  /** Id of the owning PracticeItem or Lesson. */
  ownerId: ID;
  name: string;
  mime: string;
  size: number;
  kind: AttachmentKind;
  createdAt: ISODateTime;
}

// --- Persisted database -----------------------------------------------------

export const SCHEMA_VERSION = 6;

export interface PracticeDB {
  schemaVersion: number;
  instruments: Instrument[];
  materials: Material[];
  items: PracticeItem[];
  blocks: PracticeBlock[];
  reviews: Review[];
  pathways: Pathway[];
  pathwayStages: PathwayStage[];
  pathwayRoutines: PathwayRoutine[];
  attachments: AttachmentMeta[];
  lessons: Lesson[];
}

/** Shape of a JSON export file. */
export interface ExportFile {
  app: 'practice-compass';
  schemaVersion: number;
  exportedAt: ISODateTime;
  data: PracticeDB;
}
