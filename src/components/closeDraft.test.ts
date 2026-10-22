import { describe, expect, it } from 'vitest';
import { closeDraftFor, closeDraftKey, dropCloseDraft, holdCloseDraft, type CloseDraft } from './closeDraft';

const draft = (key: string, observation: string): CloseDraft => ({
  key,
  sessionNote: undefined,
  result: 'same',
  observation,
  nextAction: '',
  correctedMinutes: null,
  comeBack: true,
  override: null,
  statusPick: null,
  focusPick: null,
  effortPick: null,
  becomeTeacherQ: false,
  teacherQText: '',
});

describe('the close draft', () => {
  it('belongs to one block, never its item, and only its own block clears it', () => {
    const first = closeDraftKey({ startedAt: '2026-10-20T20:00:00.000Z', itemId: 'it' });
    const second = closeDraftKey({ startedAt: '2026-10-20T20:30:00.000Z', itemId: 'it' });
    expect(first).not.toBe(second);

    holdCloseDraft(draft(first, 'fresh'));
    expect(closeDraftFor(first)?.observation).toBe('fresh');
    // The same item's NEXT block never receives it — and asking drops it.
    expect(closeDraftFor(second)).toBeNull();
    expect(closeDraftFor(first)).toBeNull();

    // An older block finishing cannot clear a newer block's draft.
    holdCloseDraft(draft(second, 'newer'));
    dropCloseDraft(first);
    expect(closeDraftFor(second)?.observation).toBe('newer');
    dropCloseDraft(second);
    expect(closeDraftFor(second)).toBeNull();
  });
});
