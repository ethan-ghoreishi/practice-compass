---
id: 20261007-fix-setar-review-and-archive-direction-a-039e
contractId: 20261007-fix-setar-review-and-archive-direction-a-039e
contractHash: 267edb91ce5f776687a11fda81f41b4f9c36d2be0b3f17567734501ab8c6d124
createdAt: 2026-10-07T00:04:46.013Z
skills:
  - ui-work
  - build
  - simplify
---

# Build brief: Fix Setar review and archive direction and choice state, and Repertoire search typing

> This brief is scoped and self-contained. A fresh session can resume from it
> alone. Prismatica will check your work deterministically — it never reads this
> chat, only Git and your tests.

- **Linked issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/47
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Work in the lane:** /Users/Ehsan/workspace/active/practice-compass-lanes/20261007-fix-setar-review-and-archive-direction-a-039e

## The plan the owner approved

This is the complete approved proposal, verbatim. `assumptions` and
`possibleConflicts` are the Planner's advisory reading — treat them as leads to
verify against the code, never as established fact.

````yaml
# Approved intent: Fix Setar review and archive direction and choice state, and Repertoire search typing

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** existing-flow
- **Risk tier:** heavy
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> Plan a coherent heavy lane that fixes the remaining issues properly.
> 
> 1. Mixed Farsi/English direction is wrong in some newly added UI, especially `Review Setar setup`. Example: `اتود-وزيرى` / `exercise / étude → composed pieceKind:` — `Kind:` can appear at the wrong end of the line, mixed Persian/English ordering is awkward, and arrows sometimes point the wrong way. Check the wider new Setar review/archive UI for the same bidi/arrow problem, not only this exact row.
> 
> 2. In `Refresh Setar archive`, when metadata choices are shown, the controls such as `Keep your choice` / `Keep archive` (exact wording may differ) do not become selected/active when clicked. Reproduce the real behaviour and determine the scope. That section also has mixed Persian/English direction problems and arrows that can point the wrong way.
> 
> 3. A previous review found a remaining Repertoire search issue under extreme artificial slowdown: very rapid typing can lose characters while URL/search state is updating. Reassess it from first principles and decide whether it is a real product issue worth fixing in this lane. Do not regress the already-fixed filter lost-update bug from corrective commit `c4506c6`.
> 
> 4. A reviewer also noted a possible latent navigation/test race around `tests/repertoire-experience.browser.test.ts` near the pathway-card interaction around line ~441. Investigate whether this is a real product issue, a test race, or not worth changing.
> 
> 5. CI warnings about the Node.js 20 deprecation for GitHub Actions and `ubuntu-latest` moving to Ubuntu 26: assess whether either needs action now. Do not add unrelated maintenance merely to silence warnings.
> 
> Treat the symptoms as evidence, not prescribed solutions; look for closely related variants; design strong, specific automated acceptance checks up front, including mixed RTL/LTR cases and the interaction/state cases that can be reproduced; preserve owner data and existing Setar/archive behaviour; do not reopen problems the previous lane solved.
> 
> Agreed while planning: in Refresh Setar archive, an answered "Needs a decision" question (Link / Create separately / Skip) stays visible with the chosen answer shown as selected and can be changed or cleared until Apply.

## Why

Reproduced, not assumed. (1) Direction: in Review Setar setup each Organisation card is a dir="auto" group whose first strong text is the item title; a Farsi title makes the card RTL, and each change line is a run of SIBLING inline isolates (`Kind: `, before, ` → `, after) that the RTL paragraph orders right-to-left. Measured in Chromium and WebKit with the exact markup: on screen it reads `composed piece → exercise / étude Kind:` — label at the far edge, arrow pointing at the OLD value. Refresh Setar archive's DifferenceRow (`composer — yours: X · archive: Y`) reverses the same way, and the attention list (`path — reason`) strands its separator. Wrapping the whole generated line in ONE dir="ltr" isolate with each value nested in its own dir="auto" reads `Kind: before → after` in both engines. The existing checks missed it because they assert each fragment's own computed direction (all correct), never the order on screen. (2) Choice state: Keep my value / Use archive value toggle aria-pressed correctly (existing tests prove it) but no CSS styles a pressed .btn, so nothing visibly changes; ReferenceChoices has the same gap. Answering a question (Link / Create separately / Skip) removes it from the plan, so the row vanishes with no visible answer and no way to change it short of Cancel. (3) Repertoire search is a real, if rare, product defect: the input is controlled by URL state that React Router 7 renders in a transition, and React restores a controlled input to its last rendered value while that transition is pending, so keystrokes arriving before it commits are lost (reproduced at 20x CPU throttle and 100 ms/key: "pishdaramad" became "iharamad"; none at 4-6x). It is the documented React anti-pattern, the same root as c4506c6, cheap to fix, and the iPhone is a target device. (4) The line-441 shape is a test race, not a product bug: after the pathway-card click, `/مبانی دست راست/.first()` can resolve to the OUTGOING Repertoire card (its caption contains "now: مبانی دست راست") until the lazy destination commits; it can only fail loudly, never pass falsely, but it is the same family that already broke CI once (/New/ vs "New pathway"). (5) No CI action: the Node 20 actions already run forced on Node 24 and pass, and prismatica-gate.yml is generated by `prismatica update`; Playwright 1.63 officially supports ubuntu26.04 with a dedicated WebKit build and dependency table.

