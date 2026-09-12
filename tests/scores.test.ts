import { afterEach, describe, expect, it, vi } from 'vitest';

import { bestScoreKey, parseScoreReport, readBest, recordReport } from '../src/core/scores';

/** Minimal stand-in — these tests run in node, where there is no localStorage. */
function fakeStorage(entries: Record<string, string>) {
  return { getItem: (key: string) => entries[key] ?? null };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('bestScoreKey', () => {
  it('defaults to <id>.best', () => {
    expect(bestScoreKey({ id: 'mergedrop' })).toBe('mergedrop.best');
  });

  it('honours a game that predates the convention', () => {
    // No registered game needs this today; the escape hatch stays for one that
    // ships before it can be updated.
    expect(bestScoreKey({ id: 'legacy-game', scoreKey: 'game.best' })).toBe('game.best');
  });
});

describe('readBest', () => {
  it('reads the number the game stored', () => {
    vi.stubGlobal('localStorage', fakeStorage({ 'mergedrop.best': '4200' }));
    expect(readBest({ id: 'mergedrop' })).toBe(4200);
  });

  it('returns null for never played, so the UI can say so', () => {
    vi.stubGlobal('localStorage', fakeStorage({}));
    expect(readBest({ id: 'unplayed' })).toBeNull();
  });

  it('returns null for junk rather than NaN', () => {
    vi.stubGlobal('localStorage', fakeStorage({ 'junk.best': 'nope', 'zero.best': '0' }));
    expect(readBest({ id: 'junk' })).toBeNull();
    expect(readBest({ id: 'zero' })).toBeNull();
  });

  it('survives storage throwing', () => {
    // Private browsing and blocked site data both throw on access. A portal
    // that crashes there shows no games at all.
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('SecurityError');
      },
    });
    expect(readBest({ id: 'mergedrop' })).toBeNull();
  });

  it('has no storage at all in a bare environment', () => {
    expect(readBest({ id: 'mergedrop' })).toBeNull();
  });
});

describe('parseScoreReport', () => {
  const ORIGIN = 'https://eastaim.github.io';
  const valid = { type: 'portal:best', gameId: 'mergedrop', score: 120 };

  it('accepts a well-formed message from the expected origin', () => {
    expect(parseScoreReport(ORIGIN, valid, ORIGIN)).toEqual({ gameId: 'mergedrop', score: 120 });
  });

  it('rejects another origin before looking at the payload', () => {
    expect(parseScoreReport('https://evil.example', valid, ORIGIN)).toBeNull();
  });

  it('rejects anything that is not exactly the expected shape', () => {
    const bad: unknown[] = [
      null,
      'portal:best',
      42,
      { type: 'other', gameId: 'mergedrop', score: 1 },
      { type: 'portal:best', gameId: '', score: 1 },
      { type: 'portal:best', gameId: 'mergedrop' },
      { type: 'portal:best', gameId: 'mergedrop', score: '120' },
      { type: 'portal:best', gameId: 'mergedrop', score: Number.NaN },
      { type: 'portal:best', gameId: 'mergedrop', score: 0 },
    ];
    for (const data of bad) {
      expect(parseScoreReport(ORIGIN, data, ORIGIN)).toBeNull();
    }
  });
});

describe('recordReport', () => {
  it('keeps only an improvement, and shows through readBest', () => {
    vi.stubGlobal('localStorage', fakeStorage({ 'live.best': '100' }));

    expect(recordReport({ gameId: 'live', score: 50 })).toBe(true);
    // Stored 100 still wins over the reported 50.
    expect(readBest({ id: 'live' })).toBe(100);

    expect(recordReport({ gameId: 'live', score: 300 })).toBe(true);
    expect(readBest({ id: 'live' })).toBe(300);

    expect(recordReport({ gameId: 'live', score: 299 })).toBe(false);
    expect(readBest({ id: 'live' })).toBe(300);
  });
});
