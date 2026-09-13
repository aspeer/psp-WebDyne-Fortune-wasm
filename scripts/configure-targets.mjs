import { readFile, writeFile } from 'node:fs/promises';

// Add both hosting targets to the npm project created by webdyne-browser init.
const filename = new URL('../package.json', import.meta.url);
const project = JSON.parse(await readFile(filename, 'utf8'));
project.scripts ??= {};
const commands = {
  'build:browser': 'webdyne-browser build --output htdocs',
  'dev:browser': 'webdyne-browser dev --output htdocs',
  'deploy:browser': 'webdyne-browser gh-pages --output htdocs --remote origin',
};
for (const command of ['build', 'check', 'dev', 'deploy', 'destroy', 'login', 'logout', 'whoami']) {
  commands[`${command}:cloudflare`] = `webdyne-cloudflare ${command}`;
}
for (const [name, command] of Object.entries(commands)) {
  if (project.scripts[name] && project.scripts[name] !== command) {
    throw Error(`Refusing to replace custom npm script: ${name}`);
  }
  project.scripts[name] = command;
}
project.webdyne ??= {};
project.webdyne.appDirectory ??= 'app';
project.webdyne.entry ??= 'app.psp';
project.webdyne.static ??= false;
project.webdyne.outputDirectory ??= '.webdyne';
project.webdyne.cloudflare ??= {};
// Preserve the original Worker identity independently of the checkout name.
project.webdyne.cloudflare.name ??= 'psp-webdyne-fortune-wasm';
await writeFile(filename, JSON.stringify(project, null, 2) + '\n');
console.log('Configured browser and Cloudflare npm targets.');
