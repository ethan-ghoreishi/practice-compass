import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { clearBlobs, deleteBlobsForItem, idbStorage, storageWasEmpty } from './idb';
import {
  applyBlockStats,
  computeReview,
  createBlock,
  createInstrument,
  createItem,
  createMaterial,
  createReview,
  createSeedDB,
  defaultModeForStatus,
  DEFAULT_DURATION_MINUTES,
  emptyDB,
  newId,
  nowISO,
  SCHEMA_VERSION,
  seedPathways,
  STRAND_TO_FOCUS,
  STRAND_TO_ITEM_TYPE,
  validateDB,
  type BlockMode,
  type BlockResult,
  type FocusArea,
  type GuitarFields,
  type ID,
  type Instrument,
  type AttachmentMeta,
  type ISODate,
  type ItemStatus,
  type Material,
  type MaterialSourceType,
  type MaterialStatus,
  type Pathway,
  type PathwayRoutine,
  type PathwayStage,
  type PathwayStep,
  type PersianFields,
  type PracticeDB,
  type PracticeItem,
  type Rating,
  type ReviewMode,
  type ReviewType,
  type StepKind,
  type StepStatus,
  type StepStrand,
} from '../domain';
import type { CreateItemInput } from '../domain/factories';

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

export interface StepInput {
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
  notes?: string;
  tags?: string[];
  nextReviewDate?: ISODate;
  reviewMode?: ReviewMode;
  reviewIntervalDays?: number;
  persian?: PersianFields;
  guitar?: GuitarFields;
}

interface StoreState {
  db: PracticeDB;
  active: ActiveSession | null;
  theme: ThemePref;
  /** True once the async IndexedDB store has finished rehydrating. */
  hydrated: boolean;

  setTheme: (t: ThemePref) => void;

  // Attachments (metadata; blobs live in IndexedDB via src/store/idb.ts)
  addAttachmentMeta: (meta: AttachmentMeta) => void;
  removeAttachmentMeta: (id: ID) => void;

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

  // Pathways
  addPathway: (input: { name: string; instrumentId?: ID; source?: string; description?: string; note?: string }) => ID;
  updatePathway: (id: ID, patch: Partial<Pick<Pathway, 'name' | 'instrumentId' | 'source' | 'description' | 'note' | 'archived'>>) => void;
  deletePathway: (id: ID) => void;
  reseedDefaultPathways: () => void;

  addStage: (pathwayId: ID, input: { code: string; title: string; group?: string; intro?: string }) => ID;
  updateStage: (id: ID, patch: Partial<Pick<PathwayStage, 'code' | 'title' | 'group' | 'intro'>>) => void;
  deleteStage: (id: ID) => void;
  moveStage: (id: ID, dir: -1 | 1) => void;

  addStep: (stageId: ID, input: StepInput) => ID;
  updateStep: (id: ID, patch: Partial<Pick<PathwayStep, 'title' | 'strand' | 'kind' | 'notes' | 'targetBpm'>>) => void;
  setStepStatus: (id: ID, status: StepStatus) => void;
  deleteStep: (id: ID) => void;
  moveStep: (id: ID, dir: -1 | 1) => void;

  /** Create/link a practice item for a step and begin a session on it. */
  startStepSession: (step: PathwayStep) => void;

  // Data management
  exportDB: () => PracticeDB;
  importDB: (raw: unknown) => void;
  resetDemo: () => void;
  clearAll: () => void;
}

function touch<T extends { updatedAt: string }>(entity: T, now: Date): T {
  return { ...entity, updatedAt: nowISO(now) };
}

const EMPTY_DB_FIELDS = {
  pathways: [] as Pathway[],
  pathwayStages: [] as PathwayStage[],
  pathwaySteps: [] as PathwayStep[],
  pathwayRoutines: [] as PathwayRoutine[],
  attachments: [] as AttachmentMeta[],
};

/**
 * v2 → v3: pathways became editable data. Seed the default pathways from the
 * db's instruments and carry over any old `curriculum` progress (step status,
 * linked items, custom steps), then drop the old field.
 */
