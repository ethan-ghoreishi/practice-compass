import type {
  CatalogEntry,
  ID,
  Pathway,
  PathwayRoutine,
  PathwayStage,
  PracticeDB,
  PracticeItem,
  StepStrand,
} from './types';
import { catalogForStage, knownReference, pathwayReferenceIds } from './pathwaySeed';
import {
  catalogReferenceId,
  itemReferences,
  legacyReferenceOf,
  planCatalogAddition,
  resolveCatalogReference,
  type CatalogAddition,
  type CatalogAdditionDB,
} from './courseSeed';
import { nowISO } from './util';

// ---------------------------------------------------------------------------
// A pathway is a *view over your items*: a stage contains the items you've
// placed in it, laid over a reference catalog of known gushes / lessons you can
// add with one tap. There is no separate "step" object — the item is the unit.
//
// Which item a suggestion IS comes from ONE resolver (`resolveCatalogReference`)
// — bound by reference, never by where the item happens to sit — so every row,
// Add, progress figure, next suggestion and routine agree after a move, a
// detach, a deleted stage or a reload.
// ---------------------------------------------------------------------------

export type StageState = 'todo' | 'in_progress' | 'done';

const DONE_STATUSES = new Set(['integrated', 'performable', 'maintenance']);
const ACTIVE_STATUSES = new Set(['fragile', 'repairing', 'usable']);

/** Map an item's mastery status to a 3-state stage progress. */
export function itemStageState(item: PracticeItem): StageState {
  if (DONE_STATUSES.has(item.status)) return 'done';
  if (item.timesPractised > 0 || ACTIVE_STATUSES.has(item.status)) return 'in_progress';
  return 'todo';
}

/** A unit shown inside a stage: a catalog suggestion, your item, or both. */
export interface StageUnit {
  key: string;
  /** The suggestion's reference id — absent on an item that is no suggestion. */
  ref?: string;
  title: string;
  strand?: StepStrand;
  entry?: CatalogEntry; // the reference suggestion (if any)
  item?: PracticeItem; // your practice item (if added)
  /**
   * Two of the owner's items both answer to this suggestion (legacy
   * duplicates). Nothing is picked: both stay intact and visible, and the
   * owner links one explicitly.
   */
  candidates?: PracticeItem[];
  /**
   * An item PLACED in this stage that answers none of its suggestions
   * (`unlinkedInStage`). Shown as its own row, said to be unlinked, with a way
   * to link it — never merged into a suggestion on the strength of a title.
   */
  unlinked?: boolean;
  state: StageState;
}

/**
 * Whose items a stage resolves against, and which suggestions its pathway
 * hides. Optional so a caller with only items still gets the unhidden view.
 */
export interface StageContext {
  instrumentId?: ID;
  hidden?: ReadonlySet<string>;
}

/** The context a pathway gives its stages. */
export function pathwayStageContext(pathway: Pick<Pathway, 'instrumentId' | 'hiddenRefs'> | undefined): StageContext {
  return { instrumentId: pathway?.instrumentId || undefined, hidden: new Set(pathway?.hiddenRefs ?? []) };
}

export function stagesOfPathway(stages: PathwayStage[], pathwayId: string): PathwayStage[] {
  return stages.filter((s) => s.pathwayId === pathwayId).sort((a, b) => a.order - b.order);
}

export function itemsInStage(items: PracticeItem[], stageId: string): PracticeItem[] {
  return items.filter((i) => i.stageId === stageId);
}

function catalogUnit(stage: PathwayStage, e: CatalogEntry, items: PracticeItem[], ctx: StageContext): StageUnit {
  const ref = catalogReferenceId(stage.id, e.key);
  const r = resolveCatalogReference(ref, ctx.instrumentId, items);
  const item = r.status === 'bound' ? r.item : undefined;
  return {
    key: e.key,
    ref,
    title: item?.title ?? e.title,
    strand: e.strand,
    entry: e,
    item,
    ...(r.status === 'ambiguous' ? { candidates: r.candidates } : {}),
    state: item ? itemStageState(item) : 'todo',
  };
}