## Today

Review Setar setup and Refresh Setar archive render change and difference lines beside a Farsi title in reversed order with the arrow pointing at the old value; the attention list separator sits at the wrong end. Keep my value / Use archive value and ReferenceChoices show no visible selected state. An answered archive question disappears. Typing quickly in the Repertoire search on a slow device can drop characters. Repertoire browser journeys can act on the outgoing page after a navigation.

## Instead

Every generated line that embeds values (setup change rows for kind, place, study source, suggestion and class; archive metadata differences in both Archive metadata differs and Review differences; the attention list) reads in its logical order — label, current value, arrow or separator, new value — whatever the title or value languages, with each owner/registry value still resolving its own direction and the line start-aligned in its group. The arrow always points from the current value to the proposed one. Every aria-pressed toggle in scope (both archive difference buttons, the answered-question buttons, ReferenceChoices) shows its selected state visibly and not by colour alone, reusing the existing .option.selected treatment where it fits. An answered question stays listed with its answer selected and can be switched or cleared until Apply; Apply writes exactly the answers then selected, an unanswered or cleared one writes nothing, and "N to decide" counts only open questions. The Repertoire search box never shows or writes a value older than the latest keystroke, at any render speed, while back/forward, Clear filters, an instrument switch and the Practice list still show the URL's query. Repertoire journeys act only once the destination page they navigated to is on screen.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- The owner's screenshot did not reach the planner (it arrived as a placeholder icon); the plan works from the quoted text and the reproduced rendering.
- CLAUDE.md plus AGENTS.md sit at 32,526 of 32,768 bytes, so the one direction-rule refinement must be condensed in place (net growth well under 242 bytes).
- Reusing .option.selected keeps colour contrast inside pairs contrast.test.ts already checks (accent on accent-soft).
- Answered questions are carried by the plan itself (pure domain, sourceReconcile.ts) rather than remembered by the component, so preview, stale re-preview and commit read one source.

**Possible conflicts**

