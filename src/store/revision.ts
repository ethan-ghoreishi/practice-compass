import type { StateCreator } from 'zustand';

/**
 * Store middleware: bump a monotonic `rev` counter whenever a mutation
 * produces a new `db` object. Every store action (add/edit/delete across all
 * collections, imports, attachment metadata, instruments, pathways, stages,
 * routines, reviews) replaces `db`, so `rev` is a reliable "something
 * changed" signal for sync scheduling and status display. Sync DECISIONS use
 * the content hash (domain/canonical.ts), not this counter.
 */

interface HasDbAndRev {
  db: unknown;
  rev: number;
}

export function withRevision<T extends HasDbAndRev>(config: StateCreator<T, [], []>): StateCreator<T, [], []> {
  return (set, get, api) => {
    type SetArgs = Parameters<typeof set>;

    const bumpingSet = (partial: SetArgs[0], replace?: SetArgs[1]) => {
      if (replace === true) {
        // Whole-state replacement (not used by our actions, but stay correct).
        const next = typeof partial === 'function' ? (partial as (s: T) => T)(get()) : (partial as T);
        const bumped = next.db !== get().db ? { ...next, rev: (get().rev ?? 0) + 1 } : next;
        (set as (p: T, r: true) => void)(bumped, true);
        return;
      }
      set((state) => {
        const patch = (typeof partial === 'function' ? (partial as (s: T) => Partial<T>)(state) : partial) as Partial<T>;
        const dbChanged = 'db' in patch && patch.db !== undefined && patch.db !== state.db;
        return dbChanged ? { ...patch, rev: (state.rev ?? 0) + 1 } : patch;
      }, replace as false | undefined);
    };

    // Also wrap direct api.setState calls (hydration seeding, imports).
    const origSetState = api.setState;
    api.setState = ((partial: SetArgs[0], replace?: SetArgs[1]) => {
      if (replace === true) {
        origSetState(partial as T, true);
        return;
      }
      origSetState((state: T) => {
        const patch = (typeof partial === 'function' ? (partial as (s: T) => Partial<T>)(state) : partial) as Partial<T>;
        const dbChanged = 'db' in patch && patch.db !== undefined && patch.db !== state.db;
        return dbChanged ? { ...patch, rev: (state.rev ?? 0) + 1 } : patch;
      }, false);
    }) as typeof api.setState;

    return config(bumpingSet as typeof set, get, api);
  };
}
