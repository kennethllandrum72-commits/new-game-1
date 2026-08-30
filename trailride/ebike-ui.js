(()=>{
 const access={
  "Man O' War Trail":{classes:[1,2,3],label:'Verify current posted e-bike rules'},
  'Silver Comet Trail':{classes:[],label:'E-bike rules vary by jurisdiction — verify before riding'},
  'Standing Boy Trails':{classes:[],label:'Verify current land-manager e-bike rules'},
  'Flat Rock Park':{classes:[],label:'Verify current posted e-bike rules'},
  'Chewacla State Park':{classes:[],label:'Verify current park e-bike rules'},
  'Lakeside Trails':{classes:[],label:'Verify current land-manager e-bike rules'}
 };
 const controls=document.querySelector('.controls');
 if(controls&&!document.getElementById('ebikeClass')){
  const box=document.createElement('div');box.className='ebikePanel';
  box.innerHTML=`<div class="ebikeHead"><strong>⚡🚲 E-BIKE MODE</strong><select id="ebikeClass"><option value="all">Any e-bike class</option><option value="1">Class 1</option><option value="2">Class 2</option><option value="3">Class 3</option><option value="none">No e-bikes</option></select></div><p class="ebikeHelp">Class 1: pedal assist to 20 mph • Class 2: throttle to 20 mph • Class 3: pedal assist to 28 mph. Trail rules can change; always follow posted land-manager rules.</p>`;
  controls.appendChild(box)
 }
 function decorate(){
  const selected=document.getElementById('ebikeClass')?.value||'all';
  document.querySelectorAll('#trailList .trail').forEach(card=>{
   const name=card.querySelector('.trailName')?.textContent.trim()||'';
   const a=access[name];
   const meta=card.querySelector('.meta');
   let row=card.querySelector('.ebikeAccess');
   const html=a&&a.classes.length
    ?`<span class="ebikeChip">⚡ E-bike info</span>${a.classes.map(c=>`<span class="ebikeChip">Class ${c}</span>`).join('')}<span class="ebikeChip ebikeUnknown">${a.label}</span>`
    :`<span class="ebikeChip ebikeUnknown">⚡ ${a?.label||'E-bike class not verified — check local rules'}</span>`;
   if(!row){row=document.createElement('div');row.className='ebikeAccess';meta?.after(row)}
   if(row.innerHTML!==html)row.innerHTML=html;
   let show=true;
   if(selected==='none')show=!(a&&a.classes.length);
   else if(selected!=='all'&&a&&a.classes.length)show=a.classes.includes(+selected);
   card.style.display=show?'':'none';
  })
 }
 document.getElementById('ebikeClass')?.addEventListener('change',decorate);
 const trailList=document.getElementById('trailList');
 if(trailList)new MutationObserver(()=>requestAnimationFrame(decorate)).observe(trailList,{childList:true});
 let nav=document.querySelector('.modernNav');
 if(!nav){nav=document.createElement('nav');nav.className='modernNav';nav.innerHTML='<button class="active" data-go="top"><span>⌂</span>Home</button><button data-go="search"><span>⌕</span>Search</button><button data-go="map"><span>⌖</span>Map</button><button data-go="saved"><span>☆</span>Saved</button><button data-go="more"><span>•••</span>More</button>';document.body.appendChild(nav)}
 nav.onclick=e=>{
  const b=e.target.closest('button');if(!b)return;
  document.querySelectorAll('.modernNav button').forEach(x=>x.classList.toggle('active',x===b));
  const g=b.dataset.go;
  if(g==='top'){window.scrollTo(0,0);return}
  if(g==='search'){
   const af=document.querySelector('.advancedFilters');
   const ft=document.getElementById('filterToggle');
   if(af&&!af.classList.contains('open'))ft?.click();
   window.scrollTo(0,0);setTimeout(()=>document.getElementById('trailSearch')?.focus(),80);return
  }
  if(g==='map'){
   const p=document.getElementById('mapPanel');
   if(p){p.classList.remove('hidden');document.getElementById('mapToggle').textContent='Hide Map';p.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>{try{map?.invalidateSize()}catch{}},200)}return
  }
  if(g==='saved'){document.getElementById('myRides')?.scrollIntoView({behavior:'smooth',block:'start'});return}
  if(g==='more'){
   const af=document.querySelector('.advancedFilters');
   const ft=document.getElementById('filterToggle');
   if(af&&!af.classList.contains('open'))ft?.click();
   setTimeout(()=>document.querySelector('.healthBox')?.scrollIntoView({behavior:'smooth',block:'start'}),60)
  }
 };
 setTimeout(decorate,300)
})();