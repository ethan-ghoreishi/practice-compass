import { useId, useMemo } from 'react';
import {
  resolveValue,
  TERM_FIELD_KIND,
  termSuggestions,
  valueFromInput,
  valueLabel,
  vocabulary,
  type MusicalValue,
  type TermField,
} from '../domain';
import { useStore } from '../store/useStore';
import { Field } from './ui';

/**
 * One classifying field — Dastgāh/Āvāz, Form or Composer/maestro — backed by
 * the shared vocabulary WITHOUT requiring it. Picking a suggestion stores the
 * term itself; anything else typed is kept as the owner's own text exactly as
 * written (an existing legacy spelling is never rewritten just by opening the
 * form). The line under the field says which of the two it is.
 */
export default function MusicalTermField({
  field,
  label,
  placeholder,
  value,
  onChange,
}: {
  field: TermField;
  label: string;
  placeholder?: string;
  value: MusicalValue | undefined;
  onChange: (next: MusicalValue | undefined) => void;
}) {
  const terms = useStore((s) => s.db.musicTerms);
  const vocab = useMemo(() => vocabulary(terms), [terms]);
  const kind = TERM_FIELD_KIND[field];
  const listId = useId();
  const r = resolveValue(value, kind, vocab);

  return (
    <Field label={label}>
      <input
        className="input"
        dir="auto"
        aria-label={label}
        list={listId}
        placeholder={placeholder}
        value={valueLabel(value, vocab)}
        onChange={(e) => onChange(valueFromInput(e.target.value, kind, vocab))}
      />
      <datalist id={listId}>
        {termSuggestions(kind, vocab).map((t) => (
          <option key={t.id} value={t.name} />
        ))}
      </datalist>
      {r.status === 'term' && (
        <span className="tiny faint">
          {r.via === 'reference' ? 'Shared term' : 'Your spelling — grouped as '}
          {r.via === 'alias' && <span dir="auto">{r.term.name}</span>}
          {r.term.archived ? ' (archived)' : ''}
        </span>
      )}
      {r.status === 'ambiguous' && <span className="tiny faint">Matches more than one term — kept as your own text.</span>}
    </Field>
  );
}
