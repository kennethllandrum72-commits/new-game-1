(()=>{
 const access={
  "Man O' War Trail":{classes:[1,2,3],label:'E-bikes: verify current posted rules'},
  'Silver Comet Trail':{classes:[],label:'E-bike rules vary by jurisdiction — verify before riding'},
  'Standing Boy Trails':{classes:[],label:'Verify current land-manager e-bike rules'},
  'Flat Rock Park':{classes:[],label:'Verify current posted e-bike rules'},
  'Chewacla State Park':{classes:[],label:'Verify current park e-bike rules'},
  'Lakeside Trails':{classes:[],label:'Verify current land-manager e-bike rules'}
 };
 const controls=document.querySelector('.controls');
 if(controls&&!document.getElementById('ebikeClass')){const box=document.createElement('div');box.className='ebikePanel';box.innerHTML=`<div class="ebikeHead"><strong>⚡🚲 E-BIKE MODE</strong><select id="ebikeClass"><option value="all">Any e-bike class</option><option value="1">Class 1</option><option value="2">Class 2</option><option value="3">Class 3</option><option value="none">No e-bikes</option></select></div><p class="ebikeHelp">Class 1: pedal assist to 20 mph • Class 2: throttle to 20 mph • Class 3: pedal assist to 28 mph. Trail rules can change; always follow posted land-manager rules.</p>`;controls.appendChild(box)}
 function decorate(){let selected=document.getElementById('ebikeClass')?.value||'all';document.querySelectorAll('#trailList .trail').forEach(card=>{let name=card.querySelector('.trailName')?.textContent.trim(),a=access[name],meta=card.querySelector('.meta');let old=card.querySelector('.ebikeAccess');if(old)old.remove();let row=document.createElement('div');row.className='ebikeAccess';if(a&&a.classes.length){row.innerHTML=`<span class="ebikeChip">⚡ E-bike info</span>${a.classes.map(c=>`<span class="ebikeChip">Class ${c}</span>`).join('')}<span class="ebikeChip ebikeUnknown">${a.label}</span>`}else row.innerHTML=`<span class="ebikeChip ebikeUnknown">⚡ ${a?.label||'E-bike class not verified — check local rules'}</span>`;meta?.after(row);let allowed=!a||!a.classes.length||selected==='all'||selected==='none'||a.classes.includes(+selected);card.style.display=allowed?'':'none'})}
 document.getElementById('ebikeClass')?.addEventListener('change',decorate);
 new MutationObserver(decorate).observe(document.getElementById('trailList'),{childList:true,subtree:true});
 let nav=document.querySelector('.modernNav');if(!nav){nav=document.createElement('nav');nav.className='modernNav';nav.innerHTML='<button class="active" data-go="top"><span>⌂</span>Home</button><button data-go="search"><span>⌕</span>Search</button><button data-go="map"><span>⌖</span>Map</button><button data-go="saved"><span>☆</span>Saved</button><button data-go="more"><span>•••</span>More</button>';document.body.appendChild(nav)}
 const cleanTop=()=>{document.documentElement.scrollTop=0;document.body.scrollTop=0;window.scrollTo(0,0);requestAnimationFrame(()=>window.scrollTo(0,0))};
 nav.onclick=e=>{let b=e.target.closest('button');if(!b)return;let g=b.dataset.go;if(g==='top'){cleanTop();return}if(g==='search'){cleanTop();setTimeout(()=>document.getElementById('filterToggle')?.click(),50);setTimeout(()=>document.getElementById('trailSearch')?.focus(),160);return}if(g==='map'){let p=document.getElementById('mapPanel');if(p){p.classList.remove('hidden');document.getElementById('mapToggle').textContent='Hide Map';p.scrollIntoView({behavior:'smooth',block:'start'})}return}if(g==='saved'){document.getElementById('myRides')?.scrollIntoView({behavior:'smooth',block:'start'});return}if(g==='more'){document.getElementById('filterToggle')?.click();setTimeout(()=>document.querySelector('.healthBox')?.scrollIntoView({behavior:'smooth',block:'start'}),100)}};
 window.addEventListener('pageshow',()=>{if(window.scrollY<60)cleanTop()});setTimeout(decorate,500);
})();
