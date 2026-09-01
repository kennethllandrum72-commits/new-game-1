(()=>{
 const ua=navigator.userAgent||'';
 const apple=/iPhone|iPad|iPod|Macintosh/i.test(ua);
 function name(card){return card.querySelector('.trailName')?.textContent.trim()||'Trail'}
 function coords(card){let a=card.querySelector('.mapsBtn')?.href||'',m=a.match(/destination=([\d.-]+),([\d.-]+)/)||a.match(/[?&](?:daddr|ll)=([\d.-]+),([\d.-]+)/);return m?{lat:m[1],lon:m[2]}:null}
 function mapUrl(c,n,directions=true){if(!c)return location.href;if(apple)return directions?`https://maps.apple.com/?daddr=${c.lat},${c.lon}&dirflg=d`:`https://maps.apple.com/?q=${encodeURIComponent(n)}&ll=${c.lat},${c.lon}`;return directions?`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lon}`:`https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lon}`}
 function enhance(card){
  if(card.dataset.nativeTools)return;
  card.dataset.nativeTools='1';
  let n=name(card),c=coords(card),actions=card.querySelector('.actions');if(!actions)return;
  let directions=card.querySelector('.mapsBtn');
  if(directions&&c){directions.href=mapUrl(c,n,true);directions.textContent=apple?' Apple Maps':'Google Maps'}
  let share=document.createElement('button');share.className='btn';share.textContent='↗ Share Trail';share.onclick=async()=>{let text=`${n} — TrailRide`,url=mapUrl(c,n,false);if(navigator.share){try{await navigator.share({title:n,text,url})}catch{}}else{try{await navigator.clipboard.writeText(`${text} ${url}`);share.textContent='✓ Copied';setTimeout(()=>share.textContent='↗ Share Trail',1500)}catch{}}};actions.appendChild(share);
  let remind=document.createElement('button');remind.className='btn';remind.textContent='⏰ Ride Reminder';remind.onclick=()=>{let d=document.getElementById('daySelect')?.value;if(!d)return;let start=d.replaceAll('-','')+'T080000',end=d.replaceAll('-','')+'T100000',title=encodeURIComponent(`Ride ${n}`),details=encodeURIComponent(`TrailRide plan for ${n}. Check weather, trail status and Ride Score before leaving.`);window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`,'_blank')};actions.appendChild(remind)
 }
 function fixDetail(){let a=document.getElementById('detailDirections');if(!a)return;let m=(a.href||'').match(/destination=([\d.-]+),([\d.-]+)/)|| (a.href||'').match(/[?&]daddr=([\d.-]+),([\d.-]+)/);if(m){let c={lat:m[1],lon:m[2]},n=document.getElementById('detailName')?.textContent||'Trail';a.href=mapUrl(c,n,true);a.textContent=apple?' Apple Maps':'Google Maps'}}
 function scan(){document.querySelectorAll('#trailList .trail').forEach(enhance);fixDetail()}
 let list=document.getElementById('trailList');if(list)new MutationObserver(scan).observe(list,{childList:true,subtree:true});let detail=document.getElementById('detailOverlay');if(detail)new MutationObserver(fixDetail).observe(detail,{attributes:true,subtree:true,childList:true});scan();
 window.TrailRideMaps={provider:apple?'Apple Maps':'Google Maps'};
 // native-near-me.js is injected once by trailride-native/scripts/prepare-web.mjs,
 // after the bundled Capacitor Geolocation bridge. Do not load it a second time here.
})();