---
id: 20261028-make-live-practice-easier-to-shape-prepa-1934
contractId: 20261028-make-live-practice-easier-to-shape-prepa-1934
patchId: 30dd92154511b4db7cf40b96fef22f8a141dc83c
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: live-question-durability-covers-lesson-target
    summary: A historical capture acknowledgement becomes valid again after an
      external ownership change persists and its reversal fails, allowing Saved
      and Done to claim ownership absent from disk.
    counterexample: "At HEAD 470534ce1f548b525e902a9d8e1b9831789964ce, controlled
      read-only execution of the real store reproduces: save Q for Class A;
      successfully setAgendaTarget(Q, undefined); refuse storage;
      setAgendaTarget(Q, Class A); press Done. liveQuestionAcknowledged returns
      true, Done closes with a Class A saved claim and zero writes, while disk
      holds Q unassigned. Both non-empty and blank fields reproduce. Likewise,
      updateItem Setar-to-Tar acknowledged then Tar-to-Setar refused closes
      without writing while disk owns Q on Tar. Root: useStore.ts:2774 compares
      current values with a historical fingerprint without accounting for
      intervening persisted mutations. Affected doors: LessonAgenda
      TargetPicker, Move to this class, and updateItem instrument changes.
      Shared consumers: acknowledgement, settlement, coalescing, Done, closing
      continuation, status and recovery visibility across ordinary/Plan
      ActiveBlock, bound/unbound Routine, Routine complete, Close and Today.
      Checked clean: one-way target changes, lesson deletion/detachment, item
      movement/deletion/detachment, forced retry, deliberate editor lesson
      selection, lesson-id agenda/report readers, and removed-question blank
      Done. Extend the unique test live teacher questions retain capture
      ownership while practice continues and its lifecycle support test with
      acknowledged changes followed by refused/delayed reversals,
      blank/non-empty Done and reload. Invalidate stale acknowledgement
      authority or obtain a fresh write acknowledgement before claiming the
      reverted ownership durable."
createdAt: 2026-10-29T11:56:31.076Z
sealedAt: 2026-10-29T12:05:21.220Z
---

# Review: Make live practice easier to shape, prepare for class and keep in time

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20261028-make-live-practice-easier-to-shape-prepa-1934
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/58
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `30dd92154511b4db7cf40b96fef22f8a141dc83c`
- **Computed by:** prismatica 0.11.0 · build sha256:a53354b36e378c8f · installed package, not registry-verified

## Intent revision — supersedes the original request only where it conflicts

- **2026-10-29T01:06:45.559Z** _(Owner requires live teacher questions to autosave without a remembered Save; replace the Save-only lifecycle and strengthen ac-5 while preserving the existing lane, other accepted families and all three review findings.)_

  OWNER REQUIREMENT REVISION: durable live teacher-question capture, within this existing lane.

This revision supersedes only the explicit-Save-only capture and non-blank Cancel semantics in product rule 4 of the original approved intent. Preserve the rest of that intent, the existing lane/issue/baseline, all other acceptance families and all three sealed request_changes findings. Claude remains the builder. This is rework of the current change, not a new lane or a general product review.

Use one lifecycle for the live question, shared by quiet-interval autosave, an optional immediate Save/Done action, retry and exit flushing. Reuse lessonAgenda questions, their existing store actions, and actual device-persistence acknowledgement. No second notes system, persisted draft collection, schema, migration or new dependency is needed. The currently allowed component/store/UI/domain/test paths are sufficient; choose the smallest complete implementation after inspection. Reuse the durable-note timing convention where practical (currently 800 ms), without changing item/lesson notes or their journal.

When a non-blank question is typed, save after a short quiet interval without requiring Save, blur or another remembered action. The first write creates one independent agenda question. Further autosaves, explicit saves and retries for that capture update the same question id. Autosave leaves the editor open and editable, preserving focus and words; it does not turn each pause in typing into another question. Done may flush and close only once the latest applicable non-blank text is acknowledged. Starting another question is deliberate; CloseBlock's later question remains independent. Merely opening and closing an empty/whitespace capture creates nothing. Replace a misleading Cancel after text has been entered with the same flush/close lifecycle; closing must not silently discard a non-blank thought or undo a question already autosaved.

Keep ownership frozen from capture opening: instrument, item (absent for an unbound Routine segment) and named lesson/default or visibly unassigned. The existing explicit lesson choice is deliberate, not permission for props, a boundary, a changed day, a later lesson, navigation or an async callback to retarget words. Once the question is created, edits/retries belong to that id and its established ownership. Revalidate before creating it; invalid/deleted/moved/cross-instrument targets keep the words with a clear problem and a deliberate valid recovery choice, never a guessed replacement. Respect existing agenda deletion/detachment rules for saved questions; do not recreate a deleted question or attach it to a different item/lesson on retry.

Apply this to ordinary practice and Plan ActiveBlock, and Routine bound/unbound segments. Intermediate Routine transitions, manual Move on/Skip/Finish and the final automatic boundary must not lose or retarget an open editor. The same applies when wall-clock catch-up after background crosses several boundaries or completes the run. Preserve the open capture and its useful close/retry controls on Routine complete, including pending/failed saves; automatic success must not erase text still being edited. Flush the latest non-blank text on app-controlled exit or close, including Finish, navigation away and editor unmount. Pending/failed words and their retry route must remain recoverable across internal navigation rather than disappear with component-local state. Do not delay, pause or recalculate practice to wait for question storage. The existing result/agenda/return surfaces may provide recovery; no new workflow is prescribed.

Read the current draft directly, never from an old render or a ref mirrored later by an effect. A pending write must not own the editor. Newer edits must be saved to the same question and must not be cleared, overwritten, marked saved or closed by an earlier acknowledgement. Coalesce/sequence writes through the one lifecycle; repeated taps, autosave plus Done, exit flushing, retry and late/out-of-order outcomes must remain idempotent. Each completed attempt must settle truthfully, including editing to empty or whitespace while a previous non-blank write is pending. Blank text creates no question and does not overwrite/delete an existing non-blank question: retain the last written question, settle its acknowledgement, and make clear that the empty editor is not a newly saved question. Never remain indefinitely Saving after that write has answered.

Saved means IndexedDB acknowledged the relevant text, never just an in-memory agenda append. Failure retains the latest words, ownership and question identity, shows an actionable failure and allows a retry that really writes again even if memory is unchanged. Do not silently close on failure or spin an endless retry loop. Acknowledged autosaves and acknowledged retries survive reload with exactly one question holding the latest acknowledged non-blank words and correct ownership, visible in existing lesson-id agenda/report consumers. Test reload against disk, not memory. An interrupted or refused device write cannot be claimed durable: preserve retry/copy access while the app is alive and accurately distinguish any older acknowledged version after reload. There is no promise that a forced browser/process termination before acknowledgement can retain a write the device refused; do not invent a second persistence system to imply that guarantee.

Preserve all three review findings as required repairs: (1) required-class useful floors through preview edits and Start, including the single-row swap that currently seats a 10-minute whole work at 5 minutes, coverage/partial-start acknowledgement and live run installation; prove it within existing ac-3 without reopening its policy; (2) open live-question draft and controls surviving automatic final Routine completion, bound/unbound and background catch-up; (3) every answered question-save acknowledgement settling, especially pending-write edits to blank/whitespace. Do not edit away, dismiss or weaken the recorded findings.

Strengthen ac-5 in place, retaining its id and exact unique test title. Extend its real-UI family in tests/live-practice.browser.test.ts through Chromium and WebKit, with controlled persistence delay/failure and deterministic clock/background catch-up where needed. Supporting focused pure/state checks may supplement, never replace, reachable UI lifecycle proof. Replace assertions that encode superseded Save-only/Cancel behaviour. Update the existing family proof map and relevant capture guidance in docs/practice-session-model.md, AGENTS.md and DECISIONS.md; reconcile only affected existing Flow proposals through the normal protocol, never signed truth by hand. Document independently expected question ids/text/ownership and the saved-on-device boundary. Sweep existing agenda/list/report consumers and any callers of a shared acknowledgement helper actually changed; report unchanged consumers checked clean. All other acceptance descriptions, scope restrictions, full configured gates and the bounded owner device walkthrough remain as approved. Timer identity and elapsed logging, Plan/Routine accounting and practice records, metronome, cue claims/wake lock, focus/mode, notes/drafts, preparations/ranking and retention remain unaffected by question capture. Do not reopen unrelated accepted families.

## The Delta this change was framed from

# One coherent session model provides explicit preview-time reuse, required next-class Plan coverage with visible capacity exceptions, reversible optional feedback, in-place agenda questions and an opt-in metronome sharing a recoverable, distinguishable practice cue.

