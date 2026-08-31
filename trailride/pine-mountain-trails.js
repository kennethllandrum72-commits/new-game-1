(()=>{
  const permanent=[
    {name:"Man O' War Trail",city:'Pine Mountain • Hamilton',state:'Georgia',mi:13.5,d:['beginner'],type:'Paved multi-use / bike trail',lat:32.8645,lon:-84.8540,status:'https://www.harriscountyga.gov/man-o-war-trail-phase-vi-is-now-open/'},
    {name:'Chattahoochee RiverWalk',city:'Columbus',state:'Georgia',mi:22,d:['beginner'],type:'Paved multi-use / cycling trail',lat:32.4615,lon:-84.9957,status:'https://parks.columbusga.gov/Recreation/Riverwalk'},
    {name:'Columbus Fall Line Trace',city:'Columbus',state:'Georgia',mi:11,d:['beginner'],type:'Paved rail-trail / cycling trail',lat:32.5105,lon:-84.9305,status:'https://www.google.com/search?q=Columbus+Fall+Line+Trace+current+trail+status'}
  ];
  permanent.forEach(t=>{if(!curated.some(x=>x.name.toLowerCase()===t.name.toLowerCase()))curated.push(t)});

  // Keep individual trail cards on the same heat/health scale as the main planner.
  const hi=(t,rh)=>{if(t<80||rh<40)return Math.round(t);return Math.round(-42.379+2.04901523*t+10.14333127*rh-.22475541*t*rh-.00683783*t*t-.05481717*rh*rh+.00122874*t*t*rh+.00085282*t*rh*rh-.00000199*t*t*rh*rh)};
  const heatCap=f=>f>=110?2:f>=105?3:f>=100?5:f>=95?6:f>=90?7.5:10;
  scoreHour=(temp,rain,hum,aq,t={})=>{
    let s=10,h=health(),f=hi(temp,hum),a=aq||{};
    if(f>=110)s-=8;else if(f>=105)s-=7;else if(f>=100)s-=6;else if(f>=95)s-=4.5;else if(f>=90)s-=3;else if(f>=85)s-=1.5;
    if(hum>=85)s-=1.5;else if(hum>=75)s-=.8;else if(hum>=65)s-=.3;
    if(rain>=70)s-=3;else if(rain>=40)s-=1.5;else if(rain>=20)s-=.5;
    if(a.aqi>150)s-=3;else if(a.aqi>100)s-=2;else if(a.aqi>50)s-=.75;
    if(a.pm>35)s-=1.2;else if(a.pm>12)s-=.4;
    if(h.respiratory){if(a.aqi>100)s-=2;else if(a.aqi>50)s-=1;if(a.ozone>120)s-=1.5;if(f>=95)s-=1.5;else if(f>=90)s-=.75;if(hum>=80)s-=.75}
    if(h.heat){if(f>=100)s-=3;else if(f>=95)s-=2;else if(f>=90)s-=1}
    if(h.cardio){if(f>=100)s-=2;else if(f>=95)s-=1.25;else if(f>=90)s-=.5}
    if(h.allergy&&(a.aqi>50||a.pm>12))s-=.6;
    if(h.sugar&&f>=90)s-=.4;
    if(h.joint&&t.d?.includes('advanced'))s-=.5;
    return Math.max(1,Math.min(10,+s.toFixed(1)));
  };
  const oldTrailScore=trailScore;
  trailScore=(t,ws=forecast,as=airQuality)=>{
    let s=oldTrailScore(t,ws,as),rows=hourlyRows(ws,as,t),peak=rows.length?Math.max(...rows.map(x=>hi(x.temp,x.hum))):dayWeather(ws)?.hi||0;
    s=Math.min(s,heatCap(peak));
    // Respiratory sensitivity gets an additional daily heat ceiling even when AQI is good.
    if(health().respiratory){if(peak>=100)s=Math.min(s,4.5);else if(peak>=95)s=Math.min(s,5.5);else if(peak>=90)s=Math.min(s,7)}
    return Math.max(1,+s.toFixed(1));
  };

  setTimeout(()=>{try{if(mode==='state'&&document.getElementById('stateSelect')?.value==='Georgia')chooseState();else if(mode==='near')refresh()}catch(e){}},250);
})();