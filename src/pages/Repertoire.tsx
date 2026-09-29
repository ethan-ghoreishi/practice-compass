import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  archiveSearchAliases,
  browseParams,
  clearBrowseFilters,
  discoverRepertoire,
  groupBlocksByItem,
  hasBrowseFilters,
  isDue,
  itemMatchesSearch,
  ITEM_STATUS_LABELS,
  ITEM_STATUS_ORDER,
  ITEM_TYPE_LABELS,
  neglectedScore,
  offeredDefaultPathways,
  overworkedItems,
  pathwayPosition,
  pathwayProgress,
  pathwaysForInstrumentFilter,
  readBrowseState,
  repertoireSearchTexts,
  scoreItems,
  stageProgress,
  stageUnits,
  unclassifiedLabel,
  valueLabel,
  visiblePathways,
  vocabulary,
  itemsWithOpenQuestion,
  preparationDatesByItem,
  type BrowseState,
  type DiscoveredWork,
  type FacetField,
  type ItemStatus,
  type ItemType,
  type Pathway as PathwayT,
  type RepertoireGroupParam,
  type RepertoireView,
  type Vocabulary,
} from '../domain';
import { useStore } from '../store/useStore';
import { instrumentName } from '../store/lookups';
import ItemCard from '../components/ItemCard';
import QuickAdd from '../components/QuickAdd';
import { Field, StatusBadge } from '../components/ui';
import { recordToOptions } from '../components/options';
import { relativeFromDateTime } from '../components/format';
import { ChevronRightIcon, ItemsIcon, PathIcon, PlusIcon } from '../components/icons';
import { EmptyState } from '../components/ui';

type DB = ReturnType<typeof useStore.getState>['db'];

type Quick = 'due' | 'lesson' | 'fragile' | 'neglected' | 'overworked' | 'teacher';

const QUICK: { key: Quick; label: string }[] = [
  { key: 'due', label: 'Due today' },
  { key: 'lesson', label: 'For class' },
  { key: 'fragile', label: 'Fragile' },
  { key: 'neglected', label: 'Neglected' },
  { key: 'overworked', label: 'Overworked' },
  { key: 'teacher', label: 'Teacher Q' },
];

const TYPE_OPTIONS = recordToOptions(ITEM_TYPE_LABELS);

const VIEWS: { key: RepertoireView; label: string }[] = [
  { key: 'works', label: 'My repertoire' },
  { key: 'paths', label: 'Pathways' },
  // "Practice list" is the view's canonical name: every practice item.
  { key: 'all', label: 'Practice list' },
];

/**
 * ONE browse context for the three peer views, held in the URL: view,
 * instrument, query and filters survive opening an item and coming back, and
 * browser back/forward walk through them. Opening an instrument here never
 * changes the instrument Today is practising.
 */
function useBrowseState(): [BrowseState, (next: BrowseState, opts?: { replace?: boolean }) => void, string] {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const db = useStore((s) => s.db);
  const sessionInstrumentId = useStore((s) => s.sessionInstrumentId);
  const active = db.instruments.filter((i) => i.active);
  const state = readBrowseState(params, active, sessionInstrumentId, {
    statuses: ITEM_STATUS_ORDER,
    types: Object.keys(ITEM_TYPE_LABELS),
    quick: QUICK.map((q) => q.key),
  });
  const update = (next: BrowseState, opts?: { replace?: boolean }) =>
    setParams(browseParams(next), { replace: opts?.replace ?? false });
  return [state, update, `${location.pathname}?${browseParams(state).toString()}`];
}

