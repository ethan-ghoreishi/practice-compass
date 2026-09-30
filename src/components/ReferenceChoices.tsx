import { useState } from 'react';
import { ITEM_STATUS_LABELS, type Material, type PracticeItem } from '../domain';
import { SaveStatus, type Ack } from './ui';

/**
 * An EXPLICIT choice, never a guess: which of the owner's items a suggestion
 * is (Link existing, or two legacy items that both answer it), or which study
 * source a course is. A matching title only puts a candidate first — it is
 * never authority to merge, and nothing happens until the owner picks one.
 */
export function ItemChoice({
  heading,
  explanation,
  items,
  sameTitle,
  onChoose,
  onCancel,
  alternative,
}: {
  heading: string;
  explanation: string;
  items: PracticeItem[];
  /** Candidates whose title matches the suggestion's, shown first and marked. */
  sameTitle?: (item: PracticeItem) => boolean;
  onChoose: (itemId: string) => string | null | void;
  onCancel: () => void;
  /** A deliberate way out that is not one of the items (e.g. "Add as a new item"). */
  alternative?: { label: string; run: () => string | null | void };
}) {
  const [refusal, setRefusal] = useState<string | null>(null);
  return (
    <div className="card card-quiet stack-sm" role="region" aria-label={heading}>
      <div className="small" style={{ fontWeight: 600 }}>
        {heading}
      </div>
      <p className="tiny dim" style={{ margin: 0 }}>
        {explanation}
      </p>
      {items.length === 0 && <p className="tiny dim">No item on this instrument to link.</p>}
      <div className="stack-sm" style={{ maxHeight: 280, overflowY: 'auto' }}>
        {items.map((i) => (
          <button
            key={i.id}
            className="btn btn-block"
            style={{ justifyContent: 'space-between', textAlign: 'start' }}
            onClick={() => setRefusal(onChoose(i.id) || null)}
          >
            <span dir="auto">{i.title}</span>
            {/* Generated English metadata, never user text. */}
            <span className="tiny faint" dir="ltr">
              {sameTitle?.(i) ? 'same title · ' : ''}
              {ITEM_STATUS_LABELS[i.status]}
            </span>
          </button>
        ))}
      </div>
      {refusal && (
        <p className="tiny" role="alert" style={{ color: 'var(--tone-alert)', margin: 0 }}>
          {refusal}
        </p>
      )}
      {alternative && (
        <button className="btn btn-sm" style={{ width: 'fit-content' }} onClick={() => setRefusal(alternative.run() || null)}>
          {alternative.label}
        </button>
      )}
      <button className="btn btn-ghost btn-sm" style={{ width: 'fit-content' }} onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}

/**
 * The same explicit choice from the ITEM's side: which suggestion an item the
 * owner placed in a stage answers. Only suggestions nothing answers yet are
 * offered; nothing happens until one is picked.
 */
export function SuggestionChoice({
  itemTitle,
  suggestions,
  onChoose,
  onCancel,
}: {
  itemTitle: string;
  suggestions: { ref: string; title: string }[];
  onChoose: (ref: string) => string | null | void;
  onCancel: () => void;
}) {
  const [refusal, setRefusal] = useState<string | null>(null);
  const heading = `Which suggestion is “${itemTitle}”?`;
  return (
    <div className="card card-quiet stack-sm" role="region" aria-label={heading}>
      <div className="small" style={{ fontWeight: 600 }}>
        Which suggestion is <span dir="auto">“{itemTitle}”</span>?
      </div>
      <p className="tiny dim" style={{ margin: 0 }}>
        Choose the suggestion this item is. Nothing about the item changes except that it now answers it.
      </p>
      {suggestions.length === 0 && <p className="tiny dim">Every suggestion here is already answered.</p>}
      {suggestions.map((u) => (
        <button key={u.ref} className="btn btn-block" style={{ textAlign: 'start' }} onClick={() => setRefusal(onChoose(u.ref) || null)}>
          <span dir="auto">{u.title}</span>
        </button>
      ))}
      {refusal && (
        <p className="tiny" role="alert" style={{ color: 'var(--tone-alert)', margin: 0 }}>
          {refusal}
        </p>
      )}
      <button className="btn btn-ghost btn-sm" style={{ width: 'fit-content' }} onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}

export function SourceChoice({
  courseName,
  materials,
  items,
  ack,
  onChoose,
  onCancel,
}: {
  courseName: string;
  materials: Material[];
  /** The items the answer is given to — named, because only those are. */
  items: PracticeItem[];
  /** The saved outcome of the last choice: it stays on screen until acknowledged. */
  ack?: Ack;
  onChoose: (materialId: string) => void;
  onCancel: () => void;
}) {
  return (
    <div className="card card-quiet stack-sm" role="region" aria-label="Choose the study source">
      <div className="small" style={{ fontWeight: 600 }}>
        Which study source is <span dir="auto">{courseName}</span>?
      </div>
      <p className="tiny dim" style={{ margin: 0 }}>
        More than one of your sources could be this course. Choose the one to keep using — nothing is merged or renamed.
      </p>
      <p className="tiny dim" style={{ margin: 0 }}>
        Your choice is given to{' '}
        {items.map((i, n) => (
          <span key={i.id}>
            {n > 0 && ', '}
            <span dir="auto">{i.title}</span>
          </span>
        ))}
        .
      </p>
      {materials.map((m) => (
        <button
          key={m.id}
          className="btn btn-block"
          style={{ textAlign: 'start' }}
          aria-pressed={ack?.carried === m.id}
          disabled={ack?.status === 'saving'}
          onClick={() => onChoose(m.id)}
        >
          <span dir="auto">{m.title}</span>
        </button>
      ))}
      <SaveStatus ack={ack} onRetry={() => ack && onChoose(ack.carried)} />
      <button className="btn btn-ghost btn-sm" style={{ width: 'fit-content' }} onClick={onCancel}>
        Decide later
      </button>
    </div>
  );
}
