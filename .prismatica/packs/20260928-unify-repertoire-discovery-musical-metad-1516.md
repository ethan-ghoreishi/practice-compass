---
id: 20260928-unify-repertoire-discovery-musical-metad-1516
contractId: 20260928-unify-repertoire-discovery-musical-metad-1516
contractHash: df7cb1d705fa4578b13afcbd788a57140807690d3908faba17f51639e1004330
createdAt: 2026-09-28T23:16:27.300Z
skills:
  - ui-work
  - build
  - simplify
---

# Build brief: Unify repertoire discovery, musical metadata and pathways around a calmer practice interface

> This brief is scoped and self-contained. A fresh session can resume from it
> alone. Prismatica will check your work deterministically — it never reads this
> chat, only Git and your tests.

- **Linked issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/39
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Work in the lane:** /Users/Ehsan/workspace/active/practice-compass-lanes/20260928-unify-repertoire-discovery-musical-metad-1516

## The plan the owner approved

This is the complete approved proposal, verbatim. `assumptions` and
`possibleConflicts` are the Planner's advisory reading — treat them as leads to
verify against the code, never as established fact.

````yaml
# Approved intent: Unify repertoire discovery, musical metadata and pathways around a calmer practice interface

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** existing-flow
- **Risk tier:** heavy
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> Revisit the draft as research, re-examine Practice Compass and plan one deliberately wide but coherent HEAVY UI/UX, repertoire, pathway and metadata lane, with Claude as builder. Make everyday practice calm, efficient, accessible and trustworthy; investigate the iPhone keyboard/tab-bar defect before fixing it; improve reference versus owned-item semantics, Setar/Tar Persian pathways, repertoire discovery and study-source clarity. Prefer fewer concepts, shared stable identities, one source of truth and deterministic, idempotent, lossless inbound migrations. Preserve local-first behaviour and practice/scheduling semantics. The apparent Setar NAS refresh defect was delayed execution of the NAS setar-indexer task, which runs about every 15 minutes; do not redesign NAS identity, fingerprinting or relocation to solve it. Do not implement during planning.

## Why

One lane, one end state: find music, understand its context, take a reference suggestion into owned practice once, and return to practising without organising the same fact twice. The shared structural causes are text used as identity, catalogue identity coupled to editable placement, and fragmented browsing/editing state. The shell and keyboard work belong because those same tasks must remain usable on the owner's phone. This replaces the earlier draft, not merely its NAS section. Reuse existing domain helpers, native controls, browser harness and additive default installation. Do not introduce a generic ontology, new scheduling system or new archive protocol.

## Today

Evidence baseline: clean main b6bef3418572340c22e93deed79204878d45dc6d; the fresh context reports no pending proposals or open lanes. Re-read the current implementation rather than treating earlier draft recommendations as decisions.

Repertoire.tsx defaults to Pathways and mounts three independently stateful views. My repertoire has form chips but no general search or composer/maestro facet. repertoireWorks includes title-only full pieces, but groupByDastgah drops Persian-family works with no identity metadata. persian.ts ranks transliterations but groups by folded raw text, so Shur and شور can remain separate. itemFields.ts, farsi.ts, persian.ts and seeds contain overlapping vocabulary knowledge.

PersianFields holds optional raw strings. Materials are instrument-scoped named sources, but the twelve source kinds mix collections, pieces, activities and lesson events. ItemForm already has progressive kind-first creation and optional source/pathway/lesson/parent connections; retain this investment.

Catalogue ownership is inferred from stageId + catalogKey, with a special cross-stage course-work resolver. Moving/detaching an item can defeat reuse; itemFiles also uses stageId for course material. isLosslesslyRemovable checks new status, practice count and blocks, not authored notes or other relationships. deletePathway/deleteStage already detach owned items. planDefaultPathways and course-level restoration already provide explicit additive installation and must be extended, not replaced.

Setar's existing mixed pathway contains foundations, modal radif suggestions and generic form-name suggestions. Its gusheh factory does not populate the modal/gusheh identity fields. Tar already has Honarestan and Khonyagar pathways, so equivalent Persian browsing is an addition to a real instrument experience, not a new Tar subsystem. Repertoire's pathway card omits the existing current-stage pin; Today and SessionPlan pick a first matching pathway without a consistent archived/order policy.

The fixed flex shell already uses dynamic viewport units, safe areas and a main scroll region. useViewportGuard has 80ms/300ms timing, returns while an editable element remains focused, and calls element.scrollIntoView without limiting it to main. These are concrete weaknesses and a testable retained-focus blind spot, not proof of the owner's precise native-iPhone failure. Native trace evidence is still needed.

Archive Refresh fetches a commit-pinned published setar/index.json through archiveIndex.ts; it does not run the NAS scanner. The owner's corrected explanation fits that boundary. No remaining live NAS defect has been established. The earlier draft's synthetic missing-rename scenario does not justify fingerprinting or a protocol migration.

Schema v14 is installed through validateDB/migrateToCurrent, including both hydration paths. validateDB reconstructs the top-level database, so merely adding TypeScript fields would drop them. Existing attachment-byte, unfinished-session, revision and acknowledged-save protections are load-bearing.

## Instead

COHERENT END STATE
The owned practice item remains the only unit of practice. A reference catalogue suggests music; a pathway arranges suggestions and owned work; a study source names the material studied; a musical term classifies it. None stores another copy of practice progress, notes or history. The lane is broad across these connected flows, not a general rewrite of every subsystem.

IMPLEMENTATION CHECKLIST
[ ] 1. Capture the existing phone/desktop journey and commit focused failing fixtures before redesign. Highest leverage: enumerate every reader/writer of musical terms and reference identity, including rendered grouping, catalogue add/progress, course files and inbound installation. Record a concise before/after screen specification and the proof matrix in docs/repertoire-experience.md. Inspect actual screenshots before visual judgements. Use synthetic data, not the owner's live database.
[ ] 2. Establish the small shared musical vocabulary and durable catalogue identity, then prove v15 migration/validation before wiring screens.
[ ] 3. Build the coherent Repertoire, Pathways, source and item-editing experience on those shared decisions. Apply the same shell, hierarchy and interaction language across the everyday practice journey.
[ ] 4. Diagnose and fix the native viewport problem from evidence, independently of the data work. Run focused browser families, full configured checks and owner-device acceptance before review.

INTERFACE AND NAVIGATION
Keep Today / Repertoire / Start / Lessons / More as the five stable destinations. Within Repertoire make My repertoire the default, with Pathways and All practice items clearly named peer views. One instrument selector and retained browse context serve those views; encode view, instrument, query and filters in route search parameters so back/forward and returning from details restore context. Validate stale/unknown parameters and expose Clear filters; browsing must not silently change Today's session instrument. Give one primary action per view, restrained secondary menus, readable Farsi titles, predictable back navigation, useful empty/no-results states, visible saving/error states and consistent destructive-action language. Do not introduce a design-system framework or replace the router.
Apply a small shared spacing/type/colour/control vocabulary through existing CSS and UI components. Cover phone and desktop, light/dark/system theme, keyboard/focus, labelled controls, mixed-script directionality and reduced motion. Aim for 44px primary touch controls and meet applicable WCAG 2.2 AA contrast, reflow, focus and target criteria. Keep dense metadata progressive. Redesign the connected Today, browse/detail/add, pathway/stage, source, Start/Active/Close and lesson entry surfaces where needed; Insights, reports and settings receive shared-style/metadata-consumer compatibility only, not independent feature redesigns. Preserve the owner's Plan then Routines ordering above the visible Today recommendation at 390x844.

IPHONE VIEWPORT: DIAGNOSIS BEFORE PRESCRIPTION
Capture layout/visual viewport sizes and offsets, scale, focused element, main scroll position and nav bounds through keyboard show, Done with retained focus, dismissal, repeat focus, rotation, route change and background/resume on Safari and installed PWA. Distinguish intentional keyboard accommodation from residual displacement. Prefer a correct CSS/scroll-owner arrangement; retain only the smallest event-driven correction if a measured WebKit behaviour requires one. Do not infer keyboard visibility from focus alone, assume interactive-widget support, use arbitrary sleeps/height thresholds, force blur, disable zoom or add scroll loops. Remove obsolete guard timers rather than add more. Any correction must respect zoom, hardware keyboards, absent VisualViewport, intended content scrolling and effect teardown. Browser geometry fixtures prove the chosen mechanism, not the native keyboard. If native evidence is unavailable, record that limit and do not claim the reported defect fixed or its owner acceptance complete; other lane work can proceed.

SHARED MUSICAL TERMS, NOT AN ONTOLOGY
Introduce one small persisted vocabulary for Dastgah/Avaz, Form and Composer/Maestro, with stable namespaced IDs, kind, display name, explicit search aliases and archived state. Built-in Persian names are Farsi; IDs never derive from mutable labels. Keep the existing composer/maestro meaning without pretending every maestro is a verified composer or building a people/roles graph. Do not centralise gusheh titles: repeated names need modal/source context and remain item/reference text.
Use one authoritative value per item field: a term reference or literal custom/legacy text, never parallel editable label and ID fields. Retain legacy strings verbatim during migration. A shared resolver may group/search an exact unique curated alias as its term without rewriting the owner string; display the original in editing/context where needed. Ambiguous, unknown and composite values stay literal and searchable, never fuzzy-assigned. Broader transliteration matching is for search, not identity. Existing Farsi normalisation is reused. Reconcile overlapping form/modal suggestion and rank tables into this source; title-search aliases unrelated to term identity may remain.
Provide compact management under More: add, rename, edit aliases, archive/restore, and delete only unreferenced custom terms. Referenced or built-in deletion is refused; archived values remain readable and filterable on existing items but leave new-entry suggestions. Existing exact aliases cannot silently change meaning on edit. Name changes preserve IDs and former labels as aliases unless doing so would collide, in which case refuse and explain. Conflicting aliases never pick a first winner. Inline custom text remains possible without requiring registry administration. No merge wizard, synonym inference, bulk retagging or person biography fields.

