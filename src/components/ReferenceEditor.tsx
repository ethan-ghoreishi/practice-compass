import { useState } from 'react';
import { useStore } from '../store/useStore';
import { getNasBaseUrl } from '../store/backup';
import { archiveRootUrl, normalizeBaseUrl, relativizeReference, resolveRecording, type LessonFileKind } from '../domain';
import { Field } from './ui';

// ---------------------------------------------------------------------------
// A DIRECT reference on a practice item.
//
// Useful material does not always come out of a class, and hanging it on an
// artificial lesson to make it visible is the kind of structure this app keeps
// refusing to invent. This attaches it to the piece itself — the same
// reference SHAPE and the same resolver as a lesson's own references and the
// archive's, so there is one way a file is named and one way it is opened.
//
// The bytes stay where they are. This is a path, never an upload, never an
// attachment blob, never anything that reaches sync or a backup payload.
// ---------------------------------------------------------------------------

const KINDS: LessonFileKind[] = ['video', 'pdf', 'doc', 'audio'];

export default function ReferenceEditor({ itemId }: { itemId: string }) {
  const item = useStore((s) => s.db.items.find((i) => i.id === itemId));
  const addItemReference = useStore((s) => s.addItemReference);
  const removeItemReference = useStore((s) => s.removeItemReference);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [path, setPath] = useState('');
  const [kind, setKind] = useState<LessonFileKind>('pdf');

  if (!item) return null;
  const base = getNasBaseUrl();
  const root = archiveRootUrl(base);
  // A pasted URL under this device's base is stored as the path beneath it, so
  // the reference survives a base change and works on the other device too.
  const stored = relativizeReference(base, path);
  const resolution = stored.trim() ? resolveRecording(base, { path: stored }) : null;
  const refs = item.references ?? [];

  function add() {
    if (!stored.trim()) return;
    addItemReference(itemId, { title, path: stored, kind });
    setTitle('');
    setPath('');
    setOpen(false);
  }

  return (
    <section className="stack-sm">
      <div className="row between">
        <span className="section-label" style={{ marginBottom: 0 }}>
          Direct links
        </span>
        <button type="button" className="btn btn-sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? 'Close' : 'Add a link'}
        </button>
      </div>

      {refs.length > 0 && (
        <ul className="stack-sm" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {/* Direction on the ROW, not on the title — and the row is a flex
              container, so its own resolved direction decides which side the
              Remove action sits on. */}
          {refs.map((r) => (
            <li key={r.id} className="row between" dir="auto" style={{ gap: 8, textAlign: 'start' }}>
              <span className="grow truncate">{r.title}</span>
              <button
                type="button"
                className="link tiny"
                style={LINK_BTN}
                aria-label={`Remove the link ${r.title}`}
                onClick={() => removeItemReference(itemId, r.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div className="stack-sm">
          <Field label="What is it?" hint="A name you will recognise later.">
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field
            label="Path or link"
            hint="Paste a link from the archive, or type the path under your media base. The bytes stay where they are."
          >
            <input
              className="input"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={path}
              onChange={(e) => setPath(e.target.value)}
            />
          </Field>
          <label className="tiny" style={{ textAlign: 'start' }}>
            <span dir="ltr">Kind</span>
            <select className="input" value={kind} onChange={(e) => setKind(e.target.value as LessonFileKind)}>
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          {resolution && (
            <div className="tiny faint" style={{ textAlign: 'start' }}>
              <span dir="ltr">
                {resolution.status === 'ok'
                  ? `Stored as “${stored}” and opened from this device’s media base.`
                  : resolution.status === 'no-base'
                    ? 'Set a media base URL in Settings before this can be opened.'
                    : resolution.status === 'unsafe'
                      ? 'That path points outside your media base, so it will not be opened.'
                      : 'That media base is not a usable web address.'}
              </span>
            </div>
          )}
          <div className="row" style={{ gap: 8 }}>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={add}
              disabled={!stored.trim() || resolution?.status === 'unsafe'}
            >
              Add link
            </button>
            {root && normalizeBaseUrl(base) && (
              <a className="btn btn-sm" href={root} target="_blank" rel="noreferrer">
                Open archive root
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

const LINK_BTN = { background: 'none', border: 'none', padding: 0 } as const;
