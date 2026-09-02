(()=>{
  const btn=document.getElementById('locateBtn');
  const status=()=>document.getElementById('locationText');
  if(!btn)return;

  const isNative=()=>{try{return !!window.Capacitor?.isNativePlatform?.()}catch{return false}};
  const capGeo=()=>window.TrailRideNative?.Geolocation||window.Capacitor?.Plugins?.Geolocation||null;
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

  async function diagnostic(){
    const fn=window.TrailRideNative?.getLocationDiagnostic;
    if(!fn)return null;
    try{return await timeout(fn(),6000,'diagnostic timeout')}catch(e){return {error:errText(e)}}
  }

  async function capacitorPosition(){
    const geo=capGeo();
    if(!geo?.getCurrentPosition)throw new Error('Native geolocation bridge unavailable');

    const d=await diagnostic();
    const state=d?.location||'unknown';
    const coarse=d?.coarseLocation||'unknown';
    const diagErr=d?.error?` • diag=${d.error}`:'';
    setStatus(`Location diagnostic: native=yes • permission=${state} • coarse=${coarse}${diagErr}`);

    if(state==='denied'){
      throw new Error('iOS reports location permission denied. Change TrailRide location access in Settings.');
    }

    try{
      const pos=await timeout(
        geo.getCurrentPosition({enableHighAccuracy:false,timeout:30000,maximumAge:60000}),
        32000,
        'native GPS timeout'
      );
      return normalize(pos);
    }catch(e){
      throw new Error(`permission=${state} • coarse=${coarse} • GPS=${errText(e)}`);
    }
  }

  async function browserPosition(){
    setStatus(`Location diagnostic: browser GPS fallback…`);
    return timeout(new Promise((resolve,reject)=>{
      if(!navigator.geolocation)return reject(new Error('Browser geolocation unavailable'));
      navigator.geolocation.getCurrentPosition(
        p=>resolve(normalize(p)),reject,
        {enableHighAccuracy:false,timeout:20000,maximumAge:60000}
      );
    }),22000,'browser GPS timeout');
  }

  async function getPosition(){
    if(isNative())return capacitorPosition();
    return browserPosition();
  }

  async function useLocation(){
    const old=btn.textContent;
    btn.disabled=true;btn.textContent='📍 Finding you…';
    setStatus(`Location diagnostic: native=${isNative()?'yes':'no'} • bridge=${capGeo()?'yes':'no'}`);
    try{
      const p=await getPosition(),c=p.coords;
      mode='near';searchText='';trailData.clear();
      const search=document.getElementById('trailSearch'),state=document.getElementById('stateSelect');
      if(search)search.value='';if(state)state.value='near';
      loc={lat:c.latitude,lon:c.longitude};
      setStatus(`Near Me: location found (${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}). Loading nearby trails…`);
      await timeout(refresh(),15000,'Nearby trails took too long to load');
      setStatus('Near Me: using your current location.');
      document.getElementById('trailList')?.scrollIntoView({behavior:'smooth',block:'start'});
    }catch(err){
      console.error('TrailRide Near Me location error',err);
      setStatus(`Location diagnostic error: ${errText(err)}`);
    }finally{
      btn.disabled=false;
      btn.textContent=old||'📍 Near Me';
    }
  }

  btn.onclick=useLocation;
  window.TrailRideNearMe={useLocation,isNative,getPosition,diagnostic};
})();
