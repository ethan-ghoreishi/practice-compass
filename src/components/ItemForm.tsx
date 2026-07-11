import { useState } from 'react';
import {
  FOCUS_LABELS,
  ITEM_STATUS_DESCRIPTIONS,
  ITEM_STATUS_LABELS,
  ITEM_STATUS_ORDER,
  REVIEW_MODE_LABELS,
  type FocusArea,
  type ItemStatus,
  type ReviewMode,
} from '../domain';
import { useStore } from '../store/useStore';
import { materialLabel, materialsForInstrument } from '../store/lookups';
import { Field, OptionPills, RatingInput } from './ui';
import { recordToOptions } from './options';
import { DASTGAH_SUGGESTIONS, FORM_SUGGESTIONS, GUITAR_DETAIL_FIELDS, PERSIAN_DETAIL_FIELDS } from './itemFields';
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
  const [showWorking, setShowWorking] = useState(
    Boolean(
      initial.currentProblem ||
        initial.bestStrategy ||
        initial.teacherQuestion ||
        initial.tags ||
        Object.entries(initial.persian).some(([k, val]) => val && !['dastgahAvaz', 'form', 'composer', 'gusheh'].includes(k)) ||
        Object.values(initial.guitar).some(Boolean),
    ),
  );
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

      {fields.range && (
        <Field label={isPersian ? 'Phrase label' : 'Bar range'} hint="Which part of the work this is.">
          <input
            className="input"
            dir="auto"
            placeholder={isPersian ? 'e.g. forud phrase' : 'e.g. bars 9–16'}
            value={isPersian ? (v.persian.phraseLabel ?? '') : (v.guitar.barRange ?? '')}
            onChange={(e) =>
              isPersian
                ? set({ persian: { ...v.persian, phraseLabel: e.target.value } })
                : set({ guitar: { ...v.guitar, barRange: e.target.value } })
            }
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

      {/* ---- Working notes (progressive — usually filled while practising) ---- */}
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
          {!isPersian && (
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
