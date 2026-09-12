import type { GameEntry } from './types';

/**
 * The game list. This is data — adding a game is one entry here, and that is
 * the whole contract. Games keep their own repository and their own GitHub
 * Pages deployment; the portal never builds or imports them.
 */
export const GAMES: readonly GameEntry[] = [
  {
    id: 'mergedrop',
    title: 'MergeDrop',
    tagline: '같은 과일을 떨어뜨려 합치는 물리 퍼즐',
    path: '/MergeDrop/',
    accent: '#f2792c',
    status: 'live',
  },
  {
    id: 'phaser-starter',
    title: 'Ball Drop',
    tagline: '공을 떨어뜨려 점수를 쌓는 템플릿 데모',
    path: '/phaser-starter/',
    accent: '#4fc3f7',
    status: 'live',
  },
];

/**
 * Where the games actually live.
 *
 * In production the portal is served from the same Pages host as the games, so
 * `location.origin` keeps the iframe same-origin — which is what makes reading
 * a game's best score possible at all. In local dev there is no game on
 * localhost, so point at the real host; the games then load and play, but they
 * are cross-origin and their scores stay invisible.
 */
const GAME_HOST = 'https://y3games.github.io';

export function gameUrl(entry: GameEntry): string {
  const host = import.meta.env.DEV ? GAME_HOST : location.origin;
  return `${host}${entry.path}`;
}

export function findGame(id: string): GameEntry | undefined {
  return GAMES.find((game) => game.id === id);
}

export const GAME_IDS: ReadonlySet<string> = new Set(GAMES.map((game) => game.id));
