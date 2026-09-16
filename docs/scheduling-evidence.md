# How the scheduler decides — the numbers, written down

Every figure below is a real constant in the code, named so you can find it,
and every example is the actual output of the functions named. Nothing here is
an "optimal" claim: these are sane, bounded defaults, chosen so a reviewer can
calculate any answer by hand and disagree with a specific number rather than
with a black box.

Sources: `src/domain/scoring.ts`, `src/domain/plan.ts`, `src/domain/scheduling.ts`,
`src/domain/lessonAgenda.ts`.

---

## 1. Priority — what to practise

```
priority = importance×2 + difficulty + fragility + overdue + neglected
         + lessonUrgency − exposurePenalty
```

| term | range | source |
|---|---|---|
| importance×2 | 2 – 10 | the item's own 1–5 rating |
| difficulty | 1 – 5 | the item's own 1–5 rating |
| fragility | 0 – 5 | `FRAGILITY_BY_STATUS` (fragile/repairing 5, usable 3, new 2, maintenance/integrated 1, performance-ready 0, resting 2) |
| overdue | 0 – 5 | days past `nextReviewDate`: due today 1, 1–2 days 2, 3–6 days 3, 7–13 days 4, 14+ days 5 |
| neglected | 0 – 4 | days since last touched: ≤3 → 0, ≤7 → 1, ≤14 → 2, ≤30 → 3, 31+ → 4 |
| lessonUrgency | 0 – 8 | see §2 |
| exposurePenalty | 0 – 8 | see §3 |

Two things are deliberately **not** terms:

- **A teacher question.** It used to add 3 points. A question is something to
  ask, not evidence the item needs practice, and it quietly reordered the day
  around a note to self.
- **A permanent saturation penalty.** Over-practice is measured as decaying
  recent minutes (§3), so three identical results in January stop mattering
  long before September.

Ties break on the item's own id (`scoreItems`), never on the order storage
happened to return the rows in.

**Eligibility.** `isProactiveCandidate` is the ONE policy shared by Today's
recommendations, the initial plan, regeneration, swaps and every fallback:
resting ("dormant") material never surfaces in a suggestion. It stays fully
practisable by choosing it directly, keeps its review data, and comes straight
back with a status change.

A swap draws from the SAME candidate pool as the build, not just the same
eligibility test: `candidatePool` (`plan.ts`) computes the practised-today
exclusion (§below) and its honest repeat fallback once, and both
`buildSessionPlan` and `swapSegment` read it — a swap can never hand back
material the build itself deliberately stepped past, and a warm-up swap
excludes a due-for-review or lesson-committed candidate exactly as the
build's own warm-up pool does.

## 2. Lesson urgency — from the commitment's own class

A `preparation` entry in the lesson agenda names ONE item and ONE class. That
class's own date is the only deadline it carries.

| days until that class | points |
|---:|---:|
| today | 8 |
| 1 – 2 | 7 |
| 3 – 5 | 6 |
| 6 – 10 | 5 |
| 11 – 20 | 4 |
| 21+ | 3 |
| already passed / unassigned / no commitment | 0 |

A commitment made for a class in March scores March's urgency, never the
nearer class's. This is what the old rolling `assignedForLesson` boolean could
not express: it meant "the next one", whenever that happened to be, for ever.

## 3. Recent exposure — how much you have actually played it

Minutes, over local calendar days, decaying to nothing across a bounded window.

| constant | value | meaning |
|---|---:|---|
| `EXPOSURE_WINDOW_DAYS` | 7 | older practice contributes nothing |
| weight | `(7 − daysAgo) / 7` | today 1.0, yesterday 6⁄7 … six days ago 1⁄7 |
| `EXPOSURE_MINUTES_PER_POINT` | 10 | decayed minutes per penalty point |
| `EXPOSURE_PENALTY_MAX` | 8 | the ceiling — equal to the largest class-deadline boost |
| `SATURATION_EXPOSURE_MINUTES` | 60 | decayed minutes at which the item is *shown* as heavily practised |

Worked example: 40 minutes yesterday, the day before and the day before that
gives `40×(6+5+4)/7 = 85.7` decayed minutes → `floor(85.7/10) = 8` points,
which is the cap.

Why the cap equals the maximum lesson urgency: sustained heavy practice can
**fully offset** a deadline, so maintenance work stays reachable behind a
repeatedly drilled committed item — and it can never do **more** than offset
it, so genuinely urgent work is never buried by having been practised.

Minutes, not block counts: one 30-minute session and three 10-minute ones are
the same amount of practice. Counting blocks made the longer session read as
*less* exposure. Routine-bound and unlogged blocks count exactly like any
other; a future-dated block contributes nothing to past exposure.

## 4. Diversity — a modest preference, never a quota

