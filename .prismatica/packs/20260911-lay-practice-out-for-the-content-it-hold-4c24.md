---
id: 20260911-lay-practice-out-for-the-content-it-hold-4c24
contractId: 20260911-lay-practice-out-for-the-content-it-hold-4c24
contractHash: ab793dbab175ddbc9fc29356cb34945e537b19e73e2a63cdd06b409249244570
createdAt: 2026-09-11T18:59:53.421Z
skills:
  - ui-work
  - build
  - simplify
---

# Build brief: Lay practice out for the content it holds — Persian-aware cards, roomier rows, a calmer close screen

> This brief is scoped and self-contained. A fresh session can resume from it
> alone. Prismatica will check your work deterministically — it never reads this
> chat, only Git and your tests.

- **Linked issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/20
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Work in the lane:** /Users/Ehsan/workspace/active/practice-compass-lanes/20260911-lay-practice-out-for-the-content-it-hold-4c24

## The plan the owner approved

This is the complete approved proposal, verbatim. `assumptions` and
`possibleConflicts` are the Planner's advisory reading — treat them as leads to
verify against the code, never as established fact.

````yaml
# Approved intent: Lay practice out for the content it holds — Persian-aware cards, roomier rows, a calmer close screen

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** existing-flow
- **Risk tier:** heavy
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> Plan the next wide-scope lane from current main, with a stronger emphasis than previous lanes on FRONT-END QUALITY, UI/UX and MOBILE USABILITY. I want Practice Compass to feel: calm, refined and mature; highly usable and obvious without explanation; information-dense only where useful, never cluttered; understated rather than gamified, flashy or generic SaaS; deliberate and polished enough to feel like a personal tool I would want to use every day; visually coherent across Today, Repertoire, Start, Lessons, practice, close, Insights and Settings. The lane should still be wide but genuinely coherent — not a grab-bag of unrelated fixes. Preserve good existing decisions rather than redesigning for novelty.
> 
> What the inspection found, and what we agreed in the planning conversation:
> 
> The app is inspected at 390x844 with the CURRENT Farsi seed (an earlier look used a stale Latin demo database and was misleading). With real Persian content the dominant defect is systemic and was missed by the 2026-09-10 review entirely: every Farsi title right-aligns while its own English details left-align in the same cell. Verified in the DOM — the title is <div class="truncate" dir="auto"> and computes direction:rtl / text-align:start, its sibling <div class="tiny faint"> has no dir and computes ltr / start. 80 dir="auto" sites across 17 files; no container anywhere carries direction. The app looks polished in English and broken in Farsi — on the two instruments whose seeded data is entirely Farsi.
> 
> AGREED (four decisions taken in the planning conversation):
> 1. The iPhone keyboard / bottom-nav drift gets ITS OWN DEVICE LANE, next — not this one. I traced it but it cannot be settled from source: three candidate causes have three different fixes (residual in window.scrollY -> lengthen the 80ms settle delay; residual in visualViewport.offsetTop -> resetIfIdle cannot fix it at all and the shell must track the visual viewport, replacing the 100dvh model; or the guard's own smooth scrollIntoView fired at focusin+300ms still animating when the focusout reset lands at +80ms). Its first deliverable is a readout I take on my own iPhone, so bundling it would stall this whole lane on my device.
> 2. Today's order: BUILD IT with the recommendation first (Practise now directly under the instrument switcher, Plan and Routines as compact doorways beneath), and prove it with a manual:OWNER check on my actual iPhone. If it reads worse to me than the current order, it reverts before the lane ships. This revisits part of my own 2026-08-28 OWNER acceptance decision, deliberately and reversibly.
> 3. The direction fix is applied EVERYWHERE it is needed, not just the core loop — a bidi fix applied to half the app is worse than none. Outside the practice loop, ONLY the direction wiring changes.
> 4. Builder: claude.
> 
> Also agreed: do NOT add jsdom, .test.tsx or browser journeys in this lane. I asked for that to be reassessed; the honest answer is no — jsdom cannot compute dir=auto resolution or text-align, so it could assert only where an attribute sits, which is weaker than the visual check that has to happen anyway. The keyboard lane is where a pure extraction genuinely pays, following the repo's own screenAwake.ts pattern.

## Why

One sentence ties this lane together: EVERYWHERE THE APP SHOWS YOUR PRACTICE, THE CONTENT LEADS — the title and the details that belong to it align together, the item's name gets the room, your own words come before the scheduler's controls, and every label can actually be read.

All four pieces are the same failure: the presentation layer failing the content it holds. None of them touches a domain decision, the store, or the schema, which is what makes a wide lane reviewable — the boundary is 'presentation only', enforced by forbidding src/domain/** and src/store/**.

Measured evidence, all at 390x844 on current HEAD:
- DIRECTION. Title cell 113px wide inside a 356px row; title right-aligned, its own 'due 14 days ago' left-aligned. Same split on the Practise-now card (eyebrow left / Farsi title right / English reason left), the 'Before your Setar class' row, Repertoire item rows, and the dastgah group heading (Farsi text left-aligned because that element has no dir at all, while the items under it right-align).
- ROOM. That 113px title cell exists because 'Not now' + '+2d' + a play button take 243px of the row. The item title truncates to about 13 characters — the one thing the row exists to identify.
- CLOSE SCREEN. 1689px of content in a 785px viewport: 2.15 screens. The review panel is a two-column grid at 390px whose right column is five review-type pills stacked VERTICALLY and whose left column crams a native date input, a 'Why this date?' link and a rationale paragraph into roughly 100px. The engine's controls are fully expanded before the musician has said how it went.
- CONTRAST. Computed from the shipped tokens. Light theme fails WCAG AA for small text on --text-faint (2.89), --gold (3.13), --accent (3.50), --tone-warn (3.50), --tone-alert (3.57), --tone-good (3.62) — and white on --accent is 3.95, which is the label on the primary 'Start' button, the single most important control in this Flow. Dark theme fails only --text-faint (3.68 on --bg, 3.35 on --surface), which is the class used for every card's metadata line.

What is deliberately NOT here, and why it is not lost: the iOS keyboard (own device lane, gated on an owner readout), SM-2 advancing once per closed block instead of once per due date (a real open defect, but it changes what r-practice-completes-reviews MEANS and needs a signed owner decision), Settings' structure (4594px with exactly one heading element — a different Flow), and Repertoire's three-line header wrap and two ontology paragraphs (a different Flow). Each is named so the next lane can pick it up.

## Today

Today opens on the session instrument and shows, in this order: the instrument switcher, a collapsed 'Plan this session' doorway, a collapsed 'Routines' doorway, then the PRACTISE NOW card. The recommendation is above the fold at 390x844 but is the fourth thing on screen — two orchestration choices are presented before the app's actual answer.

Within that card, and within every row and card downstream of it, Persian content is laid out backwards. A Farsi title carries dir="auto" and resolves to direction:rtl, so it aligns to the right edge of its cell; the English eyebrow above it, the English reason beneath it and the 'due N days ago' caption under it carry no direction at all and align to the left edge of the same cell. Nothing in the app ever puts direction on a container: 80 dir="auto" attributes across 17 files, zero on a wrapper. unicode-bidi: plaintext is set on .input and .textarea only, not globally as AGENTS.md states.

A due-review row gives its title 113px of a 356px row because 'Not now', '+2d' and the play button take the rest, so Farsi titles truncate after roughly 13 characters.

The close screen is 1689px tall at 390px — 2.15 screens. Result, minutes, observation, next action, a body/tension disclosure, a status suggestion, 'Should this come back?', a native date field, a 'Why this date?' rationale and five vertically stacked review-type pills are all reachable on one scroll, with the scheduling controls fully expanded before a result has been chosen. Saving already, correctly, requires a result, and 'Save without a result' keeps not_logged deliberate.

Light theme fails WCAG AA for small text on six tokens, including white on --accent at 3.95 — the primary Start button's own label. Dark theme fails --text-faint, the class used for every metadata line.

## Instead

1. DIRECTION FOLLOWS CONTENT, EVERYWHERE. A title and the details that belong to it are wrapped in one group that carries the direction, so both align to the same edge: a Farsi item reads as one right-aligned block, an English item stays exactly as it looks today. Direction stays NATIVE — dir="auto" resolved by the browser from the first strong character; no hand-rolled detection, no reordering of text in JavaScript. Where an English eyebrow precedes the Farsi title in the DOM (the Practise-now card), the group is drawn around title+reason rather than the whole card, because dir="auto" resolves from the first strong character in the subtree. Applied at every existing title/details pair across Today, Start, Active, Close, Repertoire, Lessons, Pathways, Stages, Session Plan, Routine runner, Materials, Item detail and the shared item components. Group headings that render Farsi (the dastgah headings) get direction too, so a heading no longer disagrees with the rows beneath it.

THE COMPLETION BOUNDARY IS EXPLICIT, so neither builder nor reviewer has to guess whether the sweep is finished. The rule: after this lane, dir="auto" appears on GROUPS (the element holding a title together with the details that belong to it) and on free-text FIELDS (input/textarea/select) — and never bare on a title element. At HEAD 7a71179 there are exactly 80 dir="auto" occurrences, which reconcile as 32 + 47 + 1. Two defect shapes are in scope; a third category is explicitly out.

  SHAPE A — direction sits on the title instead of the group. 47 display-text sites in 12 files, enumerated by line so a reviewer can tick them off:
    src/pages/Today.tsx (11) — 95, 204, 310, 321, 381, 507, 541, 568, 595, 669, 767
    src/pages/ItemDetail.tsx (6) — 126, 370, 392, 546, 552, 559
    src/pages/Repertoire.tsx (5) — 206, 225, 262, 265, 293
    src/pages/ActiveBlock.tsx (4) — 87, 98, 206, 211
    src/pages/SessionPlan.tsx (4) — 136, 137, 229, 230
    src/components/ClassQuestions.tsx (4) — 71, 74, 78, 83
    src/pages/Lessons.tsx (3) — 518, 523, 658
    src/pages/PathwayDetail.tsx (3) — 240, 307, 314
    src/pages/StageDetail.tsx (2) — 192, 301
    src/pages/RoutineRunner.tsx (2) — 179, 254
    src/components/ItemMaterial.tsx (2) — 57, 116
    src/pages/Materials.tsx (1) — 176
  SHAPE B — a user-authored title rendered with NO direction at all, which is just as wrong and easier to miss because nothing in the source marks it. The confirmed rendering instances: CloseBlock.tsx:149 (the close screen's own item title — that file has zero dir="auto" today), StartBlock.tsx:196 (the item-picker rows), ItemCard.tsx:25 (the shared card title), Attachments.tsx:142 and ItemDetail.tsx:498 (user file names), ItemDetail.tsx:553 (study source), Insights.tsx:154 and :156 (insight text that embeds item titles), Repertoire.tsx:431 and PathwayDetail.tsx:95 (pathway names), PathwayDetail.tsx:353, StageDetail.tsx:357 and RoutineRunner.tsx:216 (routine names), Materials.tsx:171 and Lessons.tsx:261 (instrument headings), Lessons.tsx:647 (item title), TeacherReport.tsx:57 and Today.tsx:766 (instrument names).

  EXPLICITLY OUT, so a reviewer does not raise them as misses: the 32 free-text FIELD sites in 10 files, which already work and stay byte-identical; the contents of <option> elements (RoutineEdit.tsx:215, ItemForm.tsx:218 and the instrument selects), because the native control owns their rendering; and title text inside confirm() and toast template strings, which are plain strings, not laid-out blocks. src/components/ItemForm.tsx, src/components/QuickAdd.tsx and src/pages/RoutineEdit.tsx are therefore NOT in scope at all: between them they hold 15 field sites and zero display-text sites.

  Both shapes are held closed mechanically by a named test rather than by care (see the acceptance checks), and AGENTS.md records the surface list so the next lane inherits it. If the builder finds a title that genuinely has no group, the exception goes in that test's explicit allowlist and in AGENTS.md — an exception must be VISIBLE, never silent.

2. THE ITEM'S NAME GETS THE ROOM. The due-review row stops starving its title to seat three controls: the title takes the width it needs and the actions are arranged so a real Farsi title is legible rather than truncated after a few characters. 'Not now', '+2d' and 'practise' all remain reachable and keep their existing, distinct semantics — this is layout only.

3. THE RECOMMENDATION IS FIRST. Practise now sits directly under the instrument switcher; 'Plan this session' and 'Routines' become two compact doorways beneath it, still peers of each other, still independently openable, still carrying their 'Resume your plan' / 'Resume your routine' takeovers. Built as the new default and judged on the owner's own iPhone; it reverts before the lane ships if it reads worse than the current order.

4. THE CLOSE SCREEN PUTS THE MUSICIAN'S WORDS FIRST. Always visible: how did it go, what did you notice, what to try next time. The scheduling decision collapses to ONE honest line — the date and review type that will actually be saved, e.g. 'Review in 2 days · Repair' — with the full controls (date field, review-type choice, 'Why this date?', the come-back Yes/No) one tap behind it. Same data, same defaults, same required result, same 'Save without a result' escape hatch; less supervision of the algorithm. The one-line summary is computed from the SAME ReviewPlan object that seeds the date field, so r-explainable-scheduling's 'the date shown before saving is exactly the date saved' holds by construction rather than by care, and that formatter is pure and unit-tested.

5. EVERY LABEL CAN BE READ. The failing colour tokens move — in both themes — until every small-text pair the app ships meets WCAG AA, white on --accent included. A test computes the ratios from the shipped stylesheet and fails the suite if a token regresses, so this cannot silently come back.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- The owner's daily instruments (Setar, Tar) hold Farsi-authored titles, so the direction defect affects most of their real content; Classical Guitar is English and must look unchanged.
- dir="auto" resolves from the first strong character in the element's subtree, so wrapping a title+details group works only where the title precedes the details in the DOM — which is true of every row inspected, but NOT of the Practise-now card, whose English 'PRACTISE NOW' eyebrow comes first.
- jsdom cannot compute dir=auto resolution or text-align, so a component test could only assert where an attribute sits — weaker than the visual check that must happen anyway. That is why no test infrastructure is added in this lane.
- The contrast test reads the shipped stylesheet with fs and computes WCAG ratios in Node; it needs no new dependency and no environment change to the existing vitest 'node' setup.
- Moving the recommendation above the two doorways is reversible: it is one ordering change in Today.tsx with no data or state implications, so the manual:OWNER judgement can genuinely send it back.
- If collapsing CloseBlock to a single ReviewPlan derivation turns out to be impossible once the builder is in the file, then jsdom earns its cost for that ONE assertion — 'the summary line and the date input show the same date' is a plain two-places-one-value check and jsdom does that well. The no-jsdom decision is reasoned from the direction work, where jsdom genuinely cannot compute dir=auto resolution or text-align; that reasoning does not transfer to this assertion. Structural collapse stays the first choice, and the fallback is named here so the builder does not pick one silently.

**Possible conflicts**

- src/styles/global.css is also the file the iOS keyboard lane will need. With wipLimit 2 both lanes can be open at once; sequence them or expect a merge in that one file.
- src/pages/Today.tsx is a touchpoint of clear-a-due-review as well as this Flow. The due-review row re-layout changes how that Flow LOOKS without changing what any of its three actions does — that Flow's truth should not need re-recording, but its mechanics hash will move.
- Colour tokens are global, so every Flow's appearance shifts slightly. Only the pairs that fail AA move; the rest are left alone.
- Repertoire, Lessons, Pathway, Stage, Materials and Item detail are touchpoints of other Flows and are in scope for the direction wiring ONLY. A reviewer seeing those files changed should find nothing in them but the direction grouping.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "Plan the next wide-scope lane from current main, with a stronger emphasis than previous lanes on FRONT-END QUALITY, UI/UX and MOBILE USABILITY. I want Practice Compass to feel: calm, refined and mature; highly usable and obvious without explanation; information-dense only where useful, never cluttered; understated rather than gamified, flashy or generic SaaS; deliberate and polished enough to feel like a personal tool I would want to use every day; visually coherent across Today, Repertoire, Start, Lessons, practice, close, Insights and Settings. The lane should still be wide but genuinely coherent — not a grab-bag of unrelated fixes. Preserve good existing decisions rather than redesigning for novelty.\n\nWhat the inspection found, and what we agreed in the planning conversation:\n\nThe app is inspected at 390x844 with the CURRENT Farsi seed (an earlier look used a stale Latin demo database and was misleading). With real Persian content the dominant defect is systemic and was missed by the 2026-09-10 review entirely: every Farsi title right-aligns while its own English details left-align in the same cell. Verified in the DOM — the title is <div class=\"truncate\" dir=\"auto\"> and computes direction:rtl / text-align:start, its sibling <div class=\"tiny faint\"> has no dir and computes ltr / start. 80 dir=\"auto\" sites across 17 files; no container anywhere carries direction. The app looks polished in English and broken in Farsi — on the two instruments whose seeded data is entirely Farsi.\n\nAGREED (four decisions taken in the planning conversation):\n1. The iPhone keyboard / bottom-nav drift gets ITS OWN DEVICE LANE, next — not this one. I traced it but it cannot be settled from source: three candidate causes have three different fixes (residual in window.scrollY -> lengthen the 80ms settle delay; residual in visualViewport.offsetTop -> resetIfIdle cannot fix it at all and the shell must track the visual viewport, replacing the 100dvh model; or the guard's own smooth scrollIntoView fired at focusin+300ms still animating when the focusout reset lands at +80ms). Its first deliverable is a readout I take on my own iPhone, so bundling it would stall this whole lane on my device.\n2. Today's order: BUILD IT with the recommendation first (Practise now directly under the instrument switcher, Plan and Routines as compact doorways beneath), and prove it with a manual:OWNER check on my actual iPhone. If it reads worse to me than the current order, it reverts before the lane ships. This revisits part of my own 2026-08-28 OWNER acceptance decision, deliberately and reversibly.\n3. The direction fix is applied EVERYWHERE it is needed, not just the core loop — a bidi fix applied to half the app is worse than none. Outside the practice loop, ONLY the direction wiring changes.\n4. Builder: claude.\n\nAlso agreed: do NOT add jsdom, .test.tsx or browser journeys in this lane. I asked for that to be reassessed; the honest answer is no — jsdom cannot compute dir=auto resolution or text-align, so it could assert only where an attribute sits, which is weaker than the visual check that has to happen anyway. The keyboard lane is where a pure extraction genuinely pays, following the repo's own screenAwake.ts pattern.",
  "builder": "claude",
  "summary": "Lay practice out for the content it holds — Persian-aware cards, roomier rows, a calmer close screen",
  "rationale": "One sentence ties this lane together: EVERYWHERE THE APP SHOWS YOUR PRACTICE, THE CONTENT LEADS — the title and the details that belong to it align together, the item's name gets the room, your own words come before the scheduler's controls, and every label can actually be read.\n\nAll four pieces are the same failure: the presentation layer failing the content it holds. None of them touches a domain decision, the store, or the schema, which is what makes a wide lane reviewable — the boundary is 'presentation only', enforced by forbidding src/domain/** and src/store/**.\n\nMeasured evidence, all at 390x844 on current HEAD:\n- DIRECTION. Title cell 113px wide inside a 356px row; title right-aligned, its own 'due 14 days ago' left-aligned. Same split on the Practise-now card (eyebrow left / Farsi title right / English reason left), the 'Before your Setar class' row, Repertoire item rows, and the dastgah group heading (Farsi text left-aligned because that element has no dir at all, while the items under it right-align).\n- ROOM. That 113px title cell exists because 'Not now' + '+2d' + a play button take 243px of the row. The item title truncates to about 13 characters — the one thing the row exists to identify.\n- CLOSE SCREEN. 1689px of content in a 785px viewport: 2.15 screens. The review panel is a two-column grid at 390px whose right column is five review-type pills stacked VERTICALLY and whose left column crams a native date input, a 'Why this date?' link and a rationale paragraph into roughly 100px. The engine's controls are fully expanded before the musician has said how it went.\n- CONTRAST. Computed from the shipped tokens. Light theme fails WCAG AA for small text on --text-faint (2.89), --gold (3.13), --accent (3.50), --tone-warn (3.50), --tone-alert (3.57), --tone-good (3.62) — and white on --accent is 3.95, which is the label on the primary 'Start' button, the single most important control in this Flow. Dark theme fails only --text-faint (3.68 on --bg, 3.35 on --surface), which is the class used for every card's metadata line.\n\nWhat is deliberately NOT here, and why it is not lost: the iOS keyboard (own device lane, gated on an owner readout), SM-2 advancing once per closed block instead of once per due date (a real open defect, but it changes what r-practice-completes-reviews MEANS and needs a signed owner decision), Settings' structure (4594px with exactly one heading element — a different Flow), and Repertoire's three-line header wrap and two ontology paragraphs (a different Flow). Each is named so the next lane can pick it up.",
  "kind": "existing-flow",
  "flowId": "practise-todays-recommendation",
  "currentBehaviour": "Today opens on the session instrument and shows, in this order: the instrument switcher, a collapsed 'Plan this session' doorway, a collapsed 'Routines' doorway, then the PRACTISE NOW card. The recommendation is above the fold at 390x844 but is the fourth thing on screen — two orchestration choices are presented before the app's actual answer.\n\nWithin that card, and within every row and card downstream of it, Persian content is laid out backwards. A Farsi title carries dir=\"auto\" and resolves to direction:rtl, so it aligns to the right edge of its cell; the English eyebrow above it, the English reason beneath it and the 'due N days ago' caption under it carry no direction at all and align to the left edge of the same cell. Nothing in the app ever puts direction on a container: 80 dir=\"auto\" attributes across 17 files, zero on a wrapper. unicode-bidi: plaintext is set on .input and .textarea only, not globally as AGENTS.md states.\n\nA due-review row gives its title 113px of a 356px row because 'Not now', '+2d' and the play button take the rest, so Farsi titles truncate after roughly 13 characters.\n\nThe close screen is 1689px tall at 390px — 2.15 screens. Result, minutes, observation, next action, a body/tension disclosure, a status suggestion, 'Should this come back?', a native date field, a 'Why this date?' rationale and five vertically stacked review-type pills are all reachable on one scroll, with the scheduling controls fully expanded before a result has been chosen. Saving already, correctly, requires a result, and 'Save without a result' keeps not_logged deliberate.\n\nLight theme fails WCAG AA for small text on six tokens, including white on --accent at 3.95 — the primary Start button's own label. Dark theme fails --text-faint, the class used for every metadata line.",
  "desiredBehaviour": "1. DIRECTION FOLLOWS CONTENT, EVERYWHERE. A title and the details that belong to it are wrapped in one group that carries the direction, so both align to the same edge: a Farsi item reads as one right-aligned block, an English item stays exactly as it looks today. Direction stays NATIVE — dir=\"auto\" resolved by the browser from the first strong character; no hand-rolled detection, no reordering of text in JavaScript. Where an English eyebrow precedes the Farsi title in the DOM (the Practise-now card), the group is drawn around title+reason rather than the whole card, because dir=\"auto\" resolves from the first strong character in the subtree. Applied at every existing title/details pair across Today, Start, Active, Close, Repertoire, Lessons, Pathways, Stages, Session Plan, Routine runner, Materials, Item detail and the shared item components. Group headings that render Farsi (the dastgah headings) get direction too, so a heading no longer disagrees with the rows beneath it.\n\nTHE COMPLETION BOUNDARY IS EXPLICIT, so neither builder nor reviewer has to guess whether the sweep is finished. The rule: after this lane, dir=\"auto\" appears on GROUPS (the element holding a title together with the details that belong to it) and on free-text FIELDS (input/textarea/select) — and never bare on a title element. At HEAD 7a71179 there are exactly 80 dir=\"auto\" occurrences, which reconcile as 32 + 47 + 1. Two defect shapes are in scope; a third category is explicitly out.\n\n  SHAPE A — direction sits on the title instead of the group. 47 display-text sites in 12 files, enumerated by line so a reviewer can tick them off:\n    src/pages/Today.tsx (11) — 95, 204, 310, 321, 381, 507, 541, 568, 595, 669, 767\n    src/pages/ItemDetail.tsx (6) — 126, 370, 392, 546, 552, 559\n    src/pages/Repertoire.tsx (5) — 206, 225, 262, 265, 293\n    src/pages/ActiveBlock.tsx (4) — 87, 98, 206, 211\n    src/pages/SessionPlan.tsx (4) — 136, 137, 229, 230\n    src/components/ClassQuestions.tsx (4) — 71, 74, 78, 83\n    src/pages/Lessons.tsx (3) — 518, 523, 658\n    src/pages/PathwayDetail.tsx (3) — 240, 307, 314\n    src/pages/StageDetail.tsx (2) — 192, 301\n    src/pages/RoutineRunner.tsx (2) — 179, 254\n    src/components/ItemMaterial.tsx (2) — 57, 116\n    src/pages/Materials.tsx (1) — 176\n  SHAPE B — a user-authored title rendered with NO direction at all, which is just as wrong and easier to miss because nothing in the source marks it. The confirmed rendering instances: CloseBlock.tsx:149 (the close screen's own item title — that file has zero dir=\"auto\" today), StartBlock.tsx:196 (the item-picker rows), ItemCard.tsx:25 (the shared card title), Attachments.tsx:142 and ItemDetail.tsx:498 (user file names), ItemDetail.tsx:553 (study source), Insights.tsx:154 and :156 (insight text that embeds item titles), Repertoire.tsx:431 and PathwayDetail.tsx:95 (pathway names), PathwayDetail.tsx:353, StageDetail.tsx:357 and RoutineRunner.tsx:216 (routine names), Materials.tsx:171 and Lessons.tsx:261 (instrument headings), Lessons.tsx:647 (item title), TeacherReport.tsx:57 and Today.tsx:766 (instrument names).\n\n  EXPLICITLY OUT, so a reviewer does not raise them as misses: the 32 free-text FIELD sites in 10 files, which already work and stay byte-identical; the contents of <option> elements (RoutineEdit.tsx:215, ItemForm.tsx:218 and the instrument selects), because the native control owns their rendering; and title text inside confirm() and toast template strings, which are plain strings, not laid-out blocks. src/components/ItemForm.tsx, src/components/QuickAdd.tsx and src/pages/RoutineEdit.tsx are therefore NOT in scope at all: between them they hold 15 field sites and zero display-text sites.\n\n  Both shapes are held closed mechanically by a named test rather than by care (see the acceptance checks), and AGENTS.md records the surface list so the next lane inherits it. If the builder finds a title that genuinely has no group, the exception goes in that test's explicit allowlist and in AGENTS.md — an exception must be VISIBLE, never silent.\n\n2. THE ITEM'S NAME GETS THE ROOM. The due-review row stops starving its title to seat three controls: the title takes the width it needs and the actions are arranged so a real Farsi title is legible rather than truncated after a few characters. 'Not now', '+2d' and 'practise' all remain reachable and keep their existing, distinct semantics — this is layout only.\n\n3. THE RECOMMENDATION IS FIRST. Practise now sits directly under the instrument switcher; 'Plan this session' and 'Routines' become two compact doorways beneath it, still peers of each other, still independently openable, still carrying their 'Resume your plan' / 'Resume your routine' takeovers. Built as the new default and judged on the owner's own iPhone; it reverts before the lane ships if it reads worse than the current order.\n\n4. THE CLOSE SCREEN PUTS THE MUSICIAN'S WORDS FIRST. Always visible: how did it go, what did you notice, what to try next time. The scheduling decision collapses to ONE honest line — the date and review type that will actually be saved, e.g. 'Review in 2 days · Repair' — with the full controls (date field, review-type choice, 'Why this date?', the come-back Yes/No) one tap behind it. Same data, same defaults, same required result, same 'Save without a result' escape hatch; less supervision of the algorithm. The one-line summary is computed from the SAME ReviewPlan object that seeds the date field, so r-explainable-scheduling's 'the date shown before saving is exactly the date saved' holds by construction rather than by care, and that formatter is pure and unit-tested.\n\n5. EVERY LABEL CAN BE READ. The failing colour tokens move — in both themes — until every small-text pair the app ships meets WCAG AA, white on --accent included. A test computes the ratios from the shipped stylesheet and fails the suite if a token regresses, so this cannot silently come back.",
  "mustNotChange": [
    "No file under src/domain/** or src/store/** changes: computeReview, computeReviewOutcome, completeOpenReviewsFor, resolveReviewDate, scoreItems, recommend, buildSessionPlan and every other decision stay byte-identical. This lane is presentation only.",
    "No schema change, no SCHEMA_VERSION bump, no migration — nothing this lane does is persisted.",
    "CloseBlock derives the review date ONCE. There is a single ReviewPlan value in that component; the collapsed summary line and the expanded date field are two renderings of it, and clampSchedulingParams(db.settings) is threaded into that one derivation. A second planNextReview call, or a date computed anywhere but from that value, is the drift r-explainable-scheduling exists to prevent — the guarantee must be that a divergent date is UNREPRESENTABLE, not that both call sites were remembered. (CloseBlock.tsx:79 and :94 are two derivations today.)",
    "A result stays REQUIRED to save a block, and 'Save without a result' stays reachable and deliberate so not_logged is still a real choice; a resultless close still leaves the item's review date AND its open Review row untouched.",
    "r-quick-start holds: starting stays under 30 seconds, closing under 60, and no new required field is introduced anywhere.",
    "The Active screen stays a practice screen — no dashboard, no viewer, no new panel. useScreenAwake/screenAwake and nextSignal are untouched, and nothing in this lane may influence a recorded minute.",
    "The shell stays the next lane's territory: the 100dvh height model with its 100vh @supports fallback, overflow:hidden on html/body/#root, only <main> scrolling, and the .tabbar rules in global.css are all untouched, as is src/components/useViewportGuard.ts.",
    "r-no-gamification: no re-layout introduces a streak, score, badge, fabricated percentage, bar that fills or colour that judges.",
    "Direction stays native — dir=\"auto\" resolved by the browser. No hand-rolled direction detection and no reordering of Farsi text in JavaScript.",
    "The primary recommendation stays above the fold at 390x844, and r-one-instrument-per-session holds: no other instrument's work appears inside a session.",
    "Both search boxes keep filtering through itemMatchesSearch. English-only content (Classical Guitar) keeps its LAYOUT exactly as it is today — same left alignment, same order, same grouping; the direction work must be a no-op for it. The ONE intended difference on English screens is the colour-token correction, which is global by nature and applies to every screen in both languages: six failing tokens move, every passing token is left untouched, and no layout, spacing or type changes with them.",
    "Session Plan and Routines remain two independent peer doorways with their own open/close state and their own resume takeovers — moving them below the recommendation must not nest one inside the other.",
    "Any title that genuinely cannot be grouped is recorded as an explicit, named exception in the direction test's allowlist and in AGENTS.md. Silently leaving a title ungrouped, or satisfying the test by deleting dir=\"auto\" without moving it to a group, both fail the lane — the second would break Farsi rendering outright."
  ],
  "assumptions": [
    "The owner's daily instruments (Setar, Tar) hold Farsi-authored titles, so the direction defect affects most of their real content; Classical Guitar is English and must look unchanged.",
    "dir=\"auto\" resolves from the first strong character in the element's subtree, so wrapping a title+details group works only where the title precedes the details in the DOM — which is true of every row inspected, but NOT of the Practise-now card, whose English 'PRACTISE NOW' eyebrow comes first.",
    "jsdom cannot compute dir=auto resolution or text-align, so a component test could only assert where an attribute sits — weaker than the visual check that must happen anyway. That is why no test infrastructure is added in this lane.",
    "The contrast test reads the shipped stylesheet with fs and computes WCAG ratios in Node; it needs no new dependency and no environment change to the existing vitest 'node' setup.",
    "Moving the recommendation above the two doorways is reversible: it is one ordering change in Today.tsx with no data or state implications, so the manual:OWNER judgement can genuinely send it back.",
    "If collapsing CloseBlock to a single ReviewPlan derivation turns out to be impossible once the builder is in the file, then jsdom earns its cost for that ONE assertion — 'the summary line and the date input show the same date' is a plain two-places-one-value check and jsdom does that well. The no-jsdom decision is reasoned from the direction work, where jsdom genuinely cannot compute dir=auto resolution or text-align; that reasoning does not transfer to this assertion. Structural collapse stays the first choice, and the fallback is named here so the builder does not pick one silently."
  ],
  "possibleConflicts": [
    "src/styles/global.css is also the file the iOS keyboard lane will need. With wipLimit 2 both lanes can be open at once; sequence them or expect a merge in that one file.",
    "src/pages/Today.tsx is a touchpoint of clear-a-due-review as well as this Flow. The due-review row re-layout changes how that Flow LOOKS without changing what any of its three actions does — that Flow's truth should not need re-recording, but its mechanics hash will move.",
    "Colour tokens are global, so every Flow's appearance shifts slightly. Only the pairs that fail AA move; the rest are left alone.",
    "Repertoire, Lessons, Pathway, Stage, Materials and Item detail are touchpoints of other Flows and are in scope for the direction wiring ONLY. A reviewer seeing those files changed should find nothing in them but the direction grouping."
  ],
  "scope": {
    "allow": [
      "src/pages/Today.tsx",
      "src/pages/StartBlock.tsx",
      "src/pages/ActiveBlock.tsx",
      "src/pages/CloseBlock.tsx",
      "src/pages/Repertoire.tsx",
      "src/pages/ItemDetail.tsx",
      "src/pages/Lessons.tsx",
      "src/pages/PathwayDetail.tsx",
      "src/pages/StageDetail.tsx",
      "src/pages/SessionPlan.tsx",
      "src/pages/RoutineRunner.tsx",
      "src/pages/Materials.tsx",
      "src/pages/Insights.tsx",
      "src/pages/TeacherReport.tsx",
      "src/components/ItemCard.tsx",
      "src/components/ItemMaterial.tsx",
      "src/components/ClassQuestions.tsx",
      "src/components/Attachments.tsx",
      "src/components/ui.tsx",
      "src/components/format.ts",
      "src/components/format.test.ts",
      "src/components/direction.test.ts",
      "src/styles/global.css",
      "src/styles/contrast.test.ts",
      "AGENTS.md",
      "DECISIONS.md"
    ],
    "forbid": [
      "src/domain/**",
      "src/store/**",
      "src/App.tsx",
      "src/main.tsx",
      "src/components/Layout.tsx",
      "src/components/useViewportGuard.ts",
      "src/components/useScreenAwake.ts",
      "src/components/screenAwake.ts",
      "src/pages/Settings.tsx",
      "src/pages/More.tsx",
      "src/pages/NewItem.tsx",
      "vite.config.ts",
      "index.html",
      "package.json",
      ".prismatica/**",
      ".github/**"
    ]
  },
  "exclusions": [
    "The iOS keyboard / bottom-nav drift, and everything in src/components/useViewportGuard.ts and src/components/Layout.tsx. Agreed as its own device lane, next: its three candidate causes have three different fixes, and choosing between them needs an instrumented readout the owner takes on the real iPhone before a line is written.",
    "jsdom, .test.tsx and browser journeys as a general capability. Reassessed for this lane specifically and deliberately not added — checks.journeys stays false — because the bulk of the work is direction layout, which jsdom cannot evaluate at all (no dir=auto resolution, no text-align computation), so it would assert only where an attribute sits. The ONE exception is named in the assumptions: if CloseBlock cannot be collapsed to a single ReviewPlan, jsdom may be added for that single two-places-one-value assertion and nothing else. The keyboard lane is where a pure, port-injected extraction genuinely pays, following the repo's own screenAwake.ts precedent.",
    "Settings' structure (4594px, exactly one heading element, sections as unlabelled divs). Real, and both an IA and an accessibility problem — but it belongs to adjust-how-scheduling-works and back-up-and-restore, not to the practice loop.",
    "Repertoire's header (the 'Add practice item' button wrapping to three lines at 390px) and its two explanatory ontology paragraphs. Belongs to browse-my-repertoire. In Repertoire.tsx and the other non-loop files, ONLY the direction wiring changes.",
    "SM-2 advancing once per closed block rather than once per due date, so practising the same item three times in an afternoon pushes its next review from 2 days to about 15. Still open and still wrong, but it changes what r-practice-completes-reviews MEANS and therefore needs a signed owner decision of its own. Named here so it is not lost — it should be the lane after the keyboard.",
    "Still-open findings that belong to no part of this sentence: dormant/'Resting' items still scored and still gaining neglect, ItemForm allowing an item to become its own parent and leaving stale family metadata on an instrument switch, a malformed backup attachment being skipped and then destroyed, frozen 'now' on CloseBlock/ItemDetail/Lessons/Repertoire/SessionPlan/TeacherReport (and the SessionPlan reseed that can therefore never fire), Insights and the Teacher report mixing 'during this period' with 'right now', Settings describing sync as 'newest copy wins', Field giving single controls no accessible name, and .prismatica/product-map.md still holding placeholders.",
    "src/components/ItemForm.tsx, src/components/QuickAdd.tsx and src/pages/RoutineEdit.tsx are deliberately outside scope. The corrected inventory shows they hold 15 free-text FIELD sites and zero display-text sites between them — their dir=\"auto\" usage is already correct and must not be touched."
  ],
  "acceptance": [
    {
      "description": "REGRESSION GUARD, stated as such: the tri-state close decision is pure and sits in forbidden territory, so this test cannot fail from this lane's edits — it exists to prove the restructure did not reach past its scope. It discriminates 'no result chosen' (item's next review date kept) from 'review genuinely declined' (date cleared), the two states a skipped tap used to conflate.",
      "test": "keeps the item's review date when no result was chosen and still clears it when a review is declined"
    },
    {
      "description": "REGRESSION GUARD, same standing as the previous one: a resultless close leaves the item's open Review row OPEN while a genuine decline completes it. Green today and must stay green; it proves scope was respected, not that the new wiring is correct.",
      "test": "leaves an open review row open when no result was chosen and still completes it on a genuine decline"
    },
    {
      "description": "THIS is the check that guards the restructure. CloseBlock is collapsed to a SINGLE ReviewPlan value, and the new pure formatter reports exactly that plan's dueDate, reviewType and rationale — so the collapsed line and the expanded date field are two renderings of one value and a divergent date becomes unrepresentable, the way installDatabase's signature makes an un-reset install unrepresentable. New formatter in src/components/format.ts, tested in a new src/components/format.test.ts under the existing node environment.",
      "test": "the one-line review summary reports exactly the ReviewPlan's due date, type and rationale"
    },
    {
      "description": "An explicitly listed set of (foreground token, background token) pairs — the ones the app actually renders small text in, written out in the test so a reviewer can see exactly what is and is not covered — meets WCAG AA (4.5:1). The list must include the two pairs measured as failing at HEAD: --accent-contrast on --accent (the primary Start button's own label, 3.95 in light) and --text-faint on --bg (2.89 light, 3.68 dark). Ratios are computed from the shipped stylesheet and asserted in EVERY block where those tokens are declared, not the first: global.css declares the light palette twice — at :root[data-theme='light'] (line 80) and again inside @media (prefers-color-scheme: light) { :root:not([data-theme]) } (line 114) — and the duplicate is what an owner who has never picked a theme actually sees. A regression in either block fails the suite. The claim is bounded to the listed pairs; it is not a claim about every theoretically possible combination. New test in src/styles/contrast.test.ts.",
      "test": "every listed colour pair meets WCAG AA in every block where its tokens are declared"
    },
    {
      "description": "The direction sweep is provably complete rather than spot-checked, which is what stops a reviewer later finding 'PathwayDetail was a stated surface but one title was missed'. The test scans the source and asserts BOTH halves: (a) no element carrying a title class (truncate, title-md, page-title, stage-unit-title) carries dir=\"auto\" directly any more — a missed title still has it and fails; and (b) every file on the recorded surface list carries direction on at least one group element that is neither a title nor an input/textarea — so a whole skipped file fails, and 'fixing' it by deleting the attribute fails too. Genuine exceptions live in an explicit allowlist inside the test, so they are visible to the reviewer. New test in src/components/direction.test.ts.",
      "test": "direction lives on the group: no title element carries dir=\"auto\", and every listed surface has one"
    },
    {
      "description": "On the owner's iPhone, in the INSTALLED PWA, Farsi and English are discriminated correctly rather than uniformly re-aligned: a Farsi item's title AND its own details both align to the right edge, while an English item's title and details both stay on the left — checked on Today (the Practise-now card, a due-review row and the class row), Start, Active, Close, Repertoire and Lessons. A card where the title and its details still point at opposite edges fails, and so does an English card that has started aligning right. This check is deliberately REPRESENTATIVE, not exhaustive: completeness across all 16 surfaces is the automated direction test's job, and this one proves that what the test enforces actually renders correctly on the device.",
      "test": "manual:OWNER"
    },
    {
      "description": "On the owner's iPhone at 390x844 with the recommendation moved above the two doorways: Practise now is the first thing under the instrument switcher, 'Plan this session' and 'Routines' are both still reachable without scrolling and still open independently, and the owner judges the new order better than the old. If it reads worse, the order reverts before the lane ships — that reversal is a passing outcome of this check, not a failure of the lane.",
      "test": "manual:OWNER"
    },
    {
      "description": "The saved-data boundary, end to end on the restructured screen — the one check that can actually fail from this lane's edits. Close three blocks on the same item and discriminate the outcomes: (a) 'Save without a result' leaves the item's next review date unchanged and leaves it listed under Due reviews; (b) choosing a result saves EXACTLY the date the collapsed line showed before saving, verified by reopening the item; (c) opening the controls and answering 'Should this come back? No' clears the date and removes it from Due reviews. If the restructure has rewired the tri-state mapping, (a) and (c) stop differing — which is the bug this app already paid a heavy lane to fix once.",
      "test": "manual:OWNER"
    }
  ],
  "risk": {
    "touchesAuth": false,
    "touchesPayments": false,
    "touchesSavedData": true,
    "copyOnly": false,
    "rationale": "Answered TRUE for saved data deliberately, even though no file under src/store/** or src/domain/** may change. The close screen is the one place in this lane that WRITES: it saves a practice block and, with it, an item's next review date and the state of its open Review row. Restructuring that screen moves the controls that feed those writes, and this repository has already paid for exactly that mistake once — a single skipped tap used to erase a next review date, complete the open row and leave SM-2 state stale while the panel read 'Should this come back? Yes'. So the lane is scoped to forbid the decision code, and the checks are honest about which of them can actually fail from it. The two named domain tests are REGRESSION GUARDS — pure, in forbidden territory, green today, and green whether or not the new wiring is right; they prove scope was respected, nothing more. The restructure itself is guarded two ways: structurally, by collapsing CloseBlock to a SINGLE ReviewPlan so a divergent date is unrepresentable rather than merely discouraged, with a pure test on the formatter that renders it; and behaviourally, by an owner check that discriminates 'saved without a result' from 'review declined' on the real screen, which is the only place the wiring is observable. Nothing else in the lane persists anything: direction grouping, row widths, screen order and colour tokens are all presentation. No schema, no migration, no backup or sync format is touched."
  },
  "delta": {
    "today": "Today shows two orchestration doorways before the app's actual answer, and from that card onward the app lays Persian content out backwards. A Farsi title resolves to direction:rtl and hugs the right edge of its cell while the English eyebrow above it, the reason below it and the 'due N days ago' caption under it all hug the left edge of the same cell — 80 dir=\"auto\" attributes across 17 files and not one of them on a container. The due-review row leaves its title 113px of a 356px row, so a Farsi title truncates after about 13 characters. The close screen runs 1689px at 390x844 with the scheduling engine's controls — a native date field, a rationale paragraph squeezed into roughly 100px, and five review-type pills stacked vertically — fully expanded before the musician has said how it went. And in light theme the label on the primary Start button sits at 3.95:1, below AA.",
    "instead": "The content leads. A title and the details that belong to it sit in one group that carries the direction, so a Farsi item reads as one right-aligned block and an English item looks exactly as it does today — resolved natively by dir=\"auto\", never by hand. The due-review row gives the title the room and keeps all three actions with their existing distinct meanings. Practise now moves directly under the instrument switcher, with Plan and Routines as two compact peer doorways beneath it. The close screen leads with how it went, what you noticed and what to try next time, and collapses the whole scheduling decision into one honest line carrying the date and type that will actually be saved, one tap from the full controls — computed from the same ReviewPlan that seeds the date field, so the date shown is still the date saved. And every small-text colour pair meets AA in both themes, with a test that recomputes the ratios from the shipped stylesheet so it cannot quietly regress.",
    "keep": [
      "A result stays required to save, and 'Save without a result' stays a reachable, deliberate way to record not_logged.",
      "A resultless close still changes no schedule: the item's date stays and its open Review row stays open; only a genuine decline clears and completes.",
      "Practising stays the only thing that completes a review and advances SM-2; 'Not now' still only hides for the day and '+2d' still moves the real date on both sides.",
      "Starting stays under 30 seconds, closing under 60, and a title stays the only required field anywhere.",
      "The Active screen stays deliberately empty — the ring, the elapsed figure, the two controls and the two existing disclosures. The wake lock and the boundary announcement are untouched and no recorded minute is affected.",
      "Session Plan and Routines stay two independent peer doorways, each with its own state and its own resume takeover; neither becomes a child of the other.",
      "No streak, score, badge, fabricated percentage or judging colour appears anywhere in the re-layout.",
      "English content renders exactly as it does today, and the shell — its 100dvh height model and its tab bar — is left entirely to the next lane."
    ],
    "assumptions": [],
    "showMe": "On the iPhone, open Today on Setar. Practise now is the first thing under the instrument switcher, and the Farsi title with its English reason now sit as one right-aligned block instead of splitting across the card. Scroll to a due review: the Farsi title is legible instead of cut to a few characters, and its 'due N days ago' caption sits under it on the same edge. Switch to Classical Guitar — 'Study in C — full run' looks exactly as it always has, left-aligned. Start a block, finish it: the close screen asks how it went, what you noticed and what to try next time, and the whole review decision is one line, 'Review in 2 days · Repair', with a tap to open the date and type if you want them. Open it and the date is the same date the line just told you. Then switch to light theme and read the small grey metadata lines and the Start button's own label — both are legible now, and a test in the suite will fail if either ever drifts back."
  },
  "desiredRules": [
    "Layout follows the direction of the content it shows: a title and the details that belong to it sit in one group that carries dir=\"auto\", so a Persian item reads as one block instead of splitting across the card. Direction is resolved natively by the browser, never detected in JavaScript, and it lives on the group or on a free-text field — never bare on a title element.",
    "Colour is checked by a test, not by eye: the foreground tokens the app renders small text in are asserted at WCAG AA (4.5:1) against the background tokens they are actually rendered on, in every block where those tokens are declared. The checked pairs are listed explicitly in the test, so a token that is not covered is a visible omission rather than a silent one."
  ],
  "docsDelta": [
    "AGENTS.md",
    "DECISIONS.md"
  ]
}
```
````

## The approved Delta this change must deliver

# The content leads. A title and the details that belong to it sit in one group that carries the direction, so a Farsi item reads as one right-aligned block and an English item looks exactly as it does today — resolved natively by dir="auto", never by hand. The due-review row gives the title the room and keeps all three actions with their existing distinct meanings. Practise now moves directly under the instrument switcher, with Plan and Routines as two compact peer doorways beneath it. The close screen leads with how it went, what you noticed and what to try next time, and collapses the whole scheduling decision into one honest line carrying the date and type that will actually be saved, one tap from the full controls — computed from the same ReviewPlan that seeds the date field, so the date shown is still the date saved. And every small-text colour pair meets AA in both themes, with a test that recomputes the ratios from the shipped stylesheet so it cannot quietly regress.

_approved · about "practise-todays-recommendation"_

## Today

Today shows two orchestration doorways before the app's actual answer, and from that card onward the app lays Persian content out backwards. A Farsi title resolves to direction:rtl and hugs the right edge of its cell while the English eyebrow above it, the reason below it and the 'due N days ago' caption under it all hug the left edge of the same cell — 80 dir="auto" attributes across 17 files and not one of them on a container. The due-review row leaves its title 113px of a 356px row, so a Farsi title truncates after about 13 characters. The close screen runs 1689px at 390x844 with the scheduling engine's controls — a native date field, a rationale paragraph squeezed into roughly 100px, and five review-type pills stacked vertically — fully expanded before the musician has said how it went. And in light theme the label on the primary Start button sits at 3.95:1, below AA.

## Instead

The content leads. A title and the details that belong to it sit in one group that carries the direction, so a Farsi item reads as one right-aligned block and an English item looks exactly as it does today — resolved natively by dir="auto", never by hand. The due-review row gives the title the room and keeps all three actions with their existing distinct meanings. Practise now moves directly under the instrument switcher, with Plan and Routines as two compact peer doorways beneath it. The close screen leads with how it went, what you noticed and what to try next time, and collapses the whole scheduling decision into one honest line carrying the date and type that will actually be saved, one tap from the full controls — computed from the same ReviewPlan that seeds the date field, so the date shown is still the date saved. And every small-text colour pair meets AA in both themes, with a test that recomputes the ratios from the shipped stylesheet so it cannot quietly regress.

## Keep

- A result stays required to save, and 'Save without a result' stays a reachable, deliberate way to record not_logged.
- A resultless close still changes no schedule: the item's date stays and its open Review row stays open; only a genuine decline clears and completes.
- Practising stays the only thing that completes a review and advances SM-2; 'Not now' still only hides for the day and '+2d' still moves the real date on both sides.
- Starting stays under 30 seconds, closing under 60, and a title stays the only required field anywhere.
- The Active screen stays deliberately empty — the ring, the elapsed figure, the two controls and the two existing disclosures. The wake lock and the boundary announcement are untouched and no recorded minute is affected.
- Session Plan and Routines stay two independent peer doorways, each with its own state and its own resume takeover; neither becomes a child of the other.
- No streak, score, badge, fabricated percentage or judging colour appears anywhere in the re-layout.
- English content renders exactly as it does today, and the shell — its 100dvh height model and its tab bar — is left entirely to the next lane.

## New assumptions

_none_

## Show me

On the iPhone, open Today on Setar. Practise now is the first thing under the instrument switcher, and the Farsi title with its English reason now sit as one right-aligned block instead of splitting across the card. Scroll to a due review: the Farsi title is legible instead of cut to a few characters, and its 'due N days ago' caption sits under it on the same edge. Switch to Classical Guitar — 'Study in C — full run' looks exactly as it always has, left-aligned. Start a block, finish it: the close screen asks how it went, what you noticed and what to try next time, and the whole review decision is one line, 'Review in 2 days · Repair', with a tap to open the date and type if you want them. Open it and the date is the same date the line just told you. Then switch to light theme and read the small grey metadata lines and the Start button's own label — both are legible now, and a test in the suite will fail if either ever drifts back.


## Flows near this scope (understand before you change them)

# See and adjust the scheduling engine

_Works now · approved 2026-08-28T13:30:17.733Z by Ethan (signed)_

## Goal

Understand exactly why an item was recommended and a date chosen — and change the numbers if they do not suit you.

## Starts when

The musician follows 'Why this date?' from the close screen, or opens Settings → 'How scheduling works'.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** States the real priority formula and the spaced-repetition rungs in plain English, filled in with the values currently in force.
   - Shows: The priority terms, the current first/second/slip-reset gaps, and how importance and difficulty pull material sooner.

2. **The musician** Changes a value — a review gap, the warm-up or deep-work share of a plan, the shortest or longest review slot.
   - Shows: The explanation updates to the new numbers.
   - Changes: The settings are stored with the practice data, clamped to safe bounds; out-of-range input is never trusted.

3. **The musician** Closes a block or builds a plan afterwards.
   - Shows: Review dates and plan shapes computed with the adjusted values.
   - Changes: The same settings are used for the date previewed and the date saved.

4. **The musician** Taps 'Reset to recommended' whenever they want the original behaviour back.
   - Shows: 'Using the recommended defaults.'
   - Changes: The settings field is dropped, so the historical constants apply exactly.

## Ends with

The engine is understood and, if wanted, tuned — and it still produces the same date it showed.

## Variations

- **Never customised** — With no settings stored the defaults reproduce the original constants exactly, so old backups import unchanged. _(Works now)_
- **Per-item override** — An individual item can be set to a fixed cadence or to manual dates instead of automatic spaced repetition. _(Works now)_

## Rules

- Scheduling is deterministic and explainable — visible and adjustable, never magic.
- Bounds are enforced on every stored value.

## Involves

- The musician
- The spaced-repetition scheduler
- The plan builder

---

# Find something in my repertoire

_Works now · approved 2026-08-28T13:30:17.801Z by Ethan (signed)_

## Goal

See everything you play, grouped the way you think about it, and open the one you mean.

## Starts when

The musician opens Repertoire and picks one of the three views: Pathways, My repertoire, or Practice list.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Chooses 'My repertoire'.
   - Shows: Persian works grouped under their dastgāh — radif gushehs and composed maestro pieces side by side — and other instruments grouped by study source.
   - Changes: Nothing; this is a lens over ordinary items, not a separate store.

2. **Practice Compass** Folds dastgāh spelling variants together, labels each group with the user's own majority spelling, and keeps parts nested under their parent work.
   - Shows: Each work appears exactly once, however many sources, stages and lessons it is linked to.

3. **The musician** Optionally filters by form, or narrows to one instrument.
   - Shows: Form chips built from what is actually present.

4. **The musician** Or chooses 'Practice list' and filters by search, instrument, status, type, or a quick chip (due today, for class, fragile, neglected, overworked, teacher question).
   - Shows: Items in priority order, each with its status and stats.

5. **The musician** Opens an item.
   - Shows: Its page: status, connections, stats, result trend, recent blocks, parts, notes and files.
   - Changes: Nothing until an action is taken there.

## Ends with

The right piece is found and opened in a couple of taps, from whichever way of thinking about it came first.

## Variations

- **No dastgāh yet** — Works with Persian identity but no dastgāh sit in an explicit 'No dastgāh yet' group at the end. _(Works now)_
- **Technique stays out** — Drills and generic exercises are not works — they live in the Practice list only. _(Works now)_

## Rules

- 'My repertoire' is a derived lens, never a parallel database of pieces.
- Links never duplicate an item.
- Study sources stay simple: instrument, one clear name, kind, status, note.

## Involves

- The musician

---

# Add a practice item

_Works now · approved 2026-08-28T13:30:17.831Z by Ethan (signed)_

## Goal

Get a new piece, gusheh, étude, passage or technique into the app without breaking your concentration.

## Starts when

The musician wants to record something to work on — from Today, a stage, a lesson, the practice list, or the Start screen.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Types a title into the quick-add box and presses Add.
   - Shows: 'Added ✓' with an 'add details' link.
   - Changes: A practice item exists, with the instrument taken from context (stage's pathway, lesson, or the current session instrument) and sensible defaults for everything else. From a lesson it is linked to that lesson at the same time.

2. **The musician** Or chooses 'Add practice item' for the full one-step form.
   - Shows: A kind-first form: what you are adding (gusheh / composed piece / piece / étude / passage / technique), then only that kind's identity fields, then 'Connect it (optional)', then the first practice setup.

3. **The musician** Fills in identity, and optionally connects a study source (creatable inline), a pathway stage, a lesson and a parent work — all at creation.
   - Shows: Persian instruments are asked for dastgāh, gusheh, form and composer, with dastgāh and form offered as datalist suggestions; free text always wins.

4. **The musician** Saves.
   - Shows: The item's own page, with a 'Connected to' summary near the top.
   - Changes: One item, linked to whatever it belongs to — links never duplicate the item.

## Ends with

The thing to practise exists and can be started immediately; details can be filled in later, or never.

## Variations

- **Create while starting** — The Start screen's quick create takes a title only, then begins the block right away; a link opens the full form and returns with the item preselected. _(Works now)_
- **Edit later** — The same kind-first form is the item's inline edit, so nothing needs a second creation path. _(Works now)_

## Rules

- Exactly two creation paths, both one-step: title-only quick add, and the full kind-first form.
- No required field beyond a title.
- Free text is direction-aware so Farsi and English can be mixed anywhere.

## Involves

- The musician

---

# Deal with a due review

_Works now · approved 2026-08-28T13:30:17.861Z by Ethan (signed)_

## Goal

Handle material that is due to come back, without ever faking that it was practised.

## Starts when

Today lists 'Due reviews' for the session instrument — items whose review date has arrived.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Lists each due review with the item's title and how long it has been due, and hides any review dismissed earlier today.
   - Shows: A 'Due reviews' section with three actions per row and one line explaining what each does.

2. **The musician** Taps ▶ to practise it.
   - Shows: The active block, seeded from the item's status and focus.
   - Changes: Nothing yet — the review only completes when the block is closed.

3. **The musician** Or taps 'Not now'.
   - Shows: The row disappears for the rest of the day and returns tomorrow.
   - Changes: Only a per-day dismissal list in the app's session state — no review or item date is touched.

4. **The musician** Or taps '+2d' to genuinely move it.
   - Changes: The review's due date and the item's next review date both move to two days from today, so nothing is left showing overdue.

## Ends with

Either the item was actually practised (and spaced repetition advanced), or the schedule was moved honestly — never both, never neither.

## Variations

- **Snoozed from a stale date** — The new date is counted from today, not from the old overdue date, so a long-ignored review does not stay in the past. _(Works now)_

## Rules

- 'Not now' changes no schedule; snooze moves the real date on both the review and the item.
- No action may fabricate a practice result.

## Involves

- The musician
- The spaced-repetition scheduler

---

# Log a class and its follow-up work

_Works now · approved 2026-08-28T13:30:17.922Z by Ethan (signed)_

## Goal

Record a lesson, write up what was said after rewatching it, and turn it into concrete work before the next one.

## Starts when

The musician taps 'Add a class' on the Lessons screen for one instrument.

## Needs first

- At least one instrument exists

## Steps

1. **The musician** Accepts the pre-filled class number and picks the date.
   - Shows: The class appears as 'Class N · date', newest first, with 'upcoming' while it is still ahead.
   - Changes: A Lesson is stored for that instrument; the number is optional and editable.

2. **The musician** Rewatches the class and types the notes, in Farsi or English.
   - Shows: A direction-aware notes field; the list shows 'notes ✓' once there is text.
   - Changes: Notes are saved when the field loses focus.

3. **The musician** Adds a link to the class recording and to any scores — a NAS path or a full https link.
   - Shows: The links listed video-first, then PDFs and documents, each with its kind icon and 'Stored on NAS'.
   - Changes: Only a reference (title, path, kind, notes) is stored — never the file itself.

4. **The musician** Taps 'Open' on a link.
   - Shows: The file opens in a new tab, resolved against the NAS base URL from Settings.
   - Changes: Nothing is stored or downloaded into the app; removing a link never touches the NAS file.
   - Only if: A NAS base URL is set in Settings and the NAS is reachable from this device

5. **The musician** Links or quick-adds the practice items that came out of the class, and flags the ones to be ready for next time.
   - Shows: Each linked item with its status and a 'For next class' toggle.
   - Changes: The lesson keeps a link to the item (never ownership — unlinking keeps the item); a flagged item gains a priority boost that climbs as that instrument's next class approaches.

6. **The musician** Optionally attaches small hand-outs (a PDF, a photo, a short audio).
   - Shows: Files over 10 MB and any video are warned about; over 40 MB is refused with a clear message.
   - Changes: Small blobs are stored on the device and travel with backups and sync.

## Ends with

The class is on record, its material is real practice items, and the work due before the next class is prioritised automatically.

## Variations

- **No NAS base URL yet** — The link shows 'Set your NAS base URL in Settings to open this' and the Open button stays disabled — never a broken link. _(Works now)_
- **Invalid base URL** — An unparseable base is reported as such and nothing is opened, rather than resolving to a wrong in-app address. _(Works now)_
- **Import the Setar class history** — Settings → 'Import Setar classes' adds the logged sessions as lessons with their recording and score links, additively and idempotently, backfilling refs missing from classes already imported. _(Works now)_
- **Wide screen** — At 1000px and above the class list sits beside the open class, giving long Farsi notes real room. _(Works now)_

## Rules

- Class videos and scores are references to the user's NAS, never bytes in the app, sync or backups.
- A lesson link to an item is a link, never ownership.
- The next class is the one sanctioned deadline — per instrument, never guilt-toned.

## Involves

- The musician
- The teacher (indirectly)
- The NAS

---

# Point this device at the NAS

_Works now · approved 2026-08-28T13:30:17.952Z by Ethan (signed)_

## Goal

Give this device the address that turns a class recording or score link into a file it can actually open — without any of those files entering the app.

## Starts when

In Settings → NAS recordings the musician sets the base URL that serves their recordings folder.

## Needs first

- The recordings folder is served over the network from the NAS and is reachable from this device at some web address

## Steps

1. **The musician** Types the address that serves the recordings folder.
   - Shows: 'Resolves to: …/…' once it is valid, or 'That doesn’t look like a valid web address' if it is not; a host typed without a scheme is completed to https:// when the field loses focus.
   - Changes: The address is stored in this device's local storage. It is environment configuration, not practice data and not a secret: it never enters the database, a backup or a sync snapshot.

2. **The musician** Taps 'Test link' to open a known recording and confirm the address works.
   - Shows: The file opens in a new tab, or the app says the base URL isn’t valid and opens nothing.
   - Changes: Nothing is stored or downloaded — the app fetches a recording only when someone explicitly opens it.

3. **Practice Compass** Resolves every relative recording and score path in every lesson against this address from then on.
   - Shows: 'Open' beside each link; with no address it reads 'Set your NAS base URL in Settings to open this' and stays disabled — never a broken or wrong link.
   - Changes: Nothing in the data; resolving is pure and happens on demand.

## Ends with

This device can open class videos and scores on demand, while the app itself still holds nothing but links.

## Variations

- **Every device sets its own address** — The address is per-device and never syncs, so each device holds whatever address reaches the NAS from where it is — a new device simply has none until it is given one. _(Works now)_
- **The NAS is not reachable right now** — Opening a link fails in the browser like any unreachable address. Nothing in the app changes, no data is lost, and every other flow keeps working offline. _(Works now)_
- **Links that need no address** — A recording stored as a complete https address opens with no base URL set at all. _(Works now)_
- **A bad address** — An unparseable or non-http(s) address is reported as invalid and nothing is opened — it is never silently resolved to an in-app route. _(Works now)_

## Rules

- The NAS address is per-device configuration — never synced, never in a backup, never a password.
- The app stores links to recordings and scores, never their bytes.
- An unusable address is reported, never resolved to a wrong link.
- A recording is fetched only when the musician explicitly opens it — never at startup.

## Involves

- The musician
- The NAS

---

# Practise what the app suggests

_Works now · approved 2026-08-31T22:05:26.192Z by owner (signed)_

## Goal

Practise the one thing the app suggests next and leave an honest record of how it went.

## Starts when

The musician opens Today, picks the instrument they are practising, and sees a single 'Practise now' card.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Taps their instrument in the switcher at the top of Today.
   - Shows: Everything below is scoped to that instrument: recommendation, class work, due reviews, pathway position.
   - Changes: The chosen instrument is remembered as the session instrument.

2. **Practice Compass** Scores every item of that instrument and shows the best one with a one-sentence reason.
   - Shows: One 'Practise now' card above the fold, plus up to two quieter 'then, if you have time' suggestions.

3. **The musician** Taps 'Start · 10 min'.
   - Shows: The active block screen: item title, mode and focus chips, a running ring timer.
   - Changes: A practice block is opened in memory with mode, focus and a 10-minute target derived from the item.

4. **The musician** Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
   - Shows: The elapsed clock, and the item's notes and current problem on request. While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake (best-effort; feature-detected; never affects elapsed time) so the clock stays readable without touching anything; pausing, finishing, discarding or navigating away releases it, and the phone sleeps normally again.
   - Changes: Elapsed seconds accumulate only while the timer runs.

5. **The musician** Taps 'Finish'.
   - Shows: The close screen, with the minutes already filled in.
   - Changes: The clock is frozen first, so reflection time is not counted as practice.

6. **The musician** Picks one of the six results, optionally adds an observation, a next action, a body note or a teacher question, and accepts or declines the suggested status and review date.
   - Shows: A preview of the next review date with the plain reason behind it, and a 'Why this date?' link.

7. **The musician** Taps 'Save block'.
   - Shows: Back to Today (or to the running plan), with the item's stats and status updated.
   - Changes: A PracticeBlock is stored; the item's counters, status, saturation flag and spaced-repetition state advance; any open review for the item is completed and the next one is scheduled on the date that was shown.

## Ends with

The session is recorded honestly: one block, one result, one next action — and the item knows when it should come back.

## Variations

- **Choose something else** — From 'Choose something else to practise…' the Start screen takes instrument → item → mode/focus/duration, with a title-only quick create for something that does not exist yet. _(Works now)_
- **Start from an item or a stage** — 'Start a block' on an item, or ▶ on a pathway stage row, opens the same block with defaults taken from the item's status and focus. _(Works now)_
- **Discard** — 'Discard block' (during) or 'Discard without saving' (at close) throws the block away — nothing is logged and no schedule moves. _(Works now)_
- **Target reached** — When elapsed reaches the block's target, the ring's silent saturation is replaced by a durable 'Target reached' state plus a growing overtime figure (elapsed minus target) — announced once, never once per render. The block does NOT auto-finish — practising past the target stays ordinary, and only Finish or Discard ends it. Whether the screen-wake-lock or the accompanying sound/vibration cue succeeds, fails or is unsupported never changes the elapsed time or the minutes eventually saved. _(Works now)_

## Rules

- Starting a block must stay under 30 seconds and closing one under 60 seconds; a title is the only required field.
- Practising is the only thing that completes a review and advances spaced repetition.
- The review date shown before saving is exactly the date saved.
- A recorded minute is never affected by whether the screen-wake-lock, sound or vibration succeeded — only the wall clock decides elapsed time.

## Involves

- The musician
- The recommendation engine
- The spaced-repetition scheduler

---

# Take questions and a summary to class

_Works now · approved 2026-08-28T13:30:18.013Z by Ethan (signed)_

## Goal

Arrive at the lesson with the questions that came up while practising, and a short honest account of the period.

## Starts when

A question is written on an item (at close, or by editing it) while it is flagged for the next class.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Collects every item for that instrument that is both flagged for the next class and carries a question, ordered with the Persian collator.
   - Shows: A 'Questions for your next class' list on the upcoming lesson and on the Teacher report.

2. **The musician** Copies, downloads or prints the questions.
   - Shows: A numbered plain-text export that preserves mixed Farsi and English, or a friendly empty state when there are none.

3. **The musician** Opens the Teacher report and picks the instrument and a date range (last two weeks by default).
   - Shows: A copyable summary of what was practised, how it went and what is open.

4. **The musician** Taps 'Copy report'.
   - Shows: 'Copied ✓'.
   - Changes: Nothing in the data — the report is generated on the spot.

## Ends with

The musician walks into the lesson with their real questions and a truthful summary, without having kept a separate notebook.

## Variations

- **A question survives practice** — Practising never clears a question — only editing the item removes it. _(Works now)_

## Rules

- A question is never auto-cleared by practising.
- Reports state what happened; they never grade.

## Involves

- The musician
- The teacher

---

# Run a time-budgeted session

_Works now · approved 2026-08-31T22:05:33.129Z by owner (signed)_

## Goal

Turn the minutes actually available into an ordered session, then practise it block by block.

## Starts when

The musician taps 'Plan this session' on Today and chooses a length (15, 20, 30, 45 or 60 minutes).

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Builds a plan from the same priority numbers the recommendation uses, laid out as warm-up, class work, review, focus and cool-down segments.
   - Shows: The plan preview: each segment with its minutes, bucket, item and a one-sentence reason, and a total that always equals the chosen budget.

2. **The musician** Swaps, removes or regenerates segments until the shape looks right.
   - Shows: The remaining minutes are redistributed immediately so the total still equals the budget.
   - Changes: Only a local copy of the plan — nothing is saved yet.

3. **The musician** Taps 'Start plan'.
   - Shows: The runner: the whole list with the current segment highlighted.
   - Changes: The running plan is held in app state (never in the database, never synced), and the chosen length is remembered for this instrument.

4. **The musician** Taps 'Start' on the current segment.
   - Shows: The ordinary active-block screen, with the segment's minutes as the target — identical behaviour to an unplanned block, including the screen staying awake while it runs and is visible, and a durable 'Target reached' state with a growing overtime figure if the segment runs past its minutes without the musician tapping Finish.
   - Changes: A real practice block opens for that segment's item.

5. **The musician** Finishes and saves the block as usual.
   - Shows: Back on the plan, that segment reads 'done' and the pointer moves to the next one.
   - Changes: The block, item stats and review schedule update exactly as in an unplanned block.

6. **The musician** Skips anything they do not want, or ends the plan at any time.
   - Shows: 'Session complete' once the last segment is passed.
   - Changes: A skipped segment logs nothing at all; ending the plan discards it and leaves every logged block untouched.

## Ends with

The available time was spent on real, logged practice in a sensible order — and the plan itself leaves no trace in the data.

## Variations

- **Nothing to plan** — With no items for the instrument the plan is empty and says so rather than inventing filler. _(Works now)_
- **Everything already practised today** — A plan is still produced, and the summary says plainly that everything has been practised today. _(Works now)_
- **Resume** — While a plan runs, Today's card becomes 'Resume your plan' with the count of finished segments. _(Works now)_

## Rules

- Segment minutes always sum to the chosen budget.
- A plan is a view over real practice blocks — it is not a countdown and it is never persisted as data.
- No scores, no 'optimal session' claims.

## Involves

- The musician
- The plan builder
- The recommendation engine

---

# See how practice is actually going

_Works now · approved 2026-08-28T13:30:18.074Z by Ethan (signed)_

## Goal

Get a calm, neutral read on the last week or month across everything you play.

## Starts when

The musician taps 'Overview' on Today, or opens More → Insights.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Taps 'Overview' in the instrument switcher.
   - Shows: Each instrument with its next suggestion and next class, one insight of the day, and a balance bar for the last 7 days.
   - Changes: The session instrument is set to 'all' — a deliberate, secondary choice, never the default.

2. **The musician** Taps an instrument to drop back into a real session for it.
   - Shows: Today, scoped to that instrument again.
   - Changes: The session instrument is set.

3. **The musician** Opens Insights and switches the window between 7 and 30 days.
   - Shows: Neutral observations generated from the logged blocks — patterns, not a scoreboard, and an honest empty state when there is not enough history.

## Ends with

The musician knows where their time actually went, with no streaks, scores or judgement attached.

## Variations

_none_

## Rules

- No gamification: no streaks, points, badges or fabricated mastery percentages.
- Insights are neutral observations, never nags.
- Future-dated blocks never leak into a window that looks backwards.

## Involves

- The musician

---

# Work through a pathway stage

_Works now · approved 2026-08-31T22:05:33.178Z by owner (signed)_

## Goal

Follow a route you trust — see where you are, take the next suggestion into your own items, and practise it.

## Starts when

From Repertoire → Pathways (or the 'Now in:' card on Today) the musician opens a pathway and then a stage.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Shows the stage's rows: your own items laid over the stage's reference catalogue, with progress derived from item status.
   - Shows: A progress bar reading 'n/m solid', guided routines if any, and one line of metadata per row — greyed rows are labelled reference suggestions.

2. **The musician** Taps + on a suggestion.
   - Shows: The row becomes a real item, honestly marked 'Not practised yet', with a lingering Undo card.
   - Changes: A practice item is created from the catalogue entry, carrying its stable catalogue key — adding is organisation, not progress.

3. **The musician** Undoes it, or removes it later from the row's − button, if it was added by mistake.
   - Shows: The row reverts to a suggestion.
   - Changes: The item is deleted only while it is provably untouched (catalogue item, still 'not practised', zero blocks); the check is re-run against live data, so anything practised is kept.

4. **The musician** Taps ▶ on a row to practise it.
   - Shows: The ordinary active block.
   - Changes: A suggestion not yet added is added first, then the block opens.

5. **The musician** Optionally pins the stage as the current one, or edits its code, title and intro.
   - Shows: Today's 'Now in:' card points at the pinned stage.
   - Changes: The pathway records the pinned stage; deleting a stage detaches items instead of deleting them.

## Ends with

The next piece of the route is now a real practice item with real practice behind it, and the stage's progress reflects it honestly.

## Variations

- **Teacher jumps around** — A pinned current stage always beats 'first incomplete stage', because teacher-led work does not go in order. _(Works now)_
- **Guided routine** — A stage routine runs as a segmented warm-up countdown. A segment bound to a real item creates an honest PracticeBlock when the run finishes (result stays 'not_logged', so no review completes and no spaced-repetition state advances — the practice itself IS recorded); a segment with no bound item is pure warm-up and logs nothing at all. While the run is genuinely active and its screen is visible, the app keeps the display awake, and arriving at a new segment is visibly announced — once, and staying perceptible for a few seconds, never a single-render flash. _(Works now)_
- **Off-catalogue items** — Anything quick-added inside the stage appears in the same list and in recommendations. _(Works now)_

## Rules

- The item is the only unit of work — a pathway is a view over items, never a parallel to-do list.
- The catalogue is reference data in code, labelled as an aid, never a fixed syllabus.
- Adding from the catalogue is losslessly reversible until the moment it is practised.
- A routine records at most one PracticeBlock per distinct bound item per run, never one per segment repeat.

## Involves

- The musician
- The pathway catalogue


## App rules

- **r-direction-aware-text** — Every free-text field is direction-aware so Farsi and English can be mixed anywhere, and built-in Persian data is authored in Farsi behind stable ascii identifiers.
- **r-explainable-scheduling** — Every recommendation and review date comes from deterministic, published formulas that carry a one-sentence reason, and the date shown before saving is exactly the date saved.
- **r-large-files-stay-on-nas** — Class videos and score PDFs are stored as references to the user's NAS and never enter local storage, sync or backups; in-app attachments are warned above 10 MB and refused above 40 MB.
- **r-local-first-offline** — All practice data lives in IndexedDB on the device and every core flow works offline — the app has no backend, account or paid service of its own.
- **r-no-gamification** — Progress is shown only as honest status, results and counts — never streaks, points, badges, XP or a fabricated mastery percentage.
- **r-no-silent-data-loss** — Data is never replaced silently: sync compares content hashes rather than timestamps, both-changed is an explicit choice, and the copy about to be replaced is archived first.
- **r-one-instrument-per-session** — Today is a session workspace scoped to one chosen instrument; the cross-instrument overview is a deliberate secondary choice and no other instrument's work appears inside a session.
- **r-practice-completes-reviews** — Only closing a practice block completes a review and advances spaced repetition; 'Not now' hides a review for the day without changing any schedule, and snooze moves the real date on both the review and the item.
- **r-pure-tested-domain** — Domain logic is free of React and side effects, takes an explicit `now`, and is unit-tested; only the store mutates app data.
- **r-quick-start** — Starting a practice block stays under 30 seconds and closing one under 60; a title is the only required field anywhere, and every other field has a smart default.
- **r-secrets-stay-on-device** — The GitHub token and the NAS base URL live only in this browser's local storage — never in exports, backups or synced data.


## The goal

Lay practice out for the content it holds — Persian-aware cards, roomier rows, a calmer close screen

## Stay in scope — you may ONLY change

- src/pages/Today.tsx
- src/pages/StartBlock.tsx
- src/pages/ActiveBlock.tsx
- src/pages/CloseBlock.tsx
- src/pages/Repertoire.tsx
- src/pages/ItemDetail.tsx
- src/pages/Lessons.tsx
- src/pages/PathwayDetail.tsx
- src/pages/StageDetail.tsx
- src/pages/SessionPlan.tsx
- src/pages/RoutineRunner.tsx
- src/pages/Materials.tsx
- src/pages/Insights.tsx
- src/pages/TeacherReport.tsx
- src/components/ItemCard.tsx
- src/components/ItemMaterial.tsx
- src/components/ClassQuestions.tsx
- src/components/Attachments.tsx
- src/components/ui.tsx
- src/components/format.ts
- src/components/format.test.ts
- src/components/direction.test.ts
- src/styles/global.css
- src/styles/contrast.test.ts
- AGENTS.md
- DECISIONS.md

Never touch:

- src/domain/**
- src/store/**
- src/App.tsx
- src/main.tsx
- src/components/Layout.tsx
- src/components/useViewportGuard.ts
- src/components/useScreenAwake.ts
- src/components/screenAwake.ts
- src/pages/Settings.tsx
- src/pages/More.tsx
- src/pages/NewItem.tsx
- vite.config.ts
- index.html
- package.json
- .prismatica/**
- .github/**
- No file under src/domain/** or src/store/** changes: computeReview, computeReviewOutcome, completeOpenReviewsFor, resolveReviewDate, scoreItems, recommend, buildSessionPlan and every other decision stay byte-identical. This lane is presentation only.
- No schema change, no SCHEMA_VERSION bump, no migration — nothing this lane does is persisted.
- CloseBlock derives the review date ONCE. There is a single ReviewPlan value in that component; the collapsed summary line and the expanded date field are two renderings of it, and clampSchedulingParams(db.settings) is threaded into that one derivation. A second planNextReview call, or a date computed anywhere but from that value, is the drift r-explainable-scheduling exists to prevent — the guarantee must be that a divergent date is UNREPRESENTABLE, not that both call sites were remembered. (CloseBlock.tsx:79 and :94 are two derivations today.)
- A result stays REQUIRED to save a block, and 'Save without a result' stays reachable and deliberate so not_logged is still a real choice; a resultless close still leaves the item's review date AND its open Review row untouched.
- r-quick-start holds: starting stays under 30 seconds, closing under 60, and no new required field is introduced anywhere.
- The Active screen stays a practice screen — no dashboard, no viewer, no new panel. useScreenAwake/screenAwake and nextSignal are untouched, and nothing in this lane may influence a recorded minute.
- The shell stays the next lane's territory: the 100dvh height model with its 100vh @supports fallback, overflow:hidden on html/body/#root, only <main> scrolling, and the .tabbar rules in global.css are all untouched, as is src/components/useViewportGuard.ts.
- r-no-gamification: no re-layout introduces a streak, score, badge, fabricated percentage, bar that fills or colour that judges.
- Direction stays native — dir="auto" resolved by the browser. No hand-rolled direction detection and no reordering of Farsi text in JavaScript.
- The primary recommendation stays above the fold at 390x844, and r-one-instrument-per-session holds: no other instrument's work appears inside a session.
- Both search boxes keep filtering through itemMatchesSearch. English-only content (Classical Guitar) keeps its LAYOUT exactly as it is today — same left alignment, same order, same grouping; the direction work must be a no-op for it. The ONE intended difference on English screens is the colour-token correction, which is global by nature and applies to every screen in both languages: six failing tokens move, every passing token is left untouched, and no layout, spacing or type changes with them.
- Session Plan and Routines remain two independent peer doorways with their own open/close state and their own resume takeovers — moving them below the recommendation must not nest one inside the other.
- Any title that genuinely cannot be grouped is recorded as an explicit, named exception in the direction test's allowlist and in AGENTS.md. Silently leaving a title ungrouped, or satisfying the test by deleting dir="auto" without moving it to a group, both fail the lane — the second would break Farsi rendering outright.
- The iOS keyboard / bottom-nav drift, and everything in src/components/useViewportGuard.ts and src/components/Layout.tsx. Agreed as its own device lane, next: its three candidate causes have three different fixes, and choosing between them needs an instrumented readout the owner takes on the real iPhone before a line is written.
- jsdom, .test.tsx and browser journeys as a general capability. Reassessed for this lane specifically and deliberately not added — checks.journeys stays false — because the bulk of the work is direction layout, which jsdom cannot evaluate at all (no dir=auto resolution, no text-align computation), so it would assert only where an attribute sits. The ONE exception is named in the assumptions: if CloseBlock cannot be collapsed to a single ReviewPlan, jsdom may be added for that single two-places-one-value assertion and nothing else. The keyboard lane is where a pure, port-injected extraction genuinely pays, following the repo's own screenAwake.ts precedent.
- Settings' structure (4594px, exactly one heading element, sections as unlabelled divs). Real, and both an IA and an accessibility problem — but it belongs to adjust-how-scheduling-works and back-up-and-restore, not to the practice loop.
- Repertoire's header (the 'Add practice item' button wrapping to three lines at 390px) and its two explanatory ontology paragraphs. Belongs to browse-my-repertoire. In Repertoire.tsx and the other non-loop files, ONLY the direction wiring changes.
- SM-2 advancing once per closed block rather than once per due date, so practising the same item three times in an afternoon pushes its next review from 2 days to about 15. Still open and still wrong, but it changes what r-practice-completes-reviews MEANS and therefore needs a signed owner decision of its own. Named here so it is not lost — it should be the lane after the keyboard.
- Still-open findings that belong to no part of this sentence: dormant/'Resting' items still scored and still gaining neglect, ItemForm allowing an item to become its own parent and leaving stale family metadata on an instrument switch, a malformed backup attachment being skipped and then destroyed, frozen 'now' on CloseBlock/ItemDetail/Lessons/Repertoire/SessionPlan/TeacherReport (and the SessionPlan reseed that can therefore never fire), Insights and the Teacher report mixing 'during this period' with 'right now', Settings describing sync as 'newest copy wins', Field giving single controls no accessible name, and .prismatica/product-map.md still holding placeholders.
- src/components/ItemForm.tsx, src/components/QuickAdd.tsx and src/pages/RoutineEdit.tsx are deliberately outside scope. The corrected inventory shows they hold 15 free-text FIELD sites and zero display-text sites between them — their dir="auto" usage is already correct and must not be touched.
- Desired rule (not yet truth): Layout follows the direction of the content it shows: a title and the details that belong to it sit in one group that carries dir="auto", so a Persian item reads as one block instead of splitting across the card. Direction is resolved natively by the browser, never detected in JavaScript, and it lives on the group or on a free-text field — never bare on a title element.
- Desired rule (not yet truth): Colour is checked by a test, not by eye: the foreground tokens the app renders small text in are asserted at WCAG AA (4.5:1) against the background tokens they are actually rendered on, in every block where those tokens are declared. The checked pairs are listed explicitly in the test, so a token that is not covered is a visible omission rather than a silent one.

## Definition of done

- **ac-1** — REGRESSION GUARD, stated as such: the tri-state close decision is pure and sits in forbidden territory, so this test cannot fail from this lane's edits — it exists to prove the restructure did not reach past its scope. It discriminates 'no result chosen' (item's next review date kept) from 'review genuinely declined' (date cleared), the two states a skipped tap used to conflate. → proven by `keeps the item's review date when no result was chosen and still clears it when a review is declined`
- **ac-2** — REGRESSION GUARD, same standing as the previous one: a resultless close leaves the item's open Review row OPEN while a genuine decline completes it. Green today and must stay green; it proves scope was respected, not that the new wiring is correct. → proven by `leaves an open review row open when no result was chosen and still completes it on a genuine decline`
- **ac-3** — THIS is the check that guards the restructure. CloseBlock is collapsed to a SINGLE ReviewPlan value, and the new pure formatter reports exactly that plan's dueDate, reviewType and rationale — so the collapsed line and the expanded date field are two renderings of one value and a divergent date becomes unrepresentable, the way installDatabase's signature makes an un-reset install unrepresentable. New formatter in src/components/format.ts, tested in a new src/components/format.test.ts under the existing node environment. → proven by `the one-line review summary reports exactly the ReviewPlan's due date, type and rationale`
- **ac-4** — An explicitly listed set of (foreground token, background token) pairs — the ones the app actually renders small text in, written out in the test so a reviewer can see exactly what is and is not covered — meets WCAG AA (4.5:1). The list must include the two pairs measured as failing at HEAD: --accent-contrast on --accent (the primary Start button's own label, 3.95 in light) and --text-faint on --bg (2.89 light, 3.68 dark). Ratios are computed from the shipped stylesheet and asserted in EVERY block where those tokens are declared, not the first: global.css declares the light palette twice — at :root[data-theme='light'] (line 80) and again inside @media (prefers-color-scheme: light) { :root:not([data-theme]) } (line 114) — and the duplicate is what an owner who has never picked a theme actually sees. A regression in either block fails the suite. The claim is bounded to the listed pairs; it is not a claim about every theoretically possible combination. New test in src/styles/contrast.test.ts. → proven by `every listed colour pair meets WCAG AA in every block where its tokens are declared`
- **ac-5** — The direction sweep is provably complete rather than spot-checked, which is what stops a reviewer later finding 'PathwayDetail was a stated surface but one title was missed'. The test scans the source and asserts BOTH halves: (a) no element carrying a title class (truncate, title-md, page-title, stage-unit-title) carries dir="auto" directly any more — a missed title still has it and fails; and (b) every file on the recorded surface list carries direction on at least one group element that is neither a title nor an input/textarea — so a whole skipped file fails, and 'fixing' it by deleting the attribute fails too. Genuine exceptions live in an explicit allowlist inside the test, so they are visible to the reviewer. New test in src/components/direction.test.ts. → proven by `direction lives on the group: no title element carries dir="auto", and every listed surface has one`
- **ac-6** — On the owner's iPhone, in the INSTALLED PWA, Farsi and English are discriminated correctly rather than uniformly re-aligned: a Farsi item's title AND its own details both align to the right edge, while an English item's title and details both stay on the left — checked on Today (the Practise-now card, a due-review row and the class row), Start, Active, Close, Repertoire and Lessons. A card where the title and its details still point at opposite edges fails, and so does an English card that has started aligning right. This check is deliberately REPRESENTATIVE, not exhaustive: completeness across all 16 surfaces is the automated direction test's job, and this one proves that what the test enforces actually renders correctly on the device. → proven by `manual:OWNER`
- **ac-7** — On the owner's iPhone at 390x844 with the recommendation moved above the two doorways: Practise now is the first thing under the instrument switcher, 'Plan this session' and 'Routines' are both still reachable without scrolling and still open independently, and the owner judges the new order better than the old. If it reads worse, the order reverts before the lane ships — that reversal is a passing outcome of this check, not a failure of the lane. → proven by `manual:OWNER`
- **ac-8** — The saved-data boundary, end to end on the restructured screen — the one check that can actually fail from this lane's edits. Close three blocks on the same item and discriminate the outcomes: (a) 'Save without a result' leaves the item's next review date unchanged and leaves it listed under Due reviews; (b) choosing a result saves EXACTLY the date the collapsed line showed before saving, verified by reopening the item; (c) opening the controls and answering 'Should this come back? No' clears the date and removes it from Due reviews. If the restructure has rewired the tri-state mapping, (a) and (c) stop differing — which is the bug this app already paid a heavy lane to fix once. → proven by `manual:OWNER`

## Docs to update as part of this change

- AGENTS.md
- DECISIONS.md

## Recommended skills (quality only — never gates)

- **ui-work** — visual / front-end work — layout, styling, interaction — _(use your agent’s equivalent)_
- **build** — implementing the change against the contract — _(use your agent’s equivalent)_
- **simplify** — reducing risk by simplifying the change — _(use your agent’s equivalent)_

## Current progress

Not started — no checks have run yet. Default state is "not ready".

## Before you finish

Run `prismatica flow report --auto`. It records the flows your diff provably
touched, and then prints the exact command for every flow it will not decide
for you — a merely possible hit, or a flow nothing maps to files. Answer those
yourself: `--auto` never claims a test passed and never claims behaviour is
unchanged, because no file list can establish either.

File it BEFORE `check` and commit it WITH your work — a report sitting
uncommitted proves nothing, and `check` refuses an uncommitted proof input.

## How your work will be judged

Deterministic checks run on every push and at the merge gate: the diff must stay
inside the allowed files, every acceptance check must trace to a passing test,
docs must be updated, a sealed review must match your exact diff, and the owner must sign a decision over your diff. Nothing merges until they all pass. Default is "not ready".

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.

