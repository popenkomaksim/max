# max

Personal single-page site built with React, Vite, Tailwind CSS, and `react-router-dom` (`HashRouter`), ready to host on GitHub Pages.

## Pages

- `/` — Home: bio, highlights, contact links
- `/wishlist` — Item tracker with category filter and acquired toggle
- `/about` — Experience timeline

## Development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

## Deploy to GitHub Pages

Deployment happens automatically via [.github/workflows/deploy.yml](.github/workflows/deploy.yml) on every push to `main` (using GitHub Pages' native Actions deployment — enable it once under **Settings → Pages → Source → GitHub Actions**).

To deploy manually instead:

```sh
npm run deploy
```

This runs `predeploy` (build) then publishes `dist/` to the `gh-pages` branch via the `gh-pages` package.

The Vite `base` in [vite.config.js](vite.config.js) is set to `/max/` to match this repo's name — update it if the repo is renamed or forked.
