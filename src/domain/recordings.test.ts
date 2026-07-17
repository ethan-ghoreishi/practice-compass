import { describe, expect, it } from 'vitest';
import { formatFileSize, needsBaseUrl, normalizeBaseUrl, resolveRecording, resolveRecordingUrl } from './recordings';

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

describe('normalizeBaseUrl', () => {
  it('prepends https:// to a scheme-less host (the reported bug)', () => {
    expect(normalizeBaseUrl('ds220plus.taild1d1f7.ts.net')).toBe('https://ds220plus.taild1d1f7.ts.net');
    expect(normalizeBaseUrl('ds220plus.taild1d1f7.ts.net/media')).toBe('https://ds220plus.taild1d1f7.ts.net/media');
  });

  it('keeps an explicit scheme and strips a trailing slash', () => {
    expect(normalizeBaseUrl('https://nas.ts.net/media/')).toBe('https://nas.ts.net/media');
    expect(normalizeBaseUrl('http://192.168.0.20:8080/x/')).toBe('http://192.168.0.20:8080/x');
  });

  it('returns null for blank or unparseable input', () => {
    expect(normalizeBaseUrl('')).toBeNull();
    expect(normalizeBaseUrl('   ')).toBeNull();
    expect(normalizeBaseUrl(undefined)).toBeNull();
    expect(normalizeBaseUrl('http://')).toBeNull();
    expect(normalizeBaseUrl('not a url at all')).toBeNull();
  });

  it('rejects non-http(s) schemes', () => {
    expect(normalizeBaseUrl('ftp://nas/media')).toBeNull();
    expect(normalizeBaseUrl('file:///Volumes/x')).toBeNull();
  });
});

describe('resolveRecording (status-aware)', () => {
  it('resolves a scheme-less base without collapsing to an in-app relative URL', () => {
    const r = resolveRecording('ds220plus.taild1d1f7.ts.net/media', { path: 'setar-classes/session-1/a.mp4' });
    expect(r).toEqual({ status: 'ok', url: 'https://ds220plus.taild1d1f7.ts.net/media/setar-classes/session-1/a.mp4' });
  });

  it('flags an unparseable base as bad-base (no silent wrong link)', () => {
    expect(resolveRecording('http://', { path: 'a/b.mp4' })).toEqual({ status: 'bad-base' });
  });

  it('flags a missing base and an empty path distinctly', () => {
    expect(resolveRecording('', { path: 'a/b.mp4' })).toEqual({ status: 'no-base' });
    expect(resolveRecording('https://nas', { path: '  ' })).toEqual({ status: 'empty' });
  });

  it('passes a full https path through', () => {
    expect(resolveRecording(undefined, { path: 'https://x.ts.net/a b/c.mp4' })).toEqual({
      status: 'ok',
      url: 'https://x.ts.net/a%20b/c.mp4',
    });
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
