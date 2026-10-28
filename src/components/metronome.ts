import { useSyncExternalStore } from 'react';
import { onContextReplaced, onPracticeCue, onSoundState, practiceContext, primePracticeSound } from './practiceCue';

// ---------------------------------------------------------------------------
// The practice metronome: one opt-in, unaccented beat on the page's ONE
// practice AudioContext (`practiceCue.ts`). Nothing here is a record: tempo
// and level live in this module's memory only — they carry between practice
// screens and never reach a block, the database, a backup or sync.
//
// Scheduling follows the audio clock, never the practice wall clock or the
// screen's one-second tick: a short timer looks ahead `LOOKAHEAD_SECONDS` and
// places each beat at an exact `currentTime` (MDN, "Advanced techniques:
// creating and sequencing audio"). A timer that fires late skips the beats it
// missed and keeps the grid — never a burst of catch-up beats.
//
// It never starts itself. Start is a tap; anything that ends the practice
// screen's right to sound — Pause, Finish, Discard, leaving, a hidden page,
// the context dying or being REPLACED by a readying tap — stops it, and it
// stays off until the next tap. A boundary cue takes priority: the beat is
// muted for the cue's window and carries on in time afterwards.
// ---------------------------------------------------------------------------

export const BPM_MIN = 40;
export const BPM_MAX = 240;
export const BPM_DEFAULT = 80;
/** Three modest levels — a click under the instrument, never over the cue. */
export const LEVELS = { soft: 0.12, medium: 0.22, loud: 0.34 } as const;
export type MetronomeLevel = keyof typeof LEVELS;

/** How far ahead beats are placed on the audio clock, and how often the look-ahead runs. */
export const LOOKAHEAD_SECONDS = 0.12;
export const SCHEDULE_EVERY_MS = 25;
/** The first beat after Start, so it never lands in the past. */
const START_DELAY_SECONDS = 0.05;
/** The tick: a short, bright, single click. */
export const TICK = { wave: 'triangle', hz: 1600, attackSeconds: 0.002, seconds: 0.04, floor: 0.0001 } as const;

export interface MetronomeState {
  running: boolean;
  bpm: number;
  level: MetronomeLevel;
}

type Voice = { osc: OscillatorNode; gain: GainNode };

let snapshot: MetronomeState = { running: false, bpm: BPM_DEFAULT, level: 'medium' };
const listeners = new Set<() => void>();
let ctx: AudioContext | null = null;
let duck: GainNode | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let nextBeat = 0;
const voices = new Set<Voice>();
/** Bumped on every stop: a Start whose resume lands after it never begins. */
let generation = 0;
/** The latest cue's window, kept across stops so a beat (re)started inside it still yields. */
let cueWindow: { c: AudioContext; to: number } | null = null;

function publish(patch: Partial<MetronomeState>): void {
  snapshot = { ...snapshot, ...patch };
  for (const fn of listeners) fn();
}

/** A whole BPM inside the range, or null for anything else (refused, never clamped from rubbish). */
export function validateBpm(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const n = Math.round(value);
  return n >= BPM_MIN && n <= BPM_MAX ? n : null;
}

export function setBpm(value: number): void {
  const bpm = validateBpm(value);
  // The next beat not yet placed takes the new tempo; nothing is rescheduled or doubled.
  if (bpm !== null && bpm !== snapshot.bpm) publish({ bpm });
}

/** −/+ steps: clamped at the ends, since a tap past the end means "as far as it goes". */
export function stepBpm(delta: number): void {
  setBpm(Math.min(BPM_MAX, Math.max(BPM_MIN, snapshot.bpm + delta)));
}

export function setLevel(level: MetronomeLevel): void {
  if (level !== snapshot.level && level in LEVELS) publish({ level });
}

function tick(c: AudioContext, at: number): void {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = TICK.wave;
  osc.frequency.value = TICK.hz;
  gain.gain.setValueAtTime(TICK.floor, at);
  gain.gain.linearRampToValueAtTime(LEVELS[snapshot.level], at + TICK.attackSeconds);
  gain.gain.exponentialRampToValueAtTime(TICK.floor, at + TICK.seconds);
  osc.connect(gain).connect(duck!);
  const voice = { osc, gain };
  voices.add(voice);
  osc.onended = () => {
    voices.delete(voice);
    osc.disconnect();
    gain.disconnect();
  };
  osc.start(at);
  osc.stop(at + TICK.seconds);
}

