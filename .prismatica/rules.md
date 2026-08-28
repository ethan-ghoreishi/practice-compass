---
rules:
  - id: r-direction-aware-text
    text: Every free-text field is direction-aware so Farsi and English can be mixed
      anywhere, and built-in Persian data is authored in Farsi behind stable
      ascii identifiers.
    createdAt: 2026-08-26T22:58:34.899Z
  - id: r-explainable-scheduling
    text: Every recommendation and review date comes from deterministic, published
      formulas that carry a one-sentence reason, and the date shown before
      saving is exactly the date saved.
    createdAt: 2026-08-26T22:58:34.899Z
  - id: r-large-files-stay-on-nas
    text: Class videos and score PDFs are stored as references to the user's NAS and
      never enter local storage, sync or backups; in-app attachments are warned
      above 10 MB and refused above 40 MB.
    createdAt: 2026-08-26T22:58:34.899Z
  - id: r-local-first-offline
    text: All practice data lives in IndexedDB on the device and every core flow
      works offline — the app has no backend, account or paid service of its
      own.
    createdAt: 2026-08-26T22:58:34.899Z
  - id: r-no-gamification
    text: Progress is shown only as honest status, results and counts — never
      streaks, points, badges, XP or a fabricated mastery percentage.
    createdAt: 2026-08-26T22:58:34.899Z
  - id: r-no-silent-data-loss
    text: "Data is never replaced silently: sync compares content hashes rather than
      timestamps, both-changed is an explicit choice, and the copy about to be
      replaced is archived first."
    createdAt: 2026-08-26T22:58:34.899Z
  - id: r-one-instrument-per-session
    text: Today is a session workspace scoped to one chosen instrument; the
      cross-instrument overview is a deliberate secondary choice and no other
      instrument's work appears inside a session.
    createdAt: 2026-08-26T22:58:34.899Z
  - id: r-practice-completes-reviews
    text: Only closing a practice block completes a review and advances spaced
      repetition; 'Not now' hides a review for the day without changing any
      schedule, and snooze moves the real date on both the review and the item.
    createdAt: 2026-08-26T22:58:34.899Z
  - id: r-pure-tested-domain
    text: Domain logic is free of React and side effects, takes an explicit `now`,
      and is unit-tested; only the store mutates app data.
    createdAt: 2026-08-26T22:58:34.899Z
  - id: r-quick-start
    text: Starting a practice block stays under 30 seconds and closing one under 60;
      a title is the only required field anywhere, and every other field has a
      smart default.
    createdAt: 2026-08-26T22:58:34.899Z
  - id: r-secrets-stay-on-device
    text: The GitHub token and the NAS base URL live only in this browser's local
      storage — never in exports, backups or synced data.
    createdAt: 2026-08-26T22:58:34.899Z
approval:
  hash: 9b8c861a760d150c2e6c9284f4c2918f9d02e8b0f64e3835d656fa5378e0625f
  at: 2026-08-28T13:29:55.010Z
  by: Ethan
  signature: cN/3us8yZACJmsWdYjWR5i28oIg7TrvVa8UQVYpod4jESrLRCK5fTP5LuK3lt4hyJ6mA007waWoHeoC28fPuCQ==
  publicKey: |
    -----BEGIN PUBLIC KEY-----
    MCowBQYDK2VwAyEAxxaiErDKWXw9qQrVISVCyYQrsfvEEbOKmcLKt92Rkro=
    -----END PUBLIC KEY-----
---

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

