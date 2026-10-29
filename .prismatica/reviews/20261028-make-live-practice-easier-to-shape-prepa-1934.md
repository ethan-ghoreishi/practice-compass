---
id: 20261028-make-live-practice-easier-to-shape-prepa-1934
contractId: 20261028-make-live-practice-easier-to-shape-prepa-1934
patchId: 39556726470cb80625bf81ef58e0ecd7ecb77bed
reviewer: codex
state: sealed
verdict: approve
createdAt: 2026-10-29T14:20:26.157Z
sealedAt: 2026-10-29T15:44:22.577Z
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
- **Diff patch-id:** `39556726470cb80625bf81ef58e0ecd7ecb77bed`
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

- **live-question-durability-covers-lesson-target** — A historical capture acknowledgement becomes valid again after an external ownership change persists and its reversal fails, allowing Saved and Done to claim ownership absent from disk.
  _counterexample:_ At HEAD 470534ce1f548b525e902a9d8e1b9831789964ce, controlled read-only execution of the real store reproduces: save Q for Class A; successfully setAgendaTarget(Q, undefined); refuse storage; setAgendaTarget(Q, Class A); press Done. liveQuestionAcknowledged returns true, Done closes with a Class A saved claim and zero writes, while disk holds Q unassigned. Both non-empty and blank fields reproduce. Likewise, updateItem Setar-to-Tar acknowledged then Tar-to-Setar refused closes without writing while disk owns Q on Tar. Root: useStore.ts:2774 compares current values with a historical fingerprint without accounting for intervening persisted mutations. Affected doors: LessonAgenda TargetPicker, Move to this class, and updateItem instrument changes. Shared consumers: acknowledgement, settlement, coalescing, Done, closing continuation, status and recovery visibility across ordinary/Plan ActiveBlock, bound/unbound Routine, Routine complete, Close and Today. Checked clean: one-way target changes, lesson deletion/detachment, item movement/deletion/detachment, forced retry, deliberate editor lesson selection, lesson-id agenda/report readers, and removed-question blank Done. Extend the unique test live teacher questions retain capture ownership while practice continues and its lifecycle support test with acknowledged changes followed by refused/delayed reversals, blank/non-empty Done and reload. Invalidate stale acknowledgement authority or obtain a fresh write acknowledgement before claiming the reverted ownership durable.

**What changed since the previously reviewed head:**

