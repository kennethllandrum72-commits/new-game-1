import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root=resolve(import.meta.dirname,'..');
const plist=resolve(root,'ios','App','App','Info.plist');
if(!existsSync(plist)){
  console.log('Info.plist not found yet; run after cap add/sync.');
  process.exit(0);
}

let s=readFileSync(plist,'utf8');

function addPlistEntry(key, xml){
  if(!s.includes(`<key>${key}</key>`)){
    s=s.replace(/<\/dict>/,`${xml}\n</dict>`);
  }
}

// Required by @capacitor/geolocation on iOS. This is the permission Near Me
// requests when the user taps the button.
addPlistEntry(
  'NSLocationWhenInUseUsageDescription',
  '\n\t<key>NSLocationWhenInUseUsageDescription</key>\n\t<string>TrailRide uses your location when you tap Near Me to find trails and cycling routes near you.</string>'
);

// Keep the existing background-location declarations for activity recording.
addPlistEntry(
  'NSLocationAlwaysAndWhenInUseUsageDescription',
  '\n\t<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>\n\t<string>TrailRide uses your location while the app is in the background or your iPhone is locked so your ride, walk, run, or hike can continue recording.</string>'
);
addPlistEntry(
  'UIBackgroundModes',
  '\n\t<key>UIBackgroundModes</key>\n\t<array>\n\t\t<string>location</string>\n\t</array>'
);

writeFileSync(plist,s);

// Fail the cloud build instead of silently shipping an IPA without the key.
const verify=readFileSync(plist,'utf8');
if(!verify.includes('<key>NSLocationWhenInUseUsageDescription</key>')){
  throw new Error('NSLocationWhenInUseUsageDescription was not added to Info.plist');
}
console.log('Verified iOS Location When In Use permission in Info.plist.');
