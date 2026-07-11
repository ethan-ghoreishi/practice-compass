import { useState } from 'react';
import {
  FOCUS_LABELS,
  ITEM_STATUS_DESCRIPTIONS,
  ITEM_STATUS_LABELS,
  ITEM_STATUS_ORDER,
  ITEM_TYPE_LABELS,
  REVIEW_MODE_LABELS,
  type FocusArea,
  type ItemStatus,
  type ItemType,
  type ReviewMode,
} from '../domain';
import { useStore } from '../store/useStore';
import { materialLabel, materialsForInstrument } from '../store/lookups';
import { Field, OptionPills, RatingInput } from './ui';
import { recordToOptions } from './options';
import {
  DASTGAH_SUGGESTIONS,
  FORM_SUGGESTIONS,
  GUITAR_DETAIL_FIELDS,
  GUITAR_IDENTITY_FIELDS,
  PERSIAN_DETAIL_FIELDS,
} from './itemFields';
import type { ItemFormValues } from './itemFormValues';

const TYPE_OPTIONS = recordToOptions(ITEM_TYPE_LABELS);
const REVIEW_MODE_OPTIONS = recordToOptions(REVIEW_MODE_LABELS);

/**
 * The one full item form — everything (source, placement, focus, importance,
 * Persian identity…) is settable at creation time, in logical groups. Only
 * the title is required; everything else has a sensible default.
 */
