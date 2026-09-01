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

  function normalize(p){
    const c=p?.coords||p?.location||p;
    const latitude=Number(c?.latitude??c?.lat);
    const longitude=Number(c?.longitude??c?.lng??c?.lon);
    if(!Number.isFinite(latitude)||!Number.isFinite(longitude))throw new Error('No coordinates returned');
    return {coords:{latitude,longitude,accuracy:Number(c?.accuracy)||null}};
  }

  async function capacitorPosition(){
    const geo=capGeo();
    if(!geo?.getCurrentPosition||!geo?.requestPermissions)throw new Error('Native geolocation bridge unavailable');

    // Near Me is a user gesture. Ask iOS for When In Use authorization here,
    // not during app startup. This is what causes the native permission sheet.
    let perms=await timeout(geo.checkPermissions(),4000,'Permission check timed out');
    if(perms?.location==='prompt'||perms?.location==='prompt-with-rationale'||!perms?.location){
      perms=await timeout(geo.requestPermissions({permissions:['location']}),20000,'Location permission request timed out');
    }
    if(perms?.location==='denied')throw new Error('Location permission denied');
    if(perms?.location!=='granted'){
      // Some iOS/plugin combinations finalize authorization when the first
      // location request is made, so continue to getCurrentPosition.
      console.info('Location permission state before GPS:',perms?.location);
    }

    return normalize(await timeout(
      geo.getCurrentPosition({enableHighAccuracy:true,timeout:20000,maximumAge:30000}),
      22000,
      'Native GPS timed out'
    ));
  }

  async function browserPosition(){
    return timeout(new Promise((resolve,reject)=>{
      if(!navigator.geolocation)return reject(new Error('Browser geolocation unavailable'));
      navigator.geolocation.getCurrentPosition(
        p=>resolve(normalize(p)),reject,
        {enableHighAccuracy:true,timeout:15000,maximumAge:30000}
      );
    }),17000,'Browser GPS timed out');
  }

  async function getPosition(){
    const attempts=isNative()?[capacitorPosition,browserPosition]:[browserPosition];
    let lastError=null;
    for(const attempt of attempts){
      try{return await attempt()}catch(e){lastError=e;console.warn('Near Me location attempt failed',e)}
    }
    throw lastError||new Error('Location unavailable');
  }

  async function useLocation(){
    const label=status(),old=btn.textContent;
    btn.disabled=true;btn.textContent='📍 Finding you…';
    if(label)label.textContent='Requesting iPhone location…';
    try{
      const p=await getPosition(),c=p.coords;
      mode='near';searchText='';trailData.clear();
      const search=document.getElementById('trailSearch'),state=document.getElementById('stateSelect');
      if(search)search.value='';if(state)state.value='near';
      loc={lat:c.latitude,lon:c.longitude};
      if(label)label.textContent='Near Me: location found. Loading nearby trails…';
      await timeout(refresh(),15000,'Nearby trails took too long to load');
      if(label)label.textContent='Near Me: using your current location.';
      document.getElementById('trailList')?.scrollIntoView({behavior:'smooth',block:'start'});
    }catch(err){
      console.error('TrailRide Near Me location error',err);
      const denied=String(err?.message||err).toLowerCase().includes('denied');
      if(label)label.textContent=denied
        ? 'Location permission is off. Open iPhone Settings → Privacy & Security → Location Services → TrailRide and allow location access.'
        : 'Could not get your iPhone location. Make sure Location Services is on, then try Near Me again.';
    }finally{
      btn.disabled=false;
      btn.textContent=old||'📍 Near Me';
    }
  }

  btn.onclick=useLocation;
  window.TrailRideNearMe={useLocation,isNative,getPosition};
})();
