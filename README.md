# WebDyne Fortune — browser and Cloudflare

[Open the live demo](https://aspeer.github.io/psp-WebDyne-Fortune-wasm-browser/)

One Fortune application supports two WebAssembly deployment targets: a static
browser site and a Cloudflare Worker. It can also run under native Perl/PAGI.
This repository consolidates the original Fortune WASM app and its browser demo;
all targets share `app/` and `cpanfile`.

For the browser target, Perl runs in a dedicated Web Worker.
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
npm install @webdyne/webdyne-zeroperl-browser @webdyne/webdyne-zeroperl
npx webdyne-browser init
node scripts/configure-targets.mjs
npm run build
npm run dev
```

Open the local URL printed by the development server. The generated static
site is in `htdocs/`; serve it over HTTP locally or HTTPS when hosted, rather
than opening `index.html` with a file URL. After the first successful load,
the service worker supports offline refresh and reload.

This repository intentionally omits `package.json`. `npm init -y` creates it
locally. The browser package also depends on the ZeroPerl runtime; installing
the runtime directly makes its Cloudflare CLI explicitly available to this app.
`npx webdyne-browser init` adds the `build`, `dev` and `gh-pages` npm targets
and the default configuration for `app/app.psp`, with output in `htdocs/`.
`node scripts/configure-targets.mjs` adds the explicit hosting targets below and
retains the original Cloudflare Worker name. Both initialization steps can be
repeated; the target script preserves existing configuration and rejects
conflicting custom commands.

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

## Choose a runtime

| Task | Browser / static hosting | Cloudflare Workers |
| --- | --- | --- |
| Build | `npm run build:browser` | `npm run build:cloudflare` |
| Run locally | `npm run dev:browser` | `npm run dev:cloudflare` |
| Validate bundle | Build, then exercise the browser | `npm run check:cloudflare` |
| Publish | `npm run deploy:browser` | `npm run deploy:cloudflare` |
| Generated output | `htdocs/`, `.webdyne-local/` | `.webdyne/` |

`build`, `dev` and `gh-pages` remain the browser defaults. The browser target
downloads Perl and the application to the visitor's browser and supports offline
use after loading. The Cloudflare target executes Perl on the Worker and needs
a network connection. Native Perl/PAGI is another way to run the same source.

See [Cloudflare and native PAGI instructions](README.cloudflare.md) for local
validation, authentication and deployment. Pages automation publishes only the
browser target; Cloudflare deployment is an explicit command.

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

The consolidated setup was validated on 2026-09-13 with the published browser
package 1.0.0 and ZeroPerl runtime 1.0.15: browser build and Chromium Fortune
integration suite, Cloudflare deployment dry run, local Worker full-page/HTMX/CSS
requests, PSP lint and native HTMX rendering. The target configuration script
also produces identical configuration when run again. No deployment was made
as part of that validation.

Before consolidation, the local build and deployed GitHub Pages site both passed
the Fortune Chromium integration suite: initial rendering, repeated random-quote refresh,
full shell navigation, one HTMX request per refresh, offline refresh and
reload, no external CDN requests, and no iframes or browser exceptions.
The application and `cpanfile` match the Cloudflare checkout at `b07fd11`.
The render-time display was removed after the original clone; the fortune logic,
styles and databases are shared across both targets.
