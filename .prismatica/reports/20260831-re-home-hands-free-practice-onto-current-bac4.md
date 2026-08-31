---
contractId: 20260831-re-home-hands-free-practice-onto-current-bac4
at: 2026-08-31T20:42:12.968Z
by: agent
none: false
entries:
  - flowId: browse-my-repertoire
    status: unchanged
    reason: --none
    steps: []
    reverify: []
  - flowId: install-the-app-and-keep-it-current
    status: unchanged
    reason: --none
    steps: []
    reverify: []
  - flowId: point-this-device-at-the-nas
    status: unchanged
    reason: --none
    steps: []
    reverify: []
  - flowId: prepare-for-the-next-class
    status: unchanged
    reason: --none
    steps: []
    reverify: []
  - flowId: see-practice-patterns
    status: unchanged
    reason: --none
    steps: []
    reverify: []
  - flowId: sync-devices-via-github
    status: unchanged
    reason: --none
    steps: []
    reverify: []
  - flowId: adjust-how-scheduling-works
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/store/useStore.ts
      matched changed file(s) src/store/useStore.ts. Derived from the diff alone
      — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
  - flowId: back-up-and-restore
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/store/useStore.ts
      matched changed file(s) src/store/useStore.ts. Derived from the diff alone
      — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
  - flowId: capture-a-practice-item
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/store/useStore.ts
      matched changed file(s) src/store/useStore.ts. Derived from the diff alone
      — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
  - flowId: clear-a-due-review
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/store/useStore.ts
      matched changed file(s) src/store/useStore.ts. Derived from the diff alone
      — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
  - flowId: log-a-class
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/store/useStore.ts
      matched changed file(s) src/store/useStore.ts. Derived from the diff alone
      — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
  - flowId: practise-todays-recommendation
    status: truth-proposed
    reason: "Proposed new truth in
      .prismatica/flows/proposals/practise-todays-recommendation.md: step 4 now
      describes the Screen Wake Lock and the durable target-reached/overtime
      state this lane added to ActiveBlock, plus a new 'Target reached'
      variation. This is a proposal only — no manual reverification of the
      flow's other steps was performed in this lane; the owner reviews and runs
      flow approve."
    steps: []
    reverify: []
  - flowId: work-a-pathway-stage
    status: truth-proposed
    reason: "Proposed new truth in
      .prismatica/flows/proposals/work-a-pathway-stage.md: the 'Guided routine'
      variation now describes the Screen Wake Lock and segment-arrival cue this
      lane added to RoutineRunner, and corrects the stale 'explicitly not logged
      as practice' sentence (a bound segment already creates an honest
      PracticeBlock; result:'not_logged' is a review/SM-2 flag, not an absence
      of a logged block) per the sealed review's
      stale-flow-wording-not-corrected finding. This is a proposal only — no
      manual reverification of the flow's other steps was performed in this
      lane; the owner reviews and runs flow approve."
    steps: []
    reverify: []
  - flowId: run-a-session-plan
    status: truth-proposed
    reason: "Proposed new truth in
      .prismatica/flows/proposals/run-a-session-plan.md: step 4 now notes that a
      Session Plan segment opens the same ActiveBlock screen this lane changed,
      so the Screen Wake Lock and durable target-reached/overtime state apply
      identically there. This is a proposal only — no manual reverification of
      the flow's other steps was performed in this lane; the owner reviews and
      runs flow approve."
    steps: []
    reverify: []
---

## browse-my-repertoire — unchanged

--none

## install-the-app-and-keep-it-current — unchanged

--none

## point-this-device-at-the-nas — unchanged

--none

## prepare-for-the-next-class — unchanged

--none

## see-practice-patterns — unchanged

--none

## sync-devices-via-github — unchanged

--none

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## clear-a-due-review — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## log-a-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## practise-todays-recommendation — truth-proposed

Proposed new truth in .prismatica/flows/proposals/practise-todays-recommendation.md: step 4 now describes the Screen Wake Lock and the durable target-reached/overtime state this lane added to ActiveBlock, plus a new 'Target reached' variation. This is a proposal only — no manual reverification of the flow's other steps was performed in this lane; the owner reviews and runs flow approve.

## work-a-pathway-stage — truth-proposed

Proposed new truth in .prismatica/flows/proposals/work-a-pathway-stage.md: the 'Guided routine' variation now describes the Screen Wake Lock and segment-arrival cue this lane added to RoutineRunner, and corrects the stale 'explicitly not logged as practice' sentence (a bound segment already creates an honest PracticeBlock; result:'not_logged' is a review/SM-2 flag, not an absence of a logged block) per the sealed review's stale-flow-wording-not-corrected finding. This is a proposal only — no manual reverification of the flow's other steps was performed in this lane; the owner reviews and runs flow approve.

## run-a-session-plan — truth-proposed

Proposed new truth in .prismatica/flows/proposals/run-a-session-plan.md: step 4 now notes that a Session Plan segment opens the same ActiveBlock screen this lane changed, so the Screen Wake Lock and durable target-reached/overtime state apply identically there. This is a proposal only — no manual reverification of the flow's other steps was performed in this lane; the owner reviews and runs flow approve.