export default function ItemForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: ItemFormValues;
  submitLabel: string;
  onSubmit: (v: ItemFormValues) => void;
  onCancel: () => void;
}) {
  const db = useStore((s) => s.db);
  const addMaterial = useStore((s) => s.addMaterial);
  const [v, setV] = useState<ItemFormValues>(initial);
  const [showWorking, setShowWorking] = useState(
    Boolean(
      initial.currentProblem ||
        initial.bestStrategy ||
        initial.teacherQuestion ||
        initial.tags ||
        Object.entries(initial.persian).some(([k, val]) => val && !['dastgahAvaz', 'form', 'composer', 'gusheh'].includes(k)) ||
        Object.entries(initial.guitar).some(([k, val]) => val && !['lessonNumber', 'barRange'].includes(k)),
    ),
  );
  const [newSourceName, setNewSourceName] = useState('');

  const set = (patch: Partial<ItemFormValues>) => setV((cur) => ({ ...cur, ...patch }));

  const instrument = db.instruments.find((i) => i.id === v.instrumentId);
  const isPersian = instrument?.family === 'Persian';
  const isGuitar = !isPersian && /guitar/i.test(instrument?.name ?? '');
  const materials = materialsForInstrument(db, v.instrumentId);

  // Stages of this instrument's pathways, for optional placement.
  const stageOptions = db.pathways
    .filter((p) => !p.instrumentId || p.instrumentId === v.instrumentId)
    .flatMap((p) =>
      db.pathwayStages
        .filter((s) => s.pathwayId === p.id)
        .sort((a, b) => a.order - b.order)
        .map((s) => ({ id: s.id, label: `${p.name} — ${s.code}${s.title !== s.code ? ` · ${s.title}` : ''}` })),
    );

  const creatingSource = v.materialId === '__new__';
  function createSource() {
    if (!newSourceName.trim()) return;
    const id = addMaterial({ instrumentId: v.instrumentId, title: newSourceName });
    setNewSourceName('');
    set({ materialId: id });
  }

  return (
    <div className="card stack">
      {/* ---- 1 · The piece itself ---- */}
      <div className="section-label">What it is</div>

      <div className="grid-2">
        <Field label="Instrument">
          <select
            className="select"
            value={v.instrumentId}
            onChange={(e) => set({ instrumentId: e.target.value, materialId: '', stageId: '' })}
          >
            {db.instruments.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Type">
          <select className="select" value={v.itemType} onChange={(e) => set({ itemType: e.target.value as ItemType })}>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Title">
        <input className="input" dir="auto" value={v.title} onChange={(e) => set({ title: e.target.value })} autoFocus />
      </Field>

      {isPersian && (
        <>
          <div className="grid-2">
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
            <Field label="Form">
              <input
                className="input"
                dir="auto"
                list="pc-form-list"
                placeholder="e.g. Chahār-mezrāb"
                value={v.persian.form ?? ''}
                onChange={(e) => set({ persian: { ...v.persian, form: e.target.value } })}
              />
              <datalist id="pc-form-list">
                {FORM_SUGGESTIONS.map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
            </Field>
          </div>
          <div className="grid-2">
            <Field label="Composer / maestro" hint="For composed pieces — e.g. Sabā, Shahnāzi, Vaziri.">
              <input
                className="input"
                dir="auto"
                value={v.persian.composer ?? ''}
                onChange={(e) => set({ persian: { ...v.persian, composer: e.target.value } })}
              />
            </Field>
            <Field label="Gusheh" hint="Radif material only.">
              <input
                className="input"
                dir="auto"
                value={v.persian.gusheh ?? ''}
                onChange={(e) => set({ persian: { ...v.persian, gusheh: e.target.value } })}
              />
            </Field>
          </div>
        </>
      )}

      {isGuitar && (
        <div className="grid-2">
          {GUITAR_IDENTITY_FIELDS.map((f) => (
            <Field key={f.key} label={f.label}>
              <input
                className="input"
                value={v.guitar[f.key] ?? ''}
                onChange={(e) => set({ guitar: { ...v.guitar, [f.key]: e.target.value } })}
              />
            </Field>
          ))}
        </div>
      )}

      {/* ---- 2 · Where it lives ---- */}
      <div className="section-label" style={{ marginTop: 4 }}>
        Where it lives
      </div>
      <div className="grid-2">
        <Field label="Source" hint="The book, radif, course or collection it comes from.">
          <select className="select" value={v.materialId} onChange={(e) => set({ materialId: e.target.value })}>
            <option value="">No source</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {materialLabel(m)}
              </option>
            ))}
            <option value="__new__">New source…</option>
          </select>
        </Field>
        <Field label="Pathway stage" hint="Optional place on your route.">
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
            aria-label="New source name"
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

      {/* ---- 3 · How to practise it ---- */}
      <div className="section-label" style={{ marginTop: 4 }}>
        How to practise it
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
        <Field label="Importance">
          <RatingInput value={v.importance} onChange={(importance) => set({ importance })} />
        </Field>
        <Field label="Difficulty">
          <RatingInput value={v.difficulty} onChange={(difficulty) => set({ difficulty })} />
        </Field>
      </div>

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

      {/* ---- 4 · Working notes (progressive — usually filled while practising) ---- */}
      <button
        className="link small"
        style={{ background: 'none', border: 'none', textAlign: 'left' }}
        onClick={() => setShowWorking((s) => !s)}
      >
        {showWorking ? '− Hide' : '+ Add'} working notes (problem, strategy, teacher question…)
      </button>
      {showWorking && (
        <>
          <Field label="Current problem">
            <textarea className="textarea" dir="auto" value={v.currentProblem} onChange={(e) => set({ currentProblem: e.target.value })} />
          </Field>
          <Field label="Best strategy">
            <textarea className="textarea" dir="auto" value={v.bestStrategy} onChange={(e) => set({ bestStrategy: e.target.value })} />
          </Field>
          <Field label="Teacher question">
            <textarea className="textarea" dir="auto" value={v.teacherQuestion} onChange={(e) => set({ teacherQuestion: e.target.value })} />
          </Field>
          <Field label="Tags" hint="Comma-separated">
            <input className="input" dir="auto" value={v.tags} onChange={(e) => set({ tags: e.target.value })} placeholder="e.g. foroud, evenness" />
          </Field>
          {isPersian && (
            <div className="grid-2">
              {PERSIAN_DETAIL_FIELDS.map((f) => (
                <Field key={f.key} label={f.label}>
                  <input
                    className="input"
                    dir="auto"
                    value={v.persian[f.key] ?? ''}
                    onChange={(e) => set({ persian: { ...v.persian, [f.key]: e.target.value } })}
                  />
                </Field>
              ))}
            </div>
          )}
          {isGuitar && (
            <div className="grid-2">
              {GUITAR_DETAIL_FIELDS.map((f) => (
                <Field key={f.key} label={f.label}>
                  <input
                    className="input"
                    value={v.guitar[f.key] ?? ''}
                    onChange={(e) => set({ guitar: { ...v.guitar, [f.key]: e.target.value } })}
                  />
                </Field>
              ))}
            </div>
          )}
        </>
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