_approved · about "practise-todays-recommendation"_

## Today

Automatic Plans can omit already-practised next-class items; preview removal only leaves unused time; Routine result pills cannot be cleared; questions wait until close; practice has no metronome and its cue is reportedly too quiet.

## Instead

One coherent session model provides explicit preview-time reuse, required next-class Plan coverage with visible capacity exceptions, reversible optional feedback, in-place agenda questions and an opt-in metronome sharing a recoverable, distinguishable practice cue.

## Keep

- Real records and retention dates retain their current authority.
- Plan and Routine share preview allocation semantics while preserving separate close/logging models.

## New assumptions

_none_

## Show me

Prove the named acceptance families against committed fixed-clock fixtures, including a morning Routine or ordinary block followed by an evening Plan, capacity failure and explicit override, failed question persistence/retry, feedback clear with no older result, and audio interruption without any clock or record change.



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

**Approved intent:** `.prismatica/intents/20261028-make-live-practice-easier-to-shape-prepa-1934.md`

**Findings from the previous review:**

- **live-question-durability-covers-lesson-target** — A live capture must not reuse a text-only acknowledgement to claim changed question ownership is saved.
  _counterexample:_ At HEAD d4e2fa0, Chromium and WebKit: autosave a live question for Class 1; refuse IndexedDB puts; navigate to Lessons and delete Class 1, or to the item's agenda and select Unassigned; return to ActiveBlock. It says Saved on this device — unassigned, and Done closes with Question saved on this device — unassigned, although disk still holds the original Class 1 target. Both browser routes reproduced with no page errors. TeacherQuestionCapture.tsx:158 combines the old carried-text acknowledgement with the current in-memory lesson; useStore.ts:2769 and :2890 also treat that old attempt as settled. Family sweep: setAgendaTarget via LessonAgenda TargetPicker and Move to this class, deleteLesson/detachLesson, updateItem/retargetEntriesForItemInstrument, and deleteItem/detachItem all mutate the captured entry without invalidating its acknowledgement; focused state probes confirmed stale saved status for all five mutation cases. Shared consumers: ordinary/Plan ActiveBlock, bound/unbound Routine, Routine complete, Close and Today recovery. Checked clean: the live editor's own lesson picker, including blank-field failed-write retry, now tracks a fresh write; ordinary text autosave/retry uses its own acknowledgement; agenda/report readers retain lesson-id identity. Extend the existing unique test live teacher questions retain capture ownership while practice continues with refused and delayed external target/detachment writes, including unchanged or blank text, Done and reload. Do not label the changed target durable until its own persisted state is acknowledged.
- **live-question-recovery-has-a-valid-empty-exit** — Clearing a removed question after an answered failed save must leave a working Done exit without recreating it.
  _counterexample:_ At HEAD d4e2fa0, Chromium and WebKit: autosave Q; refuse a later edit; navigate to the item; restore storage and Remove this question; return to ActiveBlock; clear the field and press Done. The empty editor remains, Save as a new question and Copy are disabled, and + Ask teacher is unavailable. Repeated Done does nothing. Focused state proof shows status failed, closing true, and zero writes after Done. useStore.ts:2769 refuses settlement because the historical attempt failed, while :2805 returns without writing because both the field and agenda entry are absent; :2887 therefore cannot close. TeacherQuestionCapture.tsx:117 exposes no other enabled recovery action. This is one shared instance across ordinary/Plan ActiveBlock, bound/unbound Routine, Routine complete, Close and Today recovery; removeAgendaEntry from item and lesson QuestionRow reaches it. Checked clean: blank never-written captures close; blank captures whose existing record is retried have a real write route; acknowledged removed captures close; non-blank removed captures offer deliberate Save as a new question and Copy. Extend the existing unique test live teacher questions retain capture ownership while practice continues with failure plus removal plus blank Done, including a pending attempt later refused. Done must release the empty capture without resurrecting the removed record.

**What changed since the previously reviewed head:**