/**
 * The VISIBLE units of a stage: each suggestion the pathway has not hidden,
 * resolved to the owner's item where one is bound, then every item placed in
 * the stage that no suggestion accounts for. A hidden suggestion's bound item
 * still appears here when it is placed here — hiding is visibility of the
 * SUGGESTION, never of the owner's work.
 */
export function stageUnits(stage: PathwayStage, items: PracticeItem[], ctx: StageContext = {}): StageUnit[] {
  const units: StageUnit[] = [];
  const shown = new Set<string>();
  for (const e of catalogForStage(stage.id)) {
    if (ctx.hidden?.has(catalogReferenceId(stage.id, e.key))) continue;
    const unit = catalogUnit(stage, e, items, ctx);
    if (unit.item) shown.add(unit.item.id);
    units.push(unit);
  }
  const unlinked = new Set(unlinkedInStage(stage.id, items, ctx.instrumentId).map((i) => i.id));
  for (const it of itemsInStage(items, stage.id)) {
    if (shown.has(it.id)) continue;
    units.push({
      key: it.id,
      title: it.title,
      strand: it.strand,
      item: it,
      ...(unlinked.has(it.id) ? { unlinked: true } : {}),
      state: itemStageState(it),
    });
  }
  return units;
}

/**
 * The owner's items PLACED in a stage — on its pathway's instrument — that
 * answer none of the stage's suggestions, hidden ones included. Placing an item
 * is organisation and changes no identity, so such an item may well BE one of
 * the suggestions beside it; only the owner can say. It is the ONE list both
 * the stage rows (`unlinked`) and Add (`planStageAddition`) read, so a row can
 * never look unrelated while Add quietly mints a second item beside it.
 */
export function unlinkedInStage(stageId: ID, items: PracticeItem[], instrumentId?: ID): PracticeItem[] {
  const refs = new Set(catalogForStage(stageId).map((e) => catalogReferenceId(stageId, e.key)));
  if (!refs.size) return [];
  return items.filter(
    (i) =>
      i.stageId === stageId &&
      (!instrumentId || i.instrumentId === instrumentId) &&
      !itemReferences(i).some((r) => refs.has(r)),
  );
}

/**
 * ADD from a stage: `planCatalogAddition`, except that a suggestion nothing
 * answers yet is NOT created while items the owner placed in that stage answer
 * no suggestion — any of them may be this music, and a second item would be a
 * silent duplicate. The plan returns them as `placed` and writes nothing; the
 * owner links one (`planLinkReference`) or asks for a new item explicitly
 * (`separate`). A bound or ambiguous suggestion is decided exactly as before.
 */
export function planStageAddition(
  db: CatalogAdditionDB,
  stageId: ID,
  entryKey: string,
  entry: CatalogEntry | undefined,
  instrumentId: ID,
  now: Date,
  separate = false,
): CatalogAddition {
  if (!separate && resolveCatalogReference(catalogReferenceId(stageId, entryKey), instrumentId, db.items).status === 'absent') {
    const placed = unlinkedInStage(stageId, db.items, instrumentId);
    if (placed.length) return { items: db.items, materials: db.materials, itemId: '', created: false, placed };
  }
  return planCatalogAddition(db, stageId, entryKey, entry, instrumentId, now);
}

/** The suggestions this stage's pathway hides — listed so each can be restored. */
export function hiddenUnits(stage: PathwayStage, items: PracticeItem[], ctx: StageContext): StageUnit[] {
  if (!ctx.hidden?.size) return [];
  return catalogForStage(stage.id)
    .filter((e) => ctx.hidden!.has(catalogReferenceId(stage.id, e.key)))
    .map((e) => catalogUnit(stage, e, items, ctx));
}

export interface StageProgress {
  done: number;
  inProgress: number;
  total: number;
  addedItems: number;
  complete: boolean;
  started: boolean;
  percent: number;
}

