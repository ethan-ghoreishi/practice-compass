import { describe, expect, it } from 'vitest';
import { ATTACHMENT_MAX_BYTES, ATTACHMENT_WARN_BYTES, attachmentPolicy } from './files';

const MB = 1024 * 1024;

describe('attachmentPolicy', () => {
  it('accepts normal PDFs and photos silently', () => {
    expect(attachmentPolicy(2 * MB, 'application/pdf').level).toBe('ok');
    expect(attachmentPolicy(500 * 1024, 'image/jpeg').level).toBe('ok');
  });

  it('warns above the soft limit but still allows', () => {
    const p = attachmentPolicy(ATTACHMENT_WARN_BYTES + 1, 'application/pdf');
    expect(p.level).toBe('warn');
    expect(p.message).toBeTruthy();
  });

  it('warns for any video regardless of size', () => {
    expect(attachmentPolicy(1 * MB, 'video/mp4').level).toBe('warn');
  });

  it('refuses files over the hard limit with a clear message', () => {
    const p = attachmentPolicy(ATTACHMENT_MAX_BYTES + 1, 'video/mp4');
    expect(p.level).toBe('block');
    expect(p.message).toMatch(/session folders/);
  });
});