```diff
diff --git a/docs/practice-session-model.md b/docs/practice-session-model.md
index da7b6c1eb2453cf0650a5f7d3d0794d31fd2e396..984a7cdd47b170c82d88833c8cbe0dc4f3425782 100644
--- a/docs/practice-session-model.md
+++ b/docs/practice-session-model.md
@@ -264,7 +264,7 @@ by hand from the rules above.
 | ac-2 `next class work survives morning practice in every evening plan` | required = nearest class's non-resting preparations; seated in every build / regeneration / length change (12–120) whatever exposure or same-day practice, once each; class reasons honest, never "nothing else eligible"; stored dates and spacing untouched; counterexamples: uncommitted morning item, later / passed / archive / unassigned / question-only / other-instrument / resting | `candidatePool` → Today (`recommend`), build, swap; `nextPractice` → ItemDetail, CloseBlock; `planSegmentReason`, summary |
 | ac-3 `class plan capacity exceptions name omissions before any partial start` | floors 10 / 2; 20 → both works, 15 → one + named omission + minimum 20, 5 → nothing to start (needs 10); parts past the old segment count; parent + child both seated when both prepared, uncommitted relatives only with their own due review, siblings distinct; > 120 → partial, no impossible increase; tied classes; remove / swap → `edited` omission; a choice is bound to budget + subset + omissions + revision + day | SessionPlan coverage card, swap (a required item's floor applies even to the only row), Start ("Start without…"), `planStartRefusal` (a required item under its floor is `short`: never seated, never startable), store `startPlan` (installs only after the live recheck), store `beginPlanSegment` → `planSegmentStartable` (each segment's Start rechecks the LIVE required set and the item's floor as it is now: a required item grown into a whole work is refused `short`, unskipped, said on the PlanRunner row) |
 | ac-4 `routine feedback can be cleared without changing practice or retention` | Clear → `not_logged`, observation kept; `lastResult` = newest remaining assessment, absent when none, a newer one left alone; idempotent in memory, yet every Save / Try again writes again so a failed write is made durable; foreign / deleted block refuses all; minutes, scope, reviews, dates, spacing, status unchanged | RoutineCapture, `captureRoutineResults`, history (`recentResults`), Insights (`generateInsights`), report (`buildReportData`) |
-| ac-5 `live teacher questions retain capture ownership while practice continues` | words in `useLiveQuestion` (memory only) through ONE lifecycle: 800 ms quiet autosave, Done (closes once the latest write is acknowledged, writing a refused one again), Try again (always writes; with the field empty it writes the words the question holds), a class chosen after the question exists (a write with its own acknowledgement, even with the field empty), flush on leaving; owner frozen at open (`openQuestionCapture`), revalidated before the first write (`captureTargetProblem`, words kept on refusal); ONE question per capture — later writes update that id, a removed one is never recreated; blank never writes; only the latest attempt sets the status and every answered attempt settles; Saved = IndexedDB acknowledged the question as it stands — its words, class, item and instrument (`liveQuestionAcknowledged`), so a retarget, class or item deletion or move elsewhere is unconfirmed until the capture's own write lands, and Done writes it first; a blank field whose question was removed elsewhere closes with no write, never recreated; boundaries, Skip / Move on, the automatic end and background catch-up keep the field; clock, notes draft, markers, preparations and ranking untouched | ActiveBlock (ordinary, Plan), RoutineRunner (bound, unbound, boundary, Routine complete), CloseBlock (the live field beside its own independent question), Today (unsaved words only; any recovery screen, once it shows a capture, keeps it through its own acknowledged autosave or retry until Done), ItemDetail agenda, TeacherReport (by lesson id) |
+| ac-5 `live teacher questions retain capture ownership while practice continues` | words in `useLiveQuestion` (memory only) through ONE lifecycle: 800 ms quiet autosave, Done (closes once the latest write is acknowledged, writing a refused one again), Try again (always writes; with the field empty it writes the words the question holds), a class chosen after the question exists (a write with its own acknowledgement, even with the field empty), flush on leaving; owner frozen at open (`openQuestionCapture`), revalidated before the first write (`captureTargetProblem`, words kept on refusal); ONE question per capture — later writes update that id, a removed one is never recreated; blank never writes; only the latest attempt sets the status and every answered attempt settles; Saved = IndexedDB acknowledged the question's current revision — the entry object the latest attempt wrote is still the agenda's (`liveQuestionAcknowledged`, by identity, never by value), so any change elsewhere (retarget, class or item deletion or move), even one restoring the written values, is unconfirmed until the capture's own write lands, and Done writes it first; a blank field whose question was removed elsewhere closes with no write, never recreated; boundaries, Skip / Move on, the automatic end and background catch-up keep the field; clock, notes draft, markers, preparations and ranking untouched | ActiveBlock (ordinary, Plan), RoutineRunner (bound, unbound, boundary, Routine complete), CloseBlock (the live field beside its own independent question), Today (unsaved words only; any recovery screen, once it shows a capture, keeps it through its own acknowledged autosave or retry until Done), ItemDetail agenda, TeacherReport (by lesson id) |
 | ac-6 `metronome scheduling and cue priority survive sound lifecycle changes` | beats on the audio clock (`LOOKAHEAD_SECONDS`), one scheduler, tempo 40–240 from the next unplaced beat, late timer skips to the grid; stop cancels placed beats; context replacement, lost readiness, hidden, paused, left → stopped, never restarted; resume denied / rejected / never settled or landing late → no beat; cue ducks the beat for `CUE.totalSeconds`, a Start or restart inside the window still yields (per-tick routed level); claims once | `practiceCue` (`onContextReplaced`, `onPracticeCue`, `onSoundState`), `metronome.ts`, store start / resume doors |
 | ac-7 `live practice tools preserve clocks notes records and mobile controls` | the same, through real screens in Chromium and WebKit: tempo / level controls, question across a boundary and keyboard dismissal, notes durable, ring + cue at the target, freed-time cancel / spread then Start = preview, no extra blocks after a finished run and a reload | ActiveBlock, SessionPlan, RoutineRunner, Settings' test sound (unchanged), conformance sweep (`/active`, running routine) |
 
diff --git a/src/store/useStore.ts b/src/store/useStore.ts
index 67fc675f80240d2956ef9b7235d55f13cfde45bc..19fed9e5e774e3cb8c5146cae8175b7879ae1422 100644
--- a/src/store/useStore.ts
+++ b/src/store/useStore.ts
@@ -2706,11 +2706,12 @@ else useStore.persist.onFinishHydration(finishHydration);
 //    written one. A write the question needs anyway — Try again, or its class
 //    chosen with the field empty — carries the words it holds in memory, and
 //    is acknowledged like any other.
-//  - "Saved" is IndexedDB's acknowledgement of the question an attempt wrote
-//    — its words, class, item and instrument as they stood (`storageSettled`
-//    captured beside the write). A change to that question elsewhere (its
-//    class retargeted or deleted, its item moved or deleted) is not covered
-//    by it: the capture is unacknowledged again until its own write lands.
+//  - "Saved" is IndexedDB's acknowledgement of the question REVISION an
+//    attempt wrote (`storageSettled` captured beside the write). Every store
+//    change to an agenda entry makes a new entry object, so that object is the
+//    revision: any later change to the question (its class retargeted or
+//    deleted, its item moved or deleted) — even one that puts back the same
+//    values — leaves the capture unacknowledged until its own write lands.
 //    A question removed elsewhere leaves a blank field nothing to write: Done
 //    lets it go, never recreating it. Only the latest attempt
 //    may set the status; any answered attempt settles (never stuck saving);
@@ -2731,7 +2732,7 @@ export interface LiveQuestion {
   /** The agenda question this capture writes — set by its first write, never replaced. */
   questionId?: ID;
   /** The latest attempt: the words it carried and how the device answered. */
-  attempt?: { seq: number; carried: string; wrote: string; status: 'saving' | 'saved' | 'failed' };
+  attempt?: { seq: number; carried: string; wrote: LessonQuestion; status: 'saving' | 'saved' | 'failed' };
   /** The newest words IndexedDB acknowledged for this capture. */
   written?: string;
   /** Done was tapped: close once the latest words are acknowledged. */
@@ -2765,13 +2766,15 @@ export function liveQuestionEntry(capture: LiveQuestion, agenda: PracticeDB['les
   return capture.questionId ? agenda.find((e): e is LessonQuestion => e.id === capture.questionId && e.kind === 'question') : undefined;
 }
 
-/** What a write leaves on the device for this question: compared by value, so a rebuilt (synced, imported) entry still matches. */
-const questionState = (e: LessonQuestion) => JSON.stringify([e.text, e.lessonId ?? null, e.itemId ?? null, e.instrumentId]);
-
-/** IndexedDB acknowledged the question exactly as it stands now — not merely the words, its class, item and instrument too. */
+/**
+ * IndexedDB acknowledged the question's CURRENT revision: the entry object
+ * the latest attempt wrote is still the one in the agenda. Never compared by
+ * value — a change elsewhere that restores the old words or target is a newer
+ * revision no write of this capture has acknowledged.
+ */
 export function liveQuestionAcknowledged(capture: LiveQuestion, agenda: PracticeDB['lessonAgenda']): boolean {
   const entry = liveQuestionEntry(capture, agenda);
-  return !!entry && capture.attempt?.status === 'saved' && capture.attempt.wrote === questionState(entry);
+  return !!entry && capture.attempt?.status === 'saved' && capture.attempt.wrote === entry;
 }
 
 /**
@@ -2833,9 +2836,9 @@ export function saveLiveQuestion(force = false): void {
     if (!questionId) return;
   }
   const seq = ++attempts;
-  // Captured in the same tick as the write: this attempt's own outcome, and the question it wrote.
+  // Captured in the same tick as the write: this attempt's own outcome, and the revision it wrote.
   const written = storageSettled();
-  const wrote = questionState(liveQuestionEntry({ ...capture, questionId }, useStore.getState().db.lessonAgenda)!);
+  const wrote = liveQuestionEntry({ ...capture, questionId }, useStore.getState().db.lessonAgenda)!;
   patchLive({ questionId, attempt: { seq, carried: words, wrote, status: 'saving' } });
   const settle = (ok: boolean) => {
     const now = liveCapture();
diff --git a/tests/live-practice-families.test.ts b/tests/live-practice-families.test.ts
index d5cccd299b82ba2a12661afbbcb90d5cd6ac776d..156a74adadb9d8a76c9f30512d6cd0cd88f33010 100644
--- a/tests/live-practice-families.test.ts
+++ b/tests/live-practice-families.test.ts
@@ -1018,6 +1018,53 @@ describe('the live question lifecycle', () => {
       }
     }
 
+    // CHANGED AND CHANGED BACK elsewhere: A → B lands, B → A is refused (or
+    // answered late). The values match what this capture once wrote, but the
+    // device holds B — the older acknowledgement never regains authority: no
+    // Saved, Done writes rather than closing, and closes only once its own
+    // write of the current revision lands. With words and with the field empty.
+    const reversals: [string, string | undefined, () => void, () => void, string][] = [
+      ['class', 'L2', () => useStore.getState().setAgendaTarget(cap()!.questionId!, undefined), () => useStore.getState().setAgendaTarget(cap()!.questionId!, 'L2'), 'Question saved on this device for 2026-10-31.'],
+      ['instrument', undefined, () => void useStore.getState().updateItem('b', { instrumentId: TAR }), () => void useStore.getState().updateItem('b', { instrumentId: SETAR }), 'Question saved on this device — unassigned.'],
+    ];
+    for (const blank of [false, true]) {
+      for (const late of [false, true]) {
+        for (const [name, target, there, back, note] of reversals) {
+          const tag = `${name} blank=${blank} late=${late}`;
+          useStore.setState({ db: db({ items: [item('a', 'A'), item('b', 'B')], lessons: [L, lesson('L2', '2026-10-31')] }) });
+          live.openLiveQuestion(SETAR, 'b', 's6');
+          live.chooseLiveQuestionLesson(target);
+          live.editLiveQuestion('Round trip');
+          live.saveLiveQuestion();
+          await flush();
+          const qid = cap()!.questionId!;
+          const ownership = () => {
+            const q = agenda().find((e) => e.id === qid) as LessonAgendaEntry & { text: string; itemId?: string };
+            return [q.text, q.lessonId, q.itemId, q.instrumentId];
+          };
+          const written = ownership();
+          if (blank) live.editLiveQuestion('');
+          there();
+          await flush();
+          const answer = late ? hold() : null;
+          if (!late) storage.fail = true;
+          back();
+          if (!late) await flush();
+          // The same text, class, item and instrument as the acknowledged write — still not acknowledged.
+          expect([ownership(), live.liveQuestionAcknowledged(cap()!, agenda()), live.liveQuestionSettled(cap()!, agenda())], tag).toEqual([written, false, false]);
+          const w = storage.writes;
+          live.closeLiveQuestion();
+          if (answer) await answer(false);
+          await flush();
+          expect([cap()?.questionId, cap()?.attempt?.status, storage.writes - w >= 1, live.useLiveQuestion.getState().note], tag).toEqual([qid, 'failed', true, null]);
+          storage.fail = false;
+          live.closeLiveQuestion();
+          await flush();
+          expect([cap(), live.useLiveQuestion.getState().note, JSON.stringify(onDiskQ(qid))], tag).toEqual([null, note, JSON.stringify(agenda().find((e) => e.id === qid))]);
+        }
+      }
+    }
+
     // REMOVED ELSEWHERE after a refused write, the field then cleared: Done
     // lets the capture go — no write, nothing recreated, nothing claimed. Also
     // when the refusal lands after the removal.
diff --git a/tests/live-practice.browser.test.ts b/tests/live-practice.browser.test.ts
index ea4f2d5e45fa31f9141972a8629a25d82eae7969..408ed2f5950547bcc235ed96bd4ef508858de9a7 100644
--- a/tests/live-practice.browser.test.ts
+++ b/tests/live-practice.browser.test.ts
@@ -759,6 +759,70 @@ describe('asking the teacher while practising', () => {
           // (A removal the device refused lands with the next write: the reload below holds neither.)
           if (!pending) expect(questions(await db(app)).some((q) => q.id === gone.id), engine).toBe(false);
         }
+
+        // CHANGED AND CHANGED BACK elsewhere: the change lands, its reversal —
+        // back to exactly what this capture wrote — is refused. The device holds
+        // the change, so the capture's older acknowledgement never counts again:
+        // no Saved, Done writes instead of closing. First its class, with words,
+        // the reversal answered late; then a reload shows what landed.
+        await page.getByRole('button', { name: '+ Ask teacher' }).click();
+        await askBox(page).fill('Asked about the class twice');
+        await page.clock.runFor(800);
+        await askStatus(page, 'Saved on this device — unassigned.').waitFor();
+        const q8 = await questionLanded(app, 'Asked about the class twice');
+        const classPicker = questionRow('Asked about the class twice').getByRole('combobox', { name: 'Ask at which class' });
+        await goTo(app, `/items/${C}`, { arrival: classPicker });
+        await classPicker.selectOption(L0);
+        await persistedUntil(app, (st) => questions((st.state as { db: Db }).db).find((q) => q.id === q8.id), (q) => q?.lessonId === L0);
+        await holdWrites(page);
+        await classPicker.selectOption('');
+        await goTo(app, '/active');
+        await askStatus(page, CHANGED).waitFor();
+        expect(await page.getByText(/Saved on this device|^Question saved on this device/).count(), engine).toBe(0);
+        await ask(page).getByRole('button', { name: 'Done' }).click();
+        await askStatus(page, 'Saving…').waitFor();
+        await answerWrites(page, false);
+        await askStatus(page, FAILED_WORDS).waitFor();
+        await page.clock.runFor(1_000);
+        expect(await page.getByText(/^Question saved on this device/).count(), engine).toBe(0);
+        expect(questions(await db(app)).find((q) => q.id === q8.id)!.lessonId, engine).toBe(L0);
+        await ask(page).getByRole('button', { name: 'Try again' }).click();
+        await askStatus(page, 'Saved on this device — unassigned.').waitFor();
+        await reload(app);
+        await page.getByRole('button', { name: '+ Ask teacher' }).waitFor();
+        expect(questions(await db(app)).filter((q) => q.id === q8.id).map((q) => [q.text, q.lessonId]), engine).toEqual([['Asked about the class twice', undefined]]);
+        // …then its item's instrument, with the field empty, the reversal refused.
+        await page.getByRole('button', { name: '+ Ask teacher' }).click();
+        await askBox(page).fill('Which tuning for Masnavi?');
+        await page.clock.runFor(800);
+        await askStatus(page, 'Saved on this device — unassigned.').waitFor();
+        const q9 = await questionLanded(app, 'Which tuning for Masnavi?');
+        expect(q9.instrumentId, engine).toBe(SETAR);
+        await askBox(page).fill('');
+        const moveItem = async (to: string) => {
+          await page.getByRole('button', { name: 'Edit', exact: true }).click();
+          await page.getByRole('combobox', { name: 'Instrument' }).selectOption(to);
+          await page.getByRole('button', { name: 'Save changes' }).click();
+          await page.getByRole('button', { name: 'Start a block' }).waitFor();
+        };
+        await goTo(app, `/items/${C}`, { arrival: page.getByRole('button', { name: 'Start a block' }) });
+        await moveItem('inst-tar');
+        await persistedUntil(app, (st) => questions((st.state as { db: Db }).db).find((q) => q.id === q9.id), (q) => q?.instrumentId === 'inst-tar');
+        await breakStorage(page);
+        await moveItem(SETAR);
+        await goTo(app, '/active');
+        await askStatus(page, CHANGED).waitFor();
+        await ask(page).getByRole('button', { name: 'Done' }).click();
+        await askStatus(page, FAILED_EMPTY).waitFor();
+        await page.clock.runFor(1_000);
+        await askBox(page).waitFor();
+        expect(await page.getByText(/^Question saved on this device/).count(), engine).toBe(0);
+        expect(questions(await db(app)).find((q) => q.id === q9.id)!.instrumentId, engine).toBe('inst-tar');
+        await repairStorage(page);
+        await ask(page).getByRole('button', { name: 'Done' }).click();
+        await page.getByText('Question saved on this device — unassigned.').waitFor();
+        await persistedUntil(app, (st) => questions((st.state as { db: Db }).db).find((q) => q.id === q9.id), (q) => q?.instrumentId === SETAR && q.text === 'Which tuning for Masnavi?');
+
         await page.getByRole('button', { name: 'Discard block' }).click();
         await page.getByRole('navigation', { name: 'Primary' }).waitFor();
 
@@ -785,9 +849,11 @@ describe('asking the teacher while practising', () => {
             ['Typed as the run ends', B, L0],
             ['Which string first?', A, L0],
             ['Which bow for the turn?', A, null],
+            ['Asked about the class twice', C, null],
+            ['Which tuning for Masnavi?', C, null],
           ].sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
         );
-        expect(new Set(questions(end).map((q) => q.id)).size, engine).toBe(14);
+        expect(new Set(questions(end).map((q) => q.id)).size, engine).toBe(16);
         expect(questions(end).find((q) => q.text === 'Should I slow down here?')!.id, engine).toBe(q1.id);
         expect(end.lessonAgenda.filter((e) => e.kind === 'preparation'), engine).toEqual(preparations);
         const withoutQuestions = end.lessonAgenda.filter((e) => e.kind !== 'question');
```