/**
 * Progress over the units you can SEE. A hidden suggestion counts for nothing
 * — not as done and not as outstanding — and a stage with nothing in it is
 * never complete, so hiding can never manufacture mastery.
 */
export function stageProgress(units: StageUnit[]): StageProgress {
  const total = units.length;
  let done = 0;
  let inProgress = 0;
  let addedItems = 0;
  for (const u of units) {
    if (u.item) addedItems += 1;
    if (u.state === 'done') done += 1;
    else if (u.state === 'in_progress') inProgress += 1;
  }
  return {
    done,
    inProgress,
    total,
    addedItems,
    complete: total > 0 && done === total,
    started: done + inProgress > 0,
    percent: total ? Math.round((done / total) * 100) : 0,
  };
}

/**
 * Where the user is in a pathway. Teacher-led work jumps around, so a
 * user-pinned stage (`pinnedStageId`, from `Pathway.currentStageId`) always
 * wins while it still exists; the "first incomplete stage" is only the
 * fallback for linear paths.
 */
export function currentStage(
  stages: PathwayStage[],
  items: PracticeItem[],
  pathwayId: string,
  pinnedStageId?: string,
  ctx: StageContext = {},
): PathwayStage | null {
  const ordered = stagesOfPathway(stages, pathwayId);
  if (pinnedStageId) {
    const pinned = ordered.find((s) => s.id === pinnedStageId);
    if (pinned) return pinned;
  }
  for (const stage of ordered) {
    if (!stageProgress(stageUnits(stage, items, ctx)).complete) return stage;
  }
  return ordered[ordered.length - 1] ?? null;
}

/** The next unit to work on within a stage (an in-progress one, else first to-do). */
export function nextUnitInStage(stage: PathwayStage, items: PracticeItem[], ctx: StageContext = {}): StageUnit | null {
  const units = stageUnits(stage, items, ctx);
  return units.find((u) => u.state === 'in_progress') ?? units.find((u) => u.state === 'todo') ?? null;
}

export interface PathwayProgress {
  stagesComplete: number;
  stagesTotal: number;
  done: number;
  total: number;
}

export function pathwayProgress(
  stages: PathwayStage[],
  items: PracticeItem[],
  pathwayId: string,
  ctx: StageContext = {},
): PathwayProgress {
  const ordered = stagesOfPathway(stages, pathwayId);
  let stagesComplete = 0;
  let done = 0;
  let total = 0;
  for (const stage of ordered) {
    const sp = stageProgress(stageUnits(stage, items, ctx));
    done += sp.done;
    total += sp.total;
    if (sp.complete) stagesComplete += 1;
  }
  return { stagesComplete, stagesTotal: ordered.length, done, total };
}

export function routinesOfStage(routines: PathwayRoutine[], stageId: string): PathwayRoutine[] {
  return routines.filter((r) => r.stageId === stageId).sort((a, b) => a.order - b.order);
}

export function routinesOfPathway(routines: PathwayRoutine[], pathwayId: string): PathwayRoutine[] {
  return routines.filter((r) => r.pathwayId === pathwayId).sort((a, b) => a.order - b.order);
}

/** Group ordered stages by their optional `group` heading, preserving order. */
export function groupStages(stages: PathwayStage[]): { group: string | undefined; stages: PathwayStage[] }[] {
  const out: { group: string | undefined; stages: PathwayStage[] }[] = [];
  for (const stage of stages) {
    const last = out[out.length - 1];
    if (last && last.group === stage.group) last.stages.push(stage);
    else out.push({ group: stage.group, stages: [stage] });
  }
  return out;
}

// --- which route a screen follows ------------------------------------------------

const byOrderThenId = (a: Pathway, b: Pathway) => a.order - b.order || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/**
 * The pathways an instrument's screens follow, in ONE order: not archived,
 * that instrument's own, by `order` and then id (so two equal orders never
 * depend on array position). Today, both Session Plan derivations, Repertoire
 * and a pathway's own page all read this — never "the first that matches".
 */
