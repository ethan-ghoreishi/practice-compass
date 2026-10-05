import type { ID, ItemStatus, ItemType, Material, Pathway, PracticeDB, PracticeItem } from './types';
import type { SourcePiece } from './sourceArchive';
import { archiveFor, lessonAssociations, sessionMembership } from './sourceArchive';
import { MIRZA_ABDOLLAH_RADIF } from './referenceCatalog';
import { catalogForStage, stageIdFor } from './pathwaySeed';
import { catalogReferenceId, resolveCatalogReference } from './courseSeed';
import { planLinkReference, settleLegacyEvidence } from './pathways';
import { resolveValue, vocabulary } from './musicTerms';
import { createMaterial } from './factories';
import { nowISO } from './util';
import { canonicalStringify } from './canonical';
import { ITEM_STATUS_LABELS } from './labels';

// ---------------------------------------------------------------------------
// "Review Setar setup" — an OPTIONAL, owner-driven look at how the current
// Setar library is organised, against the evidence the archive actually holds.
//
// It is a REVIEW, never a migration: nothing runs on load, hydration, import,
// sync or an ordinary Refresh. It proposes; the owner selects; one validated
// mutation writes exactly the selected ids and fields, each checked against
// the value the owner saw. Status, kind, placement, reference, study source
// and class associations are SEPARATE questions — a piece's provenance never
// decides its kind, its kind never decides its reference, and nothing here
// records practice, a result, a review or progress.
// ---------------------------------------------------------------------------

/** The kinds the registry's own form vocabulary can establish. */
export type PieceKind = Extract<ItemType, 'gusheh' | 'full_piece' | 'exercise' | 'improvisation'>;

export type KindFamily =
  | 'gusheh'
  | 'radif-daramad'
  | 'radif-chaharpareh'
  | 'composed-chaharpareh'
  | 'radif-reng'
  | 'composed'
  | 'etude'
  | 'exercise'
  | 'improvisation'
  | 'provisional'
  | 'unknown';

export interface KindReading {
  /** `null`: the evidence does not decide it — the owner is asked. */
  kind: PieceKind | null;
  family: KindFamily;
  /** One sentence, from the registry's own words. */
  why: string;
}

/** Forms that name a composed work outright. The registry's own spellings. */
const COMPOSED_FORMS = new Set(['(قطعه)', 'پیش-درامد', 'پیش‌درآمد', 'چهارمضراب', 'ضربی', 'دوضربی', 'هفت-ضربی', 'تصنیف']);

/**
 * THE ONE KIND POLICY — what the registry's `form` (and, where the form alone
 * cannot say, its composer) establishes about what a piece IS. Used to seed a
 * NEW archive item and to propose a kind in the review; never anywhere else.
 *
 * A declared study source NEVER decides kind: «چهارپاره-مرادخانی» is declared
 * from the radif and attributed to a composer, so whether it is a radif section
 * or a composed piece is the owner's (or the teacher's) to say. A provisional
 * identity is asked about, whatever its form.
 */
export function classifyPiece(piece: Pick<SourcePiece, 'form' | 'composer' | 'provisional'>): KindReading {
  const form = piece.form.trim();
  const composer = piece.composer.trim();
  if (piece.provisional) return { kind: null, family: 'provisional', why: 'The registry marks this identity PROVISIONAL.' };
  if (form === 'گوشه') return { kind: 'gusheh', family: 'gusheh', why: 'The registry names it a گوشه.' };
  if (form === 'درامد') return { kind: 'gusheh', family: 'radif-daramad', why: 'The registry names it a درامد — the opening gusheh of its dastgāh.' };
  if (form === 'چهارپاره') {
    return composer
      ? { kind: null, family: 'composed-chaharpareh', why: `A چهارپاره attributed to ${composer}: a radif section or a composed piece — yours to say.` }
      : { kind: 'gusheh', family: 'radif-chaharpareh', why: 'A چهارپاره with no composer: a section of the radif.' };
  }
  if (form === 'رنگ' && !composer) {
    return { kind: null, family: 'radif-reng', why: 'A رنگ with no composer: a radif reng or a composed one — yours to say.' };
  }
  if (form === 'اتود') return { kind: 'exercise', family: 'etude', why: 'The registry names it an اتود (étude).' };
  if (form === 'تمرین') return { kind: 'exercise', family: 'exercise', why: 'The registry names it a تمرین (exercise).' };
  if (form === 'بداهه') {
    return { kind: 'improvisation', family: 'improvisation', why: 'The registry names it a بداهه — your own improvisation, not a composed work.' };
  }
  if (COMPOSED_FORMS.has(form) || (form === 'رنگ' && composer)) {
    return { kind: 'full_piece', family: 'composed', why: `The registry names it a ${form}${composer ? ` by ${composer}` : ''}.` };
  }
  return { kind: null, family: 'unknown', why: form ? `The registry's form «${form}» does not say what kind of item this is.` : 'The registry gives no form.' };
}

