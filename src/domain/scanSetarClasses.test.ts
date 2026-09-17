import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, utimesSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
// The scanner is an operator-run Node tool (.mjs) so a NAS needs no bundler and
// no app dependencies — but its grammar is the ONE place a filename becomes an
// identity, so every rule in it is exercised here. The facade below is the
// shape under test; the module itself carries no types.
interface Piece {
  key: string;
  form: string;
  piece: string;
  dastgah: string;
  composer: string;
  aliases: string[];
  sessions: number[];
  notes: string;
  provisional: boolean;
  mediumConfidence: boolean;
}
interface Resource {
  path: string;
  role: string;
  kind: string;
  title: string;
  part: number | null;
  size: number;
  pieces: string[];
  group: string | null;
}
interface Session {
  n: number;
  date: string;
  folder: string;
  roster: string[];
  rosterTrusted: boolean;
  hasClassRecording: boolean;
  resources: Resource[];
  members: { key: string; roles: string[] }[];
}
interface Index {
  pieces: Piece[];
  sessions: Session[];
  renames: { from: string; to: string }[];
  diagnostics: { path: string; reason: string }[];
  contentHash: string;
}
interface Entry {
  path: string;
  size: number;
}
interface Scanner {
  buildIndex(input: { registryText: string; inventory: Entry[]; renameLogText?: string }): Index;
  contentHash(body: unknown): string;
  parseAssetStem(stem: string): { role: string; piece: string | null; part: number | null } | null;
  parseCsv(text: string): string[][];
  parseRegistry(text: string): Piece[];
  parseSessionFolderName(name: string): { n: number; date: string } | null;
  scanArchive(root: string): Entry[];
  scanToIndex(root: string): Index;
  writeIndexAtomically(outPath: string, text: string, root?: string): string;
  isSafeRelativePath(p: string): boolean;
  displayTitle(stem: string): string;
}
// @ts-expect-error — no type declarations for the .mjs operator tool.
import * as scannerModule from '../../scripts/scan-setar-classes.mjs';
const {
  buildIndex,
  contentHash,
  parseAssetStem,
  parseCsv,
  parseRegistry,
  parseSessionFolderName,
  scanArchive,
  scanToIndex,
  writeIndexAtomically,
  isSafeRelativePath,
  displayTitle,
} = scannerModule as Scanner;

// ---------------------------------------------------------------------------
// Real rows from the archive's own PIECES.csv. Registry notes are trimmed to
// their first sentence — the caveat survives, the research prose does not
// travel into a checked-in fixture — EXCEPT the one row kept verbatim because
// its quoting is the thing under test.
// ---------------------------------------------------------------------------

const HEADER = 'canonical_fa,form,piece,dastgah,composer,aliases_seen,sessions,notes';

