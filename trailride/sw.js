const CACHE='trailride-v14';
const SHELL=['./','index.html','styles.css','rides.css','app.js','rides.js','manifest.webmanifest','icon.svg'];
self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));
});
self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  const liveHosts=['api.open-meteo.com','air-quality-api.open-meteo.com','overpass-api.de','nominatim.openstreetmap.org'];
  if(liveHosts.includes(url.hostname)){
    event.respondWith(fetch(req));
    return;
  }
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(res=>{
      const copy=res.clone();
      caches.open(CACHE).then(cache=>cache.put('./',copy));
      return res;
    }).catch(()=>caches.match('./')));
    return;
  }
  event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
    if(url.origin===self.location.origin){
      const copy=res.clone();
      caches.open(CACHE).then(cache=>cache.put(req,copy));
    }
    return res;
  })));
});