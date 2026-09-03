(()=>{
  const btn=document.getElementById('locateBtn');
  const status=()=>document.getElementById('locationText');
  if(!btn)return;

  const isNative=()=>{try{return !!window.Capacitor?.isNativePlatform?.()}catch{return false}};
  const timeout=(promise,ms,label='Location timed out')=>Promise.race([
    Promise.resolve(promise),
    new Promise((_,reject)=>setTimeout(()=>reject(new Error(label)),ms))
  ]);
  const setStatus=t=>{const el=status();if(el)el.textContent=t};
  const errText=e=>String(e?.message||e||'unknown error');

  function normalize(p){
    const c=p?.coords||p?.location||p;
    const latitude=Number(c?.latitude??c?.lat);
    const longitude=Number(c?.longitude??c?.lng??c?.lon);
    if(!Number.isFinite(latitude)||!Number.isFinite(longitude))throw new Error('No coordinates returned');
    return {coords:{latitude,longitude,accuracy:Number(c?.accuracy)||null}};
  }

  async function webviewPosition(){
    setStatus(isNative()?'Using iPhone location…':'Using your location…');
    return timeout(new Promise((resolve,reject)=>{
      if(!navigator.geolocation)return reject(new Error('Location services are unavailable'));
      navigator.geolocation.getCurrentPosition(
        p=>resolve(normalize(p)),
        e=>reject(new Error(e?.message||'Location request failed')),
        {enableHighAccuracy:true,timeout:30000,maximumAge:15000}
      );
    }),32000,'iPhone location timed out');
  }

  async function getPosition(){
    return webviewPosition();
  }

  async function useLocation(){
    const old=btn.textContent;
    btn.disabled=true;
    btn.textContent='📍 Finding you…';
    setStatus('Requesting your current location…');
    try{
      const p=await getPosition(),c=p.coords;
      mode='near';searchText='';trailData.clear();
      const search=document.getElementById('trailSearch'),state=document.getElementById('stateSelect');
      if(search)search.value='';
      if(state)state.value='near';
      loc={lat:c.latitude,lon:c.longitude};
      setStatus(`Near Me: location found (${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}). Loading nearby trails…`);
      await timeout(refresh(),15000,'Nearby trails took too long to load');
      setStatus('Near Me: using your current location.');
      document.getElementById('trailList')?.scrollIntoView({behavior:'smooth',block:'start'});
    }catch(err){
      console.error('TrailRide Near Me location error',err);
      const message=errText(err);
      if(/denied|permission/i.test(message)){
        setStatus('Location permission is off. In iPhone Settings, allow TrailRide location access and keep Precise Location on.');
      }else{
        setStatus(`Location error: ${message}`);
      }
    }finally{
      btn.disabled=false;
      btn.textContent=old||'📍 Near Me';
    }
  }

  btn.onclick=useLocation;
  window.TrailRideNearMe={useLocation,isNative,getPosition};
})();