```diff
diff --git a/docs/practice-session-model.md b/docs/practice-session-model.md
index b5c9f6220bf0c87b2fc43bd9cc6cab51edce3b30..da7b6c1eb2453cf0650a5f7d3d0794d31fd2e396 100644
--- a/docs/practice-session-model.md
+++ b/docs/practice-session-model.md
@@ -264,7 +264,7 @@ by hand from the rules above.
 | ac-2 `next class work survives morning practice in every evening plan` | required = nearest class's non-resting preparations; seated in every build / regeneration / length change (12–120) whatever exposure or same-day practice, once each; class reasons honest, never "nothing else eligible"; stored dates and spacing untouched; counterexamples: uncommitted morning item, later / passed / archive / unassigned / question-only / other-instrument / resting | `candidatePool` → Today (`recommend`), build, swap; `nextPractice` → ItemDetail, CloseBlock; `planSegmentReason`, summary |
 | ac-3 `class plan capacity exceptions name omissions before any partial start` | floors 10 / 2; 20 → both works, 15 → one + named omission + minimum 20, 5 → nothing to start (needs 10); parts past the old segment count; parent + child both seated when both prepared, uncommitted relatives only with their own due review, siblings distinct; > 120 → partial, no impossible increase; tied classes; remove / swap → `edited` omission; a choice is bound to budget + subset + omissions + revision + day | SessionPlan coverage card, swap (a required item's floor applies even to the only row), Start ("Start without…"), `planStartRefusal` (a required item under its floor is `short`: never seated, never startable), store `startPlan` (installs only after the live recheck), store `beginPlanSegment` → `planSegmentStartable` (each segment's Start rechecks the LIVE required set and the item's floor as it is now: a required item grown into a whole work is refused `short`, unskipped, said on the PlanRunner row) |
 | ac-4 `routine feedback can be cleared without changing practice or retention` | Clear → `not_logged`, observation kept; `lastResult` = newest remaining assessment, absent when none, a newer one left alone; idempotent in memory, yet every Save / Try again writes again so a failed write is made durable; foreign / deleted block refuses all; minutes, scope, reviews, dates, spacing, status unchanged | RoutineCapture, `captureRoutineResults`, history (`recentResults`), Insights (`generateInsights`), report (`buildReportData`) |
-| ac-5 `live teacher questions retain capture ownership while practice continues` | words in `useLiveQuestion` (memory only) through ONE lifecycle: 800 ms quiet autosave, Done (closes once the latest write is acknowledged, writing a refused one again), Try again (always writes; with the field empty it writes the words the question holds), a class chosen after the question exists (a write with its own acknowledgement, even with the field empty), flush on leaving; owner frozen at open (`openQuestionCapture`), revalidated before the first write (`captureTargetProblem`, words kept on refusal); ONE question per capture — later writes update that id, a removed one is never recreated; blank never writes; only the latest attempt sets the status and every answered attempt settles; Saved = IndexedDB acknowledged those words; boundaries, Skip / Move on, the automatic end and background catch-up keep the field; clock, notes draft, markers, preparations and ranking untouched | ActiveBlock (ordinary, Plan), RoutineRunner (bound, unbound, boundary, Routine complete), CloseBlock (the live field beside its own independent question), Today (unsaved words only; any recovery screen, once it shows a capture, keeps it through its own acknowledged autosave or retry until Done), ItemDetail agenda, TeacherReport (by lesson id) |
+| ac-5 `live teacher questions retain capture ownership while practice continues` | words in `useLiveQuestion` (memory only) through ONE lifecycle: 800 ms quiet autosave, Done (closes once the latest write is acknowledged, writing a refused one again), Try again (always writes; with the field empty it writes the words the question holds), a class chosen after the question exists (a write with its own acknowledgement, even with the field empty), flush on leaving; owner frozen at open (`openQuestionCapture`), revalidated before the first write (`captureTargetProblem`, words kept on refusal); ONE question per capture — later writes update that id, a removed one is never recreated; blank never writes; only the latest attempt sets the status and every answered attempt settles; Saved = IndexedDB acknowledged the question as it stands — its words, class, item and instrument (`liveQuestionAcknowledged`), so a retarget, class or item deletion or move elsewhere is unconfirmed until the capture's own write lands, and Done writes it first; a blank field whose question was removed elsewhere closes with no write, never recreated; boundaries, Skip / Move on, the automatic end and background catch-up keep the field; clock, notes draft, markers, preparations and ranking untouched | ActiveBlock (ordinary, Plan), RoutineRunner (bound, unbound, boundary, Routine complete), CloseBlock (the live field beside its own independent question), Today (unsaved words only; any recovery screen, once it shows a capture, keeps it through its own acknowledged autosave or retry until Done), ItemDetail agenda, TeacherReport (by lesson id) |
 | ac-6 `metronome scheduling and cue priority survive sound lifecycle changes` | beats on the audio clock (`LOOKAHEAD_SECONDS`), one scheduler, tempo 40–240 from the next unplaced beat, late timer skips to the grid; stop cancels placed beats; context replacement, lost readiness, hidden, paused, left → stopped, never restarted; resume denied / rejected / never settled or landing late → no beat; cue ducks the beat for `CUE.totalSeconds`, a Start or restart inside the window still yields (per-tick routed level); claims once | `practiceCue` (`onContextReplaced`, `onPracticeCue`, `onSoundState`), `metronome.ts`, store start / resume doors |
 | ac-7 `live practice tools preserve clocks notes records and mobile controls` | the same, through real screens in Chromium and WebKit: tempo / level controls, question across a boundary and keyboard dismissal, notes durable, ring + cue at the target, freed-time cancel / spread then Start = preview, no extra blocks after a finished run and a reload | ActiveBlock, SessionPlan, RoutineRunner, Settings' test sound (unchanged), conformance sweep (`/active`, running routine) |
 
diff --git a/src/components/TeacherQuestionCapture.tsx b/src/components/TeacherQuestionCapture.tsx
index 34f47fcc7ac45b398da601ec57fc4f80e94f1ed1..1050bca8ad772a84c6d26df793a1759468619d95 100644
--- a/src/components/TeacherQuestionCapture.tsx
+++ b/src/components/TeacherQuestionCapture.tsx
@@ -7,6 +7,7 @@ import {
   editLiveQuestion,
   flushLiveQuestion,
   focusLiveQuestion,
+  liveQuestionAcknowledged,
   liveQuestionEntry,
   liveQuestionSettled,
   openLiveQuestion,
@@ -45,10 +46,11 @@ export default function TeacherQuestionCapture({
 }) {
   const capture = useLiveQuestion((s) => s.capture);
   const note = useLiveQuestion((s) => s.note);
+  const agenda = useStore((s) => s.db.lessonAgenda);
   // The capture this screen is showing (by its session): kept in view through its own saving, until Done.
   const [held, setHeld] = useState<string | null>(null);
   const shown =
-    capture && ((session !== undefined && capture.session === session) || !liveQuestionSettled(capture) || held === capture.session)
+    capture && ((session !== undefined && capture.session === session) || !liveQuestionSettled(capture, agenda) || held === capture.session)
       ? capture
       : null;
   if ((shown?.session ?? null) !== held) setHeld(shown?.session ?? null);
@@ -111,6 +113,8 @@ function QuestionEditor() {
     .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
   const words = capture.text.trim();
   const attempt = capture.attempt;
+  // The device's answer covers the question as written: changed elsewhere since, it is not "Saved".
+  const acknowledged = liveQuestionAcknowledged(capture, db.lessonAgenda);
 
   const copy = () => void navigator.clipboard?.writeText(capture.text).catch(() => undefined);
   let status: ReactNode = null;
@@ -155,6 +159,12 @@ function QuestionEditor() {
         Saving…
       </span>
     );
+  } else if (attempt && !acknowledged && (!words || attempt.carried === words)) {
+    status = (
+      <span className="tiny faint" role="status">
+        <span dir="ltr">Changed elsewhere — not yet confirmed on this device. Done saves it.</span>
+      </span>
+    );
   } else if (words && attempt?.carried === words) {
     status = (
       <span className="tiny" role="status">
diff --git a/src/store/useStore.ts b/src/store/useStore.ts
index 4bd4a48ae266b022d7077e0e779410e114b69958..67fc675f80240d2956ef9b7235d55f13cfde45bc 100644
--- a/src/store/useStore.ts
+++ b/src/store/useStore.ts
@@ -2706,8 +2706,13 @@ else useStore.persist.onFinishHydration(finishHydration);
 //    written one. A write the question needs anyway — Try again, or its class
 //    chosen with the field empty — carries the words it holds in memory, and
 //    is acknowledged like any other.
-//  - "Saved" is IndexedDB's acknowledgement of the words an attempt carried
-//    (`storageSettled` captured beside the write). Only the latest attempt
+//  - "Saved" is IndexedDB's acknowledgement of the question an attempt wrote
+//    — its words, class, item and instrument as they stood (`storageSettled`
+//    captured beside the write). A change to that question elsewhere (its
+//    class retargeted or deleted, its item moved or deleted) is not covered
+//    by it: the capture is unacknowledged again until its own write lands.
+//    A question removed elsewhere leaves a blank field nothing to write: Done
+//    lets it go, never recreating it. Only the latest attempt
 //    may set the status; any answered attempt settles (never stuck saving);
 //    an older acknowledgement never closes or clears newer words.
 //  - A failure keeps the words, owner and id; Try again always writes again.
@@ -2726,7 +2731,7 @@ export interface LiveQuestion {
   /** The agenda question this capture writes — set by its first write, never replaced. */
   questionId?: ID;
   /** The latest attempt: the words it carried and how the device answered. */
-  attempt?: { seq: number; carried: string; status: 'saving' | 'saved' | 'failed' };
+  attempt?: { seq: number; carried: string; wrote: string; status: 'saving' | 'saved' | 'failed' };
   /** The newest words IndexedDB acknowledged for this capture. */
   written?: string;
   /** Done was tapped: close once the latest words are acknowledged. */
@@ -2760,16 +2765,27 @@ export function liveQuestionEntry(capture: LiveQuestion, agenda: PracticeDB['les
   return capture.questionId ? agenda.find((e): e is LessonQuestion => e.id === capture.questionId && e.kind === 'question') : undefined;
 }
 
+/** What a write leaves on the device for this question: compared by value, so a rebuilt (synced, imported) entry still matches. */
+const questionState = (e: LessonQuestion) => JSON.stringify([e.text, e.lessonId ?? null, e.itemId ?? null, e.instrumentId]);
+
+/** IndexedDB acknowledged the question exactly as it stands now — not merely the words, its class, item and instrument too. */
+export function liveQuestionAcknowledged(capture: LiveQuestion, agenda: PracticeDB['lessonAgenda']): boolean {
+  const entry = liveQuestionEntry(capture, agenda);
+  return !!entry && capture.attempt?.status === 'saved' && capture.attempt.wrote === questionState(entry);
+}
+
 /**
- * Nothing of this capture is left to write: its words acknowledged as they
- * stand, or a blank field with no write outstanding. A blank field whose
- * question's last write failed is NOT settled — the question exists in memory
- * with words the device refused.
+ * Nothing of this capture is left to write: its question acknowledged as it
+ * stands, or a blank field with nothing outstanding — never written, or its
+ * question removed elsewhere (never recreated). A blank field whose question's
+ * last write failed, or which changed elsewhere since, is NOT settled.
  */
-export function liveQuestionSettled(capture: LiveQuestion): boolean {
+export function liveQuestionSettled(capture: LiveQuestion, agenda: PracticeDB['lessonAgenda']): boolean {
   const words = capture.text.trim();
-  if (!words) return !capture.attempt || capture.attempt.status === 'saved';
-  return capture.attempt?.status === 'saved' && capture.attempt.carried === words;
+  if (!capture.questionId) return !words;
+  const acknowledged = liveQuestionAcknowledged(capture, agenda);
+  if (!words) return acknowledged || !liveQuestionEntry(capture, agenda);
+  return acknowledged && capture.attempt!.carried === words;
 }
 
 export function openLiveQuestion(instrumentId: ID, itemId: ID | undefined, session: string): void {
@@ -2804,7 +2820,8 @@ export function saveLiveQuestion(force = false): void {
   // chosen) still writes the question, carrying the words it holds in memory.
   const words = capture.text.trim() || (force && entry ? entry.text : '');
   if (!words) return;
-  if (!force && capture.attempt?.carried === words && capture.attempt.status !== 'failed') return;
+  const attempt = capture.attempt;
+  if (!force && attempt?.carried === words && (attempt.status === 'saving' || liveQuestionAcknowledged(capture, store.db.lessonAgenda))) return;
   let questionId = capture.questionId;
   if (questionId) {
     // Its own question, or nothing: removed elsewhere, it is never recreated.
@@ -2816,9 +2833,10 @@ export function saveLiveQuestion(force = false): void {
     if (!questionId) return;
   }
   const seq = ++attempts;
-  // Captured in the same tick as the write: this attempt's own outcome.
+  // Captured in the same tick as the write: this attempt's own outcome, and the question it wrote.
   const written = storageSettled();
-  patchLive({ questionId, attempt: { seq, carried: words, status: 'saving' } });
+  const wrote = questionState(liveQuestionEntry({ ...capture, questionId }, useStore.getState().db.lessonAgenda)!);
+  patchLive({ questionId, attempt: { seq, carried: words, wrote, status: 'saving' } });
   const settle = (ok: boolean) => {
     const now = liveCapture();
     if (now?.questionId !== questionId) return; // closed, or another capture
@@ -2829,12 +2847,15 @@ export function saveLiveQuestion(force = false): void {
       patch.written = words;
     }
     if (latest) {
-      patch.attempt = { seq, carried: words, status: ok ? 'saved' : 'failed' };
+      patch.attempt = { seq, carried: words, wrote, status: ok ? 'saved' : 'failed' };
       if (!ok) patch.closing = false;
     }
     patchLive(patch);
     const after = liveCapture()!;
-    if (latest && ok && after.closing && liveQuestionSettled(after)) finishLiveQuestion();
+    if (!(latest && ok && after.closing)) return;
+    // Done waits on THIS question: changed elsewhere meanwhile, it is written again before closing.
+    if (liveQuestionSettled(after, useStore.getState().db.lessonAgenda)) finishLiveQuestion();
+    else saveLiveQuestion(true);
   };
   written.then(
     () => settle(true),
@@ -2887,11 +2908,12 @@ export function flushLiveQuestion(): void {
 export function closeLiveQuestion(): void {
   const capture = liveCapture();
   if (!capture) return;
-  if (liveQuestionSettled(capture)) return finishLiveQuestion();
+  if (liveQuestionSettled(capture, useStore.getState().db.lessonAgenda)) return finishLiveQuestion();
   patchLive({ closing: true });
-  // A refused write is written again (with an empty field too): Done never
-  // closes over words, or a class, the device has not acknowledged.
-  saveLiveQuestion(capture.attempt?.status === 'failed');
+  // Unless a write is already on its way, the question is written again (with
+  // an empty field too): Done never closes over words, or a class, the device
+  // has not acknowledged.
+  saveLiveQuestion(capture.attempt?.status !== 'saving');
 }
 
 function finishLiveQuestion(): void {
diff --git a/tests/live-practice-families.test.ts b/tests/live-practice-families.test.ts
index 5735c8d240bdeba3943eba2917583ae7fce5fdab..d5cccd299b82ba2a12661afbbcb90d5cd6ac776d 100644
--- a/tests/live-practice-families.test.ts
+++ b/tests/live-practice-families.test.ts
@@ -891,7 +891,7 @@ describe('the live question lifecycle', () => {
     live.editLiveQuestion('');
     live.saveLiveQuestion();
     await answer(true);
-    expect([cap()!.attempt?.status, cap()!.written, live.liveQuestionSettled(cap()!), qs().map((q) => [q.id, q.text])]).toEqual(['saved', 'Which finger for the trill?', true, [[id, 'Which finger for the trill?']]]);
+    expect([cap()!.attempt?.status, cap()!.written, live.liveQuestionSettled(cap()!, useStore.getState().db.lessonAgenda), qs().map((q) => [q.id, q.text])]).toEqual(['saved', 'Which finger for the trill?', true, [[id, 'Which finger for the trill?']]]);
     // …and on failure: settled as failed, never saving, and not "settled" — the
     // question in memory holds words the device refused; Try again writes them.
     answer = hold();
@@ -899,7 +899,7 @@ describe('the live question lifecycle', () => {
     live.saveLiveQuestion();
     live.editLiveQuestion('  ');
     await answer(false);
-    expect([cap()!.attempt?.status, cap()!.written, live.liveQuestionSettled(cap()!)]).toEqual(['failed', 'Which finger for the trill?', false]);
+    expect([cap()!.attempt?.status, cap()!.written, live.liveQuestionSettled(cap()!, useStore.getState().db.lessonAgenda)]).toEqual(['failed', 'Which finger for the trill?', false]);
     live.closeLiveQuestion(); // Done never closes over refused words
     expect(cap()).not.toBeNull();
     live.saveLiveQuestion(true);
@@ -968,16 +968,81 @@ describe('the live question lifecycle', () => {
     const w0 = storage.writes;
     live.chooseLiveQuestionLesson(undefined);
     await flush();
-    expect([cap()!.attempt?.status, cap()!.attempt?.carried, live.liveQuestionSettled(cap()!)]).toEqual(['failed', 'Class question', false]);
+    expect([cap()!.attempt?.status, cap()!.attempt?.carried, live.liveQuestionSettled(cap()!, useStore.getState().db.lessonAgenda)]).toEqual(['failed', 'Class question', false]);
     live.closeLiveQuestion();
     await flush();
     expect([cap()?.questionId, cap()?.attempt?.status, storage.writes - w0 >= 3]).toEqual([id3, 'failed', true]);
     storage.fail = false;
     live.saveLiveQuestion(true);
     await flush();
-    expect([cap()!.attempt?.status, live.liveQuestionSettled(cap()!), qs().find((q) => q.id === id3)!.lessonId]).toEqual(['saved', true, undefined]);
+    expect([cap()!.attempt?.status, live.liveQuestionSettled(cap()!, useStore.getState().db.lessonAgenda), qs().find((q) => q.id === id3)!.lessonId]).toEqual(['saved', true, undefined]);
     live.closeLiveQuestion();
     expect([cap(), live.useLiveQuestion.getState().note]).toEqual([null, 'Question saved on this device — unassigned.']);
+
+    // ITS QUESTION CHANGED ELSEWHERE: the acknowledgement covered the question
+    // as written, so every mutator that moves it (class retargeted or deleted,
+    // item moved or deleted) leaves it unacknowledged — refused, Done stays
+    // open; answered, Done writes and closes saying the new one. With words,
+    // and with the field empty.
+    const agenda = () => useStore.getState().db.lessonAgenda;
+    const onDiskQ = (qid: string) => (JSON.parse(storage.last) as { state: { db: PracticeDB } }).state.db.lessonAgenda.find((e) => e.id === qid) as { lessonId?: string; itemId?: string; instrumentId: string } | undefined;
+    const mutators: [string, () => void, string][] = [
+      ['agenda target', () => useStore.getState().setAgendaTarget(cap()!.questionId!, undefined), 'Question saved on this device — unassigned.'],
+      ['lesson deleted', () => useStore.getState().deleteLesson('L2'), 'Question saved on this device — unassigned.'],
+      ['item moved', () => void useStore.getState().updateItem('b', { instrumentId: TAR }), 'Question saved on this device — unassigned.'],
+      ['item deleted', () => useStore.getState().deleteItem('b'), 'Question saved on this device for 2026-10-31.'],
+    ];
+    for (const blank of [false, true]) {
+      for (const [name, mutate, note] of mutators) {
+        useStore.setState({ db: db({ items: [item('a', 'A'), item('b', 'B')], lessons: [L, lesson('L2', '2026-10-31')] }) });
+        live.openLiveQuestion(SETAR, 'b', 's4');
+        live.chooseLiveQuestionLesson('L2');
+        live.editLiveQuestion('Moved question');
+        live.saveLiveQuestion();
+        await flush();
+        const qid = cap()!.questionId!;
+        if (blank) live.editLiveQuestion('');
+        expect(live.liveQuestionSettled(cap()!, agenda()), name).toBe(true);
+        storage.fail = true;
+        mutate();
+        await flush();
+        expect([live.liveQuestionAcknowledged(cap()!, agenda()), live.liveQuestionSettled(cap()!, agenda())], name).toEqual([false, false]);
+        live.closeLiveQuestion();
+        await flush();
+        expect([cap()?.questionId, cap()?.attempt?.status, live.useLiveQuestion.getState().note], name).toEqual([qid, 'failed', null]);
+        storage.fail = false;
+        live.closeLiveQuestion();
+        await flush();
+        const now = agenda().find((e) => e.id === qid)!;
+        expect([cap(), live.useLiveQuestion.getState().note, JSON.stringify(onDiskQ(qid))], name).toEqual([null, note, JSON.stringify(now)]);
+      }
+    }
+
+    // REMOVED ELSEWHERE after a refused write, the field then cleared: Done
+    // lets the capture go — no write, nothing recreated, nothing claimed. Also
+    // when the refusal lands after the removal.
+    for (const late of [false, true]) {
+      useStore.setState({ db: db({ items: [item('a', 'A')], lessons: [L] }) });
+      live.openLiveQuestion(SETAR, 'a', 's5');
+      live.editLiveQuestion('To be removed');
+      live.saveLiveQuestion();
+      await flush();
+      const qid = cap()!.questionId!;
+      const refuse = late ? hold() : null;
+      if (!late) storage.fail = true;
+      live.editLiveQuestion('Refused edit');
+      live.saveLiveQuestion();
+      await flush();
+      storage.fail = false;
+      useStore.getState().removeAgendaEntry(qid);
+      if (refuse) await refuse(false);
+      expect(cap()!.attempt?.status, String(late)).toBe('failed');
+      live.editLiveQuestion('');
+      const w = storage.writes;
+      live.closeLiveQuestion();
+      await flush();
+      expect([cap(), live.useLiveQuestion.getState().note, storage.writes - w, agenda().filter((e) => e.id === qid)], String(late)).toEqual([null, null, 0, []]);
+    }
   });
 });
 
diff --git a/tests/live-practice.browser.test.ts b/tests/live-practice.browser.test.ts
index c039cc8bd6942d04bad110793028ad3597da7380..ea4f2d5e45fa31f9141972a8629a25d82eae7969 100644
--- a/tests/live-practice.browser.test.ts
+++ b/tests/live-practice.browser.test.ts
@@ -310,6 +310,10 @@ describe('asking the teacher while practising', () => {
         const SAVED_L0 = `Saved on this device for ${L0_LABEL}.`;
         const FAILED_EMPTY = "Not saved — this device refused your question's last change. The field is empty.";
         const EMPTY_KEPT = 'The field is empty — nothing new is saved; your saved question stays as it was.';
+        const CHANGED = 'Changed elsewhere — not yet confirmed on this device. Done saves it.';
+        const FAILED_WORDS = 'Not saved — this device refused the write. Your words are still here.';
+        /** One question's own row in an agenda list (the innermost card holding its words). */
+        const questionRow = (text: string) => page.locator('.card-quiet').filter({ hasText: text }).last();
 
         // --- ORDINARY: a notes draft open, the clock running -----------------
         await startBlock(app, A, A_TITLE);
@@ -481,17 +485,32 @@ describe('asking the teacher while practising', () => {
 
         // DETACHED underneath: a chosen class deleted after its question exists —
         // the question keeps its id, now unassigned, and later words update it,
-        // never reattached.
+        // never reattached. The deletion REFUSED by the device: the earlier
+        // acknowledgement (for the deleted class) never stands for it — no
+        // Saved, Done stays open, the device keeps the old class until a write
+        // of the capture's own lands.
         await page.getByRole('button', { name: '+ Ask teacher' }).click();
         await askBox(page).fill('Is the bow too heavy?');
         await page.getByLabel('Ask at', { exact: true }).selectOption('L-40');
         await askStatus(page, `Saved on this device for ${L1_LABEL}.`).waitFor();
         const q4 = await questionLanded(app, 'Is the bow too heavy?');
         expect(q4.lessonId, engine).toBe('L-40');
+        await breakStorage(page);
         await goTo(app, '/lessons');
         await page.getByRole('article').filter({ hasText: L1_LABEL }).getByRole('button', { name: 'Delete lesson' }).click();
         await goTo(app, '/active');
+        await askStatus(page, CHANGED).waitFor();
+        expect(await page.getByText(/Saved on this device|^Question saved on this device/).count(), engine).toBe(0);
+        await ask(page).getByRole('button', { name: 'Done' }).click();
+        await askStatus(page, FAILED_WORDS).waitFor();
+        await page.clock.runFor(1_000);
+        await askBox(page).waitFor();
+        expect(await page.getByText(/^Question saved on this device/).count(), engine).toBe(0);
+        expect(questions(await db(app)).find((q) => q.id === q4.id)!.lessonId, engine).toBe('L-40');
+        await repairStorage(page);
+        await ask(page).getByRole('button', { name: 'Try again' }).click();
         await askStatus(page, 'Saved on this device — unassigned.').waitFor();
+        await persistedUntil(app, (st) => questions((st.state as { db: Db }).db).find((q) => q.id === q4.id), (q) => !!q && q.lessonId === undefined);
         await askBox(page).fill('Is the bow too heavy here?');
         await page.clock.runFor(800);
         await askStatus(page, 'Saved on this device — unassigned.').waitFor();
@@ -499,6 +518,32 @@ describe('asking the teacher while practising', () => {
         expect([q4b.id, q4b.lessonId], engine).toEqual([q4.id, undefined]);
         await ask(page).getByRole('button', { name: 'Done' }).click();
 
+        // RETARGETED in the item's agenda with the field EMPTY, the device
+        // refusing: the same — Done neither closes nor claims "unassigned"
+        // while the device still holds the class; once a write lands it does.
+        await page.getByRole('button', { name: '+ Ask teacher' }).click();
+        await askBox(page).fill('Which bow for the turn?');
+        await page.clock.runFor(800);
+        await askStatus(page, SAVED_L0).waitFor();
+        const q7 = await questionLanded(app, 'Which bow for the turn?');
+        await askBox(page).fill('');
+        await breakStorage(page);
+        const picker = questionRow('Which bow for the turn?').getByRole('combobox', { name: 'Ask at which class' });
+        await goTo(app, `/items/${A}`, { arrival: picker });
+        await picker.selectOption('');
+        await goTo(app, '/active');
+        await askStatus(page, CHANGED).waitFor();
+        await ask(page).getByRole('button', { name: 'Done' }).click();
+        await askStatus(page, FAILED_EMPTY).waitFor();
+        await page.clock.runFor(1_000);
+        await askBox(page).waitFor();
+        expect(await page.getByText(/^Question saved on this device/).count(), engine).toBe(0);
+        expect(questions(await db(app)).find((q) => q.id === q7.id)!.lessonId, engine).toBe(L0);
+        await repairStorage(page);
+        await ask(page).getByRole('button', { name: 'Done' }).click();
+        await page.getByText('Question saved on this device — unassigned.').waitFor();
+        await persistedUntil(app, (st) => questions((st.state as { db: Db }).db).find((q) => q.id === q7.id), (q) => !!q && q.lessonId === undefined && q.text === 'Which bow for the turn?');
+
         // FINISH before the pause, its flush still pending: the editor is there
         // on Close, Saving, until the device answers; Close's own question stays
         // independent.
@@ -677,6 +722,43 @@ describe('asking the teacher while practising', () => {
         await askStatus(page, 'Saved on this device — unassigned.').waitFor();
         const renewed = await questionLanded(app, 'Typed across midnight, kept');
         expect([renewed.id === late.id, renewed.itemId, renewed.lessonId], engine).toEqual([false, C, undefined]);
+        await ask(page).getByRole('button', { name: 'Done' }).click();
+
+        // REMOVED after a write the device refused — or one it refuses later,
+        // while the removal is on its way — then the field cleared: Done lets
+        // the capture go, writing nothing and recreating nothing.
+        for (const pending of [false, true]) {
+          const words = pending ? 'Removed while pending' : 'Removed after a refusal';
+          await page.getByRole('button', { name: '+ Ask teacher' }).click();
+          await askBox(page).fill(words);
+          await page.clock.runFor(800);
+          await askStatus(page, 'Saved on this device — unassigned.').waitFor();
+          const gone = await questionLanded(app, words);
+          if (pending) {
+            await holdWrites(page);
+            await askBox(page).fill(`${words}, edited`);
+            await page.clock.runFor(800);
+            await askStatus(page, 'Saving…').waitFor();
+          } else {
+            await breakStorage(page);
+            await askBox(page).fill(`${words}, edited`);
+            await page.clock.runFor(800);
+            await askStatus(page, FAILED_WORDS).waitFor();
+            await repairStorage(page);
+          }
+          const remove = questionRow(`${words}, edited`).getByRole('button', { name: 'Remove this question' });
+          await goTo(app, `/items/${C}`, { arrival: remove });
+          await remove.click();
+          if (pending) await answerWrites(page, false);
+          await goTo(app, '/active');
+          await askStatus(page, 'This question was removed from your class list — these words are not saved.').waitFor();
+          await askBox(page).fill('');
+          await ask(page).getByRole('button', { name: 'Done' }).click();
+          await page.getByRole('button', { name: '+ Ask teacher' }).waitFor();
+          expect(await page.getByText(/^Question saved on this device/).count(), engine).toBe(0);
+          // (A removal the device refused lands with the next write: the reload below holds neither.)
+          if (!pending) expect(questions(await db(app)).some((q) => q.id === gone.id), engine).toBe(false);
+        }
         await page.getByRole('button', { name: 'Discard block' }).click();
         await page.getByRole('navigation', { name: 'Primary' }).waitFor();
 
@@ -702,9 +784,10 @@ describe('asking the teacher while practising', () => {
             ['Typed across midnight, kept', C, null],
             ['Typed as the run ends', B, L0],
             ['Which string first?', A, L0],
+            ['Which bow for the turn?', A, null],
           ].sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
         );
-        expect(new Set(questions(end).map((q) => q.id)).size, engine).toBe(13);
+        expect(new Set(questions(end).map((q) => q.id)).size, engine).toBe(14);
         expect(questions(end).find((q) => q.text === 'Should I slow down here?')!.id, engine).toBe(q1.id);
         expect(end.lessonAgenda.filter((e) => e.kind === 'preparation'), engine).toEqual(preparations);
         const withoutQuestions = end.lessonAgenda.filter((e) => e.kind !== 'question');
```