const REGISTRY_ROWS = [
  'چهارمضراب-اول-دشتی-صبا,چهارمضراب,دشتی(اول),دشتی,صبا,chahar-mezarabe-avale-dashti|4mez-aval-dashti,1,Confirmed from PDF and jpg score.',
  // Verbatim: embedded commas AND doubled quotes inside one quoted field.
  'رنگ-ماهور-درویش-خان,رنگ,ماهور,ماهور,درویش-خان,renge-mahoor-darvish|renge-mahoor-darvish-sevom-1402-05-22,1,"Confirmed from PDF. ""sevom"" in filename is a version/take marker, not part of the name. Distinct from رنگ-ماهور-راک-برومند (session 21), a different arrangement."',
  'تمرین-دشتی-1-علیزاده,تمرین,دشتی-1,دشتی,علیزاده,study-of-dashti-1-alizadeh|تمرین-دشتی-۳,"4,5",Repeat chain 4->5.',
  'عراق,(standalone),عراق,,,araq,12,Matches the brief\'s own worked example exactly.',
  'رنگ-اصفهان-پریچهر-و-پریزاد-درویش-خان,رنگ,اصفهان(پریچهر-و-پریزاد),اصفهان,درویش-خان,renge-esfehan-paricherandparizad-darvish,16,Confirmed from PDF.',
  'پیش-درامد-ماهور-هرمزی,پیش-درامد,ماهور,ماهور,هرمزی,pishdaramade-mahur-hormozi,"16,17,18",Repeat chain 16->17->18 (3 sessions).',
  'چهارمضراب-ماهور-صبا,چهارمضراب,ماهور,ماهور,صبا,chaharmezrabe-mahur-sabaa,"9,10,11,12,16",Repeat chain 9->10->11->12.',
  'به-زندان-شوشتری,(قطعه),به-زندان,شوشتری,,be-zendan-shushtari,"28,29",Repeat chain 28->29 (2 parts).',
  'ضربی-شکسته-لطفی,ضربی,شکسته,,لطفی,zarbiye-shekasteh-lotfi-1,"27,28",Repeat chain 27->28 (2 parts).',
  'پیش-درامد-سه-گاه-فروتن,پیش-درامد,سه-گاه,سه-گاه,فروتن,pish-daramade-segah-forutan-1|pish-daramade-segah-forutan-6,"22,23,24,25,26,27","Longest repeat chain in the archive: 22->23->24->25->26->27 (6 sessions, only session 22 should get a نمونه)."',
  'ماهور-ردیف-میرزاعبدالله,(ردیف),ماهور,ماهور,,movie-on-16-04-2024-at-*,7,PROVISIONAL dastgah-level name.',
  'هفت-ضربی-چهارگاه-علیزاده,هفت-ضربی,چهارگاه,چهارگاه,علیزاده,haft-zarbi-chahargah-alizadeh-1,"5,6",Repeat chain 5->6 (2 parts).',
  'چهار-پاره,چهارپاره,چهار-پاره,ابوعطا,,abouata-chaharpareh-1,"4,5",Repeat chain 4->5 (2 parts).',
  'سیخی-ابوعطا,گوشه,سیخی,ابوعطا,,abouata-sayakhi,3,MEDIUM confidence.',
  // Session 13's full roster: eight canonical pieces.
  'ضربی-عراق-ماهور-میرزا-حسینقلی,ضربی,عراق,ماهور,میرزا-حسینقلی,zarbi-araaq-mahur-mirzahoseyngholi,13,Confirmed from PDF.',
  'اصفهانک-در-عراق,گوشه,اصفهانک,عراق(ماهور),,esfahaanak-dar-araaq,13,Part of the عراق gusheh-sequence.',
  'حزین-در-عراق,گوشه,حزین,عراق(ماهور),,hazin-dar-araaq,13,Confirmed via web search.',
  'کرشمه-در-عراق,گوشه,کرشمه,عراق(ماهور),,kereshmeh-dar-araaq,13,Distinct from کرشمه-راک.',
  'محیر-در-عراق,گوشه,محیر,عراق(ماهور),,mohayyer-dar-araaq,13,Confirmed spelling محیّر via web search.',
  'نهیب-در-عراق,گوشه,نهیب,عراق(ماهور),,nahib-dar-araaq,13,Confirmed via web search.',
  'زنگوله-در-عراق,گوشه,زنگوله,عراق(ماهور),,zanguleh-dar-araaq,13,Distinct from زنگوله-بیات-ترک.',
  'آشوراوند,(standalone),آشوراوند,راک(ماهور),,ashur-aavand,13,Confirmed via web search as one solid word.',
];

const REGISTRY = [HEADER, ...REGISTRY_ROWS].join('\n') + '\n';

