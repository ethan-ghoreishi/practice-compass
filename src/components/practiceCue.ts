import { useSyncExternalStore } from 'react';

// ---------------------------------------------------------------------------
// The practice sound: ONE AudioContext for the life of the page, created and
// resumed only INSIDE a tap — Start, Resume, Test sound, or the practice
// screen's "Turn on sound" — and only ever played from at a boundary.
//
// Why: a context made later, in a boundary effect, is made outside any user
// gesture, and a browser that enforces the autoplay rule (iOS Safari, the
// installed iPhone app) leaves it SUSPENDED for good — the old cue built a new
// one at every boundary, never resumed any of them, and leaked each. The
// recorded trace is in docs/setar-practice-reliability.md §1.
//
// What this does NOT claim: a `running` context is an engine ready to play,
// never proof that a speaker made a sound. Volume, the mute switch, the output
// route and an interruption are the device's; the visual ring is the signal
// that is always there.
// ---------------------------------------------------------------------------

/** How the page's practice sound stands, for a calm indication — never a promise of audibility. */
export type PracticeSoundState =
  | 'off' // no tap has readied it on this page yet
  | 'ready' // the engine is running
  | 'paused' // suspended or interrupted — a tap can try to resume it
  | 'unavailable'; // this browser has no Web Audio, or refused to create it

type Ctor = new () => AudioContext;

let context: AudioContext | null = null;
let refused = false;
let state: PracticeSoundState = 'off';
// Bumped by every tap that readies the sound: a Test sound request whose
// resume lands after a LATER tap is an old request, and plays nothing.
let gesture = 0;
const listeners = new Set<() => void>();

function audioCtor(): Ctor | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as typeof window & { webkitAudioContext?: Ctor };
  return (w.AudioContext as Ctor | undefined) ?? w.webkitAudioContext;
}

function read(): PracticeSoundState {
  if (refused || (typeof window !== 'undefined' && !audioCtor())) return 'unavailable';
  if (!context) return 'off';
  if (context.state === 'running') return 'ready';
  if (context.state === 'closed') return 'off';
  return 'paused'; // 'suspended', or WebKit's 'interrupted'
}

function update(): void {
  const next = read();
  if (next === state) return;
  state = next;
  for (const fn of listeners) fn();
}

/**
 * Ready the sound — call it SYNCHRONOUSLY in the tap's own handler, before any
 * await or navigation. Creates the one context if there is none (or the last
 * one was closed — only then, so two never coexist), and asks a suspended one
 * to resume. A refusal, a rejection or a promise that never settles is
 * absorbed: starting practice never waits on sound, and never fails for it.
 * Returns the one resume this tap asked for (it settles, never rejects), if any.
 */
export function primePracticeSound(): Promise<void> | undefined {
  gesture += 1;
  let resumed: Promise<void> | undefined;
  const Ctx = audioCtor();
  if (!Ctx) {
    update();
    return undefined;
  }
  try {
    if (!context || context.state === 'closed') {
      context = new Ctx();
      refused = false;
      const c = context;
      c.addEventListener?.('statechange', () => {
        if (c === context) update();
      });
    }
    if (context.state !== 'running') {
      // INVOKED now, inside the gesture; its promise is only observed.
      resumed = Promise.resolve(context.resume()).then(update, update);
    }
  } catch {
    // A constructor that throws, or a resume() that throws: unavailable until
    // the NEXT explicit tap tries again — never a retry loop of our own.
    refused = !context;
  }
  update();
  return resumed;
}

/** The cue's shape, in one place: two short 880 Hz pulses. */
export const CUE = { hz: 880, gain: 0.2, pulseSeconds: 0.3, starts: [0, 0.45] } as const;

/**
 * The boundary cue. Plays only through the page's EXISTING running context —
 * it never creates one, never resumes one and never waits for one, so a
 * boundary reached while the sound is off is marked by the ring alone and is
 * NOT replayed later. Vibration is best-effort and absent on iOS.
 */
export function playPracticeCue(): void {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') navigator.vibrate([80, 120, 80]);
  } catch {
    // best-effort only
  }
  const c = context;
  if (!c || c.state !== 'running') return;
  try {
    const t0 = c.currentTime;
    for (const offset of CUE.starts) {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.frequency.value = CUE.hz;
      gain.gain.setValueAtTime(CUE.gain, t0 + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + offset + CUE.pulseSeconds);
      osc.connect(gain).connect(c.destination);
      // Short-lived nodes are let go once they have played; the context stays.
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
      osc.start(t0 + offset);
      osc.stop(t0 + offset + CUE.pulseSeconds);
    }
  } catch {
    // best-effort only — the visual signal stands
  }
}

/**
 * "Test practice sound" and the practice screen's "Turn on sound": the same
 * tap readies the context and plays the same cue once it is running. It
 * touches no clock, marker, record or wake lock.
 */
export function testPracticeSound(): void {
  const resumed = primePracticeSound();
  const mine = gesture;
  const c = context;
  if (!c) return;
  if (c.state === 'running') {
    playPracticeCue();
    return;
  }
  // The resume this very tap asked for (never a second one): play when, and
  // only if, it lands while this is still the latest tap. A resume that throws,
  // rejects or never settles plays nothing, and an older tap's never plays late.
  resumed?.then(() => {
    if (mine === gesture && c === context && c.state === 'running') playPracticeCue();
  });
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** The page's sound state, for an indication on screen. */
export function usePracticeSound(): PracticeSoundState {
  return useSyncExternalStore(subscribe, read, () => 'off');
}
