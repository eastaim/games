import { gameUrl } from '../catalog/games';
import type { GameEntry } from '../catalog/types';

/**
 * A game running inside the portal.
 *
 * The game is a whole separate site in an iframe, not a module the portal
 * imports. That is the entire reason games need no changes to appear here.
 */

/** How long to wait for the game before offering a way out. */
const LOAD_TIMEOUT_MS = 15_000;

export interface MountedView {
  readonly element: HTMLElement;
  /** Must be called when leaving, or the game keeps running behind the list. */
  destroy(): void;
}

export function renderGame(entry: GameEntry): MountedView {
  const url = gameUrl(entry);

  const view = document.createElement('div');
  view.className = 'view view--game';

  // Bar stays outside the iframe so the way back is never at the mercy of the
  // game's own input handling.
  const bar = document.createElement('div');
  bar.className = 'gamebar';

  const back = document.createElement('a');
  back.className = 'gamebar__back';
  back.href = '#/';
  back.textContent = '← 목록';

  const title = document.createElement('span');
  title.className = 'gamebar__title';
  title.textContent = entry.title;

  const openNew = document.createElement('a');
  openNew.className = 'gamebar__link';
  openNew.href = url;
  openNew.target = '_blank';
  openNew.rel = 'noopener';
  openNew.textContent = '새 창';

  bar.append(back, title, openNew);

  const stage = document.createElement('div');
  stage.className = 'stage';

  const status = document.createElement('div');
  status.className = 'stage__status';
  status.textContent = '불러오는 중…';

  const frame = document.createElement('iframe');
  frame.className = 'stage__frame';
  frame.src = url;
  frame.title = entry.title;
  // No `sandbox`: these are our own games on our own origin, and sandboxing
  // without allow-same-origin would cut them off from the localStorage their
  // best scores live in — the portal would then show every game as unplayed.
  frame.allow = 'fullscreen; autoplay; gamepad';

  let timeout: number | undefined = window.setTimeout(() => {
    timeout = undefined;
    status.textContent = '';
    status.append(stalled(url));
  }, LOAD_TIMEOUT_MS);

  frame.addEventListener('load', () => {
    if (timeout !== undefined) window.clearTimeout(timeout);
    timeout = undefined;
    status.remove();
    // Keyboard events go to whatever document has focus. Without this a game
    // driven by arrow keys ignores every keypress until the player clicks it.
    try {
      frame.contentWindow?.focus();
    } catch {
      // Cross-origin (local dev against the deployed host) — the player can
      // still click into the game to focus it.
    }
  });

  stage.append(frame, status);
  view.append(bar, stage);

  // Stops the page behind the game from scrolling and kills pull-to-refresh,
  // which otherwise fires on the first downward swipe in a portrait game.
  document.body.classList.add('is-playing');

  return {
    element: view,
    destroy() {
      if (timeout !== undefined) window.clearTimeout(timeout);
      document.body.classList.remove('is-playing');
      // Removing the element tears the whole game document down with it:
      // render loop, audio, timers. Clearing `src` instead leaves them running.
      frame.remove();
    },
  };
}

/** Escape hatch when a game never loads — not deployed yet, or offline. */
function stalled(url: string): DocumentFragment {
  const fragment = document.createDocumentFragment();

  const message = document.createElement('p');
  message.textContent = '게임이 응답하지 않습니다.';

  const link = document.createElement('a');
  link.className = 'button';
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = '새 창에서 열기';

  fragment.append(message, link);
  return fragment;
}
