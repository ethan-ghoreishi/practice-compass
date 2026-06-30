import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  applyBlockStats,
  createBlock,
  createInstrument,
  createItem,
  createMaterial,
  createReview,
  createSeedDB,
  defaultModeForStatus,
  DEFAULT_DURATION_MINUTES,
  emptyCurriculumProgress,
  emptyDB,
  getCurriculum,
  newId,
  nowISO,
  SCHEMA_VERSION,
  STRAND_TO_FOCUS,
  validateDB,
  type BlockMode,
  type BlockResult,
  type CurriculumStep,
  type FocusArea,
  type GuitarFields,
  type ID,
  type Instrument,
  type ISODate,
  type ItemStatus,
  type ItemType,
  type Material,
  type MaterialSourceType,
  type MaterialStatus,
  type PersianFields,
  type PracticeDB,
  type PracticeItem,
  type Rating,
  type ReviewType,
  type StepKind,
  type StepStatus,
  type StepStrand,
} from '../domain';
import type { CreateItemInput } from '../domain/factories';

function strandToItemType(strand: StepStrand): ItemType {
  switch (strand) {
    case 'piece':
      return 'full_piece';
    case 'rhythm':
    case 'sight_reading':
    case 'exercise':
      return 'exercise';
    case 'reading_theory':
    case 'practice_skills':
      return 'other';
    case 'warmup':
      return 'body';
    default:
      return 'technique';
  }
}

// ---------------------------------------------------------------------------
// The single app store. Holds the whole local database, the live practice
// session, and a colour-scheme preference. Everything persists to
// localStorage; domain logic stays pure and is called from the actions here.
// ---------------------------------------------------------------------------

export type ThemePref = 'system' | 'light' | 'dark';

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
}

export function sessionElapsedSeconds(s: ActiveSession, now: Date = new Date()): number {
  const live = s.running && s.segmentStartedAt
    ? (now.getTime() - new Date(s.segmentStartedAt).getTime()) / 1000
    : 0;
  return Math.max(0, Math.floor(s.accumulatedSeconds + live));
}

export interface StartSessionInput {
  itemId: ID;
  instrumentId: ID;
  materialId?: ID;
  mode: BlockMode;
  focus: FocusArea;
  constraint?: string;
  targetMinutes: number;
}

export interface AddCustomStepInput {
  title: string;
  strand: StepStrand;
  kind?: StepKind;
  notes?: string;
  targetBpm?: number;
}

export interface CloseSessionInput {
  result: BlockResult;
  durationMinutes: number;
  observation?: string;
  nextAction?: string;
  bodyNote?: string;
  newStatus?: ItemStatus;
  scheduleReview: boolean;
  nextReviewDate?: ISODate;
  reviewType?: ReviewType;
  /** When set, written onto the item as its teacher question. */
  teacherQuestion?: string;
}

export interface ItemPatch {
  instrumentId?: ID;
  title?: string;
  itemType?: PracticeItem['itemType'];
  materialId?: ID;
  status?: ItemStatus;
  importance?: Rating;
  difficulty?: Rating;
  currentProblem?: string;
  primaryFocus?: FocusArea;
  bestStrategy?: string;
  teacherQuestion?: string;
  tags?: string[];
  nextReviewDate?: ISODate;
  persian?: PersianFields;
  guitar?: GuitarFields;
}

interface StoreState {
  db: PracticeDB;
  active: ActiveSession | null;
  theme: ThemePref;

  setTheme: (t: ThemePref) => void;

  // Instruments
  addInstrument: (input: { name: string; family?: string }) => ID;
  updateInstrument: (id: ID, patch: Partial<Pick<Instrument, 'name' | 'family' | 'active'>>) => void;

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
  updateItem: (id: ID, patch: ItemPatch) => void;
  setItemStatus: (id: ID, status: ItemStatus) => void;
  deleteItem: (id: ID) => void;

  // Session
  startSession: (input: StartSessionInput) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  setSessionNote: (note: string) => void;
  cancelSession: () => void;
  closeSession: (input: CloseSessionInput) => void;

  // Reviews
  completeReview: (id: ID, result?: BlockResult) => void;

