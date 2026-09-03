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

 // Disable the old full-screen details overlay on iPhone/WKWebView. It was
 // creating a giant fixed layer that trapped all taps. Trail details now expand
 // inside the selected trail card so the rest of the app always stays usable.
 const overlay=document.getElementById('detailOverlay');
 if(overlay){
  overlay.classList.add('hidden');
  overlay.style.display='none';
  overlay.style.pointerEvents='none';
  new MutationObserver(()=>{
   if(!overlay.classList.contains('hidden'))overlay.classList.add('hidden');
   overlay.style.display='none';
   overlay.style.pointerEvents='none';
   document.body.style.overflow='';
  }).observe(overlay,{attributes:true,attributeFilter:['class','style']});
 }

 const makeInlineDetails=card=>{
  let panel=card.querySelector('.inlineTrailDetails');
  if(panel)return panel;
  panel=document.createElement('section');
  panel.className='inlineTrailDetails';
  panel.style.marginTop='12px';
  panel.style.padding='14px';
  panel.style.border='1px solid #45616b';
  panel.style.borderRadius='16px';
  panel.style.background='#0d1b1e';
  panel.style.position='relative';
  panel.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px"><strong style="font-size:18px">Trail details</strong><button type="button" class="inlineDetailsClose btn" style="padding:8px 12px">Close</button></div>';

  const selectors=['.meta','.badges','.conditionWarning','.rideScoreRow','.why','.air','.healthAdvice'];
  selectors.forEach(sel=>{
   const src=card.querySelector(sel);
   if(src&&src.textContent.trim()){
    const clone=src.cloneNode(true);
    clone.removeAttribute('id');
    panel.appendChild(clone);
   }
  });

  const links=document.createElement('div');
  links.style.display='grid';
  links.style.gridTemplateColumns='1fr 1fr';
  links.style.gap='8px';
  links.style.marginTop='12px';
  ['.mapsBtn','.statusBtn','.weatherBtn'].forEach(sel=>{
   const src=card.querySelector(sel);
   if(src?.href){
    const a=document.createElement('a');
    a.className=src.className;
    a.textContent=src.textContent;
    a.href=src.href;
    a.target='_blank';
    links.appendChild(a);
   }
  });
  if(links.children.length)panel.appendChild(links);
  card.appendChild(panel);
  return panel;
 };

 document.addEventListener('click',e=>{
  const details=e.target.closest('.detailsBtn');
  if(details){
   e.preventDefault();
   e.stopImmediatePropagation();
   const card=details.closest('.trail');
   if(!card)return;
   const panel=makeInlineDetails(card);
   const opening=panel.hidden;
   document.querySelectorAll('.inlineTrailDetails').forEach(p=>{if(p!==panel)p.hidden=true});
   panel.hidden=!opening;
   details.textContent=opening?'Hide Details':'Trail Details';
   if(opening)setTimeout(()=>panel.scrollIntoView({behavior:'smooth',block:'nearest'}),30);
   return;
  }
  const close=e.target.closest('.inlineDetailsClose');
  if(close){
   e.preventDefault();
   e.stopImmediatePropagation();
   const panel=close.closest('.inlineTrailDetails');
   const card=close.closest('.trail');
   if(panel)panel.hidden=true;
   const btn=card?.querySelector('.detailsBtn');
   if(btn)btn.textContent='Trail Details';
  }
 },true);
})();
