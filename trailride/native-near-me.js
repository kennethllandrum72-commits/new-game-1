(()=>{
  const btn=document.getElementById('locateBtn');
  const status=()=>document.getElementById('locationText');
  if(!btn)return;

  const nativeGeo=()=>window.Capacitor?.Plugins?.Geolocation||null;
  const isNative=()=>{
    try{return !!window.Capacitor?.isNativePlatform?.()}catch{return false}
  };

  async function browserPosition(){
    return new Promise((resolve,reject)=>{
      if(!navigator.geolocation)return reject(new Error('Geolocation unavailable'));
      navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,timeout:15000,maximumAge:30000});
    });
  }

  async function nativePosition(){
    const geo=nativeGeo();
    if(!geo)throw new Error('Native Geolocation plugin unavailable');
    try{
      const perm=await geo.checkPermissions?.();
      if(perm?.location!=='granted'&&perm?.coarseLocation!=='granted'){
        await geo.requestPermissions?.({permissions:['location','coarseLocation']});
      }
    }catch{}
    return geo.getCurrentPosition({enableHighAccuracy:true,timeout:15000,maximumAge:30000});
  }

  async function useLocation(){
    const label=status();
    const old=btn.textContent;
    btn.disabled=true;
    btn.textContent='📍 Finding you…';
    if(label)label.textContent='Getting your current location…';
    try{
      const p=isNative()?await nativePosition():await browserPosition();
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
      if(label)label.textContent='Near Me: using your current location.';
      await refresh();
      document.getElementById('trailList')?.scrollIntoView({behavior:'smooth',block:'start'});
    }catch(err){
      console.error('TrailRide Near Me location error',err);
      if(label)label.textContent=isNative()
        ?'Location unavailable. Check iPhone Settings → Privacy & Security → Location Services → TrailRide Near Me and allow location access.'
        :'Location unavailable. Choose a state instead.';
    }finally{
      btn.disabled=false;
      btn.textContent=old||'📍 Near Me';
    }
  }

  // Replace app.js browser-only handler after it has initialized.
  btn.onclick=useLocation;
  window.TrailRideNearMe={useLocation,isNative};
})();
