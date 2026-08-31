(()=>{
 const $=id=>document.getElementById(id);
 const weatherIds=['weatherTitle','weatherSummary','rainHistory','airQualitySummary','overallScore','bestWindow','hourlyList'];
 const snapshot=()=>Object.fromEntries(weatherIds.map(id=>[id,$(id)?.innerHTML]));
 const restore=s=>weatherIds.forEach(id=>{const el=$(id);if(el&&s[id]!==undefined)el.innerHTML=s[id]});
 const refreshNew=()=>setTimeout(()=>window.TrailRideWeather?.reload?.(),0);

 // app.js still owns trail discovery/cards, but its legacy weather calculation must
 // never write the main Ride Conditions or Hourly Planner UI again.
 if(typeof window.render==='function'){
   const legacyRender=window.render;
   window.render=function(...args){
     const before=snapshot();
     const result=legacyRender.apply(this,args);
     restore(before);
     refreshNew();
     return result;
   };
 }

 // Trail enrichment used to overwrite the main score again after local trail
 // requests finished. Preserve the score from the new weather engine instead.
 if(typeof window.enrichTrailConditions==='function'){
   const legacyEnrich=window.enrichTrailConditions;
   window.enrichTrailConditions=async function(...args){
     const score=$('overallScore')?.innerHTML;
     const result=await legacyEnrich.apply(this,args);
     if($('overallScore')&&score!==undefined) $('overallScore').innerHTML=score;
     refreshNew();
     return result;
   };
 }

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