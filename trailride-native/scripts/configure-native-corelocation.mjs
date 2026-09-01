import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const appDelegate = resolve(root, 'ios', 'App', 'App', 'AppDelegate.swift');

if (!existsSync(appDelegate)) {
  throw new Error(`AppDelegate.swift not found at ${appDelegate}`);
}

let s = readFileSync(appDelegate, 'utf8');

if (!s.includes('import CoreLocation')) {
  s = s.replace('import UIKit', 'import UIKit\nimport CoreLocation');
}

if (!s.includes('trailRideLocationManager')) {
  s = s.replace(
    'class AppDelegate: UIResponder, UIApplicationDelegate {',
    'class AppDelegate: UIResponder, UIApplicationDelegate {\n\n    private let trailRideLocationManager = CLLocationManager()'
  );
}

if (!s.includes('TRAILRIDE_NATIVE_LOCATION_BOOTSTRAP')) {
  const marker = `        // TRAILRIDE_NATIVE_LOCATION_BOOTSTRAP\n        trailRideLocationManager.desiredAccuracy = kCLLocationAccuracyHundredMeters\n        if CLLocationManager.locationServicesEnabled() {\n            trailRideLocationManager.requestWhenInUseAuthorization()\n        }\n`;
  const launchSignature = 'func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {';
  const launchIndex = s.indexOf(launchSignature);
  if (launchIndex < 0) throw new Error('Could not find didFinishLaunchingWithOptions in AppDelegate.swift');
  const returnIndex = s.indexOf('return true', launchIndex);
  if (returnIndex < 0) throw new Error('Could not find return true in didFinishLaunchingWithOptions');
  s = s.slice(0, returnIndex) + marker + s.slice(returnIndex);
}

writeFileSync(appDelegate, s);

const verify = readFileSync(appDelegate, 'utf8');
if (!verify.includes('import CoreLocation') ||
    !verify.includes('requestWhenInUseAuthorization()') ||
    !verify.includes('trailRideLocationManager')) {
  throw new Error('Native CoreLocation bootstrap was not installed correctly');
}

console.log('Verified native CoreLocation When In Use authorization bootstrap in AppDelegate.swift');
