# Practice Compass — product specification

## The problem

A serious adult learner practising several demanding instruments (Persian Setar, Tar,
Classical Guitar) accumulates more material than they can hold in their head: phrases
that are nearly stable, a foroud that's still uncertain, a left‑hand shift that creates
shoulder tension, an étude that's "fine" but quietly decaying. Without a system, three
things go wrong:

1. **Fragile or important material silently disappears.** It isn't forgotten on purpose;
   it just never resurfaces.
2. **Practice becomes undirected repetition.** Time is logged, but the *quality* of
   attention — what was the focus, did it actually improve — is lost.
3. **Lessons are under‑used.** The learner arrives without a clear record of what to ask.

Research on effective music practice is consistent: what separates strong practisers is
not hours logged but **planning, self‑evaluation, reflection and time management** — the
self‑regulated learning loop. Practice Compass is a tool shaped around that loop, not
around a timer.

## The philosophy

> One item. One mode. One focus. One result. One next action.

Every interaction narrows attention to a single, well‑defined unit of work and captures
a single, honest judgement of how it went. The app's job is to **choose, narrow, record,
notice, protect and sustain** — not to teach, judge tone, or gamify effort.

## Non‑goals (deliberately excluded)

Gamification, streaks, fake mastery percentages, leaderboards, excessive forms, audio
analysis, posture tracking, AI judgement, complex notation tools, backend
authentication, and cloud sync (in v1). Each of these would add admin overhead or
pressure, which is exactly what makes practice tools get abandoned.

## The core loop, and why each step exists

| Step              | What the user does                              | Why it matters |
| ----------------- | ----------------------------------------------- | -------------- |
| **Plan**          | Today screen recommends 3 explained options     | Removes the "what should I even do?" friction that kills sessions |
| **Focus**         | Quick‑start picks item + mode + focus in <30s   | A block with a single focus produces a usable result; an unfocused block produces "I practised for a while" |
| **Monitor**       | A quiet timer screen, no dashboards             | Protects the actual practising from the tracking |
| **Evaluate**      | Close in <60s: result + observation + next action | The single most evidence‑backed habit — naming the result and the next move |
| **Adapt**         | Suggested next review + suggested status change  | Turns one judgement into a schedule, so nothing has to be remembered manually |

## Design constraints that shaped the build

- **Start a block in < 30 seconds.** Hence smart defaults: status determines mode,
  the item's `primaryFocus` determines focus, duration defaults to 10 minutes, and a
  new item can be created inline with only a title.
- **Close a block in < 60 seconds.** Result is a row of one‑tap buttons; review date and
  status change are *pre‑filled suggestions* the user can accept silently.
- **A weekly review in < 5 minutes.** Insights are generated, not assembled by the user.
- **Daily use must not feel like admin.** No required fields beyond a title; rich
  metadata (Persian/guitar fields, strategies, tags) is always optional and progressive.

## Why these objects

- **Material vs PracticeItem.** A radif section or a course lesson is a *container*;
  the thing you actually repair is a phrase, a bar, a shift. Separating them lets the
  recommendation engine reason about the small unit while keeping provenance.
- **Status ladder, not a percentage.** `new → fragile → repairing → usable → integrated →
  performable` describes *what kind of work the item needs next*, which a number can't.
  `maintenance` and `dormant` give material an honest place to rest without being deleted.
- **Block result scale.** "Worse / same / slightly better / stable alone / stable in
  context / performable" maps directly onto how musicians actually talk about progress,
  and drives both the review interval and the status suggestion.
- **Saturation.** Over‑drilling and being stuck on "same" are the two most common failure
  modes of solo practice; the engine actively *de‑prioritises* them and nudges a change
  of strategy rather than more reps.

## Why the recommendation engine is deterministic

It must be explainable and trustworthy. Every card states its reason in one sentence,
derived from the same numbers that ranked it. There is no model, no opacity, nothing to
tune behind the scenes — the learner can always understand (and disagree with) the advice.

## Tone of voice

Calm and neutral. Insights observe ("Tar hasn't been practised for 9 days, and 2 of its
items are still fragile") rather than scold. Progress is acknowledged plainly ("Study in
C reached *stable alone* after 3 blocks") without confetti. The app should feel like a
thoughtful practice diary that happens to do the bookkeeping for you.

## Success criteria

The tool is working if the learner *wants* to open it before and after practising —
because before, it answers "what now?", and after, it makes the 45 seconds of reflection
feel worth it. Everything else is in service of that.