export function visiblePathways(pathways: Pathway[], instrumentId: ID | undefined): Pathway[] {
  return pathways.filter((p) => !p.archived && (instrumentId === undefined || p.instrumentId === instrumentId)).sort(byOrderThenId);
}

/** The route an instrument's session follows: its first visible pathway. */
export function primaryPathway(pathways: Pathway[], instrumentId: ID): Pathway | undefined {
  return visiblePathways(pathways, instrumentId)[0];
}

/**
 * Where a pathway stands — its pinned stage when that stage still exists,
 * else the first incomplete — with the stage context its screens resolve in.
 */
export function pathwayPosition(
  db: Pick<PracticeDB, 'pathwayStages' | 'items'>,
  pathway: Pathway | undefined,
): { stage: PathwayStage | null; ctx: StageContext } {
  const ctx = pathwayStageContext(pathway);
  if (!pathway) return { stage: null, ctx };
  return { stage: currentStage(db.pathwayStages, db.items, pathway.id, pathway.currentStageId, ctx), ctx };
}

// --- the persisted binding: migration and validation ----------------------------

type Placement = Pick<PracticeDB, 'items' | 'pathwayStages' | 'pathways'>;

/**
 * Legacy evidence is honoured only where the app ever honoured it: in a stage
 * that exists, of a pathway on the item's OWN instrument (or a General one).
 * A Setar item left in a Guitar stage never showed as that stage's answer —
 * every stage row is scoped to its pathway's instrument — so binding it would
 * fabricate an identity the owner never saw.
 */
function legacyFits(db: Pick<PracticeDB, 'pathwayStages' | 'pathways'>, item: PracticeItem): boolean {
  const stage = item.stageId ? db.pathwayStages.find((s) => s.id === item.stageId) : undefined;
  const pathway = stage ? db.pathways.find((p) => p.id === stage.pathwayId) : undefined;
  return !!pathway && (!pathway.instrumentId || pathway.instrumentId === item.instrumentId);
}

/**
 * The v15 backfill: turn each legacy item's `stageId` + `catalogKey` into a
 * decided binding — but ONLY where that evidence names a shipped suggestion,
 * the item is the only one on its instrument naming it, no item on that
 * instrument is already bound to it, and the evidence FITS (`legacyFits`).
 * Anything else stays undecided and visible, exactly as the file had it;
 * nothing is chosen, merged or deleted. Reads no clock and no order: the same
 * database always binds the same way.
 */
export function bindLegacyReferences(db: Placement): PracticeItem[] {
  const items = db.items;
  const slot = (instrumentId: ID, ref: string) => `${instrumentId}\u0000${ref}`;
  const decided = new Set<string>();
  const legacy = new Map<string, number>();
  for (const i of items) {
    if (i.catalogRefs !== undefined) for (const r of i.catalogRefs) decided.add(slot(i.instrumentId, r));
    else {
      const ref = legacyReferenceOf(i);
      if (ref && knownReference(ref)) legacy.set(slot(i.instrumentId, ref), (legacy.get(slot(i.instrumentId, ref)) ?? 0) + 1);
    }
  }
  let changed = false;
  const next = items.map((i) => {
    if (i.catalogRefs !== undefined) return i;
    const ref = legacyReferenceOf(i);
    if (!ref || !knownReference(ref)) return i;
    const s = slot(i.instrumentId, ref);
    if (legacy.get(s) !== 1 || decided.has(s) || !legacyFits(db, i)) return i;
    changed = true;
    return { ...i, catalogRefs: [ref] };
  });
  return changed ? next : items;
}

