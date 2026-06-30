import { useRef, useState } from 'react';
import { parseImport, serializeExport } from '../domain';
import { useStore, type ThemePref } from '../store/useStore';
import { Field } from '../components/ui';
import { DownloadIcon, PlusIcon, UploadIcon } from '../components/icons';

const THEME_OPTIONS: { value: ThemePref; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function Settings() {
  const db = useStore((s) => s.db);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const addInstrument = useStore((s) => s.addInstrument);
  const updateInstrument = useStore((s) => s.updateInstrument);
  const importDB = useStore((s) => s.importDB);
  const resetDemo = useStore((s) => s.resetDemo);
  const clearAll = useStore((s) => s.clearAll);

  const fileRef = useRef<HTMLInputElement>(null);
  const [newInstrument, setNewInstrument] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  function flash(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2400);
  }

  function exportFile() {
    const blob = new Blob([serializeExport(db)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `practice-compass-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash('Exported backup file.');
  }

  async function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const result = parseImport(text);
    if (!result.ok) {
      flash(`Import failed: ${result.error}`);
    } else if (confirm('Importing will replace all current data. Continue?')) {
      importDB(result.db);
      flash('Data imported.');
    }
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="stack-lg">
      <header className="stack-sm">
        <h1 className="page-title">Settings &amp; backup</h1>
        <p className="page-sub">Everything stays on this device.</p>
      </header>

      <section className="stack-sm">
        <div className="section-label">Appearance</div>
        <div className="options">
          {THEME_OPTIONS.map((o) => (
            <button
              key={o.value}
              className={`option${theme === o.value ? ' selected' : ''}`}
              onClick={() => setTheme(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </section>

      <section className="stack-sm">
        <div className="section-label">Instruments</div>
        <div className="card stack-sm">
          {db.instruments.map((inst) => (
            <div key={inst.id} className="row" style={{ gap: 8 }}>
              <input
                className="input grow"
                value={inst.name}
                onChange={(e) => updateInstrument(inst.id, { name: e.target.value })}
              />
              <button
                className={`btn btn-sm${inst.active ? ' btn-primary' : ''}`}
                onClick={() => updateInstrument(inst.id, { active: !inst.active })}
                title={inst.active ? 'Active — tap to hide from quick start' : 'Hidden — tap to activate'}
              >
                {inst.active ? 'Active' : 'Hidden'}
              </button>
            </div>
          ))}
          <div className="row" style={{ gap: 8 }}>
            <input
              className="input grow"
              placeholder="Add an instrument…"
              value={newInstrument}
              onChange={(e) => setNewInstrument(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newInstrument.trim()) {
                  addInstrument({ name: newInstrument });
                  setNewInstrument('');
                }
              }}
            />
            <button
              className="btn btn-sm"
              disabled={!newInstrument.trim()}
              onClick={() => {
                addInstrument({ name: newInstrument });
                setNewInstrument('');
              }}
            >
              <PlusIcon /> Add
            </button>
          </div>
        </div>
      </section>

      <section className="stack-sm">
        <div className="section-label">Data &amp; backup</div>
        <div className="card stack-sm">
          <div className="row-wrap small dim">
            {db.instruments.length} instruments · {db.materials.length} materials · {db.items.length} items ·{' '}
            {db.blocks.length} blocks
          </div>
          <div className="grid-2">
            <button className="btn" onClick={exportFile}>
              <DownloadIcon /> Export JSON
            </button>
            <button className="btn" onClick={() => fileRef.current?.click()}>
              <UploadIcon /> Import JSON
            </button>
          </div>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImportFile} />
          <Field hint="Replaces all data with the original demo dataset.">
            <button
              className="btn btn-sm"
              onClick={() => {
                if (confirm('Reset to demo data? This replaces everything.')) {
                  resetDemo();
                  flash('Demo data restored.');
                }
              }}
            >
              Reset demo data
            </button>
          </Field>
          <Field hint="Removes all instruments, items and history.">
            <button
              className="btn btn-sm btn-danger"
              onClick={() => {
                if (confirm('Erase ALL data? This cannot be undone.')) {
                  clearAll();
                  flash('All data cleared.');
                }
              }}
            >
              Clear all data
            </button>
          </Field>
        </div>
      </section>

      {message && <div className="toast">{message}</div>}
    </div>
  );
}
