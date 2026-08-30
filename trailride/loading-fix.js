(()=>{
 const $=id=>document.getElementById(id);
 const permanent=[
  {name:'Standing Boy Trails',city:'Columbus',state:'Georgia',mi:29,type:'Mountain bike'},
  {name:'Flat Rock Park',city:'Columbus',state:'Georgia',mi:9.3,type:'Mountain bike'},
  {name:"Man O' War Trail",city:'Pine Mountain • Hamilton',state:'Georgia',mi:13.5,type:'Paved multi-use / bike trail'},
  {name:'Silver Comet Trail',city:'Smyrna • Rockmart • Cedartown',state:'Georgia',mi:61.5,type:'Paved multi-use / rail trail'}
 ];
 function message(){
  const wt=$('weatherTitle'), ws=$('weatherSummary'), rr=$('rainHistory'), aq=$('airQualitySummary'), bw=$('bestWindow');
  if(wt?.textContent.includes('Loading')) wt.textContent='Live weather unavailable';
  if(ws&&!ws.textContent.trim()) ws.textContent='You can still browse trails. Tap Refresh to retry live conditions.';
  if(rr?.textContent.includes('Checking')) rr.textContent='Recent rainfall: unavailable — verify trail conditions before riding.';
  if(aq?.textContent.includes('Checking')) aq.textContent='Air quality: unavailable — tap Refresh to retry.';
  if(bw?.textContent.includes('Finding')) bw.textContent='Best ride window unavailable until live weather reconnects.';
 }
 function emergencyTrails(){
  const list=$('trailList'); if(!list||list.children.length) return;
  const state=$('stateSelect')?.value||'Georgia';
  const rows=state==='Georgia'?permanent:[];
  if(!rows.length){list.innerHTML='<article class="trail card"><h3>Live trail search unavailable</h3><p class="meta">Tap Refresh to retry, or choose Georgia to view saved permanent trails.</p></article>';return;}
  list.innerHTML=rows.map((t,i)=>`<article class="trail card fallbackTrail"><div class="trailTop"><div><div class="rank">#${i+1} SAVED TRAIL</div><h3 class="trailName">${t.name}</h3><div class="meta">${t.city} • ${t.type} • ${t.mi} mi</div></div></div><div class="conditionWarning warningBox caution">LIVE CONDITIONS PENDING</div><p class="why">Trail is available while weather and live trail services reconnect.</p><div class="actions"><a class="btn mapsBtn" target="_blank" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.name+' '+t.city+' Georgia')}">Directions</a><a class="btn statusBtn" target="_blank" href="https://www.google.com/search?q=${encodeURIComponent(t.name+' current trail status')}">Trail Status</a></div></article>`).join('');
 }
 function watchdog(){message();emergencyTrails()}
 setTimeout(watchdog,7000);
 setTimeout(watchdog,14000);
 $('refreshBtn')?.addEventListener('click',()=>{setTimeout(watchdog,8000)});
 window.addEventListener('online',()=>{$('refreshBtn')?.click()});
})();