(()=>{
 const MILES_PER_MIN=.9;
 const beltline={name:'Atlanta BeltLine',city:'Atlanta',state:'Georgia',mi:16.7,d:['beginner'],type:'Paved multi-use / cycling',lat:33.7557,lon:-84.3884,status:'https://beltline.org/parks-trails/'};
 function addPermanentTrail(){
  if(typeof curated==='undefined')return;
  if(!curated.some(t=>String(t.name).toLowerCase()==='atlanta beltline'))curated.push(beltline);
 }
 function radiusMiles(){
  const v=document.getElementById('radius')?.value;
  return v==='all'?248:Math.max(1,Number(v)||120)*MILES_PER_MIN;
 }
 function withinRadius(t){
  if(!t||!Number.isFinite(Number(t.lat))||!Number.isFinite(Number(t.lon)))return true;
  if(document.getElementById('radius')?.value==='all')return true;
  try{return miles(loc.lat,loc.lon,Number(t.lat),Number(t.lon))<=radiusMiles()}catch{return true}
 }
 function applyRadiusFilter(){
  if(typeof trails==='undefined'||typeof mode==='undefined'||mode==='state')return;
  trails=trails.filter(withinRadius);
  if(typeof populateTrails==='function')populateTrails();
 }
 function describeRadius(){
  const el=document.getElementById('locationText'),sel=document.getElementById('radius');
  if(!el||!sel)return;
  const label=sel.options[sel.selectedIndex]?.textContent||'selected radius';
  el.textContent=`Searching within about ${label} of the current search center.`;
 }
 function patchDiscover(){
  if(typeof discover!=='function'||discover.__radiusFixed)return;
  const original=discover;
  const wrapped=async function(){
   addPermanentTrail();
   await original();
   applyRadiusFilter();
  };
  wrapped.__radiusFixed=true;
  discover=wrapped;
 }
 function patchRadiusControl(){
  const r=document.getElementById('radius');
  if(!r||r.dataset.radiusFixed==='1')return;
  r.dataset.radiusFixed='1';
  r.addEventListener('change',async e=>{
   e.stopImmediatePropagation();
   try{
    mode='near';
    searchText='';
    const s=document.getElementById('stateSelect');if(s)s.value='near';
    describeRadius();
    if(typeof refresh==='function')await refresh();
    else if(typeof discover==='function'){await discover();if(typeof render==='function')await render()}
   }catch(err){console.error('TrailRide radius refresh failed',err)}
  },true);
 }
 function patchSearchButton(){
  const b=document.getElementById('searchBtn');
  if(!b||b.dataset.radiusSearchFixed==='1')return;
  b.dataset.radiusSearchFixed='1';
  b.addEventListener('click',()=>setTimeout(()=>{addPermanentTrail();applyRadiusFilter()},4000));
 }
 function boot(){addPermanentTrail();patchDiscover();patchRadiusControl();patchSearchButton()}
 document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();