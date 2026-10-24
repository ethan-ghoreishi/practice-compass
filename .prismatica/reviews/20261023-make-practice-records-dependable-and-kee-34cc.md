---
id: 20261023-make-practice-records-dependable-and-kee-34cc
contractId: 20261023-make-practice-records-dependable-and-kee-34cc
patchId: 2f95aea325a7e33ba07800af92daedf68fc9a2da
reviewer: codex
state: sealed
verdict: approve
createdAt: 2026-10-24T00:48:42.582Z
sealedAt: 2026-10-24T01:04:19.107Z
---

# Review: Make practice records dependable and keep session choices aligned with the work being done

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20261023-make-practice-records-dependable-and-kee-34cc
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/56
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `2f95aea325a7e33ba07800af92daedf68fc9a2da`
- **Computed by:** prismatica 0.11.0 · build sha256:a53354b36e378c8f · installed package, not registry-verified

## The Delta this change was framed from

# Use the scoped evidence and Working/Keep fresh return model in this proposal throughout the existing practice loop and its routine/plan entry paths. Record completed routine practice durably without requiring feedback; explicit skips log nothing; show contents and preserve item-bound autosaved notes. Use consistent remove/skip/move-on meanings across Plan and Routine, leaving unused time unallocated unless the owner deliberately rebuilds or changes duration. Reorder preview segments and include ordinary theory study through the shared eligibility/return policy. Keep class opportunities distinct from protected retention dates and fix the known slow apt route as bounded technical work.

_approved · about "practise-todays-recommendation"_

## Today

The practice loop stores unscoped results and uses them for item-wide status/spacing; routine time is separate from optional capture but skip credits any positive elapsed interval, contents are opaque, notes require Done, plan order cannot be edited, and class/theory opportunities are not consistently integrated.

## Instead

Use the scoped evidence and Working/Keep fresh return model in this proposal throughout the existing practice loop and its routine/plan entry paths. Record completed routine practice durably without requiring feedback; explicit skips log nothing; show contents and preserve item-bound autosaved notes. Use consistent remove/skip/move-on meanings across Plan and Routine, leaving unused time unallocated unless the owner deliberately rebuilds or changes duration. Reorder preview segments and include ordinary theory study through the shared eligibility/return policy. Keep class opportunities distinct from protected retention dates and fix the known slow apt route as bounded technical work.

## Keep

- r-local-first-offline
- r-no-silent-data-loss
- r-practice-completes-reviews
- r-explainable-scheduling
- r-pure-tested-domain
- r-one-instrument-per-session
- r-quick-start
- r-direction-aware-text
- r-no-gamification
- r-secrets-stay-on-device
- r-large-files-stay-on-nas

## New assumptions

_none_

## Show me

The named acceptance families below, using a two-item Setar Warm up created through the real UI, literal long-gap chunk/class counterexamples, failure/reload/restore states and Chromium plus WebKit histories; one focused proof route, full required checks and one bounded native-device observation.



## Re-review after a rejection — scoped to the rework

The last review of this contract asked for changes. This is NOT the whole plan
restated: it is what changed since the previously reviewed head, the findings
that review recorded, and the paths the rework touched — read any file you need
from the lane. The same Check already bound to this head is not to be rerun
wholesale.

Verify each prior finding's FAMILY across every consumer in the repository, not
only the lines this rework changed: a family is closed when no instance of its
invariant survives anywhere, and a fix that reached one consumer while a sibling
still breaks it is not closed.

**Approved intent:** `.prismatica/intents/20261023-make-practice-records-dependable-and-kee-34cc.md`

**Findings from the previous review:**

- **notes-recovery-idempotence** — P2: Opening an editor on replacement notes does not register the shown text as accounted for, so recovery can append the newest edit to the text it deliberately replaced (src/store/notesDrafts.ts:58-62,98-102,115-116; src/components/ItemNotes.tsx:216-230).
  _counterexample:_ HEAD f4b6ae9; patch 64421752e1c2bd1ef9d7d8e5a7002bc4599f88f2. Invariant: recovery replays the newest words exactly once against the persisted text those words were actually edited from, while retaining genuinely unseen competing text. For both item and lesson owners: (1) With original on disk, refuse save A and leave the editor. Let a pull/import/restore install and persist remote while the editor is absent. Reopen: the editor shows remote and uses remote as its live base, but noteEditBegins retains the old held base original. Type remote edited, then reload before debounce, or refuse its autosave and reload. Recovery merges remote plus KEPT_DRAFT_HEADING plus remote edited; expected remote edited once. (2) With no older held copy, open an editor on remote while its replacement write is pending. Type remote edited and let remote land before reloading, before debounce or after a refused autosave. noteEditBegins selected original from landedNotes and notesLanded cannot account for remote, giving the same duplicate. In-memory execution of the current notesDrafts module and AST-extracted saveNotes, resetting module state at reload, reproduced all eight owner/timing/exit combinations. Family sweep: ItemDetail, ActiveBlock and keyed RoutineRunner through ItemNotes/DurableNotes; Lessons through LessonNotes/DurableNotes; beginEdit/type, noteEditBegins/baseFor/holdNoteDraft, notesWritten/notesLanded, landingStorage and replayNoteDrafts; importDB and its sync pull, Keep remote, manual import and archive-restore callers all share the affected boundary. Active practice replacement guards remain intact; the stale draft can precede entry to practice. Checked clean within this family: the previously rejected held-write remount, hydration replay and ordinary whole-state persistence shapes, plain and kept-both; unseen replacements still keep both; explicit retry, owner-kind separation and gone-record refusal. Extend the uniquely named test working note saves preserve newest text and refuse stale ownership across failures and replacement at tests/practice-session.browser.test.ts:679 with both newly seen replacement variants, both owners and both engines. Reused the passing Check bound to this HEAD; no wholesale rerun or file/record writes.

**What changed since the previously reviewed head:**

