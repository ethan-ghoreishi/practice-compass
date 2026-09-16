import { useState } from 'react';
import {
  FOCUS_LABELS,
  ITEM_STATUS_DESCRIPTIONS,
  ITEM_STATUS_LABELS,
  ITEM_STATUS_ORDER,
  RATING_ANCHORS,
  RATING_EFFECT_NOTE,
  RATING_HINTS,
  RATING_LABELS,
  REVIEW_MODE_LABELS,
  type FocusArea,
  type ItemStatus,
  type ReviewMode,
} from '../domain';
import { useStore } from '../store/useStore';
import { materialLabel, materialsForInstrument } from '../store/lookups';
import { Field, OptionPills, RatingInput } from './ui';
import { recordToOptions } from './options';
import { DASTGAH_SUGGESTIONS, FORM_SUGGESTIONS } from './itemFields';
import { fieldsForKind, kindFromItem, kindsForFamily, kindToItemType, type ItemKind } from './itemKinds';
import type { ItemFormValues } from './itemFormValues';

const REVIEW_MODE_OPTIONS = recordToOptions(REVIEW_MODE_LABELS);

/**
 * The one complete item form: ask WHAT it is first, show only the identity
 * fields that kind needs, then optional connections, then the practice
 * profile. Everything is settable at creation — no create-then-edit round
 * trips. Only the title is required.
 */
