import { describe, expect, it } from 'vitest';
import { formatFileSize, needsBaseUrl, resolveRecordingUrl } from './recordings';

describe('resolveRecordingUrl', () => {
  const base = 'https://nas.example.ts.net/media';

  it('uses a full https URL as-is', () => {
    expect(resolveRecordingUrl(undefined, { path: 'https://x.ts.net/a/b.mp4' })).toBe('https://x.ts.net/a/b.mp4');
  });

  it('joins a relative path under the base URL', () => {
    expect(resolveRecordingUrl(base, { path: 'setar-classes/session-37/class.mp4' })).toBe(
      'https://nas.example.ts.net/media/setar-classes/session-37/class.mp4',
    );
  });

  it('URL-encodes spaces and Farsi filenames per segment', () => {
    const url = resolveRecordingUrl(base, { path: 'setar-classes/session-36/2026-06-09 19.29.16.mp4' })!;
    expect(url).toContain('2026-06-09%2019.29.16.mp4');
    const farsi = resolveRecordingUrl(base, { path: 'setar-classes/چهارمضراب-صبا.pdf' })!;
    expect(farsi).toContain('%D8%'); // percent-encoded Farsi
    expect(farsi.startsWith(base)).toBe(true);
  });

  it('tolerates trailing/leading slashes', () => {
    expect(resolveRecordingUrl('https://nas/media/', { path: '/a/b.mp4' })).toBe('https://nas/media/a/b.mp4');
  });

  it('returns null for a relative path with no base URL (must prompt)', () => {
    expect(resolveRecordingUrl(undefined, { path: 'setar-classes/x.mp4' })).toBeNull();
    expect(resolveRecordingUrl('', { path: 'setar-classes/x.mp4' })).toBeNull();
  });

  it('returns null for an empty path', () => {
    expect(resolveRecordingUrl(base, { path: '  ' })).toBeNull();
  });
});

describe('needsBaseUrl', () => {
  it('is true only for a relative path without a base', () => {
    expect(needsBaseUrl(undefined, { path: 'a/b.mp4' })).toBe(true);
    expect(needsBaseUrl('https://nas', { path: 'a/b.mp4' })).toBe(false);
    expect(needsBaseUrl(undefined, { path: 'https://nas/a.mp4' })).toBe(false);
  });
});

describe('formatFileSize', () => {
  it('formats KB/MB/GB, and returns null for missing sizes', () => {
    expect(formatFileSize(500 * 1024)).toBe('500 KB');
    expect(formatFileSize(325 * 1024 * 1024)).toBe('325 MB');
    expect(formatFileSize(686 * 1024 * 1024)).toBe('686 MB');
    expect(formatFileSize(2.5 * 1024 * 1024 * 1024)).toBe('2.5 GB');
    expect(formatFileSize(undefined)).toBeNull();
    expect(formatFileSize(0)).toBeNull();
  });
});