**Paths the rework touched:**

- `docs/practice-session-model.md`
- `src/components/TeacherQuestionCapture.tsx`
- `src/store/useStore.ts`
- `tests/live-practice-families.test.ts`
- `tests/live-practice.browser.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
470534c Rework: a live question's acknowledgement covers the question as written, and an empty capture of a removed question closes

Invariant: "Saved" / settled means IndexedDB acknowledged the agenda question
as it stands now — its words, class, item and instrument — never just the
words an earlier attempt carried; and a capture with nothing left to write
(blank field, its question removed elsewhere) always has a working Done exit
that writes nothing and recreates nothing.

Choke point: src/store/useStore.ts. Each attempt records a value fingerprint
of the entry it wrote (questionState). liveQuestionAcknowledged compares it
with the entry now; liveQuestionSettled takes the agenda and uses it (blank +
removed => settled). The coalescing early return, closeLiveQuestion (forces a
write unless one is in flight) and a closing settle (writes again when the
question changed meanwhile) all route through it. TeacherQuestionCapture
renders the same predicates: no Saved/empty-kept line while unacknowledged,
"Changed elsewhere — not yet confirmed" instead.

Consumers enumerated:
- Mutators of the captured entry — setAgendaTarget (LessonAgenda TargetPicker,
  Move to this class), deleteLesson/detachLesson, updateItem →
  retargetEntriesForItemInstrument, deleteItem/detachItem, and wholesale
  replacements (import, sync, restore): fixed by the fingerprint, no per-site
  code. removeAgendaEntry (item and lesson QuestionRow): fixed by the
  blank+removed settlement.
- Readers of settlement: TeacherQuestionCapture `shown` (ordinary/Plan
  ActiveBlock, bound/unbound Routine, Routine complete, Close, Today
  recovery — all one component), its status line, closeLiveQuestion, the
  settle continuation, finishLiveQuestion's note: fixed/checked.
- Checked clean: the live editor's own class picker (forced write, new
  fingerprint); ordinary text autosave/retry; non-blank removed capture still
  keeps words with Save as a new question / Copy; agenda/report lesson-id
  readers unchanged.


… (truncated)
```

