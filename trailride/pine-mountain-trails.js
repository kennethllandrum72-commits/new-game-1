(()=>{
  const permanent=[
    {
      name:"Man O' War Trail",
      city:'Pine Mountain • Hamilton',
      state:'Georgia',
      mi:13.5,
      d:['beginner'],
      type:'Paved multi-use / bike trail',
      lat:32.8645,
      lon:-84.8540,
      status:'https://www.harriscountyga.gov/man-o-war-trail-phase-vi-is-now-open/'
    },
    {
      name:'Pine Mountain Trail',
      city:'F.D. Roosevelt State Park • Pine Mountain',
      state:'Georgia',
      mi:23,
      d:['advanced'],
      type:'HIKING ONLY • NO BIKES',
      lat:32.8377,
      lon:-84.8159,
      noBikes:true,
      status:'https://www.pinemountaintrail.org/frequently-asked-questions.html'
    }
  ];

  permanent.forEach(t=>{
    if(!curated.some(x=>x.name.toLowerCase()===t.name.toLowerCase())) curated.push(t);
  });

  const originalDrawCards=drawCards;
  drawCards=function(){
    originalDrawCards();
    document.querySelectorAll('#trailList .trail').forEach(card=>{
      const name=card.querySelector('.trailName')?.textContent.trim();
      if(name!=='Pine Mountain Trail') return;
      card.classList.add('no-bikes-trail');
      const warning=card.querySelector('.conditionWarning');
      if(warning){
        warning.className='conditionWarning warningBox wet noBikesWarning';
        warning.textContent='🚫 HIKING ONLY — Bicycles are not allowed on the Pine Mountain Trail or its connector trails.';
      }
      const badges=card.querySelector('.badges');
      if(badges && !badges.querySelector('.noBikesBadge')){
        const b=document.createElement('span');
        b.className='badge noBikesBadge';
        b.textContent='🚫 NO BIKES';
        badges.prepend(b);
      }
    });
  };

  setTimeout(()=>{
    try{
      if(mode==='state' && document.getElementById('stateSelect')?.value==='Georgia') chooseState();
      else if(mode==='near') refresh();
    }catch(e){}
  },250);
})();