function migrateToV3(db: PracticeDB): PracticeDB {
  if (db.pathways && db.pathways.length > 0) {
    return { ...EMPTY_DB_FIELDS, ...db };
  }
  const ids = {
    guitar: db.instruments.find((i) => /guitar/i.test(i.name))?.id ?? '',
    setar: db.instruments.find((i) => /setar/i.test(i.name) || i.name.includes('سه'))?.id ?? '',
    tar:
      db.instruments.find((i) => (/^tar$/i.test(i.name.trim()) || i.name.includes('تار')) && !/setar/i.test(i.name))?.id ?? '',
  };
  const seeded = seedPathways(ids);

  const old = (db as unknown as { curriculum?: { stepStatus?: Record<string, StepStatus>; stepItemId?: Record<string, ID>; customSteps?: PathwayStep[] } }).curriculum;
  let steps = seeded.pathwaySteps;
  if (old) {
    steps = steps.map((s) => ({
      ...s,
      status: old.stepStatus?.[s.id] ?? s.status,
      itemId: old.stepItemId?.[s.id] ?? s.itemId,
    }));
    const customs = (old.customSteps ?? []).map((c, i) => ({
      ...c,
      pathwayId: 'cgs',
      status: old.stepStatus?.[c.id] ?? c.status ?? 'todo',
      itemId: old.stepItemId?.[c.id],
      order: c.order ?? 1000 + i,
      createdAt: c.createdAt ?? nowISO(),
      updatedAt: c.updatedAt ?? nowISO(),
    })) as PathwayStep[];
    steps = [...steps, ...customs];
  }

  const next: PracticeDB & { curriculum?: unknown } = {
    ...db,
    pathways: seeded.pathways,
    pathwayStages: seeded.pathwayStages,
    pathwaySteps: steps,
    pathwayRoutines: seeded.pathwayRoutines,
    schemaVersion: SCHEMA_VERSION,
  };
  delete next.curriculum;
  return next;
}

