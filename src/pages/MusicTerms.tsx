import { useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  isBuiltInTerm,
  itemsUsingTerm,
  MUSIC_TERM_KIND_LABELS,
  MUSIC_TERM_KINDS,
  parseAliases,
  vocabulary,
  type MusicTerm,
  type MusicTermKind,
} from '../domain';
import { useStore } from '../store/useStore';
import { storageSettled } from '../store/idb';
import { Field } from '../components/ui';
import { ArrowLeftIcon, PlusIcon } from '../components/icons';

// ---------------------------------------------------------------------------
// Musical terms — the ONE small vocabulary for Dastgāh/Āvāz, Form and
// Composer/maestro. Compact by design: add, rename, edit spellings, archive
// and restore; delete only a custom term nothing uses. A rename keeps the id
// (so every piece that points at it follows) and keeps the old name as a
// spelling. Nothing here is required to classify a piece — typed text always
// works — and nothing here merges, bulk-edits or guesses.
//
// "Saved." means IndexedDB acknowledged the write (`storageSettled`), exactly
// as the item notebook does. A failed write keeps the draft on screen with
// Try again, which writes what is on screen NOW.
// ---------------------------------------------------------------------------

type SaveState = { status: 'idle' } | { status: 'saving' } | { status: 'saved' } | { status: 'failed' } | { status: 'refused'; reason: string };

/** Run one store action, then report durability only once storage answers. */
function useAcknowledgedSave(): [SaveState, (action: () => string | null) => void] {
  const [state, setState] = useState<SaveState>({ status: 'idle' });
  const seq = useRef(0);
  const run = (action: () => string | null) => {
    const refusal = action();
    if (refusal) {
      setState({ status: 'refused', reason: refusal });
      return;
    }
    const mine = ++seq.current;
    setState({ status: 'saving' });
    // Captured in the same tick as the action: this write's own outcome.
    storageSettled().then(
      () => mine === seq.current && setState({ status: 'saved' }),
      () => mine === seq.current && setState({ status: 'failed' }),
    );
  };
  return [state, run];
}

function SaveStatus({ state, onRetry }: { state: SaveState; onRetry: () => void }) {
  if (state.status === 'saving') return <span className="tiny faint" role="status">Saving…</span>;
  if (state.status === 'saved') return <span className="tiny" role="status">Saved.</span>;
  if (state.status === 'refused')
    return (
      <span className="tiny" role="alert" style={{ color: 'var(--tone-alert)' }}>
        {state.reason}
      </span>
    );
  if (state.status === 'failed')
    return (
      <span className="row tiny" role="alert" style={{ gap: 8, color: 'var(--tone-alert)' }}>
        Not saved — this device refused the write. Your text is still here.
        <button className="btn btn-sm" onClick={onRetry}>
          Try again
        </button>
      </span>
    );
  return null;
}