/** A real slice of the archive: paths exactly as they are on disk. */
const INVENTORY: Entry[] = [
  { path: 'session-1-26-09-2023/ضبط-کلاس-1.mp4', size: 47_321_598 },
  { path: 'session-1-26-09-2023/ضبط-کلاس-2.mp4', size: 41_770_634 },
  { path: 'session-1-26-09-2023/ضبط-کلاس-3.mp4', size: 16_587_151 },
  { path: 'session-1-26-09-2023/نت-چهارمضراب-اول-دشتی-صبا.pdf', size: 120_000 },
  { path: 'session-1-26-09-2023/نت-چهارمضراب-اول-دشتی-صبا.jpg', size: 90_000 },
  { path: 'session-1-26-09-2023/نت-رنگ-ماهور-درویش-خان.pdf', size: 110_000 },
  { path: 'session-1-26-09-2023/تمرین-من-رنگ-ماهور-درویش-خان.mp4', size: 15_200_000 },
  { path: 'session-5-23-01-2024/تمرین-من-تمرین-دشتی-1-علیزاده.mp4', size: 9_000_000 },
  { path: 'session-5-23-01-2024/تمرین-من-چهار-پاره.mp4', size: 8_000_000 },
  { path: 'session-5-23-01-2024/تمرین-من-هفت-ضربی-چهارگاه-علیزاده.mp4', size: 7_000_000 },
  { path: 'session-5-23-01-2024/نت-هفت-ضربی-چهارگاه-علیزاده.pdf', size: 100_000 },
  { path: 'session-5-23-01-2024/ضبط-کلاس.mp4', size: 402_863_504 },
  { path: 'session-5-23-01-2024/نمونه-1.mp4', size: 60_000_000 },
  { path: 'session-5-23-01-2024/نمونه-2.mp4', size: 30_000_000 },
  { path: 'session-9-14-05-2024/تمرین-من-چهارمضراب-ماهور-صبا.mp4', size: 5_000_000 },
  { path: 'session-10-11-06-2024/تمرین-من-چهارمضراب-ماهور-صبا.mp4', size: 5_100_000 },
  { path: 'session-12-06-08-2024/تمرین-من-عراق.mp4', size: 4_000_000 },
  { path: 'session-12-06-08-2024/ضبط-کلاس.mp4', size: 99_765_911 },
  { path: 'session-13-03-09-2024/ضبط-کلاس.mp4', size: 90_002_728 },
  { path: 'session-13-03-09-2024/نمونه-1.mp4', size: 55_000_000 },
  { path: 'session-13-03-09-2024/نمونه-2.mp4', size: 22_000_000 },
  { path: 'session-13-03-09-2024/نت-ضربی-عراق-ماهور-میرزا-حسینقلی.pdf', size: 130_000 },
  { path: 'session-13-03-09-2024/تمرین-من-کرشمه-در-عراق.mp4', size: 3_000_000 },
  { path: 'session-16-26-11-2024/ضبط-کلاس.mp4', size: 84_518_794 },
  { path: 'session-16-26-11-2024/تصحیح-پیش-درامد-ماهور-هرمزی.pdf', size: 210_000 },
  { path: 'session-16-26-11-2024/تصحیح-چهارمضراب-ماهور-صبا.pdf', size: 190_000 },
  { path: 'session-16-26-11-2024/نت-رنگ-اصفهان-پریچهر-و-پریزاد-درویش-خان.pdf', size: 150_000 },
  { path: 'session-16-26-11-2024/تمرین-من-رنگ-اصفهان-پریچهر-و-پریزاد-درویش-خان.mp4', size: 6_000_000 },
  // The one un-normalised file in the whole archive (brief §8.1).
  { path: 'session-16-26-11-2024/video-2024-10-29-15-32-35.mp4', size: 12_000_000 },
  { path: 'session-22-13-05-2025/تمرین-من-پیش-درامد-سه-گاه-فروتن.mp4', size: 3_500_000 },
  { path: 'session-22-13-05-2025/نمونه.mp4', size: 40_000_000 },
  { path: 'session-23-10-06-2025/تمرین-من-پیش-درامد-سه-گاه-فروتن.mp4', size: 3_600_000 },
  { path: 'session-24-08-07-2025/تمرین-من-پیش-درامد-سه-گاه-فروتن.mp4', size: 3_700_000 },
  { path: 'session-25-05-08-2025/تمرین-من-پیش-درامد-سه-گاه-فروتن.mp4', size: 3_800_000 },
  { path: 'session-26-02-09-2025/تمرین-من-پیش-درامد-سه-گاه-فروتن.mp4', size: 3_900_000 },
  { path: 'session-27-30-09-2025/تمرین-من-پیش-درامد-سه-گاه-فروتن.mp4', size: 4_100_000 },
  { path: 'session-27-30-09-2025/تمرین-من-ضربی-شکسته-لطفی.mp4', size: 2_100_000 },
  { path: 'session-27-30-09-2025/ضبط-کلاس-1.mp4', size: 50_000_000 },
  { path: 'session-27-30-09-2025/ضبط-کلاس-2.mp4', size: 43_432_037 },
  { path: 'session-27-30-09-2025/نمونه.mp4', size: 38_000_000 },
  { path: 'session-28-28-10-2025/نمونه-به-زندان-شوشتری.mp4', size: 20_000_000 },
  { path: 'session-28-28-10-2025/نت-به-زندان-شوشتری.pdf', size: 140_000 },
  { path: 'session-28-28-10-2025/تمرین-من-به-زندان-شوشتری.mp4', size: 2_500_000 },
  { path: 'session-28-28-10-2025/تمرین-من-ضربی-شکسته-لطفی.mp4', size: 2_600_000 },
];

