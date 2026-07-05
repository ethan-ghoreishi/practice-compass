import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

/** Free-form running notes for an item — the "notebook" page. Saves on blur. */
export default function ItemNotes({ itemId }: { itemId: string }) {
  const item = useStore((s) => s.db.items.find((i) => i.id === itemId));
  const updateItem = useStore((s) => s.updateItem);
  const [text, setText] = useState(item?.notes ?? '');

  useEffect(() => {
    setText(item?.notes ?? '');
    // Only reset when switching items, not on every keystroke elsewhere.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  if (!item) return null;

  function save() {
    const next = text.trim() || undefined;
    if ((item!.notes ?? undefined) !== next) updateItem(itemId, { notes: next });
  }

  return (
    <section className="stack-sm">
      <div className="section-label">Notes</div>
      <textarea
        className="textarea"
        style={{ minHeight: 110 }}
        placeholder="Your running notes for this item — lesson notes, fingering reminders, what your teacher said…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={save}
      />
    </section>
  );
}