## Check against the contract

- [ ] **ac-1** — Plan and Routine previews: leave/spread/chosen target, repeated remove/transfer, full/no eligible recipients, cancelled choice, all removed, prior unused remainder, role caps, short-on-time/fitted Routine. Literal minute accounting proves no double-spend, no automatic reorder/regeneration and saved routine unchanged; Start uses exactly the preview. Running Skip/Move on/early Finish retain their old accounting. Exact title names one test; use table-driven cases inside it and supporting existing regression checks. _(proof: preview time choices preserve identity order capacity and unused remainders)_
- [ ] **ac-2** — Fixed local day: at least two class items and fresh competitors, morning ordinary assessed and Routine not_logged blocks, heavy recent minutes, evening build/regenerate/length change/swap. Every exact required item appears when floors fit; no duplicate id, no lower-priority optional displacement, no false repeat reason. Include manual/protected distant dates, working/keep-fresh and uncommitted/future/passed/archive/unassigned/other-instrument/resting counterexamples; inputs, stored dates and spacing stay untouched. Sweep Today and nextPractice explanations as specified. Exact title names one test; use table-driven cases inside it and supporting existing regression checks. _(proof: next class work survives morning practice in every evening plan)_
- [ ] **ac-3** — Literal fixtures: 2 whole works at 20 and 15 minutes; a whole work at 5; several 2-minute parts; explicitly committed parent plus child, only parent, only child, siblings, own-due-review relative, >120 required minutes and equal-date lessons. Prove reserved floors, optional roles yield, exact omitted titles/minimum capacity, explicit partial selection and no silent start. Removal/swap overrides and changed lesson/day/revision invalidate stale coverage acknowledgement without destroying manual order. Exact title names one test; use table-driven cases inside it and supporting existing regression checks. _(proof: class plan capacity exceptions name omissions before any partial start)_
- [ ] **ac-4** — Select-clear before Save; save-clear-save; observations retained; repeated saves/retries; multiple items; foreign/deleted block refused atomically. Clearing latest assessed block restores older result or no lastResult when none exists, leaves a newer assessment alone. Exact block minutes/scope, reviews/dates/spacing/readiness unchanged, results visible honestly in item/history/Insights/report consumers. Exact title names one test; use table-driven cases inside it and supporting existing regression checks. _(proof: routine feedback can be cleared without changing practice or retention)_
- [ ] **ac-5** — Real UI in Chromium and WebKit: prove quiet-interval autosave without pressing Save for ordinary, Plan and Routine (bound/unbound), then more typing updates the SAME question id without closing or stealing focus. Cover shorter-than-quiet exits; blur/close, navigation and Finish before autosave or while persistence is pending; intermediate boundaries, manual Move on/Skip/Finish, final automatic Routine completion and background catch-up across several boundaries through completion. The open draft/controls and failed/pending recovery remain available, with frozen original item/instrument/lesson ownership. Cover no lesson/unassigned, deliberate lesson choice, changed/deleted/moved/cross-instrument targets, midnight, and saved-question deletion/detachment without resurrection or silent retargeting. Opening/closing blank or whitespace creates nothing. After a non-blank write, clearing to empty/whitespace while pending creates no blank question, preserves the last non-blank record and settles acknowledgement truthfully, never stuck Saving. Inject delayed success/failure after agenda append; edit to newer non-blank text during the earlier write, then autosave/Done/exit/retry and late outcomes. Assert latest words remain editable and are neither overwritten nor cleared/closed by an older acknowledgement; only the relevant acknowledged write may show Saved. Failure retains words/ownership and an actionable retry across internal navigation; retry really writes when memory is unchanged. Repeated autosaves, immediate saves, closes and retries produce exactly one question per capture; a deliberately new capture and a later CloseBlock question stay independent. Reload after acknowledged autosave and after failure/retry restores exact latest acknowledged text, id and ownership once, shown in lesson-id lists/report; do not label unacknowledged or failed text durable. Assert unchanged clock identity/elapsed progression, practice minutes/blocks, Plan/Routine accounting, focus/mode, note drafts, metronome/cue markers, preparations/ranking and retention, allowing only their normal independent progression. Use deterministic state-discriminating cases inside the existing exact unique test; support with focused pure/lifecycle checks where appropriate, never substitute component probes for the reachable UI boundary and pending-write regressions. _(proof: live teacher questions retain capture ownership while practice continues)_
- [ ] **ac-6** — Controlled audio timeline and fake contexts: bounded tempo edits, start/stop, rapid toggles, denied/rejected/never-settled resume, dead running/suspended/interrupted/closed context, fresh readying tap/test replacement, old callback/remount, pause/finish/discard/navigation/hidden. No orphan scheduled beat, stacked loop or late burst. Cue retains once-only claim and priority/ducking then correct beat cadence, with literal timestamps/levels rather than source assertions; unavailable audio remains usable practice. Exact title names one test; use table-driven cases inside it and supporting existing regression checks. _(proof: metronome scheduling and cue priority survive sound lifecycle changes)_
- [ ] **ac-7** — Chromium and WebKit journeys via real UI for ordinary/Plan/Routine, running question input and tempo controls across boundary and keyboard dismissal, stop/resume/reload after a finished run. Assert no extra minutes/blocks, notes remain durable, order/unfinished practice preserved, sound recovery doors work, hidden/paused metronome stops and visual cue remains. Reuse existing harness and conformance/direction/pressed-state checks without weakening them. Exact title names one test; use table-driven cases inside it and supporting existing regression checks. _(proof: live practice tools preserve clocks notes records and mobile controls)_
- [ ] **ac-8** — One bounded real-practice walkthrough with Setar: MacBook and iPhone Safari plus installed PWA over HTTPS, normal media volume beside the instrument. Check cue clearly distinguishable/audible with and without metronome, comfortable BPM/level edits, boundary priority, sound recovery after idle/interruption and quick teacher capture/keyboard return while timer and beat continue. Record devices/versions/output and actual observations; automation cannot certify speaker volume or musical usability. Only reproducible failures of these promised controls/audibility require adjustment, not an open-ended taste review. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/plan.ts, src/store/useStore.ts
- **back-up-and-restore** — touched via src/pages/Settings.tsx, src/store/useStore.ts
- **capture-a-practice-item** — touched via src/store/useStore.ts
- **clear-a-due-review** — touched via src/pages/Today.tsx, src/store/useStore.ts
- **install-the-app-and-keep-it-current** — touched via src/pages/Settings.tsx
- **log-a-class** — touched via src/store/useStore.ts
- **point-this-device-at-the-nas** — touched via src/pages/Settings.tsx
- **practise-todays-recommendation** — touched via src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/practiceSessionModel.ts
- **prepare-for-the-next-class** — touched via src/domain/questions.ts, src/pages/CloseBlock.tsx
- **run-a-session-plan** — touched via src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/domain/plan.ts, src/store/useStore.ts
- **see-practice-patterns** — touched via src/pages/Today.tsx
- **sync-devices-via-github** — touched via src/pages/Settings.tsx
- **work-a-pathway-stage** — touched via src/pages/RoutineRunner.tsx, src/domain/routines.ts, src/store/useStore.ts

