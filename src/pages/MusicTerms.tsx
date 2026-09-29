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
import { Field, SaveStatus, useAcknowledgedSaves, type AckSaves } from '../components/ui';
import { ArrowLeftIcon, PlusIcon } from '../components/icons';

// ---------------------------------------------------------------------------
// Musical terms — the ONE small vocabulary for Dastgāh/Āvāz, Form and
// Composer/maestro. Compact by design: add, rename, edit spellings, archive
// and restore; delete only a custom term nothing uses. A rename keeps the id
// (so every piece that points at it follows) and keeps the old name as a
// spelling. Nothing here is required to classify a piece — typed text always
// works — and nothing here merges, bulk-edits or guesses.
//
// "Saved." means IndexedDB acknowledged the write, exactly as the item
// notebook does, and only for the text that write carried (`useAcknowledged-
// Saves`). A failed write keeps the draft on screen with Try again, which
// writes what is on screen NOW. Every outcome is held HERE, keyed by term, so
// archiving (the row moves), restoring or deleting (the row goes) never takes
// a failure and its Try again with it.
// ---------------------------------------------------------------------------

export default function MusicTerms() {
  const db = useStore((s) => s.db);
  const deleteTerm = useStore((s) => s.deleteTerm);
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/more';
  const vocab = useMemo(() => vocabulary(db.musicTerms), [db.musicTerms]);
  const [kind, setKind] = useState<MusicTermKind>('dastgah');
  const saves = useAcknowledgedSaves();
  // A deleted term has no row left to speak for it: its name is kept here so
  // its save outcome — and a Try again — still has somewhere to appear.
  const [deleted, setDeleted] = useState<Record<string, string>>({});

  const terms = vocab.terms.filter((t) => t.kind === kind);
  const live = terms.filter((t) => !t.archived);
  const archived = terms.filter((t) => t.archived);
  const remove = (term: MusicTerm) => {
    setDeleted((d) => ({ ...d, [term.id]: term.name }));
    saves.run(term.id, 'delete', () => deleteTerm(term.id));
  };
  const row = (t: MusicTerm) => (
    <TermRow key={t.id} term={t} users={itemsUsingTerm(db.items, t.id, vocab).length} saves={saves} onDelete={() => remove(t)} />
  );

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

      <AddTerm kind={kind} saves={saves} />

      {Object.entries(deleted).map(([id, name]) => (
        <SaveStatus
          key={id}
          ack={saves.states[id]}
          subject={<><span dir="auto">{name}</span> deleted — </>}
          onRetry={() => saves.run(id, 'delete', () => deleteTerm(id))}
        />
      ))}

      {/* ONE parent for live and archived rows, so archiving or restoring a
          term MOVES its row (state and all) instead of remounting it. */}
      <section className="stack-sm" aria-label={`${MUSIC_TERM_KIND_LABELS[kind]} terms`}>
        <div className="card card-flush list">
          {live.map(row)}
          {archived.length > 0 && (
            <div key="archived-heading" className="list-row section-label">
              Archived — still on your pieces, no longer offered
            </div>
          )}
          {archived.map(row)}
        </div>
      </section>
    </div>
  );
}

