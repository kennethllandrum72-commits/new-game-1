(()=>{
  const btn=document.getElementById('locateBtn');
  const status=()=>document.getElementById('locationText');
  if(!btn)return;

  const isNative=()=>{try{return !!window.Capacitor?.isNativePlatform?.()}catch{return false}};
  const capGeo=()=>window.Capacitor?.Plugins?.Geolocation||null;
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
    if(!geo?.getCurrentPosition)throw new Error('Capacitor geolocation unavailable');

    let perms=null;
    try{perms=await timeout(geo.checkPermissions(),2500,'Permission check timed out')}catch(e){console.warn('Location permission check failed',e)}

    const granted=perms?.location==='granted'||perms?.coarseLocation==='granted';
    if(!granted){
      try{
        perms=await timeout(geo.requestPermissions({permissions:['location','coarseLocation']}),10000,'Location permission request timed out');
      }catch(e){
        console.warn('Location permission request failed',e);
      }
    }

    return normalize(await timeout(
      geo.getCurrentPosition({enableHighAccuracy:true,timeout:10000,maximumAge:60000}),
      12000,
      'Native GPS timed out'
    ));
  }

  async function browserPosition(){
    return timeout(new Promise((resolve,reject)=>{
      if(!navigator.geolocation)return reject(new Error('Browser geolocation unavailable'));
      navigator.geolocation.getCurrentPosition(
        p=>resolve(normalize(p)),
        reject,
        {enableHighAccuracy:true,timeout:10000,maximumAge:60000}
      );
    }),12000,'Browser GPS timed out');
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

    const hardStop=setTimeout(()=>{
      if(btn.disabled){
        btn.disabled=false;
        btn.textContent=old||'📍 Near Me';
        if(label)label.textContent='Location is taking too long. Open iPhone Settings → Privacy & Security → Location Services → TrailRide, allow location access, then try again.';
      }
    },26000);

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
      if(label)label.textContent='Could not get GPS. Open iPhone Settings → Privacy & Security → Location Services → TrailRide and allow location access, then try again.';
    }finally{
      clearTimeout(hardStop);
      btn.disabled=false;
      btn.textContent=old||'📍 Near Me';
    }
  }

  btn.onclick=useLocation;
  window.TrailRideNearMe={useLocation,isNative,getPosition};
})();
