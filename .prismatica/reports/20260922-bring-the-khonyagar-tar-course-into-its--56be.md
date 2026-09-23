---
contractId: 20260922-bring-the-khonyagar-tar-course-into-its--56be
at: 2026-09-23T00:09:41.180Z
by: owner
none: false
entries:
  - flowId: work-a-pathway-stage
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/pages/StageDetail.tsx,
      src/domain/pathwaySeed.ts matched changed file(s)
      src/domain/pathwaySeed.ts, src/pages/StageDetail.tsx. Derived from the
      diff alone — this says nothing about whether any test ran or whether
      behaviour changed."
    steps: []
    reverify: []
    truthHash: 57dc3293be5068d38c9b0f5f06702b222f63e92f850f9f078a9c2efbbe01d874
  - flowId: adjust-how-scheduling-works
    status: unchanged
    reason: scheduling.ts, SchedulingParams and Settings are untouched; Khonyagar
      items arrive status new with no review state, exactly as every catalogue
      item does.
    steps: []
    reverify: []
    truthHash: afa1699c9add3be9b8e2ffd3927383c32b80b5fde17abce91620b3c39edfa74f
  - flowId: capture-a-practice-item
    status: unchanged
    reason: Quick add and the full item form are untouched; the only creation change
      is a catalogue addition titling a multi-section work with its workTitle,
      which is the work-a-pathway-stage flow.
    steps: []
    reverify: []
    truthHash: 54132080907d546ed32720a72d5030b83e16ed5df3b3827b5448c3df3fd035c2
  - flowId: clear-a-due-review
    status: unchanged
    reason: Review completion, Not now and snooze are untouched; nothing here writes
      a block, a result or a review row.
    steps: []
    reverify: []
    truthHash: c27230bdffa873db6ce0efd7a258cd0d87837e1a34ad7cd4c75792bc979552a2
  - flowId: log-a-class
    status: unchanged
    reason: No Lesson record is created and the dated teacher folders are not
      imported; lessons, recordings and the Setar archive are unchanged.
    steps: []
    reverify: []
    truthHash: 5c72d856396414a95ce41b59cea9b33c3feeba7ea4e005b5dc75dce5ee0e9322
  - flowId: practise-todays-recommendation
    status: unchanged
    reason: The recommendation engine and Today are unchanged; Khonyagar items are
      ordinary Tar items scored by the same formula once the owner adds them.
    steps: []
    reverify: []
    truthHash: bc5c4e206274e53121421504716b0da028206611df3238e4d7dcae3d16e04ef0
  - flowId: prepare-for-the-next-class
    status: unchanged
    reason: lessonAgenda and class preparation are untouched; no commitment or
      question is created.
    steps: []
    reverify: []
    truthHash: 79d3ebee5b9e5cf7e13e6d61ac17e1154a9e3a662b882229ef3fd17c120b64dc
  - flowId: run-a-session-plan
    status: unchanged
    reason: plan.ts and SessionPlan.tsx are forbidden and unchanged; the plan builds
      from Khonyagar items exactly as for any instrument, and no copy claims it
      follows the course guide.
    steps: []
    reverify: []
    truthHash: 320d7c620942ce36a5864d5164593de288a9db7489abc20fda3e2e29fa34cec3
  - flowId: see-practice-patterns
    status: unchanged
    reason: Insights and practice totals are unchanged; no block is written by this
      change.
    steps: []
    reverify: []
    truthHash: d1952a7f00f8a54077b28d8a52507c21f54c07712aed4e99bc01e4d17d9c9946
  - flowId: browse-my-repertoire
    status: unchanged
    reason: repertoire.ts, persian.ts and Repertoire.tsx are unchanged. Khonyagar
      items carry no form, dastgāh or composer, so on Tar (Persian-family) the
      existing dastgāh grouping leaves them out of My repertoire until the owner
      curates that metadata by hand. They then group exactly as any curated
      Persian item does. No new mechanics.
    steps: []
    reverify: []
    truthHash: cb9d8394744e5713b7d083e940a3f3756ceac2bcb59990e1782be80083cf8b8c
---

## work-a-pathway-stage — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/StageDetail.tsx, src/domain/pathwaySeed.ts matched changed file(s) src/domain/pathwaySeed.ts, src/pages/StageDetail.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## adjust-how-scheduling-works — unchanged

scheduling.ts, SchedulingParams and Settings are untouched; Khonyagar items arrive status new with no review state, exactly as every catalogue item does.

## capture-a-practice-item — unchanged

Quick add and the full item form are untouched; the only creation change is a catalogue addition titling a multi-section work with its workTitle, which is the work-a-pathway-stage flow.

## clear-a-due-review — unchanged

Review completion, Not now and snooze are untouched; nothing here writes a block, a result or a review row.

## log-a-class — unchanged

No Lesson record is created and the dated teacher folders are not imported; lessons, recordings and the Setar archive are unchanged.

## practise-todays-recommendation — unchanged

The recommendation engine and Today are unchanged; Khonyagar items are ordinary Tar items scored by the same formula once the owner adds them.

## prepare-for-the-next-class — unchanged

lessonAgenda and class preparation are untouched; no commitment or question is created.

## run-a-session-plan — unchanged

plan.ts and SessionPlan.tsx are forbidden and unchanged; the plan builds from Khonyagar items exactly as for any instrument, and no copy claims it follows the course guide.

## see-practice-patterns — unchanged

Insights and practice totals are unchanged; no block is written by this change.

## browse-my-repertoire — unchanged

repertoire.ts, persian.ts and Repertoire.tsx are unchanged. Khonyagar items carry no form, dastgāh or composer, so on Tar (Persian-family) the existing dastgāh grouping leaves them out of My repertoire until the owner curates that metadata by hand. They then group exactly as any curated Persian item does. No new mechanics.

