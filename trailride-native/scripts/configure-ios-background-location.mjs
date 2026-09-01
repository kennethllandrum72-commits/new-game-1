import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root=resolve(import.meta.dirname,'..');
const plist=resolve(root,'ios','App','App','Info.plist');
if(!existsSync(plist)){
  console.log('Info.plist not found yet; run after cap add/sync.');
  process.exit(0);
}

let s=readFileSync(plist,'utf8');

// Near Me only needs foreground When-In-Use authorization. Remove background
// and Always declarations while we establish the normal iOS permission flow.
s=s.replace(/\s*<key>NSLocationAlwaysAndWhenInUseUsageDescription<\/key>\s*<string>[\s\S]*?<\/string>/g,'');
s=s.replace(/\s*<key>NSLocationAlwaysUsageDescription<\/key>\s*<string>[\s\S]*?<\/string>/g,'');
s=s.replace(/\s*<key>UIBackgroundModes<\/key>\s*<array>\s*<string>location<\/string>\s*<\/array>/g,'');

function setString(key,value){
  const re=new RegExp(`<key>${key}<\\/key>\\s*<string>[\\s\\S]*?<\\/string>`);
  const xml=`<key>${key}</key>\n\t<string>${value}</string>`;
  if(re.test(s)) s=s.replace(re,xml);
  else s=s.replace(/<\/dict>/,`\t${xml}\n</dict>`);
}

setString('NSLocationWhenInUseUsageDescription','TrailRide uses your location when you tap Near Me to find trails and cycling routes near you.');
writeFileSync(plist,s);

const verify=readFileSync(plist,'utf8');
if(!verify.includes('<key>NSLocationWhenInUseUsageDescription</key>')) throw new Error('NSLocationWhenInUseUsageDescription was not added');
if(verify.includes('NSLocationAlwaysAndWhenInUseUsageDescription') || verify.includes('<string>location</string>')) throw new Error('Background/Always location declarations are still present');
console.log('Verified foreground-only iOS Location When In Use permission in Info.plist.');
