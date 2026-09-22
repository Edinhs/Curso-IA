# Third-party code vendored into this repository

Nothing here is loaded from a CDN. Every file below ships with the project so the
course runs with the network cable unplugged.

| Library | Version | File(s) | License |
| --- | --- | --- | --- |
| three.js | 0.186.0 | `vendor/three/three.slim.js` | MIT (`vendor/three/LICENSE`) |
| GSAP + ScrollTrigger | 3.15.0 | `vendor/gsap/gsap.min.js`, `vendor/gsap/ScrollTrigger.min.js` | GreenSock standard "no charge" license — https://gsap.com/standard-license |
| Inter Variable | 5.3.0 | `assets/fonts/inter-latin-variable.woff2` | SIL OFL 1.1 (`assets/fonts/LICENSE-inter.txt`) |
| IBM Plex Mono | 5.3.0 | `assets/fonts/ibm-plex-mono-*.woff2` | SIL OFL 1.1 (`assets/fonts/LICENSE-ibm-plex-mono.txt`) |

`three.slim.js` is not the stock distribution: it is a tree-shaken IIFE build
containing only the classes listed in `tools/three.entry.js`, because three.js
ships ES modules only and ES modules cannot load over `file://`.

Regenerate with:

```bash
npm install --no-save three gsap esbuild @fontsource-variable/inter @fontsource/ibm-plex-mono
node tools/vendor.mjs
```