const build = (over: Partial<{ registryText: string; inventory: Entry[] }> = {}): Index =>
  buildIndex({ registryText: REGISTRY, inventory: INVENTORY, ...over });

const session = (index: Index, n: number): Session => index.sessions.find((s) => s.n === n)!;

const resource = (index: Index, path: string): Resource | undefined =>
  index.sessions.flatMap((s) => s.resources).find((r) => r.path === path);

// ---------------------------------------------------------------------------

describe('the Setar source registry', () => {
  it('setar registry keeps exact Farsi keys and rejects ambiguous CSV input', () => {
    const pieces = parseRegistry(REGISTRY);
    const byKey = new Map(pieces.map((p) => [p.key, p]));
    const pieceOf = (k: string): Piece => byKey.get(k)!;

    // A quoted field carrying commas AND doubled quotes stays ONE field, and
    // every column after it stays in its own column. Splitting on "," would
    // shift dastgah/composer/sessions onto fragments of this sentence.
    const reng = pieceOf('رنگ-ماهور-درویش-خان');
    expect(reng.composer).toBe('درویش-خان');
    expect(reng.sessions).toEqual([1]);
    expect(reng.notes).toContain('"sevom" in filename is a version/take marker');
    expect(reng.notes).toContain('a different arrangement.');

    // Byte identity. The key is the join key with the filenames: an embedded
    // ASCII digit is piece identity, and "-و-" is INSIDE one name.
    expect(byKey.has('تمرین-دشتی-1-علیزاده')).toBe(true);
    expect(pieceOf('تمرین-دشتی-1-علیزاده').sessions).toEqual([4, 5]);
    expect(byKey.has('رنگ-اصفهان-پریچهر-و-پریزاد-درویش-خان')).toBe(true);
    expect(pieces.every((p) => p.key === p.key.normalize('NFC'))).toBe(true);

    // Real forms, carried verbatim. Neither is invented, folded into a
    // neighbouring form, or turned into a categorical claim of its own.
    expect(pieceOf('هفت-ضربی-چهارگاه-علیزاده').form).toBe('هفت-ضربی');
    expect(pieceOf('چهار-پاره').form).toBe('چهارپاره');

    // Caveats are flags on the source row, never a reason to merge or rename.
    expect(pieceOf('ماهور-ردیف-میرزاعبدالله').provisional).toBe(true);
    expect(pieceOf('سیخی-ابوعطا').mediumConfidence).toBe(true);
    expect(pieceOf('چهارمضراب-ماهور-صبا').provisional).toBe(false);

    // aliases_seen is LITERAL SEARCH DATA. It is split on "|" and stored as
    // given — no wildcard is expanded, nothing is transliterated, and no alias
    // is ever consulted to decide which piece a file belongs to.
    expect(pieceOf('ماهور-ردیف-میرزاعبدالله').aliases).toEqual(['movie-on-16-04-2024-at-*']);
    expect(pieceOf('چهارمضراب-اول-دشتی-صبا').aliases).toEqual([
      'chahar-mezarabe-avale-dashti',
      '4mez-aval-dashti',
    ]);
    // The alias "abouata-sayakhi" belongs to سیخی-ابوعطا and to nothing else —
    // it never becomes a second key or a match for another row.
    expect(pieces.filter((p) => p.aliases.includes('abouata-sayakhi'))).toHaveLength(1);

    // --- refusals: an ambiguous registry is not a registry -----------------
    const rowFor = (key: string) => REGISTRY_ROWS.find((r) => r.startsWith(`${key},`))!;
    expect(() => parseRegistry([HEADER, rowFor('عراق'), rowFor('عراق')].join('\n'))).toThrow(
      /two rows for the canonical piece/i,
    );
    expect(() => parseRegistry([HEADER, ',(standalone),x,,,,,12,'].join('\n'))).toThrow(/empty canonical_fa/i);
    expect(() => parseRegistry(['canonical_fa,form,piece', 'x,y,z'].join('\n'))).toThrow(/missing the "dastgah" column/);
    expect(() =>
      parseRegistry([HEADER, 'ابوعطا-تست,گوشه,x,ابوعطا,,,"12,twelve",'].join('\n')),
    ).toThrow(/invalid session number "twelve"/);
    expect(() => parseRegistry([HEADER, 'x,y,z,,,,0,'].join('\n'))).toThrow(/invalid session number "0"/);
    // Malformed quoting: a field that opens a quote and never closes it, and a
    // stray quote in the middle of an unquoted field.
    expect(() => parseCsv('a,b\n"never closed,c')).toThrow(/never closed/i);
    expect(() => parseCsv('a,b\nx"y,c')).toThrow(/unexpected quote/i);
  });
});

