/* Out on the table he ignored everything she had put down there, and walked
   straight through it. This watches him out there. */
const {chromium}=require('playwright');const fs=require('fs');const DAY=864e5;const OUT=__dirname+'/';
const HOOKS="window.__od={put:(t,x,z)=>{const q=decorSpot(x,z,t,0);S.decor.push({t:t,x:q.x,z:q.z,r:0});buildDecor();return [+q.x.toFixed(2),+q.z.toFixed(2)];},"+
 "clear:()=>{S.decor.length=0;buildDecor();},"+
 "letOut:()=>letOut(),out:()=>outside,trip:()=>!!trip,"+
 "gp:()=>[+G.root.position.x.toFixed(2),+G.root.position.z.toFixed(2)],"+
 "obs:()=>tableObs().map(o=>[+o.x.toFixed(2),+o.z.toFixed(2),+o.r.toFixed(2)]),"+
 "decorObs:()=>decorObs(true).map(o=>[+o.x.toFixed(2),+o.z.toFixed(2),+o.r.toFixed(2)]),"+
 "playable:()=>playList().length,"+
 "act:()=>AI.act,toyT:()=>+toyT.toFixed(1),using:()=>toyUse?toyUse.userData.toy:null,"+
 "said:()=>{const b=document.getElementById('bubble');return b.classList.contains('show')?b.textContent:null;},"+
 "wantToy:()=>{want='toy';toyT=0;toyUse=null;toyPick=null;AI.act=null;AI.route=null;AI.target=null;},"+
 "why:()=>({want:want,pick:toyPick&&toyPick.userData.t0,use:toyUse&&toyUse.userData.t0,toyT:+toyT.toFixed(1),act:AI.act,tgt:AI.target?[+AI.target.pos.x.toFixed(2),+AI.target.pos.z.toFixed(2),AI.target.kind]:null,gp:[+G.root.position.x.toFixed(2),+G.root.position.z.toFixed(2)],v:+AI.v.toFixed(2),call:!!callPt,trip:!!trip}),"+
 "draw:()=>{renderer.render(scene,camera);renderer.render(scene,camera);}};\n";
(async()=>{
 const s=fs.readFileSync((process.env.GECKO||__dirname+'/../index.html'),'utf8').replace("window.__geckoStart=function(){",HOOKS+"window.__geckoStart=function(){");
 const f=OUT+'outdoor.html';fs.writeFileSync(f,s);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
   args:['--no-sandbox','--ignore-certificate-errors','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const errs=[];const ctx=await b.newContext({viewport:{width:430,height:860},ignoreHTTPSErrors:true});
 const pg=await ctx.newPage();pg.on('pageerror',e=>{errs.push(e.message);console.log('PAGE ERROR:',e.message);});
 await pg.addInitScript('try{localStorage.setItem("gecko-pet-v9-ayla",'+JSON.stringify(JSON.stringify({
   name:'Ziggy',morph:'tangerine',hunger:95,fun:50,clean:95,energy:95,hatched:true,born:Date.now()-14*DAY,
   last:Date.now(),sound:false,coins:300,water:95,thirst:95,warm:95,lamp:true,poops:0,wees:0,bg:'desert',
   stickers:{},best:{},tricks:{},decor:[],owned:{},bedtime:23.9,tank:1,seenGrowth:9,
   seenDay:new Date().toDateString(),tankAskDay:new Date().toDateString(),presentDay:new Date().toDateString()}))+')}catch(e){}');
 await pg.goto('file://'+f+'?p=ayla');await pg.waitForTimeout(1700);
 await pg.evaluate(()=>window.__geckoSkipIntro&&window.__geckoSkipIntro());await pg.waitForTimeout(2500);
 await pg.evaluate(()=>{const c=document.getElementById('cOk');if(c&&!document.getElementById('card').hidden)c.click();});

 console.log('=== things put out on the table ===');
 for(const [t,x,z] of [['castle',12.5,3.0],['cactus',11.0,6.2],['crystal',14.0,4.5],['digbox',13.5,-2.0]])
   console.log('  '+t.padEnd(8)+' -> '+JSON.stringify(await pg.evaluate(a=>window.__od.put(a[0],a[1],a[2]),[t,x,z])));
 await pg.waitForTimeout(800);
 console.log('  they are solid out there:',JSON.stringify(await pg.evaluate(()=>window.__od.decorObs())));

 console.log('\n=== he goes out ===');
 await pg.evaluate(()=>window.__od.letOut());
 for(let i=0;i<70;i++){await pg.waitForTimeout(1500);
   if(await pg.evaluate(()=>window.__od.out())&&!(await pg.evaluate(()=>window.__od.trip())))break;}
 console.log('  outside:',await pg.evaluate(()=>window.__od.out()),
             '  things he could play with out here:',await pg.evaluate(()=>window.__od.playable()));

 console.log('\n=== does he go to them, and does he walk through them? ===');
 await pg.evaluate(()=>window.__od.wantToy());
 let played=null,worst=null,wd=0,path=0;
 for(let i=0;i<230;i++){
   await pg.waitForTimeout(1200);
   const p=await pg.evaluate(()=>window.__od.gp());path++;
   /* fresh each tick, so the one he is busy with drops out the way the game
      drops it - standing in the middle of the thing he is playing with is the
      point, not a bug */
   const obs=await pg.evaluate(()=>window.__od.decorObs());
   for(const [x,z,r] of obs){const d=Math.hypot(p[0]-x,p[1]-z);
     if(d<r-.05&&(r-d)>wd){wd=r-d;worst=[p,[x,z,r],+d.toFixed(2)];}}
   if(!played){const u=await pg.evaluate(()=>window.__od.using());
     const a=await pg.evaluate(()=>window.__od.act());
     const tt=await pg.evaluate(()=>window.__od.toyT());
     if(u||tt>0)played={using:u,act:a,said:await pg.evaluate(()=>window.__od.said())};}
   if(played&&i>60)break;
   if(i%40===0)console.log('    t'+i+' '+JSON.stringify(await pg.evaluate(()=>window.__od.why())));}
 console.log('  played with something out there:',played?JSON.stringify(played):'*** NEVER DID ***');
 console.log('  deepest he got inside one:',worst?JSON.stringify(worst)+'  *** WALKED THROUGH IT ***':'never inside one  (good)');
 await pg.evaluate(()=>window.__od.draw());await pg.screenshot({path:OUT+'outdoor.png'});
 console.log('\nERRORS:',errs.length?errs.join(' | '):'none');
 await b.close();})();
