# CLAUDE.md

## Adding a new page/route

The site is deployed as static files to GitHub Pages, which has no server-side rewrite — every route needs its own physical `index.html` in `dist/` so direct links and refreshes don't 404. When adding a route:

1. Add the page component under `src/pages/` and wire it into `src/App.jsx`'s `<Routes>`.
2. Add a matching `mkdir -p dist/<route> && cp dist/index.html dist/<route>/index.html` entry to the `predeploy` script in [package.json](package.json). A route left out of `predeploy` will work in dev (`npm run dev`) but 404 on GitHub Pages when loaded directly (not via in-app navigation).
3. Update the page list in [README.md](README.md).

## Deployment conventions

- Routing uses `BrowserRouter` (real paths, not hash routing) — see [src/main.jsx](src/main.jsx). The app is served from a custom domain at the root, so [vite.config.js](vite.config.js) sets `base: '/'`. If the site ever moves off the custom domain back to `<user>.github.io/<repo>`, `base` must change to `/<repo>/` and the `predeploy` per-route copy step becomes even more load-bearing.
- `public/CNAME` (currently `maksym.popenko.pp.ua`) and `public/.nojekyll` must stay in `public/` — Vite copies `public/*` verbatim into `dist/`, and GitHub Pages reads `CNAME`/`.nojekyll` from the published root.
- `index.html` contains an inline pre-mount script that rewrites legacy hash links (e.g. `/#/wishlist`) to real paths for backward compatibility with old shared links from before the `HashRouter` → `BrowserRouter` migration. Don't remove it unless you're sure no old hash links are still in circulation.
- Deployment to GitHub Pages happens automatically via [.github/workflows/deploy.yml](.github/workflows/deploy.yml) on every push to `main`. `npm run deploy` (the `gh-pages` package) is a manual fallback — both paths go through `predeploy`, so a route missing from that script will 404 either way.

## src/data/mountains.json conventions

- `location` must be written as: the country's official name in its own official language, followed by the localised name in parentheses — e.g. `"Ελλάδα (Греція)"` for a `uk` entry, `"Ελλάδα (Greece)"` for `en`.
- `name` follows the same pattern: the peak's official name in its own official/local language, followed by the localised name in parentheses — e.g. `"Σκάλα (Скала)"` for a `uk` entry, `"Σκάλα (Skala Summit)"` for `en`.
- In both fields, when the native name and the localised name are identical, omit the parentheses (write just the single name).
