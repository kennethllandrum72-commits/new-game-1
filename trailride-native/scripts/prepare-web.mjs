import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const source = resolve(projectRoot, '..', 'trailride');
const target = resolve(projectRoot, 'www');

if (!existsSync(source)) {
  throw new Error(`TrailRide web source not found at ${source}`);
}

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });

console.log(`Copied TrailRide web app to ${target}`);