/**
 * The v15 organisation fields at every inbound door: an item's bindings and a
 * pathway's hidden suggestions. Refused (never repaired) when a list is not a
 * list of text, names a suggestion this build does not ship, repeats itself,
 * binds two items on ONE instrument to one suggestion, or hides a suggestion
 * outside its own pathway. Undecided legacy evidence (`catalogRefs` absent) is
 * never refused.
 *
 * Nothing here reads an instrument's NAME. A name is the owner's editable text
 * (Settings renames on every keystroke), so a rule derived from it would let an
 * ordinary rename turn a valid database into one this device refuses to load.
 * Which instrument a suggestion is offered on is decided where a binding is
 * MADE — against the pathway's own `instrumentId` — never re-judged by name.
 */
export function validateReferences(db: Pick<PracticeDB, 'items' | 'pathways'>): string | null {
  const bound = new Map<string, ID>();
  for (const item of db.items) {
    const refs = (item as { catalogRefs?: unknown }).catalogRefs;
    if (refs === undefined) continue;
    if (!Array.isArray(refs) || refs.some((r) => typeof r !== 'string')) return `Item "${item.id}" has an unreadable reference list.`;
    if (new Set(refs).size !== refs.length) return `Item "${item.id}" names one suggestion twice.`;
    for (const ref of refs as string[]) {
      if (!knownReference(ref)) return `Item "${item.id}" is bound to a suggestion this app does not ship ("${ref}").`;
      const slot = `${item.instrumentId}\u0000${ref}`;
      const other = bound.get(slot);
      if (other) return `Two items ("${other}", "${item.id}") are bound to the same suggestion on one instrument ("${ref}").`;
      bound.set(slot, item.id);
    }
  }
  for (const p of db.pathways) {
    const hidden = (p as { hiddenRefs?: unknown }).hiddenRefs;
    if (hidden === undefined) continue;
    if (!Array.isArray(hidden) || hidden.some((r) => typeof r !== 'string')) return `Pathway "${p.id}" has an unreadable hidden list.`;
    if (new Set(hidden).size !== hidden.length) return `Pathway "${p.id}" hides one suggestion twice.`;
    const scope = pathwayReferenceIds(p.id);
    const stray = (hidden as string[]).find((r) => !scope.has(r));
    if (stray) return `Pathway "${p.id}" hides a suggestion it does not present ("${stray}").`;
  }
  return null;
}

/**
 * The same one-holder rule, said for the owner: the first suggestion two items
 * on one instrument would both answer. The store checks every local write that
 * can move a binding or an item's instrument against it BEFORE applying, so
 * nothing this device writes is something its own reload would refuse.
 */
export function bindingClash(items: PracticeItem[]): string | null {
  const bound = new Map<string, PracticeItem>();
  for (const item of items) {
    for (const ref of item.catalogRefs ?? []) {
      const slot = `${item.instrumentId}\u0000${ref}`;
      const other = bound.get(slot);
      if (other) {
        return `“${other.title}” and “${item.title}” would both answer the same suggestion on one instrument. Unlink one of them first.`;
      }
      bound.set(slot, item);
    }
  }
  return null;
}

// --- undecided legacy evidence: kept until the owner decides it --------------

function referenceTitle(item: PracticeItem): string {
  return (item.stageId && catalogForStage(item.stageId).find((e) => e.key === item.catalogKey)?.title) || item.title;
}

/**
 * What an UNDECIDED item's legacy evidence stands for right now, before a
 * write changes it:
 *
 *  - `bound`      it is the one fitting answer — keep it by deciding it;
 *  - `ambiguous`  it is one of several candidates — only the owner may choose;
 *  - `none`       nothing (decided already, no evidence, evidence overruled by
 *                 an explicit binding elsewhere, or evidence that never fit).
 */
function legacyStanding(db: Placement, item: PracticeItem): { status: 'bound' | 'ambiguous' | 'none'; ref?: string } {
  if (item.catalogRefs !== undefined) return { status: 'none' };
  const ref = legacyReferenceOf(item);
  if (!ref || !knownReference(ref)) return { status: 'none' };
  const r = resolveCatalogReference(ref, item.instrumentId, db.items);
  if (r.status === 'ambiguous' && r.candidates.some((c) => c.id === item.id)) return { status: 'ambiguous', ref };
  if (r.status === 'bound' && r.item.id === item.id && legacyFits(db, item)) return { status: 'bound', ref };
  return { status: 'none', ref };
}