export default function ItemForm({
  initial,
  submitLabel,
  showLessonLink = false,
  onSubmit,
  onCancel,
}: {
  initial: ItemFormValues;
  submitLabel: string;
  /** Create flow only — lessons on existing items are managed in Connections. */
  showLessonLink?: boolean;
  onSubmit: (v: ItemFormValues) => void;
  onCancel: () => void;
}) {
  const db = useStore((s) => s.db);
  const addMaterial = useStore((s) => s.addMaterial);
  const [v, setV] = useState<ItemFormValues>(initial);
  const [kind, setKind] = useState<ItemKind>(() =>
    kindFromItem({ itemType: initial.itemType, persian: initial.persian, parentItemId: initial.parentItemId || undefined }),
  );
  const [showWorking, setShowWorking] = useState(Boolean(initial.notes));
  const [newSourceName, setNewSourceName] = useState('');

  const set = (patch: Partial<ItemFormValues>) => setV((cur) => ({ ...cur, ...patch }));

  const instrument = db.instruments.find((i) => i.id === v.instrumentId);
  const family = instrument?.family;
  const isPersian = family === 'Persian';
  const kinds = kindsForFamily(family);
  const fields = fieldsForKind(kind, family);
  const materials = materialsForInstrument(db, v.instrumentId);

  function pickKind(next: ItemKind) {
    setKind(next);
    set({ itemType: kindToItemType(next), ...(next !== 'passage' ? { parentItemId: '' } : {}) });
  }

  // Candidate parent works for passages: same instrument, not itself a part.
  const parentOptions = db.items
    .filter((i) => i.instrumentId === v.instrumentId && !i.parentItemId)
    .sort((a, b) => a.title.localeCompare(b.title));

  const stageOptions = db.pathways
    .filter((p) => !p.instrumentId || p.instrumentId === v.instrumentId)
    .flatMap((p) =>
      db.pathwayStages
        .filter((s) => s.pathwayId === p.id)
        .sort((a, b) => a.order - b.order)
        .map((s) => ({ id: s.id, label: `${p.name} — ${s.code}${s.title !== s.code ? ` · ${s.title}` : ''}` })),
    );

  const lessonOptions = db.lessons
    .filter((l) => l.instrumentId === v.instrumentId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const creatingSource = v.materialId === '__new__';
  function createSource() {
    if (!newSourceName.trim()) return;
    const id = addMaterial({ instrumentId: v.instrumentId, title: newSourceName });
    setNewSourceName('');
    set({ materialId: id });
  }

  return (
    <div className="card stack">
      {/* ---- 1 · What are you adding? ---- */}
      <div className="section-label">What are you adding?</div>

      {db.instruments.filter((i) => i.active).length > 1 && (
        <Field label="Instrument">
          <select
            className="select"
            value={v.instrumentId}
            onChange={(e) => set({ instrumentId: e.target.value, materialId: '', stageId: '', lessonId: '', parentItemId: '' })}
          >
            {db.instruments.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      <OptionPills
        ariaLabel="Kind of practice item"
        value={kind}
        onChange={(k) => pickKind(k as ItemKind)}
        options={kinds.map((k) => ({ value: k.value, label: k.label }))}
      />

      <Field label="Title">
        <input className="input" dir="auto" value={v.title} onChange={(e) => set({ title: e.target.value })} autoFocus />
      </Field>

      {(fields.dastgah || fields.form || fields.composer || fields.gushehName) && (
        <div className="grid-2">
          {fields.dastgah && (
            <Field label="Dastgāh / Āvāz">
              <input
                className="input"
                dir="auto"
                list="pc-dastgah-list"
                placeholder="e.g. Afshāri"
                value={v.persian.dastgahAvaz ?? ''}
                onChange={(e) => set({ persian: { ...v.persian, dastgahAvaz: e.target.value } })}
              />
              <datalist id="pc-dastgah-list">
                {DASTGAH_SUGGESTIONS.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </Field>
          )}
          {fields.gushehName && (
            <Field label="Gusheh">
              <input
                className="input"
                dir="auto"
                value={v.persian.gusheh ?? ''}
                onChange={(e) => set({ persian: { ...v.persian, gusheh: e.target.value } })}
              />
            </Field>
          )}
          {fields.form && (
            <Field label="Form">
              <input
                className="input"
                dir="auto"
                list="pc-form-list"
                placeholder="e.g. Chahārmezrāb"
                value={v.persian.form ?? ''}
                onChange={(e) => set({ persian: { ...v.persian, form: e.target.value } })}
              />
              <datalist id="pc-form-list">
                {FORM_SUGGESTIONS.map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
            </Field>
          )}
          {fields.composer && (
            <Field label="Composer / maestro" hint="e.g. Sabā, Darvish Khān, Shahnāzi.">
              <input
                className="input"
                dir="auto"
                value={v.persian.composer ?? ''}
                onChange={(e) => set({ persian: { ...v.persian, composer: e.target.value } })}
              />
            </Field>
          )}
        </div>
      )}

      {/* Bar range is guitar IDENTITY and stays. The Persian "phrase label"
          that used to share this row was working detail, retired at v13 — a
          Persian passage says which part it is in its own title and in its
          Working notes, not in a field of its own. */}
      {fields.range && !isPersian && (
        <Field label="Bar range" hint="Which part of the work this is.">
          <input
            className="input"
            dir="auto"
            placeholder="e.g. bars 9–16"
            value={v.guitar.barRange ?? ''}
            onChange={(e) => set({ guitar: { ...v.guitar, barRange: e.target.value } })}
          />
        </Field>
      )}

      {/* ---- 2 · Connect it (optional) ---- */}
      <div className="section-label" style={{ marginTop: 4 }}>
        Connect it <span className="faint" style={{ fontWeight: 400 }}>(optional)</span>
      </div>

      {fields.parent && (
        <Field label="Part of" hint="The work or étude this passage belongs to.">
          <select className="select" value={v.parentItemId} onChange={(e) => set({ parentItemId: e.target.value })}>
            <option value="">No parent work</option>
            {parentOptions.map((i) => (
              <option key={i.id} value={i.id}>
                {i.title}
              </option>
            ))}
          </select>
        </Field>
      )}

      <div className="grid-2">
        <Field label="Study source" hint="The radif, book, course or handout it comes from.">
          <select className="select" value={v.materialId} onChange={(e) => set({ materialId: e.target.value })}>
            <option value="">No study source</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {materialLabel(m)}
              </option>
            ))}
            <option value="__new__">New study source…</option>
          </select>
        </Field>
        <Field label="Pathway stage" hint="Its place on your route.">
          <select className="select" value={v.stageId} onChange={(e) => set({ stageId: e.target.value })}>
            <option value="">Not in a pathway</option>
            {stageOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {creatingSource && (
        <div className="row" style={{ gap: 8 }}>
          <input
            className="input grow"
            dir="auto"
            aria-label="New study source name"
            placeholder="e.g. Radif Mirzā Abdollāh · Honarestān Book 2 · CGS Level 2"
            value={newSourceName}
            onChange={(e) => setNewSourceName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createSource()}
          />
          <button type="button" className="btn" disabled={!newSourceName.trim()} onClick={createSource}>
            Create
          </button>
        </div>
      )}

      {showLessonLink && lessonOptions.length > 0 && (
        <Field label="From a lesson" hint="Links it to the class it came from.">
          <select className="select" value={v.lessonId} onChange={(e) => set({ lessonId: e.target.value })}>
            <option value="">Not from a lesson</option>
            {lessonOptions.map((l) => (
              <option key={l.id} value={l.id}>
                Class on {l.date}
              </option>
            ))}
          </select>
        </Field>
      )}

      {/* ---- 3 · First practice setup ---- */}
      <div className="section-label" style={{ marginTop: 4 }}>
        First practice setup
      </div>
      <div className="grid-2">
        <Field label="Status" hint={ITEM_STATUS_DESCRIPTIONS[v.status]}>
          <select className="select" value={v.status} onChange={(e) => set({ status: e.target.value as ItemStatus })}>
            {ITEM_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {ITEM_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Primary focus">
          <select
            className="select"
            value={v.primaryFocus}
            onChange={(e) => set({ primaryFocus: e.target.value as FocusArea | '' })}
          >
            <option value="">None</option>
            {(Object.keys(FOCUS_LABELS) as FocusArea[]).map((f) => (
              <option key={f} value={f}>
                {FOCUS_LABELS[f]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid-2">
        <Field label={RATING_LABELS.importance} hint={`${RATING_HINTS.importance} ${RATING_ANCHORS.importance[v.importance as 1 | 3 | 5] ?? ''}`.trim()}>
          <RatingInput name={RATING_LABELS.importance} value={v.importance} onChange={(importance) => set({ importance })} />
        </Field>
        <Field label={RATING_LABELS.difficulty} hint={`${RATING_HINTS.difficulty} ${RATING_ANCHORS.difficulty[v.difficulty as 1 | 3 | 5] ?? ''}`.trim()}>
          <RatingInput name={RATING_LABELS.difficulty} value={v.difficulty} onChange={(difficulty) => set({ difficulty })} />
        </Field>
      </div>
      <p className="tiny faint">
        <span dir="ltr">{RATING_EFFECT_NOTE}</span>
      </p>

      <Field
        label="Reminders"
        hint={
          v.reviewMode === 'auto'
            ? 'The app decides how often to revisit, from status, importance, difficulty and how it goes.'
            : v.reviewMode === 'interval'
              ? 'Revisit on a fixed cadence you choose.'
              : 'You set each next-review date yourself.'
        }
      >
        <OptionPills
          ariaLabel="Reminder mode"
          value={v.reviewMode}
          onChange={(reviewMode) => set({ reviewMode: reviewMode as ReviewMode })}
          options={REVIEW_MODE_OPTIONS}
        />
      </Field>
      {v.reviewMode === 'interval' && (
        <Field label="Every how many days?">
          <input
            className="input"
            type="number"
            min={1}
            value={v.reviewIntervalDays}
            placeholder="7"
            onChange={(e) => set({ reviewIntervalDays: e.target.value })}
            style={{ maxWidth: 120 }}
          />
        </Field>
      )}

      {/* ---- Working notes — the item's ONE notebook, same field the practice
              screen shows. Progressive: usually filled while practising, not
              while filing. ---- */}
      <button
        className="link small"
        style={{ background: 'none', border: 'none', textAlign: 'left' }}
        aria-expanded={showWorking}
        onClick={() => setShowWorking((o) => !o)}
      >
        {showWorking ? '− Hide' : '+ Add'} working notes
      </button>
      {showWorking && (
        <Field label="Working notes" hint="The same notes you can read and edit while practising.">
          <textarea
            className="textarea"
            dir="auto"
            aria-label="Working notes"
            style={{ minHeight: 110 }}
            value={v.notes}
            onChange={(e) => set({ notes: e.target.value })}
          />
        </Field>
      )}

      <div className="row">
        <button className="btn btn-primary grow" disabled={!v.title.trim()} onClick={() => onSubmit(v)}>
          {submitLabel}
        </button>
        <button className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