export default function Repertoire() {
  const db = useStore((s) => s.db);
  const [state, update, here] = useBrowseState();
  const active = db.instruments.filter((i) => i.active);

  // The one primary action: add a practice item — on the instrument being
  // browsed, and in the form being browsed, when there is one.
  const addParams = new URLSearchParams();
  if (state.instrumentId) addParams.set('instrument', state.instrumentId);
  if (state.form?.startsWith('term:')) addParams.set('form', state.form.slice('term:'.length));
  const addHref = `/items/new${addParams.toString() ? `?${addParams}` : ''}`;

  return (
    <div className="stack-lg">
      <header className="stack-sm">
        <div className="row between" style={{ flexWrap: 'wrap', rowGap: 8 }}>
          <h1 className="page-title">Repertoire</h1>
          <Link to={addHref} state={{ from: here }} className="btn btn-primary">
            <PlusIcon /> Add practice item
          </Link>
        </div>
        <nav className="row-wrap tiny" aria-label="Repertoire tools" style={{ gap: 14 }}>
          {/* The browsed instrument travels with it: a new source starts there. */}
          <Link to={state.instrumentId ? `/materials?instrument=${encodeURIComponent(state.instrumentId)}` : '/materials'} state={{ from: here }} className="link">
            Study sources
          </Link>
          <Link to="/terms" state={{ from: here }} className="link">
            Musical terms
          </Link>
        </nav>
        <div className="options" role="group" aria-label="Repertoire view">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              className={`option${state.view === v.key ? ' selected' : ''}`}
              aria-pressed={state.view === v.key}
              onClick={() => update({ ...state, view: v.key })}
            >
              {v.label}
            </button>
          ))}
        </div>
        {active.length > 1 && (
          <div className="options" role="group" aria-label="Instrument">
            <button
              className={`option${!state.instrumentId ? ' selected' : ''}`}
              aria-pressed={!state.instrumentId}
              onClick={() => update({ ...clearBrowseFilters(state), q: state.q, instrumentId: '' })}
            >
              All
            </button>
            {active.map((i) => (
              <button
                key={i.id}
                className={`option${state.instrumentId === i.id ? ' selected' : ''}`}
                aria-pressed={state.instrumentId === i.id}
                onClick={() => update({ ...clearBrowseFilters(state), q: state.q, instrumentId: i.id })}
              >
                <span dir="auto">{i.name}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      {state.view === 'works' ? (
        <MyRepertoireView db={db} state={state} update={update} here={here} />
      ) : state.view === 'paths' ? (
        <PathwaysView db={db} state={state} here={here} />
      ) : (
        <AllItemsView db={db} state={state} update={update} here={here} />
      )}
    </div>
  );
}

// --- the shared search box -----------------------------------------------------

function SearchBox({
  label,
  placeholder,
  state,
  update,
}: {
  label: string;
  placeholder: string;
  state: BrowseState;
  update: (n: BrowseState, o?: { replace?: boolean }) => void;
}) {
  return (
    <input
      className="input"
      type="search"
      dir="auto"
      aria-label={label}
      placeholder={placeholder}
      value={state.q}
      onChange={(e) => update({ ...state, q: e.target.value }, { replace: true })}
    />
  );
}

function ClearFilters({ state, update }: { state: BrowseState; update: (n: BrowseState) => void }) {
  if (!hasBrowseFilters(state)) return null;
  return (
    <button className="btn btn-ghost btn-sm" style={{ width: 'fit-content' }} onClick={() => update(clearBrowseFilters(state))}>
      Clear filters
    </button>
  );
}

// --- My repertoire: the works you actually play -------------------------------
//
// A LENS over ordinary practice items (domain/repertoire.ts) — never a
// parallel database. Every eligible work appears exactly once: parts stay
// under their parent (a matching part shows its parent), and a work nobody has
// classified yet sits under "No dastgāh yet" instead of vanishing. Facets come
// only from the owner's own works.

const FACET_LABELS: Record<FacetField, string> = {
  dastgah: 'Dastgāh / Āvāz',
  form: 'Form',
  composer: 'Composer / maestro',
};

const GROUP_LABELS: Record<RepertoireGroupParam, string> = {
  dastgah: 'Dastgāh / Āvāz',
  form: 'Form',
  composer: 'Composer / maestro',
  source: 'Study source',
};

function MyRepertoireView({
  db,
  state,
  update,
  here,
}: {
  db: DB;
  state: BrowseState;
  update: (n: BrowseState, o?: { replace?: boolean }) => void;
  here: string;
}) {
  const now = useMemo(() => new Date(), []);
  const vocab = useMemo(() => vocabulary(db.musicTerms), [db.musicTerms]);
  const aliases = useMemo(() => archiveSearchAliases(db), [db]);
  const found = useMemo(
    () =>
      discoverRepertoire(
        db,
        {
          text: state.q,
          instrumentId: state.instrumentId,
          dastgah: state.dastgah,
          form: state.form,
          composer: state.composer,
          groupBy: state.group,
        },
        aliases,
      ),
    [db, state, aliases],
  );

  return (
    <div className="stack">
      <div className="stack-sm">
        <SearchBox label="Search my repertoire" placeholder="Search by title, dastgāh, form, maestro, source…" state={state} update={update} />
        <div className="grid-2">
          {(['dastgah', 'form', 'composer'] as FacetField[]).map((facet) =>
            found.facets[facet].length > 0 ? (
              <Field key={facet} label={FACET_LABELS[facet]}>
                <select
                  className="select"
                  aria-label={FACET_LABELS[facet]}
                  value={found.applied[facet] ?? ''}
                  onChange={(e) => update({ ...state, [facet]: e.target.value || undefined })}
                >
                  <option value="">Any</option>
                  {found.facets[facet].map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.label} ({o.count})
                    </option>
                  ))}
                </select>
              </Field>
            ) : null,
          )}
          <Field label="Group by">
            <select
              className="select"
              aria-label="Group by"
              value={state.group ?? ''}
              onChange={(e) => update({ ...state, group: (e.target.value || undefined) as RepertoireGroupParam | undefined })}
            >
              <option value="">Dastgāh or source</option>
              {(Object.keys(GROUP_LABELS) as RepertoireGroupParam[]).map((g) => (
                <option key={g} value={g}>
                  {GROUP_LABELS[g]}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <ClearFilters state={state} update={update} />
      </div>

      {found.scopeCount === 0 ? (
        <div className="card">
          <EmptyState icon={<ItemsIcon />} title="No works here yet">
            Add a gusheh or a composed piece — or any full piece — and it appears here. Technique drills stay in All
            practice items.
          </EmptyState>
        </div>
      ) : found.matchCount === 0 ? (
        <div className="card" role="status">
          <EmptyState icon={<ItemsIcon />} title="No works match">
            Nothing in your repertoire matches this search and these filters. Clear filters to see everything again.
          </EmptyState>
        </div>
      ) : (
        <p className="tiny faint" role="status" style={{ margin: 0 }}>
          {found.matchCount === found.scopeCount
            ? `${found.scopeCount} work${found.scopeCount === 1 ? '' : 's'}`
            : `${found.matchCount} of ${found.scopeCount} works`}
        </p>
      )}

      {found.groups.map((g) => (
        <section key={g.key} className="stack-sm" dir="auto">
          <div className="row between">
            <h2 className="title-md">{g.unclassified ? unclassifiedLabel(g.grouping) : g.label}</h2>
            {/* Generated English metadata, never user text. */}
            <span className="tiny faint" dir="ltr">
              {g.works.length} work{g.works.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="card card-flush list">
            {g.works.map((w) => (
              <WorkRow key={w.work.id} entry={w} db={db} vocab={vocab} now={now} here={here} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function WorkRow({
  entry,
  db,
  vocab,
  now,
  here,
}: {
  entry: DiscoveredWork;
  db: DB;
  vocab: Vocabulary;
  now: Date;
  here: string;
}) {
  const { work, parts, matchedParts } = entry;
  const [open, setOpen] = useState(false);
  const form = valueLabel(work.persian?.form, vocab);
  const composer = valueLabel(work.persian?.composer, vocab);
  const showParts = open || matchedParts.length > 0;
  return (
    <div className="list-row" style={{ flexWrap: 'wrap' }}>
      <Link to={`/items/${work.id}`} state={{ from: here }} className="grow row" style={{ minWidth: 0, gap: 10 }}>
        <div className="grow" dir="auto" style={{ minWidth: 0 }}>
          <div className="row-title">{work.title}</div>
          {/* form/composer/gusheh and the instrument name are each authored
              independently of the title (their own dir="auto" isolates); the
              last-practised phrase is generated metadata (dir="ltr"). */}
          <div className="tiny faint">
            {[
              form ? <span dir="auto">{form}</span> : null,
              composer ? <span dir="auto">{composer}</span> : null,
              work.persian?.gusheh ? (
                <span>
                  gusheh: <span dir="auto">{work.persian.gusheh}</span>
                </span>
              ) : null,
              <span dir="auto">{instrumentName(db, work.instrumentId)}</span>,
              <span dir="ltr">
                {work.lastPractisedAt ? `last ${relativeFromDateTime(work.lastPractisedAt, now)}` : 'not practised yet'}
              </span>,
            ]
              .filter(Boolean)
              .map((node, i) => (
                // Each piece stays whole (in an RTL row a wrapped "last
                // yesterday" otherwise lands on two lines in reverse); the
                // separator stays OUTSIDE it, so the line can still break
                // between pieces instead of overflowing.
                <span key={i}>
                  {i > 0 ? ' · ' : ''}
                  <span style={{ whiteSpace: 'nowrap' }}>{node}</span>
                </span>
              ))}
          </div>
        </div>
        <StatusBadge status={work.status} />
      </Link>
      {parts.length > 0 && (
        <>
          <button
            className="btn btn-ghost btn-sm"
            style={{ flex: 'none' }}
            aria-expanded={showParts}
            onClick={() => setOpen((o) => !o)}
          >
            {showParts ? 'Hide parts' : `${parts.length} part${parts.length === 1 ? '' : 's'}`}
          </button>
          {showParts && (
            <div className="stack-sm" style={{ width: '100%', paddingInlineStart: 14, marginTop: 6 }}>
              {(open ? parts : matchedParts).map((p) => (
                <Link key={p.id} to={`/items/${p.id}`} state={{ from: here }} className="row between small card-link" dir="auto" style={{ minWidth: 0 }}>
                  <span className="dim">{p.title}</span>
                  <StatusBadge status={p.status} />
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// --- Pathways ------------------------------------------------------------------

function PathwaysView({ db, state, here }: { db: DB; state: BrowseState; here: string }) {
  const addPathway = useStore((s) => s.addPathway);
  const updatePathway = useStore((s) => s.updatePathway);
  const reseedDefaultPathways = useStore((s) => s.reseedDefaultPathways);
  const navigate = useNavigate();

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [instrumentId, setInstrumentId] = useState(state.instrumentId || db.instruments[0]?.id || '');

  // The SAME ordered, archive-aware list every other screen follows; General
  // pathways only in the every-instrument view.
  const scoped = useMemo(() => pathwaysForInstrumentFilter(db.pathways, state.instrumentId), [db.pathways, state.instrumentId]);
  const pathways = visiblePathways(scoped, undefined);
  const archived = scoped.filter((p) => p.archived);
  const offeredDefaults = useMemo(
    () =>
      pathwaysForInstrumentFilter(
        offeredDefaultPathways({ instruments: db.instruments, pathways: db.pathways }, new Date()),
        state.instrumentId,
      ),
    [db.instruments, db.pathways, state.instrumentId],
  );

  function create() {
    if (!name.trim()) return;
    const id = addPathway({ name, instrumentId: instrumentId || undefined });
    setName('');
    setCreating(false);
    navigate(`/pathway/${id}`, { state: { from: here } });
  }

  return (
    <div className="stack">
      <p className="page-sub" style={{ margin: 0 }}>
        Routes you trust, laid over your own items. A suggestion becomes yours with one tap — and never twice.
      </p>

      {pathways.map((p) => (
        <PathwayCard key={p.id} pathway={p} db={db} onOpen={() => navigate(`/pathway/${p.id}`, { state: { from: here } })} />
      ))}
      {pathways.length === 0 && (
        <div className="card">
          <EmptyState icon={<PathIcon />} title="No pathways here">
            Add one of the shipped pathways below, or make your own.
          </EmptyState>
        </div>
      )}

      {creating ? (
        <div className="card stack-sm">
          <Field label="Name">
            <input className="input" dir="auto" autoFocus placeholder="e.g. Tar · my teacher's plan" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Instrument">
            <select className="select" value={instrumentId} onChange={(e) => setInstrumentId(e.target.value)}>
              <option value="">General</option>
              {db.instruments.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="row">
            <button className="btn btn-primary grow" disabled={!name.trim()} onClick={create}>
              Create pathway
            </button>
            <button className="btn" onClick={() => setCreating(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="row-wrap">
          <button className="btn btn-sm" onClick={() => setCreating(true)}>
            <PlusIcon /> New pathway
          </button>
          {offeredDefaults.map((p) => (
            <button key={p.id} className="btn btn-sm" onClick={() => reseedDefaultPathways([p.id])}>
              Add default pathway: <span dir="auto">{p.name}</span>
            </button>
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <details className="card card-quiet">
          <summary className="small">
            Archived pathways ({archived.length})
          </summary>
          <div className="stack-sm" style={{ marginTop: 10 }}>
            {archived.map((p) => (
              <div key={p.id} className="row between" style={{ gap: 8 }}>
                <span className="small" dir="auto">
                  {p.name}
                </span>
                <button className="btn btn-sm" onClick={() => updatePathway(p.id, { archived: false })} aria-label={`Restore ${p.name}`}>
                  Restore
                </button>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function PathwayCard({ pathway, db, onOpen }: { pathway: PathwayT; db: DB; onOpen: () => void }) {
  // The pinned stage when it still exists — the same position Today and the
  // Session Plan follow — then progress over the same visible units.
  const { stage, ctx } = pathwayPosition(db, pathway);
  const prog = pathwayProgress(db.pathwayStages, db.items, pathway.id, ctx);
  const sp = stage ? stageProgress(stageUnits(stage, db.items, ctx)) : null;

  return (
    <button className="card card-link stack-sm" style={{ width: '100%', textAlign: 'left' }} onClick={onOpen}>
      {/* The name and its caption are ONE group carrying the direction, with
          textAlign re-declared as 'start' because the button pins 'left'. */}
      <div className="stack-sm" dir="auto" style={{ textAlign: 'start', minWidth: 0 }}>
        <div className="row between">
          <div className="row" style={{ gap: 8, minWidth: 0 }}>
            <PathIcon width={16} height={16} style={{ color: 'var(--accent)', flex: 'none' }} />
            <span className="title-md">{pathway.name}</span>
          </div>
          <ChevronRightIcon width={16} height={16} className="faint" style={{ flex: 'none' }} />
        </div>
        <div className="tiny faint">
          <span dir="auto">{pathway.instrumentId ? instrumentName(db, pathway.instrumentId) : 'General'}</span>
          {stage
            ? ` · now: ${stage.code}${stage.title !== stage.code ? ` — ${stage.title}` : ''}${pathway.currentStageId === stage.id ? ' (pinned)' : ''}`
            : ''}
        </div>
      </div>
      <div className="row" style={{ gap: 8 }}>
        <span className="balance-track grow">
          <span className="balance-fill" style={{ width: `${sp?.percent ?? 0}%` }} />
        </span>
        <span className="tiny faint mono-num">
          {prog.done}/{prog.total}
        </span>
      </div>
    </button>
  );
}

// --- All practice items ------------------------------------------------------

function AllItemsView({
  db,
  state,
  update,
  here,
}: {
  db: DB;
  state: BrowseState;
  update: (n: BrowseState, o?: { replace?: boolean }) => void;
  here: string;
}) {
  const now = useMemo(() => new Date(), []);

  // The agenda is the one source of "committed for a class" and "has an open
  // question" — both were item fields that could only ever hold one answer.
  const preparationDates = useMemo(
    () => preparationDatesByItem(db.lessonAgenda, db.lessons, now),
    [db.lessonAgenda, db.lessons, now],
  );
  const committedItemIds = useMemo(() => new Set(preparationDates.keys()), [preparationDates]);
  const itemsWithOpenQuestionIds = useMemo(
    () => new Set(itemsWithOpenQuestion(db.items, db.lessonAgenda).map((i) => i.id)),
    [db.items, db.lessonAgenda],
  );
  const scored = useMemo(
    () => scoreItems(db.items, groupBlocksByItem(db.blocks), now, preparationDates),
    [db.items, db.blocks, now, preparationDates],
  );
  const overworkedIds = useMemo(
    () => new Set(overworkedItems(db.items, db.blocks, now).map((i) => i.id)),
    [db.items, db.blocks, now],
  );

  // The SAME findable text My repertoire and Start search — terms, maestros,
  // gusheh, source and archive aliases. Search only — never identity.
  const texts = useMemo(() => repertoireSearchTexts(db), [db]);
  const quick = new Set(state.quick as Quick[]);

  const toggleQuick = (k: Quick) => {
    const next = new Set(quick);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    update({ ...state, quick: QUICK.map((q) => q.key).filter((key) => next.has(key)) });
  };

  const visible = scored
    .map((s) => s.item)
    .filter((item) => {
      if (!itemMatchesSearch(item, state.q, texts.get(item.id))) return false;
      if (state.instrumentId && item.instrumentId !== state.instrumentId) return false;
      if (state.status && item.status !== state.status) return false;
      if (state.type && item.itemType !== state.type) return false;
      if (quick.has('due') && !isDue(item, now)) return false;
      if (quick.has('lesson') && !committedItemIds.has(item.id)) return false;
      if (quick.has('fragile') && item.status !== 'fragile' && item.status !== 'repairing') return false;
      if (quick.has('neglected') && neglectedScore(item, now) < 2) return false;
      if (quick.has('overworked') && !overworkedIds.has(item.id)) return false;
      if (quick.has('teacher') && !itemsWithOpenQuestionIds.has(item.id)) return false;
      return true;
    });

  return (
    <div className="stack">
      <QuickAdd />

      <div className="stack-sm">
        <SearchBox label="Search practice items" placeholder="Search items…" state={state} update={update} />
        <div className="row" style={{ gap: 8 }}>
          <select
            className="select"
            aria-label="Status"
            value={state.status ?? ''}
            onChange={(e) => update({ ...state, status: (e.target.value as ItemStatus | '') || undefined })}
          >
            <option value="">Any status</option>
            {ITEM_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {ITEM_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select
            className="select"
            aria-label="Type"
            value={state.type ?? ''}
            onChange={(e) => update({ ...state, type: (e.target.value as ItemType | '') || undefined })}
          >
            <option value="">Any type</option>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="row-wrap" role="group" aria-label="Quick filters">
          {QUICK.map((q) => (
            <button
              key={q.key}
              className={`chip${quick.has(q.key) ? ' tone-progress' : ''}`}
              style={{ cursor: 'pointer' }}
              aria-pressed={quick.has(q.key)}
              onClick={() => toggleQuick(q.key)}
            >
              {q.label}
            </button>
          ))}
        </div>
        <ClearFilters state={state} update={update} />
      </div>

      {visible.length === 0 ? (
        <div className="card" role="status">
          <EmptyState icon={<ItemsIcon />} title="No items match">
            Try clearing a filter, or add one above — just a title is enough.
          </EmptyState>
        </div>
      ) : (
        <div className="stack">
          {visible.map((item) => (
            <ItemCard key={item.id} item={item} now={now} from={here} />
          ))}
        </div>
      )}
    </div>
  );
}