function ambiguityRefusal(item: PracticeItem): string {
  return `“${item.title}” is one of several items that may answer “${referenceTitle(item)}”. Choose which one answers it on its stage first.`;
}

/**
 * THE ONE RULE for every write that changes where an undecided item's legacy
 * evidence points — a new stage, a new key, a new instrument, or no stage at
 * all (a deleted stage or pathway, Remove from pathway). Its evidence is the
 * only record of which suggestion it answered, so it is settled FIRST:
 *
 *  - the one fitting answer is decided (`catalogRefs: [ref]`), so the move
 *    loses nothing;
 *  - one of several candidates REFUSES the whole write: leaving would silently
 *    promote the other candidate, and only the owner may choose between them;
 *  - anything else is decided as answering nothing (`[]`), so the new
 *    placement can never quietly make it the answer to a different suggestion.
 *
 * `next` is the proposed item list (same ids); decided items pass untouched.
 */
export function settleLegacyEvidence(
  db: Placement,
  next: PracticeItem[],
  now: Date,
): { ok: true; items: PracticeItem[] } | { ok: false; reason: string } {
  const before = new Map(db.items.map((i) => [i.id, i]));
  let changed = false;
  const out: PracticeItem[] = [];
  for (const item of next) {
    const prior = before.get(item.id);
    if (!prior || prior.catalogRefs !== undefined || item.catalogRefs !== undefined) {
      out.push(item);
      continue;
    }
    const moved = legacyReferenceOf(prior) !== legacyReferenceOf(item) || prior.instrumentId !== item.instrumentId;
    const standing = legacyStanding(db, prior);
    if (!moved || (!standing.ref && !(legacyReferenceOf(item) && knownReference(legacyReferenceOf(item)!)))) {
      out.push(item);
      continue;
    }
    if (standing.status === 'ambiguous') return { ok: false, reason: ambiguityRefusal(prior) };
    changed = true;
    out.push(touchItem(item, { catalogRefs: standing.status === 'bound' ? [standing.ref!] : [] }, now));
  }
  return { ok: true, items: changed ? out : next };
}

/**
 * Whether `item` may BECOME the answer to `refId` on its own instrument: not
 * while another item already answers it — by a decided binding OR by its
 * undecided legacy evidence — and not while several candidates dispute it and
 * this item is not one of them. Either would silently overrule a record the
 * owner never chose against. Choosing one of the candidates is the explicit
 * choice, and is allowed.
 */
function claimRefusal(items: PracticeItem[], item: PracticeItem, refId: string): string | null {
  const r = resolveCatalogReference(refId, item.instrumentId, items);
  if (r.status === 'bound' && r.item.id !== item.id) return `“${r.item.title}” already answers this suggestion. Unlink it first.`;
  if (r.status === 'ambiguous' && !r.candidates.some((c) => c.id === item.id)) {
    return `${r.candidates.length} of your items may already answer this suggestion. Choose one of them instead.`;
  }
  return null;
}

/**
 * The same rule over a whole proposed item list — for a write (an item moved to
 * another instrument) that brings decided bindings somewhere new: each binding
 * an item did not already answer ON THAT INSTRUMENT must be free to claim there.
 */
export function legacyClaimRefusal(db: Pick<PracticeDB, 'items'>, next: PracticeItem[]): string | null {
  const before = new Map(db.items.map((i) => [i.id, i]));
  for (const item of next) {
    const prior = before.get(item.id);
    if (prior === item || !item.catalogRefs?.length) continue;
    const had = new Set(prior && prior.instrumentId === item.instrumentId ? itemReferences(prior) : []);
    for (const ref of item.catalogRefs) {
      if (had.has(ref)) continue;
      const claim = claimRefusal(db.items, item, ref);
      if (claim) return claim;
    }
  }
  return null;
}

