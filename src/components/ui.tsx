import { useRef, useState, type ReactNode } from 'react';
import { ITEM_STATUS_LABELS, STATUS_TONE, type ItemStatus, type Rating } from '../domain';
import { storageSettled } from '../store/idb';
import { StarIcon } from './icons';
import type { Option } from './options';

type Tone = 'alert' | 'warn' | 'progress' | 'good' | 'rest';

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`badge tone-${tone}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: ItemStatus }) {
  return <span className={`badge tone-${STATUS_TONE[status]}`}>{ITEM_STATUS_LABELS[status]}</span>;
}

export function Chip({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <span className="chip" title={title}>
      {children}
    </span>
  );
}

export function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="rating-readonly" aria-label={`${value} of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <StarIcon key={i} width={13} height={13} className={i < value ? '' : 'off'} />
      ))}
    </span>
  );
}

export function RatingInput({
  value,
  onChange,
  label,
  name,
}: {
  value: Rating;
  onChange: (v: Rating) => void;
  label?: string;
  /** What this rating IS, so each star carries its own accessible name. */
  name?: string;
}) {
  return (
    <span className="rating" role="group" aria-label={label}>
      {([1, 2, 3, 4, 5] as Rating[]).map((n) => (
        <button
          key={n}
          type="button"
          className={n <= value ? 'on' : ''}
          // A bare "3" told a screen reader nothing about WHICH estimate it
          // set, and nothing about which one is chosen — two rating groups sit
          // side by side on the item form. aria-pressed marks the CHOSEN
          // value; the cumulative fill is the visible counterpart.
          aria-label={name ? `${name} ${n}` : `${n}`}
          aria-pressed={n === value}
          onClick={() => onChange(n)}
        >
          <StarIcon width={20} height={20} />
        </button>
      ))}
    </span>
  );
}

export function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="stat">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label?: string;
  hint?: string;
  children: ReactNode;
}) {
  // A div, not a <label>: Field often wraps button groups and pickers, and
  // interactive controls must never be nested inside a label element.
  return (
    <div className="field" role="group" aria-label={label}>
      {label && <span className="field-label">{label}</span>}
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  );
}

export function OptionPills<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div className="options" role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`option${o.value === value ? ' selected' : ''}`}
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
}: {
  icon?: ReactNode;
  // ReactNode, not string: a caller embedding an instrument's own editable
  // name needs to isolate it with its own dir="auto" span rather than fusing
  // it into one plain string that this component would then render bare.
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      {icon}
      <div className="title-md" style={{ marginBottom: 4 }}>
        {title}
      </div>
      {children && <div className="small dim">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ACKNOWLEDGED SAVES for the small registry editors (musical terms, study
// sources, choosing a course's source) — the notebook's rules, one place:
//
//  - "Saved." waits for IndexedDB (`storageSettled`), and speaks only for the
//    draft it CARRIED: a write settling after the owner typed more re-issues
//    the save for what is on screen now instead of calling older text saved.
//  - Only the LATEST write for a key may speak (a per-key sequence), so a slow
//    first attempt can never overwrite a retry's outcome.
//  - Outcomes are keyed (a term id, a source id, 'new'), so the owner of a
//    status can move between lists — or be deleted — without taking its
//    failure and its Try again with it.
//  - `reset` starts a fresh editor session: nothing from the last one carries.
// ---------------------------------------------------------------------------

export type Ack =
  | { status: 'saving' | 'saved' | 'failed'; carried: string }
  | { status: 'refused'; reason: string; carried: string };

export interface AckSaves {
  states: Record<string, Ack>;
  /**
   * Run ONE synchronous store action for the draft `carried` identifies, then
   * report only that write's outcome. `current` reads the live draft (a ref,
   * never a render's copy); when it no longer equals `carried` once storage
   * answers, `again` is called to write what is on screen now; otherwise
   * `saved` runs (an editor that closes on success closes only then).
   */
  run: (
    key: string,
    carried: string | (() => string),
    action: () => string | null,
    live?: { current: () => string; again: () => void; saved?: () => void },
  ) => void;
  reset: (key: string) => void;
}

// eslint-disable-next-line react-refresh/only-export-components -- the one shared save lifecycle for these editors
export function useAcknowledgedSaves(): AckSaves {
  const [states, setStates] = useState<Record<string, Ack>>({});
  const seqs = useRef<Record<string, number>>({});
  const put = (key: string, ack: Ack | null) =>
    setStates((s) => {
      const next = { ...s };
      if (ack) next[key] = ack;
      else delete next[key];
      return next;
    });
  const run: AckSaves['run'] = (key, carriedOrRead, action, live) => {
    const mine = (seqs.current[key] = (seqs.current[key] ?? 0) + 1);
    const refusal = action();
    // A getter is read AFTER the action, for an editor that shows what the
    // store normalised (a rename keeps its former name as a spelling).
    const carried = typeof carriedOrRead === 'function' ? carriedOrRead() : carriedOrRead;
    if (refusal) {
      put(key, { status: 'refused', reason: refusal, carried });
      return;
    }
    put(key, { status: 'saving', carried });
    // Captured in the same tick as the action: this write's own outcome.
    storageSettled().then(
      () => {
        if (seqs.current[key] !== mine) return;
        if (live && live.current() !== carried) {
          live.again();
          return;
        }
        put(key, { status: 'saved', carried });
        live?.saved?.();
      },
      () => {
        if (seqs.current[key] === mine) put(key, { status: 'failed', carried });
      },
    );
  };
  const reset = (key: string) => {
    seqs.current[key] = (seqs.current[key] ?? 0) + 1;
    put(key, null);
  };
  return { states, run, reset };
}

/**
 * One save's outcome, as it applies to the draft on screen NOW (`current`):
 * "Saved." only for the text that was written; a refusal only while the text
 * it refused is still there. A failure stays whatever was typed since — the
 * words are still only in memory, and Try again writes what is on screen.
 */
export function SaveStatus({ ack, current, onRetry, subject }: { ack?: Ack; current?: string; onRetry: () => void; subject?: ReactNode }) {
  if (!ack) return null;
  const same = current === undefined || ack.carried === current;
  if (ack.status === 'saving') return <span className="tiny faint" role="status">{subject}Saving…</span>;
  if (ack.status === 'saved') return same ? <span className="tiny" role="status">{subject}Saved.</span> : null;
  if (ack.status === 'refused')
    return same ? (
      <span className="tiny" role="alert" style={{ color: 'var(--tone-alert)' }}>
        {ack.reason}
      </span>
    ) : null;
  return (
    <span className="row tiny" role="alert" style={{ gap: 8, color: 'var(--tone-alert)', flexWrap: 'wrap' }}>
      {subject}Not saved — this device refused the write. Nothing on screen was lost.
      <button type="button" className="btn btn-sm" onClick={onRetry}>
        Try again
      </button>
    </span>
  );
}
