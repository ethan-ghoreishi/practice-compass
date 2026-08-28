---
contractId: 20260828-every-inbound-database-runs-the-same-mig-ee35
at: 2026-08-28T16:57:13.883Z
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
    reason: "Mapped implementation touched: touchpoint(s) src/domain/io.ts,
      src/store/useStore.ts matched changed file(s) src/domain/io.ts,
      src/store/useStore.ts. Derived from the diff alone — this says nothing
      about whether any test ran or whether behaviour changed."
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
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/store/useStore.ts
      matched changed file(s) src/store/useStore.ts. Derived from the diff alone
      — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
  - flowId: run-a-session-plan
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/store/useStore.ts
      matched changed file(s) src/store/useStore.ts. Derived from the diff alone
      — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
  - flowId: see-practice-patterns
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/domain/io.ts matched
      changed file(s) src/domain/io.ts. Derived from the diff alone — this says
      nothing about whether any test ran or whether behaviour changed."
    steps: []
    reverify: []
  - flowId: work-a-pathway-stage
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/store/useStore.ts
      matched changed file(s) src/store/useStore.ts. Derived from the diff alone
      — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
  - flowId: sync-devices-via-github
    status: mechanics-updated
    reason: Every device that lands here (archive restore, conflict keep-remote,
      pull) already routed through importFullBackup -> useStore's importDB,
      which this change rewires from 'validateDB then stamp
      schemaVersion=SCHEMA_VERSION' to 'validateDB, which now migrates on the
      source shape via the shared migrateToCurrent chain before normalising'.
      The mechanism changed; the described behaviour (same data in, same data
      out; archive-before-replace; explicit conflict choice) is unchanged and is
      exactly what the contract's acceptance checks and non-goals require.
    steps:
      - 4
      - 5
    reverify: []
  - flowId: browse-my-repertoire
    status: unchanged
    reason: This change only touches how an inbound database's schema version is
      migrated (src/domain/migrations.ts, io.ts) and the store's
      import/rehydration wiring (useStore.ts). It does not touch PracticeItem
      scoring, grouping, or repertoire-view logic, so browsing repertoire is
      unaffected; the shared 'PracticeItem' entity is incidental.
    steps: []
    reverify: []
  - flowId: install-the-app-and-keep-it-current
    status: unchanged
    reason: This change touches only the migration chain and the store's persist
      migrate/merge/importDB wiring; it does not touch the Settings route, PWA
      install/update banner, or service-worker logic. The shared '/settings'
      route is incidental.
    steps: []
    reverify: []
  - flowId: point-this-device-at-the-nas
    status: unchanged
    reason: This change touches only database migration/import; it does not touch
      NAS base URL configuration or recording resolution. The shared '/settings'
      route is incidental.
    steps: []
    reverify: []
  - flowId: prepare-for-the-next-class
    status: unchanged
    reason: This change touches only database migration/import; it does not touch
      lesson urgency scoring or questionsForNextClass. The shared 'PracticeItem'
      entity is incidental.
    steps: []
    reverify: []
---

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/io.ts, src/store/useStore.ts matched changed file(s) src/domain/io.ts, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## clear-a-due-review — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## log-a-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## practise-todays-recommendation — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## run-a-session-plan — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## see-practice-patterns — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/io.ts matched changed file(s) src/domain/io.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## work-a-pathway-stage — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## sync-devices-via-github — mechanics-updated

Every device that lands here (archive restore, conflict keep-remote, pull) already routed through importFullBackup -> useStore's importDB, which this change rewires from 'validateDB then stamp schemaVersion=SCHEMA_VERSION' to 'validateDB, which now migrates on the source shape via the shared migrateToCurrent chain before normalising'. The mechanism changed; the described behaviour (same data in, same data out; archive-before-replace; explicit conflict choice) is unchanged and is exactly what the contract's acceptance checks and non-goals require.

Steps: 4, 5

## browse-my-repertoire — unchanged

This change only touches how an inbound database's schema version is migrated (src/domain/migrations.ts, io.ts) and the store's import/rehydration wiring (useStore.ts). It does not touch PracticeItem scoring, grouping, or repertoire-view logic, so browsing repertoire is unaffected; the shared 'PracticeItem' entity is incidental.

## install-the-app-and-keep-it-current — unchanged

This change touches only the migration chain and the store's persist migrate/merge/importDB wiring; it does not touch the Settings route, PWA install/update banner, or service-worker logic. The shared '/settings' route is incidental.

## point-this-device-at-the-nas — unchanged

This change touches only database migration/import; it does not touch NAS base URL configuration or recording resolution. The shared '/settings' route is incidental.

## prepare-for-the-next-class — unchanged

This change touches only database migration/import; it does not touch lesson urgency scoring or questionsForNextClass. The shared 'PracticeItem' entity is incidental.

