import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const catalog = path.join(root, 'ios/App/App/Assets.xcassets/AppIcon.appiconset');
const manifestPath = path.join(catalog, 'Contents.json');
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const svg = await fs.readFile(path.join(root, '../trailride/icon.svg'));
let count = 0;
for (const entry of manifest.images) {
  const size = entry.size || (entry.idiom === 'universal' ? '1024x1024' : null);
  if (!size) throw new Error('App icon slot has no size');
  const pixels = Math.round(Number(size.split('x')[0]) * Number((entry.scale || '1x').replace('x', '')));
  if (!Number.isInteger(pixels) || pixels < 1) throw new Error('Invalid app icon dimensions');
  const filename = 'TrailRide-' + pixels + '.png';
  await sharp(svg, { density: 288 }).resize(pixels, pixels)
    .flatten({ background: '#173f2a' }).removeAlpha().png()
    .toFile(path.join(catalog, filename));
  const metadata = await sharp(path.join(catalog, filename)).metadata();
  if (metadata.width !== pixels || metadata.height !== pixels || metadata.hasAlpha) {
    throw new Error('App icon must be square and opaque');
  }
  entry.filename = filename;
  count++;
}
if (!count) throw new Error('No app icon slots found');
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log('Configured ' + count + ' TrailRide app icon slots');