// --- reversible organisation (pure planners; the store applies each in one set) --

export type OrganisePlan = { ok: true; items: PracticeItem[] } | { ok: false; reason: string };

function touchItem(item: PracticeItem, patch: Partial<PracticeItem>, now: Date): PracticeItem {
  return { ...item, ...patch, updatedAt: nowISO(now) };
}

/**
 * LINK EXISTING: make one of the owner's items the answer to a suggestion.
 * Only an item on the SAME instrument as the pathway — Setar work is never
 * reused for Tar — and only when no other item on that instrument is already
 * bound to it. Nothing else about the item changes, and the item may already
 * answer other suggestions: several references may deliberately name one item.
 *
 * An undecided item keeps its OWN legacy answer when that answer is uniquely
 * its; while it is one of several candidates for another suggestion, linking it
 * elsewhere is refused — deciding it would silently hand that other suggestion
 * to the remaining candidate. Choosing it for the disputed suggestion itself is
 * exactly the explicit choice, and is allowed.
 */
export function planLinkReference(
  db: Placement,
  refId: string,
  itemId: ID,
  instrumentId: ID | undefined,
  now: Date,
): OrganisePlan {
  const items = db.items;
  const item = items.find((i) => i.id === itemId);
  if (!item) return { ok: false, reason: 'That item no longer exists.' };
  if (instrumentId && item.instrumentId !== instrumentId) {
    return { ok: false, reason: 'That item belongs to another instrument. Practice on one instrument is never counted for another.' };
  }
  if (item.catalogRefs?.includes(refId)) return { ok: true, items };
  const claim = claimRefusal(items, item, refId);
  if (claim) return { ok: false, reason: claim };
  const standing = legacyStanding(db, item);
  if (standing.status === 'ambiguous' && standing.ref !== refId) return { ok: false, reason: ambiguityRefusal(item) };
  const base = item.catalogRefs ?? (standing.status === 'bound' && standing.ref !== refId ? [standing.ref!] : []);
  return { ok: true, items: items.map((i) => (i.id === itemId ? touchItem(i, { catalogRefs: [...base, refId] }, now) : i)) };
}

/**
 * UNLINK REFERENCE: the item stops answering one suggestion, which reads as a
 * suggestion again. The item keeps everything else — notes, history, files,
 * links, placement. The decided (possibly empty) list is kept, so old
 * placement evidence can never re-bind it on the next load. Unlinking one
 * candidate from a disputed suggestion is itself the owner's explicit choice.
 */
export function planUnlinkReference(items: PracticeItem[], itemId: ID, refId: string, now: Date): OrganisePlan {
  const item = items.find((i) => i.id === itemId);
  if (!item) return { ok: false, reason: 'That item no longer exists.' };
  const refs = item.catalogRefs ?? (legacyReferenceOf(item) ? [legacyReferenceOf(item)!] : []);
  if (!refs.includes(refId)) return { ok: true, items };
  return {
    ok: true,
    items: items.map((i) => (i.id === itemId ? touchItem(i, { catalogRefs: refs.filter((r) => r !== refId) }, now) : i)),
  };
}

/**
 * REMOVE FROM PATHWAY: the item leaves every stage of this pathway, and the
 * suggestions it answers there are HIDDEN in this pathway. It is NOT deleted
 * and NOT unbound — it stays in My repertoire and All practice items with every
 * note, file, lesson, question, routine segment, part, review and block it had,
 * even when it was never practised. Its binding is kept on purpose: a radif
 * reference is shared by the mixed Setar pathway and the named reference
 * pathway, so unbinding it here would make the OTHER pathway offer the same
 * music as untaken, and Add there would mint a duplicate. Restoring the hidden
 * suggestion shows the same item again; Unlink is the one action that changes
 * identity; Delete practice item stays its own explicit action. An undecided
 * item's legacy evidence is settled first (`settleLegacyEvidence`).
 */
