import { cpSync, existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
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

// Native iOS bundle: load the Capacitor-aware Near Me bridge directly.
const indexPath = resolve(target, 'index.html');
let html = readFileSync(indexPath, 'utf8');
if (!html.includes('native-near-me.js')) {
  html = html.replace('</body>', '<script src="native-near-me.js?v=43"></script></body>');
  writeFileSync(indexPath, html);
}

console.log(`Copied TrailRide web app to ${target} with native Near Me support`);
