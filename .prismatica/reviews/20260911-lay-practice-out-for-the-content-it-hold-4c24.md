---
id: 20260911-lay-practice-out-for-the-content-it-hold-4c24
contractId: 20260911-lay-practice-out-for-the-content-it-hold-4c24
patchId: c37ac69dbec7ba712674add9892b17878a0eccdf
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: "r-direction-aware-text: mixed-content groups, alignment, list markers
      and completeness"
    summary: The direction rework still splits some Farsi titles from English
      details, leaves further generated metadata inheriting the title's bidi
      base, and moves native ordered-list markers outside the available right
      edge. The new source test cannot discover these expression-based and
      rendered-layout counterexamples.
    counterexample: In src/components/ItemMaterial.tsx:56-66 and :117-126, the group
      resolves RTL with text-align:start, but its English detail is a
      block-level dir="ltr" element, so the detail aligns left while the Farsi
      title aligns right. The family remains wider at
      src/pages/Materials.tsx:175-182, src/components/ItemCard.tsx:24-36,
      src/pages/RoutineRunner.tsx:178-182, src/pages/Lessons.tsx:260-268 and
      src/pages/Repertoire.tsx:204-211, where generated English metadata remains
      unisolated inside auto-direction groups. In
      src/components/ClassQuestions.tsx:70-72, the ol remains LTR and allocates
      only paddingInlineStart on the left, while each Farsi li now resolves RTL;
      the native outside marker moves to the unpadded right and the visible 1.
      is pressed against or beyond the content border on Mac and iPhone.
      src/components/direction.test.ts:375-383 skips expression contents, its
      isolate ledgers only prove manually listed snippets exist, and no check
      covers list-marker containment, so the named test passes all these
      counterexamples.
createdAt: 2026-09-11T21:54:04.763Z
sealedAt: 2026-09-12T00:04:41.257Z
---

# Review: Lay practice out for the content it holds — Persian-aware cards, roomier rows, a calmer close screen

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20260911-lay-practice-out-for-the-content-it-hold-4c24
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/20
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `c37ac69dbec7ba712674add9892b17878a0eccdf`

## The plan the owner approved

Verbatim. `assumptions` and `possibleConflicts` are the Planner's advisory
reading — check them against the diff rather than accepting them.

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

## The Delta this change was framed from

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



## Files in this diff

- AGENTS.md
- DECISIONS.md
- src/components/Attachments.tsx
- src/components/ClassQuestions.tsx
- src/components/ItemCard.tsx
- src/components/ItemMaterial.tsx
- src/components/direction.test.ts
- src/components/format.test.ts
- src/components/format.ts
- src/pages/ActiveBlock.tsx
- src/pages/CloseBlock.tsx
- src/pages/Insights.tsx
- src/pages/ItemDetail.tsx
- src/pages/Lessons.tsx
- src/pages/Materials.tsx
- src/pages/PathwayDetail.tsx
- src/pages/Repertoire.tsx
- src/pages/RoutineRunner.tsx
- src/pages/SessionPlan.tsx
- src/pages/StageDetail.tsx
- src/pages/StartBlock.tsx
- src/pages/TeacherReport.tsx
- src/pages/Today.tsx
- src/styles/contrast.test.ts
- src/styles/global.css

## Check against the contract

