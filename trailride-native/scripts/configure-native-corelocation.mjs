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

// Configure CoreLocation and listen for the app becoming active. On modern
// scene-based iOS apps, relying only on UIApplicationDelegate's
// applicationDidBecomeActive callback can be unreliable, so use the system
// didBecomeActive notification as the permission trigger.
if (!s.includes('TRAILRIDE_NATIVE_LOCATION_SETUP')) {
  const marker = `        // TRAILRIDE_NATIVE_LOCATION_SETUP\n        trailRideLocationManager.desiredAccuracy = kCLLocationAccuracyHundredMeters\n        NotificationCenter.default.addObserver(\n            forName: UIApplication.didBecomeActiveNotification,\n            object: nil,\n            queue: .main\n        ) { [weak self] _ in\n            guard let self = self else { return }\n            guard CLLocationManager.locationServicesEnabled() else { return }\n            if self.trailRideLocationManager.authorizationStatus == .notDetermined {\n                self.trailRideLocationManager.requestWhenInUseAuthorization()\n            }\n        }\n`;
  const launchSignature = 'func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {';
  const launchIndex = s.indexOf(launchSignature);
  if (launchIndex < 0) throw new Error('Could not find didFinishLaunchingWithOptions in AppDelegate.swift');
  const returnIndex = s.indexOf('return true', launchIndex);
  if (returnIndex < 0) throw new Error('Could not find return true in didFinishLaunchingWithOptions');
  s = s.slice(0, returnIndex) + marker + s.slice(returnIndex);
}

// Remove the older applicationDidBecomeActive injection if this script is run
// against a generated project that already contains it. The notification-based
// path above is now the single source of the authorization request.
const oldMarker = `\n        // TRAILRIDE_NATIVE_LOCATION_FOREGROUND_REQUEST\n        if CLLocationManager.locationServicesEnabled() && trailRideLocationManager.authorizationStatus == .notDetermined {\n            trailRideLocationManager.requestWhenInUseAuthorization()\n        }`;
s = s.replace(oldMarker, '');

writeFileSync(appDelegate, s);

const verify = readFileSync(appDelegate, 'utf8');
const requestCount = (verify.match(/requestWhenInUseAuthorization\(\)/g) || []).length;
if (!verify.includes('import CoreLocation') ||
    !verify.includes('UIApplication.didBecomeActiveNotification') ||
    !verify.includes('trailRideLocationManager') ||
    requestCount !== 1) {
  throw new Error(`Native CoreLocation notification authorization injection failed; request count=${requestCount}`);
}

console.log('Verified CoreLocation When-In-Use request from UIApplication.didBecomeActiveNotification.');
