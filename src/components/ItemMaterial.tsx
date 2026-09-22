import { useEffect, useMemo, useState } from 'react';
import {
  SOURCE_ROLE_LABELS,
  archiveFor,
  baseForItemFile,
  formatFileSize,
  itemFiles,
  lessonFiles,
  repeatChains,
  resolveRecording,
  type ItemFile,
} from '../domain';
import { useStore } from '../store/useStore';
import { getMediaRoot, getNasBaseUrl } from '../store/backup';
import { attachmentObjectURL } from '../store/attachments';
import { MusicIcon, PlayIcon, ReportIcon } from './icons';

/**
 * The files that already belong to a piece — the class video and score from the
 * lessons it is linked to, plus its own attachments — composed by `itemFiles`
 * and nothing new stored to make it work. Always the FULL composed list, in one
 * place: a reference and an attachment for the same piece are never split
 * across two sections of the screen.
 *
 * The two kinds open by different mechanisms and this component never confuses
 * them: a reference goes through the NAS base URL, an attachment through a
 * blob. Only a local image renders inline; everything else is an explicit open,
 * never an embed, so large media stays on the NAS and this stays a list.
 */
export default function ItemMaterial({ itemId }: { itemId: string }) {
  const db = useStore((s) => s.db);
  const hide = useStore((s) => s.hideArchiveResource);
  const files = useMemo(() => itemFiles(db, itemId), [db, itemId]);
  const archiveId = db.items.find((i) => i.id === itemId)?.source?.archiveId;

  if (files.length === 0) return null;

  return (
    <div className="stack-sm">
      <RepeatChains itemId={itemId} />
      {files.map((f) => (
        <FileRow
          key={`${f.source}-${f.id}`}
          file={f}
          // Hiding is scoped to THIS item: a demonstration shared by eight
          // pieces stays available to the other seven.
          onHide={
            archiveId && f.source === 'reference' && f.archive
              ? () => hide(archiveId, f.path, itemId)
              : undefined
          }
        />
      ))}
    </div>
  );
}

/**
 * A lesson's own material, composed the same way — an archive-bound class
 * carries no copy of its session's files, so reading `lesson.recordings` alone
 * would show nothing at all.
 */
export function LessonMaterial({ lessonId }: { lessonId: string }) {
  const db = useStore((s) => s.db);
  const files = useMemo(() => lessonFiles(db, lessonId), [db, lessonId]);
  if (files.length === 0) return null;
  return (
    <div className="stack-sm">
      {files.map((f) => (
        <FileRow key={`${f.source}-${f.id}`} file={f} />
      ))}
    </div>
  );
}

/**
 * "Practised in classes 22-27" — the archive's own repeat evidence, derived from
 * the graph and never cached beside it.
 *
 * Deliberately worded as CLASSES. The same run described as "six weeks" would
 * be a claim about time nobody recorded, and this whole feature exists on the
 * understanding that an archive describes and never testifies: it is a count of
 * classes the piece came back in, not practice this app has any record of.
 */
function RepeatChains({ itemId }: { itemId: string }) {
  const db = useStore((s) => s.db);
  const item = db.items.find((i) => i.id === itemId);
  const source = item?.source ? archiveFor(db, item.source.archiveId) : undefined;
  const chains = useMemo(
    () => (source && item?.source ? repeatChains(source, item.source.pieceKey) : []),
    [source, item?.source],
  );
  if (chains.length === 0) return null;
  return (
    <div className="tiny faint" style={{ textAlign: 'start' }}>
      <span dir="ltr">
        Came back in{' '}
        {chains
          .map((run) => (run.length > 2 ? `classes ${run[0]}–${run[run.length - 1]}` : `classes ${run.join(' and ')}`))
          .join(', ')}
        .
      </span>
    </div>
  );
}

