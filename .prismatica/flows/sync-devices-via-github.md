---
id: sync-devices-via-github
createdAt: 2026-08-26T22:58:34.899Z
status: works
presentation:
  title: Keep the MacBook and iPhone in step
  journey: Your data
  order: 11
truth:
  goal: Practise on either device and have both hold the same data, without a
    server or an account.
  startsWhen: In Settings → Sync the musician enters a private GitHub repo they
    own and a fine-grained token, and taps 'Connect & sync'.
  needs:
    - A private GitHub repo dedicated to this app's data
    - A fine-grained token with Contents read/write on that repo
  steps:
    - actor: The musician
      action: Enters owner/name and a token scoped to that one repo with Contents
        read/write.
      shows: The connection state, with the token kept in this browser only — never in
        backups or synced data.
      changes: The configuration is written to this device's local storage.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:20:30.734Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: Practice Compass
      action: Builds a whole snapshot of the device's data and files, hashes it, and
        compares it three ways against the repo and the last synced hash.
      shows: "Plain status: in sync, pushed, pulled, or a conflict — with the device
        name, last sync time and short content hash."
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:20:30.734Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: Practice Compass
      action: Publishes the snapshot atomically when this device is ahead — blobs,
        then tree, then commit, then a fast-forward-only reference update.
      shows: A brand-new empty repo is bootstrapped first; a failed bootstrap says so
        and leaves no partial snapshot.
      changes: One commit holds the manifest, the state and the attachments; a race is
        reported as a conflict rather than overwriting anyone.
      assumes:
        - The device is online and the token is valid for that repo
      evidence:
        method: manual
        at: 2026-08-31T16:20:30.734Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: Practice Compass
      action: Archives the current copy on this device before applying an incoming
        snapshot.
      changes: Local data is replaced only after everything has been fetched and
        validated.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:20:30.734Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: The musician
      action: Chooses a side when both copies changed.
      shows: A two-button choice; which side is newer is shown only as a hint, never
        applied automatically.
      changes: Keeping this device pushes with the GitHub copy as the parent commit,
        so it stays in history; taking the GitHub copy archives this device's
        copy both in the app and on an archive branch first.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:20:30.734Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: Practice Compass
      action: Syncs again on its own when the app opens, 30 quiet seconds after
        changes, and when the device comes back online.
      shows: Unconfigured or offline, every trigger is simply a no-op.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:20:30.734Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
  endsWith: Both devices hold the same practice data, every replacement was
    explicit, and no copy was ever destroyed.
  variations:
    - name: Restore the archived copy
      differs: The pre-sync archive kept on the device can be restored from Settings
        after an unwanted pull.
      status: works
    - name: Legacy remote
      differs: An older state.json + files/ remote still pulls losslessly; the next
        push migrates the format, keeping the old snapshot in git history.
      status: works
    - name: Sync off
      differs: Without sync the app is fully usable offline and data moves by manual
        export and import.
      status: works
  rules:
    - Decisions compare content hashes, never timestamps — newest never silently
      wins.
    - Both copies are preserved before anything is replaced.
    - The token lives only in this browser's local storage.
    - No backend, no auth server, no paid service.
  involves:
    - The musician
    - The user's own GitHub repo
    - Two devices
mechanics:
  touchpoints:
    - src/store/syncEngine.ts
    - src/store/githubSync.ts
    - src/store/gitRemote.ts
    - src/domain/sync.ts
    - src/domain/canonical.ts
    - src/store/revision.ts
    - src/pages/Settings.tsx
    - src/App.tsx
  routes:
    - /settings
  components:
    - Settings
    - App
  entities:
    - PracticeDB
    - AttachmentMeta
    - SyncConfig
  tests:
    - file: src/domain/sync.test.ts
      steps:
        - 2
        - 5
    - file: src/store/syncEngine.test.ts
      steps:
        - 3
        - 4
        - 5
    - file: src/store/revision.test.ts
      steps:
        - 2
approval:
  hash: 1daeee8d1caa83a783184683bf72e73009118fe586b674a184f098d351510b5d
  at: 2026-08-28T13:30:18.104Z
  by: Ethan
  signature: o5PmNSQu5bvxj36Xu6g5/v8lMeuTf9irDMTiJs3LzAEbLnyhkmc87M3J5dxmt2OG1yRA+v3CTjOae6j/DdqtDQ==
  publicKey: |
    -----BEGIN PUBLIC KEY-----
    MCowBQYDK2VwAyEAxxaiErDKWXw9qQrVISVCyYQrsfvEEbOKmcLKt92Rkro=
    -----END PUBLIC KEY-----
---

# Keep the MacBook and iPhone in step

_Works now · approved 2026-08-28T13:30:18.104Z by Ethan (signed)_

## Goal

Practise on either device and have both hold the same data, without a server or an account.

## Starts when

In Settings → Sync the musician enters a private GitHub repo they own and a fine-grained token, and taps 'Connect & sync'.

## Needs first

- A private GitHub repo dedicated to this app's data
- A fine-grained token with Contents read/write on that repo

## Steps

1. **The musician** Enters owner/name and a token scoped to that one repo with Contents read/write.
   - Shows: The connection state, with the token kept in this browser only — never in backups or synced data.
   - Changes: The configuration is written to this device's local storage.

2. **Practice Compass** Builds a whole snapshot of the device's data and files, hashes it, and compares it three ways against the repo and the last synced hash.
   - Shows: Plain status: in sync, pushed, pulled, or a conflict — with the device name, last sync time and short content hash.

3. **Practice Compass** Publishes the snapshot atomically when this device is ahead — blobs, then tree, then commit, then a fast-forward-only reference update.
   - Shows: A brand-new empty repo is bootstrapped first; a failed bootstrap says so and leaves no partial snapshot.
   - Changes: One commit holds the manifest, the state and the attachments; a race is reported as a conflict rather than overwriting anyone.
   - Only if: The device is online and the token is valid for that repo

4. **Practice Compass** Archives the current copy on this device before applying an incoming snapshot.
   - Changes: Local data is replaced only after everything has been fetched and validated.

5. **The musician** Chooses a side when both copies changed.
   - Shows: A two-button choice; which side is newer is shown only as a hint, never applied automatically.
   - Changes: Keeping this device pushes with the GitHub copy as the parent commit, so it stays in history; taking the GitHub copy archives this device's copy both in the app and on an archive branch first.

6. **Practice Compass** Syncs again on its own when the app opens, 30 quiet seconds after changes, and when the device comes back online.
   - Shows: Unconfigured or offline, every trigger is simply a no-op.

## Ends with

Both devices hold the same practice data, every replacement was explicit, and no copy was ever destroyed.

## Variations

- **Restore the archived copy** — The pre-sync archive kept on the device can be restored from Settings after an unwanted pull. _(Works now)_
- **Legacy remote** — An older state.json + files/ remote still pulls losslessly; the next push migrates the format, keeping the old snapshot in git history. _(Works now)_
- **Sync off** — Without sync the app is fully usable offline and data moves by manual export and import. _(Works now)_

## Rules

- Decisions compare content hashes, never timestamps — newest never silently wins.
- Both copies are preserved before anything is replaced.
- The token lives only in this browser's local storage.
- No backend, no auth server, no paid service.

## Involves

- The musician
- The user's own GitHub repo
- Two devices
