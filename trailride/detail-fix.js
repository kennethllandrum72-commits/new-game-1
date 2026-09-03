(()=>{
  const overlay=()=>document.getElementById('detailOverlay');
  const sheet=()=>overlay()?.querySelector('.detailSheet');
  let savedY=0;

  function stabilizeOpen(){
    const o=overlay(),s=sheet();
    if(!o||!s||o.classList.contains('hidden'))return;
    s.scrollTop=0;
    o.scrollTop=0;
    document.documentElement.classList.add('trail-detail-open');
    document.body.classList.add('trail-detail-open');
  }
  function stabilizeClose(){
    document.documentElement.classList.remove('trail-detail-open');
    document.body.classList.remove('trail-detail-open');
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('.detailsBtn')){
      savedY=window.scrollY;
      requestAnimationFrame(()=>requestAnimationFrame(stabilizeOpen));
      setTimeout(stabilizeOpen,80);
    }
    if(e.target.closest('#detailClose')||e.target===overlay()){
      setTimeout(()=>{
        stabilizeClose();
        window.scrollTo(0,savedY);
      },0);
    }
  },true);

  const o=overlay();
  if(o)new MutationObserver(()=>{
    if(o.classList.contains('hidden'))stabilizeClose();
    else stabilizeOpen();
  }).observe(o,{attributes:true,attributeFilter:['class']});
})();
