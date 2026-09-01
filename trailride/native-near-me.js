(()=>{
  const btn=document.getElementById('locateBtn');
  const status=()=>document.getElementById('locationText');
  if(!btn)return;

  const isNative=()=>{try{return !!window.Capacitor?.isNativePlatform?.()}catch{return false}};
  const capGeo=()=>window.Capacitor?.Plugins?.Geolocation||null;
  const timeout=(promise,ms,label='Location timed out')=>Promise.race([
    promise,
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
    if(!geo?.getCurrentPosition)throw new Error('Capacitor geolocation unavailable');
    try{
      const perms=await timeout(geo.checkPermissions?.(),3000);
      if(perms?.location!=='granted'&&perms?.coarseLocation!=='granted'){
        await timeout(geo.requestPermissions?.({permissions:['location']}),8000,'Location permission timed out');
      }
    }catch(e){console.warn('Location permission check failed',e)}
    return normalize(await timeout(geo.getCurrentPosition({enableHighAccuracy:true,timeout:12000,maximumAge:30000}),15000,'Native GPS timed out'));
  }

  async function browserPosition(){
    return timeout(new Promise((resolve,reject)=>{
      if(!navigator.geolocation)return reject(new Error('Browser geolocation unavailable'));
      navigator.geolocation.getCurrentPosition(
        p=>resolve(normalize(p)),
        reject,
        {enableHighAccuracy:true,timeout:12000,maximumAge:30000}
      );
    }),15000,'Browser GPS timed out');
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
    if(label)label.textContent='Getting your current location…';
    try{
      const p=await getPosition(),c=p.coords;
      mode='near';searchText='';trailData.clear();
      const search=document.getElementById('trailSearch'),state=document.getElementById('stateSelect');
      if(search)search.value='';if(state)state.value='near';
      loc={lat:c.latitude,lon:c.longitude};
      if(label)label.textContent='Near Me: location found. Loading nearby trails…';
      await refresh();
      if(label)label.textContent='Near Me: using your current location.';
      document.getElementById('trailList')?.scrollIntoView({behavior:'smooth',block:'start'});
    }catch(err){
      console.error('TrailRide Near Me location error',err);
      if(label)label.textContent='Could not get GPS. Check iPhone Settings → Privacy & Security → Location Services → TrailRide, then try again.';
    }finally{
      btn.disabled=false;btn.textContent=old||'📍 Near Me';
    }
  }

  btn.onclick=useLocation;
  window.TrailRideNearMe={useLocation,isNative,getPosition};
})();
