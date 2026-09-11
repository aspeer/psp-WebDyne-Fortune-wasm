# WebDyne Fortune in the browser

[Open the live demo](https://aspeer.github.io/psp-WebDyne-Fortune-wasm-browser/)

This is a browser deployment of the original
[Fortune WASM app](https://gitea.isolutions.com.au/aspeer/psp-WebDyne-Fortune-WASM).
The unchanged application runs Perl through WebAssembly in a dedicated worker.
`@webdyne/webdyne-zeroperl-browser` builds the shell, service worker and bundled
VFS assets into `htdocs/`. GitHub Pages serves those static files; no server-side
Perl or Cloudflare account is required. Application source is downloaded to the
browser. The shell uses hash navigation without iframes.

## Build from scratch

Use Node.js 22 or newer, npm, Perl and `cpanminus` (or Carton). For example,
on Ubuntu install the Perl dependency tool with `sudo apt-get install cpanminus`.
The initial build needs network access to install the application's Pure Perl
CPAN dependencies. The workflow installs this prerequisite automatically.

```sh
git clone https://github.com/aspeer/psp-WebDyne-Fortune-wasm-browser.git
cd psp-WebDyne-Fortune-wasm-browser
npm init -y
npm install @webdyne/webdyne-zeroperl-browser
npx webdyne-browser init
npm run build
npm run dev
```

Open the local URL printed by the development server. The generated static
site is in `htdocs/`; serve it over HTTP locally or HTTPS when hosted, rather
than opening `index.html` with a file URL. After the first successful load,
the service worker supports offline refresh and reload.

This repository intentionally omits `package.json`. `npm init -y` creates it
locally; installing the browser package (1.0.0 or newer) also installs the
ZeroPerl runtime automatically.
`npx webdyne-browser init` adds the `build`, `dev` and `gh-pages` npm targets
and the default configuration for `app/app.psp`, with output in `htdocs/`.

The generated `package.json`, npm lockfile and CPAN snapshot are ignored by
Git. Fresh installs use the current published browser package.
Optionally add `--save-dev` to the install command to classify it as a build
dependency; this does not change how the build works.
After setup, use `npm run build` to rebuild following application changes;
you do not need to repeat initialization. To update installed dependencies:

```sh
npm update
npm run build
```

## Publish to GitHub Pages

Every push to `main` runs `.github/workflows/pages.yml`: it creates the local npm project
using the same initialization commands above, installs dependencies, builds the app, updates the `gh-pages` branch and deploys the same output to
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

Starting in a directory containing `app/app.psp`:

```sh
npm init -y
npm install @webdyne/webdyne-zeroperl-browser
npx webdyne-browser init
npm run build
```

Declare any additional Pure Perl dependencies in `cpanfile`.
`init` creates the `build`, `dev` and `gh-pages` npm targets. If adding this
to an existing npm project, skip `npm init -y`. Existing Cloudflare build and
dev targets are preserved as `build:cloudflare` and `dev:cloudflare`.

## Verification

The local build and deployed GitHub Pages site both passed the Fortune
Chromium integration suite: initial rendering, repeated random-quote refresh,
full shell navigation, one HTMX request per refresh, offline refresh and
reload, no external CDN requests, and no iframes or browser exceptions.
The original `app/` files and `cpanfile` are unchanged from the source clone.