export default function MusicTerms() {
  const db = useStore((s) => s.db);
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/more';
  const vocab = useMemo(() => vocabulary(db.musicTerms), [db.musicTerms]);
  const [kind, setKind] = useState<MusicTermKind>('dastgah');

  const terms = vocab.terms.filter((t) => t.kind === kind);
  const live = terms.filter((t) => !t.archived);
  const archived = terms.filter((t) => t.archived);

  return (
    <div className="stack-lg">
      <Link to={from} className="link row" style={{ gap: 4, width: 'fit-content' }}>
        <ArrowLeftIcon width={16} height={16} /> Back
      </Link>
      <header className="stack-sm">
        <h1 className="page-title">Musical terms</h1>
        <p className="page-sub">
          The shared names your pieces are grouped and searched by. Choosing one on a piece links to it; anything you
          type instead stays your own text.
        </p>
      </header>

      <div className="options" role="group" aria-label="Kind of term">
        {MUSIC_TERM_KINDS.map((k) => (
          <button key={k} className={`option${kind === k ? ' selected' : ''}`} aria-pressed={kind === k} onClick={() => setKind(k)}>
            {MUSIC_TERM_KIND_LABELS[k]}
          </button>
        ))}
      </div>

      <AddTerm kind={kind} />

      <section className="stack-sm" aria-label={`${MUSIC_TERM_KIND_LABELS[kind]} terms`}>
        <div className="card card-flush list">
          {live.map((t) => (
            <TermRow key={t.id} term={t} users={itemsUsingTerm(db.items, t.id, vocab).length} />
          ))}
        </div>
      </section>

      {archived.length > 0 && (
        <section className="stack-sm">
          <div className="section-label">Archived — still on your pieces, no longer offered</div>
          <div className="card card-flush list">
            {archived.map((t) => (
              <TermRow key={t.id} term={t} users={itemsUsingTerm(db.items, t.id, vocab).length} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function AddTerm({ kind }: { kind: MusicTermKind }) {
  const addTerm = useStore((s) => s.addTerm);
  const updateTerm = useStore((s) => s.updateTerm);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [aliases, setAliases] = useState('');
  // Once added, a retry REWRITES that term rather than adding a second one.
  const [addedId, setAddedId] = useState<string | null>(null);
  const [save, run] = useAcknowledgedSave();

  function submit() {
    run(() => {
      if (addedId) return updateTerm(addedId, { name, aliases: parseAliases(aliases) });
      const result = addTerm({ kind, name, aliases: parseAliases(aliases) });
      if ('refusal' in result) return result.refusal;
      setAddedId(result.id);
      return null;
    });
  }

  if (!open) {
    return (
      <button className="btn btn-sm" style={{ width: 'fit-content' }} onClick={() => setOpen(true)}>
        <PlusIcon /> Add a term
      </button>
    );
  }
  const done = save.status === 'saved';
  return (
    <div className="card stack-sm">
      <Field label="Name">
        <input className="input" dir="auto" aria-label="Term name" value={name} onChange={(e) => setName(e.target.value)} disabled={done} />
      </Field>
      <Field label="Other spellings" hint="One per line — each is an exact spelling that means this term.">
        <textarea className="textarea" dir="auto" aria-label="Other spellings" value={aliases} onChange={(e) => setAliases(e.target.value)} disabled={done} />
      </Field>
      <div className="row-wrap" style={{ gap: 8 }}>
        {!done && (
          <button className="btn btn-primary" disabled={!name.trim() || save.status === 'saving'} onClick={submit}>
            Add term
          </button>
        )}
        <button
          className="btn"
          onClick={() => {
            setOpen(false);
            setName('');
            setAliases('');
            setAddedId(null);
          }}
        >
          {done ? 'Done' : 'Cancel'}
        </button>
        <SaveStatus state={save} onRetry={submit} />
      </div>
    </div>
  );
}

function TermRow({ term, users }: { term: MusicTerm; users: number }) {
  const updateTerm = useStore((s) => s.updateTerm);
  const deleteTerm = useStore((s) => s.deleteTerm);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(term.name);
  const [aliases, setAliases] = useState(term.aliases.join('\n'));
  const [save, run] = useAcknowledgedSave();
  const builtIn = isBuiltInTerm(term.id);
  // Try again repeats the action that failed, with what is on screen NOW.
  const [last, setLast] = useState<'edit' | 'archive'>('edit');

  const saveEdit = () => {
    setLast('edit');
    run(() => {
      const refusal = updateTerm(term.id, { name, aliases: parseAliases(aliases) });
      // An accepted rename keeps the FORMER name as a spelling. Show the
      // spellings the store now holds, so a Try again (or a second save)
      // writes them rather than quietly asking to remove that one.
      if (!refusal) {
        const saved = vocabulary(useStore.getState().db.musicTerms).byId.get(term.id);
        if (saved) setAliases(saved.aliases.join('\n'));
      }
      return refusal;
    });
  };
  const toggleArchive = () => {
    setLast('archive');
    run(() => updateTerm(term.id, { archived: !term.archived }));
  };

  return (
    <div className="list-row" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div className="grow" dir="auto" style={{ minWidth: 0 }}>
        <div className="row-title">{term.name}</div>
        {/* Generated English metadata, never user text. Spellings stay behind
            Edit — a mixed-script list on every row is noise, not guidance. */}
        <div className="tiny faint">
          <span dir="ltr">
            {builtIn ? 'built-in' : 'yours'} · {term.aliases.length} other spelling{term.aliases.length === 1 ? '' : 's'} ·{' '}
            {users} piece{users === 1 ? '' : 's'}
            {term.archived ? ' · archived' : ''}
          </span>
        </div>
      </div>
      <div className="row-wrap" style={{ gap: 6 }}>
        <button
          className="btn btn-ghost btn-sm"
          aria-expanded={editing}
          aria-label={`${editing ? 'Close' : 'Edit'} ${term.name}`}
          onClick={() => {
            setName(term.name);
            setAliases(term.aliases.join('\n'));
            setEditing((e) => !e);
          }}
        >
          {editing ? 'Close' : 'Edit'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={toggleArchive} aria-label={`${term.archived ? 'Restore' : 'Archive'} ${term.name}`}>
          {term.archived ? 'Restore' : 'Archive'}
        </button>
        {!builtIn && (
          <button
            className="btn btn-ghost btn-sm btn-danger"
            aria-label={`Delete ${term.name}`}
            disabled={users > 0}
            title={users > 0 ? 'Used by pieces — archive it instead' : undefined}
            onClick={() => {
              if (confirm(`Delete the term “${term.name}”? No piece uses it.`)) run(() => deleteTerm(term.id));
            }}
          >
            Delete
          </button>
        )}
      </div>
      {editing && (
        <div className="stack-sm" style={{ width: '100%', marginTop: 8 }}>
          <Field label="Name">
            <input className="input" dir="auto" aria-label={`Name of ${term.name}`} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Other spellings" hint="One per line. A renamed term keeps its old name here, so pieces written that way still belong to it.">
            <textarea className="textarea" dir="auto" aria-label={`Spellings of ${term.name}`} value={aliases} onChange={(e) => setAliases(e.target.value)} />
          </Field>
          <div className="row-wrap" style={{ gap: 8 }}>
            <button className="btn btn-primary btn-sm" disabled={!name.trim() || save.status === 'saving'} onClick={saveEdit}>
              Save
            </button>
          </div>
        </div>
      )}
      {save.status !== 'idle' && (
        <div style={{ width: '100%' }}>
          <SaveStatus state={save} onRetry={last === 'edit' ? saveEdit : () => run(() => updateTerm(term.id, { archived: term.archived }))} />
        </div>
      )}
    </div>
  );
}
