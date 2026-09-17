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

Also excluded, deliberately: activity quotas, required activity tags, a round‑robin
rotation, randomness, and any claim of an optimal session ratio. The session planner has
preferences — a warm‑up on familiar material, a little variety, a bounded discount for
what has just been drilled — and every one of them is a published number in
`scheduling-evidence.md` that the owner can calculate and disagree with.

## The core loop, and why each step exists

| Step              | What the user does                              | Why it matters |
| ----------------- | ----------------------------------------------- | -------------- |
| **Plan**          | Today screen recommends 3 explained options     | Removes the "what should I even do?" friction that kills sessions |
| **Focus**         | Quick‑start picks item + mode + focus in <30s   | A block with a single focus produces a usable result; an unfocused block produces "I practised for a while" |
| **Monitor**       | A quiet timer screen, no dashboards             | Protects the actual practising from the tracking |
| **Evaluate**      | Close in <60s: result + observation + next action | The single most evidence‑backed habit — naming the result and the next move |
| **Adapt**         | Suggested next review + suggested status change  | Turns one judgement into a schedule, so nothing has to be remembered manually |

**Practice is exposure; only eligible retention evidence advances spacing.** A good
session before a review is due is real practice — it records minutes, a result, an
observation and a next action — but it is not the review it was scheduled for, so it
leaves the date and the spacing state alone. Only a genuinely negative result may bring
an automatic date forward, never postpone it, and a date the musician chose themselves
stands until it is due or they change it. Nothing about that is a judgement of effort: it
is the difference between "I played this today" and "I proved I still had it."

