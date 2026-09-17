---
id: 20260917-turn-the-setar-archive-into-trusted-less-5614
title: Turn the Setar archive into trusted lessons and useful practice material
state: open
checks:
  - id: ac-1
    description: Use real PIECES.csv rows including quoted commas, doubled quotes,
      aliases, provisional and MEDIUM caveats. Preserve canonical_fa byte
      identity, embedded digits and -و-. Reject duplicate/empty canonical keys,
      malformed quoting, missing headers, invalid session numbers and unknown
      manifest versions. aliases_seen is literal search data, never a wildcard
      or reconciliation heuristic; real forms هفت-ضربی and چهارپاره are
      supported without inventing categorical facts.
    status: unproven
  - id: ac-2
    description: Assert all seven real brief examples exactly, role boundary longest
      match, parts numeric, the embedded دشتی-1-علیزاده digit and
      پریچهر-و-پریزاد stay inside one canonical name. Known session16 video
      exception produces actionable diagnostic and no guessed role. Unknown
      piece/role/ext and named class recordings are surfaced, not relabelled. No
      largest-file heuristic.
    status: unproven
  - id: ac-3
    description: Session13 unnamed two-part demo belongs to all eight canonical
      pieces; session28 named demo only به-زندان-شوشتری and no fabricated class
      recording; session27 class parts ordered numerically. Folder membership
      rather than mtime. Provisional session7 and34/35 preserved. Six-session
      personal repeat chain22..27 is provenance, never six weeks or practice
      evidence. On roster disagreement do not expand unnamed demos to a guessed
      set.
    status: unproven
  - id: ac-4
    description: Deterministic filesystem inventory fixture, shuffled directory
      order and altered mtimes yield same semantic index. Numeric session order9
      before10. Ignore dotfiles/root out-of-scope folders/NAS @eaDir; do not
      follow symlinks or unsafe relative paths. Reject traversal, escaped
      separators, URL schemes, duplicate asset/session identities and oversize
      inputs. Missing root or changed registry/inventory during scan does not
      replace last good output. Output is atomically published outside archive;
      no source write API.
    status: unproven
createdAt: 2026-09-17T00:51:16.586Z
---

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