/** What the import USED to seed — `full_piece` for every non-گوشه — so a seeded value is told from an owner's choice. */
function legacySeedKind(piece: Pick<SourcePiece, 'form'>): ItemType {
  return piece.form === 'گوشه' ? 'gusheh' : 'full_piece';
}

// --- the plan ----------------------------------------------------------------

export type SetupField = 'status' | 'kind' | 'stage' | 'source' | 'reference' | 'class';

/** A typed value of one field, compared canonically. */
export type SetupValue =
  | { status: ItemStatus }
  | { itemType: ItemType; gusheh: string | null }
  | { stageId: ID | null }
  | { materialId: ID | null }
  | { catalogRefs: string[] | null }
  | { linked: boolean };

export interface SetupChoice {
  label: string;
  after: SetupValue;
}

export interface SetupProposal {
  /** Stable for this item and question: `field:itemId[:detail]`. */
  id: string;
  itemId: ID;
  field: SetupField;
  /**
   * `proposed` — the evidence decides it and it differs (selected by default);
   * `correct` — already as the evidence says;
   * `exception` — the evidence does not decide it, or the owner's own value
   * conflicts with it: shown, never selected unless the owner chooses.
   */
  state: 'proposed' | 'correct' | 'exception';
  before: SetupValue;
  /** The evidenced value (`proposed`), or what is already there (`correct`). */
  after?: SetupValue;
  /** The explicit options an `exception` offers. Possibly none. */
  choices: SetupChoice[];
  evidence: string;
}

export interface SourceGroup {
  /** The registry's declared `source` text, verbatim, or the shipped radif reference. */
  key: string;
  label: string;
  kind: 'declared' | 'reference';
  itemIds: ID[];
}

export interface SetupContext {
  instrumentId: ID;
  /** The mixed pathway placement is proposed in. Chosen, never guessed from a name. */
  pathwayId?: ID;
  /**
   * Which study source each evidence group IS: an existing same-instrument
   * material, or `{ create: true }` to make one, once, on commit.
   */
  sources?: Record<string, { materialId: ID } | { create: true }>;
}

export interface SetupPlan {
  instrumentId: ID;
  pathwayId?: ID;
  /** Every pathway of this instrument — the owner picks one. */
  pathways: Pathway[];
  /** Same-instrument materials only. Never matched by title. */
  materials: Material[];
  sourceGroups: SourceGroup[];
  proposals: SetupProposal[];
}

const NOT_PLACED_TYPES: ReadonlySet<ItemType> = new Set(['technique', 'exercise', 'body', 'memory', 'phrase', 'bar', 'section']);

const statusFlag = (i: PracticeItem): string | null => {
  if (i.parentItemId) return 'a part of another item';
  if (NOT_PLACED_TYPES.has(i.itemType)) return 'technique or exercise';
  if (i.status === 'dormant') return 'resting';
  if (i.status === 'fragile' || i.status === 'repairing') return ITEM_STATUS_LABELS[i.status].toLowerCase();
  if (i.status === 'new' || i.timesPractised === 0) return 'not practised here yet';
  return null;
};

/** The radif stage of a dastgāh term in one pathway, by stable id. */
function radifStageFor(pathwayId: ID, termId: ID): ID | undefined {
  const d = MIRZA_ABDOLLAH_RADIF.dastgahs.find((x) => x.termId === termId);
  return d ? stageIdFor(pathwayId, d.slug) : undefined;
}

const RADIF_REF_PREFIX = `radif:${MIRZA_ABDOLLAH_RADIF.id}:`;

/**
 * Decide what the review shows for THIS database. Pure; reads no clock.
 */
