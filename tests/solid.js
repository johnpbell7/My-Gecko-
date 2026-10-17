/* her things are walls he goes round, or steps he goes over - never thin air */
const {chromium}=require('playwright');const fs=require('fs');const DAY=864e5;const OUT=__dirname+'/';
const HOOKS="window.__s={"+
 "put:(t,x,z)=>{const q=decorSpot(x,z,t,0);S.decor.push({t:t,x:q.x,z:q.z,r:0});buildDecor();return [+q.x.toFixed(2),+q.z.toFixed(2)];},"+
 "clear:()=>{S.decor.length=0;buildDecor();},"+
 "at:i=>({x:S.decor[i].x,z:S.decor[i].z,t:S.decor[i].t}),"+
 "warp:(x,z)=>{G.root.position.set(x,walkY(x,z),z);AI.route=null;AI.target=null;AI.act=null;want=null;toyT=0;toyUse=null;toyPick=null;},"+
 "send:(x,z)=>{callPt=new THREE.Vector3(x,0,z);callT=0;AI.target=null;AI.route=null;want=null;},"+
 "gp:()=>[+G.root.position.x.toFixed(2),+G.root.position.y.toFixed(2),+G.root.position.z.toFixed(2)],"+
 "lift:(x,z)=>+decorLift(x,z,false).toFixed(2),"+
 "obsAt:i=>{const d=S.decor[i];const o=decorObs(false).find(o=>Math.abs(o.x-d.x)<.01&&Math.abs(o.z-d.z)<.01);return o?+o.r.toFixed(2):null;},"+
 "draw:()=>{renderer.render(scene,camera);renderer.render(scene,camera);}};\n";
(async()=>{
 const s=fs.readFileSync((process.env.GECKO||__dirname+'/../index.html'),'utf8').replace("window.__geckoStart=function(){",HOOKS+"window.__geckoStart=function(){");
 const f=OUT+'solid.html';fs.writeFileSync(f,s);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const errs=[];const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
 const pg=await ctx.newPage();pg.on('pageerror',e=>{errs.push(e.message);console.log('PAGE ERROR:',e.message);});
 await pg.addInitScript('try{localStorage.setItem("gecko-pet-v9-ayla",'+JSON.stringify(JSON.stringify({
   name:'Ziggy',morph:'tangerine',hunger:90,fun:60,clean:95,energy:95,hatched:true,born:Date.now()-14*DAY,
   last:Date.now(),sound:false,coins:300,water:95,thirst:95,warm:95,lamp:true,poops:0,wees:0,bg:'desert',
   stickers:{},best:{},tricks:{},decor:[],owned:{},bedtime:23.9,tank:1,seenGrowth:9,tourDone:true,
   seenDay:new Date().toDateString(),tankAskDay:new Date().toDateString(),presentDay:new Date().toDateString()}))+')}catch(e){}');
 await pg.goto('file://'+f+'?p=ayla');await pg.waitForTimeout(1700);
 await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(2600);
 await pg.evaluate(()=>{const c=document.getElementById('cOk');if(c&&!document.getElementById('card').hidden)c.click();});

 const run=async(t,label,climb)=>{
   await pg.evaluate(()=>window.__s.clear());await pg.waitForTimeout(400);
   const at=await pg.evaluate(a=>window.__s.put(a,0,0),t);
   const r=await pg.evaluate(()=>window.__s.obsAt(0));
   /* stand him one side of it and call him to the other */
   await pg.evaluate(a=>window.__s.warp(a[0]-4.2,a[1]),at);await pg.waitForTimeout(700);
   await pg.evaluate(a=>window.__s.send(a[0]+4.2,a[1]),at);
   let through=0,top=0,best=0;
   for(let i=0;i<120;i++){await pg.waitForTimeout(900);
     const p=await pg.evaluate(()=>window.__s.gp());
     const d=Math.hypot(p[0]-at[0],p[2]-at[1]);
     const lift=await pg.evaluate(a=>window.__s.lift(a[0],a[1]),[p[0],p[2]]);
     if(lift>.05&&p[1]>lift-.08)top++;
     if(r&&d<r-.12)through++;
     if(p[0]>at[0]+1.5)best=1;
     if(best)break;}
   console.log('  '+label.padEnd(10)+(climb
     ?(top>0?'he walked up and over it ('+top+' ticks on top)':'*** never got on top of it ***')
     :(through?'*** WALKED THROUGH IT ('+through+' ticks inside) ***':'solid - he went round'))
     +(best?'   and reached the far side':'   (still on his way)'));
   return {through,top};};

 console.log('=== things he should go round ===');
 for(const t of ['castle','cactus','crystal','digbox'])await run(t,t,false);
 console.log('\n=== things he should climb over ===');
 for(const t of ['pebbles','bones','pond'])await run(t,t,true);
 console.log('\nERRORS:',errs.length?errs.join(' | '):'none');
 await b.close();})();
