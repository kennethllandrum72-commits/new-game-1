(()=>{
  const btn=document.getElementById('locateBtn');
  const status=()=>document.getElementById('locationText');
  if(!btn)return;

  const isNative=()=>{try{return !!window.Capacitor?.isNativePlatform?.()}catch{return false}};
  const nativeLoc=()=>window.TrailRideNative?.Location||null;
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

  async function ensureNativePermission(){
    const locPlugin=nativeLoc();
    if(!locPlugin?.getStatus||!locPlugin?.requestWhenInUse)throw new Error('TrailRide native location plugin unavailable');

    let s=await timeout(locPlugin.getStatus(),5000,'native permission status timeout');
    setStatus(`Native iOS location status: ${s?.status||'unknown'}`);

    if(s?.servicesEnabled===false)throw new Error('iPhone Location Services are turned off.');

    if(s?.status==='notDetermined'){
      setStatus('iOS is requesting location permission…');
      s=await timeout(locPlugin.requestWhenInUse(),30000,'native iOS permission callback timeout');
    }

    if(s?.status==='denied'||s?.status==='restricted'){
      throw new Error(`iOS location permission ${s.status}. Enable While Using the App in Settings.`);
    }
    if(s?.status!=='authorizedWhenInUse'&&s?.status!=='authorizedAlways'){
      throw new Error(`iOS location permission did not complete: ${s?.status||'unknown'}`);
    }
    return s;
  }

  async function capacitorPosition(){
    const locPlugin=nativeLoc();
    if(!locPlugin?.getCurrentPosition)throw new Error('TrailRide native GPS method unavailable');
    const granted=await ensureNativePermission();
    setStatus(`iOS permission ${granted.status}. Getting native GPS…`);
    try{
      const pos=await timeout(locPlugin.getCurrentPosition(),32000,'native CoreLocation GPS timeout');
      return normalize(pos);
    }catch(e){
      const d=await diagnostic();
      throw new Error(`native=${d?.nativeStatus||granted.status||'unknown'} • services=${d?.servicesEnabled} • GPS=${errText(e)}`);
    }
  }

  async function browserPosition(){
    setStatus('Location diagnostic: browser GPS fallback…');
    return timeout(new Promise((resolve,reject)=>{
      if(!navigator.geolocation)return reject(new Error('Browser geolocation unavailable'));
      navigator.geolocation.getCurrentPosition(
        p=>resolve(normalize(p)),reject,
        {enableHighAccuracy:false,timeout:20000,maximumAge:60000}
      );
    }),22000,'browser GPS timeout');
  }

  async function getPosition(){return isNative()?capacitorPosition():browserPosition()}

  async function useLocation(){
    const old=btn.textContent;
    btn.disabled=true;btn.textContent='📍 Finding you…';
    setStatus(`Location diagnostic: native=${isNative()?'yes':'no'} • TrailRide plugin=${nativeLoc()?'yes':'no'}`);
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
      const d=await diagnostic();
      const diag=d?` • nativeStatus=${d.nativeStatus||'unknown'} • services=${d.servicesEnabled} • custom=${d.customPlugin?'yes':'no'}`:'';
      setStatus(`Location diagnostic error: ${errText(err)}${diag}`);
    }finally{
      btn.disabled=false;btn.textContent=old||'📍 Near Me';
    }
  }

  btn.onclick=useLocation;
  window.TrailRideNearMe={useLocation,isNative,getPosition,diagnostic,ensureNativePermission};
})();
