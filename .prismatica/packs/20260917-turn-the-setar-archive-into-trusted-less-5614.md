---
id: 20260917-turn-the-setar-archive-into-trusted-less-5614
contractId: 20260917-turn-the-setar-archive-into-trusted-less-5614
contractHash: d9fecc852c7f111bd32f98ec4f15fe6b34e717572d153cd0fdb3fe095a137e1c
createdAt: 2026-09-17T00:51:21.883Z
skills:
  - ui-work
  - build
  - simplify
---

# Build brief: Turn the Setar archive into trusted lessons and useful practice material

> This brief is scoped and self-contained. A fresh session can resume from it
> alone. Prismatica will check your work deterministically — it never reads this
> chat, only Git and your tests.

- **Linked issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/29
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Work in the lane:** /Users/Ehsan/workspace/active/practice-compass-lanes/20260917-turn-the-setar-archive-into-trusted-less-5614

## The plan the owner approved

This is the complete approved proposal, verbatim. `assumptions` and
`possibleConflicts` are the Planner's advisory reading — treat them as leads to
verify against the code, never as established fact.

````yaml
# Approved intent: Turn the Setar archive into trusted lessons and useful practice material

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** existing-flow
- **Risk tier:** heavy
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> Plan and build the next coherent HEAVY Practice Compass lane: safely discover my organised Setar archive and turn its useful parts into historical lessons, canonical repertoire items and correctly linked practice material through Refresh Setar archive, without duplicates, path typing during refresh, guessing, fabricated practice history or transport-dependent identity. Builder: claude. Use the complete supplied CRAWLER-BRIEF semantics and real corpus. Include other high-priority work only where evidence ties it to source integrity, daily material use or reliability. Prefer an unattended NAS scanner publishing a deterministic index to a separate private branch of ethan-ghoreishi/practice-compass-data; one-time NAS runtime/scheduler setup is approved, credentials narrowly scoped, archive read-only. Mac scanning is only a natural manual/development fallback. Use archive-relative asset paths with device-specific configurable bases: Mac https://192.168.0.20:5010/setar-classes/; iPhone https://ds220plus.taild1d1f7.ts.net/media/setar-classes/, with actual iPhone playback as manual:OWNER verification. Preserve all trusted practice, scheduling, notes, lesson agenda, sync and recovery behaviour. This handoff is planning only; do not implement or provision anything before the owner starts the lane.

## Why

THESIS: Turn a trusted Setar archive into useful, portable practice material, with exact reconciliation and durable incremental refresh.

LANE COMPARISON: (1) Small crawler plus Test link repair fulfils discovery but leaves wrong inherited material, duplicates and historical urgency; too weak. (2) Trusted archive to daily material adds deterministic reconciliation, exact old-reference repair, useful Item Detail/Active resources, direct item NAS links, compact historical lessons and durable lesson notes; chosen heavy lane. (3) Whole music-library platform with full Tar/Guitar ingestion and mobile keyboard overhaul is wider but unsupported by shared grammar or a reproduced keyboard defect; defer.

ARCHITECTURE COMPARISON: Direct browser filesystem selection is a Mac-only permission/mount dependency and unsuitable for iPhone. Existing Node scanner generating bundled TypeScript requires rebuild/deployment for every lesson. Browser NAS HTML crawling adds dozens of listing requests, fragile HTML, failed CORS, production CSP changes and certificate complications; no-cors cannot produce readable data. A NAS-served JSON index is sound but still needs CORS/CSP and HTTPS configuration. A live scan service adds an unnecessary runtime API/authentication surface. Choose read-only Node scanner on NAS -> deterministic JSON on private source-index branch -> GitHub API read with existing app connection -> pure reconciliation. Both devices get the same small index without NAS fetch permission, new paid service or large-file storage; media still opens directly through each device base. A file-import fallback uses precisely the same decoder/reconciliation. Refresh consumes the latest published index; it does not remotely start a live NAS scan. Default scheduled scan every15 minutes is documented, and UI distinguishes index last changed/fetched from live scan freshness.

Existing gitRemote creates a complete main tree without base_tree, so placing a sidecar alongside state.json would lose it on next sync. A separate source-index branch is required, outside archive/ recovery branches. No change to whole-state sync semantics is justified.

Evidence: clean main b649bd09d0ffbd8bbc5955c3c891cfe01a7fa417; private data repo main a6c6a664eedcdd3fae8798c350e60ec52e8d6a5c at inspection, schema13/rev175. 39 sessions,258 files,257 parseable,1 known exception,94 canonical pieces verified directly. LAN listings and all CSV/brief bytes equal Sandisk; no ACAO, normal Mac TLS validation fails, diagnostic one-byte Farsi video request returned206. Mac has no Tailscale; iPhone base was subsequently supplied by OWNER and real playback remains manual acceptance.

Tar is flat numbered Farsi course videos; Guitar has18 levels with course sections, notes, PDFs and videos. Neither shares Setar session/registry grammar. Share only the concrete normalised source description, identity/path validation, reconciliation and resource resolution that Setar actually exercises, with no adapter class/plugin registry.

Hostile pre-mortem was performed across parser, attribution, identity, source ownership, deletion, persistence, inbound replacement, sync, transport and render families. The acceptance checks below specify the sibling transitions that defeat a literal happy-path implementation. Already-shipped attachment, working-text, SM2, session protection and WebKit fixes are preserved rather than counted as new work.

## Today

Private practice-compass-data main: schema13,38 lessons,6 items,16 blocks,6 reviews,5 agenda entries,1 attachment.
74 lesson references:67 exact rename repairs,7 current,0 unmatched,0 absolute.
Two old/current references collide after repair: session1 class part1 and first Dashti score. Preserve both authored records/metadata; coalesce resource display only or explicit owner resolution.
Three current personal practice references are already authored; retain records but classify as historical-only outside Item Material/Active.
Existing upcoming class38 date2026-09-27 is distinct from archive38 date2026-08-04.
Legacy67 seed paths all absent; all have exact RENAME-LOG targets. Legacy session28 main video is actually named demonstration.
Current LessonCard opens when notes absent, so 39 imported lessons default open on mobile.
Exact extracted updateLesson body reproduces inability to clear notes: editor sends undefined and store coalesces to previous notes.
Current sync createTree supplies no base_tree, so app main sync removes unrelated sidecars. Source index belongs on a separate branch, never data main.
Existing scanner chooses largest video rather than role; bundled seed has37 sessions. All67 seeded paths are obsolete. ItemMaterial inherits every recording from linked lessons, including irrelevant class/personal material. New source fields would be silently dropped unless validateDB's reconstructed output is extended. Current lesson notes cannot be cleared because editor emits undefined and updateLesson uses nullish fallback. Native installed-app observations corroborated material clutter but were not claimed as exact-current-main rendered proof.

## Instead

1. DELIVERY AND OPERATION
Replace the old seed-import workflow with Refresh Setar archive in Settings, accessible from Lessons. First use selects the existing Setar instrument only if ambiguous; thereafter one action fetches a pinned source-index commit, validates, previews genuine reconciliation questions if any, and atomically imports. Show Added / Updated / Already current / Needs attention with concise counts and optional details, not crawler output. Binding and owner choices persist. No filesystem or URL entry in routine refresh. Device media setup is one-time.
Implement the scanner as a small stdlib Node executable; it accepts an operator-configured root and emits outside that root. Production is an unattended NAS DSM scheduled task, not this Mac. Package the launcher and exact installation/rollback instructions. Actual NAS source mount/runtime/permissions are discovered and recorded during OWNER installation acceptance; do not assume Mac /Volumes paths exist on DSM. Source account has read-only access, output/config elsewhere; no root/admin requirement. Failed scan/publication preserves last good remote index. Local execution of the same scanner is sufficient fallback, no separate Mac daemon.
Publish only setar/index.json on source-index in the existing private data repository, using content hashing, non-force compare-and-swap reference advancement and bounded retry. Create the initial branch without modifying main. Fetch branch SHA then file at that SHA; validate version/size/digest/content before use. No public app bundle of the full private index. App requires only its already-configured GitHub read access; file-import fallback is optional recovery through the same boundary. Publisher credentials belong to NAS protected runtime configuration, never source, Git, output, app state, logs or backups. Restrict token to this repository and necessary Contents write/metadata read, without workflow/admin scope. This is repository-scoped authority, not fictitious branch-scoped token permission; code refuses all targets except source-index/setar/index.json.
An unchanged semantic scan makes no commit. The UI's fetched time is device-local transient state and publication time means index changed, not proof that a scanner ran recently. NAS scheduler logs record success/failure. No stale-index timestamp is treated as proof an asset disappeared.

2. EXACT SETAR SOURCE CONTRACT
Read PIECES.csv before assets with a real CSV parser supporting quoting/doubled quotes/embedded commas; no comma splitting. canonical_fa is the byte-exact identity; aliases are literal search alternatives only. Registry forms, dastgah, composer, notes and provisional/MEDIUM caveats are evidence, not free inference. Real forms include هفت-ضربی and چهارپاره. Require unique canonical keys and valid session roster.
Folder session-N-DD-MM-YYYY defines numeric sequence and validated Gregorian date. Membership, not mtime, associates assets. Longest role prefix at hyphen boundary uses ضبط-کلاس, تمرین-من, تصحیح, تکلیف, جزوه, نمونه, نت. Remove extension; trailing ASCII numeric suffix is part, embedded digits remain piece identity. Display stem replaces hyphen/underscore with spaces. Never split canonical -و-, transliterate, fuzzy-match or infer segmentation. Named pieces must exist in registry. Sort sessions and parts numerically.
Source graph includes registry pieces, sessions, useful resources, exact piece/session memberships and role presence, logical demo parts, rename aliases, caveats and diagnostics. Persist no individual newly discovered تمرین-من resources: keep only their trustworthy membership/role/repeat evidence. Repeated consecutive session appearances are labelled sessions, not weeks or recorded practice.
Known exception session-16-26-11-2024/video-2024-10-29-15-32-35.mp4 is skipped and named in Needs attention, never reassigned to15. Session28 has no class recording. Sessions7,34,35 have real provisional identities. RENAME-PLAN confidence is a soft source flag, not identity authority; RENAME-LOG provides exact path provenance.
Unnamed demo belongs to every canonical member of that session; numbered clips are one ordered logical demonstration. A named demo belongs only to its exact piece. Class recordings are lesson-only. Notation/corrections attach only to the named piece; unnamed handouts/homework/notation stay lesson-level, never guessed onto all pieces. Unknown roster membership blocks that session's ambiguous attribution and yields actionable attention; malformed/duplicate registry or incomplete scan is fatal and preserves last good index. Unknown individual files are reported/skipped, not guessed.
Ignore dotfiles and NAS housekeeping; do not traverse symlinks, outside-root directories or unsafe paths. Bound bytes, rows and files, detect registry/inventory mutation during scan, and require a complete consistent source view before removals become unavailable. Size can be stat-derived; no media-duration/segment inference or video downloads.

3. IDENTITY, OWNERSHIP AND PERSISTENCE
Use stable archive ID setar-classes, session key numeric lesson sequence, canonical piece key canonical_fa and raw archive-relative asset path, never absolute transport URL. New Practice Compass IDs are deterministic namespaced encodings/hashes of source identity so independent imports on two devices agree; preserve IDs of explicitly adopted existing records. A source identity binds at most one live app record and a canonical item is never silently equated with a different canonical key or built-in catalogKey.
Schema14 adds one canonical archiveSources graph plus item/lesson source bindings and manual item reference support, using the smallest representation with no second copy of the same resource per item. Bindings must resolve to source entities and the chosen instrument. Derived From lessons, material lists, aliases and repeat chains come from the graph; do not cache their own competing copies. Imported lesson historical origin is explicit and remains historical even if its date is future relative to the clock.
Persist the last accepted useful source graph, bindings, owner reconciliation decisions and suppression records, enough for offline rendering/refresh after sync. Latest fetched manifest, transient status and device transport bases are not synced. Retain missing source entities/resources with unavailable status rather than dropping provenance. A new canonical key is a new identity requiring reconciliation, not a metadata rename inferred by similarity. Exact unambiguous RENAME-LOG asset chains may preserve asset identity, recording old aliases.
Source-owned: registry facts, archive session facts, roles, canonical memberships, resource availability and caveats. User-owned: item/lesson editable titles and identity overrides after initial seeding, Working notes, lesson notes, item status/mode/focus, authored references, links/suppressions and every practice/scheduling/agenda field. Initial title/identity fields are seeded only from registry evidence; form گوشه can identify a gusheh, other descriptive forms remain verbatim; no invented pathway, proficiency, catalog identity or composer. Ambiguous standalone/provisional entries remain repertoire members with source labels, not forced categories. Later registry improvements update source facts and offer explicit selected-field application without overwriting even deliberately empty owner values.
New imported items default to resting/dormant as an administrative library policy, clearly stated before import, to avoid94 unsolicited recommendations. They remain searchable, visible in My repertoire and directly startable. No observed practice/result/review date/SM2 exposure is seeded. Existing matched item status and scheduling remain untouched.