**Possibly affected (shares a mechanic with a detected flow):**

- **browse-my-repertoire** — shares entity "PracticeItem" with "adjust-how-scheduling-works"

**What the agent reported:**

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## install-the-app-and-keep-it-current — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## point-this-device-at-the-nas — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## sync-devices-via-github — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — unchanged

Repertoire browsing, search and item opening are untouched; only the class-preparation sentence on an item's Next practice line changed, which belongs to practise-todays-recommendation.

## capture-a-practice-item — unchanged

No creation path changed: Quick add and Add practice item are untouched; a mid-practice question is a lesson-agenda entry, never an item.

## clear-a-due-review — unchanged

Due reviews, Not now and Snooze are untouched; class reservation and freed-time choices never write a review row, a date or spacing state (proved in ac-2 and ac-4).

## log-a-class — unchanged

Recording a lesson and turning it into preparations is unchanged; questions asked mid-practice land in the same agenda the lesson page already lists (prepare-for-the-next-class carries that change).

## see-practice-patterns — unchanged

Insights reads results and lastResult as before; clearing a routine result now leaves lastResult following the remaining history, so a cleared result is no longer announced (ac-4) — the read itself is unchanged.

## practise-todays-recommendation — truth-proposed

Behaviour changed as approved for issue #58; the update is proposed in .prismatica/flows/proposals/practise-todays-recommendation.md for the owner's review.