describe('the Setar filename grammar', () => {
  it('setar filenames preserve compound roles and report unhandled assets', () => {
    // All seven worked examples from the archive's own brief, asserted exactly.
    expect(parseAssetStem('ضبط-کلاس-2')).toEqual({ role: 'ضبط-کلاس', piece: null, part: 2 });
    expect(parseAssetStem('تمرین-من-عراق')).toEqual({ role: 'تمرین-من', piece: 'عراق', part: null });
    expect(parseAssetStem('نمونه-1')).toEqual({ role: 'نمونه', piece: null, part: 1 });
    expect(parseAssetStem('نمونه-به-زندان-شوشتری')).toEqual({
      role: 'نمونه',
      piece: 'به-زندان-شوشتری',
      part: null,
    });
    expect(parseAssetStem('تصحیح-پیش-درامد-ماهور-هرمزی')).toEqual({
      role: 'تصحیح',
      piece: 'پیش-درامد-ماهور-هرمزی',
      part: null,
    });
    // ROLE BOUNDARY, LONGEST MATCH: "تمرین-من" wins over nothing, and the
    // piece keeps its own leading "تمرین" — token-0 splitting yields "تمرین".
    expect(parseAssetStem('تمرین-من-تمرین-دشتی-1-علیزاده')).toEqual({
      role: 'تمرین-من',
      piece: 'تمرین-دشتی-1-علیزاده',
      part: null,
    });
    // The embedded "-و-" stays INSIDE one canonical name; one file, one piece.
    expect(parseAssetStem('تمرین-من-رنگ-اصفهان-پریچهر-و-پریزاد-درویش-خان')).toEqual({
      role: 'تمرین-من',
      piece: 'رنگ-اصفهان-پریچهر-و-پریزاد-درویش-خان',
      part: null,
    });

    // A part number is TRAILING digits only; an embedded digit is identity.
    expect(parseAssetStem('نت-تمرین-دشتی-1-علیزاده')!.piece).toBe('تمرین-دشتی-1-علیزاده');
    expect(parseAssetStem('نمونه')!.part).toBe(null);
    expect(parseAssetStem('نمونه')!.piece).toBe(null);
    expect(displayTitle('تمرین-من-عراق')).toBe('تمرین من عراق');

    const index = build();

    // The known exception: not parsed, not reassigned to session 15, and named
    // in the diagnostics with something the owner can act on.
    const exception = index.diagnostics.find((d) => d.path.endsWith('video-2024-10-29-15-32-35.mp4'))!;
    expect(exception).toBeDefined();
    expect(exception.reason).toMatch(/no known role/i);
    expect(exception.path.startsWith('session-16-')).toBe(true);
    expect(resource(index, 'session-16-26-11-2024/video-2024-10-29-15-32-35.mp4')).toBeUndefined();
    expect(session(index, 15)).toBeUndefined();
    // No role was guessed for it anywhere.
    expect(
      index.sessions.every((s: { resources: { path: string }[] }) =>
        s.resources.every((r) => !r.path.includes('video-2024-10-29')),
      ),
    ).toBe(true);

    // An unknown piece, an unknown role and an unsupported extension are each
    // SURFACED rather than relabelled into something the archive didn't say.
    const odd = build({
      inventory: [
        { path: 'session-1-26-09-2023/نت-یک-قطعه-ناشناخته.pdf', size: 10 },
        { path: 'session-1-26-09-2023/راهنما-چیزی.pdf', size: 10 },
        { path: 'session-1-26-09-2023/نت-عراق.txt', size: 10 },
      ],
    });
    expect(odd.sessions[0].resources).toEqual([]);
    expect(odd.diagnostics.map((d) => d.reason)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/not in the registry/),
        expect.stringMatching(/no known role/),
        expect.stringMatching(/Unsupported file type "\.txt"/),
      ]),
    );

    // A class recording NEVER carries a piece: a filename claiming one is a
    // contradiction in the source, reported instead of silently scoped.
    const named = build({ inventory: [{ path: 'session-12-06-08-2024/ضبط-کلاس-عراق.mp4', size: 10 }] });
    expect(named.sessions[0].resources).toEqual([]);
    expect(named.diagnostics[0]!.reason).toMatch(/cannot name a piece/);

    // NO LARGEST-FILE HEURISTIC anywhere: the class recording of session 5 is
    // the one NAMED ضبط-کلاس, and the biggest file in session 13 is a demo.
    const s5 = session(index, 5);
    expect(s5.resources.filter((r) => r.role === 'ضبط-کلاس').map((r) => r.path)).toEqual([
      'session-5-23-01-2024/ضبط-کلاس.mp4',
    ]);
    const s13 = session(index, 13);
    const biggest = [...INVENTORY.filter((f) => f.path.startsWith('session-13-'))].sort((a, b) => b.size - a.size)[0]!;
    expect(biggest.path).toBe('session-13-03-09-2024/ضبط-کلاس.mp4');
    expect(s13.hasClassRecording).toBe(true);
    // ...and session 28, whose biggest file is a demo, still has NO class
    // recording rather than the largest video promoted into one.
    const s28 = session(index, 28);
    expect(s28.hasClassRecording).toBe(false);
    expect(s28.resources.some((r) => r.role === 'ضبط-کلاس')).toBe(false);
  });
});

