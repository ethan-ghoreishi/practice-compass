import { useEffect, useMemo, useState } from 'react';
import { formatFileSize, itemFiles, resolveRecording, type ItemFile } from '../domain';
import { useStore } from '../store/useStore';
import { getNasBaseUrl } from '../store/backup';
import { attachmentObjectURL } from '../store/attachments';
import { MusicIcon, PlayIcon, ReportIcon } from './icons';

/**
 * The files that already belong to a piece — the class video and score from the
 * lessons it is linked to, plus its own attachments — composed by `itemFiles`
 * and nothing new stored to make it work.
 *
 * The two kinds open by different mechanisms and this component never confuses
 * them: a reference goes through the NAS base URL, an attachment through a
 * blob. Only a local image renders inline; everything else is an explicit open,
 * never an embed, so large media stays on the NAS and this stays a list.
 */
export default function ItemMaterial({
  itemId,
  omitAttachments = false,
}: {
  itemId: string;
  /** ItemDetail already has its own Files section with add/remove. */
  omitAttachments?: boolean;
}) {
  const db = useStore((s) => s.db);
  const files = useMemo(() => {
    const all = itemFiles(db, itemId);
    return omitAttachments ? all.filter((f) => f.source === 'reference') : all;
  }, [db, itemId, omitAttachments]);

  if (files.length === 0) return null;

  return (
    <div className="stack-sm">
      {files.map((f) => (
        <FileRow key={`${f.source}-${f.id}`} file={f} />
      ))}
    </div>
  );
}

function KindIcon({ file }: { file: ItemFile }) {
  const kind = file.kind;
  if (kind === 'video') return <PlayIcon width={18} height={18} />;
  if (kind === 'audio') return <MusicIcon width={18} height={18} />;
  return <ReportIcon width={18} height={18} />;
}

function FileRow({ file }: { file: ItemFile }) {
  return file.source === 'reference' ? <ReferenceRow file={file} /> : <AttachmentRow file={file} />;
}

/** A NAS reference: resolved through the configured base, opened on tap only. */
function ReferenceRow({ file }: { file: Extract<ItemFile, { source: 'reference' }> }) {
  const resolution = resolveRecording(getNasBaseUrl(), file);
  const size = formatFileSize(file.sizeBytes);

  return (
    <div className="card row" style={{ gap: 12 }}>
      <div className="stage-badge" style={{ background: 'var(--surface-2)', color: 'var(--text-dim)' }}>
        <KindIcon file={file} />
      </div>
      <div className="grow" style={{ minWidth: 0, textAlign: 'left' }}>
        <div className="truncate" dir="auto">
          {file.title}
        </div>
        <div className="tiny faint">
          On your NAS · {file.kind}
          {size ? ` · ${size}` : ''}
          {resolution.status === 'no-base' && ' · set a NAS base URL in Settings to open it'}
          {resolution.status === 'bad-base' && ' · your NAS base URL isn’t valid — check Settings'}
        </div>
      </div>
      <button
        className="btn btn-sm"
        disabled={resolution.status !== 'ok'}
        onClick={() => resolution.status === 'ok' && window.open(resolution.url, '_blank', 'noopener,noreferrer')}
      >
        Open
      </button>
    </div>
  );
}

/** A local attachment: a blob on this device. An image is shown, not just listed. */
function AttachmentRow({ file }: { file: Extract<ItemFile, { source: 'attachment' }> }) {
  const [preview, setPreview] = useState<string | null>(null);
  const size = formatFileSize(file.sizeBytes);

  useEffect(() => {
    if (!file.inline) return;
    let alive = true;
    let url: string | null = null;
    attachmentObjectURL(file.id).then((u) => {
      if (!u) return;
      if (alive) {
        url = u;
        setPreview(u);
      } else {
        URL.revokeObjectURL(u);
      }
    });
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [file.id, file.inline]);

  async function open() {
    const u = await attachmentObjectURL(file.id);
    if (!u) return;
    window.open(u, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(u), 60_000);
  }

  return (
    <div className="card stack-sm">
      <div className="row" style={{ gap: 12 }}>
        <div className="stage-badge" style={{ background: 'var(--surface-2)', color: 'var(--text-dim)' }}>
          <KindIcon file={file} />
        </div>
        <div className="grow" style={{ minWidth: 0, textAlign: 'left' }}>
          <div className="truncate" dir="auto">
            {file.title}
          </div>
          <div className="tiny faint">
            On this device · {file.kind}
            {size ? ` · ${size}` : ''}
          </div>
        </div>
        <button className="btn btn-sm" onClick={open}>
          Open
        </button>
      </div>
      {preview && (
        <img
          src={preview}
          alt={file.title}
          style={{ width: '100%', maxHeight: 320, objectFit: 'contain', borderRadius: 8 }}
        />
      )}
    </div>
  );
}