export function planSetarSetup(db: PracticeDB, ctx: SetupContext): SetupPlan {
  const vocab = vocabulary(db.musicTerms ?? []);
  const instrumentId = ctx.instrumentId;
  const items = db.items.filter((i) => i.instrumentId === instrumentId);
  const pathways = db.pathways.filter((p) => p.instrumentId === instrumentId && !p.archived);
  const pathway = ctx.pathwayId ? pathways.find((p) => p.id === ctx.pathwayId) : undefined;
  const stageIds = new Set(pathway ? db.pathwayStages.filter((s) => s.pathwayId === pathway.id).map((s) => s.id) : []);
  const stageName = (id: ID | undefined) => {
    const st = id ? db.pathwayStages.find((s) => s.id === id) : undefined;
    return st ? `${st.code}${st.title && st.title !== st.code ? ` · ${st.title}` : ''}` : 'a stage of another pathway';
  };
  const materials = db.materials.filter((m) => m.instrumentId === instrumentId);
  const pieceOf = (item: PracticeItem): SourcePiece | undefined =>
    item.source ? archiveFor(db, item.source.archiveId)?.pieces.find((p) => p.key === item.source!.pieceKey) : undefined;

  const proposals: SetupProposal[] = [];
  const push = (p: SetupProposal) => proposals.push(p);

  // --- 1. STATUS: Keeping fresh, a batch the owner selects ------------------
  // Archive presence proves no learning, so nothing here is evidenced and
  // nothing is selected for the owner: every row is shown, and the ones a
  // musician would want to look at twice say why.
  for (const i of items) {
    const before: SetupValue = { status: i.status };
    if (i.status === 'maintenance') {
      push({ id: `status:${i.id}`, itemId: i.id, field: 'status', state: 'correct', before, after: before, choices: [], evidence: 'Already Keeping fresh.' });
      continue;
    }
    const flag = statusFlag(i);
    push({
      id: `status:${i.id}`,
      itemId: i.id,
      field: 'status',
      state: 'exception',
      before,
      choices: [{ label: ITEM_STATUS_LABELS.maintenance, after: { status: 'maintenance' } }],
      evidence: flag ? `Currently ${ITEM_STATUS_LABELS[i.status]} — ${flag}.` : `Currently ${ITEM_STATUS_LABELS[i.status]}.`,
    });
  }

  // --- 2. KIND: only where the registry's form says ------------------------
  const kindOf = new Map<ID, ItemType>();
  for (const i of items) {
    kindOf.set(i.id, i.itemType);
    const piece = pieceOf(i);
    if (!piece || i.parentItemId) continue;
    const reading = classifyPiece(piece);
    const before: SetupValue = { itemType: i.itemType, gusheh: i.persian?.gusheh ?? null };
    const target = (kind: PieceKind): SetupValue => ({
      itemType: kind,
      gusheh: kind === 'gusheh' ? (i.persian?.gusheh || piece.piece || piece.key) : (i.persian?.gusheh ?? null),
    });
    const options = (['gusheh', 'full_piece', 'exercise', 'improvisation'] as PieceKind[]).map((k) => ({
      label: { gusheh: 'Gusheh (radif)', full_piece: 'Composed piece', exercise: 'Exercise / étude', improvisation: 'Improvisation' }[k],
      after: target(k),
    }));
    if (!reading.kind) {
      push({ id: `kind:${i.id}`, itemId: i.id, field: 'kind', state: 'exception', before, choices: options, evidence: reading.why });
      continue;
    }
    const want = target(reading.kind);
    if (canonicalStringify(want) === canonicalStringify(before)) {
      push({ id: `kind:${i.id}`, itemId: i.id, field: 'kind', state: 'correct', before, after: before, choices: [], evidence: reading.why });
      continue;
    }
    // The import's own old default is not an owner's decision; anything else is.
    const seeded = i.itemType === legacySeedKind(piece) || i.itemType === 'other';
    push(
      seeded
        ? { id: `kind:${i.id}`, itemId: i.id, field: 'kind', state: 'proposed', before, after: want, choices: [], evidence: reading.why }
        : {
            id: `kind:${i.id}`,
            itemId: i.id,
            field: 'kind',
            state: 'exception',
            before,
            choices: options.filter((o) => 'itemType' in o.after && o.after.itemType === reading.kind),
            evidence: `${reading.why} You set it to ${i.itemType}; that stays unless you choose.`,
          },
    );
    if (seeded) kindOf.set(i.id, reading.kind);
  }

  // --- 3. PLACEMENT in the chosen mixed pathway ----------------------------
  if (pathway) {
    const formsStage = stageIdFor(pathway.id, 'forms');
    for (const i of items) {
      const before: SetupValue = { stageId: i.stageId ?? null };
      const id = `stage:${i.id}`;
      const kind = kindOf.get(i.id)!;
      const exception = (evidence: string, choices: SetupChoice[] = []) =>
        push({ id, itemId: i.id, field: 'stage', state: 'exception', before, choices, evidence });
      if (i.parentItemId) {
        exception('A part of another item — it is organised under that item.');
        continue;
      }
      if (NOT_PLACED_TYPES.has(kind)) {
        exception('A technique or exercise — not placed in a repertoire stage.');
        continue;
      }
      let target: ID | undefined;
      let why = '';
      if (kind === 'gusheh') {
        const r = resolveValue(i.persian?.dastgahAvaz, 'dastgah', vocab);
        if (r.status !== 'term') {
          exception(
            r.status === 'empty'
              ? 'A gusheh with no dastgāh — its radif stage cannot be known.'
              : 'Its dastgāh does not name exactly one dastgāh (composite, ambiguous or unknown) — place it yourself.',
          );
          continue;
        }
        target = radifStageFor(pathway.id, r.term.id);
        why = `A gusheh of ${r.term.name}.`;
        if (!target || !stageIds.has(target)) {
          exception(`A gusheh of ${r.term.name}, but this pathway has no stage for it.`);
          continue;
        }
      } else if (kind === 'full_piece') {
        target = formsStage;
        why = 'A composed piece.';
        if (!stageIds.has(target)) {
          exception('A composed piece, but this pathway has no forms stage.');
          continue;
        }
      } else {
        exception('Its kind does not say where it belongs — place it yourself.');
        continue;
      }
      const after: SetupValue = { stageId: target };
      if (i.stageId === target) {
        push({ id, itemId: i.id, field: 'stage', state: 'correct', before, after, choices: [], evidence: why });
      } else if (!i.stageId) {
        push({ id, itemId: i.id, field: 'stage', state: 'proposed', before, after, choices: [], evidence: `${why} Not placed yet.` });
      } else {
        exception(`${why} You placed it in ${stageName(i.stageId)}; that stays unless you choose.`, [
          { label: `Move to ${stageName(target)}`, after },
        ]);
      }
    }

    // --- 4. REFERENCE: only an owner-confirmed one ---------------------------
    // Placement is not linking. The radif catalogue is PARTIAL and a form
    // category names no individual work, so nothing here is proposed: a
    // placed gusheh that answers no suggestion of its stage is shown, with
    // that stage's open suggestions as explicit choices.
    for (const i of items) {
      if (kindOf.get(i.id) !== 'gusheh' || i.parentItemId) continue;
      const stageId = i.stageId;
      if (!stageId || !stageIds.has(stageId) || stageId === formsStage) continue;
      const refs = catalogForStage(stageId).map((e) => catalogReferenceId(stageId, e.key));
      const before: SetupValue = { catalogRefs: i.catalogRefs ?? null };
      const answered = refs.filter((ref) => {
        const r = resolveCatalogReference(ref, instrumentId, db.items);
        return r.status === 'bound' && r.item.id === i.id;
      });
      if (answered.length) {
        push({ id: `reference:${i.id}`, itemId: i.id, field: 'reference', state: 'correct', before, after: before, choices: [], evidence: 'Answers a suggestion of its stage.' });
        continue;
      }
      const open = refs.filter((ref) => resolveCatalogReference(ref, instrumentId, db.items).status === 'absent');
      push({
        id: `reference:${i.id}`,
        itemId: i.id,
        field: 'reference',
        state: 'exception',
        before,
        choices: open.map((ref) => ({
          label: catalogForStage(stageId).find((e) => catalogReferenceId(stageId, e.key) === ref)!.title,
          after: { catalogRefs: [...(i.catalogRefs ?? []), ref] },
        })),
        evidence: open.length
          ? 'Answers none of its stage’s suggestions. Link one only if it IS this gusheh — the radif list here is partial.'
          : 'Its stage has no open suggestion — the radif list here is partial, and that is fine.',
      });
    }
  }

  // --- 5. STUDY SOURCE: declared, or a confirmed radif reference -----------
  const groups = new Map<string, SourceGroup>();
  const groupOf = new Map<ID, string>();
  for (const i of items) {
    const declared = pieceOf(i)?.studySource;
    const viaRef = (i.catalogRefs ?? []).some((r) => r.startsWith(RADIF_REF_PREFIX));
    const key = declared ? `declared:${declared}` : viaRef ? `reference:${MIRZA_ABDOLLAH_RADIF.id}` : undefined;
    if (!key) continue;
    const g =
      groups.get(key) ??
      (declared
        ? { key, label: declared, kind: 'declared' as const, itemIds: [] }
        : { key, label: MIRZA_ABDOLLAH_RADIF.name, kind: 'reference' as const, itemIds: [] });
    g.itemIds.push(i.id);
    groups.set(key, g);
    groupOf.set(i.id, key);
  }
  for (const i of items) {
    const key = groupOf.get(i.id);
    if (!key) continue;
    const choice = ctx.sources?.[key];
    const before: SetupValue = { materialId: i.materialId ?? null };
    const target = choice && 'materialId' in choice ? choice.materialId : choice ? `new:${key}` : undefined;
    const label = groups.get(key)!.label;
    const id = `source:${i.id}`;
    if (!target) continue; // the group's own question comes first
    if (choice && 'materialId' in choice && !materials.some((m) => m.id === choice.materialId)) continue;
    const after: SetupValue = { materialId: target };
    const reading = (() => {
      const piece = pieceOf(i);
      return piece ? classifyPiece(piece) : undefined;
    })();
    const why = key.startsWith('declared:') ? `The registry declares it from «${label}».` : `It answers a ${MIRZA_ABDOLLAH_RADIF.name} reference.`;
    if (i.materialId === target) {
      push({ id, itemId: i.id, field: 'source', state: 'correct', before, after, choices: [], evidence: why });
    } else if (reading?.family === 'composed-chaharpareh' || reading?.family === 'radif-reng') {
      push({ id, itemId: i.id, field: 'source', state: 'exception', before, choices: [{ label: 'Use this study source', after }], evidence: `${why} ${reading.why}` });
    } else if (i.materialId) {
      const current = db.materials.find((m) => m.id === i.materialId);
      push({
        id,
        itemId: i.id,
        field: 'source',
        state: 'exception',
        before,
        choices: [{ label: 'Use this study source instead', after }],
        evidence: `${why} You set «${current?.title ?? 'another source'}»; that stays unless you choose.`,
      });
    } else {
      push({ id, itemId: i.id, field: 'source', state: 'proposed', before, after, choices: [], evidence: why });
    }
  }

  // --- 6. CLASSES: the shared relation; only an owner's unlink is a question -
  const associated = new Set(lessonAssociations(db).map((a) => `${a.lessonId}\u0000${a.itemId}`));
  for (const i of items) {
    if (!i.source) continue;
    for (const lesson of db.lessons) {
      if (associated.has(`${lesson.id}\u0000${i.id}`)) continue;
      const m = sessionMembership(db, lesson, i);
      if (!m) continue;
      const unlinked = archiveFor(db, m.archiveId)?.suppressions.some((x) => x.kind === 'link' && x.ref === m.link && x.itemId === undefined);
      if (!unlinked) continue;
      push({
        id: `class:${i.id}:${lesson.id}`,
        itemId: i.id,
        field: 'class',
        state: 'exception',
        before: { linked: false },
        choices: [{ label: `Link class ${lesson.number ?? m.sessionN} again`, after: { linked: true } }],
        evidence: `Class ${lesson.number ?? m.sessionN} (${lesson.date}) covered it; you unlinked it.`,
      });
    }
  }

  return { instrumentId, pathwayId: pathway?.id, pathways, materials, sourceGroups: [...groups.values()], proposals };
}

