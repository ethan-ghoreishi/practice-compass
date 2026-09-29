import type { ID, PracticeItem } from './types';

// ---------------------------------------------------------------------------
// Reference identity: WHICH suggestion an owned item IS, independent of where
// the item is placed and of any title.
//
// A reference id names one code-defined suggestion in context:
//
//   stage:<stageId>:<key>                 an ordinary per-stage suggestion —
//                                          `chords` in 1B and 2B are two
//   course:<courseId>:work:<identity>     one musical work a course names in
//                                          several places (`courseWorkKey`)
//   radif:<recension>:<dastgah>:<gusheh>  one gusheh of the shared Persian
//                                          reference, scoped by recension AND
//                                          dastgāh, so «درآمد» in Shur and
//                                          «درآمد» in Afshari never conflate
//
// The binding lives on the item (`catalogRefs`), so it survives moving the item
// to another stage, detaching it, and deleting the stage or pathway that
// showed it. A reference resolves to AT MOST ONE item per instrument; several
// references may name one item on purpose. Setar and Tar share every radif
// reference and never share an item: resolution is always per instrument.
//
// This module is deliberately a leaf (types only) so `courseSeed` and
// `pathwaySeed` can both build on it without an import cycle.
// ---------------------------------------------------------------------------

export function stageReferenceId(stageId: ID, key: string): string {
  return `stage:${stageId}:${key}`;
}

export function courseReferenceId(courseId: string, workIdentity: string): string {
  return `course:${courseId}:work:${workIdentity}`;
}

// --- the shared Persian reference ---------------------------------------------

export interface RadifDastgah {
  /** Stable ascii part of every stage id and reference id. */
  slug: string;
  /** The Dastgāh/Āvāz term every gusheh item created here is classified by. */
  termId: string;
  /** Stage code, as displayed. */
  code: string;
  title: string;
  group: string;
  intro: string;
  /** How the conscious-practice prompt names this dastgāh. */
  context: string;
  /** [Farsi display name, stable ascii key]. */
  gushehs: [string, string][];
}

export interface RadifReference {
  /** The recension scope in every reference id. */
  id: string;
  name: string;
  dastgahs: RadifDastgah[];
}

/**
 * ONE SHARED, EXPLICITLY PARTIAL reference for the Mirza Abdollah-oriented
 * modal selections the Setar pathway has always carried — carried over as they
 * were, not extended. It is a SELECTION to practise from, never a claim to be
 * the complete radif or its authoritative order; the teacher's edition is the
 * authority (docs/repertoire-experience.md records the audit and the entries
 * the owner is asked to confirm). Keys are the ones the Setar pathway already
 * shipped, so an item added there is the same reference here.
 */