```diff
diff --git a/docs/practice-session-model.md b/docs/practice-session-model.md
index c374aaac35c220eb77a804ebb8a8f71fca05a310..7c9b09e041ea7efe5279d07f6f9bc109272a5140 100644
--- a/docs/practice-session-model.md
+++ b/docs/practice-session-model.md
@@ -158,12 +158,14 @@ a second time. The copy always holds the latest words typed. Its base has ONE
 owner for every editor lifetime, the replay and every action: as each
 whole-state persist lands, `notesLanded` (`notesDrafts.ts`, fed by the store's
 storage adapter) re-bases the copy on the landed text when the copy accounts
-for it — text this device's `saveNotes` wrote, or the stored text it kept
-beside its own — and never on a replacement it has not seen (a pull, an
-import), which a replay must still keep beside it. The copy is dropped only
-when the latest issued write has landed holding its words. A remount, a replay
-acknowledged under a live editor, or a Pause or link persisting refused words
-therefore replay the newest words exactly once.
+for it — text this device's `saveNotes` wrote, the stored text it kept
+beside its own, or the text an editor showed once words are typed in it
+(landed already or still landing) — and never on a replacement nobody typed
+over (a pull, an import), which a replay must still keep beside it. Opening an
+editor alone accounts for nothing. The copy is dropped only when the latest
+issued write has landed holding its words. A remount, a replay acknowledged
+under a live editor, a Pause or link persisting refused words, or typing in an
+editor opened on a replacement therefore replay the newest words exactly once.
 
 ## 9. Data and compatibility
 
diff --git a/src/store/notesDrafts.ts b/src/store/notesDrafts.ts
index e51b8d6aa5b83af4244a4e9c8076b38eb5976a28..5efa987c598d4dd19a11f97fe4e20f6724665a7f 100644
--- a/src/store/notesDrafts.ts
+++ b/src/store/notesDrafts.ts
@@ -17,9 +17,10 @@ import type { NoteOwner } from './useStore';
 // ONE owner of the base, for every editor lifetime, the reload replay and
 // every whole-state write: `notesLanded`, called as each persisted state lands
 // in IndexedDB. The base moves only to landed text this copy ACCOUNTS for —
-// text this device's `saveNotes` wrote, or the stored text it kept beside its
-// own — never to a replacement it has not seen (a sync, an import), so a
-// replay still keeps both. The copy is dropped only when the latest write has
+// text this device's `saveNotes` wrote, the stored text it kept beside its
+// own, or the text an editor showed once words are typed over it — never to a
+// replacement nobody typed over (a sync, an import), so a replay still keeps
+// both. The copy is dropped only when the latest write has
 // landed holding its words.
 //
 // Every access is wrapped: storage that is full, blocked or absent costs only
@@ -45,8 +46,16 @@ const norm = (t: string | undefined) => (t ?? '').trim();
 let landed: PracticeDB | null = null;
 /** Per owner: the base the held copy carries. */
 const bases = new Map<string, string>();
-/** Per owner: texts this device's `saveNotes` put in the store (normalised) since the copy began. */
+/** Per owner: texts this device's `saveNotes` put in the store, or an editor's words were typed over (normalised). */
 const accounted = new Map<string, Set<string>>();
+/** Per owner: what an open editor showed, until its first keystroke accounts for it. */
+const shownAtOpen = new Map<string, string>();
+
+function account(key: string, ...texts: string[]): void {
+  const set = accounted.get(key) ?? new Set<string>();
+  for (const t of texts) set.add(norm(t));
+  accounted.set(key, set);
+}
 
 function landedNotes(owner: NoteOwner): string | undefined {
   if (!landed) return undefined;
@@ -88,15 +97,18 @@ export function notesLanded(db: PracticeDB, latest: boolean): void {
 
 /** `saveNotes` put `written` in the store, over or beside `stored`: the copy accounts for both. */
 export function notesWritten(owner: NoteOwner, stored: string, written: string): void {
-  const key = keyFor(owner);
-  const set = accounted.get(key) ?? new Set<string>();
-  set.add(norm(stored)).add(norm(written));
-  accounted.set(key, set);
+  account(keyFor(owner), stored, written);
 }
 
-/** An editor opens on this owner: with no copy held, what is on disk is the base. */
+/**
+ * An editor opens on this owner, showing `shown`: with no copy held, what is on
+ * disk is the base. Opening alone accounts for nothing — a held copy's words
+ * were not typed over `shown` — but the first keystroke (`holdNoteDraft`) does:
+ * from then on the copy's words ARE edited from it, landed or still landing.
+ */
 export function noteEditBegins(owner: NoteOwner, shown: string): void {
   const key = keyFor(owner);
+  shownAtOpen.set(key, shown);
   const held = heldNoteDraft(owner);
   if (held) bases.set(key, bases.get(key) ?? held.base);
   else bases.set(key, landedNotes(owner) ?? shown);
@@ -113,6 +125,12 @@ function write(owner: NoteOwner, draft: NoteDraft): boolean {
 
 /** Keep the latest text for this owner. Returns false when the device refused it. */
 export function holdNoteDraft(owner: NoteOwner, text: string): boolean {
+  const key = keyFor(owner);
+  const shown = shownAtOpen.get(key);
+  if (shown !== undefined) {
+    shownAtOpen.delete(key);
+    account(key, shown);
+  }
   return write(owner, { text, base: baseFor(owner, heldNoteDraft(owner)?.base ?? landedNotes(owner) ?? '') });
 }
 
diff --git a/tests/practice-session.browser.test.ts b/tests/practice-session.browser.test.ts
index 3533eeac7f449a7605d2297ec80851bcd3fedcd8..7ef28d68cbfc2d9752fc8a408710a4a027101269 100644
--- a/tests/practice-session.browser.test.ts
+++ b/tests/practice-session.browser.test.ts
@@ -923,6 +923,7 @@ describe('notes without a Done dependency', () => {
               return notesBox(page);
             },
             landed: (want: string) => notesOf(app, PIECE, want),
+            withNotes: (d: Db, theirs: string) => ({ ...d, items: d.items.map((i) => (i.id === PIECE ? { ...i, notes: theirs } : i)) }),
             replace: (theirs: string) =>
               replaceOnDisk((d) => ({ ...d, items: d.items.map((i) => (i.id === PIECE ? { ...i, notes: theirs } : i)) })),
           },
@@ -936,6 +937,7 @@ describe('notes without a Done dependency', () => {
             },
             landed: (want: string) =>
               persistedUntil(app, (s) => (s.state as { db: Db }).db.lessons.find((l) => l.id === TWIN)?.notes, (n) => n === want),
+            withNotes: (d: Db, theirs: string) => ({ ...d, lessons: d.lessons.map((l) => (l.id === TWIN ? { ...l, notes: theirs } : l)) }),
             replace: (theirs: string) =>
               replaceOnDisk((d) => ({ ...d, lessons: d.lessons.map((l) => (l.id === TWIN ? { ...l, notes: theirs } : l)) })),
           },
@@ -1035,6 +1037,75 @@ describe('notes without a Done dependency', () => {
           await repairStorage(page);
           await reload(app);
           await owner.landed(`P${n} — typed while the replay was held, and after`);
+
+          // --- A REPLACEMENT THE EDITOR OPENS ON (an import here; a pull, Keep
+          // remote and a restore install the same way, with no reload). Words
+          // TYPED there are edited from what it showed — landed already, or
+          // still being written — so a reload replays them exactly once.
+          // Opening alone accounts for nothing: older refused words stay kept
+          // beside a replacement nobody typed over.
+          const refuseAndLeave = async (words: string) => {
+            const b = await owner.open();
+            await breakStorage(page);
+            await b.fill(words);
+            await page.clock.runFor(1_000);
+            await page.getByText(/Not saved/).waitFor();
+            await goTo(app, '/repertoire');
+            await repairStorage(page);
+          };
+          const importing = async (theirs: string) => {
+            const d = owner.withNotes((await persistedDb(app)) as unknown as Db, theirs);
+            return async () => {
+              await importBackup(app, 'replacement.json', JSON.stringify({ app: 'practice-compass', schemaVersion: SCHEMA_VERSION, exportedAt: T, data: d }));
+              expect(await importOutcome(app), engine).toContain('Imported');
+            };
+          };
+          // Opened on, never typed in, while the replacement lands.
+          await refuseAndLeave(`old${n}`);
+          let install = await importing(`unseen${n}`);
+          await holdStorage(page);
+          await install();
+          box = await owner.open();
+          expect(await box.inputValue(), engine).toBe(`unseen${n}`);
+          await releaseStorage(page);
+          await owner.landed(`unseen${n}`);
+          await goTo(app, '/repertoire');
+          await reload(app);
+          await owner.landed(kept(`unseen${n}`, `old${n}`));
+
+          for (const exit of ['before the quiet interval', 'after a refused autosave']) {
+            const leave = async () => {
+              if (exit === 'after a refused autosave') {
+                await breakStorage(page);
+                await page.clock.runFor(1_000);
+                await page.getByText(/Not saved/).waitFor();
+                await repairStorage(page);
+              }
+              await reload(app);
+            };
+            // Landed while the editor was away, over older refused words.
+            await refuseAndLeave(`old${n} ${exit}`);
+            install = await importing(`remote${n} ${exit}`);
+            await install();
+            await owner.landed(`remote${n} ${exit}`);
+            box = await owner.open();
+            expect(await box.inputValue(), engine).toBe(`remote${n} ${exit}`);
+            await box.fill(`remote${n} ${exit} — edited`);
+            await leave();
+            await owner.landed(`remote${n} ${exit} — edited`);
+
+            // Still being written when the editor opened on it; no older copy.
+            install = await importing(`pending${n} ${exit}`);
+            await holdStorage(page);
+            await install();
+            box = await owner.open();
+            expect(await box.inputValue(), engine).toBe(`pending${n} ${exit}`);
+            await box.fill(`pending${n} ${exit} — edited`);
+            await releaseStorage(page);
+            await owner.landed(`pending${n} ${exit}`);
+            await leave();
+            await owner.landed(`pending${n} ${exit} — edited`);
+          }
         }
 
         // --- AN ORDINARY WRITE by another action carries refused words -------
```