function AddTerm({ kind, saves }: { kind: MusicTermKind; saves: AckSaves }) {
  const addTerm = useStore((s) => s.addTerm);
  const updateTerm = useStore((s) => s.updateTerm);
  const [open, setOpen] = useState(false);
  const [name, setNameState] = useState('');
  const [aliases, setAliasesState] = useState('');
  // The live draft, readable when a write settles (a ref, never a render's copy).
  const draft = useRef({ name: '', aliases: '' });
  const setName = (v: string) => {
    draft.current = { ...draft.current, name: v };
    setNameState(v);
  };
  const setAliases = (v: string) => {
    draft.current = { ...draft.current, aliases: v };
    setAliasesState(v);
  };
  const keyOf = () => JSON.stringify([draft.current.name, draft.current.aliases]);
  // Once added, a retry or a later edit REWRITES that term rather than adding a second one.
  const addedId = useRef<string | null>(null);
  const ack = saves.states.new;

  function submit() {
    saves.run(
      'new',
      keyOf(),
      () => {
        const { name: n, aliases: a } = draft.current;
        if (addedId.current) return updateTerm(addedId.current, { name: n, aliases: parseAliases(a) });
        const result = addTerm({ kind, name: n, aliases: parseAliases(a) });
        if ('refusal' in result) return result.refusal;
        addedId.current = result.id;
        return null;
      },
      { current: keyOf, again: submit },
    );
  }

  function close() {
    // A fresh session next time: nothing from this one carries over.
    saves.reset('new');
    addedId.current = null;
    setName('');
    setAliases('');
    setOpen(false);
  }

  if (!open) {
    return (
      <button className="btn btn-sm" style={{ width: 'fit-content' }} onClick={() => setOpen(true)}>
        <PlusIcon /> Add a term
      </button>
    );
  }
  // Done only while what is on screen is exactly what storage acknowledged.
  const done = ack?.status === 'saved' && ack.carried === keyOf();
  return (
    <div className="card stack-sm">
      <Field label="Name">
        <input className="input" dir="auto" aria-label="Term name" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Other spellings" hint="One per line — each is an exact spelling that means this term.">
        <textarea className="textarea" dir="auto" aria-label="Other spellings" value={aliases} onChange={(e) => setAliases(e.target.value)} />
      </Field>
      <div className="row-wrap" style={{ gap: 8 }}>
        {!done && (
          <button className="btn btn-primary" disabled={!name.trim() || ack?.status === 'saving'} onClick={submit}>
            {addedId.current ? 'Save changes' : 'Add term'}
          </button>
        )}
        <button className="btn" onClick={close}>
          {done ? 'Done' : 'Cancel'}
        </button>
        <SaveStatus ack={ack} current={keyOf()} onRetry={submit} />
      </div>
    </div>
  );
}

function TermRow({ term, users, saves, onDelete }: { term: MusicTerm; users: number; saves: AckSaves; onDelete: () => void }) {
  const updateTerm = useStore((s) => s.updateTerm);
  const [editing, setEditing] = useState(false);
  const [name, setNameState] = useState(term.name);
  const [aliases, setAliasesState] = useState(term.aliases.join('\n'));
  const draft = useRef({ name: term.name, aliases: term.aliases.join('\n') });
  const setName = (v: string) => {
    draft.current = { ...draft.current, name: v };
    setNameState(v);
  };
  const setAliases = (v: string) => {
    draft.current = { ...draft.current, aliases: v };
    setAliasesState(v);
  };
  const editKey = () => JSON.stringify(['edit', draft.current.name, draft.current.aliases]);
  const builtIn = isBuiltInTerm(term.id);
  const ack = saves.states[term.id];

  const saveEdit = () =>
    saves.run(
      term.id,
      editKey,
      () => {
        const refusal = updateTerm(term.id, { name: draft.current.name, aliases: parseAliases(draft.current.aliases) });
        // An accepted rename keeps the FORMER name as a spelling. Show the
        // spellings the store now holds, so a Try again (or a second save)
        // writes them rather than quietly asking to remove that one.
        if (!refusal) {
          const saved = vocabulary(useStore.getState().db.musicTerms).byId.get(term.id);
          if (saved) setAliases(saved.aliases.join('\n'));
        }
        return refusal;
      },
      { current: editKey, again: saveEdit },
    );
  // Archive/restore writes the state the store now holds; a retry repeats it.
  const writeArchived = (archived: boolean) => saves.run(term.id, 'archive', () => updateTerm(term.id, { archived }));
  // `term` is the store's current state, which a failed write already holds.
  const retry = () => (ack?.carried === 'archive' ? writeArchived(!!term.archived) : saveEdit());

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
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => writeArchived(!term.archived)}
          aria-label={`${term.archived ? 'Restore' : 'Archive'} ${term.name}`}
        >
          {term.archived ? 'Restore' : 'Archive'}
        </button>
        {!builtIn && (
          <button
            className="btn btn-ghost btn-sm btn-danger"
            aria-label={`Delete ${term.name}`}
            disabled={users > 0}
            title={users > 0 ? 'Used by pieces — archive it instead' : undefined}
            onClick={() => {
              if (confirm(`Delete the term “${term.name}”? No piece uses it.`)) onDelete();
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
            <button className="btn btn-primary btn-sm" disabled={!name.trim() || ack?.status === 'saving'} onClick={saveEdit}>
              Save
            </button>
          </div>
        </div>
      )}
      {ack && ack.carried !== 'delete' && (
        <div style={{ width: '100%' }}>
          <SaveStatus ack={ack} current={ack.carried === 'archive' ? undefined : editKey()} onRetry={retry} />
        </div>
      )}
    </div>
  );
}
