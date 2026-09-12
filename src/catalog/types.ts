/**
 * One entry in the game list.
 *
 * Adding a game to the portal means adding one of these to `games.ts` and
 * nothing else. No file here may import Phaser, the DOM, or anything from a
 * game repository — the portal only ever knows a game by its URL.
 */
export interface GameEntry {
  /**
   * Stable slug. It is the route (`#/game/<id>`) and, by default, the prefix of
   * the best-score key (`<id>.best`). Lowercase letters, digits and hyphens.
   */
  readonly id: string;

  /** Card title. */
  readonly title: string;

  /** One line under the title. Keep it short enough for a 220px card. */
  readonly tagline: string;

  /**
   * Path of the deployed game on the Pages host, leading and trailing slash
   * included (e.g. `/MergeDrop/`). Resolved against the host in `gameUrl()`.
   */
  readonly path: string;

  /** Thumbnail accent colour, `#rrggbb`. */
  readonly accent: string;

  /** `wip` entries render greyed out and are not clickable. */
  readonly status: 'live' | 'wip';

  /**
   * Override for the localStorage key holding the personal best.
   *
   * Only needed when a game predates the `<id>.best` convention — the portal
   * adapts to the game rather than the game being edited for the portal.
   */
  readonly scoreKey?: string;
}