export function planRemoveFromPathway(
  db: Placement,
  itemId: ID,
  pathwayId: ID,
  now: Date,
): { ok: true; items: PracticeItem[]; pathways: Pathway[] } | { ok: false; reason: string } {
  const item = db.items.find((i) => i.id === itemId);
  const pathway = db.pathways.find((p) => p.id === pathwayId);
  if (!item || !pathway) return { ok: false, reason: 'That item or pathway no longer exists.' };
  const stageIds = new Set(db.pathwayStages.filter((s) => s.pathwayId === pathwayId).map((s) => s.id));
  const scope = pathwayReferenceIds(pathwayId);
  const leavesStage = !!item.stageId && stageIds.has(item.stageId);
  // The references the item ANSWERS: its decided binding, or — for an item
  // whose legacy evidence the resolver alone vouches for — that one, decided
  // now so leaving the stage cannot also lose it.
  const standing = legacyStanding(db, item);
  if (standing.status === 'ambiguous') {
    return leavesStage ? { ok: false, reason: ambiguityRefusal(item) } : { ok: true, items: db.items, pathways: db.pathways };
  }
  const decided = item.catalogRefs ?? (standing.status === 'bound' ? [standing.ref!] : undefined);
  const toHide = (decided ?? []).filter((r) => scope.has(r) && !(pathway.hiddenRefs ?? []).includes(r));
  const decides = decided !== undefined && item.catalogRefs === undefined;
  if (!leavesStage && !toHide.length && !decides) return { ok: true, items: db.items, pathways: db.pathways };
  let items = db.items;
  if (leavesStage || decides) {
    const moved = db.items.map((i) =>
      i.id === itemId ? touchItem(i, { ...(leavesStage ? { stageId: undefined } : {}), ...(decides ? { catalogRefs: decided } : {}) }, now) : i,
    );
    const settled = settleLegacyEvidence(db, moved, now);
    if (!settled.ok) return settled;
    items = settled.items;
  }
  const pathways = toHide.length
    ? db.pathways.map((p) => (p.id === pathwayId ? { ...p, hiddenRefs: [...(p.hiddenRefs ?? []), ...toHide], updatedAt: nowISO(now) } : p))
    : db.pathways;
  return { ok: true, items, pathways };
}

/**
 * HIDE / RESTORE one suggestion in one pathway. Only the pathway's own list
 * moves: no item is hidden, unplaced, unbound or completed by it.
 */
export function planSetReferenceHidden(
  pathways: Pathway[],
  pathwayId: ID,
  refId: string,
  hidden: boolean,
  now: Date,
): { ok: true; pathways: Pathway[] } | { ok: false; reason: string } {
  const p = pathways.find((x) => x.id === pathwayId);
  if (!p) return { ok: false, reason: 'That pathway no longer exists.' };
  if (!pathwayReferenceIds(pathwayId).has(refId)) return { ok: false, reason: 'This pathway does not present that suggestion.' };
  const current = p.hiddenRefs ?? [];
  if (hidden === current.includes(refId)) return { ok: true, pathways };
  const next = hidden ? [...current, refId] : current.filter((r) => r !== refId);
  return {
    ok: true,
    pathways: pathways.map((x) => (x.id === pathwayId ? { ...x, hiddenRefs: next, updatedAt: nowISO(now) } : x)),
  };
}

/** Items on one instrument that could be linked to a suggestion, closest first. */
export function linkCandidates(items: PracticeItem[], instrumentId: ID | undefined, title: string): PracticeItem[] {
  const norm = (s: string) => s.trim().toLowerCase();
  const scoped = items.filter((i) => !instrumentId || i.instrumentId === instrumentId);
  const same = scoped.filter((i) => norm(i.title) === norm(title));
  const rest = scoped.filter((i) => norm(i.title) !== norm(title)).sort((a, b) => a.title.localeCompare(b.title));
  return [...same, ...rest];
}
