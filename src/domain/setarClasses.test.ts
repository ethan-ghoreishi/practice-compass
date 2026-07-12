import { describe, expect, it } from 'vitest';
import { buildSetarClassLessons, SETAR_CLASS_SESSIONS } from './setarClasses';

const NOW = new Date('2026-07-20T12:00:00Z');

describe('Setar class import', () => {
  it('has 37 monthly sessions, each with a NAS-relative video path (never bytes)', () => {
    expect(SETAR_CLASS_SESSIONS.length).toBe(37);
    for (const s of SETAR_CLASS_SESSIONS) {
      expect(s.video.startsWith('setar-classes/')).toBe(true);
      expect(s.video).not.toMatch(/^https?:|^data:/); // a path, not embedded data
      expect(s.sizeBytes).toBeGreaterThan(0);
    }
  });

  it('builds one lesson per session with a single recording reference', () => {
    const lessons = buildSetarClassLessons('setar', new Set(), NOW);
    expect(lessons).toHaveLength(37);
    for (const l of lessons) {
      expect(l.instrumentId).toBe('setar');
      expect(l.recordings).toHaveLength(1);
      expect(l.recordings![0].path.startsWith('setar-classes/')).toBe(true);
      expect(l.recordings![0].sizeBytes).toBeGreaterThan(0);
    }
  });

  it('is additive — skips dates that already have a lesson (safe to re-run)', () => {
    const firstDate = SETAR_CLASS_SESSIONS[0].date;
    const lessons = buildSetarClassLessons('setar', new Set([firstDate]), NOW);
    expect(lessons).toHaveLength(36);
    expect(lessons.some((l) => l.date === firstDate)).toBe(false);
  });

  it('imports nothing when every date is already present', () => {
    const all = new Set(SETAR_CLASS_SESSIONS.map((s) => s.date));
    expect(buildSetarClassLessons('setar', all, NOW)).toHaveLength(0);
  });

  it('records the session number and any score PDFs in the reference notes', () => {
    const withPdf = SETAR_CLASS_SESSIONS.find((s) => s.pdfs.length > 0)!;
    const lessons = buildSetarClassLessons('setar', new Set(), NOW);
    const l = lessons.find((x) => x.date === withPdf.date)!;
    expect(l.recordings![0].title).toMatch(new RegExp(`Session ${withPdf.n}`));
    expect(l.recordings![0].notes).toBeTruthy();
  });
});
