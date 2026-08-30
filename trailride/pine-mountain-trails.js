(()=>{
  const permanent=[
    {name:"Man O' War Trail",city:'Pine Mountain • Hamilton',state:'Georgia',mi:13.5,d:['beginner'],type:'Paved multi-use / bike trail',lat:32.8645,lon:-84.8540,status:'https://www.harriscountyga.gov/man-o-war-trail-phase-vi-is-now-open/'},
    {name:'Chattahoochee RiverWalk',city:'Columbus',state:'Georgia',mi:22,d:['beginner'],type:'Paved multi-use / cycling trail',lat:32.4615,lon:-84.9957,status:'https://parks.columbusga.gov/Recreation/Riverwalk'},
    {name:'Columbus Fall Line Trace',city:'Columbus',state:'Georgia',mi:11,d:['beginner'],type:'Paved rail-trail / cycling trail',lat:32.5105,lon:-84.9305,status:'https://www.google.com/search?q=Columbus+Fall+Line+Trace+current+trail+status'}
  ];
  permanent.forEach(t=>{if(!curated.some(x=>x.name.toLowerCase()===t.name.toLowerCase()))curated.push(t)});
  setTimeout(()=>{try{if(mode==='state'&&document.getElementById('stateSelect')?.value==='Georgia')chooseState();else if(mode==='near')refresh()}catch(e){}},250);
})();