**Paths the rework touched:**

- `docs/practice-session-model.md`
- `src/store/notesDrafts.ts`
- `tests/practice-session.browser.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
0c1d41e Rework review findings: typing in an editor accounts for the text it showed

Family: notes recovery idempotence. Invariant: after a reload, the device
copy replays the newest words exactly once against the persisted text they
were edited from, and still keeps beside them any replacement nobody typed
over.

The gap: an editor opened on replacement notes (already landed, or still
being written) gave its words a base the copy never moved off, because the
shown text was never counted as accounted for. Now `noteEditBegins` records
what the editor showed, and the first keystroke (`holdNoteDraft`) counts it as
accounted for. From then on `baseFor`/`notesLanded` re-base onto it as soon
as it is on disk. Opening alone counts for nothing, so a held copy's older
words are still kept beside a replacement the owner only looked at.

Consumers, one choke point (notesDrafts.ts):
- ItemDetail, ActiveBlock, keyed RoutineRunner (ItemNotes -> DurableNotes)
  and Lessons (LessonNotes -> DurableNotes): every editor lifetime starts in
  beginEdit -> noteEditBegins and types through holdNoteDraft. Fixed there.
- saveNotes kept-both re-hold (holdNoteDraft): it only follows typing, or the
  hydration replay, which has no editor open. Checked clean.
- notesWritten / notesLanded / landingStorage / replayNoteDrafts: unchanged;
  they read the same accounted set. Checked clean.
- importDB and its callers (sync pull, Keep remote, manual import, archive
  restore) all install with no reload and land through landingStorage, so the
  fix does not depend on which one replaced the notes. Proven through manual
  import.

Proof, in the named test "working note saves preserve newest text and refuse
stale ownership across failures and replacement", for item and lesson, in
Chromium and WebKit:
- Replacement landed while the editor was away (over older refused words),
  then typed in.
- Replacement still being written when the editor opened on it, then typed
  in.
- Each of those exits two ways: a r
… (truncated)
```

## Check against the contract

