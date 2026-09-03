(()=>{
 const KEY='trailride-gps-sessions';
 let watchId=null,nativeWatchId=null,startTime=0,last=null,points=[],distance=0,timer=null,map=null,line=null,marker=null,usingNative=false;
 let paused=false,pauseStarted=0,pausedMs=0,maxSpeed=0,followMap=true;
 const rad=x=>x*Math.PI/180;
 function miles(a,b,c,d){const R=3958.8,x=Math.sin(rad(c-a)/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(rad(d-b)/2)**2;return 2*R*Math.asin(Math.sqrt(x))}
 function fmtTime(ms){let s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),ss=s%60;return `${h?String(h).padStart(2,'0')+':':''}${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`}
 function nativePlugin(){return window.Capacitor?.Plugins?.BackgroundGeolocation||null}
 function activeElapsed(now=Date.now()){if(!startTime)return 0;return Math.max(0,now-startTime-pausedMs-(paused&&pauseStarted?now-pauseStarted:0))}
 function boot(){
  let main=document.querySelector('main');if(!main||document.getElementById('gpsTracker'))return;
  let sec=document.createElement('section');sec.id='gpsTracker';sec.className='card';
  sec.innerHTML=`<div class="eyebrow">LIVE GPS TRACKING</div><h2>Track this activity</h2>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0">
   <div><small>Time</small><strong id="gpsTime" style="display:block">00:00</strong></div>
   <div><small>Distance</small><strong id="gpsDistance" style="display:block">0.00 mi</strong></div>
   <div><small>Current</small><strong id="gpsSpeed" style="display:block">0.0 mph</strong></div>
   <div><small>Average</small><strong id="gpsAvg" style="display:block">0.0 mph</strong></div>
   <div><small>Max</small><strong id="gpsMax" style="display:block">0.0 mph</strong></div>
   <div><small>Accuracy</small><strong id="gpsAccuracy" style="display:block">--</strong></div>
  </div>
  <div style="display:flex;gap:8px;flex-wrap:wrap">
   <button id="gpsStart" class="primary">▶ Start Ride</button>
   <button id="gpsPause" class="ghost" disabled>⏸ Pause</button>
   <button id="gpsStop" class="ghost" disabled>■ Finish & Save</button>
   <button id="gpsFollow" class="ghost">◎ Auto-follow On</button>
   <button id="gpsClear" class="ghost">Clear Track</button>
  </div>
  <p id="gpsStatus" class="locationText">GPS is ready.${nativePlugin()?' Native background tracking is available.':' Keep TrailRide open while tracking in the web app.'}</p>
  <div id="gpsMap" style="height:280px;border-radius:14px;margin-top:12px;overflow:hidden"></div>`;
  let mapPanel=document.getElementById('mapPanel');(mapPanel?.parentNode||main).insertBefore(sec,mapPanel||main.firstChild);
  document.getElementById('gpsStart').onclick=start;
  document.getElementById('gpsPause').onclick=togglePause;
  document.getElementById('gpsStop').onclick=stop;
  document.getElementById('gpsFollow').onclick=()=>{followMap=!followMap;document.getElementById('gpsFollow').textContent=followMap?'◎ Auto-follow On':'◎ Auto-follow Off';status(followMap?'Map will follow your position.':'Map follow is off; you can pan freely.')};
  document.getElementById('gpsClear').onclick=clear;
  if(window.L){map=L.map('gpsMap').setView([32.46098,-84.98771],13);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);map.on('dragstart',()=>{followMap=false;let b=document.getElementById('gpsFollow');if(b)b.textContent='◎ Auto-follow Off'})}
 }
 async function beginWatch(){
  let bg=nativePlugin();
  if(bg){usingNative=true;status('Starting native background GPS…');try{nativeWatchId=await bg.addWatcher({backgroundMessage:'TrailRide is recording your activity.',backgroundTitle:'TrailRide GPS active',requestPermissions:true,stale:false,distanceFilter:3},(loc,err)=>{if(err){status(err.code==='NOT_AUTHORIZED'?'Allow Always Location for background GPS.':'Background GPS error.');return}if(loc)onNativePos(loc)});status('Background GPS active — tracking can continue when your iPhone is locked.');return}catch(e){usingNative=false;nativeWatchId=null;status('Native GPS unavailable; using foreground GPS instead.')}}
  if(!navigator.geolocation){status('GPS is not supported on this device.');resetButtons();return}
  watchId=navigator.geolocation.watchPosition(onPos,onErr,{enableHighAccuracy:true,maximumAge:1000,timeout:15000});status('GPS tracking active. Keep TrailRide open.')
 }
 async function endWatch(){if(usingNative&&nativeWatchId!==null){try{await nativePlugin()?.removeWatcher({id:nativeWatchId})}catch{}nativeWatchId=null}if(watchId!==null)navigator.geolocation.clearWatch(watchId);watchId=null;usingNative=false}
 async function start(){
  points=[];distance=0;last=null;maxSpeed=0;paused=false;pauseStarted=0;pausedMs=0;startTime=Date.now();followMap=true;
  document.getElementById('gpsStart').disabled=true;document.getElementById('gpsPause').disabled=false;document.getElementById('gpsStop').disabled=false;document.getElementById('gpsPause').textContent='⏸ Pause';document.getElementById('gpsFollow').textContent='◎ Auto-follow On';
  timer=setInterval(updateTime,1000);updateStats(0);await beginWatch()
 }
 async function togglePause(){
  if(!startTime)return;
  if(!paused){paused=true;pauseStarted=Date.now();last=null;await endWatch();document.getElementById('gpsPause').textContent='▶ Resume';document.getElementById('gpsSpeed').textContent='0.0 mph';status('Ride paused. Time and distance are not being added.')}else{pausedMs+=Date.now()-pauseStarted;pauseStarted=0;paused=false;last=null;document.getElementById('gpsPause').textContent='⏸ Pause';status('Resuming GPS…');await beginWatch()}
 }
 function onNativePos(c){onPoint({lat:c.latitude,lon:c.longitude,t:c.time||Date.now(),acc:c.accuracy,speed:c.speed})}
 function onPos(p){let c=p.coords;onPoint({lat:c.latitude,lon:c.longitude,t:Date.now(),acc:c.accuracy,speed:c.speed})}
 function onPoint(pt){
  if(paused)return;
  if(last&&pt.acc<80){let d=miles(last.lat,last.lon,pt.lat,pt.lon);if(d<.2)distance+=d}
  last=pt;points.push(pt);
  let mph=Number.isFinite(pt.speed)&&pt.speed>=0?pt.speed*2.23694:(points.length>1?distance/(Math.max(activeElapsed(),1)/36e5):0);mph=Number.isFinite(mph)?mph:0;maxSpeed=Math.max(maxSpeed,mph);
  document.getElementById('gpsDistance').textContent=distance.toFixed(2)+' mi';document.getElementById('gpsSpeed').textContent=mph.toFixed(1)+' mph';document.getElementById('gpsAccuracy').textContent=Math.round(pt.acc||0)+' m';updateStats(mph);draw(pt)
 }
 function updateStats(){let hrs=activeElapsed()/36e5;let avg=hrs>0?distance/hrs:0;document.getElementById('gpsAvg').textContent=(avg||0).toFixed(1)+' mph';document.getElementById('gpsMax').textContent=(maxSpeed||0).toFixed(1)+' mph'}
 function draw(pt){if(!map||!window.L)return;let ll=[pt.lat,pt.lon];if(!marker)marker=L.circleMarker(ll,{radius:8}).addTo(map);else marker.setLatLng(ll);let coords=points.map(x=>[x.lat,x.lon]);if(!line)line=L.polyline(coords).addTo(map);else line.setLatLngs(coords);if(followMap)map.setView(ll,16)}
 function updateTime(){if(startTime){document.getElementById('gpsTime').textContent=fmtTime(activeElapsed());updateStats()}}
 async function stop(){
  if(!startTime)return;
  if(paused&&pauseStarted){pausedMs+=Date.now()-pauseStarted;pauseStarted=0;paused=false}
  await endWatch();if(timer)clearInterval(timer);timer=null;
  let ended=Date.now(),duration=activeElapsed(ended),avg=duration>0?distance/(duration/36e5):0;
  let session={id:Date.now(),started:startTime,ended,duration,distance:+distance.toFixed(3),avgSpeed:+avg.toFixed(2),maxSpeed:+maxSpeed.toFixed(2),points,activity:window.TrailRideActivity?.current?.()||'cycling',backgroundCapable:!!nativePlugin()};
  resetButtons();
  if(points.length){let all=[];try{all=JSON.parse(localStorage.getItem(KEY)||'[]')}catch{}all.unshift(session);localStorage.setItem(KEY,JSON.stringify(all.slice(0,30)));status(`Saved: ${distance.toFixed(2)} mi in ${fmtTime(duration)} • Avg ${avg.toFixed(1)} mph • View under Saved → Recorded`);window.dispatchEvent(new CustomEvent('trailride:gps-saved',{detail:{id:session.id}}))}else status('No GPS points were recorded.');startTime=0
 }
 function resetButtons(){document.getElementById('gpsStart').disabled=false;document.getElementById('gpsPause').disabled=true;document.getElementById('gpsStop').disabled=true;document.getElementById('gpsPause').textContent='⏸ Pause'}
 function clear(){if(watchId!==null||nativeWatchId!==null||startTime)return;points=[];last=null;distance=0;maxSpeed=0;document.getElementById('gpsTime').textContent='00:00';document.getElementById('gpsDistance').textContent='0.00 mi';document.getElementById('gpsSpeed').textContent='0.0 mph';document.getElementById('gpsAvg').textContent='0.0 mph';document.getElementById('gpsMax').textContent='0.0 mph';document.getElementById('gpsAccuracy').textContent='--';if(line){line.remove();line=null}if(marker){marker.remove();marker=null}status('Track cleared.')}
 function onErr(e){status(e.code===1?'Location permission is required for GPS tracking.':'GPS signal unavailable. Try moving outdoors.');if(e.code===1)stop()}
 function status(t){let e=document.getElementById('gpsStatus');if(e)e.textContent=t}
 document.addEventListener('visibilitychange',()=>{if(startTime&&usingNative)status(document.hidden?'Background GPS active — TrailRide is still recording.':'Background GPS active — recording continues.')});
 document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();
})();