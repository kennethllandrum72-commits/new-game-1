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

// Configure the manager during launch. Do not request permission here because
// the app may not yet be active enough for iOS to present an authorization UI.
if (!s.includes('TRAILRIDE_NATIVE_LOCATION_SETUP')) {
  const marker = `        // TRAILRIDE_NATIVE_LOCATION_SETUP\n        trailRideLocationManager.desiredAccuracy = kCLLocationAccuracyHundredMeters\n`;
  const launchSignature = 'func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {';
  const launchIndex = s.indexOf(launchSignature);
  if (launchIndex < 0) throw new Error('Could not find didFinishLaunchingWithOptions in AppDelegate.swift');
  const returnIndex = s.indexOf('return true', launchIndex);
  if (returnIndex < 0) throw new Error('Could not find return true in didFinishLaunchingWithOptions');
  s = s.slice(0, returnIndex) + marker + s.slice(returnIndex);
}

// Capacitor's generated AppDelegate already defines applicationDidBecomeActive.
// Inject our authorization request into that existing method instead of adding
// a second method with the same signature (which Swift rejects as a redeclaration).
if (!s.includes('TRAILRIDE_NATIVE_LOCATION_FOREGROUND_REQUEST')) {
  const activeSignature = 'func applicationDidBecomeActive(_ application: UIApplication) {';
  const activeIndex = s.indexOf(activeSignature);
  if (activeIndex < 0) throw new Error('Could not find existing applicationDidBecomeActive in AppDelegate.swift');
  const bodyStart = activeIndex + activeSignature.length;
  const marker = `\n        // TRAILRIDE_NATIVE_LOCATION_FOREGROUND_REQUEST\n        if CLLocationManager.locationServicesEnabled() && trailRideLocationManager.authorizationStatus == .notDetermined {\n            trailRideLocationManager.requestWhenInUseAuthorization()\n        }`;
  s = s.slice(0, bodyStart) + marker + s.slice(bodyStart);
}

writeFileSync(appDelegate, s);

const verify = readFileSync(appDelegate, 'utf8');
const activeCount = (verify.match(/func applicationDidBecomeActive\(_ application: UIApplication\)/g) || []).length;
if (!verify.includes('import CoreLocation') ||
    !verify.includes('TRAILRIDE_NATIVE_LOCATION_FOREGROUND_REQUEST') ||
    !verify.includes('requestWhenInUseAuthorization()') ||
    !verify.includes('trailRideLocationManager') ||
    activeCount !== 1) {
  throw new Error(`Native CoreLocation active authorization injection failed; applicationDidBecomeActive count=${activeCount}`);
}

console.log('Verified CoreLocation request inside the existing applicationDidBecomeActive method.');
