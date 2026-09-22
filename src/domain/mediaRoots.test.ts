import { describe, expect, it } from 'vitest';
import { describeMediaRoot, deriveMediaRoot, knownSourceFolders, mediaRoot } from './mediaRoots';
import { resolveRecording } from './recordings';
import { COURSES } from './courseSeed';
import { KHONYAGAR_COURSE } from './khonyagarData';

// ---------------------------------------------------------------------------
// ONE MEDIA ROOT PER DEVICE, DERIVED FROM THE ARCHIVE BASE THE OWNER ALREADY SET.
//
// These are the values the owner's own two devices actually carry: the Mac over
// the LAN and the iPhone over Tailscale, each reaching the same tree by its own
// route with its own path prefix.
// ---------------------------------------------------------------------------

const MAC_ARCHIVE_BASE = 'https://192.168.0.20:5010/setar-classes';
const PHONE_ARCHIVE_BASE = 'https://ds220plus.taild1d1f7.ts.net/media/setar-classes';

describe('the shared media root', () => {
  it('prefers an explicit media root over the derived one and derives nothing from an unrecognised base', () => {
    // Derived: the folder ABOVE the archive base, on both of the owner's routes.
    expect(deriveMediaRoot(MAC_ARCHIVE_BASE)).toBe('https://192.168.0.20:5010');
    expect(deriveMediaRoot(PHONE_ARCHIVE_BASE)).toBe('https://ds220plus.taild1d1f7.ts.net/media');

    // An explicit override wins — setting one IS the statement that the
    // derivation does not apply to this device's tree.
    expect(mediaRoot({ archiveBase: MAC_ARCHIVE_BASE, override: 'https://elsewhere.example/tree' })).toBe(
      'https://elsewhere.example/tree',
    );
    // Blank is not an override, so the derivation still applies.
    expect(mediaRoot({ archiveBase: MAC_ARCHIVE_BASE, override: '  ' })).toBe('https://192.168.0.20:5010');

    // And NOTHING is guessed. The legacy value one folder too high IS the media
    // root already, so its last segment names no source and it derives nothing.
    expect(deriveMediaRoot('https://192.168.0.20:5010/')).toBeNull();
    expect(deriveMediaRoot('https://192.168.0.20:5010/something-else')).toBeNull();
    expect(deriveMediaRoot('')).toBeNull();
    expect(deriveMediaRoot('not a url at all ://')).toBeNull();
    expect(mediaRoot({ archiveBase: 'https://192.168.0.20:5010/' })).toBeNull();

    // A MALFORMED BASE IS AN UNRECOGNISED BASE, NEVER A THROWN ERROR. A lone
    // `%` is a legal URL path and an illegal escape: `decodeURIComponent('%')`
    // raises a URIError, and this runs while Settings and every material row
    // are DRAWING — `getMediaRoot()` is read in the same expression that
    // resolves an ARCHIVE reference, so a base like this took the whole screen
    // down with it, archive rows included.
    for (const malformed of [
      'https://nas.test/%',
      'https://nas.test/setar-classes/%E0%A4%A',
      'https://nas.test/%zz',
    ]) {
      expect(() => deriveMediaRoot(malformed)).not.toThrow();
      expect(deriveMediaRoot(malformed)).toBeNull();
      expect(() => describeMediaRoot({ archiveBase: malformed })).not.toThrow();
    }
    // A percent-ENCODED but well-formed source folder still derives, which is
    // what the decode is there for in the first place.
    expect(deriveMediaRoot('https://nas.test/media/setar%2Dclasses')).toBe('https://nas.test/media');

    // And the archive itself is untouched by any of this: the same malformed
    // string is simply a bad base for a reference too, reported and not thrown.
    expect(resolveRecording(undefined, { path: 'session-1/x.mp4' }).status).toBe('no-base');
    expect(resolveRecording('https://nas.test/setar-classes', { path: 'session-1/x.mp4' })).toEqual({
      status: 'ok',
      url: 'https://nas.test/setar-classes/session-1/x.mp4',
    });
  });

  it('knows the folder each shipped source declares — the archive and every course', () => {
    expect(knownSourceFolders()).toEqual(['setar-classes', 'classical-guitar', 'tar-classes']);
    expect(deriveMediaRoot('https://nas.example/media/classical-guitar')).toBe('https://nas.example/media');
  });

  it('registers tar-classes as a known source folder without changing the archive base', () => {
    // DERIVED FROM THE COURSE'S OWN `mediaPath`, never a second list: the
    // folder is known because the Khonyagar course declares it.
    expect(KHONYAGAR_COURSE.mediaPath).toBe('tar-classes/khonyagar-mirzapour');
    expect(COURSES).toContain(KHONYAGAR_COURSE);
    expect(knownSourceFolders()).toContain('tar-classes');
    expect(knownSourceFolders()[0]).toBe('setar-classes');

    // The archive base the owner already set keeps its value and its meaning:
    // the same media root on both devices, the same Setar reference URL.
    expect(deriveMediaRoot(MAC_ARCHIVE_BASE)).toBe('https://192.168.0.20:5010');
    expect(deriveMediaRoot(PHONE_ARCHIVE_BASE)).toBe('https://ds220plus.taild1d1f7.ts.net/media');
    expect(resolveRecording(MAC_ARCHIVE_BASE, { path: 'session-1/x.mp4' })).toEqual({
      status: 'ok',
      url: 'https://192.168.0.20:5010/setar-classes/session-1/x.mp4',
    });

    // And a Khonyagar lesson opens under that SAME root on both routes, with no
    // new device setting: `tar-classes` sits beside `setar-classes`.
    const lesson = KHONYAGAR_COURSE.groups[0].units[0].files[0];
    for (const base of [MAC_ARCHIVE_BASE, PHONE_ARCHIVE_BASE]) {
      const root = mediaRoot({ archiveBase: base })!;
      const res = resolveRecording(root, { path: lesson.path });
      expect(res.status).toBe('ok');
      expect(res.status === 'ok' && res.url.startsWith(`${root}/tar-classes/khonyagar-mirzapour/`)).toBe(true);
    }
  });
});