- [ ] **ac-1** — Two differently named bound Setar items created through the real editor: natural completion and early Finish, omitted/partial/full optional capture, leave completion and reload. Assert BOTH persisted blocks and BOTH item histories/totals, truthful not-assessed presentation and untouched reviews/SR. Repeat binding aggregates into one block; an unbound segment stays unlogged. Include the reported first-item-only shape and identify any checked-clean path. _(proof: routine completion and history preserve all practised items without feedback)_
- [ ] **ac-2** — Table-driven store/domain proof of the shared session-control policy for Plan and Routine: remove before start, skip/remove not-yet-started work during a session, active/paused skip with elapsed time, keep partial practice through move-on, first/middle/final/all removal, repeated routine item after an earlier real occurrence, duplicate finish and reload/resume. Skips create zero practice; kept partial time is real; remaining order/targets stay unchanged and freed time is visibly unused. Explicit Plan regeneration/budget change and routine duration fitting can allocate again. Cover actual overtime without borrowing another target, protected completed records, and empty/completed outcomes. Plan move-on saves through Close before advancing; Routine keeps its lighter recording with no retention judgement. Finish write failure/retry retains a recoverable outcome and counts each real item once. Use independently expected minute totals for both flows, not just identical function names. _(proof: routine controls distinguish skipped time from partial practice across run transitions)_
- [ ] **ac-3** — Chromium/WebKit: Today, stage, pathway, bare URL and duration/essentials doors show/reach actual bound contents before starting. Start only from a tap; preview matches frozen run, full list states remain available while running, editing saved routine does not shift active identities, removing/skipping does not edit the saved routine or delete items. Named mobile controls and empty/unbound states are covered. Include preview removal and essentials filtering: the shorter contents/time shown are the ones started; no automatic refill of removed time. _(proof: routine contents and controls describe the exact run started from every doorway)_
- [ ] **ac-4** — Domain plus store: first/last/no-op/empty/single moves, repeated moves then swap/remove, and start/close sequence execute owner order with identical moved-segment minutes/roles/reasons/focus and no invented block. Remove leaves other allocations unchanged and shows unused capacity; explicit regeneration/budget choice is the allocation boundary, preserving generator floors/shares/caps. Cross-check pre-start and running skip/remove/move-on with the shared control family. Reorder logs no practice and cannot bypass deleted/moved-item, revision or day checks. _(proof: session plan reordering preserves segment identity allocation and execution order)_
- [ ] **ac-5** — Chromium/WebKit at phone and desktop widths: reorder with named keyboard/touch controls, keep focus usable and start/finish in displayed order. In the same finite journey, compare Plan and Routine removal before start, pending skip and early move-on: equivalent actions have consistent meanings, remaining durations do not silently increase, actual/remaining/unused time is truthful, and actual practice is kept through the appropriate existing save path. Check empty/completed outcomes and explicit regeneration/duration fitting without a new control wizard. Revision/day staleness stays visible without silently re-sorting edits; no drag dependency or horizontal overflow. _(proof: session plan move controls work by keyboard and touch without losing the draft)_
- [ ] **ac-6** — Chromium/WebKit: item detail, active block, bound routine and shared lesson editor; type then immediately navigate, collapse, Finish, cross a natural boundary, change item/lesson and ordinary reload. After acknowledged persistence recover exact latest text for the original owner, including clear-to-empty and Farsi composition. New owner never displays/saves the prior draft. Done is optional; practice facts and clock remain unchanged. _(proof: working note drafts survive exits boundaries and reload without Done)_
- [ ] **ac-7** — Delay/reorder/reject acknowledgements, type during a pending save, retry after store memory already changed, two editors with equal item/lesson ids, and import/sync/restore/reset/delete underneath an editor. Saved never precedes durability; newer words survive, failed text remains recoverable with retry/Copy, stale writes cannot resurrect records or overwrite replacement/remote notes, both competing texts remain preserved and recoverable under the simplest resolution consistent with the existing conflict model, without requiring a new conflict UI. Exercise rapid exit before debounce, not just waiting for autosave. _(proof: working note saves preserve newest text and refuse stale ownership across failures and replacement)_
- [ ] **ac-8** — Fixed decision table: all six results plus not_logged crossed with focused/explicit-whole/legacy-unknown evidence on Working/Keep fresh; whole child versus parent; due/future/unscheduled; same-day double close. Focused performable never promotes whole readiness or expands/resets/completes retention. Explicit whole stable can advance when eligible; same is neutral; no-assessment/routine capture/admin changes never fabricate retention. Store outcomes, not merely helpers, prove the boundaries. _(proof: scoped evidence separates focused progress from whole item retention and readiness)_
- [ ] **ac-9** — Literal high-SR unfinished-piece fixture (for example reps 8, interval 90) with focused success and same produces the documented 1–3-day Working return rather than repeating/expanding 90 days. A real explicit due whole-item check in Keep fresh retains honest spaced progression. Include user/manual/fixed/unknown future protection, auto future, due, no date, deliberate clear versus omitted, switching intention, repeated decline/rearm/reload and once-per-local-day progress. Match one preview decision to the exact saved item/open-row outcome and rationale. _(proof: working returns stay short while protected dates and retention spacing keep their authority)_
- [ ] **ac-10** — An unfinished/retained item committed to a class in four days with a 90-day review returns as class preparation without overwriting its protected date. Heavy practice today reduces repeats when an alternative exists; it returns on a later eligible day until its named lesson, including after a routine without feedback. Test only-candidate honest fallback, near versus later class, retarget/delete/pass/unassigned/archive/other-instrument classes, question-only entries, dormant exclusion, equal-score stable ties and parent/part opportunities. Today/build/regenerate/swap/fallback consume the same eligibility/return policy; urgency beats diversity. _(proof: class preparation and shared recommendation pools return useful work without repetition noise)_
- [ ] **ac-11** — Chromium/WebKit: focused versus explicit whole, unchanged and stable results on a high-SR unfinished piece, explicit readiness decision, class opportunity versus protected retention date, manual correction, no result, Back, local midnight and ordinary/plan entry. History preserves evidence scope; Why this date uses the same decision. No preselected whole-readiness promotion, lost close draft, duplicated date derivation or required extra text. _(proof: close and review screens explain scope readiness and next practice with the date actually saved)_
- [ ] **ac-12** — Create/edit Theory through the existing full Add path, with a title-only default and optional source; no auto-creation on load/regenerate. Fixed multi-session library shows an eligible reading_theory task being offered when urgent needs are covered, lowers its repeat after actual practice, and excludes it when absent/resting/other-instrument. Opposing short-budget and imminent-class fixtures keep the urgent anchor. Reorder/swap/routine/direct practice record normal blocks with scope, do not misclassify theory as repertoire, invent musical facts or violate minute floors/shares. _(proof: theory study uses ordinary practice items and earns bounded non urgent opportunities)_
- [ ] **ac-13** — Committed pre-upgrade v16 fixture plus supported older chain: migration is deterministic, clock-free and idempotent. Old blocks/ids/results/notes/counters/SR/dates/provenance/commitments/references/catalogue and attachment bytes survive; no whole scope/readiness or missing routine block is inferred. Cover current/new fields, missing legacy scope, invalid type/value, duplicate ids and too-new data. New schema round-trips through exports and canonical hashing; equal inputs on different dates produce equal data/hashes. _(proof: session model migration preserves history dates bytes and unresolved legacy meanings)_
- [ ] **ac-14** — Real store/browser inbound family across persist migrate AND merge, state/full import, sync pull/Keep remote, archive restore and cold-start recovery. Valid migrated/new data survives reload; malformed or too-new new semantics refuse without changing memory/disk/blobs. Active paused/running block/routine presence continues to defer/refuse replacement; fresh/legacy in-progress routines and dual-clock recovery preserve actual accumulated time. Full attachment bytes are proved outside WebKit Blob seeding. Update both-device compatibility is explicit; no older-schema silent field loss. _(proof: session model inbound doors preserve live practice and fail before replacing data)_
- [ ] **ac-15** — Execute the actual setup against temporary mirror+file and direct-source layouts with fast-index/slow-package, dead/refused, missing suite, healthy fallback, no matching Azure source, missing list and all-unavailable cases. Demonstrate the chosen bypass/fallback prevents reliance on the known slow route, preserves suites/components/signatures/third-party sources, and ends clearly within its own bound. No source-text heuristic alone, global apt changes in tests or longer install timeout. Deterministic local proof satisfies this acceptance before review/seal; a pre-ship live Actions run is not required. _(proof: ci browser setup avoids a fast index slow package mirror within the existing bounds)_
- [ ] **ac-16** — All three real suite workflows use the same bounded setup and lockfile-resolved Chromium/WebKit install before checks; retain CI/deploy check parity, PR-only Gate, cancellation, job/install bounds and tests-before-deploy. Adapt existing runner tests to execution semantics, with missing-engine/late-setup/bypassed-check negative fixtures; no new bespoke YAML/source scanner. Prove the setup and gate wiring locally before review/seal. The real Actions run is post-ship evidence and must pass before merge; its absence before ship is not a blocker. _(proof: ci release paths retain pinned dual engine provisioning and tests before publishing)_
- [ ] **ac-17** — One bounded native-device regression pass on the built HTTPS candidate: iPhone Safari AND installed PWA, 390px-class viewport, edit mixed Farsi/English notes while a routine changes item, dismiss the keyboard and use all five tabs, pause/resume after genuine idle and observe a real boundary cue/display wake. Record device/iOS/build and actual audible/wake outcome. No new calibration target, repeated UX taste sign-off or real NAS/media mutation; desktop WebKit cannot prove these physical/native properties. _(proof: manual:OWNER)_
- [ ] **ac-18** — One minimal OWNER product walkthrough using real Setar data on the built candidate: one unfinished piece being prepared for its named next class, focused chunk practice, its Next practice explanation, one Keep fresh item and one generated session plan. Record a brief judgement of whether the model and UX make sense for real practice. This is product acceptance only; do not manually recalculate dates, audit data correctness, supply a private export or broaden into a fresh product/taste review. Keep the separate native iPhone/sound check unchanged. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts
- **back-up-and-restore** — touched via src/domain/io.ts, src/store/useStore.ts
- **browse-my-repertoire** — touched via src/pages/ItemDetail.tsx, src/domain/repertoire.ts
- **capture-a-practice-item** — touched via src/components/ItemForm.tsx, src/components/itemKinds.ts, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts
- **clear-a-due-review** — touched via src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts
- **log-a-class** — touched via src/store/useStore.ts
- **practise-todays-recommendation** — touched via src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts, src/domain/blocks.ts
- **prepare-for-the-next-class** — touched via src/pages/CloseBlock.tsx
- **run-a-session-plan** — touched via src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/domain/plan.ts, src/store/useStore.ts
- **see-practice-patterns** — touched via src/pages/Today.tsx, src/domain/io.ts
- **work-a-pathway-stage** — touched via src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx, src/domain/routines.ts, src/store/useStore.ts

