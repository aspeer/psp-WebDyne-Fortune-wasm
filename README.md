# WebDyne Fortune in the browser

[Open the live demo](https://aspeer.github.io/psp-WebDyne-Fortune-wasm-browser/)

This is a browser deployment of the original
[Fortune WASM app](https://gitea.isolutions.com.au/aspeer/psp-WebDyne-Fortune-WASM).
The unchanged application runs Perl through WebAssembly in a dedicated worker.
`@webdyne/webdyne-zeroperl-browser` builds the shell, service worker and bundled
VFS assets into `htdocs/`. GitHub Pages serves those static files; no server-side
Perl or Cloudflare account is required. Application source is downloaded to the
browser. The shell uses hash navigation without iframes.

## Build and preview

Use Node.js 22 or newer and npm. The initial build needs network access to
install the application's Pure Perl CPAN dependencies.

```sh
git clone https://github.com/aspeer/psp-WebDyne-Fortune-wasm-browser.git
cd psp-WebDyne-Fortune-wasm-browser
npm install
npm run build
npm run dev
```

Open the local URL printed by the development server. The generated static
site is in `htdocs/`; serve it over HTTP locally or HTTPS when hosted, rather
than opening `index.html` with a file URL. After the first successful load,
the service worker supports offline refresh and reload.

The app accepts `@webdyne/webdyne-zeroperl` versions matching `^1.0.9` and
`@webdyne/webdyne-zeroperl-browser` versions matching `^0.1.0`. Lockfiles and
CPAN snapshots are ignored, so fresh installs resolve compatible releases.
To upgrade the installed runtime before rebuilding:

```sh
npm install @webdyne/webdyne-zeroperl@^1.0.9
npm run build
```

Commit `package.json` changes when changing the supported dependency versions.

## Publish to GitHub Pages

Every push to `main` runs `.github/workflows/pages.yml`: it installs dependencies,
builds the app, updates the `gh-pages` branch and deploys the same output to
GitHub Pages. You can also run the workflow manually from the Actions tab.
No additional token secret is required.

For a manual deployment with Git push access to this repository:

```sh
npm run build
npm run gh-pages
```

The `gh-pages` target rebuilds and publishes `htdocs/`, including `.nojekyll`, to the
`gh-pages` branch on `origin`. It preserves the source checkout and deployment
history. The destination is resolved from `git remote get-url --push origin`;
no repository name is embedded in the publishing target. A manual push to
`gh-pages` triggers GitHub's standard branch-based Pages deployment.
Allow the workflow to finish before opening the live demo.

For a fork, set `origin` to your GitHub repository and enable Pages under
Settings → Pages → Deploy from a branch → `gh-pages` → `/ (root)`.
Enable Actions in the fork too.
If the `github-pages` environment restricts deployment branches, allow both
`main` and `gh-pages`.
The build supports repository subpaths without editing a base URL.

## Add browser builds to another WebDyne app

Starting with an `app/app.psp` file and an npm project:

```sh
npm install @webdyne/webdyne-zeroperl@^1.0.9
npm install --save-dev @webdyne/webdyne-zeroperl-browser@^0.1.0
npx webdyne-browser init
npm run build
```

Declare any additional Pure Perl dependencies in `cpanfile`.
`init` creates the `build`, `dev` and `gh-pages` npm targets. Existing
Cloudflare build and dev targets are retained as `build:cloudflare` and
`dev:cloudflare` in this repository.

## Verification

The local build and deployed GitHub Pages site both passed the Fortune
Chromium integration suite: initial rendering, repeated random-quote refresh,
full shell navigation, one HTMX request per refresh, offline refresh and
reload, no external CDN requests, and no iframes or browser exceptions.
The original `app/` files and `cpanfile` are unchanged from the source clone.
