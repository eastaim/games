import { describe, expect, it } from 'vitest';

import { GAMES } from '../src/catalog/games';

/**
 * The registry is hand-edited every time a game is added, so these guard the
 * mistakes that only surface as a broken link on the deployed site.
 */
describe('game registry', () => {
  it('has no duplicate ids', () => {
    const ids = GAMES.map((game) => game.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uses ids that are safe in a URL and a storage key', () => {
    for (const game of GAMES) {
      expect(game.id).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('uses absolute paths with a trailing slash', () => {
    // Without the trailing slash GitHub Pages redirects, and a game in an
    // iframe redirecting is an easy way to lose the referrer and the focus.
    for (const game of GAMES) {
      expect(game.path.startsWith('/')).toBe(true);
      expect(game.path.endsWith('/')).toBe(true);
    }
  });

  it('gives every card the text and colour it needs to render', () => {
    for (const game of GAMES) {
      expect(game.title.length).toBeGreaterThan(0);
      expect(game.tagline.length).toBeGreaterThan(0);
      expect(game.accent).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
