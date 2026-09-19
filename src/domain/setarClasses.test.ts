import { describe, expect, it } from 'vitest';
import { cleanFileTitle, LEGACY_SEED_PATHS, SETAR_CLASS_SESSIONS } from './setarClasses';

// ---------------------------------------------------------------------------
// The legacy seed ledger. It is no longer an import workflow — Refresh Setar
// archive replaced that — but it is still the authoritative record of what the
// owner's own lesson references actually say, and ac-12 repairs every one of
// these paths. A change to it is a change to what has to be repaired.
// ---------------------------------------------------------------------------

describe('the legacy Setar seed ledger', () => {
  it('is 37 sessions and 67 obsolete paths, all under the archive folder', () => {
    expect(SETAR_CLASS_SESSIONS).toHaveLength(37);
    expect(LEGACY_SEED_PATHS).toHaveLength(67);
    expect(new Set(LEGACY_SEED_PATHS).size).toBe(67);
    for (const path of LEGACY_SEED_PATHS) {
      // Every one carries the archive FOLDER prefix — the extra leading
      // segment that the current, archive-relative paths do not have, and that
      // `toArchiveRelative` has to strip before a rename lookup can match.
      expect(path.startsWith('setar-classes/session-')).toBe(true);
    }
    // Session numbers are unique and sorted, and every date is a real day.
    const numbers = SETAR_CLASS_SESSIONS.map((s) => s.n);
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
    expect(new Set(numbers).size).toBe(37);
    for (const s of SETAR_CLASS_SESSIONS) {
      expect(s.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(s.date))).toBe(false);
    }
  });

  it('cleanFileTitle reads a filename as a title without touching the path', () => {
    expect(cleanFileTitle('setar-classes/session-1/chahaar-mezrabe-afshaari-sabaa.pdf')).toBe(
      'chahaar mezrabe afshaari sabaa',
    );
    expect(cleanFileTitle('session-13-03-09-2024/نمونه-1.mp4')).toBe('نمونه 1');
    expect(cleanFileTitle('a_b-c.mp4')).toBe('a b c');
  });
});
