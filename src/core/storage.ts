/**
 * The only place in the portal that touches localStorage.
 *
 * Every access is guarded: private browsing, blocked site data and embedded
 * contexts can all make `localStorage` throw rather than return null, and in a
 * non-browser context (tests, SSR) the global does not exist at all. Storage
 * failing must never break the portal, so reads fall back to null and writes
 * fail silently.
 */

export function readString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Nothing to do — the setting simply does not persist this session.
  }
}
