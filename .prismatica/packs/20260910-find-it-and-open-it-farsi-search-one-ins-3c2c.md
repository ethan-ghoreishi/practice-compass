---
id: 20260910-find-it-and-open-it-farsi-search-one-ins-3c2c
contractId: 20260910-find-it-and-open-it-farsi-search-one-ins-3c2c
contractHash: 2e1efb65bce711515a24d29306c32b6a8245fc71f4381f079ef35fc5d04c0bc6
createdAt: 2026-09-11T11:00:49.137Z
skills:
  - ui-work
  - build
  - simplify
---

# Build brief: Find it and open it: Farsi search, one instrument in view, and every file already linked to a piece

> This brief is scoped and self-contained. A fresh session can resume from it
> alone. Prismatica will check your work deterministically — it never reads this
> chat, only Git and your tests.

- **Linked issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/18
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Work in the lane:** /Users/Ehsan/workspace/active/practice-compass-lanes/20260910-find-it-and-open-it-farsi-search-one-ins-3c2c

## The plan the owner approved

This is the complete approved proposal, verbatim. `assumptions` and
`possibleConflicts` are the Planner's advisory reading — treat them as leads to
verify against the code, never as established fact.

````yaml
# Approved intent: Find it and open it: Farsi search, one instrument in view, and every file already linked to a piece

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** existing-flow
- **Risk tier:** heavy
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> Plan the next Practice Compass lane from current main, now that the 'every recorded minute' lane has shipped. Verify current behaviour first rather than re-planning work the review catalogue lists but that is already fixed.
> 
> I again want a reasonably WIDE but genuinely COHERENT change, not a collection of unrelated small fixes -- optimised for day-to-day usefulness, correctness and data safety, shared files and invariants, low ongoing admin, clean acceptance boundaries, reviewer comprehensibility and easy rollback. A promising direction is reducing the friction between 'I want to practise something' and 'I can find and open the material I need'.
> 
> Decisions I confirmed while we planned this:
> - NAS: go broadly with the low-risk browsable-link option, but INSPECT the current NAS setup before fixing the approach. On my MacBook I reach the NAS at https://192.168.0.20:5010 and believe I have some web/file server configured on the Synology. Do not assume Tailscale Serve is the current mechanism just because older docs say so. If direct LAN access is simpler and more reliable, prefer it; I am also happy to install Tailscale on the Mac if that genuinely gives a better long-term setup. At minimum I want to stop having to remember and type NAS paths manually.
> - Also investigate whether a practice item can conveniently reference or select NAS material rather than only local attachments. Treat that as a suggestion, not a requirement: look first for a cheap solution using the existing reference/lesson model. If proper item-level NAS references need a schema change or materially widen the lane, leave that as a clearly defined follow-on.
> - During practice: images inline plus explicit open actions for everything else. Do not turn ActiveBlock into a dashboard and do not touch timer or wake-lock behaviour.
> - Instrument context: Repertoire and Lessons should default to the session instrument, keeping a visible override so cross-instrument browsing survives.
> - Builder: claude.
> 
> Preserve the product principles: local-first and fully useful offline, no backend or paid service, no gamification, no AI or audio judgement, one coherent instrument/session context, deterministic and explainable scheduling, no silent data loss, large media stays on the NAS rather than entering backups or sync, Active practice stays calm and focused, and NAS/viewer concerns must not change timer or wake-lock semantics. Avoid schema changes unless their value clearly justifies heavy-tier ceremony, and do not widen the lane simply to consume more review findings. Be alert to dev-versus-production CSP behaviour if any file viewing or browsing is involved.
> 
> Added before import: I made an owner-approved cleanup/compaction of the repository's agent/documentation files using a dedicated Claude skill. Prismatica correctly blocked pushing it straight to main as a non-record change, so the exact commit is preserved on the local branch backup/docs-trim-20260910 and main is reset cleanly to origin/main. Fold that cleanup into THIS lane rather than creating a separate documentation lane.
> Treat those edits as owner-supplied PROPOSED changes, not as instructions to blindly accept: verify they are genuinely a compaction and do not remove or alter important product rules, invariants, safety constraints or agent guidance. Include every documentation file that genuinely needs to retain changes from that diff in the lane's allowed scope and docsDelta. Do not recreate wording the cleanup intentionally removed merely because the earlier plan was written against the older files. Keep CLAUDE.md and AGENTS.md appropriately consistent, and distinguish general documentation compaction from documentation changes this lane specifically requires. Preserve the agreed substantive lane unless inspection exposes a real conflict.

## Why

THE SENTENCE THAT HOLDS THIS LANE TOGETHER: everything the app ALREADY KNOWS -- which instrument you are practising, which piece you mean even when you type it in Farsi, and which class files are already linked to it -- reaches you where you actually are, without typing, scrolling, or remembering a path. Every item below SURFACES OR REUSES SOMETHING THAT ALREADY EXISTS AND IS ALREADY TESTED. Nothing new is persisted, there is no schema change, no CSP change, and no new subsystem. That single property is also what draws the boundary: anything that would CREATE new stored data or a new pipeline is excluded by construction, not by preference.

WHAT I VERIFIED IS STILL OPEN AT 5325ce31 (the previous lane fixed a real subset, and I checked rather than trusting the catalogue). Still open: persianSearchMatch is exported and tested and wired to NOTHING -- Repertoire.tsx:454 and StartBlock.tsx:59 both still use title.toLowerCase().includes(). Lessons.tsx:55 still maps EVERY instrument on the phone, and neither Lessons nor Repertoire reads sessionInstrumentId. ItemDetail.tsx:425 already computes the item's lessons but renders them only as a generic link to /lessons, so a lesson's NAS references never reach the item at all. Already FIXED and deliberately NOT re-planned: instrumentBalance now filters its denominator to the instruments that get a row (selectors.ts:139-141), and Today.tsx and Insights.tsx no longer freeze `now`.

THE FARSI SEARCH FAILURE IS NOT THEORETICAL AND I REPRODUCED IT. Running the real modules against real titles: searching 'daramad' does not find درآمد, and -- the one that matters daily -- searching 'كرشمه' typed with an ARABIC kaf (U+0643, which is what an iOS Arabic keyboard produces) does not find 'کرشمه' stored with the PERSIAN kaf (U+06A9). persianSearchMatch folds exactly these and returns true for both. So on the device the owner carries, the keyboard can emit characters that can never match their own seeded Setar and Tar data. This is a two-call-site change against an already-tested matcher, and it directly falsifies this Flow's recorded endsWith -- 'The right piece is found and opened in a couple of taps, from whichever way of thinking about it came first.'

THE NAS INVESTIGATION CHANGED THE ARCHITECTURE, AND THE OWNER WAS RIGHT TO INSIST ON IT. I probed the actual setup instead of trusting DECISIONS.md. Findings: (1) There is NO Tailscale CLI on this Mac, so the Tailscale Serve runbook recorded in DECISIONS.md is NOT the current mechanism -- that document is actively misleading and is in docsDelta for correction. (2) https://192.168.0.20:5010 answers HTTP 200 from nginx and already serves REAL browsable Apache-style directory listings ('Index of /', mod_autoindex markup), and /setar-classes/ returns 200 -- so the document root already contains the class folders and the existing relative references already resolve against it. A 'Browse' link therefore needs NO server change whatsoever; the capability is already there and unused. (3) The certificate is Synology's own self-signed default (CN=synology, issuer 'Synology Inc. CA') and does NOT match 192.168.0.20, which is why this works on the MacBook where the owner has accepted the exception and is the reason a phone needs a one-time trust acceptance. That is INFRASTRUCTURE, not app code, and this lane deliberately does not decide it.

WHICH LEADS TO THE MOST VALUABLE SMALL THING IN THIS LANE, WHICH I DID NOT EXPECT TO FIND. resolveRecording ALREADY accepts a pasted full https URL -- verified by running it -- and the input's own placeholder already advertises 'NAS path or https:// link'. So pasting works today. But a stored ABSOLUTE url is silently PINNED TO ONE TRANSPORT: a reference saved as https://192.168.0.20:5010/... is dead on the phone away from home, and would be dead everywhere if the owner later moves to Tailscale. The fix is a pure function that, on save, rewrites a pasted URL that sits UNDER the configured base back into a RELATIVE path. Browse the listing in a tab, copy the URL, paste it, and the app stores it transport-independently. That is what makes the LAN-versus-Tailscale decision REVERSIBLE LATER WITHOUT TOUCHING ANY DATA -- the app stops caring which transport is in use, which is exactly the posture the base-URL-in-localStorage design already implies but does not yet enforce. It also satisfies the owner's stated minimum ('stop having to remember and type NAS paths') with a link and a pure function rather than a subsystem.

WHY THE SCANNER IS EXCLUDED, HAVING RE-ASSESSED IT ON EVIDENCE. The review favoured generalising scan-setar-classes.mjs into a paths-only index feeding an in-app picker, and that reasoning was sound when the NAS was assumed to be behind CORS-less Tailscale Serve. It is weaker now: the NAS already renders browsable listings, so browse-copy-paste closes most of the gap for a fraction of the surface. The scanner would add a build script, a generated reference module, a staleness story and a Mac-only dependency -- and it CREATES new reference data, which is precisely what this lane's thesis excludes. If browsing and pasting still feels like friction after real use, that lane is then justified by evidence instead of speculation.

THE ITEM-TO-MATERIAL LINK, CHEAP ROUTE FIRST, EXACTLY AS ASKED. ItemDetail already knows the item's lessons; a lesson already holds NAS references with a kind; resolveRecording already resolves them; attachments already carry blobs. Composing those into one pure itemFiles(db, itemId) gives the item -- and the practice screen -- the class video, the score PDF and the photo that belong to it, with NO new persisted field. The gap is honest and is recorded as a follow-on: an item with no lesson link cannot reference NAS material this way, and closing that genuinely needs a schema change and heavy tier. Most of the owner's Setar material comes from classes, so the cheap route covers the common case; the follow-on is defined rather than forced in.

WHY THIS BEATS THE CORRECTNESS ALTERNATIVES AS THE NEXT LANE. I considered grouping A5, A11, A12 and A14 into a 'the app only ever points you at the right item' lane. It is coherent, but the previous lane was already a correctness lane, all four are individually small and independent (so they lose nothing by waiting or shipping separately), and none of them changes what daily practice FEELS like. This lane changes something the owner hits every single session on the device they carry. It is also the safer lane to follow a data-safety lane with: it adds no new persisted state, so it cannot interact with anything the previous lane just stabilised.

TESTABILITY. vitest is environment:'node' with include:['src/**/*.test.ts'], so every decision moves into a pure function: the search predicate is already pure and tested (only its wiring changes), the instrument default is a pure choice function, itemFiles is pure over PracticeDB, and the paste normalisation is pure over (base, pasted). Eleven of the twelve checks are automated named tests. The single manual:OWNER check covers what genuinely cannot be proven in Node: the production CSP under npm run preview, the self-signed certificate on a real iPhone, and that a real NAS listing opens.

