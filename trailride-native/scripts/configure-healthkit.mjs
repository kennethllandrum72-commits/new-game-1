import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..'),appDir=resolve(root,'ios','App','App');
const info=resolve(appDir,'Info.plist'),pbxFile=resolve(root,'ios','App','App.xcodeproj','project.pbxproj'),pluginFile=resolve(appDir,'TrailRideHealthPlugin.swift'),vcFile=resolve(appDir,'TrailRideBridgeViewController.swift'),entFile=resolve(appDir,'App.entitlements');
for(const f of [info,pbxFile,vcFile])if(!existsSync(f))throw new Error(`Required iOS file missing: ${f}`);
const plugin=`import Foundation
import Capacitor
import HealthKit
import CoreLocation

@objc(TrailRideHealthPlugin)
public class TrailRideHealthPlugin: CAPPlugin, CAPBridgedPlugin {
 public let identifier="TrailRideHealthPlugin"
 public let jsName="TrailRideHealth"
 public let pluginMethods:[CAPPluginMethod]=[
  CAPPluginMethod(name:"isAvailable",returnType:CAPPluginReturnPromise),
  CAPPluginMethod(name:"requestAuthorization",returnType:CAPPluginReturnPromise),
  CAPPluginMethod(name:"saveRide",returnType:CAPPluginReturnPromise)
 ]
 private let store=HKHealthStore()

 @objc func isAvailable(_ call:CAPPluginCall){
  call.resolve(["available":HKHealthStore.isHealthDataAvailable()])
 }

 private func shareTypes()->Set<HKSampleType>{
  var result:Set<HKSampleType>=[HKObjectType.workoutType(),HKSeriesType.workoutRoute()]
  if let distance=HKObjectType.quantityType(forIdentifier:.distanceCycling){result.insert(distance)}
  return result
 }

 private func readTypes()->Set<HKObjectType>{
  var result:Set<HKObjectType>=[HKObjectType.workoutType(),HKSeriesType.workoutRoute()]
  if let distance=HKObjectType.quantityType(forIdentifier:.distanceCycling){result.insert(distance)}
  return result
 }

 @objc func requestAuthorization(_ call:CAPPluginCall){
  guard HKHealthStore.isHealthDataAvailable() else{call.reject("Apple Health is unavailable");return}
  store.requestAuthorization(toShare:shareTypes(),read:readTypes()){ok,error in
   if let error=error{call.reject(error.localizedDescription);return}
   call.resolve(["authorized":ok])
  }
 }

 @objc func saveRide(_ call:CAPPluginCall){
  guard HKHealthStore.isHealthDataAvailable() else{call.reject("Apple Health is unavailable");return}
  let startedMs=call.getDouble("started") ?? Date().timeIntervalSince1970*1000
  let endedMs=call.getDouble("ended") ?? Date().timeIntervalSince1970*1000
  let miles=call.getDouble("distance") ?? 0
  let started=Date(timeIntervalSince1970:startedMs/1000)
  let ended=Date(timeIntervalSince1970:endedMs/1000)
  let meters=miles*1609.344
  let activity=(call.getString("activity") ?? "cycling").lowercased()
  let type:HKWorkoutActivityType
  if activity.contains("walk"){type = .walking}
  else if activity.contains("run") || activity.contains("jog"){type = .running}
  else if activity.contains("hik"){type = .hiking}
  else{type = .cycling}
  let workout=HKWorkout(activityType:type,start:started,end:ended,duration:max(0,ended.timeIntervalSince(started)),totalEnergyBurned:nil,totalDistance:HKQuantity(unit:.meter(),doubleValue:meters),metadata:[HKMetadataKeyIndoorWorkout:false,"TrailRideName":call.getString("trailName") ?? "TrailRide"])
  store.save(workout){ok,error in
   if !ok{call.reject(error?.localizedDescription ?? "Could not save workout");return}
   guard let arr=call.getArray("points"),!arr.isEmpty else{call.resolve(["saved":true,"routeSaved":false]);return}
   let locs:[CLLocation]=arr.compactMap{item in
    guard let p=item as? JSObject,
          let lat=p["lat"] as? Double,
          let lon=p["lon"] as? Double else{return nil}
    let alt=(p["alt"] as? Double) ?? 0
    let acc=(p["acc"] as? Double) ?? 10
    let altAcc=(p["altAcc"] as? Double) ?? 20
    let t=((p["t"] as? Double) ?? startedMs)/1000
    return CLLocation(coordinate:CLLocationCoordinate2D(latitude:lat,longitude:lon),altitude:alt,horizontalAccuracy:acc,verticalAccuracy:altAcc,timestamp:Date(timeIntervalSince1970:t))
   }
   guard !locs.isEmpty else{call.resolve(["saved":true,"routeSaved":false]);return}
   let builder=HKWorkoutRouteBuilder(healthStore:self.store,device:.local())
   builder.insertRouteData(locs){ok,error in
    if !ok{call.resolve(["saved":true,"routeSaved":false,"routeError":error?.localizedDescription ?? "Route failed"]);return}
    builder.finishRoute(with:workout,metadata:nil){route,error in
     var result:JSObject=["saved":true,"routeSaved":route != nil]
     if let message=error?.localizedDescription{result["routeError"]=message}
     call.resolve(result)
    }
   }
  }
 }
}
`;
writeFileSync(pluginFile,plugin);
const ent=`<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict><key>com.apple.developer.healthkit</key><true/></dict></plist>\n`;writeFileSync(entFile,ent);
// Capacitor may regenerate Info.plist during sync. Insert each HealthKit key independently
// as top-level entries in the root dictionary.
let plist=readFileSync(info,'utf8');
const closeIndex=plist.lastIndexOf('</dict>');
if(closeIndex<0)throw new Error('Root Info.plist dictionary closing tag not found');
let healthEntries='';
if(!plist.includes('<key>NSHealthShareUsageDescription</key>'))healthEntries+='\t<key>NSHealthShareUsageDescription</key>\n\t<string>TrailRide uses Apple Health workout data to sync your recorded rides.</string>\n';
if(!plist.includes('<key>NSHealthUpdateUsageDescription</key>'))healthEntries+='\t<key>NSHealthUpdateUsageDescription</key>\n\t<string>TrailRide saves your completed rides, distance, duration, and route to Apple Health when you choose to sync them.</string>\n';
if(healthEntries)plist=plist.slice(0,closeIndex)+healthEntries+plist.slice(closeIndex);
writeFileSync(info,plist);
let vc=readFileSync(vcFile,'utf8');if(!vc.includes('TrailRideHealthPlugin()'))vc=vc.replace('bridge?.registerPluginInstance(TrailRideLocationPlugin())','bridge?.registerPluginInstance(TrailRideLocationPlugin())\n        bridge?.registerPluginInstance(TrailRideHealthPlugin())');writeFileSync(vcFile,vc);
let pbx=readFileSync(pbxFile,'utf8');const ref='B1B2C3D4E5F6000000000001',build='B1B2C3D4E5F6000000000002',entRef='B1B2C3D4E5F6000000000003';if(!pbx.includes('TrailRideHealthPlugin.swift in Sources')){pbx=pbx.replace('/* Begin PBXBuildFile section */',`/* Begin PBXBuildFile section */\n\t\t${build} /* TrailRideHealthPlugin.swift in Sources */ = {isa = PBXBuildFile; fileRef = ${ref} /* TrailRideHealthPlugin.swift */; };`);pbx=pbx.replace('/* Begin PBXFileReference section */',`/* Begin PBXFileReference section */\n\t\t${ref} /* TrailRideHealthPlugin.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = TrailRideHealthPlugin.swift; sourceTree = "<group>"; };\n\t\t${entRef} /* App.entitlements */ = {isa = PBXFileReference; lastKnownFileType = text.plist.entitlements; path = App.entitlements; sourceTree = "<group>"; };`);const g=pbx.match(/([A-F0-9]{24}) \/\* App \*\/ = \{\n\s*isa = PBXGroup;\n\s*children = \(/);if(!g)throw new Error('App group missing');let pos=pbx.indexOf('children = (',pbx.indexOf(`${g[1]} /* App */ = {`))+'children = ('.length;pbx=pbx.slice(0,pos)+`\n\t\t\t\t${ref} /* TrailRideHealthPlugin.swift */,\n\t\t\t\t${entRef} /* App.entitlements */,`+pbx.slice(pos);const s=pbx.match(/([A-F0-9]{24}) \/\* Sources \*\/ = \{\n\s*isa = PBXSourcesBuildPhase;\n\s*buildActionMask = \d+;\n\s*files = \(/);if(!s)throw new Error('Sources phase missing');pos=s.index+s[0].length;pbx=pbx.slice(0,pos)+`\n\t\t\t\t${build} /* TrailRideHealthPlugin.swift in Sources */,`+pbx.slice(pos)}if(!pbx.includes('CODE_SIGN_ENTITLEMENTS = App/App.entitlements;'))pbx=pbx.replace(/(PRODUCT_BUNDLE_IDENTIFIER = com\.trailride\.nearme;)/g,'CODE_SIGN_ENTITLEMENTS = App/App.entitlements;\n\t\t\t\t$1');writeFileSync(pbxFile,pbx);
console.log('Configured TrailRide HealthKit capability, permissions and native bridge with valid authorization sets.');
