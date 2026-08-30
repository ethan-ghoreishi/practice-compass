---
contractId: 20260830-hands-free-practice-the-screen-stays-awa-65dd
at: 2026-08-30T13:03:08.528Z
by: agent
none: false
entries:
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
  - flowId: browse-my-repertoire
    status: unchanged
    reason: This lane only adds an ephemeral signalledThrough marker to
      ActiveSession/ActiveRoutine in useStore.ts (never PracticeDB) and the
      wake-lock/announcement glue on ActiveBlock/RoutineRunner. PracticeItem's
      own shape, fields and repertoire grouping are untouched — the shared
      entity is coincidental to useStore.ts being a single large file.
    steps: []
    reverify: []
  - flowId: install-the-app-and-keep-it-current
    status: unchanged
    reason: This lane adds no PWA manifest, service-worker, or install-prompt
      changes (explicitly excluded). The shared /settings route is coincidental
      to useStore.ts being a single large file; no Settings UI or update-banner
      behaviour changed.
    steps: []
    reverify: []
  - flowId: point-this-device-at-the-nas
    status: unchanged
    reason: No NAS base URL, recordings, or Settings NAS UI code was touched. The
      shared /settings route is coincidental to useStore.ts being a single large
      file.
    steps: []
    reverify: []
  - flowId: prepare-for-the-next-class
    status: unchanged
    reason: No lesson, teacherQuestion, or assignedForLesson logic was touched. The
      shared PracticeItem entity is coincidental to useStore.ts being a single
      large file — this lane's only PracticeItem-adjacent change is an
      ephemeral, never-persisted-to-PracticeDB signal marker on the active
      session/routine, unrelated to lesson prep.
    steps: []
    reverify: []
  - flowId: see-practice-patterns
    status: unchanged
    reason: No insights/report aggregation code was touched. The shared PracticeItem
      entity is coincidental to useStore.ts being a single large file.
    steps: []
    reverify: []
  - flowId: sync-devices-via-github
    status: unchanged
    reason: No sync engine, GitHub transport, or Settings sync UI code was touched.
      The shared /settings route is coincidental to useStore.ts being a single
      large file; the new signalledThrough marker lives only on ephemeral
      active/activeRoutine state, which was never synced before and still is
      not.
    steps: []
    reverify: []
  - flowId: work-a-pathway-stage
    status: truth-proposed
    reason: RoutineRunner now holds a screen wake lock and visibly announces a
      segment boundary instead of swapping silently; filed as an update proposal
      (.prismatica/flows/proposals/work-a-pathway-stage.md) that also corrects
      the stale 'not logged as practice' wording in the Guided routine
      variation.
    steps: []
    reverify: []
  - flowId: run-a-session-plan
    status: truth-proposed
    reason: Session Plan segments run as ordinary blocks on /active, which now gain
      the same wake-lock and target-reached announcement as an unplanned block;
      filed as an update proposal
      (.prismatica/flows/proposals/run-a-session-plan.md) updating step 4's
      description.
    steps: []
    reverify: []
  - flowId: practise-todays-recommendation
    status: truth-proposed
    reason: Step 4 now states the screen wake lock and target-reached/overtime
      announcement, carrying the already-approved Delta's wording into the
      flow's own truth via an update proposal
      (.prismatica/flows/proposals/practise-todays-recommendation.md).
    steps: []
    reverify: []
---

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

## browse-my-repertoire — unchanged

This lane only adds an ephemeral signalledThrough marker to ActiveSession/ActiveRoutine in useStore.ts (never PracticeDB) and the wake-lock/announcement glue on ActiveBlock/RoutineRunner. PracticeItem's own shape, fields and repertoire grouping are untouched — the shared entity is coincidental to useStore.ts being a single large file.

## install-the-app-and-keep-it-current — unchanged

This lane adds no PWA manifest, service-worker, or install-prompt changes (explicitly excluded). The shared /settings route is coincidental to useStore.ts being a single large file; no Settings UI or update-banner behaviour changed.

## point-this-device-at-the-nas — unchanged

No NAS base URL, recordings, or Settings NAS UI code was touched. The shared /settings route is coincidental to useStore.ts being a single large file.

## prepare-for-the-next-class — unchanged

No lesson, teacherQuestion, or assignedForLesson logic was touched. The shared PracticeItem entity is coincidental to useStore.ts being a single large file — this lane's only PracticeItem-adjacent change is an ephemeral, never-persisted-to-PracticeDB signal marker on the active session/routine, unrelated to lesson prep.

## see-practice-patterns — unchanged

No insights/report aggregation code was touched. The shared PracticeItem entity is coincidental to useStore.ts being a single large file.

## sync-devices-via-github — unchanged

No sync engine, GitHub transport, or Settings sync UI code was touched. The shared /settings route is coincidental to useStore.ts being a single large file; the new signalledThrough marker lives only on ephemeral active/activeRoutine state, which was never synced before and still is not.

## work-a-pathway-stage — truth-proposed

RoutineRunner now holds a screen wake lock and visibly announces a segment boundary instead of swapping silently; filed as an update proposal (.prismatica/flows/proposals/work-a-pathway-stage.md) that also corrects the stale 'not logged as practice' wording in the Guided routine variation.

## run-a-session-plan — truth-proposed

Session Plan segments run as ordinary blocks on /active, which now gain the same wake-lock and target-reached announcement as an unplanned block; filed as an update proposal (.prismatica/flows/proposals/run-a-session-plan.md) updating step 4's description.

## practise-todays-recommendation — truth-proposed

Step 4 now states the screen wake lock and target-reached/overtime announcement, carrying the already-approved Delta's wording into the flow's own truth via an update proposal (.prismatica/flows/proposals/practise-todays-recommendation.md).

