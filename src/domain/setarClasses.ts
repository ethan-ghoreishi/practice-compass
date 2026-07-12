// AUTO-GENERATED from the user's setar-classes NAS folder (37 monthly classes,
// 2023-09 → 2026-07). These are REFERENCES only — paths are relative to the NAS
// recordings base URL (Settings); no video bytes live here. Regenerate by
// re-scanning the folder if the sessions change.
import type { ISODate } from './types';

export interface SetarClassSession {
  /** Session number (1 = first class). */
  n: number;
  date: ISODate;
  /** Relative NAS path to the class recording (main video). */
  video: string;
  sizeBytes: number;
  /** Score/hand-out PDFs in the session folder (relative NAS paths). */
  pdfs: string[];
}

export const SETAR_CLASS_SESSIONS: SetarClassSession[] = [
  { n: 1, date: "2023-09-26", video: "setar-classes/session-1-26-09-2023/video-2023-09-27-07-14-52-1.mp4", sizeBytes: 47321598, pdfs: ["setar-classes/session-1-26-09-2023/chahar-mezarabe-avale-dashti.pdf", "setar-classes/session-1-26-09-2023/renge-mahoor-darvish-sevom-1402-05-22.pdf"] },
  { n: 2, date: "2023-10-24", video: "setar-classes/session-2-24-10-2023/video-2023-10-24-20-07-47-2.mp4", sizeBytes: 36721950, pdfs: [] },
  { n: 3, date: "2023-11-21", video: "setar-classes/session-3-21-11-2023/video-20231121-160710-meeting-recording.mp4", sizeBytes: 303022149, pdfs: [] },
  { n: 4, date: "2023-12-22", video: "setar-classes/session-4-22-12-2023/video-20231222-154903-meeting-recording.mp4", sizeBytes: 456964612, pdfs: [] },
  { n: 5, date: "2024-01-23", video: "setar-classes/session-5-23-01-2024/video-20240123-161811-meeting-recording.mp4", sizeBytes: 402863504, pdfs: ["setar-classes/session-5-23-01-2024/7-zarbi-alizadeh-220304-183146-1.pdf"] },
  { n: 6, date: "2024-02-20", video: "setar-classes/session-6-20-02-2024/video-20240220-162309-meeting-recording.mp4", sizeBytes: 554276565, pdfs: ["setar-classes/session-6-20-02-2024/pish-chahargah-mokhtari-edited.pdf"] },
  { n: 7, date: "2024-03-19", video: "setar-classes/session-7-19-03-2024/video-20240319-164531-meeting-recording-2.mp4", sizeBytes: 65563765, pdfs: [] },
  { n: 8, date: "2024-04-16", video: "setar-classes/session-8-16-04-2024/video-20240416-161648-meeting-recording.mp4", sizeBytes: 123858602, pdfs: [] },
  { n: 9, date: "2024-05-14", video: "setar-classes/session-9-14-05-2024/video-20240514-155820-meeting-recording.mp4", sizeBytes: 54130300, pdfs: [] },
  { n: 10, date: "2024-06-11", video: "setar-classes/session-10-11-06-2024/video-20240611-161735-meeting-recording.mp4", sizeBytes: 96717520, pdfs: [] },
  { n: 11, date: "2024-07-09", video: "setar-classes/session-11-09-07-2024/video-20240709-155436-meeting-recording.mp4", sizeBytes: 74975726, pdfs: [] },
  { n: 12, date: "2024-08-06", video: "setar-classes/session-12-06-08-2024/video-20240806-155650-meeting-recording.mp4", sizeBytes: 99765911, pdfs: [] },
  { n: 13, date: "2024-09-03", video: "setar-classes/session-13-03-09-2024/video-20240903-152547-meeting-recording.mp4", sizeBytes: 90002728, pdfs: ["setar-classes/session-13-03-09-2024/aragh-mirzahoseyngholi.pdf"] },
  { n: 14, date: "2024-10-01", video: "setar-classes/session-14-01-10-2024/video-20241001-153602-meeting-recording.mp4", sizeBytes: 181698837, pdfs: [] },
  { n: 15, date: "2024-10-29", video: "setar-classes/session-15-29-10-2024/video-20241029-153247-meeting-recording.mp4", sizeBytes: 129106659, pdfs: [] },
  { n: 16, date: "2024-11-26", video: "setar-classes/session-16-26-11-2024/video-20241126-153555-meeting-recording.mp4", sizeBytes: 84518794, pdfs: ["setar-classes/session-16-26-11-2024/chaharmezrabe-mahur-sabaa.pdf", "setar-classes/session-16-26-11-2024/darvish-reng-esfehanparicherandparizad-1402-05-22.pdf", "setar-classes/session-16-26-11-2024/pishdaramade-mahur-hormozi.pdf"] },
  { n: 17, date: "2024-12-26", video: "setar-classes/session-17-26-12-2024/video-20241224-153734-meeting-recording.mp4", sizeBytes: 135444541, pdfs: ["setar-classes/session-17-26-12-2024/do-zarbye-bayate-tork-saba.pdf"] },
  { n: 18, date: "2025-01-21", video: "setar-classes/session-18-21-01-2025/video-20250121-153528-meeting-recording.mp4", sizeBytes: 108378862, pdfs: ["setar-classes/session-18-21-01-2025/chaharmezrab-nava-alizadeh.pdf", "setar-classes/session-18-21-01-2025/pishdaramad-nava-alizadeh.pdf", "setar-classes/session-18-21-01-2025/pishdaramade-mahur-hormozi.pdf"] },
  { n: 19, date: "2025-02-18", video: "setar-classes/session-19-18-02-2025/video-20250218-155212-meeting-recording.mp4", sizeBytes: 141510280, pdfs: ["setar-classes/session-19-18-02-2025/به-یاد-گذشته-صبا.pdf", "setar-classes/session-19-18-02-2025/چهارمضراب-ابوعطا-صبا.pdf"] },
  { n: 20, date: "2025-03-18", video: "setar-classes/session-20-18-03-2025/video-20250318-165103-meeting-recording.mp4", sizeBytes: 121103555, pdfs: ["setar-classes/session-20-18-03-2025/pishdaraamde-rak-mahur-darvish.pdf"] },
  { n: 21, date: "2025-04-15", video: "setar-classes/session-21-15-04-2025/video-20250415-162959-meeting-recording.mp4", sizeBytes: 84851995, pdfs: ["setar-classes/session-21-15-04-2025/chaharmezrabe-bayate-tork-hormozi.pdf", "setar-classes/session-21-15-04-2025/renge-mahour-raak-boromand.pdf"] },
  { n: 22, date: "2025-05-13", video: "setar-classes/session-22-13-05-2025/screen-recording-2025-05-13-at-17.38.47.mp4", sizeBytes: 86780956, pdfs: [] },
  { n: 23, date: "2025-06-10", video: "setar-classes/session-23-10-06-2025/screen-recording-2025-06-10-at-18.41.13-ethans-mbp-jun-27-150429-2025.mp4", sizeBytes: 102414626, pdfs: ["setar-classes/session-23-10-06-2025/پیش-درامد-بیات-ترک-tork-ozari.pdf"] },
  { n: 24, date: "2025-07-08", video: "setar-classes/session-24-08-07-2025/screen-recording-2025-07-08-at-19.13.20.mp4", sizeBytes: 89989581, pdfs: [] },
  { n: 25, date: "2025-08-05", video: "setar-classes/session-25-05-08-2025/rec-20250805184249.mp4", sizeBytes: 274973302, pdfs: [] },
  { n: 26, date: "2025-09-02", video: "setar-classes/session-26-02-09-2025/rec-20250902185621.mp4", sizeBytes: 239395983, pdfs: [] },
  { n: 27, date: "2025-09-30", video: "setar-classes/session-27-30-09-2025/rec-20250930190712-1.mp4", sizeBytes: 93432037, pdfs: [] },
  { n: 28, date: "2025-10-28", video: "setar-classes/session-28-28-10-2025/video-2025-10-28-19-56-30.mp4", sizeBytes: 57741062, pdfs: ["setar-classes/session-28-28-10-2025/be-zendan-shushtari.pdf"] },
  { n: 29, date: "2025-11-25", video: "setar-classes/session-29-25-11-2025/2025-11-25-18.59.30.mp4", sizeBytes: 180567343, pdfs: ["setar-classes/session-29-25-11-2025/chahar-mezrabe-dovome-bayate-tork-saba.pdf"] },
  { n: 30, date: "2025-12-23", video: "setar-classes/session-30-23-12-2025/2025-12-23-19.11.42.mp4", sizeBytes: 322997843, pdfs: ["setar-classes/session-30-23-12-2025/zange-shotor.pdf"] },
  { n: 31, date: "2026-01-20", video: "setar-classes/session-31-20-01-2026/2026-01-20-20.08.43.mp4", sizeBytes: 83747131, pdfs: ["setar-classes/session-31-20-01-2026/bahar-mast-saba.pdf", "setar-classes/session-31-20-01-2026/samaani-saba.pdf"] },
  { n: 32, date: "2026-02-17", video: "setar-classes/session-32-17-02-2026/2026-02-17-19.59.26.mp4", sizeBytes: 170596853, pdfs: ["setar-classes/session-32-17-02-2026/solh-shahnazi.pdf"] },
  { n: 33, date: "2026-03-17", video: "setar-classes/session-33-17-03-2026/2026-03-17-19.05.40.mp4", sizeBytes: 176638832, pdfs: ["setar-classes/session-33-17-03-2026/jang-shahnazi.pdf"] },
  { n: 34, date: "2026-04-14", video: "setar-classes/session-34-14-04-2026/2026-04-14-19.03.37.mp4", sizeBytes: 265468933, pdfs: [] },
  { n: 35, date: "2026-05-12", video: "setar-classes/session-35-12-05-2026/2026-05-12-20.35.19.mp4", sizeBytes: 70290034, pdfs: [] },
  { n: 36, date: "2026-06-09", video: "setar-classes/session-36-09-06-2026/2026-06-09 19.29.16.mp4", sizeBytes: 325389004, pdfs: [] },
  { n: 37, date: "2026-07-09", video: "setar-classes/session-37-09-07-2026/2026-07-09_Setar_Class_FIXED_v3.mp4", sizeBytes: 686136347, pdfs: ["setar-classes/session-37-09-07-2026/chahaar-mezrabe-afshaari-sabaa.pdf"] },
];

import type { Lesson } from './types';
import { createLesson } from './factories';
import { newId, nowISO } from './util';

/**
 * Build lesson records for the Setar classes, additively: only sessions whose
 * date isn't already present are returned, so importing twice is safe. Each
 * lesson carries a single NAS recording reference (the class video) — never the
 * bytes. Score PDFs are noted in the recording's notes (attach them as small
 * app files later if wanted). Pure; the store adds the result.
 */
export function buildSetarClassLessons(
  instrumentId: string,
  existingDates: ReadonlySet<string>,
  now: Date,
): Lesson[] {
  const ts = nowISO(now);
  return SETAR_CLASS_SESSIONS.filter((s) => !existingDates.has(s.date)).map((s) => {
    const lesson = createLesson({ instrumentId, date: s.date }, now);
    lesson.recordings = s.video
      ? [
          {
            id: newId(),
            title: `Session ${s.n} — class recording`,
            path: s.video,
            date: s.date,
            sizeBytes: s.sizeBytes,
            notes: s.pdfs.length ? `Scores in this session: ${s.pdfs.map((p) => p.split('/').pop()).join(', ')}` : undefined,
            createdAt: ts,
          },
        ]
      : [];
    return lesson;
  });
}
