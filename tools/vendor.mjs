/**
 * Regenerates everything under `/vendor` from npm.
 *
 * The output is committed to the repository on purpose: the course itself has
 * no build step and no network dependency. This script only exists so the
 * vendored files can be audited and upgraded reproducibly.
 *
 *   npm install --no-save three gsap esbuild @fontsource-variable/inter @fontsource/ibm-plex-mono
 *   node tools/vendor.mjs
 */
import { build } from 'esbuild';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = (name) => JSON.parse(readFileSync(resolve(root, 'node_modules', name, 'package.json'), 'utf8'));

mkdirSync(resolve(root, 'vendor/three'), { recursive: true });
mkdirSync(resolve(root, 'vendor/gsap'), { recursive: true });

const three = pkg('three');
await build({
  entryPoints: [resolve(root, 'tools/three.entry.js')],
  bundle: true,
  minify: true,
  format: 'iife',
  globalName: 'THREE',
  target: ['es2019'],
  legalComments: 'none',
  banner: { js: `/*! three.js r${three.version.split('.')[1]} (MIT) - slim build, see tools/three.entry.js */` },
  outfile: resolve(root, 'vendor/three/three.slim.js')
});

const gsap = pkg('gsap');
for (const file of ['gsap.min.js', 'ScrollTrigger.min.js']) {
  copyFileSync(resolve(root, 'node_modules/gsap/dist', file), resolve(root, 'vendor/gsap', file));
}

copyFileSync(resolve(root, 'node_modules/three/LICENSE'), resolve(root, 'vendor/three/LICENSE'));

// Fonts. Latin subsets only — they already cover every Portuguese diacritic.
mkdirSync(resolve(root, 'assets/fonts'), { recursive: true });
const inter = pkg('@fontsource-variable/inter');
const plex = pkg('@fontsource/ibm-plex-mono');
const fontFiles = [
  ['@fontsource-variable/inter/files/inter-latin-opsz-normal.woff2', 'inter-latin-variable.woff2'],
  ['@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2', 'ibm-plex-mono-400.woff2'],
  ['@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2', 'ibm-plex-mono-500.woff2']
];
for (const [from, to] of fontFiles) {
  copyFileSync(resolve(root, 'node_modules', from), resolve(root, 'assets/fonts', to));
}
copyFileSync(resolve(root, 'node_modules/@fontsource-variable/inter/LICENSE'), resolve(root, 'assets/fonts/LICENSE-inter.txt'));
copyFileSync(resolve(root, 'node_modules/@fontsource/ibm-plex-mono/LICENSE'), resolve(root, 'assets/fonts/LICENSE-ibm-plex-mono.txt'));

writeFileSync(
  resolve(root, 'vendor/NOTICE.md'),
  `# Third-party code vendored into this repository

Nothing here is loaded from a CDN. Every file below ships with the project so the
course runs with the network cable unplugged.

| Library | Version | File(s) | License |
| --- | --- | --- | --- |
| three.js | ${three.version} | \`vendor/three/three.slim.js\` | MIT (\`vendor/three/LICENSE\`) |
| GSAP + ScrollTrigger | ${gsap.version} | \`vendor/gsap/gsap.min.js\`, \`vendor/gsap/ScrollTrigger.min.js\` | GreenSock standard "no charge" license — https://gsap.com/standard-license |
| Inter Variable | ${inter.version} | \`assets/fonts/inter-latin-variable.woff2\` | SIL OFL 1.1 (\`assets/fonts/LICENSE-inter.txt\`) |
| IBM Plex Mono | ${plex.version} | \`assets/fonts/ibm-plex-mono-*.woff2\` | SIL OFL 1.1 (\`assets/fonts/LICENSE-ibm-plex-mono.txt\`) |

\`three.slim.js\` is not the stock distribution: it is a tree-shaken IIFE build
containing only the classes listed in \`tools/three.entry.js\`, because three.js
ships ES modules only and ES modules cannot load over \`file://\`.

Regenerate with:

\`\`\`bash
npm install --no-save three gsap esbuild @fontsource-variable/inter @fontsource/ibm-plex-mono
node tools/vendor.mjs
\`\`\`
`
);

console.log('vendor/ regenerated — three', three.version, '| gsap', gsap.version, '| inter', inter.version, '| plex', plex.version);
