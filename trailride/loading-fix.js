(()=>{
 const $=id=>document.getElementById(id);
 if(!document.querySelector('link[href*="trail-drying.css"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='trail-drying.css?v=29';document.head.appendChild(l)}
 if(!document.querySelector('script[src*="trail-drying.js"]')){const s=document.createElement('script');s.src='trail-drying.js?v=29';s.defer=true;document.head.appendChild(s)}
 function message(){
  const wt=$('weatherTitle'),ws=$('weatherSummary'),rr=$('rainHistory'),aq=$('airQualitySummary'),bw=$('bestWindow');
  if(wt?.textContent.includes('Loading')) wt.textContent='Live weather unavailable';
  if(ws&&!ws.textContent.trim()) ws.textContent='Trails are still available. Tap Refresh to retry live conditions.';
  if(rr?.textContent.includes('Checking')) rr.textContent='Recent rainfall unavailable — verify trail conditions before riding.';
  if(aq?.textContent.includes('Checking')) aq.textContent='Air quality unavailable — tap Refresh to retry.';
  if(bw?.textContent.includes('Finding')) bw.textContent='Best ride window unavailable until weather reconnects.';
 }
 setTimeout(message,9000);
 document.getElementById('refreshBtn')?.addEventListener('click',()=>setTimeout(message,9000));
})();