TWO PLACEMENT DECISIONS STATED OUTRIGHT, because leaving them implicit is what forces a Build-time amendment. FIRST: src/store/backup.ts is NOT edited and is deliberately out of scope. It owns getNasBaseUrl/setNasBaseUrl, but every consumer already IMPORTS that getter rather than changing the module -- Lessons.tsx:19 and Settings.tsx:14 both do exactly that today, and ItemDetail, ActiveBlock and the shared material component do the same. The new logic is pure and lives in recordings.ts, which takes the base as an argument; nothing needs to move into the store layer. SECOND: the rule about what may render INLINE versus what is open-only belongs in itemFiles.ts as a pure property of each composed entry, NOT inline in the component -- a rule written in ItemMaterial.tsx would be unreachable from a Node test and is exactly the rule that keeps the practice screen inside the existing production CSP.

THE DOCUMENTATION COMPACTION, FOLDED IN AND VERIFIED RATHER THAN ACCEPTED. The owner made this cleanup separately; Prismatica blocked pushing it to main as a non-record change, and it is preserved on backup/docs-trim-20260910. I inspected the diff rather than trusting it, and it is a genuine compaction: CLAUDE.md drops from 54,886 bytes to 865, becoming a pointer that imports `@AGENTS.md` and keeps only genuinely Claude-specific notes (Prismatica govern mode and the contract-work skill, the signed rules file, and the dev/preview launch configs). AGENTS.md becomes the single canonical normative file, and FUTURE.md and README.md re-point their one reference at it. This is exactly the fix the 2026-09-10 review recommended for the two 54,886-byte byte-identical twins, done better than the symlink that review suggested -- an import is Claude Code's native mechanism and does not depend on symlink support surviving a checkout.

The only content actually removed anywhere is AGENTS.md's ten-line 'When you add a feature' section, so I checked each of its four rules against what survives. (1) 'Bump SCHEMA_VERSION if the persisted shape changes, add a migration' -- SURVIVES verbatim in Architecture rules under 'Storage is async' (AGENTS.md:694). (2) 'Put the logic in a pure domain module with tests' -- SURVIVES twice over, in Architecture rules' 'Domain logic stays pure' and, more strongly, as the signed rule r-pure-tested-domain in .prismatica/rules.md, which no lane may edit to make a change pass. (3) The enumeration of required coverage (priority scoring, recommendation selection, review scheduling, stat updates, saturation) IS gone as prose -- but 'Tests are not optional' remains at AGENTS.md:707 and the tests themselves are the authority, not a list describing them. (4) 'Run npm run build, npm run lint, npm test before finishing' -- gone as prose and MECHANICALLY ENFORCED instead: .prismatica/config.json runs typecheck (npx tsc --noEmit), lint, unit (npx vitest run) and build as gate checks on every lane. Nothing normative is lost; two of the four are now enforced more strongly than prose ever managed. I also confirmed the cleanup leaves no dangling references -- the new AGENTS.md contains no CLAUDE.md references at all, and README.md and FUTURE.md were the only other files pointing at it outside .prismatica's immutable historical records.

THE TWO DOCUMENTATION STRANDS ARE DELIBERATELY DISTINCT, and a reviewer should be able to tell them apart in the diff. The COMPACTION is owner-supplied and structural: CLAUDE.md becomes a pointer, AGENTS.md loses one redundant section, FUTURE.md and README.md re-point. It should be taken from backup/docs-trim-20260910 rather than re-derived by hand, so the owner's approved bytes are what lands. The LANE-SPECIFIC changes are substantive and belong in AGENTS.md (the new invariants this lane establishes: the Farsi matcher is wired at both search surfaces, Repertoire and Lessons default to the session instrument while keeping the override, an item's material is COMPOSED from existing lesson links and attachments with nothing new persisted, NAS references are stored relative to the configured base so they stay transport-portable, and material access never touches timer or wake-lock behaviour) and in DECISIONS.md (correcting the NAS record). Because CLAUDE.md is now a pointer, every lane-specific normative addition goes to AGENTS.md and NONE to CLAUDE.md -- the earlier plan's instruction to edit both together is obsolete and must not be revived.

## Today

This Flow's recorded truth says the right piece is found and opened in a couple of taps 'from whichever way of thinking about it came first', with step 3 narrowing to one instrument, step 4 filtering the practice list by search, and step 5 opening the item. Verified at 5325ce31, each of those breaks down in a different way.

SEARCH DOES NOT WORK IN FARSI, WHICH IS THE LANGUAGE THE DATA IS AUTHORED IN. Repertoire.tsx:454 and StartBlock.tsx:59 both filter with title.toLowerCase().includes(query). toLowerCase does nothing useful for Persian. Reproduced by running the real modules: 'daramad' does not find درآمد, and 'كرشمه' typed with an Arabic kaf does not find 'کرشمه' stored with a Persian kaf. persianSearchMatch -- which folds yeh and kaf variants, digits and ZWNJ, and carries Latin transliteration aliases -- already exists in farsi.ts, is covered by tests, and is imported by no screen at all.

THE APP HAS THREE DIFFERENT IDEAS OF WHICH INSTRUMENT YOU ARE ON. Today, Start, Quick Add, New Item and the Session Plan all read the persisted sessionInstrumentId. Repertoire ignores it and keeps its own useState('') dropdown that resets to every-instrument on each visit (Repertoire.tsx:96). Lessons has neither and simply maps every active instrument (Lessons.tsx:55), so on the phone 40-plus Setar classes stack above Tar and Guitar with no way to narrow at all.

AN ITEM NEVER SHOWS THE FILES THAT ALREADY BELONG TO IT. ItemDetail.tsx:425 already computes the lessons an item appeared in, and renders them only as generic links to /lessons -- not even to the lesson itself. The class video and the score PDF that lesson holds are one instrument-wide list away, reachable only by remembering which class it was. During practice there is nothing at all: ActiveBlock shows notes, the current problem and last time's next action, and no material.

ADDING A NAS REFERENCE STILL MEANS TYPING A PATH FROM MEMORY, even though the NAS already serves browsable directory listings (verified: nginx on :5010 returns real mod_autoindex pages, and /setar-classes/ answers 200) and nothing in the app links to them. Pasting a full URL does already work -- but the absolute URL is then stored verbatim, silently pinning that reference to one transport, so it dies on the phone away from home or if the base URL ever changes.

## Instead

Everything the app already knows reaches you where you are.

SEARCH FINDS WHAT YOU MEAN. Both search boxes -- the practice list in Repertoire and the item picker on Start -- match through the existing Farsi-aware matcher, so an Arabic kaf finds a Persian kaf, spelling and ZWNJ variants fold together, and Latin transliteration works: typing 'daramad' finds درآمد. Nothing about the matcher itself changes; only the two screens that were not using it.

ONE INSTRUMENT IS IN VIEW. Repertoire and Lessons both open scoped to the instrument you are actually practising, from the same persisted session instrument every other screen already uses, and both keep a visible control to widen to all instruments -- so the cross-instrument view stays a deliberate choice rather than the default you have to undo every time.

A PIECE SHOWS ITS MATERIAL. An item lists the files that already belong to it: the NAS references from the lessons it is linked to, and its own attachments, in one place, deduplicated and ordered. No new field is stored -- these links already exist in the data, they were simply never composed. An item with no lesson link and no attachments shows nothing rather than an empty frame.

AND THAT MATERIAL IS THERE WHILE YOU PLAY. The same list appears on the practice screen behind one collapsed disclosure, in the same shape as the existing 'About this piece'. A photo of the page renders inline, because a local image is already permitted by the production CSP. Everything else -- PDFs, class videos, NAS files -- is an explicit open action, never an embed. The screen stays a practice screen: one disclosure, closed by default, and the timer, the wake lock and the boundary signals are untouched by anything here.

AND YOU STOP TYPING PATHS. Where the NAS base URL is configured there is a Browse link that opens it in a tab -- the NAS already serves real directory listings, so this needs no server change at all. Find the file, copy its URL, paste it in. And a pasted URL that sits under the configured base is stored RELATIVE, not absolute, so the reference keeps working on every device whatever transport that device uses. That is what keeps the choice between the LAN address and something like Tailscale a decision you can change later without rewriting a single stored reference.

AND THE DOCUMENTATION TELLS ONE STORY, IN TWO CLEARLY SEPARABLE STRANDS.

The first is the owner's already-made COMPACTION, taken from backup/docs-trim-20260910 rather than re-derived: CLAUDE.md stops being a 54,886-byte duplicate of AGENTS.md and becomes an 865-byte pointer that imports `@AGENTS.md` and carries only what is genuinely Claude-specific -- Prismatica govern mode and the contract-work skill, the signed rules file, and the dev/preview launch configs. AGENTS.md becomes the single canonical normative file and loses one redundant section whose four rules all survive elsewhere or are enforced by the gate. FUTURE.md and README.md re-point their one reference from CLAUDE.md to AGENTS.md. After this there is exactly one place to edit a rule, and no way for the two files to drift apart again.

The second is what THIS LANE specifically requires. AGENTS.md gains the invariants this change establishes: search goes through the Farsi-aware matcher at both surfaces; Repertoire and Lessons default to the session instrument and keep a visible override; an item's material is COMPOSED from lesson links and attachments that already exist, with nothing new persisted; a NAS reference is stored relative to the configured base so it stays portable across devices and transports; and material access never touches timer, wake-lock or boundary-signal behaviour. Every one of those goes to AGENTS.md and none to CLAUDE.md, because CLAUDE.md is no longer where rules live.

And DECISIONS.md stops being wrong. It currently records Tailscale Serve as the chosen mechanism for serving the NAS over HTTPS, with a runbook. There is no Tailscale on this Mac and the NAS is served by nginx on port 5010 with Synology's own self-signed certificate. An agent reading that file today would configure the wrong thing, so it is corrected to describe what is actually running, what the certificate implies for a phone, and the fact that the app is deliberately transport-agnostic.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- The NAS is reached over the LAN at https://192.168.0.20:5010 by nginx serving browsable directory listings, verified by probe rather than taken from DECISIONS.md, which records a Tailscale Serve mechanism that is not present on this Mac.
- The certificate is Synology's self-signed default and does not match the IP, so a device must accept it once before NAS links open there. That is infrastructure, not app code; this lane surfaces the consequence honestly and does not try to solve it.
- Choosing between the LAN address and a Tailscale-style hostname is an OWNER DECISION this lane deliberately leaves open. Storing references relative to the configured base is what makes that decision reversible later without rewriting stored data.
- A pasted URL that does not sit under the configured base is kept absolute rather than rewritten or rejected -- it is a deliberate external link and guessing at it would be worse than leaving it alone.
- Most of the owner's Setar material arrives through classes, so composing an item's files from its linked lessons covers the common case. An item with no lesson link needs a persisted item-level reference, which is a schema change and a defined follow-on.
- A local image is the only thing worth rendering inline during practice. A NAS image could never render inline under a static CSP anyway, because the NAS origin cannot be known at build time, so open-in-tab is the only honest option for anything remote.
- Reusing the persisted sessionInstrumentId is preferable to a fourth per-page filter model; the value 'all' already exists as the explicit cross-instrument sentinel and is preserved as the override.

**Possible conflicts**

