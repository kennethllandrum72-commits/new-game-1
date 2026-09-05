(()=>{
 const KEY='trailride-gps-sessions';
 const rad=x=>x*Math.PI/180;
 const meters=(a,b,c,d)=>{const R=6371000,x=Math.sin(rad(c-a)/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(rad(d-b)/2)**2;return 2*R*Math.asin(Math.sqrt(x))};
 const activity=()=>String(window.TrailRideActivity?.current?.()||'cycling').toLowerCase();
 const speedLimit=a=>a.includes('walk')||a.includes('hik')?12:a.includes('jog')?18:a.includes('run')?25:a.includes('ebike')||a.includes('e-bike')?45:55;
 const pointLimit=a=>speedLimit(a)*1.2;
 function cleanPosition(pos,last){
   if(!pos?.coords)return null;
   const c=pos.coords,lat=Number(c.latitude),lon=Number(c.longitude),acc=Number(c.accuracy),ts=Number(pos.timestamp)||Date.now(),a=activity(),limit=pointLimit(a);
   if(!Number.isFinite(lat)||!Number.isFinite(lon))return null;
   if(Number.isFinite(acc)&&acc>80)return null;
   let rawSpeed=Number(c.speed),mph=Number.isFinite(rawSpeed)&&rawSpeed>=0?rawSpeed*2.236936:null;
   if(last){
     const dt=(ts-last.ts)/1000;
     if(dt>0.4&&dt<120){
       const d=meters(last.lat,last.lon,lat,lon),implied=d/dt*2.236936,uncertainty=Math.max(Number.isFinite(acc)?acc:25,Number.isFinite(last.acc)?last.acc:25);
       if(implied>limit&&d>Math.max(25,uncertainty*1.5))return null;
     }
   }
   if(mph!==null&&mph>limit)rawSpeed=null;
   return {position:{coords:{latitude:lat,longitude:lon,accuracy:Number.isFinite(acc)?acc:0,altitude:Number.isFinite(Number(c.altitude))?Number(c.altitude):null,altitudeAccuracy:Number.isFinite(Number(c.altitudeAccuracy))?Number(c.altitudeAccuracy):null,heading:Number.isFinite(Number(c.heading))?Number(c.heading):null,speed:rawSpeed},timestamp:ts},state:{lat,lon,acc:Number.isFinite(acc)?acc:25,ts}};
 }
 function install(){
   const geo=navigator.geolocation;if(!geo||geo.__trailRideFiltered)return;
   const original=geo.watchPosition.bind(geo),states=new Map();
   geo.watchPosition=(success,error,opts)=>{
     let localId=null,last=null;
     localId=original(pos=>{const out=cleanPosition(pos,last);if(!out)return;last=out.state;states.set(localId,last);success(out.position)},error,opts);
     return localId;
   };
   geo.__trailRideFiltered=true;
 }
 function cleanSaved(){
   let sessions;try{sessions=JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return}
   if(!Array.isArray(sessions))return;
   let changed=false;
   for(const s of sessions){
     const a=String(s.activity||'cycling').toLowerCase(),cap=speedLimit(a);
     if(Number(s.maxSpeed)>cap){
       let best=0,last=null;
       for(const p of Array.isArray(s.points)?s.points:[]){
         const lat=Number(p.lat),lon=Number(p.lon),t=Number(p.t),acc=Number(p.acc);if(!Number.isFinite(lat)||!Number.isFinite(lon)||!Number.isFinite(t))continue;
         const direct=Number(p.speed);if(Number.isFinite(direct)&&direct>=0)best=Math.max(best,Math.min(cap,direct*2.236936));
         if(last){const dt=(t-last.t)/1000;if(dt>0.4&&dt<120){const d=meters(last.lat,last.lon,lat,lon),mph=d/dt*2.236936,unc=Math.max(Number.isFinite(acc)?acc:25,Number.isFinite(last.acc)?last.acc:25);if(mph<=cap*1.2||d<=Math.max(25,unc*1.5))best=Math.max(best,Math.min(cap,mph));}}
         last={lat,lon,t,acc:Number.isFinite(acc)?acc:25};
       }
       s.maxSpeed=+best.toFixed(2);changed=true;
     }
     if(Number(s.avgSpeed)>cap){const hrs=Math.max(0,Number(s.duration)||0)/36e5;s.avgSpeed=hrs>0?+(Math.max(0,Number(s.distance)||0)/hrs).toFixed(2):0;changed=true;}
   }
   if(changed){localStorage.setItem(KEY,JSON.stringify(sessions));setTimeout(()=>window.dispatchEvent(new Event('trailride:gps-saved')),50)}
 }
 install();cleanSaved();
})();