export const MIRZA_ABDOLLAH_RADIF: RadifReference = {
  id: 'mirza-abdollah',
  name: 'ردیف میرزا عبدالله',
  dastgahs: [
    {
      slug: 'shur',
      termId: 'dastgah:shur',
      code: 'شور',
      title: 'دستگاه شور',
      group: 'دستگاه شور و آوازهای آن',
      intro:
        'شور سنگ‌بنای موسیقی ایرانی است و معمولاً آغازگاهِ هنرجویان — درون‌گرا، لطیف، و مادرِ چهار آواز. توجه کن که چگونه تقریباً همه‌چیز به شاهدِ آن بازمی‌گردد.',
      context: 'شور',
      gushehs: [
        ['درآمد شور', 'daramad-e-shur'],
        ['کرشمه', 'kereshmeh'],
        ['رهاب', 'rohab'],
        ['سلمک', 'salmak'],
        ['گلریز', 'golriz'],
        ['شهناز', 'shahnaz'],
        ['قرچه', 'qarche'],
        ['حسینی', 'hosseini'],
        ['فرود', 'forud'],
      ],
    },
    {
      slug: 'abu-ata',
      termId: 'dastgah:abuata',
      code: 'ابوعطا',
      title: 'آواز ابوعطا',
      group: 'دستگاه شور و آوازهای آن',
      intro: 'آوازی از شور با رنگی سوزناک و مردمی. بشنو که چگونه بر شور تکیه می‌زند و به آن بازمی‌گردد.',
      context: 'ابوعطا',
      gushehs: [
        ['درآمد', 'daramad'],
        ['سیخی', 'sayakhi'],
        ['حجاز', 'hejaz'],
        ['چهارباغ', 'chaharbagh'],
        ['فرود', 'forud'],
      ],
    },
    {
      slug: 'bayat-e-tork',
      termId: 'dastgah:bayat-tork',
      code: 'بیات ترک',
      title: 'آواز بیات ترک',
      group: 'دستگاه شور و آوازهای آن',
      intro: 'آوازی از شور با نمایی روشن‌تر و بازتر — که بسیار در آواز مذهبی شنیده می‌شود.',
      context: 'بیات ترک',
      gushehs: [
        ['درآمد', 'daramad'],
        ['دوگاه', 'dogah'],
        ['مهربانی', 'mehrabani'],
        ['قطار', 'qatar'],
        ['فرود', 'forud'],
      ],
    },
    {
      slug: 'afshari',
      termId: 'dastgah:afshari',
      code: 'افشاری',
      title: 'آواز افشاری',
      group: 'دستگاه شور و آوازهای آن',
      intro:
        'آوازی از شور — جستجوگر و تلخ‌وشیرین، با کیفیتی سرگردان و ویژه. فرودِ آن به شور، لحظه‌ای است که باید به آن گوش سپرد.',
      context: 'افشاری',
      gushehs: [
        ['درآمد', 'daramad'],
        ['جامه‌دران', 'jamedaran'],
        ['عراق', 'iraq'],
        ['فرود', 'forud'],
      ],
    },
    {
      slug: 'dashti',
      termId: 'dastgah:dashti',
      code: 'دشتی',
      title: 'آواز دشتی',
      group: 'دستگاه شور و آوازهای آن',
      intro: 'آوازی از شور، غنایی و اندوهگین — صدای بسیاری از نغمه‌های محلی. شاهدِ آن به‌طرزی نامدار می‌لرزد.',
      context: 'دشتی',
      gushehs: [
        ['درآمد', 'daramad'],
        ['گیلکی', 'gilaki'],
        ['بیات راجه', 'bayat-e-rajeh'],
        ['فرود', 'forud'],
      ],
    },
    {
      slug: 'homayun',
      termId: 'dastgah:homayun',
      code: 'همایون',
      title: 'دستگاه همایون',
      group: 'دیگر دستگاه‌ها',
      intro: 'هم‌زمان باشکوه و سوگوار. به جهشِ آغازینِ ویژه‌اش و کششِ بیداد گوش بسپار.',
      context: 'همایون',
      gushehs: [
        ['درآمد همایون', 'daramad-e-homayun'],
        ['چکاوک', 'chakavak'],
        ['بیداد', 'bidad'],
        ['نی‌داوود', 'ney-davud'],
        ['فرود', 'forud'],
      ],
    },
    {
      slug: 'esfahan',
      termId: 'dastgah:bayat-esfahan',
      code: 'اصفهان',
      title: 'آواز بیات اصفهان',
      group: 'دیگر دستگاه‌ها',
      intro: 'آوازی از همایون — عاشقانه و گرم، نزدیک به رنگِ مینورِ هارمونیکِ غربی.',
      context: 'بیات اصفهان',
      gushehs: [
        ['درآمد', 'daramad'],
        ['جامه‌دران', 'jamedaran'],
        ['بیات راجه', 'bayat-e-rajeh'],
        ['فرود', 'forud'],
      ],
    },
    {
      slug: 'segah',
      termId: 'dastgah:segah',
      code: 'سه‌گاه',
      title: 'دستگاه سه‌گاه',
      group: 'دیگر دستگاه‌ها',
      intro: 'اندوهگین و التماس‌گر، حول شاهدِ ربع‌پرده‌اش ساخته شده. مخالف اوجِ عاطفیِ آن است — به تغییرِ رجیستر توجه کن.',
      context: 'سه‌گاه',
      gushehs: [
        ['درآمد سه‌گاه', 'daramad-e-segah'],
        ['زابل', 'zabol'],
        ['مخالف', 'mokhalef'],
        ['مقلوب', 'maqlub'],
        ['فرود', 'forud'],
      ],
    },
    {
      slug: 'chahargah',
      termId: 'dastgah:chahargah',
      code: 'چهارگاه',
      title: 'دستگاه چهارگاه',
      group: 'دیگر دستگاه‌ها',
      intro: 'روشن، حماسی، جشن‌گونه — که اغلب با طلوعِ آفتاب مقایسه می‌شود. تقارنِ دانگ‌هایش را حول شاهد حس کن.',
      context: 'چهارگاه',
      gushehs: [
        ['درآمد چهارگاه', 'daramad-e-chahargah'],
        ['زابل', 'zabol'],
        ['مخالف', 'mokhalef'],
        ['منصوری', 'mansuri'],
        ['فرود', 'forud'],
      ],
    },
    {
      slug: 'mahur',
      termId: 'dastgah:mahur',
      code: 'ماهور',
      title: 'دستگاه ماهور',
      group: 'دیگر دستگاه‌ها',
      intro: 'باز و شادمان — نزدیک‌ترین به گامِ ماژورِ غربی. دلکش گردشِ نامدار است: بشنو که چگونه رنگِ شور را وام می‌گیرد.',
      context: 'ماهور',
      gushehs: [
        ['درآمد ماهور', 'daramad-e-mahur'],
        ['داد', 'dad'],
        ['خسروانی', 'khosravani'],
        ['دلکش', 'delkash'],
        ['فرود', 'forud'],
      ],
    },
    {
      slug: 'nava',
      termId: 'dastgah:nava',
      code: 'نوا',
      title: 'دستگاه نوا',
      group: 'دیگر دستگاه‌ها',
      intro: 'آرام، مراقبه‌گون، متعادل — اغلب برای پاسی از شب نگه داشته می‌شود. خویشاوندِ شور؛ به مرکزِ آرام‌ترش توجه کن.',
      context: 'نوا',
      gushehs: [
        ['درآمد نوا', 'daramad-e-nava'],
        ['گردانیه', 'gardaniyeh'],
        ['نهفت', 'nahoft'],
        ['فرود', 'forud'],
      ],
    },
    {
      slug: 'rast-panjgah',
      termId: 'dastgah:rast-panjgah',
      code: 'راست‌پنجگاه',
      title: 'دستگاه راست‌پنجگاه',
      group: 'دیگر دستگاه‌ها',
      intro: 'کمیاب‌ترین دستگاه — باوقار، گسترده، و محبوب برای مدولاسیون میان مُدها.',
      context: 'راست‌پنجگاه',
      gushehs: [
        ['درآمد راست‌پنجگاه', 'daramad-e-rast-panjgah'],
        ['پروانه', 'parvaneh'],
        ['قرچه', 'qarache'],
        ['فرود', 'forud'],
      ],
    },
  ],
};

