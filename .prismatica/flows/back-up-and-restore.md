---
id: back-up-and-restore
createdAt: 2026-08-26T22:58:34.899Z
status: works
presentation:
  title: Back up and restore everything
  journey: Your data
  order: 12
truth:
  goal: Keep an independent copy of all practice data and files, and put it back
    on any device.
  startsWhen: In Settings → Data & backup the musician taps 'Export backup'.
  needs: []
  steps:
    - actor: The musician
      action: Taps 'Export backup'.
      shows: A single downloaded file named for this device and today's date, and
        'Backup exported (data + files)'.
      changes: One JSON file holding the whole database plus every attachment, stamped
        with the device name and the latest change; the export time is
        remembered locally.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:20:36.906Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: The musician
      action: Saves it wherever they keep backups — NAS, iCloud, anywhere.
      shows: Settings shows the last export from this device and the latest change
        made here.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:20:36.906Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: The musician
      action: Taps 'Import backup' on any device and picks a file.
      shows: A confirmation naming the device the backup came from — and an explicit
        warning if the backup is older than what is on this device.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:20:36.906Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: Practice Compass
      action: Decodes every attachment before touching anything.
      shows: A corrupt file aborts the whole import with a clear message and nothing
        changed.
      changes: Only once everything decodes do the files get replaced in one
        transaction, and only then the data — attachment records can never end
        up pointing at missing files.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:20:36.906Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: Practice Compass
      action: Leaves existing files alone when the file has no attachments section at
        all.
      changes: A state-only export is never mistaken for 'zero attachments' and never
        wipes the device's files.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:20:36.906Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
  endsWith: There is an independent full copy of everything, and restoring it is a
    single, clearly-confirmed step.
  variations:
    - name: Older backup
      differs: Importing a backup older than the local data requires confirming a
        spelled-out warning that shows both dates.
      status: works
    - name: Legacy backups
      differs: Older exports import unchanged; legacy attachment records are
        normalised to the current shape on the way in.
      status: works
    - name: Start over
      differs: "'Reset demo data' and 'Clear all data' both replace everything and
        both ask first."
      status: works
  rules:
    - The NAS backup is the user's own independent copy — sync history is never
      treated as the only backup.
    - Nothing is replaced without an explicit confirmation.
    - Large videos never enter a backup.
  involves:
    - The musician
    - The NAS or other storage
mechanics:
  touchpoints:
    - src/store/backup.ts
    - src/store/idb.ts
    - src/domain/io.ts
    - src/pages/Settings.tsx
    - src/store/useStore.ts
  routes:
    - /settings
  components:
    - Settings
  entities:
    - PracticeDB
    - AttachmentMeta
  tests:
    - file: src/domain/io.test.ts
      steps:
        - 4
approval:
  hash: 0ec576d7c25b79efb580481021a0d46b3870781626f4bf4bcae0a10eaeca4e59
  at: 2026-08-28T13:30:17.770Z
  by: Ethan
  signature: v9CYA6GLvA3Fs7UgXqxZynSZ26iXco+X7CqBAksat2I5IC/86hdAUoCX1j9ygHpO0zeZxgj6y9/a/r7hWHJ9AA==
  publicKey: |
    -----BEGIN PUBLIC KEY-----
    MCowBQYDK2VwAyEAxxaiErDKWXw9qQrVISVCyYQrsfvEEbOKmcLKt92Rkro=
    -----END PUBLIC KEY-----
---

# Back up and restore everything

_Works now · approved 2026-08-28T13:30:17.770Z by Ethan (signed)_

## Goal

Keep an independent copy of all practice data and files, and put it back on any device.

## Starts when

In Settings → Data & backup the musician taps 'Export backup'.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Taps 'Export backup'.
   - Shows: A single downloaded file named for this device and today's date, and 'Backup exported (data + files)'.
   - Changes: One JSON file holding the whole database plus every attachment, stamped with the device name and the latest change; the export time is remembered locally.

2. **The musician** Saves it wherever they keep backups — NAS, iCloud, anywhere.
   - Shows: Settings shows the last export from this device and the latest change made here.

3. **The musician** Taps 'Import backup' on any device and picks a file.
   - Shows: A confirmation naming the device the backup came from — and an explicit warning if the backup is older than what is on this device.

4. **Practice Compass** Decodes every attachment before touching anything.
   - Shows: A corrupt file aborts the whole import with a clear message and nothing changed.
   - Changes: Only once everything decodes do the files get replaced in one transaction, and only then the data — attachment records can never end up pointing at missing files.

5. **Practice Compass** Leaves existing files alone when the file has no attachments section at all.
   - Changes: A state-only export is never mistaken for 'zero attachments' and never wipes the device's files.

## Ends with

There is an independent full copy of everything, and restoring it is a single, clearly-confirmed step.

## Variations

- **Older backup** — Importing a backup older than the local data requires confirming a spelled-out warning that shows both dates. _(Works now)_
- **Legacy backups** — Older exports import unchanged; legacy attachment records are normalised to the current shape on the way in. _(Works now)_
- **Start over** — 'Reset demo data' and 'Clear all data' both replace everything and both ask first. _(Works now)_

## Rules

- The NAS backup is the user's own independent copy — sync history is never treated as the only backup.
- Nothing is replaced without an explicit confirmation.
- Large videos never enter a backup.

## Involves

- The musician
- The NAS or other storage