/** One look-ahead pass: place every beat due before `currentTime + LOOKAHEAD_SECONDS`. */
function schedule(): void {
  const c = ctx;
  if (!c || c !== practiceContext() || c.state !== 'running') {
    stopMetronome();
    return;
  }
  try {
    const now = c.currentTime;
    const interval = 60 / snapshot.bpm;
    // Late (a throttled timer): skip the missed beats, keep the grid.
    if (nextBeat < now) nextBeat += Math.ceil((now - nextBeat) / interval) * interval;
    while (nextBeat < now + LOOKAHEAD_SECONDS) {
      tick(c, nextBeat);
      nextBeat += interval;
    }
  } catch {
    stopMetronome();
  }
}

function begin(c: AudioContext): void {
  if (snapshot.running) return;
  try {
    ctx = c;
    duck = c.createGain();
    // Inside a cue's window the new beat starts muted, from now (never an
    // event behind `currentTime`, which a value-1 default would outrank).
    if (cueWindow?.c === c && cueWindow.to > c.currentTime) yieldToCue(c.currentTime, cueWindow.to);
    else duck.gain.value = 1;
    duck.connect(c.destination);
    nextBeat = c.currentTime + START_DELAY_SECONDS;
    timer = setInterval(schedule, SCHEDULE_EVERY_MS);
    publish({ running: true });
    schedule();
  } catch {
    stopMetronome();
  }
}

/**
 * Start the beat — ONLY from a tap's own handler. On a running context it
 * begins at once; otherwise the tap readies sound exactly as "Turn on sound"
 * does and the beat begins when, and only if, that resume lands on the
 * still-current context with nothing having stopped it meanwhile.
 */
export function startMetronome(): void {
  if (snapshot.running) return;
  const live = practiceContext();
  if (live && live.state === 'running') {
    begin(live);
    return;
  }
  const resumed = primePracticeSound();
  const c = practiceContext();
  const mine = generation;
  if (!c) return;
  if (c.state === 'running') {
    begin(c);
    return;
  }
  resumed?.then(() => {
    if (mine === generation && c === practiceContext() && c.state === 'running') begin(c);
  });
}

/** Stop and cancel every beat already placed; idempotent. */
export function stopMetronome(): void {
  generation += 1;
  if (timer !== null) clearInterval(timer);
  timer = null;
  for (const { osc, gain } of voices) {
    try {
      osc.onended = null;
      osc.stop();
    } catch {
      // never started, or already ended
    }
    osc.disconnect();
    gain.disconnect();
  }
  voices.clear();
  try {
    duck?.disconnect();
  } catch {
    // already gone with its context
  }
  duck = null;
  ctx = null;
  if (snapshot.running) publish({ running: false });
}

/**
 * The practice screen's own say: the beat may sound only while that screen
 * is visible AND its clock is running. Anything else stops it — and this
 * never starts it, so returning or resuming leaves it off until a tap.
 */
export function holdMetronome(screen: { visible: boolean; running: boolean }): void {
  if (!screen.visible || !screen.running) stopMetronome();
}

// A readying tap replaces the context: beats placed on the old one go with it.
onContextReplaced(stopMetronome);
// Lost readiness (interrupted, suspended, closed) stops the beat; it never restarts by itself.
onSoundState(() => {
  if (snapshot.running && ctx?.state !== 'running') stopMetronome();
});
function yieldToCue(from: number, to: number): void {
  try {
    duck!.gain.setValueAtTime(0, from);
    duck!.gain.setValueAtTime(1, to);
  } catch {
    // the cue still plays
  }
}

// A boundary cue sounds alone: mute the beat for its window, then carry on in
// time. The window is remembered, so a Start (or restart) inside it yields too.
onPracticeCue((c, from, to) => {
  cueWindow = { c, to };
  if (duck && c === ctx) yieldToCue(from, to);
});

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useMetronome(): MetronomeState {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
}