describe('Setar session attribution', () => {
  it('setar session material follows exact roster and demonstration attribution', () => {
    const index = build();

    // Session 13: an UNNAMED two-part demonstration belongs to every canonical
    // member of that session — all eight — because there is no single piece to
    // attribute it to and the information simply is not in the filename.
    const s13 = session(index, 13);
    expect(s13.roster).toHaveLength(8);
    const demo13 = s13.resources.filter((r) => r.role === 'نمونه');
    expect(demo13.map((r) => r.path)).toEqual([
      'session-13-03-09-2024/نمونه-1.mp4',
      'session-13-03-09-2024/نمونه-2.mp4',
    ]);
    for (const part of demo13) expect([...part.pieces].sort()).toEqual([...s13.roster].sort());
    // Its numbered parts are ONE logical demonstration, ordered by part.
    expect(new Set(demo13.map((r) => r.group)).size).toBe(1);
    expect(demo13.map((r) => r.part)).toEqual([1, 2]);

    // Session 28: a NAMED demo belongs to that piece only — never to its
    // sibling ضربی-شکسته-لطفی, which is also a member of session 28.
    const s28 = session(index, 28);
    expect([...s28.roster].sort()).toEqual(['به-زندان-شوشتری', 'ضربی-شکسته-لطفی'].sort());
    const demo28 = s28.resources.filter((r) => r.role === 'نمونه');
    expect(demo28).toHaveLength(1);
    expect(demo28[0].pieces).toEqual(['به-زندان-شوشتری']);
    // ...and no class recording is fabricated for it.
    expect(s28.hasClassRecording).toBe(false);

    // Session 27: two class parts, ordered NUMERICALLY, and each stays with
    // the lesson rather than being scoped to a piece.
    const s27 = session(index, 27);
    const class27 = s27.resources.filter((r) => r.role === 'ضبط-کلاس');
    expect(class27.map((r) => r.part)).toEqual([1, 2]);
    expect(class27.every((r) => r.pieces.length === 0)).toBe(true);

    // FOLDER MEMBERSHIP, not mtime: session 9's and 10's practice recordings
    // of one piece belong to their own folders, and nothing here reads a time.
    expect(index.sessions.map((s) => s.n)).toEqual([...index.sessions.map((s) => s.n)].sort((a: number, b: number) => a - b));
    expect(session(index, 9).members.map((m) => m.key)).toEqual(['چهارمضراب-ماهور-صبا']);
    expect(session(index, 10).members.map((m) => m.key)).toEqual(['چهارمضراب-ماهور-صبا']);

    // Provisional identities are REAL, linkable pieces that keep their caveat.
    const provisional = index.pieces.find((p) => p.key === 'ماهور-ردیف-میرزاعبدالله')!;
    expect(provisional.provisional).toBe(true);
    expect(provisional.sessions).toEqual([7]);

    // The six-session repeat chain is PROVENANCE: six sessions the piece was
    // practised in, carried as membership and roles and nothing else. No
    // resource, no minute, no result and no "six weeks" claim is produced.
    const chain = [22, 23, 24, 25, 26, 27];
    for (const n of chain) {
      const s = session(index, n);
      const member = s.members.find((m) => m.key === 'پیش-درامد-سه-گاه-فروتن')!;
      expect(member.roles).toContain('تمرین-من');
      // The student's own recording is evidence, never material: it is not a
      // resource anywhere in the index.
      expect(s.resources.some((r) => r.path.includes('تمرین-من'))).toBe(false);
    }
    expect(JSON.stringify(index)).not.toContain('week');
    // Only the FIRST session of the chain has a demonstration for it.
    expect(session(index, 22).resources.some((r) => r.role === 'نمونه')).toBe(true);
    expect(session(index, 23).resources).toEqual([]);

    // ROSTER DISAGREEMENT: a folder naming a piece the registry does not place
    // in that session must NOT expand the unnamed demo across a guessed set.
    const disputed = build({
      inventory: [
        { path: 'session-13-03-09-2024/نمونه-1.mp4', size: 10 },
        // عراق is a real registry piece, but its only session is 12.
        { path: 'session-13-03-09-2024/نت-عراق.pdf', size: 10 },
      ],
    });
    const bad13 = session(disputed, 13);
    expect(bad13.rosterTrusted).toBe(false);
    expect(bad13.resources.find((r) => r.role === 'نمونه')!.pieces).toEqual([]);
    expect(disputed.diagnostics.map((d) => d.reason)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/registry does not list session 13/),
        expect.stringMatching(/Unnamed demonstration not attributed/),
      ]),
    );
    // The NAMED score still attaches to its own named piece — only the
    // ambiguous inference is blocked.
    expect(bad13.resources.find((r) => r.role === 'نت')!.pieces).toEqual(['عراق']);
  });
});

