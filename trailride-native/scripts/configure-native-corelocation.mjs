import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const appDir = resolve(root, 'ios', 'App', 'App');
const appDelegate = resolve(appDir, 'AppDelegate.swift');
const projectFile = resolve(root, 'ios', 'App', 'App.xcodeproj', 'project.pbxproj');
const pluginFile = resolve(appDir, 'TrailRideLocationPlugin.swift');
const viewControllerFile = resolve(appDir, 'TrailRideBridgeViewController.swift');

for (const file of [appDelegate, projectFile]) {
  if (!existsSync(file)) throw new Error(`Required iOS file not found at ${file}`);
}

const plugin = `import Foundation
import Capacitor
import CoreLocation

@objc(TrailRideLocationPlugin)
public class TrailRideLocationPlugin: CAPPlugin, CAPBridgedPlugin, CLLocationManagerDelegate {
    public let identifier = "TrailRideLocationPlugin"
    public let jsName = "TrailRideLocation"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestWhenInUse", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getCurrentPosition", returnType: CAPPluginReturnPromise)
    ]

    private let locationManager = CLLocationManager()
    private var pendingPermissionCall: CAPPluginCall?
    private var pendingLocationCall: CAPPluginCall?

    public override func load() {
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyHundredMeters
    }

    private func statusString(_ status: CLAuthorizationStatus) -> String {
        switch status {
        case .notDetermined: return "notDetermined"
        case .restricted: return "restricted"
        case .denied: return "denied"
        case .authorizedAlways: return "authorizedAlways"
        case .authorizedWhenInUse: return "authorizedWhenInUse"
        @unknown default: return "unknown"
        }
    }

    private func statusResult() -> [String: Any] {
        ["status": statusString(locationManager.authorizationStatus),
         "servicesEnabled": CLLocationManager.locationServicesEnabled()]
    }

    @objc func getStatus(_ call: CAPPluginCall) {
        DispatchQueue.main.async { call.resolve(self.statusResult()) }
    }

    @objc func requestWhenInUse(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard CLLocationManager.locationServicesEnabled() else {
                call.resolve(self.statusResult())
                return
            }
            guard self.locationManager.authorizationStatus == .notDetermined else {
                call.resolve(self.statusResult())
                return
            }
            self.pendingPermissionCall = call
            self.bridge?.saveCall(call)
            self.locationManager.requestWhenInUseAuthorization()
        }
    }

    @objc func getCurrentPosition(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard CLLocationManager.locationServicesEnabled() else {
                call.reject("Location services are disabled")
                return
            }
            let status = self.locationManager.authorizationStatus
            guard status == .authorizedWhenInUse || status == .authorizedAlways else {
                call.reject("Location permission is not granted: \\(self.statusString(status))")
                return
            }
            self.pendingLocationCall = call
            self.bridge?.saveCall(call)
            self.locationManager.requestLocation()
        }
    }

    public func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        guard manager.authorizationStatus != .notDetermined,
              let call = pendingPermissionCall else { return }
        call.resolve(statusResult())
        bridge?.releaseCall(call)
        pendingPermissionCall = nil
    }

    public func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let call = pendingLocationCall, let location = locations.last else { return }
        call.resolve([
            "latitude": location.coordinate.latitude,
            "longitude": location.coordinate.longitude,
            "accuracy": location.horizontalAccuracy,
            "timestamp": location.timestamp.timeIntervalSince1970 * 1000
        ])
        bridge?.releaseCall(call)
        pendingLocationCall = nil
    }

    public func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        guard let call = pendingLocationCall else { return }
        call.reject("CoreLocation failed: \\(error.localizedDescription)")
        bridge?.releaseCall(call)
        pendingLocationCall = nil
    }
}
`;

const viewController = `import UIKit
import Capacitor

@objc(TrailRideBridgeViewController)
class TrailRideBridgeViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(TrailRideLocationPlugin())
    }
}
`;

writeFileSync(pluginFile, plugin);
writeFileSync(viewControllerFile, viewController);

let app = readFileSync(appDelegate, 'utf8');
app = app.replace(/\nimport CoreLocation/g, '');
app = app.replace(/\n\s*private let trailRideLocationManager = CLLocationManager\(\)/g, '');
app = app.replace(/\s*\/\/ TRAILRIDE_NATIVE_LOCATION_SETUP[\s\S]*?(?=\s*return true)/g, '\n        ');
app = app.replace(/\s*\/\/ TRAILRIDE_NATIVE_LOCATION_FOREGROUND_REQUEST[\s\S]*?(?=\n\s*})/g, '');

