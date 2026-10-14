import { copyFile, readFile, writeFile } from 'node:fs/promises';

// Read notices from the installed packages so dependency upgrades retain attribution.
const threeLicense = await readFile('node_modules/three/LICENSE', 'utf8');
const gsapHeaders = [];
for (const module of ['gsap-core', 'CSSPlugin', 'ScrollTrigger', 'Observer', 'MotionPathPlugin']) {
  const source = await readFile(`node_modules/gsap/${module}.js`, 'utf8');
  const header = source.match(/\/\*![\s\S]*?\*\//)?.[0];
  if (!header?.includes('Copyright') || !header.includes('https://gsap.com/standard-license')) {
    throw new Error(`Missing GSAP license notice: ${module}`);
  }
  gsapHeaders.push(header);
}
await writeFile('dist/THIRD_PARTY_NOTICES.txt', [
  'Motion Lab — third-party runtime notices',
  'Three.js',
  threeLicense.trim(),
  'GSAP (including CSSPlugin, ScrollTrigger, Observer and MotionPathPlugin)',
  ...gsapHeaders,
].join('\n\n') + '\n', 'utf8');
await copyFile('LICENSE', 'dist/LICENSE.txt');