## run-a-session-plan — truth-proposed

Behaviour changed as approved for issue #58; the update is proposed in .prismatica/flows/proposals/run-a-session-plan.md for the owner's review.

## work-a-pathway-stage — truth-proposed

Behaviour changed as approved for issue #58; the update is proposed in .prismatica/flows/proposals/work-a-pathway-stage.md for the owner's review.

## prepare-for-the-next-class — truth-proposed

Behaviour changed as approved for issue #58; the update is proposed in .prismatica/flows/proposals/prepare-for-the-next-class.md for the owner's review.

## adjust-how-scheduling-works — truth-proposed

Behaviour changed as approved for issue #58; the update is proposed in .prismatica/flows/proposals/adjust-how-scheduling-works.md for the owner's review.


**Gaps between detected and reported:**

_None — the report matches what was detected._

## Flow truth this change touches

### adjust-how-scheduling-works — Works now (update proposed)

Proposed step changes:
− Practice Compass States the real priority formula, how each item comes back — working on it (1–3 days), kept fresh (spaced repetition on a whole-item check), class preparation before its class — and the spaced-repetition rungs, in plain English, filled in with the values currently in force.
−   Shows: The priority terms, the working return days, the current first/second/slip-reset gaps, and how importance and difficulty pull material sooner.
+ Practice Compass States the real priority formula, how each item comes back — working on it (1–3 days), kept fresh (spaced repetition on a whole-item check), class preparation before its class (still available after practising it the same day, and seated in a Session Plan whenever it fits) — and the spaced-repetition rungs, in plain English, filled in with the values currently in force.
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

### capture-a-practice-item — Works now

Touchpoints: src/components/QuickAdd.tsx, src/components/ItemForm.tsx, src/components/itemKinds.ts, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts

Evidence: 4 steps: 4 manually verified

### clear-a-due-review — Works now

Touchpoints: src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/selectors.ts

Evidence: 4 steps: 4 manually verified

### install-the-app-and-keep-it-current — Works now

Touchpoints: src/components/Layout.tsx, src/pages/Settings.tsx, vite.config.ts

Evidence: 4 steps: 4 manually verified

### log-a-class — Works now

Touchpoints: src/pages/Lessons.tsx, src/components/Attachments.tsx, src/domain/recordings.ts, src/domain/setarClasses.ts, src/domain/files.ts, src/domain/selectors.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### point-this-device-at-the-nas — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/Lessons.tsx, src/domain/recordings.ts, src/store/backup.ts

Evidence: 3 steps: 3 manually verified

### practise-todays-recommendation — Works now (update proposed)

Proposed step changes:
  The musician Taps their instrument in the switcher at the top of Today.
    Shows: Everything below is scoped to that instrument: recommendation, class work, due reviews, pathway position.
    Changes: The chosen instrument is remembered as the session instrument.
− Practice Compass Scores every item of that instrument from the one candidate pool Today, a plan's build, regeneration and swaps share — work already practised today (class work and an unassessed routine block included) steps aside while anything else waits — and shows the best one with a one-sentence reason.
−   Shows: One 'Practise now' card above the fold, plus up to two quieter 'then, if you have time' suggestions; a piece and its own part never take two cards unless the other has its own due review, and a repeat says plainly that nothing else is waiting.
+ Practice Compass Scores every item of that instrument from the one candidate pool Today, a plan's build, regeneration and swaps share — work already practised today (an unassessed routine block included) steps aside while anything else waits, except work prepared for an upcoming class, which stays available until that class — and shows the best one with a one-sentence reason.
+   Shows: One 'Practise now' card above the fold, plus up to two quieter 'then, if you have time' suggestions; a piece and its own part never take two cards unless the other has its own due review; a repeat says plainly that nothing else is waiting, and class work practised earlier today says it stays available until its class.
  The musician Taps 'Start · 10 min'.
    Shows: The active block screen: item title, mode and focus chips, a running ring timer.
    Changes: A practice block is opened in memory with mode, focus and a 10-minute target derived from the item. The same tap closes the page's sound context and creates and resumes a fresh one, so a context that died while the app sat idle never outlives this tap.
− The musician Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
−   Shows: The elapsed clock, and the item's notes on request. While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake (best-effort; feature-detected; never affects elapsed time); pausing, finishing, discarding or navigating away releases it. Resume is a tap too and readies a fresh sound context again; if sound is paused or off on this page, a note says so and offers 'Turn on sound'. The item's Working notes save themselves after a short pause and whenever the musician leaves them — Done is optional, and a draft lands on the item it was typed for.
−   Changes: Elapsed seconds accumulate only while the timer runs.
+ The musician Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
+   Shows: The elapsed clock, and the item's notes on request. While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake (best-effort; feature-detected; never affects elapsed time); pausing, finishing, discarding or navigating away releases it. Resume is a tap too and readies a fresh sound context again; if sound is paused or off on this page, a note says so and offers 'Turn on sound'. The item's Working notes save themselves after a short pause and whenever the musician leaves them — Done is optional, and a draft lands on the item it was typed for. An optional metronome (Start beat; BPM by −/+ or typed, 40–240; three levels) sounds only while the clock runs on a visible screen: Pause, Finish, Discard, leaving, a hidden page or lost sound stop it, only a tap starts it again, and a boundary cue mutes it briefly. '+ Ask teacher' writes one question for the nearest upcoming class (or unassigned) on its own after a short pause, without pausing anything — no Save to remember; later typing updates that same question, 'Saved' appears only once the device has it, and words not yet saved stay on screen, on Close and on Today until they are.
+   Changes: Elapsed seconds accumulate only while the timer runs. A question asked here is one new lesson-agenda entry; tempo and level are never recorded.
  The musician Taps 'Finish'.
    Shows: The close screen, with the minutes already filled in.
    Changes: The clock is frozen first, so reflection time is not counted as practice.