  // Curriculum / pathway
  setStepStatus: (stepId: ID, status: StepStatus) => void;
  addCustomStep: (stageId: ID, input: AddCustomStepInput) => ID;
  deleteCustomStep: (stepId: ID) => void;
  linkStepItem: (stepId: ID, itemId: ID) => void;
  resetCurriculumProgress: () => void;
  /** Create/link a practice item for a step and begin a session on it. */
  startStepSession: (step: CurriculumStep) => void;

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
    (set, get) => ({
      db: createSeedDB(),
      active: null,
      theme: 'system',

      setTheme: (theme) => set({ theme }),

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
        set((s) => ({
          db: {
            ...s.db,
            items: s.db.items.map((i) => (i.id === id ? touch({ ...i, ...patch }, now) : i)),
          },
        }));
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
        set((s) => ({
          db: {
            ...s.db,
            items: s.db.items.filter((i) => i.id !== id),
            blocks: s.db.blocks.filter((b) => b.practiceItemId !== id),
            reviews: s.db.reviews.filter((r) => r.practiceItemId !== id),
          },
          active: s.active?.itemId === id ? null : s.active,
        }));
      },

      startSession: (input) => {
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
        const { active } = get();
        if (!active || active.running) return;
        set({ active: { ...active, running: true, segmentStartedAt: nowISO() } });
      },

      setSessionNote: (note) => {
        const { active } = get();
        if (!active) return;
        set({ active: { ...active, note } });
      },

      cancelSession: () => set({ active: null }),

      closeSession: (input) => {
        const now = new Date();
        const { active, db } = get();
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
            bodyNote: input.bodyNote,
            createdReview: input.scheduleReview,
          },
          now,
        );

        const existing = db.blocks.filter((b) => b.practiceItemId === item.id);
        let updatedItem = applyBlockStats(item, block, {
          itemBlocksIncludingNew: [...existing, block],
          now,
          newStatus: input.newStatus,
          nextReviewDate: input.scheduleReview ? input.nextReviewDate : item.nextReviewDate,
        });
        if (input.teacherQuestion !== undefined) {
          updatedItem = { ...updatedItem, teacherQuestion: input.teacherQuestion.trim() || undefined };
        }

        // Close any open reviews for this item; optionally schedule the next.
        const reviews = db.reviews.map((r) =>
          r.practiceItemId === item.id && !r.completedAt
            ? { ...r, completedAt: nowISO(now), result: input.result, updatedAt: nowISO(now) }
            : r,
        );
        if (input.scheduleReview && input.nextReviewDate) {
          reviews.push(
            createReview(
              {
                practiceItemId: item.id,
                dueDate: input.nextReviewDate,
                reviewType: input.reviewType ?? 'retention',
              },
              now,
            ),
          );
        }

