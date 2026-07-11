/**
 * Canonical serialisation + content hashing of the persisted data state.
 *
 * Sync decisions compare WHOLE-STATE content hashes (git-style), not
 * timestamps: two devices hold the same data exactly when their hashes match,
 * regardless of clocks, key order, or how the data got there. Any mutation —
 * add, edit, delete, import, attachment/instrument/pathway/stage/routine
 * change — changes the hash by construction.
 */

/** JSON.stringify with recursively sorted object keys (arrays keep order). */
export function canonicalStringify(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      const v = (value as Record<string, unknown>)[key];
      if (v !== undefined) out[key] = sortKeys(v);
    }
    return out;
  }
  return value;
}

/** SHA-256 hex of a string (WebCrypto — available in browsers and Node 20+). */
export async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Content hash of the full persisted data state. */
export async function hashState(db: unknown): Promise<string> {
  return sha256Hex(canonicalStringify(db));
}

export function shortHash(hash: string | null | undefined): string {
  return hash ? hash.slice(0, 8) : '—';
}
