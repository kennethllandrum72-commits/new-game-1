(()=>{
 const riddenKey='trailride-ridden',planKey='trailride-plans',gpsKey='trailride-gps-sessions';
 let ridden=JSON.parse(localStorage.getItem(riddenKey)||'{}'),plans=JSON.parse(localStorage.getItem(planKey)||'{}'),view='recorded';
 const save=()=>{localStorage.setItem(riddenKey,JSON.stringify(ridden));localStorage.setItem(planKey,JSON.stringify(plans));renderDashboard()};
 const gpsSessions=()=>{try{const x=JSON.parse(localStorage.getItem(gpsKey)||'[]');return Array.isArray(x)?x:[]}catch{return[]}};
 function trailName(card){return card.querySelector('.trailName')?.textContent.trim()||''}
 function trailMeta(card){return card.querySelector('.meta')?.textContent.trim()||''}
 function today(){return new Date().toISOString().slice(0,10)}
 function fmtDuration(ms){let s=Math.max(0,Math.floor(ms/1000)),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),ss=s%60;return h?`${h}h ${String(m).padStart(2,'0')}m ${String(ss).padStart(2,'0')}s`:`${m}m ${String(ss).padStart(2,'0')}s`}
 function fmtDate(ms){try{return new Date(ms).toLocaleString([],{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'})}catch{return'Unknown date'}}
 function activityLabel(x){return String(x||'cycling').replace(/(^|[-_ ])\w/g,m=>m.toUpperCase())}
 function ensurePlanner(){if(document.getElementById('ridePlanOverlay'))return;let o=document.createElement('div');o.id='ridePlanOverlay';o.className='ridePlanOverlay hidden';o.innerHTML=`<div class="ridePlanSheet"><div class="ridePlanHead"><div><div class="eyebrow">PLAN A RIDE</div><h2 id="ridePlanTrail">Trail</h2></div><button id="ridePlanClose" class="closeBtn">×</button></div><label class="rideDateLabel">Choose ride date<input id="ridePlanDate" type="date"></label><div class="ridePlanActions"><button id="ridePlanCancel" class="btn">Cancel</button><button id="ridePlanSave" class="primary">Save Ride Plan</button></div></div>`;document.body.appendChild(o);const close=()=>o.classList.add('hidden');document.getElementById('ridePlanClose').onclick=close;document.getElementById('ridePlanCancel').onclick=close;o.addEventListener('click',e=>{if(e.target===o)close()})}
 function openPlanner(name,meta,onSaved){ensurePlanner();let o=document.getElementById('ridePlanOverlay'),d=document.getElementById('ridePlanDate');document.getElementById('ridePlanTrail').textContent=name;d.min=today();d.value=plans[name]?.date||document.getElementById('daySelect')?.value||today();o.classList.remove('hidden');setTimeout(()=>{try{d.showPicker?.()}catch{}},50);document.getElementById('ridePlanSave').onclick=()=>{if(!d.value)return;plans[name]={date:d.value,meta};save();o.classList.add('hidden');onSaved?.()}}
 function decorateCard(card){if(card.dataset.rideTracking==='1')return;let name=trailName(card);if(!name)return;card.dataset.rideTracking='1';let bar=document.createElement('div');bar.className='rideTrackBar';let riddenBtn=document.createElement('button');riddenBtn.className='trackBtn';let planBtn=document.createElement('button');planBtn.className='trackBtn planned';const sync=()=>{riddenBtn.textContent=ridden[name]?'✓ Ridden':'✓ Mark Ridden';riddenBtn.className='trackBtn'+(ridden[name]?' ridden':'');planBtn.textContent=plans[name]?`📅 Planned ${plans[name].date}`:'📅 Save Ride Plan';let badges=card.querySelector('.badges');let old=badges?.querySelector('.riddenBadge');if(ridden[name]&&!old&&badges){let b=document.createElement('span');b.className='badge riddenBadge';b.textContent='✓ RIDDEN';badges.appendChild(b)}else if(!ridden[name]&&old)old.remove()};riddenBtn.onclick=()=>{if(ridden[name])delete ridden[name];else ridden[name]={date:today(),meta:trailMeta(card)};save();sync()};planBtn.onclick=()=>openPlanner(name,trailMeta(card),sync);bar.append(riddenBtn,planBtn);let actions=card.querySelector('.actions');actions?.before(bar);sync()}
 function scanCards(){document.querySelectorAll('#trailList .trail').forEach(decorateCard)}
 function button(text,cls='miniBtn'){let b=document.createElement('button');b.className=cls;b.textContent=text;return b}
 function renderRecorded(dash,sessions){
  if(!sessions.length){dash.innerHTML='<div class="rideEmpty">No GPS rides saved yet. Start GPS, record an activity, then tap “Stop & Save.” Your ride will appear here.</div>';return}
  sessions.forEach(session=>{
   let row=document.createElement('div');row.className='rideItem recordedRideItem';
   let text=document.createElement('div');let title=document.createElement('strong');title.textContent=`${activityLabel(session.activity)} • ${(Number(session.distance)||0).toFixed(2)} mi`;let sub=document.createElement('small');sub.textContent=`${fmtDate(session.started||session.id)} • ${fmtDuration((session.ended||session.started)-(session.started||session.id))} • ${session.points?.length||0} GPS points`;text.append(title,sub);
   let acts=document.createElement('div');acts.className='rideItemActions';
   let route=button('View Route');route.onclick=()=>showRoute(row,session,route);
   let del=button('Delete','miniBtn remove');del.onclick=()=>{if(!confirm('Delete this recorded ride?'))return;let next=gpsSessions().filter(x=>String(x.id)!==String(session.id));localStorage.setItem(gpsKey,JSON.stringify(next));renderDashboard()};
   acts.append(route,del);row.append(text,acts);dash.appendChild(row)
  })
 }
 function showRoute(row,session,btn){
  let old=row.querySelector('.recordedRouteMap');if(old){old.remove();btn.textContent='View Route';return}
  let pts=(session.points||[]).filter(p=>Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lon)));
  if(!pts.length){btn.textContent='No Route Data';btn.disabled=true;return}
  let box=document.createElement('div');box.className='recordedRouteMap';box.style.cssText='height:300px;width:100%;margin-top:12px;border-radius:14px;overflow:hidden;grid-column:1/-1;';row.appendChild(box);btn.textContent='Hide Route';
  if(!window.L){box.textContent='Map unavailable.';return}
  let m=L.map(box,{zoomControl:true});L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(m);let coords=pts.map(p=>[Number(p.lat),Number(p.lon)]);let line=L.polyline(coords).addTo(m);L.circleMarker(coords[0],{radius:6}).addTo(m).bindTooltip('Start');L.circleMarker(coords[coords.length-1],{radius:6}).addTo(m).bindTooltip('Finish');m.fitBounds(line.getBounds(),{padding:[20,20]});setTimeout(()=>m.invalidateSize(),80)
 }
 function renderDashboard(){
  let dash=document.getElementById('rideDashboard');if(!dash)return;let favs=JSON.parse(localStorage.getItem('trailride-favs')||'[]'),sessions=gpsSessions();
  document.getElementById('favCount').textContent=favs.length;document.getElementById('planCount').textContent=Object.keys(plans).length;document.getElementById('riddenCount').textContent=Object.keys(ridden).length;let rc=document.getElementById('recordedCount');if(rc)rc.textContent=sessions.length;
  dash.innerHTML='';
  if(view==='recorded'){renderRecorded(dash,sessions);return}
  let entries=[];if(view==='ridden')entries=Object.entries(ridden).map(([name,x])=>({name,sub:`Ridden ${x.date}${x.meta?' • '+x.meta:''}`,kind:'ridden'}));if(view==='planned')entries=Object.entries(plans).map(([name,x])=>({name,sub:`Planned for ${x.date}${x.meta?' • '+x.meta:''}`,kind:'planned'}));if(view==='favorites')entries=favs.map(name=>({name,sub:'Favorite trail',kind:'favorite'}));
  if(!entries.length){dash.innerHTML=`<div class="rideEmpty">${view==='ridden'?'No completed trails yet. Use “Mark Ridden” on a trail after you ride it.':view==='planned'?'No saved ride plans yet. Tap “Save Ride Plan” on a trail and choose a date.':'No favorites yet. Tap the heart on a trail to save it.'}</div>`;return}
  entries.sort((a,b)=>a.name.localeCompare(b.name)).forEach(item=>{let row=document.createElement('div');row.className='rideItem';let text=document.createElement('div');let strong=document.createElement('strong');strong.textContent=item.name;let small=document.createElement('small');small.textContent=item.sub;text.append(strong,small);let acts=document.createElement('div');acts.className='rideItemActions';let find=button('Find Trail');find.onclick=()=>{let q=document.getElementById('trailSearch');if(q){q.value=item.name;document.getElementById('searchBtn')?.click();window.scrollTo({top:0,behavior:'smooth'})}};acts.appendChild(find);if(item.kind==='planned'){let edit=button('Change Date');edit.onclick=()=>openPlanner(item.name,plans[item.name]?.meta||'',renderDashboard);acts.appendChild(edit);let d=button('Mark Ridden','miniBtn done');d.onclick=()=>{ridden[item.name]={date:today(),meta:plans[item.name]?.meta||''};delete plans[item.name];save()};acts.appendChild(d)}if(item.kind!=='favorite'){let rem=button('Remove','miniBtn remove');rem.onclick=()=>{if(item.kind==='ridden')delete ridden[item.name];else delete plans[item.name];save()};acts.appendChild(rem)}row.append(text,acts);dash.appendChild(row)})
 }
 document.querySelectorAll('.rideTab').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('.rideTab').forEach(x=>x.classList.remove('active'));btn.classList.add('active');view=btn.dataset.view;renderDashboard()});
 window.addEventListener('trailride:gps-saved',()=>{if(view==='recorded')renderDashboard();else{let rc=document.getElementById('recordedCount');if(rc)rc.textContent=gpsSessions().length}});
 window.addEventListener('storage',renderDashboard);
 new MutationObserver(()=>{scanCards()}).observe(document.getElementById('trailList'),{childList:true,subtree:true});
 setInterval(()=>{scanCards();if(!document.querySelector('.recordedRouteMap')){let rc=document.getElementById('recordedCount');if(rc)rc.textContent=gpsSessions().length}},1500);
 scanCards();renderDashboard()
})();