- Keeping answered questions on screen changes existing archive journeys that click Skip / Link and then Apply; those tests are in scope and must keep their assertions about what Apply writes.
- A controlled-input fix for search interacts with c4506c6's live-URL update path; the builder must prove both in one journey.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "Plan a coherent heavy lane that fixes the remaining issues properly.\n\n1. Mixed Farsi/English direction is wrong in some newly added UI, especially `Review Setar setup`. Example: `اتود-وزيرى` / `exercise / étude → composed pieceKind:` — `Kind:` can appear at the wrong end of the line, mixed Persian/English ordering is awkward, and arrows sometimes point the wrong way. Check the wider new Setar review/archive UI for the same bidi/arrow problem, not only this exact row.\n\n2. In `Refresh Setar archive`, when metadata choices are shown, the controls such as `Keep your choice` / `Keep archive` (exact wording may differ) do not become selected/active when clicked. Reproduce the real behaviour and determine the scope. That section also has mixed Persian/English direction problems and arrows that can point the wrong way.\n\n3. A previous review found a remaining Repertoire search issue under extreme artificial slowdown: very rapid typing can lose characters while URL/search state is updating. Reassess it from first principles and decide whether it is a real product issue worth fixing in this lane. Do not regress the already-fixed filter lost-update bug from corrective commit `c4506c6`.\n\n4. A reviewer also noted a possible latent navigation/test race around `tests/repertoire-experience.browser.test.ts` near the pathway-card interaction around line ~441. Investigate whether this is a real product issue, a test race, or not worth changing.\n\n5. CI warnings about the Node.js 20 deprecation for GitHub Actions and `ubuntu-latest` moving to Ubuntu 26: assess whether either needs action now. Do not add unrelated maintenance merely to silence warnings.\n\nTreat the symptoms as evidence, not prescribed solutions; look for closely related variants; design strong, specific automated acceptance checks up front, including mixed RTL/LTR cases and the interaction/state cases that can be reproduced; preserve owner data and existing Setar/archive behaviour; do not reopen problems the previous lane solved.\n\nAgreed while planning: in Refresh Setar archive, an answered \"Needs a decision\" question (Link / Create separately / Skip) stays visible with the chosen answer shown as selected and can be changed or cleared until Apply.",
  "builder": "claude",
  "summary": "Fix Setar review and archive direction and choice state, and Repertoire search typing",
  "rationale": "Reproduced, not assumed. (1) Direction: in Review Setar setup each Organisation card is a dir=\"auto\" group whose first strong text is the item title; a Farsi title makes the card RTL, and each change line is a run of SIBLING inline isolates (`Kind: `, before, ` → `, after) that the RTL paragraph orders right-to-left. Measured in Chromium and WebKit with the exact markup: on screen it reads `composed piece → exercise / étude Kind:` — label at the far edge, arrow pointing at the OLD value. Refresh Setar archive's DifferenceRow (`composer — yours: X · archive: Y`) reverses the same way, and the attention list (`path — reason`) strands its separator. Wrapping the whole generated line in ONE dir=\"ltr\" isolate with each value nested in its own dir=\"auto\" reads `Kind: before → after` in both engines. The existing checks missed it because they assert each fragment's own computed direction (all correct), never the order on screen. (2) Choice state: Keep my value / Use archive value toggle aria-pressed correctly (existing tests prove it) but no CSS styles a pressed .btn, so nothing visibly changes; ReferenceChoices has the same gap. Answering a question (Link / Create separately / Skip) removes it from the plan, so the row vanishes with no visible answer and no way to change it short of Cancel. (3) Repertoire search is a real, if rare, product defect: the input is controlled by URL state that React Router 7 renders in a transition, and React restores a controlled input to its last rendered value while that transition is pending, so keystrokes arriving before it commits are lost (reproduced at 20x CPU throttle and 100 ms/key: \"pishdaramad\" became \"iharamad\"; none at 4-6x). It is the documented React anti-pattern, the same root as c4506c6, cheap to fix, and the iPhone is a target device. (4) The line-441 shape is a test race, not a product bug: after the pathway-card click, `/مبانی دست راست/.first()` can resolve to the OUTGOING Repertoire card (its caption contains \"now: مبانی دست راست\") until the lazy destination commits; it can only fail loudly, never pass falsely, but it is the same family that already broke CI once (/New/ vs \"New pathway\"). (5) No CI action: the Node 20 actions already run forced on Node 24 and pass, and prismatica-gate.yml is generated by `prismatica update`; Playwright 1.63 officially supports ubuntu26.04 with a dedicated WebKit build and dependency table.",
  "kind": "existing-flow",
  "flowId": "browse-my-repertoire",
  "currentBehaviour": "Review Setar setup and Refresh Setar archive render change and difference lines beside a Farsi title in reversed order with the arrow pointing at the old value; the attention list separator sits at the wrong end. Keep my value / Use archive value and ReferenceChoices show no visible selected state. An answered archive question disappears. Typing quickly in the Repertoire search on a slow device can drop characters. Repertoire browser journeys can act on the outgoing page after a navigation.",
  "desiredBehaviour": "Every generated line that embeds values (setup change rows for kind, place, study source, suggestion and class; archive metadata differences in both Archive metadata differs and Review differences; the attention list) reads in its logical order — label, current value, arrow or separator, new value — whatever the title or value languages, with each owner/registry value still resolving its own direction and the line start-aligned in its group. The arrow always points from the current value to the proposed one. Every aria-pressed toggle in scope (both archive difference buttons, the answered-question buttons, ReferenceChoices) shows its selected state visibly and not by colour alone, reusing the existing .option.selected treatment where it fits. An answered question stays listed with its answer selected and can be switched or cleared until Apply; Apply writes exactly the answers then selected, an unanswered or cleared one writes nothing, and \"N to decide\" counts only open questions. The Repertoire search box never shows or writes a value older than the latest keystroke, at any render speed, while back/forward, Clear filters, an instrument switch and the Practice list still show the URL's query. Repertoire journeys act only once the destination page they navigated to is on screen.",
  "mustNotChange": [
    "c4506c6: every Repertoire browse change applies to the live URL, never render-captured state; the throttled composer step in \"repertoire navigation restores browse context without changing session scope\" stays as it is and passes.",
    "Browse URL contract: view, instrument, query, facets and grouping live in the URL; back/forward restore them; browsing never writes sessionInstrumentId.",
    "Archive decision semantics: exact bindings win, weak equivalences ask, decisions match on identity + typed premise + exact proposal (decisionMatchesSuggestion), a moved premise is refused as stale and re-previewed, Keep my value is the default, an unanswered offer writes nothing, suppressions persist, the commit re-plans, validates and waits for IndexedDB.",
    "Review Setar setup writes only selected rows, never on load, import, sync or Refresh; its default selections are unchanged.",
    "Existing direction rules and ledgers: dir=\"auto\" on groups, isolates inline (span/bdi only), instrument names resolve their own direction, English-only surfaces keep their layout, option text and confirm/toast strings stay out of scope.",
    "No schema change (SCHEMA_VERSION 16), no new dependency, no workflow change, no owner fixture rewritten, no NAS/Setar media or source metadata touched."
  ],
  "assumptions": [
    "The owner's screenshot did not reach the planner (it arrived as a placeholder icon); the plan works from the quoted text and the reproduced rendering.",
    "CLAUDE.md plus AGENTS.md sit at 32,526 of 32,768 bytes, so the one direction-rule refinement must be condensed in place (net growth well under 242 bytes).",
    "Reusing .option.selected keeps colour contrast inside pairs contrast.test.ts already checks (accent on accent-soft).",
    "Answered questions are carried by the plan itself (pure domain, sourceReconcile.ts) rather than remembered by the component, so preview, stale re-preview and commit read one source."
  ],
  "possibleConflicts": [
    "Keeping answered questions on screen changes existing archive journeys that click Skip / Link and then Apply; those tests are in scope and must keep their assertions about what Apply writes.",
    "A controlled-input fix for search interacts with c4506c6's live-URL update path; the builder must prove both in one journey."
  ],
  "scope": {
    "allow": [
      "src/components/SetarSetupReview.tsx",
      "src/components/ArchiveRefresh.tsx",
      "src/components/ReferenceChoices.tsx",
      "src/components/direction.test.ts",
      "src/components/pressedState.test.ts",
      "src/domain/sourceReconcile.ts",
      "src/domain/sourceReconcile.test.ts",
      "src/domain/index.ts",
      "src/pages/Repertoire.tsx",
      "src/styles/global.css",
      "tests/setar-review-ui.browser.test.ts",
      "tests/fixtures/setar-review-ui.json",
      "tests/setar-practice.browser.test.ts",
      "tests/setarArchive.browser.test.ts",
      "tests/repertoire-experience.browser.test.ts",
      "tests/practiceBrowser.ts",
      "AGENTS.md",
      "DECISIONS.md",
      "docs/setar-archive.md",
      "docs/repertoire-experience.md"
    ],
    "forbid": [
      ".github/**",
      "scripts/**",
      "package.json",
      "package-lock.json",
      "src/main.tsx",
      "src/domain/migrations.ts",
      "src/domain/io.ts",
      "src/domain/types.ts",
      "src/domain/courseData.ts",
      "src/domain/khonyagarData.ts",
      "tests/fixtures/setar-practice-*.json"
    ]
  },
  "exclusions": [
    "GitHub Actions changes: Node 20 actions already run forced on Node 24 and pass, and prismatica-gate.yml is generated by `prismatica update`; Ubuntu 26 is supported by the installed Playwright 1.63 (ubuntu26.04 deps and WebKit build). Revisit only if a run on the new image actually fails.",
    "A router-wide `useTransitions={false}`: it would change Suspense behaviour for every lazy route.",
    "Bidi of <option> text and confirm()/toast strings (out of scope by rule), and the QuickAdd / insights direction open gaps.",
    "Mapping Refresh Setar archive or Review Setar setup as a new Flow."
  ],
  "acceptance": [
    {
      "description": "Family proof, one committed fixture (tests/fixtures/setar-review-ui.json) and independently derived expected order: every generated line that embeds values reads label, current value, arrow/separator, new value from the inline-start edge, measured by on-screen geometry (not computed direction), and the arrow points from current to proposed. Classes crossed: title fa/en x values fa/en/mixed; setup fields kind, place, study source, suggestion, class in proposed and exception states; archive differences in Archive metadata differs and Review differences; attention list; 390x844 and desktop; Chromium and WebKit. Fails on the current markup.",
      "test": "setar review and archive lines read in order beside a farsi title"
    },
    {
      "description": "Static guard: inside a dir=\"auto\" group no line renders as a run of sibling dir=\"ltr\"/dir=\"auto\" isolates; a generated line is one inline dir=\"ltr\" isolate with each value nested in its own dir=\"auto\".",
      "test": "a generated line inside a group is one ltr isolate with its values nested"
    },
    {
      "description": "Keep my value / Use archive value: the pressed option looks different from the unpressed one (computed style differs, not colour alone), swaps on click and keyboard, survives a stale re-preview with Keep shown, and Apply writes the archive value only when Use archive value is selected and leaves the owner value otherwise (IndexedDB read back), in Chromium and WebKit.",
      "test": "archive metadata choices show the selected option and apply exactly it"
    },
    {
      "description": "An answered Link / Create separately / Skip question stays listed with its answer visibly selected; switching or clearing it before Apply changes what is written; Apply writes only the final answers; a cleared one writes nothing; \"N to decide\" counts only open questions.",
      "test": "answered archive questions stay visible and apply only the final answer"
    },
    {
      "description": "Domain: the plan reports each answered question with its answer and excludes it from the open count; a link answer whose target no longer qualifies is stale and the question is open again; no other plan output changes.",
      "test": "an answered question is reported with its answer and is not counted as open"
    },
    {
      "description": "Every aria-pressed control in src/components and src/pages pairs with a visible selected treatment (.option.selected, btn-primary, a tone class or an equivalent recorded in the test ledger).",
      "test": "every aria-pressed control renders a visible selected state"
    },
    {
      "description": "Repertoire search under 20x CPU throttle at ~100 ms per key keeps every character in the box and the URL (fails before the fix); a facet chosen mid-typing loses neither; back/forward, Clear filters, an instrument switch and the Practice list still show the URL query.",
      "test": "repertoire search keeps every typed character under heavy cpu slowdown"
    },
    {
      "description": "Regression guard for c4506c6: the existing browse-context journey, including its throttled query + composer step, still passes unchanged.",
      "test": "repertoire navigation restores browse context without changing session scope"
    },
    {
      "description": "With each destination page module delayed on its first visit (a harness option, no debug hook), the Repertoire journeys reproduce the line-441 shape before the fix and afterwards act only once the page they navigated to is on screen.",
      "test": "repertoire journeys act only on the page they navigated to"
    }
  ],
  "risk": {
    "touchesAuth": false,
    "touchesPayments": false,
    "touchesSavedData": true,
    "copyOnly": false,
    "rationale": "The controls being fixed decide what Apply writes to IndexedDB (archive field decisions, link/create/skip answers and their suppressions, setup selections); a wrong selected-state binding or answered-question carry-over writes the wrong owner data. No schema, migration, sync or backup format change."
  },
  "delta": {
    "step": 3,
    "today": "Typing quickly in the search box on a slow device can lose characters, because the box shows the URL's query and the router renders a URL change in a transition.",
    "instead": "The search box always keeps every character typed and the URL follows it; back/forward, Clear filters, an instrument switch and the Practice list still show the URL's query, and no filter erases another (c4506c6).",
    "keep": [
      "Query, facets and grouping live in the URL and survive opening a work and coming back.",
      "Browsing never changes the session instrument."
    ],
    "assumptions": [],
    "showMe": "Under heavy CPU slowdown type \"pishdaramad\" into Search my repertoire one key at a time, then pick a composer: both the box and the URL hold the whole word and the composer."
  },
  "desiredRules": [],
  "docsDelta": [
    "AGENTS.md",
    "DECISIONS.md",
    "docs/setar-archive.md",
    "docs/repertoire-experience.md"
  ]
}
```
````

## The approved Delta this change must deliver

# The search box always keeps every character typed and the URL follows it; back/forward, Clear filters, an instrument switch and the Practice list still show the URL's query, and no filter erases another (c4506c6).

_approved · about "browse-my-repertoire" step 3_

## Today

Typing quickly in the search box on a slow device can lose characters, because the box shows the URL's query and the router renders a URL change in a transition.

## Instead

The search box always keeps every character typed and the URL follows it; back/forward, Clear filters, an instrument switch and the Practice list still show the URL's query, and no filter erases another (c4506c6).

## Keep

- Query, facets and grouping live in the URL and survive opening a work and coming back.
- Browsing never changes the session instrument.

## New assumptions

_none_

## Show me

Under heavy CPU slowdown type "pishdaramad" into Search my repertoire one key at a time, then pick a composer: both the box and the URL hold the whole word and the composer.


## Flows near this scope (understand before you change them)

Compact cards — read a Flow's canonical file when your change touches it.

- **Find something in my repertoire** (`browse-my-repertoire`) — See everything you play, grouped the way you think about it, find it by any name, and open the one you mean without losing your place.
  touchpoints: `src/pages/Repertoire.tsx`, `src/pages/ItemDetail.tsx`, `src/pages/Materials.tsx`, `src/domain/repertoire.ts`, `src/domain/persian.ts`, `src/domain/farsi.ts` · canonical: `.prismatica/flows/browse-my-repertoire.md`
- **Work through a pathway stage** (`work-a-pathway-stage`) — Follow a route you trust — see where you are, take the next suggestion into your own items once, and practise it
  touchpoints: `src/pages/PathwayDetail.tsx`, `src/pages/StageDetail.tsx`, `src/pages/RoutineRunner.tsx`, `src/domain/pathways.ts`, `src/domain/pathwaySeed.ts`, `src/domain/routines.ts`, `src/domain/practiceSignal.ts`, `src/components/useScreenAwake.ts`, `src/components/screenAwake.ts`, `src/store/useStore.ts`, `src/pages/Repertoire.tsx` · canonical: `.prismatica/flows/work-a-pathway-stage.md`

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

Fix Setar review and archive direction and choice state, and Repertoire search typing

## Stay in scope — you may ONLY change

- src/components/SetarSetupReview.tsx
- src/components/ArchiveRefresh.tsx
- src/components/ReferenceChoices.tsx
- src/components/direction.test.ts
- src/components/pressedState.test.ts
- src/domain/sourceReconcile.ts
- src/domain/sourceReconcile.test.ts
- src/domain/index.ts
- src/pages/Repertoire.tsx
- src/styles/global.css
- tests/setar-review-ui.browser.test.ts
- tests/fixtures/setar-review-ui.json
- tests/setar-practice.browser.test.ts
- tests/setarArchive.browser.test.ts
- tests/repertoire-experience.browser.test.ts
- tests/practiceBrowser.ts
- AGENTS.md
- DECISIONS.md
- docs/setar-archive.md
- docs/repertoire-experience.md

Never touch:

- .github/**
- scripts/**
- package.json
- package-lock.json
- src/main.tsx
- src/domain/migrations.ts
- src/domain/io.ts
- src/domain/types.ts
- src/domain/courseData.ts
- src/domain/khonyagarData.ts
- tests/fixtures/setar-practice-*.json
- c4506c6: every Repertoire browse change applies to the live URL, never render-captured state; the throttled composer step in "repertoire navigation restores browse context without changing session scope" stays as it is and passes.
- Browse URL contract: view, instrument, query, facets and grouping live in the URL; back/forward restore them; browsing never writes sessionInstrumentId.
- Archive decision semantics: exact bindings win, weak equivalences ask, decisions match on identity + typed premise + exact proposal (decisionMatchesSuggestion), a moved premise is refused as stale and re-previewed, Keep my value is the default, an unanswered offer writes nothing, suppressions persist, the commit re-plans, validates and waits for IndexedDB.
- Review Setar setup writes only selected rows, never on load, import, sync or Refresh; its default selections are unchanged.
- Existing direction rules and ledgers: dir="auto" on groups, isolates inline (span/bdi only), instrument names resolve their own direction, English-only surfaces keep their layout, option text and confirm/toast strings stay out of scope.
- No schema change (SCHEMA_VERSION 16), no new dependency, no workflow change, no owner fixture rewritten, no NAS/Setar media or source metadata touched.
- GitHub Actions changes: Node 20 actions already run forced on Node 24 and pass, and prismatica-gate.yml is generated by `prismatica update`; Ubuntu 26 is supported by the installed Playwright 1.63 (ubuntu26.04 deps and WebKit build). Revisit only if a run on the new image actually fails.
- A router-wide `useTransitions={false}`: it would change Suspense behaviour for every lazy route.
- Bidi of <option> text and confirm()/toast strings (out of scope by rule), and the QuickAdd / insights direction open gaps.
- Mapping Refresh Setar archive or Review Setar setup as a new Flow.

## Definition of done

- **ac-1** — Family proof, one committed fixture (tests/fixtures/setar-review-ui.json) and independently derived expected order: every generated line that embeds values reads label, current value, arrow/separator, new value from the inline-start edge, measured by on-screen geometry (not computed direction), and the arrow points from current to proposed. Classes crossed: title fa/en x values fa/en/mixed; setup fields kind, place, study source, suggestion, class in proposed and exception states; archive differences in Archive metadata differs and Review differences; attention list; 390x844 and desktop; Chromium and WebKit. Fails on the current markup. → proven by `setar review and archive lines read in order beside a farsi title`
- **ac-2** — Static guard: inside a dir="auto" group no line renders as a run of sibling dir="ltr"/dir="auto" isolates; a generated line is one inline dir="ltr" isolate with each value nested in its own dir="auto". → proven by `a generated line inside a group is one ltr isolate with its values nested`
- **ac-3** — Keep my value / Use archive value: the pressed option looks different from the unpressed one (computed style differs, not colour alone), swaps on click and keyboard, survives a stale re-preview with Keep shown, and Apply writes the archive value only when Use archive value is selected and leaves the owner value otherwise (IndexedDB read back), in Chromium and WebKit. → proven by `archive metadata choices show the selected option and apply exactly it`
- **ac-4** — An answered Link / Create separately / Skip question stays listed with its answer visibly selected; switching or clearing it before Apply changes what is written; Apply writes only the final answers; a cleared one writes nothing; "N to decide" counts only open questions. → proven by `answered archive questions stay visible and apply only the final answer`
- **ac-5** — Domain: the plan reports each answered question with its answer and excludes it from the open count; a link answer whose target no longer qualifies is stale and the question is open again; no other plan output changes. → proven by `an answered question is reported with its answer and is not counted as open`
- **ac-6** — Every aria-pressed control in src/components and src/pages pairs with a visible selected treatment (.option.selected, btn-primary, a tone class or an equivalent recorded in the test ledger). → proven by `every aria-pressed control renders a visible selected state`
- **ac-7** — Repertoire search under 20x CPU throttle at ~100 ms per key keeps every character in the box and the URL (fails before the fix); a facet chosen mid-typing loses neither; back/forward, Clear filters, an instrument switch and the Practice list still show the URL query. → proven by `repertoire search keeps every typed character under heavy cpu slowdown`
- **ac-8** — Regression guard for c4506c6: the existing browse-context journey, including its throttled query + composer step, still passes unchanged. → proven by `repertoire navigation restores browse context without changing session scope`
- **ac-9** — With each destination page module delayed on its first visit (a harness option, no debug hook), the Repertoire journeys reproduce the line-441 shape before the fix and afterwards act only once the page they navigated to is on screen. → proven by `repertoire journeys act only on the page they navigated to`

## Docs to update as part of this change

- AGENTS.md
- DECISIONS.md
- docs/setar-archive.md
- docs/repertoire-experience.md

## Recommended skills (quality only — never gates)

- **ui-work** — visual / front-end work — layout, styling, interaction — _(use your agent’s equivalent)_
- **build** — implementing the change against the contract — _(use your agent’s equivalent)_
- **simplify** — reducing risk by simplifying the change — _(use your agent’s equivalent)_

## Current progress

Not started — no checks have run yet. Default state is "not ready".

## Before the first review

Family proof plan, before the first review: for subtle work — a parser, a resolver, a provider or transaction boundary, a record another reader must still parse — name each invariant, every consumer of it, its equivalence classes and how they interact, and prove them against independently derived expected results on one reproducible, focused route (committed fixtures, fixed seeds). Point to that route and its limits rather than pasting it. Routine work needs none of this. Say in your commit message where it lives.

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

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory. A finding names an invariant: sweep the repository for every instance of it and list each one found plus the consumers checked clean, in one round — not one counterexample at a time.

