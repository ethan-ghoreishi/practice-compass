import { useId, useMemo, useRef, useState } from 'react';
import {
  resolveValue,
  searchAliasTable,
  searchMatch,
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

/** How many matches show while typing — a short list to tap, never the whole vocabulary. */
const MATCHES_SHOWN = 8;

/**
 * One classifying field — Dastgāh/Āvāz, Form or Composer/maestro — backed by
 * the shared vocabulary WITHOUT requiring it. Picking a suggestion stores the
 * term itself; anything else typed is kept as the owner's own text exactly as
 * written (an existing legacy spelling is never rewritten just by opening the
 * form, and a partial match is never accepted on the owner's behalf). The line
 * under the field says which of the two it is.
 *
 * The suggestions are the app's OWN buttons, in the page's flow under the
 * field — not a native `<datalist>`, whose popup some WebKit builds never show
 * while typing. One surface, every engine, no user-agent branch.
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
  const table = useMemo(() => searchAliasTable(vocab), [vocab]);
  const kind = TERM_FIELD_KIND[field];
  const listId = useId();
  const r = resolveValue(value, kind, vocab);
  const text = valueLabel(value, vocab);
  // 'typing' — matches for what is typed; 'all' — the whole list, asked for.
  const [open, setOpen] = useState<'typing' | 'all' | null>(null);

  const options = useMemo(() => {
    const offered = termSuggestions(kind, vocab);
    if (open === 'all') return offered;
    // Once a term IS the value there is nothing to suggest; typed text — an
    // alias included — may still be turned into the term it means.
    if (open !== 'typing' || !text.trim() || (r.status === 'term' && r.via === 'reference')) return [];
    // The existing search: Farsi normalisation, the terms' own spellings and
    // their transliterations — "mah" and «ماه» both find ماهور.
    return offered.filter((t) => [t.name, ...t.aliases].some((s) => searchMatch(s, text, table))).slice(0, MATCHES_SHOWN);
  }, [open, kind, vocab, text, table, r]);

  // A chosen suggestion or Clear unmounts the button that had focus: focus
  // returns to the box, never to the page.
  const box = useRef<HTMLInputElement>(null);
  const choose = (termId: string) => {
    onChange({ termId });
    setOpen(null);
    box.current?.focus();
  };

  return (
    <Field label={label}>
      {/* Focus may move between the box and its suggestions without closing
          them; leaving the whole field does. */}
      <div
        className="stack-sm"
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(null);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(null);
        }}
      >
        <div className="row" style={{ gap: 6 }}>
          <input
            ref={box}
            className="input grow"
            dir="auto"
            aria-label={label}
            aria-controls={listId}
            aria-expanded={options.length > 0}
            autoComplete="off"
            placeholder={placeholder}
            value={text}
            onFocus={() => setOpen((o) => o ?? 'typing')}
            onChange={(e) => {
              onChange(valueFromInput(e.target.value, kind, vocab));
              setOpen('typing');
            }}
          />
          {text && (
            <button
              type="button"
              className="btn btn-ghost term-action"
              aria-label={`Clear ${label}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(undefined);
                setOpen('typing');
                box.current?.focus();
              }}
            >
              ✕
            </button>
          )}
          <button
            type="button"
            className="btn btn-ghost term-action"
            aria-label={`All ${label} terms`}
            aria-expanded={open === 'all'}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setOpen((o) => (o === 'all' ? null : 'all'))}
          >
            All
          </button>
        </div>
        {options.length > 0 && (
          <div id={listId} className="term-suggestions" role="group" aria-label={`${label} suggestions`}>
            {options.map((t) => (
              <button
                key={t.id}
                type="button"
                className="btn btn-sm term-option"
                dir="auto"
                // A tap must not blur the box before the choice lands.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(t.id)}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}
      </div>
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
