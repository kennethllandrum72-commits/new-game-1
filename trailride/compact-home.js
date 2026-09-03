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

 const overlay=document.getElementById('detailOverlay');
 const sheet=overlay?.querySelector('.detailSheet');
 const closeBtn=document.getElementById('detailClose');
 if(overlay&&sheet){
  const openFix=()=>{
   if(overlay.classList.contains('hidden'))return;
   overlay.style.position='fixed';
   overlay.style.inset='0';
   overlay.style.zIndex='99999';
   overlay.style.display='block';
   overlay.style.overflow='hidden';
   overlay.style.background='#071416';
   sheet.style.position='fixed';
   sheet.style.left='0';
   sheet.style.right='0';
   sheet.style.top='env(safe-area-inset-top)';
   sheet.style.bottom='0';
   sheet.style.width='100%';
   sheet.style.maxWidth='none';
   sheet.style.height='auto';
   sheet.style.maxHeight='none';
   sheet.style.margin='0';
   sheet.style.borderRadius='0';
   sheet.style.overflowY='auto';
   sheet.style.webkitOverflowScrolling='touch';
   sheet.style.paddingTop='14px';
   sheet.style.paddingBottom='calc(96px + env(safe-area-inset-bottom))';
   sheet.scrollTop=0;
   overlay.scrollTop=0;
   document.body.style.overflow='hidden';
   if(closeBtn){
    closeBtn.style.position='sticky';
    closeBtn.style.top='0';
    closeBtn.style.zIndex='100001';
   }
  };
  const closeFix=()=>{
   document.body.style.overflow='';
  };
  document.addEventListener('click',e=>{
   if(e.target.closest('.detailsBtn')){
    requestAnimationFrame(()=>requestAnimationFrame(openFix));
    setTimeout(openFix,80);
   }
   if(e.target===overlay||e.target.closest('#detailClose')){
    closeFix();
   }
  },true);
  new MutationObserver(()=>{
   if(overlay.classList.contains('hidden')) closeFix();
   else openFix();
  }).observe(overlay,{attributes:true,attributeFilter:['class']});
 }
})();