/** v3 → v4: introduce the attachments array. */
function migrateToV4(db: PracticeDB): PracticeDB {
  return { ...db, attachments: db.attachments ?? [], schemaVersion: SCHEMA_VERSION };
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      db: emptyDB(),
      active: null,
      theme: 'system',
      hydrated: false,

      setTheme: (theme) => set({ theme }),

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
        void deleteBlobsForItem(id);
        set((s) => ({
          db: {
            ...s.db,
            items: s.db.items.filter((i) => i.id !== id),
            blocks: s.db.blocks.filter((b) => b.practiceItemId !== id),
            reviews: s.db.reviews.filter((r) => r.practiceItemId !== id),
            attachments: s.db.attachments.filter((a) => a.itemId !== id),
            // Unlink the item from any pathway step that referenced it.
            pathwaySteps: s.db.pathwaySteps.map((st) =>
              st.itemId === id ? { ...st, itemId: undefined } : st,
            ),
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

        // Spaced-repetition update (deterministic from the result + item state).
        const comp = computeReview(item, input.result, now);
        const nextReviewDate = input.scheduleReview
          ? (input.nextReviewDate ?? comp?.dueDate ?? item.nextReviewDate)
          : item.nextReviewDate;

        const existing = db.blocks.filter((b) => b.practiceItemId === item.id);
        let updatedItem = applyBlockStats(item, block, {
          itemBlocksIncludingNew: [...existing, block],
          now,
          newStatus: input.newStatus,
          nextReviewDate,
        });
        if (comp) {
          updatedItem = {
            ...updatedItem,
            srReps: comp.srReps,
            srEase: comp.srEase,
            srIntervalDays: comp.srIntervalDays,
          };
        }
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

      // --- Pathways --------------------------------------------------------

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
        set((s) => ({
          db: { ...s.db, pathways: s.db.pathways.map((p) => (p.id === id ? touch({ ...p, ...patch }, now) : p)) },
        }));
      },

      deletePathway: (id) => {
        set((s) => ({
          db: {
            ...s.db,
            pathways: s.db.pathways.filter((p) => p.id !== id),
            pathwayStages: s.db.pathwayStages.filter((st) => st.pathwayId !== id),
            pathwaySteps: s.db.pathwaySteps.filter((sp) => sp.pathwayId !== id),
            pathwayRoutines: s.db.pathwayRoutines.filter((r) => r.pathwayId !== id),
          },
        }));
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
            pathwaySteps: [...s.db.pathwaySteps, ...seeded.pathwaySteps.filter((x) => newIds.has(x.pathwayId))],
            pathwayRoutines: [...s.db.pathwayRoutines, ...seeded.pathwayRoutines.filter((x) => newIds.has(x.pathwayId))],
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
        set((s) => ({
          db: {
            ...s.db,
            pathwayStages: s.db.pathwayStages.filter((st) => st.id !== id),
            pathwaySteps: s.db.pathwaySteps.filter((sp) => sp.stageId !== id),
            pathwayRoutines: s.db.pathwayRoutines.filter((r) => r.stageId !== id),
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

      addStep: (stageId, input) => {
        const now = new Date();
        const ts = nowISO(now);
        const { db } = get();
        const stage = db.pathwayStages.find((s) => s.id === stageId);
        if (!stage) return '';
        const order = db.pathwaySteps.filter((s) => s.stageId === stageId).length;
        const step: PathwayStep = {
          id: newId(),
          pathwayId: stage.pathwayId,
          stageId,
          title: input.title.trim(),
          strand: input.strand,
          kind: input.kind ?? 'drill',
          notes: input.notes?.trim() || undefined,
          targetBpm: input.targetBpm,
          status: 'todo',
          order,
          createdAt: ts,
          updatedAt: ts,
        };
        set((s) => ({ db: { ...s.db, pathwaySteps: [...s.db.pathwaySteps, step] } }));
        return step.id;
      },

      updateStep: (id, patch) => {
        const now = new Date();
        set((s) => ({
          db: { ...s.db, pathwaySteps: s.db.pathwaySteps.map((sp) => (sp.id === id ? touch({ ...sp, ...patch }, now) : sp)) },
        }));
      },

      setStepStatus: (id, status) => {
        const now = new Date();
        set((s) => ({
          db: { ...s.db, pathwaySteps: s.db.pathwaySteps.map((sp) => (sp.id === id ? touch({ ...sp, status }, now) : sp)) },
        }));
      },

      deleteStep: (id) => {
        set((s) => ({ db: { ...s.db, pathwaySteps: s.db.pathwaySteps.filter((sp) => sp.id !== id) } }));
      },

      moveStep: (id, dir) => {
        set((s) => {
          const step = s.db.pathwaySteps.find((x) => x.id === id);
          if (!step) return s;
          const sibs = s.db.pathwaySteps.filter((x) => x.stageId === step.stageId).sort((a, b) => a.order - b.order);
          const idx = sibs.findIndex((x) => x.id === id);
          const swap = sibs[idx + dir];
          if (!swap) return s;
          const now = new Date();
          return {
            db: {
              ...s.db,
              pathwaySteps: s.db.pathwaySteps.map((x) =>
                x.id === step.id ? touch({ ...x, order: swap.order }, now) : x.id === swap.id ? touch({ ...x, order: step.order }, now) : x,
              ),
            },
          };
        });
      },

      startStepSession: (step) => {
        const now = new Date();
        const { db } = get();
        const pathway = db.pathways.find((p) => p.id === step.pathwayId);
        const stage = db.pathwayStages.find((s) => s.id === step.stageId);

        // Use the pathway's instrument; fall back to any active one.
        let instrument =
          (pathway?.instrumentId && db.instruments.find((i) => i.id === pathway.instrumentId)) ||
          db.instruments.find((i) => i.active) ||
          db.instruments[0];
        let instruments = db.instruments;
        if (!instrument) {
          instrument = createInstrument({ name: 'Classical Guitar', family: 'Western' }, now);
          instruments = [...db.instruments, instrument];
        }

        // Reuse the linked item, or create one for this step.
        let item = step.itemId ? db.items.find((i) => i.id === step.itemId) : undefined;
        let items = db.items;
        let linkedItemId = step.itemId;
        if (!item) {
          const created = createItem(
            {
              instrumentId: instrument.id,
              title: stage ? `${stage.code} · ${step.title}` : step.title,
              itemType: STRAND_TO_ITEM_TYPE[step.strand],
              status: 'new',
              importance: 3,
              difficulty: 3,
              primaryFocus: STRAND_TO_FOCUS[step.strand],
              currentProblem: step.notes,
              tags: stage ? [stage.code] : [],
            },
            now,
          );
          items = [...db.items, created];
          item = created;
          linkedItemId = created.id;
        }

        // Touching a step links the item and moves it into "in progress".
        const pathwaySteps = db.pathwaySteps.map((s) =>
          s.id === step.id
            ? { ...s, itemId: linkedItemId, status: s.status === 'todo' ? ('in_progress' as StepStatus) : s.status, updatedAt: nowISO(now) }
            : s,
        );

        set({ db: { ...db, instruments, items, pathwaySteps } });
        get().startSession({
          itemId: item.id,
          instrumentId: instrument.id,
          materialId: item.materialId,
          mode: defaultModeForStatus(item.status),
          focus: STRAND_TO_FOCUS[step.strand],
          targetMinutes: DEFAULT_DURATION_MINUTES,
        });
      },

      exportDB: () => get().db,

      importDB: (raw) => {
        const db = validateDB(raw);
        set({ db: { ...db, schemaVersion: SCHEMA_VERSION }, active: null });
      },

      resetDemo: () => {
        void clearBlobs();
        set({ db: createSeedDB(), active: null });
      },

      clearAll: () => {
        void clearBlobs();
        set({ db: emptyDB(), active: null });
      },
    }),
    {
      name: 'practice-compass',
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() => idbStorage),
      partialize: (s) => ({ db: s.db, active: s.active, theme: s.theme }),
      migrate: (persisted, version) => {
        const state = persisted as { db?: PracticeDB } | undefined;
        if (version < 3 && state?.db) state.db = migrateToV3(state.db);
        if (version < 4 && state?.db) state.db = migrateToV4(state.db);
        return state as unknown;
      },
      // Guarantee newer DB arrays exist after rehydration, whatever the source.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<StoreState>;
        const db = p.db ? { ...EMPTY_DB_FIELDS, ...p.db } : current.db;
        return { ...current, ...p, db };
      },
    },
  ),
);

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
