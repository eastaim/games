# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

The game portal: one page listing every web game, deployed to GitHub Pages at
`https://eastaim.github.io/games/`. Vite + TypeScript, **no framework and no Phaser** — the portal
is a list and a shell, and staying tiny is why the list paints instantly while a game loads.

Games are **not** part of this repository. Each keeps its own repo and its own Pages deployment;
the portal knows a game only by its URL and runs it in an iframe. Nothing here may import from a
game, and adding a game must never require editing one.

Player-facing copy is Korean. There is no backend.

## Commands

```bash
npm run dev      # Vite dev server at http://localhost:5173/
npm run check    # tsc --noEmit && eslint . && vitest run  ← must pass before calling work done
npm test         # vitest only
npm run build    # type-check then produce dist/
```

## Architecture

Data flows in one direction: the hash → a route → the catalog → a view.

- `src/catalog/games.ts` — **the game list, as data.** Adding a game is one entry here and nothing
  else. Code that special-cases a particular game belongs nowhere.
- `src/core/` — pure modules that import no DOM, so the whole route table, the score rules and the
  message validation are unit-tested without a browser. `ui/` is the only layer that touches the DOM.
- `src/core/storage.ts` — the single guarded `localStorage` wrapper. Nothing else calls
  `localStorage` directly; `scores.ts` and `theme.ts` both go through it.
- `src/core/router.ts` — `parseRoute()` takes the known ids as an argument rather than importing
  the catalog, which is what keeps it pure and lets tests drive it with a fixture.
- `src/ui/GameView.ts` — mounts the iframe, owns its teardown.

## Gotchas

- **Give the iframe `position: absolute; inset: 0`, never `height: 100%`.** The stage is sized by
  `flex: 1`, and a percentage height against a flex-sized parent does not resolve — the iframe
  silently collapses to its 150px intrinsic default and the game renders as a thin strip.
- **Leaving a game must remove the iframe element.** Clearing `src` leaves the game's render loop,
  audio and timers running behind the list. `MountedView.destroy()` exists for this; call it before
  drawing anything else.
- **Do not put `sandbox` on the game iframe.** Without `allow-same-origin` it cuts the game off
  from the localStorage its best score lives in, and every card then reads as unplayed.
- **Focus the iframe on `load`.** Keyboard events go to the focused document; a game driven by
  arrow keys ignores every keypress until the player clicks into it.
- **`100dvh`, never `100vh`.** On mobile the address bar makes `100vh` taller than the screen and
  the bottom of a portrait game is cut off.
- **Treat `postMessage` data as untrusted.** `parseScoreReport()` checks the origin first and
  type-checks every field. Anything embedded can post to this window.
- **Do not hardcode `base` in `vite.config.ts`.** It is derived from `GITHUB_REPOSITORY`.
  Hardcoding it 404s every asset on deploy.
- Scores are invisible in local dev — the games load cross-origin from the deployed host. That is
  expected, not a bug. Verify score display on the deployed site.

## Documentation

Follow the `save-docs` skill for anything under `docs/`.
