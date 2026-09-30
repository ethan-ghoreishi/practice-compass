import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { vocabulary } from '../domain';
import { useStore } from '../store/useStore';
import ItemForm from '../components/ItemForm';
import { emptyItemValues, valuesToCreateInput, type ItemFormValues } from '../components/itemFormValues';
import { ArrowLeftIcon } from '../components/icons';

/**
 * Add practice item — the complete one-step creation screen. Identity,
 * connections (study source, pathway stage, lesson, parent work) and the
 * first practice setup all happen here; nothing needs a second edit pass.
 * Quick add (title-only) remains the fast path elsewhere.
 */
export default function NewItem() {
  const db = useStore((s) => s.db);
  const addItem = useStore((s) => s.addItem);
  const linkItemToLesson = useStore((s) => s.linkItemToLesson);
  const sessionInstrumentId = useStore((s) => s.sessionInstrumentId);
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const from = (location.state as { from?: string } | null)?.from ?? '/repertoire';

  const instruments = db.instruments.filter((i) => i.active);
  // The instrument being BROWSED (Repertoire passes it) wins over the session
  // one; neither is ever written back.
  const browsed = params.get('instrument');
  const defaultInstrument =
    (browsed && instruments.find((i) => i.id === browsed)?.id) ||
    (sessionInstrumentId !== 'all' && instruments.find((i) => i.id === sessionInstrumentId)?.id) ||
    instruments[0]?.id ||
    '';

  const initial = emptyItemValues(defaultInstrument);
  // "Add a piece in this form" from the Forms lens: prefill the one field,
  // only with a term that exists — a stale link prefills nothing.
  const formParam = params.get('form');
  if (formParam && vocabulary(db.musicTerms).byId.get(formParam)?.kind === 'form') {
    initial.persian = { form: { termId: formParam } };
    initial.itemType = 'full_piece';
  }
  const stageParam = params.get('stage');
  if (stageParam && db.pathwayStages.some((s) => s.id === stageParam)) {
    initial.stageId = stageParam;
    const stage = db.pathwayStages.find((s) => s.id === stageParam)!;
    const pathway = db.pathways.find((p) => p.id === stage.pathwayId);
    if (pathway?.instrumentId) initial.instrumentId = pathway.instrumentId;
  }
  const lessonParam = params.get('lesson');
  if (lessonParam && db.lessons.some((l) => l.id === lessonParam)) {
    const lesson = db.lessons.find((l) => l.id === lessonParam)!;
    initial.lessonId = lesson.id;
    initial.instrumentId = lesson.instrumentId;
  }

  function create(v: ItemFormValues) {
    const id = addItem(valuesToCreateInput(v));
    if (v.lessonId) linkItemToLesson(v.lessonId, id);
    // Creating from Start returns there with the new item ready to practise.
    if (from === '/start') {
      navigate('/start', { replace: true, state: { selectItem: id } });
      return;
    }
    navigate(`/items/${id}`, { replace: true, state: { from } });
  }

  return (
    <div className="stack-lg">
      <Link to={from} className="link row" style={{ gap: 4, width: 'fit-content' }}>
        <ArrowLeftIcon width={16} height={16} /> Back
      </Link>
      <header>
        <h1 className="page-title">Add practice item</h1>
        <p className="page-sub">Only the title is required — everything else can wait.</p>
      </header>
      <ItemForm initial={initial} submitLabel="Add practice item" showLessonLink onSubmit={create} onCancel={() => navigate(from)} />
    </div>
  );
}
