import { clampSchedulingParams, WORKING_MAX_GAP_DAYS, WORKING_RETURN_DAYS } from '../domain';
import { useStore } from '../store/useStore';

/**
 * How a priority and a review date are worked out, with the live values the
 * engine is using now — the one explanation Settings shows and the close
 * screen opens in place behind "Why this date?". It explains; it computes no
 * date and decides nothing.
 */
export default function SchedulingExplanation() {
  const settings = useStore((s) => s.db.settings);
  const p = clampSchedulingParams(settings);
  return (
    <div className="stack-sm small">
      <div>
        <div style={{ fontWeight: 600 }}>What to practise (priority)</div>
        <div className="dim">
          <code>importance×2 + difficulty + fragility + overdue + neglected + class-deadline − recent-minutes</code>. Work
          you committed to a specific class climbs as THAT class nears, and stops counting once it has passed. A question
          for your teacher adds nothing — it is something to ask, not a reason to practise. Material you have given a lot
          of minutes to this week is gently set aside; the effect decays over a week and is capped, so nothing is ever
          hidden for good.
        </div>
      </div>
      <div>
        <div style={{ fontWeight: 600 }}>When it comes back</div>
        <div className="dim">
          <b>Working on this</b> — unfinished material comes back soon, however well a chunk went: after worse or same
          in {WORKING_RETURN_DAYS.worse} day, after slightly better or stable alone in {WORKING_RETURN_DAYS.stable_alone}{' '}
          days, after stable in context or performable in {WORKING_RETURN_DAYS.performable} days. A longer date it
          already carries stays as it is, but it is suggested again {WORKING_MAX_GAP_DAYS} days after you last practised
          it. Work committed to a class comes back before that class whatever its review date says.
        </div>
      </div>
      <div>
        <div style={{ fontWeight: 600 }}>When to revisit (spaced repetition)</div>
        <div className="dim">
          <b>Keep fresh</b> — once you judge the whole item ready, only a whole-item check moves its date; focused work
          on a part leaves it alone. Practising early is real practice, but it is not the check: before the date, a good
          session records the minutes and leaves the date alone. AT the check, “stable” results widen the gap
          (≈ {p.sm2FirstIntervalDays} → {p.sm2SecondIntervalDays} days → gap × ease), at most once a day; “same” and
          “slightly better” hold the same gap again without counting as a slip; only “worse” brings the date forward —
          to {p.sm2SlipResetDays === 1 ? 'the next day' : `${p.sm2SlipResetDays} days`} — and never pushes it back.
          Important or hard material is pulled a little sooner. A date you chose yourself stands until it is due. You
          can override any item to a fixed cadence or manual.
        </div>
      </div>
    </div>
  );
}
