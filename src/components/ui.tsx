import type { ReactNode } from 'react';
import { ITEM_STATUS_LABELS, STATUS_TONE, type ItemStatus, type Rating } from '../domain';
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
}: {
  value: Rating;
  onChange: (v: Rating) => void;
  label?: string;
}) {
  return (
    <span className="rating" role="group" aria-label={label}>
      {([1, 2, 3, 4, 5] as Rating[]).map((n) => (
        <button
          key={n}
          type="button"
          className={n <= value ? 'on' : ''}
          aria-label={`${n}`}
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
  title: string;
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
