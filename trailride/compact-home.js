(()=>{
 const controls=document.querySelector('.controls');
 if(controls&&!document.querySelector('.filterToolbar')){
  controls.classList.add('compactControls');
  const search=controls.querySelector('.searchBar');
  const grid=controls.querySelector('.searchGrid');
  const health=controls.querySelector('.healthBox');
  const location=controls.querySelector('.locationText');
  const ebike=controls.querySelector('.ebikePanel');
  const toolbar=document.createElement('div');
  toolbar.className='filterToolbar';
  toolbar.innerHTML='<button type="button" class="filterBtn" id="filterToggle">☰ Filters & rider settings</button><span class="quickStatus">Tap to change trail search</span>';
  const advanced=document.createElement('div');
  advanced.className='advancedFilters';
  [search,grid,health].forEach(el=>{if(el)advanced.appendChild(el)});
  controls.insertBefore(toolbar,controls.firstChild);
  controls.insertBefore(advanced,location||controls.lastChild);
  if(ebike&&location){controls.insertBefore(ebike,advanced)}
  const btn=toolbar.querySelector('#filterToggle');
  btn.onclick=()=>{const open=advanced.classList.toggle('open');btn.classList.toggle('open',open);btn.textContent=open?'✕ Close filters':'☰ Filters & rider settings'};
  document.querySelectorAll('.modernNav button').forEach(b=>{if(b.dataset.go==='search')b.onclick=()=>{if(!advanced.classList.contains('open'))btn.click();setTimeout(()=>document.getElementById('trailSearch')?.focus(),150)}});
 }

 // iPhone/WKWebView fix: the details sheet could inherit a stale scroll offset,
 // leaving a large blank area and making the app appear broken.
 const overlay=document.getElementById('detailOverlay');
 const sheet=overlay?.querySelector('.detailSheet');
 if(overlay&&sheet){
  const resetDetails=()=>{
   if(overlay.classList.contains('hidden'))return;
   sheet.scrollTop=0;
   overlay.scrollTop=0;
   overlay.style.position='fixed';
   overlay.style.inset='0';
   overlay.style.zIndex='9999';
   overlay.style.alignItems='flex-end';
   sheet.style.maxHeight='calc(100dvh - env(safe-area-inset-top) - 12px)';
   sheet.style.overflowY='auto';
   sheet.style.webkitOverflowScrolling='touch';
  };
  document.addEventListener('click',e=>{
   if(e.target.closest('.detailsBtn')){
    requestAnimationFrame(()=>requestAnimationFrame(resetDetails));
    setTimeout(resetDetails,80);
   }
  },true);
  new MutationObserver(resetDetails).observe(overlay,{attributes:true,attributeFilter:['class']});
 }
})();
