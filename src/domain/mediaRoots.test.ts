import { describe, expect, it } from 'vitest';
import { deriveMediaRoot, knownSourceFolders, mediaRoot } from './mediaRoots';

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
  });

  it('knows the folder each shipped source declares — the archive and every course', () => {
    expect(knownSourceFolders()).toEqual(['setar-classes', 'classical-guitar']);
    expect(deriveMediaRoot('https://nas.example/media/classical-guitar')).toBe('https://nas.example/media');
  });
});