**Possibly affected (shares a mechanic with a detected flow):**

- **install-the-app-and-keep-it-current** — shares route "/settings" with "adjust-how-scheduling-works"
- **point-this-device-at-the-nas** — shares route "/settings" with "adjust-how-scheduling-works"
- **sync-devices-via-github** — shares route "/settings" with "adjust-how-scheduling-works"

**What the agent reported:**

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/io.ts, src/store/useStore.ts matched changed file(s) src/domain/io.ts, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/ItemDetail.tsx, src/domain/repertoire.ts matched changed file(s) src/domain/repertoire.ts, src/pages/ItemDetail.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## prepare-for-the-next-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/CloseBlock.tsx matched changed file(s) src/pages/CloseBlock.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## see-practice-patterns — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/domain/io.ts matched changed file(s) src/domain/io.ts, src/pages/Today.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## install-the-app-and-keep-it-current — unchanged

Settings.tsx, the service worker, Layout and app-update code are untouched; the shared /settings route is only where the scheduling explanation also renders.

## point-this-device-at-the-nas — unchanged

No NAS base, reference or recording code changed; the shared /settings route is incidental.

## sync-devices-via-github — unchanged

syncEngine, githubSync and gitRemote are untouched; a pulled snapshot goes through the same validateDB, which now also checks the v17 fields (proved by session model inbound doors preserve live practice and fail before replacing data). As with every schema bump, both devices update before syncing; an older build refuses a v17 snapshot whole.

## practise-todays-recommendation — truth-proposed

Scoped results (focused/whole), Working/Keep-fresh returns, the shared candidate pool and autosaving notes change steps 2, 4, 6 and 7; update proposal in this lane.

## run-a-session-plan — truth-proposed

