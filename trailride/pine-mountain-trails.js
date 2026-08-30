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
    }
  ];

  permanent.forEach(t=>{
    if(!curated.some(x=>x.name.toLowerCase()===t.name.toLowerCase())) curated.push(t);
  });

  setTimeout(()=>{
    try{
      if(mode==='state' && document.getElementById('stateSelect')?.value==='Georgia') chooseState();
      else if(mode==='near') refresh();
    }catch(e){}
  },250);
})();
