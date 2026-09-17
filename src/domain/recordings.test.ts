import { describe, expect, it } from 'vitest';
import {
  archiveRootUrl,
  describeArchiveAccess,
  formatFileSize,
  needsBaseUrl,
  normalizeBaseUrl,
  relativizeReference,
  resolveRecording,
  resolveRecordingUrl,
} from './recordings';

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

  it('opens a retained absolute URL unchanged, without double-encoding its existing escapes', () => {
    // A foreign origin or a query-bearing URL is retained verbatim by
    // relativizeReference (never rewritten). It must still open correctly:
    // encodeURI() would turn an existing %20 into %2520 — a dead link.
    expect(resolveRecording(undefined, { path: 'https://example.com/a%20b.pdf' })).toEqual({
      status: 'ok',
      url: 'https://example.com/a%20b.pdf',
    });
    // Percent-encoded Farsi, as a NAS directory listing would hand it out.
    const farsi = 'https://example.com/setar-classes/' + encodeURIComponent('چهارمضراب.pdf');
    expect(resolveRecording(undefined, { path: farsi })).toEqual({ status: 'ok', url: farsi });
    // A retained query-bearing URL keeps its query string intact.
    expect(resolveRecording(undefined, { path: 'https://example.com/class.mp4?download=1' })).toEqual({
      status: 'ok',
      url: 'https://example.com/class.mp4?download=1',
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

// ---------------------------------------------------------------------------
// Transport independence. What is STORED must not name one device's route to
// the NAS, or every reference dies the day that route changes.
// ---------------------------------------------------------------------------

describe('relativizeReference', () => {
  const base = 'https://192.168.0.20:5010';

  it('stores a pasted URL under the base as relative, keeps a foreign origin absolute, and leaves a relative path alone', () => {
    // Copied out of the NAS directory listing, so the Farsi filename arrives
    // percent-encoded; storing it encoded would double-escape on resolve.
    const pasted = `${base}/setar-classes/session-37/${encodeURIComponent('چهارمضراب.pdf')}`;
    expect(relativizeReference(base, pasted)).toBe('setar-classes/session-37/چهارمضراب.pdf');

    const foreign = 'https://example.com/setar-classes/session-37/class.mp4';
    expect(relativizeReference(base, foreign)).toBe(foreign);

    expect(relativizeReference(base, 'setar-classes/session-37/class.mp4')).toBe(
      'setar-classes/session-37/class.mp4',
    );
  });

  it('requires the path boundary, so a sibling folder is not swallowed', () => {
    const sibling = 'https://192.168.0.20:5010/mediaXYZ/class.mp4';
    expect(relativizeReference('https://192.168.0.20:5010/media', sibling)).toBe(sibling);
  });

  it('stores a pasted URL unchanged when no usable base URL is configured', () => {
    const pasted = `${base}/setar-classes/session-37/class.mp4`;
    expect(relativizeReference(undefined, pasted)).toBe(pasted);
    expect(relativizeReference('', pasted)).toBe(pasted);
    expect(relativizeReference('   ', pasted)).toBe(pasted);
    expect(relativizeReference('ftp://nas/media', pasted)).toBe(pasted);
    expect(relativizeReference('http://[not a url', pasted)).toBe(pasted);
  });

  it('leaves a URL carrying a query or fragment absolute rather than guessing', () => {
    const query = `${base}/setar-classes/class.mp4?download=1`;
    expect(relativizeReference(base, query)).toBe(query);
  });
});

describe('a stored reference survives a change of transport', () => {
  it('resolves the same relative reference correctly under two different base URLs', () => {
    const lan = 'https://192.168.0.20:5010';
    const pasted = `${lan}/setar-classes/session-37/${encodeURIComponent('چهارمضراب.pdf')}`;
    const stored = relativizeReference(lan, pasted);

    expect(resolveRecordingUrl(lan, { path: stored })).toBe(pasted);
    // A completely different route to the same NAS — nothing stored changes.
    expect(resolveRecordingUrl('https://ds220plus.taild1d1f7.ts.net/media', { path: stored })).toBe(
      `https://ds220plus.taild1d1f7.ts.net/media/setar-classes/session-37/${encodeURIComponent('چهارمضراب.pdf')}`,
    );
  });
});

describe('the Browse target', () => {
  it('offers a browse target for a valid base and none for a blank or unparseable one', () => {
    // Settings' Browse action is gated on exactly this value.
    expect(normalizeBaseUrl('https://192.168.0.20:5010/')).toBe('https://192.168.0.20:5010');
    expect(normalizeBaseUrl('192.168.0.20:5010/media')).toBe('https://192.168.0.20:5010/media');
    expect(normalizeBaseUrl('')).toBeNull();
    expect(normalizeBaseUrl('   ')).toBeNull();
    expect(normalizeBaseUrl(undefined)).toBeNull();
    expect(normalizeBaseUrl('http://[not a url')).toBeNull();
    expect(normalizeBaseUrl('ftp://nas/media')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// ac-14 — the archive's identity is the path; transport is per device.
// ---------------------------------------------------------------------------

describe('archive transport', () => {
  it('source transport changes preserve archive identity and encode Farsi once', () => {
    // ONE stored reference. Its path is archive-relative and is the identity.
    const ref = { path: 'session-13-03-09-2024/نمونه-1.mp4' };
    const mac = 'https://192.168.0.20:5010/setar-classes/';
    const iphone = 'https://ds220plus.taild1d1f7.ts.net/media/setar-classes/';
    const future = 'https://nas.example.org/archives/v2/setar-classes';

    const macUrl = resolveRecording(mac, ref);
    const phoneUrl = resolveRecording(iphone, ref);
    const futureUrl = resolveRecording(future, ref);
    expect(macUrl.status).toBe('ok');
    expect(phoneUrl.status).toBe('ok');
    expect(futureUrl.status).toBe('ok');
    if (macUrl.status !== 'ok' || phoneUrl.status !== 'ok' || futureUrl.status !== 'ok') throw new Error('unreachable');

    // Each device's own BASE PATH PREFIX survives — `/media/`, `/archives/v2/`.
    expect(macUrl.url).toBe(
      'https://192.168.0.20:5010/setar-classes/session-13-03-09-2024/%D9%86%D9%85%D9%88%D9%86%D9%87-1.mp4',
    );
    expect(phoneUrl.url).toContain('/media/setar-classes/session-13-03-09-2024/');
    expect(futureUrl.url).toContain('/archives/v2/setar-classes/session-13-03-09-2024/');

    // FARSI IS ENCODED ONCE. Decoding each segment gives back the raw path, and
    // no '%25' (a re-encoded '%') appears anywhere.
    for (const resolved of [macUrl, phoneUrl, futureUrl]) {
      expect(resolved.url).not.toContain('%25');
      const tail = resolved.url.split('/').slice(-2).map(decodeURIComponent).join('/');
      expect(tail).toBe(ref.path);
    }

    // THE STORED DATA NEVER MOVED. Three bases, one reference object — a base
    // change rewrites no record, so no export and no content hash changes.
    const before = JSON.stringify(ref);
    resolveRecording(mac, ref);
    resolveRecording(iphone, ref);
    expect(JSON.stringify(ref)).toBe(before);
    // ...and a pasted URL under either base is stored back as the same path.
    expect(relativizeReference(mac, macUrl.url)).toBe(ref.path);
    expect(relativizeReference(iphone, phoneUrl.url)).toBe(ref.path);
    // A double-encoded separator decodes into a path that steps OUT of the
    // base. That is not stored as a relative reference at all: the pasted text
    // is kept exactly as given, and resolving it refuses rather than opening
    // something outside the archive.
    const smuggled = `${mac}session-13-03-09-2024%2F..%2Fx.mp4`;
    expect(relativizeReference(mac, smuggled)).toBe(smuggled);
    expect(resolveRecording(mac, { path: 'session-13-03-09-2024/../x.mp4' }).status).toBe('unsafe');

    // --- refusals ------------------------------------------------------------
    for (const path of ['../PIECES.csv', 'a/../../etc/passwd', 'a%2F..%2Fb.mp4', 'a\\b.mp4', 'user:pass@host/x.mp4']) {
      expect(resolveRecording(mac, { path }).status).toBe('unsafe');
      expect(resolveRecordingUrl(mac, { path })).toBeNull();
    }
    expect(resolveRecording('ftp://nas/setar', ref).status).toBe('bad-base');
    expect(resolveRecording('not a url at all', ref).status).toBe('bad-base');
    expect(resolveRecording(undefined, ref).status).toBe('no-base');
    expect(resolveRecording(mac, { path: '   ' }).status).toBe('empty');

    // --- the capability check never probes a media FILENAME ------------------
    expect(archiveRootUrl(mac)).toBe('https://192.168.0.20:5010/setar-classes/');
    expect(archiveRootUrl(iphone)).toBe('https://ds220plus.taild1d1f7.ts.net/media/setar-classes/');
    expect(archiveRootUrl('')).toBeNull();
    expect(archiveRootUrl('ftp://nas')).toBeNull();
    // A renamed or missing single clip cannot make the root check fail, because
    // no clip is part of it.
    expect(archiveRootUrl(mac)).not.toContain('.mp4');
    expect(archiveRootUrl(mac)).not.toContain('نمونه');

    // --- index readability and media reachability are TWO statements ---------
    const fetched = describeArchiveAccess({ indexFetchedAt: '2026-09-17 09:00', indexChangedAt: '2026-09-16 04:15', baseUrl: mac });
    expect(fetched.index).toContain('last fetched');
    expect(fetched.index).toContain('last changed');
    // Reading the index says NOTHING about the NAS, and the media sentence
    // never claims a file is absent — a certificate, a CORS refusal and an
    // outage are indistinguishable from here, so none of them is called
    // absence.
    expect(fetched.media).not.toContain('fetched');
    expect(fetched.media).toMatch(/cannot verify/);
    for (const word of ['missing', 'not found', 'absent', 'gone']) expect(fetched.media.toLowerCase()).not.toContain(word);
    const noIndex = describeArchiveAccess({ baseUrl: mac });
    expect(noIndex.index).toMatch(/No index has been fetched/);
    expect(describeArchiveAccess({ indexFetchedAt: 'x' }).media).toMatch(/No media base is set/);
    expect(describeArchiveAccess({ indexFetchedAt: 'x', baseUrl: 'ftp://nas' }).media).toMatch(/not a usable/);
  });
});
