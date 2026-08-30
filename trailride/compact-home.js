(()=>{
 const controls=document.querySelector('.controls');
 if(!controls||document.querySelector('.filterToolbar'))return;
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
})();