Preview Move earlier/later, removal without redistribution, skipping any pending or the running segment, and separate time figures change steps 2, 3, 5, 6 and the budget rule; update proposal in this lane.

## work-a-pathway-stage — truth-proposed

Routine contents preview before Start, running list with Move on / Skip / Remove, and unlabelled bound segments kept change the Guided routine variation; update proposal in this lane.

## adjust-how-scheduling-works — truth-proposed

The explanation now states Working returns, Keep-fresh whole checks and class preparation (step 1); update proposal in this lane.

## clear-a-due-review — truth-proposed

Which close completes a due review now depends on return intention and block scope (step 2, endsWith); update proposal in this lane.

## capture-a-practice-item — truth-proposed

Theory / listening study joins the kind-first form and study ideas pre-fill it (step 2, new variation); update proposal in this lane.

## log-a-class — truth-proposed

Class notes autosave and replay after reload instead of saving on blur (step 2); update proposal in this lane.


**Gaps between detected and reported:**

_None — the report matches what was detected._

## Flow truth this change touches

### adjust-how-scheduling-works — Works now (update proposed)

Proposed step changes:
− Practice Compass States the real priority formula and the spaced-repetition rungs in plain English, filled in with the values currently in force.
−   Shows: The priority terms, the current first/second/slip-reset gaps, and how importance and difficulty pull material sooner.
+ Practice Compass States the real priority formula, how each item comes back — working on it (1–3 days), kept fresh (spaced repetition on a whole-item check), class preparation before its class — and the spaced-repetition rungs, in plain English, filled in with the values currently in force.
+   Shows: The priority terms, the working return days, the current first/second/slip-reset gaps, and how importance and difficulty pull material sooner.
  The musician Changes a value — a review gap, the warm-up or deep-work share of a plan, the shortest or longest review slot.
    Shows: The explanation updates to the new numbers.
    Changes: The settings are stored with the practice data, clamped to safe bounds; out-of-range input is never trusted.
  The musician Closes a block or builds a plan afterwards.
    Shows: Review dates and plan shapes computed with the adjusted values.
    Changes: The same settings are used for the date previewed and the date saved.
  The musician Taps 'Reset to recommended' whenever they want the original behaviour back.
    Shows: 'Using the recommended defaults.'
    Changes: The settings field is dropped, so the historical constants apply exactly.

Touchpoints: src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts

Evidence: 4 steps: 4 manually verified

### back-up-and-restore — Works now

Touchpoints: src/store/backup.ts, src/store/idb.ts, src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts

Evidence: 5 steps: 5 manually verified

### browse-my-repertoire — Works now

Touchpoints: src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx, src/pages/Materials.tsx, src/domain/repertoire.ts, src/domain/persian.ts, src/domain/farsi.ts

Evidence: 5 steps: 5 code inferred

### capture-a-practice-item — Works now (update proposed)

