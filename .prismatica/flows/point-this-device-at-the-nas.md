---
id: point-this-device-at-the-nas
createdAt: 2026-08-28T13:27:39.539Z
status: works
presentation:
  title: Point this device at the NAS
  journey: Your data
  order: 13
truth:
  goal: Give this device the address that turns a class recording or score link
    into a file it can actually open — without any of those files entering the
    app.
  startsWhen: In Settings → NAS recordings the musician sets the base URL that
    serves their recordings folder.
  needs:
    - The recordings folder is served over the network from the NAS and is
      reachable from this device at some web address
  steps:
    - actor: The musician
      action: Types the address that serves the recordings folder.
      shows: "'Resolves to: …/…' once it is valid, or 'That doesn’t look like a valid
        web address' if it is not; a host typed without a scheme is completed to
        https:// when the field loses focus."
      changes: "The address is stored in this device's local storage. It is
        environment configuration, not practice data and not a secret: it never
        enters the database, a backup or a sync snapshot."
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:20:44.139Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: The musician
      action: Taps 'Test link' to open a known recording and confirm the address works.
      shows: The file opens in a new tab, or the app says the base URL isn’t valid and
        opens nothing.
      changes: Nothing is stored or downloaded — the app fetches a recording only when
        someone explicitly opens it.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:20:44.139Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: Practice Compass
      action: Resolves every relative recording and score path in every lesson against
        this address from then on.
      shows: "'Open' beside each link; with no address it reads 'Set your NAS base URL
        in Settings to open this' and stays disabled — never a broken or wrong
        link."
      changes: Nothing in the data; resolving is pure and happens on demand.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:20:44.139Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
  endsWith: This device can open class videos and scores on demand, while the app
    itself still holds nothing but links.
  variations:
    - name: Every device sets its own address
      differs: The address is per-device and never syncs, so each device holds
        whatever address reaches the NAS from where it is — a new device simply
        has none until it is given one.
      status: works
    - name: The NAS is not reachable right now
      differs: Opening a link fails in the browser like any unreachable address.
        Nothing in the app changes, no data is lost, and every other flow keeps
        working offline.
      status: works
    - name: Links that need no address
      differs: A recording stored as a complete https address opens with no base URL
        set at all.
      status: works
    - name: A bad address
      differs: An unparseable or non-http(s) address is reported as invalid and
        nothing is opened — it is never silently resolved to an in-app route.
      status: works
  rules:
    - The NAS address is per-device configuration — never synced, never in a
      backup, never a password.
    - The app stores links to recordings and scores, never their bytes.
    - An unusable address is reported, never resolved to a wrong link.
    - A recording is fetched only when the musician explicitly opens it — never
      at startup.
  involves:
    - The musician
    - The NAS
mechanics:
  touchpoints:
    - src/pages/Settings.tsx
    - src/pages/Lessons.tsx
    - src/domain/recordings.ts
    - src/store/backup.ts
  routes:
    - /settings
    - /lessons
  components:
    - Settings
    - Lessons
  entities:
    - LessonRecording
  tests:
    - file: src/domain/recordings.test.ts
      steps:
        - 1
        - 3
approval:
  hash: cb9001b5d4e576d1bbd3b51d2b1793714c248e451b263c84ea3ca8b3d4fdc655
  at: 2026-08-28T13:30:17.952Z
  by: Ethan
  signature: EoNTnkCCKkzqZEXp+2ArVUWgj2hsVDcS/K3TNMDpTuLzuM2yI/Z4vprjE1SW3CvnJHYfcWfJADoszZtaIXDtBw==
  publicKey: |
    -----BEGIN PUBLIC KEY-----
    MCowBQYDK2VwAyEAxxaiErDKWXw9qQrVISVCyYQrsfvEEbOKmcLKt92Rkro=
    -----END PUBLIC KEY-----
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