/**
 * Every pathway that is an INSTANCE of the shared reference: the Setar
 * pathway's modal stages (shipped long before this reference was factored out)
 * and the two named reference pathways. Instances share references and never
 * share items — Setar's practice evidence stays Setar's.
 */
export const RADIF_INSTANCE_PATHWAYS = ['setar-radif', 'setar-radif-mirza', 'tar-radif-mirza'] as const;

/** The stage id of one dastgāh within one instance — `stageIdFor`'s own shape. */
export function radifStageId(pathwayId: string, dastgahSlug: string): string {
  return `${pathwayId}-${dastgahSlug}`;
}

const RADIF_BY_STAGE = new Map<string, RadifDastgah>(
  RADIF_INSTANCE_PATHWAYS.flatMap((p) => MIRZA_ABDOLLAH_RADIF.dastgahs.map((d) => [radifStageId(p, d.slug), d] as const)),
);

/** The dastgāh a radif stage presents, or nothing for any other stage. */
export function radifDastgahForStage(stageId: ID): RadifDastgah | undefined {
  return RADIF_BY_STAGE.get(stageId);
}

/** The shared reference id of one gusheh, or nothing when the key is not one. */
export function radifReferenceId(stageId: ID, key: string): string | undefined {
  const dastgah = RADIF_BY_STAGE.get(stageId);
  if (!dastgah || !dastgah.gushehs.some(([, k]) => k === key)) return undefined;
  return `radif:${MIRZA_ABDOLLAH_RADIF.id}:${dastgah.slug}:${key}`;
}

// --- resolution -----------------------------------------------------------------

export type ReferenceResolution =
  | { status: 'bound'; item: PracticeItem; via: 'binding' | 'legacy' }
  | { status: 'ambiguous'; candidates: PracticeItem[] }
  | { status: 'absent' };

/**
 * THE ONE ANSWER to "which of the owner's items is this suggestion?" — every
 * row, Add, Start, progress figure, next suggestion and course-material lookup
 * goes through it.
 *
 *  1. An EXPLICIT binding (`catalogRefs` holds the reference) wins. Exactly one
 *     is the answer; more than one is ambiguous and nothing is picked.
 *  2. Otherwise a LEGACY item — one whose binding was never decided
 *     (`catalogRefs` absent) — whose old `stageId` + `catalogKey` names this
 *     reference answers, but only when it is the ONLY such item. Two are
 *     visible candidates, never a first match.
 *
 * `instrumentId` scopes it: a reference names at most one item PER INSTRUMENT.
 * Undefined (a caller with no pathway context) considers every instrument.
 * `legacyRef` is injected so this leaf needs no catalogue import.
 */
export function resolveReference(
  refId: string,
  instrumentId: ID | undefined,
  items: PracticeItem[],
  legacyRef: (item: PracticeItem) => string | undefined,
): ReferenceResolution {
  const scoped = instrumentId === undefined ? items : items.filter((i) => i.instrumentId === instrumentId);
  const explicit = scoped.filter((i) => i.catalogRefs?.includes(refId));
  if (explicit.length === 1) return { status: 'bound', item: explicit[0], via: 'binding' };
  if (explicit.length > 1) return { status: 'ambiguous', candidates: explicit };
  const legacy = scoped.filter((i) => i.catalogRefs === undefined && legacyRef(i) === refId);
  if (legacy.length === 1) return { status: 'bound', item: legacy[0], via: 'legacy' };
  if (legacy.length > 1) return { status: 'ambiguous', candidates: legacy };
  return { status: 'absent' };
}

/** The references an item stands for: its decided binding, or its legacy evidence. */
export function referencesOfItem(item: PracticeItem, legacyRef: (item: PracticeItem) => string | undefined): string[] {
  if (item.catalogRefs !== undefined) return item.catalogRefs;
  const legacy = legacyRef(item);
  return legacy ? [legacy] : [];
}