// Do not rely only on storyboard class substitution. Force the running root
// controller to be the subclass that registers TrailRideLocation.
if (!app.includes('TRAILRIDE_FORCE_BRIDGE_CONTROLLER')) {
  const launchSignature = 'func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {';
  const launchIndex = app.indexOf(launchSignature);
  if (launchIndex < 0) throw new Error('Could not locate didFinishLaunchingWithOptions');
  const returnIndex = app.indexOf('return true', launchIndex);
  if (returnIndex < 0) throw new Error('Could not locate return true in launch method');
  const marker = `        // TRAILRIDE_FORCE_BRIDGE_CONTROLLER\n        if !(window?.rootViewController is TrailRideBridgeViewController) {\n            window?.rootViewController = TrailRideBridgeViewController()\n            window?.makeKeyAndVisible()\n        }\n`;
  app = app.slice(0, returnIndex) + marker + app.slice(returnIndex);
}
writeFileSync(appDelegate, app);

let pbx = readFileSync(projectFile, 'utf8');
const pluginRef = 'A1B2C3D4E5F6000000000001';
const pluginBuild = 'A1B2C3D4E5F6000000000002';
const vcRef = 'A1B2C3D4E5F6000000000003';
const vcBuild = 'A1B2C3D4E5F6000000000004';

if (!pbx.includes('TrailRideLocationPlugin.swift in Sources')) {
  pbx = pbx.replace('/* Begin PBXBuildFile section */', `/* Begin PBXBuildFile section */\n\t\t${pluginBuild} /* TrailRideLocationPlugin.swift in Sources */ = {isa = PBXBuildFile; fileRef = ${pluginRef} /* TrailRideLocationPlugin.swift */; };\n\t\t${vcBuild} /* TrailRideBridgeViewController.swift in Sources */ = {isa = PBXBuildFile; fileRef = ${vcRef} /* TrailRideBridgeViewController.swift */; };`);
  pbx = pbx.replace('/* Begin PBXFileReference section */', `/* Begin PBXFileReference section */\n\t\t${pluginRef} /* TrailRideLocationPlugin.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = TrailRideLocationPlugin.swift; sourceTree = "<group>"; };\n\t\t${vcRef} /* TrailRideBridgeViewController.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = TrailRideBridgeViewController.swift; sourceTree = "<group>"; };`);
  const appGroup = pbx.match(/([A-F0-9]{24}) \/\* App \*\/ = \{\n\s*isa = PBXGroup;\n\s*children = \(/);
  if (!appGroup) throw new Error('Could not locate App PBXGroup');
  const childNeedle = `${appGroup[1]} /* App */ = {`;
  const groupStart = pbx.indexOf(childNeedle);
  const childrenStart = pbx.indexOf('children = (', groupStart) + 'children = ('.length;
  pbx = pbx.slice(0, childrenStart) + `\n\t\t\t\t${pluginRef} /* TrailRideLocationPlugin.swift */,\n\t\t\t\t${vcRef} /* TrailRideBridgeViewController.swift */,` + pbx.slice(childrenStart);
  const sources = pbx.match(/([A-F0-9]{24}) \/\* Sources \*\/ = \{\n\s*isa = PBXSourcesBuildPhase;\n\s*buildActionMask = \d+;\n\s*files = \(/);
  if (!sources) throw new Error('Could not locate PBXSourcesBuildPhase');
  const filesStart = sources.index + sources[0].length;
  pbx = pbx.slice(0, filesStart) + `\n\t\t\t\t${pluginBuild} /* TrailRideLocationPlugin.swift in Sources */,\n\t\t\t\t${vcBuild} /* TrailRideBridgeViewController.swift in Sources */,` + pbx.slice(filesStart);
}
writeFileSync(projectFile, pbx);

const storyboardCandidates = [resolve(appDir, 'Base.lproj', 'Main.storyboard'), resolve(appDir, 'Main.storyboard')];
const storyboard = storyboardCandidates.find(existsSync);
if (!storyboard) throw new Error('Main.storyboard not found');
let story = readFileSync(storyboard, 'utf8');
story = story.replace(/customClass="CAPBridgeViewController"(?: customModule="Capacitor")?/, 'customClass="TrailRideBridgeViewController" customModule="App" customModuleProvider="target"');
writeFileSync(storyboard, story);

const verifyPbx = readFileSync(projectFile, 'utf8');
const verifyStory = readFileSync(storyboard, 'utf8');
const verifyApp = readFileSync(appDelegate, 'utf8');
if (!verifyPbx.includes('TrailRideLocationPlugin.swift in Sources') ||
    !verifyPbx.includes('TrailRideBridgeViewController.swift in Sources') ||
    !verifyStory.includes('customClass="TrailRideBridgeViewController"') ||
    !verifyApp.includes('TRAILRIDE_FORCE_BRIDGE_CONTROLLER') ||
    !verifyApp.includes('window?.rootViewController = TrailRideBridgeViewController()') ||
    !plugin.includes('requestWhenInUseAuthorization()') ||
    !plugin.includes('requestLocation()') ||
    !viewController.includes('registerPluginInstance(TrailRideLocationPlugin())')) {
  throw new Error('Dedicated TrailRide CoreLocation plugin configuration failed');
}
console.log('Verified forced TrailRide bridge controller with native permission and GPS plugin.');