// --- applying the owner's selection ------------------------------------------

export interface SetupSelection {
  id: string;
  /** The value the owner SAW — the premise. */
  before: SetupValue;
  /** What they chose: the proposal's value or one of its choices. */
  after: SetupValue;
}

export type SetupOutcome =
  | { ok: true; db: PracticeDB; applied: string[] }
  | { ok: false; reason: string; stale: string[] };

const same = (a: unknown, b: unknown) => canonicalStringify(a) === canonicalStringify(b);

/**
 * Write EXACTLY the selected ids and fields, in one new database — or refuse
 * all of it. Each selection is re-checked against a fresh plan of the
 * database as it is NOW: its row must still be shown, its `before` must still
 * be what is there, and its `after` must be one the review offered. A
 * selection already in place is done, not stale, so a retry after a refused
 * write is a no-op rather than an error. Returns the SAME object when nothing
 * changes. Never touches notes, blocks, reviews, dates, ratings, counters,
 * attachments, unselected fields or another instrument.
 */
export function applySetarSetup(db: PracticeDB, ctx: SetupContext, selections: SetupSelection[], now: Date): SetupOutcome {
  const plan = planSetarSetup(db, ctx);
  const byId = new Map(plan.proposals.map((p) => [p.id, p]));
  const stale: string[] = [];
  const todo: { p: SetupProposal; after: SetupValue }[] = [];
  for (const sel of selections) {
    const p = byId.get(sel.id);
    const offered = p ? [...(p.after && p.state === 'proposed' ? [p.after] : []), ...p.choices.map((c) => c.after)] : [];
    if (p && p.state === 'correct' && same(p.before, sel.after)) continue; // already done
    if (!p || !same(p.before, sel.before) || !offered.some((a) => same(a, sel.after))) {
      stale.push(sel.id);
      continue;
    }
    todo.push({ p, after: sel.after });
  }
  if (stale.length) {
    return { ok: false, reason: 'Something you selected has changed since the review was shown. Look again.', stale };
  }
  if (!todo.length) return { ok: true, db, applied: [] };

  let materials = db.materials;
  const created = new Map<string, ID>();
  const materialFor = (target: ID): ID => {
    if (!target.startsWith('new:')) return target;
    const key = target.slice('new:'.length);
    if (!created.has(key)) {
      const group = plan.sourceGroups.find((g) => g.key === key)!;
      const m = createMaterial(
        { instrumentId: ctx.instrumentId, title: group.label, sourceType: group.kind === 'reference' ? 'radif' : 'other' },
        now,
      );
      materials = [...materials, m];
      created.set(key, m.id);
    }
    return created.get(key)!;
  };

  const patch = new Map<ID, Partial<PracticeItem>>();
  const add = (id: ID, fields: Partial<PracticeItem>) => patch.set(id, { ...patch.get(id), ...fields });
  const relink: { archiveId: ID; ref: string }[] = [];
  const refLinks: { itemId: ID; ref: string }[] = [];
  for (const { p, after } of todo) {
    const item = db.items.find((i) => i.id === p.itemId)!;
    if ('status' in after) add(item.id, { status: after.status });
    else if ('itemType' in after) {
      add(item.id, {
        itemType: after.itemType,
        ...(after.gusheh !== null && after.gusheh !== (item.persian?.gusheh ?? null) ? { persian: { ...item.persian, gusheh: after.gusheh } } : {}),
      });
    } else if ('stageId' in after) add(item.id, { stageId: after.stageId ?? undefined });
    else if ('materialId' in after) add(item.id, { materialId: after.materialId ? materialFor(after.materialId) : undefined });
    else if ('catalogRefs' in after) {
      const ref = (after.catalogRefs ?? []).find((r) => !(item.catalogRefs ?? []).includes(r));
      if (ref) refLinks.push({ itemId: item.id, ref });
    } else if ('linked' in after) {
      const lesson = db.lessons.find((l) => l.id === p.id.split(':')[2]);
      const m = lesson ? sessionMembership(db, lesson, item) : null;
      if (m) relink.push({ archiveId: m.archiveId, ref: m.link });
    }
  }

  const at = nowISO(now);
  let items = db.items.map((i) => (patch.has(i.id) ? { ...i, ...patch.get(i.id), updatedAt: at } : i));
  // Placement settles undecided legacy evidence exactly as the stage control does.
  const settled = settleLegacyEvidence(db, items, now);
  if (!settled.ok) return { ok: false, reason: settled.reason, stale: [] };
  items = settled.items;
  for (const { itemId, ref } of refLinks) {
    const linked = planLinkReference({ ...db, items }, ref, itemId, ctx.instrumentId, now);
    if (!linked.ok) return { ok: false, reason: linked.reason, stale: [] };
    items = linked.items;
  }
  const archiveSources = relink.length
    ? db.archiveSources.map((s) => ({
        ...s,
        suppressions: s.suppressions.filter(
          (x) => !relink.some((r) => r.archiveId === s.id && x.kind === 'link' && x.ref === r.ref && x.itemId === undefined),
        ),
      }))
    : db.archiveSources;
  return { ok: true, db: { ...db, items, materials, archiveSources }, applied: todo.map((t) => t.p.id) };
}
