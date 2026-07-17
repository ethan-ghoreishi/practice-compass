import { describe, expect, it } from 'vitest';
import {
  buildSetarClassLessons,
  cleanFileTitle,
  missingSessionReferences,
  SETAR_CLASS_SESSIONS,
} from './setarClasses';

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

  it('builds one lesson per session; the video ref is first, then one ref per PDF', () => {
    const lessons = buildSetarClassLessons('setar', new Set(), NOW);
    expect(lessons).toHaveLength(37);
    for (const l of lessons) {
      const session = SETAR_CLASS_SESSIONS.find((s) => s.date === l.date)!;
      expect(l.instrumentId).toBe('setar');
      // 1 video + one ref per PDF (+ docs).
      expect(l.recordings).toHaveLength(1 + session.pdfs.length + (session.docs?.length ?? 0));
      const video = l.recordings![0];
      expect(video.kind).toBe('video');
      expect(video.path.startsWith('setar-classes/')).toBe(true);
      expect(video.sizeBytes).toBeGreaterThan(0);
      expect(l.recordings!.filter((r) => r.kind === 'pdf')).toHaveLength(session.pdfs.length);
    }
  });

  it('numbers each lesson from the session number', () => {
    const lessons = buildSetarClassLessons('setar', new Set(), NOW);
    const byDate = new Map(lessons.map((l) => [l.date, l.number]));
    for (const s of SETAR_CLASS_SESSIONS) expect(byDate.get(s.date)).toBe(s.n);
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

  it('titles the video ref by session number and PDFs by cleaned filename', () => {
    const withPdf = SETAR_CLASS_SESSIONS.find((s) => s.pdfs.length > 0)!;
    const lessons = buildSetarClassLessons('setar', new Set(), NOW);
    const l = lessons.find((x) => x.date === withPdf.date)!;
    expect(l.recordings![0].title).toMatch(new RegExp(`Session ${withPdf.n}`));
    const pdfRef = l.recordings!.find((r) => r.kind === 'pdf')!;
    expect(pdfRef.title).not.toContain('.pdf');
    expect(pdfRef.title).not.toContain('/');
  });

  it('cleanFileTitle strips path, extension and separators (Farsi preserved)', () => {
    expect(cleanFileTitle('a/b/chahaar-mezrabe_afshaari.pdf')).toBe('chahaar mezrabe afshaari');
    expect(cleanFileTitle('setar-classes/x/به-یاد-گذشته-صبا.pdf')).toBe('به یاد گذشته صبا');
  });

  it('missingSessionReferences backfills only refs the lesson lacks (path-deduped)', () => {
    const s = SETAR_CLASS_SESSIONS.find((x) => x.pdfs.length > 0)!;
    // Lesson already has the video → only the PDF(s) are missing.
    const missing = missingSessionReferences(s, new Set([s.video]), NOW);
    expect(missing.every((r) => r.kind !== 'video')).toBe(true);
    expect(missing).toHaveLength(s.pdfs.length + (s.docs?.length ?? 0));
    // Nothing missing once every path is present.
    const allPaths = new Set([s.video, ...s.pdfs, ...(s.docs ?? [])]);
    expect(missingSessionReferences(s, allPaths, NOW)).toHaveLength(0);
  });
});
