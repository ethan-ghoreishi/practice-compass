import { describe, expect, it } from 'vitest';
// The scanner is a Node build script (.mjs), but its parsing helpers are pure
// and worth guarding against the real folder's messy names.
// @ts-expect-error — no types for the .mjs script; we only use pure helpers.
import { parseSessionFolderName, pickMainVideo, renderBlock, spliceBlock } from '../../scripts/scan-setar-classes.mjs';

describe('parseSessionFolderName', () => {
  it('parses session-N-DD-MM-YYYY into number + ISO date', () => {
    expect(parseSessionFolderName('session-1-26-09-2023')).toEqual({ n: 1, date: '2023-09-26' });
    expect(parseSessionFolderName('session-37-09-07-2026')).toEqual({ n: 37, date: '2026-07-09' });
    expect(parseSessionFolderName('session-12-06-08-2024')).toEqual({ n: 12, date: '2024-08-06' });
  });

  it('rejects non-session folders', () => {
    expect(parseSessionFolderName('old-class')).toBeNull();
    expect(parseSessionFolderName('practice')).toBeNull();
    expect(parseSessionFolderName('session-1')).toBeNull();
    expect(parseSessionFolderName('کتاب-گنجینه')).toBeNull();
  });
});

describe('pickMainVideo', () => {
  it('picks the largest video (the full class), ignoring practice clips', () => {
    const files = [
      { name: 'clip.mp4', size: 5_000 },
      { name: 'video-20240903-meeting-recording.mp4', size: 90_000_000 },
      { name: 'notes.pdf', size: 800 },
    ];
    expect(pickMainVideo(files)).toBe('video-20240903-meeting-recording.mp4');
  });

  it('tolerates spaces in the filename (session 36)', () => {
    const files = [{ name: '2026-06-09 19.29.16.mp4', size: 325_389_004 }];
    expect(pickMainVideo(files)).toBe('2026-06-09 19.29.16.mp4');
  });

  it('accepts .mov as well and returns undefined when there is no video', () => {
    expect(pickMainVideo([{ name: 'a.mov', size: 10 }, { name: 'b.mov', size: 20 }])).toBe('b.mov');
    expect(pickMainVideo([{ name: 'score.pdf', size: 10 }])).toBeUndefined();
  });
});

describe('renderBlock + spliceBlock (idempotent codegen)', () => {
  const sessions = [{ n: 1, date: '2023-09-26', video: 'setar-classes/s1/a b.mp4', sizeBytes: 42, pdfs: [], docs: [] }];

  it('renders a valid TS array with a docs field only when non-empty', () => {
    const block = renderBlock(sessions);
    expect(block).toContain('export const SETAR_CLASS_SESSIONS');
    expect(block).toContain('"setar-classes/s1/a b.mp4"');
    expect(block).not.toContain('docs:'); // empty docs omitted
    const withDocs = renderBlock([{ ...sessions[0], docs: ['setar-classes/s1/x.jpg'] }]);
    expect(withDocs).toContain('docs: ["setar-classes/s1/x.jpg"]');
  });

  it('splices between the markers, preserving surrounding code', () => {
    const file = ['top', '// [scan:begin]', 'OLD', '// [scan:end]', 'bottom'].join('\n');
    const out = spliceBlock(file, 'NEW');
    expect(out).toContain('top');
    expect(out).toContain('bottom');
    expect(out).toContain('NEW');
    expect(out).not.toContain('OLD');
  });

  it('throws when the markers are missing', () => {
    expect(() => spliceBlock('no markers here', 'NEW')).toThrow(/markers/);
  });
});