**The date you see is the date that gets saved, even across midnight.** A close screen —
or a session plan — left open while the day genuinely rolls over never silently writes a
decision for the day it was previewed on. It refreshes the visible date/reasons first
(the musician's own words survive the refresh) and only then lets Save go through; a
practice-session preview left open the same way marks itself as needing a rebuild rather
than starting a session it no longer honestly describes. Trustworthy here means the app
never quietly disagrees with itself about what day it is.

## Design constraints that shaped the build

- **Start a block in < 30 seconds.** Hence smart defaults: status determines mode,
  the item's `primaryFocus` determines focus, duration defaults to 10 minutes, and a
  new item can be created inline with only a title.
- **Close a block in < 60 seconds.** Result is a row of one‑tap buttons; review date and
  status change are *pre‑filled suggestions* the user can accept silently.
- **A weekly review in < 5 minutes.** Insights are generated, not assembled by the user.
- **Daily use must not feel like admin.** No required fields beyond a title; rich
  metadata (the Persian/guitar identity fields) is always optional and progressive, and
  everything you write in your own words lives in ONE place per kind — Working notes on
  the item, an observation and a next action on the block, a question on the class.

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
- **Recent exposure, not saturation.** Over‑drilling is real, but it is a fact about
  MINUTES lately, not about a block count and not about a run of identical results. The
  engine de‑prioritises material by bounded, decaying recent minutes and nudges a change
  of strategy when three results in a row are "same" — the hint stays a hint, and it
  expires, rather than hiding the item for ever.
- **Lesson commitments and questions are separate objects with specific targets.** "Work
  on this before my class on the 5th" and "ask this at my class on the 5th" are different
  commitments to a NAMED class, not a single rolling flag meaning "the next one" and a
  single box holding one question. Only the first is a reason to practise; the second is
  a reason to write something down.

## What each word means (the definition table)

Every enum the app asks you to choose from, with the wording it shows. The stored codes
never change when the wording does — a label is display, not data.

**Status** — how the item CURRENTLY STANDS and what kind of work it needs next. Never how
the last ten minutes went. These are not eight rungs of a compulsory ladder: neighbouring
statuses overlap on purpose, you may move backwards whenever the material does, and
`new` means "still being established", NOT "never practised" — an item can carry recorded
blocks and still honestly be new material.

| Shown | Stored | Means |
| ----- | ------ | ----- |
| Not practised yet | `new` | New material, still being established. |
| Shaky | `fragile` | Unreliable — falls apart easily. |
| Fixing problems | `repairing` | Actively working on a known problem. |
| Coming together | `usable` | Holds together, but not reliably in context. |
| Solid | `integrated` | Reliable in context. |
| Performance-ready | `performable` | Ready to play for someone. |
| Keeping fresh | `maintenance` | Learned — deliberately keeping it fresh. |
| Resting | `dormant` | Deliberately set aside for now. |

**Result** — what ONE closed block actually demonstrated. The last three are evidence of
stability at a named scope; the first three describe change short of such a claim. `same`
is not failed recall and never becomes one: no improvement is distinct from deterioration,
and only `worse` is ever read as a slip. Fatigue, a blank field and a missing rating are
none of these — that is what "Save without a result" is for.

| Shown | Stored | Means |
| ----- | ------ | ----- |
| Worse | `worse` | Genuine deterioration, or you struggled to recall it. |
| Same | `same` | No meaningful change either way. |
| Slightly better | `slightly_better` | Some improvement, short of holding together. |
| Stable alone | `stable_alone` | The passage held together on its own, in isolation. |
| Stable in context | `stable_in_context` | It held together joined to the music around it. |
| Performable | `performable` | Ready to play for someone. |
| Not logged | `not_logged` | Time recorded, no judgement made. |

**Mode** — the kind of attention this block is for: Learn · Repair · Integrate · Maintain
· Perform · Explore · Diagnose. **Focus** — the one thing you are attending to inside it
(pitch, rhythm, tone, fingering, right/left hand, mezrāb, relaxation, memory, phrase
direction, ornament, tahrir, transition, musical meaning, dynamics, tempo, body, other).
Both are pre-filled from the item, and Start leads with that default pairing in one
sentence so the common case is a single tap.

**The two 1–5 estimates** are yours, not measurements, and nothing needs keeping up to
date on a schedule:

| Shown | Stored | 1 | 3 | 5 |
| ----- | ------ | - | - | - |
| Personal priority | `importance` | Barely — happy to leave it aside | Ordinary — part of the mix | Front of the queue right now |
| Current effort | `difficulty` | Easy — comes out without much thought | Ordinary — needs attention | Very demanding at the level I want |

They help order what to practise and how soon reviews come round; high effort also keeps
an item out of easy warm-ups. The wording changed; the weights, defaults and stored codes
did not.

**Review mode** — Auto (the engine has authority), Every N days (a fixed cadence you
choose), Manual (you set each date yourself). Handing an item to Auto is an
ADMINISTRATIVE transfer: it KEEPS the date you already had, records no practice and
invents no result. The engine simply owns that date from then on.

## A source archive describes; it never testifies

The Setar class archive is the first SOURCE the app reads: a normalised folder tree the
owner already had, scanned read-only and published as a small deterministic index the app
fetches. It answers three questions and no others — which pieces exist, which classes
happened, and which file is material for what.

It cannot answer the fourth. **No archive evidence ever becomes practice.** An imported
piece has zero minutes, no result, no review date and no spacing state; an imported class
carries no deadline even when its date is ahead of this device's clock; the owner's own
practice recordings contribute their membership and their role and nothing else. That line
is the whole reason a source can be trusted next to real history: nothing in the app has to
wonder whether a number came from something that was actually played.

Everything it DOES establish is reversible and owner-owned. A deletion, an unlink or a hide
is recorded as a suppression in the same write, so refreshing, reloading or syncing never
resurrects what was removed. Titles, notes, status and every scheduling field are seeded
once and then never written again — a later registry improvement is OFFERED, field by
field, and applied only when the owner says so.

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

## Upgrading, and what a rollback can and cannot do

### Schema v13 — one home per kind of information

v13 retires the practice-text fields that competed with the four homes above:
`currentProblem`, `bestStrategy`, `tags`, the item's cached `lastObservation`, the block's
`bodyNote`, and fourteen Persian/Guitar working-detail fields (shāhed, ist, forud,
ornament/mezrāb/right-hand/left-hand/tone/fingering/tempo/string-noise/body-tension notes,
phrase label, important note). They are REMOVED, not merged into Working notes: the owner
established that their content was dummy test data, and folding dummy text into the one
real notebook is the failure mode, not the fix. **This waiver is enumerated and one-way.**
The identity fields that say what a piece IS — dastgāh/āvāz, gusheh, form, composer, lesson
number, bar range — are kept, and nothing else about practice history, ratings, reviews or
commitments is touched.

The conversion is deletion-only, reads no clock and is idempotent, so two devices migrate
the same database identically on different days and a second run changes nothing. From v13
on, the text that survives is type-checked at every inbound door — import, sync pull, Keep
remote, archive restore, cold-start recovery and both halves of rehydration — and a value
of the wrong type is refused with the record named rather than coerced into the literal
string "[object Object]".

Take a full export before upgrading, and keep it: **rollback is by restoring that backup,
never by a down-migration.** A v12 build refuses a v13 file by version rather than
silently dropping the fields it does not understand, so work done after the upgrade cannot
be carried back — export it first if you need it, then forward-fix on a v13-capable build.

### Schema v12 — lesson commitments and questions

Schema v12 converts the item's old "for next class" flag and its single teacher-question
box into one `lessonAgenda` collection, and adds two small scheduling fields
(`nextReviewSource`, `srLastProgressDay`). The conversion is one-time, reads no clock, and
guesses nothing: every converted commitment and question arrives **unassigned**, because
the old data never recorded which class it was for.

**Before upgrading:**

1. Take a full export from Settings → **Export backup** on the device holding the newest
   data, and keep it. This is the recovery copy.
2. Restore that file into the app once, to verify it imports cleanly.
3. Update **every** device before resuming cross-device sync, so no v11 build is asked to
   read a v12 snapshot.

**Rolling back is deliberately limited, and the app will not pretend otherwise.** An
older v11 build can only restore a backup that was taken *before* the upgrade. It cannot
read a v12 file — it refuses it by version rather than silently dropping the fields it
does not understand — and there is no downgrade that rewrites the schema number. So any
work done *after* the upgrade cannot be carried back to an older build: export it first
if you need it, then forward-fix on a v12-capable build instead.

The first thing to do after upgrading is to point the migrated commitments and questions
at the classes they were actually for. They are all listed under "Unassigned on this
instrument" on the Lessons screen, each with a "Move to this class" button.
