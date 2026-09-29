import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isTracingViewport, startViewportTrace, stopViewportTrace, viewportTraceText } from '../components/useViewportGuard';
import {
  ChevronRightIcon,
  FolderIcon,
  InsightsIcon,
  ItemsIcon,
  ReportIcon,
  SettingsIcon,
} from '../components/icons';

const LINKS = [
  { to: '/insights', label: 'Insights', desc: 'Calm patterns from your practice', icon: InsightsIcon },
  { to: '/report', label: 'Teacher report', desc: 'Copyable lesson summary', icon: ReportIcon },
  { to: '/terms', label: 'Musical terms', desc: 'Dastgāh, forms and maestros your pieces share', icon: ItemsIcon },
  { to: '/materials', label: 'Study sources', desc: 'Books, radif editions, collections and courses', icon: FolderIcon },
  { to: '/settings', label: 'Settings & backup', desc: 'Theme, instruments, export/import', icon: SettingsIcon },
];

export default function More() {
  return (
    <div className="stack-lg">
      <header className="stack-sm">
        <h1 className="page-title">More</h1>
        <p className="page-sub">Everything else, one tap away.</p>
      </header>

      <div className="card card-flush list">
        {LINKS.map(({ to, label, desc, icon: Icon }) => (
          <Link key={to} to={to} className="list-row card-link" style={{ borderRadius: 0 }}>
            <Icon width={22} height={22} style={{ color: 'var(--accent)', flex: 'none' }} />
            <div className="grow">
              <div>{label}</div>
              <div className="tiny faint">{desc}</div>
            </div>
            <ChevronRightIcon width={16} height={16} className="faint" />
          </Link>
        ))}
      </div>

      <KeyboardTrace />

      <p className="tiny faint" style={{ textAlign: 'center' }}>
        Practice Compass · local-first · one item, one focus.
      </p>
    </div>
  );
}

/**
 * The iPhone keyboard check (docs/repertoire-experience.md): record what the
 * device reports while the keyboard opens and closes, then copy it. Memory
 * only — nothing here is saved, synced or backed up.
 */
function KeyboardTrace() {
  const [recording, setRecording] = useState(isTracingViewport);
  const [text, setText] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  return (
    <details className="card card-quiet">
      <summary className="small">Keyboard trace</summary>
      <div className="stack-sm" style={{ marginTop: 8 }}>
        <p className="tiny dim" style={{ margin: 0 }}>
          For checking the bottom bar after the keyboard closes. Start, use the app as usual — type, tap Done, rotate,
          switch screens, leave and come back — then return here, stop and copy. Kept in memory only.
        </p>
        <div className="row" style={{ gap: 8 }}>
          <button
            className="btn btn-sm"
            onClick={() => {
              if (recording) {
                stopViewportTrace();
                setText(viewportTraceText());
              } else {
                startViewportTrace();
                setText('');
                setCopied(null);
              }
              setRecording(isTracingViewport());
            }}
          >
            {recording ? 'Stop recording' : 'Start recording'}
          </button>
          {text && (
            <button
              className="btn btn-sm"
              onClick={() =>
                navigator.clipboard?.writeText(text).then(
                  () => setCopied('Copied.'),
                  () => setCopied('Copy was refused — select the text below instead.'),
                ) ?? setCopied('Copy is unavailable — select the text below instead.')
              }
            >
              Copy trace
            </button>
          )}
        </div>
        {recording && <p className="tiny" role="status">Recording…</p>}
        {copied && (
          <p className="tiny" role="status">
            {copied}
          </p>
        )}
        {text && <textarea className="textarea" readOnly aria-label="Keyboard trace" value={text} rows={6} />}
      </div>
    </details>
  );
}
