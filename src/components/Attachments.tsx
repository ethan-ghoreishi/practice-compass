import { useEffect, useMemo, useRef, useState } from 'react';
import type { AttachmentMeta } from '../domain';
import { useStore } from '../store/useStore';
import { addAttachment, attachmentObjectURL, formatBytes, removeAttachment } from '../store/attachments';
import { MusicIcon, PlusIcon, ReportIcon } from './icons';

export default function Attachments({ itemId }: { itemId: string }) {
  const all = useStore((s) => s.db.attachments);
  const list = useMemo(
    () => all.filter((a) => a.itemId === itemId).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [all, itemId],
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      for (const f of Array.from(files)) await addAttachment(itemId, f);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <section className="stack-sm">
      <div className="row between">
        <div className="section-label">Files</div>
        <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} disabled={busy}>
          <PlusIcon /> {busy ? 'Adding…' : 'Add file'}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/pdf,image/*,audio/*"
        multiple
        hidden
        onChange={onFiles}
      />
      {list.length === 0 ? (
        <div className="card card-quiet small dim">
          Attach the PDFs, photos or scores for this item — your teacher's hand-outs, a page from the radif, a
          recording. They're stored on your device.
        </div>
      ) : (
        <div className="stack-sm">
          {list.map((a) => (
            <AttachmentRow key={a.id} att={a} />
          ))}
        </div>
      )}
    </section>
  );
}

function AttachmentRow({ att }: { att: AttachmentMeta }) {
  const [thumb, setThumb] = useState<string | null>(null);

  useEffect(() => {
    if (att.kind !== 'image') return;
    let alive = true;
    let url: string | null = null;
    attachmentObjectURL(att.id).then((u) => {
      if (alive && u) {
        url = u;
        setThumb(u);
      } else if (u) {
        URL.revokeObjectURL(u);
      }
    });
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [att.id, att.kind]);

  async function open() {
    const u = await attachmentObjectURL(att.id);
    if (u) {
      window.open(u, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(u), 60_000);
    }
  }

  return (
    <div className="card row" style={{ gap: 12 }}>
      {att.kind === 'image' && thumb ? (
        <img
          src={thumb}
          alt={att.name}
          style={{ width: 46, height: 46, objectFit: 'cover', borderRadius: 8, flex: 'none' }}
        />
      ) : (
        <div className="stage-badge" style={{ background: 'var(--surface-2)', color: 'var(--text-dim)' }}>
          {att.kind === 'audio' ? <MusicIcon width={18} height={18} /> : <ReportIcon width={18} height={18} />}
        </div>
      )}
      <button
        className="grow"
        style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'inherit', minWidth: 0 }}
        onClick={open}
      >
        <div className="truncate">{att.name}</div>
        <div className="tiny faint">
          {att.kind} · {formatBytes(att.size)}
        </div>
      </button>
      <button className="btn btn-sm" onClick={open}>
        Open
      </button>
      <button
        className="btn btn-ghost btn-sm btn-danger"
        onClick={() => {
          if (confirm(`Remove "${att.name}"?`)) removeAttachment(att.id);
        }}
      >
        Remove
      </button>
    </div>
  );
}
