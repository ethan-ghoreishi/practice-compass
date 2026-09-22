import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MAX_BUDGET_MINUTES,
  MIN_BUDGET_MINUTES,
  describeFitDrop,
  fitRoutineToMinutes,
  routineTotalMinutes,
  segmentsForRun,
  validateBudgetMinutes,
  type PathwayRoutine,
} from '../domain';
import { useStore } from '../store/useStore';

/**
 * RUN THIS ROUTINE FOR THE TIME YOU ACTUALLY HAVE.
 *
 * The authored length is the default and the ordinary Start button is
 * untouched, so doing nothing behaves exactly as it always did. Choosing a
 * different total scales the segments in proportion — the syllabus's own
 * proportions are the whole point of a curriculum routine — and drops
 * non-essential segments before essential ones when the time cannot seat them
 * all (`fitRoutineToMinutes`, pure and tested).
 *
 * DURATION AND "SHORT ON TIME" ARE TWO INDEPENDENT KNOBS with their existing
 * meanings: essentials-only is a CONTENT decision, duration is a TIME decision,
 * and this composes with `segmentsForRun` rather than replacing it. BOTH are
 * reachable HERE, together: the panel carries its own essentials-only tick, so
 * "twenty minutes, essentials only" is one choice rather than two controls that
 * could never be used at once. `segmentsForRun` keeps its exact meaning and
 * signature — it is still what decides the CONTENT, and it runs first.
 *
 * What it drops, it says HONESTLY. Cutting the time far enough eventually
 * reaches the essential segments too (`fitRoutineToMinutes` drops non-essential
 * first, latest first, and only then an essential one), and reporting that as
 * "non-essential dropped" would be a plain untruth about the one distinction
 * the syllabus's own ⭐ marking exists to make.
 *
 * It starts the run HERE and then navigates, because `startRoutineRun` already
 * takes the segments from its caller and the runner freezes whatever it is
 * given — so fitting needs no runner change at all. The bound is shared with
 * "Plan this session" (`validateBudgetMinutes`, 5-120) so the two reject
 * exactly the same thing; nothing else about the Session Plan is reused.
 *
 * One component for all three routine surfaces (Today, a stage, a pathway), so
 * they cannot drift apart.
 */
export default function RoutineDuration({ routine }: { routine: PathwayRoutine }) {
  const navigate = useNavigate();
  const startRoutineRun = useStore((s) => s.startRoutineRun);
  const [open, setOpen] = useState(false);
  const [essentialsOnly, setEssentialsOnly] = useState(false);
  const hasEssential = routine.segments.some((s) => s.essential);
  const segments = segmentsForRun(routine.segments, essentialsOnly);
  const authored = routineTotalMinutes(segments);
  const [text, setText] = useState(String(authored));

  const minutes = validateBudgetMinutes(Number(text));
  const fitted = minutes === null ? [] : fitRoutineToMinutes(segments, minutes);
  // The sentence is a pure formatter (`describeFitDrop`) so the claim it makes
  // about what was dropped is reachable from a test, not buried in a render.
  const dropped = minutes === null ? null : describeFitDrop(segments, fitted);

  /** Changing the CONTENT changes the authored total the box is offering. */
  function chooseEssentialsOnly(next: boolean) {
    setEssentialsOnly(next);
    setText(String(routineTotalMinutes(segmentsForRun(routine.segments, next))));
  }

  if (!open) {
    return (
      <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-end' }} onClick={() => setOpen(true)}>
        Run it for a different length
      </button>
    );
  }

  return (
    <div className="row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
      <label className="tiny faint" htmlFor={`dur-${routine.id}`}>
        {/* Fixed English page copy, never user text — its own inline LTR
            isolate, so a Farsi routine name above cannot drag it. */}
        <span dir="ltr">Run for</span>
      </label>
      <input
        id={`dur-${routine.id}`}
        className="input"
        type="number"
        inputMode="numeric"
        min={MIN_BUDGET_MINUTES}
        max={MAX_BUDGET_MINUTES}
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: 80 }}
        aria-label={`Minutes to run ${routine.name}`}
      />
      <span className="tiny faint">
        <span dir="ltr">
          min · {MIN_BUDGET_MINUTES}–{MAX_BUDGET_MINUTES}
          {dropped ? ` · ${dropped}` : ''}
        </span>
      </span>
      {hasEssential && (
        <label className="tiny faint row" style={{ gap: 4 }}>
          <input
            type="checkbox"
            checked={essentialsOnly}
            onChange={(e) => chooseEssentialsOnly(e.target.checked)}
          />
          {/* Fixed English page copy, never user text — its own inline LTR
              isolate, so a Farsi routine name above cannot drag it. */}
          <span dir="ltr">Essentials only</span>
        </label>
      )}
      <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
        Cancel
      </button>
      <button
        className="btn btn-primary btn-sm"
        disabled={minutes === null || fitted.length === 0}
        onClick={() => {
          if (minutes === null || fitted.length === 0) return;
          // `startRoutineRun` REFUSES while any clock is already running, so a
          // duration chosen here can never reset a run in progress to zero.
          // Navigating regardless is deliberate and is what every other Start
          // on this page already does: the owner lands on whichever clock is
          // actually running and resolves it there.
          startRoutineRun(routine.id, essentialsOnly, fitted);
          navigate(`/routine/${routine.id}${essentialsOnly ? '?short=1' : ''}`);
        }}
      >
        Start
      </button>
    </div>
  );
}