**Paths the rework touched:**

- `docs/practice-session-model.md`
- `src/store/useStore.ts`
- `tests/live-practice-families.test.ts`
- `tests/live-practice.browser.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
7fbf12b Rework: a live question's "Saved" is bound to the revision its write persisted, never to matching values

Invariant: "Saved" (and settled) means storage acknowledged the question's
CURRENT revision after its latest mutation. An older successful write never
regains authority because text, class, item or instrument later return to
the values it carried.

Rule: every store mutation of an agenda entry creates a new entry object
(no in-place mutation anywhere — swept), so the object a capture's write
persisted IS that write's revision. Each attempt keeps that object
(`attempt.wrote`); liveQuestionAcknowledged holds only while the agenda
still holds that very object. The value fingerprint is removed, not
supplemented. A wholesale replacement (import, sync, restore) is a new
revision too: conservatively unacknowledged until the capture writes.

Consumers, all through liveQuestionAcknowledged / liveQuestionSettled:
acknowledgement, settlement, the coalescing early return, Done
(closeLiveQuestion forces a write unless one is in flight), the closing
continuation (rewrites when the revision moved meanwhile), the status line
and recovery visibility in TeacherQuestionCapture — one component across
ordinary/Plan ActiveBlock, bound/unbound Routine, Routine complete, Close
and Today. Doors swept: LessonAgenda TargetPicker / Move to this class
(setAgendaTarget), updateItem instrument change
(retargetEntriesForItemInstrument), deleteLesson/detachLesson,
deleteItem/detachItem, removeAgendaEntry, the editor's own class picker,
forced retry. Previously closed families (one-way changes, removed-question
blank Done) unchanged and still proven.

Proof: named test `live teacher questions retain capture ownership while
practice continues` (Chromium + WebKit) adds class A→B landed then B→A
answered late with words (Done → Saving → refused, disk keeps B, Try again,
reload shows the landed target) and item instrument Setar→Tar landed then
Tar→Setar refused with the field empty (no Saved
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
