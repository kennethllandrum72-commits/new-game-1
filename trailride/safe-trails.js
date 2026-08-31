(()=>{
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const hikingOnly=[{name:'Pine Mountain Trail',city:'Pine Mountain',state:'Georgia',mi:23,d:'intermediate',type:'Hiking only / footpath',lat:32.837,lon:-84.815,status:'https://www.google.com/search?q=Pine+Mountain+Trail+Georgia+status'}];
 function activity(){return window.TrailRideActivity?.current?.()||localStorage.getItem('trailride-activity')||'cycling'}
 function baseTrails(){
  const state=document.getElementById('stateSelect')?.value||'Georgia',a=activity();
  let base=mode==='near'?[...curated]:curated.filter(t=>t.state===state);
  if(a==='hiking')base=[...base,...hikingOnly.filter(t=>mode==='near'||t.state===state)];
  return base;
 }
 function showBase(){trails=baseTrails();populateTrails();render();window.TrailRideActivity?.apply?.()}
 function queryParts(a,scope){
  const around=scope?`(around:${scope.radius},${loc.lat},${loc.lon})`:'(area.a)';
  if(a==='hiking')return `relation${around}[route=hiking];way${around}[highway=path][name];way${around}[highway=footway][name];relation${around}[route=foot];`;
  if(a==='walking'||a==='jogging'||a==='running')return `relation${around}[route=foot];relation${around}[route=hiking];way${around}[highway=footway][name];way${around}[highway=pedestrian][name];way${around}[highway=cycleway][name];`;
  return `relation${around}[route=mtb];way${around}[route=mtb];node${around}[sport=mountain_biking];way${around}[sport=mountain_biking];relation${around}[route=bicycle];way${around}[highway=cycleway][name];`;
 }
 async function overpassSafe(){
  const selected=document.getElementById('stateSelect')?.value||'Georgia',a=activity();let q;
  if(mode==='state')q=`[out:json][timeout:12];area["name"="${selected}"]["boundary"="administrative"]["admin_level"="4"]->.a;(${queryParts(a,null)});out center tags 120;`;
  else{const rv=document.getElementById('radius')?.value||'120',radius=rv==='all'?120000:Math.min(80000,+rv*.75*1609.34);q=`[out:json][timeout:12];(${queryParts(a,{radius})});out center tags 120;`}
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),7000);
  try{
    const r=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',body:q,signal:controller.signal});if(!r.ok)throw new Error('trail search failed');
    const j=await r.json();
    const found=(j.elements||[]).map(e=>{const lat=e.lat||e.center?.lat,lon=e.lon||e.center?.lon,name=e.tags?.name||e.tags?.['mtb:name'];if(!lat||!lon||!name)return null;let type='Trail';if(e.tags?.route==='bicycle'||e.tags?.highway==='cycleway')type='Paved / multi-use';else if(e.tags?.route==='hiking'||e.tags?.route==='foot'||e.tags?.highway==='footway'||e.tags?.highway==='path')type='Walking / hiking';else if(e.tags?.route==='mtb'||e.tags?.sport==='mountain_biking')type='Mountain bike';const km=parseFloat(e.tags?.distance);return {name,city:e.tags?.['addr:city']||e.tags?.city||e.tags?.locality||'',state:mode==='state'?selected:'Nearby',mi:Number.isFinite(km)?+(km*.621371).toFixed(1):null,d:diff(e.tags),type,lat,lon,status:e.tags?.website||`https://www.google.com/search?q=${encodeURIComponent(name+' trail status')}`}}).filter(Boolean);
    const base=baseTrails(),seen=new Set(base.map(x=>x.name.toLowerCase()));trails=[...base,...found.filter(x=>{const k=x.name.toLowerCase();if(seen.has(k))return false;seen.add(k);return true})];populateTrails();render();window.TrailRideActivity?.apply?.();
    const txt=document.getElementById('locationText');if(txt)txt.textContent=mode==='near'?`Near Me: ${a} trails loaded.`:`${selected}: ${a} trails loaded.`;
  }catch(e){showBase();const txt=document.getElementById('locationText');if(txt)txt.textContent=mode==='near'?'Near Me: showing saved trails; live search can be retried.':`${selected}: showing saved trails; live search can be retried.`}finally{clearTimeout(timer)}
 }
 discover=async function(){showBase();await overpassSafe()};
 refresh=async function(){trailData.clear();showBase();await Promise.race([loadArea(),sleep(6000)]).catch(()=>{});render();window.TrailRideActivity?.apply?.();overpassSafe()};
 chooseState=async function(){const state=document.getElementById('stateSelect')?.value;if(state==='near')return;mode='state';searchText='';trailData.clear();const q=document.getElementById('trailSearch');if(q)q.value='';showBase();const txt=document.getElementById('locationText');if(txt)txt.textContent=`${state}: showing saved trails while live data loads…`;await Promise.race([geocodeState(state),sleep(3500)]).catch(()=>{});await Promise.race([loadArea(),sleep(6000)]).catch(()=>{});render();window.TrailRideActivity?.apply?.();overpassSafe()};
 window.addEventListener('trailride:activitychange',()=>{try{refresh()}catch(e){showBase()}});
 setTimeout(()=>{try{if(mode==='state')chooseState();else refresh()}catch(e){showBase()}},120);
})();