4. RECONCILIATION AND REFRESH
Exact source binding wins. For legacy classes, auto-adopt only a unique instrument+date+number match backed by exact source-path provenance; do not merge by number/date alone. Existing upcoming class38 dated2026-09-27 must coexist with archive38 dated2026-08-04. Exact manual title or literal alias equality produces a small Link / Create separately / Skip decision, not automatic merging. The owner can choose another existing item explicitly; never automatically equate catalogKey iraq, a phrase containing عراق, and canonical عراق. No-candidate new pieces can be added in one reviewed batch, without94 questions.
Prepare against current DB revision and manifest identity, validate whole proposed graph, then perform one synchronous store mutation preserving active/routine/plan and unrelated DB fields. No per-file partial commits, blob APIs or whole-database import/reset. Recheck revision immediately at commit, rebase/repreview if changed; do not overwrite edits/practice completed during fetch. Wait for actual IndexedDB acknowledgement before success. Retry after failed persistence writes again even if in-memory content already matches. Identical durable refresh causes no DB revision/timestamp churn.
New lesson/file changes add only the delta. Missing files/registry rows after a complete valid scan become unavailable/needs attention; transient I/O or network failure cannot imply removal. Partial old bindings are refused or surfaced for explicit repair, never healed by duplication.
Delete/unlink/hide operations persist narrowly scoped suppressions in the same transaction as record/link changes. Refresh, reload and sync must not resurrect owner-deleted items, lessons or associations. Hiding a shared demonstration on one item cannot hide it on another. Explicitly resetting a suppression permits reimport. Instrument moves must refuse or explicitly detach incompatible source binding; all store mutation callers, including removeCatalogItem and reset/clear, preserve graph validity.
Use existing whole-state GitHub conflict protection for concurrent devices. This lane does not invent field-level sync merge. Deterministic source IDs prevent identity duplication, not conflict-free merging of user edits. Pull, Keep remote and restore carry source choices through the same validated snapshot.

5. USEFUL MATERIAL AND HISTORICAL LESSONS
Compose material once for Item Detail and Active from source attribution plus authored direct item links. Show corrected scores prominently while retaining clean scores; teacher demos are one logical group with ordered parts. All relevant sessions remain accessible, grouped numerically with provenance. Class videos/unnamed lesson handouts stay in the lesson. Newly ingested personal recordings never appear in ItemMaterial/Active.
Retain the three already-authored personal references as historical lesson evidence with their notes intact, outside useful practice resources. Existing unclassified manual lesson links remain accessible without guessing attribution. Add a direct item NAS reference using the existing reference shape/resolver so useful material need not be attached to an artificial lesson. Keep large assets external; no IndexedDB video copying or new media player. Open remains a direct user gesture, with practice timer/state preserved.
Historical lessons show compact collapsed rows on phone, useful resources and associated items, and explicit archive provenance. One shared predicate excludes source-history lessons from nextLessonFor, nextLessonDates, defaultTargetLesson, preparationDatesByItem and every upcoming badge/default/question target. Source lesson dates never create current commitments or pending teacher questions. Existing manually authored agenda survives.
Expose source metadata progressively on the item and From lessons links, source caveats/needs labelling and literal alias search in Repertoire and Start using existing Farsi search. Search normalisation is never identity reconciliation. Farsi values wrap and isolate direction; user-authored text retains dir=auto. Preserve quick Start/Close and collapsed Active material.

6. TRANSPORT AND EXACT REFERENCE REPAIR
New references store raw paths relative to the Setar archive root. Each device selects/configures an archive media base once; derive from existing device media-root setting where exact mapping is known, preserving legacy semantics. Mac base https://192.168.0.20:5010/setar-classes/; owner-provided iPhone base https://ds220plus.taild1d1f7.ts.net/media/setar-classes/. Do not store either in synced DB, bake a transport into identity, or require Tailscale on Mac. Segment-wise URL encoding happens once at resolution, preserving base subpaths. Reject credentials, unsupported schemes, traversal/encoded separators for source paths; do not rewrite ordinary external links with meaningful query/fragment.
Replace arbitrary-clip Test link with readable source-index capability/status plus Open archive root for media access. An index GET success is not proof NAS media works; cross-origin root opening cannot programmatically prove it. Explain unavailable/configuration/certificate conditions honestly without disabling TLS checks or broadening CSP.
Repair67 existing old paths using exact RENAME-LOG mappings. Prefix conversion of absolute URLs is allowed only under a verified configured base; foreign/ambiguous paths remain unchanged with attention. Two old/current rows collide physically after repair: session1 class part1 and its first Dashti score. Preserve both authored rows/notes, coalescing display by physical asset rather than deleting information. No fuzzy old-path repair or rewriting every record after a base change.

7. COHERENT BUG FIX AND SAFE UPGRADE
Fix inability to clear lesson notes at the authoritative store patch boundary: distinguish omitted patch field from deliberate empty text. Give lesson editor the existing ItemNotes explicit-save/draft-tag/acknowledged-persistence/retry model, reusing its actual code pattern or component only where it reduces duplication. Source refresh cannot overwrite an open draft; switching lesson cannot save to another lesson. Preserve ItemNotes' existing in-flight newer-keystroke protections and Working notes/Observation/Next time homes.
v13->v14 is additive with empty source state, preserving all legacy fields and running existing migrations unchanged. validateDB accepts AND returns new fields, centrally checks types, versions, path safety, duplicate identities and relationships. All inbound routes use this boundary: Settings full/state import, sync pull, Keep remote, archive restore, both persist migration/merge branches and cold-start recovery. New schema refusal precedes destructive work; no coercion/dropping malformed graph. Existing attachment byte/ownership and active/revision guards remain intact. No scanner/network action in hydration.
Before upgrading owner data, retain a full v13 backup. v14 exports include the source graph and authored external-reference metadata but no NAS bytes/secrets. Rollback is baseline app plus retained v13 backup, not lossy v14 downgrade. Verify actual baseline refuses v14 without writing. Existing sync format2/hash/archive engine is unchanged.

8. EVIDENCE AND COMPLETION
Checked-in fixtures use real Farsi filename/registry/rename examples and a compact deterministic metadata corpus, never private owner notes, credentials, IDs or media. Ordinary npm test has no Sandisk/NAS/network dependency. Pure parser/reconciliation tests cover authoritative logic; real store/inbound browser tests cover durability/wiring; rendered desktop390x844 phone journeys run Chromium and WebKit using existing harness, with no missing-engine skip. OWNER checks alone prove actual NAS deployment, corpus and physical iPhone access. Do not call manual checks passed from mocks.
Corpus baseline:39 sessions,258 files,257 parseable,1 exception,94 pieces;125 personal,57 demo clips/37 logical demos,45 class parts,24 clean scores,6 corrections;132 useful files. Hashes recorded in docs for exact baseline: {"registry":"1f68366e32f0f5ddc8b8db0c1027893b724e16d496f0dca0502fa0a0cd133524","renamePlan":"795faf11c1538e69905e245e9c45d0b13ebcd3469a1b18a2db097786e576b39c","renameLog":"0c276d5e50fc93904ecfb76c71b1c78dca1cda2610f1569f28c9828013278373","brief":"ee76dbc17351fdcc33662b7c467652f5b90728005ef48071bdb35bcf8843a9bc","sortedPathInventoryLF":"0286b07549ad55b0f84166dc2c7b8c2d5949f96a282f03ebaa5837ebf5b22ae7"}. Counts are this corpus evidence, not permanent limits preventing lessons40+.
Build sequence: first parser/index/publisher and deterministic fixtures; second source graph/reconciliation/migration boundary; third material/lesson/transport/editor integration; finally hostile transition tests, rendered journeys and OWNER deployment/corpus/device checks. Tests must exercise actual shared boundaries; named acceptance titles below are each unique test definitions, not substring/file coverage claims. Full required typecheck/lint/unit/build/secrets checks remain mandatory. A lane cannot be called complete with production publisher setup or physical device verification hidden as future work.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- OWNER explicitly selected claude and NAS scanner -> separate private GitHub index, authorised one-time NAS setup, and supplied exact iPhone Setar mapping. No product/architecture choice remains pending.
- NAS runtime, actual internal mount and scheduler credentials are deployment facts still to verify in explicit manual:OWNER acceptance; implementation must provide and exercise this setup, not depend on undocumented infrastructure.
- Default scan interval is15 minutes. Refresh means latest published index, not immediate remote disk rescan; expose that distinction clearly.
- New imported repertoire defaults resting as a reversible administrative choice; source membership cannot establish current practice priority.
- Main and data-repo heads/counts bind planning evidence only; re-read owner data before real reconciliation and never hard-code owner UUIDs or private notes.

**Possible conflicts**

