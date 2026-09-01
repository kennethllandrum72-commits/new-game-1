(()=>{
  const btn=document.getElementById('locateBtn');
  const status=()=>document.getElementById('locationText');
  if(!btn)return;

  const isNative=()=>{try{return !!window.Capacitor?.isNativePlatform?.()}catch{return false}};
  const capGeo=()=>window.TrailRideNative?.Geolocation||window.Capacitor?.Plugins?.Geolocation||null;
  const timeout=(promise,ms,label='Location timed out')=>Promise.race([
    Promise.resolve(promise),new Promise((_,reject)=>setTimeout(()=>reject(new Error(label)),ms))
  ]);
  const msg=e=>String(e?.message||e?.code||e||'unknown error');
  const show=t=>{const el=status();if(el)el.textContent=t;};

  function normalize(p){
    const c=p?.coords||p?.location||p;
    const latitude=Number(c?.latitude??c?.lat),longitude=Number(c?.longitude??c?.lng??c?.lon);
    if(!Number.isFinite(latitude)||!Number.isFinite(longitude))throw new Error('No coordinates returned');
    return {coords:{latitude,longitude,accuracy:Number(c?.accuracy)||null}};
  }

  async function capacitorPosition(){
    const native=isNative(),geo=capGeo();
    show(`Location check: native=${native?'yes':'no'} • bridge=${geo?'yes':'no'}`);
    if(!geo?.getCurrentPosition)throw new Error('Native geolocation bridge unavailable');

    let perms=null;
    if(geo.checkPermissions){
      try{
        perms=await timeout(geo.checkPermissions(),5000,'permission check timeout');
        show(`Location check: native=yes • bridge=yes • permission=${perms?.location||'unknown'}`);
      }catch(e){
        show(`Location error: permission check • ${msg(e)}`);throw e;
      }
    }

    if(geo.requestPermissions && (!perms?.location || perms.location==='prompt' || perms.location==='prompt-with-rationale')){
      try{
        show(`Location check: requesting iPhone permission…`);
        perms=await timeout(geo.requestPermissions({permissions:['location']}),20000,'permission request timeout');
        show(`Location check: permission after request=${perms?.location||'unknown'}`);
      }catch(e){
        show(`Location error: permission request • ${msg(e)}`);throw e;
      }
    }
    if(perms?.location==='denied')throw new Error('Location permission denied');

    try{
      show(`Location check: permission=${perms?.location||'unknown'} • requesting GPS…`);
      return normalize(await timeout(geo.getCurrentPosition({enableHighAccuracy:false,timeout:20000,maximumAge:60000}),22000,'Native GPS timed out'));
    }catch(e){
      show(`Location error: GPS • ${msg(e)}`);throw e;
    }
  }

  async function browserPosition(){
    show('Location check: trying browser GPS fallback…');
    return timeout(new Promise((resolve,reject)=>{
      if(!navigator.geolocation)return reject(new Error('Browser geolocation unavailable'));
      navigator.geolocation.getCurrentPosition(p=>resolve(normalize(p)),reject,{enableHighAccuracy:false,timeout:15000,maximumAge:60000});
    }),17000,'Browser GPS timed out');
  }

  async function getPosition(){
    if(isNative()) return capacitorPosition();
    return browserPosition();
  }

  async function useLocation(){
    const old=btn.textContent;btn.disabled=true;btn.textContent='📍 Finding you…';
    try{
      const p=await getPosition(),c=p.coords;
      show(`Location found ✓ ${c.latitude.toFixed(5)}, ${c.longitude.toFixed(5)}`);
      mode='near';searchText='';trailData.clear();
      const search=document.getElementById('trailSearch'),state=document.getElementById('stateSelect');
      if(search)search.value='';if(state)state.value='near';loc={lat:c.latitude,lon:c.longitude};
      await timeout(refresh(),15000,'Nearby trails took too long to load');
      show('Near Me: using your current location.');
      document.getElementById('trailList')?.scrollIntoView({behavior:'smooth',block:'start'});
    }catch(err){
      console.error('TrailRide Near Me location error',err);
      const current=status()?.textContent||'';
      if(!current.startsWith('Location error:')) show(`Location error: ${msg(err)} • native=${isNative()?'yes':'no'} • bridge=${capGeo()?'yes':'no'}`);
    }finally{btn.disabled=false;btn.textContent=old||'📍 Near Me';}
  }

  btn.onclick=useLocation;
  window.TrailRideNearMe={useLocation,isNative,getPosition};
})();