Proposed step changes:
  The musician Types a title into the quick-add box and presses Add.
    Shows: 'Added ✓' with an 'add details' link.
    Changes: A practice item exists, with the instrument taken from context (stage's pathway, lesson, or the current session instrument) and sensible defaults for everything else. From a lesson it is linked to that lesson at the same time.
− The musician Or chooses 'Add practice item' for the full one-step form.
−   Shows: A kind-first form: what you are adding (gusheh / composed piece / piece / étude / passage / technique), then only that kind's identity fields, then 'Connect it (optional)', then the first practice setup.
+ The musician Or chooses 'Add practice item' for the full one-step form.
+   Shows: A kind-first form: what you are adding (gusheh / composed piece / piece / étude / passage / technique / theory or listening study), then only that kind's identity fields, then 'Connect it (optional)', then the first practice setup.
  The musician Fills in identity, and optionally connects a study source (creatable inline), a pathway stage, a lesson and a parent work — all at creation.
    Shows: Persian instruments are asked for dastgāh, gusheh, form and composer. While typing in dastgāh, form or composer, up to eight matching terms appear below the box as buttons — found from Farsi, Latin, an alias or a transliteration — beside an ‘All’ list and a clear control; a tap, click or Enter stores the shared term and returns focus to the box. A partial match is never accepted on its own, and free text always wins.
  The musician Saves.
    Shows: The item's own page, with a 'Connected to' summary near the top.
    Changes: One item, linked to whatever it belongs to — links never duplicate the item.

Touchpoints: src/components/QuickAdd.tsx, src/components/ItemForm.tsx, src/components/itemKinds.ts, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts

Evidence: 4 steps: 4 manually verified

### clear-a-due-review — Works now (update proposed)

Proposed step changes:
  Practice Compass Lists each due review with the item's title and how long it has been due, and hides any review dismissed earlier today.
    Shows: A 'Due reviews' section with three actions per row and one line explaining what each does.
− The musician Taps ▶ to practise it.
−   Shows: The active block, seeded from the item's status and focus.
−   Changes: Nothing yet — the review only completes when the block is closed.
+ The musician Taps ▶ to practise it.
+   Shows: The active block, seeded from the item's status and focus.
+   Changes: Nothing yet — the review completes only when the close decides the item's next date: an assessed close of an item being worked on, or a whole-item check of a kept-fresh one (focused work on a kept-fresh item leaves its check waiting).
  The musician Or taps 'Not now'.
    Shows: The row disappears for the rest of the day and returns tomorrow.
    Changes: Only a per-day dismissal list in the app's session state — no review or item date is touched.
  The musician Or taps '+2d' to genuinely move it.
    Changes: The review's due date and the item's next review date both move to two days from today, so nothing is left showing overdue.

Touchpoints: src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/selectors.ts

Evidence: 4 steps: 4 manually verified

### log-a-class — Works now (update proposed)

Proposed step changes:
  The musician Accepts the pre-filled class number and picks the date.
    Shows: The class appears as 'Class N · date', newest first, with 'upcoming' while it is still ahead.
    Changes: A Lesson is stored for that instrument; the number is optional and editable.
− The musician Rewatches the class and types the notes, in Farsi or English.
−   Shows: A direction-aware notes field; the list shows 'notes ✓' once there is text.
−   Changes: Notes are saved when the field loses focus.
+ The musician Rewatches the class and types the notes, in Farsi or English.
+   Shows: A direction-aware notes field; the list shows 'notes ✓' once there is text, and 'Saved.' only once the device has stored them.
+   Changes: Notes save themselves after a short pause and whenever the musician leaves the class — never merely because the field loses focus; Done is optional. Words still unsaved when the page reloads are written to that class afterwards, and a class whose notes changed meanwhile keeps both texts.
  The musician Adds a link to the class recording and to any scores — a NAS path or a full https link.
    Shows: The links listed video-first, then PDFs and documents, each with its kind icon and 'Stored on NAS'.
    Changes: Only a reference (title, path, kind, notes) is stored — never the file itself.
  The musician Taps 'Open' on a link.
    Shows: The file opens in a new tab, resolved against the NAS base URL from Settings.
    Changes: Nothing is stored or downloaded into the app; removing a link never touches the NAS file.
    Only if: A NAS base URL is set in Settings and the NAS is reachable from this device
  The musician Links or quick-adds the practice items that came out of the class, and flags the ones to be ready for next time.
    Shows: Each linked item with its status and a 'For next class' toggle. A piece the class's Setar archive lists appears too, labelled '· in this class’s archive'; the item's own page names the same classes.
    Changes: The lesson keeps a link to the item (never ownership — unlinking keeps the item); unlinking an archive-listed piece records only that one decision and linking it again lifts it — nothing is copied into the lesson’s own links; a flagged item gains a priority boost that climbs as that instrument's next class approaches.
  The musician Optionally attaches small hand-outs (a PDF, a photo, a short audio).
    Shows: Files over 10 MB and any video are warned about; over 40 MB is refused with a clear message.
    Changes: Small blobs are stored on the device and travel with backups and sync.

Touchpoints: src/pages/Lessons.tsx, src/components/Attachments.tsx, src/domain/recordings.ts, src/domain/setarClasses.ts, src/domain/files.ts, src/domain/selectors.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### practise-todays-recommendation — Works now (update proposed)

Proposed step changes:
  The musician Taps their instrument in the switcher at the top of Today.
    Shows: Everything below is scoped to that instrument: recommendation, class work, due reviews, pathway position.
    Changes: The chosen instrument is remembered as the session instrument.
− Practice Compass Scores every item of that instrument and shows the best one with a one-sentence reason.
−   Shows: One 'Practise now' card above the fold, plus up to two quieter 'then, if you have time' suggestions.
+ Practice Compass Scores every item of that instrument from the one candidate pool Today, a plan's build, regeneration and swaps share — work already practised today (class work and an unassessed routine block included) steps aside while anything else waits — and shows the best one with a one-sentence reason.
+   Shows: One 'Practise now' card above the fold, plus up to two quieter 'then, if you have time' suggestions; a piece and its own part never take two cards unless the other has its own due review, and a repeat says plainly that nothing else is waiting.
  The musician Taps 'Start · 10 min'.
    Shows: The active block screen: item title, mode and focus chips, a running ring timer.
    Changes: A practice block is opened in memory with mode, focus and a 10-minute target derived from the item. The same tap closes the page's sound context and creates and resumes a fresh one, so a context that died while the app sat idle never outlives this tap.
− The musician Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
−   Shows: The elapsed clock, and the item's notes on request. While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake (best-effort; feature-detected; never affects elapsed time); pausing, finishing, discarding or navigating away releases it. Resume is a tap too and readies a fresh sound context again; if sound is paused or off on this page, a note says so and offers 'Turn on sound'.
−   Changes: Elapsed seconds accumulate only while the timer runs.
+ The musician Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
+   Shows: The elapsed clock, and the item's notes on request. While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake (best-effort; feature-detected; never affects elapsed time); pausing, finishing, discarding or navigating away releases it. Resume is a tap too and readies a fresh sound context again; if sound is paused or off on this page, a note says so and offers 'Turn on sound'. The item's Working notes save themselves after a short pause and whenever the musician leaves them — Done is optional, and a draft lands on the item it was typed for.
+   Changes: Elapsed seconds accumulate only while the timer runs.
  The musician Taps 'Finish'.
    Shows: The close screen, with the minutes already filled in.
    Changes: The clock is frozen first, so reflection time is not counted as practice.
− The musician Picks one of the six results, optionally adds an observation, a next action or a teacher question, and optionally revises the item behind one collapsed 'Status · Primary focus · Current effort' line (Change) — an engine-suggested status shows there pre-selected as the pending change.
−   Shows: A preview of the next review date with the plain reason behind it, and a 'Why this date?' link; the date is decided from the item as practised, so revising the item never moves it.
−   Changes: Nothing until Save; untouched fields are never written.
− The musician Taps 'Save block'.
−   Shows: Back to Today (or to the running plan), with the item's stats and status updated.
−   Changes: A PracticeBlock is stored; the item's counters, status, saturation flag and spaced-repetition state advance; any open review for the item is completed and the next one is scheduled on the date that was shown.
+ The musician Says what the block covered — focused work on a part or one aspect (the default) or an explicit whole-item check — picks one of the six results, optionally adds an observation, a next action or a teacher question, and optionally revises the item behind one collapsed 'Status · Primary focus · Current effort · return' line (Change). A status suggestion or 'Keep it fresh' is offered only after a whole-item check, never pre-selected.
+   Shows: One 'Next practice' line from the same decision that will be saved: an item being worked on comes back in 1–3 days, a kept-fresh item's whole check follows spaced repetition, and class preparation says when the item is wanted before its class — beside a review date that stays as stored. 'Why this date?' explains it in place.
+   Changes: Nothing until Save; untouched fields are never written.
+ The musician Taps 'Save block'.
+   Shows: Back to Today (or to the running plan), with the item's stats and status updated.
+   Changes: A PracticeBlock is stored with what it covered; the item's counters and saturation flag update; its next date is the one shown — spaced repetition advances only on a kept-fresh item's eligible whole-item check — and the open review completes only when that decision writes a date. Status and return intention change only when the musician chose them.

Touchpoints: src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts, src/domain/blocks.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts

Evidence: 7 steps: 7 manually verified

### prepare-for-the-next-class — Works now

Touchpoints: src/pages/TeacherReport.tsx, src/components/ClassQuestions.tsx, src/domain/questions.ts, src/domain/report.ts, src/pages/Lessons.tsx, src/pages/CloseBlock.tsx

Evidence: 4 steps: 4 manually verified

### run-a-session-plan — Works now (update proposed)

Proposed step changes:
  Practice Compass Builds a plan from the same priority numbers the recommendation uses, laid out as warm-up, class work, review, focus and cool-down segments; a whole work (gusheh, piece, anything with dastgāh/form/composer) gets at least the 10-minute standard block beside other work, drills at least 2, and a segment is seated only while every seated segment can still reach its floor.
    Shows: The plan preview: each segment with its minutes, bucket, item and a one-sentence reason. The total equals the chosen budget unless every segment that may take minutes is at its 25-minute ceiling; the warm-up and cool-down never exceed their shares or take leftover minutes.
− The musician Swaps, removes or regenerates segments until the shape looks right.
−   Shows: A removal re-spreads the minutes under the same floors and shares; a swap offers only material whose floor fits the slot.
−   Changes: Only a local copy of the plan — nothing is saved yet.
− The musician Taps 'Start plan'.
−   Shows: The runner: the whole list with the current segment highlighted.
−   Changes: The running plan is held in app state (never in the database, never synced), and the chosen length is remembered for this instrument.
+ The musician Reorders (Move earlier / Move later, by keyboard or touch), swaps, removes or regenerates segments until the shape looks right.
+   Shows: A move carries the whole segment — item, minutes, role, reason — and nothing else changes. A removal leaves every other segment's minutes as they were and shows the freed minutes as unused; only Regenerate or a new length reallocates. A swap keeps the slot's minutes and offers only material whose floor fits it.
+   Changes: Only a local copy of the plan — nothing is saved yet.
+ The musician Taps 'Start plan'.
+   Shows: The runner: the whole list in the musician's order, the current segment highlighted, with time left, unused and recorded shown separately.
+   Changes: The running plan is held in app state (never in the database, never synced), and the chosen length is remembered for this instrument.
  The musician Taps 'Start' on the current segment.
    Shows: The ordinary active-block screen, with the segment's minutes as the target — identical behaviour to an unplanned block, including the screen staying awake while it runs and is visible, and a durable 'Target reached' state with a growing overtime figure if the segment runs past its minutes without the musician tapping Finish.
    Changes: A real practice block opens for that segment's item.
− The musician Finishes and saves the block as usual.
−   Shows: Back on the plan, that segment reads 'done' and the pointer moves to the next one.
−   Changes: The block, item stats and review schedule update exactly as in an unplanned block.
− The musician Skips anything they do not want, or ends the plan at any time.
−   Shows: 'Session complete' once the last segment is passed.
−   Changes: A skipped segment logs nothing at all; ending the plan discards it and leaves every logged block untouched.
+ The musician Finishes and saves the block as usual.
+   Shows: Back on the plan, that segment reads 'done' with the minutes actually recorded, and the pointer moves to the next one; overtime is recorded as practised and charged to no other segment.
+   Changes: The block, item stats and review schedule update exactly as in an unplanned block.
+ The musician Skips any segment not yet started, skips the running one with 'Skip this one — save nothing', or ends the plan at any time; Finish (then Save, with or without a result) is how a shortened segment keeps what was practised.
+   Shows: 'Session complete' once the last segment is passed — saying so plainly when nothing was practised.
+   Changes: A skipped segment logs nothing at all, even after time passed in it, and lengthens nothing else; ending the plan discards it and leaves every logged block untouched.

Touchpoints: src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/domain/plan.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### see-practice-patterns — Works now

Touchpoints: src/pages/Insights.tsx, src/pages/Today.tsx, src/domain/insights.ts, src/domain/io.ts

Evidence: 3 steps: 3 manually verified

### work-a-pathway-stage — Works now (update proposed)

Proposed step changes:
(no step changes)

Touchpoints: src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx, src/domain/pathways.ts, src/domain/pathwaySeed.ts, src/domain/routines.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/store/useStore.ts, src/pages/Repertoire.tsx

Evidence: 5 steps: 5 manually verified

## Also look for

- Anything outside the contract's scope or non-goals.
- Silent failures, swallowed errors, missing edge cases.
- Secrets, unsafe defaults, and anything risky for the tier.

## The builder's family proof plan

The builder was asked for one before this review: Family proof plan, before the first review: for subtle work — a parser, a resolver, a provider or transaction boundary, a record another reader must still parse — name each invariant, every consumer of it, its equivalence classes and how they interact, and prove them against independently derived expected results on one reproducible, focused route (committed fixtures, fixed seeds). Point to that route and its limits rather than pasting it. Routine work needs none of this. Find
where its commit messages say it lives; subtle work without one, or a plan
whose expected results come only from the implementation under test, is a
finding.

## Close each family in this round

A counterexample is one instance of an invariant. For every finding: name the
invariant it breaks (its family), sweep the repository for every instance of
that invariant — each consumer, sibling function and caller, not only this
diff — and list every instance you found plus the consumers you checked and
found clean. One round that names the whole family saves a round per instance.

## How to finish

Review only — change no files, run no fixes, write no records. Judge the diff
itself: the builder's summary, an earlier review and a green test run are all
claims about the code, not evidence about it.

End your reply with exactly `SAFE TO SEAL` or `DO NOT SEAL` on its own
final line, and say why. That is a recommendation to the owner, who records
the outcome — sealing is never the reviewer's to do.

If your verdict is `DO NOT SEAL`, your session is repository-read-only and cannot write the findings file itself — the owner does, from what you print. These are THREE separate copy actions, never one shell script: the JSON is DATA and must never be pasted at a normal shell prompt. Do not reconstruct or alter the path, the contract id or either command below — both commands come verbatim from Prismatica; you supply only the structured findings JSON, and it must parse as strict JSON before you present it here. End your reply with exactly these three steps, in this order, each its own fenced code block:

**1. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261023-make-practice-records-dependable-and-kee-34cc/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20261023-make-practice-records-dependable-and-kee-34cc' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261023-make-practice-records-dependable-and-kee-34cc/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261023-make-practice-records-dependable-and-kee-34cc/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory. A finding names an invariant: sweep the repository for every instance of it and list each one found plus the consumers checked clean, in one round — not one counterexample at a time.
