import { GAMES } from '../catalog/games';
import type { GameEntry } from '../catalog/types';
import { gameRoute } from '../core/router';
import { readBest } from '../core/scores';
import { thumbnailSvg } from './thumbnail';

/**
 * The game list.
 *
 * Rebuilt from scratch every time it is shown, which is what makes a best score
 * earned seconds ago appear the moment the player comes back from a game.
 *
 * Text from the catalog is set with `textContent`, never `innerHTML` — only the
 * thumbnail markup this module generates itself is injected as HTML.
 */

function formatBest(entry: GameEntry): string {
  const best = readBest(entry);
  return best === null ? '기록 없음' : `최고 ${best.toLocaleString('ko-KR')}점`;
}

function card(entry: GameEntry): HTMLElement {
  const playable = entry.status === 'live';

  const root = document.createElement(playable ? 'a' : 'div');
  root.className = 'card';
  if (playable) {
    (root as HTMLAnchorElement).href = gameRoute(entry.id);
  } else {
    root.classList.add('card--wip');
  }

  const thumb = document.createElement('div');
  thumb.className = 'card__thumb';
  thumb.innerHTML = thumbnailSvg(entry.id, entry.accent);
  root.append(thumb);

  const body = document.createElement('div');
  body.className = 'card__body';

  const title = document.createElement('h2');
  title.className = 'card__title';
  title.textContent = entry.title;

  const tagline = document.createElement('p');
  tagline.className = 'card__tagline';
  tagline.textContent = entry.tagline;

  const meta = document.createElement('p');
  meta.className = 'card__meta';
  meta.textContent = playable ? formatBest(entry) : '준비 중';

  body.append(title, tagline, meta);
  root.append(body);
  return root;
}

export function renderList(): HTMLElement {
  const view = document.createElement('div');
  view.className = 'view view--list';

  const intro = document.createElement('p');
  intro.className = 'list__intro';
  intro.textContent = '하고 싶은 게임을 고르세요.';

  const grid = document.createElement('div');
  grid.className = 'grid';
  for (const entry of GAMES) grid.append(card(entry));

  view.append(intro, grid);
  return view;
}

/** Shown for `#/game/<unknown>` — a stale bookmark or a removed game. */
export function renderNotFound(id: string): HTMLElement {
  const view = document.createElement('div');
  view.className = 'view view--empty';

  const heading = document.createElement('h2');
  heading.textContent = '없는 게임입니다';

  const detail = document.createElement('p');
  detail.textContent = `"${id}" 이라는 게임을 찾을 수 없습니다.`;

  const back = document.createElement('a');
  back.className = 'button';
  back.href = '#/';
  back.textContent = '목록으로';

  view.append(heading, detail, back);
  return view;
}
