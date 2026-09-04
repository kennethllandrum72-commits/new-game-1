(()=>{
 const maps=new WeakMap();
 const key=s=>String(s||'').trim().toLowerCase();
 function findTrail(name){try{return (typeof trails!=='undefined'?trails:[]).find(t=>key(t.name)===key(name))||null}catch{return null}}
 function addButtons(){document.querySelectorAll('#trailList .trail').forEach(card=>{
  const actions=card.querySelector('.actions');if(!actions||actions.querySelector('.systemMapBtn'))return;
  const btn=document.createElement('button');btn.className='btn systemMapBtn';btn.textContent='🗺 Trail Map';actions.insertBefore(btn,actions.children[1]||null);
  btn.addEventListener('click',()=>toggle(card,btn));
 })}
 async function toggle(card,btn){
  let panel=card.querySelector('.trailSystemPanel');
  if(panel){const hidden=panel.hidden;panel.hidden=!hidden;btn.textContent=hidden?'✕ Hide Trail Map':'🗺 Trail Map';if(hidden){setTimeout(()=>maps.get(panel)?.invalidateSize(),60)}return}
  const name=card.querySelector('.trailName')?.textContent||'Trail';
  const t=findTrail(name);panel=document.createElement('div');panel.className='trailSystemPanel';panel.style.cssText='margin-top:12px;border:1px solid rgba(255,255,255,.15);border-radius:14px;overflow:hidden;background:#071416';
  panel.innerHTML=`<div style="padding:10px 12px;font-weight:700">${name} trail system</div><div class="trailSystemMap" style="height:320px;width:100%;background:#0b2023"></div><div class="trailSystemStatus" style="padding:8px 12px;font-size:12px;opacity:.8">Loading mapped trails…</div>`;
  card.appendChild(panel);btn.textContent='✕ Hide Trail Map';
  if(!window.L||!t?.lat||!t?.lon){panel.querySelector('.trailSystemStatus').textContent='Map location unavailable for this trail.';return}
  const el=panel.querySelector('.trailSystemMap'),m=L.map(el).setView([t.lat,t.lon],14);maps.set(panel,m);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(m);L.marker([t.lat,t.lon]).addTo(m).bindPopup(name);
  try{
   const q=`[out:json][timeout:25];(way(around:7000,${t.lat},${t.lon})[highway=path][name];way(around:7000,${t.lat},${t.lon})[highway=track][name];way(around:7000,${t.lat},${t.lon})[highway=cycleway][name];way(around:7000,${t.lat},${t.lon})[mtb:scale][name];relation(around:7000,${t.lat},${t.lon})[route=mtb];relation(around:7000,${t.lat},${t.lon})[route=bicycle];);out geom tags 350;`;
   const r=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',body:q}),j=await r.json();let layers=[];
   for(const e of j.elements||[]){if(!Array.isArray(e.geometry)||e.geometry.length<2)continue;const pts=e.geometry.map(p=>[p.lat,p.lon]);const line=L.polyline(pts,{weight:4,opacity:.8}).addTo(m);const nm=e.tags?.name||e.tags?.['mtb:name']||'Trail';line.bindPopup(nm);layers.push(line)}
   if(layers.length){const group=L.featureGroup(layers.concat([L.marker([t.lat,t.lon])])).getBounds();if(group.isValid())m.fitBounds(group.pad(.08));panel.querySelector('.trailSystemStatus').textContent=`Showing ${layers.length} mapped trail segments/routes from OpenStreetMap.`}else panel.querySelector('.trailSystemStatus').textContent='No mapped trail geometry was returned here. Base map and trail location are shown.';
  }catch(err){panel.querySelector('.trailSystemStatus').textContent='Could not load trail-system lines right now. Base map is still available.'}
 }
 function boot(){addButtons();const list=document.getElementById('trailList');if(list)new MutationObserver(addButtons).observe(list,{childList:true,subtree:true})}
 document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();
})();