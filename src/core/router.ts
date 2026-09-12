/**
 * Hash routing.
 *
 * The portal is a static site on a project-path Pages deployment, so there is
 * no server to rewrite paths — hash routes are the only form of deep link that
 * survives a reload. Parsing is a pure function over the string so the whole
 * route table is unit-tested without a browser.
 */

export type Route =
  | { readonly kind: 'list' }
  | { readonly kind: 'game'; readonly id: string }
  | { readonly kind: 'notFound'; readonly id: string };

export const LIST_ROUTE = '#/';

/** `#/game/mergedrop` for a game id. */
export function gameRoute(id: string): string {
  return `#/game/${id}`;
}

/**
 * `knownIds` is passed in rather than imported so routing stays independent of
 * the catalog — and so tests can drive it with a fixture instead of the real
 * game list.
 */
export function parseRoute(hash: string, knownIds: ReadonlySet<string>): Route {
  const path = hash.replace(/^#/, '').replace(/^\/+/, '');
  if (path === '') return { kind: 'list' };

  const segments = path.split('/').filter((segment) => segment !== '');
  if (segments.length === 2 && segments[0] === 'game') {
    const id = decodeURIComponent(segments[1]).toLowerCase();
    return knownIds.has(id) ? { kind: 'game', id } : { kind: 'notFound', id };
  }

  return { kind: 'notFound', id: path };
}
