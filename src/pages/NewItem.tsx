import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import ItemForm from '../components/ItemForm';
import { emptyItemValues, valuesToCreateInput, type ItemFormValues } from '../components/itemFormValues';
import { ArrowLeftIcon } from '../components/icons';

/**
 * Full item creation in ONE step — source, placement, focus, importance and
 * Persian identity all here, so nothing needs a second edit pass. QuickAdd
 * (title-only) stays the fast path; this is the thorough one.
 */
export default function NewItem() {
  const db = useStore((s) => s.db);
  const addItem = useStore((s) => s.addItem);
  const sessionInstrumentId = useStore((s) => s.sessionInstrumentId);
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const from = (location.state as { from?: string } | null)?.from ?? '/repertoire';

  const instruments = db.instruments.filter((i) => i.active);
  const defaultInstrument =
    (sessionInstrumentId !== 'all' && instruments.find((i) => i.id === sessionInstrumentId)?.id) ||
    instruments[0]?.id ||
    '';

  const initial = emptyItemValues(defaultInstrument);
  const stageParam = params.get('stage');
  if (stageParam && db.pathwayStages.some((s) => s.id === stageParam)) {
    initial.stageId = stageParam;
    const stage = db.pathwayStages.find((s) => s.id === stageParam)!;
    const pathway = db.pathways.find((p) => p.id === stage.pathwayId);
    if (pathway?.instrumentId) initial.instrumentId = pathway.instrumentId;
  }

  function create(v: ItemFormValues) {
    const id = addItem(valuesToCreateInput(v));
    navigate(`/items/${id}`, { replace: true, state: { from } });
  }

  return (
    <div className="stack-lg">
      <Link to={from} className="link row" style={{ gap: 4, width: 'fit-content' }}>
        <ArrowLeftIcon width={16} height={16} /> Back
      </Link>
      <header>
        <h1 className="page-title">New item</h1>
        <p className="page-sub">Only the title is required — everything else can wait.</p>
      </header>
      <ItemForm initial={initial} submitLabel="Create item" onSubmit={create} onCancel={() => navigate(from)} />
    </div>
  );
}
