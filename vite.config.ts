import { defineConfig } from 'vite';

/**
 * GitHub Pages project sites are served from /<repo>/, so the build needs a
 * matching `base` or every asset 404s. Deriving it from GITHUB_REPOSITORY means
 * the repo works under its own name — nothing to edit, and no chance of
 * shipping another project's path.
 *
 * The exception is a user or organization site, whose repository is named
 * `<owner>.github.io` and which is served from the **root**. Deriving base from
 * the name there would produce `/y3games.github.io/` and 404 every asset, with
 * a blank page as the only symptom. So that name means root, not a subpath.
 *
 * Locally the variable is unset, so dev and preview stay at the root too.
 */
const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isRootSite = repository?.endsWith('.github.io') ?? false;

export default defineConfig({
  base: repository && !isRootSite ? `/${repository}/` : '/',
  build: {
    target: 'es2022',
  },
});
