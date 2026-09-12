import { findGame, GAME_IDS } from './catalog/games';
import { parseRoute } from './core/router';
import { parseScoreReport, recordReport } from './core/scores';
import { nextThemePref, readThemePref, saveThemePref, THEME_LABELS } from './core/theme';
import type { ThemePref } from './core/theme';
import { renderGame } from './ui/GameView';
import type { MountedView } from './ui/GameView';
import { createPlayerChip } from './ui/PlayerChip';
import { renderList, renderNotFound } from './ui/ListView';
import './style.css';

const app = document.querySelector<HTMLElement>('#app');
if (!app) throw new Error('#app is missing from index.html');

// ── theme ────────────────────────────────────────────────────────────────────

let themePref: ThemePref = readThemePref();
const themeButton = document.createElement('button');
themeButton.className = 'theme-toggle';
themeButton.type = 'button';

function applyTheme(): void {
  // `system` removes the attribute entirely so the CSS falls through to
  // prefers-color-scheme and keeps tracking the OS as it changes.
  if (themePref === 'system') {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = themePref;
  }
  themeButton.textContent = `테마: ${THEME_LABELS[themePref]}`;
  themeButton.setAttribute('aria-label', `테마 전환 (현재 ${THEME_LABELS[themePref]})`);
}

themeButton.addEventListener('click', () => {
  themePref = nextThemePref(themePref);
  saveThemePref(themePref);
  applyTheme();
});
applyTheme();

// ── chrome ───────────────────────────────────────────────────────────────────

const header = document.createElement('header');
header.className = 'header';

const brand = document.createElement('a');
brand.className = 'header__brand';
brand.href = '#/';
brand.textContent = 'Y3GAMES';

// The identity the games themselves wrote. Renaming here renames everywhere,
// because the cookie is shared by the whole origin.
const playerChip = createPlayerChip({
  // A rename changes the greeting on the list, so redraw whatever is mounted.
  onChange: () => render(),
});

const headerActions = document.createElement('div');
headerActions.className = 'header__actions';
headerActions.append(playerChip.element, themeButton);

header.append(brand, headerActions);

const main = document.createElement('main');
main.className = 'main';

app.append(header, main);

// ── routing ──────────────────────────────────────────────────────────────────

let mounted: MountedView | null = null;

function render(): void {
  playerChip.refresh();

  // Always tear the previous view down first: leaving a game means the iframe
  // has to go before anything else is drawn.
  mounted?.destroy();
  mounted = null;
  main.replaceChildren();

  const route = parseRoute(location.hash, GAME_IDS);

  if (route.kind === 'game') {
    const entry = findGame(route.id);
    if (entry) {
      mounted = renderGame(entry);
      main.append(mounted.element);
      header.classList.add('header--compact');
      return;
    }
  }

  header.classList.remove('header--compact');
  main.append(route.kind === 'notFound' ? renderNotFound(route.id) : renderList());
}

window.addEventListener('hashchange', render);
render();

// ── refresh on change ────────────────────────────────────────────────────────

/**
 * Redraw the list when a game's stored record may have changed.
 *
 * Only while the list is showing. Re-rendering a mounted game would tear down
 * its iframe and reload the game — losing the run the player is in the middle
 * of. `MountedView.destroy()` exists for leaving a game, not for a refresh.
 */
function refreshList(): void {
  if (parseRoute(location.hash, GAME_IDS).kind !== 'list') return;
  render();
}

// A game in another tab — or in this page's own iframe, which is a separate
// browsing context — just wrote its best score. `storage` fires everywhere
// except the context that wrote it, which is exactly what this needs.
window.addEventListener('storage', refreshList);

// Belt and braces for what `storage` cannot see: the player name lives in a
// cookie (cookies fire no storage event), and a back/forward restore from the
// bfcache re-shows the page without firing anything at all.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') refreshList();
});
window.addEventListener('pageshow', (event) => {
  if (event.persisted) refreshList();
});

// ── optional score reporting ─────────────────────────────────────────────────

// A game may post its score up as it plays so the card updates without a
// reload. Nothing sends this today; the listener is here so a game that starts
// sending it needs no portal change. Every message is validated before use.
window.addEventListener('message', (event: MessageEvent) => {
  const report = parseScoreReport(event.origin, event.data, location.origin);
  if (!report || !recordReport(report)) return;
  // Only the list shows scores; redrawing a running game would reload it.
  if (parseRoute(location.hash, GAME_IDS).kind === 'list') render();
});
