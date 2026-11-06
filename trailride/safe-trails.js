(()=>{
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const hikingOnly=[{name:'Pine Mountain Trail',city:'Pine Mountain',state:'Georgia',mi:23,d:['intermediate'],type:'Hiking only / footpath',lat:32.837,lon:-84.815,status:'https://www.google.com/search?q=Pine+Mountain+Trail+Georgia+status'}];
 const planningTrails=[
  {name:'Gayle’s Trails',city:'Panama City Beach',state:'Florida',mi:12,d:['beginner'],type:'Paved multi-use / walking / cycling',lat:30.2698,lon:-85.9949,status:'https://www.google.com/search?q=Gayles+Trails+Panama+City+Beach'},
  {name:'Panama City Beach Conservation Park',city:'Panama City Beach',state:'Florida',mi:24,d:['beginner','intermediate'],type:'Multi-use / hiking / cycling',lat:30.2829,lon:-85.9784,status:'https://www.google.com/search?q=Panama+City+Beach+Conservation+Park+trails'},
  {name:'Timpoochee Trail',city:'South Walton',state:'Florida',mi:19,d:['beginner'],type:'Paved multi-use / walking / cycling',lat:30.3489,lon:-86.2294,status:'https://www.google.com/search?q=Timpoochee+Trail+Florida'},
  {name:'Tallahassee-St. Marks Historic Railroad State Trail',city:'Tallahassee / St. Marks',state:'Florida',mi:20.5,d:['beginner'],type:'Paved rail trail / multi-use',lat:30.3856,lon:-84.2807,status:'https://www.google.com/search?q=Tallahassee+St+Marks+Historic+Railroad+State+Trail'},
  {name:'Jacksonville-Baldwin Rail Trail',city:'Jacksonville / Baldwin',state:'Florida',mi:14.5,d:['beginner'],type:'Paved rail trail / multi-use',lat:30.3496,lon:-81.8338,status:'https://www.google.com/search?q=Jacksonville+Baldwin+Rail+Trail'},
  {name:'Santos Trail System',city:'Ocala',state:'Florida',mi:80,d:['beginner','intermediate','advanced'],type:'Mountain bike / multi-use trail system',lat:29.1059,lon:-82.0872,status:'https://www.google.com/search?q=Santos+Trail+System+Ocala+Florida'},
  {name:'Withlacoochee State Trail',city:'Citrus Springs / Trilby',state:'Florida',mi:46,d:['beginner'],type:'Paved rail trail / multi-use',lat:28.9978,lon:-82.4529,status:'https://www.google.com/search?q=Withlacoochee+State+Trail+Florida'},
  {name:'Florida Keys Overseas Heritage Trail',city:'Florida Keys',state:'Florida',mi:90,d:['beginner'],type:'Paved multi-use / cycling / walking',lat:24.7267,lon:-81.0479,status:'https://www.google.com/search?q=Florida+Keys+Overseas+Heritage+Trail'}
 ];
 function activity(){return window.TrailRideActivity?.current?.()||localStorage.getItem('trailride-activity')||'cycling'}
 function stateSeeds(state){return planningTrails.filter(t=>t.state===state)}
 function verifiedTrails(){return Array.isArray(window.TrailRideVerifiedTrails)?window.TrailRideVerifiedTrails:[]}
 function baseTrails(){
  const state=document.getElementById('stateSelect')?.value||'Georgia',a=activity(),verified=verifiedTrails();
  let base=mode==='near'?[...curated,...planningTrails,...verified]:[...curated.filter(t=>t.state===state),...stateSeeds(state),...verified.filter(t=>t.state===state)];
  if(a==='hiking')base=[...base,...hikingOnly.filter(t=>mode==='near'||t.state===state)];
  const seen=new Set();return base.filter(t=>{let k=String(t.name||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();if(!k||seen.has(k))return false;seen.add(k);return true});
 }
 function showBase(){trails=baseTrails();populateTrails();render();window.TrailRideActivity?.apply?.()}
 function queryParts(a,scope){
  const around=scope?`(around:${scope.radius},${loc.lat},${loc.lon})`:'(area.a)';
  if(a==='hiking')return `relation${around}[route=hiking][name];relation${around}[route=foot][name];way${around}[highway=path][name];way${around}[highway=footway][name];way${around}[highway=track][name];`;
  if(a==='walking'||a==='jogging'||a==='running')return `relation${around}[route=foot][name];relation${around}[route=hiking][name];way${around}[highway=footway][name];way${around}[highway=pedestrian][name];way${around}[highway=path][name];way${around}[highway=cycleway][name];`;
  if(!scope)return `relation${around}[route=mtb][name];node${around}[sport=mountain_biking][name];way${around}[sport=mountain_biking][name];relation${around}[sport=mountain_biking][name];relation${around}[route=bicycle][name];way${around}[highway=cycleway][name];way${around}[mtb:scale][name];`;
  return `relation${around}[route~="^(mtb|bicycle)$"][name];node${around}[sport=mountain_biking][name];way${around}[sport=mountain_biking][name];relation${around}[sport=mountain_biking][name];way${around}[highway~="^(path|track|cycleway|footway|bridleway)$"][name][bicycle~="^(yes|designated|permissive)$"];way${around}[highway~="^(path|track|cycleway|bridleway)$"][name][mtb:scale];way${around}[highway=cycleway][name];`;
 }
 function radiusMeters(){let rv=document.getElementById('radius')?.value||'120';if(rv==='all')return 320000;const milesByMinutes={15:15,30:30,60:60,120:120};return Math.round((milesByMinutes[rv]||120)*1609.34)}
 let searchAnchor=null;
 const OVERPASS_ENDPOINTS=['https://overpass.private.coffee/api/interpreter','https://overpass-api.de/api/interpreter'];
 async function geocodePlace(text){
  const state=document.getElementById('stateSelect')?.value,tail=state&&state!=='near'?`, ${state}, USA`:', USA';
  try{let u=`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(text+tail)}`,r=await fetch(u,{headers:{'Accept':'application/json'}}),j=await r.json();if(j[0])return{lat:+j[0].lat,lon:+j[0].lon,label:j[0].display_name}}catch{}return null
 }
 async function searchPlace(text){
  const msg=document.getElementById('locationText');if(msg)msg.textContent=`Finding ${text}…`;
  const place=await geocodePlace(text);if(!place){if(msg)msg.textContent=`Could not locate “${text}”. Try city + state.`;return}
  const first=String(place.label||text).split(',')[0].trim(),trailLike=/trail|greenway|park|preserve|path|nature center|bike/i.test(`${text} ${first}`);
  searchAnchor=trailLike?{name:first||text,city:'',state:'Nearby',mi:null,d:['beginner','intermediate'],type:'Mapped trail location',lat:place.lat,lon:place.lon,status:`https://www.google.com/search?q=${encodeURIComponent((first||text)+' trail status')}`} : null;
  loc={lat:place.lat,lon:place.lon};mode='near';searchText='';trailData.clear();
  if(msg)msg.textContent=`${text}: finding trails within the selected drive radius…`;
  showBase();await Promise.race([loadArea(),sleep(6000)]).catch(()=>{});render();window.TrailRideActivity?.apply?.();await overpassSafe(text)
 }
 async function requestOverpass(q,isState){
  let lastError=null;
  for(const endpoint of OVERPASS_ENDPOINTS){
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),isState?22000:16000);
   try{
    const r=await fetch(endpoint,{method:'POST',body:q,headers:{Accept:'application/json'},signal:controller.signal});
    if(!r.ok)throw new Error(`trail server ${r.status}`);
    const j=await r.json();if(!Array.isArray(j.elements))throw new Error('invalid trail response');return j;
   }catch(e){lastError=e}finally{clearTimeout(timer)}
  }
  throw lastError||new Error('live trail servers unavailable');
 }
 async function overpassSafe(placeLabel=''){
  const selected=document.getElementById('stateSelect')?.value||'Georgia',a=activity();let q,isState=mode==='state';
  if(isState)q=`[out:json][timeout:28];area["name"="${selected}"]["boundary"="administrative"]["admin_level"="4"]->.a;(${queryParts(a,null)});out center tags 1200;`;
  else q=`[out:json][timeout:22];(${queryParts(a,{radius:radiusMeters()})});out center tags 1200;`;
  try{
    const j=await requestOverpass(q,isState);
    const found=(j.elements||[]).map(e=>{const lat=e.lat||e.center?.lat,lon=e.lon||e.center?.lon,name=e.tags?.name||e.tags?.['mtb:name'];if(!lat||!lon||!name)return null;let type='Trail';if(e.tags?.route==='bicycle'||e.tags?.highway==='cycleway')type='Bike / multi-use';else if(e.tags?.route==='hiking'||e.tags?.route==='foot'||e.tags?.highway==='footway')type='Walking / hiking';else if(e.tags?.route==='mtb'||e.tags?.sport==='mountain_biking'||e.tags?.['mtb:scale']!=null)type='Mountain bike';const km=parseFloat(e.tags?.distance);return{name,city:e.tags?.['addr:city']||e.tags?.city||e.tags?.locality||e.tags?.['is_in:city']||'',state:isState?selected:'Nearby',mi:Number.isFinite(km)?+(km*.621371).toFixed(1):null,d:diff(e.tags),type,lat:+lat,lon:+lon,status:e.tags?.website||e.tags?.url||`https://www.google.com/search?q=${encodeURIComponent(name+' trail status')}`}}).filter(Boolean);
    let base=baseTrails();if(searchAnchor&&!isState)base=[searchAnchor,...base];if(!isState){const max=radiusMeters()/1609.34;base=base.filter(t=>miles(loc.lat,loc.lon,t.lat,t.lon)<=max)}
    const seen=new Set(base.map(x=>String(x.name||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()));trails=[...base,...found.filter(x=>{const k=String(x.name||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();if(!k||seen.has(k))return false;seen.add(k);return true})];populateTrails();render();window.TrailRideActivity?.apply?.();
    const txt=document.getElementById('locationText'),liveCount=Math.max(0,trails.length-base.length);if(txt)txt.textContent=isState?`${selected}: ${trails.length} trails loaded (${liveCount} live map results).`:`${placeLabel||'Selected area'}: ${trails.length} trails loaded (${liveCount} live map results) within about ${document.getElementById('radius')?.selectedOptions?.[0]?.text||'selected radius'}.`;
  }catch(e){
    let base=baseTrails();if(searchAnchor&&!isState)base=[searchAnchor,...base];if(!isState){const max=radiusMeters()/1609.34;base=base.filter(t=>miles(loc.lat,loc.lon,t.lat,t.lon)<=max)}trails=base;populateTrails();render();window.TrailRideActivity?.apply?.();
    const txt=document.getElementById('locationText');if(txt)txt.textContent=isState?`${selected}: live trail servers are unavailable; showing ${trails.length} verified and saved trails. Tap Refresh to retry.`:`${placeLabel||'Selected area'}: live trail servers are unavailable; showing ${trails.length} verified and saved trails in the selected radius. Tap Search to retry.`
  }
 }
 discover=async function(){showBase();await overpassSafe()};
 refresh=async function(){trailData.clear();showBase();await Promise.race([loadArea(),sleep(6000)]).catch(()=>{});render();window.TrailRideActivity?.apply?.();overpassSafe()};
 chooseState=async function(){searchAnchor=null;const state=document.getElementById('stateSelect')?.value;if(state==='near')return;mode='state';searchText='';trailData.clear();const q=document.getElementById('trailSearch');if(q)q.value='';showBase();const txt=document.getElementById('locationText');if(txt)txt.textContent=`${state}: showing planning trails while live data loads…`;await Promise.race([geocodeState(state),sleep(3500)]).catch(()=>{});await Promise.race([loadArea(),sleep(6000)]).catch(()=>{});render();window.TrailRideActivity?.apply?.();overpassSafe()};
 function installPlaceSearch(){
  const btn=document.getElementById('searchBtn'),input=document.getElementById('trailSearch');if(!btn||!input||btn.dataset.placeSearch)return;btn.dataset.placeSearch='1';
  btn.onclick=null;input.onkeydown=null;
  const go=e=>{const text=input.value.trim();if(!text)return;e?.preventDefault?.();searchPlace(text)};
  btn.addEventListener('click',go);input.addEventListener('keydown',e=>{if(e.key==='Enter')go(e)});
 }
 window.addEventListener('trailride:activitychange',()=>{try{refresh()}catch(e){showBase()}});
 setTimeout(()=>{installPlaceSearch();try{if(mode==='state')chooseState();else refresh()}catch(e){showBase()}},120);
})();