describe('scanning the archive', () => {
  it('setar scanning is bounded read-only and produces stable complete indexes', () => {
    const root = mkdtempSync(join(tmpdir(), 'setar-scan-'));
    const out = mkdtempSync(join(tmpdir(), 'setar-out-'));
    try {
      writeFileSync(join(root, 'PIECES.csv'), REGISTRY);
      const folders = new Set(INVENTORY.map((f) => f.path.split('/')[0]));
      for (const folder of folders) mkdirSync(join(root, folder));
      for (const f of INVENTORY) writeFileSync(join(root, f.path), Buffer.alloc(Math.min(f.size, 16)));
      // Things a scan must ignore, all real: a dotfile, NAS housekeeping, an
      // out-of-scope root folder, and a symlink pointing outside the archive.
      writeFileSync(join(root, 'session-1-26-09-2023/.DS_Store'), 'x');
      mkdirSync(join(root, 'session-1-26-09-2023/@eaDir'), { recursive: true });
      mkdirSync(join(root, 'practice'));
      writeFileSync(join(root, 'practice/نت-عراق.pdf'), 'x');
      writeFileSync(join(out, 'outside.mp4'), 'x');
      symlinkSync(join(out, 'outside.mp4'), join(root, 'session-1-26-09-2023/نت-عراق.pdf'));

      const first = scanArchive(root);
      expect(first.some((f) => f.path.includes('.DS_Store'))).toBe(false);
      expect(first.some((f) => f.path.includes('@eaDir'))).toBe(false);
      expect(first.some((f) => f.path.startsWith('practice/'))).toBe(false);
      // The symlink is not followed: its target is outside the archive root.
      expect(first.some((f) => f.path.endsWith('نت-عراق.pdf'))).toBe(false);
      expect(first).toHaveLength(INVENTORY.length);

      // DETERMINISM. Shuffled directory order and altered mtimes produce a
      // byte-identical semantic index: nothing here reads a time or trusts the
      // order the filesystem happened to hand back.
      const scanned = buildIndex({ registryText: REGISTRY, inventory: first });
      const shuffled = [...first].reverse();
      expect(buildIndex({ registryText: REGISTRY, inventory: shuffled }).contentHash).toBe(scanned.contentHash);
      const old = new Date('2001-01-01T00:00:00Z');
      for (const f of INVENTORY) utimesSync(join(root, f.path), old, old);
      expect(buildIndex({ registryText: REGISTRY, inventory: scanArchive(root) }).contentHash).toBe(scanned.contentHash);
      expect(contentHash(scanned)).toBe(scanned.contentHash);
      // ...and the hash is not vacuous: a file whose SIZE changed is a changed
      // archive, so the semantic index changes with it.
      expect(buildIndex({ registryText: REGISTRY, inventory: INVENTORY }).contentHash).not.toBe(scanned.contentHash);

      // Session 9 sorts BEFORE session 10 — numerically, never lexically.
      const ns = scanned.sessions.map((s) => s.n);
      expect(ns.indexOf(9)).toBeLessThan(ns.indexOf(10));
      expect(ns).toEqual([1, 5, 9, 10, 12, 13, 16, 22, 23, 24, 25, 26, 27, 28]);

      // COMPLETENESS: every parseable useful file is in the index exactly once,
      // and the personal recordings are represented only as membership.
      const useful = INVENTORY.filter(
        (f) => !f.path.includes('تمرین-من') && !f.path.includes('video-2024-10-29'),
      );
      const indexed = scanned.sessions.flatMap((s: { resources: { path: string }[] }) => s.resources.map((r) => r.path));
      expect([...indexed].sort()).toEqual(useful.map((f) => f.path).sort());

      // --- refusals ---------------------------------------------------------
      expect(isSafeRelativePath('session-1-26-09-2023/ضبط-کلاس.mp4')).toBe(true);
      for (const unsafe of [
        '../PIECES.csv',
        'session-1/../../etc/passwd',
        '/etc/passwd',
        'session-1\\ضبط.mp4',
        'https://nas.example/x.mp4',
        'file:///etc/passwd',
        'session-1%2F..%2Fx.mp4',
        '',
      ]) {
        expect(isSafeRelativePath(unsafe)).toBe(false);
        expect(() => buildIndex({ registryText: REGISTRY, inventory: [{ path: unsafe, size: 1 }] })).toThrow();
      }
      expect(() =>
        buildIndex({
          registryText: REGISTRY,
          inventory: [
            { path: 'session-1-26-09-2023/نمونه.mp4', size: 1 },
            { path: 'session-1-26-09-2023/نمونه.mp4', size: 2 },
          ],
        }),
      ).toThrow(/share the path/);
      // Two folders claiming one session number are two different identities
      // for one lesson — refused, never merged.
      expect(() =>
        buildIndex({
          registryText: REGISTRY,
          inventory: [
            { path: 'session-1-26-09-2023/نمونه.mp4', size: 1 },
            { path: 'session-1-27-09-2023/نمونه.mp4', size: 1 },
          ],
        }),
      ).toThrow(/Two folders claim session 1/);
      // A folder date that is not a real calendar day is not a session.
      expect(parseSessionFolderName('session-3-30-02-2024')).toBeNull();
      expect(parseSessionFolderName('session-9-14-05-2024')).toEqual({ n: 9, date: '2024-05-14' });
      const oversize = Array.from({ length: 5001 }, (_, i) => ({ path: `session-1-26-09-2023/نمونه-${i}.mp4`, size: 1 }));
      expect(() => buildIndex({ registryText: REGISTRY, inventory: oversize })).toThrow(/more than 5000 files/);

      // --- publication is atomic, outside the archive, read-only over it ----
      const target = join(out, 'index.json');
      writeIndexAtomically(target, 'last good\n', root);
      expect(() => writeIndexAtomically(join(root, 'index.json'), 'x', root)).toThrow(/inside the archive/);
      // A scan that cannot produce a complete consistent view throws BEFORE
      // anything is written, so the last good output still stands.
      rmSync(join(root, 'PIECES.csv'));
      expect(() => scanToIndex(root)).toThrow();
      expect(readFileSync(target, 'utf8')).toBe('last good\n');
      // And the archive itself is untouched by any of the above.
      expect(scanArchive(root)).toHaveLength(INVENTORY.length);
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(out, { recursive: true, force: true });
    }
  });
});