An item's musical **dimension** is its own `strand`, else its `itemType`. No new
taxonomy, and missing metadata simply contributes no preference either way.

| constant | value | applies |
|---|---:|---|
| `DIVERSITY_SAME_SESSION_PENALTY` | 1 | the dimension is already in this plan |
| `DIVERSITY_RECENT_DAYS_PENALTY` | 1 | the dimension was practised in the last 2 days |

Maximum 2 points, against a priority that runs to the high twenties: real needs
always win. There are no mandatory category counts, no round-robin calendar, no
randomness, and nothing for the owner to maintain.

## 5. The session — spending the minutes

| constant | value | meaning |
|---|---:|---|
| `MIN_BUDGET_MINUTES` / `MAX_BUDGET_MINUTES` | 5 / 120 | accepted whole-minute budgets; anything else is rejected at the boundary |
| `SHORT_SESSION_MINUTES` | 12 | below this: ONE useful main focus, no warm-up, no cool-down |
| `MAIN_WORK_FLOOR_MINUTES` | 5 | a warm-up may only exist if at least this much main work survives it |
| `MIN_SEGMENT_MINUTES` | 2 | shortest segment worth starting |
| `MAX_SEGMENT_MINUTES` | 25 | longest single block the planner will propose |
| `warmupShare` | 0.12 (0.10–0.15) | a pinned allocation target, not a weight |
| `deepWorkShare` | 0.33 (0.25–0.40) | nudges the deep bucket's weight |
| `reviewSlotMinMinutes` / `Max` | 3 / 7 | a retrieval check stays a check |

Order of decisions:

