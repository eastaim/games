import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  decodePlayer,
  encodePlayer,
  normalizeName,
  readPlayer,
  savePlayer,
} from '../src/core/player';

/**
 * The identity format belongs to the games, not to the portal. These tests pin
 * the exact shape a game writes, so a change there fails here rather than
 * silently turning every player into "이름 설정".
 */

function fakeDocument() {
  const jar = new Map<string, string>();
  return {
    jar,
    get cookie(): string {
      return [...jar].map(([key, value]) => `${key}=${value}`).join('; ');
    },
    set cookie(assignment: string) {
      const [pair] = assignment.split(';');
      const separator = pair.indexOf('=');
      jar.set(pair.slice(0, separator).trim(), pair.slice(separator + 1));
    },
  };
}

function fakeStorage() {
  const store = new Map<string, string>();
  return {
    store,
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
  };
}

let doc: ReturnType<typeof fakeDocument>;
let storage: ReturnType<typeof fakeStorage>;

beforeEach(() => {
  doc = fakeDocument();
  storage = fakeStorage();
  vi.stubGlobal('document', doc);
  vi.stubGlobal('localStorage', storage);
  vi.stubGlobal('location', { protocol: 'https:' });
});

afterEach(() => vi.unstubAllGlobals());

describe('reading what a game wrote', () => {
  it('accepts the cookie format the games write', () => {
    // Written by hand, exactly as a game encodes it.
    doc.cookie = `player=${encodeURIComponent('{"id":"abc","name":"동혁"}')}`;

    expect(readPlayer()).toEqual({ id: 'abc', name: '동혁' });
  });

  it('falls back to the localStorage mirror and rewrites the cookie', () => {
    storage.store.set('player', encodeURIComponent('{"id":"abc","name":"동혁"}'));

    expect(readPlayer()).toEqual({ id: 'abc', name: '동혁' });
    expect(doc.cookie).toContain('player=');
  });

  it('returns null when nobody has played yet', () => {
    expect(readPlayer()).toBeNull();
  });

  it('ignores a malformed cookie instead of throwing', () => {
    doc.cookie = 'player=not-json';
    expect(readPlayer()).toBeNull();
  });
});

describe('normalizeName', () => {
  it('trims, rejects empty and caps the length', () => {
    expect(normalizeName('  동혁 ')).toBe('동혁');
    expect(normalizeName('   ')).toBeNull();
    expect(normalizeName('가'.repeat(30))).toHaveLength(12);
  });
});

describe('savePlayer', () => {
  it('round-trips through the cookie', () => {
    const saved = savePlayer('동혁');
    expect(saved).not.toBeNull();
    expect(decodePlayer(encodePlayer(saved!))).toEqual(saved);
    expect(readPlayer()).toEqual(saved);
  });

  it('keeps the id across a rename, so records stay with the player', () => {
    const first = savePlayer('동혁');
    const renamed = savePlayer('캡틴');

    expect(renamed?.id).toBe(first?.id);
    expect(renamed?.name).toBe('캡틴');
  });

  it('refuses a name that normalises to nothing', () => {
    expect(savePlayer('   ')).toBeNull();
  });
});
