import { useState } from 'react';
import { ITEM_STATUS_LABELS, type Material, type PracticeItem } from '../domain';

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
}: {
  heading: string;
  explanation: string;
  items: PracticeItem[];
  /** Candidates whose title matches the suggestion's, shown first and marked. */
  sameTitle?: (item: PracticeItem) => boolean;
  onChoose: (itemId: string) => string | null | void;
  onCancel: () => void;
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
      <button className="btn btn-ghost btn-sm" style={{ width: 'fit-content' }} onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}

export function SourceChoice({
  courseName,
  materials,
  onChoose,
  onCancel,
}: {
  courseName: string;
  materials: Material[];
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
      {materials.map((m) => (
        <button key={m.id} className="btn btn-block" style={{ textAlign: 'start' }} onClick={() => onChoose(m.id)}>
          <span dir="auto">{m.title}</span>
        </button>
      ))}
      <button className="btn btn-ghost btn-sm" style={{ width: 'fit-content' }} onClick={onCancel}>
        Decide later
      </button>
    </div>
  );
}
