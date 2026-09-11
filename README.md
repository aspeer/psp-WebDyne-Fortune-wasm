# WebDyne Fortune on Cloudflare Workers via WebAssembly

A small WebDyne application that displays a random Perl fortune, with a Refresh
button to request another quote. The Cloudflare Worker runs `app/app.psp` through
WebDyne::PAGI using the WebDyne build of the ZeroPerl WebAssembly runtime.

## Quick start

Install Git, Node.js 22 or later with npm, and native Perl with either Carton or
cpanminus (`cpanm`). The build uses the native Perl tooling to install the
Pure-Perl `Fortune` dependency declared in `cpanfile`; Perl itself runs inside
WebAssembly in the deployed Worker.

Clone the repository from its GitHub mirror and install its npm dependencies:

```bash
git clone https://github.com/aspeer/psp-WebDyne-Fortune-wasm.git
cd psp-WebDyne-Fortune-wasm
npm install
```

The repository already contains the npm
scripts and WebDyne configuration, so no `npm init` or
`webdyne-cloudflare init` step is needed.

Build the application and validate the Worker bundle with a deployment dry run:

```bash
npm run build
npm run check
```

Generated files go into `.webdyne/`. The build bundles the application and its
fortune database from `app/`, and installs the extra Perl dependency into
`.webdyne/cpan/`. Carton is preferred when available because it honours
`cpanfile.snapshot`. `npm run check` does not publish the Worker.

Start the local Cloudflare Worker runtime:

```bash
npm run dev
```

Open the local URL printed by Wrangler, normally
[http://localhost:8787](http://localhost:8787). Confirm that a fortune and the
page styling appear, then click **Refresh** to request another fortune. Random
selection can return the same quote twice. Stop the server with Ctrl-C.

`npm run dev` builds before starting. Restart it after editing server-side files
or `app/.assetsignore`. That ignore file keeps Perl source and the fortune
database in the application bundle while allowing Wrangler to serve public
assets such as `app.css`.

## Cloudflare deployment

Use a Cloudflare account with access to Workers and capacity for the generated
WASM bundle. Log in, confirm the account, then deploy:

```bash
npm run login
npm run whoami
npm run deploy
```

The deployment command rebuilds the application and runs a Wrangler dry run
before uploading it. The generated Worker name is `psp-webdyne-fortune-wasm`.
Open the Worker URL printed by Wrangler and repeat the fortune and Refresh
checks above.

## Local validation with PAGI::Server

The same application can run under native Perl using WebDyne's PAGI wrapper.
From the cloned repository root, install the native dependencies:

```bash
cpanm WebDyne PAGI::Server PAGI::Tools HTML::Entities
cpanm --installdeps .
```

Ensure your Perl installation's executable directory is on `PATH`, so that
`webdyne.pagi` and `pagi-server` are available. Start the application with:

```bash
webdyne.pagi --host 127.0.0.1 --port 5001 --static --index=app.psp app
```

This starts `PAGI::Server` through `PAGI::Server::Runner`, uses `app/` as the
document root, serves `app.psp` at `/`, and enables static files for the CSS.
The `.psp` file is a WebDyne template, so it must be loaded through the WebDyne
wrapper rather than passed directly to `pagi-server` as a PAGI application.

Open [http://127.0.0.1:5001](http://127.0.0.1:5001) and confirm that the page is
styled and Refresh updates the fortune without reloading the whole page. In a
second terminal, check the page and stylesheet responses:

```bash
curl --fail http://127.0.0.1:5001/
curl --fail http://127.0.0.1:5001/app.css
```

Stop the server with Ctrl-C. This validates the native Perl/PAGI path; use
`npm run dev` as well to validate the WASM and Cloudflare Worker path. Native
validation does not require Node.js or a Cloudflare account.

## Further reading

- [WebDyne](https://webdyne.org)
- [WebDyne ZeroPerl runtime and Cloudflare options](https://github.com/aspeer/zeroperl/blob/main/WEBDYNE.md)
- [PAGI::Server documentation](https://metacpan.org/pod/PAGI::Server)
- [pagi-time-wasm example](https://github.com/aspeer/pagi-time-wasm)
