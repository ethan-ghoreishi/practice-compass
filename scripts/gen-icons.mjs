// Rasterise public/icon.svg into the PNG sizes the PWA manifest needs.
// Run with: node scripts/gen-icons.mjs  (requires the `sharp` dev dependency)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const pub = (name) => fileURLToPath(new URL(`../public/${name}`, import.meta.url));
const svg = readFileSync(pub('icon.svg'));

const targets = [
  [192, 'pwa-192.png'],
  [512, 'pwa-512.png'],
  [512, 'maskable-512.png'],
  [180, 'apple-touch-icon.png'],
];

for (const [size, name] of targets) {
  await sharp(svg, { density: 384 }).resize(size, size).png().toFile(pub(name));
  console.log('wrote', name, `${size}x${size}`);
}