function KindIcon({ file }: { file: ItemFile }) {
  const kind = file.kind;
  if (kind === 'video') return <PlayIcon width={18} height={18} />;
  if (kind === 'audio') return <MusicIcon width={18} height={18} />;
  return <ReportIcon width={18} height={18} />;
}

function FileRow({ file, onHide }: { file: ItemFile; onHide?: () => void }) {
  return file.source === 'reference' ? <ReferenceRow file={file} onHide={onHide} /> : <AttachmentRow file={file} />;
}

/** A NAS reference: resolved through the configured base, opened on tap only. */
function ReferenceRow({ file, onHide }: { file: Extract<ItemFile, { source: 'reference' }>; onHide?: () => void }) {
  // A class reference resolves against the archive base; a course file against
  // the shared media root one folder above it. `baseForItemFile` is the one
  // place that choice is made, so this row can never push one through the
  // other's base.
  const resolution = resolveRecording(
    baseForItemFile(file, { archiveBase: getNasBaseUrl(), mediaRoot: getMediaRoot() }),
    file,
  );
  const size = formatFileSize(file.sizeBytes);
  // PROVENANCE, stated plainly: which class this came out of, and what it is.
  // Generated English metadata, so it carries its own inline LTR isolate.
  const provenance = file.archive
    ? `Class ${file.archive.sessionN} · ${file.archive.date} · ${SOURCE_ROLE_LABELS[file.archive.role] ?? 'material'}${
        file.archive.part ? ` · part ${file.archive.part}` : ''
      }`
    : null;

  return (
    <div className="card row" style={{ gap: 12 }}>
      <div className="stage-badge" style={{ background: 'var(--surface-2)', color: 'var(--text-dim)' }}>
        <KindIcon file={file} />
      </div>
      <div className="grow" dir="auto" style={{ minWidth: 0, textAlign: 'start' }}>
        <div className="truncate">
          {file.title}
        </div>
        {/* Fixed English page copy, never user text — its own dir="ltr"
            isolate keeps it from inheriting a Farsi title's RTL base. This
            must be an inline isolate (span), not a block dir="ltr" div: a
            block establishes its own direction context, so text-align:start
            inherited from the group would resolve LEFT for it regardless of
            the group's own (possibly RTL) resolved direction — splitting the
            detail from the title it belongs to. */}
        <div className="tiny faint">
          <span dir="ltr">
            On your NAS · {file.kind}
            {size ? ` · ${size}` : ''}
            {resolution.status === 'no-base' &&
              (file.root === 'media'
                ? ' · set a media root in Settings to open it'
                : ' · set a NAS base URL in Settings to open it')}
            {resolution.status === 'bad-base' &&
              (file.root === 'media'
                ? ' · your media root isn’t valid — check Settings'
                : ' · your NAS base URL isn’t valid — check Settings')}
            {resolution.status === 'unsafe' && ' · this link points outside the archive and will not be opened'}
            {provenance ? ` · ${provenance}` : ''}
            {file.unavailable && ' · no longer in the archive'}
          </span>
        </div>
      </div>
      <button
        className="btn btn-sm"
        disabled={resolution.status !== 'ok' || file.unavailable === true}
        onClick={() => resolution.status === 'ok' && window.open(resolution.url, '_blank', 'noopener,noreferrer')}
      >
        Open
      </button>
      {onHide && (
        <button className="btn btn-sm" aria-label={`Hide ${file.title} from this piece`} onClick={onHide}>
          Hide
        </button>
      )}
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
        <div className="grow" dir="auto" style={{ minWidth: 0, textAlign: 'start' }}>
          <div className="truncate">
            {file.title}
          </div>
          {/* Fixed English page copy, never user text — its own dir="ltr"
              isolate. Inline (span), not a block dir="ltr" div — see the
              ReferenceRow comment above for why the block form breaks
              alignment. */}
          <div className="tiny faint">
            <span dir="ltr">
              On this device · {file.kind}
              {size ? ` · ${size}` : ''}
            </span>
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
