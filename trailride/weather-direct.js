(()=>{
 const $=id=>document.getElementById(id);
 const withTimeout=(p,ms=10000)=>Promise.race([p,new Promise((_,r)=>setTimeout(()=>r(new Error('timeout')),ms))]);
 const fmtHour=t=>{let h=+t.slice(11,13);return `${h%12||12} ${h<12?'AM':'PM'}`};
 const endHour=t=>{let h=(+t.slice(11,13)+1)%24;return `${h%12||12} ${h<12?'AM':'PM'}`};
 function score(temp,rain,hum,aqi){let s=10;if(temp>=95)s-=3;else if(temp>=90)s-=2;else if(temp>=85)s-=1;if(rain>=70)s-=3;else if(rain>=40)s-=1.5;else if(rain>=20)s-=.5;if(hum>=85)s-=1;else if(hum>=75)s-=.4;if(aqi>150)s-=2.5;else if(aqi>100)s-=1.5;else if(aqi>50)s-=.5;return Math.max(1,Math.min(10,+s.toFixed(1)))}
 async function fetchJson(url){let r=await withTimeout(fetch(url,{cache:'no-store'}),10000);if(!r.ok)throw new Error('http '+r.status);return r.json()}
 async function load(lat,lon){
  try{
   $('weatherTitle').textContent='Loading live weather…';
   const day=$('daySelect')?.value||new Date().toISOString().slice(0,10);
   const [w,a]=await Promise.allSettled([
    fetchJson(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&past_days=2&forecast_days=8`),
    fetchJson(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=us_aqi,pm2_5,ozone&timezone=auto&forecast_days=7`)
   ]);
   if(w.status!=='fulfilled')throw w.reason;
   const wx=w.value, aq=a.status==='fulfilled'?a.value:null;
   let di=wx.daily?.time?.indexOf(day);if(di==null||di<0)di=0;
   const hi=Math.round(wx.daily?.temperature_2m_max?.[di]??wx.current?.temperature_2m??0),lo=Math.round(wx.daily?.temperature_2m_min?.[di]??0),rain=Math.round(wx.daily?.precipitation_probability_max?.[di]??0),precip=+(wx.daily?.precipitation_sum?.[di]??0);
   $('weatherTitle').textContent=`${hi}°F high • ${lo}°F low • ${rain}% rain`;
   $('weatherSummary').textContent=`Now ${Math.round(wx.current?.temperature_2m??hi)}°F • Wind ${Math.round(wx.current?.wind_speed_10m??0)} mph • Humidity ${Math.round(wx.current?.relative_humidity_2m??0)}%`;
   let now=Date.now(),r24=0,r48=0;wx.hourly?.time?.forEach((t,i)=>{let age=(now-new Date(t).getTime())/36e5,p=+(wx.hourly.precipitation?.[i]||0);if(age>=0&&age<=24)r24+=p;if(age>=0&&age<=48)r48+=p});
   $('rainHistory').textContent=`🌧 Recent rainfall: ${r24.toFixed(2)} in past 24 hr • ${r48.toFixed(2)} in past 48 hr`;
   let aqRows=[];if(aq?.hourly?.time)aq.hourly.time.forEach((t,i)=>{if(t.slice(0,10)===day){let hr=+t.slice(11,13);if(hr>=6&&hr<=20)aqRows.push({aqi:+(aq.hourly.us_aqi?.[i]||0),pm:+(aq.hourly.pm2_5?.[i]||0),oz:+(aq.hourly.ozone?.[i]||0)})}});
   let maxAqi=aqRows.length?Math.max(...aqRows.map(x=>x.aqi)):null,pm=aqRows.length?Math.max(...aqRows.map(x=>x.pm)):null;
   $('airQualitySummary').textContent=maxAqi==null?'🌬 Air quality unavailable':`🌬 AQI ${Math.round(maxAqi)} • PM2.5 ${pm.toFixed(1)}`;
   let rows=[];wx.hourly?.time?.forEach((t,i)=>{if(t.slice(0,10)!==day)return;let hr=+t.slice(11,13);if(hr<6||hr>20)return;let ai=aq?.hourly?.time?.indexOf(t)??-1,aqi=ai>=0?+(aq.hourly.us_aqi?.[ai]||0):0,temp=+(wx.hourly.temperature_2m?.[i]||0),rp=+(wx.hourly.precipitation_probability?.[i]||0),hum=+(wx.hourly.relative_humidity_2m?.[i]||0);rows.push({t,temp,rp,hum,aqi,s:score(temp,rp,hum,aqi)})});
   let best=null;for(let i=0;i<=rows.length-3;i++){let g=rows.slice(i,i+3),avg=g.reduce((z,x)=>z+x.s,0)/3;if(!best||avg>best.avg)best={g,avg}};
   if(best)$('bestWindow').innerHTML=`⭐ Best 3-hour window: <strong>${fmtHour(best.g[0].t)}–${endHour(best.g[2].t)}</strong> • ${best.avg.toFixed(1)}/10`;else $('bestWindow').textContent='Hourly forecast unavailable.';
   $('hourlyList').innerHTML=rows.map(x=>`<div class="hour ${x.s>=8?'great':x.s>=6?'fair':'poor'}"><strong>${fmtHour(x.t)}</strong><span>${Math.round(x.temp)}°</span><small>Rain ${Math.round(x.rp)}%</small><small>Humidity ${Math.round(x.hum)}%</small><small>AQI ${Math.round(x.aqi)||'--'}</small><b>${x.s}</b></div>`).join('');
   $('overallScore').textContent=best?best.avg.toFixed(1):score(hi,rain,wx.current?.relative_humidity_2m||0,maxAqi||0).toFixed(1);
   window.__trailrideWeatherOK=true;
  }catch(e){
   $('weatherTitle').textContent='Live weather unavailable';
   $('weatherSummary').textContent='Tap Refresh to retry live weather.';
   $('bestWindow').textContent='Weather service did not respond. Tap Refresh to retry.';
   window.__trailrideWeatherOK=false;
  }
 }
 function currentCoords(){try{return typeof loc!=='undefined'&&loc?{lat:loc.lat,lon:loc.lon}:{lat:32.46098,lon:-84.98771}}catch{return{lat:32.46098,lon:-84.98771}}}
 function reload(){let c=currentCoords();load(c.lat,c.lon)}
 setTimeout(reload,600);
 $('refreshBtn')?.addEventListener('click',()=>setTimeout(reload,200));
 $('daySelect')?.addEventListener('change',reload);
 $('stateSelect')?.addEventListener('change',()=>setTimeout(reload,1800));
 $('locateBtn')?.addEventListener('click',()=>{navigator.geolocation?.getCurrentPosition(p=>load(p.coords.latitude,p.coords.longitude),()=>setTimeout(reload,400),{enableHighAccuracy:true,timeout:8000,maximumAge:300000})});
 window.TrailRideWeather={reload,load};
})();