- r-secrets-stay-on-device currently says token lives only in browser local storage. The approved NAS publisher needs a separate NAS-local publisher credential. Narrowly amend that rule to distinguish browser credential/device bases from NAS operator secret, while preserving prohibition on export, sync, logs, Git and manifest disclosure.
- r-direction-aware-text mentions stable ASCII built-in identities; externally imported canonical_fa must remain byte-exact Farsi source identity, carried in a namespaced stable app ID. Do not force transliteration to fit built-in catalog convention.
- Historical source lessons must not displace the owner's genuine upcoming class38. Current private data contains exact collision counterexample, not a hypothetical.
- Source-index branch isolation is essential because ordinary sync replaces main's entire tree; do not solve by changing the trusted sync engine or overstating token branch restriction.
- Existing orphan/duplicate authored reference metadata cannot be deleted merely to simplify source deduplication.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "Plan and build the next coherent HEAVY Practice Compass lane: safely discover my organised Setar archive and turn its useful parts into historical lessons, canonical repertoire items and correctly linked practice material through Refresh Setar archive, without duplicates, path typing during refresh, guessing, fabricated practice history or transport-dependent identity. Builder: claude. Use the complete supplied CRAWLER-BRIEF semantics and real corpus. Include other high-priority work only where evidence ties it to source integrity, daily material use or reliability. Prefer an unattended NAS scanner publishing a deterministic index to a separate private branch of ethan-ghoreishi/practice-compass-data; one-time NAS runtime/scheduler setup is approved, credentials narrowly scoped, archive read-only. Mac scanning is only a natural manual/development fallback. Use archive-relative asset paths with device-specific configurable bases: Mac https://192.168.0.20:5010/setar-classes/; iPhone https://ds220plus.taild1d1f7.ts.net/media/setar-classes/, with actual iPhone playback as manual:OWNER verification. Preserve all trusted practice, scheduling, notes, lesson agenda, sync and recovery behaviour. This handoff is planning only; do not implement or provision anything before the owner starts the lane.",
  "builder": "claude",
  "summary": "Turn the Setar archive into trusted lessons and useful practice material",
  "rationale": "THESIS: Turn a trusted Setar archive into useful, portable practice material, with exact reconciliation and durable incremental refresh.\n\nLANE COMPARISON: (1) Small crawler plus Test link repair fulfils discovery but leaves wrong inherited material, duplicates and historical urgency; too weak. (2) Trusted archive to daily material adds deterministic reconciliation, exact old-reference repair, useful Item Detail/Active resources, direct item NAS links, compact historical lessons and durable lesson notes; chosen heavy lane. (3) Whole music-library platform with full Tar/Guitar ingestion and mobile keyboard overhaul is wider but unsupported by shared grammar or a reproduced keyboard defect; defer.\n\nARCHITECTURE COMPARISON: Direct browser filesystem selection is a Mac-only permission/mount dependency and unsuitable for iPhone. Existing Node scanner generating bundled TypeScript requires rebuild/deployment for every lesson. Browser NAS HTML crawling adds dozens of listing requests, fragile HTML, failed CORS, production CSP changes and certificate complications; no-cors cannot produce readable data. A NAS-served JSON index is sound but still needs CORS/CSP and HTTPS configuration. A live scan service adds an unnecessary runtime API/authentication surface. Choose read-only Node scanner on NAS -> deterministic JSON on private source-index branch -> GitHub API read with existing app connection -> pure reconciliation. Both devices get the same small index without NAS fetch permission, new paid service or large-file storage; media still opens directly through each device base. A file-import fallback uses precisely the same decoder/reconciliation. Refresh consumes the latest published index; it does not remotely start a live NAS scan. Default scheduled scan every15 minutes is documented, and UI distinguishes index last changed/fetched from live scan freshness.\n\nExisting gitRemote creates a complete main tree without base_tree, so placing a sidecar alongside state.json would lose it on next sync. A separate source-index branch is required, outside archive/ recovery branches. No change to whole-state sync semantics is justified.\n\nEvidence: clean main b649bd09d0ffbd8bbc5955c3c891cfe01a7fa417; private data repo main a6c6a664eedcdd3fae8798c350e60ec52e8d6a5c at inspection, schema13/rev175. 39 sessions,258 files,257 parseable,1 known exception,94 canonical pieces verified directly. LAN listings and all CSV/brief bytes equal Sandisk; no ACAO, normal Mac TLS validation fails, diagnostic one-byte Farsi video request returned206. Mac has no Tailscale; iPhone base was subsequently supplied by OWNER and real playback remains manual acceptance.\n\nTar is flat numbered Farsi course videos; Guitar has18 levels with course sections, notes, PDFs and videos. Neither shares Setar session/registry grammar. Share only the concrete normalised source description, identity/path validation, reconciliation and resource resolution that Setar actually exercises, with no adapter class/plugin registry.\n\nHostile pre-mortem was performed across parser, attribution, identity, source ownership, deletion, persistence, inbound replacement, sync, transport and render families. The acceptance checks below specify the sibling transitions that defeat a literal happy-path implementation. Already-shipped attachment, working-text, SM2, session protection and WebKit fixes are preserved rather than counted as new work.",
  "kind": "existing-flow",
  "flowId": "log-a-class",
  "currentBehaviour": "Private practice-compass-data main: schema13,38 lessons,6 items,16 blocks,6 reviews,5 agenda entries,1 attachment.\n74 lesson references:67 exact rename repairs,7 current,0 unmatched,0 absolute.\nTwo old/current references collide after repair: session1 class part1 and first Dashti score. Preserve both authored records/metadata; coalesce resource display only or explicit owner resolution.\nThree current personal practice references are already authored; retain records but classify as historical-only outside Item Material/Active.\nExisting upcoming class38 date2026-09-27 is distinct from archive38 date2026-08-04.\nLegacy67 seed paths all absent; all have exact RENAME-LOG targets. Legacy session28 main video is actually named demonstration.\nCurrent LessonCard opens when notes absent, so 39 imported lessons default open on mobile.\nExact extracted updateLesson body reproduces inability to clear notes: editor sends undefined and store coalesces to previous notes.\nCurrent sync createTree supplies no base_tree, so app main sync removes unrelated sidecars. Source index belongs on a separate branch, never data main.\nExisting scanner chooses largest video rather than role; bundled seed has37 sessions. All67 seeded paths are obsolete. ItemMaterial inherits every recording from linked lessons, including irrelevant class/personal material. New source fields would be silently dropped unless validateDB's reconstructed output is extended. Current lesson notes cannot be cleared because editor emits undefined and updateLesson uses nullish fallback. Native installed-app observations corroborated material clutter but were not claimed as exact-current-main rendered proof.",
  "desiredBehaviour": "1. DELIVERY AND OPERATION\nReplace the old seed-import workflow with Refresh Setar archive in Settings, accessible from Lessons. First use selects the existing Setar instrument only if ambiguous; thereafter one action fetches a pinned source-index commit, validates, previews genuine reconciliation questions if any, and atomically imports. Show Added / Updated / Already current / Needs attention with concise counts and optional details, not crawler output. Binding and owner choices persist. No filesystem or URL entry in routine refresh. Device media setup is one-time.\nImplement the scanner as a small stdlib Node executable; it accepts an operator-configured root and emits outside that root. Production is an unattended NAS DSM scheduled task, not this Mac. Package the launcher and exact installation/rollback instructions. Actual NAS source mount/runtime/permissions are discovered and recorded during OWNER installation acceptance; do not assume Mac /Volumes paths exist on DSM. Source account has read-only access, output/config elsewhere; no root/admin requirement. Failed scan/publication preserves last good remote index. Local execution of the same scanner is sufficient fallback, no separate Mac daemon.\nPublish only setar/index.json on source-index in the existing private data repository, using content hashing, non-force compare-and-swap reference advancement and bounded retry. Create the initial branch without modifying main. Fetch branch SHA then file at that SHA; validate version/size/digest/content before use. No public app bundle of the full private index. App requires only its already-configured GitHub read access; file-import fallback is optional recovery through the same boundary. Publisher credentials belong to NAS protected runtime configuration, never source, Git, output, app state, logs or backups. Restrict token to this repository and necessary Contents write/metadata read, without workflow/admin scope. This is repository-scoped authority, not fictitious branch-scoped token permission; code refuses all targets except source-index/setar/index.json.\nAn unchanged semantic scan makes no commit. The UI's fetched time is device-local transient state and publication time means index changed, not proof that a scanner ran recently. NAS scheduler logs record success/failure. No stale-index timestamp is treated as proof an asset disappeared.\n\n2. EXACT SETAR SOURCE CONTRACT\nRead PIECES.csv before assets with a real CSV parser supporting quoting/doubled quotes/embedded commas; no comma splitting. canonical_fa is the byte-exact identity; aliases are literal search alternatives only. Registry forms, dastgah, composer, notes and provisional/MEDIUM caveats are evidence, not free inference. Real forms include هفت-ضربی and چهارپاره. Require unique canonical keys and valid session roster.\nFolder session-N-DD-MM-YYYY defines numeric sequence and validated Gregorian date. Membership, not mtime, associates assets. Longest role prefix at hyphen boundary uses ضبط-کلاس, تمرین-من, تصحیح, تکلیف, جزوه, نمونه, نت. Remove extension; trailing ASCII numeric suffix is part, embedded digits remain piece identity. Display stem replaces hyphen/underscore with spaces. Never split canonical -و-, transliterate, fuzzy-match or infer segmentation. Named pieces must exist in registry. Sort sessions and parts numerically.\nSource graph includes registry pieces, sessions, useful resources, exact piece/session memberships and role presence, logical demo parts, rename aliases, caveats and diagnostics. Persist no individual newly discovered تمرین-من resources: keep only their trustworthy membership/role/repeat evidence. Repeated consecutive session appearances are labelled sessions, not weeks or recorded practice.\nKnown exception session-16-26-11-2024/video-2024-10-29-15-32-35.mp4 is skipped and named in Needs attention, never reassigned to15. Session28 has no class recording. Sessions7,34,35 have real provisional identities. RENAME-PLAN confidence is a soft source flag, not identity authority; RENAME-LOG provides exact path provenance.\nUnnamed demo belongs to every canonical member of that session; numbered clips are one ordered logical demonstration. A named demo belongs only to its exact piece. Class recordings are lesson-only. Notation/corrections attach only to the named piece; unnamed handouts/homework/notation stay lesson-level, never guessed onto all pieces. Unknown roster membership blocks that session's ambiguous attribution and yields actionable attention; malformed/duplicate registry or incomplete scan is fatal and preserves last good index. Unknown individual files are reported/skipped, not guessed.\nIgnore dotfiles and NAS housekeeping; do not traverse symlinks, outside-root directories or unsafe paths. Bound bytes, rows and files, detect registry/inventory mutation during scan, and require a complete consistent source view before removals become unavailable. Size can be stat-derived; no media-duration/segment inference or video downloads.\n\n3. IDENTITY, OWNERSHIP AND PERSISTENCE\nUse stable archive ID setar-classes, session key numeric lesson sequence, canonical piece key canonical_fa and raw archive-relative asset path, never absolute transport URL. New Practice Compass IDs are deterministic namespaced encodings/hashes of source identity so independent imports on two devices agree; preserve IDs of explicitly adopted existing records. A source identity binds at most one live app record and a canonical item is never silently equated with a different canonical key or built-in catalogKey.\nSchema14 adds one canonical archiveSources graph plus item/lesson source bindings and manual item reference support, using the smallest representation with no second copy of the same resource per item. Bindings must resolve to source entities and the chosen instrument. Derived From lessons, material lists, aliases and repeat chains come from the graph; do not cache their own competing copies. Imported lesson historical origin is explicit and remains historical even if its date is future relative to the clock.\nPersist the last accepted useful source graph, bindings, owner reconciliation decisions and suppression records, enough for offline rendering/refresh after sync. Latest fetched manifest, transient status and device transport bases are not synced. Retain missing source entities/resources with unavailable status rather than dropping provenance. A new canonical key is a new identity requiring reconciliation, not a metadata rename inferred by similarity. Exact unambiguous RENAME-LOG asset chains may preserve asset identity, recording old aliases.\nSource-owned: registry facts, archive session facts, roles, canonical memberships, resource availability and caveats. User-owned: item/lesson editable titles and identity overrides after initial seeding, Working notes, lesson notes, item status/mode/focus, authored references, links/suppressions and every practice/scheduling/agenda field. Initial title/identity fields are seeded only from registry evidence; form گوشه can identify a gusheh, other descriptive forms remain verbatim; no invented pathway, proficiency, catalog identity or composer. Ambiguous standalone/provisional entries remain repertoire members with source labels, not forced categories. Later registry improvements update source facts and offer explicit selected-field application without overwriting even deliberately empty owner values.\nNew imported items default to resting/dormant as an administrative library policy, clearly stated before import, to avoid94 unsolicited recommendations. They remain searchable, visible in My repertoire and directly startable. No observed practice/result/review date/SM2 exposure is seeded. Existing matched item status and scheduling remain untouched.\n\n4. RECONCILIATION AND REFRESH\nExact source binding wins. For legacy classes, auto-adopt only a unique instrument+date+number match backed by exact source-path provenance; do not merge by number/date alone. Existing upcoming class38 dated2026-09-27 must coexist with archive38 dated2026-08-04. Exact manual title or literal alias equality produces a small Link / Create separately / Skip decision, not automatic merging. The owner can choose another existing item explicitly; never automatically equate catalogKey iraq, a phrase containing عراق, and canonical عراق. No-candidate new pieces can be added in one reviewed batch, without94 questions.\nPrepare against current DB revision and manifest identity, validate whole proposed graph, then perform one synchronous store mutation preserving active/routine/plan and unrelated DB fields. No per-file partial commits, blob APIs or whole-database import/reset. Recheck revision immediately at commit, rebase/repreview if changed; do not overwrite edits/practice completed during fetch. Wait for actual IndexedDB acknowledgement before success. Retry after failed persistence writes again even if in-memory content already matches. Identical durable refresh causes no DB revision/timestamp churn.\nNew lesson/file changes add only the delta. Missing files/registry rows after a complete valid scan become unavailable/needs attention; transient I/O or network failure cannot imply removal. Partial old bindings are refused or surfaced for explicit repair, never healed by duplication.\nDelete/unlink/hide operations persist narrowly scoped suppressions in the same transaction as record/link changes. Refresh, reload and sync must not resurrect owner-deleted items, lessons or associations. Hiding a shared demonstration on one item cannot hide it on another. Explicitly resetting a suppression permits reimport. Instrument moves must refuse or explicitly detach incompatible source binding; all store mutation callers, including removeCatalogItem and reset/clear, preserve graph validity.\nUse existing whole-state GitHub conflict protection for concurrent devices. This lane does not invent field-level sync merge. Deterministic source IDs prevent identity duplication, not conflict-free merging of user edits. Pull, Keep remote and restore carry source choices through the same validated snapshot.\n\n5. USEFUL MATERIAL AND HISTORICAL LESSONS\nCompose material once for Item Detail and Active from source attribution plus authored direct item links. Show corrected scores prominently while retaining clean scores; teacher demos are one logical group with ordered parts. All relevant sessions remain accessible, grouped numerically with provenance. Class videos/unnamed lesson handouts stay in the lesson. Newly ingested personal recordings never appear in ItemMaterial/Active.\nRetain the three already-authored personal references as historical lesson evidence with their notes intact, outside useful practice resources. Existing unclassified manual lesson links remain accessible without guessing attribution. Add a direct item NAS reference using the existing reference shape/resolver so useful material need not be attached to an artificial lesson. Keep large assets external; no IndexedDB video copying or new media player. Open remains a direct user gesture, with practice timer/state preserved.\nHistorical lessons show compact collapsed rows on phone, useful resources and associated items, and explicit archive provenance. One shared predicate excludes source-history lessons from nextLessonFor, nextLessonDates, defaultTargetLesson, preparationDatesByItem and every upcoming badge/default/question target. Source lesson dates never create current commitments or pending teacher questions. Existing manually authored agenda survives.\nExpose source metadata progressively on the item and From lessons links, source caveats/needs labelling and literal alias search in Repertoire and Start using existing Farsi search. Search normalisation is never identity reconciliation. Farsi values wrap and isolate direction; user-authored text retains dir=auto. Preserve quick Start/Close and collapsed Active material.\n\n6. TRANSPORT AND EXACT REFERENCE REPAIR\nNew references store raw paths relative to the Setar archive root. Each device selects/configures an archive media base once; derive from existing device media-root setting where exact mapping is known, preserving legacy semantics. Mac base https://192.168.0.20:5010/setar-classes/; owner-provided iPhone base https://ds220plus.taild1d1f7.ts.net/media/setar-classes/. Do not store either in synced DB, bake a transport into identity, or require Tailscale on Mac. Segment-wise URL encoding happens once at resolution, preserving base subpaths. Reject credentials, unsupported schemes, traversal/encoded separators for source paths; do not rewrite ordinary external links with meaningful query/fragment.\nReplace arbitrary-clip Test link with readable source-index capability/status plus Open archive root for media access. An index GET success is not proof NAS media works; cross-origin root opening cannot programmatically prove it. Explain unavailable/configuration/certificate conditions honestly without disabling TLS checks or broadening CSP.\nRepair67 existing old paths using exact RENAME-LOG mappings. Prefix conversion of absolute URLs is allowed only under a verified configured base; foreign/ambiguous paths remain unchanged with attention. Two old/current rows collide physically after repair: session1 class part1 and its first Dashti score. Preserve both authored rows/notes, coalescing display by physical asset rather than deleting information. No fuzzy old-path repair or rewriting every record after a base change.\n\n7. COHERENT BUG FIX AND SAFE UPGRADE\nFix inability to clear lesson notes at the authoritative store patch boundary: distinguish omitted patch field from deliberate empty text. Give lesson editor the existing ItemNotes explicit-save/draft-tag/acknowledged-persistence/retry model, reusing its actual code pattern or component only where it reduces duplication. Source refresh cannot overwrite an open draft; switching lesson cannot save to another lesson. Preserve ItemNotes' existing in-flight newer-keystroke protections and Working notes/Observation/Next time homes.\nv13->v14 is additive with empty source state, preserving all legacy fields and running existing migrations unchanged. validateDB accepts AND returns new fields, centrally checks types, versions, path safety, duplicate identities and relationships. All inbound routes use this boundary: Settings full/state import, sync pull, Keep remote, archive restore, both persist migration/merge branches and cold-start recovery. New schema refusal precedes destructive work; no coercion/dropping malformed graph. Existing attachment byte/ownership and active/revision guards remain intact. No scanner/network action in hydration.\nBefore upgrading owner data, retain a full v13 backup. v14 exports include the source graph and authored external-reference metadata but no NAS bytes/secrets. Rollback is baseline app plus retained v13 backup, not lossy v14 downgrade. Verify actual baseline refuses v14 without writing. Existing sync format2/hash/archive engine is unchanged.\n\n8. EVIDENCE AND COMPLETION\nChecked-in fixtures use real Farsi filename/registry/rename examples and a compact deterministic metadata corpus, never private owner notes, credentials, IDs or media. Ordinary npm test has no Sandisk/NAS/network dependency. Pure parser/reconciliation tests cover authoritative logic; real store/inbound browser tests cover durability/wiring; rendered desktop390x844 phone journeys run Chromium and WebKit using existing harness, with no missing-engine skip. OWNER checks alone prove actual NAS deployment, corpus and physical iPhone access. Do not call manual checks passed from mocks.\nCorpus baseline:39 sessions,258 files,257 parseable,1 exception,94 pieces;125 personal,57 demo clips/37 logical demos,45 class parts,24 clean scores,6 corrections;132 useful files. Hashes recorded in docs for exact baseline: {\"registry\":\"1f68366e32f0f5ddc8b8db0c1027893b724e16d496f0dca0502fa0a0cd133524\",\"renamePlan\":\"795faf11c1538e69905e245e9c45d0b13ebcd3469a1b18a2db097786e576b39c\",\"renameLog\":\"0c276d5e50fc93904ecfb76c71b1c78dca1cda2610f1569f28c9828013278373\",\"brief\":\"ee76dbc17351fdcc33662b7c467652f5b90728005ef48071bdb35bcf8843a9bc\",\"sortedPathInventoryLF\":\"0286b07549ad55b0f84166dc2c7b8c2d5949f96a282f03ebaa5837ebf5b22ae7\"}. Counts are this corpus evidence, not permanent limits preventing lessons40+.\nBuild sequence: first parser/index/publisher and deterministic fixtures; second source graph/reconciliation/migration boundary; third material/lesson/transport/editor integration; finally hostile transition tests, rendered journeys and OWNER deployment/corpus/device checks. Tests must exercise actual shared boundaries; named acceptance titles below are each unique test definitions, not substring/file coverage claims. Full required typecheck/lint/unit/build/secrets checks remain mandatory. A lane cannot be called complete with production publisher setup or physical device verification hidden as future work.",
  "mustNotChange": [
    "Never write, rename, move or delete Setar/Tar/Guitar source files, including CSVs; fixtures and outputs live outside archives. No source or NAS configuration is changed during this planning turn.",
    "Preserve blocks, minutes, Results, all scheduling/SM2/review evidence, counts and streak semantics. Archive appearances are not recorded Practice Compass practice.",
    "Preserve core loop, quick Start/Close, Active timer/wake-lock, running/paused practice, session plans/routines, instrument scoping, working-text homes, manual review dates and lesson-agenda/question semantics.",
    "Preserve existing local attachments, full/state backup byte guarantees, refused hydration recovery, snapshot sync conflicts/archives and revision guards. No live owner-data writes in automated tests.",
    "Keep practice core usable offline with last accepted metadata. Source refresh and external media may need their respective networks without blocking practice.",
    "No fuzzy matching/transliteration, automatic piece splitting, AI/audio judgement, gamification, paid service, speculative plugin system or public full archive index."
  ],
  "assumptions": [
    "OWNER explicitly selected claude and NAS scanner -> separate private GitHub index, authorised one-time NAS setup, and supplied exact iPhone Setar mapping. No product/architecture choice remains pending.",
    "NAS runtime, actual internal mount and scheduler credentials are deployment facts still to verify in explicit manual:OWNER acceptance; implementation must provide and exercise this setup, not depend on undocumented infrastructure.",
    "Default scan interval is15 minutes. Refresh means latest published index, not immediate remote disk rescan; expose that distinction clearly.",
    "New imported repertoire defaults resting as a reversible administrative choice; source membership cannot establish current practice priority.",
    "Main and data-repo heads/counts bind planning evidence only; re-read owner data before real reconciliation and never hard-code owner UUIDs or private notes."
  ],
  "possibleConflicts": [
    "r-secrets-stay-on-device currently says token lives only in browser local storage. The approved NAS publisher needs a separate NAS-local publisher credential. Narrowly amend that rule to distinguish browser credential/device bases from NAS operator secret, while preserving prohibition on export, sync, logs, Git and manifest disclosure.",
    "r-direction-aware-text mentions stable ASCII built-in identities; externally imported canonical_fa must remain byte-exact Farsi source identity, carried in a namespaced stable app ID. Do not force transliteration to fit built-in catalog convention.",
    "Historical source lessons must not displace the owner's genuine upcoming class38. Current private data contains exact collision counterexample, not a hypothetical.",
    "Source-index branch isolation is essential because ordinary sync replaces main's entire tree; do not solve by changing the trusted sync engine or overstating token branch restriction.",
    "Existing orphan/duplicate authored reference metadata cannot be deleted merely to simplify source deduplication."
  ],
  "scope": {
    "allow": [
      "scripts/scan-setar-classes.mjs",
      "scripts/publish-setar-index.mjs",
      "scripts/run-setar-index.sh",
      "scripts/setar-index.test.mjs",
      "src/domain/types.ts",
      "src/domain/migrations.ts",
      "src/domain/migrations.test.ts",
      "src/domain/io.ts",
      "src/domain/io.test.ts",
      "src/domain/seed.ts",
      "src/domain/seedMigration.test.ts",
      "src/domain/index.ts",
      "src/domain/factories.ts",
      "src/domain/setarClasses.ts",
      "src/domain/setarClasses.test.ts",
      "src/domain/scanSetarClasses.test.ts",
      "src/domain/recordings.ts",
      "src/domain/recordings.test.ts",
      "src/domain/itemFiles.ts",
      "src/domain/itemFiles.test.ts",
      "src/domain/selectors.ts",
      "src/domain/selectors.test.ts",
      "src/domain/lessonAgenda.ts",
      "src/domain/lessonAgenda.test.ts",
      "src/domain/repertoire.ts",
      "src/domain/repertoire.test.ts",
      "src/domain/sourceArchive.ts",
      "src/domain/sourceArchive.test.ts",
      "src/domain/sourceReconcile.ts",
      "src/domain/sourceReconcile.test.ts",
      "src/store/useStore.ts",
      "src/store/backup.ts",
      "src/store/archiveIndex.ts",
      "src/store/archiveIndex.test.ts",
      "src/components/ItemMaterial.tsx",
      "src/components/ItemNotes.tsx",
      "src/components/LessonNotes.tsx",
      "src/components/ArchiveRefresh.tsx",
      "src/components/ReferenceEditor.tsx",
      "src/components/direction.test.ts",
      "src/pages/Settings.tsx",
      "src/pages/Lessons.tsx",
      "src/pages/ItemDetail.tsx",
      "src/pages/ActiveBlock.tsx",
      "src/pages/Repertoire.tsx",
      "src/pages/StartBlock.tsx",
      "src/styles/global.css",
      "tests/practiceBrowser.ts",
      "tests/setarArchive.browser.test.ts",
      "tests/setarInbound.browser.test.ts",
      "tests/lessonNotes.browser.test.ts",
      "tests/fixtures/setar-archive.json",
      "tests/fixtures/setar-legacy-v13.json",
      "package.json",
      "AGENTS.md",
      "DECISIONS.md",
      "FUTURE.md",
      "README.md",
      "docs/product-spec.md",
      "docs/setar-archive.md"
    ],
    "forbid": [
      "src/domain/scheduling.ts",
      "src/domain/scoring.ts",
      "src/domain/recommend.ts",
      "src/domain/plan.ts",
      "src/domain/practiceSession.ts",
      "src/domain/practiceSignal.ts",
      "src/components/screenAwake.ts",
      "src/components/useScreenAwake.ts",
      "src/components/useViewportGuard.ts",
      "src/components/Layout.tsx",
      "src/pages/CloseBlock.tsx",
      "src/store/githubSync.ts",
      "src/store/syncEngine.ts",
      "src/store/gitRemote.ts",
      "src/store/revision.ts",
      "src/store/idb.ts",
      "vite.config.ts",
      "package-lock.json",
      ".github/**",
      "public/**",
      "src/domain/persian.ts",
      "src/domain/farsi.ts",
      "src/domain/pathwaySeed.ts"
    ]
  },
  "exclusions": [
    "Full Tar/Guitar import, archive normalisation/renaming, generic adapters/plugins and media segmentation.",
    "iPhone keyboard/bottom-nav changes without a reproduced diagnosis; no heuristic hide/delay workaround.",
    "Scheduling/session planning/routine redesign, broader duplicate sweep unrelated to source graph, sync engine rewrite, all-purpose library migration or UI redesign.",
    "Public index publication, NAS browser HTML crawler, permanent TLS bypass, new backend/API or bulk NAS attachment imports.",
    "Already-shipped working-text retirement, attachment integrity, manual-date/SM2, current session recovery and browser CI fixes."
  ],
  "acceptance": [
    {
      "description": "Use real PIECES.csv rows including quoted commas, doubled quotes, aliases, provisional and MEDIUM caveats. Preserve canonical_fa byte identity, embedded digits and -و-. Reject duplicate/empty canonical keys, malformed quoting, missing headers, invalid session numbers and unknown manifest versions. aliases_seen is literal search data, never a wildcard or reconciliation heuristic; real forms هفت-ضربی and چهارپاره are supported without inventing categorical facts.",
      "test": "setar registry keeps exact Farsi keys and rejects ambiguous CSV input"
    },
    {
      "description": "Assert all seven real brief examples exactly, role boundary longest match, parts numeric, the embedded دشتی-1-علیزاده digit and پریچهر-و-پریزاد stay inside one canonical name. Known session16 video exception produces actionable diagnostic and no guessed role. Unknown piece/role/ext and named class recordings are surfaced, not relabelled. No largest-file heuristic.",
      "test": "setar filenames preserve compound roles and report unhandled assets"
    },
    {
      "description": "Session13 unnamed two-part demo belongs to all eight canonical pieces; session28 named demo only به-زندان-شوشتری and no fabricated class recording; session27 class parts ordered numerically. Folder membership rather than mtime. Provisional session7 and34/35 preserved. Six-session personal repeat chain22..27 is provenance, never six weeks or practice evidence. On roster disagreement do not expand unnamed demos to a guessed set.",
      "test": "setar session material follows exact roster and demonstration attribution"
    },
    {
      "description": "Deterministic filesystem inventory fixture, shuffled directory order and altered mtimes yield same semantic index. Numeric session order9 before10. Ignore dotfiles/root out-of-scope folders/NAS @eaDir; do not follow symlinks or unsafe relative paths. Reject traversal, escaped separators, URL schemes, duplicate asset/session identities and oversize inputs. Missing root or changed registry/inventory during scan does not replace last good output. Output is atomically published outside archive; no source write API.",
      "test": "setar scanning is bounded read-only and produces stable complete indexes"
    },
    {
      "description": "Transport stub exercises first index publish, identical scan no commit, changed scan, interruption before ref advance, race with second publisher. All writes confined to designated source-index branch; never state.json, manifest.json or files/ on data main or archive/ recovery branches. Reader pins file fetch to the read branch commit. Authentication/network errors leave old index and app data intact; no token/root URL in payloads or logs. Publisher target branch is fixed source-index and path setar/index.json. Token is scoped to this private repository with only required Contents write and metadata read, no workflow/admin permission; GitHub does not make such a token branch-scoped, so code target restrictions and optional repository rules must not be described as credential isolation. App reuses its existing local GitHub connection only for GETs; no publisher token reaches the browser. Unchanged content means no commit; UI says index last changed/fetched, never falsely last scanned.",
      "test": "source index publication cannot replace practice data or lose a concurrent update"
    },
    {
      "description": "First empty import produces39 historical lessons94 canonical items; repeat no duplicates. Existing source bindings win across edited titles/dates. Unique legacy lesson with exact source-reference evidence/date+number can be adopted; date-only, number-only or title-only equivalence cannot auto-merge. Exact manual title/alias candidates require owner Link/Create/Skip; multiple candidates do not pick first. Existing upcoming class38 on2026-09-27 survives separate from archive38 on2026-08-04. catalogKey iraq never equals Setar canonical key عراق. Source/instrument binding explicit and persistent. Deterministic namespaced IDs on new records ensure two devices importing the same source separately identify the same logical entities, while existing owner records retain their IDs after explicit binding. Whole-snapshot GitHub conflicts still require the existing owner choice; no automatic merge of divergent practice databases.",
      "test": "setar reconciliation binds exact identities without merging owner records"
    },
    {
      "description": "Exercise one newlesson40, added score existinglesson, changed registry metadata, exact logged path rename, missing file, missing registry row, unresolved previous candidates and same manifest with a new owner decision. Source metadata/availability updates; item/lesson authored fields seeded once then preserved including deliberate empty values. Later metadata improvement shown for explicit selective apply, never notes overwrite. Missing source retains provenance and flags unavailable, never deletes owner data. Unchanged refresh does not bump db revision or churn timestamps. A canonical key change is a new identity requiring owner decision, never inferred from metadata; exact asset rename chains alone may preserve an asset identity. Missing files only follow a validated complete scan, not timeout, partially copied input or unreachable mount.",
      "test": "archive refresh preserves owner edits and applies only the new source delta"
    },
    {
      "description": "Actual mutation actions deleteItem, removeCatalogItem, deleteLesson, unlinkItemFromLesson, remove manual ref and hide imported material update only applicable suppression/binding in same store mutation. Retry identical source after reload/sync cannot resurrect deliberately suppressed record/link. Shared demo hidden for one item remains available to others. Moving an archive-bound item to another instrument refuses or explicitly detaches before mutation; no invalid graph emitted. Clear/reset remove source state with DB. Partial/imported dangling bindings refused instead of duplicate healing.",
      "test": "archive deletions and unlinking remain respected after refresh and reload"
    },
    {
      "description": "Compare complete pre/post blocks,reviews,lessonAgenda,existing item counters/results/all scheduling fields,active+routine+plan,notNow and sessionInstrument. New items have zero totals,no lastPractice/result/review/SM2; source personal files create only membership/roles/repeat provenance. No new material/agenda/pathway commitments inferred. New library items start resting by explicit import policy so Today/plan pools are not flooded, yet direct Start works. No personal recordings in item/active material.",
      "test": "archive import cannot fabricate practice or next-class urgency"
    },
    {
      "description": "One shared upcoming predicate used by nextLessonFor,nextLessonDates,defaultTargetLesson,preparationDatesByItem and wide/mobile Lessons badges/default selection/question sheet. Test source historical lesson dated past/today/future versus ordinary real upcoming lesson on same dates; imported historical records never create urgency/default question target. Preserve existing manually authored agenda and normal upcoming lesson semantics.",
      "test": "historical source lessons never become upcoming through sibling selectors"
    },
    {
      "description": "Real store action with controlled persistence: validate and prepare before a single db set; no per-file app commits/no blob copying. Revision change, source change, owner-choice change, active session starting and finishing during fetch cause rebase/repreview or refusal without lost edits. IndexedDB failed save reports unsaved and retry persists complete current state even if in-memory index hash already matches; no false Already current. Reload before/after acknowledgement yields previous complete or new complete state. Refresh never calls whole-DB import/reset.",
      "test": "archive commits survive interruption and never apply a stale preview"
    },
    {
      "description": "All67 legacy seed paths map through exact257-row RENAME-LOG, no fuzzy URL/title/mtime matching. Full URL converts only under explicitly verified current device prefix with segment-wise decode; foreign/query/fragment links remain untouched. Old/current pairs for session1 classpart1 and firstDashti score show one physical resource without deleting either authored row/notes. Existing3 personal references remain retained historical links outside item/active list. Missing targets/cycles/multiple destinations diagnose, never guess.",
      "test": "exact Setar rename repair preserves saved references and their metadata"
    },
    {
      "description": "One shared composition for ItemDetail/Active and new direct item links plus lesson composition. Corrections prominent but clean scores retained; logical demo ordered parts one group; resources from earlier repeat-chain lessons remain reachable; named scores/demo never bleed to sibling pieces; whole class video stays lesson-only. Existing manual unclassified lesson references remain accessible without inventing scope. Direct NAS link works without any lesson and uses same resolver as legacy/source refs. External links never go through attachment blob APIs.",
      "test": "practice material shows only useful correctly scoped archive resources"
    },
    {
      "description": "Same sourceId+relative asset resolves via independently configured Mac/iPhone roots and a changed future base; stored data/export/hash unchanged. Config device-local, never synced. Preserve base path prefixes; reject unsafe path/scheme/traversal/credentials and double-encoded separators; encode each raw Farsi segment once. Root/index capability check never relies on a media filename. Distinguish readable published index from unverified media reachability; do not claim CORS/cert/network failures are absence.",
      "test": "source transport changes preserve archive identity and encode Farsi once"
    },
    {
      "description": "v13->v14 additive empty-source migration with source keys/manual refs/history marker as chosen representation; legacy baseline fields unchanged apart from schema. Run whole oldest-supported chain, repeated migration and current-declared inbound. validateDB retains/validates every new persisted field with duplicate source keys, wrong types, dangling/mismatched refs,wrong instrument,unsafe paths,unknown format/newer schema refused before mutation. Missing source file is valid unavailable state, not dangling graph. Successful output revalidates and roundtrips export unchanged. New collection is included in validateDB's reconstructed return value, not merely accepted on input. Legacy current-version stray fields do not bypass validation. Reject duplicate bindings and resource graph cycles/invalid part group membership. Preserve surviving practice text and attachment guarantees.",
      "test": "archive schema migration and validation preserve the whole source graph"
    },
    {
      "description": "Use existing browser/fakeGitHub harness to drive Settings full/state import, automatic pull, Keep remote, archive restore, both hydration branches and cold-start recovery. Same malformed source relation rejected with pre/post persisted DB+blobs checked; valid source bindings/suppressions/user fields survive. Existing active/revision guards retained. Full export includes metadata only for NAS refs and only real local attachment bytes. Real baseline v13 checkout refuses v14 file without writes; retained v13 backup restores there. No format2 sync-engine rewrite.",
      "test": "archive state crosses all real inbound doors without partial installation"
    },
    {
      "description": "Reproduce current empty-save bug through real editor and store then verify fixed reload. Reuse current ItemNotes durability model: explicit Done, preserved unsaved draft on refresh, tagged lesson ID, storage acknowledgement before Saved, failed-write retry/copy, typing during pending write, latest-save ownership, item/lesson switch and route unmount. Existing Working notes/Observation/Next time and timers remain unchanged.",
      "test": "lesson notes can be cleared and saved durably without cross-lesson drafts"
    },
    {
      "description": "Rendered controls with frozen time and checked-in corpus-derived metadata fixture. Refresh -> historical lesson -> proper class/score/demo -> canonical item -> useful material -> direct Start -> open material with practice context unchanged. Historical phone rows initially compact/collapsed, Farsi wraps and mixed labels isolate correctly, keyboard controls and accessible names present. Alias search works in Repertoire and Start through existing Farsi matcher; identity matching never uses it. Repeat refresh then add fixturelesson40 only delta; invalid file actionable; persisted reload verifies no duplicates/history fabrication. Both engines mandatory; missing engine fails, not skip.",
      "test": "setar archive journey works on phone and desktop in Chromium and WebKit"
    },
    {
      "description": "Actual corpus read-only: baseline39/258/257/1/94 with125personal and132useful files, 37logical demos; all CSV+inventory hashes recorded. Verify known exception/session28/provisional rows and full rename coverage. Future lesson delta tested with disposable fixture outside Sandisk, not a mutation of source archive. Publisher runtime/location and scheduling must be installed and exercised, not left as a runbook-only hidden prerequisite. Primary production host is the NAS, explicitly approved by OWNER: install supported Node runtime and a DSM scheduled task (default every15 minutes), read-only source permissions and restricted separate runtime/output directory. Provision publisher-only repository-scoped credentials outside app data and verify unattended run with Mac off. Verify main branch unchanged after index publication; revocation and failed scan retain last good index. Record actual NAS filesystem mapping/runtime rather than assuming /Volumes paths work there.",
      "test": "manual:OWNER"
    },
    {
      "description": "Real Mac and iPhone journey using archive bases https://192.168.0.20:5010/setar-classes/ and OWNER-provided https://ds220plus.taild1d1f7.ts.net/media/setar-classes/. Verify same Farsi demo and score open, video range/seek works, changing base changes no source IDs or backup data. iPhone path is owner-confirmed mapping awaiting device playback verification, not a Mac-probed fact. Mac requires no Tailscale. Do not disable certificate validation in shipped code. Show published-index retrieval separately from media access; unavailable NAS or GitHub preserves imported material metadata. Never mark iPhone passed from LAN-only/emulated tests.",
      "test": "manual:OWNER"
    }
  ],
  "risk": {
    "touchesAuth": true,
    "touchesPayments": false,
    "touchesSavedData": true,
    "copyOnly": false,
    "rationale": "HEAVY: schema14 with authoritative graph validation and every inbound door, reconciliation against real owner records, exact reference repair, acknowledged store persistence, and new NAS-held narrowly scoped GitHub publisher credential. Remote branch publication and unattended NAS setup require explicit operational proof; no payment surface."
  },
  "delta": {
    "today": "Import Setar classes uses a stale37-session bundled seed, broken renamed reference and broad lesson-material inheritance.",
    "instead": "Refresh the NAS-published private Setar index into historical lessons and canonical items with useful attributed material, exact reconciliation, portable references and safe incremental updates.",
    "keep": [
      "Existing manual lesson and agenda flow",
      "Honest practice and scheduling history",
      "Offline data, backup and GitHub conflict safety",
      "External NAS media and device-local bases"
    ],
    "assumptions": [],
    "showMe": "Empty import ->39 historical lessons -> canonical item with correct source metadata and useful demo/score -> direct practice and open material -> repeat no-op -> fixture lesson40 delta -> same asset on Mac and iPhone -> actionable known exception, with no personal-material clutter or fabricated practice."
  },
  "desiredRules": [
    "Archive evidence may establish repertoire membership, historical lesson provenance and source material, never recorded practice, results, exposure, review completion or scheduling progress.",
    "Source identity is archive-relative and independent of transport; refresh preserves owner-authored data and explicit reconciliation/suppression decisions across every inbound boundary.",
    "Browser GitHub credentials and media bases stay device-local; the separately scoped archive publisher credential stays in protected NAS operator configuration. No credential or device base enters source archives, committed files, manifests, app data, logs, sync or backups."
  ],
  "docsDelta": [
    "AGENTS.md",
    "DECISIONS.md",
    "FUTURE.md",
    "README.md",
    "docs/product-spec.md",
    "docs/setar-archive.md"
  ]
}
```
````

## The approved Delta this change must deliver

# Refresh the NAS-published private Setar index into historical lessons and canonical items with useful attributed material, exact reconciliation, portable references and safe incremental updates.

_approved · about "log-a-class"_

## Today

Import Setar classes uses a stale37-session bundled seed, broken renamed reference and broad lesson-material inheritance.

## Instead

Refresh the NAS-published private Setar index into historical lessons and canonical items with useful attributed material, exact reconciliation, portable references and safe incremental updates.

## Keep

- Existing manual lesson and agenda flow
- Honest practice and scheduling history
- Offline data, backup and GitHub conflict safety
- External NAS media and device-local bases

## New assumptions

_none_

## Show me

Empty import ->39 historical lessons -> canonical item with correct source metadata and useful demo/score -> direct practice and open material -> repeat no-op -> fixture lesson40 delta -> same asset on Mac and iPhone -> actionable known exception, with no personal-material clutter or fabricated practice.


## Flows near this scope (understand before you change them)

# See and adjust the scheduling engine

_Works now · approved 2026-08-28T13:30:17.733Z by Ethan (signed)_

## Goal

Understand exactly why an item was recommended and a date chosen — and change the numbers if they do not suit you.

## Starts when

The musician follows 'Why this date?' from the close screen, or opens Settings → 'How scheduling works'.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** States the real priority formula and the spaced-repetition rungs in plain English, filled in with the values currently in force.
   - Shows: The priority terms, the current first/second/slip-reset gaps, and how importance and difficulty pull material sooner.

2. **The musician** Changes a value — a review gap, the warm-up or deep-work share of a plan, the shortest or longest review slot.
   - Shows: The explanation updates to the new numbers.
   - Changes: The settings are stored with the practice data, clamped to safe bounds; out-of-range input is never trusted.

3. **The musician** Closes a block or builds a plan afterwards.
   - Shows: Review dates and plan shapes computed with the adjusted values.
   - Changes: The same settings are used for the date previewed and the date saved.

4. **The musician** Taps 'Reset to recommended' whenever they want the original behaviour back.
   - Shows: 'Using the recommended defaults.'
   - Changes: The settings field is dropped, so the historical constants apply exactly.

## Ends with

The engine is understood and, if wanted, tuned — and it still produces the same date it showed.

## Variations

- **Never customised** — With no settings stored the defaults reproduce the original constants exactly, so old backups import unchanged. _(Works now)_
- **Per-item override** — An individual item can be set to a fixed cadence or to manual dates instead of automatic spaced repetition. _(Works now)_

## Rules

- Scheduling is deterministic and explainable — visible and adjustable, never magic.
- Bounds are enforced on every stored value.

## Involves

- The musician
- The spaced-repetition scheduler
- The plan builder

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

---

# Find something in my repertoire

_Works now · approved 2026-08-28T13:30:17.801Z by Ethan (signed)_

## Goal

See everything you play, grouped the way you think about it, and open the one you mean.

## Starts when

The musician opens Repertoire and picks one of the three views: Pathways, My repertoire, or Practice list.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Chooses 'My repertoire'.
   - Shows: Persian works grouped under their dastgāh — radif gushehs and composed maestro pieces side by side — and other instruments grouped by study source.
   - Changes: Nothing; this is a lens over ordinary items, not a separate store.

2. **Practice Compass** Folds dastgāh spelling variants together, labels each group with the user's own majority spelling, and keeps parts nested under their parent work.
   - Shows: Each work appears exactly once, however many sources, stages and lessons it is linked to.

3. **The musician** Optionally filters by form, or narrows to one instrument.
   - Shows: Form chips built from what is actually present.

4. **The musician** Or chooses 'Practice list' and filters by search, instrument, status, type, or a quick chip (due today, for class, fragile, neglected, overworked, teacher question).
   - Shows: Items in priority order, each with its status and stats.

5. **The musician** Opens an item.
   - Shows: Its page: status, connections, stats, result trend, recent blocks, parts, notes and files.
   - Changes: Nothing until an action is taken there.

## Ends with

The right piece is found and opened in a couple of taps, from whichever way of thinking about it came first.

## Variations

- **No dastgāh yet** — Works with Persian identity but no dastgāh sit in an explicit 'No dastgāh yet' group at the end. _(Works now)_
- **Technique stays out** — Drills and generic exercises are not works — they live in the Practice list only. _(Works now)_

## Rules

- 'My repertoire' is a derived lens, never a parallel database of pieces.
- Links never duplicate an item.
- Study sources stay simple: instrument, one clear name, kind, status, note.

## Involves

- The musician

---

# Add a practice item

_Works now · approved 2026-08-28T13:30:17.831Z by Ethan (signed)_

## Goal

Get a new piece, gusheh, étude, passage or technique into the app without breaking your concentration.

## Starts when

The musician wants to record something to work on — from Today, a stage, a lesson, the practice list, or the Start screen.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Types a title into the quick-add box and presses Add.
   - Shows: 'Added ✓' with an 'add details' link.
   - Changes: A practice item exists, with the instrument taken from context (stage's pathway, lesson, or the current session instrument) and sensible defaults for everything else. From a lesson it is linked to that lesson at the same time.

2. **The musician** Or chooses 'Add practice item' for the full one-step form.
   - Shows: A kind-first form: what you are adding (gusheh / composed piece / piece / étude / passage / technique), then only that kind's identity fields, then 'Connect it (optional)', then the first practice setup.

3. **The musician** Fills in identity, and optionally connects a study source (creatable inline), a pathway stage, a lesson and a parent work — all at creation.
   - Shows: Persian instruments are asked for dastgāh, gusheh, form and composer, with dastgāh and form offered as datalist suggestions; free text always wins.

4. **The musician** Saves.
   - Shows: The item's own page, with a 'Connected to' summary near the top.
   - Changes: One item, linked to whatever it belongs to — links never duplicate the item.

## Ends with

The thing to practise exists and can be started immediately; details can be filled in later, or never.

## Variations

- **Create while starting** — The Start screen's quick create takes a title only, then begins the block right away; a link opens the full form and returns with the item preselected. _(Works now)_
- **Edit later** — The same kind-first form is the item's inline edit, so nothing needs a second creation path. _(Works now)_

## Rules

- Exactly two creation paths, both one-step: title-only quick add, and the full kind-first form.
- No required field beyond a title.
- Free text is direction-aware so Farsi and English can be mixed anywhere.

## Involves

- The musician

---

# Deal with a due review

_Works now · approved 2026-08-28T13:30:17.861Z by Ethan (signed)_

## Goal

Handle material that is due to come back, without ever faking that it was practised.

## Starts when

Today lists 'Due reviews' for the session instrument — items whose review date has arrived.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Lists each due review with the item's title and how long it has been due, and hides any review dismissed earlier today.
   - Shows: A 'Due reviews' section with three actions per row and one line explaining what each does.

2. **The musician** Taps ▶ to practise it.
   - Shows: The active block, seeded from the item's status and focus.
   - Changes: Nothing yet — the review only completes when the block is closed.

3. **The musician** Or taps 'Not now'.
   - Shows: The row disappears for the rest of the day and returns tomorrow.
   - Changes: Only a per-day dismissal list in the app's session state — no review or item date is touched.

4. **The musician** Or taps '+2d' to genuinely move it.
   - Changes: The review's due date and the item's next review date both move to two days from today, so nothing is left showing overdue.

## Ends with

Either the item was actually practised (and spaced repetition advanced), or the schedule was moved honestly — never both, never neither.

## Variations

- **Snoozed from a stale date** — The new date is counted from today, not from the old overdue date, so a long-ignored review does not stay in the past. _(Works now)_

## Rules

- 'Not now' changes no schedule; snooze moves the real date on both the review and the item.
- No action may fabricate a practice result.

## Involves

- The musician
- The spaced-repetition scheduler

---

# Install the app and keep it current

_Works now · approved 2026-08-28T13:30:17.892Z by Ethan (signed)_

## Goal

Run the app installed on each device, practise with no network at all, and take new versions without ever reinstalling.

## Starts when

The musician opens the app's web address on a device and installs it to the home screen or dock.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Installs the app from its web address.
   - Shows: It opens like an app, full screen, with the navigation bar reaching the bottom of the phone.
   - Changes: The app's files are cached on the device; practice data stays in the device's own database.

2. **The musician** Practises with no network at all.
   - Shows: Everything works — recommendations, blocks, reviews, notes.
   - Changes: Nothing is special-cased for being offline; only syncing and opening NAS files need a network.

3. **Practice Compass** Checks for a new build every hour and whenever the app is brought back to the foreground.
   - Shows: A calm 'A new version is ready.' banner with a Reload button — never an automatic reload in the middle of a session.
   - Changes: Nothing until the musician chooses to reload.

4. **The musician** Taps Reload when it suits them.
   - Shows: The app restarts on the new version; Settings shows the build it is running.
   - Changes: Nothing in the practice data — an update replaces code, never data.

## Ends with

Both devices run the current version, neither needed reinstalling, and neither needs a network to practise.

## Variations

- **Offline when a check is due** — The check simply does nothing and tries again later — no error, no interruption. _(Works now)_
- **Not now** — Ignoring the banner keeps the current version running for as long as the musician likes; the offer comes back. _(Works now)_

## Rules

- Reinstalling is never the update path.
- An update never interrupts a running block — the reload is always the musician's choice.
- Every core flow works with no network.

## Involves

- The musician

---

# Log a class and its follow-up work

_Works now · approved 2026-08-28T13:30:17.922Z by Ethan (signed)_

## Goal

Record a lesson, write up what was said after rewatching it, and turn it into concrete work before the next one.

## Starts when

The musician taps 'Add a class' on the Lessons screen for one instrument.

## Needs first

- At least one instrument exists

## Steps

1. **The musician** Accepts the pre-filled class number and picks the date.
   - Shows: The class appears as 'Class N · date', newest first, with 'upcoming' while it is still ahead.
   - Changes: A Lesson is stored for that instrument; the number is optional and editable.

2. **The musician** Rewatches the class and types the notes, in Farsi or English.
   - Shows: A direction-aware notes field; the list shows 'notes ✓' once there is text.
   - Changes: Notes are saved when the field loses focus.

3. **The musician** Adds a link to the class recording and to any scores — a NAS path or a full https link.
   - Shows: The links listed video-first, then PDFs and documents, each with its kind icon and 'Stored on NAS'.
   - Changes: Only a reference (title, path, kind, notes) is stored — never the file itself.

4. **The musician** Taps 'Open' on a link.
   - Shows: The file opens in a new tab, resolved against the NAS base URL from Settings.
   - Changes: Nothing is stored or downloaded into the app; removing a link never touches the NAS file.
   - Only if: A NAS base URL is set in Settings and the NAS is reachable from this device

5. **The musician** Links or quick-adds the practice items that came out of the class, and flags the ones to be ready for next time.
   - Shows: Each linked item with its status and a 'For next class' toggle.
   - Changes: The lesson keeps a link to the item (never ownership — unlinking keeps the item); a flagged item gains a priority boost that climbs as that instrument's next class approaches.

6. **The musician** Optionally attaches small hand-outs (a PDF, a photo, a short audio).
   - Shows: Files over 10 MB and any video are warned about; over 40 MB is refused with a clear message.
   - Changes: Small blobs are stored on the device and travel with backups and sync.

## Ends with

The class is on record, its material is real practice items, and the work due before the next class is prioritised automatically.

## Variations

- **No NAS base URL yet** — The link shows 'Set your NAS base URL in Settings to open this' and the Open button stays disabled — never a broken link. _(Works now)_
- **Invalid base URL** — An unparseable base is reported as such and nothing is opened, rather than resolving to a wrong in-app address. _(Works now)_
- **Import the Setar class history** — Settings → 'Import Setar classes' adds the logged sessions as lessons with their recording and score links, additively and idempotently, backfilling refs missing from classes already imported. _(Works now)_
- **Wide screen** — At 1000px and above the class list sits beside the open class, giving long Farsi notes real room. _(Works now)_

## Rules

- Class videos and scores are references to the user's NAS, never bytes in the app, sync or backups.
- A lesson link to an item is a link, never ownership.
- The next class is the one sanctioned deadline — per instrument, never guilt-toned.

## Involves

- The musician
- The teacher (indirectly)
- The NAS

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

---

# Practise what the app suggests

_Works now · approved 2026-08-31T22:05:26.192Z by owner (signed)_

## Goal

Practise the one thing the app suggests next and leave an honest record of how it went.

## Starts when

The musician opens Today, picks the instrument they are practising, and sees a single 'Practise now' card.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Taps their instrument in the switcher at the top of Today.
   - Shows: Everything below is scoped to that instrument: recommendation, class work, due reviews, pathway position.
   - Changes: The chosen instrument is remembered as the session instrument.

2. **Practice Compass** Scores every item of that instrument and shows the best one with a one-sentence reason.
   - Shows: One 'Practise now' card above the fold, plus up to two quieter 'then, if you have time' suggestions.

3. **The musician** Taps 'Start · 10 min'.
   - Shows: The active block screen: item title, mode and focus chips, a running ring timer.
   - Changes: A practice block is opened in memory with mode, focus and a 10-minute target derived from the item.

4. **The musician** Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
   - Shows: The elapsed clock, and the item's notes and current problem on request. While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake (best-effort; feature-detected; never affects elapsed time) so the clock stays readable without touching anything; pausing, finishing, discarding or navigating away releases it, and the phone sleeps normally again.
   - Changes: Elapsed seconds accumulate only while the timer runs.

5. **The musician** Taps 'Finish'.
   - Shows: The close screen, with the minutes already filled in.
   - Changes: The clock is frozen first, so reflection time is not counted as practice.

6. **The musician** Picks one of the six results, optionally adds an observation, a next action, a body note or a teacher question, and accepts or declines the suggested status and review date.
   - Shows: A preview of the next review date with the plain reason behind it, and a 'Why this date?' link.

7. **The musician** Taps 'Save block'.
   - Shows: Back to Today (or to the running plan), with the item's stats and status updated.
   - Changes: A PracticeBlock is stored; the item's counters, status, saturation flag and spaced-repetition state advance; any open review for the item is completed and the next one is scheduled on the date that was shown.

## Ends with

The session is recorded honestly: one block, one result, one next action — and the item knows when it should come back.

## Variations

- **Choose something else** — From 'Choose something else to practise…' the Start screen takes instrument → item → mode/focus/duration, with a title-only quick create for something that does not exist yet. _(Works now)_
- **Start from an item or a stage** — 'Start a block' on an item, or ▶ on a pathway stage row, opens the same block with defaults taken from the item's status and focus. _(Works now)_
- **Discard** — 'Discard block' (during) or 'Discard without saving' (at close) throws the block away — nothing is logged and no schedule moves. _(Works now)_
- **Target reached** — When elapsed reaches the block's target, the ring's silent saturation is replaced by a durable 'Target reached' state plus a growing overtime figure (elapsed minus target) — announced once, never once per render. The block does NOT auto-finish — practising past the target stays ordinary, and only Finish or Discard ends it. Whether the screen-wake-lock or the accompanying sound/vibration cue succeeds, fails or is unsupported never changes the elapsed time or the minutes eventually saved. _(Works now)_

## Rules

- Starting a block must stay under 30 seconds and closing one under 60 seconds; a title is the only required field.
- Practising is the only thing that completes a review and advances spaced repetition.
- The review date shown before saving is exactly the date saved.
- A recorded minute is never affected by whether the screen-wake-lock, sound or vibration succeeded — only the wall clock decides elapsed time.

## Involves

- The musician
- The recommendation engine
- The spaced-repetition scheduler

---

# Take questions and a summary to class

_Works now · approved 2026-08-28T13:30:18.013Z by Ethan (signed)_

## Goal

Arrive at the lesson with the questions that came up while practising, and a short honest account of the period.

## Starts when

A question is written on an item (at close, or by editing it) while it is flagged for the next class.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Collects every item for that instrument that is both flagged for the next class and carries a question, ordered with the Persian collator.
   - Shows: A 'Questions for your next class' list on the upcoming lesson and on the Teacher report.

2. **The musician** Copies, downloads or prints the questions.
   - Shows: A numbered plain-text export that preserves mixed Farsi and English, or a friendly empty state when there are none.

3. **The musician** Opens the Teacher report and picks the instrument and a date range (last two weeks by default).
   - Shows: A copyable summary of what was practised, how it went and what is open.

4. **The musician** Taps 'Copy report'.
   - Shows: 'Copied ✓'.
   - Changes: Nothing in the data — the report is generated on the spot.

## Ends with

The musician walks into the lesson with their real questions and a truthful summary, without having kept a separate notebook.

## Variations

- **A question survives practice** — Practising never clears a question — only editing the item removes it. _(Works now)_

## Rules

- A question is never auto-cleared by practising.
- Reports state what happened; they never grade.

## Involves

- The musician
- The teacher

---

# Run a time-budgeted session

_Works now · approved 2026-08-31T22:05:33.129Z by owner (signed)_

## Goal

Turn the minutes actually available into an ordered session, then practise it block by block.

## Starts when

The musician taps 'Plan this session' on Today and chooses a length (15, 20, 30, 45 or 60 minutes).

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Builds a plan from the same priority numbers the recommendation uses, laid out as warm-up, class work, review, focus and cool-down segments.
   - Shows: The plan preview: each segment with its minutes, bucket, item and a one-sentence reason, and a total that always equals the chosen budget.

2. **The musician** Swaps, removes or regenerates segments until the shape looks right.
   - Shows: The remaining minutes are redistributed immediately so the total still equals the budget.
   - Changes: Only a local copy of the plan — nothing is saved yet.

3. **The musician** Taps 'Start plan'.
   - Shows: The runner: the whole list with the current segment highlighted.
   - Changes: The running plan is held in app state (never in the database, never synced), and the chosen length is remembered for this instrument.

4. **The musician** Taps 'Start' on the current segment.
   - Shows: The ordinary active-block screen, with the segment's minutes as the target — identical behaviour to an unplanned block, including the screen staying awake while it runs and is visible, and a durable 'Target reached' state with a growing overtime figure if the segment runs past its minutes without the musician tapping Finish.
   - Changes: A real practice block opens for that segment's item.

5. **The musician** Finishes and saves the block as usual.
   - Shows: Back on the plan, that segment reads 'done' and the pointer moves to the next one.
   - Changes: The block, item stats and review schedule update exactly as in an unplanned block.

6. **The musician** Skips anything they do not want, or ends the plan at any time.
   - Shows: 'Session complete' once the last segment is passed.
   - Changes: A skipped segment logs nothing at all; ending the plan discards it and leaves every logged block untouched.

## Ends with

The available time was spent on real, logged practice in a sensible order — and the plan itself leaves no trace in the data.

## Variations

- **Nothing to plan** — With no items for the instrument the plan is empty and says so rather than inventing filler. _(Works now)_
- **Everything already practised today** — A plan is still produced, and the summary says plainly that everything has been practised today. _(Works now)_
- **Resume** — While a plan runs, Today's card becomes 'Resume your plan' with the count of finished segments. _(Works now)_

## Rules

- Segment minutes always sum to the chosen budget.
- A plan is a view over real practice blocks — it is not a countdown and it is never persisted as data.
- No scores, no 'optimal session' claims.

## Involves

- The musician
- The plan builder
- The recommendation engine

---

# See how practice is actually going

_Works now · approved 2026-08-28T13:30:18.074Z by Ethan (signed)_

## Goal

Get a calm, neutral read on the last week or month across everything you play.

## Starts when

The musician taps 'Overview' on Today, or opens More → Insights.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Taps 'Overview' in the instrument switcher.
   - Shows: Each instrument with its next suggestion and next class, one insight of the day, and a balance bar for the last 7 days.
   - Changes: The session instrument is set to 'all' — a deliberate, secondary choice, never the default.

2. **The musician** Taps an instrument to drop back into a real session for it.
   - Shows: Today, scoped to that instrument again.
   - Changes: The session instrument is set.

3. **The musician** Opens Insights and switches the window between 7 and 30 days.
   - Shows: Neutral observations generated from the logged blocks — patterns, not a scoreboard, and an honest empty state when there is not enough history.

## Ends with

The musician knows where their time actually went, with no streaks, scores or judgement attached.

## Variations

_none_

## Rules

- No gamification: no streaks, points, badges or fabricated mastery percentages.
- Insights are neutral observations, never nags.
- Future-dated blocks never leak into a window that looks backwards.

## Involves

- The musician

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

---

# Work through a pathway stage

_Works now · approved 2026-08-31T22:05:33.178Z by owner (signed)_

## Goal

Follow a route you trust — see where you are, take the next suggestion into your own items, and practise it.

## Starts when

From Repertoire → Pathways (or the 'Now in:' card on Today) the musician opens a pathway and then a stage.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Shows the stage's rows: your own items laid over the stage's reference catalogue, with progress derived from item status.
   - Shows: A progress bar reading 'n/m solid', guided routines if any, and one line of metadata per row — greyed rows are labelled reference suggestions.

2. **The musician** Taps + on a suggestion.
   - Shows: The row becomes a real item, honestly marked 'Not practised yet', with a lingering Undo card.
   - Changes: A practice item is created from the catalogue entry, carrying its stable catalogue key — adding is organisation, not progress.

3. **The musician** Undoes it, or removes it later from the row's − button, if it was added by mistake.
   - Shows: The row reverts to a suggestion.
   - Changes: The item is deleted only while it is provably untouched (catalogue item, still 'not practised', zero blocks); the check is re-run against live data, so anything practised is kept.

4. **The musician** Taps ▶ on a row to practise it.
   - Shows: The ordinary active block.
   - Changes: A suggestion not yet added is added first, then the block opens.

5. **The musician** Optionally pins the stage as the current one, or edits its code, title and intro.
   - Shows: Today's 'Now in:' card points at the pinned stage.
   - Changes: The pathway records the pinned stage; deleting a stage detaches items instead of deleting them.

## Ends with

The next piece of the route is now a real practice item with real practice behind it, and the stage's progress reflects it honestly.

## Variations

- **Teacher jumps around** — A pinned current stage always beats 'first incomplete stage', because teacher-led work does not go in order. _(Works now)_
- **Guided routine** — A stage routine runs as a segmented warm-up countdown. A segment bound to a real item creates an honest PracticeBlock when the run finishes (result stays 'not_logged', so no review completes and no spaced-repetition state advances — the practice itself IS recorded); a segment with no bound item is pure warm-up and logs nothing at all. While the run is genuinely active and its screen is visible, the app keeps the display awake, and arriving at a new segment is visibly announced — once, and staying perceptible for a few seconds, never a single-render flash. _(Works now)_
- **Off-catalogue items** — Anything quick-added inside the stage appears in the same list and in recommendations. _(Works now)_

## Rules

- The item is the only unit of work — a pathway is a view over items, never a parallel to-do list.
- The catalogue is reference data in code, labelled as an aid, never a fixed syllabus.
- Adding from the catalogue is losslessly reversible until the moment it is practised.
- A routine records at most one PracticeBlock per distinct bound item per run, never one per segment repeat.

## Involves

- The musician
- The pathway catalogue


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

Turn the Setar archive into trusted lessons and useful practice material

## Stay in scope — you may ONLY change

- scripts/scan-setar-classes.mjs
- scripts/publish-setar-index.mjs
- scripts/run-setar-index.sh
- scripts/setar-index.test.mjs
- src/domain/types.ts
- src/domain/migrations.ts
- src/domain/migrations.test.ts
- src/domain/io.ts
- src/domain/io.test.ts
- src/domain/seed.ts
- src/domain/seedMigration.test.ts
- src/domain/index.ts
- src/domain/factories.ts
- src/domain/setarClasses.ts
- src/domain/setarClasses.test.ts
- src/domain/scanSetarClasses.test.ts
- src/domain/recordings.ts
- src/domain/recordings.test.ts
- src/domain/itemFiles.ts
- src/domain/itemFiles.test.ts
- src/domain/selectors.ts
- src/domain/selectors.test.ts
- src/domain/lessonAgenda.ts
- src/domain/lessonAgenda.test.ts
- src/domain/repertoire.ts
- src/domain/repertoire.test.ts
- src/domain/sourceArchive.ts
- src/domain/sourceArchive.test.ts
- src/domain/sourceReconcile.ts
- src/domain/sourceReconcile.test.ts
- src/store/useStore.ts
- src/store/backup.ts
- src/store/archiveIndex.ts
- src/store/archiveIndex.test.ts
- src/components/ItemMaterial.tsx
- src/components/ItemNotes.tsx
- src/components/LessonNotes.tsx
- src/components/ArchiveRefresh.tsx
- src/components/ReferenceEditor.tsx
- src/components/direction.test.ts
- src/pages/Settings.tsx
- src/pages/Lessons.tsx
- src/pages/ItemDetail.tsx
- src/pages/ActiveBlock.tsx
- src/pages/Repertoire.tsx
- src/pages/StartBlock.tsx
- src/styles/global.css
- tests/practiceBrowser.ts
- tests/setarArchive.browser.test.ts
- tests/setarInbound.browser.test.ts
- tests/lessonNotes.browser.test.ts
- tests/fixtures/setar-archive.json
- tests/fixtures/setar-legacy-v13.json
- package.json
- AGENTS.md
- DECISIONS.md
- FUTURE.md
- README.md
- docs/product-spec.md
- docs/setar-archive.md

Never touch:

- src/domain/scheduling.ts
- src/domain/scoring.ts
- src/domain/recommend.ts
- src/domain/plan.ts
- src/domain/practiceSession.ts
- src/domain/practiceSignal.ts
- src/components/screenAwake.ts
- src/components/useScreenAwake.ts
- src/components/useViewportGuard.ts
- src/components/Layout.tsx
- src/pages/CloseBlock.tsx
- src/store/githubSync.ts
- src/store/syncEngine.ts
- src/store/gitRemote.ts
- src/store/revision.ts
- src/store/idb.ts
- vite.config.ts
- package-lock.json
- .github/**
- public/**
- src/domain/persian.ts
- src/domain/farsi.ts
- src/domain/pathwaySeed.ts
- Never write, rename, move or delete Setar/Tar/Guitar source files, including CSVs; fixtures and outputs live outside archives. No source or NAS configuration is changed during this planning turn.
- Preserve blocks, minutes, Results, all scheduling/SM2/review evidence, counts and streak semantics. Archive appearances are not recorded Practice Compass practice.
- Preserve core loop, quick Start/Close, Active timer/wake-lock, running/paused practice, session plans/routines, instrument scoping, working-text homes, manual review dates and lesson-agenda/question semantics.
- Preserve existing local attachments, full/state backup byte guarantees, refused hydration recovery, snapshot sync conflicts/archives and revision guards. No live owner-data writes in automated tests.
- Keep practice core usable offline with last accepted metadata. Source refresh and external media may need their respective networks without blocking practice.
- No fuzzy matching/transliteration, automatic piece splitting, AI/audio judgement, gamification, paid service, speculative plugin system or public full archive index.
- Full Tar/Guitar import, archive normalisation/renaming, generic adapters/plugins and media segmentation.
- iPhone keyboard/bottom-nav changes without a reproduced diagnosis; no heuristic hide/delay workaround.
- Scheduling/session planning/routine redesign, broader duplicate sweep unrelated to source graph, sync engine rewrite, all-purpose library migration or UI redesign.
- Public index publication, NAS browser HTML crawler, permanent TLS bypass, new backend/API or bulk NAS attachment imports.
- Already-shipped working-text retirement, attachment integrity, manual-date/SM2, current session recovery and browser CI fixes.
- Desired rule (not yet truth): Archive evidence may establish repertoire membership, historical lesson provenance and source material, never recorded practice, results, exposure, review completion or scheduling progress.
- Desired rule (not yet truth): Source identity is archive-relative and independent of transport; refresh preserves owner-authored data and explicit reconciliation/suppression decisions across every inbound boundary.
- Desired rule (not yet truth): Browser GitHub credentials and media bases stay device-local; the separately scoped archive publisher credential stays in protected NAS operator configuration. No credential or device base enters source archives, committed files, manifests, app data, logs, sync or backups.

## Definition of done

- **ac-1** — Use real PIECES.csv rows including quoted commas, doubled quotes, aliases, provisional and MEDIUM caveats. Preserve canonical_fa byte identity, embedded digits and -و-. Reject duplicate/empty canonical keys, malformed quoting, missing headers, invalid session numbers and unknown manifest versions. aliases_seen is literal search data, never a wildcard or reconciliation heuristic; real forms هفت-ضربی and چهارپاره are supported without inventing categorical facts. → proven by `setar registry keeps exact Farsi keys and rejects ambiguous CSV input`
- **ac-2** — Assert all seven real brief examples exactly, role boundary longest match, parts numeric, the embedded دشتی-1-علیزاده digit and پریچهر-و-پریزاد stay inside one canonical name. Known session16 video exception produces actionable diagnostic and no guessed role. Unknown piece/role/ext and named class recordings are surfaced, not relabelled. No largest-file heuristic. → proven by `setar filenames preserve compound roles and report unhandled assets`
- **ac-3** — Session13 unnamed two-part demo belongs to all eight canonical pieces; session28 named demo only به-زندان-شوشتری and no fabricated class recording; session27 class parts ordered numerically. Folder membership rather than mtime. Provisional session7 and34/35 preserved. Six-session personal repeat chain22..27 is provenance, never six weeks or practice evidence. On roster disagreement do not expand unnamed demos to a guessed set. → proven by `setar session material follows exact roster and demonstration attribution`
- **ac-4** — Deterministic filesystem inventory fixture, shuffled directory order and altered mtimes yield same semantic index. Numeric session order9 before10. Ignore dotfiles/root out-of-scope folders/NAS @eaDir; do not follow symlinks or unsafe relative paths. Reject traversal, escaped separators, URL schemes, duplicate asset/session identities and oversize inputs. Missing root or changed registry/inventory during scan does not replace last good output. Output is atomically published outside archive; no source write API. → proven by `setar scanning is bounded read-only and produces stable complete indexes`
- **ac-5** — Transport stub exercises first index publish, identical scan no commit, changed scan, interruption before ref advance, race with second publisher. All writes confined to designated source-index branch; never state.json, manifest.json or files/ on data main or archive/ recovery branches. Reader pins file fetch to the read branch commit. Authentication/network errors leave old index and app data intact; no token/root URL in payloads or logs. Publisher target branch is fixed source-index and path setar/index.json. Token is scoped to this private repository with only required Contents write and metadata read, no workflow/admin permission; GitHub does not make such a token branch-scoped, so code target restrictions and optional repository rules must not be described as credential isolation. App reuses its existing local GitHub connection only for GETs; no publisher token reaches the browser. Unchanged content means no commit; UI says index last changed/fetched, never falsely last scanned. → proven by `source index publication cannot replace practice data or lose a concurrent update`
- **ac-6** — First empty import produces39 historical lessons94 canonical items; repeat no duplicates. Existing source bindings win across edited titles/dates. Unique legacy lesson with exact source-reference evidence/date+number can be adopted; date-only, number-only or title-only equivalence cannot auto-merge. Exact manual title/alias candidates require owner Link/Create/Skip; multiple candidates do not pick first. Existing upcoming class38 on2026-09-27 survives separate from archive38 on2026-08-04. catalogKey iraq never equals Setar canonical key عراق. Source/instrument binding explicit and persistent. Deterministic namespaced IDs on new records ensure two devices importing the same source separately identify the same logical entities, while existing owner records retain their IDs after explicit binding. Whole-snapshot GitHub conflicts still require the existing owner choice; no automatic merge of divergent practice databases. → proven by `setar reconciliation binds exact identities without merging owner records`
- **ac-7** — Exercise one newlesson40, added score existinglesson, changed registry metadata, exact logged path rename, missing file, missing registry row, unresolved previous candidates and same manifest with a new owner decision. Source metadata/availability updates; item/lesson authored fields seeded once then preserved including deliberate empty values. Later metadata improvement shown for explicit selective apply, never notes overwrite. Missing source retains provenance and flags unavailable, never deletes owner data. Unchanged refresh does not bump db revision or churn timestamps. A canonical key change is a new identity requiring owner decision, never inferred from metadata; exact asset rename chains alone may preserve an asset identity. Missing files only follow a validated complete scan, not timeout, partially copied input or unreachable mount. → proven by `archive refresh preserves owner edits and applies only the new source delta`
- **ac-8** — Actual mutation actions deleteItem, removeCatalogItem, deleteLesson, unlinkItemFromLesson, remove manual ref and hide imported material update only applicable suppression/binding in same store mutation. Retry identical source after reload/sync cannot resurrect deliberately suppressed record/link. Shared demo hidden for one item remains available to others. Moving an archive-bound item to another instrument refuses or explicitly detaches before mutation; no invalid graph emitted. Clear/reset remove source state with DB. Partial/imported dangling bindings refused instead of duplicate healing. → proven by `archive deletions and unlinking remain respected after refresh and reload`
- **ac-9** — Compare complete pre/post blocks,reviews,lessonAgenda,existing item counters/results/all scheduling fields,active+routine+plan,notNow and sessionInstrument. New items have zero totals,no lastPractice/result/review/SM2; source personal files create only membership/roles/repeat provenance. No new material/agenda/pathway commitments inferred. New library items start resting by explicit import policy so Today/plan pools are not flooded, yet direct Start works. No personal recordings in item/active material. → proven by `archive import cannot fabricate practice or next-class urgency`
- **ac-10** — One shared upcoming predicate used by nextLessonFor,nextLessonDates,defaultTargetLesson,preparationDatesByItem and wide/mobile Lessons badges/default selection/question sheet. Test source historical lesson dated past/today/future versus ordinary real upcoming lesson on same dates; imported historical records never create urgency/default question target. Preserve existing manually authored agenda and normal upcoming lesson semantics. → proven by `historical source lessons never become upcoming through sibling selectors`
- **ac-11** — Real store action with controlled persistence: validate and prepare before a single db set; no per-file app commits/no blob copying. Revision change, source change, owner-choice change, active session starting and finishing during fetch cause rebase/repreview or refusal without lost edits. IndexedDB failed save reports unsaved and retry persists complete current state even if in-memory index hash already matches; no false Already current. Reload before/after acknowledgement yields previous complete or new complete state. Refresh never calls whole-DB import/reset. → proven by `archive commits survive interruption and never apply a stale preview`
- **ac-12** — All67 legacy seed paths map through exact257-row RENAME-LOG, no fuzzy URL/title/mtime matching. Full URL converts only under explicitly verified current device prefix with segment-wise decode; foreign/query/fragment links remain untouched. Old/current pairs for session1 classpart1 and firstDashti score show one physical resource without deleting either authored row/notes. Existing3 personal references remain retained historical links outside item/active list. Missing targets/cycles/multiple destinations diagnose, never guess. → proven by `exact Setar rename repair preserves saved references and their metadata`
- **ac-13** — One shared composition for ItemDetail/Active and new direct item links plus lesson composition. Corrections prominent but clean scores retained; logical demo ordered parts one group; resources from earlier repeat-chain lessons remain reachable; named scores/demo never bleed to sibling pieces; whole class video stays lesson-only. Existing manual unclassified lesson references remain accessible without inventing scope. Direct NAS link works without any lesson and uses same resolver as legacy/source refs. External links never go through attachment blob APIs. → proven by `practice material shows only useful correctly scoped archive resources`
- **ac-14** — Same sourceId+relative asset resolves via independently configured Mac/iPhone roots and a changed future base; stored data/export/hash unchanged. Config device-local, never synced. Preserve base path prefixes; reject unsafe path/scheme/traversal/credentials and double-encoded separators; encode each raw Farsi segment once. Root/index capability check never relies on a media filename. Distinguish readable published index from unverified media reachability; do not claim CORS/cert/network failures are absence. → proven by `source transport changes preserve archive identity and encode Farsi once`
- **ac-15** — v13->v14 additive empty-source migration with source keys/manual refs/history marker as chosen representation; legacy baseline fields unchanged apart from schema. Run whole oldest-supported chain, repeated migration and current-declared inbound. validateDB retains/validates every new persisted field with duplicate source keys, wrong types, dangling/mismatched refs,wrong instrument,unsafe paths,unknown format/newer schema refused before mutation. Missing source file is valid unavailable state, not dangling graph. Successful output revalidates and roundtrips export unchanged. New collection is included in validateDB's reconstructed return value, not merely accepted on input. Legacy current-version stray fields do not bypass validation. Reject duplicate bindings and resource graph cycles/invalid part group membership. Preserve surviving practice text and attachment guarantees. → proven by `archive schema migration and validation preserve the whole source graph`
- **ac-16** — Use existing browser/fakeGitHub harness to drive Settings full/state import, automatic pull, Keep remote, archive restore, both hydration branches and cold-start recovery. Same malformed source relation rejected with pre/post persisted DB+blobs checked; valid source bindings/suppressions/user fields survive. Existing active/revision guards retained. Full export includes metadata only for NAS refs and only real local attachment bytes. Real baseline v13 checkout refuses v14 file without writes; retained v13 backup restores there. No format2 sync-engine rewrite. → proven by `archive state crosses all real inbound doors without partial installation`
- **ac-17** — Reproduce current empty-save bug through real editor and store then verify fixed reload. Reuse current ItemNotes durability model: explicit Done, preserved unsaved draft on refresh, tagged lesson ID, storage acknowledgement before Saved, failed-write retry/copy, typing during pending write, latest-save ownership, item/lesson switch and route unmount. Existing Working notes/Observation/Next time and timers remain unchanged. → proven by `lesson notes can be cleared and saved durably without cross-lesson drafts`
- **ac-18** — Rendered controls with frozen time and checked-in corpus-derived metadata fixture. Refresh -> historical lesson -> proper class/score/demo -> canonical item -> useful material -> direct Start -> open material with practice context unchanged. Historical phone rows initially compact/collapsed, Farsi wraps and mixed labels isolate correctly, keyboard controls and accessible names present. Alias search works in Repertoire and Start through existing Farsi matcher; identity matching never uses it. Repeat refresh then add fixturelesson40 only delta; invalid file actionable; persisted reload verifies no duplicates/history fabrication. Both engines mandatory; missing engine fails, not skip. → proven by `setar archive journey works on phone and desktop in Chromium and WebKit`
- **ac-19** — Actual corpus read-only: baseline39/258/257/1/94 with125personal and132useful files, 37logical demos; all CSV+inventory hashes recorded. Verify known exception/session28/provisional rows and full rename coverage. Future lesson delta tested with disposable fixture outside Sandisk, not a mutation of source archive. Publisher runtime/location and scheduling must be installed and exercised, not left as a runbook-only hidden prerequisite. Primary production host is the NAS, explicitly approved by OWNER: install supported Node runtime and a DSM scheduled task (default every15 minutes), read-only source permissions and restricted separate runtime/output directory. Provision publisher-only repository-scoped credentials outside app data and verify unattended run with Mac off. Verify main branch unchanged after index publication; revocation and failed scan retain last good index. Record actual NAS filesystem mapping/runtime rather than assuming /Volumes paths work there. → proven by `manual:OWNER`
- **ac-20** — Real Mac and iPhone journey using archive bases https://192.168.0.20:5010/setar-classes/ and OWNER-provided https://ds220plus.taild1d1f7.ts.net/media/setar-classes/. Verify same Farsi demo and score open, video range/seek works, changing base changes no source IDs or backup data. iPhone path is owner-confirmed mapping awaiting device playback verification, not a Mac-probed fact. Mac requires no Tailscale. Do not disable certificate validation in shipped code. Show published-index retrieval separately from media access; unavailable NAS or GitHub preserves imported material metadata. Never mark iPhone passed from LAN-only/emulated tests. → proven by `manual:OWNER`

## Docs to update as part of this change

- AGENTS.md
- DECISIONS.md
- FUTURE.md
- README.md
- docs/product-spec.md
- docs/setar-archive.md

## Recommended skills (quality only — never gates)

- **ui-work** — visual / front-end work — layout, styling, interaction — _(use your agent’s equivalent)_
- **build** — implementing the change against the contract — _(use your agent’s equivalent)_
- **simplify** — reducing risk by simplifying the change — _(use your agent’s equivalent)_

## Current progress

Not started — no checks have run yet. Default state is "not ready".

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

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.

