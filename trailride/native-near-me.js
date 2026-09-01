(()=>{
  const btn=document.getElementById('locateBtn');
  const status=()=>document.getElementById('locationText');
  if(!btn)return;

  const nativeGeo=()=>window.Capacitor?.Plugins?.Geolocation||null;
  const isNative=()=>{
    try{return !!window.Capacitor?.isNativePlatform?.()}catch{return false}
  };
  const withTimeout=(promise,ms=12000)=>Promise.race([
    promise,
    new Promise((_,reject)=>setTimeout(()=>reject(new Error('Location timed out')),ms))
  ]);

  async function browserPosition(){
    return new Promise((resolve,reject)=>{
      if(!navigator.geolocation)return reject(new Error('Geolocation unavailable'));
      navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:false,timeout:10000,maximumAge:60000});
    });
  }

  async function nativePosition(){
    const geo=nativeGeo();
    if(!geo)throw new Error('Native Geolocation plugin unavailable');
    const perm=await withTimeout(geo.checkPermissions(),5000).catch(()=>null);
    if(perm?.location!=='granted'&&perm?.coarseLocation!=='granted'){
      const requested=await withTimeout(geo.requestPermissions({permissions:['location','coarseLocation']}),10000);
      if(requested?.location!=='granted'&&requested?.coarseLocation!=='granted')throw new Error('Location permission not granted');
    }
    return withTimeout(geo.getCurrentPosition({enableHighAccuracy:false,timeout:10000,maximumAge:60000}),12000);
  }

  async function getPosition(){
    if(isNative()){
      try{return await nativePosition()}catch(nativeErr){
        console.warn('Native geolocation failed; trying WebView geolocation',nativeErr);
        return browserPosition();
      }
    }
    return browserPosition();
  }

  async function useLocation(){
    const label=status();
    const old=btn.textContent;
    btn.disabled=true;
    btn.textContent='📍 Finding you…';
    if(label)label.textContent='Getting your current location…';
    try{
      const p=await getPosition();
      const c=p?.coords;
      if(!c||!Number.isFinite(Number(c.latitude))||!Number.isFinite(Number(c.longitude)))throw new Error('No coordinates returned');
      mode='near';
      searchText='';
      trailData.clear();
      const search=document.getElementById('trailSearch');
      const state=document.getElementById('stateSelect');
      if(search)search.value='';
      if(state)state.value='near';
      loc={lat:Number(c.latitude),lon:Number(c.longitude)};
      if(label)label.textContent='Near Me: location found. Loading nearby trails…';
      await refresh();
      if(label)label.textContent='Near Me: using your current location.';
      document.getElementById('trailList')?.scrollIntoView({behavior:'smooth',block:'start'});
    }catch(err){
      console.error('TrailRide Near Me location error',err);
      if(label)label.textContent='Location unavailable. On iPhone open Settings → Privacy & Security → Location Services → TrailRide Near Me → While Using the App, then try Near Me again.';
    }finally{
      btn.disabled=false;
      btn.textContent=old||'📍 Near Me';
    }
  }

  btn.onclick=useLocation;
  window.TrailRideNearMe={useLocation,isNative};
})();
