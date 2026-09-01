import { cpSync, existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const projectRoot = resolve(import.meta.dirname, '..');
const source = resolve(projectRoot, '..', 'trailride');
const target = resolve(projectRoot, 'www');

if (!existsSync(source)) {
  throw new Error(`TrailRide web source not found at ${source}`);
}

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });

// Bundle the npm-imported Capacitor Geolocation plugin into browser-compatible JS.
// This guarantees the static TrailRide UI can call the real native iOS plugin.
const bridgeEntry = resolve(projectRoot, 'scripts', 'native-bridge.js');
const bridgeOutput = resolve(target, 'native-bridge.js');
const esbuild = resolve(projectRoot, 'node_modules', '.bin', 'esbuild');
execFileSync(esbuild, [bridgeEntry, '--bundle', '--platform=browser', '--format=iife', `--outfile=${bridgeOutput}`], { stdio: 'inherit' });

const indexPath = resolve(target, 'index.html');
let html = readFileSync(indexPath, 'utf8');
const nativeScripts = '<script src="native-bridge.js?v=44"></script><script src="native-near-me.js?v=44"></script>';
html = html.replace(/<script src="native-near-me\.js\?v=\d+"><\/script>/g, '');
html = html.replace('</body>', `${nativeScripts}</body>`);
writeFileSync(indexPath, html);

console.log(`Copied TrailRide web app to ${target} with bundled native geolocation support`);
