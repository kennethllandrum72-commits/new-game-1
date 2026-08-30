(()=>{
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 function baseTrails(){
  const state=document.getElementById('stateSelect')?.value||'Georgia';
  if(mode==='near') return [...curated];
  return curated.filter(t=>t.state===state);
 }
 function showBase(){
  trails=baseTrails();
  populateTrails();
  render();
 }
 async function overpassSafe(){
  const selected=document.getElementById('stateSelect')?.value||'Georgia';
  let q;
  if(mode==='state'){
    q=`[out:json][timeout:12];area["name"="${selected}"]["boundary"="administrative"]["admin_level"="4"]->.a;(relation(area.a)[route=mtb];way(area.a)[route=mtb];node(area.a)[sport=mountain_biking];way(area.a)[sport=mountain_biking];relation(area.a)[route=bicycle];way(area.a)[highway=cycleway][name];);out center tags 120;`;
  }else{
    const rv=document.getElementById('radius')?.value||'120';
    const radius=rv==='all'?120000:Math.min(80000,+rv*.75*1609.34);
    q=`[out:json][timeout:12];(relation(around:${radius},${loc.lat},${loc.lon})[route=mtb];way(around:${radius},${loc.lat},${loc.lon})[route=mtb];node(around:${radius},${loc.lat},${loc.lon})[sport=mountain_biking];way(around:${radius},${loc.lat},${loc.lon})[sport=mountain_biking];relation(around:${radius},${loc.lat},${loc.lon})[route=bicycle];way(around:${radius},${loc.lat},${loc.lon})[highway=cycleway][name];);out center tags 120;`;
  }
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),7000);
  try{
    const r=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',body:q,signal:controller.signal});
    if(!r.ok) throw new Error('trail search failed');
    const j=await r.json();
    const found=(j.elements||[]).map(e=>{
      const lat=e.lat||e.center?.lat,lon=e.lon||e.center?.lon,name=e.tags?.name||e.tags?.['mtb:name'];
      if(!lat||!lon||!name)return null;
      const type=e.tags?.route==='bicycle'||e.tags?.highway==='cycleway'?'Bike / multi-use':'Mountain bike';
      const km=parseFloat(e.tags?.distance);
      return {name,city:e.tags?.['addr:city']||e.tags?.city||e.tags?.locality||'',state:mode==='state'?selected:'Nearby',mi:Number.isFinite(km)?+(km*.621371).toFixed(1):null,d:diff(e.tags),type,lat,lon,status:e.tags?.website||`https://www.google.com/search?q=${encodeURIComponent(name+' trail status')}`};
    }).filter(Boolean);
    const base=baseTrails(),seen=new Set(base.map(x=>x.name.toLowerCase()));
    trails=[...base,...found.filter(x=>{const k=x.name.toLowerCase();if(seen.has(k))return false;seen.add(k);return true})];
    populateTrails();render();
    const txt=document.getElementById('locationText');
    if(txt)txt.textContent=mode==='near'?'Near Me: live trails loaded.':`${selected}: live trails loaded.`;
  }catch(e){
    showBase();
    const txt=document.getElementById('locationText');
    if(txt)txt.textContent=mode==='near'?'Near Me: showing saved trails; live search can be retried.':`${selected}: showing saved trails; live search can be retried.`;
  }finally{clearTimeout(timer)}
 }
 discover=async function(){showBase();await overpassSafe()};
 refresh=async function(){
  trailData.clear();showBase();
  await Promise.race([loadArea(),sleep(6000)]).catch(()=>{});
  render();
  overpassSafe();
 };
 chooseState=async function(){
  const state=document.getElementById('stateSelect')?.value;
  if(state==='near')return;
  mode='state';searchText='';trailData.clear();
  const q=document.getElementById('trailSearch');if(q)q.value='';
  showBase();
  const txt=document.getElementById('locationText');if(txt)txt.textContent=`${state}: showing saved trails while live data loads…`;
  await Promise.race([geocodeState(state),sleep(3500)]).catch(()=>{});
  await Promise.race([loadArea(),sleep(6000)]).catch(()=>{});
  render();
  overpassSafe();
 };
 setTimeout(()=>{
  try{
    if(mode==='state') chooseState();
    else refresh();
  }catch(e){showBase()}
 },120);
})();