- The documentation compaction already exists as a commit on backup/docs-trim-20260910 and should be taken from there rather than re-typed, so the owner's approved bytes are what lands. It touches exactly four files: CLAUDE.md (54,886 bytes down to 865, becoming an `@AGENTS.md` pointer), AGENTS.md (-10 lines, the 'When you add a feature' section), FUTURE.md and README.md (one reference each, CLAUDE.md to AGENTS.md). All four are in scope and in docsDelta. A reviewer should be able to separate that structural strand from this lane's substantive additions to AGENTS.md and DECISIONS.md.
- This lane touches four Flows but the schema carries only one Delta. browse-my-repertoire is the anchor and carries the substantive change (search, instrument scoping, and an item showing its material). log-a-class also gains instrument scoping and the Browse link; point-this-device-at-the-nas gains the Browse link and the relative-path normalisation; practise-todays-recommendation gains the collapsed material disclosure. All three are additive -- nothing they already do is altered or removed -- but their recorded truth will need updating afterwards, and the fresh reviewer should expect that rather than read it as scope creep.
- src/domain/itemFiles.ts is a NEW module and needs one line in src/domain/index.ts, which is in scope BECAUSE every consumer imports through the barrel ('../domain') rather than by file path -- without it the module cannot be consumed and the build fails. The name deliberately avoids 'material', which already means a study source in this codebase.
- Repertoire's local instrument dropdown and the persisted sessionInstrumentId must not fight each other. The dropdown becomes SEEDED from the session instrument rather than replaced by it; changing it must not silently rewrite the session instrument other screens depend on, or switching to browse another instrument would change what Today recommends.
- A lesson's recordings and an item's attachments can describe the same file. itemFiles must deduplicate deterministically and must not present an attachment as if it were a NAS reference or vice versa -- they open by different mechanisms.
- vitest is environment:'node', so no component test is possible. Every decision in this lane is therefore a pure function; the wiring of those functions into the four screens is what the manual:OWNER check exists to cover.
- The self-signed certificate means the manual check may fail on the iPhone for a reason that is NOT this lane's code. The check is written to distinguish those two outcomes so a certificate prompt is not recorded as a code defect.
- DECISIONS.md records Tailscale Serve as the chosen NAS mechanism with a runbook, and that is demonstrably not what is running -- no Tailscale CLI on this Mac, nginx serving directory listings on :5010, Synology's self-signed certificate. It must be CORRECTED rather than appended to, because an agent following the existing runbook would configure the wrong thing.
- docsDelta now names five files and the Check requires each to have ACTUALLY changed. Four change through the compaction; AGENTS.md and DECISIONS.md additionally carry this lane's substantive documentation. README.md's own obsolete SM-2 interval table was already removed by the previous lane, so its only change here is the one-line AGENTS.md reference -- small, but real.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "Plan the next Practice Compass lane from current main, now that the 'every recorded minute' lane has shipped. Verify current behaviour first rather than re-planning work the review catalogue lists but that is already fixed.\n\nI again want a reasonably WIDE but genuinely COHERENT change, not a collection of unrelated small fixes -- optimised for day-to-day usefulness, correctness and data safety, shared files and invariants, low ongoing admin, clean acceptance boundaries, reviewer comprehensibility and easy rollback. A promising direction is reducing the friction between 'I want to practise something' and 'I can find and open the material I need'.\n\nDecisions I confirmed while we planned this:\n- NAS: go broadly with the low-risk browsable-link option, but INSPECT the current NAS setup before fixing the approach. On my MacBook I reach the NAS at https://192.168.0.20:5010 and believe I have some web/file server configured on the Synology. Do not assume Tailscale Serve is the current mechanism just because older docs say so. If direct LAN access is simpler and more reliable, prefer it; I am also happy to install Tailscale on the Mac if that genuinely gives a better long-term setup. At minimum I want to stop having to remember and type NAS paths manually.\n- Also investigate whether a practice item can conveniently reference or select NAS material rather than only local attachments. Treat that as a suggestion, not a requirement: look first for a cheap solution using the existing reference/lesson model. If proper item-level NAS references need a schema change or materially widen the lane, leave that as a clearly defined follow-on.\n- During practice: images inline plus explicit open actions for everything else. Do not turn ActiveBlock into a dashboard and do not touch timer or wake-lock behaviour.\n- Instrument context: Repertoire and Lessons should default to the session instrument, keeping a visible override so cross-instrument browsing survives.\n- Builder: claude.\n\nPreserve the product principles: local-first and fully useful offline, no backend or paid service, no gamification, no AI or audio judgement, one coherent instrument/session context, deterministic and explainable scheduling, no silent data loss, large media stays on the NAS rather than entering backups or sync, Active practice stays calm and focused, and NAS/viewer concerns must not change timer or wake-lock semantics. Avoid schema changes unless their value clearly justifies heavy-tier ceremony, and do not widen the lane simply to consume more review findings. Be alert to dev-versus-production CSP behaviour if any file viewing or browsing is involved.\n\nAdded before import: I made an owner-approved cleanup/compaction of the repository's agent/documentation files using a dedicated Claude skill. Prismatica correctly blocked pushing it straight to main as a non-record change, so the exact commit is preserved on the local branch backup/docs-trim-20260910 and main is reset cleanly to origin/main. Fold that cleanup into THIS lane rather than creating a separate documentation lane.\nTreat those edits as owner-supplied PROPOSED changes, not as instructions to blindly accept: verify they are genuinely a compaction and do not remove or alter important product rules, invariants, safety constraints or agent guidance. Include every documentation file that genuinely needs to retain changes from that diff in the lane's allowed scope and docsDelta. Do not recreate wording the cleanup intentionally removed merely because the earlier plan was written against the older files. Keep CLAUDE.md and AGENTS.md appropriately consistent, and distinguish general documentation compaction from documentation changes this lane specifically requires. Preserve the agreed substantive lane unless inspection exposes a real conflict.",
  "builder": "claude",
  "summary": "Find it and open it: Farsi search, one instrument in view, and every file already linked to a piece",
  "rationale": "THE SENTENCE THAT HOLDS THIS LANE TOGETHER: everything the app ALREADY KNOWS -- which instrument you are practising, which piece you mean even when you type it in Farsi, and which class files are already linked to it -- reaches you where you actually are, without typing, scrolling, or remembering a path. Every item below SURFACES OR REUSES SOMETHING THAT ALREADY EXISTS AND IS ALREADY TESTED. Nothing new is persisted, there is no schema change, no CSP change, and no new subsystem. That single property is also what draws the boundary: anything that would CREATE new stored data or a new pipeline is excluded by construction, not by preference.\n\nWHAT I VERIFIED IS STILL OPEN AT 5325ce31 (the previous lane fixed a real subset, and I checked rather than trusting the catalogue). Still open: persianSearchMatch is exported and tested and wired to NOTHING -- Repertoire.tsx:454 and StartBlock.tsx:59 both still use title.toLowerCase().includes(). Lessons.tsx:55 still maps EVERY instrument on the phone, and neither Lessons nor Repertoire reads sessionInstrumentId. ItemDetail.tsx:425 already computes the item's lessons but renders them only as a generic link to /lessons, so a lesson's NAS references never reach the item at all. Already FIXED and deliberately NOT re-planned: instrumentBalance now filters its denominator to the instruments that get a row (selectors.ts:139-141), and Today.tsx and Insights.tsx no longer freeze `now`.\n\nTHE FARSI SEARCH FAILURE IS NOT THEORETICAL AND I REPRODUCED IT. Running the real modules against real titles: searching 'daramad' does not find درآمد, and -- the one that matters daily -- searching 'كرشمه' typed with an ARABIC kaf (U+0643, which is what an iOS Arabic keyboard produces) does not find 'کرشمه' stored with the PERSIAN kaf (U+06A9). persianSearchMatch folds exactly these and returns true for both. So on the device the owner carries, the keyboard can emit characters that can never match their own seeded Setar and Tar data. This is a two-call-site change against an already-tested matcher, and it directly falsifies this Flow's recorded endsWith -- 'The right piece is found and opened in a couple of taps, from whichever way of thinking about it came first.'\n\nTHE NAS INVESTIGATION CHANGED THE ARCHITECTURE, AND THE OWNER WAS RIGHT TO INSIST ON IT. I probed the actual setup instead of trusting DECISIONS.md. Findings: (1) There is NO Tailscale CLI on this Mac, so the Tailscale Serve runbook recorded in DECISIONS.md is NOT the current mechanism -- that document is actively misleading and is in docsDelta for correction. (2) https://192.168.0.20:5010 answers HTTP 200 from nginx and already serves REAL browsable Apache-style directory listings ('Index of /', mod_autoindex markup), and /setar-classes/ returns 200 -- so the document root already contains the class folders and the existing relative references already resolve against it. A 'Browse' link therefore needs NO server change whatsoever; the capability is already there and unused. (3) The certificate is Synology's own self-signed default (CN=synology, issuer 'Synology Inc. CA') and does NOT match 192.168.0.20, which is why this works on the MacBook where the owner has accepted the exception and is the reason a phone needs a one-time trust acceptance. That is INFRASTRUCTURE, not app code, and this lane deliberately does not decide it.\n\nWHICH LEADS TO THE MOST VALUABLE SMALL THING IN THIS LANE, WHICH I DID NOT EXPECT TO FIND. resolveRecording ALREADY accepts a pasted full https URL -- verified by running it -- and the input's own placeholder already advertises 'NAS path or https:// link'. So pasting works today. But a stored ABSOLUTE url is silently PINNED TO ONE TRANSPORT: a reference saved as https://192.168.0.20:5010/... is dead on the phone away from home, and would be dead everywhere if the owner later moves to Tailscale. The fix is a pure function that, on save, rewrites a pasted URL that sits UNDER the configured base back into a RELATIVE path. Browse the listing in a tab, copy the URL, paste it, and the app stores it transport-independently. That is what makes the LAN-versus-Tailscale decision REVERSIBLE LATER WITHOUT TOUCHING ANY DATA -- the app stops caring which transport is in use, which is exactly the posture the base-URL-in-localStorage design already implies but does not yet enforce. It also satisfies the owner's stated minimum ('stop having to remember and type NAS paths') with a link and a pure function rather than a subsystem.\n\nWHY THE SCANNER IS EXCLUDED, HAVING RE-ASSESSED IT ON EVIDENCE. The review favoured generalising scan-setar-classes.mjs into a paths-only index feeding an in-app picker, and that reasoning was sound when the NAS was assumed to be behind CORS-less Tailscale Serve. It is weaker now: the NAS already renders browsable listings, so browse-copy-paste closes most of the gap for a fraction of the surface. The scanner would add a build script, a generated reference module, a staleness story and a Mac-only dependency -- and it CREATES new reference data, which is precisely what this lane's thesis excludes. If browsing and pasting still feels like friction after real use, that lane is then justified by evidence instead of speculation.\n\nTHE ITEM-TO-MATERIAL LINK, CHEAP ROUTE FIRST, EXACTLY AS ASKED. ItemDetail already knows the item's lessons; a lesson already holds NAS references with a kind; resolveRecording already resolves them; attachments already carry blobs. Composing those into one pure itemFiles(db, itemId) gives the item -- and the practice screen -- the class video, the score PDF and the photo that belong to it, with NO new persisted field. The gap is honest and is recorded as a follow-on: an item with no lesson link cannot reference NAS material this way, and closing that genuinely needs a schema change and heavy tier. Most of the owner's Setar material comes from classes, so the cheap route covers the common case; the follow-on is defined rather than forced in.\n\nWHY THIS BEATS THE CORRECTNESS ALTERNATIVES AS THE NEXT LANE. I considered grouping A5, A11, A12 and A14 into a 'the app only ever points you at the right item' lane. It is coherent, but the previous lane was already a correctness lane, all four are individually small and independent (so they lose nothing by waiting or shipping separately), and none of them changes what daily practice FEELS like. This lane changes something the owner hits every single session on the device they carry. It is also the safer lane to follow a data-safety lane with: it adds no new persisted state, so it cannot interact with anything the previous lane just stabilised.\n\nTESTABILITY. vitest is environment:'node' with include:['src/**/*.test.ts'], so every decision moves into a pure function: the search predicate is already pure and tested (only its wiring changes), the instrument default is a pure choice function, itemFiles is pure over PracticeDB, and the paste normalisation is pure over (base, pasted). Eleven of the twelve checks are automated named tests. The single manual:OWNER check covers what genuinely cannot be proven in Node: the production CSP under npm run preview, the self-signed certificate on a real iPhone, and that a real NAS listing opens.\n\nTWO PLACEMENT DECISIONS STATED OUTRIGHT, because leaving them implicit is what forces a Build-time amendment. FIRST: src/store/backup.ts is NOT edited and is deliberately out of scope. It owns getNasBaseUrl/setNasBaseUrl, but every consumer already IMPORTS that getter rather than changing the module -- Lessons.tsx:19 and Settings.tsx:14 both do exactly that today, and ItemDetail, ActiveBlock and the shared material component do the same. The new logic is pure and lives in recordings.ts, which takes the base as an argument; nothing needs to move into the store layer. SECOND: the rule about what may render INLINE versus what is open-only belongs in itemFiles.ts as a pure property of each composed entry, NOT inline in the component -- a rule written in ItemMaterial.tsx would be unreachable from a Node test and is exactly the rule that keeps the practice screen inside the existing production CSP.\n\nTHE DOCUMENTATION COMPACTION, FOLDED IN AND VERIFIED RATHER THAN ACCEPTED. The owner made this cleanup separately; Prismatica blocked pushing it to main as a non-record change, and it is preserved on backup/docs-trim-20260910. I inspected the diff rather than trusting it, and it is a genuine compaction: CLAUDE.md drops from 54,886 bytes to 865, becoming a pointer that imports `@AGENTS.md` and keeps only genuinely Claude-specific notes (Prismatica govern mode and the contract-work skill, the signed rules file, and the dev/preview launch configs). AGENTS.md becomes the single canonical normative file, and FUTURE.md and README.md re-point their one reference at it. This is exactly the fix the 2026-09-10 review recommended for the two 54,886-byte byte-identical twins, done better than the symlink that review suggested -- an import is Claude Code's native mechanism and does not depend on symlink support surviving a checkout.\n\nThe only content actually removed anywhere is AGENTS.md's ten-line 'When you add a feature' section, so I checked each of its four rules against what survives. (1) 'Bump SCHEMA_VERSION if the persisted shape changes, add a migration' -- SURVIVES verbatim in Architecture rules under 'Storage is async' (AGENTS.md:694). (2) 'Put the logic in a pure domain module with tests' -- SURVIVES twice over, in Architecture rules' 'Domain logic stays pure' and, more strongly, as the signed rule r-pure-tested-domain in .prismatica/rules.md, which no lane may edit to make a change pass. (3) The enumeration of required coverage (priority scoring, recommendation selection, review scheduling, stat updates, saturation) IS gone as prose -- but 'Tests are not optional' remains at AGENTS.md:707 and the tests themselves are the authority, not a list describing them. (4) 'Run npm run build, npm run lint, npm test before finishing' -- gone as prose and MECHANICALLY ENFORCED instead: .prismatica/config.json runs typecheck (npx tsc --noEmit), lint, unit (npx vitest run) and build as gate checks on every lane. Nothing normative is lost; two of the four are now enforced more strongly than prose ever managed. I also confirmed the cleanup leaves no dangling references -- the new AGENTS.md contains no CLAUDE.md references at all, and README.md and FUTURE.md were the only other files pointing at it outside .prismatica's immutable historical records.\n\nTHE TWO DOCUMENTATION STRANDS ARE DELIBERATELY DISTINCT, and a reviewer should be able to tell them apart in the diff. The COMPACTION is owner-supplied and structural: CLAUDE.md becomes a pointer, AGENTS.md loses one redundant section, FUTURE.md and README.md re-point. It should be taken from backup/docs-trim-20260910 rather than re-derived by hand, so the owner's approved bytes are what lands. The LANE-SPECIFIC changes are substantive and belong in AGENTS.md (the new invariants this lane establishes: the Farsi matcher is wired at both search surfaces, Repertoire and Lessons default to the session instrument while keeping the override, an item's material is COMPOSED from existing lesson links and attachments with nothing new persisted, NAS references are stored relative to the configured base so they stay transport-portable, and material access never touches timer or wake-lock behaviour) and in DECISIONS.md (correcting the NAS record). Because CLAUDE.md is now a pointer, every lane-specific normative addition goes to AGENTS.md and NONE to CLAUDE.md -- the earlier plan's instruction to edit both together is obsolete and must not be revived.",
  "kind": "existing-flow",
  "flowId": "browse-my-repertoire",
  "currentBehaviour": "This Flow's recorded truth says the right piece is found and opened in a couple of taps 'from whichever way of thinking about it came first', with step 3 narrowing to one instrument, step 4 filtering the practice list by search, and step 5 opening the item. Verified at 5325ce31, each of those breaks down in a different way.\n\nSEARCH DOES NOT WORK IN FARSI, WHICH IS THE LANGUAGE THE DATA IS AUTHORED IN. Repertoire.tsx:454 and StartBlock.tsx:59 both filter with title.toLowerCase().includes(query). toLowerCase does nothing useful for Persian. Reproduced by running the real modules: 'daramad' does not find درآمد, and 'كرشمه' typed with an Arabic kaf does not find 'کرشمه' stored with a Persian kaf. persianSearchMatch -- which folds yeh and kaf variants, digits and ZWNJ, and carries Latin transliteration aliases -- already exists in farsi.ts, is covered by tests, and is imported by no screen at all.\n\nTHE APP HAS THREE DIFFERENT IDEAS OF WHICH INSTRUMENT YOU ARE ON. Today, Start, Quick Add, New Item and the Session Plan all read the persisted sessionInstrumentId. Repertoire ignores it and keeps its own useState('') dropdown that resets to every-instrument on each visit (Repertoire.tsx:96). Lessons has neither and simply maps every active instrument (Lessons.tsx:55), so on the phone 40-plus Setar classes stack above Tar and Guitar with no way to narrow at all.\n\nAN ITEM NEVER SHOWS THE FILES THAT ALREADY BELONG TO IT. ItemDetail.tsx:425 already computes the lessons an item appeared in, and renders them only as generic links to /lessons -- not even to the lesson itself. The class video and the score PDF that lesson holds are one instrument-wide list away, reachable only by remembering which class it was. During practice there is nothing at all: ActiveBlock shows notes, the current problem and last time's next action, and no material.\n\nADDING A NAS REFERENCE STILL MEANS TYPING A PATH FROM MEMORY, even though the NAS already serves browsable directory listings (verified: nginx on :5010 returns real mod_autoindex pages, and /setar-classes/ answers 200) and nothing in the app links to them. Pasting a full URL does already work -- but the absolute URL is then stored verbatim, silently pinning that reference to one transport, so it dies on the phone away from home or if the base URL ever changes.",
  "desiredBehaviour": "Everything the app already knows reaches you where you are.\n\nSEARCH FINDS WHAT YOU MEAN. Both search boxes -- the practice list in Repertoire and the item picker on Start -- match through the existing Farsi-aware matcher, so an Arabic kaf finds a Persian kaf, spelling and ZWNJ variants fold together, and Latin transliteration works: typing 'daramad' finds درآمد. Nothing about the matcher itself changes; only the two screens that were not using it.\n\nONE INSTRUMENT IS IN VIEW. Repertoire and Lessons both open scoped to the instrument you are actually practising, from the same persisted session instrument every other screen already uses, and both keep a visible control to widen to all instruments -- so the cross-instrument view stays a deliberate choice rather than the default you have to undo every time.\n\nA PIECE SHOWS ITS MATERIAL. An item lists the files that already belong to it: the NAS references from the lessons it is linked to, and its own attachments, in one place, deduplicated and ordered. No new field is stored -- these links already exist in the data, they were simply never composed. An item with no lesson link and no attachments shows nothing rather than an empty frame.\n\nAND THAT MATERIAL IS THERE WHILE YOU PLAY. The same list appears on the practice screen behind one collapsed disclosure, in the same shape as the existing 'About this piece'. A photo of the page renders inline, because a local image is already permitted by the production CSP. Everything else -- PDFs, class videos, NAS files -- is an explicit open action, never an embed. The screen stays a practice screen: one disclosure, closed by default, and the timer, the wake lock and the boundary signals are untouched by anything here.\n\nAND YOU STOP TYPING PATHS. Where the NAS base URL is configured there is a Browse link that opens it in a tab -- the NAS already serves real directory listings, so this needs no server change at all. Find the file, copy its URL, paste it in. And a pasted URL that sits under the configured base is stored RELATIVE, not absolute, so the reference keeps working on every device whatever transport that device uses. That is what keeps the choice between the LAN address and something like Tailscale a decision you can change later without rewriting a single stored reference.\n\nAND THE DOCUMENTATION TELLS ONE STORY, IN TWO CLEARLY SEPARABLE STRANDS.\n\nThe first is the owner's already-made COMPACTION, taken from backup/docs-trim-20260910 rather than re-derived: CLAUDE.md stops being a 54,886-byte duplicate of AGENTS.md and becomes an 865-byte pointer that imports `@AGENTS.md` and carries only what is genuinely Claude-specific -- Prismatica govern mode and the contract-work skill, the signed rules file, and the dev/preview launch configs. AGENTS.md becomes the single canonical normative file and loses one redundant section whose four rules all survive elsewhere or are enforced by the gate. FUTURE.md and README.md re-point their one reference from CLAUDE.md to AGENTS.md. After this there is exactly one place to edit a rule, and no way for the two files to drift apart again.\n\nThe second is what THIS LANE specifically requires. AGENTS.md gains the invariants this change establishes: search goes through the Farsi-aware matcher at both surfaces; Repertoire and Lessons default to the session instrument and keep a visible override; an item's material is COMPOSED from lesson links and attachments that already exist, with nothing new persisted; a NAS reference is stored relative to the configured base so it stays portable across devices and transports; and material access never touches timer, wake-lock or boundary-signal behaviour. Every one of those goes to AGENTS.md and none to CLAUDE.md, because CLAUDE.md is no longer where rules live.\n\nAnd DECISIONS.md stops being wrong. It currently records Tailscale Serve as the chosen mechanism for serving the NAS over HTTPS, with a runbook. There is no Tailscale on this Mac and the NAS is served by nginx on port 5010 with Synology's own self-signed certificate. An agent reading that file today would configure the wrong thing, so it is corrected to describe what is actually running, what the certificate implies for a phone, and the fact that the app is deliberately transport-agnostic.",
  "mustNotChange": [
    "No schema change and no migration. SCHEMA_VERSION stays 11 and no persisted shape changes -- src/domain/types.ts and src/domain/migrations.ts are forbidden so this is mechanical rather than asserted. The only field this lane writes differently is the TEXT of an existing LessonRecording.path, normalised to relative; its type and meaning are unchanged.",
    "No CSP change. src/vite.config.ts is forbidden. Images render from blob: which the production CSP already allows; nothing is embedded in a frame and no new origin is added, so the build-only CSP cannot diverge from dev in this lane.",
    "No timer, wake-lock or practice-signal behaviour changes. practiceSignal.ts, useScreenAwake.ts and screenAwake.ts are forbidden, and no material or viewer concern may influence a recorded minute, the wake lock, or a boundary announcement.",
    "Active practice stays calm. The material list is ONE collapsed disclosure, closed by default, in the same shape as the existing 'About this piece' -- not a panel, not a viewer, not a dashboard, and never above the timer.",
    "Large media stays on the NAS. This lane adds no way for a NAS file's bytes to enter attachments, IndexedDB, sync or a backup; NAS files are opened, never embedded or downloaded into the app.",
    "The Farsi matcher itself is not retuned. persianSearchMatch, normalizePersian, faCollator and the transliteration aliases keep their current behaviour exactly -- farsi.ts is forbidden; only the two screens that never called it change.",
    "The cross-instrument view survives. Repertoire and Lessons DEFAULT to the session instrument but keep a visible override, so browse-my-repertoire's recorded step 3 stays true and the Overview remains a deliberate secondary choice rather than something removed.",
    "No new persisted state of any kind. Every file shown on an item is composed from links that already exist -- lesson.itemIds, lesson.recordings and attachments -- and nothing is written to make that view work.",
    "The NAS base URL and the GitHub token stay per-device in localStorage, out of exports, backups and synced data.",
    "Everything still works fully offline and local-first. A missing or unreachable NAS base degrades to a disabled or absent action with a plain explanation, never an error state, and never blocks practising.",
    "Scheduling, scoring and recommendation behaviour are untouched: scheduling.ts, scoring.ts and recommend.ts are forbidden.",
    "The documentation compaction must stay a COMPACTION. AGENTS.md remains the single canonical normative file and must keep every product rule, invariant, safety constraint and architecture rule it holds today -- in particular the schema/migration rule under 'Storage is async', 'Domain logic stays pure', 'Tests are not optional', and every Hard do-not. The only content removed anywhere is the ten-line 'When you add a feature' section, whose four rules were each verified to survive in AGENTS.md, in the signed .prismatica/rules.md, or as a mechanical gate check. Nothing normative may be dropped beyond that, and no rule may be reworded while being moved.",
    "CLAUDE.md stays a pointer. After the compaction it imports `@AGENTS.md` and holds only Claude-specific operational notes; no product rule, invariant or architecture rule may be written back into it. Anything a non-Claude agent also needs belongs in AGENTS.md. The previous instruction to keep the two byte-identical is obsolete and must not be revived.",
    "Prismatica's own records are immutable history. .prismatica/contracts, packs, intents and reviews reference CLAUDE.md as it stood when they were written; they are NOT rewritten to match the compaction, and nothing in .prismatica is in this lane's scope."
  ],
  "assumptions": [
    "The NAS is reached over the LAN at https://192.168.0.20:5010 by nginx serving browsable directory listings, verified by probe rather than taken from DECISIONS.md, which records a Tailscale Serve mechanism that is not present on this Mac.",
    "The certificate is Synology's self-signed default and does not match the IP, so a device must accept it once before NAS links open there. That is infrastructure, not app code; this lane surfaces the consequence honestly and does not try to solve it.",
    "Choosing between the LAN address and a Tailscale-style hostname is an OWNER DECISION this lane deliberately leaves open. Storing references relative to the configured base is what makes that decision reversible later without rewriting stored data.",
    "A pasted URL that does not sit under the configured base is kept absolute rather than rewritten or rejected -- it is a deliberate external link and guessing at it would be worse than leaving it alone.",
    "Most of the owner's Setar material arrives through classes, so composing an item's files from its linked lessons covers the common case. An item with no lesson link needs a persisted item-level reference, which is a schema change and a defined follow-on.",
    "A local image is the only thing worth rendering inline during practice. A NAS image could never render inline under a static CSP anyway, because the NAS origin cannot be known at build time, so open-in-tab is the only honest option for anything remote.",
    "Reusing the persisted sessionInstrumentId is preferable to a fourth per-page filter model; the value 'all' already exists as the explicit cross-instrument sentinel and is preserved as the override."
  ],
  "possibleConflicts": [
    "The documentation compaction already exists as a commit on backup/docs-trim-20260910 and should be taken from there rather than re-typed, so the owner's approved bytes are what lands. It touches exactly four files: CLAUDE.md (54,886 bytes down to 865, becoming an `@AGENTS.md` pointer), AGENTS.md (-10 lines, the 'When you add a feature' section), FUTURE.md and README.md (one reference each, CLAUDE.md to AGENTS.md). All four are in scope and in docsDelta. A reviewer should be able to separate that structural strand from this lane's substantive additions to AGENTS.md and DECISIONS.md.",
    "This lane touches four Flows but the schema carries only one Delta. browse-my-repertoire is the anchor and carries the substantive change (search, instrument scoping, and an item showing its material). log-a-class also gains instrument scoping and the Browse link; point-this-device-at-the-nas gains the Browse link and the relative-path normalisation; practise-todays-recommendation gains the collapsed material disclosure. All three are additive -- nothing they already do is altered or removed -- but their recorded truth will need updating afterwards, and the fresh reviewer should expect that rather than read it as scope creep.",
    "src/domain/itemFiles.ts is a NEW module and needs one line in src/domain/index.ts, which is in scope BECAUSE every consumer imports through the barrel ('../domain') rather than by file path -- without it the module cannot be consumed and the build fails. The name deliberately avoids 'material', which already means a study source in this codebase.",
    "Repertoire's local instrument dropdown and the persisted sessionInstrumentId must not fight each other. The dropdown becomes SEEDED from the session instrument rather than replaced by it; changing it must not silently rewrite the session instrument other screens depend on, or switching to browse another instrument would change what Today recommends.",
    "A lesson's recordings and an item's attachments can describe the same file. itemFiles must deduplicate deterministically and must not present an attachment as if it were a NAS reference or vice versa -- they open by different mechanisms.",
    "vitest is environment:'node', so no component test is possible. Every decision in this lane is therefore a pure function; the wiring of those functions into the four screens is what the manual:OWNER check exists to cover.",
    "The self-signed certificate means the manual check may fail on the iPhone for a reason that is NOT this lane's code. The check is written to distinguish those two outcomes so a certificate prompt is not recorded as a code defect.",
    "DECISIONS.md records Tailscale Serve as the chosen NAS mechanism with a runbook, and that is demonstrably not what is running -- no Tailscale CLI on this Mac, nginx serving directory listings on :5010, Synology's self-signed certificate. It must be CORRECTED rather than appended to, because an agent following the existing runbook would configure the wrong thing.",
    "docsDelta now names five files and the Check requires each to have ACTUALLY changed. Four change through the compaction; AGENTS.md and DECISIONS.md additionally carry this lane's substantive documentation. README.md's own obsolete SM-2 interval table was already removed by the previous lane, so its only change here is the one-line AGENTS.md reference -- small, but real."
  ],
  "scope": {
    "allow": [
      "AGENTS.md",
      "CLAUDE.md",
      "DECISIONS.md",
      "FUTURE.md",
      "README.md",
      "src/components/ItemMaterial.tsx",
      "src/domain/index.ts",
      "src/domain/itemFiles.test.ts",
      "src/domain/itemFiles.ts",
      "src/domain/recordings.test.ts",
      "src/domain/recordings.ts",
      "src/domain/selectors.test.ts",
      "src/domain/selectors.ts",
      "src/pages/ActiveBlock.tsx",
      "src/pages/ItemDetail.tsx",
      "src/pages/Lessons.tsx",
      "src/pages/Repertoire.tsx",
      "src/pages/Settings.tsx",
      "src/pages/StartBlock.tsx",
      "src/store/lookups.ts",
      "src/store/useStore.ts"
    ],
    "forbid": [
      "src/domain/types.ts",
      "src/domain/migrations.ts",
      "src/domain/migrations.test.ts",
      "src/domain/farsi.ts",
      "src/domain/farsi.test.ts",
      "src/domain/scheduling.ts",
      "src/domain/scoring.ts",
      "src/domain/recommend.ts",
      "src/domain/practiceSignal.ts",
      "src/domain/practiceSignal.test.ts",
      "src/components/useScreenAwake.ts",
      "src/components/screenAwake.ts",
      "src/domain/routines.ts",
      "src/pages/RoutineRunner.tsx",
      "src/store/syncEngine.ts",
      "src/store/gitRemote.ts",
      "src/domain/sync.ts",
      "vite.config.ts",
      "package.json",
      "scripts/scan-setar-classes.mjs"
    ]
  },
  "exclusions": [
    "The scan:nas index and in-app picker (review B2). Re-assessed on fresh evidence and deliberately deferred: the NAS already serves browsable directory listings, so browse-copy-paste closes most of the gap, while a scanner would add a build script, a generated reference module, a staleness story and a Mac-only dependency -- and it CREATES new reference data, which is exactly what this lane's thesis excludes. Revisit only if browsing and pasting proves insufficient in real use.",
    "First-class item-level NAS references (review B3 in full). Needs a new persisted field on PracticeItem, therefore a SCHEMA_VERSION bump and heavy tier under the repo's own tierRules. The cheap route in this lane covers items linked to a lesson, which is most of the owner's Setar material; an item with no lesson link is the honest gap and is the follow-on's reason to exist.",
    "Embedding local PDFs in a frame (part of review B4). Would need frame-src blob: in the build-only CSP, verifiable only via npm run preview, and iOS Safari is unreliable at rendering PDFs in frames -- so the most fragile part would sit on the device that needs it most. Excluding it keeps vite.config.ts forbidden and removes dev-versus-production CSP divergence from this lane entirely.",
    "Choosing the NAS transport (LAN IP versus Tailscale or a reverse proxy) and anything about the self-signed certificate. Infrastructure, not app code. This lane makes the choice REVERSIBLE by storing references relative to the configured base, and records what is actually running in DECISIONS.md, but does not make the decision.",
    "Review A3 -- SM-2 advancing reps on every closed block rather than once per due date. Still open and still valuable, but it changes what r-practice-completes-reviews means and needs its own owner decision. scheduling.ts is forbidden here.",
    "Review A5 -- dormant/'Resting' items still scored and still eligible for the Maintenance card. Verified still open (scoring.ts:22, recommend.ts:37). One predicate fixes it, but it is about which item is RECOMMENDED, not about finding and opening material. scoring.ts and recommend.ts are forbidden here.",
    "Review A12 -- eight remaining frozen-`now` sites (CloseBlock, SessionPlan, Repertoire x2, ItemDetail, Lessons x2, TeacherReport) and SessionPlan's reseed key, which still uses build.generatedAt derived from the frozen now and therefore can still never fire. Today and Insights were fixed by the previous lane. A shared useCurrentDay belongs in its own lane rather than being half-done inside this one.",
    "Review A11 (an item can still be made its own parent -- ItemForm.tsx:75 does not exclude the edited id), A13 (a malformed backup attachment entry is still skipped at backup.ts:274 then destroyed by the blob replacement), A14 (insights and the Teacher Report still mix 'during this period' with 'right now'), A15 and A18 (remaining truthful-copy and spec drift beyond DECISIONS.md).",
    "Review B5 -- the iPhone bottom bar after keyboard dismissal. Device-specific, unrelated to this lane's files, and needs its own manual:OWNER evidence.",
    "Adding jsdom, fake-indexeddb, Playwright or any component/browser test harness (review E1). vitest stays environment:'node'; decisions move into pure functions instead. Enabling the .prismatica journeys check is its own lane.",
    "Rewriting .prismatica records (contracts, packs, intents, reviews) that mention CLAUDE.md. They are immutable history describing what the contract said at the time, and nothing in .prismatica is in scope. Also excluded: filling .prismatica/product-map.md, which is still unfilled placeholders, and refreshing docs/product-spec.md, which predates pathways, routines, the Session Plan and sync -- both are real documentation debt but neither is what this lane is about."
  ],
  "acceptance": [
    {
      "description": "The Farsi failure that actually bites on the owner's phone, with its counterexample: a query typed with an ARABIC kaf matches a title stored with a PERSIAN kaf, while a genuinely unrelated Persian query still does not match. Proves the search screens now fold variants without becoming a match-everything filter.",
      "test": "matches a Persian title when the query uses the Arabic kaf and still rejects an unrelated query"
    },
    {
      "description": "Latin transliteration, with its counterexample: searching 'daramad' finds درآمد, and an unrelated Latin word finds nothing. Verified failing against the current toLowerCase().includes() predicate before the change.",
      "test": "finds a Persian title from its Latin transliteration and rejects an unrelated Latin query"
    },
    {
      "description": "The instrument default is a pure choice, discriminating all three states: a real session instrument seeds the filter, the explicit cross-instrument 'all' sentinel seeds the every-instrument view, and a session instrument that no longer resolves in the database falls back to every-instrument rather than to an empty screen.",
      "test": "seeds the filter from a resolvable session instrument, widens for all, and falls back when it no longer exists"
    },
    {
      "description": "An item's material is composed from links that already exist: the NAS references of every lesson the item is linked to, plus the item's own attachments, in a deterministic order. References are deduplicated BY PATH, so the same file referenced from two different lessons the item is linked to appears once, not twice.",
      "test": "lists a linked lesson's references with the item's attachments, deduplicating references by path"
    },
    {
      "description": "The counterexample that makes the composition meaningful rather than a broad sweep: references belonging to a lesson the item is NOT linked to never appear, and an item with no lessons and no attachments yields an empty list rather than an empty frame.",
      "test": "excludes references from lessons the item is not linked to and returns nothing when it has none"
    },
    {
      "description": "The two kinds of material open by completely different mechanisms -- a NAS reference resolves through the configured base URL, a local attachment through a blob -- so each composed entry carries which one it is. This is what stops a NAS reference being opened as a blob, or an attachment being pushed through the base URL and 404ing. Note the two types share no identity field (LessonRecording has path, AttachmentMeta has name), so they are never merged: deduplication is within a kind, never across them.",
      "test": "tags every entry with how it opens so a reference is never treated as an attachment"
    },
    {
      "description": "THE TRANSPORT-INDEPENDENCE RULE, three-way discriminating: a pasted URL that sits UNDER the configured base is stored RELATIVE, a pasted URL on a DIFFERENT origin is kept absolute rather than rewritten or rejected, and an already-relative path is stored unchanged. This is what keeps every reference working when the base URL changes.",
      "test": "stores a pasted URL under the base as relative, keeps a foreign origin absolute, and leaves a relative path alone"
    },
    {
      "description": "The same normalisation must never mangle input it cannot reason about: with no base URL configured, a pasted absolute URL is stored exactly as given, and a blank or unparseable base changes nothing.",
      "test": "stores a pasted URL unchanged when no usable base URL is configured"
    },
    {
      "description": "A stored reference survives a change of transport, which is the whole point: the same relative path resolves correctly under the LAN base and under a completely different base, proving no reference is pinned to one device's route to the NAS.",
      "test": "resolves the same relative reference correctly under two different base URLs"
    },
    {
      "description": "The Browse action is offered only when it can actually work, discriminating both directions: a valid configured base yields a browsable URL, while a blank or unparseable base yields none rather than a dead link or a same-origin request.",
      "test": "offers a browse target for a valid base and none for a blank or unparseable one"
    },
    {
      "description": "What may be shown inline during practice, decided as a pure property of each composed entry in itemFiles.ts rather than inline in the component, with its counterexample: a local image attachment is inline-renderable, while a PDF, an audio file and every NAS reference are open-only. This is the rule that keeps the practice screen from becoming a viewer and keeps the whole lane inside the existing production CSP -- a NAS image could not render inline under a static CSP in any case, because the NAS origin is not knowable at build time.",
      "test": "treats a local image as inline-renderable and every PDF, audio file and NAS reference as open-only"
    },
    {
      "description": "On the owner's own devices and against the PRODUCTION build, because none of this can be proven in Node. FIRST, the documentation compaction: open a fresh Claude Code session in this repo and confirm the `@AGENTS.md` import in the trimmed CLAUDE.md actually resolves, so the normative rules are still in context -- if that import silently fails, a builder would be left with an 865-byte file and no product rules at all, which is the one way this compaction could do harm. Run npm run preview (never dev -- the CSP is injected at build only) and confirm: (a) On the MacBook, an item that came from a class lists that class's video and score, and each opens on the NAS. (b) Settings' Browse link opens a real directory listing at the NAS base. (c) Copy a file URL from that listing, paste it as a lesson reference, save, and confirm the stored value is RELATIVE -- then change the base URL to a different form of the same host and confirm the reference still resolves. (d) Start a block on an item with a photo attached: the photo shows inline behind one closed disclosure, the timer keeps running while it is open, and the target signal still fires. (e) On the iPhone, Repertoire and Lessons open on the instrument you are practising and both still widen to all; search for a gusheh using the Persian keyboard and find it. (f) Also on the iPhone, tap a NAS link: if it is blocked, confirm whether the cause is the self-signed certificate prompt rather than the app, and record which -- a certificate prompt is infrastructure, not a defect in this lane.",
      "test": "manual:OWNER"
    }
  ],
  "risk": {
    "touchesAuth": false,
    "touchesPayments": false,
    "touchesSavedData": true,
    "copyOnly": false,
    "rationale": "touchesSavedData is TRUE, answered honestly even though the footprint is narrow. This lane writes to saved data in exactly one way: the TEXT of a LessonRecording.path is normalised to a relative form when a pasted URL sits under the configured base. No field is added, removed or retyped, and SCHEMA_VERSION stays 11. Everything else in the lane READS existing data -- search predicates, instrument defaults, and composing an item's files from lesson links and attachments that already exist. It touches no authentication and no payments; the GitHub token and NAS base URL stay in localStorage and are neither read into nor written from any of this.\n\nWhat bounds the risk: src/domain/types.ts and src/domain/migrations.ts are FORBIDDEN, so 'no schema change' is mechanical. vite.config.ts is forbidden, so no CSP token can move and the build-only CSP cannot diverge from dev in this lane -- the reason local PDFs are deliberately opened rather than embedded. practiceSignal.ts, useScreenAwake.ts and screenAwake.ts are forbidden, so no material or viewer concern can reach the timer, the wake lock or a boundary announcement. farsi.ts is forbidden, so the matcher cannot be retuned while its wiring changes. No NAS bytes can enter attachments, sync or backups, because nothing in this lane fetches a NAS file -- it only opens one.\n\nThe one genuinely new failure mode is the path normalisation writing a value that no longer resolves -- rewriting a URL it should have left alone, or stripping the wrong prefix. That is why it is a pure function with a three-way discriminating test (under-base becomes relative, foreign origin stays absolute, relative stays untouched), a fourth test for the no-base case, and a fifth proving the same relative reference resolves under two different bases. Note the direction of the change: storing relative makes references MORE portable than today, where a pasted absolute URL is silently pinned to one device's route to the NAS. Rollback is a plain revert -- no migration to undo, and any reference already normalised keeps resolving under the old code, because relative paths are what the existing model was designed around."
  },
  "delta": {
    "step": 4,
    "today": "This Flow promises the right piece is found and opened in a couple of taps, 'from whichever way of thinking about it came first' -- step 3 narrowing to one instrument, step 4 filtering the practice list by search, step 5 opening the item. Verified at 5325ce31, each breaks differently. This Delta is anchored at step 4, where the failure is sharpest and reproducible, but it spans steps 3 to 5 of this Flow -- narrowing to one instrument, filtering by search, and opening the item -- and it additionally reaches the practice screen, which belongs to practise-todays-recommendation. A reviewer checking step 4 alone will find only part of the change; possibleConflicts records the full span.\n\nSEARCH DOES NOT WORK IN THE LANGUAGE THE DATA IS WRITTEN IN. Both search boxes filter with title.toLowerCase().includes(query), which does nothing useful for Persian. Reproduced by running the real modules: typing 'daramad' does not find درآمد, and typing 'كرشمه' with an Arabic kaf -- which is what an iOS Arabic keyboard produces -- does not find 'کرشمه' stored with a Persian kaf. So the keyboard on the phone can emit characters that will never match the seeded Setar and Tar data. persianSearchMatch, which folds exactly these, has existed and been tested this whole time and is imported by no screen.\n\nTHE APP HAS THREE IDEAS OF WHICH INSTRUMENT YOU ARE ON. Today, Start, Quick Add and the Session Plan use the persisted session instrument. Repertoire keeps its own dropdown that resets to every-instrument on every visit. Lessons has neither and lists every instrument at once, so on the phone 40-plus Setar classes stack above Tar and Guitar with no way to narrow.\n\nAND AN ITEM NEVER SHOWS ITS OWN MATERIAL. The item page already knows which lessons it came from and renders them as a bare link to the lessons list -- not to the lesson, and never to the class video or score that lesson holds. During practice there is nothing at all. Meanwhile adding a NAS reference still means typing a path from memory, even though the NAS already serves browsable directory listings that nothing in the app links to; and pasting a full URL, which does work, silently pins that reference to one device's route to the NAS.",
    "instead": "Everything the app already knows reaches you where you are -- and it stores nothing new to do it.\n\nSearch finds what you mean: both boxes go through the existing Farsi-aware matcher, so an Arabic kaf finds a Persian kaf, spelling variants fold together, and 'daramad' finds درآمد. Repertoire and Lessons open on the instrument you are actually practising, from the same session instrument every other screen uses, each keeping a visible way to widen to all. A piece lists the files that already belong to it -- the class video and score from the lessons it is linked to, and its own attachments -- and that same list is one closed disclosure away while you play, with a photo of the page inline and everything else an explicit open, never an embed. And you stop typing paths: a Browse link opens the NAS where you already configured it, and a URL you paste back is stored RELATIVE to that base, so the reference keeps working on every device whatever route that device takes to the NAS.",
    "keep": [
      "The cross-instrument view survives: Repertoire and Lessons default to one instrument but both keep a visible way to widen to all, so narrowing stays a default you can undo rather than a capability removed.",
      "The Farsi matcher itself is unchanged -- only the two screens that never called it.",
      "Nothing new is persisted to show an item's material; it is composed from lesson links and attachments that already exist.",
      "Large media stays on the NAS: files are opened, never fetched into attachments, sync or backups.",
      "Active practice stays calm -- one collapsed disclosure, closed by default, never above the timer.",
      "No timer, wake-lock or boundary-signal behaviour changes, and no viewer concern can influence a recorded minute.",
      "No schema change and no CSP change: SCHEMA_VERSION stays 11 and the production build's policy is untouched.",
      "Everything still works fully offline; an unset or unreachable NAS degrades to a plain explanation, never an error, and never blocks practising."
    ],
    "assumptions": [
      "The NAS is served over the LAN by nginx at https://192.168.0.20:5010 with real browsable directory listings -- verified by probe, not taken from DECISIONS.md, which records a Tailscale mechanism that is not installed on this Mac.",
      "Its certificate is Synology's self-signed default and does not match the IP, so each device accepts it once. That is infrastructure; this lane surfaces the consequence and does not try to solve it.",
      "Whether to stay on the LAN address or move to something like Tailscale is your decision to make later. Storing references relative to the configured base is what keeps that decision free.",
      "A pasted URL from a different origin is left absolute rather than rewritten -- it is a deliberate external link.",
      "Most Setar material arrives through classes, so composing an item's files from its lessons covers the common case; an item with no lesson link needs a stored reference of its own, which is a separate schema change."
    ],
    "showMe": "On the phone, search your practice list for a gusheh using the Persian keyboard -- it is found, including when the keyboard gives you an Arabic kaf or yeh, and typing 'daramad' finds درآمد too. Open Repertoire and Lessons: both are already showing the instrument you are practising, not all three, and both still let you widen to everything in one tap.\n\nOpen a piece that came from a class. Its class video and score are listed right there on the item, and each opens on the NAS. Start a block on it and the same list is one tap away behind a closed disclosure -- a photo of the page shows inline while the timer keeps running, and the target signal still fires exactly as before.\n\nThen add a new reference without typing a path: tap Browse, find the file in the NAS listing, copy its URL, paste it in, save. Change your NAS base URL to a different form of the same host and the reference still opens -- because what got stored was the path, not the address of one device's route to it."
  },
  "desiredRules": [],
  "docsDelta": [
    "AGENTS.md",
    "CLAUDE.md",
    "DECISIONS.md",
    "FUTURE.md",
    "README.md"
  ]
}
```
````

## The approved Delta this change must deliver

# Everything the app already knows reaches you where you are -- and it stores nothing new to do it.

Search finds what you mean: both boxes go through the existing Farsi-aware matcher, so an Arabic kaf finds a Persian kaf, spelling variants fold together, and 'daramad' finds درآمد. Repertoire and Lessons open on the instrument you are actually practising, from the same session instrument every other screen uses, each keeping a visible way to widen to all. A piece lists the files that already belong to it -- the class video and score from the lessons it is linked to, and its own attachments -- and that same list is one closed disclosure away while you play, with a photo of the page inline and everything else an explicit open, never an embed. And you stop typing paths: a Browse link opens the NAS where you already configured it, and a URL you paste back is stored RELATIVE to that base, so the reference keeps working on every device whatever route that device takes to the NAS.

_approved · about "browse-my-repertoire" step 4_

## Today

This Flow promises the right piece is found and opened in a couple of taps, 'from whichever way of thinking about it came first' -- step 3 narrowing to one instrument, step 4 filtering the practice list by search, step 5 opening the item. Verified at 5325ce31, each breaks differently. This Delta is anchored at step 4, where the failure is sharpest and reproducible, but it spans steps 3 to 5 of this Flow -- narrowing to one instrument, filtering by search, and opening the item -- and it additionally reaches the practice screen, which belongs to practise-todays-recommendation. A reviewer checking step 4 alone will find only part of the change; possibleConflicts records the full span.

SEARCH DOES NOT WORK IN THE LANGUAGE THE DATA IS WRITTEN IN. Both search boxes filter with title.toLowerCase().includes(query), which does nothing useful for Persian. Reproduced by running the real modules: typing 'daramad' does not find درآمد, and typing 'كرشمه' with an Arabic kaf -- which is what an iOS Arabic keyboard produces -- does not find 'کرشمه' stored with a Persian kaf. So the keyboard on the phone can emit characters that will never match the seeded Setar and Tar data. persianSearchMatch, which folds exactly these, has existed and been tested this whole time and is imported by no screen.

THE APP HAS THREE IDEAS OF WHICH INSTRUMENT YOU ARE ON. Today, Start, Quick Add and the Session Plan use the persisted session instrument. Repertoire keeps its own dropdown that resets to every-instrument on every visit. Lessons has neither and lists every instrument at once, so on the phone 40-plus Setar classes stack above Tar and Guitar with no way to narrow.

AND AN ITEM NEVER SHOWS ITS OWN MATERIAL. The item page already knows which lessons it came from and renders them as a bare link to the lessons list -- not to the lesson, and never to the class video or score that lesson holds. During practice there is nothing at all. Meanwhile adding a NAS reference still means typing a path from memory, even though the NAS already serves browsable directory listings that nothing in the app links to; and pasting a full URL, which does work, silently pins that reference to one device's route to the NAS.

## Instead

Everything the app already knows reaches you where you are -- and it stores nothing new to do it.

Search finds what you mean: both boxes go through the existing Farsi-aware matcher, so an Arabic kaf finds a Persian kaf, spelling variants fold together, and 'daramad' finds درآمد. Repertoire and Lessons open on the instrument you are actually practising, from the same session instrument every other screen uses, each keeping a visible way to widen to all. A piece lists the files that already belong to it -- the class video and score from the lessons it is linked to, and its own attachments -- and that same list is one closed disclosure away while you play, with a photo of the page inline and everything else an explicit open, never an embed. And you stop typing paths: a Browse link opens the NAS where you already configured it, and a URL you paste back is stored RELATIVE to that base, so the reference keeps working on every device whatever route that device takes to the NAS.

## Keep

- The cross-instrument view survives: Repertoire and Lessons default to one instrument but both keep a visible way to widen to all, so narrowing stays a default you can undo rather than a capability removed.
- The Farsi matcher itself is unchanged -- only the two screens that never called it.
- Nothing new is persisted to show an item's material; it is composed from lesson links and attachments that already exist.
- Large media stays on the NAS: files are opened, never fetched into attachments, sync or backups.
- Active practice stays calm -- one collapsed disclosure, closed by default, never above the timer.
- No timer, wake-lock or boundary-signal behaviour changes, and no viewer concern can influence a recorded minute.
- No schema change and no CSP change: SCHEMA_VERSION stays 11 and the production build's policy is untouched.
- Everything still works fully offline; an unset or unreachable NAS degrades to a plain explanation, never an error, and never blocks practising.

## New assumptions

- The NAS is served over the LAN by nginx at https://192.168.0.20:5010 with real browsable directory listings -- verified by probe, not taken from DECISIONS.md, which records a Tailscale mechanism that is not installed on this Mac.
- Its certificate is Synology's self-signed default and does not match the IP, so each device accepts it once. That is infrastructure; this lane surfaces the consequence and does not try to solve it.
- Whether to stay on the LAN address or move to something like Tailscale is your decision to make later. Storing references relative to the configured base is what keeps that decision free.
- A pasted URL from a different origin is left absolute rather than rewritten -- it is a deliberate external link.
- Most Setar material arrives through classes, so composing an item's files from its lessons covers the common case; an item with no lesson link needs a stored reference of its own, which is a separate schema change.

## Show me

On the phone, search your practice list for a gusheh using the Persian keyboard -- it is found, including when the keyboard gives you an Arabic kaf or yeh, and typing 'daramad' finds درآمد too. Open Repertoire and Lessons: both are already showing the instrument you are practising, not all three, and both still let you widen to everything in one tap.

Open a piece that came from a class. Its class video and score are listed right there on the item, and each opens on the NAS. Start a block on it and the same list is one tap away behind a closed disclosure -- a photo of the page shows inline while the timer keeps running, and the target signal still fires exactly as before.

Then add a new reference without typing a path: tap Browse, find the file in the NAS listing, copy its URL, paste it in, save. Change your NAS base URL to a different form of the same host and the reference still opens -- because what got stored was the path, not the address of one device's route to it.


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

Find it and open it: Farsi search, one instrument in view, and every file already linked to a piece

## Stay in scope — you may ONLY change

- AGENTS.md
- CLAUDE.md
- DECISIONS.md
- FUTURE.md
- README.md
- src/components/ItemMaterial.tsx
- src/domain/index.ts
- src/domain/itemFiles.test.ts
- src/domain/itemFiles.ts
- src/domain/recordings.test.ts
- src/domain/recordings.ts
- src/domain/selectors.test.ts
- src/domain/selectors.ts
- src/pages/ActiveBlock.tsx
- src/pages/ItemDetail.tsx
- src/pages/Lessons.tsx
- src/pages/Repertoire.tsx
- src/pages/Settings.tsx
- src/pages/StartBlock.tsx
- src/store/lookups.ts
- src/store/useStore.ts
- src/components/Attachments.tsx
- src/components/ItemCard.tsx

Never touch:

- src/domain/types.ts
- src/domain/migrations.ts
- src/domain/migrations.test.ts
- src/domain/farsi.ts
- src/domain/farsi.test.ts
- src/domain/scheduling.ts
- src/domain/scoring.ts
- src/domain/recommend.ts
- src/domain/practiceSignal.ts
- src/domain/practiceSignal.test.ts
- src/components/useScreenAwake.ts
- src/components/screenAwake.ts
- src/domain/routines.ts
- src/pages/RoutineRunner.tsx
- src/store/syncEngine.ts
- src/store/gitRemote.ts
- src/domain/sync.ts
- vite.config.ts
- package.json
- scripts/scan-setar-classes.mjs
- No schema change and no migration. SCHEMA_VERSION stays 11 and no persisted shape changes -- src/domain/types.ts and src/domain/migrations.ts are forbidden so this is mechanical rather than asserted. The only field this lane writes differently is the TEXT of an existing LessonRecording.path, normalised to relative; its type and meaning are unchanged.
- No CSP change. src/vite.config.ts is forbidden. Images render from blob: which the production CSP already allows; nothing is embedded in a frame and no new origin is added, so the build-only CSP cannot diverge from dev in this lane.
- No timer, wake-lock or practice-signal behaviour changes. practiceSignal.ts, useScreenAwake.ts and screenAwake.ts are forbidden, and no material or viewer concern may influence a recorded minute, the wake lock, or a boundary announcement.
- Active practice stays calm. The material list is ONE collapsed disclosure, closed by default, in the same shape as the existing 'About this piece' -- not a panel, not a viewer, not a dashboard, and never above the timer.
- Large media stays on the NAS. This lane adds no way for a NAS file's bytes to enter attachments, IndexedDB, sync or a backup; NAS files are opened, never embedded or downloaded into the app.
- The Farsi matcher itself is not retuned. persianSearchMatch, normalizePersian, faCollator and the transliteration aliases keep their current behaviour exactly -- farsi.ts is forbidden; only the two screens that never called it change.
- The cross-instrument view survives. Repertoire and Lessons DEFAULT to the session instrument but keep a visible override, so browse-my-repertoire's recorded step 3 stays true and the Overview remains a deliberate secondary choice rather than something removed.
- No new persisted state of any kind. Every file shown on an item is composed from links that already exist -- lesson.itemIds, lesson.recordings and attachments -- and nothing is written to make that view work.
- The NAS base URL and the GitHub token stay per-device in localStorage, out of exports, backups and synced data.
- Everything still works fully offline and local-first. A missing or unreachable NAS base degrades to a disabled or absent action with a plain explanation, never an error state, and never blocks practising.
- Scheduling, scoring and recommendation behaviour are untouched: scheduling.ts, scoring.ts and recommend.ts are forbidden.
- The documentation compaction must stay a COMPACTION. AGENTS.md remains the single canonical normative file and must keep every product rule, invariant, safety constraint and architecture rule it holds today -- in particular the schema/migration rule under 'Storage is async', 'Domain logic stays pure', 'Tests are not optional', and every Hard do-not. The only content removed anywhere is the ten-line 'When you add a feature' section, whose four rules were each verified to survive in AGENTS.md, in the signed .prismatica/rules.md, or as a mechanical gate check. Nothing normative may be dropped beyond that, and no rule may be reworded while being moved.
- CLAUDE.md stays a pointer. After the compaction it imports `@AGENTS.md` and holds only Claude-specific operational notes; no product rule, invariant or architecture rule may be written back into it. Anything a non-Claude agent also needs belongs in AGENTS.md. The previous instruction to keep the two byte-identical is obsolete and must not be revived.
- Prismatica's own records are immutable history. .prismatica/contracts, packs, intents and reviews reference CLAUDE.md as it stood when they were written; they are NOT rewritten to match the compaction, and nothing in .prismatica is in this lane's scope.
- The scan:nas index and in-app picker (review B2). Re-assessed on fresh evidence and deliberately deferred: the NAS already serves browsable directory listings, so browse-copy-paste closes most of the gap, while a scanner would add a build script, a generated reference module, a staleness story and a Mac-only dependency -- and it CREATES new reference data, which is exactly what this lane's thesis excludes. Revisit only if browsing and pasting proves insufficient in real use.
- First-class item-level NAS references (review B3 in full). Needs a new persisted field on PracticeItem, therefore a SCHEMA_VERSION bump and heavy tier under the repo's own tierRules. The cheap route in this lane covers items linked to a lesson, which is most of the owner's Setar material; an item with no lesson link is the honest gap and is the follow-on's reason to exist.
- Embedding local PDFs in a frame (part of review B4). Would need frame-src blob: in the build-only CSP, verifiable only via npm run preview, and iOS Safari is unreliable at rendering PDFs in frames -- so the most fragile part would sit on the device that needs it most. Excluding it keeps vite.config.ts forbidden and removes dev-versus-production CSP divergence from this lane entirely.
- Choosing the NAS transport (LAN IP versus Tailscale or a reverse proxy) and anything about the self-signed certificate. Infrastructure, not app code. This lane makes the choice REVERSIBLE by storing references relative to the configured base, and records what is actually running in DECISIONS.md, but does not make the decision.
- Review A3 -- SM-2 advancing reps on every closed block rather than once per due date. Still open and still valuable, but it changes what r-practice-completes-reviews means and needs its own owner decision. scheduling.ts is forbidden here.
- Review A5 -- dormant/'Resting' items still scored and still eligible for the Maintenance card. Verified still open (scoring.ts:22, recommend.ts:37). One predicate fixes it, but it is about which item is RECOMMENDED, not about finding and opening material. scoring.ts and recommend.ts are forbidden here.
- Review A12 -- eight remaining frozen-`now` sites (CloseBlock, SessionPlan, Repertoire x2, ItemDetail, Lessons x2, TeacherReport) and SessionPlan's reseed key, which still uses build.generatedAt derived from the frozen now and therefore can still never fire. Today and Insights were fixed by the previous lane. A shared useCurrentDay belongs in its own lane rather than being half-done inside this one.
- Review A11 (an item can still be made its own parent -- ItemForm.tsx:75 does not exclude the edited id), A13 (a malformed backup attachment entry is still skipped at backup.ts:274 then destroyed by the blob replacement), A14 (insights and the Teacher Report still mix 'during this period' with 'right now'), A15 and A18 (remaining truthful-copy and spec drift beyond DECISIONS.md).
- Review B5 -- the iPhone bottom bar after keyboard dismissal. Device-specific, unrelated to this lane's files, and needs its own manual:OWNER evidence.
- Adding jsdom, fake-indexeddb, Playwright or any component/browser test harness (review E1). vitest stays environment:'node'; decisions move into pure functions instead. Enabling the .prismatica journeys check is its own lane.
- Rewriting .prismatica records (contracts, packs, intents, reviews) that mention CLAUDE.md. They are immutable history describing what the contract said at the time, and nothing in .prismatica is in scope. Also excluded: filling .prismatica/product-map.md, which is still unfilled placeholders, and refreshing docs/product-spec.md, which predates pathways, routines, the Session Plan and sync -- both are real documentation debt but neither is what this lane is about.

## Definition of done

- **ac-1** — The Farsi failure that actually bites on the owner's phone, with its counterexample: a query typed with an ARABIC kaf matches a title stored with a PERSIAN kaf, while a genuinely unrelated Persian query still does not match. Proves the search screens now fold variants without becoming a match-everything filter. → proven by `matches a Persian title when the query uses the Arabic kaf and still rejects an unrelated query`
- **ac-2** — Latin transliteration, with its counterexample: searching 'daramad' finds درآمد, and an unrelated Latin word finds nothing. Verified failing against the current toLowerCase().includes() predicate before the change. → proven by `finds a Persian title from its Latin transliteration and rejects an unrelated Latin query`
- **ac-3** — The instrument default is a pure choice, discriminating all three states: a real session instrument seeds the filter, the explicit cross-instrument 'all' sentinel seeds the every-instrument view, and a session instrument that no longer resolves in the database falls back to every-instrument rather than to an empty screen. → proven by `seeds the filter from a resolvable session instrument, widens for all, and falls back when it no longer exists`
- **ac-4** — An item's material is composed from links that already exist: the NAS references of every lesson the item is linked to, plus the item's own attachments, in a deterministic order. References are deduplicated BY PATH, so the same file referenced from two different lessons the item is linked to appears once, not twice. → proven by `lists a linked lesson's references with the item's attachments, deduplicating references by path`
- **ac-5** — The counterexample that makes the composition meaningful rather than a broad sweep: references belonging to a lesson the item is NOT linked to never appear, and an item with no lessons and no attachments yields an empty list rather than an empty frame. → proven by `excludes references from lessons the item is not linked to and returns nothing when it has none`
- **ac-6** — The two kinds of material open by completely different mechanisms -- a NAS reference resolves through the configured base URL, a local attachment through a blob -- so each composed entry carries which one it is. This is what stops a NAS reference being opened as a blob, or an attachment being pushed through the base URL and 404ing. Note the two types share no identity field (LessonRecording has path, AttachmentMeta has name), so they are never merged: deduplication is within a kind, never across them. → proven by `tags every entry with how it opens so a reference is never treated as an attachment`
- **ac-7** — THE TRANSPORT-INDEPENDENCE RULE, three-way discriminating: a pasted URL that sits UNDER the configured base is stored RELATIVE, a pasted URL on a DIFFERENT origin is kept absolute rather than rewritten or rejected, and an already-relative path is stored unchanged. This is what keeps every reference working when the base URL changes. → proven by `stores a pasted URL under the base as relative, keeps a foreign origin absolute, and leaves a relative path alone`
- **ac-8** — The same normalisation must never mangle input it cannot reason about: with no base URL configured, a pasted absolute URL is stored exactly as given, and a blank or unparseable base changes nothing. → proven by `stores a pasted URL unchanged when no usable base URL is configured`
- **ac-9** — A stored reference survives a change of transport, which is the whole point: the same relative path resolves correctly under the LAN base and under a completely different base, proving no reference is pinned to one device's route to the NAS. → proven by `resolves the same relative reference correctly under two different base URLs`
- **ac-10** — The Browse action is offered only when it can actually work, discriminating both directions: a valid configured base yields a browsable URL, while a blank or unparseable base yields none rather than a dead link or a same-origin request. → proven by `offers a browse target for a valid base and none for a blank or unparseable one`
- **ac-11** — What may be shown inline during practice, decided as a pure property of each composed entry in itemFiles.ts rather than inline in the component, with its counterexample: a local image attachment is inline-renderable, while a PDF, an audio file and every NAS reference are open-only. This is the rule that keeps the practice screen from becoming a viewer and keeps the whole lane inside the existing production CSP -- a NAS image could not render inline under a static CSP in any case, because the NAS origin is not knowable at build time. → proven by `treats a local image as inline-renderable and every PDF, audio file and NAS reference as open-only`
- **ac-12** — On the owner's own devices and against the PRODUCTION build, because none of this can be proven in Node. FIRST, the documentation compaction: open a fresh Claude Code session in this repo and confirm the `@AGENTS.md` import in the trimmed CLAUDE.md actually resolves, so the normative rules are still in context -- if that import silently fails, a builder would be left with an 865-byte file and no product rules at all, which is the one way this compaction could do harm. Run npm run preview (never dev -- the CSP is injected at build only) and confirm: (a) On the MacBook, an item that came from a class lists that class's video and score, and each opens on the NAS. (b) Settings' Browse link opens a real directory listing at the NAS base. (c) Copy a file URL from that listing, paste it as a lesson reference, save, and confirm the stored value is RELATIVE -- then change the base URL to a different form of the same host and confirm the reference still resolves. (d) Start a block on an item with a photo attached: the photo shows inline behind one closed disclosure, the timer keeps running while it is open, and the target signal still fires. (e) On the iPhone, Repertoire and Lessons open on the instrument you are practising and both still widen to all; search for a gusheh using the Persian keyboard and find it. (f) Also on the iPhone, tap a NAS link: if it is blocked, confirm whether the cause is the self-signed certificate prompt rather than the app, and record which -- a certificate prompt is infrastructure, not a defect in this lane. → proven by `manual:OWNER`

## Docs to update as part of this change

- AGENTS.md
- CLAUDE.md
- DECISIONS.md
- FUTURE.md
- README.md

## Recommended skills (quality only — never gates)

- **ui-work** — visual / front-end work — layout, styling, interaction — _(use your agent’s equivalent)_
- **build** — implementing the change against the contract — _(use your agent’s equivalent)_
- **simplify** — reducing risk by simplifying the change — _(use your agent’s equivalent)_

## Current progress

Last checks passed (2026-09-11T03:03:53.496Z). Rework loops so far: 1.

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