REPERTOIRE DISCOVERY
Search title, gusheh, displayed/raw term labels and aliases, study-source label and existing archive title aliases using the shared text normaliser. Provide combinable instrument, Dastgah/Avaz, Form and Composer/Maestro filters, with source/status available progressively if needed by the current view. Group by Dastgah/Avaz, Form, Composer/Maestro or source without changing stored data. All eligible works appear exactly once, including unclassified/title-only Persian full pieces; children stay with their parent and a matching child keeps its parent discoverable. Clearly distinguish no metadata from no matching results. Facets derive from actual owned items, not empty catalogue categories. Shared search semantics reach All practice items and Start while preserving their different eligibility rules.

REFERENCE IDENTITY, OWNERSHIP AND REVERSIBLE ORGANISATION
Give code-defined catalogue suggestions stable contextual reference IDs independent of editable stage/pathway placement and display text. Preserve the existing courseWorkKey equivalence for genuinely shared course works; identical generic keys such as chords in different stages remain different references. Use the smallest persisted binding representation that allows explicit linking of an existing same-instrument item and survives move/detach/deletion of its placement. A reference resolves to at most one item per instrument; several references may deliberately point to one owner item. Do not add a second catalogue database or universal work ontology.
One resolver drives row state, Add/Start, progress, next suggestion and course-material access. Add reuses an exact binding and is idempotent even after detach/reload. Offer Link existing when appropriate, with explicit choice; titles are candidates, not merge authority. Duplicate or ambiguous legacy bindings remain visible as unresolved candidates with all records intact, never first-match selection or automatic deletion. Do not force an instrument change to reuse Setar work for Tar: practice evidence remains separate.
Hiding a reference suggestion persists per pathway context and never hides/deletes the owned item from My repertoire or its explicit stage placement. Show hidden suggestions with Restore. Progress and next suggestion consume the same visible set; hiding is not completion, and an empty stage is not falsely mastered. Archive/restore pathways using the existing archived field; delete only after explaining that owned work is detached, not deleted. Restore missing named defaults/stages additively using existing planners, preserving edits, IDs, routines and pins; no automatic reseed and no destructive Reset to defaults button.
Replace the unsafe catalogue Undo/delete shortcut with clearly labelled Unlink reference and Remove from pathway actions that keep owned data. Actual Delete practice item remains the existing explicit destructive workflow. This avoids a new pristine-snapshot/provenance subsystem just to guess when deletion is safe. Resolve active visible pathways consistently using existing order and stable ID tie-breaks, exclude archived ones and honour currentStageId everywhere. Do not add a separate preferred-pathway setting.

SETAR AND TAR: SHARED REPERTOIRE, SEPARATE PRACTICE
Author one shared, explicitly partial Persian reference catalogue for the existing Mirza Abdullah-oriented modal selections, scoped by source/recension and Dastgah/Avaz so repeated gusheh names are not conflated. Audit every existing suggestion against its stated source; do not claim a complete authoritative radif or invent missing gusheh sequences. Use its modal term IDs and actual gusheh metadata when creating new items. Setar and Tar get independently installable instrument-specific pathway instances from that same definition, with independent item bindings/progress. Keep Tar's existing Honarestan/Khonyagar and Guitar course content unchanged.
For new installations offer a clearly titled سه‌تار · ردیف میرزا عبدالله and the Tar equivalent. Forms is a grouping/lens over real repertoire using the shared Form vocabulary, with add-a-piece prefilled by the selected form. Do not create generic practice items merely named چهارمضراب or رنگ and do not create a second Forms taxonomy or a compulsory Forms pathway. Technique/foundation practice remains in ordinary items and existing stages/routines; do not manufacture a new foundation pathway.
Existing mixed Setar pathways, their titles/stages/routines and generic-form items are preserved on upgrade. Offer the new named reference pathway explicitly, and reuse known bindings so adopting it cannot duplicate existing music. Explain how to archive or detach the old organisation using normal controls. No bespoke reorganisation wizard, bulk stage moves or automatic renaming of owner records. Correct only shipped reference definitions and provably unmodified seeded metadata; if proof is lacking preserve the record and let normal editing resolve it.

STUDY SOURCES
Define a source as the named book, collection/radif edition, course or teaching material from which work is studied. It is not a person, an individual practice item, a pathway or a dated lesson record. Keep Material and materialId as the existing implementation; no entity rename migration. For new sources expose the existing radif, method_book, repertoire (label Collection), course and other kinds with clear examples. Legacy piece/song/lesson/activity kinds stay stored and editable as legacy values, not coerced into a guessed new meaning. Preserve sourceName, parentTitle, section, teacherOrSource and notes, including fields not visible in the compact editor.
Default creation to the browsed/session instrument, keep only title required and preserve inline creation. Composer/Maestro classifies the work; the source title states the edition/tradition where appropriate; a lesson is linked separately and a pathway is organisation. Do not infer authorship from source titles or add mandatory person/source/pathway relationships. For code-defined course source reuse, add a bounded stable source key only where needed to stop renaming a known seeded source creating another copy; backfill only uniquely proven origins, and ask on multiple candidates. Do not deduplicate arbitrary sources by title or share user Material records across instruments.

SAVED DATA AND COMPATIBILITY
Use one next schema version, v15, for vocabulary, catalogue bindings and hidden-reference choices. Implement pure deterministic migration and strict validation in the existing migrateToCurrent/validateDB chain, including top-level reconstruction. Re-running on current-schema partial conversions must neither lose fields nor reseed intentionally empty collections. Validate present malformed collections/records, duplicate new IDs, wrong-kind/dangling term refs, cross-instrument/dangling bindings and invalid suppression scope before any install; absence in genuine legacy data is not the same as malformed current data. Keep ambiguous legacy strings/keys as unresolved legacy evidence rather than fabricating identities. Never coerce an object to text or drop a bad row to make validation pass.
Derive migrated IDs from stable existing identity only; do not read clock, random state, input order or locale-sensitive sort to decide identity. Address the existing pre-v3 seedPathways wall-clock default narrowly where it would make this supported inbound chain nondeterministic; use a documented fixed legacy timestamp fallback, not fresh dates. No broader old-schema cleanup. Preserve owner notes, empty values, custom metadata, all item IDs, history, reviews, schedule fields, lessons, agenda, attachments and references. The old v13 dummy-text waiver grants no new deletion permission.
Verify full/state-only backup import, sync pull, Keep remote, archive restore, cold recovery and both persist migration/merge paths. Preserve new state through export/content hashing and prove older v14 readers refuse v15 without overwrite. Keep unfinished-practice/revision guards and attachment byte ownership unchanged. Registry/source editing must report durable save only after existing storage acknowledgement, retain failed drafts and retry current text. Reuse existing patterns rather than introduce a transaction framework.
NAS source-index schema, scanner, publisher, matching, rename, absence/reappearance and refresh transaction are OUTSIDE this lane. Existing source metadata remains raw source evidence; if item term references require adaptation in sourceReconcile, limit changes to the shared musical-field resolver/adoption boundary and preserve stale-premise protection. No location or identity logic changes. Retain existing archive regression coverage.

FOCUSED FAMILY PROOF PLAN, BEFORE FIRST REVIEW
Commit tests/fixtures/repertoire-legacy-v14.json and repertoire-current-v15.json plus independently authored expectations, not outputs generated by the implementation under test. Record the reader/writer matrix and commands in docs/repertoire-experience.md. Provide one reproducible focused runner at scripts/check-repertoire-families.mjs using the existing Vitest/browser harness, no new dependencies. Every automated acceptance title below names exactly one test; loop engine/viewport cases inside that test instead of generating duplicate titles.
Family A, terms and discovery: unique aliases / ambiguous aliases / unknown literals / empty / malformed / archived / renamed, crossed with modal/form/person kinds and owned work/part/title-only work; consumers include forms, detail/practice rendering, search/facets/grouping, seeds, source-metadata adoption and export/import.
Family B, references: exact / absent / conflicting legacy binding, same/different instrument, ordinary same-key versus declared shared course work; cross with detach/move/archive/delete, hide/restore, explicit link, repeated stale Add and course-file rendering. Cover all stage/progress/next-unit and Today/SessionPlan consumers with independent expected item IDs and counts.
Family C, inbound safety: every install door crossed with valid legacy/current/partial state versus malformed identity or unsupported version, with and without local attachment bytes and unfinished/concurrently completed practice. Exercise real rendered import/recovery/sync wiring using the existing fake-remote boundary, not helper-only proofs. Assert before/after DB and blob projections and acknowledged failure/retry semantics. No network mutation or real owner import.
Family D, UI/viewport: Chromium and WebKit at 390x844 and desktop, long Farsi/English/mixed labels, empty/dense data, light/dark, offline/reload/back navigation, keyboard-only use and error states. Geometry cases include retained focus, blur, absent VisualViewport, zoom, route teardown and repeated transitions; physical keyboard assertions are separately manual. Retain every pageerror and isolate Vite caches as the current harness does. Run existing scheduling/practice/notes/lesson/archive regressions plus configured typecheck, lint, unit, build and secrets after focused tests. No skipped engine reported as success.

