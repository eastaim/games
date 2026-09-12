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

/**
 * Cookies live here for the same reason localStorage does: one guarded place.
 *
 * The player identity is a cookie rather than a localStorage entry because the
 * games write it that way (see `core/player.ts`), and the portal must read
 * exactly what they wrote.
 */
export function readCookie(name: string): string | null {
  try {
    const prefix = `${name}=`;
    for (const part of document.cookie.split(';')) {
      const entry = part.trim();
      if (entry.startsWith(prefix)) return entry.slice(prefix.length);
    }
    return null;
  } catch {
    return null;
  }
}

export function writeCookie(name: string, value: string, maxAgeDays: number): void {
  try {
    // `Secure` is omitted on http so plain localhost dev still works.
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    const maxAge = Math.round(maxAgeDays * 24 * 60 * 60);
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
  } catch {
    // Cookies disabled — identity simply does not persist this session.
  }
}
