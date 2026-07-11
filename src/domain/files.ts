/**
 * Attachment size policy — realistic for the sync/backup transport.
 *
 * Attachments travel as base64 through the full-backup file AND as git blobs
 * to the GitHub data repo (hard API limit: 100 MB per blob, and large blobs
 * make every fresh-device pull slow). PDFs, score photos and short audio fit
 * comfortably; class VIDEOS do not and belong in the user's session folders,
 * not in the app. The policy is enforced, not merely claimed: files over the
 * maximum are refused with a clear message instead of failing later in sync.
 */

export const ATTACHMENT_WARN_BYTES = 10 * 1024 * 1024; // 10 MB
export const ATTACHMENT_MAX_BYTES = 40 * 1024 * 1024; // 40 MB

export type AttachmentPolicyLevel = 'ok' | 'warn' | 'block';

export interface AttachmentPolicy {
  level: AttachmentPolicyLevel;
  message?: string;
}

export function attachmentPolicy(sizeBytes: number, mime = ''): AttachmentPolicy {
  if (sizeBytes > ATTACHMENT_MAX_BYTES) {
    return {
      level: 'block',
      message:
        'Over 40 MB — too big to sync and back up reliably. Keep videos in your session folders; attach the PDF or a photo instead.',
    };
  }
  if (mime.startsWith('video/')) {
    return {
      level: 'warn',
      message: 'Videos bloat every backup and sync. Class recordings are better kept in your session folders.',
    };
  }
  if (sizeBytes > ATTACHMENT_WARN_BYTES) {
    return {
      level: 'warn',
      message: 'Over 10 MB — it will sync, but large files make backups and first-device syncs slower.',
    };
  }
  return { level: 'ok' };
}
