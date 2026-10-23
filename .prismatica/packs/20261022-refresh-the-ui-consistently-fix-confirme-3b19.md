---
id: 20261022-refresh-the-ui-consistently-fix-confirme-3b19
contractId: 20261022-refresh-the-ui-consistently-fix-confirme-3b19
contractHash: 7ec42833872be8e8730f6c052a2c18528bb008d738563096f9daf62af38c1f6c
createdAt: 2026-10-23T00:06:57.368Z
skills:
  - ui-work
  - build
  - simplify
---

# Build brief: Refresh the UI consistently, fix confirmed interaction bugs and preserve proven mobile behaviour

> This brief is scoped and self-contained. A fresh session can resume from it
> alone. Prismatica will check your work deterministically — it never reads this
> chat, only Git and your tests.

- **Linked issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/54
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Work in the lane:** /Users/Ehsan/workspace/active/practice-compass-lanes/20261022-refresh-the-ui-consistently-fix-confirme-3b19

## The plan the owner approved

This is the complete approved proposal, verbatim. `assumptions` and
`possibleConflicts` are the Planner's advisory reading — treat them as leads to
verify against the code, never as established fact.

````yaml
# Approved intent: Refresh the UI consistently, fix confirmed interaction bugs and preserve proven mobile behaviour

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** technical
- **Risk tier:** heavy
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> Carry out a thorough and deep review of practice-compass, focused mainly on improving the UI, the way the app looks and feels (modern trustworthy look) and fixing any bugs that might exist and ensuring the UI practice are followed across the app. Build an optimal plan for me to import. The plan must ensure there is not lengthy back and forth cycles/loops between the builder and the reviewer agents (as experienced many times in the past) and anticipate any issues that might happen. Double check the plan before finalising.
> 
> Settled in planning (2026-10-22), from the owner's answers:
> - Lanes: "One big lane but ensure to take the steps needed to prevent many back and forthes. Don't make it too strict to the point that it backfires and the builder cannot make any decisions and the reviewer has so many things to pick on. Make it optimal and the right balance."
> - Look (chosen option): evolve the current identity — keep the teal accent and warm palette; page titles and the timer stay serif, everything else clean system sans; section labels in sentence case instead of spaced capitals; cards, spacing, buttons and row actions made consistent.
> - Palette (chosen option): keep it — no colour token changes.
> - Builder: claude.
> 
> Owner refinement (2026-10-22): finalise this existing plan, retaining one coherent lane, confirmed bugs, family guards, bounded review and builder discretion. Protect previously solved mobile/UI behaviour, especially keyboard dismissal and the bottom tabs; provide meaningful instruction-budget headroom; include Close to Back draft retention if feasible without expanding the data model; favour outcomes over brittle prescriptions; provide a small before/after owner review packet. Do not restart the product review or build during planning.

## Why

One coherent UI lane, based on the existing audit, not a new product review. Settle visual direction, fix B1-B13 and the closely related Close-to-Back loss, and inventory the affected layout, naming, direction and date families before review. Reuse existing regression evidence and protect the native shell. Review blocks on reproducible contract failures, not taste or speculative defects. This remains technical work restoring existing Flow promises, with no new journey or scheduling model.

## Today

Prior planner reports a visual audit at 24a84be with demo data at 390x844 and 1280x800 in both themes, and 74 files / 526 tests green. Finalisation confirms the same clean HEAD and snapshot; it does not repeat that full audit or test run. The look is dated and uneven: serif on every heading, tracked capitals on every label, two styles of row play button, 34-40px controls on a phone, and a 7,570px Settings page whose sections are not headings. Confirmed bugs:
B1 .card-link {display:block} is declared after .row/.stack-sm, so every link-card combined with them collapses: Today's "Now in" pathway card (icon and chevron on their own lines), the in-progress banner and elsewhere rows, Repertoire's part rows and PathwayCard.
B2 Settings > Device & handoff says sync "newest copy wins" (Settings.tsx:264); decideSync takes the side that changed and asks when both did.
B3 Lessons (Lessons.tsx:52, :401) and Repertoire (:269, :622) freeze now at mount and StageDetail (:64) reads it in a memo, so "in N days", "upcoming" and "last ..." go stale after midnight; useDecisionNow exists for this.
B4 Insights' 30-day window still says "this week" (insights.ts, common focus), and window and right-now cards sit together unlabelled.
B5 Domain sentences fuse owner text: insights.ts bodies and the idle title, report.ts lines, questions.ts' class sheet. A Farsi title followed by digits garbles the line on screen (the Teacher report preview shows "blocks, 33 3 :(عراق) ...") and in the copied, downloaded and printed text.
B6 Direction in components: Today's due caption reads "14 days ago due" (bare "due" outside the line isolate); Repertoire's "gusheh:" renders ":gusheh"; ItemDetail's label isolates carry their trailing space inside, so a Farsi row shows "عبداللهStudy source:" (ItemDetail.tsx:570, 761, 767, 773; ArchiveRefresh.tsx:526); StageDetail's header has no direction group (a Farsi title and intro sit left); Today's "Then, if you have time" reason and the Overview "next:" line are clipped at their start whenever their group resolves RTL, and Overview fuses the title into its string; QuickAdd's instrument picker has no direction (an AGENTS.md open gap), hidden by a lane-scoped file exclusion that also skips ItemForm.tsx and RoutineEdit.tsx. direction.test.ts misses all of these: its title rule is a ban and its phrase rule needs two words.
B7 Close > "Why this date?" (CloseBlock.tsx:473) navigates to Settings, which opens at the top with the target about 4,000px down, and because every close-screen field is local state the chosen result, observation, next action, minute correction and edits are silently lost.
B8 ItemForm offers the edited item as its own parent and lets a work with parts become a part (ItemForm.tsx:80); updateItem accepts it, and the item or its parts vanish from My repertoire.
B9 Changing an item's instrument keeps the old family's hidden identity fields (ItemForm.tsx:139), which are then saved.
B10 Settings > Instruments writes every keystroke and accepts an empty name.
B11 Unnamed controls: 7 scheduling inputs and 3 instrument names in Settings, Teacher report From/To, 3 selects on New routine (Field names a group, not its control); Today has no h1 and Settings sections are not headings.
B12 Phone targets under 44px: .btn-sm 34, .option 40, rating stars 28, Lessons card headers ~19, link-buttons ~17, summaries ~20-24.
B13 Insights' totals table scrolls sideways inside its card at 390; Settings' Export/Import labels wrap onto two lines.
B7 also affects Close > Back > Finish: Back resumes the same active session but unmounts the local close fields. ActiveSession is defined in useStore.ts, outside PracticeDB; in-memory draft retention needs no database schema change. AGENTS.md is 31,880 bytes (888 spare); with CLAUDE.md the loaded profile is 32,745 bytes (23 spare). DECISIONS.md records the measured standalone 100vh keyboard fix (b5ec595) and the distinct geometry guard; browser simulation alone did not prove the native fix.

## Instead

