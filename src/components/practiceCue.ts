import { useSyncExternalStore } from 'react';

// ---------------------------------------------------------------------------
// The practice sound: at most ONE live AudioContext, and a FRESH one from
// every tap that readies sound — Start, Resume, Test sound, or the practice
// screen's "Turn on sound" — created and resumed INSIDE that tap, and only
// ever played from at a boundary.
//
// Why fresh every tap: a context can die in ways its `state` does not admit —
// left `running` but silent, or `suspended`/`interrupted` in a way resume()
// cannot clear — after the app sits idle between blocks (the owner's report,
// docs/setar-practice-reliability.md). Reusing it kept the cue silent until
// the app was reopened; replacing it at each tap means a dead context never
// outlives the next tap.
//
// Why only inside a tap: a context made later, in a boundary effect, is made
// outside any user gesture, and a browser that enforces the autoplay rule
// (iOS Safari, the installed iPhone app) leaves it SUSPENDED for good.
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
const listeners = new Set<() => void>();
/** Told BEFORE a readying tap replaces the context, so nothing scheduled on the old one outlives it. */
const replacing = new Set<() => void>();
/** Told when a boundary cue is scheduled: the window [from, to] it sounds in, on that context. */
const cueing = new Set<(c: AudioContext, from: number, to: number) => void>();

/** The page's current context, for the metronome to schedule on — never created or resumed here. */
export function practiceContext(): AudioContext | null {
  return context;
}

/** Subscribe to context replacement (every readying tap); returns the unsubscribe. */
export function onContextReplaced(fn: () => void): () => void {
  replacing.add(fn);
  return () => replacing.delete(fn);
}

/** Subscribe to boundary cues, so other sound can yield to them; returns the unsubscribe. */
export function onPracticeCue(fn: (c: AudioContext, from: number, to: number) => void): () => void {
  cueing.add(fn);
  return () => cueing.delete(fn);
}

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
 * await or navigation. Closes the page's current context (whatever state it
 * claims), creates a fresh one and asks it to resume, all inside this tap, so
 * there is never more than one live context and a dead one is gone by the
 * next tap. A refusal, a rejection or a promise that never settles is
 * absorbed: starting practice never waits on sound, and never fails for it.
 * Returns the one resume this tap asked for (it settles, never rejects), if any.
 */
export function primePracticeSound(): Promise<void> | undefined {
  let resumed: Promise<void> | undefined;
  const Ctx = audioCtor();
  if (!Ctx) {
    update();
    return undefined;
  }
  for (const fn of replacing) fn();
  const old = context;
  context = null;
  if (old && old.state !== 'closed') {
    try {
      // Only observed: closing frees the device's audio for the fresh one.
      void Promise.resolve(old.close()).catch(() => undefined);
    } catch {
      // A close that throws leaves nothing for this page to hold on to.
    }
  }
  try {
    const c = new Ctx();
    context = c;
    refused = false;
    c.addEventListener?.('statechange', () => {
      if (c === context) update();
    });
    // INVOKED now, inside the gesture, whatever state the new context reports
    // — one made inside a tap can still start suspended. Its promise is only
    // observed.
    resumed = Promise.resolve(c.resume()).then(update, update);
  } catch {
    // A constructor that throws, or a resume() that throws: unavailable until
    // the NEXT explicit tap tries again — never a retry loop of our own.
    refused = !context;
  }
  update();
  return resumed;
}

/**
 * The cue's shape, in one place: two short RISING pulses (B5 then E6), so it
 * reads as "a boundary" and never as a metronome tick. A triangle wave carries
 * odd harmonics a phone speaker reproduces better than a bare sine; a fast
 * linear attack (no click), a short hold at the peak and an exponential decay
 * put more energy in each pulse than the old instant-decay 880 Hz sine at 0.2,
 * without simply maximising the level. `totalSeconds` is the window the
 * metronome is ducked for.
 */
export const CUE = {
  wave: 'triangle',
  pulses: [
    { start: 0, hz: 988 },
    { start: 0.3, hz: 1319 },
  ],
  peak: 0.36,
  floor: 0.0001,
  attackSeconds: 0.01,
  holdSeconds: 0.08,
  pulseSeconds: 0.26,
  totalSeconds: 0.56,
} as const;

/**
 * The boundary cue. Plays only through the page's CURRENT running context —
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
    // Other sound (the metronome) yields first, for exactly this window.
    for (const fn of cueing) fn(c, t0, t0 + CUE.totalSeconds);
    for (const { start, hz } of CUE.pulses) {
      const t = t0 + start;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = CUE.wave;
      osc.frequency.value = hz;
      gain.gain.setValueAtTime(CUE.floor, t);
      gain.gain.linearRampToValueAtTime(CUE.peak, t + CUE.attackSeconds);
      gain.gain.setValueAtTime(CUE.peak, t + CUE.holdSeconds);
      gain.gain.exponentialRampToValueAtTime(CUE.floor, t + CUE.pulseSeconds);
      osc.connect(gain).connect(c.destination);
      // Short-lived nodes are let go once they have played; the context stays until the next tap.
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
      osc.start(t);
      osc.stop(t + CUE.pulseSeconds);
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
  const c = context;
  if (!c) return;
  if (c.state === 'running') {
    playPracticeCue();
    return;
  }
  // The resume this very tap asked for (never a second one): play when, and
  // only if, it lands while this tap's context is still the page's — every
  // later tap replaces it, and a closing context can still report `running`
  // until its close settles. A resume that throws, rejects or never settles
  // plays nothing, and an older tap's never plays late.
  resumed?.then(() => {
    if (c === context && c.state === 'running') playPracticeCue();
  });
}

/** Subscribe to the page's sound state (a context running, paused, closed); returns the unsubscribe. */
export function onSoundState(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** The page's sound state, for an indication on screen. */
export function usePracticeSound(): PracticeSoundState {
  return useSyncExternalStore(onSoundState, read, () => 'off');
}