- [ ] **ac-1** — REGRESSION GUARD, stated as such: the tri-state close decision is pure and sits in forbidden territory, so this test cannot fail from this lane's edits — it exists to prove the restructure did not reach past its scope. It discriminates 'no result chosen' (item's next review date kept) from 'review genuinely declined' (date cleared), the two states a skipped tap used to conflate. _(proof: keeps the item's review date when no result was chosen and still clears it when a review is declined)_
- [ ] **ac-2** — REGRESSION GUARD, same standing as the previous one: a resultless close leaves the item's open Review row OPEN while a genuine decline completes it. Green today and must stay green; it proves scope was respected, not that the new wiring is correct. _(proof: leaves an open review row open when no result was chosen and still completes it on a genuine decline)_
- [ ] **ac-3** — THIS is the check that guards the restructure. CloseBlock is collapsed to a SINGLE ReviewPlan value, and the new pure formatter reports exactly that plan's dueDate, reviewType and rationale — so the collapsed line and the expanded date field are two renderings of one value and a divergent date becomes unrepresentable, the way installDatabase's signature makes an un-reset install unrepresentable. New formatter in src/components/format.ts, tested in a new src/components/format.test.ts under the existing node environment. _(proof: the one-line review summary reports exactly the ReviewPlan's due date, type and rationale)_
- [ ] **ac-4** — An explicitly listed set of (foreground token, background token) pairs — the ones the app actually renders small text in, written out in the test so a reviewer can see exactly what is and is not covered — meets WCAG AA (4.5:1). The list must include the two pairs measured as failing at HEAD: --accent-contrast on --accent (the primary Start button's own label, 3.95 in light) and --text-faint on --bg (2.89 light, 3.68 dark). Ratios are computed from the shipped stylesheet and asserted in EVERY block where those tokens are declared, not the first: global.css declares the light palette twice — at :root[data-theme='light'] (line 80) and again inside @media (prefers-color-scheme: light) { :root:not([data-theme]) } (line 114) — and the duplicate is what an owner who has never picked a theme actually sees. A regression in either block fails the suite. The claim is bounded to the listed pairs; it is not a claim about every theoretically possible combination. New test in src/styles/contrast.test.ts. _(proof: every listed colour pair meets WCAG AA in every block where its tokens are declared)_
- [ ] **ac-5** — The direction sweep is provably complete rather than spot-checked, which is what stops a reviewer later finding 'PathwayDetail was a stated surface but one title was missed'. The test scans the source and asserts BOTH halves: (a) no element carrying a title class (truncate, title-md, page-title, stage-unit-title) carries dir="auto" directly any more — a missed title still has it and fails; and (b) every file on the recorded surface list carries direction on at least one group element that is neither a title nor an input/textarea — so a whole skipped file fails, and 'fixing' it by deleting the attribute fails too. Genuine exceptions live in an explicit allowlist inside the test, so they are visible to the reviewer. New test in src/components/direction.test.ts. _(proof: direction lives on the group: no title element carries dir="auto", and every listed surface has one)_
- [ ] **ac-6** — On the owner's iPhone, in the INSTALLED PWA, Farsi and English are discriminated correctly rather than uniformly re-aligned: a Farsi item's title AND its own details both align to the right edge, while an English item's title and details both stay on the left — checked on Today (the Practise-now card, a due-review row and the class row), Start, Active, Close, Repertoire and Lessons. A card where the title and its details still point at opposite edges fails, and so does an English card that has started aligning right. This check is deliberately REPRESENTATIVE, not exhaustive: completeness across all 16 surfaces is the automated direction test's job, and this one proves that what the test enforces actually renders correctly on the device. _(proof: manual:OWNER)_
- [ ] **ac-7** — On the owner's iPhone at 390x844 with the recommendation moved above the two doorways: Practise now is the first thing under the instrument switcher, 'Plan this session' and 'Routines' are both still reachable without scrolling and still open independently, and the owner judges the new order better than the old. If it reads worse, the order reverts before the lane ships — that reversal is a passing outcome of this check, not a failure of the lane. _(proof: manual:OWNER)_
- [ ] **ac-8** — The saved-data boundary, end to end on the restructured screen — the one check that can actually fail from this lane's edits. Close three blocks on the same item and discriminate the outcomes: (a) 'Save without a result' leaves the item's next review date unchanged and leaves it listed under Due reviews; (b) choosing a result saves EXACTLY the date the collapsed line showed before saving, verified by reopening the item; (c) opening the controls and answering 'Should this come back? No' clears the date and removes it from Due reviews. If the restructure has rewired the tri-state mapping, (a) and (c) stop differing — which is the bug this app already paid a heavy lane to fix once. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/pages/CloseBlock.tsx
- **browse-my-repertoire** — touched via src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx, src/pages/Materials.tsx
- **capture-a-practice-item** — touched via src/pages/ItemDetail.tsx
- **clear-a-due-review** — touched via src/pages/Today.tsx
- **log-a-class** — touched via src/pages/Lessons.tsx, src/components/Attachments.tsx
- **point-this-device-at-the-nas** — touched via src/pages/Lessons.tsx
- **practise-todays-recommendation** — touched via src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx
- **prepare-for-the-next-class** — touched via src/pages/TeacherReport.tsx, src/components/ClassQuestions.tsx, src/pages/Lessons.tsx, src/pages/CloseBlock.tsx
- **run-a-session-plan** — touched via src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/pages/ActiveBlock.tsx
- **see-practice-patterns** — touched via src/pages/Insights.tsx, src/pages/Today.tsx
- **work-a-pathway-stage** — touched via src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx

**Possibly affected (shares a mechanic with a detected flow):**

- **back-up-and-restore** — shares route "/settings" with "adjust-how-scheduling-works"
- **install-the-app-and-keep-it-current** — shares route "/settings" with "adjust-how-scheduling-works"
- **sync-devices-via-github** — shares route "/settings" with "adjust-how-scheduling-works"

**What the agent reported:**

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/CloseBlock.tsx matched changed file(s) src/pages/CloseBlock.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx, src/pages/Materials.tsx matched changed file(s) src/pages/ItemDetail.tsx, src/pages/Materials.tsx, src/pages/Repertoire.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/ItemDetail.tsx matched changed file(s) src/pages/ItemDetail.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## clear-a-due-review — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx matched changed file(s) src/pages/Today.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## log-a-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Lessons.tsx, src/components/Attachments.tsx matched changed file(s) src/components/Attachments.tsx, src/pages/Lessons.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## point-this-device-at-the-nas — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Lessons.tsx matched changed file(s) src/pages/Lessons.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## practise-todays-recommendation — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx matched changed file(s) src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/pages/StartBlock.tsx, src/pages/Today.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## prepare-for-the-next-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/TeacherReport.tsx, src/components/ClassQuestions.tsx, src/pages/Lessons.tsx, src/pages/CloseBlock.tsx matched changed file(s) src/components/ClassQuestions.tsx, src/pages/CloseBlock.tsx, src/pages/Lessons.tsx, src/pages/TeacherReport.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## run-a-session-plan — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/pages/ActiveBlock.tsx matched changed file(s) src/pages/ActiveBlock.tsx, src/pages/SessionPlan.tsx, src/pages/Today.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## see-practice-patterns — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Insights.tsx, src/pages/Today.tsx matched changed file(s) src/pages/Insights.tsx, src/pages/Today.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## work-a-pathway-stage — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx matched changed file(s) src/pages/PathwayDetail.tsx, src/pages/RoutineRunner.tsx, src/pages/StageDetail.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — unchanged

Settings.tsx is a forbidden path in this lane and was not touched; the only file these flows share with this diff is src/styles/global.css, where eight light and four dark colour tokens moved to clear WCAG AA. Nothing about exporting, importing or restoring an archive changed — no control, copy, route or store action differs.

## install-the-app-and-keep-it-current — unchanged

Settings.tsx, index.html, vite.config.ts and the service-worker registration are all forbidden paths in this lane and were not touched. The only shared file is src/styles/global.css, and only colour tokens moved there — the update banner, the build stamp and the install flow are byte-identical.

## sync-devices-via-github — unchanged

src/store/** and src/domain/** are forbidden in this lane and unchanged, so decideSync, the snapshot format, the conflict flow and the PAT handling are byte-identical. The only shared file is src/styles/global.css, where colour tokens moved for contrast; SyncNotice lives in Layout.tsx, also untouched.


**Gaps between detected and reported:**

_None — the report matches what was detected._

## Flow truth this change touches

### adjust-how-scheduling-works — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts

Evidence: 4 steps: 4 manually verified

### browse-my-repertoire — Works now

Touchpoints: src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx, src/pages/Materials.tsx, src/domain/repertoire.ts, src/domain/persian.ts, src/domain/farsi.ts

Evidence: 5 steps: 5 manually verified

### capture-a-practice-item — Works now

Touchpoints: src/components/QuickAdd.tsx, src/components/ItemForm.tsx, src/components/itemKinds.ts, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts

Evidence: 4 steps: 4 manually verified

### clear-a-due-review — Works now

Touchpoints: src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/selectors.ts

Evidence: 4 steps: 4 manually verified

### log-a-class — Works now

Touchpoints: src/pages/Lessons.tsx, src/components/Attachments.tsx, src/domain/recordings.ts, src/domain/setarClasses.ts, src/domain/files.ts, src/domain/selectors.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### point-this-device-at-the-nas — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/Lessons.tsx, src/domain/recordings.ts, src/store/backup.ts

Evidence: 3 steps: 3 manually verified

### practise-todays-recommendation — Works now

Touchpoints: src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts, src/domain/blocks.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts

Evidence: 7 steps: 7 manually verified

### prepare-for-the-next-class — Works now

Touchpoints: src/pages/TeacherReport.tsx, src/components/ClassQuestions.tsx, src/domain/questions.ts, src/domain/report.ts, src/pages/Lessons.tsx, src/pages/CloseBlock.tsx

Evidence: 4 steps: 4 manually verified

### run-a-session-plan — Works now

Touchpoints: src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/domain/plan.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### see-practice-patterns — Works now

Touchpoints: src/pages/Insights.tsx, src/pages/Today.tsx, src/domain/insights.ts, src/domain/io.ts

Evidence: 3 steps: 3 manually verified

### work-a-pathway-stage — Works now

Touchpoints: src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx, src/domain/pathways.ts, src/domain/pathwaySeed.ts, src/domain/routines.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/store/useStore.ts

Evidence: 5 steps: 5 manually verified

## Also look for

- Anything outside the contract's scope or non-goals.
- Silent failures, swallowed errors, missing edge cases.
- Secrets, unsafe defaults, and anything risky for the tier.

## How to finish

Review only — change no files, run no fixes, write no records. Judge the diff
itself: the builder's summary, an earlier review and a green test run are all
claims about the code, not evidence about it.

End your reply with exactly `SAFE TO SEAL` or `DO NOT SEAL` on its own
final line, and say why. That is a recommendation to the owner, who records
the outcome — sealing is never the reviewer's to do.

If your verdict is `DO NOT SEAL`, your session is repository-read-only and cannot write the findings file itself — the owner does, from what you print. These are THREE separate copy actions, never one shell script: the JSON is DATA and must never be pasted at a normal shell prompt. Do not reconstruct or alter the path, the contract id or either command below — both commands come verbatim from Prismatica; you supply only the structured findings JSON, and it must parse as strict JSON before you present it here. End your reply with exactly these three steps, in this order, each its own fenced code block:

**1. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260911-lay-practice-out-for-the-content-it-hold-4c24/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20260911-lay-practice-out-for-the-content-it-hold-4c24' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260911-lay-practice-out-for-the-content-it-hold-4c24/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260911-lay-practice-out-for-the-content-it-hold-4c24/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.
