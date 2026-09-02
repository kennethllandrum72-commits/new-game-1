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

// Configure the manager during launch, but do not ask for permission yet.
// iOS can ignore permission prompts requested too early in the app lifecycle.
if (!s.includes('TRAILRIDE_NATIVE_LOCATION_SETUP')) {
  const marker = `        // TRAILRIDE_NATIVE_LOCATION_SETUP\n        trailRideLocationManager.desiredAccuracy = kCLLocationAccuracyHundredMeters\n`;
  const launchSignature = 'func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {';
  const launchIndex = s.indexOf(launchSignature);
  if (launchIndex < 0) throw new Error('Could not find didFinishLaunchingWithOptions in AppDelegate.swift');
  const returnIndex = s.indexOf('return true', launchIndex);
  if (returnIndex < 0) throw new Error('Could not find return true in didFinishLaunchingWithOptions');
  s = s.slice(0, returnIndex) + marker + s.slice(returnIndex);
}

// Request When-In-Use only after the app is fully foreground/active.
// This is the lifecycle point where iOS is allowed to present the permission sheet.
if (!s.includes('TRAILRIDE_NATIVE_LOCATION_FOREGROUND_REQUEST')) {
  const method = `\n    func applicationDidBecomeActive(_ application: UIApplication) {\n        // TRAILRIDE_NATIVE_LOCATION_FOREGROUND_REQUEST\n        guard CLLocationManager.locationServicesEnabled() else { return }\n        if trailRideLocationManager.authorizationStatus == .notDetermined {\n            trailRideLocationManager.requestWhenInUseAuthorization()\n        }\n    }\n`;
  const insertAt = s.lastIndexOf('\n}');
  if (insertAt < 0) throw new Error('Could not find AppDelegate class closing brace');
  s = s.slice(0, insertAt) + method + s.slice(insertAt);
}

writeFileSync(appDelegate, s);

const verify = readFileSync(appDelegate, 'utf8');
if (!verify.includes('import CoreLocation') ||
    !verify.includes('applicationDidBecomeActive') ||
    !verify.includes('requestWhenInUseAuthorization()') ||
    !verify.includes('trailRideLocationManager')) {
  throw new Error('Native CoreLocation foreground authorization request was not installed correctly');
}

console.log('Verified native CoreLocation When-In-Use request after app becomes active.');
