import { describe, expect, it } from 'vitest';

import { gameRoute, parseRoute } from '../src/core/router';

const KNOWN = new Set(['mergedrop', 'phaser-starter']);

describe('parseRoute', () => {
  it('treats every spelling of "no route" as the list', () => {
    for (const hash of ['', '#', '#/', '#//']) {
      expect(parseRoute(hash, KNOWN)).toEqual({ kind: 'list' });
    }
  });

  it('resolves a known game', () => {
    expect(parseRoute('#/game/mergedrop', KNOWN)).toEqual({ kind: 'game', id: 'mergedrop' });
  });

  it('reports an unknown game rather than falling back to the list', () => {
    // A stale bookmark must say so; silently showing the list looks like a bug.
    expect(parseRoute('#/game/nope', KNOWN)).toEqual({ kind: 'notFound', id: 'nope' });
  });

  it('is case-insensitive and decodes the id', () => {
    expect(parseRoute('#/game/MergeDrop', KNOWN)).toEqual({ kind: 'game', id: 'mergedrop' });
    expect(parseRoute('#/game/phaser%2Dstarter', KNOWN)).toEqual({
      kind: 'game',
      id: 'phaser-starter',
    });
  });

  it('rejects shapes that are not a game route', () => {
    expect(parseRoute('#/game', KNOWN).kind).toBe('notFound');
    expect(parseRoute('#/game/a/b', KNOWN).kind).toBe('notFound');
    expect(parseRoute('#/settings', KNOWN).kind).toBe('notFound');
  });

  it('round-trips through gameRoute', () => {
    for (const id of KNOWN) {
      expect(parseRoute(gameRoute(id), KNOWN)).toEqual({ kind: 'game', id });
    }
  });
});
