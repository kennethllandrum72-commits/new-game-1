import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const plist = resolve(root, 'ios', 'App', 'App', 'Info.plist');

if (!existsSync(plist)) {
  throw new Error(`Info.plist not found at ${plist}; run after cap add/sync.`);
}

const plistBuddy = '/usr/libexec/PlistBuddy';
const run = (command, { allowFailure = false } = {}) => {
  try {
    return execFileSync(plistBuddy, ['-c', command, plist], { encoding: 'utf8' }).trim();
  } catch (error) {
    if (allowFailure) return '';
    throw error;
  }
};

// Near Me only needs foreground When-In-Use authorization. Remove any stale
// Always/background keys first. PlistBuddy writes at the ROOT dictionary,
// avoiding the prior XML-regex bug that could insert the key into a nested dict.
run('Delete :NSLocationAlwaysAndWhenInUseUsageDescription', { allowFailure: true });
run('Delete :NSLocationAlwaysUsageDescription', { allowFailure: true });
run('Delete :UIBackgroundModes', { allowFailure: true });
run('Delete :NSLocationWhenInUseUsageDescription', { allowFailure: true });
run('Add :NSLocationWhenInUseUsageDescription string TrailRide uses your location when you tap Near Me to find trails and cycling routes near you.');

const usage = run('Print :NSLocationWhenInUseUsageDescription');
if (!usage.includes('TrailRide uses your location')) {
  throw new Error(`NSLocationWhenInUseUsageDescription verification failed: ${usage}`);
}

const always = run('Print :NSLocationAlwaysAndWhenInUseUsageDescription', { allowFailure: true });
if (always) throw new Error('Unexpected Always location permission is still present');

const background = run('Print :UIBackgroundModes', { allowFailure: true });
if (background) throw new Error('Unexpected UIBackgroundModes is still present');

console.log(`Verified root NSLocationWhenInUseUsageDescription: ${usage}`);
