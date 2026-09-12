import { readCookie, readString, writeCookie, writeString } from './storage';

/**
 * Who is playing — a name and a uuid, with no account behind it.
 *
 * The games own this format; the portal reads exactly what they write, the same
 * way it reads their best scores. The cookie is set with `path=/` and every game
 * is deployed under one GitHub Pages origin, so one identity covers the portal
 * and every game on it. That sharing is the point: scores are per game, the
 * player is not.
 *
 * Duplicating the format here rather than importing it is deliberate — the
 * portal must never depend on a game repository.
 *
 * This is identity, not authentication. Both fields are editable in devtools.
 */

const COOKIE_NAME = 'player';

/** Chrome caps cookie lifetime at 400 days; asking for more just gets clamped. */
const COOKIE_MAX_AGE_DAYS = 400;

/** Games mirror the cookie here because Safari caps script cookies at 7 days. */
const MIRROR_KEY = 'player';

export const MAX_NAME_LENGTH = 12;

export interface Player {
  readonly id: string;
  readonly name: string;
}

/** Clean up a typed name. Returns null when nothing usable is left. */
export function normalizeName(raw: string): string | null {
  // eslint-disable-next-line no-control-regex -- control chars break the cookie.
  const trimmed = raw.replace(/[\u0000-\u001f\u007f]/g, '').trim();
  if (trimmed === '') return null;
  return trimmed.length > MAX_NAME_LENGTH ? trimmed.slice(0, MAX_NAME_LENGTH) : trimmed;
}

/** Parse a stored identity. Returns null for anything that is not one. */
export function decodePlayer(raw: string | null): Player | null {
  if (raw === null || raw === '') return null;
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(raw));
    if (typeof parsed !== 'object' || parsed === null) return null;

    const { id, name } = parsed as Record<string, unknown>;
    if (typeof id !== 'string' || id === '') return null;
    if (typeof name !== 'string') return null;

    const cleaned = normalizeName(name);
    return cleaned === null ? null : { id, name: cleaned };
  } catch {
    return null;
  }
}

export function encodePlayer(player: Player): string {
  return encodeURIComponent(JSON.stringify(player));
}

/**
 * The player this browser belongs to, or null when nobody has played yet.
 *
 * Falls back to the mirror and rewrites the cookie from it, so a player whose
 * cookie Safari expired is still recognised here.
 */
export function readPlayer(): Player | null {
  const fromCookie = decodePlayer(readCookie(COOKIE_NAME));
  if (fromCookie !== null) return fromCookie;

  const fromMirror = decodePlayer(readString(MIRROR_KEY));
  if (fromMirror !== null) {
    writeCookie(COOKIE_NAME, encodePlayer(fromMirror), COOKIE_MAX_AGE_DAYS);
    return fromMirror;
  }
  return null;
}

/**
 * Store `name`, keeping the existing id so a rename stays the same player and
 * keeps their records. Returns null when the name is unusable.
 *
 * `crypto.randomUUID()` needs a secure context; on plain http it is undefined,
 * so a first identity created there falls back to a random string. Production
 * is https, and an id only has to be unique, not unguessable.
 */
export function savePlayer(name: string): Player | null {
  const cleaned = normalizeName(name);
  if (cleaned === null) return null;

  const player: Player = { id: readPlayer()?.id ?? newId(), name: cleaned };
  const encoded = encodePlayer(player);
  writeCookie(COOKIE_NAME, encoded, COOKIE_MAX_AGE_DAYS);
  writeString(MIRROR_KEY, encoded);
  return player;
}

function newId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `local-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}