− The musician Says what the block covered — focused work on a part or one aspect (the default) or an explicit whole-item check — picks one of the six results, optionally adds an observation, a next action or a teacher question, and optionally revises the item behind one collapsed 'Status · Primary focus · Current effort · return' line (Change). A status suggestion or 'Keep it fresh' is offered only after a whole-item check, never pre-selected.
−   Shows: One 'Next practice' line from the same decision that will be saved: an item being worked on comes back in 1–3 days, a kept-fresh item's whole check follows spaced repetition, and class preparation says when the item is wanted before its class — beside a review date that stays as stored. 'Why this date?' explains it in place.
−   Changes: Nothing until Save; untouched fields are never written.
+ The musician Says what the block covered — focused work on a part or one aspect (the default) or an explicit whole-item check — picks one of the six results, optionally adds an observation, a next action or a teacher question, and optionally revises the item behind one collapsed 'Status · Primary focus · Current effort · return' line (Change). A status suggestion or 'Keep it fresh' is offered only after a whole-item check, never pre-selected.
+   Shows: One 'Next practice' line from the same decision that will be saved: an item being worked on comes back in 1–3 days, a kept-fresh item's whole check follows spaced repetition, and class preparation says it stays available until its class — practised today included — beside a review date that stays as stored. 'Why this date?' explains it in place.
+   Changes: Nothing until Save; untouched fields are never written.
  The musician Taps 'Save block'.
    Shows: Back to Today (or to the running plan), with the item's stats and status updated.
    Changes: A PracticeBlock is stored with what it covered; the item's counters and saturation flag update; its next date is the one shown — spaced repetition advances only on a kept-fresh item's eligible whole-item check — and the open review completes only when that decision writes a date. Status and return intention change only when the musician chose them.

Touchpoints: src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts, src/domain/blocks.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/domain/practiceSessionModel.ts, src/components/ItemNotes.tsx, src/store/notesDrafts.ts

Evidence: 7 steps: 7 manually verified

### prepare-for-the-next-class — Works now (update proposed)

Proposed step changes:
− Practice Compass Collects every item for that instrument that is both flagged for the next class and carries a question, ordered with the Persian collator.
−   Shows: A 'Questions for your next class' list on the upcoming lesson and on the Teacher report.
+ Practice Compass Keeps each question as its own lesson-agenda entry aimed at the class it names — the nearest upcoming one by default, changeable, or visibly unassigned — and collects a class's open questions by that lesson's id, ordered with the Persian collator.
+   Shows: A 'Questions for your next class' list on the lesson and on the Teacher report. A question asked mid-practice saves itself after a short pause and says 'Saved' only once the device stored it; its words survive a failed write, leaving the screen and the run ending.
+   Changes: One new open question per capture — later typing, Done and Try again update that same entry, never a second — never a preparation commitment and never a change to practice priority.
  The musician Copies, downloads or prints the questions.
    Shows: A numbered plain-text export that preserves mixed Farsi and English, or a friendly empty state when there are none.
  The musician Opens the Teacher report and picks the instrument and a date range (last two weeks by default).
    Shows: A copyable summary of what was practised, how it went and what is open.
  The musician Taps 'Copy report'.
    Shows: 'Copied ✓'.
    Changes: Nothing in the data — the report is generated on the spot.

Touchpoints: src/pages/TeacherReport.tsx, src/components/ClassQuestions.tsx, src/domain/questions.ts, src/domain/report.ts, src/pages/Lessons.tsx, src/pages/CloseBlock.tsx

Evidence: 4 steps: 4 manually verified

### run-a-session-plan — Works now (update proposed)

Proposed step changes:
− Practice Compass Builds a plan from the same priority numbers the recommendation uses, laid out as warm-up, class work, review, focus and cool-down segments; a whole work (gusheh, piece, anything with dastgāh/form/composer) gets at least the 10-minute standard block beside other work, drills at least 2, and a segment is seated only while every seated segment can still reach its floor.
−   Shows: The plan preview: each segment with its minutes, bucket, item and a one-sentence reason. The total equals the chosen budget unless every segment that may take minutes is at its 25-minute ceiling; the warm-up and cool-down never exceed their shares or take leftover minutes.
− The musician Reorders (Move earlier / Move later, by keyboard or touch), swaps, removes or regenerates segments until the shape looks right.
−   Shows: A move carries the whole segment — item, minutes, role, reason — and nothing else changes. A removal leaves every other segment's minutes as they were and shows the freed minutes as unused; only Regenerate or a new length reallocates. A swap keeps the slot's minutes and offers only material whose floor fits it.
−   Changes: Only a local copy of the plan — nothing is saved yet.
− The musician Taps 'Start plan'.
−   Shows: The runner: the whole list in the musician's order, the current segment highlighted, with time left, unused and recorded shown separately.
−   Changes: The running plan is held in app state (never in the database, never synced), and the chosen length is remembered for this instrument.
+ Practice Compass Builds a plan from the same priority numbers the recommendation uses, laid out as warm-up, class work, review, focus and cool-down segments; a whole work (gusheh, piece, anything with dastgāh/form/composer) gets at least the 10-minute standard block beside other work, drills at least 2, and a segment is seated only while every seated segment can still reach its floor. Before anything optional it seats every item prepared for the nearest upcoming class — practised earlier today included — at its floor; when they cannot all fit it seats the subset that does by ranking, holds class work only, and names the rest.
+   Shows: The plan preview: each segment with its minutes, bucket, item and a one-sentence reason. The total equals the chosen budget unless every segment that may take minutes is at its 25-minute ceiling; the warm-up and cool-down never exceed their shares or take leftover minutes. A class-coverage card says how much of the next class's work is in, names anything left out and why (does not fit, or removed or swapped by the musician), offers the length that holds it all ('Use N min', never past 120), and lists resting class work as resting.
+ The musician Reorders (Move earlier / Move later, by keyboard or touch), swaps, removes or regenerates segments until the shape looks right.
+   Shows: A move carries the whole segment — item, minutes, role, reason — and nothing else changes. A removal leaves every other segment's minutes as they were and shows the freed minutes as unused, offering 'Spread over the rest' or 'Give to one…' — each entry only up to its own ceiling, a cancelled choice changing nothing, leaving them needing no tap; Regenerate or a new length reallocates. A swap keeps the slot's minutes and offers only material whose floor fits it — the next class's work too, even in a one-row plan.
+   Changes: Only a local copy of the plan — nothing is saved yet.
+ The musician Taps 'Start plan' — or, when class work is left out, 'Start without N class items', a choice bound to exactly that coverage.
+   Shows: The runner: the whole list in the musician's order, the current segment highlighted, with time left, unused and recorded shown separately. Start refuses visibly when the day, the data or the class coverage moved since the preview, and never starts a class item below its useful minutes.
+   Changes: The running plan is held in app state (never in the database, never synced), and the chosen length is remembered for this instrument.
  The musician Taps 'Start' on the current segment.
    Shows: The ordinary active-block screen, with the segment's minutes as the target — identical behaviour to an unplanned block, including the screen staying awake while it runs and is visible, and a durable 'Target reached' state with a growing overtime figure if the segment runs past its minutes without the musician tapping Finish.
    Changes: A real practice block opens for that segment's item.
  The musician Finishes and saves the block as usual.
    Shows: Back on the plan, that segment reads 'done' with the minutes actually recorded, and the pointer moves to the next one; overtime is recorded as practised and charged to no other segment.
    Changes: The block, item stats and review schedule update exactly as in an unplanned block.
  The musician Skips any segment not yet started, skips the running one with 'Skip this one — save nothing', or ends the plan at any time; Finish (then Save, with or without a result) is how a shortened segment keeps what was practised.
    Shows: 'Session complete' once the last segment is passed — saying so plainly when nothing was practised.
    Changes: A skipped segment logs nothing at all, even after time passed in it, and lengthens nothing else; ending the plan discards it and leaves every logged block untouched.

Touchpoints: src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/domain/plan.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### see-practice-patterns — Works now

Touchpoints: src/pages/Insights.tsx, src/pages/Today.tsx, src/domain/insights.ts, src/domain/io.ts

Evidence: 3 steps: 3 manually verified

### sync-devices-via-github — Works now

Touchpoints: src/store/syncEngine.ts, src/store/githubSync.ts, src/store/gitRemote.ts, src/domain/sync.ts, src/domain/canonical.ts, src/store/revision.ts, src/pages/Settings.tsx, src/App.tsx

Evidence: 6 steps: 6 manually verified

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
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261028-make-live-practice-easier-to-shape-prepa-1934/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20261028-make-live-practice-easier-to-shape-prepa-1934' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261028-make-live-practice-easier-to-shape-prepa-1934/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261028-make-live-practice-easier-to-shape-prepa-1934/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory. A finding names an invariant: sweep the repository for every instance of it and list each one found plus the consumers checked clean, in one round — not one counterexample at a time.
