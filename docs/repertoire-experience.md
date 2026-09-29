# Repertoire experience — v15 (musical terms, reference identity, calmer browsing)

One end state: **find music, understand its context, take a suggestion into owned practice
once, and get back to practising** — without organising the same fact twice. The owned
practice item stays the only unit of practice. A reference catalogue *suggests* music, a
pathway *arranges* suggestions and owned work, a study source *names the material*, and a
musical term *classifies* it. None of them stores a second copy of progress, notes or history.

AGENTS.md holds the rules; DECISIONS.md (2026-09-29) holds the why. This page is the working
map: what changed on screen, who reads and writes each fact, and how it is proved.

## Screens — before and after

Captured at 390×844 and 1280×900 against the demo seed before any change (Chromium), then
again after. Synthetic data only; the owner's database was never opened.

| Screen | Before | After |
| --- | --- | --- |
| Repertoire | Opened on **Pathways**. Three views held separate state, each with its own instrument filter; a form chip row with no search; "Study sources" and a wrapping "Add practice item" crowded the header. | Opens on **My repertoire**. One instrument selector for all three peer views (My repertoire · Pathways · Practice list); view, instrument, query, facets and grouping live in the URL, so opening a work and coming back — or browser back/forward — restores them. One primary action (Add practice item, prefilled with the browsed instrument and form). |
| My repertoire | Grouped by folded raw text («Shur» and «شور» apart); title-only full pieces silently missing; no search, no composer filter. | Search (title, gusheh, term names and spellings, source, archive aliases) + Dastgāh/Form/Composer facets from the owner's own works + group by dastgāh/form/composer/source. Every work exactly once; a matching part shows its parent; unclassified works under "No dastgāh yet"; "No works match" is announced and distinct from an empty library; Clear filters. |
| Pathways | Card ignored the pinned stage; archived pathways invisible with no way back. | Card shows the pinned stage ("pinned"), same resolver as Today; archived pathways listed under "Archived pathways" with Restore; shipped defaults (incl. the two named radif pathways) offered by name. |
| Stage | Every suggestion row carried the generic gusheh prompt (visually heavy); an Undo/"−" deleted a "fresh" item. | Calm rows; a 44×44 "⋯" menu per row: Link an existing item…, Hide this suggestion, Unlink reference, Remove from pathway — none deletes. Ambiguous legacy copies show "N of your items answer this — choose one". An item placed in the stage that answers no suggestion says so ("placed here · answers no suggestion", menu: Link to a suggestion…), and Add beside it asks "Is “…” already in this stage?" — Link it, or Add as a new item — instead of minting a second copy. Hidden suggestions listed with Restore. |
| Item form | Dastgāh/Form as free text with Latin-only datalists; composer free text. | The three fields read the shared vocabulary: picking a term links it ("Shared term"); an alias shows "Your spelling — grouped as …"; anything else stays the owner's text. |
| Study sources | Twelve kinds mixing collections, pieces, activities and lessons; new sources defaulted to the first instrument. | Five kinds with an example each (Radif · Method book · Collection · Course · Other); an older kind stays selectable on its own source; new sources start on the browsed/session instrument. |
| More | Insights, Teacher report, Settings. | + Musical terms (add, rename, spellings, archive/restore, delete unused custom) and Study sources. |
| Today / Session Plan | "First pathway that matches" — archived or unordered pathways could be followed. | One selector: not archived, by order then id, pin honoured while its stage exists. Plan then Routines stay above the recommendation. |

## Model (schema v15)

- **`PracticeDB.musicTerms`** — custom terms and edits of built-ins. Built-ins
  (`BUILT_IN_TERMS`, `musicTerms.ts`) are 12 dastgāh/āvāz, 9 forms, 9 composers/maestros.
- **`PersianFields.dastgahAvaz | form | composer`** — `string | { termId }`. Gusheh stays text.
- **`PracticeItem.catalogRefs`** — the references an item answers; absent = legacy.
- **`Pathway.hiddenRefs`** — suggestions hidden in that pathway.
- **`Material.sourceKey`** — `course:<id>` on a shipped course's own source.

