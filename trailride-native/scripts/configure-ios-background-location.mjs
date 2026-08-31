import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root=resolve(import.meta.dirname,'..');
const plist=resolve(root,'ios','App','App','Info.plist');
if(!existsSync(plist)){
  console.log('Info.plist not found yet; run after cap add/sync.');
  process.exit(0);
}
let s=readFileSync(plist,'utf8');
const entries=`\n\t<key>NSLocationWhenInUseUsageDescription</key>\n\t<string>TrailRide uses your location to show nearby trails and record your activity.</string>\n\t<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>\n\t<string>TrailRide uses your location while the app is in the background or your iPhone is locked so your ride, walk, run, or hike can continue recording.</string>\n\t<key>UIBackgroundModes</key>\n\t<array>\n\t\t<string>location</string>\n\t</array>`;
if(!s.includes('NSLocationAlwaysAndWhenInUseUsageDescription')) s=s.replace(/<\/dict>/,entries+'\n</dict>');
writeFileSync(plist,s);
console.log('Configured iOS background location permissions.');
