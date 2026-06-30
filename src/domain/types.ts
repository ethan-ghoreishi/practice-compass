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

// --- Material ---------------------------------------------------------------

export type MaterialSourceType =
  | 'radif'
  | 'piece'
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
  | 'full_piece'
  | 'exercise'
  | 'technique'
  | 'improvisation'
  | 'body'
  | 'memory'
  | 'other';

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
  title: string;
  itemType: ItemType;
  status: ItemStatus;
  importance: Rating;
  difficulty: Rating;
  currentProblem?: string;
  primaryFocus?: FocusArea;
  bestStrategy?: string;
  teacherQuestion?: string;
  tags: string[];
  nextReviewDate?: ISODate;
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
  | 'relaxation'
  | 'memory'
  | 'phrase_direction'
  | 'ornament'
  | 'transition'
  | 'musical_meaning'
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

// --- Curriculum / Pathway ---------------------------------------------------
//
// A curriculum is a fixed, trustable path to mastery (e.g. Classical Guitar
// Shed's Woodshed program): Levels → Stages (sub-levels like "1A") → Steps.
// The *content* is defined in code (src/domain/curriculum.ts); only the user's
// progress is persisted, so the path can be improved without data migrations.

export type StepStrand =
  | 'warmup'
  | 'right_hand'
  | 'left_hand'
  | 'chords'
  | 'arpeggios'
  | 'scales'
  | 'exercise'
  | 'rhythm'
  | 'sight_reading'
  | 'piece'
  | 'phrasing'
  | 'fretboard'
  | 'practice_skills'
  | 'reading_theory'
  | 'technique'
  | 'other';

export type StepKind = 'video' | 'exercise' | 'drill' | 'piece' | 'reading' | 'checkpoint';

export type StepStatus = 'todo' | 'in_progress' | 'done';

export interface CurriculumStep {
  id: ID;
  stageId: ID;
  title: string;
  strand: StepStrand;
  kind: StepKind;
  notes?: string;
  targetBpm?: number;
  order: number;
  /** True for steps the user added to flesh out an outline stage. */
  custom?: boolean;
}

export interface RoutineSegment {
  label: string;
  minutes: number;
  note?: string;
  /** CGS marks "if rushed, do these" segments with ***. */
  essential?: boolean;
}

export interface CurriculumRoutine {
  id: ID;
  stageId: ID;
  name: string;
  segments: RoutineSegment[];
}

/** A sub-level, e.g. "1A". */
export interface CurriculumStage {
  id: ID;
  levelNumber: number;
  code: string;
  title: string;
  order: number;
  intro?: string;
  mainAreas: string[];
  /** True when full step detail is seeded; false when only the outline is. */
  detailed: boolean;
}

export interface CurriculumLevel {
  number: number;
  title: string;
  summary: string;
  /** False for levels that exist on the path but aren't loaded yet (e.g. 4–5). */
  available: boolean;
}

export interface Curriculum {
  id: ID;
  name: string;
  source: string;
  description: string;
  levels: CurriculumLevel[];
  stages: CurriculumStage[];
  steps: CurriculumStep[];
  routines: CurriculumRoutine[];
}

/** The only persisted curriculum data: the user's progress and additions. */
export interface CurriculumProgress {
  stepStatus: Record<ID, StepStatus>;
  stepItemId: Record<ID, ID>;
  customSteps: CurriculumStep[];
}

// --- Persisted database -----------------------------------------------------

export const SCHEMA_VERSION = 2;

export interface PracticeDB {
  schemaVersion: number;
  instruments: Instrument[];
  materials: Material[];
  items: PracticeItem[];
  blocks: PracticeBlock[];
  reviews: Review[];
  curriculum: CurriculumProgress;
}

export function emptyCurriculumProgress(): CurriculumProgress {
  return { stepStatus: {}, stepItemId: {}, customSteps: [] };
}

/** Shape of a JSON export file. */
export interface ExportFile {
  app: 'practice-compass';
  schemaVersion: number;
  exportedAt: ISODateTime;
  data: PracticeDB;
}