Reference ids: `stage:<stageId>:<key>` · `course:<courseId>:work:<identity>` ·
`radif:mirza-abdollah:<dastgāh>:<gusheh key>`.

## Reader / writer matrix

| Fact | Written by | Read by |
| --- | --- | --- |
| Term values on items | `ItemForm` (`MusicalTermField` → `valueFromInput`), `itemFromCatalogEntry` (radif entries carry `{termId}`), archive adoption (`sourceReconcile`, raw registry TEXT only), migration (never — legacy text is kept) | `resolveValue`/`valueLabel`/`valueGroup`/`valueSearchTexts` → `groupByDastgah`, `discoverRepertoire`, `repertoireSearchTexts` (Practice list, Start), `ItemDetail` details, `WorkRow`, `MusicalTermField`, archive suggestion comparison (`fieldAlreadySays`), `isWork`/`hasPersianIdentity`, `kindFromItem`, `validateMusicTerms` |
| `musicTerms` | `addTerm`/`updateTerm`/`deleteTerm` (store, via `planAddTerm`/`planUpdateTerm`/`planDeleteTerm`; an update is refused when `reclassifiedItems` finds an unedited value whose meaning would change, a delete while `itemsUsingTerm` — ambiguous claimants included — is non-empty; MusicTerms' Delete reads `planDeleteTerm` itself), `migrateToV15` (empty list only) | `vocabulary()` everywhere above, `searchAliasTable`, MusicTerms page, `validateDB` |
| `catalogRefs` | `planStageAddition` → `planCatalogAddition` (Add; creates nothing while `unlinkedInStage` lists items placed there that answer no suggestion, unless the owner chose Add as a new item), `planLinkReference`, `planUnlinkReference`, `planRemoveFromPathway`, and — through `settleLegacyEvidence` (unique legacy decided, ambiguous refused) — every placement writer: `updateItem` (stage/key/instrument), `placeItemInStage`, `deleteStage`, `deletePathway`; `bindLegacyReferences` (v15 migration, fitting evidence only). Every one passes `identityRefusal` before `set()`; a link or instrument move may not overrule another item's legacy answer (`legacyClaimRefusal`) | `resolveCatalogReference` → `stageUnits`/`hiddenUnits`/`stageProgress`/`currentStage`/`nextUnitInStage`/`pathwayProgress`, `planCatalogAddition` reuse, `carriedCourseWorkItem`, routine segment binding (`unitItem`), `itemReferences` → `itemFiles` course material, `validateReferences` |
| `hiddenRefs` | `planSetReferenceHidden` (Hide/Restore), `planRemoveFromPathway` | `pathwayStageContext` → every stage consumer above; `validateReferences` (scope = the pathway's shipped definition) |
| Pathway route | `updatePathway` (archived, pin), `deleteStage` (clears pin) | `visiblePathways`/`primaryPathway`/`pathwayPosition` → Today, SessionPlan (build + editor), Repertoire cards, PathwayDetail |
| `sourceKey` | `resolveCourseSource` (mint/adopt), `chooseCourseSource` (via `planChooseCourseSource`, answering the derived `courseSourceQuestions` for exactly the items it names — StageDetail renders it; `planCatalogAddition` returns its candidates on first AND repeat Add) and `updateMaterial` (both refused by `sourceKeyClash` when the instrument already holds the key), `backfillCourseSourceKeys` (v15) | `findCourseSource`, `validateStudySources` |
| Missing shipped stages | `planDefaultStages` via `addDefaultStages` (PathwayDetail "Restore shipped stages"), `planCourseLevels` (course levels) | `offeredDefaultStages`, `offeredCourseLevels` |
| Save outcomes (terms, sources, course source choice) | `useAcknowledgedSaves` in MusicTerms, Materials, ItemForm inline source, StageDetail `SourceChoice` | `SaveStatus` (keyed by record, carried-draft aware) |
| Browse return | Repertoire (`state.from`, Study sources `?instrument=`) | PathwayDetail, StageDetail (`pathwaysReturnPath` fallback), Materials |
| Inbound install | Settings import (full/state-only), sync pull, Keep remote, archive restore, cold recovery, persist `migrate` and `merge` | all through `validateDB` → `migrateToCurrent` (+ `migrateToV15`) → reconstruct (incl. `musicTerms`) → validators |

## The shared Persian reference — audit

`MIRZA_ABDOLLAH_RADIF` carries the Setar pathway's **existing** modal selections unchanged —
the same 12 dastgāh/āvāz, gushehs, keys, intros and order — factored out so Setar and Tar share
one definition. It is labelled a **partial selection** everywhere it appears; nothing was added,
removed or reordered in this lane, because no printed edition was consulted. Entries the owner
is asked to confirm against their teacher's edition (ac-25):

| Stage | Entry | Why it is flagged |
| --- | --- | --- |
| every dastgāh | فرود | a cadential return rather than a named gusheh in most editions |
| دشتی | بیات راجه | more commonly listed under بیات اصفهان |
| راست‌پنجگاه | قرچه | also a Shur gusheh; its place here is unconfirmed |
| بیات ترک | دوگاه | editions differ |

## iPhone keyboard — what was measured, and what was not

**Measured (browser fixtures, both engines):** the old guard (`useViewportGuard`, before this
lane) returned early whenever an editable element kept focus, so the documented "Done with
focus retained" case never restored a displaced shell; it also used 80 ms / 300 ms timers and
`scrollIntoView` unconstrained to `<main>`. The new `viewport.ts` decides from geometry only
and is driven in Chromium and WebKit through a scripted `visualViewport` whose geometry is
written by hand per state (keyboard up, Done with retained focus, blur, zoom, hardware keyboard,
rotation-shaped heights, background/resume, absent `visualViewport`, route changes).

**Not measured:** a native iPhone. After the geometry guard shipped the owner **still sees the
lifted bar** on the device, so the native mechanism is unknown and the defect is **not claimed
fixed**; ac-24 (Safari + installed PWA traces) remains outstanding. One source-level blind spot
was closed on the way: the guard read only the document's own offset, while `overflow: hidden`
on `body`/`#root` stops the owner scrolling them, not a focus reveal — a reveal that scrolled
`#root` lifts the bar with the document offset reading 0. Both are now restored under the same
geometry rules (fixture-proved in both engines, with a real lifted bar). That is a hypothesis
closed, not a diagnosis. The old "scroll the focused field into view after 300 ms" behaviour
was removed, not replaced.

**Capturing the trace (ac-24).** On the iPhone, once in Safari and once in the installed app:
More → Keyboard trace → Start recording; then focus a field and type, tap Done (focus kept),
dismiss by tapping away, repeat, scroll, rotate, switch tabs, background and resume, pinch-zoom
and release; return to More → Stop recording → Copy trace. The first line names the device, iOS
(user agent) and whether it ran standalone; each further line is one event with both viewports
(`innerH`, `vvH`, `vvTop`, `scale`), every shell offset (`scrollY`, `html`, `body`, `root`,
`main`), the bar's `barTop`/`barBottom`, the focused element, and — at each guard evaluation —
its decision and any `restore`. A lifted bar shows as `barBottom` less than `innerH` with the
keyboard gone (`vvH ≈ innerH`); which offset is non-zero at that moment names the mechanism.
The trace lives in memory only and is never saved, synced or backed up.

## Proof

One route: `node scripts/check-repertoire-families.mjs` (add `--unit` for the fast domain
families). It checks each acceptance title names exactly one test, runs the families with
Vitest (browser families through `tests/practiceBrowser.ts`, both engines, private Vite caches,
every page error kept), and prints one line per check. Fixtures and the hand-authored
expectations are committed: `tests/fixtures/repertoire-legacy-v14.json`,
`repertoire-current-v15.json`, `repertoire-family-expectations.json`.

| Check | Test | File |
| --- | --- | --- |
| ac-1 | repertoire v15 migration is deterministic idempotent and lossless | tests/repertoire-families.test.ts |
| ac-2 | repertoire identity validation refuses malformed state without discarding legacy evidence | tests/repertoire-families.test.ts |
| ac-3 | musical term resolution separates exact identity from broad search | src/domain/musicTerms.test.ts |
| ac-4 | musical term management preserves identities and reports durable saves honestly | tests/repertoire-experience.browser.test.ts |
| ac-5 | repertoire discovery includes every eligible work without duplicate parents | src/domain/repertoire.test.ts |
| ac-6 | repertoire navigation restores browse context without changing session scope | tests/repertoire-experience.browser.test.ts |
| ac-7 | catalogue identity survives placement changes across every consumer | src/domain/referenceCatalog.test.ts |
| ac-8 | catalogue linking preserves owner records and refuses ambiguous automatic reuse | src/domain/referenceCatalog.test.ts |
| ac-9 | hidden reference suggestions never delete or complete owned practice | tests/repertoire-families.test.ts |
| ac-10 | pathway restoration remains explicit additive and lossless | src/domain/pathways.test.ts |
| ac-11 | pathway removal keeps enriched and never practised owner items | tests/repertoire-families.test.ts |
| ac-12 | Setar and Tar share reference definitions without sharing practice state | src/domain/referenceCatalog.test.ts |
| ac-13 | new Persian reference views preserve existing Setar organisation | tests/repertoire-families.test.ts |
| ac-14 | pathway context readers agree on visible routes and pinned stages | src/domain/pathways.test.ts |
| ac-15 | study sources clarify new choices without rewriting legacy meaning | src/domain/studySources.test.ts |
| ac-16 | every inbound door enforces the repertoire v15 boundary | tests/repertoire-inbound.browser.test.ts |
| ac-17 | repertoire backups round trip and older readers refuse v15 safely | tests/repertoire-inbound.browser.test.ts |
| ac-18 | musical metadata integration preserves archive reconciliation boundaries | src/domain/sourceReconcile.test.ts |
| ac-19 | the unified repertoire journey works in Chromium and WebKit | tests/repertoire-experience.browser.test.ts |
| ac-20 | viewport recovery respects focus zoom and scroll ownership | tests/repertoire-viewport.browser.test.ts |
| ac-21 | the shared practice shell remains accessible and readable across layouts | tests/repertoire-viewport.browser.test.ts |
| ac-22 | repertoire administration never fabricates or resets practice evidence | tests/repertoire-families.test.ts |
| ac-23–25 | manual:OWNER | this page, the owner's device |

**Families crossed.** A (terms): unique alias / ambiguous / unknown / composite / empty /
malformed / archived / renamed × dastgāh, form, composer × work, part, title-only, through the
form, detail, discovery, seeds, archive adoption and export. B (references): exact / absent /
conflicting legacy × same/different instrument × ordinary key vs declared course work × move,
detach, stage/pathway deletion, archive, hide/restore, link, repeated Add, course files, and
every stage/progress/next/Today/Session Plan consumer; each local writer × reload validation
(ac-22) and each placement writer × unique/ambiguous/overruled/unfit legacy evidence (ac-8,
ac-11). C (inbound): every door × valid legacy,
current and partial state × malformed identity and unsupported version, with attachment bytes
and with an unfinished block. Save lifecycle (ac-4): add → done → add again, archive/delete
with a failed write, typing while a write is held in flight (a second IndexedDB connection
keeps the store's transaction busy), and the same for sources and a course-source choice.
Browse return (ac-6): pathway, stage, bookmark and Study sources doors. D (UI): both engines × phone/desktop × light/dark, long mixed
titles, keyboard, focus ring, reflow, empty/no-match/error states, offline, reload, back/forward.

**Limits, stated.** WebKit under automation cannot store a Blob in IndexedDB, so its journeys
seed state-only; attachment bytes are proved in Chromium (ac-16/17). The baseline v14 reader is
the real app at `b6bef34` in a disposable worktree. A restored shipped stage keeps its shipped section
(`group`): if the owner renamed that section, it lands in a section of its own — added, never
overwriting. Scripted viewport geometry proves the
mechanism, not the native keyboard. The radif audit above is the owner's to settle.