NEXT THREE ACTIONS FOR CLAUDE
1. Highest leverage: reproduce the identity/grouping counterexamples, capture baseline screenshots and map all consumers before choosing storage fields or moving controls.
2. Implement and prove the minimal shared term/reference model and lossless v15 inbound boundary, leaving NAS protocols untouched.
3. Wire the coherent UI and shared Setar/Tar reference views, complete the evidence-led viewport correction, and run the focused route plus owner acceptance.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- A1: The previous Claude builder selection remains in force. This is a replacement planning artifact only; the owner imports and approves it.
- A2: The owner's NAS task-timing correction supersedes the earlier draft. No independent remaining archive defect has been demonstrated.
- A3: Existing catalogue selections can support a clearly labelled partial shared Persian reference. Unsupported musical attribution will be left unspecified, not guessed.

**Possible conflicts**

- The existing viewport guidance describes the current guard as sufficient. Revise that guidance in place only after root-cause evidence; a source-level blind spot is not native-device confirmation.
- Existing default-pathway names/structure and Undo wording change for future use, but upgrades must preserve edited legacy paths and owned items. No automatic reset is authorised.
- Primary Flow is browse-my-repertoire; capture-a-practice-item, work-a-pathway-stage, practise-todays-recommendation, run-a-session-plan, log-a-class and back-up-and-restore are affected consumers. Reflect actual changed mechanics through the normal governed workflow, not new invented product Flows.
- Native iPhone acceptance needs the owner's device. Browser WebKit does not replace it; keep that check visibly outstanding if unavailable.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "Revisit the draft as research, re-examine Practice Compass and plan one deliberately wide but coherent HEAVY UI/UX, repertoire, pathway and metadata lane, with Claude as builder. Make everyday practice calm, efficient, accessible and trustworthy; investigate the iPhone keyboard/tab-bar defect before fixing it; improve reference versus owned-item semantics, Setar/Tar Persian pathways, repertoire discovery and study-source clarity. Prefer fewer concepts, shared stable identities, one source of truth and deterministic, idempotent, lossless inbound migrations. Preserve local-first behaviour and practice/scheduling semantics. The apparent Setar NAS refresh defect was delayed execution of the NAS setar-indexer task, which runs about every 15 minutes; do not redesign NAS identity, fingerprinting or relocation to solve it. Do not implement during planning.",
  "builder": "claude",
  "summary": "Unify repertoire discovery, musical metadata and pathways around a calmer practice interface",
  "rationale": "One lane, one end state: find music, understand its context, take a reference suggestion into owned practice once, and return to practising without organising the same fact twice. The shared structural causes are text used as identity, catalogue identity coupled to editable placement, and fragmented browsing/editing state. The shell and keyboard work belong because those same tasks must remain usable on the owner's phone. This replaces the earlier draft, not merely its NAS section. Reuse existing domain helpers, native controls, browser harness and additive default installation. Do not introduce a generic ontology, new scheduling system or new archive protocol.",
  "kind": "existing-flow",
  "flowId": "browse-my-repertoire",
  "currentBehaviour": "Evidence baseline: clean main b6bef3418572340c22e93deed79204878d45dc6d; the fresh context reports no pending proposals or open lanes. Re-read the current implementation rather than treating earlier draft recommendations as decisions.\n\nRepertoire.tsx defaults to Pathways and mounts three independently stateful views. My repertoire has form chips but no general search or composer/maestro facet. repertoireWorks includes title-only full pieces, but groupByDastgah drops Persian-family works with no identity metadata. persian.ts ranks transliterations but groups by folded raw text, so Shur and شور can remain separate. itemFields.ts, farsi.ts, persian.ts and seeds contain overlapping vocabulary knowledge.\n\nPersianFields holds optional raw strings. Materials are instrument-scoped named sources, but the twelve source kinds mix collections, pieces, activities and lesson events. ItemForm already has progressive kind-first creation and optional source/pathway/lesson/parent connections; retain this investment.\n\nCatalogue ownership is inferred from stageId + catalogKey, with a special cross-stage course-work resolver. Moving/detaching an item can defeat reuse; itemFiles also uses stageId for course material. isLosslesslyRemovable checks new status, practice count and blocks, not authored notes or other relationships. deletePathway/deleteStage already detach owned items. planDefaultPathways and course-level restoration already provide explicit additive installation and must be extended, not replaced.\n\nSetar's existing mixed pathway contains foundations, modal radif suggestions and generic form-name suggestions. Its gusheh factory does not populate the modal/gusheh identity fields. Tar already has Honarestan and Khonyagar pathways, so equivalent Persian browsing is an addition to a real instrument experience, not a new Tar subsystem. Repertoire's pathway card omits the existing current-stage pin; Today and SessionPlan pick a first matching pathway without a consistent archived/order policy.\n\nThe fixed flex shell already uses dynamic viewport units, safe areas and a main scroll region. useViewportGuard has 80ms/300ms timing, returns while an editable element remains focused, and calls element.scrollIntoView without limiting it to main. These are concrete weaknesses and a testable retained-focus blind spot, not proof of the owner's precise native-iPhone failure. Native trace evidence is still needed.\n\nArchive Refresh fetches a commit-pinned published setar/index.json through archiveIndex.ts; it does not run the NAS scanner. The owner's corrected explanation fits that boundary. No remaining live NAS defect has been established. The earlier draft's synthetic missing-rename scenario does not justify fingerprinting or a protocol migration.\n\nSchema v14 is installed through validateDB/migrateToCurrent, including both hydration paths. validateDB reconstructs the top-level database, so merely adding TypeScript fields would drop them. Existing attachment-byte, unfinished-session, revision and acknowledged-save protections are load-bearing.",
  "desiredBehaviour": "COHERENT END STATE\nThe owned practice item remains the only unit of practice. A reference catalogue suggests music; a pathway arranges suggestions and owned work; a study source names the material studied; a musical term classifies it. None stores another copy of practice progress, notes or history. The lane is broad across these connected flows, not a general rewrite of every subsystem.\n\nIMPLEMENTATION CHECKLIST\n[ ] 1. Capture the existing phone/desktop journey and commit focused failing fixtures before redesign. Highest leverage: enumerate every reader/writer of musical terms and reference identity, including rendered grouping, catalogue add/progress, course files and inbound installation. Record a concise before/after screen specification and the proof matrix in docs/repertoire-experience.md. Inspect actual screenshots before visual judgements. Use synthetic data, not the owner's live database.\n[ ] 2. Establish the small shared musical vocabulary and durable catalogue identity, then prove v15 migration/validation before wiring screens.\n[ ] 3. Build the coherent Repertoire, Pathways, source and item-editing experience on those shared decisions. Apply the same shell, hierarchy and interaction language across the everyday practice journey.\n[ ] 4. Diagnose and fix the native viewport problem from evidence, independently of the data work. Run focused browser families, full configured checks and owner-device acceptance before review.\n\nINTERFACE AND NAVIGATION\nKeep Today / Repertoire / Start / Lessons / More as the five stable destinations. Within Repertoire make My repertoire the default, with Pathways and All practice items clearly named peer views. One instrument selector and retained browse context serve those views; encode view, instrument, query and filters in route search parameters so back/forward and returning from details restore context. Validate stale/unknown parameters and expose Clear filters; browsing must not silently change Today's session instrument. Give one primary action per view, restrained secondary menus, readable Farsi titles, predictable back navigation, useful empty/no-results states, visible saving/error states and consistent destructive-action language. Do not introduce a design-system framework or replace the router.\nApply a small shared spacing/type/colour/control vocabulary through existing CSS and UI components. Cover phone and desktop, light/dark/system theme, keyboard/focus, labelled controls, mixed-script directionality and reduced motion. Aim for 44px primary touch controls and meet applicable WCAG 2.2 AA contrast, reflow, focus and target criteria. Keep dense metadata progressive. Redesign the connected Today, browse/detail/add, pathway/stage, source, Start/Active/Close and lesson entry surfaces where needed; Insights, reports and settings receive shared-style/metadata-consumer compatibility only, not independent feature redesigns. Preserve the owner's Plan then Routines ordering above the visible Today recommendation at 390x844.\n\nIPHONE VIEWPORT: DIAGNOSIS BEFORE PRESCRIPTION\nCapture layout/visual viewport sizes and offsets, scale, focused element, main scroll position and nav bounds through keyboard show, Done with retained focus, dismissal, repeat focus, rotation, route change and background/resume on Safari and installed PWA. Distinguish intentional keyboard accommodation from residual displacement. Prefer a correct CSS/scroll-owner arrangement; retain only the smallest event-driven correction if a measured WebKit behaviour requires one. Do not infer keyboard visibility from focus alone, assume interactive-widget support, use arbitrary sleeps/height thresholds, force blur, disable zoom or add scroll loops. Remove obsolete guard timers rather than add more. Any correction must respect zoom, hardware keyboards, absent VisualViewport, intended content scrolling and effect teardown. Browser geometry fixtures prove the chosen mechanism, not the native keyboard. If native evidence is unavailable, record that limit and do not claim the reported defect fixed or its owner acceptance complete; other lane work can proceed.\n\nSHARED MUSICAL TERMS, NOT AN ONTOLOGY\nIntroduce one small persisted vocabulary for Dastgah/Avaz, Form and Composer/Maestro, with stable namespaced IDs, kind, display name, explicit search aliases and archived state. Built-in Persian names are Farsi; IDs never derive from mutable labels. Keep the existing composer/maestro meaning without pretending every maestro is a verified composer or building a people/roles graph. Do not centralise gusheh titles: repeated names need modal/source context and remain item/reference text.\nUse one authoritative value per item field: a term reference or literal custom/legacy text, never parallel editable label and ID fields. Retain legacy strings verbatim during migration. A shared resolver may group/search an exact unique curated alias as its term without rewriting the owner string; display the original in editing/context where needed. Ambiguous, unknown and composite values stay literal and searchable, never fuzzy-assigned. Broader transliteration matching is for search, not identity. Existing Farsi normalisation is reused. Reconcile overlapping form/modal suggestion and rank tables into this source; title-search aliases unrelated to term identity may remain.\nProvide compact management under More: add, rename, edit aliases, archive/restore, and delete only unreferenced custom terms. Referenced or built-in deletion is refused; archived values remain readable and filterable on existing items but leave new-entry suggestions. Existing exact aliases cannot silently change meaning on edit. Name changes preserve IDs and former labels as aliases unless doing so would collide, in which case refuse and explain. Conflicting aliases never pick a first winner. Inline custom text remains possible without requiring registry administration. No merge wizard, synonym inference, bulk retagging or person biography fields.\n\nREPERTOIRE DISCOVERY\nSearch title, gusheh, displayed/raw term labels and aliases, study-source label and existing archive title aliases using the shared text normaliser. Provide combinable instrument, Dastgah/Avaz, Form and Composer/Maestro filters, with source/status available progressively if needed by the current view. Group by Dastgah/Avaz, Form, Composer/Maestro or source without changing stored data. All eligible works appear exactly once, including unclassified/title-only Persian full pieces; children stay with their parent and a matching child keeps its parent discoverable. Clearly distinguish no metadata from no matching results. Facets derive from actual owned items, not empty catalogue categories. Shared search semantics reach All practice items and Start while preserving their different eligibility rules.\n\nREFERENCE IDENTITY, OWNERSHIP AND REVERSIBLE ORGANISATION\nGive code-defined catalogue suggestions stable contextual reference IDs independent of editable stage/pathway placement and display text. Preserve the existing courseWorkKey equivalence for genuinely shared course works; identical generic keys such as chords in different stages remain different references. Use the smallest persisted binding representation that allows explicit linking of an existing same-instrument item and survives move/detach/deletion of its placement. A reference resolves to at most one item per instrument; several references may deliberately point to one owner item. Do not add a second catalogue database or universal work ontology.\nOne resolver drives row state, Add/Start, progress, next suggestion and course-material access. Add reuses an exact binding and is idempotent even after detach/reload. Offer Link existing when appropriate, with explicit choice; titles are candidates, not merge authority. Duplicate or ambiguous legacy bindings remain visible as unresolved candidates with all records intact, never first-match selection or automatic deletion. Do not force an instrument change to reuse Setar work for Tar: practice evidence remains separate.\nHiding a reference suggestion persists per pathway context and never hides/deletes the owned item from My repertoire or its explicit stage placement. Show hidden suggestions with Restore. Progress and next suggestion consume the same visible set; hiding is not completion, and an empty stage is not falsely mastered. Archive/restore pathways using the existing archived field; delete only after explaining that owned work is detached, not deleted. Restore missing named defaults/stages additively using existing planners, preserving edits, IDs, routines and pins; no automatic reseed and no destructive Reset to defaults button.\nReplace the unsafe catalogue Undo/delete shortcut with clearly labelled Unlink reference and Remove from pathway actions that keep owned data. Actual Delete practice item remains the existing explicit destructive workflow. This avoids a new pristine-snapshot/provenance subsystem just to guess when deletion is safe. Resolve active visible pathways consistently using existing order and stable ID tie-breaks, exclude archived ones and honour currentStageId everywhere. Do not add a separate preferred-pathway setting.\n\nSETAR AND TAR: SHARED REPERTOIRE, SEPARATE PRACTICE\nAuthor one shared, explicitly partial Persian reference catalogue for the existing Mirza Abdullah-oriented modal selections, scoped by source/recension and Dastgah/Avaz so repeated gusheh names are not conflated. Audit every existing suggestion against its stated source; do not claim a complete authoritative radif or invent missing gusheh sequences. Use its modal term IDs and actual gusheh metadata when creating new items. Setar and Tar get independently installable instrument-specific pathway instances from that same definition, with independent item bindings/progress. Keep Tar's existing Honarestan/Khonyagar and Guitar course content unchanged.\nFor new installations offer a clearly titled سه‌تار · ردیف میرزا عبدالله and the Tar equivalent. Forms is a grouping/lens over real repertoire using the shared Form vocabulary, with add-a-piece prefilled by the selected form. Do not create generic practice items merely named چهارمضراب or رنگ and do not create a second Forms taxonomy or a compulsory Forms pathway. Technique/foundation practice remains in ordinary items and existing stages/routines; do not manufacture a new foundation pathway.\nExisting mixed Setar pathways, their titles/stages/routines and generic-form items are preserved on upgrade. Offer the new named reference pathway explicitly, and reuse known bindings so adopting it cannot duplicate existing music. Explain how to archive or detach the old organisation using normal controls. No bespoke reorganisation wizard, bulk stage moves or automatic renaming of owner records. Correct only shipped reference definitions and provably unmodified seeded metadata; if proof is lacking preserve the record and let normal editing resolve it.\n\nSTUDY SOURCES\nDefine a source as the named book, collection/radif edition, course or teaching material from which work is studied. It is not a person, an individual practice item, a pathway or a dated lesson record. Keep Material and materialId as the existing implementation; no entity rename migration. For new sources expose the existing radif, method_book, repertoire (label Collection), course and other kinds with clear examples. Legacy piece/song/lesson/activity kinds stay stored and editable as legacy values, not coerced into a guessed new meaning. Preserve sourceName, parentTitle, section, teacherOrSource and notes, including fields not visible in the compact editor.\nDefault creation to the browsed/session instrument, keep only title required and preserve inline creation. Composer/Maestro classifies the work; the source title states the edition/tradition where appropriate; a lesson is linked separately and a pathway is organisation. Do not infer authorship from source titles or add mandatory person/source/pathway relationships. For code-defined course source reuse, add a bounded stable source key only where needed to stop renaming a known seeded source creating another copy; backfill only uniquely proven origins, and ask on multiple candidates. Do not deduplicate arbitrary sources by title or share user Material records across instruments.\n\nSAVED DATA AND COMPATIBILITY\nUse one next schema version, v15, for vocabulary, catalogue bindings and hidden-reference choices. Implement pure deterministic migration and strict validation in the existing migrateToCurrent/validateDB chain, including top-level reconstruction. Re-running on current-schema partial conversions must neither lose fields nor reseed intentionally empty collections. Validate present malformed collections/records, duplicate new IDs, wrong-kind/dangling term refs, cross-instrument/dangling bindings and invalid suppression scope before any install; absence in genuine legacy data is not the same as malformed current data. Keep ambiguous legacy strings/keys as unresolved legacy evidence rather than fabricating identities. Never coerce an object to text or drop a bad row to make validation pass.\nDerive migrated IDs from stable existing identity only; do not read clock, random state, input order or locale-sensitive sort to decide identity. Address the existing pre-v3 seedPathways wall-clock default narrowly where it would make this supported inbound chain nondeterministic; use a documented fixed legacy timestamp fallback, not fresh dates. No broader old-schema cleanup. Preserve owner notes, empty values, custom metadata, all item IDs, history, reviews, schedule fields, lessons, agenda, attachments and references. The old v13 dummy-text waiver grants no new deletion permission.\nVerify full/state-only backup import, sync pull, Keep remote, archive restore, cold recovery and both persist migration/merge paths. Preserve new state through export/content hashing and prove older v14 readers refuse v15 without overwrite. Keep unfinished-practice/revision guards and attachment byte ownership unchanged. Registry/source editing must report durable save only after existing storage acknowledgement, retain failed drafts and retry current text. Reuse existing patterns rather than introduce a transaction framework.\nNAS source-index schema, scanner, publisher, matching, rename, absence/reappearance and refresh transaction are OUTSIDE this lane. Existing source metadata remains raw source evidence; if item term references require adaptation in sourceReconcile, limit changes to the shared musical-field resolver/adoption boundary and preserve stale-premise protection. No location or identity logic changes. Retain existing archive regression coverage.\n\nFOCUSED FAMILY PROOF PLAN, BEFORE FIRST REVIEW\nCommit tests/fixtures/repertoire-legacy-v14.json and repertoire-current-v15.json plus independently authored expectations, not outputs generated by the implementation under test. Record the reader/writer matrix and commands in docs/repertoire-experience.md. Provide one reproducible focused runner at scripts/check-repertoire-families.mjs using the existing Vitest/browser harness, no new dependencies. Every automated acceptance title below names exactly one test; loop engine/viewport cases inside that test instead of generating duplicate titles.\nFamily A, terms and discovery: unique aliases / ambiguous aliases / unknown literals / empty / malformed / archived / renamed, crossed with modal/form/person kinds and owned work/part/title-only work; consumers include forms, detail/practice rendering, search/facets/grouping, seeds, source-metadata adoption and export/import.\nFamily B, references: exact / absent / conflicting legacy binding, same/different instrument, ordinary same-key versus declared shared course work; cross with detach/move/archive/delete, hide/restore, explicit link, repeated stale Add and course-file rendering. Cover all stage/progress/next-unit and Today/SessionPlan consumers with independent expected item IDs and counts.\nFamily C, inbound safety: every install door crossed with valid legacy/current/partial state versus malformed identity or unsupported version, with and without local attachment bytes and unfinished/concurrently completed practice. Exercise real rendered import/recovery/sync wiring using the existing fake-remote boundary, not helper-only proofs. Assert before/after DB and blob projections and acknowledged failure/retry semantics. No network mutation or real owner import.\nFamily D, UI/viewport: Chromium and WebKit at 390x844 and desktop, long Farsi/English/mixed labels, empty/dense data, light/dark, offline/reload/back navigation, keyboard-only use and error states. Geometry cases include retained focus, blur, absent VisualViewport, zoom, route teardown and repeated transitions; physical keyboard assertions are separately manual. Retain every pageerror and isolate Vite caches as the current harness does. Run existing scheduling/practice/notes/lesson/archive regressions plus configured typecheck, lint, unit, build and secrets after focused tests. No skipped engine reported as success.\n\nNEXT THREE ACTIONS FOR CLAUDE\n1. Highest leverage: reproduce the identity/grouping counterexamples, capture baseline screenshots and map all consumers before choosing storage fields or moving controls.\n2. Implement and prove the minimal shared term/reference model and lossless v15 inbound boundary, leaving NAS protocols untouched.\n3. Wire the coherent UI and shared Setar/Tar reference views, complete the evidence-led viewport correction, and run the focused route plus owner acceptance.",
  "mustNotChange": [
    "The core loop remains one item, one mode, one focus, one result, one next action. Working notes stay in their existing canonical home and use the acknowledged, item-tagged editor.",
    "No scheduling/scoring/SM-2, review-completion, snooze, session-plan or routine timing changes. Administration is not practice evidence.",
    "One instrument per Today session, peer Plan/Routines doorways above the recommendation, title-only Quick add and progressive one-step full creation; no newly required metadata. Start under 30 seconds, close under 60 seconds.",
    "Local-first/offline, no gamification/backend/account, NAS media remains references only, device secrets never enter saved data. Existing sync, revision, attachment and unfinished-session protections remain intact.",
    "No mutation of real owner data during investigation/tests and no widening the v13 retired-text waiver."
  ],
  "assumptions": [
    "A1: The previous Claude builder selection remains in force. This is a replacement planning artifact only; the owner imports and approves it.",
    "A2: The owner's NAS task-timing correction supersedes the earlier draft. No independent remaining archive defect has been demonstrated.",
    "A3: Existing catalogue selections can support a clearly labelled partial shared Persian reference. Unsupported musical attribution will be left unspecified, not guessed."
  ],
  "possibleConflicts": [
    "The existing viewport guidance describes the current guard as sufficient. Revise that guidance in place only after root-cause evidence; a source-level blind spot is not native-device confirmation.",
    "Existing default-pathway names/structure and Undo wording change for future use, but upgrades must preserve edited legacy paths and owned items. No automatic reset is authorised.",
    "Primary Flow is browse-my-repertoire; capture-a-practice-item, work-a-pathway-stage, practise-todays-recommendation, run-a-session-plan, log-a-class and back-up-and-restore are affected consumers. Reflect actual changed mechanics through the normal governed workflow, not new invented product Flows.",
    "Native iPhone acceptance needs the owner's device. Browser WebKit does not replace it; keep that check visibly outstanding if unavailable."
  ],
  "scope": {
    "allow": [
      "src/App.tsx",
      "index.html",
      "src/styles/global.css",
      "src/styles/contrast.test.ts",
      "src/domain/types.ts",
      "src/domain/index.ts",
      "src/domain/factories.ts",
      "src/domain/labels.ts",
      "src/domain/migrations.ts",
      "src/domain/io.ts",
      "src/domain/seed.ts",
      "src/domain/pathwaySeed.ts",
      "src/domain/pathways.ts",
      "src/domain/courseSeed.ts",
      "src/domain/repertoire.ts",
      "src/domain/persian.ts",
      "src/domain/farsi.ts",
      "src/domain/selectors.ts",
      "src/domain/itemFiles.ts",
      "src/domain/sourceReconcile.ts",
      "src/domain/migrations.test.ts",
      "src/domain/io.test.ts",
      "src/domain/seedMigration.test.ts",
      "src/domain/pathways.test.ts",
      "src/domain/courseSeed.test.ts",
      "src/domain/repertoire.test.ts",
      "src/domain/persian.test.ts",
      "src/domain/farsi.test.ts",
      "src/domain/selectors.test.ts",
      "src/domain/itemFiles.test.ts",
      "src/domain/sourceReconcile.test.ts",
      "src/store/useStore.ts",
      "src/store/lookups.ts",
      "src/components/Layout.tsx",
      "src/components/ui.tsx",
      "src/components/ItemForm.tsx",
      "src/components/ItemCard.tsx",
      "src/components/ItemMaterial.tsx",
      "src/components/QuickAdd.tsx",
      "src/components/useViewportGuard.ts",
      "src/components/itemFields.ts",
      "src/components/itemFormValues.ts",
      "src/components/itemKinds.ts",
      "src/components/format.ts",
      "src/components/itemKinds.test.ts",
      "src/components/format.test.ts",
      "src/components/direction.test.ts",
      "src/pages/Repertoire.tsx",
      "src/pages/ItemDetail.tsx",
      "src/pages/NewItem.tsx",
      "src/pages/PathwayDetail.tsx",
      "src/pages/StageDetail.tsx",
      "src/pages/Materials.tsx",
      "src/pages/More.tsx",
      "src/pages/Today.tsx",
      "src/pages/StartBlock.tsx",
      "src/pages/ActiveBlock.tsx",
      "src/pages/CloseBlock.tsx",
      "src/pages/SessionPlan.tsx",
      "src/pages/Lessons.tsx",
      "src/pages/RoutineRunner.tsx",
      "src/pages/RoutineEdit.tsx",
      "src/domain/musicTerms.ts",
      "src/domain/musicTerms.test.ts",
      "src/domain/referenceCatalog.ts",
      "src/domain/referenceCatalog.test.ts",
      "src/domain/studySources.ts",
      "src/domain/studySources.test.ts",
      "src/pages/MusicTerms.tsx",
      "src/components/MusicalTermField.tsx",
      "src/components/ReferenceChoices.tsx",
      "src/components/viewport.ts",
      "src/components/viewport.test.ts",
      "tests/practiceBrowser.ts",
      "tests/repertoire-experience.browser.test.ts",
      "tests/repertoire-inbound.browser.test.ts",
      "tests/repertoire-viewport.browser.test.ts",
      "tests/repertoire-families.test.ts",
      "tests/fixtures/repertoire-legacy-v14.json",
      "tests/fixtures/repertoire-current-v15.json",
      "tests/fixtures/repertoire-family-expectations.json",
      "scripts/check-repertoire-families.mjs",
      "AGENTS.md",
      "DECISIONS.md",
      "docs/product-spec.md",
      "docs/repertoire-experience.md",
      "README.md"
    ],
    "forbid": [
      ".prismatica/**",
      ".agents/**",
      ".codex/**",
      ".github/**",
      "src/domain/scheduling.ts",
      "src/domain/scoring.ts",
      "src/domain/recommend.ts",
      "src/domain/plan.ts",
      "src/domain/practiceSignal.ts",
      "src/domain/practiceSession.ts",
      "src/domain/routines.ts",
      "src/domain/courseData.ts",
      "src/domain/khonyagarData.ts",
      "src/domain/setarClasses.ts",
      "src/domain/sourceArchive.ts",
      "src/domain/recordings.ts",
      "src/store/archiveIndex.ts",
      "src/store/gitRemote.ts",
      "src/store/syncEngine.ts",
      "src/store/githubSync.ts",
      "src/store/idb.ts",
      "src/store/backup.ts",
      "scripts/scan-setar-classes.mjs",
      "scripts/publish-setar-index.mjs",
      "scripts/run-setar-index.sh",
      "package.json",
      "package-lock.json",
      "vite.config.ts",
      "public/**"
    ]
  },
  "exclusions": [
    "NAS fingerprinting, archive-v2, relocation maps, scanner/publisher deployment, polling changes, media-file renames and refresh-transaction redesign. A genuinely new archive defect needs a separately scoped decision, not opportunistic expansion here.",
    "Generic metadata ontology, biographies/credits graph, term merge wizard, fuzzy identity inference, many-layer provenance framework, destructive bulk normalisation and automated deduplication of owner items.",
    "New preferred-pathway settings, dedicated Forms taxonomy/pathway, foundation-pathway product, legacy reorganisation wizard or automatic replacement of existing Setar organisation.",
    "Scheduling/practice-engine changes, analytics/report feature redesign, new sync/backup architecture, new dependencies, and whole-repo component rewrites.",
    "No implementation, imported lane, issue, branch or PR is created by this planning session."
  ],
  "acceptance": [
    {
      "description": "Legacy/current/partial v15 fixtures migrate identically across clocks and repeated runs, preserve authored strings and IDs, leave deliberately empty collections empty and handle pre-v3 seeding deterministically. No new deletion waiver.",
      "test": "repertoire v15 migration is deterministic idempotent and lossless"
    },
    {
      "description": "Wrong types, duplicate new IDs, wrong-kind/dangling term refs and invalid binding/suppression records refuse installation, while unknown/ambiguous legacy strings remain exact and usable.",
      "test": "repertoire identity validation refuses malformed state without discarding legacy evidence"
    },
    {
      "description": "Curated unique aliases group Shur and شور; ambiguous names, composites and substrings never establish identity. Renamed and archived terms retain stable references; broader search matching does not change ownership.",
      "test": "musical term resolution separates exact identity from broad search"
    },
    {
      "description": "Real add/rename/alias/archive/restore/delete controls preserve references across reload, refuse referenced/built-in deletion and alias collisions, and retain drafts through failed acknowledged saves and retry.",
      "test": "musical term management preserves identities and reports durable saves honestly"
    },
    {
      "description": "Combined query/facets find terms, maestros, sources, raw text and existing archive aliases; title-only Persian full pieces remain visible, parents occur once, matching parts expose their parent and empty results are clear.",
      "test": "repertoire discovery includes every eligible work without duplicate parents"
    },
    {
      "description": "Rendered My repertoire, All practice items and Start share text matching but retain eligibility differences; switching views and back/forward preserve browse state without changing Today's session instrument.",
      "test": "repertoire navigation restores browse context without changing session scope"
    },
    {
      "description": "Reference Add/Start/row/progress/course-file consumers agree after detach, move, stage/path deletion and reload; repeat stale Add reuses one item; same generic keys across distinct contexts never conflate.",
      "test": "catalogue identity survives placement changes across every consumer"
    },
    {
      "description": "Link existing preserves all owner fields; ambiguous legacy matches and duplicates require an explicit choice, never first-match/title merging. Several references can deliberately reuse one item; cross-instrument reuse refuses.",
      "test": "catalogue linking preserves owner records and refuses ambiguous automatic reuse"
    },
    {
      "description": "Hiding/restoring survives reload and backup round trip, affects only reference visibility in its context, preserves explicitly placed and owned work, and keeps progress/next suggestion consistent without treating hidden work as done.",
      "test": "hidden reference suggestions never delete or complete owned practice"
    },
    {
      "description": "Existing additive installation restores only missing selected defaults/stages, preserves edited rows and routines and never auto-reseeds on load. Archive/restore and repeated no-op actions are idempotent.",
      "test": "pathway restoration remains explicit additive and lossless"
    },
    {
      "description": "Unlink reference and Remove from pathway retain notes, attachments, lesson/agenda/routine links, children, reviews and all history, even for a new never-practised item. No catalogue shortcut calls automatic item deletion.",
      "test": "pathway removal keeps enriched and never practised owner items"
    },
    {
      "description": "One shared contextual Persian catalogue yields independent Setar/Tar instances; duplicate gusheh names stay scoped, new gusheh items receive modal metadata, and existing Guitar/Honarestan/Khonyagar work/material identities remain intact.",
      "test": "Setar and Tar share reference definitions without sharing practice state"
    },
    {
      "description": "Upgrade leaves the old mixed Setar path, generic-form items, text, pins and routines unchanged. Explicitly adding the new radif view reuses proven bindings; Forms derives actual works from the term vocabulary and creates no generic form item.",
      "test": "new Persian reference views preserve existing Setar organisation"
    },
    {
      "description": "Today, both SessionPlan derivations, Repertoire and PathwayDetail use the same visible ordered pathway and pinned stage, including archived/deleted pins and equal-order tie cases, without changing scheduling decisions.",
      "test": "pathway context readers agree on visible routes and pinned stages"
    },
    {
      "description": "New source choices describe collections/materials; legacy kinds and hidden fields survive edit/export, session instrument defaults correctly, and known course-source renames reuse stable provenance while ambiguous candidates require choice.",
      "test": "study sources clarify new choices without rewriting legacy meaning"
    },
    {
      "description": "Every inbound door installs valid v15 and legacy fixtures consistently and refuses malformed/unsupported state before replacement: full/state-only import, fake-remote pull, Keep remote, archive restore, cold recovery and both hydration paths. Preserve existing byte/session/revision guards.",
      "test": "every inbound door enforces the repertoire v15 boundary"
    },
    {
      "description": "Export/import and content hashing preserve terms/bindings/hides and custom strings. A disposable baseline v14 reader refuses a v15 backup without replacing state/blobs; current reader accepts prior backups.",
      "test": "repertoire backups round trip and older readers refuse v15 safely"
    },
    {
      "description": "Source metadata adoption understands term-backed and literal fields while retaining raw source facts, owner edits and stale-premise refusals; archive identity/location/refresh outcomes remain unchanged for existing fixtures.",
      "test": "musical metadata integration preserves archive reconciliation boundaries"
    },
    {
      "description": "Actual rendered Chromium/WebKit phone and desktop journeys exercise browse/edit/add/link/hide/restore/Tar/source/term flows plus Today/Start/Active/Close, reload/offline/failure states and all pageerrors. Assert real saved state as well as UI.",
      "test": "the unified repertoire journey works in Chromium and WebKit"
    },
    {
      "description": "Chosen viewport mechanism handles retained focus, blur, repeated geometry changes, zoom, absent VisualViewport, route teardown and hardware-keyboard geometry without timer guesses, forced blur or scrolling loops. Expected geometry is fixture-authored, not copied from implementation.",
      "test": "viewport recovery respects focus zoom and scroll ownership"
    },
    {
      "description": "Both engines demonstrate mixed-script wrapping, labelled controls, keyboard access, focus visibility, theme contrast, reflow and accessible empty/error states at phone/desktop widths; Today preserves the owner's ordering and visible recommendation.",
      "test": "the shared practice shell remains accessible and readable across layouts"
    },
    {
      "description": "Before/after projections for term/source/reference/pathway administration leave practice history, item status/ratings/SM-2/dates, notes, reviews, agenda and unfinished block/routine/plan untouched apart from explicitly chosen organisation fields.",
      "test": "repertoire administration never fabricates or resets practice evidence"
    },
    {
      "description": "Before first review, inspect the committed consumer/invariant matrix, independent fixture expectations and reproducible focused runner; every acceptance title maps to exactly one test, both engines actually ran, and proof limits are explicit.",
      "test": "manual:OWNER"
    },
    {
      "description": "On the owner's actual iPhone Safari and installed PWA, record device/iOS version and before/after viewport traces, keyboard Done with retained focus, repeated opening/dismissal, scroll, rotation, route change, background/resume and zoom. Verify no residual lifted bar, occluded editing or lost text. Without device evidence this remains outstanding.",
      "test": "manual:OWNER"
    },
    {
      "description": "Review the coherent phone/desktop journey and partial radif labels against source evidence. Confirm useful Forms browsing, maestro discovery, screen-reader/keyboard operation, Plan then Routines ordering and start/close budgets. Keep a pre-upgrade full backup; approve migration on a disposable copy before any real upgrade.",
      "test": "manual:OWNER"
    }
  ],
  "risk": {
    "touchesAuth": false,
    "touchesPayments": false,
    "touchesSavedData": true,
    "copyOnly": false,
    "rationale": "HEAVY: schema migration and strict inbound identity validation, shared reference and vocabulary semantics, many rendered consumers and native-mobile behaviour. Main hazards are lost owner data, accidental duplicate items, misleading progress, dropped schema fields, and false keyboard claims. Boundary and family tests plus owner-device acceptance are mandatory."
  },
  "delta": {
    "step": 1,
    "today": "Repertoire browsing depends on separate raw-text groups and placement-based catalogue lookup; reference, owned practice and source concepts are inconsistently presented.",
    "instead": "Browse owned music through shared term-aware search and facets, retain browsing context, and follow or hide reference suggestions without duplicating or deleting practice data. Setar/Tar share reference definitions, not practice state.",
    "keep": [
      "Owned PracticeItem is the practice unit.",
      "Core practice/scheduling and local-first guarantees.",
      "Existing owner data and explicit additive defaults."
    ],
    "assumptions": [
      "NAS refresh delay was external indexer timing, not an app relocation defect."
    ],
    "showMe": "On phone and desktop, find the same work by Farsi/Latin term or maestro, open and return without losing filters, move it out of a stage and add its reference without duplication, hide/restore suggestions, and install Tar's shared radif view with independent practice. Show unclassified works, safe legacy migration, honest failed saves and the actual iPhone keyboard recovery."
  },
  "desiredRules": [],
  "docsDelta": [
    "AGENTS.md",
    "DECISIONS.md",
    "docs/product-spec.md",
    "docs/repertoire-experience.md",
    "README.md"
  ]
}
```
````

## The approved Delta this change must deliver

# Browse owned music through shared term-aware search and facets, retain browsing context, and follow or hide reference suggestions without duplicating or deleting practice data. Setar/Tar share reference definitions, not practice state.

_approved · about "browse-my-repertoire" step 1_

## Today

Repertoire browsing depends on separate raw-text groups and placement-based catalogue lookup; reference, owned practice and source concepts are inconsistently presented.

## Instead

Browse owned music through shared term-aware search and facets, retain browsing context, and follow or hide reference suggestions without duplicating or deleting practice data. Setar/Tar share reference definitions, not practice state.

## Keep

- Owned PracticeItem is the practice unit.
- Core practice/scheduling and local-first guarantees.
- Existing owner data and explicit additive defaults.

## New assumptions

- NAS refresh delay was external indexer timing, not an app relocation defect.

## Show me

On phone and desktop, find the same work by Farsi/Latin term or maestro, open and return without losing filters, move it out of a stage and add its reference without duplication, hide/restore suggestions, and install Tar's shared radif view with independent practice. Show unclassified works, safe legacy migration, honest failed saves and the actual iPhone keyboard recovery.


## Flows near this scope (understand before you change them)

Compact cards — read a Flow's canonical file when your change touches it.

- **See and adjust the scheduling engine** (`adjust-how-scheduling-works`) — Understand exactly why an item was recommended and a date chosen — and change the numbers if they do not suit you.
  touchpoints: `src/pages/Settings.tsx`, `src/pages/CloseBlock.tsx`, `src/domain/scheduling.ts`, `src/domain/plan.ts`, `src/domain/types.ts`, `src/store/useStore.ts` · canonical: `.prismatica/flows/adjust-how-scheduling-works.md`
- **Back up and restore everything** (`back-up-and-restore`) — Keep an independent copy of all practice data and files, and put it back on any device.
  touchpoints: `src/store/backup.ts`, `src/store/idb.ts`, `src/domain/io.ts`, `src/pages/Settings.tsx`, `src/store/useStore.ts` · canonical: `.prismatica/flows/back-up-and-restore.md`
- **Find something in my repertoire** (`browse-my-repertoire`) — See everything you play, grouped the way you think about it, and open the one you mean.
  touchpoints: `src/pages/Repertoire.tsx`, `src/pages/ItemDetail.tsx`, `src/pages/Materials.tsx`, `src/domain/repertoire.ts`, `src/domain/persian.ts`, `src/domain/farsi.ts` · canonical: `.prismatica/flows/browse-my-repertoire.md`
- **Add a practice item** (`capture-a-practice-item`) — Get a new piece, gusheh, étude, passage or technique into the app without breaking your concentration.
  touchpoints: `src/components/QuickAdd.tsx`, `src/components/ItemForm.tsx`, `src/components/itemKinds.ts`, `src/pages/NewItem.tsx`, `src/pages/ItemDetail.tsx`, `src/store/useStore.ts`, `src/domain/factories.ts` · canonical: `.prismatica/flows/capture-a-practice-item.md`
- **Deal with a due review** (`clear-a-due-review`) — Handle material that is due to come back, without ever faking that it was practised.
  touchpoints: `src/pages/Today.tsx`, `src/store/useStore.ts`, `src/domain/scheduling.ts`, `src/domain/selectors.ts` · canonical: `.prismatica/flows/clear-a-due-review.md`
- **Install the app and keep it current** (`install-the-app-and-keep-it-current`) — Run the app installed on each device, practise with no network at all, and take new versions without ever reinstalling.
  touchpoints: `src/components/Layout.tsx`, `src/pages/Settings.tsx`, `vite.config.ts` · canonical: `.prismatica/flows/install-the-app-and-keep-it-current.md`
- **Log a class and its follow-up work** (`log-a-class`) — Record a lesson, write up what was said after rewatching it, and turn it into concrete work before the next one.
  touchpoints: `src/pages/Lessons.tsx`, `src/components/Attachments.tsx`, `src/domain/recordings.ts`, `src/domain/setarClasses.ts`, `src/domain/files.ts`, `src/domain/selectors.ts`, `src/store/useStore.ts` · canonical: `.prismatica/flows/log-a-class.md`
- **Point this device at the NAS** (`point-this-device-at-the-nas`) — Give this device the address that turns a class recording or score link into a file it can actually open — without any of those files entering the app.
  touchpoints: `src/pages/Settings.tsx`, `src/pages/Lessons.tsx`, `src/domain/recordings.ts`, `src/store/backup.ts` · canonical: `.prismatica/flows/point-this-device-at-the-nas.md`
- **Practise what the app suggests** (`practise-todays-recommendation`) — Practise the one thing the app suggests next and leave an honest record of how it went.
  touchpoints: `src/pages/Today.tsx`, `src/pages/StartBlock.tsx`, `src/pages/ActiveBlock.tsx`, `src/pages/CloseBlock.tsx`, `src/store/useStore.ts`, `src/domain/recommend.ts`, `src/domain/scoring.ts`, `src/domain/scheduling.ts`, `src/domain/blocks.ts`, `src/domain/practiceSignal.ts`, `src/components/useScreenAwake.ts`, `src/components/screenAwake.ts` · canonical: `.prismatica/flows/practise-todays-recommendation.md`
- **Take questions and a summary to class** (`prepare-for-the-next-class`) — Arrive at the lesson with the questions that came up while practising, and a short honest account of the period.
  touchpoints: `src/pages/TeacherReport.tsx`, `src/components/ClassQuestions.tsx`, `src/domain/questions.ts`, `src/domain/report.ts`, `src/pages/Lessons.tsx`, `src/pages/CloseBlock.tsx` · canonical: `.prismatica/flows/prepare-for-the-next-class.md`
- **Run a time-budgeted session** (`run-a-session-plan`) — Turn the minutes actually available into an ordered session, then practise it block by block.
  touchpoints: `src/pages/SessionPlan.tsx`, `src/pages/Today.tsx`, `src/pages/ActiveBlock.tsx`, `src/domain/plan.ts`, `src/domain/practiceSignal.ts`, `src/components/useScreenAwake.ts`, `src/components/screenAwake.ts`, `src/store/useStore.ts` · canonical: `.prismatica/flows/run-a-session-plan.md`
- **See how practice is actually going** (`see-practice-patterns`) — Get a calm, neutral read on the last week or month across everything you play.
  touchpoints: `src/pages/Insights.tsx`, `src/pages/Today.tsx`, `src/domain/insights.ts`, `src/domain/io.ts` · canonical: `.prismatica/flows/see-practice-patterns.md`
- **Keep the MacBook and iPhone in step** (`sync-devices-via-github`) — Practise on either device and have both hold the same data, without a server or an account.
  touchpoints: `src/store/syncEngine.ts`, `src/store/githubSync.ts`, `src/store/gitRemote.ts`, `src/domain/sync.ts`, `src/domain/canonical.ts`, `src/store/revision.ts`, `src/pages/Settings.tsx`, `src/App.tsx` · canonical: `.prismatica/flows/sync-devices-via-github.md`
- **Work through a pathway stage** (`work-a-pathway-stage`) — Follow a route you trust — see where you are, take the next suggestion into your own items, and practise it.
  touchpoints: `src/pages/PathwayDetail.tsx`, `src/pages/StageDetail.tsx`, `src/pages/RoutineRunner.tsx`, `src/domain/pathways.ts`, `src/domain/pathwaySeed.ts`, `src/domain/routines.ts`, `src/domain/practiceSignal.ts`, `src/components/useScreenAwake.ts`, `src/components/screenAwake.ts`, `src/store/useStore.ts`, `src/pages/Repertoire.tsx` · canonical: `.prismatica/flows/work-a-pathway-stage.md`

## App rules

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


## The goal

Unify repertoire discovery, musical metadata and pathways around a calmer practice interface

## Stay in scope — you may ONLY change

- src/App.tsx
- index.html
- src/styles/global.css
- src/styles/contrast.test.ts
- src/domain/types.ts
- src/domain/index.ts
- src/domain/factories.ts
- src/domain/labels.ts
- src/domain/migrations.ts
- src/domain/io.ts
- src/domain/seed.ts
- src/domain/pathwaySeed.ts
- src/domain/pathways.ts
- src/domain/courseSeed.ts
- src/domain/repertoire.ts
- src/domain/persian.ts
- src/domain/farsi.ts
- src/domain/selectors.ts
- src/domain/itemFiles.ts
- src/domain/sourceReconcile.ts
- src/domain/migrations.test.ts
- src/domain/io.test.ts
- src/domain/seedMigration.test.ts
- src/domain/pathways.test.ts
- src/domain/courseSeed.test.ts
- src/domain/repertoire.test.ts
- src/domain/persian.test.ts
- src/domain/farsi.test.ts
- src/domain/selectors.test.ts
- src/domain/itemFiles.test.ts
- src/domain/sourceReconcile.test.ts
- src/store/useStore.ts
- src/store/lookups.ts
- src/components/Layout.tsx
- src/components/ui.tsx
- src/components/ItemForm.tsx
- src/components/ItemCard.tsx
- src/components/ItemMaterial.tsx
- src/components/QuickAdd.tsx
- src/components/useViewportGuard.ts
- src/components/itemFields.ts
- src/components/itemFormValues.ts
- src/components/itemKinds.ts
- src/components/format.ts
- src/components/itemKinds.test.ts
- src/components/format.test.ts
- src/components/direction.test.ts
- src/pages/Repertoire.tsx
- src/pages/ItemDetail.tsx
- src/pages/NewItem.tsx
- src/pages/PathwayDetail.tsx
- src/pages/StageDetail.tsx
- src/pages/Materials.tsx
- src/pages/More.tsx
- src/pages/Today.tsx
- src/pages/StartBlock.tsx
- src/pages/ActiveBlock.tsx
- src/pages/CloseBlock.tsx
- src/pages/SessionPlan.tsx
- src/pages/Lessons.tsx
- src/pages/RoutineRunner.tsx
- src/pages/RoutineEdit.tsx
- src/domain/musicTerms.ts
- src/domain/musicTerms.test.ts
- src/domain/referenceCatalog.ts
- src/domain/referenceCatalog.test.ts
- src/domain/studySources.ts
- src/domain/studySources.test.ts
- src/pages/MusicTerms.tsx
- src/components/MusicalTermField.tsx
- src/components/ReferenceChoices.tsx
- src/components/viewport.ts
- src/components/viewport.test.ts
- tests/practiceBrowser.ts
- tests/repertoire-experience.browser.test.ts
- tests/repertoire-inbound.browser.test.ts
- tests/repertoire-viewport.browser.test.ts
- tests/repertoire-families.test.ts
- tests/fixtures/repertoire-legacy-v14.json
- tests/fixtures/repertoire-current-v15.json
- tests/fixtures/repertoire-family-expectations.json
- scripts/check-repertoire-families.mjs
- AGENTS.md
- DECISIONS.md
- docs/product-spec.md
- docs/repertoire-experience.md
- README.md

Never touch:

- .prismatica/**
- .agents/**
- .codex/**
- .github/**
- src/domain/scheduling.ts
- src/domain/scoring.ts
- src/domain/recommend.ts
- src/domain/plan.ts
- src/domain/practiceSignal.ts
- src/domain/practiceSession.ts
- src/domain/routines.ts
- src/domain/courseData.ts
- src/domain/khonyagarData.ts
- src/domain/setarClasses.ts
- src/domain/sourceArchive.ts
- src/domain/recordings.ts
- src/store/archiveIndex.ts
- src/store/gitRemote.ts
- src/store/syncEngine.ts
- src/store/githubSync.ts
- src/store/idb.ts
- src/store/backup.ts
- scripts/scan-setar-classes.mjs
- scripts/publish-setar-index.mjs
- scripts/run-setar-index.sh
- package.json
- package-lock.json
- vite.config.ts
- public/**
- The core loop remains one item, one mode, one focus, one result, one next action. Working notes stay in their existing canonical home and use the acknowledged, item-tagged editor.
- No scheduling/scoring/SM-2, review-completion, snooze, session-plan or routine timing changes. Administration is not practice evidence.
- One instrument per Today session, peer Plan/Routines doorways above the recommendation, title-only Quick add and progressive one-step full creation; no newly required metadata. Start under 30 seconds, close under 60 seconds.
- Local-first/offline, no gamification/backend/account, NAS media remains references only, device secrets never enter saved data. Existing sync, revision, attachment and unfinished-session protections remain intact.
- No mutation of real owner data during investigation/tests and no widening the v13 retired-text waiver.
- NAS fingerprinting, archive-v2, relocation maps, scanner/publisher deployment, polling changes, media-file renames and refresh-transaction redesign. A genuinely new archive defect needs a separately scoped decision, not opportunistic expansion here.
- Generic metadata ontology, biographies/credits graph, term merge wizard, fuzzy identity inference, many-layer provenance framework, destructive bulk normalisation and automated deduplication of owner items.
- New preferred-pathway settings, dedicated Forms taxonomy/pathway, foundation-pathway product, legacy reorganisation wizard or automatic replacement of existing Setar organisation.
- Scheduling/practice-engine changes, analytics/report feature redesign, new sync/backup architecture, new dependencies, and whole-repo component rewrites.
- No implementation, imported lane, issue, branch or PR is created by this planning session.

## Definition of done

- **ac-1** — Legacy/current/partial v15 fixtures migrate identically across clocks and repeated runs, preserve authored strings and IDs, leave deliberately empty collections empty and handle pre-v3 seeding deterministically. No new deletion waiver. → proven by `repertoire v15 migration is deterministic idempotent and lossless`
- **ac-2** — Wrong types, duplicate new IDs, wrong-kind/dangling term refs and invalid binding/suppression records refuse installation, while unknown/ambiguous legacy strings remain exact and usable. → proven by `repertoire identity validation refuses malformed state without discarding legacy evidence`
- **ac-3** — Curated unique aliases group Shur and شور; ambiguous names, composites and substrings never establish identity. Renamed and archived terms retain stable references; broader search matching does not change ownership. → proven by `musical term resolution separates exact identity from broad search`
- **ac-4** — Real add/rename/alias/archive/restore/delete controls preserve references across reload, refuse referenced/built-in deletion and alias collisions, and retain drafts through failed acknowledged saves and retry. → proven by `musical term management preserves identities and reports durable saves honestly`
- **ac-5** — Combined query/facets find terms, maestros, sources, raw text and existing archive aliases; title-only Persian full pieces remain visible, parents occur once, matching parts expose their parent and empty results are clear. → proven by `repertoire discovery includes every eligible work without duplicate parents`
- **ac-6** — Rendered My repertoire, All practice items and Start share text matching but retain eligibility differences; switching views and back/forward preserve browse state without changing Today's session instrument. → proven by `repertoire navigation restores browse context without changing session scope`
- **ac-7** — Reference Add/Start/row/progress/course-file consumers agree after detach, move, stage/path deletion and reload; repeat stale Add reuses one item; same generic keys across distinct contexts never conflate. → proven by `catalogue identity survives placement changes across every consumer`
- **ac-8** — Link existing preserves all owner fields; ambiguous legacy matches and duplicates require an explicit choice, never first-match/title merging. Several references can deliberately reuse one item; cross-instrument reuse refuses. → proven by `catalogue linking preserves owner records and refuses ambiguous automatic reuse`
- **ac-9** — Hiding/restoring survives reload and backup round trip, affects only reference visibility in its context, preserves explicitly placed and owned work, and keeps progress/next suggestion consistent without treating hidden work as done. → proven by `hidden reference suggestions never delete or complete owned practice`
- **ac-10** — Existing additive installation restores only missing selected defaults/stages, preserves edited rows and routines and never auto-reseeds on load. Archive/restore and repeated no-op actions are idempotent. → proven by `pathway restoration remains explicit additive and lossless`
- **ac-11** — Unlink reference and Remove from pathway retain notes, attachments, lesson/agenda/routine links, children, reviews and all history, even for a new never-practised item. No catalogue shortcut calls automatic item deletion. → proven by `pathway removal keeps enriched and never practised owner items`
- **ac-12** — One shared contextual Persian catalogue yields independent Setar/Tar instances; duplicate gusheh names stay scoped, new gusheh items receive modal metadata, and existing Guitar/Honarestan/Khonyagar work/material identities remain intact. → proven by `Setar and Tar share reference definitions without sharing practice state`
- **ac-13** — Upgrade leaves the old mixed Setar path, generic-form items, text, pins and routines unchanged. Explicitly adding the new radif view reuses proven bindings; Forms derives actual works from the term vocabulary and creates no generic form item. → proven by `new Persian reference views preserve existing Setar organisation`
- **ac-14** — Today, both SessionPlan derivations, Repertoire and PathwayDetail use the same visible ordered pathway and pinned stage, including archived/deleted pins and equal-order tie cases, without changing scheduling decisions. → proven by `pathway context readers agree on visible routes and pinned stages`
- **ac-15** — New source choices describe collections/materials; legacy kinds and hidden fields survive edit/export, session instrument defaults correctly, and known course-source renames reuse stable provenance while ambiguous candidates require choice. → proven by `study sources clarify new choices without rewriting legacy meaning`
- **ac-16** — Every inbound door installs valid v15 and legacy fixtures consistently and refuses malformed/unsupported state before replacement: full/state-only import, fake-remote pull, Keep remote, archive restore, cold recovery and both hydration paths. Preserve existing byte/session/revision guards. → proven by `every inbound door enforces the repertoire v15 boundary`
- **ac-17** — Export/import and content hashing preserve terms/bindings/hides and custom strings. A disposable baseline v14 reader refuses a v15 backup without replacing state/blobs; current reader accepts prior backups. → proven by `repertoire backups round trip and older readers refuse v15 safely`
- **ac-18** — Source metadata adoption understands term-backed and literal fields while retaining raw source facts, owner edits and stale-premise refusals; archive identity/location/refresh outcomes remain unchanged for existing fixtures. → proven by `musical metadata integration preserves archive reconciliation boundaries`
- **ac-19** — Actual rendered Chromium/WebKit phone and desktop journeys exercise browse/edit/add/link/hide/restore/Tar/source/term flows plus Today/Start/Active/Close, reload/offline/failure states and all pageerrors. Assert real saved state as well as UI. → proven by `the unified repertoire journey works in Chromium and WebKit`
- **ac-20** — Chosen viewport mechanism handles retained focus, blur, repeated geometry changes, zoom, absent VisualViewport, route teardown and hardware-keyboard geometry without timer guesses, forced blur or scrolling loops. Expected geometry is fixture-authored, not copied from implementation. → proven by `viewport recovery respects focus zoom and scroll ownership`
- **ac-21** — Both engines demonstrate mixed-script wrapping, labelled controls, keyboard access, focus visibility, theme contrast, reflow and accessible empty/error states at phone/desktop widths; Today preserves the owner's ordering and visible recommendation. → proven by `the shared practice shell remains accessible and readable across layouts`
- **ac-22** — Before/after projections for term/source/reference/pathway administration leave practice history, item status/ratings/SM-2/dates, notes, reviews, agenda and unfinished block/routine/plan untouched apart from explicitly chosen organisation fields. → proven by `repertoire administration never fabricates or resets practice evidence`
- **ac-23** — Before first review, inspect the committed consumer/invariant matrix, independent fixture expectations and reproducible focused runner; every acceptance title maps to exactly one test, both engines actually ran, and proof limits are explicit. → proven by `manual:OWNER`
- **ac-24** — On the owner's actual iPhone Safari and installed PWA, record device/iOS version and before/after viewport traces, keyboard Done with retained focus, repeated opening/dismissal, scroll, rotation, route change, background/resume and zoom. Verify no residual lifted bar, occluded editing or lost text. Without device evidence this remains outstanding. → proven by `manual:OWNER`
- **ac-25** — Review the coherent phone/desktop journey and partial radif labels against source evidence. Confirm useful Forms browsing, maestro discovery, screen-reader/keyboard operation, Plan then Routines ordering and start/close budgets. Keep a pre-upgrade full backup; approve migration on a disposable copy before any real upgrade. → proven by `manual:OWNER`

## Docs to update as part of this change

- AGENTS.md
- DECISIONS.md
- docs/product-spec.md
- docs/repertoire-experience.md
- README.md

## Recommended skills (quality only — never gates)

- **ui-work** — visual / front-end work — layout, styling, interaction — _(use your agent’s equivalent)_
- **build** — implementing the change against the contract — _(use your agent’s equivalent)_
- **simplify** — reducing risk by simplifying the change — _(use your agent’s equivalent)_

## Current progress

Not started — no checks have run yet. Default state is "not ready".

## Before the first review

Family proof plan, before the first review: for subtle work — a parser, a resolver, a provider or transaction boundary, a record another reader must still parse — name each invariant, every consumer of it, its equivalence classes and how they interact, and prove them against independently derived expected results on one reproducible, focused route (committed fixtures, fixed seeds). Point to that route and its limits rather than pasting it. Routine work needs none of this. Say in your commit message where it lives.

## Before you finish

Run `prismatica flow report --auto`. It records the flows your diff provably
touched, and then prints the exact command for every flow it will not decide
for you — a merely possible hit, or a flow nothing maps to files. Answer those
yourself: `--auto` never claims a test passed and never claims behaviour is
unchanged, because no file list can establish either.

File it BEFORE `check` and commit it WITH your work — a report sitting
uncommitted proves nothing, and `check` refuses an uncommitted proof input.

## How your work will be judged

Deterministic checks run on every push and at the merge gate: the diff must stay
inside the allowed files, every acceptance check must trace to a passing test,
docs must be updated, a sealed review must match your exact diff, and the owner must sign a decision over your diff. Nothing merges until they all pass. Default is "not ready".

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory. A finding names an invariant: sweep the repository for every instance of it and list each one found plus the consumers checked clean, in one round — not one counterexample at a time.