LOOK SPEC (owner, 2026-10-22). Aim for obvious next actions, calm hierarchy, consistency, restraint and low cognitive load. Apple-level care is inspiration, not a platform imitation or a subjective acceptance standard:
1. Colour: every existing colour token keeps its exact value in all three palette blocks; a new token only as hex/rgba, declared in all three blocks (identical in the two light ones), with every pairing it creates added to contrast.test.ts PAIRS.
2. Type: system sans everywhere except serif for .page-title, the timer, the header wordmark and the Practise-now item title; h2-h4, .title-md and .stat-value become semibold sans; body and fields stay 16px.
3. .section-label, .eyebrow and .stat-label render in sentence case (no uppercase transform, normal tracking), semibold, in their current colours (their source text already is).
4. One button system: filled primary only for a region's main action, outlined secondary otherwise, ghost for tertiary row actions; every row play button (Today's then, class and due rows included) is the small outlined one; danger keeps tone-alert; a state toggle (Settings' instrument Active/Hidden) reads as a state, not a call to action.
5. One card and one list-row style, and no component class overrides a layout primitive's display (B1 fixed at the root).
6. Below 760px every button, select, input, textarea, summary and a.btn is at least 44px tall, and icon-only buttons at least 44px wide, except rating stars and links inside running text.
7. Spacing, radii, shadows, line height, exact sizes and copy polish within this spec are the builder's call and are not findings.

FIXES — B1-B13 and B7 Back retention, plus base failures in the explicitly defined ac-1/ac-3 families. Prefer shared fixes; names and structures below are guidance unless needed to preserve an invariant:
- B3: those screens use useDecisionNow.
- B4: window-derived and current-state insights are explicitly distinguished; Insights groups cards as "Last N days" and "Right now"; window wording follows windowDays.
- B5: ONE shared domain helper wraps every owner value (item titles, instrument names, questions, answers, observations) in U+2068...U+2069, replacing setarSetup.ts' private iso() — the accepted precedent: the plain-text counterpart of dir="auto", detecting no script and reordering nothing. Applied in insights.ts, report.ts and questions.ts, so screen, copy, download and print all render. Insight titles never embed a value; stored values never gain marks.
- B6: one inline dir="ltr" isolate per generated line with each value nested in its own dir="auto" span; separators outside label isolates; every data title in a dir="auto" group that re-declares textAlign 'start'; a clipped line wraps instead of truncating (a block-level ltr isolate is banned); the instrument-name check drops its file exclusions and skips only <option> text, so QuickAdd's picker name gets dir="auto".
- B7: "Why this date?" opens a closed-by-default disclosure in place showing the scheduling explanation Settings shows (reuse the formula and spaced-repetition explanation with live values, without a second scheduling calculation); nothing navigates and the draft is untouched.
- B7 Back: retain unsaved close inputs when Back resumes the SAME block and Finish returns, including result, observation, next action, review choices, item edits and teacher question. Keep this draft in memory, outside persisted state, PracticeDB, sync and backups. Bind it to the active session identity (not just item id); a new, completed, discarded or replaced session cannot receive it. Preserve an explicitly corrected duration; otherwise refresh the duration proposal after more practice. Recompute derived dates using current time and settings; never restore a stale derived decision. Returning does not save, advance a review or duplicate a block. Browser reload/crash recovery of this new draft is outside scope. Storage placement is the builder's choice within the allowed files.
- B8: one pure refusal in repertoire.ts, used by ItemForm (which now receives the edited item's id) and by create/update writes that set or alter the relationship, including instrument changes: a part's parent is a top-level item on the same instrument, never itself or one of its own parts, and an item with parts cannot become a part. The form offers only valid parents; the store refuses invalid relationship changes atomically, naming why. Include missing parents and moving a parent/part to another instrument; clearing a link remains allowed. Unrelated edits to legacy-invalid records must not become newly blocked. Do not repair or delete existing relationships on read.
- B9: switching to another instrument family drops the persian/guitar fields that family cannot show.
- B10: a rename commits trimmed on blur or Enter; empty is refused (updateInstrument refuses it too) and the saved name returns with a visible reason.
- B11: name unnamed native controls from their visible labels, using Field where practical or explicit associations at callers — an existing name never changes, because journeys call getByLabel('Next review date') and the like — and keeps role="group" with its aria-label; other unnamed controls get their own names; every route has exactly one h1 (sr-only on Today); Settings sections are h2.
SETTINGS: headed sections — everyday controls first, then sync, device and backup, then NAS and archive, then reference (How scheduling works, Install, How your data is stored); that order is guidance, not a finding. Explanatory prose moves into closed disclosures; every control stays rendered outside one (the disclosures ArchiveRefresh and SetarSetupReview already have keep theirs); the priority formula stays visible with live values; the sync copy says what decideSync does; remove the long uninterrupted prose wall without a pixel-height budget. Controls and their explanations must remain discoverable and keyboard-reachable.
GUARDS: ac-1 is the route sweep; ac-3 extends direction.test.ts discovery for the listed direction shapes, with browser proof of the actual fixed surfaces; ac-11 proves date-dependent displays refresh across a local-day boundary without remounting. Do not ban unrelated one-time timestamps. Ledger edits (GROUP_SITE_INVENTORY, LTR_ISOLATE_SITES, ISOLATED_VALUE_SITES, the instrument-name exclusions) are expected only at sites this lane fixes; an allowlist entry must fall in a listed category (option text, confirm/alert text, attribute values, numeric-only values, stored names) and state its reason.
PROOF, before the first review, in the DECISIONS.md entry: what ac-1 and ac-3 report on the base (the family inventory: routes or sites and their failures); that each new direction shape fails when one fixed site is reverted; that report and class-sheet output, after stripping only newly added outer isolate marks, retains baseline wording on independent fixtures. Insights explicitly permits B4 window wording and removal of owner values from titles; assert the approved expected wording instead of contradictory byte equality. Include mixed languages, digits, punctuation, multiline and already-isolated values; preserve owner content and avoid double wrapping. State the fixture limits, not universal Unicode coverage. No other proof ceremony is required.
DOCS: replace the closed Direction Open gaps bullet with the new domain-isolation and UI-accessibility rules, recording the owner's one-lane decision. Condense AGENTS.md in place so BOTH it and the combined CLAUDE.md import profile retain at least 4 KiB below the existing 32 KiB ceiling after all additions. This is maintenance headroom, not a new permanent global budget. Preserve every current agent-facing prohibition, owner decision and enforcement reference; do not outsource prohibitions to optional docs, delete open gaps that remain, or weaken agent-context tests. Keep a short disposition of condensed sections and byte counts in DECISIONS.md; existing preservation/path checks remain mandatory. README names serif/sans roles. One dated DECISIONS.md entry contains the family proof, regression evidence and follow-ups.
REGRESSION PROTECTION: reuse the existing viewport, practice-information, post-practice, repertoire and app-update journeys and unit tests in the normal full check, without copying their machinery. Preserve acknowledged note saves (failure/retry, item-bound drafts), browse filters/back context, one clock and paused reflection time, visible pressed/focus states, prompt-only Reload in its own window, and material disclosures that cannot alter practice time, wake lock or cues. These are preservation obligations, not new redesign families. Extend coverage only where the diff exposes a gap.
VISUAL REVIEW PACKET: provide a small matched before/after set using the same fixture, viewport and theme: Today, a representative mixed-language list/detail, Close and Settings, with light/dark and phone/desktop represented without a full Cartesian matrix. Caption the changes and link the packet from the decision entry. Local review artefacts are sufficient; no golden screenshots, pixel-diff gates or new screenshot framework. The owner judges polish; reviewers judge the explicit outcomes and regressions. Capture baseline images before restyling.
Scope uses concrete paths because the installed Prismatica validator refuses the original broad globs. Optional new helper paths are closeDraft.ts and SchedulingExplanation.tsx under src/components; reusing existing ui.tsx, util.ts or useStore.ts is equally valid. New focused test and fixture paths are listed; these names constrain only placement, not implementation.


## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- Prior planner baseline test and visual results are historical evidence at the unchanged HEAD, not rerun results from finalisation. Builder runs the normal required checks on its implementation.
- The 44px phone touch target is the settled product convention, not a claim that WCAG AA universally requires 44px. Rating stars and links in running prose retain the explicit exceptions.
- Close draft retention is limited to navigation within the live app session. Use non-persisted state so no new hydration validation, schema or recovery promise is needed.
- Existing test titles and journey names must resolve exactly once; add assertions to existing tests where appropriate rather than duplicating a named acceptance test.

**Possible conflicts**

- AGENTS.md says the QuickAdd and insights.ts open gaps each need their own lane; the owner chose one lane on 2026-10-22, and removing that bullet is part of this change.
- AGENTS.md's 'nothing is fixed or sticky' stays violated by Settings' .toast, which is excluded below.
- The 44px floor makes phone rows taller; the recommendation must still clear the fold (ac-13).
- Unicode isolate support varies in external text consumers; demonstrate the actual copy/paste result on the owner device, without claiming compatibility with every destination.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "Carry out a thorough and deep review of practice-compass, focused mainly on improving the UI, the way the app looks and feels (modern trustworthy look) and fixing any bugs that might exist and ensuring the UI practice are followed across the app. Build an optimal plan for me to import. The plan must ensure there is not lengthy back and forth cycles/loops between the builder and the reviewer agents (as experienced many times in the past) and anticipate any issues that might happen. Double check the plan before finalising.\n\nSettled in planning (2026-10-22), from the owner's answers:\n- Lanes: \"One big lane but ensure to take the steps needed to prevent many back and forthes. Don't make it too strict to the point that it backfires and the builder cannot make any decisions and the reviewer has so many things to pick on. Make it optimal and the right balance.\"\n- Look (chosen option): evolve the current identity — keep the teal accent and warm palette; page titles and the timer stay serif, everything else clean system sans; section labels in sentence case instead of spaced capitals; cards, spacing, buttons and row actions made consistent.\n- Palette (chosen option): keep it — no colour token changes.\n- Builder: claude.\n\nOwner refinement (2026-10-22): finalise this existing plan, retaining one coherent lane, confirmed bugs, family guards, bounded review and builder discretion. Protect previously solved mobile/UI behaviour, especially keyboard dismissal and the bottom tabs; provide meaningful instruction-budget headroom; include Close to Back draft retention if feasible without expanding the data model; favour outcomes over brittle prescriptions; provide a small before/after owner review packet. Do not restart the product review or build during planning.",
  "builder": "claude",
  "summary": "Refresh the UI consistently, fix confirmed interaction bugs and preserve proven mobile behaviour",
  "rationale": "One coherent UI lane, based on the existing audit, not a new product review. Settle visual direction, fix B1-B13 and the closely related Close-to-Back loss, and inventory the affected layout, naming, direction and date families before review. Reuse existing regression evidence and protect the native shell. Review blocks on reproducible contract failures, not taste or speculative defects. This remains technical work restoring existing Flow promises, with no new journey or scheduling model.",
  "kind": "technical",
  "currentBehaviour": "Prior planner reports a visual audit at 24a84be with demo data at 390x844 and 1280x800 in both themes, and 74 files / 526 tests green. Finalisation confirms the same clean HEAD and snapshot; it does not repeat that full audit or test run. The look is dated and uneven: serif on every heading, tracked capitals on every label, two styles of row play button, 34-40px controls on a phone, and a 7,570px Settings page whose sections are not headings. Confirmed bugs:\nB1 .card-link {display:block} is declared after .row/.stack-sm, so every link-card combined with them collapses: Today's \"Now in\" pathway card (icon and chevron on their own lines), the in-progress banner and elsewhere rows, Repertoire's part rows and PathwayCard.\nB2 Settings > Device & handoff says sync \"newest copy wins\" (Settings.tsx:264); decideSync takes the side that changed and asks when both did.\nB3 Lessons (Lessons.tsx:52, :401) and Repertoire (:269, :622) freeze now at mount and StageDetail (:64) reads it in a memo, so \"in N days\", \"upcoming\" and \"last ...\" go stale after midnight; useDecisionNow exists for this.\nB4 Insights' 30-day window still says \"this week\" (insights.ts, common focus), and window and right-now cards sit together unlabelled.\nB5 Domain sentences fuse owner text: insights.ts bodies and the idle title, report.ts lines, questions.ts' class sheet. A Farsi title followed by digits garbles the line on screen (the Teacher report preview shows \"blocks, 33 3 :(عراق) ...\") and in the copied, downloaded and printed text.\nB6 Direction in components: Today's due caption reads \"14 days ago due\" (bare \"due\" outside the line isolate); Repertoire's \"gusheh:\" renders \":gusheh\"; ItemDetail's label isolates carry their trailing space inside, so a Farsi row shows \"عبداللهStudy source:\" (ItemDetail.tsx:570, 761, 767, 773; ArchiveRefresh.tsx:526); StageDetail's header has no direction group (a Farsi title and intro sit left); Today's \"Then, if you have time\" reason and the Overview \"next:\" line are clipped at their start whenever their group resolves RTL, and Overview fuses the title into its string; QuickAdd's instrument picker has no direction (an AGENTS.md open gap), hidden by a lane-scoped file exclusion that also skips ItemForm.tsx and RoutineEdit.tsx. direction.test.ts misses all of these: its title rule is a ban and its phrase rule needs two words.\nB7 Close > \"Why this date?\" (CloseBlock.tsx:473) navigates to Settings, which opens at the top with the target about 4,000px down, and because every close-screen field is local state the chosen result, observation, next action, minute correction and edits are silently lost.\nB8 ItemForm offers the edited item as its own parent and lets a work with parts become a part (ItemForm.tsx:80); updateItem accepts it, and the item or its parts vanish from My repertoire.\nB9 Changing an item's instrument keeps the old family's hidden identity fields (ItemForm.tsx:139), which are then saved.\nB10 Settings > Instruments writes every keystroke and accepts an empty name.\nB11 Unnamed controls: 7 scheduling inputs and 3 instrument names in Settings, Teacher report From/To, 3 selects on New routine (Field names a group, not its control); Today has no h1 and Settings sections are not headings.\nB12 Phone targets under 44px: .btn-sm 34, .option 40, rating stars 28, Lessons card headers ~19, link-buttons ~17, summaries ~20-24.\nB13 Insights' totals table scrolls sideways inside its card at 390; Settings' Export/Import labels wrap onto two lines.\nB7 also affects Close > Back > Finish: Back resumes the same active session but unmounts the local close fields. ActiveSession is defined in useStore.ts, outside PracticeDB; in-memory draft retention needs no database schema change. AGENTS.md is 31,880 bytes (888 spare); with CLAUDE.md the loaded profile is 32,745 bytes (23 spare). DECISIONS.md records the measured standalone 100vh keyboard fix (b5ec595) and the distinct geometry guard; browser simulation alone did not prove the native fix.",
  "desiredBehaviour": "LOOK SPEC (owner, 2026-10-22). Aim for obvious next actions, calm hierarchy, consistency, restraint and low cognitive load. Apple-level care is inspiration, not a platform imitation or a subjective acceptance standard:\n1. Colour: every existing colour token keeps its exact value in all three palette blocks; a new token only as hex/rgba, declared in all three blocks (identical in the two light ones), with every pairing it creates added to contrast.test.ts PAIRS.\n2. Type: system sans everywhere except serif for .page-title, the timer, the header wordmark and the Practise-now item title; h2-h4, .title-md and .stat-value become semibold sans; body and fields stay 16px.\n3. .section-label, .eyebrow and .stat-label render in sentence case (no uppercase transform, normal tracking), semibold, in their current colours (their source text already is).\n4. One button system: filled primary only for a region's main action, outlined secondary otherwise, ghost for tertiary row actions; every row play button (Today's then, class and due rows included) is the small outlined one; danger keeps tone-alert; a state toggle (Settings' instrument Active/Hidden) reads as a state, not a call to action.\n5. One card and one list-row style, and no component class overrides a layout primitive's display (B1 fixed at the root).\n6. Below 760px every button, select, input, textarea, summary and a.btn is at least 44px tall, and icon-only buttons at least 44px wide, except rating stars and links inside running text.\n7. Spacing, radii, shadows, line height, exact sizes and copy polish within this spec are the builder's call and are not findings.\n\nFIXES — B1-B13 and B7 Back retention, plus base failures in the explicitly defined ac-1/ac-3 families. Prefer shared fixes; names and structures below are guidance unless needed to preserve an invariant:\n- B3: those screens use useDecisionNow.\n- B4: window-derived and current-state insights are explicitly distinguished; Insights groups cards as \"Last N days\" and \"Right now\"; window wording follows windowDays.\n- B5: ONE shared domain helper wraps every owner value (item titles, instrument names, questions, answers, observations) in U+2068...U+2069, replacing setarSetup.ts' private iso() — the accepted precedent: the plain-text counterpart of dir=\"auto\", detecting no script and reordering nothing. Applied in insights.ts, report.ts and questions.ts, so screen, copy, download and print all render. Insight titles never embed a value; stored values never gain marks.\n- B6: one inline dir=\"ltr\" isolate per generated line with each value nested in its own dir=\"auto\" span; separators outside label isolates; every data title in a dir=\"auto\" group that re-declares textAlign 'start'; a clipped line wraps instead of truncating (a block-level ltr isolate is banned); the instrument-name check drops its file exclusions and skips only <option> text, so QuickAdd's picker name gets dir=\"auto\".\n- B7: \"Why this date?\" opens a closed-by-default disclosure in place showing the scheduling explanation Settings shows (reuse the formula and spaced-repetition explanation with live values, without a second scheduling calculation); nothing navigates and the draft is untouched.\n- B7 Back: retain unsaved close inputs when Back resumes the SAME block and Finish returns, including result, observation, next action, review choices, item edits and teacher question. Keep this draft in memory, outside persisted state, PracticeDB, sync and backups. Bind it to the active session identity (not just item id); a new, completed, discarded or replaced session cannot receive it. Preserve an explicitly corrected duration; otherwise refresh the duration proposal after more practice. Recompute derived dates using current time and settings; never restore a stale derived decision. Returning does not save, advance a review or duplicate a block. Browser reload/crash recovery of this new draft is outside scope. Storage placement is the builder's choice within the allowed files.\n- B8: one pure refusal in repertoire.ts, used by ItemForm (which now receives the edited item's id) and by create/update writes that set or alter the relationship, including instrument changes: a part's parent is a top-level item on the same instrument, never itself or one of its own parts, and an item with parts cannot become a part. The form offers only valid parents; the store refuses invalid relationship changes atomically, naming why. Include missing parents and moving a parent/part to another instrument; clearing a link remains allowed. Unrelated edits to legacy-invalid records must not become newly blocked. Do not repair or delete existing relationships on read.\n- B9: switching to another instrument family drops the persian/guitar fields that family cannot show.\n- B10: a rename commits trimmed on blur or Enter; empty is refused (updateInstrument refuses it too) and the saved name returns with a visible reason.\n- B11: name unnamed native controls from their visible labels, using Field where practical or explicit associations at callers — an existing name never changes, because journeys call getByLabel('Next review date') and the like — and keeps role=\"group\" with its aria-label; other unnamed controls get their own names; every route has exactly one h1 (sr-only on Today); Settings sections are h2.\nSETTINGS: headed sections — everyday controls first, then sync, device and backup, then NAS and archive, then reference (How scheduling works, Install, How your data is stored); that order is guidance, not a finding. Explanatory prose moves into closed disclosures; every control stays rendered outside one (the disclosures ArchiveRefresh and SetarSetupReview already have keep theirs); the priority formula stays visible with live values; the sync copy says what decideSync does; remove the long uninterrupted prose wall without a pixel-height budget. Controls and their explanations must remain discoverable and keyboard-reachable.\nGUARDS: ac-1 is the route sweep; ac-3 extends direction.test.ts discovery for the listed direction shapes, with browser proof of the actual fixed surfaces; ac-11 proves date-dependent displays refresh across a local-day boundary without remounting. Do not ban unrelated one-time timestamps. Ledger edits (GROUP_SITE_INVENTORY, LTR_ISOLATE_SITES, ISOLATED_VALUE_SITES, the instrument-name exclusions) are expected only at sites this lane fixes; an allowlist entry must fall in a listed category (option text, confirm/alert text, attribute values, numeric-only values, stored names) and state its reason.\nPROOF, before the first review, in the DECISIONS.md entry: what ac-1 and ac-3 report on the base (the family inventory: routes or sites and their failures); that each new direction shape fails when one fixed site is reverted; that report and class-sheet output, after stripping only newly added outer isolate marks, retains baseline wording on independent fixtures. Insights explicitly permits B4 window wording and removal of owner values from titles; assert the approved expected wording instead of contradictory byte equality. Include mixed languages, digits, punctuation, multiline and already-isolated values; preserve owner content and avoid double wrapping. State the fixture limits, not universal Unicode coverage. No other proof ceremony is required.\nDOCS: replace the closed Direction Open gaps bullet with the new domain-isolation and UI-accessibility rules, recording the owner's one-lane decision. Condense AGENTS.md in place so BOTH it and the combined CLAUDE.md import profile retain at least 4 KiB below the existing 32 KiB ceiling after all additions. This is maintenance headroom, not a new permanent global budget. Preserve every current agent-facing prohibition, owner decision and enforcement reference; do not outsource prohibitions to optional docs, delete open gaps that remain, or weaken agent-context tests. Keep a short disposition of condensed sections and byte counts in DECISIONS.md; existing preservation/path checks remain mandatory. README names serif/sans roles. One dated DECISIONS.md entry contains the family proof, regression evidence and follow-ups.\nREGRESSION PROTECTION: reuse the existing viewport, practice-information, post-practice, repertoire and app-update journeys and unit tests in the normal full check, without copying their machinery. Preserve acknowledged note saves (failure/retry, item-bound drafts), browse filters/back context, one clock and paused reflection time, visible pressed/focus states, prompt-only Reload in its own window, and material disclosures that cannot alter practice time, wake lock or cues. These are preservation obligations, not new redesign families. Extend coverage only where the diff exposes a gap.\nVISUAL REVIEW PACKET: provide a small matched before/after set using the same fixture, viewport and theme: Today, a representative mixed-language list/detail, Close and Settings, with light/dark and phone/desktop represented without a full Cartesian matrix. Caption the changes and link the packet from the decision entry. Local review artefacts are sufficient; no golden screenshots, pixel-diff gates or new screenshot framework. The owner judges polish; reviewers judge the explicit outcomes and regressions. Capture baseline images before restyling.\nScope uses concrete paths because the installed Prismatica validator refuses the original broad globs. Optional new helper paths are closeDraft.ts and SchedulingExplanation.tsx under src/components; reusing existing ui.tsx, util.ts or useStore.ts is equally valid. New focused test and fixture paths are listed; these names constrain only placement, not implementation.\n",
  "mustNotChange": [
    "Today keeps switcher, then Plan, then Routines, then Practise now, with the recommendation above the fold at 390x844 (owner decision 2026-09-11, asserted by repertoire-viewport).",
    "The App-shell block of global.css (height model, overflow, safe-area padding, .tabbar/.tab geometry), Layout.tsx, viewport.ts and useViewportGuard.ts: tab colour and type may change, geometry may not.",
    "Accessible names of existing controls and the existing journey contracts and selectors (.list-row, .row-title, .notes-read, .page-title, .page-sub, pre.pre, .toast, .stat, .stat-value, .stage-unit, .stage-unit-menu-list, .card, .tabbar, a.tab.active, article, details/summary, main section h2): preserve their observable meaning; do not freeze unrelated DOM structure. An existing assertion changes only where this plan changes what it asserts (approved wording, isolated export text, ledgers at fixed sites); none is weakened or deleted, and no harness rule (waits, page-error capture) is relaxed.",
    "Practice and review semantics: a result is required, Save without a result keeps its meaning, review and SM-2 decisions are untouched, the date shown is the date saved, start stays under 30s and close under 60s, and no field becomes required.",
    "Saved data: no schema, SCHEMA_VERSION, validateDB, migration, sync or backup format change, and no new refusal on read — data already holding a self-parent or an empty instrument name loads as before.",
    "Direction mechanics: every dir is written literally; ltr/rtl only on span or bdi; nothing detects script or reorders text; unicode-bidi: plaintext only on .input/.textarea.",
    "No new dependency, webfont, network endpoint or CSP change.",
    "Preserve the measured shell outcome: after keyboard dismissal the bottom tabs return to their normal position and stay reachable, including retained focus. Never force blur, suppress zoom, change main scroll ownership, or replace the standalone 100vh fix with 100dvh. Shell source exclusions do not excuse regressions caused by global type/spacing styles."
  ],
  "assumptions": [
    "Prior planner baseline test and visual results are historical evidence at the unchanged HEAD, not rerun results from finalisation. Builder runs the normal required checks on its implementation.",
    "The 44px phone touch target is the settled product convention, not a claim that WCAG AA universally requires 44px. Rating stars and links in running prose retain the explicit exceptions.",
    "Close draft retention is limited to navigation within the live app session. Use non-persisted state so no new hydration validation, schema or recovery promise is needed.",
    "Existing test titles and journey names must resolve exactly once; add assertions to existing tests where appropriate rather than duplicating a named acceptance test."
  ],
  "possibleConflicts": [
    "AGENTS.md says the QuickAdd and insights.ts open gaps each need their own lane; the owner chose one lane on 2026-10-22, and removing that bullet is part of this change.",
    "AGENTS.md's 'nothing is fixed or sticky' stays violated by Settings' .toast, which is excluded below.",
    "The 44px floor makes phone rows taller; the recommendation must still clear the fold (ac-13).",
    "Unicode isolate support varies in external text consumers; demonstrate the actual copy/paste result on the owner device, without claiming compatibility with every destination."
  ],
  "scope": {
    "allow": [
      "src/styles/global.css",
      "src/styles/contrast.test.ts",
      "src/components/ArchiveRefresh.tsx",
      "src/components/Attachments.tsx",
      "src/components/ClassQuestions.tsx",
      "src/components/InstallHint.tsx",
      "src/components/ItemCard.tsx",
      "src/components/ItemForm.tsx",
      "src/components/ItemMaterial.tsx",
      "src/components/ItemNotes.tsx",
      "src/components/LessonAgenda.tsx",
      "src/components/LessonNotes.tsx",
      "src/components/MusicalTermField.tsx",
      "src/components/QuickAdd.tsx",
      "src/components/ReferenceChoices.tsx",
      "src/components/ReferenceEditor.tsx",
      "src/components/RoutineDuration.tsx",
      "src/components/SetarSetupReview.tsx",
      "src/components/icons.tsx",
      "src/components/ui.tsx",
      "src/components/direction.test.ts",
      "src/components/format.test.ts",
      "src/components/format.ts",
      "src/components/itemFields.ts",
      "src/components/itemFormValues.ts",
      "src/components/itemKinds.test.ts",
      "src/components/itemKinds.ts",
      "src/components/options.ts",
      "src/components/pressedState.test.ts",
      "src/components/useDecisionNow.ts",
      "src/pages/ActiveBlock.tsx",
      "src/pages/CloseBlock.tsx",
      "src/pages/Insights.tsx",
      "src/pages/ItemDetail.tsx",
      "src/pages/Lessons.tsx",
      "src/pages/Materials.tsx",
      "src/pages/More.tsx",
      "src/pages/MusicTerms.tsx",
      "src/pages/NewItem.tsx",
      "src/pages/PathwayDetail.tsx",
      "src/pages/Repertoire.tsx",
      "src/pages/RoutineEdit.tsx",
      "src/pages/RoutineRunner.tsx",
      "src/pages/SessionPlan.tsx",
      "src/pages/Settings.tsx",
      "src/pages/StageDetail.tsx",
      "src/pages/StartBlock.tsx",
      "src/pages/TeacherReport.tsx",
      "src/pages/Today.tsx",
      "src/domain/util.ts",
      "src/domain/index.ts",
      "src/domain/insights.ts",
      "src/domain/insights.test.ts",
      "src/domain/report.ts",
      "src/domain/report.test.ts",
      "src/domain/questions.ts",
      "src/domain/questions.test.ts",
      "src/domain/repertoire.ts",
      "src/domain/repertoire.test.ts",
      "src/domain/routines.test.ts",
      "src/domain/lessonAgenda.test.ts",
      "src/domain/setarSetup.ts",
      "src/store/useStore.ts",
      "tests/app-update.browser.test.ts",
      "tests/app-version.test.ts",
      "tests/daily-practice.browser.test.ts",
      "tests/journey-harness.browser.test.ts",
      "tests/lesson-agenda.browser.test.ts",
      "tests/lessonNotes.browser.test.ts",
      "tests/musical-term-suggestions.browser.test.ts",
      "tests/owned-writes.test.ts",
      "tests/post-practice.browser.test.ts",
      "tests/practice-cues.browser.test.ts",
      "tests/practice-information-inbound.browser.test.ts",
      "tests/practice-information-layout.browser.test.ts",
      "tests/practice-information.browser.test.ts",
      "tests/practiceBrowser.ts",
      "tests/repertoire-experience.browser.test.ts",
      "tests/repertoire-families.test.ts",
      "tests/repertoire-inbound.browser.test.ts",
      "tests/repertoire-viewport.browser.test.ts",
      "tests/review-ownership.browser.test.ts",
      "tests/setar-practice-inbound.browser.test.ts",
      "tests/setar-practice-proof.test.ts",
      "tests/setar-practice-relations.test.ts",
      "tests/setar-practice-source.test.ts",
      "tests/setar-practice.browser.test.ts",
      "tests/setar-review-ui.browser.test.ts",
      "tests/setarArchive.browser.test.ts",
      "tests/setarInbound.browser.test.ts",
      "tests/fixtures/practice-decisions-v11.json",
      "tests/fixtures/practice-decisions-v12.json",
      "tests/fixtures/practice-information-v12.json",
      "tests/fixtures/practice-information-v13.json",
      "tests/fixtures/repertoire-current-v15.json",
      "tests/fixtures/repertoire-family-expectations.json",
      "tests/fixtures/repertoire-legacy-v14.json",
      "tests/fixtures/setar-archive.json",
      "tests/fixtures/setar-legacy-v13.json",
      "tests/fixtures/setar-practice-owner-v15.json",
      "tests/fixtures/setar-practice-owner-v16.json",
      "tests/fixtures/setar-practice-setup-expectations.json",
      "tests/fixtures/setar-practice-source-expectations.json",
      "tests/fixtures/setar-practice-source-v1.json",
      "tests/fixtures/setar-review-ui.json",
      "AGENTS.md",
      "DECISIONS.md",
      "README.md",
      "src/components/closeDraft.ts",
      "src/components/closeDraft.test.ts",
      "src/components/SchedulingExplanation.tsx",
      "tests/ui-conformance.browser.test.ts",
      "tests/ui-date-refresh.browser.test.ts",
      "tests/ui-refresh-store.test.ts",
      "tests/ui-guidance.test.ts",
      "tests/fixtures/ui-refresh.json",
      "src/components/itemFormValues.test.ts"
    ],
    "forbid": [
      "src/components/Layout.tsx",
      "src/components/viewport.ts",
      "src/components/viewport.test.ts",
      "src/components/useViewportGuard.ts",
      "src/components/useScreenAwake.ts",
      "src/components/screenAwake.ts",
      "src/components/screenAwake.test.ts",
      "src/components/practiceCue.ts",
      "src/components/practiceCue.test.ts",
      "src/components/appUpdate.ts",
      "src/components/appUpdate.test.ts",
      "src/App.tsx",
      "src/main.tsx",
      "src/domain/types.ts",
      "src/domain/io.ts",
      "src/domain/migrations.ts",
      "src/domain/scheduling.ts",
      "src/domain/scoring.ts",
      "src/domain/plan.ts",
      "src/domain/sync.ts",
      "src/store/idb.ts",
      "src/store/backup.ts",
      "src/store/syncEngine.ts",
      "src/store/githubSync.ts",
      "tests/journey-waits.test.ts",
      "tests/agent-context.test.ts",
      "tests/ci-browser-setup.test.ts",
      "index.html",
      "vite.config.ts",
      "package.json",
      "package-lock.json",
      "public/**",
      "scripts/**",
      ".github/**",
      ".prismatica/**"
    ]
  },
  "exclusions": [
    "Settings' .toast stays position: fixed, without changing its lifecycle; a detachment assertion does not require fixed positioning — a known exception to 'nothing is fixed', for its own lane.",
    "The ~480 inline style objects are not normalised; consistency is judged against the look spec only.",
    "Strings fused in components (StageDetail notices, ItemDetail/Attachments size notes, ArchiveRefresh 'Link to' labels whose names journeys use, Settings import results) and domain refusal or validation messages keep their current wording; a follow-up.",
    "<option> text and confirm()/alert() strings (AGENTS.md).",
    "Insights' tone colours, the balance bar and copy tone beyond the window wording; More > Keyboard trace.",
    "Release valve: a pre-existing defect that is not on this plan's list, not in a family one of its guards covers, and not introduced or worsened by the diff is recorded as a DECISIONS.md follow-up, never a blocking finding.",
    "Review standard: a blocking finding names a broken contract item — a mustNotChange line, an applicable AGENTS.md rule within scope, an acceptance check, a listed fix missing or wrong, or a regression this diff introduced. The look spec is judged on global.css, the shared ui.tsx primitives and the sites this plan names; taste and per-site polish beyond that are the owner's manual check.",
    "The release valve applies to pre-existing out-of-scope rule violations too; it cannot excuse a listed fix, in-scope family failure, or introduced/worsened regression. Report reproducible failures together per review, distinguishing blockers from owner taste. Do not reopen an accepted implementation choice without new evidence."
  ],
  "acceptance": [
    {
      "description": "tests/ui-conformance.browser.test.ts, WebKit and Chromium at 390x844 and Chromium at 1280x900, on a committed mixed-language fixture (a Farsi-named and an English-named instrument holding titles in the other language, and a Farsi title followed by digits). Routes: Today (session and Overview), Repertoire's three views, Start, Active, Close, Plan, Routine new and a runner, Lessons, New item, an item, a pathway, a stage, Study sources, Musical terms, Insights, Teacher report, More, Settings. On every route: no unintended horizontal scrolling or clipped content in page/main/content containers, including the Insights table (native editable text scrolling and intentional clipping of decorative content are not failures); every visible control has an accessible name; exactly one h1; shared layout primitives retain their intended row/stack geometry, including link-card combinations; at 390 the 44px floor holds (stars and in-text links excepted); no page error. It collects every failure before asserting, so one run names the whole inventory; red on base for B1 and B11-B13. Use the existing browser harness and deterministic readiness; share setup where safe, but reset state when a journey mutates it. Do not prescribe timeout/runtime budgets or detect accessible names solely from aria-label. Exercise representative disclosures and editable states, not just initial route loads. Existing named regression journeys may supply coverage rather than duplicating it.",
      "test": "every route reflows, names its controls and meets the touch floor"
    },
    {
      "description": "Same fixture, both engines at 390, positions measured rather than attributes read: Today's due caption reads 'due' before its day; the 'Then, if you have time' reason and the Overview 'next:' line show their first word; Repertoire's 'gusheh:' precedes its value; a Farsi stage title and its intro share the right edge while an English one stays left; ItemDetail's 'Study source:' keeps its gap on the value's side; an Insights body and a Teacher report preview line holding a Farsi title followed by digits keep their English words in order; QuickAdd's Farsi instrument name computes rtl.",
      "test": "mismatched languages keep their own direction on every fixed surface"
    },
    {
      "description": "Extend src/components/direction.test.ts for the B6 structural families: data-title anchors, generated words with owner values, label separators and instrument names across files. Discover candidate sites and report all failures together; define the supported source shapes and reasoned exclusions. Prove representative seeded regressions fail for each added shape, supplemented by ac-2 browser geometry. No universal JSX analyser or parser rewrite is required; false positives are not product defects. Reuse the existing direction ledgers and do not hide unfixed in-scope sites.",
      "test": "owner text and generated words keep their own direction"
    },
    {
      "description": "src/domain/insights.test.ts on fixtures with Farsi and English titles followed by digits, windows 7 and 30: every interpolated owner value is isolated without changing its content or double wrapping an already isolated value; no title embeds a value; window wording follows windowDays (30 never says 'this week'); each insight's scope matches its data; expected wording independently encodes the approved B4 and title changes; other wording and stored values remain unchanged.",
      "test": "insights isolate owner text and say which window they describe"
    },
    {
      "description": "src/domain/report.test.ts over buildTeacherReport and renderClassQuestionsText: every interpolated owner value (instrument name, titles, questions, answers, observations) is isolated without content loss or double wrapping; removing only newly added wrapper marks yields the base output byte for byte, against expected text committed before the change; a Farsi title followed by digits is among the fixtures.",
      "test": "exported class text isolates every owner value and keeps its wording"
    },
    {
      "description": "src/domain/repertoire.test.ts, the shared parent refusal: itself, one of its own parts, a part as parent, an item on another instrument, and a work that has parts becoming a part are each refused with a reason, while a top-level item on the same instrument is accepted; ItemForm's options use it, and through the real store (idb mocked as in practiceCue.test.ts) updateItem refuses a self-parent while saving a valid parent. Cover missing parent, creation as well as update, instrument changes on either side of a parent/part relationship, clearing the link, and an unrelated edit to a legacy-invalid record. Refusal leaves the database and revision unchanged; valid changes save. No inbound-read refusal is added.",
      "test": "a parent is refused for itself, its parts or a work with parts, and kept otherwise"
    },
    {
      "description": "src/components/itemFormValues.test.ts: Persian to Guitar, Guitar to Persian, the same family and an unchanged instrument: only the identity fields the new family cannot show are dropped; every other value is kept.",
      "test": "switching instrument family drops identity fields the new family cannot show"
    },
    {
      "description": "Browser, Settings at 390, both engines: renaming an instrument to '  Tar 2  ' commits on blur and survives a reload as 'Tar 2'; clearing the name is refused with a visible reason and the saved name is still there after a reload. Exercise the store refusal directly as well as UI commit; no partial rename or unrelated field change on refusal, and Enter followed by blur does not apply the rename twice.",
      "test": "an instrument rename saves trimmed on commit and an empty name is refused"
    },
    {
      "description": "Browser, Settings at 390, both engines: each section is an h2; no control sits inside a closed disclosure except those ArchiveRefresh and SetarSetupReview already have; the priority formula is visible with live values; reference prose is collapsed and sections/controls remain discoverable by headings and keyboard; the Device copy no longer says the newest copy wins.",
      "test": "Settings keeps every control in reach under headed sections"
    },
    {
      "description": "tests/post-practice.browser.test.ts, both engines at 390: choose a result, type an observation and a next action, open the review controls and tap 'Why this date?': the explanation shows on /close with the live first gap, the typed text and the result are still there, and Save writes them. Other close inputs, including duration correction, manual review choice, item edits and teacher question, remain intact; shared explanation values follow Settings without changing the decision.",
      "test": "why this date explains in place and keeps the close draft"
    },
    {
      "description": "Browser test with a controlled clock and real UI: cross local midnight while Lessons, Repertoire and StageDetail remain mounted; relative dates, upcoming lessons and lesson preparation eligibility refresh through the existing ticking clock. Include imported future-dated lesson history so it does not become an upcoming class. Use explicit expected states, not a source ban on new Date or a frozen-time sleep. Inventory the known consumers; source checks may supplement, not substitute for this behaviour.",
      "test": "date-dependent screens refresh across midnight without remounting"
    },
    {
      "description": "Existing src/styles/contrast.test.ts remains green for its listed pair-specific thresholds in all palette blocks; separately compare existing colour token values with the baseline, since contrast alone does not prove the palette is unchanged. New pairings, if any, join the existing coverage.",
      "test": "every listed colour pair meets WCAG AA in every block where its tokens are declared"
    },
    {
      "description": "Regression guard (existing, tests/repertoire-viewport.browser.test.ts): Today's order and the recommendation above the fold at 390x844 survive the taller controls; Repertoire stays reflowed, named and keyboard-reachable.",
      "test": "the shared practice shell remains accessible and readable across layouts"
    },
    {
      "description": "Owner on the candidate build, installed iPhone PWA AND Safari: repeat keyboard open/dismiss with focus retained on Close, notes and a lesson question; verify tabs return and remain reachable, with main scroll usable. Include route change, rotation, background/resume and pinch zoom, checking after dismissal at normal scale; record device, OS, build and outcome, without claiming browser fixtures prove native behaviour. On MacBook and iPhone in light/dark, review the small before/after packet against the look spec and paste a mixed-language report into Messages. Owner taste adjustments within the spec are a passing refinement, not a new reviewer family. Actual regressions remain blockers.",
      "test": "manual:OWNER"
    },
    {
      "description": "Browser through real controls: fill close inputs, Back, practise further, Finish; retain result/text/manual choices/item edits/question, refresh an untouched duration proposal and preserve a corrected duration. Save creates one block with the retained values and the displayed current review decision. Repeat with discard and a new session on the SAME item, verifying no draft leakage. Include a day/settings change while away so derived dates refresh rather than restoring stale calculations; old session completion cannot clear or overwrite a newer draft.",
      "test": "close draft survives Back for the same block and never leaks to another session"
    },
    {
      "description": "Reuse the exact existing tests/repertoire-viewport.browser.test.ts test and src/components/viewport.test.ts fixtures unchanged in the required check. Preserve standalone height, safe areas, main-only scrolling and diagnostic trace. This guards the scripted mechanism; native keyboard acceptance remains manual:OWNER.",
      "test": "viewport recovery respects focus zoom and scroll ownership"
    },
    {
      "description": "A focused test under tests/ verifies both AGENTS.md and the recursive CLAUDE.md import profile leave at least 4096 bytes under 32768 after additions, reusing the existing counting semantics. Keep existing agent-context budget, prohibition and path tests unchanged and green. Review the short baseline-to-final disposition of condensed sections for semantic preservation; passing phrase checks alone is not sufficient.",
      "test": "UI refresh leaves instruction headroom without losing current prohibitions"
    }
  ],
  "risk": {
    "touchesAuth": false,
    "touchesPayments": false,
    "touchesSavedData": true,
    "copyOnly": false,
    "rationale": "Saved-data writes change: the store gains two refusals (a self or nested parent, an empty instrument name), the item form stops saving hidden identity fields, an instrument rename moves from every keystroke to commit, and the exported report and class-sheet text gains isolate marks. No schema, migration, validateDB, sync or backup format change; stored values never gain marks, and reads are unchanged. Close draft retention is new in-memory UI state only, scoped to the live active session; it adds no persisted field or read boundary."
  },
  "desiredRules": [
    "Screens reflow at phone width, expose named controls and clear heading structure, and provide usable touch targets under the stated UI convention and exceptions; the route sweep protects these outcomes."
  ],
  "docsDelta": [
    "AGENTS.md",
    "DECISIONS.md",
    "README.md"
  ]
}
```
````

## Flows near this scope (understand before you change them)

Compact cards — read a Flow's canonical file when your change touches it.

- **See and adjust the scheduling engine** (`adjust-how-scheduling-works`) — Understand exactly why an item was recommended and a date chosen — and change the numbers if they do not suit you.
  touchpoints: `src/pages/Settings.tsx`, `src/pages/CloseBlock.tsx`, `src/domain/scheduling.ts`, `src/domain/plan.ts`, `src/domain/types.ts`, `src/store/useStore.ts` · canonical: `.prismatica/flows/adjust-how-scheduling-works.md`
- **Back up and restore everything** (`back-up-and-restore`) — Keep an independent copy of all practice data and files, and put it back on any device.
  touchpoints: `src/store/backup.ts`, `src/store/idb.ts`, `src/domain/io.ts`, `src/pages/Settings.tsx`, `src/store/useStore.ts` · canonical: `.prismatica/flows/back-up-and-restore.md`
- **Find something in my repertoire** (`browse-my-repertoire`) — See everything you play, grouped the way you think about it, find it by any name, and open the one you mean without losing your place.
  touchpoints: `src/pages/Repertoire.tsx`, `src/pages/ItemDetail.tsx`, `src/pages/Materials.tsx`, `src/domain/repertoire.ts`, `src/domain/persian.ts`, `src/domain/farsi.ts` · canonical: `.prismatica/flows/browse-my-repertoire.md`
- **Add a practice item** (`capture-a-practice-item`) — Get a new piece, gusheh, étude, passage or technique into the app without breaking your concentration
  touchpoints: `src/components/QuickAdd.tsx`, `src/components/ItemForm.tsx`, `src/components/itemKinds.ts`, `src/pages/NewItem.tsx`, `src/pages/ItemDetail.tsx`, `src/store/useStore.ts`, `src/domain/factories.ts` · canonical: `.prismatica/flows/capture-a-practice-item.md`
- **Deal with a due review** (`clear-a-due-review`) — Handle material that is due to come back, without ever faking that it was practised.
  touchpoints: `src/pages/Today.tsx`, `src/store/useStore.ts`, `src/domain/scheduling.ts`, `src/domain/selectors.ts` · canonical: `.prismatica/flows/clear-a-due-review.md`
- **Install the app and keep it current** (`install-the-app-and-keep-it-current`) — Run the app installed on each device, practise with no network at all, and take new versions without ever reinstalling.
  touchpoints: `src/components/Layout.tsx`, `src/pages/Settings.tsx`, `vite.config.ts` · canonical: `.prismatica/flows/install-the-app-and-keep-it-current.md`
- **Log a class and its follow-up work** (`log-a-class`) — Record a lesson, write up what was said after rewatching it, and turn it into concrete work before the next one
  touchpoints: `src/pages/Lessons.tsx`, `src/components/Attachments.tsx`, `src/domain/recordings.ts`, `src/domain/setarClasses.ts`, `src/domain/files.ts`, `src/domain/selectors.ts`, `src/store/useStore.ts` · canonical: `.prismatica/flows/log-a-class.md`
- **Point this device at the NAS** (`point-this-device-at-the-nas`) — Give this device the address that turns a class recording or score link into a file it can actually open — without any of those files entering the app.
  touchpoints: `src/pages/Settings.tsx`, `src/pages/Lessons.tsx`, `src/domain/recordings.ts`, `src/store/backup.ts` · canonical: `.prismatica/flows/point-this-device-at-the-nas.md`
- **Practise what the app suggests** (`practise-todays-recommendation`) — Practise the one thing the app suggests next and leave an honest record of how it went
  touchpoints: `src/pages/Today.tsx`, `src/pages/StartBlock.tsx`, `src/pages/ActiveBlock.tsx`, `src/pages/CloseBlock.tsx`, `src/store/useStore.ts`, `src/domain/recommend.ts`, `src/domain/scoring.ts`, `src/domain/scheduling.ts`, `src/domain/blocks.ts`, `src/domain/practiceSignal.ts`, `src/components/useScreenAwake.ts`, `src/components/screenAwake.ts` · canonical: `.prismatica/flows/practise-todays-recommendation.md`
- **Take questions and a summary to class** (`prepare-for-the-next-class`) — Arrive at the lesson with the questions that came up while practising, and a short honest account of the period.
  touchpoints: `src/pages/TeacherReport.tsx`, `src/components/ClassQuestions.tsx`, `src/domain/questions.ts`, `src/domain/report.ts`, `src/pages/Lessons.tsx`, `src/pages/CloseBlock.tsx` · canonical: `.prismatica/flows/prepare-for-the-next-class.md`
- **Run a time-budgeted session** (`run-a-session-plan`) — Turn the minutes actually available into an ordered session, then practise it block by block.
  touchpoints: `src/pages/SessionPlan.tsx`, `src/pages/Today.tsx`, `src/pages/ActiveBlock.tsx`, `src/domain/plan.ts`, `src/domain/practiceSignal.ts`, `src/components/useScreenAwake.ts`, `src/components/screenAwake.ts`, `src/store/useStore.ts` · canonical: `.prismatica/flows/run-a-session-plan.md`
- **See how practice is actually going** (`see-practice-patterns`) — Get a calm, neutral read on the last week or month across everything you play.
  touchpoints: `src/pages/Insights.tsx`, `src/pages/Today.tsx`, `src/domain/insights.ts`, `src/domain/io.ts` · canonical: `.prismatica/flows/see-practice-patterns.md`
- **Keep the MacBook and iPhone in step** (`sync-devices-via-github`) — Practise on either device and have both hold the same data, without a server or an account.
  touchpoints: `src/store/syncEngine.ts`, `src/store/githubSync.ts`, `src/store/gitRemote.ts`, `src/domain/sync.ts`, `src/domain/canonical.ts`, `src/store/revision.ts`, `src/pages/Settings.tsx`, `src/App.tsx` · canonical: `.prismatica/flows/sync-devices-via-github.md`
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

Refresh the UI consistently, fix confirmed interaction bugs and preserve proven mobile behaviour

## Stay in scope — you may ONLY change

- src/styles/global.css
- src/styles/contrast.test.ts
- src/components/ArchiveRefresh.tsx
- src/components/Attachments.tsx
- src/components/ClassQuestions.tsx
- src/components/InstallHint.tsx
- src/components/ItemCard.tsx
- src/components/ItemForm.tsx
- src/components/ItemMaterial.tsx
- src/components/ItemNotes.tsx
- src/components/LessonAgenda.tsx
- src/components/LessonNotes.tsx
- src/components/MusicalTermField.tsx
- src/components/QuickAdd.tsx
- src/components/ReferenceChoices.tsx
- src/components/ReferenceEditor.tsx
- src/components/RoutineDuration.tsx
- src/components/SetarSetupReview.tsx
- src/components/icons.tsx
- src/components/ui.tsx
- src/components/direction.test.ts
- src/components/format.test.ts
- src/components/format.ts
- src/components/itemFields.ts
- src/components/itemFormValues.ts
- src/components/itemKinds.test.ts
- src/components/itemKinds.ts
- src/components/options.ts
- src/components/pressedState.test.ts
- src/components/useDecisionNow.ts
- src/pages/ActiveBlock.tsx
- src/pages/CloseBlock.tsx
- src/pages/Insights.tsx
- src/pages/ItemDetail.tsx
- src/pages/Lessons.tsx
- src/pages/Materials.tsx
- src/pages/More.tsx
- src/pages/MusicTerms.tsx
- src/pages/NewItem.tsx
- src/pages/PathwayDetail.tsx
- src/pages/Repertoire.tsx
- src/pages/RoutineEdit.tsx
- src/pages/RoutineRunner.tsx
- src/pages/SessionPlan.tsx
- src/pages/Settings.tsx
- src/pages/StageDetail.tsx
- src/pages/StartBlock.tsx
- src/pages/TeacherReport.tsx
- src/pages/Today.tsx
- src/domain/util.ts
- src/domain/index.ts
- src/domain/insights.ts
- src/domain/insights.test.ts
- src/domain/report.ts
- src/domain/report.test.ts
- src/domain/questions.ts
- src/domain/questions.test.ts
- src/domain/repertoire.ts
- src/domain/repertoire.test.ts
- src/domain/routines.test.ts
- src/domain/lessonAgenda.test.ts
- src/domain/setarSetup.ts
- src/store/useStore.ts
- tests/app-update.browser.test.ts
- tests/app-version.test.ts
- tests/daily-practice.browser.test.ts
- tests/journey-harness.browser.test.ts
- tests/lesson-agenda.browser.test.ts
- tests/lessonNotes.browser.test.ts
- tests/musical-term-suggestions.browser.test.ts
- tests/owned-writes.test.ts
- tests/post-practice.browser.test.ts
- tests/practice-cues.browser.test.ts
- tests/practice-information-inbound.browser.test.ts
- tests/practice-information-layout.browser.test.ts
- tests/practice-information.browser.test.ts
- tests/practiceBrowser.ts
- tests/repertoire-experience.browser.test.ts
- tests/repertoire-families.test.ts
- tests/repertoire-inbound.browser.test.ts
- tests/repertoire-viewport.browser.test.ts
- tests/review-ownership.browser.test.ts
- tests/setar-practice-inbound.browser.test.ts
- tests/setar-practice-proof.test.ts
- tests/setar-practice-relations.test.ts
- tests/setar-practice-source.test.ts
- tests/setar-practice.browser.test.ts
- tests/setar-review-ui.browser.test.ts
- tests/setarArchive.browser.test.ts
- tests/setarInbound.browser.test.ts
- tests/fixtures/practice-decisions-v11.json
- tests/fixtures/practice-decisions-v12.json
- tests/fixtures/practice-information-v12.json
- tests/fixtures/practice-information-v13.json
- tests/fixtures/repertoire-current-v15.json
- tests/fixtures/repertoire-family-expectations.json
- tests/fixtures/repertoire-legacy-v14.json
- tests/fixtures/setar-archive.json
- tests/fixtures/setar-legacy-v13.json
- tests/fixtures/setar-practice-owner-v15.json
- tests/fixtures/setar-practice-owner-v16.json
- tests/fixtures/setar-practice-setup-expectations.json
- tests/fixtures/setar-practice-source-expectations.json
- tests/fixtures/setar-practice-source-v1.json
- tests/fixtures/setar-review-ui.json
- AGENTS.md
- DECISIONS.md
- README.md
- src/components/closeDraft.ts
- src/components/closeDraft.test.ts
- src/components/SchedulingExplanation.tsx
- tests/ui-conformance.browser.test.ts
- tests/ui-date-refresh.browser.test.ts
- tests/ui-refresh-store.test.ts
- tests/ui-guidance.test.ts
- tests/fixtures/ui-refresh.json
- src/components/itemFormValues.test.ts
- docs/setar-archive.md
- docs/cgs-course.md
- docs/khonyagar-course.md
- docs/repertoire-experience.md
- docs/scheduling-evidence.md

Never touch:

- src/components/Layout.tsx
- src/components/viewport.ts
- src/components/viewport.test.ts
- src/components/useViewportGuard.ts
- src/components/useScreenAwake.ts
- src/components/screenAwake.ts
- src/components/screenAwake.test.ts
- src/components/practiceCue.ts
- src/components/practiceCue.test.ts
- src/components/appUpdate.ts
- src/components/appUpdate.test.ts
- src/App.tsx
- src/main.tsx
- src/domain/types.ts
- src/domain/io.ts
- src/domain/migrations.ts
- src/domain/scheduling.ts
- src/domain/scoring.ts
- src/domain/plan.ts
- src/domain/sync.ts
- src/store/idb.ts
- src/store/backup.ts
- src/store/syncEngine.ts
- src/store/githubSync.ts
- tests/journey-waits.test.ts
- tests/agent-context.test.ts
- tests/ci-browser-setup.test.ts
- index.html
- vite.config.ts
- package.json
- package-lock.json
- public/**
- scripts/**
- .github/**
- .prismatica/**
- Today keeps switcher, then Plan, then Routines, then Practise now, with the recommendation above the fold at 390x844 (owner decision 2026-09-11, asserted by repertoire-viewport).
- The App-shell block of global.css (height model, overflow, safe-area padding, .tabbar/.tab geometry), Layout.tsx, viewport.ts and useViewportGuard.ts: tab colour and type may change, geometry may not.
- Accessible names of existing controls and the existing journey contracts and selectors (.list-row, .row-title, .notes-read, .page-title, .page-sub, pre.pre, .toast, .stat, .stat-value, .stage-unit, .stage-unit-menu-list, .card, .tabbar, a.tab.active, article, details/summary, main section h2): preserve their observable meaning; do not freeze unrelated DOM structure. An existing assertion changes only where this plan changes what it asserts (approved wording, isolated export text, ledgers at fixed sites); none is weakened or deleted, and no harness rule (waits, page-error capture) is relaxed.
- Practice and review semantics: a result is required, Save without a result keeps its meaning, review and SM-2 decisions are untouched, the date shown is the date saved, start stays under 30s and close under 60s, and no field becomes required.
- Saved data: no schema, SCHEMA_VERSION, validateDB, migration, sync or backup format change, and no new refusal on read — data already holding a self-parent or an empty instrument name loads as before.
- Direction mechanics: every dir is written literally; ltr/rtl only on span or bdi; nothing detects script or reorders text; unicode-bidi: plaintext only on .input/.textarea.
- No new dependency, webfont, network endpoint or CSP change.
- Preserve the measured shell outcome: after keyboard dismissal the bottom tabs return to their normal position and stay reachable, including retained focus. Never force blur, suppress zoom, change main scroll ownership, or replace the standalone 100vh fix with 100dvh. Shell source exclusions do not excuse regressions caused by global type/spacing styles.
- Settings' .toast stays position: fixed, without changing its lifecycle; a detachment assertion does not require fixed positioning — a known exception to 'nothing is fixed', for its own lane.
- The ~480 inline style objects are not normalised; consistency is judged against the look spec only.
- Strings fused in components (StageDetail notices, ItemDetail/Attachments size notes, ArchiveRefresh 'Link to' labels whose names journeys use, Settings import results) and domain refusal or validation messages keep their current wording; a follow-up.
- <option> text and confirm()/alert() strings (AGENTS.md).
- Insights' tone colours, the balance bar and copy tone beyond the window wording; More > Keyboard trace.
- Release valve: a pre-existing defect that is not on this plan's list, not in a family one of its guards covers, and not introduced or worsened by the diff is recorded as a DECISIONS.md follow-up, never a blocking finding.
- Review standard: a blocking finding names a broken contract item — a mustNotChange line, an applicable AGENTS.md rule within scope, an acceptance check, a listed fix missing or wrong, or a regression this diff introduced. The look spec is judged on global.css, the shared ui.tsx primitives and the sites this plan names; taste and per-site polish beyond that are the owner's manual check.
- The release valve applies to pre-existing out-of-scope rule violations too; it cannot excuse a listed fix, in-scope family failure, or introduced/worsened regression. Report reproducible failures together per review, distinguishing blockers from owner taste. Do not reopen an accepted implementation choice without new evidence.
- Desired rule (not yet truth): Screens reflow at phone width, expose named controls and clear heading structure, and provide usable touch targets under the stated UI convention and exceptions; the route sweep protects these outcomes.

## Definition of done

- **ac-1** — tests/ui-conformance.browser.test.ts, WebKit and Chromium at 390x844 and Chromium at 1280x900, on a committed mixed-language fixture (a Farsi-named and an English-named instrument holding titles in the other language, and a Farsi title followed by digits). Routes: Today (session and Overview), Repertoire's three views, Start, Active, Close, Plan, Routine new and a runner, Lessons, New item, an item, a pathway, a stage, Study sources, Musical terms, Insights, Teacher report, More, Settings. On every route: no unintended horizontal scrolling or clipped content in page/main/content containers, including the Insights table (native editable text scrolling and intentional clipping of decorative content are not failures); every visible control has an accessible name; exactly one h1; shared layout primitives retain their intended row/stack geometry, including link-card combinations; at 390 the 44px floor holds (stars and in-text links excepted); no page error. It collects every failure before asserting, so one run names the whole inventory; red on base for B1 and B11-B13. Use the existing browser harness and deterministic readiness; share setup where safe, but reset state when a journey mutates it. Do not prescribe timeout/runtime budgets or detect accessible names solely from aria-label. Exercise representative disclosures and editable states, not just initial route loads. Existing named regression journeys may supply coverage rather than duplicating it. → proven by `every route reflows, names its controls and meets the touch floor`
- **ac-2** — Same fixture, both engines at 390, positions measured rather than attributes read: Today's due caption reads 'due' before its day; the 'Then, if you have time' reason and the Overview 'next:' line show their first word; Repertoire's 'gusheh:' precedes its value; a Farsi stage title and its intro share the right edge while an English one stays left; ItemDetail's 'Study source:' keeps its gap on the value's side; an Insights body and a Teacher report preview line holding a Farsi title followed by digits keep their English words in order; QuickAdd's Farsi instrument name computes rtl. → proven by `mismatched languages keep their own direction on every fixed surface`
- **ac-3** — Extend src/components/direction.test.ts for the B6 structural families: data-title anchors, generated words with owner values, label separators and instrument names across files. Discover candidate sites and report all failures together; define the supported source shapes and reasoned exclusions. Prove representative seeded regressions fail for each added shape, supplemented by ac-2 browser geometry. No universal JSX analyser or parser rewrite is required; false positives are not product defects. Reuse the existing direction ledgers and do not hide unfixed in-scope sites. → proven by `owner text and generated words keep their own direction`
- **ac-4** — src/domain/insights.test.ts on fixtures with Farsi and English titles followed by digits, windows 7 and 30: every interpolated owner value is isolated without changing its content or double wrapping an already isolated value; no title embeds a value; window wording follows windowDays (30 never says 'this week'); each insight's scope matches its data; expected wording independently encodes the approved B4 and title changes; other wording and stored values remain unchanged. → proven by `insights isolate owner text and say which window they describe`
- **ac-5** — src/domain/report.test.ts over buildTeacherReport and renderClassQuestionsText: every interpolated owner value (instrument name, titles, questions, answers, observations) is isolated without content loss or double wrapping; removing only newly added wrapper marks yields the base output byte for byte, against expected text committed before the change; a Farsi title followed by digits is among the fixtures. → proven by `exported class text isolates every owner value and keeps its wording`
- **ac-6** — src/domain/repertoire.test.ts, the shared parent refusal: itself, one of its own parts, a part as parent, an item on another instrument, and a work that has parts becoming a part are each refused with a reason, while a top-level item on the same instrument is accepted; ItemForm's options use it, and through the real store (idb mocked as in practiceCue.test.ts) updateItem refuses a self-parent while saving a valid parent. Cover missing parent, creation as well as update, instrument changes on either side of a parent/part relationship, clearing the link, and an unrelated edit to a legacy-invalid record. Refusal leaves the database and revision unchanged; valid changes save. No inbound-read refusal is added. → proven by `a parent is refused for itself, its parts or a work with parts, and kept otherwise`
- **ac-7** — src/components/itemFormValues.test.ts: Persian to Guitar, Guitar to Persian, the same family and an unchanged instrument: only the identity fields the new family cannot show are dropped; every other value is kept. → proven by `switching instrument family drops identity fields the new family cannot show`
- **ac-8** — Browser, Settings at 390, both engines: renaming an instrument to '  Tar 2  ' commits on blur and survives a reload as 'Tar 2'; clearing the name is refused with a visible reason and the saved name is still there after a reload. Exercise the store refusal directly as well as UI commit; no partial rename or unrelated field change on refusal, and Enter followed by blur does not apply the rename twice. → proven by `an instrument rename saves trimmed on commit and an empty name is refused`
- **ac-9** — Browser, Settings at 390, both engines: each section is an h2; no control sits inside a closed disclosure except those ArchiveRefresh and SetarSetupReview already have; the priority formula is visible with live values; reference prose is collapsed and sections/controls remain discoverable by headings and keyboard; the Device copy no longer says the newest copy wins. → proven by `Settings keeps every control in reach under headed sections`
- **ac-10** — tests/post-practice.browser.test.ts, both engines at 390: choose a result, type an observation and a next action, open the review controls and tap 'Why this date?': the explanation shows on /close with the live first gap, the typed text and the result are still there, and Save writes them. Other close inputs, including duration correction, manual review choice, item edits and teacher question, remain intact; shared explanation values follow Settings without changing the decision. → proven by `why this date explains in place and keeps the close draft`
- **ac-11** — Browser test with a controlled clock and real UI: cross local midnight while Lessons, Repertoire and StageDetail remain mounted; relative dates, upcoming lessons and lesson preparation eligibility refresh through the existing ticking clock. Include imported future-dated lesson history so it does not become an upcoming class. Use explicit expected states, not a source ban on new Date or a frozen-time sleep. Inventory the known consumers; source checks may supplement, not substitute for this behaviour. → proven by `date-dependent screens refresh across midnight without remounting`
- **ac-12** — Existing src/styles/contrast.test.ts remains green for its listed pair-specific thresholds in all palette blocks; separately compare existing colour token values with the baseline, since contrast alone does not prove the palette is unchanged. New pairings, if any, join the existing coverage. → proven by `every listed colour pair meets WCAG AA in every block where its tokens are declared`
- **ac-13** — Regression guard (existing, tests/repertoire-viewport.browser.test.ts): Today's order and the recommendation above the fold at 390x844 survive the taller controls; Repertoire stays reflowed, named and keyboard-reachable. → proven by `the shared practice shell remains accessible and readable across layouts`
- **ac-14** — Owner on the candidate build, installed iPhone PWA AND Safari: repeat keyboard open/dismiss with focus retained on Close, notes and a lesson question; verify tabs return and remain reachable, with main scroll usable. Include route change, rotation, background/resume and pinch zoom, checking after dismissal at normal scale; record device, OS, build and outcome, without claiming browser fixtures prove native behaviour. On MacBook and iPhone in light/dark, review the small before/after packet against the look spec and paste a mixed-language report into Messages. Owner taste adjustments within the spec are a passing refinement, not a new reviewer family. Actual regressions remain blockers. → proven by `manual:OWNER`
- **ac-15** — Browser through real controls: fill close inputs, Back, practise further, Finish; retain result/text/manual choices/item edits/question, refresh an untouched duration proposal and preserve a corrected duration. Save creates one block with the retained values and the displayed current review decision. Repeat with discard and a new session on the SAME item, verifying no draft leakage. Include a day/settings change while away so derived dates refresh rather than restoring stale calculations; old session completion cannot clear or overwrite a newer draft. → proven by `close draft survives Back for the same block and never leaks to another session`
- **ac-16** — Reuse the exact existing tests/repertoire-viewport.browser.test.ts test and src/components/viewport.test.ts fixtures unchanged in the required check. Preserve standalone height, safe areas, main-only scrolling and diagnostic trace. This guards the scripted mechanism; native keyboard acceptance remains manual:OWNER. → proven by `viewport recovery respects focus zoom and scroll ownership`
- **ac-17** — A focused test under tests/ verifies both AGENTS.md and the recursive CLAUDE.md import profile leave at least 4096 bytes under 32768 after additions, reusing the existing counting semantics. Keep existing agent-context budget, prohibition and path tests unchanged and green. Review the short baseline-to-final disposition of condensed sections for semantic preservation; passing phrase checks alone is not sufficient. → proven by `UI refresh leaves instruction headroom without losing current prohibitions`

## Docs to update as part of this change

- AGENTS.md
- DECISIONS.md
- README.md

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

