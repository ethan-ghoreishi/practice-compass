import { useState } from 'react';
import {
  FOCUS_LABELS,
  ITEM_STATUS_LABELS,
  ITEM_STATUS_ORDER,
  ITEM_TYPE_LABELS,
  type FocusArea,
  type ItemStatus,
  type ItemType,
} from '../domain';
import { useStore } from '../store/useStore';
import { materialLabel, materialsForInstrument } from '../store/lookups';
import { Field, RatingInput } from './ui';
import { recordToOptions } from './options';
import { GUITAR_FIELDS, PERSIAN_FIELDS } from './itemFields';
import type { ItemFormValues } from './itemFormValues';

const TYPE_OPTIONS = recordToOptions(ITEM_TYPE_LABELS);

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
  const [v, setV] = useState<ItemFormValues>(initial);
  const [showPersian, setShowPersian] = useState(Object.values(initial.persian).some(Boolean));
  const [showGuitar, setShowGuitar] = useState(Object.values(initial.guitar).some(Boolean));

  const materials = materialsForInstrument(db, v.instrumentId);
  const set = (patch: Partial<ItemFormValues>) => setV((cur) => ({ ...cur, ...patch }));

  return (
    <div className="card stack">
      <Field label="Instrument">
        <select
          className="select"
          value={v.instrumentId}
          onChange={(e) => set({ instrumentId: e.target.value, materialId: '' })}
        >
          {db.instruments.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Title">
        <input className="input" value={v.title} onChange={(e) => set({ title: e.target.value })} autoFocus />
      </Field>

      <div className="grid-2">
        <Field label="Material">
          <select className="select" value={v.materialId} onChange={(e) => set({ materialId: e.target.value })}>
            <option value="">None</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {materialLabel(m)}
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

      <div className="grid-2">
        <Field label="Status">
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

      <Field label="Current problem">
        <textarea className="textarea" value={v.currentProblem} onChange={(e) => set({ currentProblem: e.target.value })} />
      </Field>
      <Field label="Best strategy">
        <textarea className="textarea" value={v.bestStrategy} onChange={(e) => set({ bestStrategy: e.target.value })} />
      </Field>
      <Field label="Teacher question">
        <textarea className="textarea" value={v.teacherQuestion} onChange={(e) => set({ teacherQuestion: e.target.value })} />
      </Field>
      <Field label="Tags" hint="Comma-separated">
        <input className="input" value={v.tags} onChange={(e) => set({ tags: e.target.value })} placeholder="e.g. foroud, evenness" />
      </Field>

      <button className="link small" style={{ background: 'none', border: 'none', textAlign: 'left' }} onClick={() => setShowPersian((s) => !s)}>
        {showPersian ? '− Hide' : '+ Add'} Persian-specific fields
      </button>
      {showPersian && (
        <div className="grid-2">
          {PERSIAN_FIELDS.map((f) => (
            <Field key={f.key} label={f.label}>
              <input
                className="input"
                value={v.persian[f.key] ?? ''}
                onChange={(e) => set({ persian: { ...v.persian, [f.key]: e.target.value } })}
              />
            </Field>
          ))}
        </div>
      )}

      <button className="link small" style={{ background: 'none', border: 'none', textAlign: 'left' }} onClick={() => setShowGuitar((s) => !s)}>
        {showGuitar ? '− Hide' : '+ Add'} Classical-guitar fields
      </button>
      {showGuitar && (
        <div className="grid-2">
          {GUITAR_FIELDS.map((f) => (
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
