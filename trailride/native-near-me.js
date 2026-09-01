(()=>{
  const btn=document.getElementById('locateBtn');
  const status=()=>document.getElementById('locationText');
  if(!btn)return;

  const isNative=()=>{try{return !!window.Capacitor?.isNativePlatform?.()}catch{return false}};
  const capGeo=()=>window.Capacitor?.Plugins?.Geolocation||null;
  const bgGeo=()=>window.Capacitor?.Plugins?.BackgroundGeolocation||null;
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

  async function backgroundPosition(){
    const bg=bgGeo();
    if(!bg?.addWatcher)throw new Error('Background geolocation plugin unavailable');
    return timeout(new Promise(async(resolve,reject)=>{
      let watcherId=null,done=false;
      const finish=async(err,value)=>{
        if(done)return;done=true;
        if(watcherId!=null){try{await bg.removeWatcher({id:watcherId})}catch{}}
        err?reject(err):resolve(value);
      };
      try{
        watcherId=await bg.addWatcher({
          requestPermissions:true,
          stale:false,
          distanceFilter:0,
          backgroundMessage:'TrailRide uses your location to find nearby trails.',
          backgroundTitle:'TrailRide location'
        },(location,error)=>{
          if(error)return finish(new Error(error?.message||String(error)));
          if(location)finish(null,normalize(location));
        });
      }catch(e){finish(e)}
    }),12000,'Native GPS timed out');
  }

  async function capacitorPosition(){
    const geo=capGeo();
    if(!geo?.getCurrentPosition)throw new Error('Capacitor geolocation unavailable');
    try{await timeout(geo.requestPermissions?.(),5000)}catch{}
    return normalize(await timeout(geo.getCurrentPosition({enableHighAccuracy:false,timeout:8000,maximumAge:60000}),10000));
  }

  async function browserPosition(){
    return timeout(new Promise((resolve,reject)=>{
      if(!navigator.geolocation)return reject(new Error('Browser geolocation unavailable'));
      navigator.geolocation.watchPosition(
        p=>resolve(normalize(p)),
        reject,
        {enableHighAccuracy:false,timeout:8000,maximumAge:60000}
      );
    }),10000);
  }

  async function getPosition(){
    const attempts=isNative()
      ? [backgroundPosition,capacitorPosition,browserPosition]
      : [browserPosition];
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
      if(label)label.textContent='Could not get GPS. Open iPhone Settings → Privacy & Security → Location Services → TrailRide and allow location, then try again.';
    }finally{
      btn.disabled=false;btn.textContent=old||'📍 Near Me';
    }
  }

  btn.onclick=useLocation;
  window.TrailRideNearMe={useLocation,isNative,getPosition};
})();