1. **The anchor** — the highest-priority eligible item, whatever role it turns
   out to fill. (It used to be chosen last, after a "deep work" slot had
   already been filled, which is how a five-minute session preferred new deep
   work to an item committed for tomorrow's class.)
2. **Warm-up**, only if one is wanted and one is *suitable*: low demand
   (difficulty ≤ 3) AND evidence of familiarity (a settled status or 3+ real
   sessions). A due review or a class commitment is never spent as the warm-up;
   with nothing suitable the warm-up is omitted honestly.
3. **The middle**, by adjusted priority, up to a segment target by budget
   (1 / 2 / 3 / 4 / 5 / 6 / 7 for <12 / <20 / <30 / <45 / <60 / <90 / rest).
4. **Cool-down**, optional, from settled material only.

Minutes never exceed the budget and normally use all of it. An honest remainder
is left — and stated in the summary — when filling it would mean stretching two
items across two hours.

### Representative outputs

The same five items every time: a familiar darāmad, a phrase committed to a
class two days away, a new chahār-mezrāb, a fragile riz drill practised for
20 minutes yesterday, and a solid tasnif whose review is two days overdue.

### 5 minutes

> 5 min · 1 focus block.

| min | role | item | reason |
|---:|---|---|---|
| 5 | lesson | Foroud phrase (for class) | For your class on 2027-01-17 — 2 days away. |

### 10 minutes

> 10 min · 1 focus block.

| min | role | item | reason |
|---:|---|---|---|
| 10 | lesson | Foroud phrase (for class) | For your class on 2027-01-17 — 2 days away. |

### 20 minutes

> 20 min · a warm-up, 1 focus block and a cool-down.

| min | role | item | reason |
|---:|---|---|---|
| 2 | warmup | Darāmad (familiar) | Warm up on something you already know before the harder work. |
| 12 | lesson | Foroud phrase (for class) | For your class on 2027-01-17 — 2 days away. |
| 6 | cooldown | Tasnif (solid, due) | End on something that already holds together. |

### 45 minutes

> 45 min · a warm-up, 3 focus blocks and a cool-down.

| min | role | item | reason |
|---:|---|---|---|
| 5 | warmup | Darāmad (familiar) | Warm up on something you already know before the harder work. |
| 9 | lesson | Foroud phrase (for class) | For your class on 2027-01-17 — 2 days away. |
| 14 | deep | Riz evenness | Focused work — it’s still shaky and needs rebuilding. |
| 13 | deep | Chahār-mezrāb (new) | Focused work — it matters most right now. |
| 4 | cooldown | Tasnif (solid, due) | End on something that already holds together. |

### 60 minutes

> 60 min · a warm-up, 3 focus blocks and 1 review.

| min | role | item | reason |
|---:|---|---|---|
| 7 | warmup | Darāmad (familiar) | Warm up on something you already know before the harder work. |
| 12 | lesson | Foroud phrase (for class) | For your class on 2027-01-17 — 2 days away. |
| 17 | deep | Riz evenness | Focused work — it’s still shaky and needs rebuilding. |
| 17 | deep | Chahār-mezrāb (new) | Focused work — it matters most right now. |
| 7 | review | Tasnif (solid, due) | Due for review (due 2027-01-13) — 2 days overdue. |

Read the 5-minute answer off §1–§2 by hand: the committed phrase scores
`8 + 3 + 3 + 0 + 0 + 7 − 0 = 21`, the new chahār-mezrāb `8 + 5 + 2 + 0 + 0 + 0 − 0 = 15`.
The commitment is the difference, and it disappears the day after that class.

## 6. The review decision — what moves a date

The whole decision is one pure function, `decideReview`, and the close screen,
the store and the preview are three renderings of its single result.

| situation | date | spacing |
|---|---|---|
| no result logged (`not_logged`, or none) — including every routine block | unchanged | unchanged |
| manual mode | unchanged | unchanged |
| a **protected** future date (the owner's, a fixed cadence, or legacy-unknown provenance) | unchanged, whatever the result | unchanged |
| an **automatic** future date, any result but `worse` | unchanged — this is extra practice, not the review | unchanged |
| an automatic future date, `worse` | the EARLIER of the existing date and the repair proposal | reset (reps 0) |
| due (or never scheduled), fixed cadence | today + the configured interval | untouched |
| due, `worse` | today + `sm2SlipResetDays` × urgency modifier | reset (reps 0) |
| due, `same` / `slightly_better` | today + the CURRENT gap again | repetitions and ease untouched |
| due, a stable result, not yet advanced today | SM-2 expansion | reps + 1, ease updated, marker set to today |
| due, a stable result, already advanced today | unchanged | unchanged |

| constant | default | bounds |
|---|---:|---|
| `sm2FirstIntervalDays` | 2 | 1 – 4 |
| `sm2SecondIntervalDays` | 6 | 3 – 10 |
| `sm2SlipResetDays` | 1 | 1 – 3 |
| ease | starts 2.5, floor 1.3 | SM-2's own formula |
| urgency modifier | `(1 + (3−importance)×0.08) × (1 + (3−difficulty)×0.05)` | 0.756 – 1.276 |

The rationale always reports the FINAL interval after the modifier. A three-day
repair setting on an easy, unimportant item produces a four-day date, and says
"back in 4 days" — it used to say three.

**The three stable results** (`stable_alone`, `stable_in_context`,
`performable`) are the only ones that count as retention evidence.
`same` is not failed recall: no improvement is distinct from deterioration, and
reading it as a slip (which this engine used to do) reset a schedule the
musician had every reason to trust.

**One advance per item per local calendar day**, recorded on the item as
`srLastProgressDay`. It is an administrative eligibility marker, never a
measured score: clearing and re-arming the date, reloading, syncing, or simply
closing a second block cannot buy a second expansion.

**Provenance.** `nextReviewSource` says whether the engine or the owner chose
the current date. Absent means legacy-unknown, which the v12 migration never
guesses and the engine protects exactly as carefully as the owner's own.

## 7. Ownership of a date — who manages it, and what that does NOT mean

No number in this document changes here. This section only records WHO owns the
next date, because that is the one thing about scheduling the UI can most easily
misrepresent.

**"Use automatic scheduling" is administration, not evidence.**
`transferToAutomaticReview` (`scheduling.ts`) moves an item from `manual` or
`interval` to `auto` and marks `nextReviewSource: 'auto'`. Both together say the
ENGINE now has authority over the pending date. Neither says the date was
calculated, and neither says a review happened:

- the pending date is KEPT, byte-for-byte;
- `srReps`, `srEase`, `srIntervalDays` and `srLastProgressDay` are untouched, so
  the next eligible close resumes from exactly the rung the item was already on;
- no block is written, no result is invented, no statistic and no completed
  review row moves.

Only later ELIGIBLE real practice — a `stable_alone` / `stable_in_context` /
`performable` result, at or after the due date, not already advanced today —
supplies retention evidence, exactly as it does for an item that was always
automatic. The UI must never describe the retained date as a new calculation.

**It refuses rather than guesses.** Open review rows that disagree with the item
or with each other, or rows pending with no item date at all, are an ambiguity
the owner has to resolve with "Change review date"; the transfer names the
conflict and writes nothing. An item with no date and no open rows becomes
unscheduled under automatic management, `nextReviewSource` ABSENT — there is no
date whose provenance it could describe — and stays so until an explicit
"Review today".

**An ordinary save never releases a protected date.** Editing a title, a status
or an estimate leaves `reviewMode` and `nextReviewSource` exactly as they were, so
a date the owner chose keeps its protection. Only the explicit control transfers
ownership, and only an explicit date change, a snooze or "Schedule again"
re-establishes the owner's.

**"Review today" resolves the day at the moment of the tap**, not from the polled
clock the screen was rendered with — the same guard the close screen's Save
already applies, for the same reason: a device left open across local midnight
would otherwise write the day the panel was drawn on. Both paths refresh what is
displayed and let the next tap through, rather than silently writing the stale day.
