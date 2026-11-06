(()=>{
 const extra=[
  {name:'Dauset Trails Nature Center',city:'Jackson',state:'Georgia',mi:30,d:['beginner','intermediate','advanced'],type:'Mountain bike / hiking trail network',lat:33.233878,lon:-83.944392,status:'https://dausettrails.com/'},
  {name:'Atlanta BeltLine',city:'Atlanta',state:'Georgia',mi:16.7,d:['beginner'],type:'Paved multi-use / greenway',lat:33.7554,lon:-84.3697,status:'https://beltline.org/'},
  {name:'Big Creek Greenway',city:'Roswell • Alpharetta • Forsyth County',state:'Georgia',mi:20,d:['beginner'],type:'Paved multi-use / greenway',lat:34.0738,lon:-84.2941,status:'https://www.google.com/search?q=Big+Creek+Greenway+Georgia'},
  {name:'Arabia Mountain PATH',city:'Lithonia',state:'Georgia',mi:30,d:['beginner','intermediate'],type:'Paved multi-use / greenway',lat:33.6676,lon:-84.1148,status:'https://www.google.com/search?q=Arabia+Mountain+PATH+trail'},
  {name:'South Peachtree Creek Trail',city:'Atlanta • Decatur',state:'Georgia',mi:3.6,d:['beginner'],type:'Paved multi-use / greenway',lat:33.8019,lon:-84.3236,status:'https://www.google.com/search?q=South+Peachtree+Creek+Trail'},
  {name:'Peachtree Creek Greenway',city:'Brookhaven',state:'Georgia',mi:3,d:['beginner'],type:'Paved multi-use / greenway',lat:33.8605,lon:-84.3350,status:'https://www.google.com/search?q=Peachtree+Creek+Greenway'},
  {name:'Noonday Creek Trail',city:'Kennesaw • Woodstock',state:'Georgia',mi:8,d:['beginner'],type:'Paved multi-use / greenway',lat:34.0245,lon:-84.5968,status:'https://www.google.com/search?q=Noonday+Creek+Trail'},
  {name:'Chief Ladiga Trail',city:'Anniston • Piedmont',state:'Alabama',mi:33,d:['beginner'],type:'Paved multi-use / rail trail',lat:33.6598,lon:-85.8316,status:'https://www.google.com/search?q=Chief+Ladiga+Trail'},
  {name:'Tanglefoot Trail',city:'New Albany • Houston',state:'Mississippi',mi:43.6,d:['beginner'],type:'Paved multi-use / rail trail',lat:34.4943,lon:-89.0078,status:'https://www.google.com/search?q=Tanglefoot+Trail'},
  {name:'Shelby Bottoms Greenway',city:'Nashville',state:'Tennessee',mi:9,d:['beginner'],type:'Paved / natural-surface greenway',lat:36.1845,lon:-86.7254,status:'https://www.google.com/search?q=Shelby+Bottoms+Greenway+Nashville'},
  {name:'Stones River Greenway',city:'Nashville',state:'Tennessee',mi:10,d:['beginner'],type:'Paved multi-use / greenway',lat:36.1646,lon:-86.6658,status:'https://www.google.com/search?q=Stones+River+Greenway+Nashville'},
  {name:'Richland Creek Greenway',city:'Nashville',state:'Tennessee',mi:3,d:['beginner'],type:'Paved multi-use / greenway',lat:36.1458,lon:-86.8588,status:'https://www.google.com/search?q=Richland+Creek+Greenway+Nashville'},
  {name:'Knoxville Urban Wilderness',city:'Knoxville',state:'Tennessee',mi:50,d:['beginner','intermediate','advanced'],type:'Mountain bike / trail network',lat:35.9339,lon:-83.8908,status:'https://www.google.com/search?q=Knoxville+Urban+Wilderness+mountain+bike'},
  {name:'Baker Creek Preserve',city:'Knoxville',state:'Tennessee',mi:7,d:['beginner','intermediate','advanced'],type:'Mountain bike',lat:35.9348,lon:-83.9012,status:'https://www.google.com/search?q=Baker+Creek+Preserve+Knoxville'},
  {name:'Stringers Ridge',city:'Chattanooga',state:'Tennessee',mi:10,d:['beginner','intermediate'],type:'Mountain bike / multi-use',lat:35.0716,lon:-85.3247,status:'https://www.google.com/search?q=Stringers+Ridge+Chattanooga+mountain+bike'},
  {name:'Enterprise South Nature Park',city:'Chattanooga',state:'Tennessee',mi:15,d:['beginner','intermediate'],type:'Mountain bike / multi-use',lat:35.0878,lon:-85.1767,status:'https://www.google.com/search?q=Enterprise+South+Nature+Park+mountain+bike'},
  {name:'Wolf River Greenway',city:'Memphis',state:'Tennessee',mi:26,d:['beginner'],type:'Paved multi-use / greenway',lat:35.1259,lon:-89.8418,status:'https://www.google.com/search?q=Wolf+River+Greenway+Memphis'}
 ];
 window.TrailRideVerifiedTrails=extra;
 const key=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 function selectedState(){return document.getElementById('stateSelect')?.value||''}
 function merge(){if(!Array.isArray(window.trails)&&typeof trails==='undefined')return;let arr=typeof trails!=='undefined'?trails:window.trails,st=selectedState(),seen=new Set(arr.map(t=>key(t.name)));for(const t of extra){if(st!=='near'&&st&&t.state!==st)continue;if(!seen.has(key(t.name))){arr.push({...t,source:'TrailRide verified'});seen.add(key(t.name))}}try{populateTrails?.()}catch{}}
 function additions(scope){return `way(${scope})[highway=path][bicycle=designated][name];way(${scope})[highway=path][bicycle=yes][name];way(${scope})[highway=footway][bicycle=designated][name];way(${scope})[highway=footway][bicycle=yes][name];way(${scope})[highway=track][bicycle=designated][name];way(${scope})[highway=track][bicycle=yes][name];way(${scope})[cycleway][name];way(${scope})[mtb:scale][name];relation(${scope})[route=bicycle][name];relation(${scope})[route=mtb][name];`;}
 function broadenOverpass(){let old=window.fetch;if(old.__trailrideBroadened)return;async function wrapped(input,init={}){let url=String(input?.url||input||''),body=String(init?.body||'');if(url.includes('overpass-api.de/api/interpreter')&&body){body=body.replace(/way\(around:([^)]*)\)\[highway=cycleway\]\[name\];/g,(m,s)=>m+additions(`around:${s}`)).replace(/way\(area\.a\)\[highway=cycleway\]\[name\];/g,m=>m+additions('area.a')).replace('out center tags 250;','out center tags 1000;');init={...init,body}}return old(input,init)}wrapped.__trailrideBroadened=true;window.fetch=wrapped}

 async function geocodeDestination(term){
  const state=selectedState(),suffix=state&&state!=='near'?', '+state+', USA':', USA';
  try{const r=await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&q='+encodeURIComponent(term+suffix));if(!r.ok)return null;const j=await r.json();return j[0]||null}catch{return null}
 }
 function osmTrail(e,state){
  const tags=e.tags||{},lat=e.lat||e.center?.lat,lon=e.lon||e.center?.lon,name=tags.name||tags['mtb:name'];
  if(!lat||!lon||!name)return null;
  const km=parseFloat(tags.distance),city=tags['addr:city']||tags.city||tags.locality||tags['is_in:city']||'';
  let type=tags.route==='mtb'||tags['mtb:scale']!=null||tags.sport==='mountain_biking'?'Mountain bike':tags.highway==='cycleway'||tags.route==='bicycle'?'Bike / multi-use':'Bike trail';
  return{name,city,state:state&&state!=='near'?state:'Nearby',mi:Number.isFinite(km)?+(km*.621371).toFixed(1):null,d:typeof diff==='function'?diff(tags):['intermediate'],type,lat:+lat,lon:+lon,status:tags.website||tags.url||'https://www.google.com/search?q='+encodeURIComponent(name+' trail status'),source:'OpenStreetMap'};
 }
 async function liveTrailsAround(lat,lon){
  const rv=document.getElementById('radius')?.value,radius=rv==='all'?120000:Math.max(30000,Math.min(160000,(+rv||75)*1609.34));
  const scope='around:'+Math.round(radius)+','+lat+','+lon;
  const q='[out:json][timeout:40];('+[
   'relation('+scope+')[route~"^(mtb|bicycle)$"][name];',
   'way('+scope+')[highway~"^(path|track|cycleway|footway|bridleway)$"][bicycle~"^(yes|designated|permissive)$"][name];',
   'way('+scope+')[mtb:scale][name];',
   'node('+scope+')[sport=mountain_biking][name];',
   'way('+scope+')[sport=mountain_biking][name];',
   'relation('+scope+')[sport=mountain_biking][name];'
  ].join('')+');out center tags 1500;';
  try{const r=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',body:q});if(!r.ok)return[];const j=await r.json();return(j.elements||[]).map(e=>osmTrail(e,selectedState())).filter(Boolean)}catch{return[]}
 }
 function uniqueTrails(items){const seen=new Set();return items.filter(t=>{const k=key(t.name);if(!k||seen.has(k)||!Number.isFinite(+t.lat)||!Number.isFinite(+t.lon))return false;seen.add(k);return true})}
 async function runLiveSearch(){
  const input=document.getElementById('trailSearch'),term=input?.value.trim();
  if(!term){searchText='';render();return}
  const message=document.getElementById('locationText');if(message)message.textContent='Searching live trail maps near “'+term+'”…';
  const anchor=await geocodeDestination(term);
  if(!anchor){searchText=term;render();if(message)message.textContent='No mapped location found for “'+term+'”. Showing loaded name matches.';return}
  const stateBefore=selectedState(),first=String(anchor.display_name||term).split(',')[0].trim();
  loc={lat:+anchor.lat,lon:+anchor.lon};mode='near';searchText='';trailData.clear();
  await loadArea();
  const live=await liveTrailsAround(loc.lat,loc.lon),verified=extra.filter(t=>stateBefore==='near'||!stateBefore||t.state===stateBefore);
  const anchorLooksLikeTrail=/trail|greenway|park|preserve|path|nature center|bike/i.test(term+' '+first);
  const anchorTrail=anchorLooksLikeTrail?[{name:first,city:anchor.address?.city||anchor.address?.town||anchor.address?.county||'',state:stateBefore==='near'?'Nearby':stateBefore,mi:null,d:['beginner','intermediate'],type:'Mapped trail location',lat:loc.lat,lon:loc.lon,status:'https://www.google.com/search?q='+encodeURIComponent(first+' trail status'),source:'OpenStreetMap search'}]:[];
  trails=uniqueTrails([...anchorTrail,...verified,...live,...trails]);
  populateTrails();render();
  if(message)message.textContent='Live trail results near '+first+'.';
 }
 function installLiveSearch(){
  const btn=document.getElementById('searchBtn'),input=document.getElementById('trailSearch');if(!btn||!input||btn.dataset.liveTrailSearch)return;
  btn.dataset.liveTrailSearch='1';btn.onclick=runLiveSearch;input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();runLiveSearch()}};
 }
 function labelSources(){let box=document.querySelector('.sectionHead .eyebrow');if(box&&/nearby trails|multi-source trail discovery/i.test(box.textContent))box.textContent='MULTI-SOURCE TRAIL DISCOVERY'}
 broadenOverpass();document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>{merge();labelSources()}):setTimeout(()=>{merge();labelSources()},0);window.addEventListener('trailride:activitychange',merge);setInterval(merge,3000);
})();