        set({
          db: {
            ...db,
            blocks: [...db.blocks, block],
            items: db.items.map((i) => (i.id === item.id ? updatedItem : i)),
            reviews,
          },
          active: null,
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

      // --- Curriculum / pathway --------------------------------------------

      setStepStatus: (stepId, status) => {
        set((s) => ({
          db: {
            ...s.db,
            curriculum: {
              ...s.db.curriculum,
              stepStatus: { ...s.db.curriculum.stepStatus, [stepId]: status },
            },
          },
        }));
      },

      addCustomStep: (stageId, input) => {
        const existing = get().db.curriculum.customSteps.filter((s) => s.stageId === stageId).length;
        const step: CurriculumStep = {
          id: newId(),
          stageId,
          title: input.title.trim(),
          strand: input.strand,
          kind: input.kind ?? 'drill',
          notes: input.notes?.trim() || undefined,
          targetBpm: input.targetBpm,
          order: 1000 + existing,
          custom: true,
        };
        set((s) => ({
          db: {
            ...s.db,
            curriculum: { ...s.db.curriculum, customSteps: [...s.db.curriculum.customSteps, step] },
          },
        }));
        return step.id;
      },

      deleteCustomStep: (stepId) => {
        set((s) => {
          const stepStatus = { ...s.db.curriculum.stepStatus };
          delete stepStatus[stepId];
          const stepItemId = { ...s.db.curriculum.stepItemId };
          delete stepItemId[stepId];
          return {
            db: {
              ...s.db,
              curriculum: {
                stepStatus,
                stepItemId,
                customSteps: s.db.curriculum.customSteps.filter((c) => c.id !== stepId),
              },
            },
          };
        });
      },

      linkStepItem: (stepId, itemId) => {
        set((s) => ({
          db: {
            ...s.db,
            curriculum: {
              ...s.db.curriculum,
              stepItemId: { ...s.db.curriculum.stepItemId, [stepId]: itemId },
            },
          },
        }));
      },

      resetCurriculumProgress: () => {
        set((s) => ({ db: { ...s.db, curriculum: emptyCurriculumProgress() } }));
      },

      startStepSession: (step) => {
        const now = new Date();
        const { db } = get();
        const stage = getCurriculum().stages.find((s) => s.id === step.stageId);

        // Ensure a guitar instrument exists to attach the work to.
        let instrument =
          db.instruments.find((i) => /guitar/i.test(i.name)) ??
          db.instruments.find((i) => i.active) ??
          db.instruments[0];
        let instruments = db.instruments;
        if (!instrument) {
          instrument = createInstrument({ name: 'Classical Guitar', family: 'Western' }, now);
          instruments = [...db.instruments, instrument];
        }

        // Reuse the linked item, or create one for this step.
        let itemId = db.curriculum.stepItemId[step.id];
        let item = itemId ? db.items.find((i) => i.id === itemId) : undefined;
        let items = db.items;
        let stepItemId = db.curriculum.stepItemId;
        if (!item) {
          const created = createItem(
            {
              instrumentId: instrument.id,
              title: stage ? `${stage.code} · ${step.title}` : step.title,
              itemType: strandToItemType(step.strand),
              status: 'new',
              importance: 3,
              difficulty: 3,
              primaryFocus: STRAND_TO_FOCUS[step.strand],
              currentProblem: step.notes,
              tags: ['cgs', stage?.code ?? ''].filter(Boolean),
            },
            now,
          );
          items = [...db.items, created];
          itemId = created.id;
          item = created;
          stepItemId = { ...db.curriculum.stepItemId, [step.id]: created.id };
        }

        // Touching a step moves it into "in progress" if it was still to-do.
        const cur = db.curriculum.stepStatus[step.id] ?? 'todo';
        const stepStatus =
          cur === 'todo'
            ? { ...db.curriculum.stepStatus, [step.id]: 'in_progress' as StepStatus }
            : db.curriculum.stepStatus;

        set({
          db: { ...db, instruments, items, curriculum: { ...db.curriculum, stepItemId, stepStatus } },
          active: {
            itemId: item.id,
            instrumentId: instrument.id,
            materialId: item.materialId,
            mode: defaultModeForStatus(item.status),
            focus: STRAND_TO_FOCUS[step.strand],
            targetMinutes: DEFAULT_DURATION_MINUTES,
            startedAt: nowISO(now),
            accumulatedSeconds: 0,
            running: true,
            segmentStartedAt: nowISO(now),
          },
        });
      },

      exportDB: () => get().db,

      importDB: (raw) => {
        const db = validateDB(raw);
        set({ db: { ...db, schemaVersion: SCHEMA_VERSION }, active: null });
      },

      resetDemo: () => set({ db: createSeedDB(), active: null }),

      clearAll: () => set({ db: emptyDB(), active: null }),
    }),
    {
      name: 'practice-compass',
      version: SCHEMA_VERSION,
      partialize: (s) => ({ db: s.db, active: s.active, theme: s.theme }),
      migrate: (persisted, version) => {
        const state = persisted as { db?: PracticeDB } | undefined;
        // v1 → v2: introduce curriculum progress.
        if (version < 2 && state?.db && !state.db.curriculum) {
          state.db.curriculum = emptyCurriculumProgress();
          state.db.schemaVersion = SCHEMA_VERSION;
        }
        return state as unknown;
      },
      // Guarantee newer fields exist after rehydration, whatever the source.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<StoreState>;
        const db = p.db
          ? { ...p.db, curriculum: p.db.curriculum ?? emptyCurriculumProgress() }
          : current.db;
        return { ...current, ...p, db };
      },
    },
  ),
);
